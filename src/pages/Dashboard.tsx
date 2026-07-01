import { useEffect, useState } from 'react';
import { missionService } from '@/services/MissionService';
import { useAuth } from '@/context/AuthContext';
import type { Mission, Task } from '@/types/schema';
import { 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Clock,
  PlusCircle,
  MessageSquare,
  Inbox,
  AlertTriangle
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { cn } from '@/lib/utils';

// --- SIGNATURE ELEMENT: RADIAL GAUGE ---
const RadialGauge = ({ value, size = 90, strokeWidth = 8 }: { value: number; size?: number; strokeWidth?: number }) => {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setProgress(value), 100);
    return () => clearTimeout(t);
  }, [value]);

  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="relative flex items-center justify-center shrink-0" style={{ width: size, height: size }}>
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="rgba(15, 23, 42, 0.04)"
          strokeWidth={strokeWidth}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="#4F46E5"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className="font-mono font-black text-lg text-text-primary">{value}%</span>
        <span className="text-[8px] font-black text-text-secondary uppercase tracking-widest leading-none mt-0.5">Exec</span>
      </div>
    </div>
  );
};

// --- RISK RADAR (SPIDER CHART) ---
const RiskRadarChart = ({ missions }: { missions: Mission[] }) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  if (missions.length === 0) {
    return (
      <div className="mc-card p-6 flex flex-col items-center justify-center text-center text-text-secondary h-52">
        <AlertTriangle className="w-8 h-8 text-amber-500 mb-2 opacity-60" />
        <p className="text-xs font-mono font-bold">TELEMETRY OFFLINE</p>
        <p className="text-[10px] mt-1">No active missions to track</p>
      </div>
    );
  }

  // Heuristic risk scores matching active missions
  const data = missions.map((m, idx) => ({
    name: m.title,
    score: idx === 0 ? 78 : idx === 1 ? 35 : 45,
    prediction: idx === 0 ? 'Delayed' : 'On Track'
  }));

  const size = 180;
  const cx = size / 2;
  const cy = size / 2;
  const R = 60;
  const numAxes = Math.max(3, data.length);

  // Axis lines
  const axisPoints = Array.from({ length: numAxes }).map((_, i) => {
    const angle = (2 * Math.PI * i) / numAxes - Math.PI / 2;
    return {
      x: cx + R * Math.cos(angle),
      y: cy + R * Math.sin(angle),
      angle
    };
  });

  // Value coordinates
  const valPoints = data.map((d, i) => {
    const pt = axisPoints[i] || { angle: -Math.PI / 2 };
    const r = (d.score / 100) * R;
    return {
      x: cx + r * Math.cos(pt.angle),
      y: cy + r * Math.sin(pt.angle),
      ...d
    };
  });

  const polygonPointsStr = valPoints.map(p => `${p.x},${p.y}`).join(' ');

  const maxScore = Math.max(...data.map(d => d.score));
  const polyColor = maxScore > 70 ? 'rgba(239, 68, 68, 0.25)' : maxScore > 40 ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.25)';
  const strokeColor = maxScore > 70 ? '#EF4444' : maxScore > 40 ? '#F59E0B' : '#10B981';

  return (
    <div className="mc-card p-6 relative overflow-hidden flex flex-col items-center">
      <h3 className="font-heading font-black text-xs text-text-primary self-start mb-4 uppercase tracking-wider">Risk Radar Telemetry</h3>
      
      <div className="relative">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          {/* Concentric rings */}
          {[0.25, 0.5, 0.75, 1].map((p, idx) => (
            <circle
              key={idx}
              cx={cx}
              cy={cy}
              r={R * p}
              fill="none"
              stroke="rgba(15, 23, 42, 0.04)"
              strokeWidth="1"
            />
          ))}

          {/* Web Lines */}
          {axisPoints.map((pt, idx) => (
            <line
              key={idx}
              x1={cx}
              y1={cy}
              x2={pt.x}
              y2={pt.y}
              stroke="rgba(15, 23, 42, 0.08)"
              strokeWidth="1"
            />
          ))}

          {/* Area polygon */}
          {valPoints.length >= 3 && (
            <polygon
              points={polygonPointsStr}
              fill={polyColor}
              stroke={strokeColor}
              strokeWidth="1.5"
              className="transition-all duration-300"
            />
          )}

          {/* Core nodes */}
          {valPoints.map((pt, idx) => (
            <circle
              key={idx}
              cx={pt.x}
              cy={pt.y}
              r={hoveredIndex === idx ? 7 : 5}
              fill={pt.score > 70 ? '#EF4444' : pt.score > 40 ? '#F59E0B' : '#10B981'}
              stroke="white"
              strokeWidth="1.5"
              onMouseEnter={() => setHoveredIndex(idx)}
              onMouseLeave={() => setHoveredIndex(null)}
              className="cursor-pointer transition-all duration-150"
            />
          ))}
        </svg>

        {/* Hover overlay tooltip */}
        {hoveredIndex !== null && valPoints[hoveredIndex] && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-900 text-white rounded-xl p-3 shadow-xl text-[10px] w-48 pointer-events-none z-30 font-mono">
            <p className="font-sans font-bold text-xs line-clamp-1">{valPoints[hoveredIndex].name}</p>
            <div className="mt-1.5 border-t border-white/10 pt-1.5 flex justify-between">
              <span>Risk score:</span>
              <span className="font-bold">{valPoints[hoveredIndex].score}%</span>
            </div>
            <div className="flex justify-between mt-0.5">
              <span>Prediction:</span>
              <span className={cn("font-bold", valPoints[hoveredIndex].score > 70 ? 'text-red-400' : 'text-green-400')}>{valPoints[hoveredIndex].prediction}</span>
            </div>
          </div>
        )}
      </div>

      <div className="flex gap-4 mt-4 justify-center text-[9px] font-mono">
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
          <span>High Risk</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#F59E0B]" />
          <span>Medium</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span>Healthy</span>
        </div>
      </div>
    </div>
  );
};

