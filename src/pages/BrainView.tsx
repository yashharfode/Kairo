import { useEffect, useState } from 'react';
import { Brain, Search, Plus, Tag, Loader2 } from 'lucide-react';
import { memoryService } from '@/services/MemoryService';
import type { Memory } from '@/types/schema';

export const BrainView = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newContent, setNewContent] = useState('');
  const [newTags, setNewTags] = useState('');
  const [saving, setSaving] = useState(false);

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

  const filtered = memories.filter(m =>
    m.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    m.tags?.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="p-8 h-full flex flex-col font-body">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            Brain Memory
          </h1>
          <p className="text-text-secondary mt-1">All knowledge and context stored in your KAIRO Pod.</p>
        </div>
        <button
          onClick={() => setShowAddForm(s => !s)}
          className="flex items-center gap-2 bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          Add Memory
        </button>
      </header>

      {/* Add Memory Form */}
      {showAddForm && (
        <form onSubmit={handleSaveMemory} className="bg-surface border border-primary/20 rounded-2xl p-5 mb-6 shadow-sm space-y-3">
          <textarea
            rows={3}
            value={newContent}
            onChange={e => setNewContent(e.target.value)}
            placeholder="What should KAIRO remember? (e.g. 'We're targeting student productivity. Hackathon deadline is July 2nd.')"
            className="w-full rounded-lg border border-gray-200 p-3 text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none resize-none"
            required
          />
          <input
            type="text"
            value={newTags}
            onChange={e => setNewTags(e.target.value)}
            placeholder="Tags (comma separated, e.g. hackathon, goal, context)"
            className="w-full rounded-lg border border-gray-200 p-2.5 text-sm bg-background focus:ring-2 focus:ring-primary/20 outline-none"
          />
          <div className="flex gap-3">
            <button
              type="submit"
              disabled={saving}
              className="bg-primary hover:bg-primary-hover text-white px-4 py-2 rounded-lg text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-colors"
            >
              {saving && <Loader2 className="w-3 h-3 animate-spin" />}
              {saving ? 'Saving...' : 'Save to Brain'}
            </button>
            <button type="button" onClick={() => setShowAddForm(false)} className="text-sm text-text-secondary hover:text-text-primary">
              Cancel
            </button>
          </div>
        </form>
      )}

      {/* Search */}
      <div className="mb-6 flex gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-text-secondary" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleSearch()}
            placeholder="Search or ask KAIRO's memory..."
            className="w-full bg-surface border border-gray-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
          />
        </div>
        <button
          onClick={handleSearch}
          disabled={aiLoading}
          className="bg-primary hover:bg-primary-hover text-white px-5 py-3 rounded-xl text-sm font-medium disabled:opacity-50 flex items-center gap-2 transition-colors"
        >
          {aiLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Ask AI'}
        </button>
      </div>

      {/* AI Answer */}
      {aiAnswer && (
        <div className="mb-6 bg-primary/5 border border-primary/15 rounded-2xl p-5">
          <p className="text-xs font-semibold text-primary uppercase tracking-wide mb-2 flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" /> KAIRO Memory Response
          </p>
          <p className="text-sm text-text-primary leading-relaxed whitespace-pre-wrap">{aiAnswer}</p>
        </div>
      )}

      {/* Memory Grid */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : filtered.length === 0 ? (
        <div className="flex-1 flex flex-col items-center justify-center text-center text-text-secondary">
          <Brain className="w-16 h-16 mb-4 opacity-20" />
          <p className="font-semibold">No memories found.</p>
          <p className="text-sm mt-1">Add context using the button above.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 overflow-y-auto pr-1">
          {filtered.map(m => (
            <div key={m.id} className="bg-surface border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow">
              <p className="text-sm text-text-primary leading-relaxed">{m.content}</p>
              {m.tags && m.tags.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {m.tags.map(tag => (
                    <span key={tag} className="flex items-center gap-1 text-[11px] bg-secondary text-primary px-2 py-0.5 rounded-full font-medium">
                      <Tag className="w-2.5 h-2.5" />{tag}
                    </span>
                  ))}
                </div>
              )}
              <p className="text-[10px] text-text-secondary mt-3">
                {new Date(m.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
