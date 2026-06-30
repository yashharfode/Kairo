import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar, CheckCircle2 } from 'lucide-react';
import { calendarService } from '@/services/CalendarService';
import '../styles/calendar.css';

export const CalendarView = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  useEffect(() => {
    const fetchEvents = async () => {
      const fetchedEvents = await calendarService.getEvents();
      setEvents(fetchedEvents);
    };
    fetchEvents();
  }, []);

  const handleEventDrop = (info: any) => {
    setToastMessage(`✨ Task "${info.event.title}" rescheduled to ${info.event.start?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`);
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleEventClick = (info: any) => {
    setToastMessage(`Viewing details for: "${info.event.title}"`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="p-4 md:p-8 h-full flex flex-col relative font-body max-w-[1600px] mx-auto w-full">
      {/* Toast Alert for Calendar Actions */}
      {toastMessage && (
        <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-50 animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-text-primary text-white px-6 py-3 rounded-full shadow-lg shadow-primary/20 flex items-center gap-3 font-semibold text-sm">
            <CheckCircle2 className="w-5 h-5 text-primary-border" />
            {toastMessage}
          </div>
        </div>
      )}

      <header className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-heading font-black text-text-primary flex items-center gap-3">
          <Calendar className="w-7 h-7 md:w-8 md:h-8 text-primary" />
          Calendar
        </h1>
        <p className="text-text-secondary mt-1 text-sm md:text-base">Your auto-scheduled timeline mapped by KAIRO.</p>
      </header>

      <div className="flex-1 bg-white rounded-3xl p-4 md:p-6 border border-gray-150 shadow-sm min-h-0 overflow-hidden flex flex-col relative">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -z-10 pointer-events-none translate-x-1/3 -translate-y-1/3" />
        
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="timeGridWeek"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek,timeGridDay'
          }}
          height="100%"
          events={events}
          editable={true}
          selectable={true}
          droppable={true}
          nowIndicator={true}
          eventDrop={handleEventDrop}
          eventClick={handleEventClick}
          slotMinTime="06:00:00"
          slotMaxTime="23:59:59"
          allDaySlot={false}
          slotDuration="00:30:00"
        />
      </div>
    </div>
  );
};
