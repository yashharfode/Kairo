import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, Send, Loader2, Sparkles, Trash2, ArrowUpRight, 
  Zap, Database, Shield, Cpu, Activity, LayoutGrid, CheckCircle2, Bookmark
} from 'lucide-react';
import { lemmaService } from '@/services/LemmaService';
import { cn } from '@/lib/utils';
import { Markdown } from '@/components/Markdown';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
  options?: string[];
}

const STARTER_PROMPTS = [
  { label: "Prioritize: DBMS exam prep vs. DSA", query: "Help me decide: should I focus on DBMS exam preparation or crack DSA arrays sheet today?" },
  { label: "Plan a 30-day DSA placement roadmap", query: "Can you generate a comprehensive 30-day DSA study roadmap for SDE internship placements?" },
  { label: "Review Gappy AI Hackathon milestones", query: "Summarize my Gappy AI Hackathon mission roadmap and active tasks." }
];

export const AIChatView = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      content: "Hello! I'm KAIRO — your elite AI Chief of Staff. I have initialized my connection to your active memory pod, current missions, and calendar blocks. How can we drive progress today?",
      timestamp: new Date().toISOString()
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Live Copilot Context States (mocked or loaded to enhance the UX)
  const [activeWorkspace, setActiveWorkspace] = useState('Gappy AI Hackathon');
  const [activeMissionsCount, setActiveMissionsCount] = useState(2);
  const [memorySyncStatus, setMemorySyncStatus] = useState('Synchronized');

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    const systemPrompt = `You are KAIRO, an elite AI Chief of Staff.
Analyze the user's request using your deep context.
You MUST reply in STRICT valid JSON format matching this schema:
{
  "reply": "Your insightful, markdown-formatted response here.",
  "options": ["Short suggested follow-up question 1", "Short suggested follow-up question 2"]
}
Do not include any text outside the JSON block.

User query: ${text}`;

    try {
      const rawReply = await lemmaService.askAgent(systemPrompt);
      
      let parsedContent = rawReply;
      let parsedOptions: string[] = [];
      
      try {
        const jsonMatch = rawReply.match(/\{[\s\S]*\}/);
        const jsonStr = jsonMatch ? jsonMatch[0] : rawReply;
        const parsed = JSON.parse(jsonStr);
        
        if (parsed.reply) parsedContent = parsed.reply;
        if (Array.isArray(parsed.options)) parsedOptions = parsed.options;
      } catch (parseError) {
        console.warn('Failed to parse AI response as JSON, falling back to raw text:', rawReply);
      }

      setMessages(prev => [
        ...prev,
        { 
          role: 'ai', 
          content: parsedContent, 
          timestamp: new Date().toISOString(),
          options: parsedOptions.length > 0 ? parsedOptions : undefined
        },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: '⚠️ Link connection unstable. I encountered an error reaching the KAIRO pod. Please try again.', timestamp: new Date().toISOString() },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return (
    <div className="h-full flex flex-col font-body bg-[#09090b] text-gray-100 overflow-hidden relative">
      
      {/* Glow Effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-violet-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ── HEADER ── */}
      <header className="px-6 py-4 border-b border-gray-800/80 bg-gray-950/40 backdrop-blur-md z-10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <MessageSquare className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-heading font-black tracking-tight text-white flex items-center gap-2">
              KAIRO Copilot
              <span className="text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-2 py-0.5 rounded-full uppercase tracking-wider animate-pulse">Live</span>
            </h1>
            <p className="text-gray-400 text-xs mt-0.5">Direct link to your executive intelligence pod.</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Quick status dots for visual fidelity */}
          <div className="hidden sm:flex items-center gap-4 text-xs font-semibold text-gray-400 bg-gray-900/60 border border-gray-800 px-3 py-1.5 rounded-xl">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Pod Connected
            </span>
          </div>

          <button
            onClick={() => setMessages([{
              role: 'ai',
              content: "Memory wiped. Ready for new instructions.",
              timestamp: new Date().toISOString(),
            }])}
            className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-400 transition-all border border-gray-800 hover:border-red-500/30 px-3.5 py-2 rounded-xl bg-gray-950/60 hover:bg-red-500/5 active:scale-95"
          >
            <Trash2 className="w-4 h-4" />
            <span className="hidden sm:inline">Clear Link</span>
          </button>
        </div>
      </header>

      {/* ── MAIN DUAL-PANEL LAYOUT ── */}
      <div className="flex-1 flex overflow-hidden z-10 relative">
        
        {/* LEFT PANEL: Chat Thread */}
        <div className="flex-1 flex flex-col min-w-0">
          
          {/* Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-thin scrollbar-thumb-gray-800 scrollbar-track-transparent">
            {messages.map((msg, i) => (
              <div key={i} className={cn("flex gap-4 animate-fade-in", msg.role === 'user' ? 'flex-row-reverse' : '')}>
                
                {/* Avatar */}
                {msg.role === 'ai' ? (
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0 shadow-md shadow-indigo-500/10 relative">
                    <Sparkles className="w-4.5 h-4.5 text-white" />
                  </div>
                ) : (
                  <div className="w-9 h-9 rounded-xl bg-gray-800 border border-gray-700 flex items-center justify-center shrink-0 shadow-md">
                    <span className="text-indigo-400 font-extrabold text-xs">Y</span>
                  </div>
                )}
                
                <div className={cn("flex flex-col gap-2 max-w-[85%] sm:max-w-[75%]", msg.role === 'user' ? 'items-end' : 'items-start')}>
                  
                  {/* Bubble */}
                  <div className={cn(
                    "p-4.5 shadow-xl text-sm leading-relaxed border transition-all duration-300",
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-indigo-600 to-indigo-700 text-white border-indigo-500/30 rounded-3xl rounded-tr-sm font-medium'
                      : 'bg-gray-900/60 backdrop-blur-md text-gray-200 border-gray-800/80 rounded-3xl rounded-tl-sm'
                  )}>
                    {msg.role === 'user' ? (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    ) : (
                      <div className="prose prose-invert prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-gray-950 prose-pre:border prose-pre:border-gray-800 prose-pre:text-gray-300">
                        <Markdown content={msg.content} />
                      </div>
                    )}
                    
                    <span className={cn(
                      "text-[9px] block mt-2.5 font-bold uppercase tracking-wider",
                      msg.role === 'user' ? 'text-indigo-200/60 text-right' : 'text-gray-500 text-left'
                    )}>
                      {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  {/* Options / Follow-ups */}
                  {msg.role === 'ai' && msg.options && (
                    <div className="flex flex-wrap gap-2 mt-1.5 pl-1">
                      {msg.options.map((opt, idx) => (
                        <button
                          key={idx}
                          onClick={() => sendMessage(opt)}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-gray-800 hover:border-indigo-500/50 bg-gray-950/80 hover:bg-indigo-500/10 text-gray-300 hover:text-indigo-300 text-xs font-bold transition-all shadow-sm active:scale-95 group"
                        >
                          <Zap className="w-3.5 h-3.5 group-hover:text-indigo-400 text-gray-500 transition-colors" />
                          <span>{opt}</span>
                        </button>
                      ))}
                    </div>
                  )}

                </div>
              </div>
            ))}

            {/* Typing status */}
            {loading && (
              <div className="flex gap-4 animate-fade-in">
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center shrink-0">
                  <Sparkles className="w-4.5 h-4.5 text-white animate-pulse" />
                </div>
                <div className="bg-gray-900/60 backdrop-blur-md p-4 rounded-3xl rounded-tl-sm border border-gray-800/80 flex items-center gap-3">
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2.5 h-2.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs font-black text-indigo-400 uppercase tracking-widest">KAIRO is thinking</span>
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Starter Queries (if chat is fresh) */}
          {messages.length === 1 && !loading && (
            <div className="px-6 py-4 bg-gray-950/20 border-t border-gray-800/40 flex flex-col gap-3">
              <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-widest">Recommended Starter Queries</span>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {STARTER_PROMPTS.map((promptObj, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(promptObj.query)}
                    className="group text-left p-3.5 rounded-2xl border border-gray-800/80 bg-gray-900/40 hover:bg-gray-900/80 hover:border-indigo-500/30 transition-all text-xs font-semibold text-gray-300 flex items-center justify-between"
                  >
                    <span className="truncate max-w-[85%]">{promptObj.label}</span>
                    <div className="w-6 h-6 rounded-lg bg-gray-800 group-hover:bg-indigo-500/20 flex items-center justify-center transition-colors">
                      <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-indigo-400" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom input area */}
          <div className="p-4 md:p-6 bg-gray-950/40 border-t border-gray-800/80">
            <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex items-center">
              <input 
                type="text" 
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask KAIRO to plan, schedule, prioritize or analyze context..."
                className="w-full bg-gray-900/80 border border-gray-800 hover:border-gray-700 rounded-2xl pl-6 pr-16 py-4.5 text-sm focus:bg-gray-950 focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 outline-none text-white font-semibold transition-all shadow-2xl"
                disabled={loading}
              />
              <button 
                type="submit"
                disabled={loading || !input.trim()}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 hover:opacity-90 disabled:opacity-50 text-white rounded-xl flex items-center justify-center transition-all shadow-lg shadow-indigo-500/20 active:scale-95"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

        </div>

        {/* RIGHT PANEL: Live Intelligence Dashboard Sidebar */}
        <div className="hidden lg:flex w-80 border-l border-gray-800/80 bg-gray-950/50 backdrop-blur-md flex-col overflow-y-auto p-6 space-y-6">
          <div className="flex items-center gap-2 border-b border-gray-800/60 pb-3">
            <Activity className="w-4 h-4 text-indigo-400" />
            <h2 className="text-xs font-black text-white uppercase tracking-widest">KAIRO Status Engine</h2>
          </div>

          {/* Context Hub */}
          <div className="space-y-4">
            <div className="bg-gray-900/40 border border-gray-800/80 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Active Workspace</span>
                <span className="text-[10px] font-black text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">{activeWorkspace}</span>
              </div>
              <div className="h-px bg-gray-850" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Active Missions</span>
                <span className="text-xs font-black text-white">{activeMissionsCount} Targets</span>
              </div>
              <div className="h-px bg-gray-850" />
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-gray-500 uppercase tracking-wider">Memory Sync</span>
                <span className="text-[10px] font-black text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {memorySyncStatus}
                </span>
              </div>
            </div>

            {/* System Resources / Diagnostics */}
            <div className="space-y-3">
              <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest pl-1">Live Telemetry</h3>
              
              <div className="grid grid-cols-2 gap-2 text-center">
                <div className="bg-gray-900/20 border border-gray-850 rounded-xl p-3">
                  <Database className="w-4 h-4 text-indigo-400 mx-auto mb-1" />
                  <p className="text-xs font-black text-white">Lemma Datastore</p>
                  <p className="text-[9px] text-gray-500 font-bold mt-0.5">12 Active Nodes</p>
                </div>
                <div className="bg-gray-900/20 border border-gray-850 rounded-xl p-3">
                  <Cpu className="w-4 h-4 text-purple-400 mx-auto mb-1" />
                  <p className="text-xs font-black text-white">Neural Load</p>
                  <p className="text-[9px] text-gray-500 font-bold mt-0.5">Optimal (2.3ms)</p>
                </div>
              </div>
            </div>

            {/* Active Core Rules Extracted */}
            <div className="bg-gray-900/20 border border-gray-850 rounded-2xl p-4 space-y-2">
              <div className="flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-indigo-400" />
                <span className="text-[10px] font-black text-white uppercase tracking-widest">Safety & Strategy Pod</span>
              </div>
              <p className="text-[11px] text-gray-400 leading-relaxed">
                KAIRO maintains zero hardcoded credentials and completely isolates dev/production environments. Auto-scheduling maps items securely.
              </p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};
