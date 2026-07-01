import { useEffect, useState } from 'react';
import { missionService } from '@/services/MissionService';
import { memoryService } from '@/services/MemoryService';
import { workspaceService } from '@/services/WorkspaceService';
import type { Workspace } from '@/services/WorkspaceService';
import { useAuth } from '@/context/AuthContext';
import type { Mission, Task, Memory } from '@/types/schema';
import { 
  Brain, 
  ArrowRight, 
  CheckCircle2, 
  Sparkles, 
  Clock, 
  CornerDownRight,
  Briefcase
} from 'lucide-react';
import { Link } from 'react-router-dom';
import MissionControlCard from '@/components/MissionControlCard';

export const Dashboard = () => {
  const { user } = useAuth();
  const [missions, setMissions] = useState<Mission[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState<string | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [m, t, mem, ws] = await Promise.all([
          missionService.getMissions(),
          missionService.getTasks(),
          memoryService.getMemories(),
          workspaceService.getWorkspaces(),
        ]);
        setMissions(m);
        setTasks(t);
        setMemories(mem);
        setWorkspaces(ws);
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

  return (
    <div className="p-4 md:p-8 font-body max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Toast Alert for One-Click actions */}
      {actionMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-primary text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm animate-bounce font-semibold border border-primary-border/20">
          <Sparkles className="w-4.5 h-4.5" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Clean Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 pb-2">
        <div>
          <h1 className="text-3xl md:text-4xl font-heading font-black text-text-primary tracking-tight">Executive Dashboard</h1>
          <p className="text-text-secondary text-sm mt-1.5 font-medium">Hello, {user?.displayName || 'KAIRO Operator'}. Here is your command center.</p>
        </div>
      </header>

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

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
              {/* 2. Today's Focus List */}
              <div className="bg-white border border-gray-150 rounded-[2rem] p-6 shadow-sm">
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

              {/* 3. Executive Timeline */}
              <div className="bg-white border border-gray-150 rounded-[2rem] p-6 shadow-sm">
                <div className="flex items-center justify-between mb-5">
                  <h2 className="font-heading font-black text-base text-text-primary">Timeline</h2>
                  <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-widest">Next 30 Days</span>
                </div>

                <div className="space-y-4">
                  {activeMissions.slice(0, 3).map((mission, index) => {
                    const isUrgent = index === 0;
                    return (
                      <div key={mission.id} className="relative pl-4">
                        {/* Timeline line */}
                        <div className="absolute left-0 top-1.5 bottom-[-1rem] w-0.5 bg-gray-100 last:hidden" />
                        <div className={`absolute left-[-3px] top-1.5 w-2 h-2 rounded-full ${isUrgent ? 'bg-red-500 ring-4 ring-red-50' : 'bg-primary ring-4 ring-primary/5'}`} />
                        
                        <div className="mb-4">
                          <p className="text-xs font-bold text-text-primary leading-snug">{mission.title}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className={`text-[9px] font-extrabold px-2 py-0.5 rounded uppercase ${isUrgent ? 'bg-red-50 text-red-600' : 'bg-gray-100 text-text-secondary'}`}>
                              {isUrgent ? 'Urgent' : 'Tracked'}
                            </span>
                            <span className="text-[10px] font-medium text-text-secondary flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {mission.targetDate ? new Date(mission.targetDate).toLocaleDateString() : 'No Deadline'}
                            </span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

          </div>

          {/* RIGHT SECTION (4-Cols on Desktop) */}
          <div className="lg:col-span-4 space-y-6 md:space-y-8">

            {/* MISSION CONTROL WIDGET (The Masterpiece) */}
            <MissionControlCard
              userName={user?.displayName?.split(' ')[0] || 'Kairo'}
              missions={activeMissions}
              completionRate={completionRate}
              pendingTasks={pendingTasks}
            />

            {/* KAIRO Context Radar */}
            <div className="bg-primary/5 border border-primary/10 rounded-[2rem] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-4">
                <h3 className="font-heading font-black text-sm text-primary flex items-center gap-1.5">
                  <Brain className="w-4 h-4" />
                  Context Radar
                </h3>
                <Link to="/inbox" className="text-[10px] font-extrabold text-primary uppercase hover:underline">Ingest</Link>
              </div>
              
              {memories.length > 0 ? (
                <div className="space-y-3">
                  <p className="text-xs text-text-secondary font-medium">Latest extracted intelligence:</p>
                  <div className="bg-white p-3.5 rounded-2xl border border-primary/10 text-xs text-text-primary font-medium leading-relaxed shadow-sm italic">
                    "{memories[0].content}"
                  </div>
                </div>
              ) : (
                <p className="text-xs text-primary/80 font-medium leading-relaxed bg-white/50 p-4 rounded-2xl border border-primary/10">
                  No context saved yet. Send emails/texts to the Smart Inbox to bootstrap the intelligence loop.
                </p>
              )}
            </div>

            {/* Flagship Workspaces Widget */}
            <div className="bg-white border border-gray-150 rounded-[2rem] p-6 shadow-sm">
              <div className="flex justify-between items-center mb-5">
                <h3 className="font-heading font-black text-sm text-text-primary flex items-center gap-1.5">
                  <Briefcase className="w-4 h-4 text-text-secondary" />
                  Workspaces
                </h3>
                <span className="text-[9px] bg-gray-100 text-text-secondary px-2 py-0.5 rounded-lg uppercase font-bold">Active</span>
              </div>
              
              <div className="space-y-3">
                {workspaces.slice(0, 3).map((ws) => (
                  <Link
                    key={ws.id}
                    to="/workspaces"
                    className="block p-3.5 rounded-2xl border border-gray-100 bg-gray-50/30 hover:bg-white hover:border-primary/20 transition-all group"
                  >
                    <div className="flex justify-between items-center text-[10px] mb-1">
                      <span className="font-extrabold text-primary/70 uppercase tracking-widest">{ws.organization.split(' ')[0]}</span>
                      <span className="font-bold text-text-secondary">{ws.progress}%</span>
                    </div>
                    <h4 className="font-bold text-xs text-text-primary truncate group-hover:text-primary transition-colors">{ws.title}</h4>
                  </Link>
                ))}
                
                {workspaces.length === 0 && (
                  <p className="text-xs text-text-secondary text-center py-2">No workspaces active.</p>
                )}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
