import { ConstitutionNotLoadedError } from './constitution-errors';
import { ConstitutionEventManager } from './constitution-event-manager';
import { ConstitutionHistory } from './constitution-history';
import { ConstitutionPermissionEngine } from './constitution-permission-engine';
import { ConstitutionPolicyManager } from './constitution-policy-manager';
import { ConstitutionPriorityEngine } from './constitution-priority-engine';
import { ConstitutionRegistry } from './constitution-registry';
import { ConstitutionState } from './constitution-state';
import { ConstitutionValidator } from './constitution-validator';
import { ConstitutionActionContext, ConstitutionArticleDefinition, ConstitutionComplianceStatus, ConstitutionDecision, ConstitutionEvaluationResult, ConstitutionLoadResult, ConstitutionModuleOwner, ConstitutionStateSnapshot } from './constitution-types';

export class ConstitutionEngine {
  constructor(
    private readonly registry: ConstitutionRegistry,
    private readonly policyManager: ConstitutionPolicyManager,
    private readonly permissionEngine: ConstitutionPermissionEngine,
    private readonly priorityEngine: ConstitutionPriorityEngine,
    private readonly validator: ConstitutionValidator,
    private readonly eventManager: ConstitutionEventManager,
    private readonly state: ConstitutionState,
    private readonly history: ConstitutionHistory
  ) {}

  public loadConstitution(): ConstitutionLoadResult {
    const result = this.registry.loadConstitution();
    this.state.markLoaded(result.articleCount, result.policyCount, result.loadedAt);
    this.eventManager.publishSystemEvent('constitution-loaded', 'constitution-runtime', {
      constitutionVersion: result.constitutionVersion,
      articleCount: result.articleCount,
      policyCount: result.policyCount,
    });
    return result;
  }

  public evaluate(action: ConstitutionActionContext): ConstitutionEvaluationResult {
    if (!this.registry.isLoaded()) {
      throw new ConstitutionNotLoadedError();
    }

    const result = this.validator.validate(action);
    this.history.recordEvaluation(result.actionId, result.articleId, result.decision, result.status, result.complianceScore, result.priorityScore, result.reasons, result.violations);
    this.state.markEvaluation(result.actionId, result.decision, result.status, this.normalizePriority(result.priorityScore), this.history.count(), this.eventManager.list().length, result.evaluatedAt);
    this.eventManager.publishSystemEvent('action-evaluated', 'constitution-runtime', { decision: result.decision, status: result.status, complianceScore: result.complianceScore }, result.actionId, result.articleId);
    return result;
  }

  public resolvePermissions(action: ConstitutionActionContext) {
    return this.permissionEngine.resolvePermissions(action, this.resolveArticle(action));
  }

  public resolvePriority(action: ConstitutionActionContext) {
    return this.priorityEngine.resolvePriority(action, this.resolveArticle(action));
  }

  public publishState(): ConstitutionStateSnapshot {
    const snapshot = this.state.get();
    if (!snapshot) {
      throw new ConstitutionNotLoadedError();
    }

    this.eventManager.publishSystemEvent('state-updated', 'constitution-runtime', { snapshotVersion: snapshot.constitutionVersion });
    return snapshot;
  }

  public recordHistory(action: ConstitutionActionContext, decision: ConstitutionDecision, status: ConstitutionComplianceStatus, reasons: readonly string[]): void {
    const article = this.resolveArticle(action);
    this.history.recordEvaluation(action.actionId, article.articleId, decision, status, 100, 100, reasons, []);
  }

  public getEvents() {
    return this.eventManager.list();
  }

  public getHistory(): ConstitutionHistory {
    return this.history;
  }

  public getState(): ConstitutionStateSnapshot | undefined {
    return this.state.get();
  }

  public getRegistry(): ConstitutionRegistry {
    return this.registry;
  }

  public getArticle(articleId: ConstitutionArticleDefinition['articleId']): ConstitutionArticleDefinition {
    return this.registry.getRequiredArticle(articleId);
  }

  public publishEvent(source: ConstitutionModuleOwner, payload: Readonly<Record<string, unknown>>, actionId?: string, articleId?: ConstitutionArticleDefinition['articleId']) {
    return this.eventManager.publishSystemEvent('compliance-published', source, payload, actionId, articleId);
  }

  private resolveArticle(action: ConstitutionActionContext): ConstitutionArticleDefinition {
    const direct = this.registry.getArticles().find((article) => article.allowedActionTypes.includes(action.actionType) || article.prohibitedActionTypes.includes(action.actionType));
    const byOwner = this.registry.getArticles().find((article) => article.coreOwner === action.targetModule);
    const article = direct ?? byOwner;
    if (!article) {
      throw new ConstitutionNotLoadedError();
    }
    return article;
  }

  private normalizePriority(weight: number): NonNullable<ConstitutionStateSnapshot['lastPriority']> {
    if (weight >= 100) return 'constitutional';
    if (weight >= 80) return 'critical';
    if (weight >= 50) return 'high';
    if (weight >= 25) return 'normal';
    return 'low';
  }
}
