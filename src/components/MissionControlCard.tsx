import type { Mission, Task } from '@/types/schema';
import { Target, Zap, ShieldAlert, Timer, CalendarClock, Sparkles } from 'lucide-react';
import { useMemo } from 'react';

interface MissionControlCardProps {
  userName: string;
  missions: Mission[];
  completionRate: number;
  pendingTasks: Task[];
}

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour < 12) return 'Good Morning';
  if (hour < 17) return 'Good Afternoon';
  if (hour < 21) return 'Good Evening';
  return 'Good Night';
}

function getRiskLevel(rate: number): { label: string; color: string; bg: string } {
  if (rate < 35) return { label: 'HIGH', color: 'text-red-400', bg: 'bg-red-500/20' };
  if (rate < 65) return { label: 'MEDIUM', color: 'text-orange-400', bg: 'bg-orange-500/20' };
  return { label: 'LOW', color: 'text-emerald-400', bg: 'bg-emerald-500/20' };
}

function getAIRecommendation(missions: Mission[], tasks: Task[]): string {
  if (missions.length > 0 && tasks.length > 0) {
    return `Finish "${tasks[0].title}"`;
  }
  if (missions.length > 0) {
    return `Focus on ${missions[0].title}`;
  }
  return 'Add your first mission';
}

function getNextDeadline(missions: Mission[]): string {
  const upcoming = missions
    .filter((m) => m.targetDate)
    .sort((a, b) => new Date(a.targetDate!).getTime() - new Date(b.targetDate!).getTime());

  if (!upcoming.length) return 'No deadline set';
  const d = new Date(upcoming[0].targetDate!);
  const now = new Date();
  const diffDays = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays === 0) return 'Tonight';
  if (diffDays === 1) return 'Tomorrow';
  if (diffDays < 7) return `In ${diffDays} days`;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function getFreeHours(completionRate: number, pendingCount: number): string {
  // Rough heuristic: more completion = more free time
  const base = Math.max(1, 8 - pendingCount);
  const hours = Math.round(base * (completionRate / 100) + 1);
  return `${Math.min(hours, 6)} Hours`;
}

export default function MissionControlCard({ userName, missions, completionRate, pendingTasks }: MissionControlCardProps) {
  const greeting = getGreeting();
  const topMission = missions[0];
  const risk = useMemo(() => getRiskLevel(completionRate), [completionRate]);
  const recommendation = useMemo(() => getAIRecommendation(missions, pendingTasks), [missions, pendingTasks]);
  const nextDeadline = useMemo(() => getNextDeadline(missions), [missions]);
  const freeTime = useMemo(() => getFreeHours(completionRate, pendingTasks.length), [completionRate, pendingTasks]);

  // Circumference for the SVG ring
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (completionRate / 100) * circumference;

  return (
    <div className="relative rounded-3xl overflow-hidden shadow-xl">
      {/* Dark gradient background */}
      <div
        className="absolute inset-0"
        style={{
          background: 'linear-gradient(145deg, #0f0f1a 0%, #161628 50%, #0e1320 100%)',
        }}
      />
      {/* Subtle glow blobs */}
      <div className="absolute top-0 right-0 w-40 h-40 rounded-full blur-3xl pointer-events-none opacity-30"
        style={{ background: 'radial-gradient(circle, #6366f1 0%, transparent 70%)' }} />
      <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl pointer-events-none opacity-20"
        style={{ background: 'radial-gradient(circle, #8b5cf6 0%, transparent 70%)' }} />

      <div className="relative z-10 p-6 space-y-5">

        {/* Header label */}
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-indigo-500/30 border border-indigo-400/30 flex items-center justify-center">
            <Sparkles className="w-3 h-3 text-indigo-300" />
          </div>
          <span className="text-[10px] font-extrabold text-indigo-300 uppercase tracking-[0.15em]">Mission Control</span>
        </div>

        {/* Greeting */}
        <div>
          <p className="text-white/50 text-xs font-medium">{greeting}</p>
          <h2 className="text-white font-heading font-black text-xl leading-tight mt-0.5">{userName}</h2>
        </div>

        {/* Divider */}
        <div className="border-t border-white/8" />

        {/* Today's Mission */}
        <div>
          <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-1.5">Today's Mission</p>
          <div className="flex items-start gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-indigo-500/20 border border-indigo-400/20 flex items-center justify-center shrink-0 mt-0.5">
              <Target className="w-3.5 h-3.5 text-indigo-300" />
            </div>
            <p className="text-white font-bold text-sm leading-snug">
              {topMission?.title ?? 'No active mission — create one!'}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/8" />

        {/* Execution Ring + Stats row */}
        <div className="flex items-center gap-5">
          {/* SVG Progress Ring */}
          <div className="relative shrink-0">
            <svg width="72" height="72" viewBox="0 0 72 72" className="-rotate-90">
              {/* Track */}
              <circle cx="36" cy="36" r={radius} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6" />
              {/* Progress */}
              <circle
                cx="36" cy="36" r={radius}
                fill="none"
                stroke="url(#execGrad)"
                strokeWidth="6"
                strokeLinecap="round"
                strokeDasharray={circumference}
                strokeDashoffset={progress}
                className="transition-all duration-700 ease-out"
              />
              <defs>
                <linearGradient id="execGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#818cf8" />
                  <stop offset="100%" stopColor="#a78bfa" />
                </linearGradient>
              </defs>
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-white font-black text-lg leading-none">{completionRate}%</span>
            </div>
          </div>

          {/* Label */}
          <div>
            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest">Execution</p>
            <p className="text-white/80 text-sm font-semibold mt-0.5">
              {completionRate >= 70 ? 'On Track 🔥' : completionRate >= 40 ? 'In Progress' : 'Needs Push'}
            </p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/8" />

        {/* AI Recommendation */}
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-xl bg-violet-500/20 border border-violet-400/20 flex items-center justify-center shrink-0 mt-0.5">
            <Zap className="w-3.5 h-3.5 text-violet-300" />
          </div>
          <div>
            <p className="text-white/40 text-[9px] font-bold uppercase tracking-widest mb-0.5">AI Recommendation</p>
            <p className="text-white font-bold text-sm">{recommendation}</p>
          </div>
        </div>

        {/* Divider */}
        <div className="border-t border-white/8" />

        {/* Bottom stats row: Risk / Free Time / Next Deadline */}
        <div className="grid grid-cols-3 gap-3">
          {/* Risk */}
          <div className="bg-white/5 rounded-2xl p-3 border border-white/8 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <ShieldAlert className="w-3 h-3 text-white/40" />
              <span className="text-white/40 text-[8px] font-bold uppercase tracking-wider">Risk</span>
            </div>
            <span className={`text-sm font-black ${risk.color} leading-none`}>{risk.label}</span>
          </div>

          {/* Free Time */}
          <div className="bg-white/5 rounded-2xl p-3 border border-white/8 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <Timer className="w-3 h-3 text-white/40" />
              <span className="text-white/40 text-[8px] font-bold uppercase tracking-wider">Free</span>
            </div>
            <span className="text-sm font-black text-white leading-none">{freeTime}</span>
          </div>

          {/* Next Deadline */}
          <div className="bg-white/5 rounded-2xl p-3 border border-white/8 flex flex-col gap-1.5">
            <div className="flex items-center gap-1.5">
              <CalendarClock className="w-3 h-3 text-white/40" />
              <span className="text-white/40 text-[8px] font-bold uppercase tracking-wider">Next</span>
            </div>
            <span className="text-sm font-black text-white leading-none">{nextDeadline}</span>
          </div>
        </div>

      </div>
    </div>
  );
}