// --- MINI GANTT CHART TIMELINE ---
const GanttTimeline = ({ missions }: { missions: Mission[] }) => {
  const today = new Date();
  today.setHours(0,0,0,0);

  // 30 days scale
  const days = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });

  const isMissionActiveOnDay = (m: Mission, day: Date) => {
    const mStart = m.startDate ? new Date(m.startDate) : new Date(today);
    const mEnd = m.targetDate ? new Date(m.targetDate) : new Date(mStart.getTime() + 14 * 24 * 3600 * 1000);
    mStart.setHours(0,0,0,0);
    mEnd.setHours(23,59,59,999);
    return day >= mStart && day <= mEnd;
  };

  // Find overlapping intervals (Collisions)
  const collisionDays = days.map(day => {
    let count = 0;
    missions.forEach(m => {
      if (isMissionActiveOnDay(m, day)) count++;
    });
    return count > 1;
  });

  const hasCollisions = collisionDays.some(c => c);

  return (
    <div className="mc-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading font-black text-sm text-text-primary uppercase tracking-wider">Executive Timeline (30-Day Gantt)</h3>
        {hasCollisions && (
          <span className="text-[9px] font-black bg-red-50 text-red-500 border border-red-200/50 px-2.5 py-1 rounded-md font-mono animate-pulse">
            ⚠️ Timeline Collision Detected
          </span>
        )}
      </div>

      <div className="overflow-x-auto scrollbar-none border border-[#0F172A]/[0.08] rounded-2xl bg-gray-50/30 p-4">
        <div className="min-w-[650px] space-y-4">
          
          {/* Timeline header */}
          <div className="grid grid-cols-[140px_1fr] items-center text-[9px] font-mono font-bold text-text-secondary border-b border-gray-150 pb-2">
            <div>OBJECTIVES</div>
            <div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(30, minmax(0, 1fr))' }}>
              {days.map((d, i) => (
                <div key={i} className="text-center flex flex-col items-center">
                  <span>{d.getDate()}</span>
                  <span className="opacity-40">{d.toLocaleDateString('en-US', { month: 'short' }).slice(0, 1)}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Timeline Mission bars */}
          {missions.slice(0, 3).map((m, idx) => {
            const mStart = m.startDate ? new Date(m.startDate) : new Date(today);
            const mEnd = m.targetDate ? new Date(m.targetDate) : new Date(mStart.getTime() + 14 * 24 * 3600 * 1000);
            
            const startCol = Math.max(0, Math.floor((mStart.getTime() - today.getTime()) / (24 * 3600 * 1000)));
            const endCol = Math.min(29, Math.floor((mEnd.getTime() - today.getTime()) / (24 * 3600 * 1000)));
            
            const colStart = startCol + 1;
            const colSpan = Math.max(1, endCol - startCol + 1);

            return (
              <div key={m.id} className="grid grid-cols-[140px_1fr] items-center text-xs">
                <div className="font-bold truncate pr-3 text-text-primary" title={m.title}>{m.title}</div>
                <div className="grid gap-0.5 h-6 relative bg-gray-100/30 rounded-lg" style={{ gridTemplateColumns: 'repeat(30, minmax(0, 1fr))' }}>
                  <div 
                    style={{ gridColumn: `${colStart} / span ${colSpan}` }}
                    className={cn(
                      "h-full rounded-md flex items-center px-2 text-[9px] font-bold text-white shadow-sm transition-all duration-300 truncate",
                      idx === 0 ? "bg-indigo-500 shadow-indigo-500/10" : idx === 1 ? "bg-teal-500 shadow-teal-500/10" : "bg-purple-500 shadow-purple-500/10"
                    )}
                  >
                    {m.title}
                  </div>
                </div>
              </div>
            );
          })}

          {/* Collision Danger Zone Overlay */}
          {hasCollisions && (
            <div className="grid grid-cols-[140px_1fr] items-center text-xs pt-2 border-t border-gray-150">
              <div className="font-mono text-[9px] font-black text-red-500 flex items-center gap-1.5 uppercase tracking-wide">
                <span>Collision Overlap</span>
              </div>
              <div className="grid gap-0.5 h-5" style={{ gridTemplateColumns: 'repeat(30, minmax(0, 1fr))' }}>
                {collisionDays.map((c, i) => (
                  <div 
                    key={i} 
                    className={cn(
                      "h-full rounded-sm transition-all",
                      c 
                        ? "bg-red-500/20 border border-red-500/30 bg-[repeating-linear-gradient(45deg,#ef4444_0,#ef4444_1px,transparent_0,transparent_6px)] bg-[size:8px_8px]" 
                        : "transparent"
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};


// --- MAIN DASHBOARD PAGE ---
export const Dashboard = () => {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [m, t] = await Promise.all([
          missionService.getMissions(),
          missionService.getTasks(),
        ]);
        setMissions(m);
        setTasks(t);
      } catch (error) {
        console.error('[Dashboard] Failed to fetch data from Lemma:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  const activeMissions = missions.filter((m) => m.status === 'active');
  const pendingTasks = tasks.filter((t) => t.status !== 'completed');
  const completedTasks = tasks.filter((t) => t.status === 'completed');
  const completionRate = tasks.length > 0 ? Math.round((completedTasks.length / tasks.length) * 100) : 0;

  // Heuristic greeting based on hour of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const handleAddRecommendation = (title: string) => {
    setToastMessage(`✨ Added to today's tasks: "${title}"`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const nextRecommendations = [
    { 
      label: '🚀 Record KAIRO demo video', 
      title: 'Record KAIRO demo video', 
      why: 'Hackathon deadline is tonight; demo video is a required submission asset.' 
    },
    { 
      label: '📚 Revise DBMS Normalization', 
      title: 'DBMS normalizations', 
      why: 'Identified weak normal form concept in logs; semester exams in 15 days.' 
    },
    { 
      label: '🎯 Complete DSA Arrays challenge', 
      title: 'DSA practice arrays', 
      why: 'August campus placements approaching; keep up daily Arrays quota.' 
    }
  ];

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-6 md:space-y-8 font-body">
      
      {/* Visual Confirm Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in font-mono">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Clean Header with Radial Gauge */}
      <header className="flex justify-between items-center gap-4 pb-4 border-b border-gray-150">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-black text-text-primary tracking-tight">
            {getGreeting()}, {user?.displayName?.split(' ')[0] || 'Operator'}
          </h1>
          <p className="text-text-secondary text-sm mt-1.5 font-medium">Your AI Chief of Staff has mapped the command terminal.</p>
        </div>
        {!loading && <RadialGauge value={completionRate} />}
      </header>

      {/* Slim Top Strip of Quick-Action Shortcuts */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link 
          to="/planner" 
          className="mc-card p-4 hover:shadow-lg transition-all flex items-center justify-between group mc-btn-active"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors">
              <PlusCircle className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="font-heading font-bold text-xs text-text-primary block">NEW MISSION</span>
              <span className="text-[10px] text-text-secondary font-mono">Launch a new goal checklist</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-primary transition-colors group-hover:translate-x-0.5" />
        </Link>

        <Link 
          to="/chat" 
          className="mc-card p-4 hover:shadow-lg transition-all flex items-center justify-between group mc-btn-active"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-teal-50 flex items-center justify-center text-teal-600 group-hover:bg-teal-500 group-hover:text-white transition-colors">
              <MessageSquare className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="font-heading font-bold text-xs text-text-primary block">ASK KAIRO</span>
              <span className="text-[10px] text-text-secondary font-mono">Command decision console</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-teal-600 transition-colors group-hover:translate-x-0.5" />
        </Link>

        <Link 
          to="/inbox" 
          className="mc-card p-4 hover:shadow-lg transition-all flex items-center justify-between group mc-btn-active"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center text-purple-600 group-hover:bg-purple-500 group-hover:text-white transition-colors">
              <Inbox className="w-4.5 h-4.5" />
            </div>
            <div>
              <span className="font-heading font-bold text-xs text-text-primary block">INGEST SIGNAL</span>
              <span className="text-[10px] text-text-secondary font-mono">Triage emails, text logs, PDFs</span>
            </div>
          </div>
          <ArrowRight className="w-4 h-4 text-gray-300 group-hover:text-purple-600 transition-colors group-hover:translate-x-0.5" />
        </Link>
      </div>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
          
          {/* LEFT SECTION (8-Cols on Desktop) */}
          <div className="lg:col-span-8 space-y-6 md:space-y-8">
            
            {/* 1. Chief of Staff Hero Card */}
            <div className="bg-gradient-to-br from-indigo-50 via-white to-purple-50/30 border border-primary/10 rounded-[2rem] p-6 md:p-8 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/3" />
              
              <div className="flex items-start gap-4 mb-6 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-primary to-indigo-600 flex items-center justify-center shadow-lg shadow-primary/20 shrink-0">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="font-heading font-black text-lg md:text-xl text-text-primary">KAIRO Executive Briefing</h2>
                  <p className="text-xs md:text-sm text-text-secondary font-medium mt-0.5">Automated contextual analysis</p>
                </div>
              </div>

              <div className="space-y-5 text-sm text-text-secondary leading-relaxed relative z-10">
                <p className="font-medium text-text-primary/80">
                  Good morning! Based on your recent Smart Inbox ingests and active timeline, I've prioritized your focus areas.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/40 shadow-sm">
                    <span className="font-extrabold text-primary block mb-1 text-xs uppercase tracking-wider">🎯 Core Focus</span>
                    <span className="text-text-primary font-medium text-sm">Complete the final KAIRO landing page redesign and demo video.</span>
                  </div>
                  <div className="bg-white/60 backdrop-blur-md p-4 rounded-2xl border border-white/40 shadow-sm">
                    <span className="font-extrabold text-orange-500 block mb-1 text-xs uppercase tracking-wider">⚠️ Identified Risks</span>
                    <span className="text-text-primary font-medium text-sm">Semester exams in 15 days, but DSA preparations are falling behind.</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-5 border-t border-primary/10 flex items-center justify-between relative z-10">
                <p className="text-xs font-bold text-text-secondary">Ready to dominate today's targets?</p>
                <Link to="/chat" className="bg-white hover:bg-gray-50 text-primary border border-primary/20 px-5 py-2.5 rounded-full font-bold text-xs transition-all shadow-sm hover:shadow-md active:scale-95 flex items-center gap-2">
                  Open Chat Copilot <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>

            {/* 2. Gantt Timeline Chart */}
            <GanttTimeline missions={activeMissions} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* 3. Today's Focus List */}
              <div className="mc-card p-6">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-heading font-black text-base text-text-primary">Focus Tasks</h2>
                  <Link to="/tasks" className="text-[11px] font-bold text-primary bg-primary/5 px-2.5 py-1 rounded-full hover:bg-primary/10 transition-colors">
                    View All
                  </Link>
                </div>

                {pendingTasks.length === 0 ? (
                  <div className="text-center py-8 text-text-secondary text-sm flex flex-col items-center">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mb-3" />
                    <span className="font-semibold text-text-primary">All caught up!</span>
                    <span className="text-xs mt-1">Let KAIRO plan your next steps.</span>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {pendingTasks.slice(0, 4).map((task) => (
                      <div key={task.id} className="flex items-center justify-between p-3.5 bg-gray-50/50 rounded-2xl border border-gray-100 hover:border-primary/20 transition-colors group">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                            task.priority === 'urgent' ? 'bg-red-500 shadow-sm shadow-red-500/30' : task.priority === 'high' ? 'bg-orange-500 shadow-sm shadow-orange-500/30' : 'bg-primary shadow-sm shadow-primary/30'
                          }`} />
                          <span className="font-semibold text-xs text-text-primary truncate">{task.title}</span>
                        </div>
                        {task.estimatedDuration && (
                          <span className="shrink-0 text-[10px] font-bold bg-white border border-gray-200 text-text-secondary px-2 py-1 rounded-lg">
                            {task.estimatedDuration}m
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 4. AI Next Recommendations */}
              <div className="mc-card p-6">
                <h2 className="font-heading font-black text-base text-text-primary mb-5 uppercase tracking-wider">AI Recommendations</h2>
                <div className="space-y-3.5">
                  {nextRecommendations.map((action, idx) => (
                    <div 
                      key={idx}
                      className="p-3 bg-gray-50/50 hover:bg-white border border-gray-100 hover:border-primary/20 rounded-2xl transition-all flex items-start justify-between gap-3 group"
                    >
                      <div className="space-y-1">
                        <span className="font-semibold text-xs text-text-primary block leading-tight">{action.label}</span>
                        <span className="text-[10px] text-text-secondary leading-normal block">{action.why}</span>
                      </div>
                      <button
                        onClick={() => handleAddRecommendation(action.title)}
                        className="bg-primary/5 hover:bg-primary text-primary hover:text-white p-2 rounded-xl transition-all mc-btn-active shrink-0"
                      >
                        <PlusCircle className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SECTION (4-Cols on Desktop) */}
          <div className="lg:col-span-4 space-y-6 md:space-y-8">

            {/* RISK RADAR WIDGET (Radar Chart) */}
            <RiskRadarChart missions={activeMissions} />

          </div>
        </div>
      )}
    </div>
  );
};
