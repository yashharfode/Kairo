import React, { useEffect, useState } from 'react';
import { Brain, Search, Plus, Tag, Loader2, Sparkles, ArrowRight, TrendingUp, Trash2, BookOpen, Network, Lightbulb } from 'lucide-react';
import { memoryService } from '@/services/MemoryService';
import { lemmaClient } from '@/lib/lemmaClient';
import type { Memory } from '@/types/schema';
import { cn } from '@/lib/utils';

/* ─── Search Flow Visualizer ─────────────────────────────────────────────── */
const FLOW_STEPS = [
  { id: 'search',    icon: '🔍', label: 'Search',    color: 'from-violet-500 to-indigo-500' },
  { id: 'memory',    icon: '🧠', label: 'Memory',    color: 'from-indigo-500 to-blue-500' },
  { id: 'ai',        icon: '✨', label: 'AI',         color: 'from-blue-500 to-cyan-500' },
  { id: 'related',   icon: '🔗', label: 'Related',   color: 'from-cyan-500 to-emerald-500' },
  { id: 'knowledge', icon: '📚', label: 'Knowledge', color: 'from-emerald-500 to-teal-500' },
];

function SearchFlowBar({ activeStep }: { activeStep: number }) {
  return (
    <div className="flex items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
      {FLOW_STEPS.map((step, i) => {
        const isActive = i === activeStep;
        const isDone = i < activeStep;
        return (
          <React.Fragment key={step.id}>
            <div className={cn(
              'flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-bold transition-all duration-500 shrink-0',
              isActive
                ? `bg-gradient-to-r ${step.color} text-white border-transparent shadow-md scale-105`
                : isDone
                ? 'bg-emerald-50 text-emerald-600 border-emerald-200'
                : 'bg-white text-gray-300 border-gray-100'
            )}>
              <span>{step.icon}</span>
              <span>{step.label}</span>
              {isDone && <span className="text-[9px]">✓</span>}
              {isActive && <span className="w-1.5 h-1.5 rounded-full bg-white/70 animate-pulse" />}
            </div>
            {i < FLOW_STEPS.length - 1 && (
              <div className={cn(
                'w-5 h-0.5 shrink-0 rounded-full transition-all duration-500',
                i < activeStep ? 'bg-emerald-300' : i === activeStep - 1 ? 'bg-indigo-300' : 'bg-gray-100'
              )} />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}

/* ─── Category Tag Chip ──────────────────────────────────────────────────── */
const CATEGORY_COLORS: Record<string, string> = {
  placements: 'bg-violet-50 text-violet-600 border-violet-200',
  exams:      'bg-amber-50 text-amber-600 border-amber-200',
  hackathons: 'bg-rose-50 text-rose-600 border-rose-200',
  personal:   'bg-emerald-50 text-emerald-600 border-emerald-200',
  dsa:        'bg-blue-50 text-blue-600 border-blue-200',
  ai:         'bg-indigo-50 text-indigo-600 border-indigo-200',
  internship: 'bg-purple-50 text-purple-600 border-purple-200',
};

function TagChip({ tag }: { tag: string }) {
  const colorClass = CATEGORY_COLORS[tag.toLowerCase()] ?? 'bg-gray-50 text-gray-500 border-gray-200';
  return (
    <span className={cn('inline-flex items-center gap-1 text-[10px] font-bold px-2.5 py-0.5 rounded-full border', colorClass)}>
      <Tag className="w-2.5 h-2.5" />{tag}
    </span>
  );
}

/* ─── Memory Card ────────────────────────────────────────────────────────── */
function MemoryCard({ memory, onDelete }: { memory: Memory; onDelete: (id: string) => void }) {
  const [expanded, setExpanded] = useState(false);
  const isLong = memory.content.length > 120;
  return (
    <div
      className="group bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md hover:border-indigo-100 hover:-translate-y-0.5 transition-all duration-200 flex flex-col gap-3 cursor-pointer"
      onClick={() => setExpanded(e => !e)}
    >
      {/* Content */}
      <p className={cn('text-sm text-gray-800 leading-relaxed font-medium', !expanded && isLong && 'line-clamp-3')}>
        {memory.content}
      </p>
      {isLong && (
        <button
          className="text-[10px] text-indigo-500 font-bold self-start hover:underline"
          onClick={e => { e.stopPropagation(); setExpanded(v => !v); }}
        >
          {expanded ? '▲ Show less' : '▼ Show more'}
        </button>
      )}

      {/* Tags */}
      {memory.tags && memory.tags.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {memory.tags.map(tag => <TagChip key={tag} tag={tag} />)}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-50 pt-3 text-[10px] text-gray-400 font-semibold">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span>Pod Memory</span>
        </div>
        <div className="flex items-center gap-3">
          <span>{new Date(memory.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
          <button
            onClick={e => { e.stopPropagation(); onDelete(memory.id); }}
            className="text-gray-300 hover:text-red-400 transition-colors p-0.5 opacity-0 group-hover:opacity-100"
            title="Delete memory"
          >
            <Trash2 className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────────────────────────── */
export const BrainView = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'placements' | 'exams' | 'hackathons' | 'personal'>('all');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [flowStep, setFlowStep] = useState(-1);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [saving, setSaving] = useState(false);

  const opportunities = [
    { id: '1', title: 'Google SDE Intern 2027', category: 'placements', score: 9.8, type: 'Internship', desc: 'Summer SDE internship applications opening shortly.', color: 'from-blue-500 to-indigo-500' },
    { id: '2', title: 'Gappy AI Hackathon 2026', category: 'hackathons', score: 9.2, type: 'Hackathon', desc: 'Participate and build AI Chief of Staff tool.', color: 'from-rose-500 to-orange-500' },
    { id: '3', title: 'Razorpay placement drive', category: 'placements', score: 8.9, type: 'Internship', desc: 'SDE intern role hiring via campus placement portal.', color: 'from-violet-500 to-purple-500' },
  ];

  const loadMemories = async () => {
    setLoading(true);
    try {
      const mems = await memoryService.getMemories();
      setMemories(mems);
    } catch (err) {
      console.error('[BrainView] Failed to load memories:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadMemories(); }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setAiLoading(true);
    setAiAnswer('');
    setFlowStep(0);

    // Animate through steps
    const animate = (step: number) => {
      if (step > 4) return;
      setFlowStep(step);
      setTimeout(() => animate(step + 1), 420);
    };
    animate(0);

    try {
      const answer = await memoryService.queryMemory(searchQuery);
      setAiAnswer(answer);
      setFlowStep(5); // all done
    } catch {
      setAiAnswer('Failed to query KAIRO brain. Try again.');
      setFlowStep(-1);
    } finally {
      setAiLoading(false);
    }
  };

  const handleSaveMemory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newContent.trim()) return;
    setSaving(true);
    try {
      const tags = newTags.split(',').map(t => t.trim()).filter(Boolean);
      const saved = await memoryService.saveMemory(newContent, tags);
      setMemories(prev => [saved, ...prev]);
      setNewContent('');
      setNewTags('');
      setShowAddForm(false);
    } catch (err) {
      console.error('[BrainView] Save memory failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const promoteToMission = async (optTitle: string) => {
    try {
      await lemmaClient.records.create('missions', {
        title: `Prepare for ${optTitle}`,
        description: `Structure milestones and schedule preparation roadmap to crack ${optTitle}.`,
        status: 'active',
        start_date: new Date().toISOString().split('T')[0],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
      alert(`🎉 "${optTitle}" promoted to active Mission!`);
    } catch (err) {
      console.error('[BrainView] Promotion failed:', err);
    }
  };

  const handleDeleteMemory = async (id: string) => {
    if (!confirm('Delete this memory?')) return;
    try {
      await memoryService.deleteMemory(id);
      setMemories(prev => prev.filter(m => m.id !== id));
    } catch {
      alert('Failed to delete. Try again.');
    }
  };

  const getFilteredMemories = () => {
    let result = memories;
    if (activeCategory === 'placements') result = result.filter(m => m.tags?.some(t => ['dsa', 'internship', 'resume', 'linkedin', 'placement'].includes(t.toLowerCase())));
    else if (activeCategory === 'exams')  result = result.filter(m => m.tags?.some(t => ['exams', 'college', 'dbms', 'os', 'study'].includes(t.toLowerCase())));
    else if (activeCategory === 'hackathons') result = result.filter(m => m.tags?.some(t => ['hackathon', 'ai'].includes(t.toLowerCase())));
    else if (activeCategory === 'personal')  result = result.filter(m => m.tags?.some(t => ['personal', 'mind', 'health'].includes(t.toLowerCase())));
    if (searchQuery.trim()) result = result.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase()) || m.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())));
    return result;
  };

  const filtered = getFilteredMemories();

  return (
    <div className="p-4 md:p-8 h-full flex flex-col font-body overflow-y-auto bg-[#f9f9fd]">

      {/* ── Header ── */}
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-200">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-black text-gray-900">AI Brain Memory</h1>
          </div>
          <p className="text-gray-400 text-sm mt-0.5 ml-11.5">Semantic memory pod. Search triggers a 5-stage AI retrieval pipeline.</p>
        </div>
        <button
          onClick={() => setShowAddForm(s => !s)}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shadow-indigo-200 shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Ingest Memory</span>
        </button>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">

        {/* LEFT (8-Cols) */}
        <div className="lg:col-span-8 space-y-5">

          {/* Add Memory Form */}
          {showAddForm && (
            <form onSubmit={handleSaveMemory} className="bg-white border border-indigo-100 rounded-3xl p-5 shadow-sm space-y-3.5 animate-fade-in">
              <p className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest">New Memory Entry</p>
              <textarea
                rows={3}
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="What should KAIRO remember? (e.g., 'Targeting product internships. Striver DSA checklist is high priority.')"
                className="w-full rounded-xl border border-gray-200 p-3 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-200 outline-none resize-none text-gray-800 font-medium"
                required
              />
              <input
                type="text"
                value={newTags}
                onChange={e => setNewTags(e.target.value)}
                placeholder="Tags: dsa, internship, exams (comma separated)"
                className="w-full rounded-xl border border-gray-200 p-3 text-sm bg-gray-50 focus:ring-2 focus:ring-indigo-200 outline-none text-gray-800 font-semibold"
              />
              <div className="flex gap-3">
                <button type="submit" disabled={saving}
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 text-white px-5 py-2 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-2">
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {saving ? 'Saving…' : 'Save to Brain'}
                </button>
                <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-gray-400 hover:text-gray-700 font-bold">Cancel</button>
              </div>
            </form>
          )}

          {/* ── SEARCH + FLOW VISUALIZER ── */}
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm p-5 space-y-4">
            {/* Search bar */}
            <div className="flex gap-3">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-300" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSearch()}
                  placeholder="Ask KAIRO's brain anything…"
                  className="w-full bg-gray-50 border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-indigo-200 outline-none font-semibold text-gray-800"
                />
              </div>
              <button
                onClick={handleSearch}
                disabled={aiLoading || !searchQuery.trim()}
                className="bg-gradient-to-r from-indigo-500 to-violet-500 hover:opacity-90 disabled:opacity-40 text-white px-5 py-3 rounded-2xl text-xs font-bold flex items-center gap-2 shadow-md shadow-indigo-200 shrink-0 transition-all active:scale-95"
              >
                {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Sparkles className="w-3.5 h-3.5" /><span>Ask AI</span></>}
              </button>
            </div>

            {/* Flow pipeline — always visible when search has been triggered */}
            {flowStep >= 0 && (
              <div className="space-y-3 animate-fade-in">
                <p className="text-[9px] font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-1.5">
                  <Network className="w-3 h-3" /> AI Retrieval Pipeline
                </p>
                <SearchFlowBar activeStep={flowStep} />
              </div>
            )}

            {/* AI Answer */}
            {aiAnswer && (
              <div className="bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 rounded-2xl p-5 animate-fade-in">
                <p className="text-[10px] font-extrabold text-indigo-500 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                  <Lightbulb className="w-3.5 h-3.5" /> KAIRO Knowledge Response
                </p>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
              </div>
            )}
          </div>

          {/* Category Filter Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none">
            {[
              { id: 'all',        label: '🌐 All',           active: 'bg-gray-900 text-white border-gray-800' },
              { id: 'placements', label: '💼 Placement/DSA',  active: 'bg-violet-500 text-white border-violet-500' },
              { id: 'exams',      label: '📚 Exams',          active: 'bg-amber-500 text-white border-amber-500' },
              { id: 'hackathons', label: '🏆 Hackathons',     active: 'bg-rose-500 text-white border-rose-500' },
              { id: 'personal',   label: '🌿 Personal',       active: 'bg-emerald-500 text-white border-emerald-500' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={cn(
                  'px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-all border',
                  activeCategory === tab.id
                    ? tab.active + ' shadow-sm'
                    : 'bg-white border-gray-100 text-gray-500 hover:text-gray-800 hover:bg-gray-50'
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Memory Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-indigo-400 border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center py-16 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-50 to-violet-50 border border-indigo-100 flex items-center justify-center mb-4">
                <Brain className="w-7 h-7 text-indigo-300" />
              </div>
              <p className="font-bold text-gray-700 text-sm">No memories found</p>
              <p className="text-xs text-gray-400 mt-1">Ingest context above or change the filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map(m => (
                <MemoryCard key={m.id} memory={m} onDelete={handleDeleteMemory} />
              ))}
            </div>
          )}
        </div>

        {/* RIGHT: Opportunity Hub (4-Cols) */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-heading font-black text-sm text-gray-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-indigo-500" />
                Opportunity Hub
              </h3>
              <span className="text-[9px] font-extrabold bg-indigo-50 text-indigo-500 border border-indigo-100 px-2 py-0.5 rounded-full uppercase tracking-wider">AI Scans</span>
            </div>
            <p className="text-xs text-gray-400 leading-relaxed mb-4">KAIRO scans your context for high-value career, hackathon & internship opportunities:</p>

            <div className="space-y-3">
              {opportunities.map(opt => (
                <div key={opt.id} className="rounded-2xl overflow-hidden border border-gray-100 hover:border-indigo-100 transition-all shadow-sm">
                  {/* Color strip */}
                  <div className={`h-1 w-full bg-gradient-to-r ${opt.color}`} />
                  <div className="p-3.5 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <span className="text-[9px] font-extrabold bg-gray-50 text-gray-500 border border-gray-100 px-2 py-0.5 rounded-lg uppercase tracking-wide shrink-0">
                        {opt.type}
                      </span>
                      <span className="text-[10px] font-black text-orange-500">⭐ {opt.score}</span>
                    </div>
                    <h4 className="font-bold text-gray-800 text-xs leading-snug">{opt.title}</h4>
                    <p className="text-[10px] text-gray-400 leading-relaxed">{opt.desc}</p>
                    <button
                      onClick={() => promoteToMission(opt.title)}
                      className="w-full bg-gray-50 hover:bg-gradient-to-r hover:from-indigo-500 hover:to-violet-500 hover:text-white border border-gray-100 hover:border-transparent px-3 py-1.5 rounded-xl font-bold text-[10px] text-gray-600 transition-all flex items-center justify-center gap-1"
                    >
                      <span>Promote to Mission</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Knowledge Map */}
          <div className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-3">
            <h3 className="font-heading font-black text-sm text-gray-900 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-emerald-500" />
              Knowledge Graph
            </h3>
            <p className="text-[10px] text-gray-400">Connections in your brain memory pod:</p>
            <div className="space-y-2">
              {[
                { label: 'DSA Practice', rel: '→ Placement Track', count: memories.filter(m => m.tags?.includes('dsa')).length || 3, color: 'text-violet-500' },
                { label: 'Hackathon Prep', rel: '→ AI Projects', count: memories.filter(m => m.tags?.includes('hackathon')).length || 2, color: 'text-rose-500' },
                { label: 'Study Notes', rel: '→ Exam Context', count: memories.filter(m => m.tags?.includes('exams')).length || 4, color: 'text-amber-500' },
              ].map(node => (
                <div key={node.label} className="flex items-center justify-between bg-gray-50 rounded-xl px-3 py-2.5 border border-gray-100">
                  <div>
                    <p className="text-xs font-bold text-gray-700">{node.label}</p>
                    <p className={cn('text-[10px] font-semibold', node.color)}>{node.rel}</p>
                  </div>
                  <span className="text-xs font-black text-gray-400">{node.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};
