import { AIProviderTelemetry } from './provider-contracts';

export class AvailabilityMonitor {
  public isAvailable(telemetry: AIProviderTelemetry | undefined, maxConcurrentRequests: number): boolean {
    if (!telemetry) {
      return true;
    }

    return telemetry.status !== 'unavailable' && telemetry.activeRequests < maxConcurrentRequests;
  }

  public score(telemetry: AIProviderTelemetry | undefined): number {
    return telemetry?.availabilityScore ?? 1;
  }
}
