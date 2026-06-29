/**
 * WP-012: PolicyEvaluationService (Layer 5)
 * Evaluates constitutional policies against scheduled requests
 *
 * LAYER CLASSIFICATION: Layer 5 (Decision)
 * KERNEL DEPENDENCIES: Layer 3 (SchedulingDecision), Layer 1 (ConstitutionArticleId)
 *
 * Responsibility:
 * - Maintain an ordered policy registry
 * - Evaluate policies against SchedulingDecision instances
 * - Return approve / reject / escalate verdicts with audit trail
 *
 * ASP: Single class, zero external runtime dependencies beyond types.
 *       Policy evaluation is a linear scan — O(n) on policy count,
 *       acceptable because policy lists are short (< 20 in practice).
 *
 * Determinism: Same SchedulingDecision + same registered policies →
 *               same EvaluationVerdict on every call.
 */

import type { SchedulingDecision } from './wp-008-types';
import { createAuditTrailId } from './wp-008-types';
import type {
  EvaluationPolicy,
  PolicyEvaluationResult,
  PolicyEvaluationServiceContract,
} from './wp-012-types';

export class PolicyEvaluationService implements PolicyEvaluationServiceContract {
  readonly serviceName = 'PolicyEvaluationService' as const;
  readonly version = '1.0.0' as const;

  private readonly policies: EvaluationPolicy[] = [];
  private readonly results = new Map<string, PolicyEvaluationResult>();
  private evalCounter = 0;

  async registerPolicy(policy: EvaluationPolicy): Promise<void> {
    const duplicate = this.policies.some(p => p.policyId === policy.policyId);
    if (duplicate) {
      throw new Error(`Policy "${policy.policyId}" is already registered. Duplicate policies are not allowed.`);
    }
    this.policies.push(policy);
  }

  async getPolicies(): Promise<readonly EvaluationPolicy[]> {
    return [...this.policies];
  }

  async evaluate(decision: SchedulingDecision): Promise<PolicyEvaluationResult> {
    // Evaluate policies in registration order — first match wins
    for (const policy of this.policies) {
      if (policy.criteria(decision)) {
        const result = this.buildResult(decision, policy.verdict, policy.policyId, policy.description, policy.constitutionArticleId);
        this.results.set(result.evaluationId, result);
        return result;
      }
    }

    // Default: APPROVED — no policy blocked this decision
    const result = this.buildResult(
      decision,
      'APPROVED',
      null,
      'No policy matched. Constitutional default: APPROVED.',
      decision.constitutionArticleId,
    );
    this.results.set(result.evaluationId, result);
    return result;
  }

  async getResult(evaluationId: string): Promise<PolicyEvaluationResult | null> {
    return this.results.get(evaluationId) ?? null;
  }

  private buildResult(
    decision: SchedulingDecision,
    verdict: PolicyEvaluationResult['verdict'],
    matchedPolicyId: string | null,
    rationale: string,
    articleId: PolicyEvaluationResult['constitutionArticleId'],
  ): PolicyEvaluationResult {
    const evalId = `eval-${++this.evalCounter}-${decision.requestId}`;
    return {
      evaluationId: evalId,
      requestId: decision.requestId,
      verdict,
      matchedPolicyId,
      rationale,
      constitutionArticleId: articleId,
      auditTrailId: createAuditTrailId(`audit-eval-${evalId}`),
      evaluatedAt: new Date(),
    };
  }
}

// ============================================================================
// Policy factory helpers — ASP: keep factories simple and reusable
// ============================================================================

import type { ConstitutionArticleId } from './constitution-types';
import { RequestPriority } from './wp-008-types';

/**
 * Reject any CRITICAL-priority decision that lacks constitutional escalation
 * (constitutional safety net for the highest-risk requests)
 */
export function createCriticalRejectionPolicy(articleId: ConstitutionArticleId): EvaluationPolicy {
  return {
    policyId: 'critical-rejection-safety',
    description: 'Escalate all CRITICAL priority decisions for constitutional review',
    constitutionArticleId: articleId,
    verdict: 'ESCALATED',
    criteria: (d) => d.priority === RequestPriority.CRITICAL,
  };
}

/**
 * Approve all HIGH-priority decisions automatically (agent and chamber requests)
 */
export function createHighPriorityApprovalPolicy(articleId: ConstitutionArticleId): EvaluationPolicy {
  return {
    policyId: 'high-priority-auto-approval',
    description: 'Auto-approve HIGH priority agent and chamber requests',
    constitutionArticleId: articleId,
    verdict: 'APPROVED',
    criteria: (d) => d.priority === RequestPriority.HIGH,
  };
}

/**
 * Reject requests whose constitutional authority does not match the policy article
 */
export function createArticleMismatchRejectionPolicy(
  requiredArticleId: ConstitutionArticleId,
  policyArticleId: ConstitutionArticleId,
): EvaluationPolicy {
  return {
    policyId: `article-mismatch-rejection-${requiredArticleId}`,
    description: `Reject requests not governed by article: ${requiredArticleId}`,
    constitutionArticleId: policyArticleId,
    verdict: 'REJECTED',
    criteria: (d) => d.constitutionArticleId !== requiredArticleId,
  };
}
