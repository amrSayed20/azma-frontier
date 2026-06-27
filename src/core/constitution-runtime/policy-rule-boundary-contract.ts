import { ConstitutionalAuthorityMap } from './constitutional-authority-map';
import { EscalationHierarchyContract } from './escalation-hierarchy-contract';
import { ConstitutionActionContext, ConstitutionArticleId, ConstitutionPolicyDefinition } from './constitution-types';
import { PolicyBoundaryConflictError, PolicyBoundaryNotFoundError, PolicyBoundaryTraceabilityError } from './policy-rule-boundary-contract-errors';
import {
  PolicyBoundaryEvaluation,
  PolicyBoundaryRequest,
  PolicyBoundarySnapshot,
  PolicyBoundaryTrace,
  PolicyBoundaryValidationResult,
  PolicyBoundaryViolation,
} from './policy-rule-boundary-contract-types';

function traceIdForBoundary(boundaryId: string): string {
  return `trace-policy-boundary-${boundaryId}`;
}

function normalizeRule(value: string): string {
  return value.toLowerCase().replace(/[^a-z0-9\-\s]/g, ' ').trim();
}

function ruleMatched(rule: string, action: ConstitutionActionContext): boolean {
  const normalizedRule = normalizeRule(rule);
  if (normalizedRule.length === 0) {
    return false;
  }

  const bag = [
    action.actionType,
    action.scope,
    action.targetModule,
    action.title,
    action.description,
    ...Object.keys(action.payload),
    ...Object.keys(action.metadata),
  ]
    .map((item) => normalizeRule(item))
    .join(' ');

  return bag.includes(normalizedRule);
}

function policiesForAction(action: ConstitutionActionContext, policies: readonly ConstitutionPolicyDefinition[]): readonly ConstitutionPolicyDefinition[] {
  return policies.filter((policy) => policy.scope === 'all' || policy.scope === action.scope);
}

/**
 * Public interface: Policy rule boundary contract for constitutional runtime.
 */
export class PolicyRuleBoundaryContract {
  private readonly evaluations = new Map<string, PolicyBoundaryEvaluation>();

  constructor(
    private readonly authorityMap: ConstitutionalAuthorityMap,
    private readonly escalationContract: EscalationHierarchyContract,
    private readonly getPolicies: () => readonly ConstitutionPolicyDefinition[]
  ) {}

