import { AIProviderAdapter } from './provider-contracts';

export class LoadDistributionEngine {
  public distribute(candidates: readonly AIProviderAdapter[]): readonly AIProviderAdapter[] {
    return candidates;
  }
}
