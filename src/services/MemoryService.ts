import { lemmaService } from './LemmaService';
import type { Memory } from '@/types/schema';

class MemoryService {
  async getMemories(): Promise<Memory[]> {
    return lemmaService.getMemories();
  }

  async saveMemory(content: string, tags: string[]): Promise<Memory> {
    console.log(`[MemoryService] Requesting Lemma to store new memory: ${content}`);
    return lemmaService.saveMemory(content, tags);
  }

  async queryMemory(query: string): Promise<string> {
    return lemmaService.askAgent(query);
  }

  async deleteMemory(id: string): Promise<void> {
    return lemmaService.deleteMemory(id);
  }
}

export const memoryService = new MemoryService();