  public evaluateBoundary(request: PolicyBoundaryRequest): PolicyBoundaryEvaluation {
    const domain = this.authorityMap.inferDomain(request.action.actionType);

    const authorityValidation = this.authorityMap.validateAuthority({
      actor: request.actor,
      domain,
      actionType: request.action.actionType,
      contextClass: request.action.title,
      highImpact: request.highImpact,
    });

    if (authorityValidation.decision === 'deny') {
      throw new PolicyBoundaryConflictError(request.boundaryId, 'Authority denied policy boundary evaluation.');
    }

    const allPolicies = this.getPolicies();
    const applicablePolicies = policiesForAction(request.action, allPolicies);
    const violations: PolicyBoundaryViolation[] = [];
    const reasons: string[] = [];
    let decision: PolicyBoundaryEvaluation['decision'] = 'allow';

    for (const policy of applicablePolicies) {
      const matched = policy.rules.some((rule) => ruleMatched(rule, request.action));

      if (policy.mode === 'deny' && matched) {
        decision = 'deny';
        violations.push({
          policyId: policy.policyId,
          articleId: policy.articleId,
          reason: `Policy ${policy.name} denies matched boundary condition.`,
        });
        reasons.push(`Denied by ${policy.policyId}.`);
        continue;
      }

      if (policy.mode === 'require' && !matched && decision !== 'deny') {
        decision = 'escalate';
        reasons.push(`Required boundary rule not satisfied for ${policy.policyId}.`);
        violations.push({
          policyId: policy.policyId,
          articleId: policy.articleId,
          reason: `Required rule missing for policy ${policy.name}.`,
        });
        continue;
      }

      if (policy.mode === 'prioritize' && matched && decision === 'allow') {
        decision = 'defer';
        reasons.push(`Deferred by priority boundary in ${policy.policyId}.`);
      }
    }

    if (applicablePolicies.length === 0) {
      decision = 'escalate';
      reasons.push('No policy boundary coverage for action scope; escalation required.');
    }

    const escalationNeeded = decision === 'escalate' || request.highImpact || authorityValidation.decision === 'escalate-required';
    let escalationId: string | undefined;

    if (escalationNeeded && request.autoEscalate !== false) {
      escalationId = `${request.boundaryId}-escalation`;
      this.escalationContract.planEscalation({
        escalationId,
        actor: request.actor,
        domain,
        actionType: request.action.actionType,
        contextClass: request.action.title,
        trigger: decision === 'escalate' ? 'policy-conflict' : 'high-impact',
        highImpact: request.highImpact,
      });
      reasons.push('Escalation route planned by policy boundary contract.');
    }

    const constitutionalAnchors = Array.from(new Set<ConstitutionArticleId>(applicablePolicies.map((policy) => policy.articleId)));
    if (constitutionalAnchors.length === 0) {
      constitutionalAnchors.push('constitutional-synthesis');
      constitutionalAnchors.push('ratification-principle');
    }

    const evaluation: PolicyBoundaryEvaluation = {
      boundaryId: request.boundaryId,
      domain,
      decision,
      applicablePolicies,
      appliedPolicyIds: applicablePolicies.map((policy) => policy.policyId),
      violations,
      reasons: reasons.length > 0 ? reasons : ['No boundary conflict detected.'],
      escalationId,
      traceId: traceIdForBoundary(request.boundaryId),
      constitutionalAnchors,
    };

    this.evaluations.set(request.boundaryId, evaluation);
    return evaluation;
  }

  public traceBoundary(boundaryId: string): PolicyBoundaryTrace {
    const evaluation = this.evaluations.get(boundaryId);
    if (!evaluation) {
      throw new PolicyBoundaryNotFoundError(boundaryId);
    }

    if (!evaluation.traceId || evaluation.constitutionalAnchors.length === 0) {
      throw new PolicyBoundaryTraceabilityError(boundaryId);
    }

    return {
      boundaryId,
      traceId: evaluation.traceId,
      decision: evaluation.decision,
      domain: evaluation.domain,
      policyIds: evaluation.appliedPolicyIds,
      constitutionalAnchors: evaluation.constitutionalAnchors,
    };
  }

  public getSnapshot(): PolicyBoundarySnapshot {
    return {
      evaluations: Array.from(this.evaluations.values()),
    };
  }

  public validateModel(): PolicyBoundaryValidationResult {
    const untraceableBoundaries: string[] = [];
    const emptyPolicyCoverage: string[] = [];

    for (const [boundaryId, evaluation] of this.evaluations.entries()) {
      if (!evaluation.traceId || evaluation.constitutionalAnchors.length === 0) {
        untraceableBoundaries.push(boundaryId);
      }
      if (evaluation.appliedPolicyIds.length === 0 && evaluation.decision !== 'escalate') {
        emptyPolicyCoverage.push(boundaryId);
      }
    }

    return {
      valid: untraceableBoundaries.length === 0 && emptyPolicyCoverage.length === 0,
      untraceableBoundaries,
      emptyPolicyCoverage,
    };
  }
}

export function createPolicyRuleBoundaryContract(
  authorityMap: ConstitutionalAuthorityMap,
  escalationContract: EscalationHierarchyContract,
  getPolicies: () => readonly ConstitutionPolicyDefinition[]
): PolicyRuleBoundaryContract {
  return new PolicyRuleBoundaryContract(authorityMap, escalationContract, getPolicies);
}
