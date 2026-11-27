/**
 * AZMA OS — PERSISTENT STORAGE FOUNDATION
 * Vault Unlock Records
 *
 * A durable, server-side record that a Creator has opened their Vault gate
 * (PIN or biometric) recently. The PIN verify route used to answer with a
 * bare JSON «authenticated» and set nothing: the gate existed only in the
 * interface, and every Vault asset route trusted the session alone. This
 * record is what lets the SERVER — not the page — know the gate was passed.
 *
 * Same shape as SessionRecord on purpose: an opaque random token, stored
 * server-side, revocable by deleting the row, expiring by its own clock.
 */

import type { DatabaseSync } from 'node:sqlite';

export interface VaultUnlockRecord {
  readonly unlockToken: string;
  readonly creatorId: string;
  readonly createdAt: number;
  readonly expiresAt: number;
}

export function createVaultUnlock(
  db: DatabaseSync,
  unlockToken: string,
  creatorId: string,
  ttlMs: number,
  now: number = Date.now(),
): VaultUnlockRecord {
  const expiresAt = now + ttlMs;
  db.prepare(
    'INSERT INTO vault_unlocks (unlock_token, creator_id, created_at, expires_at) VALUES (?, ?, ?, ?)',
  ).run(unlockToken, creatorId, now, expiresAt);
  return { unlockToken, creatorId, createdAt: now, expiresAt };
}

export function getActiveVaultUnlock(
  db: DatabaseSync,
  unlockToken: string,
  now: number = Date.now(),
): VaultUnlockRecord | null {
  const row = db
    .prepare('SELECT unlock_token, creator_id, created_at, expires_at FROM vault_unlocks WHERE unlock_token = ?')
    .get(unlockToken);
  if (!row) return null;
  const expiresAt = row.expires_at as number;
  if (expiresAt <= now) return null;
  return {
    unlockToken: row.unlock_token as string,
    creatorId: row.creator_id as string,
    createdAt: row.created_at as number,
    expiresAt,
  };
}

export function deleteVaultUnlock(db: DatabaseSync, unlockToken: string): void {
  db.prepare('DELETE FROM vault_unlocks WHERE unlock_token = ?').run(unlockToken);
}

/** Every outstanding unlock of one Creator — used on sign-out. */
export function deleteVaultUnlocksForCreator(db: DatabaseSync, creatorId: string): void {
  db.prepare('DELETE FROM vault_unlocks WHERE creator_id = ?').run(creatorId);
}
