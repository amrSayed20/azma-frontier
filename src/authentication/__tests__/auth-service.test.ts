import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../../persistent-storage/db';

let testDb: DatabaseSync;

jest.mock('../../persistent-storage', () => {
  const actual = jest.requireActual('../../persistent-storage');
  return { ...actual, getDb: jest.fn(() => testDb) };
});

import { getCreatorByEmail } from '../../persistent-storage';
import { signUp, logIn, logOut, verifySession } from '../auth-service';

describe('Authentication Foundation — Auth Service', () => {
  beforeEach(() => {
    testDb = createDatabase(':memory:');
  });

  afterEach(() => {
    testDb.close();
  });

  it('signs up a new Creator, hashing the password and issuing a real session', async () => {
    const outcome = await signUp('creator@example.com', 'a-strong-password', 'Creator One');
    expect(outcome.status).toBe('succeeded');
    if (outcome.status === 'succeeded') {
      expect(outcome.result.role).toBe('creator');
      expect(outcome.result.sessionId).toMatch(/^[0-9a-f]{64}$/);

      const verified = verifySession(outcome.result.sessionId);
      expect(verified).toEqual({ creatorId: outcome.result.creatorId, role: 'creator' });
    }
  });

  it('rejects sign-up with an invalid email', async () => {
    const outcome = await signUp('not-an-email', 'a-strong-password');
    expect(outcome).toEqual(expect.objectContaining({ status: 'failed', reason: 'invalid-input' }));
  });

  it('rejects sign-up with a too-short password', async () => {
    const outcome = await signUp('creator2@example.com', 'short');
    expect(outcome).toEqual(expect.objectContaining({ status: 'failed', reason: 'invalid-input' }));
  });

  it('rejects sign-up when the email is already registered', async () => {
    await signUp('dup@example.com', 'a-strong-password');
    const second = await signUp('dup@example.com', 'another-password');
    expect(second).toEqual(expect.objectContaining({ status: 'failed', reason: 'email-taken' }));
  });

  it('never stores the password in plaintext in the durable record', async () => {
    await signUp('plain@example.com', 'a-strong-password');
    const creator = getCreatorByEmail(testDb, 'plain@example.com');
    expect(creator?.passwordHash).not.toBe('a-strong-password');
    expect(creator?.passwordHash).toContain(':');
  });

  it('logs in with correct credentials and issues a new session', async () => {
    await signUp('login@example.com', 'a-strong-password');
    const outcome = await logIn('login@example.com', 'a-strong-password');
    expect(outcome.status).toBe('succeeded');
  });

  it('rejects login with the wrong password, honestly', async () => {
    await signUp('wrongpass@example.com', 'a-strong-password');
    const outcome = await logIn('wrongpass@example.com', 'incorrect-password');
    expect(outcome).toEqual(expect.objectContaining({ status: 'failed', reason: 'invalid-credentials' }));
  });

  it('rejects login for an email that was never registered, without revealing that distinction', async () => {
    const outcome = await logIn('nobody@example.com', 'whatever-password');
    expect(outcome).toEqual(expect.objectContaining({ status: 'failed', reason: 'invalid-credentials' }));
  });

  it('logs out by invalidating the session — verifySession then honestly returns null', async () => {
    const signedUp = await signUp('logout@example.com', 'a-strong-password');
    if (signedUp.status !== 'succeeded') throw new Error('setup failed');

    logOut(signedUp.result.sessionId);
    expect(verifySession(signedUp.result.sessionId)).toBeNull();
  });

  it('returns null for a session that never existed', () => {
    expect(verifySession('not-a-real-session-id')).toBeNull();
  });
});
