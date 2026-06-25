/**
 * AZMA OS - Phase 6: Makman Al-Ghayah Distribution Architecture
 * File: src/chambers/makman-al-ghayah/access-policy-engine.ts
 * 
 * The Sovereign Access Policy Engine.
 * The deterministic execution layer that evaluates consumer requests 
 * against the immutable access policies defined by the sovereign creator.
 */

import { SovereignPublication, DistributionTier } from './publication-contracts';

// ==========================================
// 1. EVALUATION CONTRACTS
// ==========================================

export type AuthorizationAction = 
  | 'GRANTED' 
  | 'REQUIRE_LOGIN' 
  | 'REQUIRE_PURCHASE' 
  | 'REQUIRE_SUBSCRIPTION' 
  | 'REQUIRE_RENTAL'
  | 'AGE_VERIFICATION_FAILED' 
  | 'GEO_BLOCKED' 
  | 'ACCESS_DENIED_PRIVATE';

export interface AuthorizationResult {
  readonly isAuthorized: boolean;
  readonly requiredAction: AuthorizationAction;
  readonly rejectionReason?: string;
}

export interface ActiveRental {
  readonly publicationId: string;
  readonly expiryTimestampMs: number;
}

/**
 * The unified profile of the entity attempting to consume the publication.
 * This object is hydrated by the authentication and monetization ledgers 
 * before being passed to the Policy Engine.
 */
export interface ConsumerContext {
  readonly consumerId?: string;           // Undefined if guest/unauthenticated
  readonly consumerTenantId?: string;     // The AZMA OS tenant ID of the consumer (if applicable)
  readonly isAgeVerified: boolean;
  readonly isoCountryCode?: string;       // e.g., 'EG', 'US', 'SA'
  readonly activeSubscriptions: string[]; // Array of publisherTenantIds the consumer is subscribed to
  readonly ownedPurchases: string[];      // Array of publicationIds the consumer permanently owns
  readonly activeRentals: ActiveRental[]; // Array of active rental agreements
}

// ==========================================
// 2. THE POLICY ENGINE
// ==========================================

export class SovereignAccessPolicyEngine {
  
  /**
   * The core deterministic evaluation loop.
   * Compares the ConsumerContext against the SovereignPublication's access policy.
   * 
   * @param publication The master publication asset requested for consumption.
   * @param consumer The hydrated profile of the requesting user.
   * @returns A structured authorization result dictating the next architectural action.
   */
  public evaluateAccess(publication: SovereignPublication, consumer: ConsumerContext): AuthorizationResult {
    
    // 1. Publisher Absolute Override
    // The creator always possesses sovereign access to their own intellectual property.
    if (consumer.consumerTenantId && consumer.consumerTenantId === publication.publisherTenantId) {
      return this.grantAccess();
    }

    // 2. Age Verification Enforcement
    if (publication.accessPolicy.requiresAgeVerification && !consumer.isAgeVerified) {
      return this.denyAccess('AGE_VERIFICATION_FAILED', `Publication [${publication.publicationId}] is age-restricted.`);
    }

    // 3. Geographic Restriction Enforcement
    // If geoRestrictions array exists and is populated, the consumer's country must be in the list.
    if (publication.accessPolicy.geoRestrictions && publication.accessPolicy.geoRestrictions.length > 0) {
      if (!consumer.isoCountryCode || !publication.accessPolicy.geoRestrictions.includes(consumer.isoCountryCode)) {
        return this.denyAccess('GEO_BLOCKED', `Publication is not available in region: ${consumer.isoCountryCode || 'UNKNOWN'}.`);
      }
    }

    // 4. Distribution Tier Evaluation (The Monetization Gates)
    return this.evaluateCommercialTier(publication, consumer);
  }

  // ==========================================
  // INTERNAL EVALUATION LOGIC
  // ==========================================

  private evaluateCommercialTier(publication: SovereignPublication, consumer: ConsumerContext): AuthorizationResult {
    const tier = publication.accessPolicy.distributionTier;

    switch (tier) {
      
      case DistributionTier.PRIVATE:
        // Already checked for Publisher Override; if we reach here, it's blocked.
        return this.denyAccess('ACCESS_DENIED_PRIVATE', 'This publication is locked in a private sovereign state.');

      case DistributionTier.PUBLIC_FREE:
        // No authentication or purchase required.
        return this.grantAccess();

      case DistributionTier.SUBSCRIPTION_ONLY:
        if (!consumer.consumerId) return this.denyAccess('REQUIRE_LOGIN', 'Authentication required for subscription verification.');
        
        if (consumer.activeSubscriptions.includes(publication.publisherTenantId)) {
          return this.grantAccess();
        }
        return this.denyAccess('REQUIRE_SUBSCRIPTION', `Active subscription to Publisher [${publication.publisherTenantId}] required.`);

      case DistributionTier.COMMERCIAL_PURCHASE:
        if (!consumer.consumerId) return this.denyAccess('REQUIRE_LOGIN', 'Authentication required to verify asset ownership.');
        
        if (consumer.ownedPurchases.includes(publication.publicationId)) {
          return this.grantAccess();
        }
        return this.denyAccess('REQUIRE_PURCHASE', 'This publication must be purchased for access.');

      case DistributionTier.COMMERCIAL_RENTAL:
        if (!consumer.consumerId) return this.denyAccess('REQUIRE_LOGIN', 'Authentication required to verify active rental.');
        
        const validRental = consumer.activeRentals.find(
          rental => rental.publicationId === publication.publicationId && rental.expiryTimestampMs > Date.now()
        );
        
        if (validRental) {
          return this.grantAccess();
        }
        return this.denyAccess('REQUIRE_RENTAL', 'An active rental agreement is required for this publication.');

      default:
        return this.denyAccess('ACCESS_DENIED_PRIVATE', `Unrecognized distribution tier: ${tier}`);
    }
  }

  private grantAccess(): AuthorizationResult {
    return {
      isAuthorized: true,
      requiredAction: 'GRANTED'
    };
  }

  private denyAccess(action: AuthorizationAction, reason: string): AuthorizationResult {
    return {
      isAuthorized: false,
      requiredAction: action,
      rejectionReason: reason
    };
  }
}