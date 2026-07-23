import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../../persistent-storage/db';

let testDb: DatabaseSync;

jest.mock('../../persistent-storage', () => {
  const actual = jest.requireActual('../../persistent-storage');
  return { ...actual, getDb: jest.fn(() => testDb) };
});

import { getCreatorByEmail } from '../../persistent-storage';
import { ensureFounderAccountExists } from '../founder-bootstrap';
import { verifyPassword } from '../password-hashing';

describe('Authentication Foundation — Founder Bootstrap', () => {
  const originalEmail = process.env.FOUNDER_EMAIL;
  const originalPassword = process.env.FOUNDER_PASSWORD;

  beforeEach(() => {
    testDb = createDatabase(':memory:');
  });

  afterEach(() => {
    testDb.close();
    process.env.FOUNDER_EMAIL = originalEmail;
    process.env.FOUNDER_PASSWORD = originalPassword;
  });

  it('does nothing when no Founder is configured', async () => {
    delete process.env.FOUNDER_EMAIL;
    delete process.env.FOUNDER_PASSWORD;
    await expect(ensureFounderAccountExists()).resolves.not.toThrow();
  });

  it('creates a Founder account with role=founder from environment configuration', async () => {
    process.env.FOUNDER_EMAIL = 'founder@example.com';
    process.env.FOUNDER_PASSWORD = 'a-strong-founder-password';

    await ensureFounderAccountExists();

    const founder = getCreatorByEmail(testDb, 'founder@example.com');
    expect(founder?.role).toBe('founder');
    expect(founder?.passwordHash).toBeTruthy();
    expect(await verifyPassword('a-strong-founder-password', founder!.passwordHash!)).toBe(true);
  });

  it('is idempotent — calling it twice does not throw or duplicate', async () => {
    process.env.FOUNDER_EMAIL = 'founder2@example.com';
    process.env.FOUNDER_PASSWORD = 'a-strong-founder-password';

    await ensureFounderAccountExists();
    await expect(ensureFounderAccountExists()).resolves.not.toThrow();

    const founder = getCreatorByEmail(testDb, 'founder2@example.com');
    expect(founder).not.toBeNull();
  });
});
