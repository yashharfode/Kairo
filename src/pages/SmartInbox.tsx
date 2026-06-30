import { useState, useEffect } from 'react';
import { Inbox, Plus, Loader2 } from 'lucide-react';
import { inboxService } from '@/services/InboxService';
import { InboxSource } from '@/types/schema';
import { INBOX_SOURCE_OPTIONS, normalizeInboxSource } from '@/lib/normalizeInboxSource';
import type { PriorityLevel, Mission, Task } from '@/types/schema';
import type { WorkflowProgress } from '@/services/LemmaService';

export const SmartInbox = () => {
  const [loading, setLoading] = useState(false);
  const [feed, setFeed] = useState<{ id: string; title: string; source: string; result: { missions: Mission[]; tasks: Task[] } }[]>([]);
  const [workflowProgress, setWorkflowProgress] = useState<WorkflowProgress | null>(null);

  const [form, setForm] = useState<{
    source: string; // Keep as string in form state so we can hold raw values from drop down option values
    title: string;
    message: string;
    deadline: string;
    priority: PriorityLevel;
  }>({
    source: 'whatsapp', // Maps to InboxSource.CHAT
    title: '',
    message: '',
    deadline: '',
    priority: 'medium',
  });

  // Load existing feed from Lemma on startup
  useEffect(() => {
    const loadInbox = async () => {
      try {
        const messages = await inboxService.getMessages();
        // Since getMessages returns log rows, we can map them directly.
        // In a production scenario, we'd load plans created from these logs,
        // but for now we map logs as feed items
        const items = messages.map((m) => ({
          id: m.id,
          title: m.title,
          source: m.source,
          result: { missions: [], tasks: [] },
        }));
        setFeed(items);
      } catch (err) {
        console.error('[SmartInbox] Failed to load inbox log history:', err);
      }
    };
    loadInbox();
  }, []);

  const handleAddMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.title || !form.message) return;

    setLoading(true);
    setWorkflowProgress(null);
    try {
      const result = await inboxService.processMessage(
        {
          source: normalizeInboxSource(form.source),
          title: form.title,
          content: form.message,
          deadline: form.deadline || undefined,
          priority: form.priority,
        },
        (progress: WorkflowProgress) => {
          setWorkflowProgress(progress);
        }
      );

      setFeed((prevFeed) => [
        {
          id: Date.now().toString(),
          title: form.title,
          source: form.source,
          result,
        },
        ...prevFeed,
      ]);

      setForm({
        source: 'whatsapp',
        title: '',
        message: '',
        deadline: '',
        priority: 'medium',
      });
      setWorkflowProgress(null);
    } catch (error) {
      console.error('[SmartInbox] AI processing error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col font-body">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary flex items-center gap-3">
            <Inbox className="w-8 h-8 text-primary" />
            Smart Inbox
          </h1>
          <p className="text-text-secondary mt-1">Manual data entry for KAIRO's execution engine.</p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 flex-1 min-h-0">
        {/* Entry Form */}
        <div className="lg:col-span-1 bg-surface rounded-2xl p-6 border border-gray-100 shadow-sm overflow-y-auto flex flex-col justify-between">
          <div>
            <h2 className="font-heading font-bold text-lg mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              New Information
            </h2>
            <form onSubmit={handleAddMessage} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Source</label>
                <select
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="w-full rounded-lg border border-gray-200 p-2.5 text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                >
                  {INBOX_SOURCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g., Gappy AI Hackathon"
                  className="w-full rounded-lg border border-gray-200 p-2.5 text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-text-secondary mb-1">Message Content</label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Paste the message details here..."
                  className="w-full rounded-lg border border-gray-200 p-2.5 text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Deadline (Optional)</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full rounded-lg border border-gray-200 p-2.5 text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-text-secondary mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as PriorityLevel })}
                    className="w-full rounded-lg border border-gray-200 p-2.5 text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <button
                disabled={loading}
                type="submit"
                className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white py-3 rounded-xl font-medium transition-colors shadow-sm shadow-primary/20 mt-4 flex justify-center items-center gap-2"
              >
                {loading && <Loader2 className="w-4 h-4 animate-spin" />}
                {loading ? 'Processing...' : 'Process with AI'}
              </button>
            </form>
          </div>

          {/* Workflow Live Progress Monitor */}
          {workflowProgress && (
            <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-xl space-y-3 shadow-inner">
              <p className="text-sm font-semibold text-text-primary flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary shrink-0" />
                <span>Processing Inbox...</span>
              </p>
              <div className="space-y-2 pl-2">
                {workflowProgress.steps.map((step) => (
                  <div key={step.id} className="flex items-center gap-2.5 text-sm">
                    {step.status === 'completed' && <span className="text-emerald-500 font-semibold shrink-0">🟢</span>}
                    {step.status === 'running' && <span className="text-amber-500 font-semibold animate-pulse shrink-0">🟡</span>}
                    {step.status === 'pending' && <span className="text-gray-300 shrink-0">⚪</span>}
                    {step.status === 'failed' && <span className="text-red-500 shrink-0">🔴</span>}
                    <span
                      className={`${
                        step.status === 'running'
                          ? 'font-medium text-text-primary'
                          : step.status === 'completed'
                          ? 'text-text-primary'
                          : 'text-text-secondary'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                ))}
              </div>
              {workflowProgress.status === 'COMPLETED' && (
                <div className="text-xs text-emerald-600 bg-emerald-50 p-2 rounded-lg border border-emerald-100 flex items-center gap-1.5">
                  <span>🟢</span>
                  <span className="font-semibold">Workflow Completed Successfully!</span>
                </div>
              )}
              {workflowProgress.error && (
                <p className="text-xs text-red-500 mt-2 bg-red-50 p-2 rounded-lg border border-red-100">
                  Error: {workflowProgress.error}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Inbox Feed */}
        <div className="lg:col-span-2 bg-surface rounded-2xl p-6 border border-gray-100 shadow-sm flex flex-col overflow-y-auto">
          <h2 className="font-heading font-bold text-lg mb-4">Processed Feed</h2>

          {feed.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-50">
              <Inbox className="w-16 h-16 mb-4 text-text-secondary" />
              <h3 className="font-semibold text-text-primary">Inbox is empty</h3>
              <p className="text-sm text-text-secondary max-w-sm mt-2">
                Paste a message or event on the left to see KAIRO's timeline intelligence in action.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {feed.map((item) => (
                <div key={item.id} className="bg-gray-50/50 p-5 rounded-2xl border border-gray-100">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-text-primary">{item.title}</h3>
                    <span className="text-xs font-medium bg-secondary text-primary px-2.5 py-1 rounded-md">
                      {INBOX_SOURCE_OPTIONS.find(opt => opt.value === item.source || opt.lemma === item.source)?.label || item.source}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-white p-3 rounded-xl border border-gray-100">
                      <p className="text-xs font-semibold text-text-secondary uppercase mb-2">Detected Missions</p>
                      <ul className="space-y-1">
                        {item.result.missions.length > 0 ? (
                          item.result.missions.map((m: Mission, i: number) => (
                            <li key={i} className="text-sm font-medium text-text-primary flex items-start gap-2">
                              <div className="w-1.5 h-1.5 rounded-full bg-primary mt-1.5 shrink-0"></div>
                              {m.title}
                            </li>
                          ))
                        ) : (
                          <li className="text-xs text-text-secondary italic">No active missions created</li>
                        )}
                      </ul>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-gray-100">
                      <p className="text-xs font-semibold text-text-secondary uppercase mb-2">Generated Tasks</p>
                      <ul className="space-y-1">
                        {item.result.tasks.length > 0 ? (
                          item.result.tasks.map((t: Task, i: number) => (
                            <li key={i} className="text-sm text-text-secondary flex justify-between items-center">
                              <span>{t.title}</span>
                              {t.estimatedDuration && (
                                <span className="text-xs bg-gray-100 px-1.5 py-0.5 rounded">{t.estimatedDuration}m</span>
                              )}
                            </li>
                          ))
                        ) : (
                          <li className="text-xs text-text-secondary italic">No tasks planned yet</li>
                        )}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
