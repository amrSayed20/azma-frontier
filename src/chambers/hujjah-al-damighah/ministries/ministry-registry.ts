/**
 * AZMA OS — Al Hujjah Al-Damighah
 * KNOWLEDGE MINISTRIES FOUNDATION — Constitutional Foundation Package XV
 *
 * The Ministry Registry.
 *
 * The registry owns the relationship between constitutional Ministries
 * and the providers that serve them. It is the single bootstrap boundary
 * for the entire Knowledge provider infrastructure.
 *
 * ─── WHAT THE REGISTRY DOES ─────────────────────────────────────────────────
 *
 *   1. Declares all 8 constitutional Ministries (from ministry-contracts.ts).
 *
 *   2. Allows providers to be attached to Ministries via attachProvider().
 *      A Ministry with no providers is valid — it returns empty results
 *      honestly.
 *
 *   3. Builds a RepositoryManager that contains one IRepositoryProvider
 *      per Ministry. Each Ministry provider wraps the Ministry's sub-providers
 *      and presents the Ministry's constitutional identity to the investigation
 *      infrastructure.
 *
 * ─── HOW PROVIDER IDENTITY IS PRESERVED ────────────────────────────────────
 *
 *   When a Ministry's IRepositoryProvider receives a search() call, it:
 *     — Fans out to all attached sub-providers in parallel
 *     — Stamps result.provider with the Ministry's constitutional ID
 *     — Encodes the raw provider's ID into a composite document key:
 *       "{rawProviderId}::{rawDocumentId}"
 *
 *   When fetch() is called with a composite key:
 *     — The key is split on "::" to recover rawProviderId and rawDocumentId
 *     — The correct sub-provider is selected and called with rawDocumentId
 *     — The returned SourceDocument's provider field is re-stamped with the
 *       Ministry's constitutional ID
 *
 *   Result: evidence.sourceProvider carries the Ministry's constitutional ID
 *   (e.g., 'ministry-human-knowledge'), not the raw provider ID ('gutenberg').
 *   Replacing GutenbergProvider with a real Gutenberg HTTP client requires
 *   no change to evidence.sourceProvider — the constitutional identity is stable.
 *
 * ─── COMPOSITE DOCUMENT KEY FORMAT ──────────────────────────────────────────
 *
 *   Format: "{rawProviderId}::{rawDocumentId}"
 *
 *   Examples:
 *     'gutenberg::gutenberg-doc-ce1d6690'
 *     'wikipedia::wiki-page-12345'
 *     'arxiv::arxiv-2401.00001'
 *
 *   The "::" separator is constitutional. All provider document IDs must not
 *   contain "::" internally. Current providers (GutenbergProvider) produce IDs
 *   of the form 'gutenberg-doc-{uuid8}' which contain only hyphens and hex —
 *   safe from this separator.
 *
 * ─── WHAT THE REGISTRY DOES NOT DO ─────────────────────────────────────────
 *
 *   The registry does not query providers.
 *   The registry does not perform searches.
 *   The registry does not evaluate evidence.
 *   The registry does not modify Investigation, Evidence, or Knowledge.
 *   The registry is a bootstrap component only.
 */

import { RepositoryManager, IRepositoryProvider, selectAcrossSources } from '../core/repository-manager';
import type { RepositorySearchResult } from '../domain/evidence.types';
import type { SourceDocument } from '../core/evidence-extractor';
import { authorityOfSourceKey } from '../domain/evidence-authority';
import { sourceServesDomain } from '../sources/sovereign-source-registry';
import {
  CONSTITUTIONAL_MINISTRIES,
  type KnowledgeMinistryId,
} from './ministry-contracts';

export class MinistryRegistry {
  private readonly attachedProviders: Map<KnowledgeMinistryId, IRepositoryProvider[]>;

  constructor() {
    this.attachedProviders = new Map(
      CONSTITUTIONAL_MINISTRIES.map((m) => [m.ministryId, []]),
    );
  }

  /**
   * Attach a provider to a constitutional Ministry.
   *
   * Multiple providers may be attached to a single Ministry (e.g., Gutenberg
   * and Wikisource both serving Ministry of Human Knowledge). Their search
   * results will be aggregated, sorted by relevance, and presented under the
   * Ministry's constitutional identity.
   *
   * Throws if ministryId is not one of the 8 constitutional Ministry IDs.
   */
  public attachProvider(ministryId: KnowledgeMinistryId, provider: IRepositoryProvider): void {
    const existing = this.attachedProviders.get(ministryId);
    if (!existing) {
      throw new Error(`[MinistryRegistry] Unknown ministry: '${ministryId}'`);
    }
    this.attachedProviders.set(ministryId, [...existing, provider]);
  }

