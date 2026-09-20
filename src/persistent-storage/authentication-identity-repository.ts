import { randomUUID } from 'crypto';
import type { DatabaseSync } from 'node:sqlite';
import {
  VerificationState,
  IdentityResolution,
  verificationStateOf,
  type ProviderId,
  type VerifiedIdentity,
} from '../identity/sovereign-identity-contract';

/**
 * AZMA OS — The only place a verification state is written.
 *
 * ─── THE ONE RULE THIS FILE EXISTS TO ENFORCE ───────────────────────────────
 *
 *   An account becomes VERIFIED in exactly one way: a provider binding verified
 *   an assertion SERVER-SIDE and handed a `VerifiedIdentity` to this module.
 *
 *   There is no function here that takes a verification state as an argument.
 *   That is deliberate and it is the whole design: if no function accepts one,
 *   no route can forward one, and no request body can reach one. A field the
 *   client could set would have to travel through a parameter that does not
 *   exist.
 */

export interface AuthenticationIdentityRecord {
  readonly identityId: string;
  readonly creatorId: string;
  readonly provider: ProviderId;
  readonly providerSubject: string;
  readonly providerEmail: string | null;
  readonly linkedAt: number;
  readonly lastAuthenticatedAt: number | null;
}

const COLUMNS =
  'identity_id, creator_id, provider, provider_subject, provider_email, linked_at, last_authenticated_at';

function rowToIdentity(row: Record<string, unknown>): AuthenticationIdentityRecord {
  return {
    identityId: row.identity_id as string,
    creatorId: row.creator_id as string,
    provider: row.provider as ProviderId,
    providerSubject: row.provider_subject as string,
    providerEmail: (row.provider_email as string | null) ?? null,
    linkedAt: row.linked_at as number,
    lastAuthenticatedAt: (row.last_authenticated_at as number | null) ?? null,
  };
}

/** Find the binding for a provider's permanent subject id. */
export function findIdentityByProviderSubject(
  db: DatabaseSync,
  provider: ProviderId,
  providerSubject: string,
): AuthenticationIdentityRecord | null {
  const row = db
    .prepare(`SELECT ${COLUMNS} FROM authentication_identities WHERE provider = ? AND provider_subject = ?`)
    .get(provider, providerSubject);
  return row ? rowToIdentity(row as Record<string, unknown>) : null;
}

/** Every provider binding an account holds. */
export function listIdentitiesForCreator(
  db: DatabaseSync,
  creatorId: string,
): readonly AuthenticationIdentityRecord[] {
  const rows = db
    .prepare(`SELECT ${COLUMNS} FROM authentication_identities WHERE creator_id = ? ORDER BY linked_at`)
    .all(creatorId);
  return rows.map((r) => rowToIdentity(r as Record<string, unknown>));
}

/**
 * Read an account's verification state.
 *
 * Goes through `verificationStateOf`, so a row written before the column
 * existed — or one carrying anything unexpected — reads as UNVERIFIED rather
 * than as whatever happens to be in the cell.
 */
export function verificationStateForCreator(db: DatabaseSync, creatorId: string): VerificationState {
  const row = db
    .prepare('SELECT verification_state FROM creators WHERE creator_id = ?')
    .get(creatorId) as { verification_state?: unknown } | undefined;
  if (!row) return VerificationState.UNVERIFIED;
  return verificationStateOf(row.verification_state);
}

/**
 * Bind a verified provider identity to an AZMA account and record the proof.
 *
 * Takes a `VerifiedIdentity` — a value only a provider binding can construct
 * after a server-side check — and nothing else. There is no parameter for the
 * resulting state because there is no decision left to make: reaching this
 * function IS the verification.
 *
 * Both writes happen in one transaction. A binding without the state, or a
 * state without the binding, is a half-verified account, and a half-verified
 * account is the thing an attacker looks for.
 */
export function linkVerifiedIdentity(
  db: DatabaseSync,
  creatorId: string,
  identity: VerifiedIdentity,
  nowMs: number = Date.now(),
): AuthenticationIdentityRecord {
  const record: AuthenticationIdentityRecord = {
    identityId: `authid_${randomUUID()}`,
    creatorId,
    provider: identity.provider,
    providerSubject: identity.providerSubject,
    providerEmail: identity.email,
    linkedAt: nowMs,
    lastAuthenticatedAt: nowMs,
  };

  db.exec('BEGIN');
  try {
    db.prepare(
      `INSERT INTO authentication_identities (${COLUMNS}) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ).run(
      record.identityId, record.creatorId, record.provider, record.providerSubject,
      record.providerEmail, record.linkedAt, record.lastAuthenticatedAt,
    );
    db.prepare(
      'UPDATE creators SET verification_state = ?, verified_at = ?, verified_via_provider = ? WHERE creator_id = ?',
    ).run(VerificationState.VERIFIED, nowMs, identity.provider, creatorId);
    db.exec('COMMIT');
  } catch (err) {
    db.exec('ROLLBACK');
    throw err;
  }

  return record;
}

/** Record that an existing binding was used again. Never changes state. */
export function touchIdentity(db: DatabaseSync, identityId: string, nowMs: number = Date.now()): void {
  db.prepare('UPDATE authentication_identities SET last_authenticated_at = ? WHERE identity_id = ?')
    .run(nowMs, identityId);
}

/**
 * Decide what a verified identity means for the accounts that already exist.
 *
 * A pure read: it decides nothing and writes nothing, so the caller must act on
 * the answer in the open rather than have an account quietly appear inside a
 * lookup.
 */
export function resolveIdentity(
  db: DatabaseSync,
  identity: VerifiedIdentity,
): { resolution: IdentityResolution; creatorId: string | null } {
  const bound = findIdentityByProviderSubject(db, identity.provider, identity.providerSubject);
  if (bound) {
    return { resolution: IdentityResolution.EXISTING_BINDING, creatorId: bound.creatorId };
  }

  const byEmail = db
    .prepare('SELECT creator_id FROM creators WHERE email = ?')
    .get(identity.email) as { creator_id?: unknown } | undefined;

  if (byEmail && typeof byEmail.creator_id === 'string') {
    // An account already holds this address, and this provider subject is not
    // bound to anything. NOT claimed, NOT duplicated — see the enum's note. The
    // takeover this prevents is real: Google can reassign a workspace address to
    // a different human, and that human would otherwise inherit the first one's
    // entire Vault by signing in.
    return { resolution: IdentityResolution.EMAIL_EXISTS_UNLINKED, creatorId: byEmail.creator_id };
  }

  return { resolution: IdentityResolution.NEW_ACCOUNT, creatorId: null };
}
