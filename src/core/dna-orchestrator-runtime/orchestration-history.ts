import { DNAOrchestrationRecord } from './dna-orchestrator-types';

export class OrchestrationHistory {
  private readonly records: DNAOrchestrationRecord[] = [];

  public record(value: DNAOrchestrationRecord): void {
    this.records.push(value);
  }

  public recent(limit: number = 20): readonly DNAOrchestrationRecord[] {
    return this.records.slice(-limit);
  }

  public all(): readonly DNAOrchestrationRecord[] {
    return [...this.records];
  }
}
