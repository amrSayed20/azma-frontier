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

  public async investigate(input: string, targetCategory: string = 'general'): Promise<EvidenceBundle> {
    // 1. Transform raw input into a sovereign claim
    const claim = ClaimParser.parse(input, targetCategory);
    const bundleManager = new EvidenceBundleManager(claim.normalizedStatement, claim.id);

    // 2. Query infrastructure (Source Agnostic)
    const searchResults = await this.repositoryManager.searchAll(claim.normalizedStatement, 3);

    // 3. Extract and compile intelligence
    for (const result of searchResults) {
      try {
        // Note: In V1, we route through Gutenberg as the primary foundational provider.
        // The awaited result is constitutionally typed as SourceDocument via Phase 9 RepositoryManager.
        const document: SourceDocument = await this.repositoryManager.fetchDocument('gutenberg', result.id);
        
        // Extraction strictly utilizes Phase 9 SourceDocument contract.
        const extractedEvidence = EvidenceExtractor.extract(document, claim);
        
        for (const evidence of extractedEvidence) {
          bundleManager.addEvidence(evidence);
        }
      } catch {
        // Silent continuation: The Intelligence Engine must not crash if a single document fails
        console.warn(`[Intelligence Engine] Failed to extract from document ID: ${result.id}`);
      }
    }

    // 4. Enrich bundle metadata
    bundleManager.setMetadata('investigationStatus', 'completed');
    bundleManager.setMetadata('totalSourcesScanned', searchResults.length);
    bundleManager.setMetadata('averageEvidenceScore', bundleManager.calculateAverageEvidenceScore());

    return bundleManager.getBundle();
  }
}
