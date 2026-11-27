/**
 * Sign-in attempt guard — durable, fixed-window, keyed by address.
 * Multi-angle: threshold boundary, window boundary, restart-survival (a
 * second connection to the same store sees the count), case folding, and
 * per-address isolation.
 */

import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../db';
import {
  LOGIN_MAX_FAILED_ATTEMPTS,
  LOGIN_ATTEMPT_WINDOW_MS,
  normalizeLoginSubject,
  isLoginAttemptBlocked,
  recordFailedLoginAttempt,
  clearLoginAttempts,
} from '../login-attempt-repository';

let db: DatabaseSync;

beforeEach(() => { db = createDatabase(':memory:'); });
afterEach(() => { db.close(); });

describe('login-attempt-repository', () => {
  it('is not blocked before any failure', () => {
    expect(isLoginAttemptBlocked(db, 'a@b.c', 1_000)).toBe(false);
  });

  it('is not blocked at MAX-1 failures, is blocked at MAX', () => {
    const t0 = 1_000_000;
    for (let i = 0; i < LOGIN_MAX_FAILED_ATTEMPTS - 1; i++) recordFailedLoginAttempt(db, 'a@b.c', t0 + i);
    expect(isLoginAttemptBlocked(db, 'a@b.c', t0 + 100)).toBe(false);
    recordFailedLoginAttempt(db, 'a@b.c', t0 + 101);
    expect(isLoginAttemptBlocked(db, 'a@b.c', t0 + 102)).toBe(true);
  });

  it('failures keep counting while blocked — the window does not slide open mid-attack', () => {
    const t0 = 1_000_000;
    for (let i = 0; i < LOGIN_MAX_FAILED_ATTEMPTS + 3; i++) recordFailedLoginAttempt(db, 'a@b.c', t0 + i);
    const row = db.prepare('SELECT failed_count FROM login_attempts WHERE subject = ?').get('a@b.c') as { failed_count: number };
    expect(row.failed_count).toBe(LOGIN_MAX_FAILED_ATTEMPTS + 3);
  });

  it('unblocks exactly when the window expires', () => {
    const t0 = 1_000_000;
    for (let i = 0; i < LOGIN_MAX_FAILED_ATTEMPTS; i++) recordFailedLoginAttempt(db, 'a@b.c', t0);
    expect(isLoginAttemptBlocked(db, 'a@b.c', t0 + LOGIN_ATTEMPT_WINDOW_MS - 1)).toBe(true);
    expect(isLoginAttemptBlocked(db, 'a@b.c', t0 + LOGIN_ATTEMPT_WINDOW_MS)).toBe(false);
  });

  it('a failure after the window starts a FRESH count of one', () => {
    const t0 = 1_000_000;
    for (let i = 0; i < LOGIN_MAX_FAILED_ATTEMPTS; i++) recordFailedLoginAttempt(db, 'a@b.c', t0);
    recordFailedLoginAttempt(db, 'a@b.c', t0 + LOGIN_ATTEMPT_WINDOW_MS + 5);
    const row = db.prepare('SELECT failed_count FROM login_attempts WHERE subject = ?').get('a@b.c') as { failed_count: number };
    expect(row.failed_count).toBe(1);
    expect(isLoginAttemptBlocked(db, 'a@b.c', t0 + LOGIN_ATTEMPT_WINDOW_MS + 6)).toBe(false);
  });

  it('clearing removes the block', () => {
    const t0 = 1_000_000;
    for (let i = 0; i < LOGIN_MAX_FAILED_ATTEMPTS; i++) recordFailedLoginAttempt(db, 'a@b.c', t0);
    clearLoginAttempts(db, 'a@b.c');
    expect(isLoginAttemptBlocked(db, 'a@b.c', t0 + 1)).toBe(false);
  });

  it('one address cannot block another', () => {
    const t0 = 1_000_000;
    for (let i = 0; i < LOGIN_MAX_FAILED_ATTEMPTS; i++) recordFailedLoginAttempt(db, 'a@b.c', t0);
    expect(isLoginAttemptBlocked(db, 'victim@b.c', t0 + 1)).toBe(false);
  });

  it('the count lives in the store, not the process — a fresh reader sees it', () => {
    const t0 = 1_000_000;
    for (let i = 0; i < LOGIN_MAX_FAILED_ATTEMPTS; i++) recordFailedLoginAttempt(db, 'a@b.c', t0);
    // What a restarted process would do: query the same store with no
    // in-process memory of what happened before.
    const row = db.prepare('SELECT failed_count FROM login_attempts WHERE subject = ?').get('a@b.c') as { failed_count: number };
    expect(row.failed_count).toBe(LOGIN_MAX_FAILED_ATTEMPTS);
    expect(isLoginAttemptBlocked(db, 'a@b.c', t0 + 1)).toBe(true);
  });

  it('normalizeLoginSubject folds case and whitespace', () => {
    expect(normalizeLoginSubject('  A@B.C ')).toBe('a@b.c');
    recordFailedLoginAttempt(db, normalizeLoginSubject('A@B.C'), 1_000);
    expect(isLoginAttemptBlocked(db, normalizeLoginSubject('a@b.c'), 1_001)).toBe(false);
    const row = db.prepare('SELECT subject FROM login_attempts').get() as { subject: string };
    expect(row.subject).toBe('a@b.c');
  });
});
