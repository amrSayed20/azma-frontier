-- بنيةُ قاعدةِ الإنتاجِ كما قُرئت في ٢٠٢٦-١١-٠٤، حرفيًّا.
-- تُستعمَل لإثباتِ أنّ الهجرةَ تُضيف ولا تُنقِص. لا تُحرَّر بيدٍ.
CREATE TABLE goals (
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
  , archived_at_ms INTEGER, archived_by TEXT);
CREATE TABLE cinematic_ledger (
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
  );
CREATE TABLE creators (
    creator_id TEXT PRIMARY KEY,
    email TEXT,
    password_hash TEXT,
    role TEXT NOT NULL DEFAULT 'creator',
    display_name TEXT,
    preferred_locale TEXT,
    created_at INTEGER NOT NULL
  , sovereign_purpose TEXT, sovereign_purpose_created_at INTEGER, sovereign_purpose_updated_at INTEGER, vault_pin_hash TEXT, verification_state TEXT NOT NULL DEFAULT 'UNVERIFIED', verified_at INTEGER, verified_via_provider TEXT);
CREATE TABLE sessions (
    session_id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    expires_at INTEGER NOT NULL
  );
CREATE TABLE generation_records (
    record_id TEXT PRIMARY KEY,
    creator_id TEXT,
    prompt TEXT NOT NULL,
    style TEXT,
    asset_url TEXT NOT NULL,
    generated_at INTEGER NOT NULL
  , original_idea TEXT, media_type TEXT NOT NULL DEFAULT 'image', asset_id TEXT);
