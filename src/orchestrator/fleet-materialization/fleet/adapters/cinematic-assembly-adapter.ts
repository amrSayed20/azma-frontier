/**
 * AZMA OS — Fleet Materialization Architecture
 * File: src/orchestrator/fleet-materialization/fleet/adapters/cinematic-assembly-adapter.ts
 *
 * MINISTRY VII — REAL FLEET INFRASTRUCTURE
 *
 * The Cinematic Assembly Adapter.
 * Handles CapabilityTarget.VISUAL — cinematic timeline render jobs dispatched
 * by FlattenedRenderingBridge when a CINEMATIC canvas is published.
 *
 * What "execution" means here: the CompiledAssemblyGraph (the full sovereign
 * direction state — nodes, mix plan, subtitle plan, timing) is carried inside
 * the OperationLedgerEntry's sourceIntent (serialized as JSON). The moment
 * OperationLedgerManager.createEntry() succeeds, the plan is durably stored.
 * This adapter's job is to acknowledge that durable storage and make the job
 * immediately queryable for resolution.
 *
 * Completion: checkOperationStatus() always returns isComplete:true — the
 * assembly plan is the output. Resolution deposits a sovereign internal
 * reference (sovereign://cinematic-assembly/<jobId>) into the Vault, where
 * downstream consumption logic can retrieve the full plan via the ledger.
 */

import { BaseProviderAdapter } from './base-provider-adapter';
import type { HydratedAssetContext } from '../secure-context-hydrator';
import type { ProviderCapabilities, ProviderDispatchResponse, ProviderResolutionResponse } from '../fleet-types';
import type { OperationLedgerEntry } from '../../ledger/operation-ledger-types';
import { CapabilityTarget } from '../../../../core/sovereign-orchestrator/qiyamah-intent-types';

export class CinematicAssemblyAdapter extends BaseProviderAdapter {
  public readonly providerId = 'azma-cinematic-assembly-v1';

  /** Canonical capability declaration — used by registerAdapterSync() in fleet-factory.ts. */
  public static readonly CAPABILITIES: ProviderCapabilities = {
    supportedTargets: [CapabilityTarget.VISUAL],
    maxConcurrentOperations: 100,
    unitCostMultiplier: 5.0,
    averageLatencyMs: 0,
    isAvailable: true,
  };

  public async getCapabilities(): Promise<ProviderCapabilities> {
    return CinematicAssemblyAdapter.CAPABILITIES;
  }

  protected async executeVendorDispatch(
    ledgerEntry: OperationLedgerEntry,
    _hydratedContext: HydratedAssetContext[],
  ): Promise<ProviderDispatchResponse> {
    if (ledgerEntry.capabilityTarget !== CapabilityTarget.VISUAL) {
      throw new Error(
        `Execution Error: Adapter [${this.providerId}] cannot process target [${ledgerEntry.capabilityTarget}]`,
      );
    }

    // The CompiledAssemblyGraph is already durably stored as part of
    // sourceIntent in the operation_ledger row created by createEntry().
    // The external job ID IS the operation ID — sovereign-internal execution.
    return {
      externalJobId: ledgerEntry.operationId,
      status: 'ACCEPTED',
    };
  }

  public async checkOperationStatus(externalJobId: string): Promise<ProviderResolutionResponse> {
    return {
      externalJobId,
      isComplete: true,
      isError: false,
      assetUrl: `sovereign://cinematic-assembly/${externalJobId}`,
      rawMetadata: {
        assemblyFormat: 'AZMA_CINEMATIC_ASSEMBLY_JSON',
        providerId: this.providerId,
      },
    };
  }
}
