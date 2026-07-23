import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../db';
import { createSession, getActiveSession, deleteSession } from '../session-repository';

describe('Persistent Storage Foundation — Session records', () => {
  let db: DatabaseSync;

  beforeEach(() => {
    db = createDatabase(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  it('creates a session and reads it back while still active', () => {
    const created = createSession(db, 'session-1', 'creator-1', 60_000);
    const fetched = getActiveSession(db, 'session-1', created.createdAt + 1_000);
    expect(fetched).toEqual(created);
  });

  it('honestly returns null for an expired session', () => {
    const created = createSession(db, 'session-2', 'creator-1', 1_000);
    const fetched = getActiveSession(db, 'session-2', created.createdAt + 2_000);
    expect(fetched).toBeNull();
  });

  it('returns null for a session that never existed', () => {
    expect(getActiveSession(db, 'no-such-session')).toBeNull();
  });

  it('deletes a session so it is no longer active', () => {
    createSession(db, 'session-3', 'creator-1', 60_000);
    deleteSession(db, 'session-3');
    expect(getActiveSession(db, 'session-3')).toBeNull();
  });
});
