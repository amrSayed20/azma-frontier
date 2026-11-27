/**
 * AZMA OS — PERSISTENT STORAGE FOUNDATION
 * Failed Sign-In Attempt Records
 *
 * Durable fixed-window counting of failed log-in attempts, keyed by the
 * lowercased email address. The Vault PIN has had this guard since Phase 3B
 * (in-process); the sign-in path had NONE at all — an attacker could try
 * passwords against a known address forever, at full speed, undetected.
 *
 * Durable (SQLite) rather than in-process, so the count survives a server
 * restart and cannot be reset by cycling the process.
 *
 * The subject is the email, NOT the Creator id, on purpose: attempts against
 * addresses that have no account must count too, or the guard would answer
 * the enumeration question it exists not to answer.
 */

import type { DatabaseSync } from 'node:sqlite';

export const LOGIN_MAX_FAILED_ATTEMPTS = 5;
export const LOGIN_ATTEMPT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes

export function normalizeLoginSubject(email: string): string {
  return email.trim().toLowerCase();
}

export function isLoginAttemptBlocked(
  db: DatabaseSync,
  subject: string,
  now: number = Date.now(),
): boolean {
  const row = db
    .prepare('SELECT failed_count, window_start FROM login_attempts WHERE subject = ?')
    .get(subject);
  if (!row) return false;
  if (now - (row.window_start as number) >= LOGIN_ATTEMPT_WINDOW_MS) return false;
  return (row.failed_count as number) >= LOGIN_MAX_FAILED_ATTEMPTS;
}

export function recordFailedLoginAttempt(
  db: DatabaseSync,
  subject: string,
  now: number = Date.now(),
): void {
  const row = db
    .prepare('SELECT failed_count, window_start FROM login_attempts WHERE subject = ?')
    .get(subject);
  if (!row || now - (row.window_start as number) >= LOGIN_ATTEMPT_WINDOW_MS) {
    db.prepare(
      'INSERT INTO login_attempts (subject, failed_count, window_start) VALUES (?, 1, ?) ' +
        'ON CONFLICT(subject) DO UPDATE SET failed_count = 1, window_start = excluded.window_start',
    ).run(subject, now);
    return;
  }
  db.prepare('UPDATE login_attempts SET failed_count = failed_count + 1 WHERE subject = ?').run(subject);
}

export function clearLoginAttempts(db: DatabaseSync, subject: string): void {
  db.prepare('DELETE FROM login_attempts WHERE subject = ?').run(subject);
}
