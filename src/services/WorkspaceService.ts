import { lemmaService } from './LemmaService';

export interface WorkspaceResource {
  label: string;
  url: string;
  type: 'github' | 'figma' | 'docs' | 'chat' | 'other';
}

export interface WorkspaceMilestone {
  id: string;
  label: string;
  status: 'pending' | 'in_progress' | 'completed';
}

export interface WorkspaceAIStrategy {
  winningStrategy: string;
  innovationOpportunities: string[];
  suggestedTechStack: string[];
  executionConfidence: string; // "High" | "Medium" | "Low"
}

export interface Workspace {
  id: string;
  title: string;
  organization: string;
  description: string;
  problemStatement?: string;
  registrationDeadline?: string;
  submissionDeadline?: string;
  prizePool?: string;
  teamSize?: string;
  rules?: string;
  requiredSDKs?: string[];
  judgingCriteria?: string[];
  
  // Progress/Risk
  progress: number; // 0-100
  riskScore: number; // 0-100
  riskLevel: 'Low' | 'Medium' | 'High';
  estimatedCompletionRate: number; // 0-100
  daysRemaining?: number;
  
  // Checklists
  submissionChecklist: { id: string; label: string; completed: boolean }[];
  demoChecklist: { id: string; label: string; completed: boolean }[];
  
  // Timeline, resources, milestones, strategy
  timeline: WorkspaceMilestone[];
  resources: WorkspaceResource[];
  aiStrategy: WorkspaceAIStrategy;
  recommendedNextAction: string;
  highestPriority: string;
  
  createdAt: string;
}

