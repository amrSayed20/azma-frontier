/**
 * AZMA OS — AUTHENTICATION FOUNDATION
 * Password Hashing
 *
 * Uses Node's built-in crypto.scrypt (no new dependency, mirroring the
 * same "prefer a built-in over an external package" discipline already
 * applied to Persistent Storage's use of node:sqlite). Each password is
 * hashed with a fresh, random per-user salt; verification uses a
 * constant-time comparison to resist timing attacks.
 */

import { randomBytes, scrypt, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);
const KEY_LENGTH = 64;

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  return `${salt}:${derivedKey.toString('hex')}`;
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
  const [salt, hashHex] = stored.split(':');
  if (!salt || !hashHex) return false;

  const derivedKey = (await scryptAsync(password, salt, KEY_LENGTH)) as Buffer;
  const storedKey = Buffer.from(hashHex, 'hex');
  if (derivedKey.length !== storedKey.length) return false;

  return timingSafeEqual(derivedKey, storedKey);
}
