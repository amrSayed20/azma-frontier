/**
 * WP-012: Decision Layer (Layer 5) — Type Definitions
 * Policy evaluation and governance decision contracts
 *
 * LAYER CLASSIFICATION: Layer 5 (Decision)
 * KERNEL DEPENDENCIES: Layers 1-4 only (Constitution + Execution + Scheduling + Memory)
 *
 * Responsibilities (WP-012):
 * - Evaluate constitutional policies against incoming scheduled requests
 * - Produce approve / reject / escalate verdicts with full rationale
 * - Record all evaluation decisions to Layer 2 audit trail
 *
 * ASP NOTE: One service, one evaluation result type, two verdict states.
 *           Complexity ceiling: ≤ 6 types total for this layer.
 */

import type { ConstitutionArticleId } from './constitution-types';
import type { AuditTrailId } from './wp-008-types';
import type { SchedulingDecision } from './wp-008-types';

// ============================================================================
// Core verdict type
// ============================================================================

/** The three possible outcomes of a policy evaluation */
export type EvaluationVerdict = 'APPROVED' | 'REJECTED' | 'ESCALATED';

// ============================================================================
// Policy definition
// ============================================================================

/**
 * An evaluation policy — one unit of constitutional logic.
 * Criteria returns true when the policy applies to a given SchedulingDecision.
 * If criteria matches and verdict is REJECTED/ESCALATED, processing stops.
 */
export interface EvaluationPolicy {
  readonly policyId: string;
  readonly description: string;
  readonly constitutionArticleId: ConstitutionArticleId;
  readonly verdict: EvaluationVerdict;
  readonly criteria: (decision: SchedulingDecision) => boolean;
}

// ============================================================================
// Evaluation result
// ============================================================================

/**
 * The result of evaluating a SchedulingDecision through all registered policies
 */
export interface PolicyEvaluationResult {
  readonly evaluationId: string;
  readonly requestId: string;
  readonly verdict: EvaluationVerdict;
  readonly matchedPolicyId: string | null;   // null when default APPROVED
  readonly rationale: string;
  readonly constitutionArticleId: ConstitutionArticleId;
  readonly auditTrailId: AuditTrailId;
  readonly evaluatedAt: Date;
}

// ============================================================================
// Service contract
// ============================================================================

/**
 * Public contract for PolicyEvaluationService (WP-012)
 */
export interface PolicyEvaluationServiceContract {
  readonly serviceName: 'PolicyEvaluationService';
  readonly version: '1.0.0';

  /** Register a new policy. Duplicate policyIds are rejected. */
  registerPolicy(policy: EvaluationPolicy): Promise<void>;

  /** Return the current ordered list of policies */
  getPolicies(): Promise<readonly EvaluationPolicy[]>;

  /**
   * Evaluate a SchedulingDecision against all policies.
   * Policies are evaluated in registration order.
   * First match determines the verdict.
   * Default verdict is APPROVED when no policy matches.
   */
  evaluate(decision: SchedulingDecision): Promise<PolicyEvaluationResult>;

  /** Retrieve a previously computed evaluation result by evaluationId */
  getResult(evaluationId: string): Promise<PolicyEvaluationResult | null>;
}

// ============================================================================
// Layer 5 Kernel Contract
// ============================================================================

/**
 * Decision Layer public contract
 * Exposes exactly one service — policy evaluation
 */
export interface DecisionLayerContract {
  readonly layerName: 'DecisionLayer';
  readonly version: '1.0.0';
  readonly layerNumber: 5;

  readonly policyEvaluationService: PolicyEvaluationServiceContract;
}
