import { useState } from 'react';
import { Flag, Send, Sparkles, Loader2 } from 'lucide-react';
import { missionService } from '@/services/MissionService';

export const MissionPlanner = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{role: string, content: any}[]>([
    {
      role: 'ai',
      content: {
        type: 'intro'
      }
    }
  ]);

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt) return;

    const userMessage = prompt;
    setMessages([...messages, { role: 'user', content: userMessage }]);
    setPrompt('');
    setLoading(true);

    try {
      const plan = await missionService.planMission(userMessage);
      setMessages(prev => [...prev, { role: 'ai', content: { type: 'plan', data: plan } }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8 h-full flex flex-col">
      <header className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-heading font-bold text-text-primary flex items-center gap-3">
            <Flag className="w-8 h-8 text-primary" />
            Mission Planner
          </h1>
          <p className="text-text-secondary mt-1">Chat with KAIRO to break down complex goals into execution timelines.</p>
        </div>
      </header>

      <div className="flex-1 bg-surface rounded-2xl border border-gray-100 shadow-sm flex flex-col overflow-hidden min-h-0">
        <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-gray-50/50">
          
          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
              {msg.role === 'ai' && (
                <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
              )}
              
              <div className={`p-5 rounded-2xl shadow-sm max-w-2xl ${
                msg.role === 'user' 
                  ? 'bg-primary text-white rounded-tr-none' 
                  : 'bg-white border border-gray-100 rounded-tl-none'
              }`}>
                {msg.role === 'user' ? (
                  <p>{msg.content}</p>
                ) : (
                  msg.content.type === 'intro' ? (
                    <>
                      <p className="text-text-primary font-medium mb-2">Hello! I am your AI Chief of Staff.</p>
                      <p className="text-sm text-text-secondary">
                        Tell me about a new goal, project, or event. I will analyze it, estimate the preparation time, and generate a complete execution timeline for you.
                      </p>
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <p className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-2">Try saying:</p>
                        <div className="space-y-2">
                          <button onClick={() => setPrompt("I want to crack the Google Internship next summer.")} className="text-sm text-left bg-secondary/50 hover:bg-secondary px-3 py-2 rounded-lg text-primary w-full transition-colors">
                            "I want to crack the Google Internship next summer."
                          </button>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div>
                      <p className="font-semibold text-text-primary mb-3">Here is your Execution Timeline:</p>
                      <div className="space-y-3">
                        {msg.content.data.tasks?.map((t: any) => (
                          <div key={t.id} className="bg-gray-50 p-3 rounded-lg border border-gray-100 text-sm flex justify-between">
                            <span className="font-medium text-text-primary">{t.title}</span>
                            <span className="text-text-secondary">{t.estimatedDuration ? `${t.estimatedDuration}m` : ''}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="bg-white p-5 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center gap-2">
                <Loader2 className="w-4 h-4 animate-spin text-primary" />
                <span className="text-sm text-text-secondary">KAIRO is planning...</span>
              </div>
            </div>
          )}

        </div>

        {/* Input Box */}
        <div className="p-4 bg-white border-t border-gray-100">
          <form onSubmit={handleExecute} className="relative max-w-4xl mx-auto">
            <input 
              type="text" 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="What mission are we starting today?"
              className="w-full bg-background border border-gray-200 rounded-full pl-6 pr-14 py-4 text-sm focus:ring-2 focus:ring-primary/20 outline-none text-text-primary"
              disabled={loading}
            />
            <button 
              type="submit"
              disabled={loading || !prompt}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-primary hover:bg-primary-hover disabled:bg-primary/50 text-white rounded-full flex items-center justify-center transition-colors shadow-sm"
            >
              <Send className="w-4 h-4 ml-1" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
