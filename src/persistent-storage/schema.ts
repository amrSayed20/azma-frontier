/**
 * AZMA OS — PERSISTENT STORAGE FOUNDATION
 * Schema
 *
 * Migration of Launch-Critical data only, per the Engineering Order:
 * Creator records, sessions, Qiyamah generation records, and Vault
 * asset metadata. Every other in-memory runtime state (Signal Log,
 * State Registry, Heart continuity, Core advisory cache, Consciousness
 * awareness state, Memory's Knowledge Repository, Evolution's
 * Improvement Registry, every Constitutional Engine's own sequence
 * counters) is deliberately NOT migrated — none of it was named
 * Launch-Critical, and migrating it is explicitly out of this
 * Package's Boundaries ("do not migrate non-essential runtime state").
 */

export const SCHEMA_STATEMENTS: readonly string[] = [
  // MINISTRY VIII — REAL CINEMATIC LEDGER: permanent constitutional record of
  // every creative production event. Distinct from operation_ledger (execution
  // internals); this table records WHAT WAS CREATED, not how workers executed it.
  // Populated by MakmanGoalDistributionBridge after evaluateAndDispatchRender()
  // resolves, so render_status reflects the actual initial production status
  // (DYNAMIC/PROCESSING/FAILED), not a placeholder. INSERT OR REPLACE allows
  // re-publishing a canvas to overwrite the prior record without duplication.
  `CREATE TABLE IF NOT EXISTS cinematic_ledger (
    publication_id TEXT PRIMARY KEY,
    publisher_tenant_id TEXT NOT NULL,
    source_canvas_id TEXT NOT NULL,
    source_compilation_id TEXT NOT NULL,
    operation_id TEXT,
    canvas_type TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    render_status TEXT NOT NULL,
    flattened_vault_asset_id TEXT,
    published_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  // email/password_hash/role added for the Authentication Foundation
  // (Execution Package III). CREATE TABLE IF NOT EXISTS alone does NOT
  // alter an already-existing table — a real dev database created by
  // the Persistent Storage Foundation before these columns existed hit
  // exactly this ("no such column: email"). db.ts's createDatabase()
  // runs a real ALTER-based migration (ensureColumnsExist) after these
  // statements to add any missing columns to a pre-existing table. No
  // inline UNIQUE here — SQLite cannot ADD COLUMN with UNIQUE; see
  // INDEX_STATEMENTS below for the equivalent uniqueness guarantee.
  `CREATE TABLE IF NOT EXISTS creators (
    creator_id TEXT PRIMARY KEY,
    email TEXT,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'creator',
    display_name TEXT,
    preferred_locale TEXT,
    created_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS generation_records (
    record_id TEXT PRIMARY KEY,
    creator_id TEXT,
    prompt TEXT NOT NULL,
    style TEXT,
    asset_url TEXT NOT NULL,
    generated_at INTEGER NOT NULL
  )`,
  // Billing Foundation (Execution Package IV) — a new table, added
  // without touching creators/sessions/generation_records/vault_assets.
  `CREATE TABLE IF NOT EXISTS subscriptions (
    subscription_id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL,
    plan TEXT NOT NULL,
    current_period_end INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  `CREATE TABLE IF NOT EXISTS vault_assets (
    asset_id TEXT PRIMARY KEY,
    subscriber_tenant_id TEXT NOT NULL,
    originating_operation_id TEXT NOT NULL,
    capability_target TEXT NOT NULL,
    asset_family TEXT NOT NULL,
    secure_storage_uri TEXT NOT NULL,
    metadata TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
  // MINISTRY VI — SOVEREIGN PROJECT RESUME: durable storage for
  // SovereignCanvas state. Full canvas is JSON-serialized in canvas_json;
  // title/canvas_type are extracted as redundant columns so listing can
  // return summaries without deserializing every canvas's full JSON.
  // INSERT OR REPLACE (upsert on canvas_id) makes every save idempotent —
  // re-saving a canvas replaces the prior snapshot, no version history.
  `CREATE TABLE IF NOT EXISTS sovereign_canvases (
    canvas_id TEXT PRIMARY KEY,
    subscriber_tenant_id TEXT NOT NULL,
    title TEXT NOT NULL,
    canvas_type TEXT NOT NULL,
    canvas_json TEXT NOT NULL,
    saved_at INTEGER NOT NULL
  )`,
  // MINISTRY VII — REAL FLEET INFRASTRUCTURE: durable operation ledger
  // replacing the in-memory Map in OperationLedgerManager. Every fleet
  // dispatch creates one row; state transitions UPDATE it in place.
  // source_intent_json stores the full AZMAPolymorphicIntent (JSON) so
  // adapters can retrieve the assembly payload on resolution.
  `CREATE TABLE IF NOT EXISTS operation_ledger (
    operation_id TEXT PRIMARY KEY,
    subscriber_tenant_id TEXT NOT NULL,
    capability_target TEXT NOT NULL,
    current_state TEXT NOT NULL,
    source_intent_json TEXT NOT NULL,
    estimated_resource_cost REAL NOT NULL,
    actual_resource_cost REAL,
    allocated_provider_id TEXT,
    external_job_id TEXT,
    resolved_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
];

/** Columns added to `cinematic_ledger` after its original creation — applied via ALTER TABLE for pre-existing databases. */
export const CINEMATIC_LEDGER_MIGRATION_COLUMNS: readonly { readonly name: string; readonly ddl: string }[] = [
  { name: 'operation_id', ddl: 'operation_id TEXT' },
];

/** Columns added to `creators` after its original creation — applied via ALTER TABLE for pre-existing databases. */
export const CREATORS_MIGRATION_COLUMNS: readonly { readonly name: string; readonly ddl: string }[] = [
  { name: 'email', ddl: 'email TEXT' },
  { name: 'password_hash', ddl: 'password_hash TEXT' },
  { name: 'role', ddl: "role TEXT NOT NULL DEFAULT 'creator'" },
  // Creator Language Experience: added after display_name — a pre-existing
  // database (this project's own dev database included) needs the same
  // real ALTER TABLE path, not just the CREATE TABLE IF NOT EXISTS above.
  { name: 'preferred_locale', ddl: 'preferred_locale TEXT' },
];

/** Run only after CREATORS_MIGRATION_COLUMNS has ensured the columns exist — SQLite cannot index a column that isn't there yet. */
export const INDEX_STATEMENTS: readonly string[] = [
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_creators_email ON creators(email)',
];
