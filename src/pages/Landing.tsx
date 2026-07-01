import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  Brain, ArrowRight, Zap, Target, CheckCircle2, MessageSquare,
  Play, Sparkles, Clock, Star, Users, ShieldCheck, TrendingUp,
  Menu, X, Calendar, BookOpen, BarChart2, ChevronRight, Quote
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const fadeUp = (delay = 0) => ({
  initial: { opacity: 0, y: 24 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.55, delay, ease: 'easeOut' as const }
});

export const Landing = () => {
  const navigate = useNavigate();
  const { loginWithGoogle, user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleStart = async () => {
    if (user) {
      navigate('/dashboard');
    } else {
      await loginWithGoogle();
      navigate('/dashboard');
    }
  };

  const navLinks = [
    { label: 'Features', href: '#features' },
    { label: 'How it Works', href: '#how-it-works' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'Testimonials', href: '#testimonials' },
  ];

  return (
    <div className="min-h-screen bg-[#fafafa] flex flex-col font-body relative overflow-x-hidden">
      {/* Background glows */}
      <div className="absolute top-0 right-[-10%] w-[500px] h-[500px] bg-primary/8 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[20%] left-[-5%] w-[400px] h-[400px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* ── NAVBAR ── */}
      <nav className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100/80">
        <div className="flex items-center justify-between px-5 md:px-12 py-4 max-w-7xl mx-auto w-full">
          {/* Logo */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-md shadow-primary/20">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-heading font-extrabold text-text-primary tracking-tight">KAIRO</span>
          </div>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-7 text-sm font-semibold text-text-secondary">
            {navLinks.map(l => (
              <a key={l.label} href={l.href} className="hover:text-text-primary transition-colors">{l.label}</a>
            ))}
          </div>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-4">
            {!user && (
              <button onClick={loginWithGoogle} className="text-text-secondary hover:text-text-primary font-semibold text-sm transition-colors">
                Sign In
              </button>
            )}
            <button onClick={handleStart} className="bg-primary hover:bg-primary-hover text-white px-5 py-2.5 rounded-full font-bold text-sm transition-all shadow-md flex items-center gap-1.5 active:scale-95">
              {user ? 'Dashboard' : 'Start Free'}
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile hamburger */}
          <button
            className="md:hidden w-9 h-9 rounded-xl border border-gray-200 flex items-center justify-center text-text-primary hover:bg-gray-50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-gray-100 bg-white px-5 pb-5 space-y-4"
          >
            {navLinks.map(l => (
              <a
                key={l.label}
                href={l.href}
                onClick={() => setMobileMenuOpen(false)}
                className="block text-sm font-semibold text-text-secondary hover:text-text-primary py-2 border-b border-gray-50 transition-colors"
              >
                {l.label}
              </a>
            ))}
            <button onClick={handleStart} className="w-full bg-primary hover:bg-primary-hover text-white py-3 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 active:scale-95 mt-2">
              {user ? 'Go to Dashboard' : 'Start Free →'}
            </button>
          </motion.div>
        )}
      </nav>

      <main className="flex-1 flex flex-col">

        {/* ── HERO ── */}
        <section className="px-5 md:px-12 pt-12 pb-16 md:pt-20 md:pb-24 max-w-7xl mx-auto w-full">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

            {/* Left: Copy */}
            <motion.div {...fadeUp(0)} className="flex flex-col text-left">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider mb-5 self-start">
                <Sparkles className="w-3.5 h-3.5" />
                <span>Your AI Chief of Staff</span>
              </div>

              <h1 className="text-4xl sm:text-5xl md:text-[58px] font-heading font-black text-text-primary tracking-tight leading-[1.05] mb-5">
                Think Less.<br />
                <span className="bg-gradient-to-br from-[#5A5CD8] to-[#8B5CF6] bg-clip-text text-transparent">Execute More.</span>
              </h1>

              <p className="text-sm sm:text-base text-text-secondary max-w-lg mb-8 leading-relaxed">
                KAIRO is an AI Executive Operating System that remembers everything, plans intelligently, and turns scattered information into completed outcomes.
              </p>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
                <button onClick={handleStart} className="bg-primary hover:bg-primary-hover text-white px-7 py-3.5 rounded-full font-bold text-base transition-all shadow-lg shadow-primary/20 flex items-center justify-center gap-2 active:scale-95">
                  Start using KAIRO <ArrowRight className="w-4 h-4" />
                </button>
                <button className="bg-white hover:bg-gray-50 text-text-primary px-6 py-3.5 rounded-full font-bold text-base transition-all shadow-sm border border-gray-200 flex items-center justify-center gap-2">
                  <Play className="w-4 h-4 fill-current text-primary" /> Watch Demo
                </button>
              </div>

              <div className="flex flex-col sm:flex-row flex-wrap gap-x-6 gap-y-2 text-xs font-semibold text-text-secondary border-t border-gray-100 pt-5">
                {['No credit card required', 'Setup in less than 2 minutes', 'Cancel anytime'].map(t => (
                  <span key={t} className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-primary shrink-0" /> {t}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Right: App Mockup */}
            <motion.div {...fadeUp(0.15)} className="relative w-full flex justify-center lg:justify-end">
              <div className="relative w-full max-w-[480px]">
                {/* Main card */}
                <div className="bg-white border border-gray-100 rounded-3xl shadow-2xl p-5 w-full">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="font-heading font-black text-text-primary text-sm">Today's Focus</h4>
                      <p className="text-[11px] text-text-secondary mt-0.5">3 critical tasks</p>
                    </div>
                    <div className="relative w-10 h-10 flex items-center justify-center">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <circle cx="18" cy="18" r="16" fill="none" stroke="#F1F5F9" strokeWidth="3.5" />
                        <circle cx="18" cy="18" r="16" fill="none" stroke="var(--color-primary)" strokeWidth="3.5" strokeDasharray="78 100" strokeLinecap="round" />
                      </svg>
                      <span className="absolute text-[10px] font-extrabold text-text-primary">78%</span>
                    </div>
                  </div>
                  <div className="space-y-2.5">
                    {[
                      { label: 'Gappy AI Hackathon Submission', time: 'Today, 11 PM' },
                      { label: 'DSA Practice — Arrays & Strings', time: 'Today, 7 PM' },
                      { label: 'MERN Project — Auth Module', time: 'Today, 9 PM' },
                    ].map(task => (
                      <div key={task.label} className="flex items-center justify-between p-2.5 rounded-xl bg-gray-50 border border-gray-100/60">
                        <div className="flex items-center gap-2 min-w-0">
                          <TrendingUp className="w-4 h-4 text-primary shrink-0" />
                          <span className="text-xs font-semibold text-text-primary truncate">{task.label}</span>
                        </div>
                        <span className="text-[9px] font-bold bg-primary/10 text-primary px-1.5 py-0.5 rounded shrink-0 ml-2">{task.time}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* AI Copilot badge */}
                <div className="absolute -bottom-4 -left-3 sm:-left-6 bg-white border border-gray-100 rounded-2xl shadow-lg p-3 flex items-center gap-2.5 w-[220px]">
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] font-extrabold text-text-primary">KAIRO AI</p>
                    <p className="text-[10px] text-text-secondary truncate">Ready to help execute.</p>
                  </div>
                </div>

                {/* Stats pill */}
                <div className="absolute -top-4 -right-3 sm:-right-5 bg-white border border-gray-100 rounded-2xl shadow-lg p-3 flex items-center gap-3">
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-black text-text-primary leading-none">128</span>
                    <span className="text-[9px] text-text-secondary font-bold uppercase">Memories</span>
                  </div>
                  <div className="w-px h-8 bg-gray-100" />
                  <div className="flex flex-col items-center">
                    <span className="text-lg font-black text-text-primary leading-none">47</span>
                    <span className="text-[9px] text-text-secondary font-bold uppercase">Tasks</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        {/* ── STATS STRIP ── */}
        <section className="px-5 md:px-12 pb-16 max-w-7xl mx-auto w-full">
          <motion.div {...fadeUp(0.2)} className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {[
              { icon: Users, value: '500+', label: 'Active Users' },
              { icon: CheckCircle2, value: '10K+', label: 'Tasks Completed' },
              { icon: Clock, value: '1M+', label: 'Minutes Saved' },
              { icon: Star, value: '99%', label: 'Satisfaction' },
            ].map(stat => (
              <div key={stat.label} className="bg-white border border-gray-100 rounded-2xl p-4 flex flex-col items-center text-center shadow-sm hover:shadow-md transition-shadow">
                <stat.icon className="w-5 h-5 text-primary mb-2" />
                <span className="text-2xl font-black text-text-primary font-mono">{stat.value}</span>
                <span className="text-[10px] text-text-secondary font-bold uppercase tracking-wider mt-0.5">{stat.label}</span>
              </div>
            ))}
          </motion.div>
        </section>

        {/* ── FEATURES ── */}
        <section id="features" className="px-5 md:px-12 py-16 md:py-20 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeUp(0)} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider mb-4">
                <Zap className="w-3.5 h-3.5" /> Features
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-black text-text-primary tracking-tight">
                Everything you need to<br className="hidden sm:block" /> <span className="text-primary">execute at full speed</span>
              </h2>
              <p className="text-text-secondary text-sm md:text-base mt-4 max-w-xl mx-auto leading-relaxed">
                KAIRO is not just another productivity tool. It's your AI operating system that thinks ahead so you don't have to.
              </p>
            </motion.div>

            <motion.div {...fadeUp(0.1)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { icon: Zap, title: 'Execution Engine', desc: 'AI automatically understands deadlines, calculates preparation time, and generates a personalized execution timeline.' },
                { icon: Target, title: 'Reverse Planning', desc: 'Input your future goal and KAIRO works backwards to tell you exactly what to do today to get there.' },
                { icon: Brain, title: 'Persistent Memory', desc: 'Never lose an idea. Everything you save becomes searchable context powering smarter AI decisions.' },
                { icon: MessageSquare, title: 'AI Copilot Chat', desc: 'Chat with KAIRO for contextual answers, task suggestions, and real-time execution guidance.' },
                { icon: Calendar, title: 'Smart Calendar', desc: 'Intelligent scheduling that auto-blocks time, warns of conflicts, and optimizes your day automatically.' },
                { icon: BarChart2, title: 'Analytics & Insights', desc: 'See exactly where your time goes. Track missions, health scores, streaks, and execution patterns.' },
              ].map((feat, i) => (
                <motion.div
                  key={feat.title}
                  {...fadeUp(i * 0.05)}
                  className="bg-[#fafafa] hover:bg-white p-6 rounded-2xl border border-gray-100 hover:shadow-md transition-all duration-300 group text-left"
                >
                  <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center mb-4 shadow-sm shadow-primary/20">
                    <feat.icon className="w-5 h-5 text-white" />
                  </div>
                  <h3 className="text-base font-heading font-black text-text-primary mb-2">{feat.title}</h3>
                  <p className="text-sm text-text-secondary leading-relaxed mb-3">{feat.desc}</p>
                  <span className="text-primary font-bold text-xs flex items-center gap-1 group-hover:translate-x-1 transition-transform cursor-pointer">
                    Learn more <ChevronRight className="w-3.5 h-3.5" />
                  </span>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── HOW IT WORKS ── */}
        <section id="how-it-works" className="px-5 md:px-12 py-16 md:py-24 max-w-7xl mx-auto w-full">
          <motion.div {...fadeUp(0)} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider mb-4">
              <BookOpen className="w-3.5 h-3.5" /> How it Works
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-text-primary tracking-tight">
              From idea to execution<br className="hidden sm:block" /> in <span className="text-primary">3 simple steps</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 relative">
            {/* Connector line (desktop only) */}
            <div className="hidden md:block absolute top-10 left-[22%] right-[22%] h-px bg-gradient-to-r from-primary/20 via-primary/50 to-primary/20" />
            
            {[
              { step: '01', title: 'Paste anything', desc: 'Drop a link, paste a message, type a goal. KAIRO reads and understands your content instantly.' },
              { step: '02', title: 'AI builds your plan', desc: 'KAIRO creates missions, breaks them into tasks, schedules them, and sets reminders automatically.' },
              { step: '03', title: 'Execute with focus', desc: 'Open your dashboard each morning and know exactly what to do. KAIRO keeps track of everything.' },
            ].map((s, i) => (
              <motion.div key={s.step} {...fadeUp(i * 0.1)} className="flex flex-col items-center text-center relative">
                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center mb-5 shadow-lg shadow-primary/20 text-white font-mono font-black text-2xl z-10">
                  {s.step}
                </div>
                <h3 className="text-lg font-heading font-black text-text-primary mb-2">{s.title}</h3>
                <p className="text-sm text-text-secondary leading-relaxed max-w-xs">{s.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── TESTIMONIALS ── */}
        <section id="testimonials" className="px-5 md:px-12 py-16 md:py-20 bg-white border-y border-gray-100">
          <div className="max-w-7xl mx-auto">
            <motion.div {...fadeUp(0)} className="text-center mb-12">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider mb-4">
                <Star className="w-3.5 h-3.5" /> Testimonials
              </div>
              <h2 className="text-3xl md:text-4xl font-heading font-black text-text-primary tracking-tight">
                Loved by <span className="text-primary">builders & students</span>
              </h2>
            </motion.div>

            <motion.div {...fadeUp(0.1)} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[
                { name: 'Aryan Shah', role: 'CS Student, IIT Bombay', text: 'KAIRO replaced 5 different apps for me. Mission planning, calendar, notes, tasks — everything in one smart place.' },
                { name: 'Priya Mehra', role: 'Startup Founder', text: 'The AI copilot alone is worth it. I paste meeting notes and it generates tasks, assigns deadlines and reminds me automatically.' },
                { name: 'Dev Kumar', role: 'Competitive Programmer', text: 'I use KAIRO to plan my DSA prep schedule. It reverse-plans from exam dates and keeps me on track without manual effort.' },
              ].map((t, i) => (
                <motion.div
                  key={t.name}
                  {...fadeUp(i * 0.08)}
                  className="bg-[#fafafa] border border-gray-100 rounded-2xl p-6 flex flex-col gap-4 hover:shadow-md hover:bg-white transition-all"
                >
                  <Quote className="w-6 h-6 text-primary/30" />
                  <p className="text-sm text-text-secondary leading-relaxed flex-1">"{t.text}"</p>
                  <div className="flex items-center gap-3 pt-2 border-t border-gray-100">
                    <div className="w-9 h-9 rounded-full bg-primary text-white font-black text-xs flex items-center justify-center">
                      {t.name.split(' ').map(n => n[0]).join('')}
                    </div>
                    <div>
                      <p className="text-xs font-black text-text-primary">{t.name}</p>
                      <p className="text-[10px] text-text-secondary font-semibold">{t.role}</p>
                    </div>
                    <div className="ml-auto flex gap-0.5">
                      {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ── PRICING ── */}
        <section id="pricing" className="px-5 md:px-12 py-16 md:py-24 max-w-7xl mx-auto w-full">
          <motion.div {...fadeUp(0)} className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary font-bold text-xs uppercase tracking-wider mb-4">
              <ShieldCheck className="w-3.5 h-3.5" /> Pricing
            </div>
            <h2 className="text-3xl md:text-4xl font-heading font-black text-text-primary tracking-tight">
              Simple, <span className="text-primary">transparent pricing</span>
            </h2>
            <p className="text-text-secondary text-sm mt-3">Start free. No credit card required.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
            {[
              {
                name: 'Free', price: '₹0', period: 'Forever', color: 'border-gray-200',
                features: ['5 Active Missions', '50 Memory nodes', 'AI Copilot (10 msgs/day)', 'Basic Calendar', 'Community Support'],
                cta: 'Get Started Free', highlight: false
              },
              {
                name: 'Pro', price: '₹299', period: '/month', color: 'border-primary',
                features: ['Unlimited Missions', 'Unlimited Memory', 'Unlimited AI Copilot', 'Smart Calendar + Reminders', 'Analytics Dashboard', 'Priority Support'],
                cta: 'Start Pro Trial', highlight: true
              },
              {
                name: 'Team', price: '₹799', period: '/month', color: 'border-gray-200',
                features: ['Everything in Pro', 'Up to 10 Members', 'Shared Workspaces', 'Team Analytics', 'Custom Integrations', 'Dedicated Support'],
                cta: 'Contact Sales', highlight: false
              },
            ].map((plan, i) => (
              <motion.div
                key={plan.name}
                {...fadeUp(i * 0.1)}
                className={`relative bg-white rounded-3xl border-2 ${plan.color} p-6 flex flex-col gap-5 ${plan.highlight ? 'shadow-xl shadow-primary/10 scale-105 md:scale-105' : 'shadow-sm hover:shadow-md'} transition-all`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full">
                    Most Popular
                  </div>
                )}
                <div>
                  <h3 className="font-heading font-black text-text-primary text-lg">{plan.name}</h3>
                  <div className="flex items-baseline gap-1 mt-1">
                    <span className="text-3xl font-black text-text-primary font-mono">{plan.price}</span>
                    <span className="text-sm text-text-secondary font-semibold">{plan.period}</span>
                  </div>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map(f => (
                    <li key={f} className="flex items-start gap-2 text-xs text-text-secondary font-semibold">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" /> {f}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={handleStart}
                  className={`w-full py-3 rounded-2xl font-bold text-sm transition-all active:scale-95 ${plan.highlight ? 'bg-primary hover:bg-primary-hover text-white shadow-md shadow-primary/20' : 'border border-gray-200 hover:bg-gray-50 text-text-primary'}`}
                >
                  {plan.cta}
                </button>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── FINAL CTA ── */}
        <section className="px-5 md:px-12 py-16 md:py-20 max-w-7xl mx-auto w-full">
          <motion.div
            {...fadeUp(0)}
            className="bg-gradient-to-br from-primary to-violet-600 rounded-3xl p-8 md:p-14 text-center text-white relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-5xl font-heading font-black tracking-tight mb-4">
                Ready to stop planning<br className="hidden sm:block" /> and start executing?
              </h2>
              <p className="text-white/80 text-sm md:text-base mb-8 max-w-lg mx-auto leading-relaxed">
                Join thousands of students and professionals who use KAIRO to turn ambition into action every single day.
              </p>
              <button
                onClick={handleStart}
                className="bg-white text-primary hover:bg-gray-50 px-8 py-4 rounded-full font-black text-base transition-all shadow-xl flex items-center gap-2 mx-auto active:scale-95"
              >
                Start Free — No Card Needed <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        </section>

        {/* ── FOOTER ── */}
        <footer className="border-t border-gray-100 bg-white px-5 md:px-12 py-10">
          <div className="max-w-7xl mx-auto">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-10">
              <div className="col-span-2 md:col-span-1">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                    <Brain className="w-4 h-4 text-white" />
                  </div>
                  <span className="font-heading font-extrabold text-text-primary">KAIRO</span>
                </div>
                <p className="text-xs text-text-secondary leading-relaxed">Your AI Executive Operating System. Think less, execute more.</p>
              </div>
              {[
                { title: 'Product', links: ['Features', 'How it Works', 'Pricing', 'Changelog'] },
                { title: 'Company', links: ['About', 'Blog', 'Careers', 'Contact'] },
                { title: 'Legal', links: ['Privacy Policy', 'Terms of Service', 'Cookie Policy'] },
              ].map(col => (
                <div key={col.title}>
                  <h4 className="text-xs font-black text-text-primary uppercase tracking-wider mb-3">{col.title}</h4>
                  <ul className="space-y-2">
                    {col.links.map(link => (
                      <li key={link}>
                        <a href="#" className="text-xs text-text-secondary hover:text-text-primary transition-colors font-semibold">{link}</a>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
            <div className="border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3">
              <p className="text-[11px] text-text-secondary font-semibold">© 2026 KAIRO. Built with ❤️ for the Gappy AI Hackathon.</p>
              <div className="flex items-center gap-1">
                {[1,2,3,4,5].map(s => <Star key={s} className="w-3 h-3 text-amber-400 fill-amber-400" />)}
                <span className="text-[11px] text-text-secondary font-bold ml-1">4.9/5 on Product Hunt</span>
              </div>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
};
