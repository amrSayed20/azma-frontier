/**
 * AZMA OS - Phase 4: Materialization Architecture
 * File: src/vault/sovereign-vault-manager.ts
 * 
 * The Sovereign Vault Manager.
 * Executable infrastructure for depositing fleet-generated media and logic documents
 * directly into the user's permanent ownership layer.
 */

import { SovereignVaultDeposit, VaultAsset } from './sovereign-vault-types';
import { IVaultManager } from '../orchestrator/al-watin/fleet/fleet-dispatcher';

export class SovereignVaultManager implements IVaultManager {
  private readonly vaultStore: Map<string, VaultAsset>;

  constructor() {
    this.vaultStore = new Map<string, VaultAsset>();
  }

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
    this.vaultStore.set(asset.assetId, asset);
    
    return asset;
  }

  /**
   * Retrieves an asset from the Vault while enforcing absolute tenant isolation.
   * Required when Qiyamah domains pull context for new operations.
   */
  public async getAsset(assetId: string, tenantId: string): Promise<VaultAsset> {
    const asset = this.vaultStore.get(assetId);
    
    if (!asset) {
      throw new Error(`Vault Error: Asset [${assetId}] not found.`);
    }
    
    // The absolute constitutional boundary of multi-tenant isolation
    if (asset.subscriberTenantId !== tenantId) {
      throw new Error(`Vault Security Breach: Tenant [${tenantId}] attempted to access Asset [${assetId}] belonging to another sovereign owner.`);
    }
    
    return asset;
  }
}