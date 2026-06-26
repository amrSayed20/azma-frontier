import { AIRoutingDecision, NormalizedAIResponse } from './provider-contracts';

export interface SovereignAIIntegrationSnapshot {
  readonly totalRequests: number;
  readonly totalResponses: number;
  readonly totalBlockedRequests: number;
  readonly totalFallbackAttempts: number;
  readonly lastRequestId?: string;
  readonly lastResponseId?: string;
  readonly lastRoutingId?: string;
  readonly lastUpdatedAt?: Date;
}

export class SovereignAIIntegrationRuntimeState {
  private snapshotValue: SovereignAIIntegrationSnapshot = {
    totalRequests: 0,
    totalResponses: 0,
    totalBlockedRequests: 0,
    totalFallbackAttempts: 0,
  };

  public recordRouting(routing: AIRoutingDecision): void {
    this.snapshotValue = {
      ...this.snapshotValue,
      totalRequests: this.snapshotValue.totalRequests + 1,
      totalBlockedRequests: routing.allowed
        ? this.snapshotValue.totalBlockedRequests
        : this.snapshotValue.totalBlockedRequests + 1,
      lastRequestId: routing.requestId,
      lastRoutingId: routing.routingId,
      lastUpdatedAt: new Date(),
    };
  }

  public recordResponse(response: NormalizedAIResponse): void {
    this.snapshotValue = {
      ...this.snapshotValue,
      totalResponses: this.snapshotValue.totalResponses + 1,
      lastResponseId: response.responseId,
      lastUpdatedAt: new Date(),
    };
  }

  public recordFallbackAttempt(): void {
    this.snapshotValue = {
      ...this.snapshotValue,
      totalFallbackAttempts: this.snapshotValue.totalFallbackAttempts + 1,
      lastUpdatedAt: new Date(),
    };
  }

  public snapshot(): SovereignAIIntegrationSnapshot {
    return this.snapshotValue;
  }
}
