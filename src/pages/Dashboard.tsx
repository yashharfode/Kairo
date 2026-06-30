import { useEffect, useState } from 'react';
import { missionService } from '@/services/MissionService';
import { memoryService } from '@/services/MemoryService';
import type { Mission, Task, Memory } from '@/types/schema';
import { Calendar, Target, Brain, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Dashboard = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [m, t, mem] = await Promise.all([
          missionService.getMissions(),
          missionService.getTasks(),
          memoryService.getMemories(),
        ]);
        setMissions(m);
        setTasks(t);
        setMemories(mem);
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

  return (
    <div className="p-8 font-body">
      <header className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-text-primary">Dashboard</h1>
        <p className="text-text-secondary mt-1">Welcome back. Here is your KAIRO executive overview.</p>
      </header>

      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      ) : (
        <div className="space-y-8">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Active Missions</p>
                <h3 className="text-3xl font-heading font-bold text-text-primary mt-2">{activeMissions.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                <Target className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">Pending Tasks</p>
                <h3 className="text-3xl font-heading font-bold text-text-primary mt-2">{pendingTasks.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600">
                <Calendar className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-surface rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-text-secondary">AI Memories</p>
                <h3 className="text-3xl font-heading font-bold text-text-primary mt-2">{memories.length}</h3>
              </div>
              <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                <Brain className="w-6 h-6" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Today's Focus */}
            <div className="lg:col-span-2 bg-surface rounded-2xl p-6 border border-gray-100 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="font-heading font-bold text-lg text-text-primary">Today's Focus Tasks</h2>
                <Link to="/tasks" className="text-xs font-semibold text-primary flex items-center gap-1 hover:underline">
                  View Tasks <ArrowRight className="w-3 h-3" />
                </Link>
              </div>

              {pendingTasks.length === 0 ? (
                <div className="text-center py-8 text-text-secondary text-sm">
                  <CheckCircle2 className="w-12 h-12 mx-auto text-emerald-500 mb-2" />
                  All caught up! Let KAIRO plan your next steps.
                </div>
              ) : (
                <div className="space-y-3">
                  {pendingTasks.slice(0, 5).map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-xl border border-gray-100 text-sm">
                      <div className="flex items-center gap-3">
                        <span
                          className={`w-2.5 h-2.5 rounded-full ${
                            task.priority === 'urgent'
                              ? 'bg-red-500'
                              : task.priority === 'high'
                              ? 'bg-orange-500'
                              : 'bg-primary'
                          }`}
                        ></span>
                        <span className="font-medium text-text-primary">{task.title}</span>
                      </div>
                      {task.estimatedDuration && (
                        <span className="text-xs bg-gray-200 text-text-secondary px-2 py-0.5 rounded">
                          {task.estimatedDuration} mins
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Insights & Context */}
            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/10 flex flex-col justify-between">
              <div>
                <h2 className="font-heading font-bold text-lg text-primary mb-3">AI Insights</h2>
                {memories.length > 0 ? (
                  <div className="space-y-4">
                    <p className="text-sm text-text-primary">
                      Based on your latest context, you are actively working on:
                    </p>
                    <div className="bg-white/80 backdrop-blur-sm p-4 rounded-xl border border-primary/10 text-xs text-text-secondary leading-relaxed shadow-sm">
                      "{memories[0].content}"
                    </div>
                    <p className="text-xs text-text-secondary">
                      Use the <strong>Smart Inbox</strong> to ingest new communications and update KAIRO's timeline memory.
                    </p>
                  </div>
                ) : (
                  <p className="text-sm text-primary/80 leading-relaxed">
                    KAIRO has no context saved yet. Start by pasting notifications or emails in the Smart Inbox to bootstrap the intelligence loop.
                  </p>
                )}
              </div>
              <Link
                to="/inbox"
                className="bg-primary hover:bg-primary-hover text-white py-3 rounded-xl font-medium text-center text-sm transition-colors shadow-sm shadow-primary/20 mt-6 block"
              >
                Go to Smart Inbox
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
