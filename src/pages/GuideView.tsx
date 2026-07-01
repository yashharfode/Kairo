import { 
  BookOpen, LayoutDashboard, Layers, Brain, Inbox, Flag, Calendar, 
  CheckSquare, MessageSquare, HelpCircle, 
  ArrowRight, Sparkles, Compass, Zap
} from 'lucide-react';
import { cn } from '@/lib/utils';

export const GuideView = () => {
  const steps = [
    {
      num: '01',
      title: 'Smart Inbox (Signal Intake)',
      desc: 'Copy and paste raw texts, WhatsApp announcements, emails, or links. KAIRO extracts targets and context automatically.',
      color: 'bg-indigo-50 text-indigo-600 border-indigo-150',
      badge: 'Start Here'
    },
    {
      num: '02',
      title: 'Mission Planner (AI Blueprinting)',
      desc: 'KAIRO structures the parsed signal into an active Mission Workspace with defined start dates, deadlines, and stages.',
      color: 'bg-blue-50 text-blue-600 border-blue-150',
      badge: 'Automated Planning'
    },
    {
      num: '03',
      title: 'Mission Calendar (Visual HUD)',
      desc: 'Manage milestones in an Outlook-inspired grid. Toggle view filters, use "Fit Screen" mode, and drag items to reschedule.',
      color: 'bg-emerald-50 text-emerald-600 border-emerald-150',
      badge: 'Time Allocation'
    },
    {
      num: '04',
      title: 'Execution Tasks (Deep Work)',
      desc: 'Open your Linear-style checklist. View difficulty tiers, start Pomodoro timers, and check off items as you complete them.',
      color: 'bg-amber-50 text-amber-600 border-amber-150',
      badge: 'Execution'
    },
    {
      num: '05',
      title: 'Cognitive Brain (Knowledge Hub)',
      desc: 'Check the visual 2D physics graph of connected concepts and search past memories automatically logged by KAIRO.',
      color: 'bg-purple-50 text-purple-600 border-purple-150',
      badge: 'Memory Vault'
    }
  ];

  const tabGuides = [
    {
      name: 'Dashboard',
      icon: LayoutDashboard,
      role: 'Your Executive HUD',
      action: 'Open daily to check your Execution Score, review current goals, see Next Up tasks, and monitor recent alerts.',
      highlight: 'Displays live progress widgets, daily completion scores, and immediate actions.'
    },
    {
      name: 'Workspaces',
      icon: Layers,
      role: 'Project Control Center',
      action: 'View active projects, check execution milestones, track stage progressions, and review workspace health risk assessments.',
      highlight: 'Provides high-level tracking of multiple active objectives simultaneously.'
    },
    {
      name: 'AI Brain',
      icon: Brain,
      role: 'Cognitive Memory Pod',
      action: 'Explore an interactive physics-directed graph connecting concepts like MERN Stack, React, or DSA. View logged memory logs.',
      highlight: 'Acts as your personal database of skills, concept connections, and past activity records.'
    },
    {
      name: 'Smart Inbox',
      icon: Inbox,
      role: 'Signal Raw Intake',
      action: 'Paste messy notes, messages, or notices. Fill in optional metadata and let KAIRO extract a clean blueprint.',
      highlight: 'Built-in fail-safe workflow simulator runs offline/online to instantly generate tasks.'
    },
    {
      name: 'Mission Planner',
      icon: Flag,
      role: 'Roadmap Generator',
      action: 'Interact directly with the Chief of Staff agent to reverse-engineer high-level goals into step-by-step roadmaps.',
      highlight: 'Uses chat interface to detail complex deliverables into concrete action plans.'
    },
    {
      name: 'Calendar',
      icon: Calendar,
      role: 'Outlook Schedule View',
      action: 'Schedule preparation blocks, view deadlines, toggle filter categories, and use "Fit Screen" mode for an overlay viewport.',
      highlight: 'Hairline grid with today timezone markers, pastel color-coded blocks, and hot module drag-rescheduling.'
    },
    {
      name: 'Tasks',
      icon: CheckSquare,
      role: 'Linear-style Checklist',
      action: 'Mark tasks in-progress or completed. Access Pomodoro deep work timers, check difficulty ratings, and view AI matching rates.',
      highlight: 'Sleek checkboxes, KPI trend lines, and productivity metrics optimized for high focus.'
    },
    {
      name: 'AI Chat',
      icon: MessageSquare,
      role: 'CoS Conversation Node',
      action: 'Consult your Chief of Staff regarding complex plans, task overrides, scheduling advice, or coding strategies.',
      highlight: 'Direct connection to KAIRO agent context with memory retrieval.'
    }
  ];

  return (
    <div className="bg-[#FAFAFC] min-h-screen font-body p-6 md:p-8 space-y-8 overflow-y-auto">
      
      {/* Header Banner */}
      <header className="bg-gradient-to-r from-[#5A5CD8] to-[#8B5CF6] rounded-[24px] p-8 md:p-10 text-white relative overflow-hidden shadow-md">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-96 h-96 bg-indigo-600/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 space-y-4 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold font-mono tracking-wider uppercase border border-white/10">
            <Compass className="w-3.5 h-3.5 animate-spin" />
            Workspace Navigator
          </div>
          
          <h1 className="text-[32px] md:text-[38px] font-black tracking-tight leading-tight">
            Welcome to KAIRO AI OS
          </h1>
          
          <p className="text-[14px] md:text-[15px] font-medium text-white/90 leading-relaxed">
            KAIRO is your personal AI Chief of Staff. It bridges the gap between raw unstructured messages (signals) and highly scheduled, focus-driven execution workflows.
          </p>
        </div>
      </header>

      {/* STEP-BY-STEP WORKFLOW GUIDE */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#ECECEC] pb-3">
          <Zap className="w-5 h-5 text-[#5A5CD8]" />
          <h2 className="text-[18px] font-extrabold text-[#111827]">Recommended User Workflow</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-5">
          {steps.map((s, idx) => (
            <div 
              key={idx} 
              className="bg-white border border-[#ECECEC] rounded-2xl p-5 shadow-sm space-y-4 flex flex-col justify-between hover:border-[#5A5CD8] hover:shadow-md transition-all duration-300 relative group"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[20px] font-black font-mono text-gray-200 group-hover:text-[#5A5CD8]/30 transition-colors">
                    {s.num}
                  </span>
                  <span className={cn("text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border", s.color)}>
                    {s.badge}
                  </span>
                </div>
                
                <h4 className="text-[14px] font-bold text-[#111827] leading-tight">
                  {s.title}
                </h4>
                
                <p className="text-[12px] font-medium text-[#6B7280] leading-relaxed">
                  {s.desc}
                </p>
              </div>

              {idx < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 z-20 bg-[#FAFAFC] border border-[#ECECEC] p-1 rounded-full text-[#6B7280] group-hover:text-[#5A5CD8] transition-colors">
                  <ArrowRight className="w-3 h-3" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* DETAILED TAB NAVIGATOR */}
      <section className="space-y-4">
        <div className="flex items-center gap-2 border-b border-[#ECECEC] pb-3">
          <BookOpen className="w-5 h-5 text-[#5A5CD8]" />
          <h2 className="text-[18px] font-extrabold text-[#111827]">Tab Breakdown & Feature Map</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {tabGuides.map((guide) => {
            const Icon = guide.icon;
            return (
              <div 
                key={guide.name} 
                className="bg-white border border-[#ECECEC] rounded-2xl p-5 shadow-sm space-y-3.5 hover:border-[#5A5CD8] transition-all duration-300 flex flex-col justify-between"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-[#5A5CD8]/10 text-[#5A5CD8] flex items-center justify-center shrink-0">
                      <Icon className="w-4.5 h-4.5" />
                    </div>
                    <div>
                      <h4 className="text-[14px] font-extrabold text-[#111827] leading-tight">{guide.name}</h4>
                      <span className="text-[11px] font-bold text-[#6B7280]">{guide.role}</span>
                    </div>
                  </div>
                  
                  <p className="text-[12px] font-semibold text-[#6B7280] leading-relaxed">
                    {guide.action}
                  </p>
                </div>

                <div className="bg-[#FAFAFC] border border-[#ECECEC] p-3 rounded-lg flex gap-1.5 items-start">
                  <Sparkles className="w-3.5 h-3.5 text-[#5A5CD8] shrink-0 mt-0.5" />
                  <p className="text-[10px] font-bold text-[#6B7280] leading-normal">
                    {guide.highlight}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* QUICK SYSTEM FAQs */}
      <section className="bg-white border border-[#ECECEC] rounded-[24px] p-6 md:p-8 shadow-sm space-y-5">
        <div className="flex items-center gap-2 border-b border-[#ECECEC] pb-3">
          <HelpCircle className="w-5 h-5 text-[#5A5CD8]" />
          <h2 className="text-[16px] font-extrabold text-[#111827]">Frequently Asked Questions</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-1.5">
            <h4 className="text-[14px] font-bold text-[#111827]">Q: How does KAIRO link everything?</h4>
            <p className="text-[12px] font-medium text-[#6B7280] leading-relaxed">
              When you paste text into the <strong>Smart Inbox</strong>, KAIRO automatically creates a corresponding workspace card in <strong>Workspaces</strong> and places prep schedule blocks onto the <strong>Calendar</strong>. In-progress tasks are also logged into the <strong>Tasks</strong> panel and written to the <strong>AI Brain</strong> cognitive graph.
            </p>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-[14px] font-bold text-[#111827]">Q: What happens if my internet disconnects?</h4>
            <p className="text-[12px] font-medium text-[#6B7280] leading-relaxed">
              KAIRO has built-in offline fallbacks! If the backend API throws a network timeout or connection error, the system runs local simulators. Seed graphs, past memory logs, and mock workflow generation keep working seamlessly.
            </p>
          </div>
        </div>
      </section>

    </div>
  );
};
