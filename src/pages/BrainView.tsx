import React, { useEffect, useState } from 'react';
import { Brain, Search, Plus, Tag, Loader2, Sparkles, ArrowRight, TrendingUp } from 'lucide-react';
import { memoryService } from '@/services/MemoryService';
import { lemmaClient } from '@/lib/lemmaClient';
import type { Memory } from '@/types/schema';
import { cn } from '@/lib/utils';

export const BrainView = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<'all' | 'placements' | 'exams' | 'hackathons' | 'personal'>('all');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Simulated Opportunity Hub scanned alerts
  const opportunities = [
    { id: '1', title: 'Google SDE Intern 2027', category: 'placements', score: 9.8, type: 'Internship', desc: 'Summer SDE internship applications opening shortly.' },
    { id: '2', title: 'Gappy AI Hackathon 2026', category: 'hackathons', score: 9.2, type: 'Hackathon', desc: 'Participate and build AI Chief of Staff tool.' },
    { id: '3', title: 'Razorpay placement drive', category: 'placements', score: 8.9, type: 'Internship', desc: 'SDE intern role hiring via campus placement portal.' }
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

  useEffect(() => {
    loadMemories();
  }, []);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setAiLoading(true);
    setAiAnswer('');
    try {
      const answer = await memoryService.queryMemory(searchQuery);
      setAiAnswer(answer);
    } catch {
      setAiAnswer('Failed to query KAIRO brain. Try again.');
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

  // Convert opportunity to mission with one-click using real Lemma SDK client
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
      alert(`🎉 "${optTitle}" has been promoted to an active Mission in your Lemma Pod. reverse-planning timeline scheduled!`);
    } catch (err) {
      console.error('[BrainView] Promotion failed:', err);
    }
  };

  // Filter memories by category tags
  const getFilteredMemories = () => {
    let result = memories;
    
    // 1. Category check
    if (activeCategory === 'placements') {
      result = result.filter(m => m.tags?.some(t => ['dsa', 'internship', 'resume', 'linkedin', 'placement'].includes(t.toLowerCase())));
    } else if (activeCategory === 'exams') {
      result = result.filter(m => m.tags?.some(t => ['exams', 'college', 'dbms', 'os', 'study'].includes(t.toLowerCase())));
    } else if (activeCategory === 'hackathons') {
      result = result.filter(m => m.tags?.some(t => ['hackathon', 'ai'].includes(t.toLowerCase())));
    } else if (activeCategory === 'personal') {
      result = result.filter(m => m.tags?.some(t => ['personal', 'mind', 'health'].includes(t.toLowerCase())));
    }

    // 2. Search check
    if (searchQuery.trim()) {
      result = result.filter(m => 
        m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }

    return result;
  };

  const filtered = getFilteredMemories();

  return (
    <div className="p-4 md:p-8 h-full flex flex-col font-body overflow-y-auto">
      <header className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-black text-text-primary flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            AI Brain Memory
          </h1>
          <p className="text-text-secondary text-xs md:text-sm mt-1">Unified semantic context, scanned opportunities and memory categorizations.</p>
        </div>
        <button
          onClick={() => setShowAddForm(s => !s)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md shrink-0 active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Ingest Memory</span>
        </button>
      </header>

      {/* Grid Layout: Memories Panel on Left, Opportunity Hub on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8 items-start">
        
        {/* LEFT SECTION: Memories & Search (8-Cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Add Memory Form */}
          {showAddForm && (
            <form onSubmit={handleSaveMemory} className="bg-white border border-primary/20 rounded-3xl p-5 shadow-sm space-y-3.5">
              <textarea
                rows={3}
                value={newContent}
                onChange={e => setNewContent(e.target.value)}
                placeholder="What should KAIRO remember? (e.g., 'Targeting product internships. Striver DSA checklist is high priority.')"
                className="w-full rounded-xl border border-gray-200 p-3 text-xs bg-gray-50/50 focus:ring-2 focus:ring-primary/20 outline-none resize-none text-text-primary font-medium"
                required
              />
              <input
                type="text"
                value={newTags}
                onChange={e => setNewTags(e.target.value)}
                placeholder="Tags (comma separated, e.g. dsa, internship, exams)"
                className="w-full rounded-xl border border-gray-200 p-3 text-xs bg-gray-50/50 focus:ring-2 focus:ring-primary/20 outline-none text-text-primary font-semibold"
              />
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-50 flex items-center gap-2 transition-colors"
                >
                  {saving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  {saving ? 'Saving...' : 'Save to Brain'}
                </button>
                <button type="button" onClick={() => setShowAddForm(false)} className="text-xs text-text-secondary hover:text-text-primary font-bold">
                  Cancel
                </button>
              </div>
            </form>
          )}

          {/* Search Box */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
              <input
                type="text"
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleSearch()}
                placeholder="Search or query KAIRO's memory pod..."
                className="w-full bg-white border border-gray-200 rounded-2xl pl-11 pr-4 py-3 text-xs focus:ring-2 focus:ring-primary/20 outline-none font-semibold text-text-primary shadow-sm"
              />
            </div>
            <button
              onClick={handleSearch}
              disabled={aiLoading}
              className="bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-2xl text-xs font-bold disabled:opacity-50 flex items-center gap-2 transition-all shadow-md shrink-0 active:scale-95"
            >
              {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ask AI'}
            </button>
          </div>

          {/* AI Response Panel */}
          {aiAnswer && (
            <div className="bg-primary-light/40 border border-primary/10 rounded-2xl p-5 shadow-sm">
              <p className="text-[10px] font-extrabold text-primary uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> KAIRO Memory Retrieval
              </p>
              <p className="text-xs sm:text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
            </div>
          )}

          {/* Category Tabs */}
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
            {[
              { id: 'all', label: 'All Context' },
              { id: 'placements', label: 'Placement/DSA' },
              { id: 'exams', label: 'College/Exams' },
              { id: 'hackathons', label: 'Hackathons' },
              { id: 'personal', label: 'Personal' }
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveCategory(tab.id as any)}
                className={cn(
                  "px-4 py-2 rounded-xl text-xs font-bold shrink-0 transition-colors border",
                  activeCategory === tab.id
                    ? "bg-primary border-primary text-white shadow-sm shadow-primary/10"
                    : "bg-white border-gray-100 text-text-secondary hover:text-text-primary hover:bg-gray-50"
                )}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Memory List Grid */}
          {loading ? (
            <div className="flex items-center justify-center h-48">
              <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center text-center text-text-secondary py-12 bg-white rounded-3xl border border-gray-100 shadow-sm">
              <Brain className="w-14 h-14 mb-4 opacity-20 text-text-secondary" />
              <p className="font-bold text-text-primary text-sm">No memories found</p>
              <p className="text-xs text-text-secondary mt-1">Ingest context above or select another category filter.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {filtered.map(m => (
                <div key={m.id} className="bg-white border border-gray-100 rounded-3xl p-5 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-200">
                  <p className="text-xs sm:text-sm text-text-primary leading-relaxed font-medium">{m.content}</p>
                  
                  {m.tags && m.tags.length > 0 && (
                    <div className="mt-4 flex flex-wrap gap-1.5">
                      {m.tags.map(tag => (
                        <span key={tag} className="flex items-center gap-1 text-[9px] bg-secondary text-primary px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">
                          <Tag className="w-2.5 h-2.5" />{tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between text-[10px] text-text-secondary font-semibold">
                    <span>Pod Entry</span>
                    <span>{new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

        </div>

        {/* RIGHT SECTION: Opportunity Hub (4-Cols) */}
        <div className="lg:col-span-4 bg-white border border-gray-100 rounded-3xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-50 pb-3">
            <h3 className="font-heading font-black text-sm text-text-primary flex items-center gap-1.5">
              <TrendingUp className="w-4.5 h-4.5 text-primary" />
              Opportunity Hub
            </h3>
            <span className="text-[9px] font-bold bg-primary/10 text-primary px-2 py-0.5 rounded uppercase">AI Scans</span>
          </div>

          <p className="text-[11px] text-text-secondary leading-relaxed">
            KAIRO parses unread incoming communications for career and placement opportunities:
          </p>

          <div className="space-y-3.5">
            {opportunities.map((opt) => (
              <div key={opt.id} className="p-3 bg-gray-50 rounded-2xl border border-gray-100 space-y-2.5 hover:border-primary-border/20 transition-all">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-[9px] font-extrabold bg-primary/10 text-primary px-2 py-0.5 rounded-lg uppercase tracking-wide shrink-0">
                    {opt.type}
                  </span>
                  <div className="flex items-center gap-0.5 text-orange-600 font-bold text-[10px]">
                    <span>Score:</span>
                    <span>{opt.score}</span>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-bold text-text-primary text-xs leading-snug">{opt.title}</h4>
                  <p className="text-[10px] text-text-secondary mt-1 leading-relaxed">{opt.desc}</p>
                </div>

                <button
                  onClick={() => promoteToMission(opt.title)}
                  className="w-full bg-white hover:bg-primary hover:text-white border border-gray-200 hover:border-primary px-3 py-1.5 rounded-xl font-bold text-[10px] text-text-primary transition-all flex items-center justify-center gap-1"
                >
                  <span>Promote to Mission</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
};
