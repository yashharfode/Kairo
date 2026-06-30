import { lemmaService } from './LemmaService';
import type { Mission, Task } from '@/types/schema';

class MissionService {
  async getMissions(): Promise<Mission[]> {
    return lemmaService.getMissions();
  }

  async getTasks(): Promise<Task[]> {
    return lemmaService.getTasks();
  }

  /**
   * Plans a mission by taking a long term goal and reverse planning it.
   * Everything is managed by the Lemma Pod.
   */
  async planMission(goal: string): Promise<{ mission: Mission; tasks: Task[] }> {
    console.log(`[MissionService] Instructing Lemma to plan mission for: ${goal}`);
    return lemmaService.planMission(goal);
  }
}

export const missionService = new MissionService();
