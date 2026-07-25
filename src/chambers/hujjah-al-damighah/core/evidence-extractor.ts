 /**
 * AZMA OS - Phase 9: Hujjah Al-Damighah (The Intelligence Chamber)
 * File: src/chambers/hujjah-al-damighah/core/evidence-extractor.ts
 * * The Evidence Extractor.
 * Analyzes raw document text against a SovereignClaim to extract verifiable facts.
 * Acts as the structural boundary for future LLM/AI text analysis integration.
 */

import * as crypto from 'crypto';
import { Evidence, SovereignClaim, ConfidenceLevel } from '../domain/evidence.types';
import { EvidenceScoringEngine } from './evidence-scoring';

// ==========================================
// 1. DOCUMENT CONTRACT
// ==========================================

/**
 * The expected structure of a document retrieved by the RepositoryManager.
 */
export interface SourceDocument {
  readonly id: string;
  readonly provider: string;
  readonly content: string;
}

// ==========================================
// 2. THE EXTRACTOR
// ==========================================

export class EvidenceExtractor {
  
  /**
   * Evaluates a document and extracts atomic pieces of evidence that validate 
   * or contextualize the SovereignClaim.
   * * @param document The raw document retrieved from a repository (e.g., Gutenberg).
   * @param claim The parsed user intent/claim.
   * @returns An array of strictly formatted Evidence objects.
   */
  public static extract(document: SourceDocument, claim: SovereignClaim): Evidence[] {
    if (!document || !document.content || document.content.trim().length === 0) {
      return []; // Return empty array to allow the engine to safely continue
    }

    // ---------------------------------------------------------
    // FUTURE INTEGRATION POINT: AI / LLM SEMANTIC EXTRACTION
    // Here, an AI model will evaluate `document.content` against
    // `claim.normalizedStatement` to perform deep semantic extraction.
    // ---------------------------------------------------------

    // Extract a brief context window safely
    const snippetLength = Math.min(document.content.length, 250);
    const safeContext = document.content.substring(0, snippetLength) + '...';

    // REAL SCORING (replaces the previous hardcoded 0.85/HIGH baseline):
    // EvidenceScoringEngine.score() already existed, fully built, with zero
    // callers anywhere in the codebase — a genuine keyword-overlap heuristic
    // sitting unused right next to the stub it was meant to replace. Scored
    // against safeContext (the document's own real content), not
    // extractedText below (which echoes the claim itself and would always
    // match its own keywords trivially). Still a pre-LLM heuristic, and the
    // underlying document content remains provider-supplied (simulated for
    // GutenbergProvider today) — this makes the SCORING mechanism real and
    // query-dependent, not the underlying source content.
    const { confidenceScore } = EvidenceScoringEngine.score(safeContext, claim);
    const confidenceLevel = EvidenceExtractor.classifyConfidence(confidenceScore);

    const scoredEvidence: Evidence = {
      id: crypto.randomUUID(),
      claimId: claim.id,
      sourceId: document.id,
      sourceProvider: document.provider,
      extractedText: `[Extracted context matching claim]: ${claim.normalizedStatement}`,
      contextWindow: safeContext,
      confidenceScore,
      confidenceLevel
    };

    return [scoredEvidence];
  }

  /**
   * First-cut thresholds over EvidenceScoringEngine's 0-1 confidenceScore.
   * Disclosed heuristic, not a calibrated statistical boundary.
   */
  private static classifyConfidence(confidenceScore: number): ConfidenceLevel {
    if (confidenceScore >= 0.75) return ConfidenceLevel.HIGH;
    if (confidenceScore >= 0.45) return ConfidenceLevel.MODERATE;
    if (confidenceScore >= 0.15) return ConfidenceLevel.LOW;
    return ConfidenceLevel.UNVERIFIED;
  }
}