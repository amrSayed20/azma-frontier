/**
 * AZMA OS - Phase 6: Makman Al-Ghayah Distribution Architecture
 * File: src/chambers/makman-al-ghayah/consumption-boundary.ts
 * 
 * The Public Consumption Boundary.
 * The secure, consumer-facing storefront API gateway. Orchestrates entitlement 
 * hydration, policy evaluation, and physical asset delivery. It strictly enforces
 * the sovereign creator's commercial rules before releasing any intellectual property.
 */

import { SovereignPublication } from './publication-contracts';
import { SovereignAccessPolicyEngine, AuthorizationResult, ConsumerContext } from './access-policy-engine';
import { MonetizationLedgerGateway } from './monetization-ledger-gateway';
import { FlattenedRenderingBridge, RenderStatus } from './rendering-bridge';

// ==========================================
// 1. CONSUMPTION CONTRACTS
// ==========================================

export interface DeliveryPayload {
  readonly format: 'DYNAMIC' | 'FLATTENED';
  readonly sourceCompilationId?: string;   // Returned for pure-reference JSON serving
  readonly flattenedVaultAssetId?: string; // Returned for streaming actual MP4/WAV media
}

export interface ConsumptionResponse {
  readonly isAuthorized: boolean;
  readonly authorizationResult: AuthorizationResult;
  readonly deliveryStatus?: RenderStatus;  // Present only if authorized
  readonly payload?: DeliveryPayload;      // Present only if authorized and media is ready
}

/**
 * An internal registry abstraction to fetch publications.
 * In production, this maps to the database repository holding the master catalog.
 */
export interface IPublicationRegistry {
  getPublication(publicationId: string): Promise<SovereignPublication | null>;
}

// ==========================================
// 2. THE CONSUMPTION BOUNDARY
// ==========================================

export class PublicConsumptionBoundary {
  constructor(
    private readonly publicationRegistry: IPublicationRegistry,
    private readonly policyEngine: SovereignAccessPolicyEngine,
    private readonly ledgerGateway: MonetizationLedgerGateway,
    private readonly renderingBridge: FlattenedRenderingBridge
  ) {}

  /**
   * The master entry point for all external consumption requests.
   * 
   * @param publicationId The ID of the requested asset.
   * @param requesterTenantId The session ID of the user (undefined if guest/anonymous).
   * @param isAgeVerified Frontend assertion of age (validated structurally).
   * @param isoCountryCode Extracted from request headers (e.g., Cloudflare/AWS edge).
   */
  public async requestConsumption(
    publicationId: string,
    requesterTenantId?: string,
    isAgeVerified: boolean = false,
    isoCountryCode?: string
  ): Promise<ConsumptionResponse> {
    
    // 1. Fetch the Target Publication
    const publication = await this.publicationRegistry.getPublication(publicationId);
    if (!publication) {
      throw new Error(`Consumption Error: SovereignPublication [${publicationId}] not found or has been retracted.`);
    }

    if (!publication.isPublished) {
      return this.buildDenialResponse('ACCESS_DENIED_PRIVATE', 'This publication is currently inactive or retracted by the creator.');
    }

    // 2. Hydrate Entitlements (Ledger Gateway)
    // If the requester has a known tenant ID, we interrogate the financial ledger.
    // If they are a guest, they receive a sterile, unprivileged context.
    let consumerContext: ConsumerContext;
    
    if (requesterTenantId) {
      consumerContext = await this.ledgerGateway.hydrateConsumerContext(
        requesterTenantId, 
        isAgeVerified, 
        isoCountryCode
      );
    } else {
      consumerContext = {
        isAgeVerified,
        isoCountryCode,
        activeSubscriptions: [],
        ownedPurchases: [],
        activeRentals: []
      };
    }

    // 3. Evaluate Access (Policy Engine)
    const authResult = this.policyEngine.evaluateAccess(publication, consumerContext);

    // If denied, short-circuit and return the exact required action (e.g., REQUIRE_PURCHASE)
    if (!authResult.isAuthorized) {
      return {
        isAuthorized: false,
        authorizationResult: authResult
      };
    }

    // 4. Query Asset State (Rendering Bridge)
    // Access is granted. Now we must locate the physical data.
    const renderState = this.renderingBridge.getRenderState(publicationId);

    if (!renderState) {
      // The publication was approved but rendering hasn't even been queued.
      // This represents an edge-case ingestion lag between Phase 5 and Phase 6.
      return {
        isAuthorized: true,
        authorizationResult: authResult,
        deliveryStatus: RenderStatus.PENDING
      };
    }

    // 5. Construct Delivery Payload
    let payload: DeliveryPayload | undefined;

    if (renderState.status === RenderStatus.DYNAMIC) {
      payload = {
        format: 'DYNAMIC',
        sourceCompilationId: publication.sourceCompilationId
      };
    } else if (renderState.status === RenderStatus.COMPLETED) {
      payload = {
        format: 'FLATTENED',
        flattenedVaultAssetId: renderState.flattenedVaultAssetId
      };
    }
    // Note: If PROCESSING or FAILED, payload remains undefined, telling the UI to wait or show an error.

    return {
      isAuthorized: true,
      authorizationResult: authResult,
      deliveryStatus: renderState.status,
      payload
    };
  }

  // ==========================================
  // INTERNAL UTILITIES
  // ==========================================

  private buildDenialResponse(action: AuthorizationResult['requiredAction'], reason: string): ConsumptionResponse {
    return {
      isAuthorized: false,
      authorizationResult: {
        isAuthorized: false,
        requiredAction: action,
        rejectionReason: reason
      }
    };
  }
}