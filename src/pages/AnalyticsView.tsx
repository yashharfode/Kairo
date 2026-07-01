import { useEffect, useState } from 'react';
import { BarChart3, Target, CheckSquare, Brain, Zap, Loader2 } from 'lucide-react';
import { missionService } from '@/services/MissionService';
import { memoryService } from '@/services/MemoryService';
import type { Mission, Task, Memory } from '@/types/schema';

export const AnalyticsView = () => {
  const [missions, setMissions] = useState<Mission[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [m, t, mem] = await Promise.all([
          missionService.getMissions(),
          missionService.getTasks(),
          memoryService.getMemories(),
        ]);
        setMissions(m);
        setTasks(t);
        setMemories(mem);
      } catch (err) {
        console.error('[Analytics] Failed to load data:', err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const completed = tasks.filter(t => t.status === 'completed').length;
  const inProgress = tasks.filter(t => t.status === 'in_progress').length;
  const todo = tasks.filter(t => t.status === 'todo').length;
  const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0;

  const priorityCounts = {
    urgent: tasks.filter(t => t.priority === 'urgent').length,
    high: tasks.filter(t => t.priority === 'high').length,
    medium: tasks.filter(t => t.priority === 'medium').length,
    low: tasks.filter(t => t.priority === 'low').length,
  };

  const stats = [
    { label: 'Active Missions', value: missions.filter(m => m.status === 'active').length, icon: Target, color: 'text-primary bg-primary/10' },
    { label: 'Total Tasks', value: tasks.length, icon: CheckSquare, color: 'text-indigo-600 bg-indigo-50' },
    { label: 'Completed Tasks', value: completed, icon: Zap, color: 'text-primary bg-primary/10' },
    { label: 'AI Memories', value: memories.length, icon: Brain, color: 'text-amber-600 bg-amber-50' },
  ];

  return (
    <div className="p-8 h-full flex flex-col font-body overflow-y-auto animate-page-reveal">
      <header className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-text-primary flex items-center gap-3">
          <BarChart3 className="w-8 h-8 text-primary" />
          Analytics
        </h1>
        <p className="text-text-secondary mt-1">Performance overview of your KAIRO execution engine.</p>
      </header>

      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Stat Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
            {stats.map(s => (
              <div key={s.label} className="bg-surface rounded-2xl p-5 border border-gray-100 shadow-sm flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.color}`}>
                  <s.icon className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-2xl font-heading font-bold text-text-primary">{s.value}</p>
                  <p className="text-xs text-text-secondary mt-0.5">{s.label}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Task Completion Donut (CSS-only) */}
            <div className="bg-surface border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="font-heading font-semibold text-text-primary mb-6">Task Completion Rate</h2>
              <div className="flex items-center gap-6">
                <div className="relative w-32 h-32 shrink-0">
                  <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                    <circle cx="18" cy="18" r="15.9" fill="none" stroke="#F1F5F9" strokeWidth="3" />
                    <circle
                      cx="18" cy="18" r="15.9" fill="none"
                      stroke="var(--color-primary)" strokeWidth="3"
                      strokeDasharray={`${completionRate} ${100 - completionRate}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-2xl font-bold text-text-primary">
                    {completionRate}%
                  </span>
                </div>
                <div className="space-y-3 text-sm flex-1">
                  {[
                    { label: 'Completed', count: completed, color: 'bg-primary' },
                    { label: 'In Progress', count: inProgress, color: 'bg-amber-400' },
                    { label: 'To Do', count: todo, color: 'bg-gray-300' },
                  ].map(item => (
                    <div key={item.label} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${item.color}`} />
                        <span className="text-text-secondary">{item.label}</span>
                      </div>
                      <span className="font-semibold text-text-primary">{item.count}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Priority Breakdown */}
            <div className="bg-surface border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="font-heading font-semibold text-text-primary mb-6">Tasks by Priority</h2>
              <div className="space-y-4">
                {[
                  { label: 'Urgent', count: priorityCounts.urgent, color: 'bg-red-500', max: tasks.length || 1 },
                  { label: 'High', count: priorityCounts.high, color: 'bg-orange-400', max: tasks.length || 1 },
                  { label: 'Medium', count: priorityCounts.medium, color: 'bg-primary', max: tasks.length || 1 },
                  { label: 'Low', count: priorityCounts.low, color: 'bg-gray-300', max: tasks.length || 1 },
                ].map(item => (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-text-secondary">{item.label}</span>
                      <span className="font-semibold text-text-primary">{item.count}</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${item.color}`}
                        style={{ width: `${(item.count / item.max) * 100}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mission List */}
          {missions.length > 0 && (
            <div className="bg-surface border border-gray-100 rounded-2xl p-6 shadow-sm">
              <h2 className="font-heading font-semibold text-text-primary mb-4">Mission Progress</h2>
              <div className="space-y-4">
                {missions.map(m => {
                  const mTasks = tasks.filter(t => t.missionId === m.id);
                  const mCompleted = mTasks.filter(t => t.status === 'completed').length;
                  const pct = mTasks.length > 0 ? Math.round((mCompleted / mTasks.length) * 100) : 0;
                  return (
                    <div key={m.id}>
                      <div className="flex items-center justify-between text-sm mb-1.5">
                        <span className="font-medium text-text-primary">{m.title}</span>
                        <span className="text-text-secondary">{pct}%</span>
                      </div>
                      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
