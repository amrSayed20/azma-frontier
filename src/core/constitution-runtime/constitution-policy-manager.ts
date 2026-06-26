import { ConstitutionActionContext, ConstitutionArticleId, ConstitutionDecision, ConstitutionPolicyDefinition, ConstitutionPolicyMode, ConstitutionPriority } from './constitution-types';
import { ConstitutionRegistry } from './constitution-registry';

export interface ConstitutionPolicyAssessment {
  readonly actionId: string;
  readonly articleId?: ConstitutionArticleId;
  readonly decision: ConstitutionDecision;
  readonly priority: ConstitutionPriority;
  readonly applicablePolicies: readonly ConstitutionPolicyDefinition[];
  readonly reasons: readonly string[];
}

export class ConstitutionPolicyManager {
  constructor(private readonly registry: ConstitutionRegistry) {}

  public getPolicies(): readonly ConstitutionPolicyDefinition[] {
    return this.registry.getPolicies();
  }

  public getPoliciesForArticle(articleId: ConstitutionArticleId): readonly ConstitutionPolicyDefinition[] {
    return this.registry.getPoliciesForArticle(articleId);
  }

  public registerPolicy(policy: ConstitutionPolicyDefinition): ConstitutionPolicyDefinition {
    return this.registry.registerPolicy(policy);
  }

  public assess(action: ConstitutionActionContext, articleId?: ConstitutionArticleId): ConstitutionPolicyAssessment {
    const applicablePolicies = articleId ? this.getPoliciesForArticle(articleId) : this.getPolicies();
    const reasons: string[] = [];
    let decision: ConstitutionDecision = 'allow';
    let priority: ConstitutionPriority = action.priority;

    for (const policy of applicablePolicies) {
      const policyDecision = this.evaluatePolicy(policy.mode, action.actionType, policy.rules);
      if (policyDecision === 'deny') {
        decision = 'deny';
        reasons.push(`Policy ${policy.name} denies the requested action.`);
      } else if (policyDecision === 'escalate' && decision !== 'deny') {
        decision = 'escalate';
        reasons.push(`Policy ${policy.name} requires escalation.`);
      } else if (policyDecision === 'defer' && decision === 'allow') {
        decision = 'defer';
        reasons.push(`Policy ${policy.name} defers execution pending review.`);
      }

      if (policy.priority === 'constitutional') {
        priority = 'constitutional';
      } else if (policy.priority === 'critical' && priority !== 'constitutional') {
        priority = 'critical';
      } else if (policy.priority === 'high' && priority === 'normal') {
        priority = 'high';
      }
    }

    if (reasons.length === 0) {
      reasons.push('No policy conflict detected.');
    }

    return { actionId: action.actionId, articleId, decision, priority, applicablePolicies, reasons };
  }

  private evaluatePolicy(mode: ConstitutionPolicyMode, actionType: string, rules: readonly string[]): ConstitutionDecision {
    if (mode === 'deny') {
      return 'deny';
    }

    const matchesRule = rules.some((rule) => actionType.includes(rule));
    if (mode === 'require') {
      return matchesRule ? 'allow' : 'escalate';
    }

    if (mode === 'prioritize') {
      return matchesRule ? 'defer' : 'allow';
    }

    return 'allow';
  }
}
