/**
 * AZMA OS - Phase 9: Hujjah Al-Damighah (The Intelligence Chamber)
 * File: src/chambers/hujjah-al-damighah/core/intelligence-engine.ts
 * * The Intelligence Engine.
 * The core orchestrator of the chamber. Coordinates the parsing of claims,
 * the parallel searching of physical repositories, and the deep extraction 
 * of evidence into sealed, immutable bundles.
 */

import { RepositoryManager } from './repository-manager';
import { ClaimParser } from '../domain/claim-parser';
import { EvidenceBundleManager } from '../domain/evidence-bundle';
import { EvidenceBundle } from '../domain/evidence.types';
import { EvidenceExtractor, SourceDocument } from './evidence-extractor';

export class IntelligenceEngine {
  private repositoryManager: RepositoryManager;

  constructor(repositoryManager: RepositoryManager) {
    this.repositoryManager = repositoryManager;
  }

  /**
   * @param input The Creator's own words.
   * @param catalogueQuery The same question rendered into the tongue the
   *   English catalogues index, when the language bridge produced one. Those
   *   catalogues are searched with it; a source that indexes the Creator's own
   *   tongue is searched with `input` instead.
   */
  public async investigate(
    input: string,
    targetCategory: string = 'general',
    catalogueQuery?: string,
  ): Promise<EvidenceBundle> {
    // 1. Transform raw input into a sovereign claim
    const claim = ClaimParser.parse(input, targetCategory, catalogueQuery);
    const bundleManager = new EvidenceBundleManager(claim.normalizedStatement, claim.id);

    // 2. Query infrastructure (Source Agnostic)
    const searchResults = await this.repositoryManager.searchAll(
      claim.catalogueStatement ?? claim.normalizedStatement,
      10,
      claim.normalizedStatement,
      claim.targetCategory,
    );

    // Which Ministries answered, and with how much. The chamber could not
    // previously say where evidence was lost between a search that found
    // narrations and a screen that showed none — and every stage in between was
    // equally plausible. Counting here closes the first half of that gap.
    const perMinistry: Record<string, number> = {};
    for (const r of searchResults) perMinistry[r.provider] = (perMinistry[r.provider] ?? 0) + 1;
    console.log(`[Intelligence Engine] search returned ${searchResults.length} — ${JSON.stringify(perMinistry)}`);

    // 3. Extract and compile intelligence — fetch all documents in parallel so
    // a single slow provider (e.g. Gutenberg CDN) does not stall the others.
    const fetchResults = await Promise.allSettled(
      searchResults.map(async (result) => {
        // Routes by result.provider — the Ministry's constitutional ID.
        // The Ministry wrapper decodes the composite document key and delegates
        // to the correct sub-provider. PACKAGE XV: fixed from hardcoded 'gutenberg'.
        const document: SourceDocument = await this.repositoryManager.fetchDocument(result.provider, result.id);
        return EvidenceExtractor.extract(document, claim);
      }),
    );

    for (let i = 0; i < fetchResults.length; i++) {
      const outcome = fetchResults[i];
      if (outcome.status === 'fulfilled') {
        for (const evidence of outcome.value) {
          bundleManager.addEvidence(evidence);
        }
      } else {
        // Silent continuation: The Intelligence Engine must not crash if a
        // single document fails. But the reason travels with the warning now —
        // a document that was found and then vanished is the exact gap the
        // chamber could not previously account for, and "failed to extract"
        // without a reason sends whoever reads it nowhere.
        const reason = outcome.reason instanceof Error ? outcome.reason.message : String(outcome.reason);
        console.warn(
          `[Intelligence Engine] Could not retrieve '${searchResults[i]?.id ?? '?'}' ` +
          `from ${searchResults[i]?.provider ?? '?'}: ${reason}`,
        );
      }
    }

    // 4. Enrich bundle metadata
    bundleManager.setMetadata('investigationStatus', 'completed');
    bundleManager.setMetadata('totalSourcesScanned', searchResults.length);
    bundleManager.setMetadata('averageEvidenceScore', bundleManager.calculateAverageEvidenceScore());

    return bundleManager.getBundle();
  }
}
