/**
 * WP-007: Runtime Admission Controller — Type Definitions
 * 
 * Purpose: Define types for first-line policy enforcement at runtime entry point.
 * Accepts/rejects user requests based on policy rules from WP-003.
 * 
 * Sovereign Implementation Criteria:
 * 1. AZMA AI Sovereignty — Provider-agnostic routing
 * 2. Agent Society Reusability — Public API for agents
 * 3. Future Ecosystem Compatible — Stable contracts
 * 4. Provider Independent — No external service assumptions
 * 5. Canonical Contracts — Uses AuditEventMetadata (WP-005)
 * 6. Constitutional Traceability — Links to WP-001-006
 * 7. Multimodal Execution Ready — Generic context model
 * 8. Deterministic Concurrency — No timing-dependent logic
 * 9. Minimize Architectural Debt — Leverages WP-005 abstractions
 * 10. Strengthen Kernel — Reinforces authority boundaries (WP-001)
 */

import { ConstitutionArticleId } from './constitution-types';
import { PolicyDecisionOutcome, PolicyDecisionSeverity } from './policy-decision-trace-types';

/**
 * Represents a user request entering the runtime.
 * Generic payload, agent-society compatible.
 */
export interface RuntimeUserRequest {
  readonly requestId: string;
  readonly userId: string;
  readonly actionType: string;
  readonly actionPayload: Record<string, unknown>;
  readonly timestamp: number;
  readonly source: 'direct-user' | 'agent-delegated' | 'orchestrator-initiated';
}

/**
 * Policy enforcement rules from WP-003.
 * Admission controller applies these rules to incoming requests.
 */
export interface AdmissionPolicyRule {
  readonly ruleId: string;
  readonly ruleName: string;
  readonly condition: string; // e.g., "actionType == 'deletion' && !hasApproval"
  readonly action: 'allow' | 'deny' | 'require-approval' | 'escalate';
  readonly escalationTarget?: string;
  readonly authorityArticleId?: ConstitutionArticleId;
}

/**
 * Result of admission policy evaluation.
 */
export interface AdmissionDecision {
  readonly requestId: string;
  readonly allowed: boolean;
  readonly decision: PolicyDecisionOutcome;
  readonly severity: PolicyDecisionSeverity;
  readonly matchedRuleId?: string;
  readonly reason: string;
  readonly escalationRequired: boolean;
  readonly escalationTarget?: string;
  readonly authorityArticleId?: ConstitutionArticleId;
  readonly timestamp: number;
}

/**
 * Request accepted and routed to orchestration layer.
 */
export interface AdmissionApprovedRoute {
  readonly requestId: string;
  readonly routeId: string;
  readonly orchestratorPath: string;
  readonly queueId: string;
  readonly admissionTime: number;
  readonly latency: number; // milliseconds
}

/**
 * Request rejected or escalated.
 */
export interface AdmissionDeniedResponse {
  readonly requestId: string;
  readonly decision: PolicyDecisionOutcome;
  readonly reason: string;
  readonly escalationId?: string;
  readonly denialTime: number;
}

/**
 * Admission controller configuration.
 */
export interface AdmissionControllerConfig {
  readonly maxRequestPayloadSizeBytes: number;
  readonly maxLatencyMs: number; // SLA: <50ms
  readonly enabledPolicies: readonly string[];
  readonly auditVerbose: boolean;
  readonly fallbackBehavior: 'allow' | 'deny' | 'escalate';
}

/**
 * Statistics for admission controller monitoring.
 */
export interface AdmissionControllerStatistics {
  readonly totalRequestsProcessed: number;
  readonly totalApproved: number;
  readonly totalDenied: number;
  readonly totalEscalated: number;
  readonly averageLatencyMs: number;
  readonly maxLatencyMs: number;
  readonly minLatencyMs: number;
  readonly policyViolationRate: number; // 0-1
  readonly lastResetTime: number;
}

/**
 * Error types for admission controller.
 */
export class AdmissionControllerError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdmissionControllerError';
  }
}

export class AdmissionPolicyError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdmissionPolicyError';
  }
}

export class AdmissionLatencyViolationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdmissionLatencyViolationError';
  }
}

export class AdmissionEscalationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'AdmissionEscalationError';
  }
}
