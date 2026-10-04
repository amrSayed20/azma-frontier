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
    vault_pin_hash TEXT,
    created_at INTEGER NOT NULL
  )`,
  // ══ GOOGLE IDENTITY GATE — the binding between an AZMA account and an
  //    external authentication provider.
  //
  //    A SEPARATE TABLE, not columns on `creators`, and that is a constitutional
  //    choice rather than a normalisation one: the Empire's own account must
  //    survive the removal of every provider it has ever used. Dropping this
  //    table would cost the Empire its ability to authenticate people; it would
  //    cost it not one asset, project, subscription or ownership relation.
  //
  //    provider_subject is the provider's permanent id for the person — Google's
  //    `sub`. Never the email: an address can be reassigned by a workspace
  //    administrator or relinquished and re-registered, and an account keyed on
  //    an address changes hands when the address does.
  //
  //    UNIQUE(provider, provider_subject) is the duplicate-account guarantee. It
  //    is enforced by the database, not by a check in a route, because a check
  //    in a route loses a race and an index does not.
  `CREATE TABLE IF NOT EXISTS authentication_identities (
    identity_id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_subject TEXT NOT NULL,
    provider_email TEXT,
    linked_at INTEGER NOT NULL,
    last_authenticated_at INTEGER,
    UNIQUE(provider, provider_subject)
  )`,
  `CREATE TABLE IF NOT EXISTS sessions (
    session_id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  )`,
  // VAULT BIOMETRIC ENTRY: one row per device a Creator has enrolled to open
  // the Vault with their own fingerprint or face. Only the public key is kept
  // — the biometric itself never leaves the Creator's device and is never
  // transmitted, which is the whole point of WebAuthn over a stored template.
  // counter guards against a cloned authenticator replaying an old assertion.
  `CREATE TABLE IF NOT EXISTS vault_credentials (
    credential_id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    public_key TEXT NOT NULL,
    counter INTEGER NOT NULL DEFAULT 0,
    transports TEXT,
    device_label TEXT,
    created_at INTEGER NOT NULL,
    last_used_at INTEGER
  )`,
  `CREATE TABLE IF NOT EXISTS generation_records (
    record_id TEXT PRIMARY KEY,
    creator_id TEXT,
    prompt TEXT NOT NULL,
    style TEXT,
    asset_url TEXT NOT NULL,
    -- The sovereign asset this generation became, so the Chamber can act on
    -- what it created. See GENERATION_RECORDS_MIGRATION_COLUMNS.
    asset_id TEXT,
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
  // THE SUNNAH, HELD BY THE EMPIRE ITSELF.
  //
  // The collections arrive as single JSON documents of nine megabytes each.
  // Parsing one inside the server is synchronous, and the production log proved
  // what that costs: on every investigation *every* Ministry exceeded its
  // five-second deadline — including the four Ministries with no providers
  // attached, which return an empty array immediately. They took five seconds
  // because nothing was running at all. One Creator's search of the Sunnah
  // froze the whole Empire for everyone else inside it.
  //
  // Moving the parse off the request path would only have moved the freeze.
  // The parse now happens once, in a separate process, and what the chamber
  // queries is this table: one row per narration, indexed, read in milliseconds
  // and never held in memory.
  //
  // `normalised_text` carries the narration with diacritics and letterform
  // variants removed, because two spellings of the same word must match.
  // `grades_json` carries each grading exactly as its source gave it, with the
  // name of the scholar who issued it — an empty array is a real answer,
  // meaning the sources stated no grade, and it is never filled in from the
  // reputation of a collection's title.
  // `normalised_matn` holds only what was narrated, with the chain of
  // transmission removed. A narration is two things joined: the isnad names who
  // carried it, and the matn is what was said. The isnad is often the longer
  // half and is made entirely of names — so searching a narration whole is
  // searching a roll of names. Asked for the story of Yunus, the chamber
  // returned the verse and then every narration carrying a transmitter named
  // Yunus, in which his name appears the way a postman's appears on a letter.
  // Subjects are searched in the matn; the whole narration is still displayed,
  // because the chain is what makes it checkable.
  `CREATE TABLE IF NOT EXISTS hadith_narrations (
    narration_id TEXT PRIMARY KEY,
    edition TEXT NOT NULL,
    collection_ar TEXT NOT NULL,
    narration_number INTEGER NOT NULL,
    text_ar TEXT NOT NULL,
    normalised_text TEXT NOT NULL,
    normalised_matn TEXT NOT NULL DEFAULT '',
    grades_json TEXT NOT NULL,
    ingested_at_ms INTEGER NOT NULL
  )`,
  // THE TRANSMITTED CORPUS — what «الإسرائيليات» was drawn FROM.
  //
  // Measured before this table existed: the word «الإسرائيليات» appears in zero
  // of 507 verses of al-Qurtubi and al-Baghawi, and in zero of the library's
  // 79,381 volumes. What the library does hold is the material itself —
  // Ginzberg's Legends of the Jews in four volumes and three related
  // compilations, 4.8 MB of public-domain text.
  //
  // So `status` is UNCLASSIFIED on every row, and that is a measurement rather
  // than a default: these works carry provenance, not the scholarly ruling that
  // makes a report «موافق» or «مخالف». The Empire holds no source that issues
  // that ruling, and the chamber says so rather than inferring one.
  `CREATE TABLE IF NOT EXISTS transmitted_reports (
    report_id TEXT PRIMARY KEY,
    work_id TEXT NOT NULL,
    work_title TEXT NOT NULL,
    compiler TEXT,
    location TEXT NOT NULL,
    text_en TEXT NOT NULL,
    searchable_text TEXT NOT NULL,
    provenance_ar TEXT NOT NULL,
    status TEXT NOT NULL,
    scholarly_note_ar TEXT,
    ingested_at_ms INTEGER NOT NULL
  )`,
  // THE LIBRARY CATALOGUE — 78,130 public-domain works.
  //
  // This table was read by `library-repository.ts` and created by nothing but
  // `scripts/ingest-library.mjs`. Production held it only because that script
  // had been run: a database built from this schema alone had no such table,
  // and `hasWorks()` throws on a missing table rather than returning false, so
  // a rebuilt Empire would have lost the whole library to an exception on the
  // first question asked of it. Declared here so the schema creates every table
  // the application reads. The DDL is character-for-character the ingest
  // script's, since both are `IF NOT EXISTS` and whichever runs first wins —
  // two definitions that disagreed would break the ingest's INSERT instead.
  `CREATE TABLE IF NOT EXISTS library_works (
    work_id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    authors TEXT,
    subjects TEXT,
    language TEXT NOT NULL,
    issued TEXT,
    searchable TEXT NOT NULL,
    ingested_at_ms INTEGER NOT NULL
  )`,
  // ══ CONSTITUTIONAL FOUNDATION — Phase B3 ═══════════════════════════════════
  //
  // PROJECTS — Constitution Article 7.
  //
  // ONE table, four types. The directive is explicit: «لا تنشئ خمسة أنظمة
  // مشاريع منفصلة غير متوافقة» — one coherent foundation with explicit type
  // semantics. Four tables would mean four ownership checks, four lifecycle
  // vocabularies, and four places for the next rule to be forgotten.
  //
  // `parent_project_id` is how Article 7.4's umbrella actually holds: a
  // Knowledge, Asset-Collection or Composition project points at the Sovereign
  // Project that gathers it. A Sovereign Project has none — it is the top.
  //
  // Deliberately NOT modelled as an extension of `goals`: Article 7.4 forbids
  // it, and the two have different lifetimes. `goals` is SOEL's contract for
  // purpose; this is the Creator's creative work.
  `CREATE TABLE IF NOT EXISTS sovereign_projects (
    project_id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    project_type TEXT NOT NULL,
    title TEXT NOT NULL,
    lifecycle_state TEXT NOT NULL,
    parent_project_id TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,

  // STORYBOARD — Constitution Article 2.2.
  //
  // «ليس نصًا طويلًا فقط، وليس prompt منفردًا». The structure lives in
  // `storyboard_scenes` below; this row is the identity, the ownership and the
  // two project relationships that make it the hinge between meaning and
  // production — born in the Hujjah, read by Qiyamah and Ras Al Amr.
  `CREATE TABLE IF NOT EXISTS storyboards (
    storyboard_id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    knowledge_project_id TEXT,
    composition_project_id TEXT,
    title TEXT NOT NULL,
    lifecycle_state TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,

  // SCENE — Constitution Article 2.2, and the boundary drawn inside it.
  //
  // Two fields belong to Qiyamah (`direction_notes`, and the visual the scene
  // asks for) and two to Ras Al Amr (`scene_order`, `duration_seconds`,
  // `transition_intent`). The constitutional line between "inside the asset"
  // and "on the timeline" runs through this row, which is why it is one row
  // and not two tables.
  //
  // `scene_order` is an integer the Creator controls, not a position in an
  // array: an unordered list is not a storyboard, and the directive says so.
  `CREATE TABLE IF NOT EXISTS storyboard_scenes (
    scene_id TEXT PRIMARY KEY,
    storyboard_id TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    scene_order INTEGER NOT NULL,
    description TEXT NOT NULL,
    visual_asset_id TEXT,
    audio_asset_id TEXT,
    duration_seconds REAL,
    transition_intent TEXT,
    direction_notes TEXT,
    -- What this scene should SHOW, as the stock libraries can be asked for it.
    -- The description column is what is seen, in Arabic, and is the Creator's;
    -- this is the same intent phrased so a search can act on it, never shown.
    visual_search_en TEXT,
    -- stock | generate, and what to create when it is generate.
    sourcing TEXT,
    creation_demand_ar TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,

  // TOMBSTONE — Constitution Articles 6.2, 6.3.
  //
  // WHAT IS DELIBERATELY ABSENT: `secure_storage_uri`. Article 7.5 of the
  // directive forbids a tombstone exposing raw storage paths, and the path adds
  // nothing an audit needs that `asset_id` does not already give. A column that
  // cannot be safely returned is a column that should not be written.
  //
  // The lineage columns are the reason this table exists at all. Article A-5
  // («لا أصل يتيم») and Article 5.6 collide the moment an asset with children is
  // destroyed: the children point at a parent that no longer exists. Keeping
  // the parent and root here means the tombstone answers for the vanished
  // asset, and no derived asset is orphaned by its ancestor's destruction.
  `CREATE TABLE IF NOT EXISTS asset_tombstones (
    tombstone_id TEXT PRIMARY KEY,
    asset_id TEXT NOT NULL,
    owner_id TEXT NOT NULL,
    asset_family TEXT,
    capability_target TEXT,
    parent_asset_id TEXT,
    root_asset_id TEXT,
    project_id TEXT,
    creation_chamber TEXT,
    deleted_by TEXT NOT NULL,
    deleted_at INTEGER NOT NULL,
    deletion_reason TEXT,
    published_protection TEXT NOT NULL,
    metadata_snapshot TEXT NOT NULL
  )`,

  // SOVEREIGN PUBLIC LINK — Constitution Articles 9.2, 9.3.
  //
  // The data foundation only. The public page and the publishing flow are
  // Phase F; this phase builds the record they will need and nothing more.
  //
  // `public_token` is UNIQUE and is minted from a cryptographic source, never
  // from a counter or a timestamp — Article 9.3 requires an identifier that
  // cannot be guessed, because the link is the only thing standing between a
  // published work and the whole internet.
  //
  // It points at a FINAL WORK asset, never at a storage path. Article 9.3:
  // «لا يفتح وصولًا عامًا إلى مجلدات الأصول».
  `CREATE TABLE IF NOT EXISTS sovereign_public_links (
    link_id TEXT PRIMARY KEY,
    public_token TEXT NOT NULL UNIQUE,
    owner_id TEXT NOT NULL,
    final_work_asset_id TEXT NOT NULL,
    publication_state TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    revoked_at INTEGER,
    revoked_by TEXT
  )`,

  // ══ A CREATOR'S OWN CLOUD ACCOUNT, LINKED BY THEM ═══════════════════════
  //
  //   FOUNDER, 2026-09-29: «أقصد بالسحابة حسابات المستخدم السحابية — مثل جوجل
  //   درايف أو دروبوكس أو أي كلاود للآيفون — بعد أن يقوم بربطها، للتحميل
  //   عليها. وليس تخزينًا سحابيًا للمنصّة نفسها.»
  //
  //   The Empire owns nothing in that account. It holds one thing: permission
  //   the Creator granted and may withdraw, kept so a file can be delivered to
  //   them later without asking again.
  //
  //   refresh_token_sealed IS NEVER PLAINTEXT. It is AES-256-GCM, keyed from
  //   the server's own AZMA_TOKEN_KEY — see src/cloud-destinations/token-vault.ts
  //   for why a reversible seal is required here and a one-way hash is not.
  //   The access token is deliberately NOT stored at all: it expires in an
  //   hour, and a secret kept past its usefulness is a secret kept for nothing.
  //
  //   revoked_at, not DELETE: a Creator who unlinks an account has withdrawn a
  //   permission, and the record that they once granted it is the audit trail
  //   Article 8.4 asks of every authority in this Empire. The sealed token is
  //   blanked at that moment — the record survives, the power does not.
  //
  //   UNIQUE(creator_id, provider, provider_account_id) so linking the same
  //   account twice updates one row instead of growing a second grant nobody
  //   can see to revoke.
  // ══ THE DURABLE SOVEREIGN PUBLICATION ════════════════════════════════════
  //
  //   ARCHITECTURAL DECISION, approved 2026-10-04: OPTION B.
  //
  //   `MakmanPublicationRegistry` held publications in `new Map()`, and its own
  //   contract said what that was: «In production, this maps to the database
  //   repository holding the master catalog». It was a placeholder, and the
  //   placeholder was load-bearing — after any restart or deployment,
  //   `getPublication(id)` returned null and `PublicConsumptionBoundary` threw
  //   «not found or has been retracted» for a work nobody had retracted.
  //
  //   Scheduling could not live on `sovereign_public_links` instead: that
  //   record is an ACCESS MECHANISM to an already-published work (Article 9.3),
  //   it carries no access policy, and several links may point at one work —
  //   which would give one work several contradictory schedules. The Empire's
  //   own contracts had already answered: `scheduledPublishAt` is declared on
  //   `SovereignPublication` and on `MakmanCommercialIntent`, and has never
  //   been declared on a link.
  //
  //   REAL COLUMNS, not a serialized blob. The access policy decides whether a
  //   consumer may watch at all; «which publications are due?» and «which are
  //   age-restricted?» are questions a query must answer. Only
  //   `geo_restrictions_json` is JSON, because it is genuinely a list — the
  //   same reason `dependencies_json` is JSON on `goals`.
  //
  //   is_published + published_at + scheduled_publish_at are three facts, not
  //   one: a publication may be scheduled and not yet published, published
  //   without ever having been scheduled, or scheduled in the past and
  //   published late because nothing observed it until now.
  `CREATE TABLE IF NOT EXISTS sovereign_publications (
    publication_id TEXT PRIMARY KEY,
    publisher_tenant_id TEXT NOT NULL,
    source_compilation_id TEXT NOT NULL,
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    cover_art_uri TEXT,
    distribution_tier TEXT NOT NULL,
    pricing_base_price REAL,
    pricing_currency TEXT,
    pricing_rental_duration_hours REAL,
    geo_restrictions_json TEXT,
    requires_age_verification INTEGER NOT NULL DEFAULT 0,
    is_published INTEGER NOT NULL DEFAULT 0,
    published_at INTEGER,
    scheduled_publish_at INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  )`,

  // ── THE RECEIPT OF AN EXTERNAL DISTRIBUTION ──────────────────────────────
  //
  //   Commit c3c4d34 was named «A distribution leaves a receipt» and left it
  //   in a console line. A console line is not a receipt: it cannot be read
  //   back, it cannot be shown to the Creator who asked «did it publish?»,
  //   and it does not survive a restart.
  //
  //   WHAT THIS IS NOT. Not `sovereign_publications` — that holds a work's
  //   public consumption STATE inside the Empire (its access policy, whether
  //   it is live, when it is due). This holds the fact that a copy of one
  //   sovereign asset LEFT the Empire, to which provider, into which place,
  //   and what identifier that provider gave back. Neither can answer the
  //   other's question.
  //
  //   provider_message_id is the provider's own handle — a Telegram message
  //   id, a Drive file id. It is a RECEIPT, not a title deed: the asset
  //   remains the Vault's, and nothing here grants a provider ownership.
  //
  //   status is PUBLISHED or FAILED and nothing else. There is no PENDING row,
  //   because a row is written only after the provider has answered — a
  //   persisted «in progress» that no process is still carrying would be a
  //   lie the first time the server restarted mid-upload.
  `CREATE TABLE IF NOT EXISTS distribution_receipts (
    receipt_id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    source_asset_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    account_id TEXT NOT NULL,
    provider_target TEXT,
    provider_message_id TEXT,
    status TEXT NOT NULL,
    failure_reason TEXT,
    created_at INTEGER NOT NULL
  )`,

  `CREATE TABLE IF NOT EXISTS cloud_accounts (
    account_id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_account_id TEXT NOT NULL,
    account_label TEXT,
    refresh_token_sealed TEXT,
    scopes TEXT NOT NULL,
    linked_at INTEGER NOT NULL,
    last_used_at INTEGER,
    revoked_at INTEGER,
    UNIQUE(creator_id, provider, provider_account_id)
  )`,

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

/**
 * Columns added to `generation_records` after its original creation.
 * original_idea stores the Creator's verbatim input before Qiyamah transforms
 * it into the internal production prompt — these are two distinct things and must
 * be stored separately. Nullable so existing rows are unaffected.
 */
export const GENERATION_RECORDS_MIGRATION_COLUMNS: readonly { readonly name: string; readonly ddl: string }[] = [
  { name: 'original_idea', ddl: 'original_idea TEXT' },
  // VIDEO CREATION WIRING: distinguishes image vs. video records so the gallery
  // can render <video> elements correctly. DEFAULT 'image' keeps all pre-existing
  // rows valid without data migration.
  { name: 'media_type', ddl: "media_type TEXT NOT NULL DEFAULT 'image'" },
  /**
   * The sovereign asset this generation became.
   *
   * ─── THE INCIDENT THIS ENCODES ─────────────────────────────────────────
   *
   *   The Founder, 2026-09-25: «أين مربع اختيار التعديل على صورة أو
   *   فيديو؟» — and editing was offered on uploaded assets alone. Traced
   *   past the interface: القيامة deposits everything it makes into the
   *   Creator's Vault as a sovereign asset, and this record — the only thing
   *   the gallery reads — never held which asset that was. Editing what the
   *   Chamber of creation had just created was not hidden; it was impossible,
   *   because nothing knew what to edit.
   *
   *   MEASURED on the live database the same day: 38 of 43 records already
   *   match a Vault asset by `asset_url`. The link existed and was never
   *   declared. It is declared now, and old rows recover it from that match.
   */
  { name: 'asset_id', ddl: 'asset_id TEXT' },
];

/**
 * Columns added to `hadith_narrations` after its original creation.
 *
 * The production store already holds 36,064 narrations, so the matn column
 * arrives by ALTER TABLE rather than by recreating the table. It defaults to an
 * empty string, and an empty matn falls back to the whole narration at search
 * time — so a database that has the column but has not been re-ingested behaves
 * exactly as it did before, rather than finding nothing.
 */
export const HADITH_NARRATIONS_MIGRATION_COLUMNS: readonly { readonly name: string; readonly ddl: string }[] = [
  { name: 'normalised_matn', ddl: "normalised_matn TEXT NOT NULL DEFAULT ''" },
];

/**
 * Columns added to `storyboard_scenes` after its original creation.
 *
 * ─── THE INCIDENT THIS ENCODES ───────────────────────────────────────────────
 *
 *   MEASURED 2026-09-25 by looking at the first real storyboard film. Over
 *   narration about أصحاب الكهف — a Qur'anic account — the production showed a
 *   priest holding a crucifix. Nothing malfunctioned: الحُجّة الدامغة had
 *   written what each scene should show, in Arabic, and the production was
 *   never given it. Only the spoken narration crossed, so the stock library
 *   was left to guess a picture from the words, and it guessed from outside
 *   this Empire's world.
 *
 *   A Chamber that decomposes a subject into scenes decides both halves of a
 *   scene. This column carries the visual half in the form a search can act
 *   on, so the picture is chosen here and not inferred elsewhere.
 *
 * ─── WHY IT IS NOT `description` ─────────────────────────────────────────────
 *
 *   `description` is the Creator's, in Arabic, and is displayed. This is
 *   machinery: it is written for a stock search, never rendered, never spoken,
 *   and never returned to the Creator. Two purposes, two columns.
 */
export const STORYBOARD_SCENES_MIGRATION_COLUMNS: readonly { readonly name: string; readonly ddl: string }[] = [
  { name: 'visual_search_en', ddl: 'visual_search_en TEXT' },
  /**
   * Where this scene's picture comes from, and what to make when it must be
   * made. Decided by whoever wrote the scene — the only party that knows
   * whether what it shows exists in the world at all.
   *
   * MEASURED 2026-09-25: the production workshop holds no generator, so a
   * scene describing something that exists nowhere could never be found by
   * any search. The decision and the demand are stored beside the scene
   * rather than re-derived later, because the moment of deciding what is
   * seen is the moment the answer is known.
   *
   * Scenes written before these columns existed have neither, and a scene
   * with no sourcing is stock — which is what every scene was until now.
   */
  { name: 'sourcing', ddl: 'sourcing TEXT' },
  { name: 'creation_demand_ar', ddl: 'creation_demand_ar TEXT' },
];

/** Columns added to `cinematic_ledger` after its original creation — applied via ALTER TABLE for pre-existing databases. */
export const CINEMATIC_LEDGER_MIGRATION_COLUMNS: readonly { readonly name: string; readonly ddl: string }[] = [
  { name: 'operation_id', ddl: 'operation_id TEXT' },
  // REALITY OBSERVATION FOUNDATION (Constitutional Foundation Package IV):
  // links a publication back to the Goal it was created from, enabling
  // consumption events to be recorded as Observations against that Goal.
  { name: 'goal_id', ddl: 'goal_id TEXT' },
];

/**
 * SOVEREIGN PROVENANCE — Constitution Articles 5.3–5.6, Phase B1.
 *
 * ─── WHY ALTER TABLE AND NOT A NEW TABLE ────────────────────────────────────
 *
 *   `vault_assets` holds 47 rows in production, owned by 2 Creators, with zero
 *   orphans — measured before this was written. Article 15 forbids a second
 *   asset model and a parallel vault, and every existing query, the two
 *   authorisation gates and the deposit boundary read this table. So provenance
 *   arrives as columns beside the original nine.
 *
 * ─── WHY EVERY COLUMN IS NULLABLE WITH NO DEFAULT ───────────────────────────
 *
 *   SQLite can only ADD COLUMN with a constant default, and the honest default
 *   for `root_asset_id` is the row's own `asset_id` — which is not a constant.
 *   More importantly, Article 5.5 forbids inventing provenance: a column that
 *   silently filled itself with a guess would be exactly the fabrication the
 *   constitution names.
 *
 *   NULL therefore means one true thing — "this row predates provenance" — and
 *   the repository resolves it to the declared legacy state on read, where the
 *   rule is visible and testable rather than buried in a DDL default.
 */
export const VAULT_ASSETS_MIGRATION_COLUMNS: readonly { readonly name: string; readonly ddl: string }[] = [
  // Lineage — Article 5.3
  { name: 'parent_asset_id', ddl: 'parent_asset_id TEXT' },
  { name: 'root_asset_id', ddl: 'root_asset_id TEXT' },
  { name: 'version', ddl: 'version INTEGER' },
  { name: 'derivation', ddl: 'derivation TEXT' },
  // Place in the system — Articles 5.3, 7.4
  { name: 'creation_chamber', ddl: 'creation_chamber TEXT' },
  { name: 'project_id', ddl: 'project_id TEXT' },
  // State — Articles 8, 5.5
  { name: 'lifecycle_state', ddl: 'lifecycle_state TEXT' },
  { name: 'derivation_permission', ddl: 'derivation_permission TEXT' },
  // Audit — Article 8.4
  { name: 'created_by', ddl: 'created_by TEXT' },
  { name: 'last_modified_by', ddl: 'last_modified_by TEXT' },
  { name: 'last_modified_at', ddl: 'last_modified_at INTEGER' },
  /**
   * The SHA-256 of the asset's own bytes.
   *
   * The Founder, 2026-09-26: «لا أريد ملء الخزائن بأصول مكرّرة... ستواجهنا
   * مشكلة تخزين مع زيادة أعداد المشتركين». The digest already existed — it was
   * computed for every DERIVED asset to prove an output differs from its
   * parent — but it lived inside a JSON blob, where no query could reach it.
   * As a column with an index it answers «does this Creator already own these
   * exact bytes?» in one lookup, at any number of subscribers.
   */
  { name: 'content_digest', ddl: 'content_digest TEXT' },
  /**
   * The asset's real pixel size, read from its own bytes.
   *
   * FOUNDER, 2026-09-29, on مكمن الغاية: «مقاس الأصل ليس ثابتا في جميع
   * المنصات... فتقوم بتغير الابعاد لتتناسب مع المنصات المحددة من المستخدم».
   *
   * `platform-adapter.ts` decides that already, and takes exactly one input:
   * the master asset's aspect ratio. MEASURED 2026-09-29 — this table had no
   * width, no height, no aspect, and nothing wrote one into the metadata JSON.
   * The engine could never run because its one input did not exist.
   *
   * Columns, not a JSON key, for the reason `content_digest` is a column: the
   * Chamber asks «which of this Creator's assets already fit TikTok?» and a
   * question asked of every asset must be answerable by a query. The ratio is
   * DERIVED from these two on read (`toAspectRatio`) and never stored — one
   * truth, in pixels, with no second copy to drift.
   *
   * NULL is a real and frequent state: a row written before this existed, a
   * file that is no longer on disk, a format the reader was never taught. It
   * means «لا نعرف مقاس هذا الأصل», and the Chamber must say so rather than
   * assume a shape. UNKNOWN is never zero.
   */
  { name: 'pixel_width', ddl: 'pixel_width INTEGER' },
  { name: 'pixel_height', ddl: 'pixel_height INTEGER' },
  /**
   * When this asset stops being kept — and NULL for almost every asset.
   *
   * FOUNDER, 2026-09-29: «الاحتفاظ به داخل الخزانة لمدة 15 يوم ثم يحذف»،
   * و«الإتلاف النهائي بعد إخبار صاحب الأصل».
   *
   * Only a PLATFORM RENDITION carries an expiry. The Creator's own master —
   * uploaded, generated, or composed — is theirs without limit and its column
   * stays NULL, which is what NULL means here: «هذا الأصل لا ينتهي».
   *
   * A column rather than a metadata key for the reason content_digest and the
   * pixel size are columns: «ما الذي حان أجله؟» is a question asked of every
   * asset at once, and a question asked of all of them must be answerable by
   * a query rather than by deserializing every JSON blob in the Vault.
   */
  { name: 'expires_at_ms', ddl: 'expires_at_ms INTEGER' },
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
  // PHASE 3B — REAL VAULT PIN AUTHENTICATION: per-Creator scrypt PIN hash.
  // NULL until the Creator completes the one-time PIN setup flow.
  // NEVER store a plaintext PIN — only the scrypt output lands here.
  { name: 'vault_pin_hash', ddl: 'vault_pin_hash TEXT' },
  // GOOGLE IDENTITY GATE: whether the Empire holds proof that this person
  // controls the address on their account.
  //
  // DEFAULT 'UNVERIFIED' is the whole point of the column. Every row that
  // existed when it was added — all three, the Founder's among them — takes
  // that value, because no mechanism for producing such proof has ever existed
  // in this system, so no row can have it. Defaulting to VERIFIED, or
  // backfilling it, would have invented a history: the same thing Article 5.5
  // forbids for legacy assets, in the place where it matters most.
  { name: 'verification_state', ddl: "verification_state TEXT NOT NULL DEFAULT 'UNVERIFIED'" },
  // When verification was recorded, and by which provider binding. NULL while
  // unverified — and NULL is not a state to be guessed at, it is the absence
  // of the event.
  { name: 'verified_at', ddl: 'verified_at INTEGER' },
  { name: 'verified_via_provider', ddl: 'verified_via_provider TEXT' },
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
  /**
   * When a goal was put away, and by whom.
   *
   * FOUNDER, 2026-09-29: «امنع تكدس الاصول والغايات بصفه عامه داخل الحجره».
   *
   * Article 6.1 defines «الحذف التشغيلي» as four things at once: hidden from
   * ordinary display, the REQUEST RECORDED, kept through retention, and
   * restorable. `status = 'ARCHIVED'` does the hiding; these two do the
   * recording, which is the half that makes an archive auditable rather than
   * a disappearance.
   *
   * NULL means the goal was never archived — including a goal that was
   * archived and then restored, where the record of the act lives in its
   * status history, not in a stale timestamp. Both are cleared on restore so
   * they can never describe a state the goal is not in.
   */
  { name: 'archived_at_ms', ddl: 'archived_at_ms INTEGER' },
  { name: 'archived_by', ddl: 'archived_by TEXT' },
];

/** Run only after CREATORS_MIGRATION_COLUMNS has ensured the columns exist — SQLite cannot index a column that isn't there yet. */
export const INDEX_STATEMENTS: readonly string[] = [
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_creators_email ON creators(email)',
  // One AZMA account per provider identity, enforced where a race cannot beat
  // it. The table's UNIQUE(provider, provider_subject) already does this; the
  // index is named here too so a database created before that table gained the
  // constraint still acquires it.
  'CREATE UNIQUE INDEX IF NOT EXISTS idx_auth_identity_provider_subject ON authentication_identities(provider, provider_subject)',
  'CREATE INDEX IF NOT EXISTS idx_auth_identity_creator ON authentication_identities(creator_id)',
  // Every biometric entry looks up a Creator's enrolled devices by creator_id.
  'CREATE INDEX IF NOT EXISTS idx_vault_credentials_creator ON vault_credentials(creator_id)',
  // Composite index for the two most common consumption_records queries:
  //   1. Monthly usage for one creator  → WHERE creator_id = ? AND month_key = ?
  //   2. Founder dashboard all creators → WHERE month_key = ? (partial scan, acceptable)
  'CREATE INDEX IF NOT EXISTS idx_consumption_creator_month ON consumption_records(creator_id, month_key)',
  // Credit ledger: fast lookup by creator and by reference_id (payment intent, reservation)
  'CREATE INDEX IF NOT EXISTS idx_credit_ledger_creator ON credit_ledger(creator_id, created_at)',
  'CREATE INDEX IF NOT EXISTS idx_credit_ledger_reference ON credit_ledger(reference_id)',
  'CREATE INDEX IF NOT EXISTS idx_credit_ledger_status ON credit_ledger(creator_id, status)',
  // Payment transactions: reconciliation lookups by creator and by provider order
  // One Creator's bytes, looked up by their digest — the duplicate guard.
  'CREATE INDEX IF NOT EXISTS idx_vault_assets_digest ON vault_assets(subscriber_tenant_id, content_digest)',
  // «أين نُشِر هذا الأصل؟» — asked of one asset, and of one Creator's whole
  // distribution history. Both are the same index, creator first so no query
  // can accidentally cross a tenancy boundary by omitting it.
  'CREATE INDEX IF NOT EXISTS idx_distribution_receipts_creator ON distribution_receipts(creator_id, created_at)',
  'CREATE INDEX IF NOT EXISTS idx_distribution_receipts_asset ON distribution_receipts(creator_id, source_asset_id)',
  'CREATE INDEX IF NOT EXISTS idx_payment_transactions_creator ON payment_transactions(creator_id, created_at)',
  'CREATE INDEX IF NOT EXISTS idx_payment_transactions_provider_order ON payment_transactions(provider_order_id)',
  // The Sunnah is searched by subject across all collections, and fetched by
  // collection and number once a narration has been chosen.
  'CREATE INDEX IF NOT EXISTS idx_hadith_edition_number ON hadith_narrations(edition, narration_number)',
  'CREATE INDEX IF NOT EXISTS idx_transmitted_work ON transmitted_reports(work_id)',
  // The library is filtered by language on every search; its index belonged
  // here beside its table, for the same reason the table did.
  'CREATE INDEX IF NOT EXISTS idx_library_language ON library_works(language)',

  // ── Constitutional foundation, Phase B3 ──────────────────────────────────
  // Every index here exists because an ownership check or a constitutional
  // relationship reads through it on a hot path.
  //
  // Lineage: "every version of this asset" is Article 5.6's central question,
  // and it is asked by root. Without this index it is a table scan.
  'CREATE INDEX IF NOT EXISTS idx_vault_assets_root ON vault_assets(root_asset_id, subscriber_tenant_id)',
  'CREATE INDEX IF NOT EXISTS idx_vault_assets_project ON vault_assets(project_id)',
  // Projects: a Creator's own projects, and an umbrella's children (Article 7.4).
  'CREATE INDEX IF NOT EXISTS idx_projects_owner_type ON sovereign_projects(owner_id, project_type)',
  'CREATE INDEX IF NOT EXISTS idx_projects_parent ON sovereign_projects(parent_project_id)',
  // Scenes are always read as one storyboard in Creator-declared order.
  'CREATE INDEX IF NOT EXISTS idx_scenes_storyboard_order ON storyboard_scenes(storyboard_id, scene_order)',
  'CREATE INDEX IF NOT EXISTS idx_storyboards_owner ON storyboards(owner_id)',
  // Tombstones are looked up by the asset that vanished, so a derived asset can
  // still answer "where did I come from?" — Article 6.3.
  'CREATE INDEX IF NOT EXISTS idx_tombstones_asset ON asset_tombstones(asset_id)',
  'CREATE INDEX IF NOT EXISTS idx_tombstones_owner ON asset_tombstones(owner_id)',
  // The public token is the lookup a visitor's request performs. UNIQUE in the
  // table already implies an index; this names the owner path instead.
  'CREATE INDEX IF NOT EXISTS idx_publications_tenant ON sovereign_publications(publisher_tenant_id)',
  'CREATE INDEX IF NOT EXISTS idx_publications_due ON sovereign_publications(is_published, scheduled_publish_at)',
  'CREATE INDEX IF NOT EXISTS idx_cloud_accounts_creator ON cloud_accounts(creator_id)',
  'CREATE INDEX IF NOT EXISTS idx_public_links_owner ON sovereign_public_links(owner_id)',
  'CREATE INDEX IF NOT EXISTS idx_public_links_work ON sovereign_public_links(final_work_asset_id)',
];
