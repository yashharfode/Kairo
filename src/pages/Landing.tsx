import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, 
  ArrowRight, 
  Zap, 
  Target, 
  CheckCircle2, 
  MessageSquare, 
  Play, 
  Sparkles, 
  Clock, 
  Star, 
  Users, 
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export const Landing = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, user } = useAuth();

  const handleStart = async () => {
    if (user) {
      navigate('/dashboard');
    } else {
      await loginWithGoogle();
      navigate('/dashboard');
    }
  };

  return (
    <div className="min-h-screen mesh-glow grid-overlay flex flex-col font-body relative overflow-x-hidden">
      {/* Dynamic Background Mesh Glows */}
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 md:px-12 py-5 max-w-7xl mx-auto w-full relative z-10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-heading font-extrabold text-text-primary tracking-tight">KAIRO</span>
        </div>
        
        {/* Main Nav Links (Desktop) */}
        <div className="hidden md:flex items-center gap-8 text-sm font-semibold text-text-secondary">
          <a href="#product" className="hover:text-text-primary transition-colors">Product</a>
          <a href="#features" className="hover:text-text-primary transition-colors">Features</a>
          <a href="#how-it-works" className="hover:text-text-primary transition-colors">How it Works</a>
          <a href="#pricing" className="hover:text-text-primary transition-colors">Pricing</a>
          <a href="#about" className="hover:text-text-primary transition-colors">About</a>
        </div>

        <div className="flex items-center gap-6">
          {!user && (
            <button 
              onClick={loginWithGoogle} 
              className="text-text-secondary hover:text-text-primary font-semibold text-sm transition-colors"
            >
              Sign In
            </button>
          )}
          <button 
            onClick={handleStart}
            className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-md flex items-center gap-1.5 active:scale-95"
          >
            {user ? 'Go to Dashboard' : 'Start Free'}
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </nav>

      {/* Split Hero Section */}
      <main className="flex-1 flex flex-col px-6 md:px-12 py-8 md:py-14 max-w-7xl mx-auto w-full relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* Left Column: Hero Content */}
          <div className="lg:col-span-6 flex flex-col text-left">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Your AI Chief of Staff</span>
              </div>
              
              {/* Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-[60px] font-heading font-black text-text-primary tracking-tight leading-[1.05] mb-6">
                Think Less.<br />
                <span className="bg-gradient-to-br from-[#34908B] to-[#4AAEA8] bg-clip-text text-transparent">Execute More.</span>
              </h1>
              
              {/* Subheading */}
              <p className="text-sm sm:text-base text-text-secondary max-w-lg mb-8 leading-relaxed">
                KAIRO is an AI Executive Operating System that remembers everything, plans intelligently, and turns scattered information into completed outcomes.
              </p>
              
              {/* Hero Action Buttons */}
              <div className="flex flex-wrap items-center gap-4 mb-8">
                <button 
                  onClick={handleStart}
                  className="bg-primary hover:bg-primary-hover text-white px-7 py-3.5 rounded-full font-bold text-base transition-all shadow-lg shadow-primary/20 flex items-center gap-2 active:scale-95"
                >
                  <span>Start using KAIRO</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                
                <button className="bg-white hover:bg-gray-50 text-text-primary px-6 py-3.5 rounded-full font-bold text-base transition-all shadow-sm border border-gray-200 flex items-center gap-2">
                  <Play className="w-4 h-4 fill-current text-primary" />
                  <span>Watch Demo</span>
                </button>
              </div>

              {/* Trust Badges */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs font-semibold text-text-secondary border-t border-gray-100 pt-6">
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> No credit card required
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Setup in less than 2 minutes
                </span>
                <span className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-primary" /> Cancel anytime, no hassle
                </span>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Premium Mockup Dashboard View */}
          <div className="lg:col-span-6 relative flex items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="relative w-full max-w-[500px] h-[360px] flex items-center justify-center pointer-events-none"
            >
              {/* Mockup 1: Summary Counters (Left Stack) */}
              <div className="absolute left-0 top-0 flex flex-col gap-3 w-[150px] z-20">
                <div className="bg-white/95 backdrop-blur border border-gray-100 p-3 rounded-2xl shadow-md flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Brain className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-text-secondary uppercase">Memories</p>
                    <p className="text-base font-black text-text-primary">128</p>
                  </div>
                </div>

                <div className="bg-white/95 backdrop-blur border border-gray-100 p-3 rounded-2xl shadow-md flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Target className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-text-secondary uppercase">Missions</p>
                    <p className="text-base font-black text-text-primary">12</p>
                  </div>
                </div>

                <div className="bg-white/95 backdrop-blur border border-gray-100 p-3 rounded-2xl shadow-md flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-4 h-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-[10px] font-semibold text-text-secondary uppercase">Tasks</p>
                    <p className="text-base font-black text-text-primary">47</p>
                  </div>
                </div>
              </div>

              {/* Mockup 2: Focus / Tasks Card (Main Right Card) */}
              <div className="absolute right-0 top-4 w-[330px] bg-white border border-gray-100/90 rounded-2xl shadow-xl p-5 z-10">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h4 className="font-heading font-black text-text-primary text-sm">Today's Focus</h4>
                    <p className="text-[11px] text-text-secondary mt-0.5">3 critical tasks</p>
                  </div>
                  {/* Progress Indicator */}
                  <div className="relative w-10 h-10 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                      <circle cx="18" cy="18" r="16" fill="none" stroke="#F1F5F9" strokeWidth="3.5" />
                      <circle cx="18" cy="18" r="16" fill="none" stroke="var(--color-primary)" strokeWidth="3.5" strokeDasharray="78 100" strokeLinecap="round" />
                    </svg>
                    <span className="absolute text-[10px] font-extrabold text-text-primary">78%</span>
                  </div>
                </div>

                <div className="space-y-2.5">
                  <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100/60">
                    <div className="flex items-center gap-2 min-w-0">
                      <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-text-primary truncate">Gappy AI Hackathon Submission</span>
                    </div>
                    <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0">Today, 11 PM</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100/60">
                    <div className="flex items-center gap-2 min-w-0">
                      <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-text-primary truncate">DSA Practice - Arrays</span>
                    </div>
                    <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0">Today, 7 PM</span>
                  </div>

                  <div className="flex items-center justify-between p-2 rounded-xl bg-gray-50 border border-gray-100/60">
                    <div className="flex items-center gap-2 min-w-0">
                      <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                      <span className="text-xs font-semibold text-text-primary truncate">MERN Project - Auth Module</span>
                    </div>
                    <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0">Today, 9 PM</span>
                  </div>
                </div>
              </div>

              {/* Mockup 3: AI Copilot Message (Bottom Left overlay) */}
              <div className="absolute left-6 bottom-4 w-[280px] bg-white border border-gray-100 rounded-2xl shadow-lg p-3.5 flex items-center justify-between gap-3 z-30">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4.5 h-4.5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold text-text-primary">AI Copilot</p>
                    <p className="text-[10px] text-text-secondary truncate">I'm ready to help execute.</p>
                  </div>
                </div>
                <button className="text-[10px] font-bold bg-primary/10 text-primary hover:bg-primary hover:text-white px-2.5 py-1.5 rounded-lg transition-colors">
                  Ask KAIRO
                </button>
              </div>

              {/* Mockup 4: Next Deadline (Bottom Right overlay) */}
              <div className="absolute right-2 bottom-0 w-[160px] bg-white border border-gray-100 rounded-2xl shadow-md p-3.5 z-20">
                <div className="flex items-center gap-1.5 text-text-secondary mb-1">
                  <Clock className="w-3.5 h-3.5" />
                  <span className="text-[9px] font-bold uppercase tracking-wider">Next Deadline</span>
                </div>
                <p className="text-xs font-black text-text-primary leading-snug">Hackathon Submission</p>
                <p className="text-[10px] font-extrabold text-primary mt-1.5">In 6h 52m</p>
              </div>
            </motion.div>
          </div>
          
        </div>

        {/* Features Highlights (4 Columns Grid) */}
        <div id="features" className="mt-14 md:mt-20">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 w-full"
          >
            {/* Feature 1 */}
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-gray-100 text-left hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-5 shadow-sm shadow-primary/20">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-heading font-black mb-2 text-text-primary">Execution Engine</h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-4">
                AI automatically understands deadlines, calculates preparation time, and generates an execution timeline.
              </p>
              <div className="text-primary font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer">
                <span>Learn more</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-gray-100 text-left hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-5 shadow-sm shadow-primary/20">
                <Target className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-heading font-black mb-2 text-text-primary">Reverse Planning</h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-4">
                Input your future goal, and KAIRO works backwards to tell you exactly what you need to do today.
              </p>
              <div className="text-primary font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer">
                <span>Learn more</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-gray-100 text-left hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-5 shadow-sm shadow-primary/20">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-heading font-black mb-2 text-text-primary">Persistent Memory</h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-4">
                Never forget an idea again. Everything you save becomes searchable context for your AI assistant.
              </p>
              <div className="text-primary font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer">
                <span>Learn more</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white/90 backdrop-blur-md p-6 rounded-2xl shadow-sm border border-gray-100 text-left hover:-translate-y-1 hover:shadow-md transition-all duration-300 group">
              <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-5 shadow-sm shadow-primary/20">
                <MessageSquare className="w-5 h-5 text-white" />
              </div>
              <h3 className="text-base font-heading font-black mb-2 text-text-primary">AI Copilot</h3>
              <p className="text-xs sm:text-sm text-text-secondary leading-relaxed mb-4">
                Chat with KAIRO, get contextual answers, suggestions, and execution guidance in real-time.
              </p>
              <div className="text-primary font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer">
                <span>Learn more</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </motion.div>
        </div>

        {/* Footer Stats strip */}
        <div className="mt-14 md:mt-20 border-t border-gray-200/60 pt-8 w-full">
          <div className="flex flex-wrap md:flex-nowrap items-center justify-between gap-6 bg-white/60 backdrop-blur-sm border border-gray-100 p-5 rounded-2xl shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-500/10 flex items-center justify-center text-emerald-600">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <span className="text-xs sm:text-sm font-black text-text-primary">Trusted by students, builders and professionals</span>
            </div>
            
            <div className="h-px md:h-8 w-full md:w-px bg-gray-200" />

            <div className="grid grid-cols-2 md:flex items-center gap-8 md:gap-12 w-full md:w-auto">
              <div className="flex items-center gap-2">
                <Users className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs font-black text-text-primary">500+</p>
                  <p className="text-[10px] text-text-secondary font-semibold">Active Users</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs font-black text-text-primary">10K+</p>
                  <p className="text-[10px] text-text-secondary font-semibold">Tasks Completed</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs font-black text-text-primary">1M+</p>
                  <p className="text-[10px] text-text-secondary font-semibold">Minutes Saved</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Star className="w-5 h-5 text-primary" />
                <div>
                  <p className="text-xs font-black text-text-primary">99%</p>
                  <p className="text-[10px] text-text-secondary font-semibold">User Satisfaction</p>
                </div>
              </div>
            </div>
          </div>
        </div>

      </main>
    </div>
  );
};
