/**
 * AZMA OS - Phase 6: Makman Al-Ghayah Distribution Architecture
 * File: src/chambers/makman-al-ghayah/publication-contracts.ts
 * 
 * The Publication & Distribution Contracts.
 * Defines the commercial, structural, and access-control wrappers 
 * applied to a CompiledAssemblyGraph to make it available to consumers.
 */

// Note: In production, this imports from the Ras Al-Amr pre-publishing boundary
// import { CompiledAssemblyGraph } from '../ras-al-amr/pre-publishing-boundary';

export enum DistributionTier {
  PRIVATE = 'PRIVATE',                     // Internal/Creator preview only
  COMMERCIAL_RENTAL = 'COMMERCIAL_RENTAL', // Time-bound access
  COMMERCIAL_PURCHASE = 'COMMERCIAL_PURCHASE', // Permanent consumer vault access
  SUBSCRIPTION_ONLY = 'SUBSCRIPTION_ONLY', // Bounded by tenant/platform subscription
  PUBLIC_FREE = 'PUBLIC_FREE'              // Open distribution
}

export interface PricingModel {
  basePrice: number;
  currency: string;
  rentalDurationHours?: number; // Strictly required if tier is COMMERCIAL_RENTAL
}

export interface AccessPolicy {
  distributionTier: DistributionTier;
  pricing?: PricingModel;
  geoRestrictions?: string[];   // ISO country codes allowing/denying access
  requiresAgeVerification: boolean;
}

/**
 * The definitive commercial asset within Makman Al-Ghayah.
 * Transforms an assembly graph into a market-ready sovereign product.
 */
export interface SovereignPublication {
  publicationId: string;
  sourceCompilationId: string; // The physical link back to the Phase 5 CompiledAssemblyGraph
  publisherTenantId: string;   // The commercial owner/creator
  
  // Public-Facing Presentation
  title: string;
  description: string;
  coverArtUri?: string;
  
  // Consumption & Monetization Logic
  accessPolicy: AccessPolicy;
  
  // Lifecycle State
  isPublished: boolean;
  publishedAt?: number;
  createdAt: number;
  updatedAt: number;
}