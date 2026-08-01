/**
 * AZMA OS — Al Hujjah Al-Damighah
 * SOVEREIGN EVIDENCE FOUNDATION — Constitutional Foundation Package XIII
 *
 * The Evidence Layer.
 *
 * Accepts Investigation output and produces a constitutional EvidenceCollection.
 * This is the only constitutional stage responsible for transforming an
 * InvestigationResult into structured evidence. The Knowledge stage (Package XIV)
 * must consume only EvidenceCollection — never InvestigationResult directly.
 *
 * WHAT THIS MODULE DOES NOT DO:
 *   Does not re-invoke IntelligenceEngine.
 *   Does not re-score evidence (confidenceScore is final from Investigation).
 *   Does not produce verdicts or knowledge declarations.
 *   Does not recommend actions.
 *   Does not communicate with Makman.
 *   Does not search repositories.
 *   Does not modify Investigation output — it wraps and preserves.
 *
 * REUSE AUDIT (mandatory before coding):
 *   Evidence          — IMPORTED from domain/evidence.types.ts; not re-declared.
 *   SovereignClaim    — IMPORTED from domain/evidence.types.ts; not re-declared.
 *   EvidenceBundleManager — NOT called; that is an Investigation-layer tool.
 *   EvidenceExtractor     — NOT called; already ran during Investigation.
 *   EvidenceScoringEngine — NOT called; already ran during Evidence extraction.
 *   IntelligenceEngine    — NOT called; Investigation stage is complete.
 */

import type { InvestigationResult } from './investigation-contracts';
import type {
  CollectedEvidence,
  EvidenceCollection,
  EvidenceCollectionOutcome,
} from './evidence-contracts';

let collectionSequence = 0;

function generateCollectionId(resultId: string, atMs: number): string {
  collectionSequence += 1;
  return `evc-${resultId}-${atMs}-${collectionSequence}`;
}

/**
 * Collect constitutional evidence from an InvestigationResult.
 *
 * Reads every Evidence item from the rawBundle, wraps each with full
 * constitutional lineage (investigationResultId, intentId, receptionId,
 * origin), and produces one EvidenceCollection.
 *
 * The returned collection preserves:
 *   — all Evidence items exactly as produced by Investigation
 *   — the SovereignClaim that drove the investigation
 *   — the Sovereign lineage (for Sovereign requests)
 *   — the total sources scanned during Investigation
 *
 * An empty items array is constitutionally valid — the Knowledge stage
 * must handle empty collections honestly.
 *
 * Does not re-score, judge, or conclude.
 * Does not invoke IntelligenceEngine or any provider.
 */
export function collectEvidence(result: InvestigationResult): EvidenceCollectionOutcome {
  if (result.rawBundle.metadata.investigationStatus !== 'completed') {
    return { ok: false, reason: 'INVESTIGATION_NOT_COMPLETED' };
  }

  const collectedAtMs = Date.now();

  const items: CollectedEvidence[] = result.rawBundle.evidence.map((evidence) => ({
    evidence,
    investigationResultId: result.resultId,
    intentId: result.intentId,
    receptionId: result.receptionId,
    origin: result.origin,
    collectedAtMs,
  }));

  const collection: EvidenceCollection = {
    collectionId: generateCollectionId(result.resultId, collectedAtMs),
    investigationResultId: result.resultId,
    intentId: result.intentId,
    receptionId: result.receptionId,
    origin: result.origin,
    claim: result.rawBundle.claim,
    items,
    sovereignLineage: result.sovereignLineage,
    totalSourcesScanned: Number(result.rawBundle.metadata.totalSourcesScanned),
    collectedAtMs,
  };

  return { ok: true, collection };
}
