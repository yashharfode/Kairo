import React, { useEffect, useState } from 'react';
import { 
  Layers, Plus, Loader2, Sparkles, CheckSquare, 
  Globe, Compass, Calendar, 
  ShieldAlert, Settings, Play, Check, X, ClipboardList, Flag, Search, Link as LinkIcon, FileText
} from 'lucide-react';
import { workspaceService } from '@/services/WorkspaceService';
import type { Workspace } from '@/services/WorkspaceService';
import { cn } from '@/lib/utils';

// --- DAYS-LEFT ARC COUNTDOWN ---
const DaysLeftArc = ({ days, total = 10 }: { days: number; total?: number }) => {
  const size = 20;
  const strokeWidth = 2;
  const radius = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radius;
  const percentage = Math.min(100, Math.max(0, (days / total) * 100));
  const offset = circ - (percentage / 100) * circ;

  return (
    <div className="relative flex items-center justify-center shrink-0 w-5 h-5" title={`${days} days remaining`}>
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
      <span className="absolute inset-0 flex items-center justify-center text-[7px] font-mono font-bold text-text-primary">
        {days}
      </span>
    </div>
  );
};

// --- SEMI-CIRCULAR HEALTH GAUGE ---
const HealthSemiCircle = ({ value }: { value: number }) => {
  const size = 110;
  const strokeWidth = 7;
  const radius = 40;
  const circ = Math.PI * radius; 
  const offset = circ - (value / 100) * circ;

  return (
    <div className="relative flex flex-col items-center justify-center h-[65px] overflow-hidden">
      <svg width={size} height={size / 2 + 5} viewBox={`0 0 ${size} ${size / 2 + 5}`} className="overflow-visible">
        <path
          d={`M ${size/2 - radius} ${size/2} A ${radius} ${radius} 0 0 1 ${size/2 + radius} ${size/2}`}
          fill="none"
          stroke="rgba(15, 23, 42, 0.05)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        <path
          d={`M ${size/2 - radius} ${size/2} A ${radius} ${radius} 0 0 1 ${size/2 + radius} ${size/2}`}
          fill="none"
          stroke="#14B8A6" 
          strokeWidth={strokeWidth}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute top-[18px] flex flex-col items-center">
        <span className="text-2xl font-mono font-black text-text-primary leading-none">{value}</span>
        <span className="text-[8px] text-text-secondary font-bold uppercase tracking-wider mt-0.5">/100</span>
      </div>
    </div>
  );
};