CREATE TABLE subscriptions (
    subscription_id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT UNIQUE,
    status TEXT NOT NULL,
    plan TEXT NOT NULL,
    current_period_end INTEGER,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
CREATE TABLE vault_assets (
    asset_id TEXT PRIMARY KEY,
    subscriber_tenant_id TEXT NOT NULL,
    originating_operation_id TEXT NOT NULL,
    capability_target TEXT NOT NULL,
    asset_family TEXT NOT NULL,
    secure_storage_uri TEXT NOT NULL,
    metadata TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  , parent_asset_id TEXT, root_asset_id TEXT, version INTEGER, derivation TEXT, creation_chamber TEXT, project_id TEXT, lifecycle_state TEXT, derivation_permission TEXT, created_by TEXT, last_modified_by TEXT, last_modified_at INTEGER, content_digest TEXT, pixel_width INTEGER, pixel_height INTEGER, expires_at_ms INTEGER);
CREATE TABLE sovereign_canvases (
    canvas_id TEXT PRIMARY KEY,
    subscriber_tenant_id TEXT NOT NULL,
    title TEXT NOT NULL,
    canvas_type TEXT NOT NULL,
    canvas_json TEXT NOT NULL,
    saved_at INTEGER NOT NULL
  );
CREATE TABLE fulfillment_assessments (
    assessment_id TEXT PRIMARY KEY,
    goal_id TEXT NOT NULL,
    publisher_tenant_id TEXT NOT NULL,
    assessed_at_ms INTEGER NOT NULL,
    overall_verdict TEXT NOT NULL,
    criteria_assessments_json TEXT NOT NULL
  );
CREATE TABLE knowledge_investigations (
    investigation_id TEXT PRIMARY KEY,
    goal_id TEXT NOT NULL,
    creator_id TEXT NOT NULL,
    record_count INTEGER NOT NULL,
    records_json TEXT NOT NULL,
    investigated_at_ms INTEGER NOT NULL
  );
CREATE TABLE observations (
    observation_id TEXT PRIMARY KEY,
    goal_id TEXT NOT NULL,
    publisher_tenant_id TEXT NOT NULL,
    publication_id TEXT NOT NULL,
    signal TEXT NOT NULL,
    outcome TEXT NOT NULL,
    observed_at_ms INTEGER NOT NULL
  );
CREATE TABLE operation_ledger (
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
  );
CREATE UNIQUE INDEX idx_creators_email ON creators(email);
CREATE TABLE consumption_records (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    creator_id TEXT NOT NULL,
    operation_type TEXT NOT NULL,
    cost_usd_estimate REAL NOT NULL,
    units INTEGER NOT NULL,
    month_key TEXT NOT NULL,
    recorded_at INTEGER NOT NULL
  );
CREATE TABLE credit_ledger (
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
  );
CREATE TABLE creator_balances (
    creator_id TEXT PRIMARY KEY,
    available_units INTEGER NOT NULL DEFAULT 0,
    reserved_units INTEGER NOT NULL DEFAULT 0,
    total_purchased INTEGER NOT NULL DEFAULT 0,
    total_spent INTEGER NOT NULL DEFAULT 0,
    updated_at INTEGER NOT NULL
  );
CREATE TABLE trial_entitlements (
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
  );
CREATE INDEX idx_consumption_creator_month ON consumption_records(creator_id, month_key);
CREATE INDEX idx_credit_ledger_creator ON credit_ledger(creator_id, created_at);
CREATE INDEX idx_credit_ledger_reference ON credit_ledger(reference_id);
CREATE INDEX idx_credit_ledger_status ON credit_ledger(creator_id, status);
CREATE TABLE payment_transactions (
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
  );
CREATE INDEX idx_payment_transactions_creator ON payment_transactions(creator_id, created_at);
CREATE INDEX idx_payment_transactions_provider_order ON payment_transactions(provider_order_id);
CREATE TABLE vault_credentials (
    credential_id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    public_key TEXT NOT NULL,
    counter INTEGER NOT NULL DEFAULT 0,
    transports TEXT,
    device_label TEXT,
    created_at INTEGER NOT NULL,
    last_used_at INTEGER
  );
CREATE INDEX idx_vault_credentials_creator ON vault_credentials(creator_id);
CREATE TABLE hadith_narrations (
    narration_id TEXT PRIMARY KEY,
    edition TEXT NOT NULL,
    collection_ar TEXT NOT NULL,
    narration_number INTEGER NOT NULL,
    text_ar TEXT NOT NULL,
    normalised_text TEXT NOT NULL,
    grades_json TEXT NOT NULL,
    ingested_at_ms INTEGER NOT NULL
  , normalised_matn TEXT NOT NULL DEFAULT '');
CREATE INDEX idx_hadith_edition_number ON hadith_narrations(edition, narration_number);
CREATE TABLE transmitted_reports (
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
);
CREATE INDEX idx_transmitted_work ON transmitted_reports(work_id);
CREATE TABLE library_works (
  work_id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  authors TEXT,
  subjects TEXT,
  language TEXT NOT NULL,
  issued TEXT,
  searchable TEXT NOT NULL,
  ingested_at_ms INTEGER NOT NULL
);
CREATE INDEX idx_library_language ON library_works(language);
CREATE TABLE sovereign_projects (
    project_id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    project_type TEXT NOT NULL,
    title TEXT NOT NULL,
    lifecycle_state TEXT NOT NULL,
    parent_project_id TEXT,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
CREATE TABLE storyboards (
    storyboard_id TEXT PRIMARY KEY,
    owner_id TEXT NOT NULL,
    knowledge_project_id TEXT,
    composition_project_id TEXT,
    title TEXT NOT NULL,
    lifecycle_state TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  );
CREATE TABLE storyboard_scenes (
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
    created_at INTEGER NOT NULL,
    updated_at INTEGER NOT NULL
  , visual_search_en TEXT, sourcing TEXT, creation_demand_ar TEXT, camera_angle TEXT);
CREATE TABLE asset_tombstones (
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
  );
CREATE TABLE sovereign_public_links (
    link_id TEXT PRIMARY KEY,
    public_token TEXT NOT NULL UNIQUE,
    owner_id TEXT NOT NULL,
    final_work_asset_id TEXT NOT NULL,
    publication_state TEXT NOT NULL,
    created_at INTEGER NOT NULL,
    revoked_at INTEGER,
    revoked_by TEXT
  );
CREATE INDEX idx_vault_assets_root ON vault_assets(root_asset_id, subscriber_tenant_id);
CREATE INDEX idx_vault_assets_project ON vault_assets(project_id);
CREATE INDEX idx_projects_owner_type ON sovereign_projects(owner_id, project_type);
CREATE INDEX idx_projects_parent ON sovereign_projects(parent_project_id);
CREATE INDEX idx_scenes_storyboard_order ON storyboard_scenes(storyboard_id, scene_order);
CREATE INDEX idx_storyboards_owner ON storyboards(owner_id);
CREATE INDEX idx_tombstones_asset ON asset_tombstones(asset_id);
CREATE INDEX idx_tombstones_owner ON asset_tombstones(owner_id);
CREATE INDEX idx_public_links_owner ON sovereign_public_links(owner_id);
CREATE INDEX idx_public_links_work ON sovereign_public_links(final_work_asset_id);
CREATE TABLE authentication_identities (
    identity_id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    provider TEXT NOT NULL,
    provider_subject TEXT NOT NULL,
    provider_email TEXT,
    linked_at INTEGER NOT NULL,
    last_authenticated_at INTEGER,
    UNIQUE(provider, provider_subject)
  );
CREATE UNIQUE INDEX idx_auth_identity_provider_subject ON authentication_identities(provider, provider_subject);
CREATE INDEX idx_auth_identity_creator ON authentication_identities(creator_id);
CREATE INDEX idx_vault_assets_digest ON vault_assets(subscriber_tenant_id, content_digest);
CREATE TABLE cloud_accounts (
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
  );
CREATE INDEX idx_cloud_accounts_creator ON cloud_accounts(creator_id);
CREATE TABLE sovereign_publications (
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
  );
CREATE INDEX idx_publications_tenant ON sovereign_publications(publisher_tenant_id);
CREATE INDEX idx_publications_due ON sovereign_publications(is_published, scheduled_publish_at);
CREATE TABLE distribution_receipts (
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
  );
CREATE INDEX idx_distribution_receipts_creator ON distribution_receipts(creator_id, created_at);
CREATE INDEX idx_distribution_receipts_asset ON distribution_receipts(creator_id, source_asset_id);
CREATE TABLE creative_jobs (
    job_id TEXT PRIMARY KEY,
    creator_id TEXT NOT NULL,
    operation TEXT NOT NULL,
    target_asset_id TEXT NOT NULL,
    second_asset_id TEXT,
    duration_seconds REAL,
    source_fps REAL,
    -- One running job per identical request. A retry finds this and waits.
    idempotency_key TEXT NOT NULL,
    state TEXT NOT NULL,
    -- The process that owns the work. A job left PROCESSING by a process that
    -- is gone is UNKNOWN, not FAILED and not running: nobody can say.
    worker_boot_id TEXT,
    provider_job_id TEXT,
    provider_credits_charged INTEGER,
    charged_units INTEGER,
    reservation_id TEXT,
    output_asset_id TEXT,
    error_reason TEXT,
    error_detail TEXT,
    created_at_ms INTEGER NOT NULL,
    updated_at_ms INTEGER NOT NULL,
    finished_at_ms INTEGER
  );
CREATE INDEX idx_creative_jobs_creator ON creative_jobs(creator_id, created_at_ms);
CREATE INDEX idx_creative_jobs_key ON creative_jobs(idempotency_key, state);
