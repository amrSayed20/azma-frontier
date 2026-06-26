import { ConstitutionComplianceStatus, ConstitutionDecision, ConstitutionPriority, ConstitutionStateSnapshot } from './constitution-types';

export class ConstitutionState {
  private loaded = false;
  private articleCount = 0;
  private policyCount = 0;
  private eventCount = 0;
  private historyCount = 0;
  private lastLoadedAt?: Date;
  private lastEvaluatedAt?: Date;
  private lastActionId?: string;
  private lastDecision?: ConstitutionDecision;
  private lastComplianceStatus?: ConstitutionComplianceStatus;
  private lastPriority?: ConstitutionPriority;

  public markLoaded(articleCount: number, policyCount: number, loadedAt: Date): void {
    this.loaded = true;
    this.articleCount = articleCount;
    this.policyCount = policyCount;
    this.lastLoadedAt = loadedAt;
  }

  public markEvaluation(
    actionId: string,
    decision: ConstitutionDecision,
    status: ConstitutionComplianceStatus,
    priority: ConstitutionPriority,
    historyCount: number,
    eventCount: number,
    evaluatedAt: Date
  ): void {
    this.lastActionId = actionId;
    this.lastDecision = decision;
    this.lastComplianceStatus = status;
    this.lastPriority = priority;
    this.historyCount = historyCount;
    this.eventCount = eventCount;
    this.lastEvaluatedAt = evaluatedAt;
  }

  public snapshot(): ConstitutionStateSnapshot {
    return {
      constitutionVersion: '1.0',
      loaded: this.loaded,
      articleCount: this.articleCount,
      policyCount: this.policyCount,
      eventCount: this.eventCount,
      historyCount: this.historyCount,
      lastLoadedAt: this.lastLoadedAt,
      lastEvaluatedAt: this.lastEvaluatedAt,
      lastActionId: this.lastActionId,
      lastDecision: this.lastDecision,
      lastComplianceStatus: this.lastComplianceStatus,
      lastPriority: this.lastPriority,
    };
  }

  public get(): ConstitutionStateSnapshot {
    return this.snapshot();
  }
}
