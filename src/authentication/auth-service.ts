/**
 * AZMA OS — AUTHENTICATION FOUNDATION
 * The Authentication Service
 *
 * Real Creator sign-up, log-in, log-out, and session verification —
 * built entirely on the Persistent Storage Foundation's own creator and
 * session repositories (Execution Package II). Founder authentication
 * uses this exact same path: a Founder is a Creator record with
 * role='founder', provisioned only via founder-bootstrap.ts (never
 * through public sign-up), then authenticated identically.
 */

import { randomUUID } from 'crypto';
import { getDb, createCreator, getCreatorByEmail, getCreator, createSession, getActiveSession, deleteSession } from '../persistent-storage';
import { hashPassword, verifyPassword } from './password-hashing';
import { generateSessionId } from './session-token';
import type { AuthOutcome, VerifiedSession } from './types';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days
const MIN_PASSWORD_LENGTH = 8;

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export async function signUp(email: string, password: string, displayName?: string): Promise<AuthOutcome> {
  if (!isValidEmail(email) || password.length < MIN_PASSWORD_LENGTH) {
    return {
      status: 'failed',
      reason: 'invalid-input',
      message: `A valid email and a password of at least ${MIN_PASSWORD_LENGTH} characters are required.`,
    };
  }

  const db = getDb();
  if (getCreatorByEmail(db, email)) {
    return { status: 'failed', reason: 'email-taken', message: 'An account with this email already exists.' };
  }

  const passwordHash = await hashPassword(password);
  let creator;
  try {
    creator = createCreator(db, { creatorId: randomUUID(), email, passwordHash, role: 'creator', displayName: displayName ?? null });
  } catch {
    // A concurrent sign-up could win the race between the check above and this insert — the UNIQUE constraint is the real guarantee.
    return { status: 'failed', reason: 'email-taken', message: 'An account with this email already exists.' };
  }

  const sessionId = generateSessionId();
  const session = createSession(db, sessionId, creator.creatorId, SESSION_TTL_MS);
  return { status: 'succeeded', result: { creatorId: creator.creatorId, role: creator.role, sessionId, expiresAt: session.expiresAt } };
}

export async function logIn(email: string, password: string): Promise<AuthOutcome> {
  if (!isValidEmail(email) || !password) {
    return { status: 'failed', reason: 'invalid-input', message: 'Email and password are required.' };
  }

  const db = getDb();
  const creator = getCreatorByEmail(db, email);
  if (!creator || !creator.passwordHash || !(await verifyPassword(password, creator.passwordHash))) {
    return { status: 'failed', reason: 'invalid-credentials', message: 'Invalid email or password.' };
  }

  const sessionId = generateSessionId();
  const session = createSession(db, sessionId, creator.creatorId, SESSION_TTL_MS);
  return { status: 'succeeded', result: { creatorId: creator.creatorId, role: creator.role, sessionId, expiresAt: session.expiresAt } };
}

export function logOut(sessionId: string): void {
  deleteSession(getDb(), sessionId);
}

export function verifySession(sessionId: string): VerifiedSession | null {
  const db = getDb();
  const session = getActiveSession(db, sessionId);
  if (!session) return null;

  const creator = getCreator(db, session.creatorId);
  if (!creator) return null;

  return { creatorId: creator.creatorId, role: creator.role };
}
