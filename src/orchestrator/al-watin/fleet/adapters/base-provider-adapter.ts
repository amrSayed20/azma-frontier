/**
 * AZMA OS - Phase 4: Materialization Architecture
 * File: src/orchestrator/al-watin/fleet/adapters/base-provider-adapter.ts
 * * The Agnostic Base Provider Adapter.
 * The foundational abstract class that all specific vendor implementations 
 * (e.g., Veo, Runway, Kling, ElevenLabs) must extend.
 */

import { IProviderAdapter, ProviderCapabilities, ProviderDispatchResponse, ProviderResolutionResponse } from '../fleet-types';
import { OperationLedgerEntry } from '../../ledger/operation-ledger-types';
import { SecureContextHydrator, HydratedAssetContext } from '../secure-context-hydrator';

export abstract class BaseProviderAdapter implements IProviderAdapter {
  public abstract readonly providerId: string;
  
  constructor(protected readonly hydrator: SecureContextHydrator) {}

  /**
   * Enforces that every provider declares its constitutional capabilities.
   */
  public abstract getCapabilities(): Promise<ProviderCapabilities>;
  
  /**
   * The standardized dispatch wrapper. 
   * Automates the secure hydration of Vault assets and catches vendor-level network exceptions,
   * ensuring the Fleet Dispatcher never crashes due to a bad API key or malformed intent.
   */
  public async dispatchOperation(ledgerEntry: OperationLedgerEntry): Promise<ProviderDispatchResponse> {
    try {
      // 1. Securely translate the abstract intent references into physical context
      const hydratedContext = await this.hydrator.hydrateOperationReferences(ledgerEntry);
      
      // 2. Delegate to the concrete vendor implementation
      return await this.executeVendorDispatch(ledgerEntry, hydratedContext);
      
    } catch (error) {
      return {
        externalJobId: 'FAILED_PRE_DISPATCH',
        status: 'FAILED',
        rawError: `Adapter Execution Error [${this.providerId}]: ${(error as Error).message}`
      };
    }
  }

  /**
   * The abstract method implemented by concrete vendor adapters to execute proprietary API calls.
   * At this stage, the vendor adapter has access to the physical, securely hydrated context assets.
   */
  protected abstract executeVendorDispatch(
    ledgerEntry: OperationLedgerEntry, 
    hydratedContext: HydratedAssetContext[]
  ): Promise<ProviderDispatchResponse>;

  /**
   * Checks the status of the vendor's asynchronous materialization queue.
   */
  public abstract checkOperationStatus(externalJobId: string): Promise<ProviderResolutionResponse>;
}