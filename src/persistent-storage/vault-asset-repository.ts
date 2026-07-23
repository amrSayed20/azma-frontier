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
