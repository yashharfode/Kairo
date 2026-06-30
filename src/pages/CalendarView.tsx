import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { calendarService } from '@/services/CalendarService';
import '../styles/calendar.css';

/* ─── Event color categories ─────────────────────────────────────────────── */
const EVENT_COLORS = {
  task:        { bg: '#6366f1', border: '#4f46e5', text: '#ffffff' },     // Indigo  – Tasks
  deadline:    { bg: '#ef4444', border: '#dc2626', text: '#ffffff' },     // Red     – Deadlines
  milestone:   { bg: '#f59e0b', border: '#d97706', text: '#ffffff' },     // Amber   – Milestones
  prep:        { bg: '#10b981', border: '#059669', text: '#ffffff' },     // Emerald – Prep Blocks
  exam:        { bg: '#8b5cf6', border: '#7c3aed', text: '#ffffff' },     // Violet  – Exams
  hackathon:   { bg: '#ec4899', border: '#db2777', text: '#ffffff' },     // Pink    – Hackathons
};

type EventCategory = keyof typeof EVENT_COLORS;

/* ─── Sample enriched events (merged with real Lemma events below) ────────── */
const SEED_EVENTS = [
  // Tasks
  { title: '✅ DSA Arrays Practice', start: offsetDate(0, 10), end: offsetDate(0, 12), category: 'task' },
  { title: '✅ KAIRO Demo Recording', start: offsetDate(0, 14), end: offsetDate(0, 15, 30), category: 'task' },
  { title: '✅ DBMS Normalization Review', start: offsetDate(1, 9), end: offsetDate(1, 10, 30), category: 'task' },
  { title: '✅ Fix API Integration', start: offsetDate(2, 11), end: offsetDate(2, 12, 30), category: 'task' },

  // Deadlines
  { title: '🔴 Gappy AI Submission', start: offsetDate(2, 23), allDay: false, category: 'deadline' },
  { title: '🔴 Internship Application', start: offsetDate(5, 18), allDay: false, category: 'deadline' },

  // Milestones
  { title: '🏁 UI Prototype Ready', start: offsetDate(1, 17), allDay: false, category: 'milestone' },
  { title: '🏁 Backend API Complete', start: offsetDate(3, 15), allDay: false, category: 'milestone' },
  { title: '🏁 End-to-End Demo Done', start: offsetDate(2, 20), allDay: false, category: 'milestone' },

  // Preparation Blocks
  { title: '📗 Placement Prep Block', start: offsetDate(1, 7), end: offsetDate(1, 9), category: 'prep' },
  { title: '📗 DSA Deep Dive', start: offsetDate(3, 7), end: offsetDate(3, 9), category: 'prep' },
  { title: '📗 System Design Study', start: offsetDate(4, 8), end: offsetDate(4, 10), category: 'prep' },

  // Exams
  { title: '📝 DBMS End Sem Exam', start: offsetDate(14), allDay: true, category: 'exam' },
  { title: '📝 OS End Sem Exam', start: offsetDate(16), allDay: true, category: 'exam' },

  // Hackathon
  { title: '🏆 Gappy AI Hackathon', start: offsetDate(0), end: offsetDate(2), allDay: true, category: 'hackathon' },
];

function offsetDate(daysFromNow: number, hours = 0, minutes = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hours, minutes, 0, 0);
  return d.toISOString();
}

function colorizeEvent(event: any): any {
  const cat: EventCategory = event.category ?? guessCategory(event.title);
  const colors = EVENT_COLORS[cat] ?? EVENT_COLORS.task;
  return {
    ...event,
    backgroundColor: colors.bg,
    borderColor: colors.border,
    textColor: colors.text,
    extendedProps: { ...event.extendedProps, category: cat },
  };
}

function guessCategory(title = ''): EventCategory {
  const t = title.toLowerCase();
  if (t.includes('exam') || t.includes('test'))       return 'exam';
  if (t.includes('deadline') || t.includes('submit') || t.includes('due')) return 'deadline';
  if (t.includes('milestone') || t.includes('ready') || t.includes('complete')) return 'milestone';
  if (t.includes('prep') || t.includes('study') || t.includes('practice') || t.includes('dsa') || t.includes('review')) return 'prep';
  if (t.includes('hackathon'))                        return 'hackathon';
  return 'task';
}

const LEGEND = [
  { label: 'Tasks',          cat: 'task' },
  { label: 'Deadlines',      cat: 'deadline' },
  { label: 'Milestones',     cat: 'milestone' },
  { label: 'Prep Blocks',    cat: 'prep' },
  { label: 'Exams',          cat: 'exam' },
  { label: 'Hackathons',     cat: 'hackathon' },
] as { label: string; cat: EventCategory }[];

export const CalendarView = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [toast, setToast] = useState<string | null>(null);

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

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 3500);
  };

  return (
    <div className="p-4 md:p-6 h-full flex flex-col font-body bg-[#f9f9fd] overflow-hidden">

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-fade-in">
          <div className="bg-gray-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 text-sm font-semibold">
            <span className="text-indigo-400">✦</span>
            {toast}
          </div>
        </div>
      )}

      {/* Header */}
      <header className="mb-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-heading font-black text-gray-900">Mission Calendar</h1>
          <p className="text-gray-400 text-sm mt-0.5">All tasks, deadlines, milestones & prep blocks in one view.</p>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-2">
          {LEGEND.map(item => (
            <div key={item.cat} className="flex items-center gap-1.5 text-[11px] font-bold text-gray-600 bg-white border border-gray-100 px-2.5 py-1 rounded-full shadow-sm">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: EVENT_COLORS[item.cat].bg }}
              />
              {item.label}
            </div>
          ))}
        </div>
      </header>

      {/* Calendar */}
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden p-4 md:p-6 min-h-0">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay',
          }}
          height="100%"
          events={events}
          editable={true}
          selectable={true}
          droppable={true}
          nowIndicator={true}
          eventDrop={(info) =>
            showToast(`✨ "${info.event.title}" rescheduled to ${info.event.start?.toLocaleDateString()}`)
          }
          eventClick={(info) => {
            const cat = info.event.extendedProps?.category ?? 'task';
            const labels: Record<string, string> = {
              task: '✅ Task', deadline: '🔴 Deadline', milestone: '🏁 Milestone',
              prep: '📗 Prep Block', exam: '📝 Exam', hackathon: '🏆 Hackathon',
            };
            showToast(`${labels[cat] ?? '📌'}: ${info.event.title}`);
          }}
          slotMinTime="06:00:00"
          slotMaxTime="23:59:59"
          allDaySlot={true}
          slotDuration="00:30:00"
          dayMaxEvents={3}
          eventDisplay="block"
        />
      </div>
    </div>
  );
};
