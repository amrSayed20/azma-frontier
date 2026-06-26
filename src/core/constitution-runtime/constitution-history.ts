import { ConstitutionArticleId, ConstitutionComplianceStatus, ConstitutionDecision, ConstitutionHistoryEntry, ConstitutionViolation } from './constitution-types';

export class ConstitutionHistory {
  private readonly entries: ConstitutionHistoryEntry[] = [];

  public record(entry: Omit<ConstitutionHistoryEntry, 'historyId' | 'recordedAt'>): ConstitutionHistoryEntry {
    const recorded: ConstitutionHistoryEntry = {
      ...entry,
      historyId: `constitution-history-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`,
      recordedAt: new Date(),
    };

    this.entries.push(recorded);
    return recorded;
  }

  public recordEvaluation(
    actionId: string,
    articleId: ConstitutionArticleId | undefined,
    decision: ConstitutionDecision,
    status: ConstitutionComplianceStatus,
    complianceScore: number,
    priorityScore: number,
    reasons: readonly string[],
    violations: readonly ConstitutionViolation[]
  ): ConstitutionHistoryEntry {
    return this.record({
      actionId,
      articleId,
      decision,
      status,
      complianceScore,
      priorityScore,
      reasons,
      violations,
    });
  }

  public getHistory(): readonly ConstitutionHistoryEntry[] {
    return [...this.entries];
  }

  public count(): number {
    return this.entries.length;
  }
}
