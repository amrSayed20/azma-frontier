/**
 * Runtime provider manager.
 */

import { ProviderDescriptor, ProviderStatus } from '../types/al-wateen.types';
import { CoreProvider, ProviderPool } from './provider-abstractions';

export class ProviderManager {
  constructor(private readonly pool: ProviderPool) {}

  public register(provider: CoreProvider): void {
    this.pool.upsert(provider);
  }

  public unregister(providerId: string): void {
    this.pool.remove(providerId);
  }

  public descriptors(): readonly ProviderDescriptor[] {
    return this.pool.list().map(provider => provider.descriptor);
  }

  public selectAvailable(): ProviderDescriptor | undefined {
    const candidates = this.pool
      .list()
      .filter(provider => provider.descriptor.status !== ProviderStatus.UNAVAILABLE && provider.isAvailable());

    if (candidates.length === 0) {
      return undefined;
    }

    return candidates.sort((a, b) => a.descriptor.inFlight - b.descriptor.inFlight)[0].descriptor;
  }

  public activeCount(): number {
    return this.pool.activeCount();
  }
}
