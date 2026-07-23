/**
 * AZMA OS — AUTHENTICATION FOUNDATION
 * Founder Bootstrap
 *
 * The Founder account is never publicly self-registerable — it is
 * provisioned only from environment configuration (FOUNDER_EMAIL,
 * FOUNDER_PASSWORD), keeping elevated privilege out of the public
 * sign-up surface. Idempotent: safe to call on every server start.
 * Does nothing, silently, when no Founder is configured — disclosed
 * rather than defaulted to a guessable identity.
 */

import { randomUUID } from 'crypto';
import { getDb, createCreator, getCreatorByEmail } from '../persistent-storage';
import { hashPassword } from './password-hashing';

export async function ensureFounderAccountExists(): Promise<void> {
  const email = process.env.FOUNDER_EMAIL;
  const password = process.env.FOUNDER_PASSWORD;
  if (!email || !password) return;

  const db = getDb();
  if (getCreatorByEmail(db, email)) return;

  const passwordHash = await hashPassword(password);
  createCreator(db, { creatorId: randomUUID(), email, passwordHash, role: 'founder', displayName: 'Founder' });
}
