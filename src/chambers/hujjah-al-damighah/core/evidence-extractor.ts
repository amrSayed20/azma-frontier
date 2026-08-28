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
      return [];
    }

    // Find the passage in the document most relevant to the claim, rather than
    // blindly taking the first characters. This is especially valuable for
    // document-rich sources like GutenbergProvider, which returns 10 KB of
    // actual book text: the relevant passage may be anywhere inside it.
    const relevantPassage = EvidenceExtractor.findRelevantPassage(document.content, claim);

    // Score the relevant passage (not an arbitrary opening slice) against claim keywords.
    const { confidenceScore } = EvidenceScoringEngine.score(relevantPassage, claim);
    const confidenceLevel = EvidenceExtractor.classifyConfidence(confidenceScore);

    const scoredEvidence: Evidence = {
      id: crypto.randomUUID(),
      claimId: claim.id,
      sourceId: document.id,
      sourceProvider: document.provider,
      extractedText: relevantPassage,
      contextWindow: relevantPassage,
      confidenceScore,
      confidenceLevel,
    };

    return [scoredEvidence];
  }

  /**
   * Finds the most keyword-relevant passage in a document.
   *
   * Splits the document into sentence-level units, scores each against
   * the claim's keywords, and returns the highest-scoring passage plus
   * surrounding sentences for readability context. Falls back to the
   * document opening when no keyword match exists.
   *
   * This replaces the original first-250-chars extraction and works within
   * the existing keyword-overlap scoring architecture — no external calls.
   */
  public static findRelevantPassage(content: string, claim: SovereignClaim): string {
    const MAX_LENGTH = 420;
    const keywords = (claim.keywords ?? []).map((k) => k.toLowerCase());

    if (keywords.length === 0 || content.length <= MAX_LENGTH) {
      const raw = content.substring(0, MAX_LENGTH);
      return content.length > MAX_LENGTH ? raw + '...' : raw;
    }

    // Split into sentence-like units at sentence-ending punctuation.
    // Filter out very short fragments (table of contents entries, headers).
    const sentences = content
      .split(/(?<=[.?!؟])\s+|\n{2,}/)
      .map((s) => s.trim())
      .filter((s) => s.length >= 20);

    if (sentences.length === 0) {
      const raw = content.substring(0, MAX_LENGTH);
      return content.length > MAX_LENGTH ? raw + '...' : raw;
    }

    // Score each sentence by keyword density (number of distinct keyword hits).
    let bestScore = -1;
    let bestIdx = 0;

    for (let i = 0; i < sentences.length; i++) {
      const lower = sentences[i].toLowerCase();
      const score = keywords.filter((kw) => lower.includes(kw)).length;
      if (score > bestScore) {
        bestScore = score;
        bestIdx = i;
      }
    }

    // Include one sentence before and two after for context.
    const startIdx = Math.max(0, bestIdx - 1);
    const endIdx   = Math.min(sentences.length, bestIdx + 3);
    const passage  = sentences.slice(startIdx, endIdx).join(' ').trim();

    if (passage.length > MAX_LENGTH) {
      return passage.substring(0, MAX_LENGTH) + '...';
    }
    return passage;
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