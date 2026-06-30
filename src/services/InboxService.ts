import { lemmaService } from './LemmaService';
import type { InboxMessage, Mission, Task } from '@/types/schema';

class InboxService {
  // Get all inbox messages directly from Lemma datastore
  async getMessages(): Promise<InboxMessage[]> {
    return lemmaService.getInboxMessages();
  }

  // Processes a manual inbox entry through the Lemma workflow engine
  async processMessage(
    messageData: Omit<InboxMessage, 'id' | 'userId' | 'receivedAt' | 'status'>,
    onProgress?: (progress: any) => void
  ): Promise<{ missions: Mission[]; tasks: Task[] }> {
    console.log(`[InboxService] Forwarding message to Lemma: ${messageData.title}`);
    return lemmaService.processMessage(messageData, onProgress);
  }
}

export const inboxService = new InboxService();
