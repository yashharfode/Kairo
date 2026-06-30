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
  PlusCircle, 
  LineChart,
  CornerDownRight,
  BookOpen
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
  const [decisionActive, setDecisionActive] = useState(false);
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

  // 1. One-click Action Handler
  const triggerOneClickAction = (taskTitle: string) => {
    setActionMessage(`✨ KAIRO auto-scheduled and initialized focus session for: "${taskTitle}"`);
    setTimeout(() => setActionMessage(null), 5000);
  };

  return (
    <div className="p-4 md:p-8 font-body max-w-7xl mx-auto space-y-6 md:space-y-8">
      {/* Toast Alert for One-Click actions */}
      {actionMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-primary text-white px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-2.5 text-sm animate-bounce font-semibold border border-primary-border/20">
          <Sparkles className="w-4.5 h-4.5" />
          <span>{actionMessage}</span>
        </div>
      )}

      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-black text-text-primary">Executive Dashboard</h1>
          <p className="text-text-secondary text-xs md:text-sm mt-1">Hello, {user?.displayName || 'Kairo User'}. Your AI Chief of Staff has mapped today's timeline.</p>
        </div>
        
        {/* Execution Score */}
        <div className="bg-white border border-gray-100 px-4 py-2.5 rounded-2xl shadow-sm flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-primary font-bold">
            <LineChart className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[9px] font-bold text-text-secondary uppercase">Execution Score</p>
            <p className="text-sm font-black text-text-primary">{completionRate}%</p>
          </div>
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
            
            {/* 1. Chief of Staff Card & Executive Brief */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-md shadow-gray-100/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-start gap-4 mb-5">
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20 shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h2 className="font-heading font-black text-base text-text-primary">AI Chief of Staff Briefing</h2>
                  <p className="text-xs text-text-secondary mt-0.5">Automated on login context analysis</p>
                </div>
              </div>

              <div className="space-y-4 text-xs md:text-sm text-text-secondary leading-relaxed border-b border-gray-50 pb-5">
                <p>
                  👋 Good morning! Here is KAIRO's briefing based on your connected Lemma Pod:
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100/60">
                    <span className="font-bold text-text-primary block mb-1">🎯 Today's Core Focus</span>
                    Complete the final KAIRO landing page redesign and record the 2-minute demo video.
                  </div>
                  <div className="bg-gray-50/50 p-3 rounded-xl border border-gray-100/60">
                    <span className="font-bold text-text-primary block mb-1">⚠️ Identified Risks</span>
                    End semester exams are 15 days away, but DSA mock preparations are currently falling behind.
                  </div>
                </div>
              </div>

              {/* Chief of Staff Advice / What should I do now? */}
              <div className="pt-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <p className="text-[10px] font-extrabold text-primary uppercase tracking-wider">What should I do now?</p>
                  <p className="text-xs sm:text-sm font-bold text-text-primary mt-1">Focus on Gappy AI Hackathon Pitch and Demo video.</p>
                  <p className="text-[11px] text-text-secondary mt-0.5">Why: It is due in 48 hours and holds a 95% execution priority value.</p>
                </div>
                <button 
                  onClick={() => setDecisionActive(true)}
                  className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-full font-bold text-xs transition-colors shrink-0 text-center shadow-md active:scale-95"
                >
                  Ask Decision Center
                </button>
              </div>
            </div>

            {/* 2. Executive Timeline & Countdown widgets */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading font-black text-base text-text-primary">Executive Timeline</h2>
                <span className="text-[10px] font-extrabold text-text-secondary uppercase">Next 30 Days</span>
              </div>

              <div className="space-y-4">
                {activeMissions.slice(0, 3).map((mission, index) => {
                  const isUrgent = index === 0; // Hackathon is first
                  return (
                    <div key={mission.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100/60 gap-4">
                      <div className="flex items-start gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                          isUrgent ? 'bg-red-50 text-red-600' : 'bg-primary/10 text-primary'
                        }`}>
                          <Clock className="w-4 h-4" />
                        </div>
                        <div>
                          <p className="text-xs sm:text-sm font-bold text-text-primary">{mission.title}</p>
                          <p className="text-[11px] text-text-secondary mt-0.5 flex items-center gap-1">
                            <CornerDownRight className="w-3 h-3 text-gray-400" />
                            {isUrgent ? 'Timeline Collision: Exams overlapping shortly after' : 'Preparation schedule auto-arranged'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-3 shrink-0">
                        {isUrgent && (
                          <span className="text-[9px] font-extrabold bg-red-100 text-red-600 px-2 py-0.5 rounded uppercase animate-pulse">
                            Collision Risk
                          </span>
                        )}
                        <span className="text-[11px] font-semibold bg-white border border-gray-200/80 text-text-primary px-3 py-1 rounded-xl">
                          {mission.targetDate ? `Due ${new Date(mission.targetDate).toLocaleDateString()}` : 'No Deadline'}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 3. Decision Center Overlay / Popup */}
            {decisionActive && (
              <div className="bg-primary-light/40 border border-primary/20 rounded-3xl p-6 shadow-lg relative animate-fade-in">
                <div className="flex items-center justify-between mb-4">
                  <span className="text-[11px] font-extrabold text-primary uppercase tracking-wider">Decision Center Analysis</span>
                  <button onClick={() => setDecisionActive(false)} className="text-xs text-text-secondary hover:text-text-primary font-bold">Dismiss</button>
                </div>
                <h3 className="font-heading font-black text-text-primary text-base mb-2">DSA practice vs. Gappy AI Hackathon?</h3>
                <p className="text-xs text-text-secondary leading-relaxed mb-4">
                  <strong>Recommendation:</strong> Prioritize Gappy AI Hackathon submission first.
                </p>
                <div className="grid grid-cols-2 gap-4 text-xs mb-4">
                  <div className="bg-white p-3 rounded-xl border border-primary-border/20 shadow-sm">
                    <span className="text-[10px] font-bold text-text-secondary block mb-0.5">Confidence Score</span>
                    <span className="font-black text-primary text-sm">95%</span>
                  </div>
                  <div className="bg-white p-3 rounded-xl border border-primary-border/20 shadow-sm">
                    <span className="text-[10px] font-bold text-text-secondary block mb-0.5">Alternative Risk</span>
                    <span className="font-black text-orange-600 text-sm">Exam Prep Overlap</span>
                  </div>
                </div>
                <div className="text-[11px] text-text-secondary italic">
                  Reasoning: Hackathon submission is set for July 2nd. Postponing DSA revision sheet until July 3rd carries zero penalty as semester exams start on July 15th.
                </div>
              </div>
            )}

            {/* 4. Today's Focus List */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-heading font-bold text-lg text-text-primary">Today's Focus Tasks</h2>
                <Link to="/tasks" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                  View Tasks <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {pendingTasks.length === 0 ? (
                <div className="text-center py-8 text-text-secondary text-sm">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-primary mb-2" />
                  All caught up! Let KAIRO plan your next steps.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingTasks.slice(0, 4).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-100/60 text-xs sm:text-sm">
                      <div className="flex items-center gap-3">
                        <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                          task.priority === 'urgent' ? 'bg-red-500' : task.priority === 'high' ? 'bg-orange-500' : 'bg-primary'
                        }`} />
                        <span className="font-semibold text-text-primary">{task.title}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {task.estimatedDuration && (
                          <span className="text-[10px] bg-white border border-gray-200 text-text-secondary px-2.5 py-0.5 rounded-lg">
                            {task.estimatedDuration}m
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>

          {/* RIGHT SECTION (4-Cols on Desktop) */}
          <div className="lg:col-span-4 space-y-6 md:space-y-8">

            {/* MISSION CONTROL WIDGET */}
            <MissionControlCard
              userName={user?.displayName?.split(' ')[0] || 'Kairo'}
              missions={activeMissions}
              completionRate={completionRate}
              pendingTasks={pendingTasks}
            />

            {/* 1. Risk Radar Widget */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm">
              <h3 className="font-heading font-black text-sm text-text-primary mb-4">Risk Radar</h3>
              
              <div className="space-y-4">
                {activeMissions.slice(0, 2).map((mission, index) => {
                  const score = index === 0 ? 78 : 35;
                  return (
                    <div key={mission.id} className="space-y-1.5 border-b border-gray-50 pb-3 last:border-0 last:pb-0">
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-bold text-text-primary truncate max-w-[150px]">{mission.title}</span>
                        <span className={`font-black uppercase tracking-wider text-[9px] ${
                          score > 60 ? 'text-red-500' : 'text-primary'
                        }`}>{score > 60 ? 'High Risk' : 'Healthy'}</span>
                      </div>
                      
                      {/* Bar graph */}
                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div 
                          className={`h-full rounded-full transition-all duration-300 ${
                            score > 60 ? 'bg-red-500' : 'bg-primary'
                          }`} 
                          style={{ width: `${score}%` }} 
                        />
                      </div>
                      
                      <div className="flex items-center justify-between text-[10px] text-text-secondary">
                        <span>Prediction: {score > 60 ? 'Delayed' : 'On Track'}</span>
                        <span>Score: {score}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 2. One-click AI Suggestions */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <h3 className="font-heading font-black text-sm text-text-primary">AI Next Recommendations</h3>
              
              <div className="space-y-2">
                {[
                  { label: '🚀 Record KAIRO demo video', title: 'Record KAIRO demo video' },
                  { label: '📚 Revise DBMS Normalization', title: 'DBMS normalizations' },
                  { label: '🎯 Complete DSA Arrays challenge', title: 'DSA practice arrays' }
                ].map(action => (
                  <button
                    key={action.title}
                    onClick={() => triggerOneClickAction(action.title)}
                    className="w-full text-left p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-primary-light/30 hover:border-primary-border/20 transition-all text-xs font-semibold text-text-primary flex items-center justify-between"
                  >
                    <span>{action.label}</span>
                    <PlusCircle className="w-4.5 h-4.5 text-primary shrink-0" />
                  </button>
                ))}
              </div>
            </div>

            {/* Flagship Workspaces Widget */}
            <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex justify-between items-center border-b border-gray-50 pb-3">
                <h3 className="font-heading font-black text-sm text-text-primary">Active Workspaces</h3>
                <span className="text-[9px] bg-primary/10 text-primary px-2 py-0.5 rounded-lg uppercase font-bold">AI Scans</span>
              </div>
              
              <div className="space-y-3">
                {workspaces.slice(0, 3).map((ws) => (
                  <Link
                    key={ws.id}
                    to="/workspaces"
                    className="block p-3 rounded-2xl border border-gray-50 bg-gray-50/20 hover:bg-white hover:border-primary-border/20 transition-all"
                  >
                    <div className="flex justify-between items-center text-[10px]">
                      <span className="font-extrabold text-primary uppercase">{ws.organization.split(' ')[0]}</span>
                      <span className="font-bold text-text-secondary">{ws.progress}%</span>
                    </div>
                    <h4 className="font-heading font-black text-xs text-text-primary mt-1.5 truncate">{ws.title}</h4>
                    <p className="text-[10px] text-text-secondary mt-0.5 line-clamp-1">{ws.description}</p>
                  </Link>
                ))}
              </div>
            </div>

            {/* 3. Recent AI Insights & Memories list */}
            <div className="bg-primary-light/30 rounded-3xl p-6 border border-primary/10 flex flex-col justify-between shadow-sm">
              <div className="space-y-4">
                <h3 className="font-heading font-bold text-sm text-primary flex items-center gap-1.5">
                  <Brain className="w-4.5 h-4.5" />
                  KAIRO Context Radar
                </h3>
                
                {memories.length > 0 ? (
                  <div className="space-y-3">
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Latest context saved from WhatsApp studied group inputs:
                    </p>
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-primary-border/10 text-[11px] text-text-secondary leading-relaxed shadow-sm">
                      "{memories[0].content}"
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-primary/80 leading-relaxed">
                    KAIRO has no context saved yet. Start by pasting notifications or emails in the Smart Inbox to bootstrap the intelligence loop.
                  </p>
                )}
              </div>
              
              <Link
                to="/inbox"
                className="bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-bold text-center text-xs transition-colors shadow-md mt-6 block active:scale-95"
              >
                Ingest New Communication
              </Link>
            </div>

          </div>

          {/* 4. KAIRO Executive Operations Guide (Full Width) */}
          <div className="lg:col-span-12 bg-white border border-gray-150 rounded-3xl p-6 shadow-sm mt-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary shadow-sm shrink-0">
                <BookOpen className="w-5 h-5" />
              </div>
              <div>
                <h2 className="font-heading font-black text-base text-text-primary">KAIRO Operations Manual</h2>
                <p className="text-xs text-text-secondary mt-0.5">Learn how to maximize your AI Chief of Staff's capabilities</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              
              <div className="bg-gray-50/40 p-4 rounded-2xl border border-gray-100/80 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <h4 className="font-bold text-xs text-text-primary uppercase tracking-wide">🧠 Brain & Signals</h4>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Scans external inputs (notifications, hackathons, academic opportunities) and extracts relevant tags.
                  </p>
                </div>
                <div className="text-[10px] text-primary bg-secondary px-2.5 py-1.5 rounded-lg font-bold border border-primary-border/20 self-start">
                  Example: Promote "Google Placement Opportunity" to a Live Mission
                </div>
              </div>

              <div className="bg-gray-50/40 p-4 rounded-2xl border border-gray-100/80 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <h4 className="font-bold text-xs text-text-primary uppercase tracking-wide">📥 Smart Inbox</h4>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Ingests emails, texts, or logs. Triages content through a multi-stage AI reasoning pipeline.
                  </p>
                </div>
                <div className="text-[10px] text-primary bg-secondary px-2.5 py-1.5 rounded-lg font-bold border border-primary-border/20 self-start">
                  Example: Analyze WhatsApp text messages to update task priorities
                </div>
              </div>

              <div className="bg-gray-50/40 p-4 rounded-2xl border border-gray-100/80 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <h4 className="font-bold text-xs text-text-primary uppercase tracking-wide">🗺️ Mission Planner</h4>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Reverse-plans long-term goals into structured milestones and step-by-step preparation checklists.
                  </p>
                </div>
                <div className="text-[10px] text-primary bg-secondary px-2.5 py-1.5 rounded-lg font-bold border border-primary-border/20 self-start">
                  Example: "I want to score 9.0+ CGPA in DBMS semester end exams"
                </div>
              </div>

              <div className="bg-gray-50/40 p-4 rounded-2xl border border-gray-100/80 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <h4 className="font-bold text-xs text-text-primary uppercase tracking-wide">💬 AI Chat Copilot</h4>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Direct dialogue window with KAIRO. Fully synchronized with your memories, timelines, and active tasks.
                  </p>
                </div>
                <div className="text-[10px] text-primary bg-secondary px-2.5 py-1.5 rounded-lg font-bold border border-primary-border/20 self-start">
                  Example: Ask "What should I focus on first today, and why?"
                </div>
              </div>

              <div className="bg-gray-50/40 p-4 rounded-2xl border border-gray-100/80 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <h4 className="font-bold text-xs text-text-primary uppercase tracking-wide">📅 Calendar & Tasks</h4>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Interactive drag-and-drop calendar dynamically synced with tasks created by the Mission Planner.
                  </p>
                </div>
                <div className="text-[10px] text-primary bg-secondary px-2.5 py-1.5 rounded-lg font-bold border border-primary-border/20 self-start">
                  Example: Drag a DSA practice task to reschedule it on the weekly timeline
                </div>
              </div>

              <div className="bg-gray-50/40 p-4 rounded-2xl border border-gray-100/80 space-y-3 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <h4 className="font-bold text-xs text-text-primary uppercase tracking-wide">📊 Analytics Hub</h4>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Tracks daily metrics, completion ratios, and timeline risk assessment scores automatically.
                  </p>
                </div>
                <div className="text-[10px] text-primary bg-secondary px-2.5 py-1.5 rounded-lg font-bold border border-primary-border/20 self-start">
                  Example: Check target date alignment and completion probability rates
                </div>
              </div>

            </div>
          </div>

        </div>
      )}
    </div>
  );
};
