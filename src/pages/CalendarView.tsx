import { useEffect, useState, useRef } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { calendarService } from '@/services/CalendarService';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, 
  Sparkles, Check, Filter, BellRing, X, Maximize2, Minimize2
} from 'lucide-react';
import { cn } from '@/lib/utils';
import '../styles/calendar.css';

// --- ENRICHED EVENT COLORS & STYLES ---
const EVENT_COLORS: Record<string, { bg: string; border: string; text: string; label: string; cardBg: string }> = {
  task:        { bg: '#6366f1', border: '#4f46e5', text: '#4f46e5', label: 'Task', cardBg: 'rgba(99, 102, 241, 0.07)' },
  deadline:    { bg: '#ef4444', border: '#dc2626', text: '#dc2626', label: 'Deadline', cardBg: 'rgba(239, 68, 68, 0.07)' },
  milestone:   { bg: '#f59e0b', border: '#d97706', text: '#d97706', label: 'Milestone', cardBg: 'rgba(245, 158, 11, 0.07)' },
  prep:        { bg: '#10b981', border: '#059669', text: '#059669', label: 'Prep Block', cardBg: 'rgba(20, 184, 166, 0.07)' },
  exam:        { bg: '#8b5cf6', border: '#7c3aed', text: '#7c3aed', label: 'Exam', cardBg: 'rgba(139, 92, 246, 0.07)' },
  hackathon:   { bg: '#ec4899', border: '#db2777', text: '#db2777', label: 'Hackathon', cardBg: 'rgba(236, 72, 153, 0.07)' },
};

type EventCategory = keyof typeof EVENT_COLORS;

// --- DYNAMIC SEED EVENTS ALIGNED TO THE CURRENT WEEK ---
const SEED_EVENTS = [
  { id: 'h-1', title: '🏆 Gappy AI Hackathon 2026', start: offsetDate(-2, 0), end: offsetDate(3, 0), allDay: true, category: 'hackathon', priority: 'High Priority' },
  { id: 'e-1', title: 'Hackathon Team Standup', start: offsetDate(-1, 18), end: offsetDate(-1, 19), category: 'deadline' },
  { id: 'e-2', title: 'Daily Review & Plan for Tomorrow', start: offsetDate(-1, 21, 30), end: offsetDate(-1, 22, 30), category: 'prep' },
  { id: 'e-3', title: 'DSA Arrays Practice', start: offsetDate(0, 10), end: offsetDate(0, 12), category: 'prep', completed: true },
  { id: 'e-4', title: 'UI Design Milestone', start: offsetDate(0, 14), end: offsetDate(0, 16), category: 'milestone' },
  { id: 'e-5', title: 'Core Coding Sprint', start: offsetDate(0, 17), end: offsetDate(0, 19), category: 'prep' },
  { id: 'e-6', title: 'Placement Prep Block', start: offsetDate(1, 8), end: offsetDate(1, 9), category: 'prep' },
  { id: 'e-7', title: 'DBMS Normalization Review', start: offsetDate(1, 9), end: offsetDate(1, 10, 30), category: 'prep' },
  { id: 'e-8', title: 'Fix API Integration', start: offsetDate(2, 11), end: offsetDate(2, 12, 30), category: 'task' },
  { id: 'e-9', title: 'Backend API Development', start: offsetDate(2, 19), end: offsetDate(2, 21), category: 'prep', completed: true },
  { id: 'e-10', title: 'DSA Deep Dive', start: offsetDate(3, 8), end: offsetDate(3, 9), category: 'prep', completed: true },
];

