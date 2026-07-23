/**
 * AZMA OS — AUTHENTICATION FOUNDATION
 * Session Tokens
 *
 * Opaque, cryptographically random session identifiers — stored
 * server-side (Persistent Storage Foundation's own sessions table),
 * never a self-contained JWT. This is deliberate: an opaque token has
 * no embedded secret to leak and is immediately revocable by deleting
 * its server-side record, unlike a signed JWT that remains valid until
 * expiry regardless of server-side state.
 */

import { randomBytes } from 'crypto';

export function generateSessionId(): string {
  return randomBytes(32).toString('hex');
}
