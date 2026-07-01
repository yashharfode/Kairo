import { useEffect, useState } from 'react';
import { 
  CheckSquare, CheckCircle2, Target, Plus, Search, Filter, 
  Sparkles, Clock, AlertTriangle, MoreVertical, Check,
  Play, Pause, Edit2, Calendar, Maximize2
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

// --- SEED MISSIONS WITH PREMIUM METADATA ---
const SEED_MISSIONS: (Mission & { daysRemaining: number; riskLevel: string; currentStage: string; priority: string; currentFocus: string; category: string })[] = [
  {
    id: 'm-dsa',
    title: 'DSA Placement Accelerator (Striver A-Z)',
    description: 'Drill core data structures and algorithms to clear top-tier tech interviews.',
    targetDate: 'Jul 30, 2026',
    status: 'active',
    userId: 'mock-user',
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    daysRemaining: 29,
    riskLevel: 'On Track',
    currentStage: 'Arrays & Strings',
    priority: 'High',
    currentFocus: '5 problems/day',
    category: 'PRACTICE & REVIEW'
  },
  {
    id: 'm-mern',
    title: 'CollegeConnect MERN App Deployment',
    description: 'Establish secure deployment pipeline and database clusters.',
    targetDate: 'Jul 15, 2026',
    status: 'active',
    userId: 'mock-user',
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    daysRemaining: 14,
    riskLevel: 'On Track',
    currentStage: 'CORS Configuration',
    priority: 'Medium',
    currentFocus: 'Staging logs',
    category: 'SERVER CONFIG'
  },
  {
    id: 'm-gappy',
    title: 'Gappy AI Hackathon 2026',
    description: 'Deliver KAIRO Chief of Staff dashboard pitch deck and demo videos.',
    targetDate: 'Jul 4, 2026',
    status: 'active',
    userId: 'mock-user',
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    daysRemaining: 3,
    riskLevel: 'At Risk',
    currentStage: 'Demo Video prep',
    priority: 'High',
    currentFocus: 'Live Scenario check',
    category: 'PITCH PREPARATION'
  }
];

// --- SEED TASKS MATCHING SCHEMA ---
const SEED_TASKS: Task[] = [
  {
    id: 't-1',
    missionId: 'm-dsa',
    title: 'Review Striver Arrays: Two Pointers & Sliding Window',
    description: 'Drill medium difficulty sliding window challenges.',
    priority: 'urgent',
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
    priority: 'high',
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
    priority: 'high',
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
    priority: 'medium',
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
    priority: 'low',
    status: 'todo',
    estimatedDuration: 90,
    userId: 'mock-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
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
  {
    id: 't-gappy-1',
    missionId: 'm-gappy',
    title: 'Record KAIRO features walkthrough video',
    description: 'Crisp 2-minute feature highlight screen capture.',
    priority: 'urgent',
    status: 'completed',
    estimatedDuration: 120,
    userId: 'mock-user',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
];

// --- STABLE MOCK ENRICHMENTS FOR EACH TASK ---
const getTaskEnrichments = (title: string, id: string) => {
  const hash = title.charCodeAt(0) + title.charCodeAt(title.length - 1) + id.charCodeAt(id.length - 1);
  
  // Category
  const tags = TASK_TAGS[title] || ['General'];
  const category = tags[0];

  // Mock schedule days mapping
  const days = ['Today', 'Tomorrow', 'Jul 2', 'Jul 3', 'Jul 4'];
  const daySchedule = days[hash % days.length];

  return { category, daySchedule };
};

// --- MINI SVGCIRCLE PROGRESS RING ---
const MiniProgressRing = ({ value }: { value: number }) => {
  const size = 64;
  const strokeWidth = 5;
  const radius = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radius; // ~185.35
  const offset = circ - (value / 100) * circ;

  return (
    <div className="relative flex items-center justify-center shrink-0">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="rgba(90,92,216,0.05)" strokeWidth={strokeWidth} />
        <circle cx={size/2} cy={size/2} r={radius} fill="none"
          stroke="#5A5CD8" strokeWidth={strokeWidth} strokeLinecap="round"
          strokeDasharray={circ} strokeDashoffset={offset}
          className="transition-all duration-700 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[13px] font-mono font-black text-[#111827] leading-none">{value}%</span>
        <span className="text-[8px] text-[#6B7280] font-bold uppercase tracking-wider mt-0.5">Complete</span>
      </div>
    </div>
  );
};

export const TasksView = () => {
  const [missions, setMissions] = useState<(Mission & { daysRemaining: number; riskLevel: string; currentStage: string; priority: string; currentFocus: string; category: string })[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [selectedMissionId, setSelectedMissionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  
  // Timer State
  const [timeLeft, setTimeLeft] = useState(1500); // 25:00
  const [timerRunning, setTimerRunning] = useState(false);

  useEffect(() => {
    let interval: any = null;
    if (timerRunning) {
      interval = setInterval(() => {
        setTimeLeft((time) => (time > 0 ? time - 1 : 0));
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [timerRunning]);

  const toggleTimer = () => setTimerRunning(!timerRunning);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const loadTasks = async () => {
      try {
        const [m, t] = await Promise.all([
          missionService.getMissions(),
          missionService.getTasks(),
        ]);
        
        // Enrich default DB missions with premium metadata
        const mergedMissions = [
          ...SEED_MISSIONS,
          ...m.filter(item => !SEED_MISSIONS.some(sm => sm.id === item.id)).map(item => ({
            ...item,
            daysRemaining: item.targetDate ? Math.max(1, Math.ceil((new Date(item.targetDate).getTime() - new Date().getTime()) / (1000 * 3600 * 24))) : 7,
            riskLevel: 'On Track',
            currentStage: 'Active Execution',
            priority: 'Medium',
            currentFocus: '5 problems/day',
            category: 'GENERAL WORKSPACE'
          }))
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
          const cachedId = localStorage.getItem('selectedMissionId');
          const exists = mergedMissions.some(x => x.id === cachedId);
          setSelectedMissionId(exists && cachedId ? cachedId : mergedMissions[0].id);
        }
      } catch (err) {
        console.error('[TasksView] Failed to load data:', err);
        setMissions(SEED_MISSIONS);
        setTasks(SEED_TASKS);
        const cachedId = localStorage.getItem('selectedMissionId');
        const exists = SEED_MISSIONS.some(x => x.id === cachedId);
        setSelectedMissionId(exists && cachedId ? cachedId : SEED_MISSIONS[0].id);
      } finally {
        setLoading(false);
      }
    };
    loadTasks();
  }, []);

  const selectedMission = missions.find((m) => m.id === selectedMissionId);
  
  // Dynamic search on task titles
  const filteredTasks = tasks.filter((t) => {
    const matchesMission = selectedMissionId ? t.missionId === selectedMissionId : true;
    const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesMission && matchesSearch;
  });

  // Dynamic KPI counts
  const totalCount = tasks.length;
  const inProgressCount = tasks.filter(t => t.status === 'in_progress').length;
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const overdueCount = 2;

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
    <div className="bg-[#FAFAFC] min-h-screen font-body p-5 md:p-6 space-y-5 overflow-y-auto animate-page-reveal">
      
      {/* HEADER SECTION (Medium density height) */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-1">
        <div>
          <h1 className="text-[26px] font-heading font-black text-[#111827] tracking-tight leading-none flex items-center gap-2.5">
            <CheckSquare className="w-7 h-7 text-[#5A5CD8]" />
            Execution Tasks
          </h1>
          <p className="text-[13px] font-semibold text-[#6B7280] mt-1.5">
            Manage your AI-generated workspaces, schedule missions, and track progress with precision.
          </p>
        </div>

        {/* SEARCH & ACTIONS */}
        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* SEARCH BAR */}
          <div className="relative flex-1 sm:w-64 max-w-md">
            <Search className="w-4 h-4 text-[#6B7280]/70 absolute left-3 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks, scopes, or topics..."
              className="w-full bg-[#FFFFFF] border border-[#ECECEC] rounded-xl h-10 pl-9 pr-3.5 text-[13px] font-semibold outline-none focus:ring-2 focus:ring-[#5A5CD8]/15 text-[#111827] placeholder-[#6B7280]/60 transition-all shadow-[0_2px_10px_rgba(0,0,0,0.01)]"
            />
          </div>
          
          <button className="h-10 w-10 border border-[#ECECEC] hover:bg-[#FAFAFC] bg-[#FFFFFF] rounded-xl flex items-center justify-center active:scale-95 transition-all text-[#6B7280] shadow-sm">
            <Filter className="w-4 h-4" />
          </button>
          
          <button
            onClick={() => {
              if (selectedMissionId) {
                const titleInput = prompt('Enter new task description:');
                if (titleInput) {
                  const newTask: Task = {
                    id: `t-new-${Date.now()}`,
                    missionId: selectedMissionId,
                    title: titleInput,
                    status: 'todo',
                    priority: 'medium',
                    userId: 'mock-user',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                  };
                  setTasks(prev => [...prev, newTask]);
                }
              } else {
                alert('Please select a mission first!');
              }
            }}
            className="flex items-center gap-1.5 bg-[#5A5CD8] hover:bg-[#484AB5] text-[#FFFFFF] h-10 px-4 rounded-xl text-[13px] font-extrabold transition-all shadow-sm active:scale-95 shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>Create Task</span>
          </button>
        </div>
      </header>

      {/* LOADING STATE */}
      {loading ? (
        <div className="min-h-[400px] flex items-center justify-center bg-[#FFFFFF] border border-[#ECECEC] rounded-2xl shadow-sm">
          <div className="flex flex-col items-center gap-2">
            <div className="w-8 h-8 border-3 border-[#5A5CD8] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[12px] font-bold text-[#6B7280] tracking-wider uppercase">Loading Workspace...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-5">
          
          {/* 1. EXECUTIVE KPI CARDS GRID (Height ~94px, compact) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { label: 'Total Tasks', value: totalCount, trend: '↑ 3 today', trendStyle: 'text-emerald-600 bg-emerald-50', icon: CheckSquare, iconBg: 'bg-emerald-50 text-emerald-600', sparkD: 'M0 25 Q15 10 30 20 T60 5', sparkColor: 'text-emerald-500' },
              { label: 'In Progress', value: inProgressCount, trend: 'Active now', trendStyle: 'text-blue-600 bg-blue-50', icon: Clock, iconBg: 'bg-blue-50 text-blue-600', sparkD: 'M0 28 Q15 15 30 25 T60 8', sparkColor: 'text-blue-500' },
              { label: 'Completed', value: completedCount, trend: '↑ 2 this week', trendStyle: 'text-emerald-600 bg-emerald-50', icon: CheckCircle2, iconBg: 'bg-emerald-50 text-emerald-600', sparkD: 'M0 20 Q15 28 30 12 T60 5', sparkColor: 'text-emerald-500' },
              { label: 'Overdue', value: overdueCount, trend: '↓ Needs focus', trendStyle: 'text-rose-600 bg-rose-50', icon: AlertTriangle, iconBg: 'bg-rose-50 text-rose-500', sparkD: 'M0 10 Q15 25 30 15 T60 22', sparkColor: 'text-rose-500' }
            ].map(kpi => {
              const Icon = kpi.icon;
              return (
                <div key={kpi.label} className="bg-[#FFFFFF] border border-[#ECECEC] rounded-2xl p-5 flex items-center justify-between shadow-sm hover:shadow-md transition-all duration-300">
                  <div className="flex items-center gap-3">
                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", kpi.iconBg)}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-[26px] font-extrabold font-mono text-[#111827] leading-none">
                          {kpi.value}
                        </span>
                        <span className={cn("text-[10px] font-bold px-1.5 py-0.5 rounded", kpi.trendStyle)}>
                          {kpi.trend}
                        </span>
                      </div>
                      <span className="text-[12px] font-semibold text-[#6B7280] block mt-1">
                        {kpi.label}
                      </span>
                    </div>
                  </div>
                  {/* Mini Sparkline Chart */}
                  <div className="shrink-0 pl-2">
                    <svg className={cn("w-14 h-8", kpi.sparkColor)} viewBox="0 0 60 30">
                      <path d={kpi.sparkD} fill="none" stroke="currentColor" strokeWidth="1.5" />
                    </svg>
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. CORE WORKSPACE GRID */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
            
            {/* COLUMN 1: ACTIVE MISSIONS PANEL (lg:col-span-3) */}
            <div className="lg:col-span-3 space-y-5">
              <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded-2xl p-5 shadow-sm space-y-4">
                
                <div className="flex justify-between items-center border-b border-[#ECECEC] pb-3">
                  <h3 className="text-[15px] font-extrabold text-[#111827]">Active Missions</h3>
                  <button onClick={() => alert('Start new mission prompt')} className="text-[12px] font-bold text-[#5A5CD8] flex items-center gap-0.5 hover:underline">
                    <Plus className="w-3.5 h-3.5" /> New
                  </button>
                </div>

                <div className="space-y-3.5">
                  {missions.map(m => {
                    const missionTasks = tasks.filter(t => t.missionId === m.id);
                    const completed = missionTasks.filter(t => t.status === 'completed').length;
                    const pct = missionTasks.length > 0 ? Math.round((completed / missionTasks.length) * 100) : 0;
                    const isSelected = selectedMissionId === m.id;

                    return (
                      <button
                        key={m.id}
                        onClick={() => {
                          setSelectedMissionId(m.id);
                          localStorage.setItem('selectedMissionId', m.id);
                        }}
                        className={cn(
                          "w-full text-left p-4 rounded-xl border transition-all duration-300 flex flex-col gap-3 relative overflow-hidden group",
                          isSelected
                            ? "bg-slate-50 border-[#5A5CD8] shadow-sm"
                            : "bg-[#FFFFFF] border-[#ECECEC] hover:border-[#5A5CD8]/40 shadow-sm"
                        )}
                      >
                        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#5A5CD8]" />}
                        
                        <div className="w-full flex items-start gap-2.5">
                          <div className={cn("w-7 h-7 rounded-lg flex items-center justify-center text-xs shrink-0", isSelected ? 'bg-[#5A5CD8]/10 text-[#5A5CD8]' : 'bg-[#FAFAFC] text-[#6B7280] border border-[#ECECEC]')}>
                            <span className="font-mono font-bold">&lt;/&gt;</span>
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-[13px] font-bold text-[#111827] group-hover:text-[#5A5CD8] transition-colors leading-tight truncate">
                              {m.title}
                            </h4>
                            <span className="text-[10px] text-[#6B7280] font-semibold mt-1 block">Due: {m.targetDate || 'Ongoing'}</span>
                          </div>
                        </div>

                        {/* Progress row */}
                        <div className="w-full space-y-1.5">
                          <div className="w-full bg-[#ECECEC] h-1.5 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#5A5CD8] rounded-full transition-all duration-700 ease-out" 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                          <div className="flex items-center justify-between text-[11px] font-bold text-[#6B7280]">
                            <span>{m.currentFocus}</span>
                            <span className="text-[#5A5CD8]">{pct}%</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-[#ECECEC] pt-3 text-center">
                  <button onClick={() => alert('Showing all active items')} className="text-[12px] font-bold text-[#5A5CD8] hover:underline">
                    View all missions →
                  </button>
                </div>
              </div>
            </div>

            {/* COLUMN 2: CENTER ACTIVE DETAILS & ROADMAP TASKS (lg:col-span-6) */}
            <div className="lg:col-span-6 space-y-5">
              {selectedMission ? (
                <>
                  {/* HERO MISSION DETAILS BANNER */}
                  <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col sm:flex-row justify-between gap-6 items-start sm:items-center">
                    <div className="absolute top-0 right-0 w-48 h-48 bg-[#5A5CD8]/5 rounded-full blur-2xl pointer-events-none" />
                    
                    <div className="space-y-4 flex-1 min-w-0 z-10">
                      <div>
                        <span className="text-[10px] font-bold bg-[#5A5CD8]/10 text-[#5A5CD8] px-2.5 py-0.5 rounded-md uppercase tracking-wider font-mono">
                          {selectedMission.category}
                        </span>
                        
                        <div className="flex items-center gap-2 mt-2">
                          <h2 className="text-[20px] font-extrabold text-[#111827] tracking-tight leading-tight">
                            {selectedMission.title}
                          </h2>
                          <button className="text-gray-400 hover:text-text-primary p-0.5 rounded-lg hover:bg-slate-50 transition-all"><Edit2 className="w-3.5 h-3.5" /></button>
                        </div>
                        
                        <p className="text-[13px] font-medium text-[#6B7280] leading-relaxed mt-1.5">
                          {selectedMission.description}
                        </p>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-3 gap-3 border-t border-b border-[#ECECEC]/70 py-3 text-[12px]">
                        <div>
                          <span className="text-[#6B7280] font-bold block">Daily Target</span>
                          <span className="font-extrabold text-[#111827] mt-0.5 block">5 problems/day</span>
                        </div>
                        <div>
                          <span className="text-[#6B7280] font-bold block">Target Date</span>
                          <span className="font-extrabold text-[#111827] mt-0.5 block flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-[#6B7280]" />
                            {selectedMission.targetDate || 'N/A'}
                          </span>
                        </div>
                        <div>
                          <span className="text-[#6B7280] font-bold block">Current Stage</span>
                          <span className="font-extrabold text-[#111827] mt-0.5 block">{selectedMission.currentStage}</span>
                        </div>
                      </div>

                      {/* AI recommendation bar */}
                      <div className="bg-[#F4F7FF] border border-[#E1E7F5] rounded-xl p-3.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-[#5A5CD8] text-[12px] font-extrabold">
                          <Sparkles className="w-4 h-4" />
                          <span>AI Recommendation</span>
                        </div>
                        <p className="text-[12px] font-semibold text-[#6B7280] leading-relaxed">
                          Start with Two Pointers & Sliding Window today. Consistency is key! 🔥
                        </p>
                      </div>
                    </div>

                    {/* Progress Circle right side */}
                    <div className="shrink-0 z-10 self-center">
                      {(() => {
                        const mTasks = tasks.filter(t => t.missionId === selectedMission.id);
                        const done = mTasks.filter(t => t.status === 'completed').length;
                        const pct = mTasks.length > 0 ? Math.round((done / mTasks.length) * 100) : 0;
                        return <MiniProgressRing value={pct} />;
                      })()}
                    </div>
                  </div>

                  {/* PREMIUM LINEAR TASK LIST */}
                  <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded-2xl p-5 shadow-sm space-y-4">
                    <div className="flex justify-between items-center border-b border-[#ECECEC] pb-3">
                      <h3 className="text-[15px] font-extrabold text-[#111827]">Mission Tasks</h3>
                      <div className="flex items-center gap-3 text-[12px] font-bold text-[#6B7280]">
                        <span className="cursor-pointer hover:text-[#111827] flex items-center gap-1">
                          Sort by: Priority <span className="text-[8px] rotate-90 inline-block">→</span>
                        </span>
                        <Filter className="w-3.5 h-3.5 cursor-pointer hover:text-[#111827]" />
                      </div>
                    </div>

                    <div className="space-y-2.5">
                      {filteredTasks.length === 0 ? (
                        <div className="text-center py-12 text-[#6B7280] text-[13px] font-medium bg-[#FAFAFC] border border-dashed border-[#ECECEC] rounded-xl">
                          No tasks match your search or filter criteria.
                        </div>
                      ) : (
                        filteredTasks.map(t => {
                          const { category, daySchedule } = getTaskEnrichments(t.title, t.id);
                          const isCompleted = t.status === 'completed';
                          const isInProgress = t.status === 'in_progress';

                          return (
                            <div 
                              key={t.id}
                              className={cn(
                                "p-3.5 bg-[#FFFFFF] border rounded-xl transition-all duration-300 flex items-center justify-between gap-4 group hover:border-[#5A5CD8] shadow-sm relative overflow-hidden",
                                isCompleted ? "border-[#ECECEC] opacity-60 bg-[#FAFAFC]/40" : "border-[#ECECEC]"
                              )}
                            >
                              {isInProgress && <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-[#5A5CD8]" />}
                              
                              <div className="flex items-center gap-3 flex-1 min-w-0">
                                {/* Custom Checkbox */}
                                <button 
                                  onClick={() => toggleTaskStatus(t.id)}
                                  className={cn(
                                    "w-5 h-5 rounded-md border flex items-center justify-center transition-all shrink-0 active:scale-90",
                                    isCompleted 
                                      ? "bg-[#5A5CD8] border-[#5A5CD8] text-white" 
                                      : isInProgress 
                                        ? "border-[#5A5CD8] text-[#5A5CD8]" 
                                        : "border-[#ECECEC] hover:border-[#5A5CD8]"
                                  )}
                                >
                                  {isCompleted && <Check className="w-3 h-3 stroke-[3px]" />}
                                  {isInProgress && <span className="w-1.5 h-1.5 rounded-full bg-[#5A5CD8] animate-ping" />}
                                </button>

                                <div className="min-w-0 flex-1">
                                  <h4 className={cn("text-[13.5px] font-bold text-[#111827] leading-tight truncate", isCompleted && "line-through text-[#6B7280]")}>
                                    {t.title}
                                  </h4>
                                  <span className="text-[10px] font-bold text-[#6B7280] block mt-0.5">
                                    {category}
                                  </span>
                                </div>
                              </div>

                              {/* Right side metadata */}
                              <div className="flex items-center gap-3 shrink-0 text-[12px] font-bold">
                                <span className={cn(
                                  "px-2 py-0.5 rounded text-[10px] uppercase font-mono tracking-wider border",
                                  t.priority === 'urgent' ? 'text-rose-500 bg-rose-50 border-rose-200/50' : 
                                  t.priority === 'high' ? 'text-orange-500 bg-orange-50 border-orange-200/50' : 
                                  t.priority === 'medium' ? 'text-blue-500 bg-blue-50 border-blue-200/50' :
                                  'text-green-600 bg-green-50 border-green-200/50'
                                )}>
                                  {t.priority}
                                </span>
                                
                                {t.estimatedDuration && (
                                  <span className="font-mono text-[#6B7280] flex items-center gap-0.5 shrink-0">
                                    <Clock className="w-3.5 h-3.5 text-[#6B7280]" />
                                    {t.estimatedDuration}m
                                  </span>
                                )}

                                <span className="text-[#6B7280] font-medium shrink-0 min-w-[50px] text-right">
                                  {daySchedule}
                                </span>

                                <button className="text-[#6B7280] hover:text-[#111827] p-1 hover:bg-[#FAFAFC] rounded-lg transition-all"><MoreVertical className="w-3.5 h-3.5" /></button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>

                    <button 
                      onClick={() => {
                        const titleInput = prompt('Enter new task description:');
                        if (titleInput) {
                          setTasks(prev => [...prev, {
                            id: `t-new-${Date.now()}`,
                            missionId: selectedMission.id,
                            title: titleInput,
                            status: 'todo',
                            priority: 'medium',
                            userId: 'mock-user',
                            createdAt: new Date().toISOString(),
                            updatedAt: new Date().toISOString(),
                          }]);
                        }
                      }} 
                      className="w-full border border-dashed border-[#ECECEC] text-[#6B7280] py-3 rounded-xl font-bold text-[13px] hover:border-[#5A5CD8] hover:text-[#5A5CD8] hover:bg-[#5A5CD8]/5 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-4 h-4" /> Add new task
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-[#6B7280] py-16 bg-[#FFFFFF] border border-[#ECECEC] rounded-2xl shadow-sm space-y-3">
                  <Target className="w-12 h-12 text-[#ECECEC] animate-pulse" />
                  <span className="text-[14px] font-bold">Select a mission to begin roadmapping</span>
                </div>
              )}
            </div>

            {/* COLUMN 3: RIGHT PANEL INSIGHTS (lg:col-span-3) */}
            <div className="lg:col-span-3 space-y-5">
              
              {/* 1. TODAY'S FOCUS & TIMER */}
              <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#ECECEC] pb-3">
                  <div>
                    <h3 className="text-[14px] font-extrabold text-[#111827]">Today's Focus</h3>
                  </div>
                  {/* Score pill */}
                  <span className="bg-[#5A5CD8]/10 text-[#5A5CD8] text-[11px] font-mono font-bold px-2 py-0.5 rounded-full border border-[#5A5CD8]/15">
                    2 / 3 Done
                  </span>
                </div>

                <div className="space-y-2">
                  {[
                    { title: 'Review Striver Arrays', dur: '90m', checked: true },
                    { title: 'Complete Sorting Algorithms', dur: '60m', checked: true },
                    { title: 'Solve 15 Sliding Window', dur: '120m', checked: false }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 bg-[#FAFAFC]/60 border border-[#ECECEC] hover:border-[#5A5CD8]/30 rounded-xl transition-all">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={cn(
                          "w-4 h-4 rounded flex items-center justify-center shrink-0 border transition-all",
                          item.checked ? "bg-[#5A5CD8] border-[#5A5CD8] text-white" : "bg-white border-[#ECECEC]"
                        )}>
                          {item.checked && <Check className="w-3 h-3 stroke-[3px]" />}
                        </div>
                        <span className={cn("text-[12px] font-bold truncate", item.checked ? "text-[#6B7280] line-through font-medium" : "text-[#111827]")}>{item.title}</span>
                      </div>
                      <span className="shrink-0 text-[11px] font-bold font-mono text-[#6B7280]">{item.dur}</span>
                    </div>
                  ))}
                </div>

                <div className="text-center pt-1 border-t border-[#ECECEC]/60">
                  <button onClick={() => alert('View full plan detail')} className="text-[12px] font-bold text-[#5A5CD8] hover:underline">
                    View full plan →
                  </button>
                </div>
              </div>

              {/* 2. FOCUS TIMER */}
              <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-[#ECECEC] pb-3">
                  <h3 className="text-[14px] font-extrabold text-[#111827]">Focus Timer</h3>
                  <button onClick={() => alert('Expand timer')} className="text-gray-400 hover:text-text-primary p-0.5"><Maximize2 className="w-3.5 h-3.5" /></button>
                </div>

                <div className="bg-[#FAFAFC] border border-[#ECECEC] rounded-xl p-4 flex flex-col items-center justify-center space-y-3 text-center">
                  <div className="text-[36px] font-extrabold font-mono text-[#111827] leading-none tracking-tight">
                    {formatTime(timeLeft)}
                  </div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#6B7280]">Deep work session</span>
                  
                  <button 
                    onClick={toggleTimer} 
                    className="w-full bg-[#5A5CD8] hover:bg-[#484AB5] text-white flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl text-[13px] font-bold shadow-sm active:scale-95 transition-all"
                  >
                    {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
                    <span>{timerRunning ? 'Pause Focus Session' : 'Start Focus Session'}</span>
                  </button>
                </div>
              </div>

              {/* 3. PRODUCTIVITY INSIGHTS */}
              <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded-2xl p-5 shadow-sm space-y-4">
                <div className="flex items-center gap-2 border-b border-[#ECECEC] pb-3">
                  <Sparkles className="w-4 h-4 text-[#5A5CD8] animate-pulse" />
                  <h3 className="text-[14px] font-extrabold text-[#111827]">AI Insights</h3>
                </div>
                
                <div className="space-y-3.5">
                  <p className="text-[13px] font-medium text-[#6B7280] leading-relaxed">
                    You are most productive <strong className="text-[#111827]">between 9 AM - 12 PM</strong>
                  </p>

                  {/* Curved insights wave chart */}
                  <div className="relative w-full h-16 pt-2">
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
                    <span className="absolute top-1 left-[70px] text-[8px] font-mono font-bold text-white bg-slate-900 border border-white/10 px-1 rounded shadow-md">
                      9 AM - 12 PM
                    </span>
                  </div>

                  <button 
                    onClick={() => alert('KAIRO Schedule Optimization Triggered')}
                    className="w-full bg-[#FAFAFC] hover:bg-[#F1F3F7] text-[#6B7280] border border-[#ECECEC] py-2.5 rounded-xl font-bold text-[12px] transition-all active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#5A5CD8]" />
                    <span>Optimize My Schedule</span>
                  </button>
                </div>
              </div>

            </div>

          </div>

        </div>
      )}

    </div>
  );
};
