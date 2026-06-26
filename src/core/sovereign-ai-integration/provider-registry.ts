import { AIProviderAdapter, AIProviderDescriptor } from './provider-contracts';

export class ProviderRegistry {
  private readonly providers = new Map<string, AIProviderAdapter>();

  public register(provider: AIProviderAdapter): void {
    this.providers.set(provider.descriptor.providerId, provider);
  }

  public unregister(providerId: string): void {
    this.providers.delete(providerId);
  }

  public get(providerId: string): AIProviderAdapter | undefined {
    return this.providers.get(providerId);
  }

  public list(): readonly AIProviderAdapter[] {
    return Array.from(this.providers.values());
  }

  public descriptors(): readonly AIProviderDescriptor[] {
    return this.list().map((provider) => provider.descriptor);
  }
}
