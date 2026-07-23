/**
 * AZMA OS — THE CONSTITUTIONAL FAITHFULNESS EVALUATOR
 * Construction Phase IX
 *
 * A whole-Body view combining the Judgment Layer with the Constitutional
 * Memory's own accumulated history: for each organ, judges its most
 * recently archived Advisory's claims and reports whether all of them
 * are structurally faithful. An organ with no archived history yet
 * produces an empty, honest judgment list — never a fabricated one.
 */

import { CONSTITUTIONAL_ORGANS } from '../sovereign-body';
import { getKnowledgeHistoryForOrgan } from '../sovereign-memory';
import { judgeAdvisory } from './judgment-layer';
import type { ConstitutionalFaithfulnessReport } from './types';

export function evaluateFaithfulnessForOrgan(organId: string): ConstitutionalFaithfulnessReport {
  const history = getKnowledgeHistoryForOrgan(organId);
  const latest = history.length > 0 ? history[history.length - 1] : null;
  const judgments = latest ? judgeAdvisory(organId, latest.advisory) : [];
  return {
    organId,
    judgments,
    allFaithful: judgments.every((judgment) => judgment.verdict === 'faithful'),
  };
}

/** Every Skeleton-registered organ's faithfulness report — none silently omitted. */
export function evaluateFaithfulnessForBody(): readonly ConstitutionalFaithfulnessReport[] {
  return CONSTITUTIONAL_ORGANS.map((organ) => evaluateFaithfulnessForOrgan(organ.id));
}
