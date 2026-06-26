import { AIProviderTelemetry } from './provider-contracts';

export class LatencyMonitor {
  public score(telemetry: AIProviderTelemetry | undefined): number {
    const latency = telemetry?.averageLatencyMs ?? 0;

    if (latency <= 0) {
      return 1;
    }

    return 1 / (1 + latency / 1000);
  }
}
