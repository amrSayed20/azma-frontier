/**
 * AZMA OS – Al-Wateen Assistant
 * File: provider-selection.ts
 *
 * Provider selection and load balancing.
 */

import { AIProvider } from '../types/al-wateen.types';

export interface ProviderSelector {
  selectProvider(providers: readonly AIProvider[]): AIProvider | undefined;
  selectBest(providers: readonly AIProvider[], count: number): AIProvider[];
}

export class ProviderSelector implements ProviderSelector {
  public selectProvider(providers: readonly AIProvider[]): AIProvider | undefined {
    if (providers.length === 0) {
      return undefined;
    }

    const available = providers.filter(p => this.isAvailable(p));

    if (available.length === 0) {
      return undefined;
    }

    return this.selectBestCandidate(available);
  }

  public selectBest(providers: readonly AIProvider[], count: number): AIProvider[] {
    if (providers.length === 0) {
      return [];
    }

    const available = providers.filter(p => this.isAvailable(p));

    const sorted = available.sort((a, b) => {
      const aScore = this.calculateScore(a);
      const bScore = this.calculateScore(b);
      return bScore - aScore;
    });

    return sorted.slice(0, Math.min(count, sorted.length));
  }

  private isAvailable(provider: AIProvider): boolean {
    return (
      provider.status === 'AVAILABLE' &&
      provider.activeRequests < provider.capacity
    );
  }

  private selectBestCandidate(providers: readonly AIProvider[]): AIProvider | undefined {
    if (providers.length === 0) {
      return undefined;
    }

    return providers.reduce((best, current) => {
      return this.calculateScore(current) > this.calculateScore(best) ? current : best;
    });
  }

  private calculateScore(provider: AIProvider): number {
    const capacityScore = (provider.capacity - provider.activeRequests) / provider.capacity;
    const successScore = provider.successRate;
    const responseScore = 1 / (1 + provider.averageResponseTime / 1000);

    return capacityScore * 0.4 + successScore * 0.4 + responseScore * 0.2;
  }
}
