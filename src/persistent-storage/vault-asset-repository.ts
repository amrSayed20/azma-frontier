/**
 * AZMA OS — PERSISTENT STORAGE FOUNDATION
 * Vault Asset Metadata
 *
 * Durable storage for src/vault/SovereignVaultManager's own records,
 * replacing its prior in-memory Map. Preserves VaultAsset's existing
 * shape exactly — this is a storage-engine swap, not a redesign of the
 * Vault's own contract.
 */

import type { DatabaseSync } from 'node:sqlite';
import type { VaultAsset, VaultAssetMetadata } from '../vault/sovereign-vault-types';
// Value imports — the provenance enums and the legacy rule are executed here,
// not merely referenced in a type position.
import {
  DerivationKind,
  DerivationPermission,
  LifecycleState,
  SourceChamber,
  legacyProvenanceFor,
} from '../vault/sovereign-vault-types';

/**
 * Write an asset, with its lineage.
 *
 * Constitution Article 5.4 — «لا أصل سيادي بلا مالك، ولا نسخة بلا أصل أب أو
 * تفسير موثق، ولا مشتق بلا جذر». An asset born under the constitution always
 * records where it came from, so the fallbacks here are the only defensible
 * ones: no parent, own root, version 1, and a chamber the caller had to name.
 *
 * A caller that supplies nothing produces an ORIGINAL asset, which is true of
 * a first generation or a device upload — the two ways an asset appears with no
 * ancestor. It is not a silent legacy classification: legacy is what a row
 * written before these columns existed reads as, and only that.
 */
