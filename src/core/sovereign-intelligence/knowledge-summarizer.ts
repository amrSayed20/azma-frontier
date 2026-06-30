/**
 * Sovereign Intelligence Layer — Knowledge Summarizer (Component 5)
 *
 * Builds a concise, structured KnowledgeSummary from verified evidence.
 * Extracts up to 5 key findings ordered by confidence rank.
 */

import type { KnowledgeDomain, KnowledgeSummary, VerifiedEvidenceItem } from './sovereign-intelligence-types';

const MAX_KEY_FINDINGS = 5;

export class KnowledgeSummarizer {
  readonly serviceName = 'KnowledgeSummarizer' as const;

  summarize(
    query: string,
    domain: KnowledgeDomain,
    verifiedEvidence: readonly VerifiedEvidenceItem[],
  ): KnowledgeSummary {
    const keyFindings = verifiedEvidence
      .slice(0, MAX_KEY_FINDINGS)
      .map((ev) => ev.extractedText);

    const averageConfidence =
      verifiedEvidence.length > 0
        ? verifiedEvidence.reduce((sum, ev) => sum + ev.confidenceScore, 0) /
          verifiedEvidence.length
        : 0;

    return {
      domain,
      topicStatement: query,
      keyFindings,
      totalSources: verifiedEvidence.length,
      averageConfidence,
      generatedAtMs: Date.now(),
    };
  }
}
