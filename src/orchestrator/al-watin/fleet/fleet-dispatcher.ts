/**
 * AZMA OS - Phase 4: Materialization Architecture
 * File: src/orchestrator/al-watin/fleet/fleet-dispatcher.ts
 * 
 * The Fleet Dispatcher Service.
 * The executable operational loop that connects Qiyamah Intents, the Ledger, 
 * the Fleet Registry, and the Sovereign Vault.
 */

import { AZMAPolymorphicIntent, CapabilityTarget } from '../../../core/sovereign-orchestrator/qiyamah-intent-types';
import { OperationLedgerEntry, OperationState } from '../ledger/operation-ledger-types';
import { IFleetRegistry, IProviderAdapter, ProviderResolutionResponse } from './fleet-types';
import { SovereignVaultDeposit, AssetFamily, VaultAsset } from '../../../vault/sovereign-vault-types';

// ==========================================
// DEPENDENCY INJECTION CONTRACTS
// ==========================================

export interface ILedgerManager {
  createEntry(intent: AZMAPolymorphicIntent): Promise<OperationLedgerEntry>;
  updateState(operationId: string, state: OperationState, updates?: Partial<OperationLedgerEntry>): Promise<void>;
  getEntry(operationId: string): Promise<OperationLedgerEntry>;
}

 // Add this method to the IVaultManager interface
export interface IVaultManager {
  depositAsset(deposit: SovereignVaultDeposit): Promise<VaultAsset>;
  getAsset(assetId: string, tenantId: string): Promise<VaultAsset>; // Added this line
}

// ==========================================
// EXECUTABLE INFRASTRUCTURE
// ==========================================

export class FleetDispatcher {
  constructor(
    private readonly fleetRegistry: IFleetRegistry,
    private readonly ledgerManager: ILedgerManager,
    private readonly vaultManager: IVaultManager
  ) {}

  /**
   * INVOCATION PHASE: Safely registers, authorizes, and dispatches an intent.
   * Preserves operation-centric execution and multi-tenant isolation.
   */
  public async executeMaterialization(intent: AZMAPolymorphicIntent): Promise<OperationLedgerEntry> {
    // 1. Create Immutable Ledger Entry
    const ledgerEntry = await this.ledgerManager.createEntry(intent);

    try {
      // 2. Authorization Gate (Simulated success for core flow)
      await this.ledgerManager.updateState(ledgerEntry.operationId, OperationState.AUTHORIZED);

      // 3. Routing Logic (Provider Agnostic)
      const adapters = this.fleetRegistry.getAdaptersForCapability(intent.capabilityTarget);
      if (adapters.length === 0) {
        throw new Error(`Fleet Routing Error: No available providers for capability [${intent.capabilityTarget}]`);
      }
      
      // Simple failover routing: Select the first available adapter
      const selectedAdapter = adapters[0]; 
      await this.ledgerManager.updateState(ledgerEntry.operationId, OperationState.AUTHORIZED, {
        allocatedProviderId: selectedAdapter.providerId
      });

      // 4. Dispatch to External Provider
      const dispatchResponse = await selectedAdapter.dispatchOperation(ledgerEntry);
      
      if (dispatchResponse.status !== 'ACCEPTED') {
        throw new Error(`Provider Dispatch Error: ${dispatchResponse.rawError}`);
      }

      // 5. Update State for Async Tracking
      await this.ledgerManager.updateState(ledgerEntry.operationId, OperationState.DISPATCHED, {
        externalJobId: dispatchResponse.externalJobId
      });

      // Return the updated ledger entry to the originating chamber
      return await this.ledgerManager.getEntry(ledgerEntry.operationId);

    } catch (error) {
      await this.ledgerManager.updateState(ledgerEntry.operationId, OperationState.FAILED);
      throw error;
    }
  }

  /**
   * RESOLUTION PHASE: Handles the asynchronous return of the materialized asset
   * and executes the Sovereign Vault deposition.
   */
  public async resolveOperation(operationId: string, externalJobId: string, providerId: string): Promise<VaultAsset> {
    // 1. Retrieve Ledger Context
    const ledgerEntry = await this.ledgerManager.getEntry(operationId);
    await this.ledgerManager.updateState(operationId, OperationState.MATERIALIZING);

    // 2. Rehydrate Adapter and Check Status
    const adapters = this.fleetRegistry.getAdaptersForCapability(ledgerEntry.capabilityTarget);
    const adapter = adapters.find(a => a.providerId === providerId);
    
    if (!adapter) {
      throw new Error(`Resolution Error: Adapter [${providerId}] no longer exists in registry.`);
    }

    const resolution: ProviderResolutionResponse = await adapter.checkOperationStatus(externalJobId);

    if (resolution.isError || !resolution.isComplete || !resolution.assetUrl) {
      await this.ledgerManager.updateState(operationId, OperationState.FAILED);
      throw new Error(`Provider Resolution Failed: ${resolution.errorMessage}`);
    }

    // 3. Enforce Asset Taxonomy (Structural vs Media)
    const isStructural = 
      ledgerEntry.capabilityTarget === CapabilityTarget.WRITING || 
      ledgerEntry.capabilityTarget === CapabilityTarget.DIRECTORIAL;

    // 4. Execute Sovereign Vault Deposition
    const deposit: SovereignVaultDeposit = {
      operationId: ledgerEntry.operationId,
      subscriberTenantId: ledgerEntry.subscriberTenantId,
      capabilityTarget: ledgerEntry.capabilityTarget,
      assetFamily: isStructural ? AssetFamily.STRUCTURAL : AssetFamily.MEDIA,
      secureStorageUri: resolution.assetUrl,
      metadata: resolution.rawMetadata || {}
    };

    const finalAsset = await this.vaultManager.depositAsset(deposit);

    // 5. Close Transaction Ledger
    await this.ledgerManager.updateState(operationId, OperationState.DEPOSITED, {
      resolvedAt: Date.now()
    });

    return finalAsset;
  }
}