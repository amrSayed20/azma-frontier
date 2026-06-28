/**
 * WP-004: Policy Decision Trace Schema
 * 
 * Defines the immutable schema for recording all policy decisions made by AZMA OS runtime.
 * Every trace is immutable, hashed, and constitutionally traceable.
 * 
 * Evidence basis:
 * - AZMA_OPERATIONAL_ARCHITECTURE_BLUEPRINT_VOL1.md (Immutable Governance Traceability)
 * - AZMA_OPERATIONAL_DECISION_ARCHITECTURE_VOL2.md (Policy Enforcement Decision Layer)
 * - AZMA OS CONSTITUTION v1.0.md (Article V: Immutable Audit Lineage)
 * - AZMA_IMPLEMENTATION_COVENANT.md (Commitment V: Truthfulness Before Appearance)
 */

import { ConstitutionActionContext, ConstitutionArticleId } from './constitution-types';

/**
 * Identifies the source of a policy decision.
 * Used for constitutional traceability.
 */
export type PolicyDecisionSource = 
  | 'policy-enforcement'
  | 'escalation-resolution'
  | 'authority-validation'
  | 'boundary-evaluation'
  | 'manual-override';

/**
 * The outcome of a policy decision.
 */
export type PolicyDecisionOutcome = 
  | 'allowed'
  | 'denied'
  | 'escalated'
  | 'conditional_approval'
  | 'pending_manual_review';

/**
 * Severity classification for audit purposes.
 */
export type PolicyDecisionSeverity =
  | 'low'
  | 'medium'
  | 'high'
  | 'critical';

/**
 * Record of a single policy rule application.
 */
export interface PolicyRuleApplication {
  readonly ruleId: string;
  readonly ruleName: string;
  readonly rulePattern: string;
  readonly matched: boolean;
  readonly matchingFields: readonly string[];
}

/**
 * Authority context for policy decision.
 */
export interface PolicyDecisionAuthorityContext {
  readonly authorityDomain: string;
  readonly authorityLevel: 'foundational' | 'executive' | 'operational' | 'agent';
  readonly authorityArticleId: ConstitutionArticleId;
  readonly authorityValidationId: string;
  readonly authorityTraceId: string;
}

/**
 * Escalation context if decision was escalated.
 */
export interface PolicyDecisionEscalationContext {
  readonly escalationRequestId: string;
  readonly escalationRouteId: string;
  readonly escalationChain: readonly string[];
  readonly escalatonResolutionId: string;
  readonly escalationApprovedBy: string;
  readonly escalationApprovedAt: number;
}

/**
 * Immutable record of a single policy decision.
 */
export interface PolicyDecisionTrace {
  readonly traceId: string;
  readonly sequenceNumber: number;
  readonly timestamp: number;
  readonly actor: string;
  readonly actionType: string;
  readonly actionScope: string;
  readonly targetModule: string;
  readonly actionTitle: string;
  
  // Decision outcome
  readonly decision: PolicyDecisionOutcome;
  readonly severity: PolicyDecisionSeverity;
  readonly source: PolicyDecisionSource;
  
  // Policy application details
  readonly applicablePolicies: readonly PolicyRuleApplication[];
  readonly enforcedPolicyId?: string;
  readonly enforcedRuleName?: string;
  
  // Authority and escalation context
  readonly authority: PolicyDecisionAuthorityContext;
  readonly escalation?: PolicyDecisionEscalationContext;
  
  // Decision rationale
  readonly reasons: readonly string[];
  readonly violations: readonly string[];
  readonly conditionalApprovalTerms?: readonly string[];
  
  // Action context (immutable snapshot)
  readonly actionPayloadHash: string;
  readonly actionMetadataHash: string;
  
  // Immutability and traceability
  readonly contentHash: string;
  readonly previousTraceHash?: string;
  readonly chainVerified: boolean;
}

/**
 * Represents a linked chain of policy decision traces.
 * Each trace is hashed and linked to the previous one for tamper detection.
 */
export interface PolicyDecisionTraceChain {
  readonly chainId: string;
  readonly traceCount: number;
  readonly firstTraceId: string;
  readonly lastTraceId: string;
  readonly firstTimestamp: number;
  readonly lastTimestamp: number;
  readonly chainHash: string;
  readonly chainVerified: boolean;
}

/**
 * Request to record a policy decision trace.
 */
export interface PolicyDecisionTraceRequest {
  readonly actor: string;
  readonly action: ConstitutionActionContext;
  readonly decision: PolicyDecisionOutcome;
  readonly severity: PolicyDecisionSeverity;
  readonly source: PolicyDecisionSource;
  readonly reasons: readonly string[];
  readonly violations?: readonly string[];
  readonly conditionalApprovalTerms?: readonly string[];
  readonly enforcedPolicyId?: string;
  readonly enforcedRuleName?: string;
  readonly authorityDomain: string;
  readonly authorityLevel: PolicyDecisionAuthorityContext['authorityLevel'];
  readonly authorityArticleId: ConstitutionArticleId;
  readonly authorityValidationId: string;
  readonly authorityTraceId: string;
  readonly escalationContext?: PolicyDecisionEscalationContext;
}

/**
 * Response from recording a policy decision trace.
 */
export interface PolicyDecisionTraceResponse {
  readonly success: boolean;
  readonly traceId: string;
  readonly sequenceNumber: number;
  readonly contentHash: string;
  readonly chainVerified: boolean;
  readonly error?: string;
}

/**
 * Query request for policy decision traces.
 */
export interface PolicyDecisionTraceQueryRequest {
  readonly actor?: string;
  readonly actionType?: string;
  readonly decision?: PolicyDecisionOutcome;
  readonly severity?: PolicyDecisionSeverity;
  readonly source?: PolicyDecisionSource;
  readonly startTime?: number;
  readonly endTime?: number;
  readonly limit?: number;
}

/**
 * Query result for policy decision traces.
 */
export interface PolicyDecisionTraceQueryResult {
  readonly success: boolean;
  readonly traceCount: number;
  readonly traces: readonly PolicyDecisionTrace[];
  readonly chainVerified: boolean;
  readonly error?: string;
}

/**
 * Audit report of policy decision traces.
 */
export interface PolicyDecisionTraceAuditReport {
  readonly reportId: string;
  readonly generatedAt: number;
  readonly totalTracesAudited: number;
  readonly chainVerified: boolean;
  readonly orphanedTraces: readonly string[];
  readonly tamperedTraces: readonly string[];
  readonly chainIntegrityScore: number; // 0-100
  readonly summary: string;
}

/**
 * Snapshot of policy decision trace state.
 */
export interface PolicyDecisionTraceSnapshot {
  readonly traceCount: number;
  readonly chainId: string;
  readonly chainHash: string;
  readonly lastTraceId: string;
  readonly lastTimestamp: number;
  readonly chainVerified: boolean;
  readonly oldestTraceId: string;
  readonly oldestTimestamp: number;
}

/**
 * Statistics for policy decision traces.
 */
export interface PolicyDecisionTraceStatistics {
  readonly totalDecisions: number;
  readonly allowedCount: number;
  readonly deniedCount: number;
  readonly escalatedCount: number;
  readonly pendingReviewCount: number;
  readonly conditionalApprovalCount: number;
  readonly averageDecisionTimeMs: number;
  readonly highestSeverityDecisions: number;
  readonly decisionsBySource: Record<PolicyDecisionSource, number>;
  readonly decisionsByActor: Record<string, number>;
}
