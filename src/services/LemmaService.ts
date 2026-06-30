import { lemmaClient } from '@/lib/lemmaClient';
import { normalizeInboxSource, isValidInboxSource } from '@/lib/normalizeInboxSource';
import { InboxSource } from '@/types/schema';
import type { InboxMessage, Mission, Task, Memory } from '@/types/schema';

export interface WorkflowStep {
  id: string;
  label: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
}

export interface WorkflowProgress {
  workflowId: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  steps: WorkflowStep[];
  error?: string;
}

class LemmaService {
  /**
   * Helper to execute SQL queries on the Lemma Pod datastore
   */
  private async queryDatastore<T>(sql: string): Promise<T[]> {
    try {
      const response = await lemmaClient.datastore.query(sql);
      return (response.items || []) as T[];
    } catch (error) {
      console.error(`[LemmaService] Datastore query failed ("${sql}"):`, error);
      return [];
    }
  }

  /**
   * Graceful helper to check connectivity and return offline state fallback
   */
  private isOffline(): boolean {
    return typeof navigator !== 'undefined' && !navigator.onLine;
  }

  // 1. Process Inbox Message (Triage Signal Workflow)
  async processMessage(
    message: Omit<InboxMessage, 'id' | 'userId' | 'receivedAt' | 'status'>,
    onProgress?: (progress: WorkflowProgress) => void
  ): Promise<{ missions: Mission[]; tasks: Task[] }> {
    console.log('[LemmaService] Processing inbox message with live Lemma Pod...', message);

    if (this.isOffline()) {
      throw new Error('You are currently offline. Cannot connect to Lemma Pod.');
    }

    try {
      // Step A: Normalize + validate source before writing to Lemma
      const normalizedSource = normalizeInboxSource(message.source);
      if (!isValidInboxSource(normalizedSource)) {
        throw new Error(`[LemmaService] Invalid source after normalization: "${normalizedSource}"`);
      }
      console.log(`[LemmaService] Source normalized: "${message.source}" → InboxSource.${Object.keys(InboxSource).find(k => InboxSource[k as keyof typeof InboxSource] === normalizedSource)}`);

      // Step B: Insert raw record into inbox_log
      const logRecord = await lemmaClient.records.create('inbox_log', {
        source: normalizedSource,
        title: message.title,
        raw_body: message.content,
        status: 'received',
        received_at: new Date().toISOString(),
      });

      console.log('[LemmaService] Created inbox_log record:', logRecord);

      // Step B: Trigger triage_signal workflow
      const run = await lemmaClient.workflows.runs.create('triage_signal');
      console.log('[LemmaService] Started triage_signal workflow run:', run.id);

      // Step C: Submit form intake parameters
      await lemmaClient.workflows.runs.submitForm(run.id, {
        node_id: 'intake',
        inputs: { inbox_log_id: logRecord.id },
      });

      // Step D: Poll and monitor the workflow progress
      let status: string = 'RUNNING';
      let errorMsg = '';

      const steps: WorkflowStep[] = [
        { id: 'intake', label: 'Reading Message', status: 'pending' },
        { id: 'classify', label: 'Detecting Deadline & Context', status: 'pending' },
        { id: 'should_plan', label: 'Deciding Plan Option', status: 'pending' },
        { id: 'draft_plan', label: 'Planning Tasks & Schedule', status: 'pending' },
        { id: 'persist_plan', label: 'Creating Mission Draft', status: 'pending' },
      ];

      // Initial progress push
      if (onProgress) {
        onProgress({ workflowId: run.id, status: 'PENDING', steps });
      }

      while (status === 'RUNNING' || status === 'PENDING') {
        // Wait 1.5s between polls
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const runState = await lemmaClient.workflows.runs.get(run.id);
        status = runState.status || 'RUNNING';
        errorMsg = runState.error || '';

        const stepHistory = runState.step_history || [];
        const current = runState.current_node_id;

        // Map live progress to UI steps
        const updatedSteps = steps.map((s) => {
          let stepStatus: 'pending' | 'running' | 'completed' | 'failed' = 'pending';
          const matchingSteps = stepHistory.filter((h) => h.node_id === s.id);

          const isCompleted = matchingSteps.some((h) => h.status === 'COMPLETED');
          const isFailed = matchingSteps.some((h) => h.status === 'FAILED') || (status === 'FAILED' && current === s.id);

          if (isCompleted) {
            stepStatus = 'completed';
          } else if (isFailed) {
            stepStatus = 'failed';
          } else if (current === s.id || (stepHistory.length > 0 && stepHistory[stepHistory.length - 1].node_id === s.id && status === 'RUNNING')) {
            stepStatus = 'running';
          }

          return { ...s, status: stepStatus };
        });

        if (onProgress) {
          onProgress({
            workflowId: run.id,
            status: status as any,
            steps: updatedSteps,
            error: errorMsg || undefined,
          });
        }
      }

      if (status === 'FAILED') {
        throw new Error(`Workflow execution failed: ${errorMsg}`);
      }

      // Step E: Fetch the generated plans & memories from the datastore
      const plans = await this.queryDatastore<any>(
        `SELECT * FROM plans WHERE source_memory_id IN (SELECT id FROM memories WHERE source_inbox_log_id = '${logRecord.id}') LIMIT 1`
      );

      if (plans.length === 0) {
        console.warn('[LemmaService] Workflow completed, but no plan was generated.');
        return { missions: [], tasks: [] };
      }

      const plan = plans[0];
      const attributes = plan.attributes || {};
      const proposedSteps = attributes._proposed_steps || [];

      const generatedMission: Mission = {
        id: plan.id,
        userId: plan.user_id || 'mock-user-id',
        title: plan.title,
        description: plan.summary || plan.detail || '',
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        targetDate: plan.deadline ? plan.deadline.split('T')[0] : undefined,
        createdAt: plan.created_at || new Date().toISOString(),
        updatedAt: plan.updated_at || new Date().toISOString(),
      };

      const generatedTasks: Task[] = proposedSteps.map((step: any, index: number) => ({
        id: step.id || `t-step-${index}-${Date.now()}`,
        userId: plan.user_id || 'mock-user-id',
        missionId: plan.id,
        title: step.title,
        description: step.description,
        status: 'todo',
        priority: step.priority || 'medium',
        estimatedDuration: step.estimated_duration || 60,
        scheduledStart: step.scheduled_start,
        scheduledEnd: step.scheduled_end,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      return {
        missions: [generatedMission],
        tasks: generatedTasks,
      };
    } catch (error: any) {
      console.error('[LemmaService] processMessage failed:', error);
      throw error;
    }
  }

  // 2. Plan Mission (Reverse Planning via agent conversation)
  async planMission(goal: string): Promise<{ mission: Mission; tasks: Task[] }> {
    console.log('[LemmaService] Starting planning conversation with mission_planner agent for goal:', goal);

    if (this.isOffline()) {
      throw new Error('You are currently offline. Cannot connect to Lemma Pod.');
    }

    try {
      // Start a new conversation with the mission_planner agent
      const conv = await lemmaClient.conversations.createForAgent('mission_planner');
      console.log('[LemmaService] Created agent conversation:', conv.id);

      // Send the goal to the agent
      await lemmaClient.conversations.messages.send(conv.id, {
        content: goal,
      });

      // Poll until conversation is no longer active
      let running = true;
      let checkCount = 0;
      while (running && checkCount < 30) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        const cState = await lemmaClient.conversations.get(conv.id);
        running = cState.status === 'RUNNING' || cState.status === 'WAITING';
        checkCount++;
      }

      // Fetch the latest assistant message
      const messagesPage = await lemmaClient.conversations.messages.list(conv.id, { limit: 10 });
      const assistantMsg = messagesPage.items.find((m) => m.role === 'assistant');
      const textResponse = assistantMsg?.text || '';

      console.log('[LemmaService] Agent responded:', textResponse);

      // Query the plans table to see if a draft plan was automatically saved by the agent
      const plans = await this.queryDatastore<any>(
        `SELECT * FROM plans WHERE draft_agent_id = 'mission_planner' ORDER BY created_at DESC LIMIT 1`
      );

      let planTitle = goal;
      let planSummary = `AI Plan for objective: ${goal}`;
      let planId = `plan-${Date.now()}`;
      let proposedSteps: any[] = [];

      if (plans.length > 0) {
        const plan = plans[0];
        planId = plan.id;
        planTitle = plan.title;
        planSummary = plan.summary || plan.detail || planSummary;
        proposedSteps = plan.attributes?._proposed_steps || [];
      } else {
        // Fallback parsing of the markdown text output if no database row was created
        const stepMatches = textResponse.match(/-\s*\[.*?\]\s*(.*)/g) || [];
        proposedSteps = stepMatches.map((match, i) => ({
          title: match.replace(/-\s*\[.*?\]\s*/, '').trim(),
          description: `Generated planning step ${i + 1}`,
          estimated_duration: 60,
        }));
      }

      const mission: Mission = {
        id: planId,
        userId: 'mock-user-id',
        title: planTitle,
        description: planSummary,
        status: 'active',
        startDate: new Date().toISOString().split('T')[0],
        targetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const tasks: Task[] = proposedSteps.map((step: any, index: number) => ({
        id: step.id || `t-gstep-${index}-${Date.now()}`,
        userId: 'mock-user-id',
        missionId: planId,
        title: step.title,
        description: step.description || '',
        status: 'todo',
        priority: step.priority || 'medium',
        estimatedDuration: step.estimated_duration || 60,
        scheduledStart: step.scheduled_start || new Date(Date.now() + index * 24 * 60 * 60 * 1000).toISOString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      }));

      return { mission, tasks };
    } catch (error) {
      console.error('[LemmaService] planMission failed:', error);
      throw error;
    }
  }

  // 3. Ask Agent (AI Chat/Decision Engine)
  async askAgent(query: string): Promise<string> {
    console.log('[LemmaService] Direct chat query to KAIRO agent:', query);

    if (this.isOffline()) {
      return 'KAIRO Offline Fallback: You are currently offline. Check your internet connection.';
    }

    try {
      const conv = await lemmaClient.conversations.createForAgent('mission_planner');
      await lemmaClient.conversations.messages.send(conv.id, { content: query });

      let running = true;
      let checkCount = 0;
      while (running && checkCount < 15) {
        await new Promise((resolve) => setTimeout(resolve, 1500));
        const cState = await lemmaClient.conversations.get(conv.id);
        running = cState.status === 'RUNNING' || cState.status === 'WAITING';
        checkCount++;
      }

      const messagesPage = await lemmaClient.conversations.messages.list(conv.id, { limit: 5 });
      const assistantMsg = messagesPage.items.find((m) => m.role === 'assistant');
      return assistantMsg?.text || 'KAIRO did not provide a text response.';
    } catch (error) {
      console.error('[LemmaService] askAgent failed:', error);
      return `Failed to fetch response: ${(error as Error).message}`;
    }
  }

  // 4. Get Memories
  async getMemories(): Promise<Memory[]> {
    const rows = await this.queryDatastore<any>('SELECT * FROM memories ORDER BY created_at DESC');
    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      content: row.summary + (row.detail ? ` - ${row.detail}` : ''),
      tags: Array.isArray(row.tags) ? row.tags : JSON.parse(row.tags || '[]'),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  // 5. Save Memory
  async saveMemory(content: string, tags: string[]): Promise<Memory> {
    if (this.isOffline()) {
      throw new Error('Cannot save memory while offline.');
    }
    const record = await lemmaClient.records.create('memories', {
      summary: content,
      tags: tags,
      kind: 'note',
      importance: 'normal',
    });
    return {
      id: record.id,
      userId: record.user_id,
      content: record.summary,
      tags: record.tags || [],
      createdAt: record.created_at,
      updatedAt: record.updated_at,
    };
  }

  // 5b. Delete Memory
  async deleteMemory(id: string): Promise<void> {
    if (this.isOffline()) {
      throw new Error('Cannot delete memory while offline.');
    }
    await lemmaClient.records.delete('memories', id);
  }

  // 6. Get Missions
  async getMissions(): Promise<Mission[]> {
    const rows = await this.queryDatastore<any>('SELECT * FROM missions ORDER BY created_at DESC');
    if (rows.length === 0) {
      // Seed default active missions to make the app alive on first login
      return [
        {
          id: 'seed-mission-1',
          userId: 'seed-user',
          title: 'DSA Placement Accelerator (Striver A-Z)',
          description: 'Daily target: 5 problems, currently on Arrays & Strings.',
          status: 'active',
          startDate: '2026-06-30',
          targetDate: '2026-07-30',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'seed-mission-2',
          userId: 'seed-user',
          title: 'CollegeConnect MERN App Deployment',
          description: 'Finish MongoDB schemas, setup API routes and deploy to Vercel/Render.',
          status: 'active',
          startDate: '2026-06-25',
          targetDate: '2026-07-15',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      title: row.title,
      description: row.objective || '',
      status: (row.status === 'draft' ? 'active' : row.status) as any,
      startDate: row.created_at ? row.created_at.split('T')[0] : new Date().toISOString().split('T')[0],
      targetDate: row.deadline ? row.deadline.split('T')[0] : undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  }

  // 7. Get Tasks (Mapped from mission_steps datastore)
  async getTasks(): Promise<Task[]> {
    const rows = await this.queryDatastore<any>('SELECT * FROM mission_steps ORDER BY step_index ASC');
    if (rows.length === 0) {
      // Seed default tasks for our default active missions
      return [
        {
          id: 'seed-task-1-1',
          userId: 'seed-user',
          missionId: 'seed-mission-1',
          title: 'Review Striver Arrays: Two Pointers & Sliding Window',
          description: 'Drill medium difficulty sliding window challenges.',
          status: 'in_progress',
          priority: 'high',
          estimatedDuration: 90,
          scheduledStart: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'seed-task-1-2',
          userId: 'seed-user',
          missionId: 'seed-mission-1',
          title: 'Complete Sorting Algorithms & Recursion Basics',
          description: 'Review quicksort and mergesort step structures.',
          status: 'todo',
          priority: 'medium',
          estimatedDuration: 60,
          scheduledStart: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'seed-task-1-3',
          userId: 'seed-user',
          missionId: 'seed-mission-1',
          title: 'Solve 15 Sliding Window problems on Leetcode',
          description: 'Targeting specific medium arrays items.',
          status: 'todo',
          priority: 'high',
          estimatedDuration: 120,
          scheduledStart: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'seed-task-2-1',
          userId: 'seed-user',
          missionId: 'seed-mission-2',
          title: 'Verify MERN authentication routes with JWT',
          description: 'Check cookie handling and backend route validation.',
          status: 'completed',
          priority: 'high',
          estimatedDuration: 45,
          scheduledStart: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'seed-task-2-2',
          userId: 'seed-user',
          missionId: 'seed-mission-2',
          title: 'Write API integration tests for CollegeConnect',
          description: 'Ensure correct response statuses and payload validation.',
          status: 'in_progress',
          priority: 'medium',
          estimatedDuration: 90,
          scheduledStart: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        },
        {
          id: 'seed-task-2-3',
          userId: 'seed-user',
          missionId: 'seed-mission-2',
          title: 'Deploy Node backend to Render & frontend to Vercel',
          description: 'Link GitHub repos, configure environmental keys and deploy.',
          status: 'todo',
          priority: 'high',
          estimatedDuration: 60,
          scheduledStart: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        }
      ];
    }
    return rows.map((row) => {
      let status: 'todo' | 'in_progress' | 'completed' = 'todo';
      if (row.status === 'done') {
        status = 'completed';
      } else if (row.status === 'in_progress') {
        status = 'in_progress';
      }
      return {
        id: row.id,
        userId: row.user_id,
        missionId: row.mission_id,
        title: row.title,
        description: row.description || '',
        status,
        priority: row.priority || 'medium',
        estimatedDuration: row.estimated_duration || 60,
        scheduledStart: row.due_at || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };
    });
  }

  // 8. Get Inbox Logs
  async getInboxMessages(): Promise<InboxMessage[]> {
    const rows = await this.queryDatastore<any>('SELECT * FROM inbox_log ORDER BY received_at DESC');
    return rows.map((row) => ({
      id: row.id,
      userId: row.user_id,
      // Always normalize the stored source back to a valid enum value
      source: normalizeInboxSource(row.source),
      title: row.title,
      content: row.raw_body || '',
      receivedAt: row.received_at,
      status: (row.status === 'processed' ? 'processed' : 'unprocessed') as any,
      priority: 'medium',
    }));
  }

  // 9. Get Knowledge Nodes
  async getKnowledgeNodes(): Promise<{ id: string; label: string; kind?: string }[]> {
    const rows = await this.queryDatastore<any>('SELECT * FROM knowledge_nodes ORDER BY created_at DESC');
    return rows.map((row) => ({
      id: row.id,
      label: row.label || row.name || row.title || row.id,
      kind: row.kind || row.type || 'concept',
    }));
  }

  // 10. Get Knowledge Edges
  async getKnowledgeEdges(): Promise<{ id: string; source_id: string; target_id: string; relation?: string }[]> {
    const rows = await this.queryDatastore<any>('SELECT * FROM knowledge_edges');
    return rows.map((row) => ({
      id: row.id,
      source_id: row.source_node_id,
      target_id: row.target_node_id,
      relation: row.relation || undefined,
    }));
  }
}

export const lemmaService = new LemmaService();

