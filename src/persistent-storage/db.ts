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
import { SCHEMA_STATEMENTS, GENERATION_RECORDS_MIGRATION_COLUMNS, CINEMATIC_LEDGER_MIGRATION_COLUMNS, CREATORS_MIGRATION_COLUMNS, GOALS_MIGRATION_COLUMNS, HADITH_NARRATIONS_MIGRATION_COLUMNS, STORYBOARD_SCENES_MIGRATION_COLUMNS, VAULT_ASSETS_MIGRATION_COLUMNS, INDEX_STATEMENTS } from './schema';
// Economy Foundation: no migration columns needed for new tables — they are
// created fresh via CREATE TABLE IF NOT EXISTS in SCHEMA_STATEMENTS.

/**
 * Where the database lives.
 *
 * `AZMA_DB_PATH` is honoured because the ingest scripts already honour it —
 * scripts/ingest-hadith.mjs, ingest-library.mjs and ingest-transmitted.mjs all
 * read it to decide which store they are filling. The application ignoring the
 * same variable was an inconsistency with a real cost: a test that wanted a
 * real database rather than a mock had no way to ask for an isolated one, and
 * silently wrote into the developer's own store instead. Measured — 73 rows of
 * test data in data/azma-os.db before this line existed.
 *
 * Production sets nothing and is unaffected: it runs from /root/azma-os, so the
 * cwd-relative default resolves exactly as it always did.
 */
function defaultDbPath(): string {
  // Read at call time, not at import time: a caller that sets the variable
  // before opening a connection must be obeyed, and a module-level constant
  // would have been frozen before it ever got the chance.
  return process.env.AZMA_DB_PATH ?? join(process.cwd(), 'data', 'azma-os.db');
}

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

/**
 * The visual half of a scene reaches a table that already holds storyboards
 * written before the production could be told what to show, so it arrives by
 * ALTER TABLE. A scene without it produces exactly as it did before.
 */
function migrateStoryboardScenesTable(db: DatabaseSync): void {
  const existingColumns = new Set(
    (db.prepare('PRAGMA table_info(storyboard_scenes)').all() as { name: string }[]).map((row) => row.name),
  );
  for (const column of STORYBOARD_SCENES_MIGRATION_COLUMNS) {
    if (!existingColumns.has(column.name)) {
      db.exec(`ALTER TABLE storyboard_scenes ADD COLUMN ${column.ddl}`);
    }
  }
}

/**
 * The matn column reaches a store that already holds 36,064 narrations, so it
 * arrives by ALTER TABLE. Until a re-ingestion fills it, it is empty — and an
 * empty matn falls back to the whole narration at search time, so a store that
 * has the column but not the data behaves exactly as it did before.
 */
function migrateHadithNarrationsTable(db: DatabaseSync): void {
  const existingColumns = new Set(
    (db.prepare('PRAGMA table_info(hadith_narrations)').all() as { name: string }[]).map((row) => row.name),
  );
  for (const column of HADITH_NARRATIONS_MIGRATION_COLUMNS) {
    if (!existingColumns.has(column.name)) {
      db.exec(`ALTER TABLE hadith_narrations ADD COLUMN ${column.ddl}`);
    }
  }
}

/**
 * Sovereign provenance reaches a table that already holds 47 assets owned by
 * real Creators, so it arrives by ALTER TABLE — never by recreating the table,
 * which would destroy them.
 *
 * The columns land empty. That is correct and is not a gap to be filled later
 * by a backfill: Article 5.5 forbids attributing an asset to a chamber or a
 * lineage without evidence, and no evidence exists for rows created before the
 * model did. `rowToVaultAsset` resolves an empty provenance to the declared
 * legacy state, so an un-backfilled row reads as exactly what it is.
 */
function migrateVaultAssetsTable(db: DatabaseSync): void {
  const existingColumns = new Set(
    (db.prepare('PRAGMA table_info(vault_assets)').all() as { name: string }[]).map((row) => row.name),
  );
  for (const column of VAULT_ASSETS_MIGRATION_COLUMNS) {
    if (!existingColumns.has(column.name)) {
      db.exec(`ALTER TABLE vault_assets ADD COLUMN ${column.ddl}`);
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

  // ── RECOVERING A LINK THAT WAS ALWAYS THERE ───────────────────────
  //
  //   Every generation was deposited into the Creator's Vault as a sovereign
  //   asset, and the record of it never held which asset that was — so the
  //   Chamber of creation could not edit or animate what it had just created.
  //   MEASURED on production 2026-09-25: 38 of 43 existing records already
  //   match a Vault asset on `asset_url` exactly. The link existed and was
  //   never written down.
  //
  //   Matched only where the URI is unambiguous, and never overwritten: a row
  //   that already knows its asset keeps what it knows. The five that match
  //   nothing stay null and the Chamber offers no action on them rather than
  //   guessing one.
  db.exec(`
    UPDATE generation_records
       SET asset_id = (
             SELECT v.asset_id FROM vault_assets v
              WHERE v.secure_storage_uri = generation_records.asset_url
                AND v.subscriber_tenant_id = generation_records.creator_id
              LIMIT 1
           )
     WHERE asset_id IS NULL
  `);

  //   ── AND THE ROWS THAT KNEW THE WRONG ASSET ────────────────────────────
  //
  //   MEASURED ON PRODUCTION 2026-09-26, from the Founder's own question
  //   «أفى نموذج استخدم فى العمليتين»: every image generation had been
  //   writing the FILE id into asset_id while the Vault minted its own. The
  //   id was never null, so the recovery above skipped these rows — and
  //   editing, animating or upscaling a picture the Chamber had just made
  //   answered `404 الأصل غير موجود`. Three of the Founder's own images from
  //   that day were dead this way.
  //
  //   Repaired by the same exact key the recovery above trusts: the storage
  //   URI, which is unique per file. Only rows whose asset_id matches NO
  //   Vault row are touched, and only where the URI resolves to exactly one
  //   asset the same Creator owns — a row that already points at a real asset
  //   keeps what it knows.
  db.exec(`
    UPDATE generation_records
       SET asset_id = (
             SELECT v.asset_id FROM vault_assets v
              WHERE v.secure_storage_uri = generation_records.asset_url
                AND v.subscriber_tenant_id = generation_records.creator_id
              LIMIT 1
           )
     WHERE asset_id IS NOT NULL
       AND NOT EXISTS (
             SELECT 1 FROM vault_assets w WHERE w.asset_id = generation_records.asset_id
           )
       AND EXISTS (
             SELECT 1 FROM vault_assets x
              WHERE x.secure_storage_uri = generation_records.asset_url
                AND x.subscriber_tenant_id = generation_records.creator_id
           )
  `);
}

export function createDatabase(path: string = defaultDbPath()): DatabaseSync {
  if (path !== ':memory:') {
    mkdirSync(dirname(path), { recursive: true });
  }
  const db = new DatabaseSync(path);
  if (path !== ':memory:') {
    db.exec('PRAGMA journal_mode=WAL; PRAGMA synchronous=NORMAL;');
  }
  for (const statement of SCHEMA_STATEMENTS) {
    db.exec(statement);
  }
  migrateCinematicLedgerTable(db);
  migrateCreatorsTable(db);
  migrateGoalsTable(db);
  migrateHadithNarrationsTable(db);
  migrateStoryboardScenesTable(db);
  migrateGenerationRecordsTable(db);
  // Provenance must exist before INDEX_STATEMENTS runs — SQLite cannot index a
  // column that is not there yet, the same ordering CREATORS_MIGRATION_COLUMNS
  // already depends on.
  migrateVaultAssetsTable(db);
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
