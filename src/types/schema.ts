/**
 * KAIRO Unified Schema
 * Shared across React (frontend), Firebase (caching & auth), and Lemma (AI brain)
 */

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: string; // ISO DateTime
  lemmaPodId?: string; // Connected Lemma Pod ID
}

export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';
export type MissionStatus = 'active' | 'completed' | 'paused' | 'failed';
export type TaskStatus = 'todo' | 'in_progress' | 'completed';
export type MessageStatus = 'unprocessed' | 'processed' | 'archived';

export const InboxSource = {
  MANUAL: 'manual',
  EMAIL: 'email',
  CHAT: 'chat',
  VOICE_NOTE: 'voice_note',
  PDF: 'pdf',
  URL: 'url',
  CALENDAR: 'calendar',
  TASK: 'task',
  FIREBASE_STORAGE: 'firebase_storage',
  API: 'api',
  BROWSER_CLIPBOARD: 'browser_clipboard',
} as const;

export type InboxSource = typeof InboxSource[keyof typeof InboxSource];
export type MessageSource = InboxSource;

/**
 * Represent a raw notification or message forwarded to KAIRO
 */
export interface InboxMessage {
  id: string;
  userId: string;
  source: InboxSource;
  title: string;
  content: string;
  receivedAt: string; // ISO DateTime
  status: MessageStatus;
  deadline?: string; // ISO Date (optional)
  priority: PriorityLevel;
  processedResult?: {
    createdMissions: string[]; // Mission IDs
    createdTasks: string[];    // Task IDs
  };
}

/**
 * A High-level Objective or Project owned by the Lemma Pod
 */
export interface Mission {
  id: string;
  userId: string;
  title: string;
  description: string;
  status: MissionStatus;
  startDate: string; // ISO Date
  targetDate?: string; // ISO Date (optional)
  createdAt: string; // ISO DateTime
  updatedAt: string; // ISO DateTime
}

/**
 * An actionable unit of work linked to a mission or standalone
 */
export interface Task {
  id: string;
  userId: string;
  missionId?: string; // Optional reference to parent Mission
  title: string;
  description?: string;
  status: TaskStatus;
  priority: PriorityLevel;
  estimatedDuration?: number; // In minutes
  actualDuration?: number; // In minutes
  scheduledStart?: string; // ISO DateTime
  scheduledEnd?: string; // ISO DateTime
  createdAt: string; // ISO DateTime
  updatedAt: string; // ISO DateTime
}

/**
 * A piece of knowledge extracted by the AI or saved by the user
 */
export interface Memory {
  id: string;
  userId: string;
  content: string;
  tags: string[];
  createdAt: string; // ISO DateTime
  updatedAt: string; // ISO DateTime
}
