/**
 * AZMA OS — VAULT GATE, SERVER SIDE
 *
 * Before this module the Vault PIN was checked exactly once — in
 * /api/vault/pin/verify, which answered «authenticated» and set NOTHING:
 * no cookie, no token, no server-side record. Every Vault asset route then
 * trusted the session cookie alone. Anyone holding a session (a stolen
 * cookie, an XSS payload, a borrowed unlocked browser) could list, read and
 * DELETE every Vault asset without ever knowing the PIN. The PIN protected
 * the page, not the Vault.
 *
 * The gate now exists on the server:
 *
 *   1. Passing the PIN (or a biometric) mints a VaultUnlockRecord — an
 *      opaque random token in the database — and sets it as an httpOnly
 *      cookie, exactly the session pattern.
 *   2. Every Vault asset route calls requireVaultAccess(), which demands a
 *      live session AND, when the Creator has a PIN set, an active unlock
 *      minted for that same Creator.
 *   3. Sign-out destroys every outstanding unlock of the Creator.
 *
 * A Creator who never set a PIN keeps the old behaviour — session alone —
 * because there is no second factor to enforce for them; the moment they
 * set one, the gate engages.
 */

import { randomBytes } from 'crypto';
import type { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../authentication';
import type { VerifiedSession } from '../authentication';
import { getDb, getVaultPinHash, createVaultUnlock, getActiveVaultUnlock } from '../persistent-storage';

export const VAULT_UNLOCK_COOKIE = 'azma_vault';
export const VAULT_UNLOCK_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours

export type VaultAccess =
  | { readonly status: 'ok'; readonly session: VerifiedSession }
  | { readonly status: 'no-session' }
  | { readonly status: 'locked' };

const SESSION_COOKIE = 'azma_session';

export function checkVaultAccess(request: NextRequest, now: number = Date.now()): VaultAccess {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;
  if (!session) return { status: 'no-session' };

  const db = getDb();
  if (getVaultPinHash(db, session.creatorId) === null) {
    // No PIN set: there is no second factor to enforce. Session alone.
    return { status: 'ok', session };
  }

  const unlockToken = request.cookies.get(VAULT_UNLOCK_COOKIE)?.value;
  if (!unlockToken) return { status: 'locked' };

  const unlock = getActiveVaultUnlock(db, unlockToken, now);
  if (!unlock || unlock.creatorId !== session.creatorId) return { status: 'locked' };

  return { status: 'ok', session };
}

/**
 * Mint an unlock for a gate the Creator just passed (PIN verified, biometric
 * verified, or PIN just set up) and set it on the response as an httpOnly
 * cookie — never visible to page scripts, exactly like the session cookie.
 */
export function issueVaultUnlock(response: NextResponse, creatorId: string): void {
  const unlockToken = randomBytes(32).toString('hex');
  const db = getDb();
  const record = createVaultUnlock(db, unlockToken, creatorId, VAULT_UNLOCK_TTL_MS);
  response.cookies.set(VAULT_UNLOCK_COOKIE, record.unlockToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production' && process.env.COOKIE_SECURE !== 'false',
    sameSite: 'lax',
    path: '/',
    expires: new Date(record.expiresAt),
  });
}

/** The two refusal answers, shaped like the routes' existing ones. */
export const VAULT_NO_SESSION_BODY = {
  status: 'failed',
  reason: 'unauthorized',
  message: 'سجّل دخولك أوّلاً.',
} as const;

export const VAULT_LOCKED_BODY = {
  status: 'failed',
  reason: 'vault-locked',
  message: 'افتح الخزنة بالـPIN أو بصمتك أوّلاً.',
} as const;
