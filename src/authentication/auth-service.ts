/**
 * AZMA OS — AUTHENTICATION FOUNDATION
 * The Authentication Service
 *
 * Log-in, log-out, and session verification for accounts that hold a password.
 *
 * REGISTRATION DOES NOT LIVE HERE ANY MORE. It lives behind the identity gate
 * (src/identity/), which requires a provider's assertion to be verified
 * server-side before an account or a session can exist. What remains in this
 * file is the way IN for the accounts that predate that gate: they hold
 * passwords, they must not be locked out of their own work, and they are
 * UNVERIFIED until they verify — which lets them enter and not subscribe.
 *
 * A Founder is a Creator record with role='founder', provisioned only via
 * founder-bootstrap.ts from the server's own environment, then authenticated
 * through this same path.
 */

import { getDb, getCreatorByEmail, getCreator, createSession, getActiveSession, deleteSession } from '../persistent-storage';
import { verifyPassword } from './password-hashing';
import { generateSessionId } from './session-token';
import type { AuthOutcome, VerifiedSession } from './types';

const SESSION_TTL_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * ─── signUp() WAS REMOVED HERE, AND WHY THAT MATTERED ───────────────────────
 *
 *   It took an email and a password, created a Creator account, and issued a
 *   session — all on the strength of a regular expression testing that the
 *   address LOOKED like an address. Nothing proved a person could receive mail
 *   at it, because no mechanism for proving that existed anywhere in this
 *   system.
 *
 *   Closing `POST /api/auth/signup` stopped it being reachable. It did not stop
 *   it EXISTING, and an existing function is the more dangerous half: this one
 *   was exported from the module index, named exactly what a future engineer
 *   would reach for, and one import away from reopening the hole in full. The
 *   same shape as the dead RepositoryManager and the never-called
 *   adoptLegacyAsset — a correct-looking thing waiting for someone to use it.
 *
 *   Registration is now `src/identity/identity-gate.ts`, which takes a
 *   `VerifiedIdentity` — a value that cannot be constructed without a
 *   server-side check of a provider's assertion. There is no argument through
 *   which an unproven address could enter.
 *
 *   logIn() stays. The three accounts that predate the gate hold passwords and
 *   must not be locked out of their own work; they are UNVERIFIED, so they may
 *   enter and may not subscribe until they verify.
 */
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
