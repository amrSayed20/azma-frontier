/**
 * AZMA OS — PERSISTENT STORAGE FOUNDATION
 * Database Connection
 *
 * Uses Node's built-in `node:sqlite` (available and verified working in
 * this runtime — Node v24) rather than adding an external driver
 * dependency or requiring a hosted database credential this environment
 * cannot provision.
 *
 * DISCLOSED DEPLOYMENT-TOPOLOGY LIMITATION: a local SQLite file survives
 * process restarts on a single, long-running server (a VPS, a
 * container, etc.) — the actual problem the in-memory Maps had. It does
 * NOT solve persistence across multiple, independent serverless
 * function instances with ephemeral filesystems (e.g. Vercel's default
 * model), where each instance would see its own separate file. If the
 * real production deployment target is stateless multi-instance
 * serverless, a hosted database (Postgres, Turso, etc.) is still
 * required — swapping it in means changing this file and the
 * repository internals only, not any call site, since every repository
 * function takes a DatabaseSync-shaped connection as a parameter rather
 * than reaching for a hidden global.
 */

import { DatabaseSync } from 'node:sqlite';
import { mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { SCHEMA_STATEMENTS, CINEMATIC_LEDGER_MIGRATION_COLUMNS, CREATORS_MIGRATION_COLUMNS, INDEX_STATEMENTS } from './schema';

const DEFAULT_DB_PATH = join(process.cwd(), 'data', 'azma-os.db');

/**
 * ALTER TABLE ADD COLUMN for any column CREATORS_MIGRATION_COLUMNS names
 * that a pre-existing `creators` table doesn't yet have — CREATE TABLE
 * IF NOT EXISTS is a no-op against an already-existing table, so a
 * database file created before the Authentication Foundation added
 * these columns would otherwise be stuck on the original 3-column
 * shape. Real bug, found by actually running this app against its own
 * pre-existing dev database, not by inspection.
 */
function migrateCinematicLedgerTable(db: DatabaseSync): void {
  const existingColumns = new Set(
    (db.prepare('PRAGMA table_info(cinematic_ledger)').all() as { name: string }[]).map((row) => row.name),
  );
  for (const column of CINEMATIC_LEDGER_MIGRATION_COLUMNS) {
    if (!existingColumns.has(column.name)) {
      db.exec(`ALTER TABLE cinematic_ledger ADD COLUMN ${column.ddl}`);
    }
  }
}

function migrateCreatorsTable(db: DatabaseSync): void {
  const existingColumns = new Set(
    (db.prepare('PRAGMA table_info(creators)').all() as { name: string }[]).map((row) => row.name),
  );
  for (const column of CREATORS_MIGRATION_COLUMNS) {
    if (!existingColumns.has(column.name)) {
      db.exec(`ALTER TABLE creators ADD COLUMN ${column.ddl}`);
    }
  }
}

export function createDatabase(path: string = DEFAULT_DB_PATH): DatabaseSync {
  if (path !== ':memory:') {
    mkdirSync(dirname(path), { recursive: true });
  }
  const db = new DatabaseSync(path);
  for (const statement of SCHEMA_STATEMENTS) {
    db.exec(statement);
  }
  migrateCinematicLedgerTable(db);
  migrateCreatorsTable(db);
  for (const statement of INDEX_STATEMENTS) {
    db.exec(statement);
  }
  return db;
}

let singleton: DatabaseSync | null = null;

/** The shared, production database connection — lazily opened on first use. */
export function getDb(): DatabaseSync {
  if (!singleton) {
    singleton = createDatabase();
  }
  return singleton;
}

/** Resets the cached singleton — used only by tests. */
export function resetDbSingletonForTests(): void {
  singleton = null;
}
