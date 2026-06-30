import { useEffect, useState } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Calendar } from 'lucide-react';
import { calendarService } from '@/services/CalendarService';

export const CalendarView = () => {
  const [events, setEvents] = useState<any[]>([]);

  useEffect(() => {
    const fetchEvents = async () => {
      const fetchedEvents = await calendarService.getEvents();
      setEvents(fetchedEvents);
    };
    fetchEvents();
  }, []);

  return (
    <div className="p-8 h-full flex flex-col">
      <header className="mb-8">
        <h1 className="text-3xl font-heading font-bold text-text-primary flex items-center gap-3">
          <Calendar className="w-8 h-8 text-primary" />
          Calendar
        </h1>
        <p className="text-text-secondary mt-1">Your auto-scheduled timeline mapped by KAIRO.</p>
      </header>

      <div className="flex-1 bg-surface rounded-2xl p-6 border border-gray-100 shadow-sm min-h-0 overflow-y-auto">
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
        />
      </div>
    </div>
  );
};
