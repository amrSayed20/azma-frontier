import {
  RuntimeAdmissionEngine,
  RuntimeAdmissionRequest,
  AdmissionEvaluation,
  RuntimeDecisionRecord,
} from './wp-007-runtime-engine';
import { AdmissionPolicyRule } from './wp-007-types';
import { PolicyDecisionSeverity, PolicyDecisionOutcome } from './policy-decision-trace-types';

/**
 * Feature Adapter: Admission Policy Management
 * 
 * This layer adds policy evaluation on top of the canonical Runtime Engine.
 * Policies can be replaced without affecting the Runtime Engine.
 */
export class AdmissionPolicyAdapter {
  private runtime: RuntimeAdmissionEngine;
  private policies: Map<string, AdmissionPolicyRule>;
  private policyEvaluationOrder: string[]; // Deterministic order

  constructor(runtime: RuntimeAdmissionEngine) {
    this.runtime = runtime;
    this.policies = new Map();
    this.policyEvaluationOrder = [];
  }

  /**
   * Register a policy rule
   * Adapter-specific: policy management is feature-level, not runtime-level
   */
  public registerPolicy(policy: AdmissionPolicyRule): void {
    if (!policy.ruleId || !policy.ruleName) {
      throw new Error('Policy must have ruleId and ruleName');
    }
    this.policies.set(policy.ruleId, policy);
    // Maintain deterministic order
    this.policyEvaluationOrder = Array.from(this.policies.keys()).sort();
  }

  /**
   * Remove a policy
   */
  public removePolicy(policyId: string): void {
    this.policies.delete(policyId);
    this.policyEvaluationOrder = this.policyEvaluationOrder.filter((id) => id !== policyId);
  }

  /**
   * Evaluate a request against policies
   * Returns evaluation result ready for Runtime Engine to record
   */
  public evaluateRequest(request: RuntimeAdmissionRequest): AdmissionEvaluation {
    const startTime = Date.now();

    // Evaluate policies in deterministic order
    for (const policyId of this.policyEvaluationOrder) {
      const policy = this.policies.get(policyId)!;
      if (this.matchesPolicy(policy, request)) {
        return {
          outcome: this.policyActionToOutcome(policy.action),
          severity: this.determineSeverity(policy, request),
          reason: `Policy matched: ${policy.ruleName}`,
          authorityArticleId: policy.authorityArticleId,
          latencyMs: Date.now() - startTime,
        };
      }
    }

    // Fallback: allow if no policy matched
    return {
      outcome: 'allowed',
      severity: 'low',
      reason: 'No policy matched, default allow',
      latencyMs: Date.now() - startTime,
    };
  }

  /**
   * Full evaluation + recording pipeline
   * Adapter orchestrates: evaluate → record → route
   */
  async processRequest(request: RuntimeAdmissionRequest): Promise<AdmissionProcessResult> {
    try {
      const evaluation = this.evaluateRequest(request);
      const record = await this.runtime.evaluateAndRecord(request, evaluation);

      return {
        success: true,
        record,
        routeId: evaluation.outcome === 'allowed' ? `route-${request.requestId}` : undefined,
        escalationId: evaluation.outcome === 'escalated' ? `escalation-${request.requestId}` : undefined,
      };
    } catch (error) {
      return {
        success: false,
        error: String(error),
      };
    }
  }

  /**
   * ============================================================================
   * PRIVATE HELPERS (Adapter-specific, can be customized)
   * ============================================================================
   */

  /**
   * Pattern matching for policy conditions
   * Can be extended to support complex expressions
   */
  private matchesPolicy(policy: AdmissionPolicyRule, request: RuntimeAdmissionRequest): boolean {
    const patterns = [
      { pattern: "actionType == 'deletion'", check: () => request.actionType === 'deletion' },
      { pattern: "actionType == 'write'", check: () => request.actionType === 'write' },
      { pattern: "actionType == 'read'", check: () => request.actionType === 'read' },
      { pattern: "source == 'agent-delegated'", check: () => request.source === 'agent-delegated' },
      { pattern: "source == 'direct-user'", check: () => request.source === 'direct-user' },
      { pattern: "source == 'orchestrator-initiated'", check: () => request.source === 'orchestrator-initiated' },
    ];

    for (const { pattern, check } of patterns) {
      if (policy.condition.includes(pattern)) {
        return check();
      }
    }

    return true; // Default: match
  }

  /**
   * Convert policy action to outcome
   */
  private policyActionToOutcome(action: string): PolicyDecisionOutcome {
    switch (action) {
      case 'allow':
        return 'allowed';
      case 'deny':
        return 'denied';
      case 'escalate':
      case 'require-approval':
        return 'escalated';
      default:
        return 'allowed';
    }
  }

  /**
   * Determine severity based on action type
   */
  private determineSeverity(policy: AdmissionPolicyRule, request: RuntimeAdmissionRequest): PolicyDecisionSeverity {
    if (request.actionType === 'deletion') return 'high';
    if (request.actionType === 'write') return 'medium';
    if (policy.action === 'escalate') return 'medium';
    return 'low';
  }
}

/**
 * Result of processing a request through the adapter
 */
export interface AdmissionProcessResult {
  readonly success: boolean;
  readonly record?: RuntimeDecisionRecord;
  readonly routeId?: string;
  readonly escalationId?: string;
  readonly error?: string;
}
