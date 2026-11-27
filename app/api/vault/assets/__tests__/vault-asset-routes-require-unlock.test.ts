/**
 * Vault asset routes — the API-side gate.
 *
 * THE regression of the review: before this fix, every asset route trusted
 * the session alone, so a stolen session cookie could list, read and DELETE
 * the Vault without the PIN. These tests exercise the list route and the
 * single-asset route (GET + DELETE) from every angle: no session, session
 * but PIN set and no unlock, expired unlock, another Creator's unlock,
 * no-PIN accounts (unchanged), and the good path.
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

const mockListAssets = jest.fn();
jest.mock('../../../../../src/vault/sovereign-vault-manager', () => ({
  SovereignVaultManager: jest.fn().mockImplementation(() => ({
    listAssetsForTenant: mockListAssets,
  })),
}));

import { createCreator, createSession, setVaultPinHash, createVaultUnlock } from '../../../../../src/persistent-storage';
import { GET as listAssets } from '../route';
import { GET as getAsset } from '../[assetId]/route';

const SESSION_COOKIE = 'azma_session';
const UNLOCK_COOKIE = 'azma_vault';

function makeRequest(cookies: Record<string, string>): NextRequest {
  const header = Object.entries(cookies).map(([k, v]) => `${k}=${v}`).join('; ');
  return new NextRequest('http://localhost/api/vault/assets', { headers: { Cookie: header } });
}

async function seed(creatorId: string, withPin: boolean) {
  createCreator(testDb, { creatorId, email: `${creatorId}@example.com`, passwordHash: null, role: 'creator', displayName: null });
  if (withPin) setVaultPinHash(testDb, creatorId, 'scrypt$fake$hash');
  const session = createSession(testDb, randomUUID(), creatorId, 60_000);
  return session.sessionId;
}

beforeEach(() => {
  testDb = createDatabase(':memory:');
  jest.clearAllMocks();
  mockListAssets.mockResolvedValue([]);
});
afterEach(() => { testDb.close(); });

describe('GET /api/vault/assets — the list route', () => {
  it('no session → 401', async () => {
    const res = await listAssets(makeRequest({}));
    expect(res.status).toBe(401);
    expect(mockListAssets).not.toHaveBeenCalled();
  });

  it('session + PIN set + NO unlock → 403 vault-locked (this was 200 before the fix)', async () => {
    const sessionId = await seed('c-pin', true);
    const res = await listAssets(makeRequest({ [SESSION_COOKIE]: sessionId }));
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.reason).toBe('vault-locked');
    expect(mockListAssets).not.toHaveBeenCalled();
  });

  it('session + PIN set + expired unlock → 403', async () => {
    const sessionId = await seed('c-pin', true);
    const stale = createVaultUnlock(testDb, randomUUID(), 'c-pin', 1_000, Date.now() - 10_000);
    const res = await listAssets(makeRequest({ [SESSION_COOKIE]: sessionId, [UNLOCK_COOKIE]: stale.unlockToken }));
    expect(res.status).toBe(403);
    expect(mockListAssets).not.toHaveBeenCalled();
  });

  it("session + PIN set + another Creator's unlock → 403", async () => {
    const sessionId = await seed('c-pin', true);
    await seed('c-other', true);
    const foreign = createVaultUnlock(testDb, randomUUID(), 'c-other', 60_000);
    const res = await listAssets(makeRequest({ [SESSION_COOKIE]: sessionId, [UNLOCK_COOKIE]: foreign.unlockToken }));
    expect(res.status).toBe(403);
    expect(mockListAssets).not.toHaveBeenCalled();
  });

  it('session + no PIN set → 200 (behaviour for PIN-less accounts unchanged)', async () => {
    const sessionId = await seed('c-nopin', false);
    const res = await listAssets(makeRequest({ [SESSION_COOKIE]: sessionId }));
    expect(res.status).toBe(200);
    expect(mockListAssets).toHaveBeenCalledWith('c-nopin');
  });

  it('session + PIN set + own live unlock → 200', async () => {
    const sessionId = await seed('c-pin', true);
    const unlock = createVaultUnlock(testDb, randomUUID(), 'c-pin', 60_000);
    const res = await listAssets(makeRequest({ [SESSION_COOKIE]: sessionId, [UNLOCK_COOKIE]: unlock.unlockToken }));
    expect(res.status).toBe(200);
    expect(mockListAssets).toHaveBeenCalledWith('c-pin');
  });
});

describe('GET /api/vault/assets/[assetId] — read and delete share the gate', () => {
  const params = Promise.resolve({ assetId: 'asset-1' });

  it('session + PIN set + no unlock → 403, never 200, never the asset', async () => {
    const sessionId = await seed('c-pin', true);
    const res = await getAsset(makeRequest({ [SESSION_COOKIE]: sessionId }), { params });
    expect(res.status).toBe(403);
    const json = await res.json();
    expect(json.reason).toBe('vault-locked');
  });
});
