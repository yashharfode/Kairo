import { useState, useRef, useEffect } from 'react';
import { MessageSquare, Send, Loader2, Sparkles, Trash2 } from 'lucide-react';
import { lemmaService } from '@/services/LemmaService';

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  timestamp: string;
}

const STARTER_PROMPTS = [
  "What should I focus on today?",
  "Summarize my active missions.",
  "How can I prepare for a hackathon in 2 days?",
];

export const AIChatView = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      role: 'ai',
      content: "Hello! I'm KAIRO — your AI Executive OS. I have full context of your missions, memories, and tasks. Ask me anything.",
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
        { role: 'ai', content: 'Sorry, I encountered an error reaching the KAIRO pod. Please try again.', timestamp: new Date().toISOString() },
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
    <div className="p-8 h-full flex flex-col font-body">
      <header className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary flex items-center gap-3">
            <MessageSquare className="w-8 h-8 text-primary" />
            AI Chat
          </h1>
          <p className="text-text-secondary mt-1">Direct conversation with your KAIRO intelligence layer.</p>
        </div>
        <button
          onClick={() => setMessages([{
            role: 'ai',
            content: "Hello! I'm KAIRO — your AI Executive OS. Ask me anything.",
            timestamp: new Date().toISOString(),
          }])}
          className="flex items-center gap-2 text-sm text-text-secondary hover:text-red-500 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
          Clear
        </button>
      </header>

      <div className="flex-1 bg-surface border border-gray-100 rounded-2xl shadow-sm flex flex-col overflow-hidden min-h-0">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/30">
          {messages.map((msg, i) => (
            <div key={i} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'ai' && (
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm">
                  <Sparkles className="w-4 h-4 text-white" />
                </div>
              )}
              <div
                className={`max-w-2xl px-5 py-4 rounded-2xl shadow-sm text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-primary text-white rounded-tr-none'
                    : 'bg-white border border-gray-100 text-text-primary rounded-tl-none'
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                <p className={`text-xs mt-2 ${msg.role === 'user' ? 'text-white/60' : 'text-text-secondary'}`}>
                  {new Date(msg.timestamp).toLocaleTimeString()}
                </p>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-4">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div className="bg-white border border-gray-100 rounded-2xl rounded-tl-none px-5 py-4 flex items-center gap-3 shadow-sm">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-text-secondary">KAIRO is thinking...</span>
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>

        {/* Starter prompts */}
        {messages.length === 1 && (
          <div className="px-6 pb-2 flex gap-2 flex-wrap bg-gray-50/30">
            {STARTER_PROMPTS.map((p) => (
              <button
                key={p}
                onClick={() => sendMessage(p)}
                className="text-xs text-primary bg-secondary hover:bg-primary hover:text-white px-3 py-1.5 rounded-full transition-colors border border-primary/20"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-gray-100 bg-white">
          <form onSubmit={handleSubmit} className="flex gap-3 max-w-4xl mx-auto">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder="Ask KAIRO anything..."
              disabled={loading}
              className="flex-1 bg-background border border-gray-200 rounded-full px-5 py-3 text-sm focus:ring-2 focus:ring-primary/20 outline-none"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="w-11 h-11 bg-primary hover:bg-primary-hover disabled:bg-primary/40 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
