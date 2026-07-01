import React, { useEffect, useState } from 'react';
import { 
  Layers, Plus, Loader2, Sparkles, CheckSquare, 
  ExternalLink, ChevronRight, Globe, Compass, Calendar, 
  Clock, ShieldAlert, Award, Settings, Play, Check, X, ClipboardList
} from 'lucide-react';
import { workspaceService } from '@/services/WorkspaceService';
import type { Workspace } from '@/services/WorkspaceService';
import { cn } from '@/lib/utils';

// --- DAYS-LEFT ARC COUNTDOWN ---
const DaysLeftArc = ({ days, total = 10 }: { days: number; total?: number }) => {
  const size = 22;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (days / total) * 100));
  const offset = circ - (percentage / 100) * circ;

  return (
    <div className="relative flex items-center justify-center shrink-0 w-6 h-6" title={`${days} days remaining`}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(15, 23, 42, 0.05)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#5A5CD8"
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
        />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-[8px] font-mono font-bold text-text-primary">
        {days}
      </span>
    </div>
  );
};

// --- WORKSPACE HERO CARD ---
function WorkspaceHeroCard({ workspace }: { workspace: Workspace }) {
  const risk = workspace.riskLevel ?? 'Medium';
  const riskColor = risk === 'High' ? 'text-red-400 bg-red-500/20' : risk === 'Low' ? 'text-emerald-400 bg-emerald-500/20' : 'text-orange-400 bg-orange-500/20';
  const progress = workspace.progress ?? 0;

  const radius = 38;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (progress / 100) * circ;

  const nextMilestone = workspace.timeline?.find(t => t.status === 'in_progress' || t.status === 'pending');

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl" style={{ background: 'linear-gradient(145deg, #0d0d1f 0%, #141430 60%, #0d1525 100%)' }}>
      <div className="absolute top-0 right-0 w-72 h-72 rounded-full blur-3xl opacity-25 pointer-events-none" style={{ background: 'radial-gradient(circle, #5A5CD8, transparent)' }} />
      <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full blur-3xl opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />

      <div className="relative z-10 p-6 md:p-8">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span className="text-[10px] font-extrabold text-indigo-400 uppercase tracking-widest">Active Workspace</span>
          <span className="ml-auto text-[10px] font-bold text-white/30 bg-white/5 border border-white/10 px-2.5 py-0.5 rounded-full">{workspace.organization}</span>
        </div>

        <div className="flex flex-col md:flex-row gap-6 md:gap-10 items-start md:items-center">
          <div className="relative shrink-0 self-center">
            <svg width="100" height="100" viewBox="0 0 100 100" className="-rotate-90">
              <circle cx="50" cy="50" r={radius} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth="7" />
              <circle cx="50" cy="50" r={radius} fill="none"
                stroke="url(#heroGrad)" strokeWidth="7" strokeLinecap="round"
                strokeDasharray={circ} strokeDashoffset={offset}
                className="transition-all duration-700"
              />
              <defs>
                <linearGradient id="heroGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#5A5CD8" />
                  <stop offset="100%" stopColor="#c084fc" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-black text-white leading-none font-mono">{progress}%</span>
              <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider mt-0.5">Done</span>
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-xl md:text-2xl font-heading font-black text-white leading-tight mb-1">{workspace.title}</h2>
            <p className="text-white/40 text-sm font-medium mb-5 leading-relaxed line-clamp-2">{workspace.description}</p>

            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 text-center">
                <p className="text-xl font-black text-white font-mono">{workspace.daysRemaining ?? '—'}</p>
                <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider mt-0.5">Days Left</p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-2xl p-3 col-span-1">
                <p className="text-[9px] text-white/40 font-bold uppercase tracking-wider mb-1">Next Milestone</p>
                <p className="text-xs font-bold text-white leading-snug truncate">{nextMilestone?.label ?? workspace.highestPriority ?? 'On track'}</p>
              </div>

              <div className={`rounded-2xl p-3 text-center border border-white/10 ${riskColor}`}>
                <p className="text-[9px] font-bold uppercase tracking-wider mb-1 opacity-80">Risk</p>
                <p className="text-sm font-black leading-none">{risk}</p>
              </div>
            </div>
          </div>
        </div>

        {workspace.recommendedNextAction && (
          <div className="mt-5 pt-5 border-t border-white/8 flex items-center gap-3">
            <div className="w-7 h-7 rounded-xl bg-violet-500/20 border border-violet-400/20 flex items-center justify-center shrink-0">
              <Sparkles className="w-3.5 h-3.5 text-violet-300" />
            </div>
            <div>
              <p className="text-[9px] text-white/30 font-bold uppercase tracking-widest">AI Recommendation</p>
              <p className="text-sm font-bold text-white">{workspace.recommendedNextAction}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// --- DETAIL PANEL VALUES MAP ---
const STEP_DETAILS: Record<string, { done: string[]; left: string[] }> = {
  't-reg': {
    done: ['Submitted team details on Devfolio', 'Joined Discord announcements channel'],
    left: ['Team size confirmation is active']
  },
  't-res': {
    done: ['Reviewed Lemma SDK specifications', 'Designed database query structure for missions'],
    left: ['Confirm datastore constraints and limitations']
  },
  't-plan': {
    done: ['Created mission draft in planner', 'Assigned preliminary step priorities'],
    left: ['Triage timeline overlaps against end semester dates']
  },
  't-wf': {
    done: ['Designed dashboard layout mockup', 'Styled radial gauges and timeline charts'],
    left: ['Validate mobile responsive navbar specs']
  },
  't-dev': {
    done: ['Connected Lemma SDK client configurations', 'Integrated auth context state provider'],
    left: ['Complete core calendar drag-and-drop actions']
  },
  't-test': {
    done: ['Setup basic test runners'],
    left: ['Write integration tests for datastore queries']
  },
  't-dep': {
    done: ['Configure vercel.json headers'],
    left: ['Deploy main release candidate to staging']
  },
  't-demo': {
    done: ['Drafted walkthrough video script'],
    left: ['Record screen session and submit final form']
  }
};

// --- MAIN VIEW ---
export const WorkspacesView = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Intake Form States
  const [showIntake, setShowIntake] = useState(false);
  const [intakeTitle, setIntakeTitle] = useState('');
  const [intakeText, setIntakeText] = useState('');
  const [extracting, setExtracting] = useState(false);
  
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  // Custom Timeline Stepper state
  const [selectedStepId, setSelectedStepId] = useState<string | null>(null);

  // Tasks linked list for empty state tracking
  const [linkedTasks, setLinkedTasks] = useState<Task[]>([]);

  const loadWorkspaces = async () => {
    setLoading(true);
    try {
      const list = await workspaceService.getWorkspaces();
      setWorkspaces(list);
      if (list.length > 0) {
        setActiveWorkspaceId(list[0].id);
        setActiveWorkspace(list[0]);
        // Set default selected timeline step
        if (list[0].timeline.length > 0) {
          setSelectedStepId(list[0].timeline[0].id);
        }
      }
    } catch (err) {
      console.error('[WorkspacesView] Failed to load workspaces:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWorkspaces();
  }, []);

  useEffect(() => {
    if (activeWorkspaceId) {
      const selected = workspaces.find(w => w.id === activeWorkspaceId);
      if (selected) {
        setActiveWorkspace(selected);
        // Clear tasks simulation or mock them
        // In Kairo, standard workspaces are mock seed data, so we represent 0 tasks to trigger empty state!
        setLinkedTasks([]);
      }
    }
  }, [activeWorkspaceId, workspaces]);

  const handleIntakeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!intakeText.trim()) return;
    setExtracting(true);
    try {
      const newWs = await workspaceService.createWorkspaceFromInput(
        intakeTitle || 'AI Scanned Workspace',
        intakeText
      );
      setWorkspaces(prev => [newWs, ...prev]);
      setActiveWorkspaceId(newWs.id);
      setActiveWorkspace(newWs);
      setIntakeTitle('');
      setIntakeText('');
      setShowIntake(false);
    } catch (err) {
      console.error('[WorkspacesView] Extraction failed:', err);
    } finally {
      setExtracting(false);
    }
  };

  const toggleSubmissionItem = (itemId: string) => {
    if (!activeWorkspace) return;
    const updatedSubCheck = activeWorkspace.submissionChecklist.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    
    const totalItems = updatedSubCheck.length + activeWorkspace.demoChecklist.length;
    const completedItems = updatedSubCheck.filter(i => i.completed).length + activeWorkspace.demoChecklist.filter(i => i.completed).length;
    const newProgress = Math.round((completedItems / totalItems) * 100);

    const updated = {
      ...activeWorkspace,
      submissionChecklist: updatedSubCheck,
      progress: newProgress
    };

    setWorkspaces(prev => prev.map(w => w.id === activeWorkspace.id ? updated : w));
    setActiveWorkspace(updated);
  };

  const toggleDemoItem = (itemId: string) => {
    if (!activeWorkspace) return;
    const updatedDemoCheck = activeWorkspace.demoChecklist.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    
    const totalItems = activeWorkspace.submissionChecklist.length + updatedDemoCheck.length;
    const completedItems = activeWorkspace.submissionChecklist.filter(i => i.completed).length + updatedDemoCheck.filter(i => i.completed).length;
    const newProgress = Math.round((completedItems / totalItems) * 100);

    const updated = {
      ...activeWorkspace,
      demoChecklist: updatedDemoCheck,
      progress: newProgress
    };

    setWorkspaces(prev => prev.map(w => w.id === activeWorkspace.id ? updated : w));
    setActiveWorkspace(updated);
  };

  const toggleMilestoneStatus = (milestoneId: string) => {
    if (!activeWorkspace) return;
    const statuses: ('pending' | 'in_progress' | 'completed')[] = ['pending', 'in_progress', 'completed'];
    
    const updatedTimeline = activeWorkspace.timeline.map(m => {
      if (m.id === milestoneId) {
        const nextIdx = (statuses.indexOf(m.status) + 1) % statuses.length;
        return { ...m, status: statuses[nextIdx] };
      }
      return m;
    });

    const updated = {
      ...activeWorkspace,
      timeline: updatedTimeline
    };
    
    setWorkspaces(prev => prev.map(w => w.id === activeWorkspace.id ? updated : w));
    setActiveWorkspace(updated);
  };

  // Heuristic checklist progress math
  const getProgressStats = (list: { completed: boolean }[]) => {
    const total = list.length;
    const completed = list.filter(i => i.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  };

  const selectedStep = activeWorkspace?.timeline.find(s => s.id === selectedStepId);
  const stepDetails = selectedStepId ? (STEP_DETAILS[selectedStepId] || { done: ['Task initialized by KAIRO.'], left: ['Awaiting task details.'] }) : null;

  return (
    <div className="p-4 md:p-8 h-full flex flex-col font-body max-w-[1600px] mx-auto w-full">
      
      {/* Header */}
      <header className="mb-6 md:mb-8 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-black text-text-primary flex items-center gap-3">
            <Layers className="w-7 h-7 md:w-8 md:h-8 text-primary" />
            AI Workspaces
          </h1>
          <p className="text-text-secondary text-xs md:text-sm mt-1">
            Dynamic AI-generated command centers coordinating tasks, timelines, and strategy details.
          </p>
        </div>
        <button
          onClick={() => setShowIntake(s => !s)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Ingest Goal / URL</span>
        </button>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-white border border-gray-150 rounded-3xl">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start min-h-0">
          
          {/* LEFT SIDEBAR PANEL (3-Cols) */}
          <div className="lg:col-span-3 flex flex-col gap-4 w-full shrink-0">
            
            {/* INGEST FORM */}
            {showIntake && (
              <form onSubmit={handleIntakeSubmit} className="bg-white border border-primary/20 rounded-3xl p-5 shadow-sm space-y-4 animate-in fade-in duration-200">
                <div className="flex items-center justify-between border-b border-gray-50 pb-2">
                  <h3 className="font-heading font-bold text-xs uppercase tracking-wider text-primary">Ingest AI Command Center</h3>
                  <button type="button" onClick={() => setShowIntake(false)} className="text-xs text-text-secondary hover:text-text-primary font-bold">Cancel</button>
                </div>
                <div className="space-y-3">
                  <input
                    type="text"
                    value={intakeTitle}
                    onChange={e => setIntakeTitle(e.target.value)}
                    placeholder="Workspace Title (e.g., Gappy AI Hackathon)"
                    className="w-full rounded-xl border border-gray-200 p-3 text-xs bg-gray-50/50 outline-none text-text-primary font-semibold"
                    required
                  />
                  <textarea
                    rows={6}
                    value={intakeText}
                    onChange={e => setIntakeText(e.target.value)}
                    placeholder="Paste Devfolio URL, Discord announcements, PDF contents, or raw project instructions..."
                    className="w-full rounded-xl border border-gray-200 p-3 text-xs bg-gray-50/50 outline-none resize-none text-text-primary font-medium leading-relaxed"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={extracting}
                  className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2"
                >
                  {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                  <span>{extracting ? 'KAIRO Extracting Details...' : 'Generate Command Center'}</span>
                </button>
              </form>
            )}

            {/* WORKSPACES LIST */}
            <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-heading font-extrabold text-[10px] uppercase tracking-wider text-text-secondary">Active Workspaces</h3>
                <button 
                  onClick={() => setShowIntake(true)} 
                  className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline active:scale-95"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>
              
              <div className="space-y-2 max-h-[480px] overflow-y-auto pr-1 scrollbar-none">
                {workspaces.map(ws => {
                  const isActive = activeWorkspaceId === ws.id;
                  return (
                    <button
                      key={ws.id}
                      onClick={() => setActiveWorkspaceId(ws.id)}
                      className={cn(
                        "w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between items-start gap-2",
                        isActive
                          ? "bg-primary-light/40 border-primary/25 shadow-sm"
                          : "bg-white border-slate-100 hover:bg-gray-50"
                      )}
                    >
                      <div className="w-full">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[10px] font-extrabold text-primary uppercase bg-secondary px-2.5 py-0.5 rounded-lg border border-primary-border/20">
                            {ws.organization.split(' ')[0]}
                          </span>
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              ws.riskLevel === 'High' ? 'bg-red-500 shadow-sm shadow-red-500/30' : ws.riskLevel === 'Medium' ? 'bg-orange-500 shadow-sm shadow-orange-500/30' : 'bg-green-500 shadow-sm shadow-green-500/30'
                            )} />
                            <span className={cn(
                              "text-[10px] font-bold mr-1",
                              ws.riskLevel === 'High' ? 'text-red-500' : ws.riskLevel === 'Medium' ? 'text-orange-500' : 'text-green-600'
                            )}>
                              {ws.riskLevel}
                            </span>
                            {ws.daysRemaining && <DaysLeftArc days={ws.daysRemaining} />}
                          </div>
                        </div>
                        <h4 className="font-heading font-black text-sm text-text-primary mt-3 truncate w-full">{ws.title}</h4>
                        <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed font-semibold">{ws.description}</p>
                      </div>

                      <div className="w-full flex items-center justify-between border-t border-slate-100 pt-2 mt-1 text-[10px] text-text-secondary font-bold font-mono">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5 text-text-secondary" /> 
                          {ws.daysRemaining ? `${ws.daysRemaining} days left` : 'Ongoing'}
                        </span>
                        <span>{ws.progress}%</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT DETAILED PANEL (9-Cols) */}
          <div className="lg:col-span-9 flex flex-col gap-4 w-full min-w-0">
            {activeWorkspace ? (
              <div className="space-y-5">
                
                {/* HERO CARD */}
                <WorkspaceHeroCard workspace={activeWorkspace} />

                {/* 2. EXECUTION TIMELINE FLOW (CONNECTED NODES) */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-heading font-black text-xs text-text-primary flex items-center gap-1.5 uppercase tracking-wider border-b border-slate-100 pb-3 mb-6">
                    <Calendar className="w-4 h-4 text-primary" />
                    Automatic Execution Timeline
                  </h3>

                  {/* Connected node timeline strip */}
                  <div className="relative flex items-center justify-between pb-4 pt-2 overflow-x-auto scrollbar-none px-4">
                    {/* Connecting line background */}
                    <div className="absolute left-6 right-6 top-[22px] h-[3px] bg-slate-100 -z-10" />

                    {activeWorkspace.timeline.map((step, idx) => {
                      const isCompleted = step.status === 'completed';
                      const isInProgress = step.status === 'in_progress';
                      const isSelected = selectedStepId === step.id;

                      return (
                        <div key={step.id} className="flex flex-col items-center shrink-0 w-28 relative">
                          <button
                            onClick={() => setSelectedStepId(step.id)}
                            className={cn(
                              "w-8 h-8 rounded-full border-2 flex items-center justify-center transition-all bg-white relative",
                              isCompleted 
                                ? "bg-primary border-primary text-white" 
                                : isInProgress 
                                ? "border-primary text-primary" 
                                : "border-slate-300 text-slate-400",
                              isSelected && "ring-4 ring-primary/20 scale-110"
                            )}
                          >
                            {isCompleted ? (
                              <Check className="w-4 h-4 stroke-[3px]" />
                            ) : isInProgress ? (
                              <div className="relative flex items-center justify-center">
                                <span className="absolute inline-flex h-6 w-6 rounded-full bg-primary/20 animate-ping" />
                                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-primary" />
                              </div>
                            ) : (
                              <span className="w-2 h-2 rounded-full bg-transparent" />
                            )}
                          </button>
                          
                          <span className={cn(
                            "text-[9px] font-bold text-center mt-2.5 max-w-[90px] truncate block uppercase tracking-wide",
                            isCompleted ? "text-primary font-black" : isInProgress ? "text-text-primary font-black" : "text-text-secondary"
                          )}>
                            {step.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Expanded Timeline Step details panel */}
                  {selectedStep && stepDetails && (
                    <div className="border border-slate-150 rounded-2xl p-5 mt-4 bg-gray-50/50 space-y-4 animate-fade-in">
                      <div className="flex justify-between items-center border-b border-gray-200 pb-2">
                        <div>
                          <h4 className="font-heading font-black text-xs text-text-primary flex items-center gap-1.5">
                            <span className={cn(
                              "w-2 h-2 rounded-full",
                              selectedStep.status === 'completed' ? 'bg-primary' : selectedStep.status === 'in_progress' ? 'bg-indigo-500' : 'bg-slate-400'
                            )} />
                            {selectedStep.label} Details
                          </h4>
                          <p className="text-[9px] text-text-secondary font-bold uppercase tracking-wider font-mono mt-0.5">Status: {selectedStep.status}</p>
                        </div>
                        <button
                          onClick={() => toggleMilestoneStatus(selectedStep.id)}
                          className="bg-white hover:bg-gray-100 text-primary border border-primary/20 px-3 py-1.5 rounded-lg font-bold text-[10px] transition-all active:scale-95 shadow-sm"
                        >
                          Cycle Step Status
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black uppercase text-emerald-600 tracking-wider font-mono">✓ What's Done</span>
                          <ul className="list-disc pl-4 space-y-1 text-xs font-semibold text-text-secondary">
                            {stepDetails.done.map((d, i) => <li key={i}>{d}</li>)}
                          </ul>
                        </div>
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black uppercase text-amber-600 tracking-wider font-mono">⚡ What's Left</span>
                          <ul className="list-disc pl-4 space-y-1 text-xs font-semibold text-text-secondary">
                            {stepDetails.left.map((l, i) => <li key={i}>{l}</li>)}
                          </ul>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* 3. SUBMISSION CHECKLISTS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Submission Checklist */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                    {(() => {
                      const stats = getProgressStats(activeWorkspace.submissionChecklist);
                      return (
                        <div className="space-y-4">
                          <div className="border-b border-slate-100 pb-3">
                            <h3 className="font-heading font-black text-xs text-text-primary flex items-center gap-1.5 uppercase tracking-wide">
                              <CheckSquare className="w-4.5 h-4.5 text-primary" />
                              Submission Checklist
                            </h3>
                            <div className="flex items-center justify-between text-[9px] font-mono font-bold text-text-secondary mt-2">
                              <span>{stats.completed} of {stats.total} complete</span>
                              <span>{stats.percentage}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                              <div className="h-full bg-primary rounded-full transition-all duration-500" style={{ width: `${stats.percentage}%` }} />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {activeWorkspace.submissionChecklist.map((item, index) => (
                              <label
                                key={item.id}
                                className="flex items-start justify-between gap-3 p-3 rounded-2xl border border-slate-50 hover:bg-gray-50/50 cursor-pointer select-none transition-colors group"
                              >
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={item.completed}
                                    onChange={() => toggleSubmissionItem(item.id)}
                                    className="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary/20 shrink-0 mt-0.5"
                                  />
                                  <span className={cn("text-xs font-semibold leading-relaxed truncate", item.completed ? "text-text-secondary line-through" : "text-text-primary")}>
                                    {item.label}
                                  </span>
                                </div>
                                <span className="shrink-0 text-[8px] font-black font-mono bg-slate-100 text-text-secondary px-2 py-0.5 rounded-md self-center uppercase">
                                  Due Jul {idx => 3 + idx} {/* Dynamic check dates */}
                                  {index === 0 ? 'Today' : index === 1 ? 'Tomorrow' : `Jul ${3 + index}`}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Demo Checklist */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                    {(() => {
                      const stats = getProgressStats(activeWorkspace.demoChecklist);
                      return (
                        <div className="space-y-4">
                          <div className="border-b border-slate-100 pb-3">
                            <h3 className="font-heading font-black text-xs text-text-primary flex items-center gap-1.5 uppercase tracking-wide">
                              <Play className="w-4 h-4 text-primary" />
                              Demo Checklist
                            </h3>
                            <div className="flex items-center justify-between text-[9px] font-mono font-bold text-text-secondary mt-2">
                              <span>{stats.completed} of {stats.total} complete</span>
                              <span>{stats.percentage}%</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full mt-1.5 overflow-hidden">
                              <div className="h-full bg-teal-500 rounded-full transition-all duration-500" style={{ width: `${stats.percentage}%` }} />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            {activeWorkspace.demoChecklist.map((item, index) => (
                              <label
                                key={item.id}
                                className="flex items-start justify-between gap-3 p-3 rounded-2xl border border-slate-50 hover:bg-gray-50/50 cursor-pointer select-none transition-colors group"
                              >
                                <div className="flex items-start gap-2.5 min-w-0">
                                  <input
                                    type="checkbox"
                                    checked={item.completed}
                                    onChange={() => toggleDemoItem(item.id)}
                                    className="w-4 h-4 rounded text-primary border-slate-300 focus:ring-primary/20 shrink-0 mt-0.5"
                                  />
                                  <span className={cn("text-xs font-semibold leading-relaxed truncate", item.completed ? "text-text-secondary line-through" : "text-text-primary")}>
                                    {item.label}
                                  </span>
                                </div>
                                <span className="shrink-0 text-[8px] font-black font-mono bg-slate-100 text-text-secondary px-2 py-0.5 rounded-md self-center uppercase">
                                  {index === 0 ? 'Jul 4' : index === 1 ? 'Jul 5' : 'Jul 6'}
                                </span>
                              </label>
                            ))}
                          </div>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* 4. LINKED EXECUTION TASKS EMPTY STATE */}
                <div className="bg-white border border-slate-100 rounded-3xl p-6 shadow-sm">
                  <h3 className="font-heading font-black text-xs text-text-primary flex items-center gap-1.5 uppercase tracking-wide border-b border-slate-100 pb-3 mb-4">
                    <ClipboardList className="w-4.5 h-4.5 text-primary" />
                    Linked Execution Tasks
                  </h3>

                  {linkedTasks.length === 0 ? (
                    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-50/40 rounded-2xl border border-dashed border-gray-300/80">
                      <div className="w-12 h-12 bg-indigo-50 text-primary border border-primary/10 rounded-2xl flex items-center justify-center mb-3">
                        <ClipboardList className="w-6 h-6" />
                      </div>
                      <p className="font-bold text-text-primary text-sm">No tasks linked yet</p>
                      <p className="text-xs text-text-secondary mt-1.5 max-w-md font-semibold leading-relaxed">
                        Pull tasks from Execution Tasks list or let KAIRO draft a customized plan based on your workspace context.
                      </p>
                      <button
                        onClick={() => alert('KAIRO is now parsing workspace files to draft steps...')}
                        className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-xl font-bold text-xs mt-5 transition-all shadow-md active:scale-95"
                      >
                        Draft Plan with KAIRO
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {linkedTasks.map(t => (
                        <div key={t.id} className="p-3 bg-gray-50 rounded-xl border">
                          {t.title}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* 5. RESOURCE CENTER & TECH STACK */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Resources */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                    <h3 className="font-heading font-black text-xs text-text-primary flex items-center gap-1.5 border-b border-slate-50 pb-2.5 mb-3.5 uppercase tracking-wide">
                      <Compass className="w-4 h-4 text-primary" />
                      Resource Center
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-2">
                      {activeWorkspace.resources.map(res => (
                        <a
                          key={res.label}
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-2.5 rounded-xl border border-slate-50 hover:border-primary-border/20 bg-gray-50/20 hover:bg-white transition-all text-xs font-bold text-text-primary"
                        >
                          <div className="flex items-center gap-2">
                            <Globe className="w-4 h-4 text-primary shrink-0" />
                            <span>{res.label}</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-text-secondary shrink-0" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack Strategy */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                    <h3 className="font-heading font-black text-xs text-text-primary flex items-center gap-1.5 border-b border-slate-50 pb-2.5 mb-3.5 uppercase tracking-wide">
                      <Settings className="w-4 h-4 text-primary" />
                      Recommended Tech Stack
                    </h3>
                    
                    <div className="space-y-3.5">
                      <div className="flex flex-wrap gap-1.5">
                        {activeWorkspace.aiStrategy.suggestedTechStack.map(tech => (
                          <span key={tech} className="bg-secondary text-primary border border-primary-border/10 px-2.5 py-0.5 rounded-lg text-xs font-bold">
                            {tech}
                          </span>
                        ))}
                      </div>
                      
                      <div className="border-t border-slate-50 pt-2.5 flex justify-between items-center text-[10px] text-text-secondary font-bold font-mono">
                        <span>Confidence In Strategy</span>
                        <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-lg border border-green-200 uppercase font-bold">
                          {activeWorkspace.aiStrategy.executionConfidence}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 6. AI STRATEGY & INNOVATION OPPORTUNITIES */}
                <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm space-y-3.5">
                  <div className="flex items-center justify-between border-b border-slate-50 pb-2.5">
                    <h3 className="font-heading font-black text-xs text-text-primary flex items-center gap-1.5 uppercase tracking-wide">
                      <Sparkles className="w-4 h-4 text-primary" />
                      Winning Strategy & Innovation
                    </h3>
                    <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded uppercase font-bold font-mono">AI Insights</span>
                  </div>
                  
                  <div className="space-y-3.5 text-xs leading-relaxed">
                    <div className="bg-gray-50/50 p-3.5 rounded-2xl border border-slate-50 text-text-secondary font-semibold">
                      <p className="font-bold text-text-primary mb-1">🎯 Primary Guidance</p>
                      {activeWorkspace.aiStrategy.winningStrategy}
                    </div>

                    <div className="space-y-1.5">
                      <p className="font-bold text-text-primary">💡 High-Impact Innovation Opportunities</p>
                      <ul className="list-disc pl-5 space-y-1 text-text-secondary font-semibold">
                        {activeWorkspace.aiStrategy.innovationOpportunities.map(opp => (
                          <li key={opp}>{opp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 7. Extracted Rules & Judging Criteria */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Rules */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="font-heading font-black text-xs text-text-primary flex items-center gap-1.5 border-b border-slate-50 pb-2.5 mb-3.5 uppercase tracking-wide">
                        <ShieldAlert className="w-4 h-4 text-primary" />
                        Extracted Rules
                      </h3>
                      <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                        {activeWorkspace.rules || 'No detailed rules extracted.'}
                      </p>
                    </div>
                    
                    <div className="mt-4 pt-2.5 border-t border-slate-50 flex justify-between items-center text-[10px] text-text-secondary font-bold font-mono">
                      <span>Prize Pool</span>
                      <span className="text-primary font-black">{activeWorkspace.prizePool || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Judging Criteria */}
                  <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-sm">
                    <h3 className="font-heading font-black text-xs text-text-primary flex items-center gap-1.5 border-b border-slate-50 pb-2.5 mb-3.5 uppercase tracking-wide">
                      <Award className="w-4 h-4 text-primary" />
                      Judging Criteria
                    </h3>
                    
                    <ul className="space-y-2">
                      {activeWorkspace.judgingCriteria?.map((crit, idx) => (
                        <li key={idx} className="flex gap-2 text-xs font-semibold text-text-secondary">
                          <span className="text-primary font-extrabold">{idx + 1}.</span>
                          <span>{crit}</span>
                        </li>
                      )) || <p className="text-xs text-text-secondary italic">No criteria extracted.</p>}
                    </ul>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-text-secondary py-24 bg-white rounded-3xl border border-gray-100 shadow-sm">
                <Layers className="w-16 h-16 mb-4 opacity-20 text-text-secondary" />
                <p className="font-bold text-text-primary text-sm">Select or Ingest a Workspace</p>
                <p className="text-xs text-text-secondary mt-1">Use the ingest button at the top to add a new command center.</p>
              </div>
            )}
          </div>

        </div>
      )}
    </div>
  );
};
