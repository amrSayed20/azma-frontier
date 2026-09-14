/**
 * AZMA OS — VAULT BIOMETRIC CREDENTIALS
 *
 * Persistence for the devices a Creator has enrolled to open the Vault with
 * their own fingerprint or face.
 *
 * What is stored is a public key and a counter. The fingerprint or face never
 * leaves the Creator's device, is never transmitted, and is never held here —
 * the device performs the match locally and signs a challenge to prove it. A
 * copy of this table therefore discloses no biometric of anyone.
 */

import type { DatabaseSync } from 'node:sqlite';

export interface VaultCredential {
  readonly credentialId: string;
  readonly creatorId: string;
  /** Base64URL-encoded COSE public key. */
  readonly publicKey: string;
  /** Signature counter last seen from this authenticator; a value that fails
      to advance is the signal of a cloned device. */
  readonly counter: number;
  readonly transports: string[];
  readonly deviceLabel: string | null;
  readonly createdAt: number;
  readonly lastUsedAt: number | null;
}

interface CredentialRow {
  credential_id: string;
  creator_id: string;
  public_key: string;
  counter: number;
  transports: string | null;
  device_label: string | null;
  created_at: number;
  last_used_at: number | null;
}

function toCredential(raw: unknown): VaultCredential {
  const row = raw as CredentialRow;
  return {
    credentialId: row.credential_id,
    creatorId: row.creator_id,
    publicKey: row.public_key,
    counter: row.counter,
    transports: row.transports ? (JSON.parse(row.transports) as string[]) : [],
    deviceLabel: row.device_label,
    createdAt: row.created_at,
    lastUsedAt: row.last_used_at,
  };
}

export function listVaultCredentials(db: DatabaseSync, creatorId: string): VaultCredential[] {
  const rows = db
    .prepare('SELECT * FROM vault_credentials WHERE creator_id = ? ORDER BY created_at DESC')
    .all(creatorId);
  return rows.map(toCredential);
}

export function getVaultCredential(db: DatabaseSync, credentialId: string): VaultCredential | null {
  const row = db
    .prepare('SELECT * FROM vault_credentials WHERE credential_id = ?')
    .get(credentialId);
  return row ? toCredential(row) : null;
}

export function saveVaultCredential(
  db: DatabaseSync,
  credential: Omit<VaultCredential, 'lastUsedAt'>,
): void {
  db.prepare(
    `INSERT INTO vault_credentials
       (credential_id, creator_id, public_key, counter, transports, device_label, created_at, last_used_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, NULL)`,
  ).run(
    credential.credentialId,
    credential.creatorId,
    credential.publicKey,
    credential.counter,
    JSON.stringify(credential.transports),
    credential.deviceLabel,
    credential.createdAt,
  );
}

/** Advances the counter after a successful assertion and records the moment. */
export function recordVaultCredentialUse(
  db: DatabaseSync,
  credentialId: string,
  counter: number,
  now: number = Date.now(),
): void {
  db.prepare('UPDATE vault_credentials SET counter = ?, last_used_at = ? WHERE credential_id = ?')
    .run(counter, now, credentialId);
}

/** A Creator removing a device they no longer trust or no longer own. */
export function deleteVaultCredential(db: DatabaseSync, credentialId: string, creatorId: string): boolean {
  const result = db
    .prepare('DELETE FROM vault_credentials WHERE credential_id = ? AND creator_id = ?')
    .run(credentialId, creatorId);
  return result.changes > 0;
}
