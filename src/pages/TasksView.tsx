import { useEffect, useState } from 'react';
import { 
  CheckSquare, Circle, PlayCircle, CheckCircle2, Target, Plus, Search, Filter, 
  Sparkles, Clock, AlertTriangle, ChevronRight, Edit3, Calendar, MoreVertical, Check
} from 'lucide-react';
import { missionService } from '@/services/MissionService';
import type { Mission, Task } from '@/types/schema';
import { cn } from '@/lib/utils';

// --- TASK TAGS MAP ---
const TASK_TAGS: Record<string, string[]> = {
  'Review Striver Arrays: Two Pointers & Sliding Window': ['Arrays & Strings'],
  'Complete Sorting Algorithms & Recursion Basics': ['Sorting'],
  'Solve 15 Sliding Window problems on Leetcode': ['Sliding Window'],
  'Revise Binary Search & Variations': ['Binary Search'],
  'Solve 10 problems from Contest (Arrays)': ['Contest']
};

// --- SEED MISSIONS MATCHING MOCKUP ---
const SEED_MISSIONS: Mission[] = [
  {
    id: 'm-dsa',
    title: 'DSA Placement Accelerator (Striver A-Z)',
    description: 'Daily target: 5 problems, currently on Arrays & Strings.',
    targetDate: 'Jul 30, 2026',
    status: 'active',
    userId: 'mock-user',
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'm-mern',
    title: 'CollegeConnect MERN App Deployment',
    description: 'Deploy MERN client and server to cloud instances.',
    targetDate: 'Jul 15, 2026',
    status: 'active',
    userId: 'mock-user',
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'm-gappy',
    title: 'Gappy AI Hackathon 2026',
    description: 'Build KAIRO landing page and record demo video.',
    targetDate: 'Jul 4, 2026',
    status: 'active',
    userId: 'mock-user',
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// --- SEED TASKS MATCHING MOCKUP ---
const SEED_TASKS: Task[] = [
  {
    id: 't-1',
    missionId: 'm-dsa',
    title: 'Review Striver Arrays: Two Pointers & Sliding Window',
    description: 'Drill medium difficulty sliding window challenges.',
    priority: 'urgent', // maps to High
    status: 'in_progress',
    estimatedDuration: 90,
    userId: 'mock-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-2',
    missionId: 'm-dsa',
    title: 'Complete Sorting Algorithms & Recursion Basics',
    description: 'Review quicksort and mergesort step structures.',
    priority: 'high', // maps to Medium
    status: 'todo',
    estimatedDuration: 60,
    userId: 'mock-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-3',
    missionId: 'm-dsa',
    title: 'Solve 15 Sliding Window problems on Leetcode',
    description: 'Targeting specific medium arrays items.',
    priority: 'high', // maps to Medium
    status: 'todo',
    estimatedDuration: 120,
    userId: 'mock-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-4',
    missionId: 'm-dsa',
    title: 'Revise Binary Search & Variations',
    description: 'Focus on search space reduction techniques.',
    priority: 'medium', // maps to Low
    status: 'todo',
    estimatedDuration: 45,
    userId: 'mock-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-5',
    missionId: 'm-dsa',
    title: 'Solve 10 problems from Contest (Arrays)',
    description: 'Practice contest level problems for speed.',
    priority: 'medium', // maps to Low
    status: 'todo',
    estimatedDuration: 90,
    userId: 'mock-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // MERN tasks
  {
    id: 't-mern-1',
    missionId: 'm-mern',
    title: 'Configure environment variables on production server',
    description: 'Setup database credentials and API endpoints.',
    priority: 'urgent',
    status: 'in_progress',
    estimatedDuration: 40,
    userId: 'mock-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 't-mern-2',
    missionId: 'm-mern',
    title: 'Verify CORS policies on backend API router',
    description: 'Allow cross origin requests from Vercel staging client.',
    priority: 'high',
    status: 'completed',
    estimatedDuration: 30,
    userId: 'mock-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },

  // Gappy tasks
  {
    id: 't-gappy-1',
    missionId: 'm-gappy',
    title: 'Record KAIRO features walkthrough video',
    description: ' Crisp 2-minute feature highlight screen capture.',
    priority: 'urgent',
    status: 'completed',
    estimatedDuration: 120,
    userId: 'mock-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// --- MINI RADIAL GAUGE ---
const MiniRadialGauge = ({ value }: { value: number }) => {
  const size = 38;
  const strokeWidth = 3.5;
  const radius = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radius;
  const offset = circ - (value / 100) * circ;

  return (
    <div className="relative flex items-center justify-center shrink-0 w-10 h-10">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(15,23,42,0.05)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="#4F46E5" strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          className="transition-all duration-500"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center text-[8px] font-mono font-black text-text-primary leading-none">
        <span>{value}%</span>
      </div>
    </div>
  );
};

// --- MULTI-SEGMENT DONUT CHART ---
const TaskDonutChart = () => {
  const size = 110;
  const radius = 34;
  const circ = 2 * Math.PI * radius; // 213.6
  const strokeWidth = 8;

  // Mock segment parts out of 12 total tasks
  const highPct = (4 / 12) * 100;
  const medPct = (5 / 12) * 100;
  const lowPct = (3 / 12) * 100;

  return (
    <div className="relative flex items-center justify-center w-full h-28 mt-2">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(15,23,42,0.04)" strokeWidth={strokeWidth} />
        
        {/* Segment 1: High (Red) - 33% */}
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#EF4444" strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={circ - (highPct/100) * circ}
        />
        {/* Segment 2: Med (Orange) - offset 120deg */}
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#F59E0B" strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={circ - (medPct/100) * circ}
          className="rotate-[120deg] origin-center"
        />
        {/* Segment 3: Low (Green) - offset 270deg */}
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#10B981" strokeWidth={strokeWidth}
          strokeDasharray={circ} strokeDashoffset={circ - (lowPct/100) * circ}
          className="rotate-[270deg] origin-center"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-2xl font-mono font-black text-text-primary leading-none">12</span>
        <span className="text-[8px] text-text-secondary font-bold uppercase tracking-wider mt-0.5">Total</span>
      </div>
    </div>
  );
};

// --- AI INSIGHT WAVE CHART ---
const WaveChart = () => {
  return (
    <div className="relative w-full h-12 mt-3">
      <svg className="w-full h-full" viewBox="0 0 200 40" preserveAspectRatio="none">
        <path
          d="M 0 30 C 30 25, 60 5, 90 10 C 120 18, 150 35, 180 20 L 200 22"
          fill="none"
          stroke="#5A5CD8"
          strokeWidth="2"
        />
        <path
          d="M 0 30 C 30 25, 60 5, 90 10 C 120 18, 150 35, 180 20 L 200 22 L 200 40 L 0 40 Z"
          fill="rgba(90, 92, 216, 0.05)"
        />
        <circle cx="90" cy="10" r="4" fill="#5A5CD8" stroke="white" strokeWidth="1.5" />
      </svg>
      <span className="absolute top-0 left-[64px] text-[8px] font-mono font-bold text-white bg-slate-900 border border-white/10 px-1.5 py-0.5 rounded shadow-md">
        9:00 AM - 12:00 PM
      </span>
    </div>
  );
};

// --- MAIN VIEW ---
export const TasksView = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const [m, t] = await Promise.all([
          missionService.getMissions(),
          missionService.getTasks(),
        ]);
        
        // Merge seed mockups with Lemma backend values
        const mergedMissions = [
          ...SEED_MISSIONS,
          ...m.filter(item => !SEED_MISSIONS.some(sm => sm.id === item.id))
        ];

        const mergedTasks = [
          ...SEED_TASKS,
          ...t.filter(item => !SEED_TASKS.some(st => st.id === item.id)).map(item => ({
            ...item,
            status: item.status as any,
            priority: item.priority as any
          }))
        ] as Task[];

        setMissions(mergedMissions);
        setTasks(mergedTasks);
        if (mergedMissions.length > 0) {
          setSelectedMissionId(mergedMissions[0].id);
        }
      } catch (err) {
        console.error('[TasksView] Failed to load data:', err);
        setMissions(SEED_MISSIONS);
        setTasks(SEED_TASKS);
        setSelectedMissionId(SEED_MISSIONS[0].id);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const selectedMission = missions.find((m) => m.id === selectedMissionId);
  const filteredTasks = selectedMissionId
    ? tasks.filter((t) => t.missionId === selectedMissionId)
    : tasks;

  // Dynamic KPI counts
  const totalCount = tasks.length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const overdueCount = 2; // Mock overdue tasks

  const toggleTaskStatus = (taskId: string) => {
    const updated = tasks.map(t => {
      if (t.id === taskId) {
        const nextStatus = (t.status === 'completed' ? 'todo' : t.status === 'in_progress' ? 'completed' : 'in_progress') as Task['status'];
        return { ...t, status: nextStatus };
      }
      return t;
    });
    setTasks(updated);
  };

  return (
    <div className="p-4 md:p-6 h-[calc(100vh-80px)] flex flex-col font-body bg-[#fbfbfe] overflow-hidden space-y-6">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 pb-1">
        <div>
          <h1 className="text-3xl font-heading font-black text-text-primary flex items-center gap-3 tracking-tight">
            <CheckSquare className="w-8 h-8 text-primary" />
            Execution Tasks
          </h1>
          <p className="text-text-secondary text-xs font-semibold mt-1">
            Manage missions and sub-tasks generated by AI. Stay focused and execute with precision.
          </p>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:w-64 max-w-md">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              placeholder="Search tasks or missions..."
              className="w-full bg-white border border-[#0F172A]/[0.08] rounded-xl py-2 pl-9 pr-3 text-xs outline-none focus:ring-2 focus:ring-primary/20 font-semibold"
            />
          </div>
          <button onClick={() => alert('Filters applied')} className="p-2 border border-gray-200 hover:bg-gray-50 bg-white rounded-xl active:scale-95 transition-all text-text-secondary">
            <Filter className="w-4 h-4" />
          </button>
          <button
            onClick={() => {
              if (selectedMissionId) {
                const newTask: Task = {
                  id: `t-new-${Date.now()}`,
                  missionId: selectedMissionId,
                  title: prompt('Enter task title:') || 'New Task',
                  status: 'todo',
                  priority: 'medium',
                  userId: 'mock-user',
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                };
                setTasks(prev => [...prev, newTask]);
              }
            }}
            className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-xs font-black transition-all shadow-md shrink-0 active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>New Task</span>
          </button>
        </div>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center bg-white border border-gray-150 rounded-[2rem]">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col gap-6 min-h-0 h-full overflow-hidden">
          
          {/* 1. KPI COUNTERS ROW */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
            {[
              { label: 'Total Tasks', value: totalCount, desc: 'Across all missions', color: 'text-primary bg-primary/5', icon: CheckSquare },
              { label: 'In Progress', value: inProgressCount, desc: 'Tasks in progress', color: 'text-indigo-500 bg-indigo-50', icon: Clock },
              { label: 'Completed', value: completedCount, desc: 'Tasks completed', color: 'text-emerald-500 bg-emerald-50', icon: CheckCircle2 },
              { label: 'Overdue', value: overdueCount, desc: 'Need attention', color: 'text-red-500 bg-red-50', icon: AlertTriangle }
            ].map(kpi => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="mc-card p-4 flex items-center gap-4">
                  <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0", kpi.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-2xl font-mono font-black text-text-primary leading-none block">{kpi.value}</span>
                    <span className="text-[10px] font-bold text-text-primary block mt-1 leading-none">{kpi.label}</span>
                    <span className="text-[8px] text-text-secondary block mt-0.5 font-semibold leading-none">{kpi.desc}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. CORE WORKSPACE GRID */}
          <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 h-full overflow-hidden">
            
            {/* COLUMN 1: ACTIVE MISSIONS (lg:col-span-3) */}
            <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-y-auto scrollbar-none pb-4">
              <div className="mc-card p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <h3 className="font-heading font-extrabold text-[10px] uppercase tracking-wider text-text-secondary">Active Missions</h3>
                  <button onClick={() => alert('New mission prompt')} className="text-[10px] font-bold text-primary flex items-center gap-1 hover:underline">
                    <Plus className="w-3 h-3" /> New
                  </button>
                </div>

                <div className="space-y-3">
                  {missions.map(m => {
                    const missionTasks = tasks.filter(t => t.missionId === m.id);
                    const completed = missionTasks.filter(t => t.status === 'completed').length;
                    const pct = missionTasks.length > 0 ? Math.round((completed / missionTasks.length) * 100) : 0;
                    const isSelected = selectedMissionId === m.id;

                    return (
                      <button
                        key={m.id}
                        onClick={() => setSelectedMissionId(m.id)}
                        className={cn(
                          "w-full text-left p-3.5 rounded-2xl border transition-all flex flex-col justify-between items-start gap-2 relative overflow-hidden",
                          isSelected
                            ? "bg-slate-50 border-primary/25 shadow-sm"
                            : "bg-white border-slate-100 hover:bg-gray-50"
                        )}
                      >
                        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                        <div className="w-full">
                          <h4 className="font-heading font-black text-xs text-text-primary truncate w-full">{m.title}</h4>
                          <p className="text-[9px] text-text-secondary font-mono mt-1">Due: {m.targetDate || 'Ongoing'}</p>
                        </div>

                        {/* Progress row */}
                        <div className="w-full flex items-center justify-between gap-3 pt-1">
                          <div className="flex-1 bg-slate-100 h-1 rounded-full overflow-hidden">
                            <div className="h-full bg-primary rounded-full" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="text-[9px] font-mono font-black text-primary shrink-0 leading-none">{pct}%</span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-slate-50 pt-3 text-center">
                  <button onClick={() => alert('All missions mapped.')} className="text-[10px] font-bold text-primary hover:underline">
                    View all missions →
                  </button>
                </div>
              </div>
            </div>

            {/* COLUMN 2: CENTER ACTIVE MISSION DETAILS (lg:col-span-6) */}
            <div className="lg:col-span-6 flex flex-col gap-4 h-full overflow-y-auto scrollbar-none pb-4">
              {selectedMission ? (
                <div className="space-y-4">
                  
                  {/* Active Mission detail banner */}
                  <div className="mc-card p-5 space-y-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="flex items-start gap-3 justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center text-primary shrink-0">
                          <span className="font-mono text-sm font-black">&lt;/&gt;</span>
                        </div>
                        <div>
                          <h2 className="font-heading font-black text-base text-text-primary leading-tight flex items-center gap-2">
                            {selectedMission.title}
                            <button onClick={() => alert('Edit title prompt')} className="text-gray-400 hover:text-text-primary transition-colors"><Edit3 className="w-3.5 h-3.5" /></button>
                          </h2>
                          <p className="text-[10px] font-semibold text-text-secondary mt-0.5">{selectedMission.description}</p>
                        </div>
                      </div>
                    </div>

                    {/* Banner telemetry specs */}
                    <div className="grid grid-cols-4 gap-2 text-center">
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex flex-col items-center justify-center">
                        <span className="text-[7px] text-text-secondary font-bold uppercase">Progress</span>
                        <div className="flex items-center gap-1.5 mt-1">
                          {(() => {
                            const mTasks = tasks.filter(t => t.missionId === selectedMission.id);
                            const done = mTasks.filter(t => t.status === 'completed').length;
                            const pct = mTasks.length > 0 ? Math.round((done / mTasks.length) * 100) : 0;
                            return <MiniRadialGauge value={pct} />;
                          })()}
                        </div>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex flex-col items-center justify-center">
                        <span className="text-[7px] text-text-secondary font-bold uppercase">Target</span>
                        <span className="text-[10px] font-black text-text-primary leading-tight mt-2.5">5 problems/day</span>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex flex-col items-center justify-center">
                        <span className="text-[7px] text-text-secondary font-bold uppercase">Current Topic</span>
                        <span className="text-[10px] font-black text-text-primary leading-tight mt-2.5 truncate w-full" title="Arrays & Strings">Arrays & Strings</span>
                      </div>
                      <div className="bg-gray-50 border border-gray-100 rounded-xl p-2.5 flex flex-col items-center justify-center">
                        <span className="text-[7px] text-text-secondary font-bold uppercase">Due Date</span>
                        <span className="text-[9px] font-black text-text-primary leading-tight mt-2.5 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-text-secondary" />
                          {selectedMission.targetDate || 'N/A'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Tasks List */}
                  <div className="mc-card p-5 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                      <h3 className="font-heading font-black text-xs text-text-primary uppercase tracking-wider">Mission Tasks</h3>
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-1 text-[10px] font-bold text-text-secondary cursor-pointer hover:text-text-primary">
                          <span>Sort by: Priority</span>
                          <ChevronRight className="w-3.5 h-3.5 rotate-90" />
                        </div>
                        <Filter className="w-3.5 h-3.5 text-text-secondary cursor-pointer hover:text-text-primary" />
                      </div>
                    </div>

                    <div className="space-y-3">
                      {filteredTasks.length === 0 ? (
                        <div className="text-center py-10 text-text-secondary text-xs italic">
                          No tasks generated for this mission.
                        </div>
                      ) : (
                        filteredTasks.map(t => {
                          const priorityLabel = t.priority === 'urgent' ? 'High' : t.priority === 'high' ? 'Medium' : 'Low';
                          const isCompleted = t.status === 'completed';
                          const isInProgress = t.status === 'in_progress';

                          return (
                            <div 
                              key={t.id}
                              className={cn(
                                "p-4 bg-white border rounded-2xl transition-all duration-150 flex items-start gap-3.5 relative overflow-hidden group hover:border-slate-300",
                                isCompleted ? "border-slate-100 opacity-60" : "border-slate-150"
                              )}
                            >
                              {isInProgress && <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />}
                              
                              <button 
                                onClick={() => toggleTaskStatus(t.id)}
                                className="mt-0.5 shrink-0 text-gray-300 hover:text-primary transition-colors"
                              >
                                {isCompleted ? (
                                  <CheckCircle2 className="w-5 h-5 text-primary" />
                                ) : isInProgress ? (
                                  <PlayCircle className="w-5 h-5 text-primary animate-pulse" />
                                ) : (
                                  <Circle className="w-5 h-5 text-gray-300" />
                                )}
                              </button>

                              <div className="flex-1 min-w-0">
                                <h4 className={cn("font-bold text-xs text-text-primary leading-tight", isCompleted && "line-through text-text-secondary")}>
                                  {t.title}
                                </h4>
                                {t.description && (
                                  <p className="text-[10px] text-text-secondary mt-1 font-semibold leading-relaxed">
                                    {t.description}
                                  </p>
                                )}
                                
                                {/* Tags */}
                                {(() => {
                                  const tags = TASK_TAGS[t.title] || [];
                                  if (tags.length === 0) return null;
                                  return (
                                    <div className="flex flex-wrap gap-1 mt-2.5">
                                      {tags.map(tag => (
                                        <span key={tag} className="text-[8px] font-black uppercase tracking-wider bg-slate-100 text-text-secondary px-2 py-0.5 rounded-md">
                                          {tag}
                                        </span>
                                      ))}
                                    </div>
                                  );
                                })()}
                              </div>

                              {/* Priority & duration chips */}
                              <div className="flex items-center gap-2.5 shrink-0">
                                <span className={cn(
                                  "text-[8px] font-black uppercase border px-2 py-0.5 rounded-md self-center",
                                  t.priority === 'urgent' ? 'text-red-500 bg-red-50 border-red-200/50' : t.priority === 'high' ? 'text-orange-500 bg-orange-50 border-orange-200/50' : 'text-green-600 bg-green-50 border-green-200/50'
                                )}>
                                  {priorityLabel}
                                </span>
                                {t.estimatedDuration && (
                                  <span className="text-[9px] font-bold font-mono bg-slate-50 border border-slate-200/50 text-text-secondary px-2 py-0.5 rounded-md self-center">
                                    {t.estimatedDuration}m
                                  </span>
                                )}
                                <button className="text-gray-300 hover:text-text-primary p-0.5 transition-colors self-center"><MoreVertical className="w-4 h-4" /></button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <button 
                      onClick={() => {
                        const title = prompt('Enter new task title:');
                        if (title) {
                          setTasks(prev => [...prev, {
                            id: `t-new-${Date.now()}`,
                            missionId: selectedMission.id,
                            title,
                            status: 'todo',
                            priority: 'medium',
                            userId: 'mock-user',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                          }]);
                        }
                      }} 
                      className="w-full border border-dashed border-gray-300 text-text-secondary py-3 rounded-2xl font-bold text-xs hover:border-primary hover:text-primary transition-all flex items-center justify-center gap-1.5"
                    >
                      <Plus className="w-4 h-4" /> Add new task
                    </button>
                  </div>
                  
                </div>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-text-secondary text-sm py-12 bg-white border rounded-3xl">
                  <Target className="w-12 h-12 text-gray-300 mb-2 animate-bounce" />
                  <span>Select a mission to view roadmap details.</span>
                </div>
              )}
            </div>

            {/* COLUMN 3: RIGHT PANEL INSIGHTS (lg:col-span-3) */}
            <div className="lg:col-span-3 flex flex-col gap-4 h-full overflow-y-auto scrollbar-none pb-4">
              
              {/* 1. TODAY'S FOCUS */}
              <div className="mc-card p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                  <div>
                    <h3 className="font-heading font-black text-xs text-text-primary uppercase tracking-wider leading-none">Today's Focus</h3>
                    <span className="text-[9px] text-text-secondary font-mono mt-1.5 block">Stay consistent!</span>
                  </div>
                  {/* Score circle */}
                  <div className="w-9 h-9 rounded-full bg-indigo-50 border border-primary/20 flex items-center justify-center text-[10px] font-mono font-black text-primary shadow-sm" title="2/3 completed">
                    2/3
                  </div>
                </div>

                <div className="space-y-2">
                  {[
                    { title: 'Review Strivers Arrays', dur: '90m', checked: true },
                    { title: 'Complete Sorting Algorithms', dur: '60m', checked: true },
                    { title: 'Solve 15 Sliding Window', dur: '120m', checked: false }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-gray-50/50 border border-slate-100 hover:border-primary/20 rounded-2xl transition-all">
                      <div className="flex items-center gap-2 min-w-0">
                        <div className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 bg-white border border-slate-200">
                          {item.checked && <Check className="w-3 h-3 text-primary stroke-[3px]" />}
                        </div>
                        <span className={cn("text-xs font-semibold truncate", item.checked ? "text-text-secondary line-through" : "text-text-primary")}>{item.title}</span>
                      </div>
                      <span className="shrink-0 text-[8.5px] font-mono font-bold text-text-secondary">{item.dur}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. TASK OVERVIEW */}
              <div className="mc-card p-5 space-y-4">
                <h3 className="font-heading font-black text-xs text-text-primary uppercase tracking-wider border-b border-slate-100 pb-2">Task Overview</h3>
                
                <TaskDonutChart />

                <div className="grid grid-cols-2 gap-2 text-[9px] font-mono font-bold mt-2">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0" />
                    <span className="text-text-primary">High Priority: 4</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0" />
                    <span className="text-text-primary">Medium Priority: 5</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0" />
                    <span className="text-text-primary">Low Priority: 3</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#6366f1] shrink-0" />
                    <span className="text-text-primary">Completed: 3</span>
                  </div>
                </div>
              </div>

              {/* 3. AI INSIGHT */}
              <div className="mc-card p-5">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <Sparkles className="w-4 h-4 text-primary animate-pulse" />
                  <h3 className="font-heading font-black text-xs text-text-primary uppercase tracking-wider">AI Insight</h3>
                </div>
                
                <p className="text-[11px] font-semibold text-text-secondary mt-3 leading-relaxed">
                  You're most productive between <strong className="text-text-primary font-bold">9 AM - 12 PM</strong>.
                </p>

                <WaveChart />

                <button 
                  onClick={() => alert('KAIRO Schedule Optimization Triggered')}
                  className="w-full bg-[#5A5CD8] hover:bg-[#484AB5] text-white py-2.5 rounded-xl font-bold text-xs mt-4 transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  Optimize My Schedule
                </button>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
