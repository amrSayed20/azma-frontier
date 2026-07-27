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

export function insertVaultAsset(db: DatabaseSync, asset: VaultAsset): void {
  db.prepare(
    `INSERT INTO vault_assets
      (asset_id, subscriber_tenant_id, originating_operation_id, capability_target, asset_family, secure_storage_uri, metadata, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
  );
}

export function getVaultAsset(db: DatabaseSync, assetId: string): VaultAsset | null {
  const row = db
    .prepare(
      `SELECT asset_id, subscriber_tenant_id, originating_operation_id, capability_target, asset_family, secure_storage_uri, metadata, created_at, updated_at
       FROM vault_assets WHERE asset_id = ?`,
    )
    .get(assetId);
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
      `SELECT asset_id, subscriber_tenant_id, originating_operation_id, capability_target, asset_family, secure_storage_uri, metadata, created_at, updated_at
       FROM vault_assets WHERE subscriber_tenant_id = ? ORDER BY created_at DESC, rowid DESC`,
    )
    .all(subscriberTenantId);
  return rows.map(rowToVaultAsset);
}

function rowToVaultAsset(row: Record<string, unknown>): VaultAsset {
  return {
    assetId: row.asset_id as string,
    subscriberTenantId: row.subscriber_tenant_id as string,
    originatingOperationId: row.originating_operation_id as string,
    capabilityTarget: row.capability_target as VaultAsset['capabilityTarget'],
    assetFamily: row.asset_family as VaultAsset['assetFamily'],
    secureStorageUri: row.secure_storage_uri as string,
    metadata: JSON.parse(row.metadata as string) as VaultAssetMetadata,
    createdAt: row.created_at as number,
    updatedAt: row.updated_at as number,
  };
}
