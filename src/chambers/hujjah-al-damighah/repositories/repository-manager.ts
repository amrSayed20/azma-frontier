import { RepositoryProvider } from '../providers/repository-provider';
import { Document, SearchResult } from '../types/repository.types';

export class RepositoryManager {
  private providers: RepositoryProvider[] = [];

  public registerProvider(provider: RepositoryProvider): void {
    this.providers.push(provider);
  }

  public async searchAll(query: string, limit: number = 5): Promise<SearchResult[]> {
    const results = await Promise.all(
      this.providers.map(p => p.search(query, limit))
    );
    return results.flat().sort((a, b) => b.score - a.score);
  }

  public async fetchDocument(providerId: string, id: string): Promise<Document> {
    const provider = this.providers.find(p => p.providerId === providerId);
    if (!provider) {
      throw new Error(`Provider ${providerId} not registered`);
    }
    return provider.fetchDocument(id);
  }
}