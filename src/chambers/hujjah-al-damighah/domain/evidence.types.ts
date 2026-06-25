/**
 * AZMA OS - Phase 9: Hujjah Al-Damighah (The Intelligence Chamber)
 * File: src/chambers/hujjah-al-damighah/domain/evidence.types.ts
 *
 * The Intelligence Domain Contracts.
 * Defines the immutable, strict data structures used throughout the
 * investigation lifecycle. Ensures all intelligence gathered by the OS
 * adheres to a standardized, sovereign format regardless of the source.
 */

// ==========================================
// 1. CONFIDENCE LEVELS
// ==========================================

export enum ConfidenceLevel {
  HIGH = 'HIGH',
  MODERATE = 'MODERATE',
  LOW = 'LOW',
  UNVERIFIED = 'UNVERIFIED'
}

// ==========================================
// 2. THE SOVEREIGN CLAIM
// ==========================================

/**
 * Represents the normalized, parsed intent of the user's inquiry.
 * This is the foundational anchor for any investigation.
 */
export interface SovereignClaim {
  readonly id: string;

  readonly originalStatement: string;

  readonly normalizedStatement: string;

  readonly targetCategory: string;

  readonly timestampMs: number;

  /**
   * Keywords extracted from the claim.
   * Used by heuristic evidence scoring engines.
   */
  readonly keywords: string[];
}

// ==========================================
// 3. BACKWARD-COMPATIBILITY ALIAS
// ==========================================

/**
 * Legacy compatibility type.
 * Older engines still refer to Claim.
 */
export type Claim = SovereignClaim;

// ==========================================
// 4. THE EVIDENCE CONTRACT
// ==========================================

/**
 * A single atomic piece of intelligence extracted from a repository.
 */
export interface Evidence {
  readonly id: string;

  /**
   * Links back to the originating claim.
   */
  readonly claimId: string;

  /**
   * Repository document identifier.
   */
  readonly sourceId: string;

  /**
   * Source provider.
   * Examples:
   * wikipedia
   * gutenberg
   * internal_vault
   */
  readonly sourceProvider: string;

  /**
   * Extracted evidence text.
   */
  readonly extractedText: string;

  /**
   * Optional context window.
   */
  readonly contextWindow?: string;

  /**
   * Numerical confidence score.
   */
  readonly confidenceScore: number;

  /**
   * Semantic confidence level.
   */
  readonly confidenceLevel: ConfidenceLevel;
}

// ==========================================
// 5. EVIDENCE BUNDLE
// ==========================================

/**
 * Final intelligence package produced by Hujjah Al-Damighah.
 */
export interface EvidenceBundle {
  readonly bundleId: string;

  readonly claim: SovereignClaim;

  readonly evidence: Evidence[];

  readonly metadata: {
    readonly investigationStatus: string;

    readonly totalSourcesScanned: number;

    readonly averageEvidenceScore: number;

    readonly [key: string]: unknown;
  };

  readonly generatedAtMs: number;
}

// ==========================================
// 6. REPOSITORY SEARCH RESULTS
// ==========================================

/**
 * Standardized search result returned by providers.
 */
export interface RepositorySearchResult {
  readonly id: string;

  readonly provider: string;

  readonly title: string;

  readonly snippet: string;

  readonly relevanceScore: number;
}