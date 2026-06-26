import { AIProviderTelemetry } from './provider-contracts';
import { LatencyMonitor } from './latency-monitor';

export class PerformanceAnalyzer {
  constructor(private readonly latencyMonitor: LatencyMonitor) {}

  public score(telemetry: AIProviderTelemetry | undefined): number {
    const successScore = telemetry?.successRate ?? 1;
    const latencyScore = this.latencyMonitor.score(telemetry);

    return successScore * 0.7 + latencyScore * 0.3;
  }
}
