import { AIExecutionRecord, SovereignAIRequest } from './provider-contracts';

export class AIMemoryBridge {
  private readonly records: AIExecutionRecord[] = [];

  public recall(request: SovereignAIRequest): readonly string[] {
    const refs = new Set(request.context.memoryRefs);

    return this.records
      .filter((record) => refs.has(record.request.requestId))
      .map((record) => record.response.content);
  }

  public store(record: AIExecutionRecord): void {
    this.records.push(record);
  }

  public recent(limit: number = 20): readonly AIExecutionRecord[] {
    return this.records.slice(-limit);
  }
}
