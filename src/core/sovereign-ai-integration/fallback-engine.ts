import { AIRoutingDecision, AIProviderAdapter } from './provider-contracts';

export class FallbackEngine {
  public order(routing: AIRoutingDecision, providers: readonly AIProviderAdapter[]): readonly AIProviderAdapter[] {
    const selected = providers.find((provider) => provider.descriptor.providerId === routing.selectedProviderId);
    const fallback = routing.fallbackProviderIds
      .map((providerId) => providers.find((provider) => provider.descriptor.providerId === providerId))
      .filter((provider): provider is AIProviderAdapter => Boolean(provider));

    return selected ? [selected, ...fallback] : fallback;
  }
}
