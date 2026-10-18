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
import { SCHEMA_STATEMENTS, GENERATION_RECORDS_MIGRATION_COLUMNS, CINEMATIC_LEDGER_MIGRATION_COLUMNS, CREATORS_MIGRATION_COLUMNS, GOALS_MIGRATION_COLUMNS, PAYMENT_TRANSACTIONS_MIGRATION_COLUMNS, INDEX_STATEMENTS } from './schema';
// Economy Foundation: no migration columns needed for new tables — they are
// created fresh via CREATE TABLE IF NOT EXISTS in SCHEMA_STATEMENTS.

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

function migrateGoalsTable(db: DatabaseSync): void {
  const existingColumns = new Set(
    (db.prepare('PRAGMA table_info(goals)').all() as { name: string }[]).map((row) => row.name),
  );
  for (const column of GOALS_MIGRATION_COLUMNS) {
    if (!existingColumns.has(column.name)) {
      db.exec(`ALTER TABLE goals ADD COLUMN ${column.ddl}`);
    }
  }
}

function migrateGenerationRecordsTable(db: DatabaseSync): void {
  const existingColumns = new Set(
    (db.prepare('PRAGMA table_info(generation_records)').all() as { name: string }[]).map((row) => row.name),
  );
  for (const column of GENERATION_RECORDS_MIGRATION_COLUMNS) {
    if (!existingColumns.has(column.name)) {
      db.exec(`ALTER TABLE generation_records ADD COLUMN ${column.ddl}`);
    }
  }
}

function migratePaymentTransactionsTable(db: DatabaseSync): void {
  const existingColumns = new Set(
    (db.prepare('PRAGMA table_info(payment_transactions)').all() as { name: string }[]).map((row) => row.name),
  );
  for (const column of PAYMENT_TRANSACTIONS_MIGRATION_COLUMNS) {
    if (!existingColumns.has(column.name)) {
      db.exec(`ALTER TABLE payment_transactions ADD COLUMN ${column.ddl}`);
    }
  }
}

/**
 * Rebuilds a `sovereign_canvases` table created with the old key
 * (canvas_id alone) onto the key (subscriber_tenant_id, canvas_id),
 * copying every row. Under the old key two creators could never hold
 * the same canvas id, so the copy cannot collide. Runs once: a table
 * already on the composite key is left alone.
 */
function migrateSovereignCanvasesKey(db: DatabaseSync): void {
  const keyColumns = (db.prepare('PRAGMA table_info(sovereign_canvases)').all() as { name: string; pk: number }[])
    .filter((column) => column.pk > 0)
    .map((column) => column.name);
  if (keyColumns.length !== 1 || keyColumns[0] !== 'canvas_id') return;
  db.exec('BEGIN IMMEDIATE');
  try {
    db.exec(`CREATE TABLE sovereign_canvases_rekeyed (
      canvas_id TEXT NOT NULL,
      subscriber_tenant_id TEXT NOT NULL,
      title TEXT NOT NULL,
      canvas_type TEXT NOT NULL,
      canvas_json TEXT NOT NULL,
      saved_at INTEGER NOT NULL,
      PRIMARY KEY (subscriber_tenant_id, canvas_id)
    )`);
    db.exec(`INSERT INTO sovereign_canvases_rekeyed
      (canvas_id, subscriber_tenant_id, title, canvas_type, canvas_json, saved_at)
      SELECT canvas_id, subscriber_tenant_id, title, canvas_type, canvas_json, saved_at FROM sovereign_canvases`);
    db.exec('DROP TABLE sovereign_canvases');
    db.exec('ALTER TABLE sovereign_canvases_rekeyed RENAME TO sovereign_canvases');
    db.exec('COMMIT');
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

export function createDatabase(path: string = DEFAULT_DB_PATH): DatabaseSync {
  if (path !== ':memory:') {
    mkdirSync(dirname(path), { recursive: true });
  }
  const db = new DatabaseSync(path);
  // Wait for a concurrent writer (another worker of `next build`, or a
  // second request) instead of failing at once with "database is locked".
  db.exec('PRAGMA busy_timeout=5000;');
  if (path !== ':memory:') {
    db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;');
  }
  for (const statement of SCHEMA_STATEMENTS) {
    db.exec(statement);
  }
  migrateCinematicLedgerTable(db);
  migrateCreatorsTable(db);
  migrateGoalsTable(db);
  migrateGenerationRecordsTable(db);
  migrateSovereignCanvasesKey(db);
  migratePaymentTransactionsTable(db);
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