  /**
   * Build the production RepositoryManager.
   *
   * Creates one IRepositoryProvider per constitutional Ministry and registers
   * all 8 in the RepositoryManager. Ministries with no attached providers
   * register a provider that honestly returns empty search results.
   *
   * This is the only constitutional method that produces a RepositoryManager.
   * IntelligenceCompositionFactory calls this during bootstrap.
   */
  public buildRepositoryManager(): RepositoryManager {
    const manager = new RepositoryManager();

    for (const ministry of CONSTITUTIONAL_MINISTRIES) {
      const subProviders = [...(this.attachedProviders.get(ministry.ministryId) ?? [])];
      const ministryProvider = buildMinistryProvider(ministry.ministryId, subProviders);
      manager.registerProvider(ministryProvider);
    }

    return manager;
  }
}

/**
 * Build the IRepositoryProvider that represents a single Ministry.
 *
 * Kept as a module-level function (not a class) to remain minimal.
 * The Ministry provider:
 *   — is identified by the Ministry's constitutional ID as providerId
 *   — delegates search() to all attached sub-providers in parallel
 *   — encodes sub-provider identity into composite document keys
 *   — decodes composite keys in fetch() to route to the correct sub-provider
 *   — stamps all outgoing SourceDocuments with the Ministry's constitutional ID
 */
function buildMinistryProvider(
  ministryId: KnowledgeMinistryId,
  subProviders: readonly IRepositoryProvider[],
): IRepositoryProvider {
  return {
    providerId: ministryId,

    async search(
      query: string,
      limit: number,
      // The Creator's own words. A Ministry holds sources in more than one
      // tongue, so it hands each sub-provider both and lets it choose: the
      // English catalogues take the rendered query, the Qur'an takes this.
      // Dropping it here would silently starve every Arabic source.
      nativeQuery?: string,
      domain?: string,
    ): Promise<RepositorySearchResult[]> {
      if (subProviders.length === 0) return [];

      // Only the sources the registry says have business in this domain. A
      // Ministry left with none of them contributes nothing rather than
      // contributing whatever it happens to hold — measured live, three of ten
      // places in a religious question went to a Ministry whose only sources
      // are contemporary trends and technology news.
      const qualified = subProviders.filter((p) => sourceServesDomain(p.providerId, domain));
      if (qualified.length === 0) return [];

      const allResults = await Promise.all(
        qualified.map((p) =>
          p
            .search(query, limit, nativeQuery, domain)
            .then((results) =>
              results.map((r) => ({
                ...r,
                id: `${r.provider}::${r.id}`,
                provider: ministryId,
              })),
            )
            .catch(() => [] as RepositorySearchResult[]),
        ),
      );

      // Each source inside this Ministry keeps a share before the rest is
      // allotted by score. Measured live: the Qur'an scores 0.80–0.99 and the
      // Sunnah 0.50–0.90, they sit in this same Ministry, and sorting by score
      // alone handed the Qur'an all ten places — a Creator asking about الصبر
      // received ten verses and not one of the 36,064 narrations the Empire
      // holds. Two sources were being compared on a number that means something
      // different in each of them.
      return selectAcrossSources(allResults, limit);
    },

    async fetch(compositeId: string): Promise<SourceDocument> {
      const separatorIndex = compositeId.indexOf('::');
      if (separatorIndex === -1) {
        throw new Error(
          `[${ministryId}] Invalid composite document key: '${compositeId}'. ` +
            `Expected format: '{rawProviderId}::{rawDocumentId}'`,
        );
      }

      const rawProviderId = compositeId.slice(0, separatorIndex);
      const rawDocumentId = compositeId.slice(separatorIndex + 2);

      const subProvider = subProviders.find((p) => p.providerId === rawProviderId);
      if (!subProvider) {
        throw new Error(
          `[${ministryId}] Sub-provider '${rawProviderId}' is not attached to this Ministry.`,
        );
      }

      const rawDoc = await subProvider.fetch(rawDocumentId);
      // The provider's name is replaced by the Ministry's constitutional ID —
      // that re-stamp is what keeps repository names away from the Creator. But
      // it also erased the only distinction a religious question depends on, so
      // the kind of source is resolved here, where the raw key is still known,
      // and travels upward while the name does not.
      // The spread carries attributionAr through untouched — a citation is the
      // evidence's own identity, not the name of the vendor that served it, and
      // it is the one thing a Creator needs in order to check what they were
      // shown.
      return {
        ...rawDoc,
        provider: ministryId,
        authority: rawDoc.authority ?? authorityOfSourceKey(rawProviderId),
      };
    },
  };
}
