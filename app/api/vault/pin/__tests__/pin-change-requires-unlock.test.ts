/**
 * PIN change and device enrolment must not be a way around the Vault gate.
 *
 * Found in review of PR #1: pin/setup and biometric/enrol only checked the
 * session. A session cookie alone could overwrite an existing PIN (and be
 * handed a fresh unlock for it), or start enrolling its own device, which
 * then opens the Vault. Also: unlocks minted before a PIN change stayed
 * valid after it.
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

const mockBegin = jest.fn(async () => ({ challenge: 'x' }));
jest.mock('../../../../../src/vault/vault-biometric-service', () => ({
  beginEnrolment: (...a: unknown[]) => (mockBegin as (...x: unknown[]) => unknown)(...a),
  completeEnrolment: jest.fn(async () => ({ status: 'failed', reason: 'x' })),
}));

import {
  createCreator, createSession, setVaultPinHash, createVaultUnlock, getActiveVaultUnlock, getVaultPinHash,
} from '../../../../../src/persistent-storage';
import { hashPassword, verifyPassword } from '../../../../../src/authentication';
import { POST as setupPin } from '../setup/route';
import { GET as enrolChallenge } from '../../biometric/enrol/route';

const SESSION_COOKIE = 'azma_session';
const UNLOCK_COOKIE = 'azma_vault';

function req(url: string, cookies: Record<string, string>, body?: unknown): NextRequest {
  const header = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
  return new NextRequest(`http://localhost${url}`, {
    method: body === undefined ? 'GET' : 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: header },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
}

async function seed(pin: string | null) {
  const creatorId = `c-${randomUUID()}`;
  createCreator(testDb, { creatorId, email: `${creatorId}@example.com`, passwordHash: null, role: 'creator', displayName: null });
  if (pin !== null) setVaultPinHash(testDb, creatorId, await hashPassword(pin));
  const sessionId = createSession(testDb, randomUUID(), creatorId, 60_000).sessionId;
  return { creatorId, sessionId };
}

beforeEach(() => { testDb = createDatabase(':memory:'); mockBegin.mockClear(); });
afterEach(() => { testDb.close(); });

describe('pin/setup when a PIN already exists', () => {
  it('session alone cannot overwrite the PIN, and gets no unlock', async () => {
    const { creatorId, sessionId } = await seed('1234');
    const res = await setupPin(req('/api/vault/pin/setup', { [SESSION_COOKIE]: sessionId }, { pin: '9999' }));
    expect(res.status).toBe(403);
    expect(res.headers.get('set-cookie') ?? '').not.toContain(UNLOCK_COOKIE);
    expect(await verifyPassword('1234', getVaultPinHash(testDb, creatorId)!)).toBe(true);
  });

  it('an unlocked session can change the PIN, and every older unlock dies', async () => {
    const { creatorId, sessionId } = await seed('1234');
    createVaultUnlock(testDb, 'mine', creatorId, 60_000);
    createVaultUnlock(testDb, 'other-device', creatorId, 60_000);
    const res = await setupPin(req('/api/vault/pin/setup', { [SESSION_COOKIE]: sessionId, [UNLOCK_COOKIE]: 'mine' }, { pin: '9999' }));
    expect(res.status).toBe(200);
    expect(await verifyPassword('9999', getVaultPinHash(testDb, creatorId)!)).toBe(true);
    expect(getActiveVaultUnlock(testDb, 'mine')).toBeNull();
    expect(getActiveVaultUnlock(testDb, 'other-device')).toBeNull();
    const fresh = (res.headers.get('set-cookie') ?? '').match(/azma_vault=([^;]+)/)?.[1];
    expect(fresh).toBeTruthy();
    expect(getActiveVaultUnlock(testDb, fresh!)?.creatorId).toBe(creatorId);
  });

  it('first-time setup (no PIN yet) still works with the session alone', async () => {
    const { sessionId } = await seed(null);
    const res = await setupPin(req('/api/vault/pin/setup', { [SESSION_COOKIE]: sessionId }, { pin: '4321' }));
    expect(res.status).toBe(200);
  });
});

describe('biometric/enrol challenge when a PIN is set', () => {
  it('refuses a session with no unlock and does not start enrolment', async () => {
    const { sessionId } = await seed('1234');
    const res = await enrolChallenge(req('/api/vault/biometric/enrol', { [SESSION_COOKIE]: sessionId }));
    expect(res.status).toBe(403);
    expect(mockBegin).not.toHaveBeenCalled();
  });

  it('allows it with a valid unlock', async () => {
    const { creatorId, sessionId } = await seed('1234');
    createVaultUnlock(testDb, 'ok', creatorId, 60_000);
    const res = await enrolChallenge(req('/api/vault/biometric/enrol', { [SESSION_COOKIE]: sessionId, [UNLOCK_COOKIE]: 'ok' }));
    expect(res.status).toBe(200);
    expect(mockBegin).toHaveBeenCalled();
  });
});
