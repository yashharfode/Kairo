import { missionService } from './MissionService';

class CalendarService {
  /**
   * Fetches the user's execution timeline events.
   * Maps tasks with scheduled dates directly to calendar events.
   */
  async getEvents() {
    console.log(`[CalendarService] Retrieving events from scheduled tasks`);
    const tasks = await missionService.getTasks();
    
    // Convert scheduled tasks to calendar events
    const events = tasks
      .filter(task => task.scheduledStart)
      .map(task => ({
        id: task.id,
        title: task.title,
        start: task.scheduledStart,
        end: task.scheduledEnd || new Date(new Date(task.scheduledStart!).getTime() + (task.estimatedDuration || 60) * 60 * 1000).toISOString(),
        allDay: false,
        color: task.priority === 'urgent' ? '#EF4444' : task.priority === 'high' ? '#F97316' : '#5A5CD8'
      }));

    // Return events or a fallback mock if no tasks are scheduled yet
    return events.length > 0 ? events : [
      {
        id: 'mock-evt-1',
        title: 'Initial Setup Planning (Mock)',
        start: new Date().toISOString(),
        end: new Date(Date.now() + 60 * 60 * 1000).toISOString(),
        allDay: false,
        color: '#5A5CD8'
      }
    ];
  }
}

export const calendarService = new CalendarService();
