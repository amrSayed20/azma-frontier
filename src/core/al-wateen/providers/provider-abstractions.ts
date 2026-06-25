/**
 * Provider abstraction contracts.
 */

import { ProviderDescriptor } from '../types/al-wateen.types';

export interface CoreProvider {
  readonly descriptor: ProviderDescriptor;
  isAvailable(): boolean;
}

export class ProviderPool {
  private readonly providers = new Map<string, CoreProvider>();

  public upsert(provider: CoreProvider): void {
    this.providers.set(provider.descriptor.providerId, provider);
  }

  public remove(providerId: string): void {
    this.providers.delete(providerId);
  }

  public list(): readonly CoreProvider[] {
    return Array.from(this.providers.values());
  }

  public activeCount(): number {
    return this.list().filter(provider => provider.isAvailable()).length;
  }
}
