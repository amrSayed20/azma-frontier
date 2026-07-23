/**
 * AZMA OS — PERSISTENT STORAGE FOUNDATION
 * Creator Records
 *
 * A durable place for a Creator identity to live. Extended by the
 * Authentication Foundation (Execution Package III) with email,
 * password_hash, and role — this file still contains no login flow or
 * session logic itself; that lives in src/authentication/, which reads
 * and writes through these functions.
 */

import type { DatabaseSync } from 'node:sqlite';

export type CreatorRole = 'founder' | 'creator';

export interface CreatorRecord {
  readonly creatorId: string;
  readonly email: string | null;
  readonly passwordHash: string | null;
  readonly role: CreatorRole;
  readonly displayName: string | null;
  readonly preferredLocale: string | null;
  readonly createdAt: number;
}

export interface NewCreator {
  readonly creatorId: string;
  readonly email?: string | null;
  readonly passwordHash?: string | null;
  readonly role?: CreatorRole;
  readonly displayName?: string | null;
  readonly preferredLocale?: string | null;
}

function rowToCreator(row: Record<string, unknown>): CreatorRecord {
  return {
    creatorId: row.creator_id as string,
    email: (row.email as string | null) ?? null,
    passwordHash: (row.password_hash as string | null) ?? null,
    role: (row.role as CreatorRole) ?? 'creator',
    displayName: (row.display_name as string | null) ?? null,
    preferredLocale: (row.preferred_locale as string | null) ?? null,
    createdAt: row.created_at as number,
  };
}

export function createCreator(db: DatabaseSync, creator: NewCreator): CreatorRecord {
  const createdAt = Date.now();
  const email = creator.email ?? null;
  const passwordHash = creator.passwordHash ?? null;
  const role = creator.role ?? 'creator';
  const displayName = creator.displayName ?? null;
  const preferredLocale = creator.preferredLocale ?? null;

  db.prepare(
    'INSERT INTO creators (creator_id, email, password_hash, role, display_name, preferred_locale, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).run(creator.creatorId, email, passwordHash, role, displayName, preferredLocale, createdAt);

  return { creatorId: creator.creatorId, email, passwordHash, role, displayName, preferredLocale, createdAt };
}

export function getCreator(db: DatabaseSync, creatorId: string): CreatorRecord | null {
  const row = db
    .prepare('SELECT creator_id, email, password_hash, role, display_name, preferred_locale, created_at FROM creators WHERE creator_id = ?')
    .get(creatorId);
  return row ? rowToCreator(row) : null;
}

export function getCreatorByEmail(db: DatabaseSync, email: string): CreatorRecord | null {
  const row = db
    .prepare('SELECT creator_id, email, password_hash, role, display_name, preferred_locale, created_at FROM creators WHERE email = ?')
    .get(email);
  return row ? rowToCreator(row) : null;
}

/** Creator Language Experience: the one write path for persisting a Creator's chosen platform language once authenticated. */
export function updateCreatorPreferredLocale(db: DatabaseSync, creatorId: string, locale: string): void {
  db.prepare('UPDATE creators SET preferred_locale = ? WHERE creator_id = ?').run(locale, creatorId);
}
