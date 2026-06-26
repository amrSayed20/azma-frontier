import { createConstitutionRuntimeEngine } from './constitution-bootstrap';
import { ConstitutionActionContext, ConstitutionArticleDefinition, ConstitutionEvaluationResult, ConstitutionEventRecord, ConstitutionLoadResult, ConstitutionStateSnapshot } from './constitution-types';
import { ConstitutionEngine } from './constitution-engine';

export class ConstitutionRuntime {
  private readonly engine: ConstitutionEngine;

  constructor(engine: ConstitutionEngine = createConstitutionRuntimeEngine()) {
    this.engine = engine;
  }

  public loadConstitution(): ConstitutionLoadResult {
    return this.engine.loadConstitution();
  }

  public evaluate(action: ConstitutionActionContext): ConstitutionEvaluationResult {
    return this.engine.evaluate(action);
  }

  public resolvePermissions(action: ConstitutionActionContext) {
    return this.engine.resolvePermissions(action);
  }

  public resolvePriority(action: ConstitutionActionContext) {
    return this.engine.resolvePriority(action);
  }

  public publishState(): ConstitutionStateSnapshot {
    return this.engine.publishState();
  }

  public recordHistory(action: ConstitutionActionContext, decision: ConstitutionEvaluationResult['decision'], status: ConstitutionEvaluationResult['status'], reasons: readonly string[]): void {
    this.engine.recordHistory(action, decision, status, reasons);
  }

  public getEvents(): readonly ConstitutionEventRecord[] {
    return this.engine.getEvents();
  }

  public getState(): ConstitutionStateSnapshot | undefined {
    return this.engine.getState();
  }

  public getArticle(articleId: ConstitutionArticleDefinition['articleId']): ConstitutionArticleDefinition {
    return this.engine.getArticle(articleId);
  }
}
