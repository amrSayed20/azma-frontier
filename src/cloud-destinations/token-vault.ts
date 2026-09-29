/**
 * AZMA OS — A CREATOR'S REFRESH TOKEN, HELD IN TRUST
 *
 * ─── WHY THIS IS NOT `password-hashing.ts` ──────────────────────────────────
 *
 *   The Empire already keeps one kind of secret: a password, hashed with
 *   scrypt, one-way, never recoverable — which is exactly right, because the
 *   Empire never needs to KNOW a password, only to recognise one.
 *
 *   A refresh token is the opposite. The Empire must be able to read it back,
 *   months later, to upload a file to the Creator's own Drive on their behalf.
 *   A one-way hash cannot hold it, and plaintext in a database column is a
 *   standing invitation: anyone who reads one backup reads every Creator's
 *   access to their own cloud.
 *
 *   So it is ENCRYPTED, reversibly, with AES-256-GCM — authenticated, so a
 *   tampered ciphertext fails loudly instead of decrypting into nonsense — and
 *   the key lives only in the server's environment, never in this repository,
 *   never in a build, never in a log.
 *
 * ─── WHAT A MISSING KEY MEANS ───────────────────────────────────────────────
 *
 *   `isTokenVaultConfigured()` is false and every write REFUSES. It does not
 *   fall back to plaintext «for now», because a temporary plaintext store is a
 *   permanent one the moment it works. A Creator is told the Empire is not yet
 *   able to hold their account, which is true, rather than being quietly given
 *   a weaker promise than the one they were shown.
 *
 * ─── AND WHAT IS NEVER DONE HERE ────────────────────────────────────────────
 *
 *   No token is ever returned to a browser, written to a log, or placed in an
 *   error message. `decryptToken` exists for one caller — the uploader — and
 *   what it returns never leaves the server process.
 */

import { createCipheriv, createDecipheriv, randomBytes, createHash } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_BYTES = 12;
const TAG_BYTES = 16;

/**
 * The key, derived from the server's own secret.
 *
 * Read at CALL time, never frozen into a module constant: that form has caused
 * three separate production defects in this repository, and the lesson written
 * beside each of them is that the const form is a latent bug by construction.
 */
function key(): Buffer | null {
  const secret = process.env.AZMA_TOKEN_KEY;
  if (!secret || secret.length < 32) return null;
  // SHA-256 of the secret gives exactly the 32 bytes AES-256 requires, from a
  // secret of any length the Founder chooses to set.
  return createHash('sha256').update(secret).digest();
}

/** Whether the Empire is presently able to hold a Creator's account at all. */
export function isTokenVaultConfigured(): boolean {
  return key() !== null;
}

export class TokenVaultUnavailable extends Error {
  constructor() {
    super('AZMA_TOKEN_KEY is not set — the Empire cannot hold a Creator token');
    this.name = 'TokenVaultUnavailable';
  }
}

/**
 * Seal a token for storage. The result is `iv.tag.ciphertext`, base64url.
 *
 * A fresh IV every time, so sealing the same token twice never produces the
 * same bytes — two Creators who linked the same account must not be
 * identifiable as such by comparing two rows.
 */
export function encryptToken(plaintext: string): string {
  const k = key();
  if (!k) throw new TokenVaultUnavailable();
  const iv = randomBytes(IV_BYTES);
  const cipher = createCipheriv(ALGORITHM, k, iv);
  const sealed = Buffer.concat([cipher.update(plaintext, 'utf8'), cipher.final()]);
  const tag = cipher.getAuthTag();
  return [iv.toString('base64url'), tag.toString('base64url'), sealed.toString('base64url')].join('.');
}

/**
 * Open a sealed token, or return null.
 *
 * Null for a malformed record, a tampered one, or one sealed under a different
 * key — all three are «this token cannot be used», and none of them is an
 * exception worth crashing an upload over. The caller re-asks the Creator to
 * link their account, which is the only honest remedy.
 */
export function decryptToken(sealed: string): string | null {
  const k = key();
  if (!k) return null;
  const parts = sealed.split('.');
  if (parts.length !== 3) return null;
  try {
    const iv = Buffer.from(parts[0], 'base64url');
    const tag = Buffer.from(parts[1], 'base64url');
    const body = Buffer.from(parts[2], 'base64url');
    if (iv.length !== IV_BYTES || tag.length !== TAG_BYTES) return null;
    const decipher = createDecipheriv(ALGORITHM, k, iv);
    decipher.setAuthTag(tag);
    return Buffer.concat([decipher.update(body), decipher.final()]).toString('utf8');
  } catch {
    // An authentication failure lands here. It means the bytes are not what
    // this Empire sealed, and that is all a caller is ever told.
    return null;
  }
}
