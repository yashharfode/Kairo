
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Brain, ArrowRight, Zap, Target, CheckCircle2 } from 'lucide-react';
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
    <div className="min-h-screen bg-background flex flex-col font-body">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 max-w-7xl mx-auto w-full">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center shadow-lg shadow-primary/20">
            <Brain className="w-5 h-5 text-white" />
          </div>
          <span className="text-xl font-heading font-bold text-text-primary tracking-tight">KAIRO</span>
        </div>
        <div className="flex items-center gap-6">
          {!user && <button onClick={loginWithGoogle} className="text-text-secondary hover:text-text-primary font-medium transition-colors">Sign In</button>}
          <button 
            onClick={handleStart}
            className="bg-text-primary text-white px-5 py-2.5 rounded-full font-medium hover:bg-text-primary/90 transition-all shadow-md"
          >
            {user ? 'Go to Dashboard' : 'Start Free'}
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-20 text-center max-w-5xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-secondary text-primary font-medium text-sm mb-8">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            Your AI Chief of Staff
          </div>
          <h1 className="text-5xl md:text-7xl font-heading font-bold text-text-primary tracking-tight leading-[1.1] mb-6">
            Think Less.<br />Execute More.
          </h1>
          <p className="text-lg md:text-xl text-text-secondary max-w-2xl mx-auto mb-10">
            KAIRO is an AI Executive Operating System that remembers everything, plans intelligently, and turns scattered information into completed outcomes.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button 
              onClick={handleStart}
              className="w-full sm:w-auto bg-primary hover:bg-primary-hover text-white px-8 py-4 rounded-full font-medium text-lg transition-all shadow-lg shadow-primary/25 flex items-center justify-center gap-2 group"
            >
              {user ? 'Go to Dashboard' : 'Start using KAIRO'}
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
            <button className="w-full sm:w-auto bg-white hover:bg-gray-50 text-text-primary px-8 py-4 rounded-full font-medium text-lg transition-all shadow-sm border border-border flex items-center justify-center gap-2">
              Watch Demo
            </button>
          </div>
        </motion.div>

        {/* Feature Highlights */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-24 w-full"
        >
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6">
              <Zap className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-heading font-bold mb-3 text-text-primary">Execution Engine</h3>
            <p className="text-text-secondary">AI automatically understands deadlines, calculates preparation time, and generates an execution timeline.</p>
          </div>
          
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-heading font-bold mb-3 text-text-primary">Reverse Planning</h3>
            <p className="text-text-secondary">Input your future goal, and KAIRO works backwards to tell you exactly what you need to do today.</p>
          </div>

          <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-left hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center mb-6">
              <CheckCircle2 className="w-6 h-6 text-primary" />
            </div>
            <h3 className="text-xl font-heading font-bold mb-3 text-text-primary">Persistent Memory</h3>
            <p className="text-text-secondary">Never forget an idea again. Everything you save becomes searchable context for your AI assistant.</p>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
