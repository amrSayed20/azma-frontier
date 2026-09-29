/**
 * AZMA OS — the accounts a Creator has linked, and the permission they gave.
 *
 * Nothing here ever returns a token to a caller that did not ask for it by
 * name: `listAccountsForCreator` returns what a Creator may SEE, and the
 * sealed token is not part of that shape at all. Reading a token is a separate
 * call with a separate purpose, used by one module.
 */

import type { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'crypto';
import { encryptToken, decryptToken } from './token-vault';

/** A provider the Empire can deliver a file to. Names only; no secret here. */
export type CloudProviderId = 'google-drive' | 'dropbox';

/** What a Creator is shown about an account they linked. Never a token. */
export interface LinkedCloudAccount {
  readonly accountId: string;
  readonly provider: CloudProviderId;
  readonly accountLabel: string | null;
  readonly linkedAtMs: number;
  readonly lastUsedAtMs: number | null;
  readonly revokedAtMs: number | null;
}

type Row = {
  account_id: string;
  provider: string;
  account_label: string | null;
  linked_at: number;
  last_used_at: number | null;
  revoked_at: number | null;
};

const toAccount = (r: Row): LinkedCloudAccount => ({
  accountId: r.account_id,
  provider: r.provider as CloudProviderId,
  accountLabel: r.account_label,
  linkedAtMs: r.linked_at,
  lastUsedAtMs: r.last_used_at,
  revokedAtMs: r.revoked_at,
});

/**
 * Record a grant the Creator just made, sealing the refresh token.
 *
 * Linking the same account twice REPLACES the grant rather than adding a
 * second: two live grants to one account would mean a Creator sees one row to
 * revoke while another quietly still works.
 */
export function linkCloudAccount(
  db: DatabaseSync,
  input: {
    creatorId: string;
    provider: CloudProviderId;
    providerAccountId: string;
    accountLabel?: string | null;
    refreshToken: string;
    scopes: readonly string[];
    nowMs?: number;
  },
): LinkedCloudAccount {
  const now = input.nowMs ?? Date.now();
  // Throws when the vault has no key — a deliberate refusal, never a
  // fallback to plaintext. See token-vault.ts.
  const sealed = encryptToken(input.refreshToken);

  db.prepare(
    `INSERT INTO cloud_accounts
       (account_id, creator_id, provider, provider_account_id, account_label,
        refresh_token_sealed, scopes, linked_at, last_used_at, revoked_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL)
     ON CONFLICT(creator_id, provider, provider_account_id) DO UPDATE SET
       account_label = excluded.account_label,
       refresh_token_sealed = excluded.refresh_token_sealed,
       scopes = excluded.scopes,
       linked_at = excluded.linked_at,
       revoked_at = NULL`,
  ).run(
    `cloud_${randomUUID()}`,
    input.creatorId,
    input.provider,
    input.providerAccountId,
    input.accountLabel ?? null,
    sealed,
    input.scopes.join(' '),
    now,
  );

  const row = db
    .prepare(
      `SELECT account_id, provider, account_label, linked_at, last_used_at, revoked_at
       FROM cloud_accounts
       WHERE creator_id = ? AND provider = ? AND provider_account_id = ?`,
    )
    .get(input.creatorId, input.provider, input.providerAccountId) as unknown as Row;
  return toAccount(row);
}

/** The accounts this Creator can see and act on. Revoked ones are excluded. */
export function listAccountsForCreator(
  db: DatabaseSync,
  creatorId: string,
): readonly LinkedCloudAccount[] {
  const rows = db
    .prepare(
      `SELECT account_id, provider, account_label, linked_at, last_used_at, revoked_at
       FROM cloud_accounts
       WHERE creator_id = ? AND revoked_at IS NULL
       ORDER BY linked_at DESC`,
    )
    .all(creatorId) as unknown as Row[];
  return rows.map(toAccount);
}

/**
 * Withdraw a grant.
 *
 * The row survives and the power does not: `revoked_at` is stamped and the
 * sealed token is BLANKED in the same statement, so an unlinked account leaves
 * an audit trail that carries no key.
 */
export function revokeCloudAccount(
  db: DatabaseSync,
  accountId: string,
  creatorId: string,
  nowMs: number = Date.now(),
): boolean {
  const result = db
    .prepare(
      `UPDATE cloud_accounts
       SET revoked_at = ?, refresh_token_sealed = NULL
       WHERE account_id = ? AND creator_id = ? AND revoked_at IS NULL`,
    )
    .run(nowMs, accountId, creatorId);
  return Number(result.changes) > 0;
}

/**
 * The refresh token for one live account — for the uploader, and nothing else.
 *
 * Scoped by creator so an account id alone can never fetch another Creator's
 * grant. Null for a revoked account, an absent one, or a seal this Empire
 * cannot open — all three mean «ask the Creator to link it again».
 */
export function readRefreshToken(
  db: DatabaseSync,
  accountId: string,
  creatorId: string,
): string | null {
  const row = db
    .prepare(
      `SELECT refresh_token_sealed AS sealed FROM cloud_accounts
       WHERE account_id = ? AND creator_id = ? AND revoked_at IS NULL`,
    )
    .get(accountId, creatorId) as unknown as { sealed: string | null } | undefined;
  if (!row?.sealed) return null;
  return decryptToken(row.sealed);
}

/** Record that a delivery actually used this grant. */
export function markAccountUsed(
  db: DatabaseSync,
  accountId: string,
  creatorId: string,
  nowMs: number = Date.now(),
): void {
  db.prepare('UPDATE cloud_accounts SET last_used_at = ? WHERE account_id = ? AND creator_id = ?')
    .run(nowMs, accountId, creatorId);
}
