import type { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'crypto';
import { createDatabase } from '../../persistent-storage/db';

let testDb: DatabaseSync;

jest.mock('../../persistent-storage', () => {
  const actual = jest.requireActual('../../persistent-storage');
  return { ...actual, getDb: jest.fn(() => testDb) };
});

import { getCreatorByEmail, createCreator } from '../../persistent-storage';
import { logIn, logOut, verifySession } from '../auth-service';
import { hashPassword } from '../password-hashing';
import * as authService from '../auth-service';
import * as authModule from '../index';

/**
 * AZMA OS — Authentication, after the identity gate.
 *
 * ─── WHAT CHANGED IN THIS FILE, AND WHY ─────────────────────────────────────
 *
 *   These tests used to open with `signUp('creator@example.com', 'password')`
 *   and assert that an account and a session came back. That was an accurate
 *   description of the system and a description of the defect at the same time:
 *   an address nobody had verified became an account, and the session — the
 *   thing that grants access — was issued in the same breath.
 *
 *   `signUp` is gone. The tests that exercised it are replaced by tests that it
 *   is gone, because a removed hole and a hole nobody happens to call are the
 *   same thing until something asserts the difference.
 *
 *   The log-in tests remain, seeded directly, because log-in itself did not
 *   change: the accounts that predate the gate hold passwords and must keep
 *   their way in. They are UNVERIFIED and cannot subscribe until they verify —
 *   which is a separate gate, tested with the checkout route.
 */

/** Seed a legacy password account the way one actually exists in production. */
async function seedLegacyAccount(email: string, password: string) {
  return createCreator(testDb, {
    creatorId: randomUUID(),
    email,
    passwordHash: await hashPassword(password),
    role: 'creator',
    displayName: null,
  });
}

describe('Authentication Foundation — Auth Service', () => {
  beforeEach(() => {
    testDb = createDatabase(':memory:');
  });

  afterEach(() => {
    testDb.close();
  });

  describe('the email-only registration path no longer exists', () => {
    it('signUp is not exported from the auth service', () => {
      expect('signUp' in authService).toBe(false);
    });

    it('signUp is not exported from the authentication module either', () => {
      // The module index is where a future engineer would find it, so this is
      // the surface that actually matters.
      expect('signUp' in authModule).toBe(false);
    });

    it('the module surface is exactly this, and nothing on it registers anyone', () => {
      // Pinned deliberately: a new export here is a new way in, and this test
      // is meant to fail when one appears so it gets looked at.
      //
      // ensureFounderAccountExists is the one member that creates an account.
      // It reads FOUNDER_EMAIL and FOUNDER_PASSWORD from the server's own
      // environment and takes no argument at all, so nothing a client sends can
      // reach it — which is why it was never part of the defect.
      expect(Object.keys(authModule).sort()).toEqual([
        'ensureFounderAccountExists',
        'generateSessionId',
        'hashPassword',
        'logIn',
        'logOut',
        'verifyPassword',
        'verifySession',
      ]);
      expect(Object.keys(authModule)).not.toContain('signUp');
    });
  });

  describe('accounts that predate the gate keep their way in', () => {
    it('logs in with correct credentials and issues a real session', async () => {
      const creator = await seedLegacyAccount('login@example.com', 'a-strong-password');
      const outcome = await logIn('login@example.com', 'a-strong-password');

      expect(outcome.status).toBe('succeeded');
      if (outcome.status !== 'succeeded') return;
      expect(outcome.result.creatorId).toBe(creator.creatorId);
      expect(outcome.result.sessionId).toMatch(/^[0-9a-f]{64}$/);
      expect(verifySession(outcome.result.sessionId)).toEqual({
        creatorId: creator.creatorId,
        role: 'creator',
      });
    });

    it('rejects the wrong password, honestly', async () => {
      await seedLegacyAccount('wrongpass@example.com', 'a-strong-password');
      const outcome = await logIn('wrongpass@example.com', 'incorrect-password');
      expect(outcome).toEqual(expect.objectContaining({ status: 'failed', reason: 'invalid-credentials' }));
    });

    it('rejects an unknown address without revealing that it is unknown', async () => {
      await seedLegacyAccount('known@example.com', 'a-strong-password');
      const unknown = await logIn('nobody@example.com', 'whatever-password');
      const wrong = await logIn('known@example.com', 'whatever-password');
      // Identical answers: log-in must not become an account-enumeration oracle.
      expect(unknown).toEqual(wrong);
    });

    it('a Google-made account has no password to log in with', async () => {
      // identity-gate creates accounts with passwordHash NULL, so there is no
      // credential to guess, stuff, or reset through the address.
      createCreator(testDb, {
        creatorId: randomUUID(), email: 'google-made@example.com',
        passwordHash: null, role: 'creator', displayName: null,
      });
      const outcome = await logIn('google-made@example.com', 'any-password-at-all');
      expect(outcome).toEqual(expect.objectContaining({ status: 'failed', reason: 'invalid-credentials' }));
    });

    it('never stores a password in plaintext', async () => {
      await seedLegacyAccount('plain@example.com', 'a-strong-password');
      const creator = getCreatorByEmail(testDb, 'plain@example.com');
      expect(creator?.passwordHash).not.toBe('a-strong-password');
      expect(creator?.passwordHash).toContain(':');
    });

    it('rejects a malformed address before touching the database', async () => {
      const outcome = await logIn('not-an-email', 'a-strong-password');
      expect(outcome).toEqual(expect.objectContaining({ status: 'failed', reason: 'invalid-input' }));
    });
  });

  describe('sessions', () => {
    it('logs out by invalidating the session', async () => {
      await seedLegacyAccount('logout@example.com', 'a-strong-password');
      const outcome = await logIn('logout@example.com', 'a-strong-password');
      if (outcome.status !== 'succeeded') throw new Error('setup failed');

      logOut(outcome.result.sessionId);
      expect(verifySession(outcome.result.sessionId)).toBeNull();
    });

    it('returns null for a session that never existed', () => {
      expect(verifySession('not-a-real-session-id')).toBeNull();
    });

    it('returns null for a forged session id', () => {
      for (const forged of ['', 'x'.repeat(64), '../../etc/passwd', "' OR 1=1 --"]) {
        expect(verifySession(forged)).toBeNull();
      }
    });
  });
});
