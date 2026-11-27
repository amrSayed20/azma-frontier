/**
 * Vault Unlock Records — the durable proof that a Vault gate was passed.
 * Multi-angle: expiry boundary, unknown token, per-creator wipe, isolation
 * between Creators, and that expiry is exact (<=, not <).
 */

import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../db';
import {
  createVaultUnlock,
  getActiveVaultUnlock,
  deleteVaultUnlock,
  deleteVaultUnlocksForCreator,
} from '../vault-unlock-repository';

let db: DatabaseSync;

beforeEach(() => { db = createDatabase(':memory:'); });
afterEach(() => { db.close(); });

describe('vault-unlock-repository', () => {
  it('a fresh unlock is active and carries its creator', () => {
    createVaultUnlock(db, 'tok-1', 'creator-a', 60_000, 1_000);
    const found = getActiveVaultUnlock(db, 'tok-1', 1_500);
    expect(found?.creatorId).toBe('creator-a');
    expect(found?.expiresAt).toBe(61_000);
  });

  it('an unknown token is nothing', () => {
    expect(getActiveVaultUnlock(db, 'never-issued', 1_000)).toBeNull();
  });

  it('is inactive exactly AT expiry, not a millisecond later', () => {
    createVaultUnlock(db, 'tok-1', 'creator-a', 60_000, 1_000);
    expect(getActiveVaultUnlock(db, 'tok-1', 61_000)).toBeNull();
    expect(getActiveVaultUnlock(db, 'tok-1', 60_999)).not.toBeNull();
  });

  it('a deleted unlock is gone even inside its window', () => {
    createVaultUnlock(db, 'tok-1', 'creator-a', 60_000, 1_000);
    deleteVaultUnlock(db, 'tok-1');
    expect(getActiveVaultUnlock(db, 'tok-1', 2_000)).toBeNull();
  });

  it('sign-out wipes every unlock of that Creator and nobody else', () => {
    createVaultUnlock(db, 'tok-a1', 'creator-a', 60_000, 1_000);
    createVaultUnlock(db, 'tok-a2', 'creator-a', 60_000, 1_000);
    createVaultUnlock(db, 'tok-b1', 'creator-b', 60_000, 1_000);
    deleteVaultUnlocksForCreator(db, 'creator-a');
    expect(getActiveVaultUnlock(db, 'tok-a1', 2_000)).toBeNull();
    expect(getActiveVaultUnlock(db, 'tok-a2', 2_000)).toBeNull();
    expect(getActiveVaultUnlock(db, 'tok-b1', 2_000)?.creatorId).toBe('creator-b');
  });

  it('two Creators can never share a token', () => {
    createVaultUnlock(db, 'tok-1', 'creator-a', 60_000, 1_000);
    expect(() => createVaultUnlock(db, 'tok-1', 'creator-b', 60_000, 1_000)).toThrow();
  });
});
