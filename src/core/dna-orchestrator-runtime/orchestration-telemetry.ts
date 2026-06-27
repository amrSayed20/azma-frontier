import {
  DNAOrchestrationRecord,
  DNAOrchestrationRequest,
  DNAOrchestrationTelemetry,
  DNAProviderSelection,
  DNARequestAnalysis,
} from './dna-orchestrator-types';
import { NormalizedAIResponse } from '../sovereign-ai-integration';

export class OrchestrationTelemetry {
  private readonly telemetry: DNAOrchestrationTelemetry[] = [];

  public build(
    request: DNAOrchestrationRequest,
    analysis: DNARequestAnalysis,
    selection: DNAProviderSelection,
    response: NormalizedAIResponse,
    startedAt: number
  ): DNAOrchestrationTelemetry {
    const value: DNAOrchestrationTelemetry = {
      requestId: request.requestId,
      taskType: analysis.classification.taskType,
      capability: analysis.classification.capability,
      selectedProviderId: selection.selectedProviderId,
      selectedModelId: selection.selectedModelId,
      fallbackCount: selection.fallbackProviderIds.length,
      latencyMs: Date.now() - startedAt,
      costEstimate: response.costEstimate,
      finishReason: response.finishReason,
      recordedAt: new Date(),
    };

    this.telemetry.push(value);
    return value;
  }

  public fromRecord(record: DNAOrchestrationRecord): DNAOrchestrationTelemetry {
    return record.telemetry;
  }

  public recent(limit: number = 20): readonly DNAOrchestrationTelemetry[] {
    return this.telemetry.slice(-limit);
  }
}
