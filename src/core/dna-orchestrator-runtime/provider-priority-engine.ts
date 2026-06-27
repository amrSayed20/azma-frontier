import { AIProviderDescriptor } from '../sovereign-ai-integration';

const DEFAULT_PRIORITY_FAMILIES: readonly string[] = ['local', 'open-source', 'open-standard', 'sovereign', 'managed'];

export class ProviderPriorityEngine {
  public score(provider: AIProviderDescriptor, priorityFamilies: readonly string[] = DEFAULT_PRIORITY_FAMILIES): number {
    const normalized = provider.providerFamily.toLowerCase();
    const index = priorityFamilies.findIndex((family) => normalized.includes(family.toLowerCase()));

    if (index < 0) {
      return 0.5;
    }

    return Math.max(0.1, 1 - index * 0.15);
  }
}
