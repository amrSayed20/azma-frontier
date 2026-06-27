import { DNAOrchestratorSnapshot, DNAOrchestrationTelemetry } from './dna-orchestrator-types';

export class DNAOrchestratorRuntimeState {
  private value: DNAOrchestratorSnapshot = {
    totalRequests: 0,
    totalCompleted: 0,
    totalBlocked: 0,
    totalFailed: 0,
  };

  public record(telemetry: DNAOrchestrationTelemetry): void {
    const blocked = telemetry.finishReason === 'blocked' || telemetry.finishReason === 'fallback-exhausted';
    const failed = telemetry.finishReason === 'failed';

    this.value = {
      totalRequests: this.value.totalRequests + 1,
      totalCompleted: blocked || failed ? this.value.totalCompleted : this.value.totalCompleted + 1,
      totalBlocked: blocked ? this.value.totalBlocked + 1 : this.value.totalBlocked,
      totalFailed: failed ? this.value.totalFailed + 1 : this.value.totalFailed,
      lastRequestId: telemetry.requestId,
      lastTaskType: telemetry.taskType,
      lastProviderId: telemetry.selectedProviderId,
      lastUpdatedAt: telemetry.recordedAt,
    };
  }

  public snapshot(): DNAOrchestratorSnapshot {
    return this.value;
  }
}
