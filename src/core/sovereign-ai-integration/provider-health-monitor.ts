import { AIProviderAdapter, AIProviderStatus, AIProviderTelemetry } from './provider-contracts';

export class ProviderHealthMonitor {
  private readonly telemetry = new Map<string, AIProviderTelemetry>();

  public observe(provider: AIProviderAdapter, status: AIProviderStatus = 'available'): AIProviderTelemetry {
    const previous = this.telemetry.get(provider.descriptor.providerId);
    const value: AIProviderTelemetry = {
      providerId: provider.descriptor.providerId,
      status,
      activeRequests: previous?.activeRequests ?? 0,
      successRate: previous?.successRate ?? 1,
      averageLatencyMs: previous?.averageLatencyMs ?? 0,
      availabilityScore: status === 'available' ? 1 : status === 'degraded' ? 0.5 : 0,
      lastCheckedAt: new Date(),
    };

    this.telemetry.set(value.providerId, value);
    return value;
  }

  public record(providerId: string, input: Partial<Omit<AIProviderTelemetry, 'providerId'>>): void {
    const previous = this.telemetry.get(providerId);
    this.telemetry.set(providerId, {
      providerId,
      status: input.status ?? previous?.status ?? 'available',
      activeRequests: input.activeRequests ?? previous?.activeRequests ?? 0,
      successRate: input.successRate ?? previous?.successRate ?? 1,
      averageLatencyMs: input.averageLatencyMs ?? previous?.averageLatencyMs ?? 0,
      availabilityScore: input.availabilityScore ?? previous?.availabilityScore ?? 1,
      lastCheckedAt: input.lastCheckedAt ?? new Date(),
    });
  }

  public get(providerId: string): AIProviderTelemetry | undefined {
    return this.telemetry.get(providerId);
  }

  public list(): readonly AIProviderTelemetry[] {
    return Array.from(this.telemetry.values());
  }
}
