import React, { useState, useEffect, useRef } from 'react';
import { inboxService } from '@/services/InboxService';
import { INBOX_SOURCE_OPTIONS, normalizeInboxSource } from '@/lib/normalizeInboxSource';
import type { PriorityLevel, Mission, Task } from '@/types/schema';
import type { WorkflowProgress } from '@/services/LemmaService';

/* ─── Pipeline step definitions ─────────────────────────────────────────── */
const PIPELINE_STEPS = [
  { id: 'intake',       icon: '📥', label: 'Extracting',        sub: 'Reading signal content…' },
  { id: 'classify',     icon: '🔍', label: 'Classifying',       sub: 'Detecting intent & context…' },
  { id: 'should_plan',  icon: '🧠', label: 'AI Thinking',       sub: 'Planning execution paths…' },
  { id: 'draft_plan',   icon: '🎯', label: 'Creating Mission',  sub: 'Building mission blueprint…' },
  { id: 'persist_plan', icon: '📅', label: 'Creating Calendar', sub: 'Scheduling milestones…' },
  { id: 'brain',        icon: '💡', label: 'Updating Brain',    sub: 'Writing to memory pod…' },
];

type StepStatus = 'idle' | 'running' | 'done' | 'completed' | 'failed';
interface PipelineState {
  steps: Record<string, StepStatus>;
  currentLabel: string;
  done: boolean;
}

type FeedItem = {
  id: string;
  title: string;
  source: string;
  content: string;
  result: { missions: Mission[]; tasks: Task[] };
  processedAt: Date;
};

