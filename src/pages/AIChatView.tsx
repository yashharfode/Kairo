import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Sparkles, Trash2, ArrowUpRight } from 'lucide-react';
import { lemmaService } from '@/services/LemmaService';
import { cn } from '@/lib/utils';
import { Markdown } from '@/components/Markdown';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

const STARTER_PROMPTS = [
  { label: "Prioritize: DBMS exam prep vs. DSA Sheets", query: "Help me decide: should I focus on DBMS exam preparation or crack DSA arrays sheet today?" },
  { label: "Plan a 30-day DSA placement roadmap", query: "Can you generate a comprehensive 30-day DSA study roadmap for SDE internship placements?" },
  { label: "Review Gappy AI Hackathon milestones", query: "Summarize my Gappy AI Hackathon mission roadmap and active tasks." }
];

export const AIChatView = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      content: "Hello! I'm KAIRO — your AI Chief of Staff. I have full context of your memories, active missions, and execution timelines. Ask me anything.",
      timestamp: new Date().toISOString(),
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
    const userMsg: ChatMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const reply = await lemmaService.askAgent(text);
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: reply, timestamp: new Date().toISOString() },
      ]);
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'ai', content: 'Sorry, I encountered an error reaching the KAIRO pod database. Please try again.', timestamp: new Date().toISOString() },
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
    <div className="p-4 md:p-8 h-full flex flex-col font-body">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-black text-text-primary flex items-center gap-3">
            <MessageSquare className="w-7 h-7 md:w-8 md:h-8 text-primary animate-pulse" />
            AI Chat Copilot
          </h1>
          <p className="text-text-secondary text-xs md:text-sm mt-1">Direct conversation with your KAIRO executive intelligence layer.</p>
        </div>
        <button
          onClick={() => setMessages([{
            role: 'ai',
            content: "Hello! I'm KAIRO. Ask me anything.",
            timestamp: new Date().toISOString(),
          }])}
          className="flex items-center gap-2 text-xs font-bold text-text-secondary hover:text-red-500 transition-colors border border-gray-200/60 px-3 py-1.5 rounded-xl bg-white"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear History</span>
        </button>
      </header>

      <div className="flex-1 bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col overflow-hidden min-h-0">
        
        {/* Messages feed area */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/20">
          {messages.map((msg, i) => (
            <div key={i} className={cn("flex gap-3.5", msg.role === 'user' ? 'flex-row-reverse' : '')}>
              {msg.role === 'ai' && (
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/25">
                  <Sparkles className="w-4.5 h-4.5 text-white" />
                </div>
              )}
              
              <div className={cn(
                "p-4 sm:p-5 rounded-2xl shadow-sm max-w-2xl text-xs sm:text-sm leading-relaxed",
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-tr-none font-semibold'
                  : 'bg-white border border-gray-150 rounded-tl-none text-text-primary'
              )}>
                {msg.role === 'user' ? (
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                ) : (
                  <Markdown content={msg.content} />
                )}
                
                <span className={cn(
                  "text-[9px] block mt-2 text-right font-bold",
                  msg.role === 'user' ? 'text-white/60' : 'text-text-secondary'
                )}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3.5">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/25">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-150 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary shrink-0" />
                <span className="text-xs font-semibold text-text-secondary">KAIRO is analyzing context...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Suggestion Prompts */}
        {messages.length === 1 && (
          <div className="p-4 bg-gray-50/40 border-t border-gray-100 flex flex-col gap-2 shrink-0">
            <span className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider pl-2">Suggested Prompts</span>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
              {STARTER_PROMPTS.map((promptObj, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(promptObj.query)}
                  className="text-left p-3 rounded-xl border border-gray-150 bg-white hover:bg-primary-light/35 hover:border-primary-border/20 transition-all text-xs font-semibold text-text-primary flex items-center justify-between"
                >
                  <span className="truncate max-w-[90%]">{promptObj.label}</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-primary shrink-0" />
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Chat input box */}
        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto flex items-center">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask KAIRO anything about your plans or timeline..."
              className="w-full bg-background border border-gray-200 rounded-full pl-6 pr-14 py-3.5 text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 outline-none text-text-primary font-medium"
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={loading || !input.trim()}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-9 h-9 bg-primary hover:bg-primary-hover disabled:opacity-50 text-white rounded-full flex items-center justify-center transition-all shadow-md active:scale-95"
            >
              <Send className="w-3.5 h-3.5 ml-0.5" />
            </button>
          </form>
        </div>

      </div>
    </div>
  );
};