export function insertVaultAsset(db: DatabaseSync, asset: VaultAsset): void {
  db.prepare(
    `INSERT INTO vault_assets
      (asset_id, subscriber_tenant_id, originating_operation_id, capability_target, asset_family, secure_storage_uri, metadata, created_at, updated_at,
       parent_asset_id, root_asset_id, version, derivation, creation_chamber, project_id, lifecycle_state, derivation_permission, created_by, last_modified_by, last_modified_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    asset.assetId,
    asset.subscriberTenantId,
    asset.originatingOperationId,
    asset.capabilityTarget,
    asset.assetFamily,
    asset.secureStorageUri,
    JSON.stringify(asset.metadata),
    asset.createdAt,
    asset.updatedAt,
    asset.parentAssetId ?? null,
    // An asset with no parent is the root of its own lineage.
    asset.rootAssetId ?? asset.assetId,
    asset.version ?? 1,
    asset.derivation ?? DerivationKind.GENERATED,
    asset.creationChamber ?? SourceChamber.UNKNOWN,
    asset.projectId ?? null,
    asset.lifecycleState ?? LifecycleState.INTERMEDIATE,
    asset.derivationPermission ?? DerivationPermission.ALLOWED,
    asset.createdBy ?? asset.subscriberTenantId,
    asset.lastModifiedBy ?? null,
    asset.lastModifiedAt ?? null,
  );
}

/**
 * Every asset in one lineage, oldest first — Article 5.6.
 *
 * Queried by root rather than by walking parents: a lineage of twenty versions
 * is one statement instead of twenty, and the answer is the same because every
 * derived asset carries its root.
 */
export function listAssetLineage(db: DatabaseSync, rootAssetId: string, subscriberTenantId: string): readonly VaultAsset[] {
  const rows = db
    .prepare(
      `SELECT asset_id, subscriber_tenant_id, originating_operation_id, capability_target, asset_family, secure_storage_uri, metadata, created_at, updated_at,
              parent_asset_id, root_asset_id, version, derivation, creation_chamber, project_id, lifecycle_state, derivation_permission, created_by, last_modified_by, last_modified_at
       FROM vault_assets
       WHERE root_asset_id = ? AND subscriber_tenant_id = ?
       ORDER BY version ASC, created_at ASC`,
    )
    .all(rootAssetId, subscriberTenantId);
  return rows.map((row) => rowToVaultAsset(row as Record<string, unknown>));
}

/**
 * Record a Creator's adoption of a legacy asset — Article 5.5.
 *
 * «عند إعادة اعتماده، يبدأ نسبه الموثق من لحظة الاعتماد» and «لا يُخترع له
 * تاريخ سابق». So adoption grants the right to derive, and records who granted
 * it and when. It does NOT write a parent, a chamber or a version history the
 * asset never had — the asset becomes the honest root of a lineage that starts
 * now, and its past stays unclaimed.
 *
 * Returns false when the asset does not exist or belongs to someone else. The
 * tenant check is in the statement AND checked by the caller's own gate; both,
 * because this grants a capability.
 */
export function adoptLegacyAsset(
  db: DatabaseSync,
  assetId: string,
  subscriberTenantId: string,
  adoptedAtMs: number = Date.now(),
): boolean {
  const result = db
    .prepare(
      `UPDATE vault_assets
       SET derivation_permission = ?, last_modified_by = ?, last_modified_at = ?
       WHERE asset_id = ? AND subscriber_tenant_id = ?`,
    )
    .run(DerivationPermission.ALLOWED, subscriberTenantId, adoptedAtMs, assetId, subscriberTenantId);
  return Number(result.changes) > 0;
}

/**
 * The Creator accepts what the Chamber made for them.
 *
 * ─── WHY THIS IS THE WHOLE OF IT ─────────────────────────────────────────────
 *
 *   The Founder, 2026-09-25, asked for «التجلّي والتعديل على الأصل
 *   الناتج قبل الحفظ في الخزانة أو المعاينة» — a review before the work
 *   is treated as done.
 *
 *   MEASURED before building anything: every asset القيامة makes is ALREADY
 *   deposited as INTERMEDIATE, which is the Vault's own word for «not yet the
 *   Creator's final word». 65 assets carry it on production. And nothing in
 *   the Empire reads that state — not one line changes what a Creator sees
 *   because of it. The review the Founder asked for was half built and
 *   entirely silent.
 *
 *   So no new state, no new table, no pending-bytes held in memory. The asset
 *   is safe in the Vault from the moment it exists, which is what stopped the
 *   earlier losses; what was missing is the Creator saying «this one is
 *   right». That is this function.
 *
 *   Scoped to the owner, so one Creator cannot accept another's work.
 */
export function acceptAsset(
  db: DatabaseSync,
  assetId: string,
  subscriberTenantId: string,
  acceptedAtMs: number = Date.now(),
): boolean {
  const result = db
    .prepare(
      `UPDATE vault_assets
       SET lifecycle_state = ?, last_modified_by = ?, last_modified_at = ?
       WHERE asset_id = ? AND subscriber_tenant_id = ?`,
    )
    .run(LifecycleState.FINAL, subscriberTenantId, acceptedAtMs, assetId, subscriberTenantId);
  return Number(result.changes) > 0;
}

export function getVaultAsset(db: DatabaseSync, assetId: string): VaultAsset | null {
  const row = db
    .prepare(
      `SELECT asset_id, subscriber_tenant_id, originating_operation_id, capability_target, asset_family, secure_storage_uri, metadata, created_at, updated_at,
              parent_asset_id, root_asset_id, version, derivation, creation_chamber, project_id, lifecycle_state, derivation_permission, created_by, last_modified_by, last_modified_at
       FROM vault_assets WHERE asset_id = ?`,
    )
    .get(assetId);
  if (!row) return null;
  return rowToVaultAsset(row);
}

/**
 * SECURITY CLOSURE — find an asset by the address its bytes are served from.
 *
 * The upload authorisation gate (`app/uploads/[...path]/route.ts`) is handed a
 * URL, not an asset id, because the browser asks for `/uploads/<file>` — the
 * address `depositAsset` recorded as `secure_storage_uri`. It must learn who
 * owns that file before nginx is allowed to send it.
 *
 * Returns the asset without filtering by tenant ON PURPOSE: the caller compares
 * the owner itself and answers 404 either way, so that "not yours" and "does
 * not exist" are indistinguishable from outside. A query that filtered by
 * tenant here would give the same answer, but it would hide the ownership
 * decision inside SQL where no test can see it.
 */
export function findVaultAssetByStorageUri(db: DatabaseSync, secureStorageUri: string): VaultAsset | null {
  const row = db
    .prepare(
      `SELECT asset_id, subscriber_tenant_id, originating_operation_id, capability_target, asset_family, secure_storage_uri, metadata, created_at, updated_at,
              parent_asset_id, root_asset_id, version, derivation, creation_chamber, project_id, lifecycle_state, derivation_permission, created_by, last_modified_by, last_modified_at
       FROM vault_assets WHERE secure_storage_uri = ? LIMIT 1`,
    )
    .get(secureStorageUri);
  if (!row) return null;
  return rowToVaultAsset(row);
}

/**
 * PACKAGE IX — FORMAL GOAL CONTRACT TRIAD CLOSURE: writes the goalId
 * linkage back onto an already-deposited asset's own metadata, at Goal-
 * creation time. Reads the current metadata, merges in goalId, and
 * writes the whole object back — the same read-merge-write shape
 * already established for updateSubscription()'s patch semantics, not a
 * new persistence pattern. Returns false (never throws) if the asset
 * does not exist, so a caller can report a partial failure honestly
 * rather than crash the whole Goal-submission request.
 */
export function linkGoalToVaultAsset(db: DatabaseSync, assetId: string, goalId: string): boolean {
  const existing = getVaultAsset(db, assetId);
  if (!existing) return false;

  const updatedMetadata = { ...existing.metadata, goalId };
  db.prepare(`UPDATE vault_assets SET metadata = ?, updated_at = ? WHERE asset_id = ?`).run(
    JSON.stringify(updatedMetadata),
    Date.now(),
    assetId,
  );
  return true;
}

/**
 * INTEGRATION PACKAGE II — THE FIRST CREATOR-VISIBLE INTEGRATION
 * (2026-07-25): every asset a tenant has ever deposited, most recent
 * first. Package I made depositAsset() a genuinely reachable write path
 * (called from src/qiyamah-generation); this is the matching read path
 * a real UI needs to list them, mirroring listGenerationsForCreator's
 * own established shape exactly.
 */
export function listVaultAssetsForTenant(db: DatabaseSync, subscriberTenantId: string): readonly VaultAsset[] {
  const rows = db
    .prepare(
      `SELECT asset_id, subscriber_tenant_id, originating_operation_id, capability_target, asset_family, secure_storage_uri, metadata, created_at, updated_at,
              parent_asset_id, root_asset_id, version, derivation, creation_chamber, project_id, lifecycle_state, derivation_permission, created_by, last_modified_by, last_modified_at
       FROM vault_assets WHERE subscriber_tenant_id = ? ORDER BY created_at DESC, rowid DESC`,
    )
    .all(subscriberTenantId);
  return rows.map(rowToVaultAsset);
}

export function deleteVaultAssetByStorageUri(db: DatabaseSync, secureStorageUri: string, subscriberTenantId: string): void {
  db.prepare('DELETE FROM vault_assets WHERE secure_storage_uri = ? AND subscriber_tenant_id = ?').run(secureStorageUri, subscriberTenantId);
}

/**
 * Deletes a vault asset by its assetId, verifying ownership first.
 * Returns the deleted asset (for its secureStorageUri) or null when not
 * found or when the assetId belongs to a different tenant.
 */
export function deleteVaultAssetById(db: DatabaseSync, assetId: string, subscriberTenantId: string): VaultAsset | null {
  const existing = getVaultAsset(db, assetId);
  if (!existing || existing.subscriberTenantId !== subscriberTenantId) return null;
  db.prepare('DELETE FROM vault_assets WHERE asset_id = ? AND subscriber_tenant_id = ?').run(assetId, subscriberTenantId);
  return existing;
}

/**
 * WHERE THE LEGACY RULE IS ACTUALLY ENFORCED — Constitution Article 5.5.
 *
 * A row written before sovereign provenance existed has NULL in every
 * provenance column. That absence is resolved here, on the way out, into the
 * declared legacy state — rather than by a backfill that would write a guess
 * into the database and make it indistinguishable from a real lineage.
 *
 * The distinction matters: an UPDATE would be a claim about 47 assets' history.
 * This is a reading of what their record actually says, which is "nothing", and
 * a legacy asset is precisely an asset whose record says nothing. It also means
 * the rule is one function that tests can hold, not a migration that ran once.
 *
 * `root_asset_id` falls back to the asset's own id. That is not an invention:
 * an asset with no recorded parent IS the first of its own lineage.
 */
function rowToVaultAsset(row: Record<string, unknown>): VaultAsset {
  const assetId = row.asset_id as string;
  const legacy = legacyProvenanceFor(assetId);

  return {
    assetId,
    subscriberTenantId: row.subscriber_tenant_id as string,
    originatingOperationId: row.originating_operation_id as string,
    capabilityTarget: row.capability_target as VaultAsset['capabilityTarget'],
    assetFamily: row.asset_family as VaultAsset['assetFamily'],
    secureStorageUri: row.secure_storage_uri as string,
    metadata: JSON.parse(row.metadata as string) as VaultAssetMetadata,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,

    // ── Sovereign provenance, or the honest legacy reading of its absence ──
    parentAssetId: (row.parent_asset_id as string | null) ?? legacy.parentAssetId,
    rootAssetId: (row.root_asset_id as string | null) ?? legacy.rootAssetId,
    version: (row.version as number | null) ?? legacy.version,
    derivation: (row.derivation as VaultAsset['derivation']) ?? legacy.derivation,
    creationChamber: (row.creation_chamber as VaultAsset['creationChamber']) ?? legacy.creationChamber,
    projectId: (row.project_id as string | null) ?? legacy.projectId,
    lifecycleState: (row.lifecycle_state as VaultAsset['lifecycleState']) ?? legacy.lifecycleState,
    derivationPermission:
      (row.derivation_permission as VaultAsset['derivationPermission']) ?? legacy.derivationPermission,
    createdBy: (row.created_by as string | null) ?? null,
    lastModifiedBy: (row.last_modified_by as string | null) ?? null,
    lastModifiedAt: (row.last_modified_at as number | null) ?? null,
  };
}