/* ─── Main Component ─────────────────────────────────────────────────────── */
export const SmartInbox = () => {
  const [phase, setPhase] = useState<'idle' | 'typing' | 'processing' | 'done'>('idle');
  const [text, setText] = useState('');
  const [title, setTitle] = useState('');
  const [source, setSource] = useState('whatsapp');
  const [priority, setPriority] = useState<PriorityLevel>('medium');
  const [pipeline, setPipeline] = useState<PipelineState>({
    steps: {},
    currentLabel: '',
    done: false,
  });
  const [feed, setFeed] = useState<FeedItem[]>([]);
  const [latestResult, setLatestResult] = useState<FeedItem | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Load history on mount
  useEffect(() => {
    inboxService.getMessages().then((msgs) => {
      setFeed(
        msgs.map((m) => ({
          id: m.id,
          title: m.title,
          source: m.source,
          content: m.content,
          result: { missions: [], tasks: [] },
          processedAt: new Date(),
        }))
      );
    }).catch(() => {});
  }, []);

  // Auto-focus textarea when idle
  useEffect(() => {
    if (phase === 'idle' || phase === 'typing') {
      textareaRef.current?.focus();
    }
  }, [phase]);

  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setText(e.target.value);
    setPhase(e.target.value.trim() ? 'typing' : 'idle');
  };

  const handleProcess = async () => {
    if (!text.trim()) return;

    // Auto-derive title if not set
    const autoTitle = title.trim() || text.trim().split('\n')[0].slice(0, 60);

    setPhase('processing');
    setPipeline({ steps: {}, currentLabel: 'Initializing…', done: false });
    setLatestResult(null);

    try {
      const result = await inboxService.processMessage(
        {
          source: normalizeInboxSource(source),
          title: autoTitle,
          content: text,
          priority,
        },
        (progress: WorkflowProgress) => {
          const newSteps: Record<string, StepStatus> = {};
          let currentLabel = '';

          progress.steps.forEach((s) => {
            newSteps[s.id] = s.status as StepStatus;
            if (s.status === 'running') currentLabel = PIPELINE_STEPS.find(p => p.id === s.id)?.label ?? 'Processing…';
          });

          // If all are done, show brain update step
          const allDone = progress.steps.every(s => s.status === 'completed');
          if (allDone) {
            newSteps['brain'] = 'running';
            currentLabel = 'Updating Brain';
          }

          setPipeline({ steps: newSteps, currentLabel, done: false });
        }
      );

      // Mark brain done → full done
      setPipeline((p) => ({ ...p, steps: { ...p.steps, brain: 'done' }, currentLabel: 'Done', done: true }));

      const item: FeedItem = {
        id: Date.now().toString(),
        title: autoTitle,
        source,
        content: text,
        result,
        processedAt: new Date(),
      };

      setLatestResult(item);
      setFeed((prev) => [item, ...prev]);

      // Wait a moment then show done
      setTimeout(() => {
        setPhase('done');
      }, 600);

    } catch (err) {
      console.error('[SmartInbox]', err);
      setPhase('typing');
    }
  };

  const handleReset = () => {
    setText('');
    setTitle('');
    setSource('whatsapp');
    setPriority('medium');
    setPhase('idle');
    setPipeline({ steps: {}, currentLabel: '', done: false });
    setLatestResult(null);
  };

  return (
    <div className="relative min-h-screen bg-[#f8f8fc] font-body overflow-hidden flex flex-col animate-page-reveal">

      {/* ── Background decorative blobs ── */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 w-96 h-96 rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #6366f1, transparent)' }} />
        <div className="absolute top-1/2 -right-24 w-80 h-80 rounded-full opacity-[0.05]"
          style={{ background: 'radial-gradient(circle, #8b5cf6, transparent)' }} />
      </div>

      <div className="relative z-10 flex-1 flex flex-col max-w-3xl mx-auto w-full px-4 py-10 md:py-16">

        {/* ── HEADER ── */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-indigo-50 border border-indigo-100 rounded-full px-4 py-1.5 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
            <span className="text-[11px] font-extrabold text-indigo-600 uppercase tracking-widest">Smart Inbox</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-heading font-black text-gray-900 leading-tight">
            Paste Anything.<br />
            <span className="text-transparent bg-clip-text"
              style={{ backgroundImage: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              KAIRO Takes It From Here.
            </span>
          </h1>
          <p className="text-sm text-gray-400 mt-3 font-medium">
            Emails · WhatsApp · Announcements · Links · PDFs · Plain text
          </p>
        </div>

        {/* ── PHASES ── */}
        {(phase === 'idle' || phase === 'typing') && (
          <InputPhase
            text={text}
            title={title}
            source={source}
            priority={priority}
            textareaRef={textareaRef}
            onTextChange={handleTextChange}
            onTitleChange={setTitle}
            onSourceChange={setSource}
            onPriorityChange={setPriority}
            onProcess={handleProcess}
          />
        )}

        {phase === 'processing' && (
          <ProcessingPhase pipeline={pipeline} text={text} />
        )}

        {phase === 'done' && latestResult && (
          <DonePhase item={latestResult} onReset={handleReset} />
        )}

        {/* ── FEED HISTORY ── */}
        {feed.length > 0 && phase !== 'processing' && (
          <div className="mt-12">
            <div className="flex items-center gap-3 mb-5">
              <div className="h-px flex-1 bg-gray-200" />
              <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Processed History</span>
              <div className="h-px flex-1 bg-gray-200" />
            </div>
            <div className="space-y-3">
              {feed.slice(0, 8).map((item) => (
                <FeedCard key={item.id} item={item} />
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

/* ─── INPUT PHASE ────────────────────────────────────────────────────────── */
interface InputPhaseProps {
  text: string;
  title: string;
  source: string;
  priority: PriorityLevel;
  textareaRef: React.RefObject<HTMLTextAreaElement | null>;
  onTextChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onTitleChange: (v: string) => void;
  onSourceChange: (v: string) => void;
  onPriorityChange: (v: PriorityLevel) => void;
  onProcess: () => void;
}

function InputPhase({ text, title, source, priority, textareaRef, onTextChange, onTitleChange, onSourceChange, onPriorityChange, onProcess }: InputPhaseProps) {
  const hasText = text.trim().length > 0;

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Big paste area */}
      <div className={`relative rounded-3xl border-2 transition-all duration-300 overflow-hidden shadow-sm
        ${hasText
          ? 'border-indigo-300 shadow-indigo-100 bg-white'
          : 'border-dashed border-gray-200 bg-white hover:border-indigo-200'}`}>

        {!hasText && (
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none gap-3">
            <div className="text-5xl opacity-20">📋</div>
            <p className="text-gray-300 font-semibold text-sm">Paste anything here…</p>
          </div>
        )}

        <textarea
          ref={textareaRef}
          value={text}
          onChange={onTextChange}
          rows={8}
          className="w-full bg-transparent p-6 text-sm text-gray-800 placeholder-transparent outline-none resize-none leading-relaxed font-medium"
          placeholder="Paste anything here…"
          spellCheck={false}
        />
      </div>

      {/* Optional meta — only show when text is present */}
      {hasText && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4 animate-fade-in">
          <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">Optional Details</p>

          <div>
            <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Title (Optional - auto-detected if blank)</label>
            <input
              type="text"
              value={title}
              onChange={(e) => onTitleChange(e.target.value)}
              placeholder="Optional (e.g. Gappy AI Hackathon Registration)"
              className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-200 outline-none text-gray-800 font-medium"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Source</label>
              <select
                value={source}
                onChange={(e) => onSourceChange(e.target.value)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold text-gray-800"
              >
                {INBOX_SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[11px] font-bold text-gray-500 mb-1.5">Priority</label>
              <select
                value={priority}
                onChange={(e) => onPriorityChange(e.target.value as PriorityLevel)}
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-200 outline-none font-semibold text-gray-800"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent 🔥</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* CTA */}
      <button
        disabled={!hasText}
        onClick={onProcess}
        className={`w-full py-4 rounded-2xl font-black text-base transition-all duration-300 flex items-center justify-center gap-3 shadow-lg active:scale-[0.98]
          ${hasText
            ? 'bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-indigo-200 hover:shadow-indigo-300 hover:scale-[1.01]'
            : 'bg-gray-100 text-gray-300 cursor-not-allowed shadow-none'}`}
      >
        <span className="text-lg">✨</span>
        <span>Let KAIRO Handle This</span>
        {hasText && <span className="text-lg">→</span>}
      </button>
    </div>
  );
}

/* ─── PROCESSING PHASE ───────────────────────────────────────────────────── */
interface ProcessingPhaseProps {
  pipeline: PipelineState;
  text: string;
}

function ProcessingPhase({ pipeline, text }: ProcessingPhaseProps) {
  const [visibleCount, setVisibleCount] = useState(0);
  const [elapsedDots, setElapsedDots] = useState('');

  // Stagger step reveals
  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setVisibleCount(i);
      if (i >= PIPELINE_STEPS.length) clearInterval(interval);
    }, 220);
    return () => clearInterval(interval);
  }, []);

  // Animated dots
  useEffect(() => {
    const interval = setInterval(() => {
      setElapsedDots((d) => d.length >= 3 ? '' : d + '.');
    }, 400);
    return () => clearInterval(interval);
  }, []);

  const getStatus = (id: string): StepStatus => pipeline.steps[id] ?? 'idle';

  return (
    <div className="animate-fade-in">
      {/* Content preview */}
      <div className="bg-white rounded-2xl border border-gray-100 p-5 mb-6 shadow-sm">
        <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Processing Signal</p>
        <p className="text-sm text-gray-600 leading-relaxed line-clamp-3 font-medium">{text}</p>
      </div>

      {/* Pipeline card */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-md overflow-hidden">
        {/* Top bar */}
        <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between"
          style={{ background: 'linear-gradient(135deg, #fafafe 0%, #f5f5ff 100%)' }}>
          <div className="flex items-center gap-2.5">
            <div className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
            <span className="text-sm font-extrabold text-gray-800">
              {pipeline.currentLabel || 'Starting'}{elapsedDots}
            </span>
          </div>
          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-50 border border-indigo-100 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            AI Active
          </span>
        </div>

        {/* Steps */}
        <div className="p-6 space-y-0">
          {PIPELINE_STEPS.map((step, i) => {
            const status = getStatus(step.id);
            const isVisible = i < visibleCount;
            const isRunning = status === 'running';
            const isDone = status === 'done' || status === 'completed' || (status === 'idle' && i < PIPELINE_STEPS.findIndex(s => getStatus(s.id) === 'running'));
            const isLast = i === PIPELINE_STEPS.length - 1;

            return (
              <div key={step.id} className={`flex items-start gap-4 transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                {/* Left: icon + connector */}
                <div className="flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-lg shrink-0 transition-all duration-300 border
                    ${isRunning ? 'bg-indigo-50 border-indigo-200 shadow-sm shadow-indigo-100 scale-110' :
                      isDone ? 'bg-emerald-50 border-emerald-200' :
                      'bg-gray-50 border-gray-100'}`}>
                    {isDone ? '✅' : isRunning ? (
                      <span className="text-indigo-500 text-base animate-spin inline-block">⚙️</span>
                    ) : (
                      <span className="opacity-40">{step.icon}</span>
                    )}
                  </div>
                  {!isLast && (
                    <div className={`w-0.5 h-6 my-1 rounded-full transition-all duration-500
                      ${isDone ? 'bg-emerald-300' : 'bg-gray-100'}`} />
                  )}
                </div>

                {/* Right: text */}
                <div className={`pb-1 flex-1 flex items-center min-h-[40px]`}>
                  <div>
                    <p className={`text-sm font-bold transition-colors duration-200
                      ${isRunning ? 'text-indigo-600' : isDone ? 'text-gray-700' : 'text-gray-300'}`}>
                      {step.label}
                    </p>
                    <p className={`text-xs transition-colors duration-200
                      ${isRunning ? 'text-indigo-400' : isDone ? 'text-gray-400' : 'text-gray-200'}`}>
                      {isDone ? '✓ Complete' : isRunning ? step.sub : step.sub}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}

          {/* Done row */}
          {pipeline.done && (
            <div className="flex items-center gap-4 animate-fade-in mt-2">
              <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-lg bg-emerald-50 border border-emerald-200 shadow-sm shadow-emerald-100">
                🎉
              </div>
              <div>
                <p className="text-sm font-black text-emerald-600">Done!</p>
                <p className="text-xs text-emerald-400">Mission created & Brain updated</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

/* ─── DONE PHASE ─────────────────────────────────────────────────────────── */
interface DonePhaseProps {
  item: FeedItem;
  onReset: () => void;
}

function DonePhase({ item, onReset }: DonePhaseProps) {
  const missionCount = item.result.missions.length;
  const taskCount = item.result.tasks.length;

  return (
    <div className="animate-fade-in space-y-5">
      {/* Success hero */}
      <div className="rounded-3xl overflow-hidden shadow-xl text-white p-7 text-center relative"
        style={{ background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)' }}>
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)' }} />
        <div className="relative z-10">
          <div className="text-5xl mb-3">🎉</div>
          <h2 className="text-2xl font-heading font-black mb-1">Done!</h2>
          <p className="text-indigo-200 text-sm font-medium">"{item.title}"</p>

          <div className="flex items-center justify-center gap-6 mt-5">
            <div className="text-center">
              <p className="text-3xl font-black">{missionCount || '—'}</p>
              <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider mt-0.5">Missions</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-black">{taskCount || '—'}</p>
              <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider mt-0.5">Tasks</p>
            </div>
            <div className="w-px h-10 bg-white/20" />
            <div className="text-center">
              <p className="text-3xl font-black">✓</p>
              <p className="text-indigo-300 text-xs font-bold uppercase tracking-wider mt-0.5">Brain</p>
            </div>
          </div>
        </div>
      </div>

      {/* Generated items */}
      {(missionCount > 0 || taskCount > 0) && (
        <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm space-y-4">
          {missionCount > 0 && (
            <div>
              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Missions Created</p>
              <div className="space-y-2">
                {item.result.missions.map((m, i) => (
                  <div key={i} className="flex items-center gap-3 bg-indigo-50 rounded-xl px-4 py-2.5 border border-indigo-100">
                    <span className="text-indigo-500">🎯</span>
                    <span className="text-sm font-semibold text-gray-800 truncate">{m.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
          {taskCount > 0 && (
            <div>
              <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-2">Tasks Planned</p>
              <div className="space-y-1.5">
                {item.result.tasks.slice(0, 5).map((t, i) => (
                  <div key={i} className="flex items-center gap-2.5 px-3 py-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-violet-400 shrink-0" />
                    <span className="text-sm text-gray-600 font-medium truncate">{t.title}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      <button
        onClick={onReset}
        className="w-full py-4 rounded-2xl font-black text-base bg-gradient-to-r from-indigo-500 to-violet-500 text-white shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
      >
        <span>📋</span>
        <span>Paste Another Signal</span>
      </button>
    </div>
  );
}

/* ─── FEED CARD ──────────────────────────────────────────────────────────── */
function FeedCard({ item }: { item: FeedItem }) {
  const src = INBOX_SOURCE_OPTIONS.find(o => o.value === item.source || o.lemma === item.source);
  return (
    <div className="bg-white rounded-2xl border border-gray-100 px-5 py-4 shadow-sm hover:border-indigo-200 hover:shadow-indigo-50 transition-all duration-200 flex items-start gap-4">
      <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-sm shrink-0">
        ✅
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-bold text-gray-800 truncate">{item.title}</p>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{item.content?.slice(0, 80)}…</p>
      </div>
      <span className="text-[10px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 px-2.5 py-1 rounded-full shrink-0 capitalize">
        {src?.label || item.source}
      </span>
    </div>
  );
}
