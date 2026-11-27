/**
 * PIN gate routes — the fix that makes the PIN real.
 *
 * pin/verify used to answer «authenticated» and set NOTHING any other route
 * could check. These tests assert the whole contract: the unlock cookie on
 * success, its httpOnly/scope flags, the database row behind it, no cookie
 * on failure, the 5-per-15-min block, and pin/setup opening the gate it
 * just engaged. Plus logout destroying the unlock.
 */

import type { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'crypto';
import { NextRequest } from 'next/server';
import { createDatabase } from '../../../../../src/persistent-storage/db';

let testDb: DatabaseSync;

jest.mock('../../../../../src/persistent-storage', () => {
  const actual = jest.requireActual('../../../../../src/persistent-storage');
  return { ...actual, getDb: jest.fn(() => testDb) };
});

import { createCreator, createSession, setVaultPinHash, getActiveVaultUnlock } from '../../../../../src/persistent-storage';
import { hashPassword } from '../../../../../src/authentication/password-hashing';
import { resetPinAttemptTrackerForTests } from '../../../../../src/vault/vault-pin-service';
import { POST as verifyPin } from '../verify/route';
import { POST as setupPin } from '../setup/route';
import { POST as logOut } from '../../../auth/logout/route';

const SESSION_COOKIE = 'azma_session';

function makeRequest(body: unknown, cookies: Record<string, string>): NextRequest {
  const header = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
  return new NextRequest('http://localhost/api/vault/pin/verify', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: header },
    body: JSON.stringify(body),
  });
}

async function seed(withPin: string | null) {
  const creatorId = `c-${randomUUID()}`;
  createCreator(testDb, { creatorId, email: `${creatorId}@example.com`, passwordHash: null, role: 'creator', displayName: null });
  if (withPin !== null) setVaultPinHash(testDb, creatorId, await hashPassword(withPin));
  const session = createSession(testDb, randomUUID(), creatorId, 60_000);
  return { creatorId, sessionId: session.sessionId };
}

function unlockCookieOf(res: { headers: Headers }): string | null {
  const setCookie = res.headers.get('set-cookie') ?? '';
  const match = setCookie.match(new RegExp(`${'azma_vault'}=([^;]+)`));
  return match?.[1] ?? null;
}

beforeEach(() => { testDb = createDatabase(':memory:'); resetPinAttemptTrackerForTests(); });
afterEach(() => { testDb.close(); });

describe('pin/verify — server-side unlock issuance', () => {
  it('correct PIN → authenticated + an httpOnly unlock cookie backed by a live DB row', async () => {
    const { creatorId, sessionId } = await seed('1234');
    const res = await verifyPin(makeRequest({ pin: '1234' }, { [SESSION_COOKIE]: sessionId }));
    expect(res.status).toBe(200);
    const token = unlockCookieOf(res);
    expect(token).toBeTruthy();
    const setCookie = res.headers.get('set-cookie') ?? '';
    expect(setCookie.toLowerCase()).toContain('httponly');
    expect(setCookie).toContain('Path=/');
    const record = getActiveVaultUnlock(testDb, token!);
    expect(record?.creatorId).toBe(creatorId);
  });

  it('wrong PIN → incorrect, and NO unlock cookie', async () => {
    const { sessionId } = await seed('1234');
    const res = await verifyPin(makeRequest({ pin: '9999' }, { [SESSION_COOKIE]: sessionId }));
    const json = await res.json();
    expect(json.status).toBe('incorrect');
    expect(unlockCookieOf(res)).toBeNull();
  });

  it('5 wrong PINs → 429, and even the CORRECT pin is refused while blocked', async () => {
    const { sessionId } = await seed('1234');
    for (let i = 0; i < 5; i++) {
      await verifyPin(makeRequest({ pin: '9999' }, { [SESSION_COOKIE]: sessionId }));
    }
    const blocked = await verifyPin(makeRequest({ pin: '1234' }, { [SESSION_COOKIE]: sessionId }));
    expect(blocked.status).toBe(429);
    expect(unlockCookieOf(blocked)).toBeNull();
  });

  it('no session → 401, no cookie', async () => {
    const res = await verifyPin(makeRequest({ pin: '1234' }, {}));
    expect(res.status).toBe(401);
    expect(unlockCookieOf(res)).toBeNull();
  });

  it('a PIN that is not exactly 4 digits is rejected before any lookup', async () => {
    const { sessionId } = await seed('1234');
    const res = await verifyPin(makeRequest({ pin: '12345' }, { [SESSION_COOKIE]: sessionId }));
    expect(res.status).toBe(400);
    expect(unlockCookieOf(res)).toBeNull();
  });
});

describe('pin/setup — the gate engages the moment a PIN exists', () => {
  it('setting a PIN opens the gate for the same session immediately', async () => {
    const { creatorId, sessionId } = await seed(null);
    const res = await setupPin(makeRequest({ pin: '4321' }, { [SESSION_COOKIE]: sessionId }));
    expect(res.status).toBe(200);
    const token = unlockCookieOf(res);
    expect(token).toBeTruthy();
    expect(getActiveVaultUnlock(testDb, token!)?.creatorId).toBe(creatorId);
  });
});

describe('logout — signing out closes the Vault gate', () => {
  it('destroys every outstanding unlock of the Creator and clears the cookie', async () => {
    const { creatorId, sessionId } = await seed('1234');
    const res = await verifyPin(makeRequest({ pin: '1234' }, { [SESSION_COOKIE]: sessionId }));
    const token = unlockCookieOf(res)!;
    expect(getActiveVaultUnlock(testDb, token)).not.toBeNull();

    const out = await logOut(makeRequest({}, { [SESSION_COOKIE]: sessionId }));
    expect(out.status).toBe(200);
    expect(getActiveVaultUnlock(testDb, token)).toBeNull();
    expect(out.headers.get('set-cookie')).toContain('azma_vault=;');
  });
});
