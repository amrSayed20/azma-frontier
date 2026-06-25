/**
 * AZMA OS - Phase 4: Materialization Architecture
 * File: src/orchestrator/al-watin/fleet/asynchronous-resolution-gateway.ts
 * 
 * The Asynchronous Resolution Gateway.
 * The inbound API boundary that receives completion signals from external generative fleets 
 * and triggers the internal deposition of the resulting asset.
 */

import { FleetDispatcher, ILedgerManager } from './fleet-dispatcher';
import { OperationState } from '../ledger/operation-ledger-types';
import { VaultAsset } from '../../../vault/sovereign-vault-types';

export class AsynchronousResolutionGateway {
  constructor(
    private readonly fleetDispatcher: FleetDispatcher,
    private readonly ledgerManager: ILedgerManager
  ) {}

  /**
   * PUSH RESOLUTION (Webhook Entry Point)
   * Handles incoming HTTP hooks from external vendors (e.g., Veo, ElevenLabs).
   * 
   * Architectural Note: The AZMA API routing layer is expected to embed the 
   * providerId and operationId within the webhook callback URL when originally 
   * dispatching the intent, allowing stateless resolution upon return.
   */
  public async handleProviderWebhook(
    providerId: string, 
    operationId: string, 
    externalJobId: string
  ): Promise<void> {
    try {
      // Execute the resolution and deposition loop invisibly.
      // We do not return the VaultAsset to the vendor; we secure it in the Vault.
      await this.fleetDispatcher.resolveOperation(operationId, externalJobId, providerId);
    } catch (error) {
      // In production, this drops an event to a Dead Letter Queue (DLQ) for admin review,
      // ensuring that a failed Vault deposition doesn't result in a lost asset.
      console.error(`Webhook Resolution Failed for Operation [${operationId}]:`, error);
      await this.ledgerManager.updateState(operationId, OperationState.FAILED);
    }
  }

  /**
   * PULL RESOLUTION (Client-Driven Polling)
   * Handles manual or automated status checks initiated by the Qiyamah UI.
   * Forces a synchronous check against the vendor's API.
   */
  public async checkAndResolveOperation(
    operationId: string, 
    authenticatedTenantId: string
  ): Promise<VaultAsset | null> {
    
    // 1. Retrieve the ledger context
    const ledgerEntry = await this.ledgerManager.getEntry(operationId);

    // 2. Absolute Multi-Tenant Security Check
    if (ledgerEntry.subscriberTenantId !== authenticatedTenantId) {
      throw new Error(`Security Breach: Tenant [${authenticatedTenantId}] is not authorized to poll Operation [${operationId}].`);
    }

    // 3. State Machine Guardrails
    if (ledgerEntry.currentState === OperationState.DEPOSITED) {
      throw new Error(`Operation [${operationId}] has already been completed and secured in the Sovereign Vault.`);
    }

    if (
      ledgerEntry.currentState !== OperationState.DISPATCHED && 
      ledgerEntry.currentState !== OperationState.MATERIALIZING
    ) {
      // Operation is still pending authorization or routing; not ready for provider resolution.
      return null; 
    }

    // 4. Validate routing metadata presence
    if (!ledgerEntry.allocatedProviderId || !ledgerEntry.externalJobId) {
      throw new Error(`Resolution Error: Operation [${operationId}] is missing external routing metadata.`);
    }

    try {
      // 5. Trigger the internal dispatcher to interrogate the vendor
      // If the vendor confirms completion, this call automatically executes the Vault deposition
      // and returns the final physical asset to the Qiyamah frontend.
      return await this.fleetDispatcher.resolveOperation(
        operationId,
        ledgerEntry.externalJobId,
        ledgerEntry.allocatedProviderId
      );
    } catch (error: any) {
      // If the resolution fails strictly because the job is still "Processing" externally, 
      // we catch it and return null so the UI can continue polling gracefully.
      if (error.message && error.message.includes('not complete')) {
        return null;
      }
      
      // Real failures (API errors, hydration failures) are thrown to the client
      throw error;
    }
  }
}