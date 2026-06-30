/**
 * normalizeInboxSource.ts
 *
 * Single source of truth for converting any raw source string into a
 * valid Lemma inbox_log.source enum value (InboxSource).
 *
 * Rules:
 *  - Use InboxSource enum everywhere. Never hardcode raw strings.
 *  - Every unknown / unsupported source falls back to InboxSource.MANUAL.
 *  - Validation runs before every Lemma API call — a 400 is impossible.
 */

import { InboxSource } from '@/types/schema';

/** Maps raw/user-facing source strings → InboxSource enum values */
const SOURCE_MAP: Record<string, InboxSource> = {
  // ── Chat / messaging platforms ────────────────────────────────────────────
  whatsapp:           InboxSource.CHAT,
  telegram:           InboxSource.CHAT,
  discord:            InboxSource.CHAT,
  slack:              InboxSource.CHAT,
  linkedin:           InboxSource.CHAT,
  teams:              InboxSource.CHAT,
  'microsoft teams':  InboxSource.CHAT,
  signal:             InboxSource.CHAT,
  messenger:          InboxSource.CHAT,
  instagram:          InboxSource.CHAT,
  twitter:            InboxSource.CHAT,
  x:                  InboxSource.CHAT,

  // ── Email ─────────────────────────────────────────────────────────────────
  gmail:              InboxSource.EMAIL,
  outlook:            InboxSource.EMAIL,
  yahoo:              InboxSource.EMAIL,
  protonmail:         InboxSource.EMAIL,
  mail:               InboxSource.EMAIL,
  email:              InboxSource.EMAIL,

  // ── Documents / PDFs ─────────────────────────────────────────────────────
  pdf:                InboxSource.PDF,
  document:           InboxSource.PDF,
  doc:                InboxSource.PDF,
  word:               InboxSource.PDF,

  // ── Voice / audio ─────────────────────────────────────────────────────────
  voice:              InboxSource.VOICE_NOTE,
  voice_note:         InboxSource.VOICE_NOTE,
  audio:              InboxSource.VOICE_NOTE,
  recording:          InboxSource.VOICE_NOTE,

  // ── Browser / web ─────────────────────────────────────────────────────────
  browser:            InboxSource.BROWSER_CLIPBOARD,
  browser_clipboard:  InboxSource.BROWSER_CLIPBOARD,
  clipboard:          InboxSource.BROWSER_CLIPBOARD,
  url:                InboxSource.URL,
  website:            InboxSource.URL,
  link:               InboxSource.URL,
  github:             InboxSource.URL,
  notion:             InboxSource.URL,
  college_portal:     InboxSource.URL,

  // ── Calendar ──────────────────────────────────────────────────────────────
  calendar:           InboxSource.CALENDAR,
  google_calendar:    InboxSource.CALENDAR,
  outlook_calendar:   InboxSource.CALENDAR,
  ics:                InboxSource.CALENDAR,

  // ── Task managers ─────────────────────────────────────────────────────────
  task:               InboxSource.TASK,
  todo:               InboxSource.TASK,
  jira:               InboxSource.TASK,
  linear:             InboxSource.TASK,
  trello:             InboxSource.TASK,
  asana:              InboxSource.TASK,

  // ── Firebase / storage ────────────────────────────────────────────────────
  firebase_storage:   InboxSource.FIREBASE_STORAGE,
  firebase:           InboxSource.FIREBASE_STORAGE,
  storage:            InboxSource.FIREBASE_STORAGE,

  // ── API / webhooks ────────────────────────────────────────────────────────
  api:                InboxSource.API,
  webhook:            InboxSource.API,
  zapier:             InboxSource.API,

  // ── Direct enum passthrough (already valid) ───────────────────────────────
  manual:             InboxSource.MANUAL,
  chat:               InboxSource.CHAT,
  pdf_direct:         InboxSource.PDF,
};

/**
 * Normalizes any raw source string to a valid InboxSource enum value.
 * Safe to call anywhere — never throws, unknown sources → InboxSource.MANUAL.
 */
export function normalizeInboxSource(raw: string | undefined | null): InboxSource {
  if (!raw) return InboxSource.MANUAL;
  const key = raw.trim().toLowerCase().replace(/\s+/g, '_');
  const mapped = SOURCE_MAP[key];
  if (!mapped) {
    console.warn(`[normalizeInboxSource] Unknown source "${raw}" → defaulting to InboxSource.MANUAL`);
    return InboxSource.MANUAL;
  }
  return mapped;
}

/**
 * Validates that a value is already a valid InboxSource enum value.
 * Use this to guard incoming API/external data.
 */
export function isValidInboxSource(value: unknown): value is InboxSource {
  return Object.values(InboxSource).includes(value as InboxSource);
}

/**
 * User-facing source options for dropdowns.
 * label  = what the user sees
 * value  = the raw string passed to normalizeInboxSource()
 *
 * The value intentionally uses friendly names (whatsapp, gmail etc.)
 * so the UI stays readable; normalizeInboxSource() maps them to the enum.
 */
export const INBOX_SOURCE_OPTIONS: { label: string; value: string; lemma: InboxSource }[] = [
  { label: 'WhatsApp',        value: 'whatsapp',          lemma: InboxSource.CHAT },
  { label: 'Telegram',        value: 'telegram',          lemma: InboxSource.CHAT },
  { label: 'Discord',         value: 'discord',           lemma: InboxSource.CHAT },
  { label: 'Slack',           value: 'slack',             lemma: InboxSource.CHAT },
  { label: 'LinkedIn',        value: 'linkedin',          lemma: InboxSource.CHAT },
  { label: 'Gmail',           value: 'gmail',             lemma: InboxSource.EMAIL },
  { label: 'Email',           value: 'email',             lemma: InboxSource.EMAIL },
  { label: 'PDF / Document',  value: 'pdf',               lemma: InboxSource.PDF },
  { label: 'Voice Note',      value: 'voice_note',        lemma: InboxSource.VOICE_NOTE },
  { label: 'Website / URL',   value: 'url',               lemma: InboxSource.URL },
  { label: 'GitHub',          value: 'github',            lemma: InboxSource.URL },
  { label: 'College Portal',  value: 'college_portal',    lemma: InboxSource.URL },
  { label: 'Calendar',        value: 'calendar',          lemma: InboxSource.CALENDAR },
  { label: 'Browser Clip',    value: 'browser_clipboard', lemma: InboxSource.BROWSER_CLIPBOARD },
  { label: 'API / Webhook',   value: 'api',               lemma: InboxSource.API },
  { label: 'Manual Entry',    value: 'manual',            lemma: InboxSource.MANUAL },
];
