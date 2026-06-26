import { AvailabilityMonitor } from './availability-monitor';
import { CostAnalyzer } from './cost-analyzer';
import { ModelRegistry } from './model-registry';
import { PerformanceAnalyzer } from './performance-analyzer';
import { ProviderHealthMonitor } from './provider-health-monitor';
import { AIProviderAdapter, SovereignAIRequest } from './provider-contracts';

export class ProviderSelectionEngine {
  constructor(
    private readonly healthMonitor: ProviderHealthMonitor,
    private readonly modelRegistry: ModelRegistry,
    private readonly availabilityMonitor: AvailabilityMonitor,
    private readonly performanceAnalyzer: PerformanceAnalyzer,
    private readonly costAnalyzer: CostAnalyzer
  ) {}

  public select(providers: readonly AIProviderAdapter[], request: SovereignAIRequest): readonly AIProviderAdapter[] {
    const candidates = providers.filter((provider) => {
      const telemetry = this.healthMonitor.get(provider.descriptor.providerId);
      const hasCapability = provider.descriptor.capabilities.includes(request.capability);
      const hasModel = Boolean(this.modelRegistry.findByCapability(provider.descriptor.providerId, request.capability));
      const available = this.availabilityMonitor.isAvailable(telemetry, provider.descriptor.maxConcurrentRequests);
      const preferredProviderMatches =
        request.preferredProviderId === undefined || request.preferredProviderId === provider.descriptor.providerId;

      return hasCapability && hasModel && available && preferredProviderMatches;
    });

    return candidates.sort((a, b) => this.score(b, request) - this.score(a, request));
  }

  private score(provider: AIProviderAdapter, request: SovereignAIRequest): number {
    const telemetry = this.healthMonitor.get(provider.descriptor.providerId);
    const availabilityScore = this.availabilityMonitor.score(telemetry);
    const performanceScore = this.performanceAnalyzer.score(telemetry);
    const costScore = this.costAnalyzer.score(provider.descriptor, request);

    return availabilityScore * 0.35 + performanceScore * 0.45 + costScore * 0.2;
  }
}
