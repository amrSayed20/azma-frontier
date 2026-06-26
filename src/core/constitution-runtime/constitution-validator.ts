import { ConstitutionArticleNotFoundError, ConstitutionValidationError } from './constitution-errors';
import { ConstitutionPermissionEngine } from './constitution-permission-engine';
import { ConstitutionPolicyManager } from './constitution-policy-manager';
import { ConstitutionPriorityEngine } from './constitution-priority-engine';
import { ConstitutionRegistry } from './constitution-registry';
import { ConstitutionActionContext, ConstitutionArticleDefinition, ConstitutionComplianceStatus, ConstitutionDecision, ConstitutionEvaluationResult, ConstitutionViolation } from './constitution-types';

export class ConstitutionValidator {
  constructor(
    private readonly registry: ConstitutionRegistry,
    private readonly policyManager: ConstitutionPolicyManager,
    private readonly permissionEngine: ConstitutionPermissionEngine,
    private readonly priorityEngine: ConstitutionPriorityEngine
  ) {}

  public validate(action: ConstitutionActionContext): ConstitutionEvaluationResult {
    if (!this.registry.isLoaded()) {
      throw new ConstitutionValidationError('Constitution must be loaded before validation can occur.');
    }

    const article = this.resolveArticle(action);
    const permission = this.permissionEngine.resolvePermissions(action, article);
    const priority = this.priorityEngine.resolvePriority(action, article);
    const policyAssessment = this.policyManager.assess(action, article.articleId);

    const violations: ConstitutionViolation[] = [];
    if (permission.decision === 'deny' || policyAssessment.decision === 'deny') {
      violations.push(this.createViolation(article.articleId, 'Action violates constitutional prohibition.', 'critical', 'The requested action conflicts with constitutional law.', 'Reject or redesign the action to fit constitutional rules.'));
    }

    const decision = this.resolveDecision(permission.decision, policyAssessment.decision, violations.length);
    const complianceScore = this.calculateComplianceScore(article.constitutionalRules.length, violations.length, decision);
    const status = this.resolveStatus(complianceScore, decision);

    return {
      actionId: action.actionId,
      articleId: article.articleId,
      status,
      decision,
      complianceScore,
      priorityScore: priority.weight,
      permissions: permission.allowed,
      prohibitions: permission.denied,
      violations,
      appliedPolicies: policyAssessment.applicablePolicies.map((policy) => policy.policyId),
      reasons: [...permission.reasons, ...policyAssessment.reasons, priority.reason],
      evaluatedAt: new Date(),
    };
  }

  private resolveArticle(action: ConstitutionActionContext): ConstitutionArticleDefinition {
    const byActionType = this.registry.getArticles().find((article) => article.allowedActionTypes.includes(action.actionType) || article.prohibitedActionTypes.includes(action.actionType));
    const byOwner = this.registry.getArticles().find((article) => article.coreOwner === action.targetModule);
    const article = byActionType ?? byOwner;
    if (!article) {
      throw new ConstitutionArticleNotFoundError(action.actionType);
    }

    return article;
  }

  private resolveDecision(permissionDecision: ConstitutionDecision, policyDecision: ConstitutionDecision, violationCount: number): ConstitutionDecision {
    if (violationCount > 0 || permissionDecision === 'deny' || policyDecision === 'deny') {
      return 'deny';
    }
    if (permissionDecision === 'escalate' || policyDecision === 'escalate') {
      return 'escalate';
    }
    if (permissionDecision === 'defer' || policyDecision === 'defer') {
      return 'defer';
    }
    return 'allow';
  }

  private resolveStatus(complianceScore: number, decision: ConstitutionDecision): ConstitutionComplianceStatus {
    if (decision === 'deny') {
      return 'non-compliant';
    }
    if (decision === 'escalate') {
      return 'partial';
    }
    if (complianceScore >= 90) {
      return 'compliant';
    }
    if (complianceScore >= 70) {
      return 'partial';
    }
    return 'pending';
  }

  private calculateComplianceScore(ruleCount: number, violationCount: number, decision: ConstitutionDecision): number {
    const penalty = violationCount * 30 + (decision === 'defer' ? 5 : decision === 'escalate' ? 10 : decision === 'deny' ? 40 : 0);
    return Math.max(0, 100 - penalty - Math.max(0, ruleCount - 1) * 2);
  }

  private createViolation(
    articleId: string,
    rule: string,
    severity: ConstitutionViolation['severity'],
    message: string,
    remediation: string
  ): ConstitutionViolation {
    return {
      violationId: `violation-${articleId}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
      articleId: articleId as ConstitutionArticleDefinition['articleId'],
      rule,
      severity,
      message,
      remediation,
    };
  }
}