function offsetDate(daysFromNow: number, hours = 0, minutes = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

function colorizeEvent(event: any): any {
  const cat: EventCategory = event.category ?? 'task';
  const colors = EVENT_COLORS[cat] ?? EVENT_COLORS.task;
  return {
    ...event,
    backgroundColor: colors.cardBg,
    borderColor: colors.cardBg,
    textColor: colors.text,
    extendedProps: { ...event.extendedProps, category: cat, completed: event.completed, priority: event.priority },
  };
}

// --- OUTLOOK COMPACT DATE PICKER ---
const MiniDatePicker = ({ activeDate, onChange }: { activeDate: Date; onChange: (d: Date) => void }) => {
  const [currentYear, setCurrentYear] = useState(activeDate.getFullYear());
  const [currentMonth, setCurrentMonth] = useState(activeDate.getMonth());

  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDay = new Date(currentYear, currentMonth, 1).getDay();

  const daysGrid: (number | null)[] = [];
  for (let i = 0; i < firstDay; i++) daysGrid.push(null);
  for (let d = 1; d <= daysInMonth; d++) daysGrid.push(d);

  const handlePrev = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(currentYear - 1);
    } else {
      setCurrentMonth(currentMonth - 1);
    }
  };

  const handleNext = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(currentYear + 1);
    } else {
      setCurrentMonth(currentMonth + 1);
    }
  };

  return (
    <div className="bg-white border border-[#0F172A]/[0.08] rounded-2xl p-4 shadow-sm text-xs">
      <div className="flex justify-between items-center mb-3">
        <span className="font-extrabold text-[11px] text-text-primary uppercase tracking-wider">
          {months[currentMonth]} {currentYear}
        </span>
        <div className="flex gap-1.5">
          <button type="button" onClick={handlePrev} className="p-1 hover:bg-slate-50 border border-slate-100 rounded-lg text-text-secondary font-bold">&lt;</button>
          <button type="button" onClick={handleNext} className="p-1 hover:bg-slate-50 border border-slate-100 rounded-lg text-text-secondary font-bold">&gt;</button>
        </div>
      </div>
      
      <div className="grid grid-cols-7 gap-1 text-center font-bold text-slate-400 mb-1.5 text-[8px] tracking-wider uppercase">
        <span>S</span><span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span>
      </div>

      <div className="grid grid-cols-7 gap-1 text-center font-mono font-bold text-text-primary text-[10px]">
        {daysGrid.map((day, idx) => {
          if (day === null) return <span key={`empty-${idx}`} />;
          
          const isSelected = activeDate.getDate() === day && activeDate.getMonth() === currentMonth && activeDate.getFullYear() === currentYear;
          const isToday = new Date().getDate() === day && new Date().getMonth() === currentMonth && new Date().getFullYear() === currentYear;

          return (
            <button
              key={`day-${day}`}
              type="button"
              onClick={() => onChange(new Date(currentYear, currentMonth, day))}
              className={cn(
                "w-5 h-5 rounded-full flex items-center justify-center transition-all active:scale-90 font-bold",
                isSelected 
                  ? "bg-primary text-white font-black" 
                  : isToday 
                  ? "border border-primary text-primary font-black" 
                  : "hover:bg-slate-50"
              )}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
};

// --- AI SCHEDULING WAVE CHART ---
const WaveChart = () => {
  return (
    <div className="relative w-full h-14 mt-3">
      <svg className="w-full h-full" viewBox="0 0 200 50" preserveAspectRatio="none">
        <path
          d="M 0 35 C 30 30, 60 5, 90 12 C 120 20, 150 45, 180 25 L 200 28"
          fill="none"
          stroke="#10B981"
          strokeWidth="2"
        />
        <path
          d="M 0 35 C 30 30, 60 5, 90 12 C 120 20, 150 45, 180 25 L 200 28 L 200 50 L 0 50 Z"
          fill="rgba(16, 185, 129, 0.05)"
        />
        <circle cx="90" cy="12" r="4.5" fill="#10B981" stroke="white" strokeWidth="1.5" />
      </svg>
      <span className="absolute top-0 left-[62px] text-[8px] font-mono font-bold text-white bg-slate-900 border border-white/10 px-1.5 py-0.5 rounded shadow-md">
        9:00 AM - 11:30 AM
      </span>
    </div>
  );
};

// --- MAIN VIEW ---
export const CalendarView = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);
  const [currentRangeText, setCurrentRangeText] = useState('June 28 - July 4, 2026');
  const [activeView, setActiveView] = useState<'dayGridMonth' | 'timeGridWeek' | 'timeGridDay'>('timeGridWeek');
  
  // Selected categories checkboxes
  const [selectedCategories, setSelectedCategories] = useState<Record<EventCategory, boolean>>({
    task: true,
    deadline: true,
    milestone: true,
    prep: true,
    exam: true,
    hackathon: true
  });

  const [activeDate, setActiveDate] = useState(new Date());
  const [showReminder, setShowReminder] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const calendarRef = useRef<FullCalendar>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const real = await calendarService.getEvents();
        const colored = [
          ...SEED_EVENTS.map(colorizeEvent),
          ...real.map(colorizeEvent),
        ];
        setEvents(colored);
      } catch {
        setEvents(SEED_EVENTS.map(colorizeEvent));
      }
    };
    load();
  }, []);

  const updateTitle = () => {
    if (calendarRef.current) {
      const title = calendarRef.current.getApi().view.title;
      setCurrentRangeText(title);
    }
  };

  useEffect(() => {
    const t = setTimeout(updateTitle, 200);
    return () => clearTimeout(t);
  }, [events, activeView]);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3000);
  };

  const handlePrev = () => {
    calendarRef.current?.getApi().prev();
    updateTitle();
  };

  const handleNext = () => {
    calendarRef.current?.getApi().next();
    updateTitle();
  };

  const handleToday = () => {
    calendarRef.current?.getApi().today();
    setActiveDate(new Date());
    updateTitle();
  };

  const handleViewChange = (viewName: 'dayGridMonth' | 'timeGridWeek' | 'timeGridDay') => {
    setActiveView(viewName);
    calendarRef.current?.getApi().changeView(viewName);
    updateTitle();
  };

  const isMobile = typeof window !== 'undefined' ? window.innerWidth < 768 : false;

  const handleMiniDateChange = (date: Date) => {
    setActiveDate(date);
    calendarRef.current?.getApi().gotoDate(date);
    updateTitle();
  };

  const toggleCategory = (cat: EventCategory) => {
    setSelectedCategories(prev => ({
      ...prev,
      [cat]: !prev[cat]
    }));
  };

  // Filter events by checkboxes
  const filteredEvents = events.filter(e => {
    const cat = e.extendedProps?.category as EventCategory;
    return selectedCategories[cat] !== false;
  });
  return (
    <div className={cn(
      "p-4 md:p-6 flex flex-col font-body bg-[#fbfbfe] overflow-hidden space-y-4 transition-all duration-300 animate-page-reveal",
      isFullscreen 
        ? "fixed inset-0 z-[999] w-screen h-screen" 
        : "h-[calc(100vh-32px)] md:h-[calc(100vh-48px)] w-full"
    )}>

      {/* Dynamic Action Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 border border-white/10 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-2.5 text-xs font-semibold animate-fade-in font-mono">
          <Sparkles className="w-4 h-4 text-indigo-400" />
          <span>{toast}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0 pb-1">
        <div>
          <h1 className="text-xl font-heading font-black text-text-primary tracking-tight">Mission Calendar</h1>
          <p className="text-text-secondary text-xs font-semibold mt-0.5">
            All tasks, deadlines, milestones &amp; prep blocks in one intelligent view.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={handleToday}
            className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold bg-white hover:bg-gray-50 active:scale-95 transition-all text-text-primary flex items-center gap-1.5"
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            Today
          </button>
          
          <div className="flex items-center bg-gray-100/80 p-1 rounded-xl border border-gray-200/50">
            {[
              { id: 'timeGridDay', label: 'Day' },
              { id: 'timeGridWeek', label: 'Week' },
              { id: 'dayGridMonth', label: 'Month' }
            ].map(v => (
              <button
                key={v.id}
                onClick={() => handleViewChange(v.id as any)}
                className={cn(
                  "px-4 py-1.5 text-xs font-extrabold rounded-lg transition-all",
                  activeView === v.id ? "bg-white text-primary shadow-sm" : "text-text-secondary hover:text-text-primary"
                )}
              >
                {v.label}
              </button>
            ))}
          </div>

          <button onClick={() => alert('Filters: show all')} className="p-2 border border-gray-200 hover:bg-gray-50 bg-white rounded-xl active:scale-95 transition-all text-text-secondary">
            <Filter className="w-4 h-4" />
          </button>

          <button 
            onClick={() => setIsFullscreen(!isFullscreen)} 
            className="px-3 py-2 border border-gray-200 hover:bg-gray-50 bg-white rounded-xl active:scale-95 transition-all text-text-primary flex items-center gap-1.5"
            title={isFullscreen ? "Exit Full Screen" : "Fit Screen"}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4 text-primary" /> : <Maximize2 className="w-4 h-4 text-text-secondary" />}
            <span className="text-xs font-bold hidden md:inline">
              {isFullscreen ? "Exit Full" : "Fit Screen"}
            </span>
          </button>
        </div>
      </header>

      {/* UPCOMING REMINDER ALERT BANNER - compact, auto-hides */}
      {showReminder && (
        <div className="bg-gradient-to-r from-orange-500 to-red-500 rounded-xl px-4 py-2.5 text-white flex items-center justify-between gap-3 shadow-md shadow-orange-500/20 shrink-0 animate-fade-in relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <BellRing className="w-4 h-4 text-white animate-bounce shrink-0" />
            <div>
              <p className="text-[9px] font-black uppercase tracking-widest text-white/80 mb-0.5">Upcoming in 15 mins</p>
              <h4 className="font-bold text-xs leading-tight">DSA Arrays Practice - Prep Block</h4>
            </div>
          </div>
          <div className="flex items-center gap-2 relative z-10">
            <button 
              onClick={() => { setShowReminder(false); showToast("Started DSA Arrays Practice timer."); }} 
              className="bg-white text-orange-600 px-3 py-1.5 rounded-lg text-[10px] font-black shadow-sm hover:bg-orange-50 transition-all active:scale-95"
            >
              Start
            </button>
            <button onClick={() => setShowReminder(false)} className="p-1 hover:bg-white/20 rounded-lg transition-all">
              <X className="w-3.5 h-3.5 text-white" />
            </button>
          </div>
        </div>
      )}

      {/* THREE COLUMN GRID (Outlook Layout) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-0 h-full overflow-hidden">
        
        {/* COLUMN 1: OUTLOOK LEFT PANEL (lg:col-span-2) */}
        <div className="lg:col-span-2 hidden lg:flex flex-col gap-4 h-full overflow-y-auto scrollbar-none pb-4 shrink-0">
          
          {/* Mini Month Picker */}
          <MiniDatePicker activeDate={activeDate} onChange={handleMiniDateChange} />

          {/* Selectable Categories list (Outlook calendar toggles) */}
          <div className="bg-white border border-[#0F172A]/[0.08] rounded-2xl p-4 shadow-sm space-y-4">
            <div className="border-b border-slate-100 pb-2">
              <h4 className="font-heading font-black text-[10px] text-text-secondary uppercase tracking-wider">My Calendars</h4>
            </div>
            
            <div className="space-y-2.5">
              {Object.entries(EVENT_COLORS).map(([cat, val]) => {
                const isChecked = selectedCategories[cat as EventCategory] !== false;
                return (
                  <label 
                    key={cat} 
                    className="flex items-center gap-2.5 text-xs font-bold text-text-primary cursor-pointer select-none group"
                  >
                    <input 
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => toggleCategory(cat as EventCategory)}
                      className="w-4 h-4 rounded text-primary focus:ring-primary/20 border-slate-200"
                    />
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: val.bg }} />
                    <span className="group-hover:text-primary transition-colors text-[11px]">{val.label}s</span>
                  </label>
                );
              })}
            </div>
          </div>

        </div>

        {/* COLUMN 2: THE MAIN CALENDAR GRID (lg:col-span-7) */}
        <div className="lg:col-span-7 flex flex-col h-full bg-white rounded-[2rem] border border-[#0F172A]/[0.08] shadow-sm p-4 md:p-5 min-h-0 relative">
          
          {/* Calendar Navigation header */}
          <div className="flex items-center justify-between gap-4 border-b border-gray-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="flex items-center border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm">
                <button onClick={handlePrev} className="p-2 hover:bg-gray-50 border-r border-gray-200 active:scale-95 transition-all"><ChevronLeft className="w-4 h-4 text-text-primary" /></button>
                <button onClick={handleNext} className="p-2 hover:bg-gray-50 active:scale-95 transition-all"><ChevronRight className="w-4 h-4 text-text-primary" /></button>
              </div>
              <h2 className="font-heading font-black text-lg text-text-primary tracking-tight">
                {currentRangeText}
              </h2>
            </div>
          </div>

          {/* FullCalendar Wrapper - fills remaining height */}
          <div className="flex-1 min-h-0 overflow-hidden fc-mission-control-theme">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              initialView={isMobile ? 'timeGridDay' : 'timeGridWeek'}
              headerToolbar={false} 
              height="100%"
              expandRows={true}
              events={filteredEvents}
              editable={true}
              selectable={true}
              droppable={true}
              nowIndicator={true}
              eventDrop={(info) =>
                showToast(`✨ "${info.event.title}" rescheduled to ${info.event.start?.toLocaleDateString()}`)
              }
              eventClick={(info) => {
                const cat = info.event.extendedProps?.category ?? 'task';
                const label = EVENT_COLORS[cat]?.label ?? 'Task';
                showToast(`${label}: ${info.event.title}`);
              }}
              // OUTLOOK DAY HEADER FORMATTER
              dayHeaderContent={(arg) => {
                const date = arg.date;
                const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
                if (activeView === 'dayGridMonth') {
                  return (
                    <span className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider py-1.5 block">
                      {dayName}
                    </span>
                  );
                }
                const dayNum = date.getDate();
                const isToday = date.toDateString() === new Date().toDateString();

                return (
                  <div className="flex flex-col items-center py-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest leading-none">
                      {dayName}
                    </span>
                    <div 
                      className={cn(
                        "w-5.5 h-5.5 rounded-full flex items-center justify-center text-[10px] font-black font-mono mt-1 transition-all",
                        isToday ? "bg-primary text-white shadow-sm" : "text-text-primary"
                      )}
                    >
                      {dayNum}
                    </div>
                  </div>
                );
              }}
              // OUTLOOK PASTEL EVENT CARD RENDERER
              eventContent={(eventInfo) => {
                const cat = eventInfo.event.extendedProps?.category ?? 'task';
                const completed = eventInfo.event.extendedProps?.completed;
                const priority = eventInfo.event.extendedProps?.priority;
                const colorVal = EVENT_COLORS[cat] || EVENT_COLORS.task;

                return (
                  <div 
                    className="p-2 h-full flex flex-col justify-between text-left relative overflow-hidden group select-none"
                    style={{ borderLeft: `3.5px solid ${colorVal.bg}` }}
                  >
                    <div>
                      <div 
                        className="text-[8.5px] font-mono font-bold leading-none mb-1"
                        style={{ color: colorVal.text }}
                      >
                        {eventInfo.timeText || 'All Day'}
                      </div>
                      <div 
                        className="font-sans font-black text-[10.5px] leading-tight flex items-start gap-1"
                        style={{ color: colorVal.text }}
                      >
                        {completed && <Check className="w-3 h-3 shrink-0 mt-0.5 stroke-[3px]" style={{ color: colorVal.text }} />}
                        <span className="line-clamp-2">{eventInfo.event.title}</span>
                      </div>
                    </div>
                    
                    <div className="mt-1.5 flex items-center justify-between">
                      <span 
                        className="text-[7.5px] font-black uppercase tracking-wider px-1.5 py-0.5 rounded"
                        style={{ backgroundColor: 'rgba(255,255,255,0.7)', color: colorVal.text }}
                      >
                        {colorVal.label}
                      </span>
                      {priority && (
                        <span className="text-[7px] font-black uppercase text-red-700 bg-red-50 border border-red-200/50 px-1.5 rounded">
                          {priority}
                        </span>
                      )}
                    </div>
                  </div>
                );
              }}
              slotMinTime="07:00:00"
              slotMaxTime="22:00:00"
              allDaySlot={true}
              slotDuration="00:30:00"
              dayMaxEvents={activeView === 'dayGridMonth' ? false : 4}
              eventDisplay="block"
            />
          </div>

        </div>

        {/* COLUMN 3: RIGHT PANEL HUD DETAILS (lg:col-span-3) */}
        <div className="lg:col-span-3 hidden lg:flex flex-col gap-4 h-full overflow-y-auto scrollbar-none pb-6 pr-1">
          
          {/* 1. TODAY'S FOCUS */}
          <div className="mc-card p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-heading font-black text-xs text-text-primary uppercase tracking-wider">Today's Focus</h3>
              <span className="text-[9px] font-mono font-bold text-text-secondary">Wed, Jul 1</span>
            </div>

            <div className="space-y-2.5">
              {[
                { title: 'DSA Arrays Practice', time: '10:00 AM - 12:00 PM', badge: 'Prep Block', color: 'bg-emerald-500' },
                { title: 'Core Coding Sprint', time: '05:00 PM - 07:00 PM', badge: 'Prep Block', color: 'bg-emerald-500' }
              ].map((task, idx) => (
                <div key={idx} className="p-3.5 bg-gray-50/50 border border-slate-100 hover:border-primary/20 rounded-2xl transition-all flex items-start justify-between group">
                  <div className="space-y-1">
                    <span className="font-bold text-xs text-text-primary block">{task.title}</span>
                    <span className="text-[9px] text-text-secondary font-mono block">{task.time}</span>
                  </div>
                  <span className={cn("text-[8px] font-black uppercase text-white px-2 py-0.5 rounded-md shrink-0", task.color)}>
                    {task.badge}
                  </span>
                </div>
              ))}
            </div>

            <div className="text-center pt-1 border-t border-slate-50">
              <button onClick={() => alert('Already showing today\'s focus.')} className="text-[10px] font-bold text-primary hover:underline">
                View Full Plan →
              </button>
            </div>
          </div>

          {/* 2. UPCOMING DEADLINES */}
          <div className="mc-card p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-100 pb-2">
              <h3 className="font-heading font-black text-xs text-text-primary uppercase tracking-wider">Upcoming Deadlines</h3>
              <button onClick={() => alert('All deadlines mapped.')} className="text-[10px] font-bold text-primary hover:underline">View All</button>
            </div>

            <div className="space-y-3">
              {[
                { title: 'Gappy AI Hackathon Submission', due: 'Jul 4, 11:59 PM', days: '3 Days Left', color: 'text-red-500 bg-red-50 border-red-200/50' },
                { title: 'DBMS End Sem Exam', due: 'Jul 15, 9:00 AM', days: '14 Days Left', color: 'text-orange-500 bg-orange-50 border-orange-200/50' },
                { title: 'OS End Sem Exam', due: 'Jul 17, 9:00 AM', days: '16 Days Left', color: 'text-purple-600 bg-purple-50 border-purple-200/50' }
              ].map((item, idx) => (
                <div key={idx} className="flex justify-between items-center gap-3 text-xs border-b border-slate-50 pb-2.5 last:border-0 last:pb-0">
                  <div className="min-w-0">
                    <p className="font-bold text-text-primary truncate" title={item.title}>{item.title}</p>
                    <p className="text-[9px] text-text-secondary font-mono mt-0.5">{item.due}</p>
                  </div>
                  <span className={cn("shrink-0 text-[8px] font-black font-mono border px-2 py-0.5 rounded-md uppercase", item.color)}>
                    {item.days}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* 3. AI SCHEDULING INSIGHT */}
          <div className="mc-card p-5">
            <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
              <Sparkles className="w-4 h-4 text-emerald-500" />
              <h3 className="font-heading font-black text-xs text-text-primary uppercase tracking-wider">AI Scheduling Insight</h3>
            </div>
            
            <p className="text-[11px] font-semibold text-text-secondary mt-3 leading-relaxed">
              You have <strong className="text-text-primary font-bold">2.5 focused hours</strong> available tomorrow morning.
            </p>

            <WaveChart />

            <button 
              onClick={() => showToast('✨ KAIRO Optimized: Moved DBMS study block to 9:00 AM')}
              className="w-full bg-[#10B981] hover:bg-[#0d9488] text-white py-2.5 rounded-xl font-bold text-xs mt-4 transition-all shadow-md active:scale-95 flex items-center justify-center gap-1.5"
            >
              <Sparkles className="w-3.5 h-3.5" />
              Optimize My Schedule
            </button>
          </div>

        </div>

      </div>

    </div>
  );
};
