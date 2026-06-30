/**
 * Sovereign Intelligence Layer — Source Verifier (Component 4)
 *
 * Normalizes raw EvidenceBundle output from the Intelligence Engine:
 *   1. Deduplicates by sourceId (highest confidence wins)
 *   2. Ranks by confidence score descending
 *   3. Produces a typed VerifiedEvidenceItem array
 */

import type { Evidence, EvidenceBundle } from '../../chambers/hujjah-al-damighah/domain/evidence.types';
import type { VerifiedEvidenceItem } from './sovereign-intelligence-types';

export class SourceVerifier {
  verify(bundle: EvidenceBundle): readonly VerifiedEvidenceItem[] {
    const deduped = this.deduplicate(bundle.evidence);
    const ranked = [...deduped].sort((a, b) => b.confidenceScore - a.confidenceScore);

    return ranked.map((ev, index) => ({
      evidenceId: ev.id,
      sourceId: ev.sourceId,
      sourceProvider: ev.sourceProvider,
      extractedText: ev.extractedText,
      confidenceScore: ev.confidenceScore,
      rank: index + 1,
    }));
  }

  private deduplicate(evidence: readonly Evidence[]): Evidence[] {
    const best = new Map<string, Evidence>();
    for (const ev of evidence) {
      const existing = best.get(ev.sourceId);
      if (!existing || ev.confidenceScore > existing.confidenceScore) {
        best.set(ev.sourceId, ev);
      }
    }
    return Array.from(best.values());
  }
}
