/**
 * AZMA OS — PERSISTENT STORAGE FOUNDATION
 * Session Records
 *
 * A durable place for a session to live — NOT Authentication itself (no
 * token issuance/verification flow; explicitly out of this Package's
 * Boundaries). Ready for a future Authentication Package to issue and
 * validate real sessions against.
 */

import type { DatabaseSync } from 'node:sqlite';

export interface SessionRecord {
  readonly sessionId: string;
  readonly creatorId: string;
  readonly createdAt: number;
  readonly expiresAt: number;
}

export function createSession(db: DatabaseSync, sessionId: string, creatorId: string, ttlMs: number): SessionRecord {
  const createdAt = Date.now();
  const expiresAt = createdAt + ttlMs;
  db.prepare('INSERT INTO sessions (session_id, creator_id, created_at, expires_at) VALUES (?, ?, ?, ?)').run(
    sessionId, creatorId, createdAt, expiresAt,
  );
  return { sessionId, creatorId, createdAt, expiresAt };
}

export function getActiveSession(db: DatabaseSync, sessionId: string, now: number = Date.now()): SessionRecord | null {
  const row = db.prepare('SELECT session_id, creator_id, created_at, expires_at FROM sessions WHERE session_id = ?').get(sessionId);
  if (!row) return null;
  const expiresAt = row.expires_at as number;
  if (expiresAt <= now) return null;
  return {
    sessionId: row.session_id as string,
    creatorId: row.creator_id as string,
    createdAt: row.created_at as number,
    expiresAt,
  };
}

export function deleteSession(db: DatabaseSync, sessionId: string): void {
  db.prepare('DELETE FROM sessions WHERE session_id = ?').run(sessionId);
}
