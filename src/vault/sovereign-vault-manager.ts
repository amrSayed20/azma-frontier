/**
 * AZMA OS - Phase 4: Materialization Architecture
 * File: src/vault/sovereign-vault-manager.ts
 *
 * The Sovereign Vault Manager.
 * Executable infrastructure for depositing fleet-generated media and logic documents
 * directly into the user's permanent ownership layer.
 *
 * PERSISTENT STORAGE FOUNDATION (Engineering Package II): internal
 * storage migrated from an in-memory Map to src/persistent-storage/'s
 * durable SQLite-backed repository. Public methods, their signatures,
 * and their error-throwing behavior are unchanged — this is a storage
 * swap, not a redesign. A useful side effect: every SovereignVaultManager
 * instance now shares the same underlying database file, so the
 * previously-possible divergence between separately-constructed
 * instances (each with its own private Map) no longer occurs.
 */

import { SovereignVaultDeposit, VaultAsset } from './sovereign-vault-types';
import { IVaultManager } from '../orchestrator/fleet-materialization/fleet/fleet-dispatcher';
import { getDb, insertVaultAsset, getVaultAsset, listVaultAssetsForTenant, linkGoalToVaultAsset } from '../persistent-storage';

export class SovereignVaultManager implements IVaultManager {
  /**
   * The final act of the materialization loop.
   * Transforms the fleet deposit into a permanent, tenant-bound Sovereign Asset.
   */
  public async depositAsset(deposit: SovereignVaultDeposit): Promise<VaultAsset> {
    const now = Date.now();

    // Generates the universal asset ID representing the user's sovereign ownership
    // (Using standard generation logic in place of a full crypto package dependency)
    const newAssetId = `asset_${now}_${Math.random().toString(36).substring(2, 9)}`;

    const asset: VaultAsset = {
      assetId: newAssetId,
      subscriberTenantId: deposit.subscriberTenantId,
      originatingOperationId: deposit.operationId,
      capabilityTarget: deposit.capabilityTarget,
      assetFamily: deposit.assetFamily,
      secureStorageUri: deposit.secureStorageUri,
      metadata: deposit.metadata,
      createdAt: now,
      updatedAt: now
    };

    // Commit to the structural ownership layer
    insertVaultAsset(getDb(), asset);

    return asset;
  }

  /**
   * Retrieves an asset from the Vault while enforcing absolute tenant isolation.
   * Required when Qiyamah domains pull context for new operations.
   */
  public async getAsset(assetId: string, tenantId: string): Promise<VaultAsset> {
    const asset = getVaultAsset(getDb(), assetId);

    if (!asset) {
      throw new Error(`Vault Error: Asset [${assetId}] not found.`);
    }

    // The absolute constitutional boundary of multi-tenant isolation
    if (asset.subscriberTenantId !== tenantId) {
      throw new Error(`Vault Security Breach: Tenant [${tenantId}] attempted to access Asset [${assetId}] belonging to another sovereign owner.`);
    }

    return asset;
  }

  /**
   * INTEGRATION PACKAGE II (2026-07-25): every asset the given tenant
   * has ever deposited, most recent first — the read path Vault
   * Palace's real Creator-visible listing depends on.
   */
  public async listAssetsForTenant(tenantId: string): Promise<readonly VaultAsset[]> {
    return listVaultAssetsForTenant(getDb(), tenantId);
  }

  /**
   * PACKAGE IX — FORMAL GOAL CONTRACT TRIAD CLOSURE: writes a Goal's id
   * back onto the asset it was created from, at Goal-creation time — the
   * third of the three prerequisites the Chief Architect ruled must
   * close together. Enforces the same tenant-isolation check as
   * getAsset() before writing anything.
   */
  public async linkGoalToAsset(assetId: string, tenantId: string, goalId: string): Promise<void> {
    const asset = getVaultAsset(getDb(), assetId);

    if (!asset) {
      throw new Error(`Vault Error: Asset [${assetId}] not found.`);
    }

    if (asset.subscriberTenantId !== tenantId) {
      throw new Error(`Vault Security Breach: Tenant [${tenantId}] attempted to link a Goal onto Asset [${assetId}] belonging to another sovereign owner.`);
    }

    linkGoalToVaultAsset(getDb(), assetId, goalId);
  }
}