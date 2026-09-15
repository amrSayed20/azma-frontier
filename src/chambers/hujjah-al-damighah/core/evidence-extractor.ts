 /**
 * AZMA OS - Phase 9: Hujjah Al-Damighah (The Intelligence Chamber)
 * File: src/chambers/hujjah-al-damighah/core/evidence-extractor.ts
 * * The Evidence Extractor.
 * Analyzes raw document text against a SovereignClaim to extract verifiable facts.
 * Acts as the structural boundary for future LLM/AI text analysis integration.
 */

import * as crypto from 'crypto';
import { Evidence, SovereignClaim, ConfidenceLevel } from '../domain/evidence.types';
import { SourceAuthority, authorityOfSourceKey } from '../domain/evidence-authority';
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

  /**
   * What kind of source this text came from.
   *
   * A Ministry re-stamps `provider` with its own constitutional ID before the
   * document travels upward, which is what keeps repository names away from the
   * Creator — but it also erased the one distinction that matters for a
   * religious question. The Ministry resolves this from the raw provider key
   * while it still knows it, so the class survives the re-stamp and the name
   * does not. Absent when the document came from no known source.
   */
  readonly authority?: SourceAuthority;
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

    // A document is judged against the claim in its own tongue. Scoring is
    // keyword overlap, so an English passage measured against an Arabic
    // question — or an Arabic verse measured against the English rendering sent
    // to the catalogues — overlaps at zero and is graded as worthless no matter
    // what it says.
    const readingClaim = EvidenceExtractor.claimInTongueOf(document.content, claim);

    // Find the passage in the document most relevant to the claim, rather than
    // blindly taking the first characters. This is especially valuable for
    // document-rich sources like GutenbergProvider, which returns 10 KB of
    // actual book text: the relevant passage may be anywhere inside it.
    const relevantPassage = EvidenceExtractor.findRelevantPassage(document.content, readingClaim);

    // Score the relevant passage (not an arbitrary opening slice) against claim keywords.
    const { confidenceScore } = EvidenceScoringEngine.score(relevantPassage, readingClaim);
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
      // The Ministry resolves this before re-stamping the provider. The fallback
      // covers a document that reached here without passing a Ministry — then
      // the provider key is still raw and can answer for itself.
      sourceAuthority: document.authority ?? authorityOfSourceKey(document.provider),
    };

    return [scoredEvidence];
  }

  /**
   * Returns the claim in the tongue the document is written in.
   *
   * The claim holds the Creator's own words and, when the language bridge was
   * used, the rendering that the English catalogues were actually asked. A
   * document in Arabic script is judged against the Creator's words; anything
   * else against the rendering, when one exists. Where there is no rendering the
   * claim is returned untouched, so a chamber that never crossed a language
   * boundary behaves exactly as it always did.
   */
  public static claimInTongueOf(content: string, claim: SovereignClaim): SovereignClaim {
    if (!claim.catalogueStatement || !claim.catalogueKeywords?.length) return claim;

    const ARABIC_LETTER = /[؀-ۿ]/;
    if (ARABIC_LETTER.test(content)) return claim;

    return {
      ...claim,
      normalizedStatement: claim.catalogueStatement,
      keywords: claim.catalogueKeywords,
    };
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