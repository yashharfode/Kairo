import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Sparkles, Trash2, ArrowUpRight, Zap } from 'lucide-react';
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
      content: "Hello! I'm KAIRO — your elite AI Chief of Staff. I have full context of your memories, active missions, and execution timelines. How can we dominate today?",
      timestamp: new Date().toISOString()
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return;
    
    // Add user message to UI immediately
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // Construct a strict system prompt to force JSON output
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
      
      // Attempt to parse JSON response
      let parsedContent = rawReply;
      let parsedOptions: string[] = [];
      
      try {
        // Find JSON block if the model wrapped it in markdown
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
        { role: 'ai', content: '⚠️ Mission control link severed. I encountered an error reaching the KAIRO pod. Please try again.', timestamp: new Date().toISOString() },
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
    <div className="p-4 md:p-8 h-full flex flex-col font-body bg-[#f9f9fd] overflow-hidden">
      {/* ── HEADER ── */}
      <header className="mb-5 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2.5 mb-1">
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shadow-md shadow-indigo-200">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-heading font-black text-gray-900">AI Chat Copilot</h1>
          </div>
          <p className="text-gray-400 text-sm mt-0.5 ml-11.5">Direct encrypted line to your KAIRO executive intelligence layer.</p>
        </div>
        <button
          onClick={() => setMessages([{
            role: 'ai',
            content: "Memory wiped. Ready for new instructions.",
            timestamp: new Date().toISOString(),
          }])}
          className="flex items-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors border border-gray-200 px-3 py-2 rounded-xl bg-white shadow-sm hover:shadow active:scale-95"
        >
          <Trash2 className="w-4 h-4" />
          <span>Clear Link</span>
        </button>
      </header>

      {/* ── CHAT INTERFACE ── */}
      <div className="flex-1 bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col overflow-hidden min-h-0 relative">
        
        {/* Background ambient glow */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-50/50 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2" />

        {/* Messages Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 z-10 scrollbar-thin scrollbar-thumb-gray-200">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-4 animate-fade-in", msg.role === 'user' ? 'flex-row-reverse' : '')}>
              
              {/* Avatar */}
              {msg.role === 'ai' ? (
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200 relative">
                  <Sparkles className="w-5 h-5 text-white" />
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-green-400 border-2 border-white rounded-full" />
                </div>
              ) : (
                <div className="w-10 h-10 rounded-2xl bg-gray-900 flex items-center justify-center shrink-0 shadow-lg relative overflow-hidden">
                  <span className="text-white font-bold text-sm">You</span>
                </div>
              )}
              
              <div className={cn("flex flex-col gap-2 max-w-[85%] lg:max-w-[75%]", msg.role === 'user' ? 'items-end' : 'items-start')}>
                
                {/* Bubble */}
                <div className={cn(
                  "p-5 shadow-sm text-sm leading-relaxed relative",
                  msg.role === 'user'
                    ? 'bg-gray-900 text-white rounded-3xl rounded-tr-sm font-medium'
                    : 'bg-white border border-gray-100 rounded-3xl rounded-tl-sm text-gray-800'
                )}>
                  {msg.role === 'user' ? (
                    <p className="whitespace-pre-wrap">{msg.content}</p>
                  ) : (
                    <div className="prose prose-sm prose-indigo max-w-none prose-p:leading-relaxed prose-pre:bg-gray-50 prose-pre:border prose-pre:border-gray-100 prose-pre:text-gray-800">
                      <Markdown content={msg.content} />
                    </div>
                  )}
                  
                  <span className={cn(
                    "text-[9px] block mt-3 font-bold uppercase tracking-wider",
                    msg.role === 'user' ? 'text-gray-400 text-right' : 'text-gray-300 text-left'
                  )}>
                    {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                {/* AI Interactive Options */}
                {msg.role === 'ai' && msg.options && (
                  <div className="flex flex-wrap gap-2 mt-1 ml-2">
                    {msg.options.map((opt, idx) => (
                      <button
                        key={idx}
                        onClick={() => sendMessage(opt)}
                        className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-indigo-100 bg-indigo-50/50 hover:bg-indigo-500 hover:text-white hover:border-indigo-500 text-indigo-600 text-xs font-bold transition-all shadow-sm active:scale-95 group"
                      >
                        <Zap className="w-3 h-3 group-hover:text-white text-indigo-400" />
                        <span>{opt}</span>
                      </button>
                    ))}
                  </div>
                )}
                
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {loading && (
            <div className="flex gap-4 animate-fade-in">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-500 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200">
                <Sparkles className="w-5 h-5 text-white animate-pulse" />
              </div>
              <div className="bg-white p-5 rounded-3xl rounded-tl-sm shadow-sm border border-gray-100 flex items-center gap-3">
                <div className="flex gap-1.5">
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                  <div className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
                <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider">KAIRO is analyzing...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} className="h-4" />
        </div>

        {/* Suggestion Prompts (Only show if no messages or just the intro) */}
        {messages.length === 1 && !loading && (
          <div className="p-4 bg-gray-50/50 border-t border-gray-100 flex flex-col gap-3 shrink-0 z-10">
            <span className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest pl-2">Suggested Intel Queries</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              {STARTER_PROMPTS.map((promptObj, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(promptObj.query)}
                  className="group text-left p-3.5 rounded-2xl border border-gray-200 bg-white hover:border-indigo-300 hover:shadow-md transition-all text-xs font-semibold text-gray-700 flex items-center justify-between"
                >
                  <span className="truncate max-w-[85%]">{promptObj.label}</span>
                  <div className="w-6 h-6 rounded-full bg-gray-50 group-hover:bg-indigo-50 flex items-center justify-center transition-colors">
                    <ArrowUpRight className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-500" />
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat Input */}
        <div className="p-4 md:p-6 bg-white border-t border-gray-100 shrink-0 z-10">
          <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask KAIRO for strategic advice, task execution, or timeline adjustments..."
              className="w-full bg-gray-50 border border-gray-200 hover:border-gray-300 rounded-2xl pl-6 pr-16 py-4 text-sm focus:bg-white focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none text-gray-800 font-semibold transition-all shadow-inner"
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-11 h-11 bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 disabled:opacity-50 disabled:grayscale text-white rounded-xl flex items-center justify-center transition-all shadow-md shadow-indigo-200 active:scale-95"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
