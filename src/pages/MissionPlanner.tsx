import React, { useState } from 'react';
import { Flag, Send, Sparkles, Loader2, Clock } from 'lucide-react';
import { missionService } from '@/services/MissionService';
import { cn } from '@/lib/utils';

export const MissionPlanner = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<{ role: string; content: any }[]>([
    {
      role: 'ai',
      content: {
        type: 'intro',
      },
    },
  ]);

  const handleExecute = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prompt.trim()) return;

    const userMessage = prompt;
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setPrompt('');
    setLoading(true);

    try {
      const plan = await missionService.planMission(userMessage);
      setMessages(prev => [...prev, { role: 'ai', content: { type: 'plan', data: plan, goalName: userMessage } }]);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const setStarter = (text: string) => {
    setPrompt(text);
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col font-body animate-page-reveal">
      <header className="mb-6 md:mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-heading font-black text-text-primary flex items-center gap-3">
            <Flag className="w-7 h-7 md:w-8 md:h-8 text-primary animate-bounce" />
            AI Reverse Planner
          </h1>
          <p className="text-text-secondary text-xs md:text-sm mt-1">
            Input a future objective (e.g. Google Placement in 2027), and KAIRO maps the milestones backward.
          </p>
        </div>
      </header>

      <div className="flex-1 bg-white border border-gray-100 rounded-3xl shadow-sm flex flex-col overflow-hidden min-h-0">
        
        {/* Chats Feed */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 bg-gray-50/30">
          {messages.map((msg, idx) => (
            <div key={idx} className={cn("flex gap-3", msg.role === 'user' ? 'flex-row-reverse' : '')}>
              {msg.role === 'ai' && (
                <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/25">
                  <Sparkles className="w-4.5 h-4.5 text-white" />
                </div>
              )}
              
              <div className={cn(
                "p-5 rounded-2xl shadow-sm max-w-2xl text-xs sm:text-sm leading-relaxed",
                msg.role === 'user'
                  ? 'bg-primary text-white rounded-tr-none'
                  : 'bg-white border border-gray-100 rounded-tl-none text-text-primary'
              )}>
                
                {msg.role === 'user' ? (
                  <p className="font-semibold">{msg.content}</p>
                ) : msg.content.type === 'intro' ? (
                  <div className="space-y-4">
                    <p className="font-bold text-text-primary">Hello! I am your AI Chief of Staff.</p>
                    <p className="text-text-secondary">
                      Input your future placements or examination goals. I will reverse-plan your milestones, estimate preparation schedules, and draft sub-tasks directly in your Lemma Pod.
                    </p>
                    
                    <div className="border-t border-gray-100 pt-4 space-y-2">
                      <p className="text-[10px] font-extrabold text-text-secondary uppercase tracking-wider">Example queries:</p>
                      <div className="flex flex-col gap-2">
                        <button
                          onClick={() => setStarter('Google SWE Internship next summer')}
                          className="w-full text-left p-3 rounded-xl border border-gray-150 bg-gray-50/50 hover:bg-primary-light/40 hover:border-primary-border/20 transition-colors text-xs font-semibold text-text-primary"
                        >
                          "I want to crack the Google SDE Internship next summer."
                        </button>
                        <button
                          onClick={() => setStarter('Score 9.0+ CGPA in Sem End Exams')}
                          className="w-full text-left p-3 rounded-xl border border-gray-150 bg-gray-50/50 hover:bg-primary-light/40 hover:border-primary-border/20 transition-colors text-xs font-semibold text-text-primary"
                        >
                          "I need to score 9.0+ CGPA in DBMS and OS end semester exams."
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-5">
                    <div className="flex items-center justify-between border-b border-gray-50 pb-3">
                      <div>
                        <span className="text-[10px] font-extrabold text-primary uppercase tracking-wider block">Reverse Planning Roadmap</span>
                        <h4 className="font-black text-text-primary text-sm mt-0.5">{msg.content.goalName}</h4>
                      </div>
                      <span className="text-[10px] font-bold bg-secondary text-primary px-2.5 py-0.5 rounded-full shrink-0">Confidence: 96%</span>
                    </div>

                    {/* Milestones Timeline */}
                    <div className="space-y-4">
                      {msg.content.data.tasks?.map((t: any, i: number) => {
                        const isFinalStep = i === msg.content.data.tasks.length - 1;
                        return (
                          <div key={t.id || i} className="flex gap-4 relative">
                            {/* timeline line */}
                            {!isFinalStep && (
                              <div className="absolute left-[11px] top-6 bottom-[-22px] w-0.5 bg-gray-100"></div>
                            )}
                            
                            {/* milestone indicator */}
                            <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/20 text-primary flex items-center justify-center shrink-0 font-extrabold text-[10px] mt-0.5">
                              {i + 1}
                            </div>
                            
                            {/* details */}
                            <div className="flex-1 bg-gray-50/55 p-3 rounded-xl border border-gray-100/60 text-xs flex justify-between items-start gap-4">
                              <div>
                                <span className="font-bold text-text-primary block">{t.title}</span>
                                {t.description && (
                                  <span className="text-[10px] text-text-secondary block mt-0.5">{t.description}</span>
                                )}
                              </div>
                              
                              {t.estimatedDuration && (
                                <span className="text-[9px] font-bold bg-white border border-gray-200 text-text-secondary px-2 py-0.5 rounded-lg shrink-0 flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-gray-400" />
                                  {t.estimatedDuration}m
                                </span>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex gap-3">
              <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shrink-0 shadow-sm shadow-primary/25">
                <Sparkles className="w-4.5 h-4.5 text-white" />
              </div>
              <div className="bg-white p-4 rounded-2xl rounded-tl-none shadow-sm border border-gray-100 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-primary" />
                <span className="text-xs font-semibold text-text-secondary">KAIRO is reverse-planning your roadmap...</span>
              </div>
            </div>
          )}
        </div>

        {/* Action input bar */}
        <div className="p-4 bg-white border-t border-gray-100 shrink-0">
          <form onSubmit={handleExecute} className="relative max-w-4xl mx-auto flex items-center">
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Enter your future objective (e.g. Google Placement next summer)..."
              className="w-full bg-background border border-gray-200 rounded-full pl-6 pr-14 py-3.5 text-xs sm:text-sm focus:ring-2 focus:ring-primary/20 outline-none text-text-primary font-medium"
              disabled={loading}
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
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
