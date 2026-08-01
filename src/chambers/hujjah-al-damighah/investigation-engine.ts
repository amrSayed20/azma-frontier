/**
 * AZMA OS — Al Hujjah Al-Damighah
 * SOVEREIGN KNOWLEDGE INVESTIGATION FOUNDATION — Constitutional Foundation Package XII
 *
 * The Investigation Engine.
 *
 * This is the only constitutional stage authorised to invoke the production
 * IntelligenceEngine. It accepts an InvestigationIntent produced by the
 * Understanding stage (Package XI) and produces an InvestigationResult —
 * raw candidate knowledge awaiting constitutional evidence evaluation.
 *
 * CITIZEN and SOVEREIGN investigations follow the same investigation path.
 * Both supply `normalizedQuery` and `domain` to the IntelligenceEngine.
 * Sovereign constitutional lineage is preserved in the result without
 * influencing the investigation path — Al Hujjah investigates the same
 * way regardless of who asked.
 *
 * WHAT THIS ENGINE DOES NOT DO:
 *   Does not score evidence.
 *   Does not produce verdicts.
 *   Does not declare knowledge.
 *   Does not recommend actions.
 *   Does not communicate with Makman.
 *   Does not modify Understanding or Reception.
 *   Does not introduce new providers.
 *   Does not build Knowledge Ministries.
 *
 * THE KNOWLEDGE MINISTRIES ATTACHMENT POINT (identified, not implemented):
 *   Future Ministry providers attach via IRepositoryProvider +
 *   RepositoryManager.registerProvider() inside IntelligenceCompositionFactory.
 *   This engine remains provider-agnostic — it passes normalizedQuery and domain
 *   to IntelligenceEngine and receives an EvidenceBundle. Which Ministry answered
 *   is not this engine's concern.
 *
 *   See investigation-contracts.ts for the full attachment-point specification.
 */

import { IntelligenceCompositionFactory } from './intelligence-composition-factory';
import type { InvestigationIntent } from './understanding-contracts';
import type { InvestigationResult, InvestigationOutcome } from './investigation-contracts';

let investigationSequence = 0;

function generateResultId(intentId: string, atMs: number): string {
  investigationSequence += 1;
  return `inv-${intentId}-${atMs}-${investigationSequence}`;
}

/**
 * Conduct a constitutional investigation from an InvestigationIntent.
 *
 * The intent must have been produced by the Understanding stage from a
 * RECEIVED KnowledgeReception. Investigation shall not be called with
 * raw queries or directly constructed intents that bypass Reception and
 * Understanding — the constitutional order is Reception → Understanding →
 * Investigation and it is immutable.
 *
 * On success, the returned InvestigationResult carries the raw EvidenceBundle
 * alongside the intent's constitutional identity and lineage. The Evidence
 * stage (Package XIII) is the first stage authorised to evaluate the bundle.
 *
 * Invokes IntelligenceCompositionFactory.getEngine().investigate():
 *   input        = intent.normalizedQuery
 *   targetCategory = intent.domain
 *
 * Does not invoke any provider directly.
 * Does not score, judge, or conclude.
 */
export async function conductInvestigation(
  intent: InvestigationIntent,
): Promise<InvestigationOutcome> {
  if (intent.normalizedQuery.trim().length < 3) {
    return { ok: false, reason: 'QUERY_TOO_SHORT' };
  }

  try {
    const engine = IntelligenceCompositionFactory.getEngine();
    const rawBundle = await engine.investigate(intent.normalizedQuery, intent.domain);
    const investigatedAtMs = Date.now();

    const result: InvestigationResult = {
      resultId: generateResultId(intent.intentId, investigatedAtMs),
      intentId: intent.intentId,
      receptionId: intent.receptionId,
      origin: intent.origin,
      rawBundle,
      sovereignLineage: intent.sovereignLineage,
      investigatedAtMs,
    };

    return { ok: true, result };
  } catch (err) {
    return {
      ok: false,
      reason: 'INVESTIGATION_FAILED',
      error: String(err),
    };
  }
}
