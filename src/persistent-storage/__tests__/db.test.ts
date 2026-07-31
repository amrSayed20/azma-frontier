import { DatabaseSync } from 'node:sqlite';
import { join } from 'path';
import { tmpdir } from 'os';
import { unlinkSync } from 'fs';
import { createDatabase, getDb, resetDbSingletonForTests } from '../db';

describe('Persistent Storage Foundation — database connection', () => {
  afterEach(() => {
    resetDbSingletonForTests();
  });

  it('applies the full schema to a freshly created database', () => {
    const db = createDatabase(':memory:');
    const tables = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' ORDER BY name")
      .all()
      .map((row) => row.name);

    expect(tables).toEqual(['cinematic_ledger', 'creators', 'fulfillment_assessments', 'generation_records', 'goals', 'observations', 'operation_ledger', 'sessions', 'sovereign_canvases', 'subscriptions', 'vault_assets']);
    db.close();
  });

  it('is idempotent — creating against the same in-memory schema statements twice does not throw', () => {
    expect(() => {
      const db = createDatabase(':memory:');
      db.close();
    }).not.toThrow();
  });

  it('getDb() returns the same cached instance across calls', () => {
    const first = getDb();
    const second = getDb();
    expect(first).toBe(second);
  });

  it('migrates a pre-existing goals table that predates sovereign_purpose_statement (Package II column)', () => {
    const path = join(tmpdir(), `azma-test-legacy-goals-${Date.now()}.db`);

    // Simulate a database created after Ministry IX but before Package II.
    const legacy = new DatabaseSync(path);
    legacy.exec(`CREATE TABLE goals (
      goal_id TEXT PRIMARY KEY,
      subscriber_tenant_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      priority TEXT NOT NULL,
      status TEXT NOT NULL,
      dependencies_json TEXT NOT NULL,
      metrics_json TEXT NOT NULL,
      commercial_intent_json TEXT,
      pacing_preference TEXT,
      transition_preference TEXT,
      created_at_ms INTEGER NOT NULL,
      updated_at_ms INTEGER NOT NULL
    )`);
    legacy.prepare('INSERT INTO goals VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)').run(
      'g-1', 'tenant-1', 'Old Goal', 'desc', 'HIGH', 'CREATED', '[]', '[]', null, null, null, 1000, 1000,
    );
    legacy.close();

    const migrated = createDatabase(path);
    const columns = (migrated.prepare('PRAGMA table_info(goals)').all() as { name: string }[]).map((r) => r.name);
    expect(columns).toEqual(expect.arrayContaining(['goal_id', 'sovereign_purpose_statement']));

    // Pre-existing row reads back with null (no purpose snapshot yet)
    const row = migrated.prepare('SELECT sovereign_purpose_statement FROM goals WHERE goal_id = ?').get('g-1') as { sovereign_purpose_statement: string | null };
    expect(row.sovereign_purpose_statement).toBeNull();

    migrated.close();
    unlinkSync(path);
  });

  it('migrates a pre-existing database whose creators table predates email/password_hash/role — the real bug found by running the app', () => {
    const path = join(tmpdir(), `azma-test-legacy-creators-${Date.now()}.db`);

    // Simulate a database created by an earlier version of this schema, before Authentication existed.
    const legacy = new DatabaseSync(path);
    legacy.exec('CREATE TABLE creators (creator_id TEXT PRIMARY KEY, display_name TEXT, created_at INTEGER NOT NULL)');
    legacy.prepare('INSERT INTO creators (creator_id, display_name, created_at) VALUES (?, ?, ?)').run('legacy-1', 'Legacy Row', 111);
    legacy.close();

    // Opening it through createDatabase() must migrate it in place, not throw "no such column: email".
    const migrated = createDatabase(path);
    const columns = (migrated.prepare('PRAGMA table_info(creators)').all() as { name: string }[]).map((row) => row.name);
    expect(columns).toEqual(expect.arrayContaining(['creator_id', 'display_name', 'created_at', 'email', 'password_hash', 'role', 'sovereign_purpose', 'sovereign_purpose_created_at', 'sovereign_purpose_updated_at']));

    const legacyRow = migrated.prepare('SELECT * FROM creators WHERE creator_id = ?').get('legacy-1');
    expect(legacyRow?.display_name).toBe('Legacy Row');
    expect(legacyRow?.role).toBe('creator');
    expect(legacyRow?.email).toBeNull();

    // The unique index must also be in place after migration.
    migrated.prepare('INSERT INTO creators (creator_id, email, created_at) VALUES (?, ?, ?)').run('legacy-2', 'unique@example.com', 222);
    expect(() => {
      migrated.prepare('INSERT INTO creators (creator_id, email, created_at) VALUES (?, ?, ?)').run('legacy-3', 'unique@example.com', 333);
    }).toThrow();

    migrated.close();
    unlinkSync(path);
  });
});
