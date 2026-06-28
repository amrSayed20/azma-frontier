/**
 * WP-006: Constitutional Rationale Linkage — Types & Interfaces
 * 
 * Immutable types for decision-to-constitution linkage with Agent Society readiness.
 * 
 * Architecture Basis:
 * - AZMA OS Constitution v1.0 (Article 7: Sovereign Constitutional Memory)
 * - Sovereign Intelligence Manifest (Principle 2: Memory Is Always Sovereign)
 * - Implementation Covenant (Commitment V: Truthfulness Before Appearance)
 */

import { ConstitutionArticleId } from './constitution-types';
import { PolicyDecisionTrace } from './policy-decision-trace-types';

// ============================================================================
// AGENT-FACING RUNTIME CONTRACTS
// ============================================================================

/**
 * Immutable record linking a policy decision to its constitutional basis.
 * 
 * Consumed by: Sovereign Agents, Orchestrators, Human Approval Flows, Memory Systems
 * 
 * Primary use case: "Show me the constitutional rationale for decision D"
 * Secondary use: "What decisions were made under Article X?"
 */
export interface DecisionRationaleRecord {
  readonly recordId: string;
  readonly decisionId: string;
  readonly traceId: string;
  
  // Constitutional Linkage
  readonly articleId: ConstitutionArticleId;
  readonly articleNumber: number;
  readonly articleTitle: string;
  
  // Rationale (Human-readable or AZMA-generated)
  readonly rationale: string;  // Must be non-empty, meaningful
  readonly rationaleSource: 'human-operator' | 'azma-internal' | 'orchestrator-agent';
  
  // Version Tracking (for future constitutional evolution)
  readonly recordedUnderArticleVersion: string;  // e.g., "1.0"
  readonly validatedAt: number;
  readonly validationStatus: 'valid' | 'requires-review' | 'potentially-stale';
  
  // Audit Trail
  readonly linkedAt: number;
  readonly linkedBy: string;  // Actor who created linkage
  readonly linkedByRole: 'system' | 'human' | 'agent' | 'orchestrator';
  
  // Immutability Proof
  readonly contentHash: string;  // SHA256 of rationale + article
  readonly auditBackboneId?: string;  // Reference to WP-005 audit record
}

/**
 * Query criteria for decision-to-article discovery.
 * 
 * Consumed by: Sovereign Agents, Decision Systems, Intelligence Layer
 */
export interface DecisionArticleQueryCriteria {
  readonly articleId?: ConstitutionArticleId;
  readonly decisionId?: string;
  readonly actor?: string;
  readonly rationaleSource?: 'human-operator' | 'azma-internal' | 'orchestrator-agent';
  readonly validationStatus?: 'valid' | 'requires-review' | 'potentially-stale';
  readonly timeRange?: {
    readonly start: number;
    readonly end: number;
  };
  readonly limit?: number;
  readonly orderBy?: 'timestamp' | 'article' | 'actor';
}

/**
 * Statistics on decisions within a constitutional article scope.
 * 
 * Consumed by: Decision Systems, Intelligence Layer
 */
export interface ArticleDecisionStatistics {
  readonly articleId: ConstitutionArticleId;
  readonly articleNumber: number;
  readonly articleTitle: string;
  
  readonly totalDecisions: number;
  readonly humanRationales: number;
  readonly automatedRationales: number;
  readonly validRationales: number;
  readonly requiresReview: number;
  readonly potentiallyStalse: number;
  
  readonly uniqueActors: readonly string[];
  readonly dateRange: {
    readonly oldest: number;
    readonly newest: number;
  };
  
  readonly rationale: {
    readonly averageLengthChars: number;
    readonly mostFrequentActors: readonly string[];
    readonly decisionOutcomes: {
      readonly allowed: number;
      readonly denied: number;
      readonly escalated: number;
      readonly conditional: number;
    };
  };
}

/**
 * Batched rationale linkage request (for bulk operations).
 * 
 * Used by: Memory Systems, Intelligence Layer initialization
 */
export interface RationaleLinkageBatch {
  readonly batchId: string;
  readonly timestamp: number;
  readonly links: readonly {
    readonly decisionId: string;
    readonly articleId: ConstitutionArticleId;
    readonly rationale: string;
    readonly linkedBy: string;
  }[];
}

// ============================================================================
// INTERNAL RUNTIME CONTRACTS (Not exported to agents)
// ============================================================================

/**
 * Internal index mapping articles to decisions for fast O(1) lookup.
 */
export interface ArticleDecisionIndex {
  readonly byArticle: Map<ConstitutionArticleId, Set<string>>;  // article -> decision IDs
  readonly byDecision: Map<string, ConstitutionArticleId>;  // decision ID -> article
}

/**
 * Rationale validation result.
 */
export interface RationaleValidationResult {
  readonly valid: boolean;
  readonly errors: readonly string[];
  readonly warnings: readonly string[];
}

/**
 * Immutable audit event for rationale linkage (stored in WP-005).
 */
export interface RationaleLinkageAuditEvent {
  readonly eventId: string;
  readonly eventType: 'rationale-linked' | 'rationale-updated' | 'rationale-validated';
  readonly decisionId: string;
  readonly articleId: ConstitutionArticleId;
  readonly timestamp: number;
  readonly actor: string;
  readonly contentHash: string;
}

// ============================================================================
// ERROR TYPES
// ============================================================================

export class RationaleLinkageError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, RationaleLinkageError.prototype);
  }
}

export class RationaleValidationError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, RationaleValidationError.prototype);
  }
}

export class ArticleNotFoundError extends Error {
  constructor(articleId: ConstitutionArticleId) {
    super(`Article not found: ${articleId}`);
    Object.setPrototypeOf(this, ArticleNotFoundError.prototype);
  }
}

export class DecisionNotFoundError extends Error {
  constructor(decisionId: string) {
    super(`Decision not found: ${decisionId}`);
    Object.setPrototypeOf(this, DecisionNotFoundError.prototype);
  }
}

export class RationaleLinkageQueryError extends Error {
  constructor(message: string) {
    super(message);
    Object.setPrototypeOf(this, RationaleLinkageQueryError.prototype);
  }
}