// --- MAIN COMPONENT ---
export const WorkspacesView = () => {
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [activeWorkspaceId, setActiveWorkspaceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Intake Form States
  const [intakeTitle, setIntakeTitle] = useState('');
  const [intakeText, setIntakeText] = useState('');
  const [extracting, setExtracting] = useState(false);
  const [selectedDocType, setSelectedDocType] = useState<'link' | 'code' | 'pdf' | 'file'>('link');

  // Details drawer overlay toggle
  const [showDrawer, setShowDrawer] = useState(false);

  const [activeWorkspace, setActiveWorkspace] = useState<Workspace | null>(null);

  // Countdown timer simulation
  const [timeLeft, setTimeLeft] = useState({ days: 3, hours: 10, minutes: 45, seconds: 22 });
  
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        if (prev.days > 0) return { ...prev, days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

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

  const getProgressStats = (list: { completed: boolean }[]) => {
    const total = list.length;
    const completed = list.filter(i => i.completed).length;
    const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;
    return { total, completed, percentage };
  };

  const subStats = activeWorkspace ? getProgressStats(activeWorkspace.submissionChecklist) : { total: 0, completed: 0, percentage: 0 };
  const demoStats = activeWorkspace ? getProgressStats(activeWorkspace.demoChecklist) : { total: 0, completed: 0, percentage: 0 };

  return (
    <div className="p-4 md:p-6 h-full flex flex-col font-body max-w-[1600px] mx-auto w-full space-y-6">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-heading font-black text-text-primary tracking-tight">AI Workspaces</h1>
          <p className="text-text-secondary text-xs font-semibold mt-1">
            AI-generated command centers that plan, organize and execute your goals.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          {/* Top Search bar */}
          <div className="relative flex-1 sm:w-64 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search workspace..."
              className="w-full bg-white border border-[#0F172A]/[0.08] rounded-xl py-2 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
            />
          </div>
          <button
            onClick={() => alert('Ready to ingest! Paste details in the left Ingest panel.')}
            className="flex items-center gap-2 bg-[#14B8A6] hover:bg-[#0d9488] text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Ingest Goal / URL</span>
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-white border border-gray-150 rounded-[2rem]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start min-h-0">
          
          {/* COLUMN 1: LEFT SIDEBAR (Ingest + Workspace List) */}
          <div className="lg:col-span-3 flex flex-col gap-5 w-full shrink-0">
            
            {/* 1. INGEST NEW GOAL */}
            <form onSubmit={handleIntakeSubmit} className="mc-card p-5 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-heading font-black text-xs uppercase tracking-wider text-text-primary">Ingest New Goal</h3>
                <button type="button" onClick={() => { setIntakeTitle(''); setIntakeText(''); }} className="text-[10px] text-text-secondary hover:text-text-primary font-bold">Cancel</button>
              </div>

              <input
                type="text"
                value={intakeTitle}
                onChange={e => setIntakeTitle(e.target.value)}
                placeholder="Workspace title (e.g., Gappy AI Hackathon)"
                className="w-full rounded-xl border border-gray-200 p-3 text-xs bg-gray-50/50 outline-none text-text-primary font-semibold"
                required
              />

              {/* Ingest document type selectors */}
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'link', icon: LinkIcon },
                  { id: 'code', icon: Globe },
                  { id: 'pdf', icon: FileText },
                  { id: 'file', icon: ClipboardList }
                ].map(item => {
                  const Icon = item.icon;
                  const isSelected = selectedDocType === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedDocType(item.id as any)}
                      className={cn(
                        "py-2.5 rounded-xl border flex items-center justify-center transition-all",
                        isSelected 
                          ? "bg-primary/5 border-primary text-primary" 
                          : "border-slate-100 bg-gray-50/50 text-text-secondary hover:bg-gray-100"
                      )}
                    >
                      <Icon className="w-4 h-4" />
                    </button>
                  );
                })}
              </div>

              <textarea
                rows={4}
                value={intakeText}
                onChange={e => setIntakeText(e.target.value)}
                placeholder="Paste Devfolio URL, Discord announcement, PDF, link or raw instructions..."
                className="w-full rounded-xl border border-gray-200 p-3 text-xs bg-gray-50/50 outline-none resize-none text-text-primary font-medium leading-relaxed"
                required
              />

              <button
                type="submit"
                disabled={extracting}
                className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-sm"
              >
                {extracting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
                <span>{extracting ? 'Extracting Details...' : 'Generate Command Center'}</span>
              </button>
            </form>

            {/* 2. ACTIVE WORKSPACES */}
            <div className="mc-card p-5 space-y-4">
              <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                <h3 className="font-heading font-extrabold text-[10px] uppercase tracking-wider text-text-secondary">Active Workspaces</h3>
                <button 
                  onClick={() => alert('New workspace intake ready! Simply write inside the top left form.')}
                  className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline active:scale-95"
                >
                  <Plus className="w-3 h-3" /> New
                </button>
              </div>

              <div className="space-y-2.5 max-h-[300px] overflow-y-auto pr-1 scrollbar-none">
                {workspaces.map(ws => {
                  const isActive = activeWorkspaceId === ws.id;
                  const tagType = ws.id.includes('semester') || ws.id.includes('dbms') ? 'ACADEMICS' : ws.id.includes('hackathon') ? 'LEMMA' : 'PERSONAL';
                  return (
                    <button
                      key={ws.id}
                      onClick={() => setActiveWorkspaceId(ws.id)}
                      className={cn(
                        "w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between items-start gap-2 relative overflow-hidden",
                        isActive
                          ? "bg-slate-50/80 border-primary/25 shadow-sm"
                          : "bg-white border-slate-100 hover:bg-gray-50"
                      )}
                    >
                      <div className="w-full">
                        <div className="flex justify-between items-center gap-2">
                          <span className={cn(
                            "text-[8px] font-extrabold px-2 py-0.5 rounded-md border",
                            tagType === 'LEMMA' ? 'text-primary bg-primary/5 border-primary/20' : tagType === 'ACADEMICS' ? 'text-teal-600 bg-teal-50 border-teal-200/50' : 'text-purple-600 bg-purple-50 border-purple-200/50'
                          )}>
                            {tagType}
                          </span>
                          <div className="flex items-center gap-1">
                            <span className={cn(
                              "w-1.5 h-1.5 rounded-full",
                              ws.riskLevel === 'High' ? 'bg-red-500' : ws.riskLevel === 'Medium' ? 'bg-orange-500' : 'bg-green-500'
                            )} />
                            <span className={cn(
                              "text-[9px] font-black mr-1",
                              ws.riskLevel === 'High' ? 'text-red-500' : ws.riskLevel === 'Medium' ? 'text-orange-500' : 'text-green-600'
                            )}>
                              {ws.riskLevel}
                            </span>
                            {ws.daysRemaining && <DaysLeftArc days={ws.daysRemaining} />}
                          </div>
                        </div>
                        <h4 className="font-heading font-black text-sm text-text-primary mt-2 truncate w-full">{ws.title}</h4>
                        <p className="text-[10px] text-text-secondary mt-1 font-semibold font-mono">{ws.daysRemaining ? `${ws.daysRemaining} days left` : 'Ongoing'} • {ws.progress}% done</p>
                      </div>
                    </button>
                  );
                })}
              </div>
              
              <div className="border-t border-slate-100 pt-3 text-center">
                <button onClick={() => alert('Already showing all available workspaces.')} className="text-[10px] font-bold text-primary hover:underline">
                  View All Workspaces →
                </button>
              </div>
            </div>

          </div>

          {/* COLUMN 2: CENTER PANEL (Hero Details + Connected Timeline + Current Focus) */}
          <div className="lg:col-span-6 flex flex-col gap-5 w-full min-w-0">
            {activeWorkspace ? (
              <div className="space-y-5">
                
                {/* 1. HERO WORKSPACE DETAIL CARD */}
                <div className="mc-card p-6 md:p-8 space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none" />
                  
                  {/* Top Badge row */}
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] font-black uppercase text-emerald-600 tracking-wider">Active Workspace</span>
                    <span className="ml-auto text-[9px] font-bold text-text-secondary bg-gray-50 border px-2.5 py-0.5 rounded-full">{activeWorkspace.organization}</span>
                  </div>

                  <div className="flex flex-col md:flex-row gap-6 items-center">
                    {/* Circle Gauge */}
                    <div className="relative shrink-0 w-24 h-24 flex items-center justify-center">
                      <svg width="90" height="90" viewBox="0 0 90 90" className="-rotate-90">
                        <circle cx="45" cy="45" r="38" fill="none" stroke="rgba(15,23,42,0.04)" strokeWidth="6" />
                        <circle cx="45" cy="45" r="38" fill="none"
                          stroke="#14B8A6" strokeWidth="6" strokeLinecap="round"
                          strokeDasharray={2 * Math.PI * 38} strokeDashoffset={2 * Math.PI * 38 - (activeWorkspace.progress / 100) * 2 * Math.PI * 38}
                          className="transition-all duration-700"
                        />
                      </svg>
                      <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-xl font-mono font-black text-text-primary leading-none">{activeWorkspace.progress}%</span>
                        <span className="text-[8px] text-text-secondary font-black uppercase tracking-widest mt-0.5">Done</span>
                      </div>
                    </div>

                    {/* Desc and metric cards */}
                    <div className="flex-1 space-y-4">
                      <div>
                        <h2 className="text-xl md:text-2xl font-heading font-black text-text-primary leading-tight mb-1">{activeWorkspace.title}</h2>
                        <p className="text-xs text-text-secondary font-medium leading-relaxed line-clamp-2">{activeWorkspace.description}</p>
                      </div>

                      {/* Mini Metric row */}
                      <div className="grid grid-cols-3 gap-2.5">
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col gap-1">
                          <Calendar className="w-4 h-4 text-primary" />
                          <span className="text-xs font-black text-text-primary leading-none mt-1 font-mono">{activeWorkspace.daysRemaining ?? '—'}</span>
                          <span className="text-[8px] text-text-secondary font-bold uppercase">Days Left</span>
                        </div>
                        
                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col gap-1">
                          <Flag className="w-4 h-4 text-emerald-500" />
                          <span className="text-[9px] font-black text-text-primary leading-tight truncate mt-1">Wireframes & UI</span>
                          <span className="text-[8px] text-text-secondary font-bold uppercase">Next Milestone</span>
                        </div>

                        <div className="bg-gray-50 border border-gray-100 rounded-xl p-3 flex flex-col gap-1">
                          <ShieldAlert className="w-4 h-4 text-orange-500" />
                          <span className="text-xs font-black text-orange-500 leading-none mt-1 uppercase">{activeWorkspace.riskLevel}</span>
                          <span className="text-[8px] text-text-secondary font-bold uppercase">Risk Level</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Recommendation footer row */}
                  {activeWorkspace.recommendedNextAction && (
                    <div className="pt-4 border-t border-[#0F172A]/[0.08] flex items-center justify-between gap-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-lg bg-teal-50 flex items-center justify-center shrink-0">
                          <Sparkles className="w-4 h-4 text-teal-600" />
                        </div>
                        <div>
                          <p className="text-[8px] text-text-secondary font-black uppercase tracking-widest leading-none">AI Recommendation</p>
                          <p className="text-xs font-bold text-text-primary mt-1">{activeWorkspace.recommendedNextAction}</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setShowDrawer(true)} 
                        className="bg-white hover:bg-gray-50 text-text-primary border border-gray-200 px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 mc-btn-active shadow-sm"
                      >
                        View Details →
                      </button>
                    </div>
                  )}
                </div>

                {/* 2. AUTOMATIC EXECUTION TIMELINE */}
                <div className="mc-card p-6 space-y-5">
                  <h3 className="font-heading font-black text-xs text-text-primary flex items-center gap-1.5 uppercase tracking-wider">
                    <Calendar className="w-4 h-4 text-primary" />
                    Automatic Execution Timeline
                  </h3>

                  <div className="relative flex items-center justify-between overflow-x-auto scrollbar-none pb-2 px-2">
                    {/* Progress connection line */}
                    <div className="absolute left-6 right-6 top-[15px] h-0.5 bg-slate-100 -z-10" />

                    {activeWorkspace.timeline.map(step => {
                      const isCompleted = step.status === 'completed';
                      const isInProgress = step.status === 'in_progress';
                      
                      return (
                        <div key={step.id} className="flex flex-col items-center shrink-0 w-24">
                          <button
                            onClick={() => toggleMilestoneStatus(step.id)}
                            className={cn(
                              "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all bg-white",
                              isCompleted 
                                ? "bg-primary border-primary text-white" 
                                : isInProgress 
                                ? "border-primary text-primary" 
                                : "border-slate-200 text-slate-300"
                            )}
                          >
                            {isCompleted ? (
                              <Check className="w-3.5 h-3.5 stroke-[3.5px]" />
                            ) : isInProgress ? (
                              <div className="relative flex items-center justify-center">
                                <span className="absolute inline-flex h-4 w-4 rounded-full bg-primary/20 animate-ping" />
                                <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-primary" />
                              </div>
                            ) : (
                              <span className="w-1.5 h-1.5 rounded-full bg-transparent" />
                            )}
                          </button>
                          <span className={cn(
                            "text-[8px] font-bold text-center mt-2 w-20 truncate block uppercase tracking-wide",
                            isCompleted ? "text-primary font-black" : isInProgress ? "text-text-primary font-black animate-pulse" : "text-text-secondary"
                          )}>
                            {step.label}
                          </span>
                          {isInProgress && <span className="text-[7px] text-primary font-extrabold uppercase font-mono tracking-wide mt-0.5">In Progress</span>}
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* 3. CURRENT FOCUS */}
                <div className="mc-card p-6 space-y-4">
                  <h3 className="font-heading font-black text-xs text-text-primary flex items-center gap-1.5 uppercase tracking-wider">
                    <ClipboardList className="w-4 h-4 text-primary" />
                    Current Focus
                  </h3>

                  <div className="space-y-3">
                    {[
                      { title: 'Design Dashboard Wireframes', priority: 'High Priority', status: 'In Progress', progress: 60, color: 'bg-teal-500' },
                      { title: 'Build Workspace Structure', priority: 'High Priority', status: 'Pending', progress: 0, color: 'bg-primary' },
                      { title: 'Setup Lemma SDK Integration', priority: 'Medium Priority', status: 'Pending', progress: 0, color: 'bg-primary' }
                    ].map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between p-3.5 bg-gray-50/50 rounded-2xl border border-gray-100">
                        <div className="space-y-1.5 min-w-0">
                          <span className="font-semibold text-xs text-text-primary truncate block">{item.title}</span>
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "text-[8px] font-black uppercase px-2 py-0.5 rounded-md border",
                              item.priority.includes('High') ? 'text-red-500 bg-red-50 border-red-200/50' : 'text-orange-500 bg-orange-50 border-orange-200/50'
                            )}>
                              {item.priority}
                            </span>
                            {item.status === 'In Progress' && (
                              <span className="text-[8px] font-black uppercase text-teal-600 bg-teal-50 border border-teal-200/50 px-2 py-0.5 rounded-md">
                                In Progress
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Progress row */}
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="text-[10px] font-mono font-black text-text-primary">{item.progress}%</span>
                          <div className="w-16 bg-slate-100 h-1.5 rounded-full overflow-hidden">
                            <div className={cn("h-full rounded-full transition-all", item.color)} style={{ width: `${item.progress}%` }} />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="text-center pt-2">
                    <button onClick={() => setShowDrawer(true)} className="text-[10px] font-bold text-primary hover:underline">
                      View Full Timeline →
                    </button>
                  </div>
                </div>

              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center text-text-secondary py-24 bg-white rounded-3xl border border-gray-150 shadow-sm">
                <Layers className="w-16 h-16 mb-4 opacity-20 text-text-secondary" />
                <p className="font-bold text-text-primary text-sm">Select or Ingest a Workspace</p>
                <p className="text-xs text-text-secondary mt-1">Use the ingest button at the top to add a new command center.</p>
              </div>
            )}
          </div>

          {/* COLUMN 3: RIGHT PANEL (Workspace Health + Next Deadline + Collaboration) */}
          <div className="lg:col-span-3 flex flex-col gap-5 w-full shrink-0">
            
            {/* 1. WORKSPACE HEALTH */}
            <div className="mc-card p-6 flex flex-col items-center">
              <h3 className="font-heading font-black text-xs text-text-primary self-start mb-4 uppercase tracking-wider">Workspace Health</h3>
              
              <HealthSemiCircle value={78} />
              <p className="text-[9px] font-mono font-bold text-text-secondary text-center mt-1.5">Good Progress! Keep it up.</p>

              {/* Progress bars list */}
              <div className="w-full space-y-2.5 mt-5">
                {[
                  { label: 'Planning', score: 90, color: 'bg-primary' },
                  { label: 'Execution', score: 65, color: 'bg-teal-500' },
                  { label: 'Resources', score: 80, color: 'bg-indigo-500' },
                  { label: 'Risk', score: 60, color: 'bg-orange-500' }
                ].map(item => (
                  <div key={item.label} className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-text-primary">
                      <span>{item.label}</span>
                      <span className="font-mono">{item.score}%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.score}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 2. NEXT DEADLINE */}
            <div className="mc-card p-5 space-y-4">
              <h3 className="font-heading font-black text-xs text-text-primary uppercase tracking-wider">Next Deadline</h3>
              
              <div>
                <p className="font-bold text-xs text-text-primary leading-tight">{activeWorkspace?.title || 'Hackathon Submission'}</p>
                <p className="text-[9px] text-text-secondary font-mono mt-0.5">4 July 2026, 11:59 PM</p>
              </div>

              {/* Countdown boxes */}
              <div className="grid grid-cols-4 gap-1.5 text-center">
                {[
                  { label: 'Days', val: String(timeLeft.days).padStart(2, '0') },
                  { label: 'Hours', val: String(timeLeft.hours).padStart(2, '0') },
                  { label: 'Min', val: String(timeLeft.minutes).padStart(2, '0') },
                  { label: 'Sec', val: String(timeLeft.seconds).padStart(2, '0') }
                ].map(item => (
                  <div key={item.label} className="bg-gray-50 border border-gray-100 rounded-xl p-2 flex flex-col items-center">
                    <span className="text-sm font-mono font-black text-text-primary leading-none">{item.val}</span>
                    <span className="text-[7px] text-text-secondary font-bold uppercase tracking-wider mt-1">{item.label}</span>
                  </div>
                ))}
              </div>

              <div className="text-center">
                <button onClick={() => alert('Redirecting to timeline deadlines...')} className="text-[10px] font-bold text-primary hover:underline">
                  View All Deadlines →
                </button>
              </div>
            </div>

            {/* 3. WORKSPACE COLLABORATION */}
            <div className="mc-card p-5 space-y-4">
              <h3 className="font-heading font-black text-xs text-text-primary uppercase tracking-wider">Workspace Collaboration</h3>
              
              <div className="flex items-center gap-3">
                {/* Avatar pile mockup */}
                <div className="flex -space-x-2.5 overflow-hidden">
                  <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-indigo-500 text-white text-[9px] font-black flex items-center justify-center">AH</div>
                  <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-teal-500 text-white text-[9px] font-black flex items-center justify-center">YH</div>
                  <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-purple-500 text-white text-[9px] font-black flex items-center justify-center">KD</div>
                  <div className="inline-block h-7 w-7 rounded-full ring-2 ring-white bg-slate-200 text-text-secondary text-[8px] font-black flex items-center justify-center">+2</div>
                </div>
                
                <span className="text-xs font-semibold text-text-primary">5 Members active</span>
              </div>

              <div className="text-center pt-1">
                <button onClick={() => alert('No other collaboration members in mock pod.')} className="text-[10px] font-bold text-primary hover:underline">
                  View Members →
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FOOTER ROW: AI INSIGHTS */}
      {!loading && (
        <footer className="mc-card p-5">
          <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6 justify-between text-xs font-semibold text-text-secondary leading-relaxed overflow-x-auto scrollbar-none">
            
            <div className="flex items-center gap-3 shrink-0">
              <Sparkles className="w-5 h-5 text-[#14B8A6]" />
              <span className="font-heading font-black text-xs text-text-primary tracking-wider uppercase">AI INSIGHTS</span>
            </div>

            <div className="flex flex-col sm:flex-row gap-6 w-full lg:w-auto font-mono text-[10px] text-text-secondary">
              <div className="flex items-center gap-2 bg-slate-50 border border-gray-150 px-3.5 py-2.5 rounded-2xl shrink-0">
                <span className="text-emerald-500 font-bold">💡</span>
                <span>You're most productive between 9 AM - 12 PM.</span>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 border border-gray-150 px-3.5 py-2.5 rounded-2xl shrink-0">
                <span className="text-primary font-bold">🎯</span>
                <span>Focus more on execution. Planning is on track.</span>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 border border-gray-150 px-3.5 py-2.5 rounded-2xl shrink-0">
                <span className="text-indigo-500 font-bold">📖</span>
                <span>2 resources recommended for UI Design.</span>
              </div>

              <div className="flex items-center gap-2 bg-slate-50 border border-gray-150 px-3.5 py-2.5 rounded-2xl shrink-0">
                <span className="text-red-500 font-bold">⚠️</span>
                <span>Risk may increase if prototype is delayed.</span>
              </div>
            </div>

          </div>
        </footer>
      )}

      {/* ── DETAIL DRAWER (Checklists, SDKs, Judging Criteria, Rules) ── */}
      {showDrawer && activeWorkspace && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
          <div className="w-full max-w-2xl bg-white h-full shadow-2xl p-8 overflow-y-auto flex flex-col justify-between animate-in slide-in-from-right duration-300">
            
            <div className="space-y-6">
              {/* Drawer Header */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div>
                  <h3 className="font-heading font-black text-xl text-text-primary">{activeWorkspace.title}</h3>
                  <p className="text-xs font-semibold text-text-secondary mt-1">Detailed checklists and strategies for submission success</p>
                </div>
                <button 
                  onClick={() => setShowDrawer(false)}
                  className="p-2 rounded-full hover:bg-gray-100 text-text-secondary hover:text-text-primary transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Stepper details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Submission checklist */}
                <div className="space-y-3">
                  <h4 className="font-heading font-black text-xs text-text-primary flex items-center gap-2 border-b border-gray-100 pb-2">
                    <CheckSquare className="w-4 h-4 text-primary" /> Submission Checklist ({subStats.completed}/{subStats.total})
                  </h4>
                  <div className="space-y-2">
                    {activeWorkspace.submissionChecklist.map(item => (
                      <label key={item.id} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleSubmissionItem(item.id)}
                          className="w-4 h-4 rounded text-primary mt-0.5"
                        />
                        <span className={cn("font-semibold leading-relaxed", item.completed ? "text-text-secondary line-through" : "text-text-primary")}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Demo checklist */}
                <div className="space-y-3">
                  <h4 className="font-heading font-black text-xs text-text-primary flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Play className="w-4 h-4 text-[#14B8A6]" /> Demo Checklist ({demoStats.completed}/{demoStats.total})
                  </h4>
                  <div className="space-y-2">
                    {activeWorkspace.demoChecklist.map(item => (
                      <label key={item.id} className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-50 cursor-pointer text-xs">
                        <input
                          type="checkbox"
                          checked={item.completed}
                          onChange={() => toggleDemoItem(item.id)}
                          className="w-4 h-4 rounded text-primary mt-0.5"
                        />
                        <span className={cn("font-semibold leading-relaxed", item.completed ? "text-text-secondary line-through" : "text-text-primary")}>
                          {item.label}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>

              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-100">
                {/* Tech stacks */}
                <div className="space-y-3">
                  <h4 className="font-heading font-black text-xs text-text-primary flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Settings className="w-4 h-4 text-gray-500" /> Recommended SDKs & Tech
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {activeWorkspace.aiStrategy.suggestedTechStack.map(tech => (
                      <span key={tech} className="bg-slate-100 text-text-primary border border-slate-200 px-2 py-0.5 rounded-lg text-[10px] font-bold">
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Strategy */}
                <div className="space-y-3">
                  <h4 className="font-heading font-black text-xs text-text-primary flex items-center gap-2 border-b border-gray-100 pb-2">
                    <Compass className="w-4 h-4 text-emerald-500" /> AI Strategy
                  </h4>
                  <p className="text-xs text-text-secondary leading-relaxed font-semibold">
                    {activeWorkspace.aiStrategy.winningStrategy}
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowDrawer(false)}
              className="w-full bg-slate-900 hover:bg-black text-white py-3 rounded-xl font-bold text-xs mt-8"
            >
              Done / Return to Panel
            </button>

          </div>
        </div>
      )}

    </div>
  );
};
