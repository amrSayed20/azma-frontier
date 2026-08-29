/**
 * AZMA OS - Phase 4: Materialization Architecture
 * File: src/orchestrator/fleet-materialization/fleet/secure-context-hydrator.ts
 * * The Secure Context Hydrator.
 * Translates stateless VaultContextReferences into physical, executable payloads 
 * for external APIs, while strictly enforcing multi-tenant isolation.
 */

import { CapabilityTarget } from '../../../core/sovereign-orchestrator/qiyamah-intent-types';
import { OperationLedgerEntry } from '../ledger/operation-ledger-types';
import { VaultAsset } from '../../../vault/sovereign-vault-types';

// The IVaultManager interface implemented in Step 7
import { IVaultManager } from './fleet-dispatcher'; 

/**
 * The physically materialized context ready for external API consumption.
 */
export interface HydratedAssetContext {
  role: string;
  contextWeight: number;
  capabilityOrigin: CapabilityTarget;
  secureUri: string; // The physical S3 URL, or direct text/JSON logic block
  rawMetadata: Record<string, unknown>;
}

export class SecureContextHydrator {
  constructor(private readonly vaultManager: IVaultManager) {}

  /**
   * Hydrates all contextual references attached to an operation.
   * Physically guarantees that the tenant requesting the operation actually owns the referenced assets.
   */
  public async hydrateOperationReferences(ledgerEntry: OperationLedgerEntry): Promise<HydratedAssetContext[]> {
    const references = ledgerEntry.sourceIntent.contextReferences;
    
    if (!references || references.length === 0) {
      return []; // Direct creation scenario (no context)
    }

    const hydratedContexts: HydratedAssetContext[] = [];

    for (const ref of references) {
      // Security Enforcement: The getAsset method throws an error if tenant IDs do not match.
      const asset: VaultAsset = await this.vaultManager.getAsset(
        ref.assetId, 
        ledgerEntry.subscriberTenantId
      );
      
      hydratedContexts.push({
        role: ref.role,
        contextWeight: ref.contextWeight,
        capabilityOrigin: asset.capabilityTarget,
        secureUri: asset.secureStorageUri,
        rawMetadata: asset.metadata
      });
    }

    return hydratedContexts;
  }

  /**
   * Non-throwing single-asset lookup — returns null when the asset is not found
   * or the tenant does not own it. Used by CinematicAssemblyAdapter to resolve
   * VoiceAssignmentDirectives without aborting the encode on a missing voice asset.
   */
  public async resolveAsset(assetId: string, tenantId: string): Promise<VaultAsset | null> {
    try {
      return await this.vaultManager.getAsset(assetId, tenantId);
    } catch {
      return null;
    }
  }
}