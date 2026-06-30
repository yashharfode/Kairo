import React, { useEffect, useState } from 'react';
import { 
  Layers, Plus, Loader2, Sparkles, CheckSquare, 
  ExternalLink, ChevronRight, Globe, Compass, Calendar, 
  Clock, ShieldAlert, Award, Settings, Play
} from 'lucide-react';
import { workspaceService } from '@/services/WorkspaceService';
import type { Workspace } from '@/services/WorkspaceService';
import { cn } from '@/lib/utils';

export const WorkspacesView = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Intake Form States
  const [showIntake, setShowIntake] = useState(false);
  const [intakeTitle, setIntakeTitle] = useState('');
  const [intakeText, setIntakeText] = useState('');
  const [extracting, setExtracting] = useState(false);
  
  // Interactive Checklist states (local update support)
  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  const loadWorkspaces = async () => {
    setLoading(true);
    try {
      const list = await workspaceService.getWorkspaces();
      setWorkspaces(list);
      if (list.length > 0) {
        setActiveWorkspaceId(list[0].id);
        setActiveWorkspace(list[0]);
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

  // Interactive Checklists toggler
  const toggleSubmissionItem = (itemId: string) => {
    if (!activeWorkspace) return;
    const updatedSubCheck = activeWorkspace.submissionChecklist.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    
    // Recalculate progress based on checklists
    const totalItems = updatedSubCheck.length + activeWorkspace.demoChecklist.length;
    const completedItems = updatedSubCheck.filter(i => i.completed).length + activeWorkspace.demoChecklist.filter(i => i.completed).length;
    const newProgress = Math.round((completedItems / totalItems) * 100);

    const updated = {
      ...activeWorkspace,
      submissionChecklist: updatedSubCheck,
      progress: newProgress
    };

    // Update list & active
    setWorkspaces(prev => prev.map(w => w.id === activeWorkspace.id ? updated : w));
    setActiveWorkspace(updated);
  };

  const toggleDemoItem = (itemId: string) => {
    if (!activeWorkspace) return;
    const updatedDemoCheck = activeWorkspace.demoChecklist.map(item => 
      item.id === itemId ? { ...item, completed: !item.completed } : item
    );
    
    // Recalculate progress based on checklists
    const totalItems = activeWorkspace.submissionChecklist.length + updatedDemoCheck.length;
    const completedItems = activeWorkspace.submissionChecklist.filter(i => i.completed).length + updatedDemoCheck.filter(i => i.completed).length;
    const newProgress = Math.round((completedItems / totalItems) * 100);

    const updated = {
      ...activeWorkspace,
      demoChecklist: updatedDemoCheck,
      progress: newProgress
    };

    // Update list & active
    setWorkspaces(prev => prev.map(w => w.id === activeWorkspace.id ? updated : w));
    setActiveWorkspace(updated);
  };

  // Timeline Milestone toggler (rescheduling/status update simulation)
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
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start min-h-0">
          
          {/* LEFT SIDEBAR PANEL (4-Cols on Large Screens) */}
          <div className="lg:col-span-4 flex flex-col gap-6 w-full shrink-0">
            
            {/* INGEST FORM OVERLAY */}
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
            <div className="bg-white border border-gray-150 rounded-3xl p-5 shadow-sm space-y-4">
              <h3 className="font-heading font-extrabold text-[10px] uppercase tracking-wider text-text-secondary border-b border-gray-50 pb-2">Active Workspaces</h3>
              
              <div className="space-y-2 max-h-[400px] overflow-y-auto pr-1">
                {workspaces.map(ws => {
                  const isActive = activeWorkspaceId === ws.id;
                  return (
                    <button
                      key={ws.id}
                      onClick={() => setActiveWorkspaceId(ws.id)}
                      className={cn(
                        "w-full text-left p-4 rounded-2xl border transition-all flex flex-col justify-between items-start gap-2.5",
                        isActive
                          ? "bg-primary-light/40 border-primary/25 shadow-sm shadow-primary/5"
                          : "bg-white border-gray-100 hover:bg-gray-50"
                      )}
                    >
                      <div className="w-full">
                        <div className="flex justify-between items-center gap-2">
                          <span className="text-[10px] font-extrabold text-primary uppercase bg-secondary px-2 py-0.5 rounded-lg border border-primary-border/20">
                            {ws.organization.split(' ')[0]}
                          </span>
                          <span className={cn(
                            "text-[10px] font-bold",
                            ws.riskLevel === 'High' ? 'text-red-500' : ws.riskLevel === 'Medium' ? 'text-orange-500' : 'text-primary'
                          )}>
                            {ws.riskLevel} Risk
                          </span>
                        </div>
                        <h4 className="font-heading font-black text-sm text-text-primary mt-2 truncate w-full">{ws.title}</h4>
                        <p className="text-xs text-text-secondary mt-1 line-clamp-2 leading-relaxed">{ws.description}</p>
                      </div>

                      <div className="w-full flex items-center justify-between border-t border-gray-100/50 pt-2.5 text-[10px] text-text-secondary font-bold">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {ws.daysRemaining ? `${ws.daysRemaining} days left` : 'Ongoing'}
                        </span>
                        <span>{ws.progress}% Completed</span>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT DETAILED PANEL (8-Cols on Large Screens) */}
          <div className="lg:col-span-8 flex flex-col gap-6 w-full min-w-0">
            {activeWorkspace ? (
              <div className="space-y-6">
                
                {/* 1. AI EXECUTIVE BRIEF HEADER */}
                <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-3xl pointer-events-none translate-x-1/4 -translate-y-1/4" />
                  
                  <div className="flex items-start justify-between gap-4 border-b border-gray-50 pb-4 mb-4">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-2xl bg-primary flex items-center justify-center text-white shadow-md shadow-primary/20 shrink-0">
                        <Sparkles className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="font-heading font-black text-lg md:text-xl text-text-primary">{activeWorkspace.title}</h2>
                        <p className="text-xs text-text-secondary mt-0.5 font-medium">{activeWorkspace.organization}</p>
                      </div>
                    </div>

                    <div className="text-right">
                      <p className="text-[10px] font-extrabold text-text-secondary uppercase">Progress</p>
                      <p className="text-xl font-black text-primary">{activeWorkspace.progress}%</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="bg-primary-light/30 border border-primary-border/20 rounded-2xl p-4">
                      <p className="font-heading font-black text-xs text-primary flex items-center gap-1.5 uppercase tracking-wider mb-2">
                        <Clock className="w-3.5 h-3.5" /> AI Executive Brief
                      </p>
                      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed font-semibold">
                        Good Morning, Yash. You have <strong className="text-primary font-black">{activeWorkspace.daysRemaining || 0} days</strong> until submission. 
                        Your current progress is <strong className="text-primary font-black">{activeWorkspace.progress}%</strong>. 
                        The risk assessment level is <strong className={cn("font-black", activeWorkspace.riskLevel === 'High' ? 'text-red-500' : 'text-primary')}>{activeWorkspace.riskLevel}</strong>.
                      </p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-semibold">
                      <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 flex flex-col justify-between gap-1">
                        <span className="text-[10px] text-text-secondary uppercase">Highest Priority Target</span>
                        <span className="text-text-primary font-extrabold">{activeWorkspace.highestPriority}</span>
                      </div>
                      <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100 flex flex-col justify-between gap-1">
                        <span className="text-[10px] text-text-secondary uppercase">Recommended Next Action</span>
                        <span className="text-primary font-extrabold">{activeWorkspace.recommendedNextAction}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 2. INTERACTIVE TIMELINE STAGES */}
                <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-3 mb-5">
                    <h3 className="font-heading font-black text-sm text-text-primary flex items-center gap-1.5">
                      <Calendar className="w-4.5 h-4.5 text-primary" />
                      Automatic Execution Timeline
                    </h3>
                    <span className="text-[10px] text-text-secondary font-bold">Click step to cycle status</span>
                  </div>

                  {/* Horizontal stages tracker */}
                  <div className="flex items-center gap-2 overflow-x-auto pb-3 scrollbar-none">
                    {activeWorkspace.timeline.map((step, idx) => (
                      <React.Fragment key={step.id}>
                        <button
                          onClick={() => toggleMilestoneStatus(step.id)}
                          className={cn(
                            "px-3.5 py-2 rounded-xl border text-[11px] font-bold flex flex-col gap-1 items-start shrink-0 select-none transition-all duration-200 hover:-translate-y-0.5",
                            step.status === 'completed'
                              ? 'bg-secondary text-primary border-primary-border/20 shadow-sm'
                              : step.status === 'in_progress'
                              ? 'bg-primary text-white border-primary shadow-md shadow-primary/10'
                              : 'bg-white border-gray-100 text-text-secondary hover:bg-gray-50'
                          )}
                        >
                          <span>{step.label}</span>
                          <span className="text-[8px] opacity-80 uppercase tracking-widest">
                            {step.status.replace('_', ' ')}
                          </span>
                        </button>
                        {idx < activeWorkspace.timeline.length - 1 && (
                          <ChevronRight className="w-4 h-4 text-gray-300 shrink-0" />
                        )}
                      </React.Fragment>
                    ))}
                  </div>
                </div>

                {/* 3. SUBMISSION CHECKLISTS */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Submission Checklist */}
                  <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="font-heading font-black text-sm text-text-primary flex items-center gap-1.5 border-b border-gray-50 pb-3 mb-4">
                        <CheckSquare className="w-4.5 h-4.5 text-primary" />
                        Submission Checklist
                      </h3>
                      
                      <div className="space-y-3">
                        {activeWorkspace.submissionChecklist.map(item => (
                          <label
                            key={item.id}
                            className="flex items-start gap-3 p-2.5 rounded-xl border border-gray-50 hover:bg-gray-50/50 cursor-pointer select-none transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => toggleSubmissionItem(item.id)}
                              className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary/20 shrink-0 mt-0.5"
                            />
                            <span className={cn("text-xs font-semibold leading-relaxed", item.completed ? "text-text-secondary line-through" : "text-text-primary")}>
                              {item.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Demo Checklist */}
                  <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="font-heading font-black text-sm text-text-primary flex items-center gap-1.5 border-b border-gray-50 pb-3 mb-4">
                        <Play className="w-4.5 h-4.5 text-primary" />
                        Demo Recording Checklist
                      </h3>
                      
                      <div className="space-y-3">
                        {activeWorkspace.demoChecklist.map(item => (
                          <label
                            key={item.id}
                            className="flex items-start gap-3 p-2.5 rounded-xl border border-gray-50 hover:bg-gray-50/50 cursor-pointer select-none transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={item.completed}
                              onChange={() => toggleDemoItem(item.id)}
                              className="w-4 h-4 rounded text-primary border-gray-300 focus:ring-primary/20 shrink-0 mt-0.5"
                            />
                            <span className={cn("text-xs font-semibold leading-relaxed", item.completed ? "text-text-secondary line-through" : "text-text-primary")}>
                              {item.label}
                            </span>
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>

                </div>

                {/* 4. RESOURCE CENTER & TECH STACK */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Resources */}
                  <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-heading font-black text-sm text-text-primary flex items-center gap-1.5 border-b border-gray-50 pb-3 mb-4">
                      <Compass className="w-4.5 h-4.5 text-primary" />
                      Operations Resource Center
                    </h3>
                    
                    <div className="grid grid-cols-1 gap-2.5">
                      {activeWorkspace.resources.map(res => (
                        <a
                          key={res.label}
                          href={res.url}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-primary-border/20 bg-gray-50/20 hover:bg-white transition-all text-xs font-bold text-text-primary"
                        >
                          <div className="flex items-center gap-2.5">
                            {res.type === 'github' ? (
                              <Globe className="w-4 h-4 text-text-primary" />
                            ) : res.type === 'figma' ? (
                              <Compass className="w-4 h-4 text-pink-500" />
                            ) : (
                              <Globe className="w-4 h-4 text-primary" />
                            )}
                            <span>{res.label}</span>
                          </div>
                          <ExternalLink className="w-3.5 h-3.5 text-text-secondary" />
                        </a>
                      ))}
                    </div>
                  </div>

                  {/* Tech Stack Strategy */}
                  <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-heading font-black text-sm text-text-primary flex items-center gap-1.5 border-b border-gray-50 pb-3 mb-4">
                      <Settings className="w-4.5 h-4.5 text-primary" />
                      AI Recommended Tech Stack
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex flex-wrap gap-2">
                        {activeWorkspace.aiStrategy.suggestedTechStack.map(tech => (
                          <span key={tech} className="bg-secondary text-primary border border-primary-border/20 px-3 py-1 rounded-xl text-xs font-bold">
                            {tech}
                          </span>
                        ))}
                      </div>
                      
                      <div className="border-t border-gray-50 pt-3 flex justify-between items-center text-[10px] text-text-secondary font-bold">
                        <span>Confidence In Strategy</span>
                        <span className="bg-green-50 text-green-600 px-2 py-0.5 rounded-lg border border-green-200">
                          {activeWorkspace.aiStrategy.executionConfidence}
                        </span>
                      </div>
                    </div>
                  </div>

                </div>

                {/* 5. AI STRATEGY & INNOVATION OPPORTUNITIES */}
                <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm space-y-4">
                  <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                    <h3 className="font-heading font-black text-sm text-text-primary flex items-center gap-1.5">
                      <Sparkles className="w-4.5 h-4.5 text-primary" />
                      KAIRO AI Winning Strategy
                    </h3>
                    <span className="text-[10px] bg-primary/10 text-primary px-2.5 py-0.5 rounded uppercase font-bold">Strategy Deck</span>
                  </div>
                  
                  <div className="space-y-4 text-xs sm:text-sm leading-relaxed">
                    <div className="bg-gray-50/50 p-4 rounded-2xl border border-gray-100 text-text-secondary">
                      <p className="font-bold text-text-primary mb-1">🎯 Primary Strategy Guidance</p>
                      {activeWorkspace.aiStrategy.winningStrategy}
                    </div>

                    <div className="space-y-2">
                      <p className="font-bold text-text-primary">💡 High-Impact Innovation Opportunities</p>
                      <ul className="list-disc pl-5 space-y-1.5 text-text-secondary">
                        {activeWorkspace.aiStrategy.innovationOpportunities.map(opp => (
                          <li key={opp}>{opp}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* 6. OTHER SCRIPPED DETAILS (judging criteria, rules, etc.) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  
                  {/* Rules */}
                  <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm flex flex-col justify-between">
                    <div>
                      <h3 className="font-heading font-black text-sm text-text-primary flex items-center gap-1.5 border-b border-gray-50 pb-3 mb-4">
                        <ShieldAlert className="w-4.5 h-4.5 text-primary" />
                        Extracted Rules
                      </h3>
                      <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                        {activeWorkspace.rules || 'No detailed rules extracted.'}
                      </p>
                    </div>
                    
                    <div className="mt-4 pt-3 border-t border-gray-50 flex justify-between items-center text-[10px] text-text-secondary font-bold">
                      <span>Prize Pool</span>
                      <span className="text-primary font-black">{activeWorkspace.prizePool || 'N/A'}</span>
                    </div>
                  </div>

                  {/* Judging Criteria */}
                  <div className="bg-white border border-gray-150 rounded-3xl p-6 shadow-sm">
                    <h3 className="font-heading font-black text-sm text-text-primary flex items-center gap-1.5 border-b border-gray-50 pb-3 mb-4">
                      <Award className="w-4.5 h-4.5 text-primary" />
                      Judging Evaluation Criteria
                    </h3>
                    
                    <ul className="space-y-2.5">
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
