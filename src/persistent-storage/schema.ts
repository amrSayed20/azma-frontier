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
  // MINISTRY IX — GOAL PERSISTENCE: durable GoalContract storage. Every
  // committed Goal is written here at register() time and updated at every
  // status transition. GoalState uses this table as the authoritative source
  // of truth — the in-memory Map becomes an operational cache only. The
  // commercial_intent_json column stores the full MakmanCommercialIntent as
  // JSON so all commercial decisions survive restart alongside the Goal.
  `CREATE TABLE IF NOT EXISTS goals (
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
    sovereign_purpose_statement TEXT,
    success_criteria_json TEXT,
    created_at_ms INTEGER NOT NULL,
    updated_at_ms INTEGER NOT NULL
  )`,
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
    goal_id TEXT,
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
  // FULFILLMENT ASSESSMENT FOUNDATION (Constitutional Foundation Package V):
  // persists every Fulfillment Assessment as a historical conclusion.
  // criteria_assessments_json stores the full CriterionAssessment[] (including
  // criterionDescriptionSnapshot) so the assessment never silently changes
  // meaning when the Creator later replaces their Success Criteria list.
  // publisher_tenant_id is denormalized at write time for tenant-isolated reads.
  `CREATE TABLE IF NOT EXISTS fulfillment_assessments (
    assessment_id TEXT PRIMARY KEY,
    goal_id TEXT NOT NULL,
    publisher_tenant_id TEXT NOT NULL,
    assessed_at_ms INTEGER NOT NULL,
    overall_verdict TEXT NOT NULL,
    criteria_assessments_json TEXT NOT NULL
  )`,
  // SOVEREIGN KNOWLEDGE INVESTIGATION PERSISTENCE (Final Launch Foundation):
  // permanent constitutional memory of every completed Sovereign Investigation.
  // Each row is a sealed historical fact: what was investigated, what the
  // constitutional chain concluded, and when. records_json stores the full
  // KnowledgeExportRecord[] — already scrubbed of all provider identity,
  // provider URLs, and external service names by the constitutional chain.
  // record_count is denormalized from records_json length for fast queries.
  // creator_id is stored for tenant-isolated reads — no join required.
  `CREATE TABLE IF NOT EXISTS knowledge_investigations (
    investigation_id TEXT PRIMARY KEY,
    goal_id TEXT NOT NULL,
    creator_id TEXT NOT NULL,
    record_count INTEGER NOT NULL,
    records_json TEXT NOT NULL,
    investigated_at_ms INTEGER NOT NULL
  )`,
  // REALITY OBSERVATION FOUNDATION (Constitutional Foundation Package IV):
  // records every real signal observed about a Milestone Goal's publications.
  // An Observation is a statement of reality (CONSUMPTION_ATTEMPT with
  // AUTHORIZED/DENIED outcome) — constitutionally distinct from a
  // SuccessCriterion (what the Creator declared must become true) and from
  // any future Fulfillment Assessment (comparing definition vs. reality).
  // goal_id + publisher_tenant_id are denormalized from cinematic_ledger at
  // write time so reads need no join and tenant isolation is enforced in SQL.
  `CREATE TABLE IF NOT EXISTS observations (
    observation_id TEXT PRIMARY KEY,
    goal_id TEXT NOT NULL,
    publisher_tenant_id TEXT NOT NULL,
    publication_id TEXT NOT NULL,
    signal TEXT NOT NULL,
    outcome TEXT NOT NULL,
    observed_at_ms INTEGER NOT NULL
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
  // CONSUMPTION LEDGER — durable record of every AI provider call made
  // on behalf of a Creator. Used exclusively for cost-discovery during
  // the Founder Beta phase. Founders read this table via the High Council
  // consumption endpoint; Creators never see it.
  //
  // month_key ('YYYY-MM') is stored denormalized so monthly aggregation
  // needs no date function on query — a plain WHERE month_key = ? scan
  // on the composite index is enough.
  //
  // units is provider-meaningful: 1 per image/clone, character count for TTS.
  `CREATE TABLE IF NOT EXISTS consumption_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id TEXT NOT NULL,
    operation_type TEXT NOT NULL,
    cost_usd_estimate REAL NOT NULL,
    units INTEGER NOT NULL,
    month_key TEXT NOT NULL,
    recorded_at INTEGER NOT NULL
  )`,

  // LAUNCH ECONOMY FOUNDATION — CREDIT LEDGER
  // Append-only authoritative record of all AZMA Unit economic events.
  // Never mutated after INSERT. Every credit/debit is one row.
  // idempotency_key UNIQUE prevents duplicate processing of the same event.
  // balance_after is a snapshot of available_units at the time of this
  // transaction — enables full economic history reconstruction.
  // metadata_json must NEVER contain provider credentials or API secrets.
  `CREATE TABLE IF NOT EXISTS credit_ledger (
    ledger_id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    transaction_type TEXT NOT NULL,
    direction TEXT NOT NULL,
    amount INTEGER NOT NULL,
    balance_after INTEGER NOT NULL,
    reference_id TEXT,
    idempotency_key TEXT UNIQUE,
    status TEXT NOT NULL DEFAULT 'completed',
    metadata_json TEXT,
    created_at INTEGER NOT NULL
  )`,

  // LAUNCH ECONOMY FOUNDATION — CREATOR BALANCES
  // Materialized balance view; always updated in the same transaction as
  // credit_ledger. Never the sole source of truth — credit_ledger can
  // reconstruct it. Enables O(1) balance reads without ledger scans.
  // available_units = units that can be reserved right now.
  // reserved_units = units locked in active pending reservations.
  `CREATE TABLE IF NOT EXISTS creator_balances (
    creator_id TEXT PRIMARY KEY,
    available_units INTEGER NOT NULL DEFAULT 0,
    reserved_units INTEGER NOT NULL DEFAULT 0,
    total_purchased INTEGER NOT NULL DEFAULT 0,
    total_spent INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL
  )`,

  // LAUNCH ECONOMY FOUNDATION — TRIAL ENTITLEMENTS
  // One row per Creator. Tracks usage of the launch gift (3 free images +
  // 1 free 4-second video). Trial usage must never reduce paid AZMA balance.
  // credential_id / webauthn_public_key are for passkey-based verification;
  // null until WebAuthn client integration is complete.
  // claim_ip_hash is a hashed IP for abuse detection — never raw IP.
  `CREATE TABLE IF NOT EXISTS trial_entitlements (
    creator_id TEXT PRIMARY KEY,
    images_used INTEGER NOT NULL DEFAULT 0,
    images_granted INTEGER NOT NULL DEFAULT 3,
    video_used INTEGER NOT NULL DEFAULT 0,
    video_granted INTEGER NOT NULL DEFAULT 1,
    claimed_at INTEGER,
    claim_ip_hash TEXT,
    credential_id TEXT,
    webauthn_public_key TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,

  // PHASE 2A — PAYMOB PAYMENT INTEGRATION
  // Reconciliation record created when a checkout session starts and
  // updated on webhook delivery. Required because Paymob does not support
  // arbitrary metadata on payment objects (unlike Stripe payment_intent.metadata).
  // idempotency_key = our merchant_order_id sent to Paymob on order creation —
  // the webhook carries it back as obj.order.merchant_order_id so we can look up
  // creator_id / pack_id / azma_units without trusting client-supplied data.
  // provider_transaction_id is the Paymob transaction obj.id, set on webhook receipt.
  // status lifecycle: initiated → pending → successful | failed | cancelled
  `CREATE TABLE IF NOT EXISTS payment_transactions (
    transaction_id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    pack_id TEXT NOT NULL,
    azma_units INTEGER NOT NULL,
    amount_egp INTEGER NOT NULL,
    idempotency_key TEXT UNIQUE NOT NULL,
    provider_id TEXT NOT NULL,
    provider_order_id TEXT,
    provider_reference TEXT,
    provider_transaction_id TEXT,
    status TEXT NOT NULL DEFAULT 'initiated',
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,
];

/** Columns added to `cinematic_ledger` after its original creation — applied via ALTER TABLE for pre-existing databases. */
export const CINEMATIC_LEDGER_MIGRATION_COLUMNS: readonly { readonly name: string; readonly ddl: string }[] = [
  { name: 'operation_id', ddl: 'operation_id TEXT' },
  // REALITY OBSERVATION FOUNDATION (Constitutional Foundation Package IV):
  // links a publication back to the Goal it was created from, enabling
  // consumption events to be recorded as Observations against that Goal.
  { name: 'goal_id', ddl: 'goal_id TEXT' },
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
  // SOVEREIGN PURPOSE FOUNDATION (Constitutional Foundation Package I):
  // three columns make CREATOR → SOVEREIGN PURPOSE a durable relationship.
  // sovereign_purpose_created_at is set once on the first setSovereignPurpose()
  // call (via COALESCE — never overwritten); sovereign_purpose_updated_at
  // reflects every subsequent update.
  { name: 'sovereign_purpose', ddl: 'sovereign_purpose TEXT' },
  { name: 'sovereign_purpose_created_at', ddl: 'sovereign_purpose_created_at INTEGER' },
  { name: 'sovereign_purpose_updated_at', ddl: 'sovereign_purpose_updated_at INTEGER' },
];

/**
 * Columns added to `goals` after its original creation (Ministry IX) — applied
 * via ALTER TABLE for databases that already have the goals table.
 */
export const GOALS_MIGRATION_COLUMNS: readonly { readonly name: string; readonly ddl: string }[] = [
  // SOVEREIGN PURPOSE → MILESTONE GOAL FOUNDATION (Constitutional Package II):
  // when non-null, the Goal is a Milestone Goal serving the Creator's Sovereign
  // Purpose; the value is the exact Purpose wording at designation time.
  { name: 'sovereign_purpose_statement', ddl: 'sovereign_purpose_statement TEXT' },
  // MILESTONE SUCCESS DEFINITION FOUNDATION (Constitutional Package III):
  // JSON-serialized SuccessCriterion[] — the Creator's explicit definition of
  // what must become observably true for this Goal to be considered successful.
  // Constitutionally distinct from GoalStatus.COMPLETED (operational completion).
  { name: 'success_criteria_json', ddl: 'success_criteria_json TEXT' },
];

/** Run only after CREATORS_MIGRATION_COLUMNS has ensured the columns exist — SQLite cannot index a column that isn't there yet. */
export const INDEX_STATEMENTS: readonly string[] = [
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_creators_email ON creators(email)',
  // Composite index for the two most common consumption_records queries:
  //   1. Monthly usage for one creator  → WHERE creator_id = ? AND month_key = ?
  //   2. Founder dashboard all creators → WHERE month_key = ? (partial scan, acceptable)
  'CREATE INDEX IF NOT EXISTS idx_consumption_creator_month ON consumption_records(creator_id, month_key)',
  // Credit ledger: fast lookup by creator and by reference_id (payment intent, reservation)
  'CREATE INDEX IF NOT EXISTS idx_credit_ledger_creator ON credit_ledger(creator_id, created_at)',
  'CREATE INDEX IF NOT EXISTS idx_credit_ledger_reference ON credit_ledger(reference_id)',
  'CREATE INDEX IF NOT EXISTS idx_credit_ledger_status ON credit_ledger(creator_id, status)',
  // Payment transactions: reconciliation lookups by creator and by provider order
  'CREATE INDEX IF NOT EXISTS idx_payment_transactions_creator ON payment_transactions(creator_id, created_at)',
  'CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider_order ON payment_transactions(provider_order_id)',
];
