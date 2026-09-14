/**
 * AZMA OS - Phase 9: Hujjah Al-Damighah (The Intelligence Chamber)
 * File: src/chambers/hujjah-al-damighah/core/repository-manager.ts
 * * The Repository Manager & Provider Contracts.
 * Orchestrates physical data retrieval across multiple external and internal 
 * knowledge providers. Enforces a strict interface for all data sources 
 * to ensure structural compatibility with the Intelligence Engine.
 */

import { RepositorySearchResult } from '../domain/evidence.types';
import { SourceDocument } from './evidence-extractor';

/** How long any one catalogue may hold the whole investigation. Measured from
    the production server: Wikipedia answers in ~270ms and OpenLibrary in
    ~770ms, so five seconds is generous to every healthy repository while
    refusing to let a sluggish one decide how long a Creator waits. */
const SEARCH_DEADLINE_MS = 5_000;

// ==========================================
// 1. PROVIDER CONTRACT
// ==========================================

/**
 * The constitutional interface that every data source (e.g., Gutenberg, Wiki, Vault) 
 * must implement to be integrated into the Hujjah Al-Damighah chamber.
 */
export interface IRepositoryProvider {
  readonly providerId: string;
  
  /**
   * Searches the specific provider for relevant documents.
   */
  search(query: string, limit: number): Promise<RepositorySearchResult[]>;
  
  /**
   * Retrieves the full physical text of a specific document.
   */
  fetch(documentId: string): Promise<SourceDocument>;
}

// ==========================================
// 2. THE REPOSITORY MANAGER
// ==========================================

export class RepositoryManager {
  private readonly providers: Map<string, IRepositoryProvider> = new Map();

  /**
   * Mounts a new provider into the intelligence orchestration layer.
   * * @param provider An instance of a class implementing IRepositoryProvider.
   */
  public registerProvider(provider: IRepositoryProvider): void {
    if (this.providers.has(provider.providerId)) {
      console.warn(`[RepositoryManager] Overwriting existing provider: ${provider.providerId}`);
    }
    this.providers.set(provider.providerId, provider);
  }

  /**
   * Broadcasts a search query to all mounted providers simultaneously.
   * * @param query The normalized statement to search for.
   * @param limit The maximum number of aggregated results to return.
   * @returns An aggregated array of search results, sorted by relevance.
   */
  public async searchAll(query: string, limit: number = 3): Promise<RepositorySearchResult[]> {
    if (this.providers.size === 0) {
      console.warn('[RepositoryManager] No providers registered. Returning empty results.');
      return [];
    }

    const allResults: RepositorySearchResult[] = [];

    // Execute all searches in parallel for maximum operational speed. Parallel
    // was never the problem: Promise.all waits for the slowest, and measured
    // from the production server a Gutendex search for a real phrase takes
    // nearly 29 seconds. One sluggish catalogue held every investigation for as
    // long as it liked. Each provider now races a deadline of its own, and what
    // has not answered by then simply contributes nothing — the Creator is
    // waiting, and the evidence already in hand beats a wait with no end.
    const searchPromises = Array.from(this.providers.values()).map(async (provider) => {
      try {
        return await Promise.race([
          provider.search(query, limit),
          new Promise<RepositorySearchResult[]>((resolve) =>
            setTimeout(() => {
              console.warn(`[RepositoryManager] Provider [${provider.providerId}] exceeded ${SEARCH_DEADLINE_MS}ms. Proceeding without it.`);
              resolve([]);
            }, SEARCH_DEADLINE_MS),
          ),
        ]);
      } catch {
        // Architectural Defense: A failing provider must not crash the broader investigation
        console.warn(`[RepositoryManager] Search failed for provider [${provider.providerId}]. Bypassing.`);
        return [];
      }
    });

    const resultsArray = await Promise.all(searchPromises);
    
    // Flatten the array of arrays
    for (const results of resultsArray) {
      allResults.push(...results);
    }

    // Sort globally by relevance score (highest first) and strictly enforce the limit
    return allResults
      .sort((a, b) => b.relevanceScore - a.relevanceScore)
      .slice(0, limit);
  }

  /**
   * Routes a document fetch request to the correct physical provider.
   * * @param providerId The specific provider holding the document (e.g., 'gutenberg').
   * @param documentId The unique identifier within that provider's system.
   * @returns The raw SourceDocument ready for the EvidenceExtractor.
   * @throws Error if the provider is unknown or the document cannot be fetched.
   */
  public async fetchDocument(providerId: string, documentId: string): Promise<SourceDocument> {
    const provider = this.providers.get(providerId);
    
    if (!provider) {
      throw new Error(`[RepositoryManager] Routing Failure: Provider [${providerId}] is not registered.`);
    }

    return await provider.fetch(documentId);
  }
}
