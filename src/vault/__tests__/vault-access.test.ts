/**
 * The server-side Vault gate — checkVaultAccess.
 *
 * Every angle that mattered in the review: no session, bad session, no PIN
 * set (session suffices, as before), PIN set with no unlock, with an expired
 * unlock, with someone ELSE's unlock, with a forged/garbage token, and the
 * one good path. The last test is the regression: before this fix, a session
 * alone was always enough.
 */

import type { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'crypto';
import { NextRequest } from 'next/server';
import { createDatabase } from '../../persistent-storage/db';

let testDb: DatabaseSync;

jest.mock('../../persistent-storage', () => {
  const actual = jest.requireActual('../../persistent-storage');
  return { ...actual, getDb: jest.fn(() => testDb) };
});

import { createCreator, createSession, setVaultPinHash, createVaultUnlock } from '../../persistent-storage';
import { checkVaultAccess, VAULT_UNLOCK_COOKIE } from '../vault-access';

const SESSION_COOKIE = 'azma_session';

function seedCreator(creatorId: string, withPin: boolean) {
  createCreator(testDb, {
    creatorId,
    email: `${creatorId}@example.com`,
    passwordHash: null,
    role: 'creator',
    displayName: null,
  });
  if (withPin) setVaultPinHash(testDb, creatorId, 'scrypt$fake$hash');
}

function makeRequest(cookies: Record<string, string>): NextRequest {
  const header = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
  return new NextRequest('http://localhost/api/vault/assets', {
    headers: { Cookie: header },
  });
}

beforeEach(() => { testDb = createDatabase(':memory:'); });
afterEach(() => { testDb.close(); });

describe('checkVaultAccess', () => {
  it('no session cookie at all → no-session', () => {
    expect(checkVaultAccess(makeRequest({})).status).toBe('no-session');
  });

  it('a session id that exists nowhere → no-session', () => {
    expect(checkVaultAccess(makeRequest({ [SESSION_COOKIE]: 'forged' })).status).toBe('no-session');
  });

  it('no PIN set → session alone still opens the Vault (behaviour unchanged)', () => {
    seedCreator('c-nopin', false);
    const session = createSession(testDb, randomUUID(), 'c-nopin', 60_000);
    const access = checkVaultAccess(makeRequest({ [SESSION_COOKIE]: session.sessionId }));
    expect(access.status).toBe('ok');
  });

  it('PIN set + no unlock cookie → locked (THE REGRESSION: this used to pass)', () => {
    seedCreator('c-pin', true);
    const session = createSession(testDb, randomUUID(), 'c-pin', 60_000);
    expect(checkVaultAccess(makeRequest({ [SESSION_COOKIE]: session.sessionId })).status).toBe('locked');
  });

  it('PIN set + garbage unlock token → locked', () => {
    seedCreator('c-pin', true);
    const session = createSession(testDb, randomUUID(), 'c-pin', 60_000);
    const access = checkVaultAccess(makeRequest({ [SESSION_COOKIE]: session.sessionId, [VAULT_UNLOCK_COOKIE]: 'not-a-real-token' }));
    expect(access.status).toBe('locked');
  });

  it('PIN set + expired unlock → locked', () => {
    seedCreator('c-pin', true);
    const session = createSession(testDb, randomUUID(), 'c-pin', 60_000);
    const unlock = createVaultUnlock(testDb, randomUUID(), 'c-pin', 1_000, Date.now() - 10_000);
    const access = checkVaultAccess(makeRequest({ [SESSION_COOKIE]: session.sessionId, [VAULT_UNLOCK_COOKIE]: unlock.unlockToken }));
    expect(access.status).toBe('locked');
  });

  it("PIN set + someone else's valid unlock → locked", () => {
    seedCreator('c-pin', true);
    seedCreator('c-other', true);
    const session = createSession(testDb, randomUUID(), 'c-pin', 60_000);
    const foreign = createVaultUnlock(testDb, randomUUID(), 'c-other', 60_000);
    const access = checkVaultAccess(makeRequest({ [SESSION_COOKIE]: session.sessionId, [VAULT_UNLOCK_COOKIE]: foreign.unlockToken }));
    expect(access.status).toBe('locked');
  });

  it('PIN set + own live unlock → ok', () => {
    seedCreator('c-pin', true);
    const session = createSession(testDb, randomUUID(), 'c-pin', 60_000);
    const unlock = createVaultUnlock(testDb, randomUUID(), 'c-pin', 60_000);
    const access = checkVaultAccess(makeRequest({ [SESSION_COOKIE]: session.sessionId, [VAULT_UNLOCK_COOKIE]: unlock.unlockToken }));
    expect(access.status).toBe('ok');
    if (access.status === 'ok') expect(access.session.creatorId).toBe('c-pin');
  });
});