class WorkspaceService {
  private workspaces: Workspace[] = [
    {
      id: 'ws-gappy-hackathon',
      title: 'Gappy AI Hackathon 2026',
      organization: 'Lemma Work / Gappy Community',
      description: 'Design and build a premium AI Chief of Staff tool that runs on top of the Lemma SDK datastore.',
      problemStatement: 'SDE aspirants struggle to coordinate exams, tasks, hackathons, and internship preparation. The objective is to build KAIRO—an AI Executive Operating System that automates planning, synchronizes timelines, and guides students natively.',
      registrationDeadline: '2026-06-28',
      submissionDeadline: '2026-07-04',
      prizePool: '$10,000 & SDE Referrals',
      teamSize: '1-3 members',
      rules: 'All code must be open source. Submission must include a 2-minute demo video and deployment links.',
      requiredSDKs: ['Lemma SDK', 'Firebase Client', 'Vite React App'],
      judgingCriteria: [
        'Aesthetic & Premium Design (Wow factor)',
        'Technical depth of Lemma Pod Datastore integration',
        'Practical utility for students and campus recruiters'
      ],
      progress: 42,
      riskScore: 35,
      riskLevel: 'Medium',
      estimatedCompletionRate: 82,
      daysRemaining: 4,
      submissionChecklist: [
        { id: 'sub-1', label: 'Verify all database schemas inside the Lemma Pod', completed: true },
        { id: 'sub-2', label: 'Ensure CORS Proxy runs through Vite dev server', completed: true },
        { id: 'sub-3', label: 'Deploy react frontend to Vercel/Netlify', completed: false },
        { id: 'sub-4', label: 'Draft final project presentation text', completed: false }
      ],
      demoChecklist: [
        { id: 'demo-1', label: 'Record a crisp 2-minute walkthrough showing core modules', completed: false },
        { id: 'demo-2', label: 'Showcase drag-and-drop rescheduling in the Calendar view', completed: false },
        { id: 'demo-3', label: 'Demonstrate active context reasoning in AI Chat', completed: false }
      ],
      timeline: [
        { id: 't-reg', label: 'Registration & Sign Up', status: 'completed' },
        { id: 't-res', label: 'API Research & Specs', status: 'completed' },
        { id: 't-plan', label: 'Milestones & Tasks Setup', status: 'completed' },
        { id: 't-wf', label: 'Wireframes & UI Design', status: 'in_progress' },
        { id: 't-dev', label: 'Core Coding Sprint', status: 'in_progress' },
        { id: 't-test', label: 'Validation & Tests', status: 'pending' },
        { id: 't-dep', label: 'Vercel Deployment', status: 'pending' },
        { id: 't-demo', label: 'Demo Recording', status: 'pending' },
        { id: 't-sub', label: 'Final Submission', status: 'pending' }
      ],
      resources: [
        { label: 'GitHub Repository', url: 'https://github.com/yashharfode/Kairo', type: 'github' },
        { label: 'Lemma SDK Documentation', url: 'https://docs.lemma.work', type: 'docs' },
        { label: 'Figma Design Boards', url: 'https://figma.com/file/kairo-design', type: 'figma' },
        { label: 'Official Discord Channel', url: 'https://discord.gg/lemma-hackathon', type: 'chat' }
      ],
      aiStrategy: {
        winningStrategy: 'Focus heavily on visual presentation. Judges evaluate within 30 seconds. Glassmorphism, animations, and high-fidelity seed data make KAIRO immediately feel complete.',
        innovationOpportunities: [
          'Add a collapsible desktop navigation to save horizontal screen area.',
          'Inject automatic mock records if the local database returns zero items so the app is never empty.',
          'Render AI markdown messages beautifully with a custom tokenized parser.'
        ],
        suggestedTechStack: ['Tailwind CSS v3', 'Vite', 'React 19', 'Lucide React', 'Framer Motion'],
        executionConfidence: 'High'
      },
      recommendedNextAction: 'Complete the Workspaces flagship command center view.',
      highestPriority: 'Finish the prototype before UI polishing.',
      createdAt: new Date().toISOString()
    },
    {
      id: 'ws-google-prep',
      title: 'Google SWE Internship 2027 Prep',
      organization: 'Google Recruitment',
      description: 'Track progress for SDE placements. Main focus is mastering DSA Striver sheet problems.',
      problemStatement: 'Clear campus coding rounds and technical interviews at target tier-1 product companies like Google, Microsoft, and Atlassian.',
      registrationDeadline: '2026-08-15',
      submissionDeadline: '2026-09-01',
      prizePool: 'SWE Summer Intern Offer',
      teamSize: 'Individual preparation',
      rules: 'Focus on Arrays, Graphs, Dynamic Programming, and mock interview drills.',
      requiredSDKs: ['Leetcode Premium', 'Striver A-Z Sheet (450 Qs)', 'Pramp Mock Interviews'],
      judgingCriteria: [
        'Fluency in data structures & runtime optimization',
        'Problem-solving clarity and dry-run execution',
        'Strong knowledge of OS and DBMS core concepts'
      ],
      progress: 15,
      riskScore: 65,
      riskLevel: 'High',
      estimatedCompletionRate: 60,
      daysRemaining: 45,
      submissionChecklist: [
        { id: 'g-1', label: 'Solve at least 200 Medium/Hard problems on Leetcode', completed: false },
        { id: 'g-2', label: 'Complete OS and DBMS basics sheets', completed: true },
        { id: 'g-3', label: 'Schedule 5 mock interviews with SDE mentors', completed: false }
      ],
      demoChecklist: [
        { id: 'gd-1', label: 'Practice whiteboarding runtime complex calculations', completed: false },
        { id: 'gd-2', label: 'Explain solution approaches out loud during practice', completed: false }
      ],
      timeline: [
        { id: 'gt-reg', label: 'Arrays & Strings Sprint', status: 'completed' },
        { id: 'gt-res', label: 'Trees & Graphs Mastery', status: 'in_progress' },
        { id: 'gt-plan', label: 'Dynamic Programming Core', status: 'pending' },
        { id: 'gt-dev', label: 'DBMS & OS Revision', status: 'pending' },
        { id: 'gt-test', label: 'Mock Interview Phase', status: 'pending' },
        { id: 'gt-sub', label: 'Application & Referrals Drive', status: 'pending' }
      ],
      resources: [
        { label: 'Striver A-Z Roadmap Sheet', url: 'https://takeuforward.org/strivers-a-z-dsa-course-sheet-instructions/', type: 'docs' },
        { label: 'Leetcode Profile Tracker', url: 'https://leetcode.com', type: 'github' }
      ],
      aiStrategy: {
        winningStrategy: 'Consistently solve 5 problems daily. Re-attempt weak topics discovered during timed analytics checks.',
        innovationOpportunities: [
          'Leverage spaced-repetition on previously failed Leetcode questions.',
          'Focus on two-pointer patterns as they form the foundation of multiple graph and sliding window algorithms.'
        ],
        suggestedTechStack: ['C++', 'Standard Template Library (STL)', 'Python for scripting'],
        executionConfidence: 'Medium'
      },
      recommendedNextAction: 'Start the Trees & Graphs preparation milestone.',
      highestPriority: 'Complete the remaining Arrays items from the Striver sheet.',
      createdAt: new Date().toISOString()
    }
  ];

