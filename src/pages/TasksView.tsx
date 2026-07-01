import { useEffect, useState } from 'react';
import { 
  CheckSquare, CheckCircle2, Target, Plus, Search, Filter, 
  Sparkles, Clock, AlertTriangle, MoreVertical, Check,
  Zap, Play, Pause, RefreshCw, BarChart2
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
const SEED_MISSIONS: (Mission & { daysRemaining: number; riskLevel: string; currentStage: string; priority: string; currentFocus: string })[] = [
  {
    id: 'm-dsa',
    title: 'DSA Placement Accelerator (Striver A-Z)',
    description: 'Drill core data structures and algorithms to clear top-tier tech technical interviews.',
    targetDate: 'Jul 30, 2026',
    status: 'active',
    userId: 'mock-user',
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    daysRemaining: 29,
    riskLevel: 'On Track',
    currentStage: 'Practice & Review',
    priority: 'High',
    currentFocus: 'Arrays & Strings DFS'
  },
  {
    id: 'm-mern',
    title: 'CollegeConnect MERN App Deployment',
    description: 'Establish secure deployment pipeline and orchestrate multi-instance database clusters.',
    targetDate: 'Jul 15, 2026',
    status: 'active',
    userId: 'mock-user',
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    daysRemaining: 14,
    riskLevel: 'On Track',
    currentStage: 'Server Config',
    priority: 'Medium',
    currentFocus: 'CORS & Staging Logs'
  },
  {
    id: 'm-gappy',
    title: 'Gappy AI Hackathon 2026',
    description: 'Deliver KAIRO Chief of Staff dashboard pitch deck, demo videos, and live dev portal.',
    targetDate: 'Jul 4, 2026',
    status: 'active',
    userId: 'mock-user',
    startDate: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    daysRemaining: 3,
    riskLevel: 'At Risk',
    currentStage: 'Pitch Preparation',
    priority: 'High',
    currentFocus: 'Live Demo Scenarios'
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
  
  // AI Confidence: 88% to 99%
  const aiConfidence = 88 + (hash % 12);
  
  // Difficulty
  const difficulties = ['Easy', 'Medium', 'Hard'];
  const difficulty = difficulties[hash % difficulties.length];
  
  // Category
  const tags = TASK_TAGS[title] || ['Engineering'];
  const category = tags[0];

  return { aiConfidence, difficulty, category };
};

// --- MULTI-SEGMENT DONUT CHART ---
const TaskDonutChart = ({ total, high, med, low }: { total: number; high: number; med: number; low: number }) => {
  const size = 130;
  const radius = 42;
  const circ = 2 * Math.PI * radius; // ~263.89
  const strokeWidth = 10;

  const highPct = total > 0 ? (high / total) * 100 : 0;
  const medPct = total > 0 ? (med / total) * 100 : 0;
  const lowPct = total > 0 ? (low / total) * 100 : 0;

  const strokeHigh = (highPct / 100) * circ;
  const strokeMed = (medPct / 100) * circ;
  const strokeLow = (lowPct / 100) * circ;

  return (
    <div className="relative flex items-center justify-center w-full my-4">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#F1F1F4" strokeWidth={strokeWidth} />
        
        {/* Urgent/High Segment */}
        {strokeHigh > 0 && (
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#EF4444" strokeWidth={strokeWidth}
            strokeDasharray={`${strokeHigh} ${circ}`} strokeDashoffset={0}
          />
        )}
        
        {/* Medium Segment */}
        {strokeMed > 0 && (
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#F59E0B" strokeWidth={strokeWidth}
            strokeDasharray={`${strokeMed} ${circ}`} strokeDashoffset={-strokeHigh}
          />
        )}

        {/* Low Segment */}
        {strokeLow > 0 && (
          <circle cx={size/2} cy={size/2} r={radius} fill="none" stroke="#10B981" strokeWidth={strokeWidth}
            strokeDasharray={`${strokeLow} ${circ}`} strokeDashoffset={-(strokeHigh + strokeMed)}
          />
        )}
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="text-[32px] font-mono font-black text-[#111827] leading-none">{total}</span>
        <span className="text-[11px] text-[#6B7280] font-bold uppercase tracking-wider mt-1">Total</span>
      </div>
    </div>
  );
};

const ProgressRing = ({ value }: { value: number }) => {
  const size = 120;
  const strokeWidth = 10;
  const radius = (size - strokeWidth) / 2;
  const circ = 2 * Math.PI * radius;
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
        <span className="text-[28px] font-mono font-black text-[#111827] leading-none">{value}%</span>
        <span className="text-[10px] text-[#6B7280] font-bold uppercase tracking-wider mt-1">Done</span>
      </div>
    </div>
  );
};

export const TasksView = () => {
  const [missions, setMissions] = useState<(Mission & { daysRemaining: number; riskLevel: string; currentStage: string; priority: string; currentFocus: string })[]>([]);
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
  const resetTimer = () => {
    setTimerRunning(false);
    setTimeLeft(1500);
  };

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
            currentFocus: 'Core Deliverables'
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

  // High / Med / Low splits for Donut
  const highPriorityTasks = tasks.filter(t => t.priority === 'high' || t.priority === 'urgent').length;
  const medPriorityTasks = tasks.filter(t => t.priority === 'medium').length;
  const lowPriorityTasks = tasks.filter(t => t.priority === 'low').length;

  return (
    <div className="bg-[#FAFAFC] min-h-screen font-body p-8 md:p-10 space-y-8 md:space-y-10 overflow-y-auto">
      
      {/* HEADER SECTION */}
      <header className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-6 pb-2">
        <div>
          <h1 className="text-[44px] font-extrabold tracking-tight text-[#111827] leading-none flex items-center gap-3.5">
            <CheckSquare className="w-10 h-10 text-[#5A5CD8]" />
            Execution Tasks
          </h1>
          <p className="text-[15px] font-medium text-[#6B7280] mt-3">
            Manage your AI-generated workspaces, schedule missions, and track granular roadmap progress.
          </p>
        </div>

        {/* SEARCH & ACTIONS */}
        <div className="flex flex-wrap items-center gap-4 w-full xl:w-auto">
          {/* SEARCH BAR (Redesigned) */}
          <div className="relative flex-1 md:w-80 min-w-[240px] max-w-lg">
            <Search className="w-5 h-5 text-[#6B7280] absolute left-4.5 top-1/2 -translate-y-1/2" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search tasks, scopes, or topics..."
              className="w-full bg-[#FFFFFF] border border-[#ECECEC] rounded-[20px] h-14 pl-12.5 pr-5 text-[15px] font-medium outline-none focus:ring-2 focus:ring-[#5A5CD8]/20 text-[#111827] placeholder-[#6B7280]/60 transition-all shadow-[0_4px_20px_rgba(0,0,0,0.01)]"
            />
          </div>
          
          <button className="h-14 w-14 border border-[#ECECEC] hover:bg-[#FAFAFC] bg-[#FFFFFF] rounded-[20px] flex items-center justify-center active:scale-95 transition-all text-[#6B7280] shadow-[0_4px_20px_rgba(0,0,0,0.01)]">
            <Filter className="w-5 h-5" />
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
            className="flex items-center gap-2 bg-[#5A5CD8] hover:bg-[#484AB5] text-[#FFFFFF] h-14 px-6 rounded-[20px] text-[15px] font-extrabold transition-all shadow-[0_8px_30px_rgba(90,92,216,0.2)] active:scale-95 shrink-0"
          >
            <Plus className="w-5 h-5" />
            <span>Create Task</span>
          </button>
        </div>
      </header>

      {/* LOADING STATE */}
      {loading ? (
        <div className="min-h-[500px] flex items-center justify-center bg-[#FFFFFF] border border-[#ECECEC] rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.01)]">
          <div className="flex flex-col items-center gap-3">
            <div className="w-10 h-10 border-4 border-[#5A5CD8] border-t-transparent rounded-full animate-spin"></div>
            <span className="text-[14px] font-bold text-[#6B7280] tracking-wider uppercase">Loading Workspace...</span>
          </div>
        </div>
      ) : (
        <div className="space-y-8 md:space-y-10">
          
          {/* 1. EXECUTIVE KPI SECTION */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { label: 'Total Tasks', value: totalCount, trend: '+3 today', trendType: 'up', icon: CheckSquare, bg: 'from-[#5A5CD8]/5 to-transparent' },
              { label: 'In Progress', value: inProgressCount, trend: 'Active now', trendType: 'neutral', icon: Clock, bg: 'from-blue-500/5 to-transparent' },
              { label: 'Completed', value: completedCount, trend: '+2 this week', trendType: 'up', icon: CheckCircle2, bg: 'from-emerald-500/5 to-transparent' },
              { label: 'Overdue Limit', value: overdueCount, trend: 'Needs focus', trendType: 'down', icon: AlertTriangle, bg: 'from-rose-500/5 to-transparent' }
            ].map(kpi => {
              const Icon = kpi.icon;
              return (
                <div 
                  key={kpi.label} 
                  className={cn(
                    "bg-[#FFFFFF] border border-[#ECECEC] rounded-[20px] p-8 flex items-center justify-between shadow-[0_8px_30px_rgb(0,0,0,0.015)] bg-gradient-to-br hover:shadow-[0_12px_40px_rgba(0,0,0,0.03)] transition-all duration-300", 
                    kpi.bg
                  )}
                >
                  <div className="space-y-2">
                    <span className="text-[44px] font-extrabold font-mono text-[#111827] leading-none block">
                      {kpi.value}
                    </span>
                    <span className="text-[14px] font-semibold text-[#6B7280] block">
                      {kpi.label}
                    </span>
                    <span className={cn(
                      "text-[12px] font-bold inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full",
                      kpi.trendType === 'up' ? 'text-emerald-600 bg-emerald-50' : 
                      kpi.trendType === 'down' ? 'text-rose-600 bg-rose-50' : 
                      'text-blue-600 bg-blue-50'
                    )}>
                      {kpi.trendType === 'up' && '↑'}
                      {kpi.trendType === 'down' && '↓'}
                      {kpi.trend}
                    </span>
                  </div>
                  <div className="w-14 h-14 rounded-2xl bg-[#FFFFFF] border border-[#ECECEC] flex items-center justify-center shrink-0 shadow-sm text-[#5A5CD8]">
                    <Icon className="w-6 h-6" />
                  </div>
                </div>
              );
            })}
          </div>

          {/* 2. CORE WORKSPACE GRID */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-start">
            
            {/* COLUMN 1: ACTIVE MISSIONS PANEL (xl:col-span-3) */}
            <div className="xl:col-span-3 space-y-6">
              <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded-[20px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6">
                
                <div className="flex justify-between items-center border-b border-[#ECECEC] pb-4">
                  <h3 className="text-[18px] font-bold text-[#111827]">Active Missions</h3>
                  <button onClick={() => alert('Start new mission prompt')} className="text-[14px] font-bold text-[#5A5CD8] flex items-center gap-1 hover:underline">
                    <Plus className="w-4 h-4" /> New
                  </button>
                </div>

                <div className="space-y-4">
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
                          "w-full text-left p-6 rounded-[20px] border transition-all duration-300 flex flex-col gap-4 relative overflow-hidden group hover:scale-[1.01]",
                          isSelected
                            ? "bg-gradient-to-br from-[#5A5CD8]/[0.02] to-transparent border-[#5A5CD8] shadow-[0_8px_30px_rgba(90,92,216,0.05)]"
                            : "bg-[#FFFFFF] border-[#ECECEC] hover:border-[#5A5CD8]/40 shadow-sm"
                        )}
                      >
                        {isSelected && <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#5A5CD8]" />}
                        
                        <div className="w-full flex justify-between items-start gap-2">
                          <h4 className="text-[16px] font-bold text-[#111827] group-hover:text-[#5A5CD8] transition-colors leading-tight truncate">
                            {m.title}
                          </h4>
                        </div>

                        {/* Focus area metadata */}
                        <div className="text-[13px] text-[#6B7280] font-medium leading-relaxed">
                          🎯 <span className="font-bold text-[#111827]">Focus:</span> {m.currentFocus}
                        </div>

                        {/* Progress row */}
                        <div className="w-full space-y-2">
                          <div className="flex items-center justify-between text-[13px] font-bold">
                            <span className="text-[#6B7280]">{pct}% Completed</span>
                            <span className="text-[#5A5CD8]">{completed}/{missionTasks.length} Tasks</span>
                          </div>
                          <div className="w-full bg-[#ECECEC] h-2 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-[#5A5CD8] rounded-full transition-all duration-700 ease-out" 
                              style={{ width: `${pct}%` }} 
                            />
                          </div>
                        </div>

                        {/* Footer Chips */}
                        <div className="w-full flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-[#ECECEC]/60">
                          <span className={cn(
                            "text-[12px] font-bold px-2.5 py-0.5 rounded-full border",
                            m.riskLevel === 'On Track' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 'text-rose-600 bg-rose-50 border-rose-100'
                          )}>
                            {m.riskLevel}
                          </span>
                          <span className="text-[12px] font-medium text-[#6B7280] font-mono">
                            ⏳ {m.daysRemaining}d left
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>

                <div className="border-t border-[#ECECEC] pt-4 text-center">
                  <button onClick={() => alert('Showing all active items')} className="text-[14px] font-bold text-[#5A5CD8] hover:underline">
                    View all missions & milestones →
                  </button>
                </div>
              </div>
            </div>

            {/* COLUMN 2: CENTER ACTIVE DETAILS & LINEAR TASKS (xl:col-span-6) */}
            <div className="xl:col-span-6 space-y-8">
              {selectedMission ? (
                <>
                  {/* HERO MISSION DETAILS SECTION */}
                  <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded-[20px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] relative overflow-hidden flex flex-col md:flex-row justify-between gap-8 items-start md:items-center">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#5A5CD8]/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="space-y-5 flex-1 min-w-0 z-10">
                      <div>
                        <span className="text-[12px] font-bold bg-[#5A5CD8]/10 text-[#5A5CD8] px-3.5 py-1 rounded-full uppercase tracking-wider font-mono">
                          {selectedMission.currentStage}
                        </span>
                        <h2 className="text-[30px] font-extrabold text-[#111827] tracking-tight leading-tight mt-3">
                          {selectedMission.title}
                        </h2>
                        <p className="text-[15px] font-medium text-[#6B7280] leading-relaxed mt-2.5">
                          {selectedMission.description}
                        </p>
                      </div>

                      {/* Info grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 pt-1">
                        <div>
                          <span className="text-[13px] font-bold text-[#6B7280] block">Daily Target</span>
                          <span className="text-[15px] font-extrabold text-[#111827] mt-1 block">5 problems / day</span>
                        </div>
                        <div>
                          <span className="text-[13px] font-bold text-[#6B7280] block">Target Date</span>
                          <span className="text-[15px] font-extrabold text-[#111827] mt-1 block">{selectedMission.targetDate || 'N/A'}</span>
                        </div>
                        <div>
                          <span className="text-[13px] font-bold text-[#6B7280] block">Current Stage</span>
                          <span className="text-[15px] font-extrabold text-[#111827] mt-1 block">{selectedMission.priority} Priority</span>
                        </div>
                      </div>

                      {/* AI recommendations */}
                      <div className="bg-[#FAFAFC] border border-[#ECECEC] rounded-2xl p-5 space-y-2">
                        <div className="flex items-center gap-2 text-[#5A5CD8] text-[14px] font-bold">
                          <Sparkles className="w-4.5 h-4.5 animate-pulse" />
                          <span>AI Recommendation & Goal</span>
                        </div>
                        <p className="text-[13.5px] font-semibold text-[#6B7280] leading-relaxed">
                          "Maintain consistency. Complete the sliding window drills today to optimize your focus streak before reviewing binary search."
                        </p>
                      </div>
                    </div>

                    {/* Progress Circle right side */}
                    <div className="shrink-0 z-10 self-center">
                      {(() => {
                        const mTasks = tasks.filter(t => t.missionId === selectedMission.id);
                        const done = mTasks.filter(t => t.status === 'completed').length;
                        const pct = mTasks.length > 0 ? Math.round((done / mTasks.length) * 100) : 0;
                        return <ProgressRing value={pct} />;
                      })()}
                    </div>
                  </div>

                  {/* PREMIUM LINEAR TASK LIST */}
                  <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded-[20px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6">
                    <div className="flex justify-between items-center border-b border-[#ECECEC] pb-4">
                      <h3 className="text-[18px] font-bold text-[#111827]">Roadmap Tasks</h3>
                      <span className="text-[13px] font-bold text-[#6B7280] bg-[#FAFAFC] px-3 py-1 rounded-lg border border-[#ECECEC]">
                        Showing {filteredTasks.length} Tasks
                      </span>
                    </div>

                    <div className="space-y-4">
                      {filteredTasks.length === 0 ? (
                        <div className="text-center py-16 text-[#6B7280] text-[15px] font-medium bg-[#FAFAFC] border border-dashed border-[#ECECEC] rounded-2xl">
                          No tasks match your search or filter criteria.
                        </div>
                      ) : (
                        filteredTasks.map(t => {
                          const { aiConfidence, difficulty, category } = getTaskEnrichments(t.title, t.id);
                          const isCompleted = t.status === 'completed';
                          const isInProgress = t.status === 'in_progress';

                          return (
                            <div 
                              key={t.id}
                              className={cn(
                                "min-h-[88px] p-6 bg-[#FFFFFF] border rounded-[20px] transition-all duration-300 flex flex-col md:flex-row md:items-center justify-between gap-4 group hover:border-[#5A5CD8] hover:shadow-[0_8px_30px_rgba(90,92,216,0.03)] relative overflow-hidden",
                                isCompleted ? "border-[#ECECEC] opacity-60 bg-[#FAFAFC]/40" : "border-[#ECECEC]"
                              )}
                            >
                              {isInProgress && <div className="absolute left-0 top-0 bottom-0 w-[4px] bg-[#5A5CD8]" />}
                              
                              <div className="flex items-start gap-4 flex-1 min-w-0">
                                {/* Custom Checkbox */}
                                <button 
                                  onClick={() => toggleTaskStatus(t.id)}
                                  className={cn(
                                    "mt-1 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all shrink-0 active:scale-90",
                                    isCompleted 
                                      ? "bg-[#5A5CD8] border-[#5A5CD8] text-white" 
                                      : isInProgress 
                                        ? "border-[#5A5CD8] text-[#5A5CD8]" 
                                        : "border-[#ECECEC] hover:border-[#5A5CD8]"
                                  )}
                                >
                                  {isCompleted && <Check className="w-4 h-4 stroke-[3px]" />}
                                  {isInProgress && <span className="w-2.5 h-2.5 rounded-full bg-[#5A5CD8] animate-ping" />}
                                </button>

                                <div className="space-y-1 flex-1 min-w-0">
                                  <h4 className={cn("text-[16px] font-bold text-[#111827] leading-snug group-hover:text-[#5A5CD8] transition-colors truncate", isCompleted && "line-through text-[#6B7280]")}>
                                    {t.title}
                                  </h4>
                                  {t.description && (
                                    <p className="text-[14px] font-medium text-[#6B7280] leading-relaxed max-w-xl">
                                      {t.description}
                                    </p>
                                  )}
                                  
                                  {/* Badges / Meta tags row */}
                                  <div className="flex flex-wrap items-center gap-2 pt-1 text-[12px] font-bold">
                                    <span className="bg-[#FAFAFC] border border-[#ECECEC] text-[#6B7280] px-2.5 py-0.5 rounded-lg">
                                      {category}
                                    </span>
                                    <span className="text-[#5A5CD8] bg-[#5A5CD8]/10 px-2 py-0.5 rounded-lg font-mono">
                                      🧠 {aiConfidence}% Match
                                    </span>
                                    <span className={cn(
                                      "px-2 py-0.5 rounded-lg border font-mono",
                                      difficulty === 'Easy' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' :
                                      difficulty === 'Hard' ? 'text-rose-600 bg-rose-50 border-rose-100' :
                                      'text-amber-600 bg-amber-50 border-amber-100'
                                    )}>
                                      {difficulty}
                                    </span>
                                  </div>
                                </div>
                              </div>

                              {/* Right side metadata */}
                              <div className="flex items-center justify-between md:justify-end gap-3.5 border-t border-[#ECECEC] pt-3 md:pt-0 md:border-t-0 shrink-0">
                                <span className={cn(
                                  "text-[12px] font-bold uppercase tracking-wider px-3 py-1 rounded-full border",
                                  t.priority === 'urgent' ? 'text-rose-500 bg-rose-50 border-rose-200/50' : 
                                  t.priority === 'high' ? 'text-orange-500 bg-orange-50 border-orange-200/50' : 
                                  t.priority === 'medium' ? 'text-blue-500 bg-blue-50 border-blue-200/50' :
                                  'text-green-600 bg-green-50 border-green-200/50'
                                )}>
                                  {t.priority}
                                </span>
                                
                                {t.estimatedDuration && (
                                  <span className="text-[13px] font-extrabold font-mono text-[#6B7280] flex items-center gap-1">
                                    <Clock className="w-4 h-4 text-[#6B7280]" />
                                    {t.estimatedDuration}m
                                  </span>
                                )}

                                <button className="text-[#6B7280] hover:text-[#111827] p-1.5 hover:bg-[#FAFAFC] rounded-lg transition-all"><MoreVertical className="w-4 h-4" /></button>
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
                      className="w-full border-2 border-dashed border-[#ECECEC] text-[#6B7280] py-5 rounded-[20px] font-bold text-[15px] hover:border-[#5A5CD8] hover:text-[#5A5CD8] hover:bg-[#5A5CD8]/5 transition-all flex items-center justify-center gap-1.5 shadow-sm"
                    >
                      <Plus className="w-5 h-5" /> Add Task Blueprint
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-[#6B7280] py-20 bg-[#FFFFFF] border border-[#ECECEC] rounded-[20px] shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-4">
                  <Target className="w-16 h-16 text-[#ECECEC] animate-pulse" />
                  <span className="text-[16px] font-bold">Select a mission to begin roadmapping</span>
                </div>
              )}
            </div>

            {/* COLUMN 3: RIGHT PANEL INSIGHTS (xl:col-span-3) */}
            <div className="xl:col-span-3 space-y-8">
              
              {/* 1. TODAY'S FOCUS & TIMER */}
              <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded-[20px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6">
                <div className="flex justify-between items-center border-b border-[#ECECEC] pb-4">
                  <div>
                    <h3 className="text-[16px] font-bold text-[#111827]">Today's Focus</h3>
                    <span className="text-[13px] text-[#6B7280] font-medium mt-1 block">Deep work accelerator</span>
                  </div>
                  {/* Score pill */}
                  <span className="bg-[#5A5CD8]/10 text-[#5A5CD8] text-[13px] font-mono font-bold px-3 py-1 rounded-full border border-[#5A5CD8]/20">
                    2 / 3 Done
                  </span>
                </div>

                {/* Focus Timer */}
                <div className="bg-[#FAFAFC] border border-[#ECECEC] rounded-2xl p-6 flex flex-col items-center justify-center space-y-4 text-center">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-[#6B7280]">Focus Timer</span>
                  <div className="text-[44px] font-extrabold font-mono text-[#111827] leading-none tracking-tight">
                    {formatTime(timeLeft)}
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <button 
                      onClick={toggleTimer} 
                      className="w-10 h-10 rounded-xl bg-[#5A5CD8] hover:bg-[#484AB5] text-white flex items-center justify-center shadow-md active:scale-90 transition-all"
                    >
                      {timerRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-white translate-x-0.5" />}
                    </button>
                    <button 
                      onClick={resetTimer} 
                      className="w-10 h-10 rounded-xl bg-white border border-[#ECECEC] text-[#6B7280] hover:text-[#111827] flex items-center justify-center active:scale-90 transition-all"
                    >
                      <RefreshCw className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="space-y-3">
                  {[
                    { title: 'Review Strivers Arrays', dur: '90m', checked: true },
                    { title: 'Complete Sorting Algorithms', dur: '60m', checked: true },
                    { title: 'Solve 15 Sliding Window', dur: '120m', checked: false }
                  ].map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-[#FAFAFC]/60 border border-[#ECECEC] hover:border-[#5A5CD8]/30 rounded-xl transition-all">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className={cn(
                          "w-5 h-5 rounded-md flex items-center justify-center shrink-0 border transition-all",
                          item.checked ? "bg-[#5A5CD8] border-[#5A5CD8] text-white" : "bg-white border-[#ECECEC]"
                        )}>
                          {item.checked && <Check className="w-3.5 h-3.5 stroke-[3px]" />}
                        </div>
                        <span className={cn("text-[14px] font-bold truncate", item.checked ? "text-[#6B7280] line-through font-medium" : "text-[#111827]")}>{item.title}</span>
                      </div>
                      <span className="shrink-0 text-[13px] font-bold font-mono text-[#6B7280]">{item.dur}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* 2. TASK OVERVIEW DONUT */}
              <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded-[20px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-6">
                <h3 className="text-[16px] font-bold text-[#111827] border-b border-[#ECECEC] pb-4">Task Overview</h3>
                
                <TaskDonutChart total={totalCount} high={highPriorityTasks} med={medPriorityTasks} low={lowPriorityTasks} />

                <div className="space-y-3 pt-2 text-[14px] font-medium text-[#6B7280]">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#EF4444] shrink-0" />
                      <span>High / Urgent</span>
                    </div>
                    <span className="font-bold text-[#111827]">{highPriorityTasks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#F59E0B] shrink-0" />
                      <span>Medium Priority</span>
                    </div>
                    <span className="font-bold text-[#111827]">{medPriorityTasks}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full bg-[#10B981] shrink-0" />
                      <span>Low Priority</span>
                    </div>
                    <span className="font-bold text-[#111827]">{lowPriorityTasks}</span>
                  </div>
                </div>
              </div>

              {/* 3. PRODUCTIVITY INSIGHTS */}
              <div className="bg-[#FFFFFF] border border-[#ECECEC] rounded-[20px] p-8 shadow-[0_8px_30px_rgb(0,0,0,0.015)] space-y-5">
                <div className="flex items-center gap-2 border-b border-[#ECECEC] pb-4">
                  <Sparkles className="w-5 h-5 text-[#5A5CD8] animate-pulse" />
                  <h3 className="text-[16px] font-bold text-[#111827]">AI Productivity Insights</h3>
                </div>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center bg-[#FAFAFC] p-4 rounded-xl border border-[#ECECEC]">
                    <div>
                      <span className="text-[13px] font-bold text-[#6B7280] block">Deep Work Time</span>
                      <span className="text-[18px] font-extrabold text-[#111827] mt-0.5 block">3.5 hrs / day</span>
                    </div>
                    <Zap className="w-6 h-6 text-amber-500 fill-amber-100" />
                  </div>

                  <p className="text-[14px] font-medium text-[#6B7280] leading-relaxed">
                    🚀 Your cognitive energy peaks between <strong className="text-[#111827]">9 AM - 12 PM</strong>. Focus on complex algorithms then to maximize efficiency.
                  </p>

                  <button 
                    onClick={() => alert('Productivity metrics analyzed.')}
                    className="w-full bg-[#5A5CD8] hover:bg-[#484AB5] text-[#FFFFFF] py-3.5 rounded-xl font-bold text-[14px] transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <BarChart2 className="w-4 h-4" />
                    <span>Optimize Workspace Schedule</span>
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
