import { LemmaClient } from 'lemma-sdk';

/**
 * Centralized Lemma SDK client singleton.
 *
 * Auth token is NOT sourced from VITE_LEMMA_TOKEN.
 * In dev: the `lemmaDevAuth` Vite plugin (vite.config.ts) calls
 *   `lemma auth print-token` on every page load and injects a fresh token
 *   directly into localStorage["lemma_token"] before the app runs.
 * In production: the Lemma platform handles auth via its own session cookie.
 *
 * This keeps expired-token errors impossible in dev without any manual rotation.
 */
export const lemmaClient = new LemmaClient({
  apiUrl: import.meta.env.VITE_LEMMA_API_URL || '/api',
  authUrl: import.meta.env.VITE_LEMMA_AUTH_URL || 'https://lemma.work/auth',
  podId: import.meta.env.VITE_LEMMA_POD_ID,
});
