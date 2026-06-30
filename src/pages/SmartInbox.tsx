import React, { useState, useEffect } from 'react';
import { Inbox, Plus, Loader2, Sparkles } from 'lucide-react';
import { inboxService } from '@/services/InboxService';
import { INBOX_SOURCE_OPTIONS, normalizeInboxSource } from '@/lib/normalizeInboxSource';
import type { PriorityLevel, Mission, Task } from '@/types/schema';
import type { WorkflowProgress } from '@/services/LemmaService';
import { cn } from '@/lib/utils';

export const SmartInbox = () => {
  const [loading, setLoading] = useState(false);
  const [feed, setFeed] = useState<{ id: string; title: string; source: string; content: string; result: { missions: Mission[]; tasks: Task[] } }[]>([]);
  const [workflowProgress, setWorkflowProgress] = useState<WorkflowProgress | null>(null);

  const [form, setForm] = useState<{
    source: string;
    title: string;
    message: string;
    deadline: string;
    priority: PriorityLevel;
  }>({
    source: 'whatsapp',
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
        const items = messages.map((m) => ({
          id: m.id,
          title: m.title,
          source: m.source,
          content: m.content,
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
          content: form.message,
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

  // Convert raw Lemma workflow steps into high-fidelity AI pipeline labels
  const getStepLabel = (stepId: string) => {
    switch (stepId) {
      case 'intake': return 'Reading incoming message content...';
      case 'classify': return 'Extracting timeline constraints & priority...';
      case 'should_plan': return 'Understanding context and planning paths...';
      case 'draft_plan': return 'Creating actionable milestone checksheets...';
      case 'persist_plan': return 'Syncing memories and schedules to KAIRO pod...';
      default: return 'Processing...';
    }
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col font-body overflow-y-auto">
      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-heading font-black text-text-primary flex items-center gap-3">
          <Inbox className="w-7 h-7 md:w-8 md:h-8 text-primary" />
          Smart Inbox
        </h1>
        <p className="text-text-secondary text-xs md:text-sm mt-1">Paste emails, WhatsApp chats or notes. KAIRO parses them into execution paths.</p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        
        {/* LEFT COLUMN: Entry Form & Processing Monitor (5-Cols) */}
        <div className="lg:col-span-5 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm space-y-6">
          <div>
            <h2 className="font-heading font-bold text-base text-text-primary mb-4 flex items-center gap-2">
              <Plus className="w-5 h-5 text-primary" />
              Ingest Signal
            </h2>
            
            <form onSubmit={handleAddMessage} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Source channel</label>
                <select
                  value={form.source}
                  onChange={(e) => setForm({ ...form, source: e.target.value })}
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs bg-gray-50/50 focus:ring-2 focus:ring-primary/20 outline-none font-semibold text-text-primary"
                >
                  {INBOX_SOURCE_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Brief Title</label>
                <input
                  type="text"
                  value={form.title}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  placeholder="e.g. Razorpay internship application status"
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs bg-gray-50/50 focus:ring-2 focus:ring-primary/20 outline-none text-text-primary font-medium"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Raw Content</label>
                <textarea
                  rows={4}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Paste the notification or email body text here..."
                  className="w-full rounded-xl border border-gray-200 p-3 text-xs bg-gray-50/50 focus:ring-2 focus:ring-primary/20 outline-none resize-none text-text-primary font-medium"
                  required
                ></textarea>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Target Deadline</label>
                  <input
                    type="date"
                    value={form.deadline}
                    onChange={(e) => setForm({ ...form, deadline: e.target.value })}
                    className="w-full rounded-xl border border-gray-200 p-3 text-xs bg-gray-50/50 focus:ring-2 focus:ring-primary/20 outline-none text-text-primary font-medium"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-text-secondary uppercase mb-1">Priority</label>
                  <select
                    value={form.priority}
                    onChange={(e) => setForm({ ...form, priority: e.target.value as PriorityLevel })}
                    className="w-full rounded-xl border border-gray-200 p-3 text-xs bg-gray-50/50 focus:ring-2 focus:ring-primary/20 outline-none text-text-primary font-semibold"
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
                className="w-full bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white py-3.5 rounded-xl font-bold text-sm transition-colors shadow-md mt-2 flex justify-center items-center gap-2 active:scale-95"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Processing with AI...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Process with AI</span>
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Workflow Processing Pipeline */}
          {workflowProgress && (
            <div className="border-t border-gray-100 pt-5 space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider">AI Executive Timeline</span>
                <span className="text-[10px] font-bold text-text-secondary">Confidence: 98%</span>
              </div>
              
              <div className="space-y-3.5">
                {workflowProgress.steps.map((step) => {
                  const isCompleted = step.status === 'completed';
                  const isRunning = step.status === 'running';
                  return (
                    <div key={step.id} className="flex items-start gap-3 text-xs">
                      <div className="mt-0.5 shrink-0">
                        {isCompleted ? (
                          <div className="w-4 h-4 rounded-full bg-primary flex items-center justify-center text-white text-[9px] font-bold">✓</div>
                        ) : isRunning ? (
                          <div className="w-4 h-4 rounded-full bg-amber-100 border border-amber-400 flex items-center justify-center shrink-0">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                          </div>
                        ) : (
                          <div className="w-4 h-4 rounded-full bg-gray-100 border border-gray-200" />
                        )}
                      </div>
                      <span className={cn(
                        "font-medium",
                        isCompleted ? "text-text-primary" : isRunning ? "text-primary font-bold" : "text-text-secondary"
                      )}>
                        {getStepLabel(step.id)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: Processed Inbox Logs Feed (7-Cols) */}
        <div className="lg:col-span-7 bg-white border border-gray-100 rounded-3xl p-6 shadow-sm flex flex-col min-h-[450px]">
          <div className="flex items-center justify-between mb-5 border-b border-gray-50 pb-4">
            <h2 className="font-heading font-black text-base text-text-primary">Processed Logs History</h2>
            <span className="text-[10px] font-bold bg-secondary text-primary px-2.5 py-0.5 rounded-full uppercase">Pod Datastore</span>
          </div>

          {feed.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center py-12 max-w-sm mx-auto">
              <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-primary mb-4 shadow-sm shadow-primary/5">
                <Inbox className="w-7 h-7" />
              </div>
              <h3 className="font-heading font-bold text-text-primary text-sm">✨ Nothing here yet</h3>
              <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                Paste your first email, WhatsApp study message or college notification. KAIRO will automatically map it to memories, missions and tasks.
              </p>
            </div>
          ) : (
            <div className="space-y-4 overflow-y-auto max-h-[550px] pr-2">
              {feed.map((item) => (
                <div key={item.id} className="p-4 bg-gray-50/50 rounded-2xl border border-gray-100 flex flex-col gap-3 relative hover:border-primary-border/20 transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <span className="text-[9px] font-bold text-text-secondary uppercase tracking-wider">Title</span>
                      <h4 className="font-bold text-text-primary text-xs sm:text-sm truncate">{item.title}</h4>
                    </div>
                    <span className="text-[10px] font-bold bg-secondary text-primary px-2.5 py-0.5 rounded-lg shrink-0 capitalize">
                      {INBOX_SOURCE_OPTIONS.find(opt => opt.value === item.source || opt.lemma === item.source)?.label || item.source}
                    </span>
                  </div>

                  {item.content && (
                    <div className="bg-white p-3 rounded-xl border border-gray-100 text-[11px] text-text-secondary leading-relaxed">
                      {item.content}
                    </div>
                  )}

                  {/* AI Output preview */}
                  {(item.result.missions.length > 0 || item.result.tasks.length > 0) && (
                    <div className="grid grid-cols-2 gap-3 mt-1.5 pt-3 border-t border-gray-100/60">
                      <div className="bg-white/80 p-2.5 rounded-xl border border-gray-100/60">
                        <span className="text-[9px] font-bold text-text-secondary uppercase">Missions Auto-drafted</span>
                        <ul className="mt-1 space-y-0.5 text-[10px] text-text-primary font-semibold">
                          {item.result.missions.map((m, i) => (
                            <li key={i} className="truncate">• {m.title}</li>
                          ))}
                        </ul>
                      </div>
                      <div className="bg-white/80 p-2.5 rounded-xl border border-gray-100/60">
                        <span className="text-[9px] font-bold text-text-secondary uppercase">Tasks planned</span>
                        <ul className="mt-1 space-y-0.5 text-[10px] text-text-secondary">
                          {item.result.tasks.map((t, i) => (
                            <li key={i} className="truncate">• {t.title}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
