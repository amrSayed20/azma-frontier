import type { DatabaseSync } from 'node:sqlite';
import { join } from 'path';
import { tmpdir } from 'os';
import { unlinkSync } from 'fs';
import { createDatabase } from '../db';
import { createCreator, getCreator, getCreatorByEmail } from '../creator-repository';

describe('Persistent Storage Foundation — Creator records', () => {
  let db: DatabaseSync;

  beforeEach(() => {
    db = createDatabase(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  it('creates and reads back a Creator record', () => {
    const created = createCreator(db, { creatorId: 'creator-1', displayName: 'Founder' });
    expect(created.creatorId).toBe('creator-1');
    expect(created.displayName).toBe('Founder');
    expect(created.role).toBe('creator');

    const fetched = getCreator(db, 'creator-1');
    expect(fetched).toEqual(created);
  });

  it('defaults displayName, email, and passwordHash to null, and role to creator, when not supplied', () => {
    const created = createCreator(db, { creatorId: 'creator-2' });
    expect(created.displayName).toBeNull();
    expect(created.email).toBeNull();
    expect(created.passwordHash).toBeNull();
    expect(created.role).toBe('creator');
  });

  it('stores and reads back email, passwordHash, and an explicit role', () => {
    const created = createCreator(db, {
      creatorId: 'creator-3', email: 'founder@example.com', passwordHash: 'salt:hash', role: 'founder',
    });
    expect(created.role).toBe('founder');

    const byEmail = getCreatorByEmail(db, 'founder@example.com');
    expect(byEmail).toEqual(created);
  });

  it('returns null for a Creator that does not exist, by id or by email', () => {
    expect(getCreator(db, 'no-such-creator')).toBeNull();
    expect(getCreatorByEmail(db, 'no-such@example.com')).toBeNull();
  });

  it('survives a fresh connection to the same file, proving real durability', () => {
    const path = join(tmpdir(), `azma-test-creators-${Date.now()}.db`);
    const first = createDatabase(path);
    createCreator(first, { creatorId: 'durable-creator', displayName: 'Durable' });
    first.close();

    const second = createDatabase(path);
    const fetched = getCreator(second, 'durable-creator');
    expect(fetched?.displayName).toBe('Durable');
    second.close();
    unlinkSync(path);
  });
});