  async getWorkspaces(): Promise<Workspace[]> {
    return this.workspaces;
  }

  async getWorkspaceById(id: string): Promise<Workspace | null> {
    const ws = this.workspaces.find(w => w.id === id);
    return ws || null;
  }

  // Simulate AI Extraction from raw pasted input
  async createWorkspaceFromInput(title: string, rawInput: string): Promise<Workspace> {
    console.log(`[WorkspaceService] Simulating AI Extraction from: ${rawInput.substring(0, 100)}...`);
    
    // Simulate AI extraction and auto-execution steps
    const newId = `ws-${Date.now()}`;
    const newWs: Workspace = {
      id: newId,
      title: title || 'AI Scanned Workspace',
      organization: 'Extracted Organization',
      description: 'Automatically extracted from pasted announcement details.',
      problemStatement: rawInput.substring(0, 300) + '...',
      registrationDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      submissionDeadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      prizePool: 'AI Extracted Perks',
      teamSize: '1-4 members',
      rules: 'Read documentation and submission guidelines.',
      requiredSDKs: ['Standard Web Tech Stack'],
      judgingCriteria: ['Functionality', 'Design aesthetics', 'Impact'],
      progress: 0,
      riskScore: 20,
      riskLevel: 'Low',
      estimatedCompletionRate: 90,
      daysRemaining: 14,
      submissionChecklist: [
        { id: 'extr-1', label: 'Verify all project components work locally', completed: false },
        { id: 'extr-2', label: 'Create repository and push source code', completed: false }
      ],
      demoChecklist: [
        { id: 'extr-d-1', label: 'Prepare presentation deck', completed: false }
      ],
      timeline: [
        { id: 'extr-t-1', label: 'Extracted Setup', status: 'completed' },
        { id: 'extr-t-2', label: 'Development Phase', status: 'in_progress' },
        { id: 'extr-t-3', label: 'Final Demo & Submission', status: 'pending' }
      ],
      resources: [
        { label: 'Documentation Links', url: 'https://google.com', type: 'docs' }
      ],
      aiStrategy: {
        winningStrategy: 'Focus on building a working prototype first before scaling architecture features.',
        innovationOpportunities: ['Integrate simple AI intelligence to stand out from regular tracker submissions.'],
        suggestedTechStack: ['React', 'Node.js', 'PostgreSQL'],
        executionConfidence: 'High'
      },
      recommendedNextAction: 'Review the automatically generated timeline milestones.',
      highestPriority: 'Define tech stack requirements and initialize the repository.',
      createdAt: new Date().toISOString()
    };

    // Auto-execution integrations: Create seed mission & tasks in Lemma Pod DB
    try {
      await lemmaService.planMission(`Complete workspace: ${newWs.title}`);
    } catch (err) {
      console.warn('[WorkspaceService] Failed to auto-insert mission to Lemma Pod:', err);
    }

    this.workspaces.unshift(newWs);
    return newWs;
  }
}

export const workspaceService = new WorkspaceService();
