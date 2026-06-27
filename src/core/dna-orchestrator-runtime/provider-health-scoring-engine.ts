import { AIProviderTelemetry } from '../sovereign-ai-integration';

export class ProviderHealthScoringEngine {
  public score(telemetry: AIProviderTelemetry | undefined): number {
    if (!telemetry) {
      return 0.75;
    }

    const availability = telemetry.status === 'available' ? 1 : telemetry.status === 'degraded' ? 0.55 : 0;
    const success = telemetry.successRate;
    const latency = telemetry.averageLatencyMs <= 0 ? 1 : 1 / (1 + telemetry.averageLatencyMs / 1000);
    const capacity = telemetry.activeRequests <= 0 ? 1 : 1 / (1 + telemetry.activeRequests);

    return availability * 0.35 + success * 0.35 + latency * 0.2 + capacity * 0.1;
  }
}
