/**
 * AZMA OS — THE CONSTITUTIONAL EXPRESSION
 * The Constitutional Expression Filter
 * Construction Campaign
 *
 * "Evaluate constitutional relevance" — a mechanical, non-judgmental
 * threshold: an organ is relevant enough to express only once at least
 * `minimumSources` of the 5 sources have real evidence for it. This
 * never evaluates whether the CONTENT is good, correct, or worthy —
 * only whether enough independent, already-certified organs have
 * something real to say about it. Content-level dignity is a separate,
 * later gate (expression-composer.ts, reusing the Tongue's own
 * validateDignity).
 */

import { CONSTITUTIONAL_ORGANS } from '../sovereign-body';
import { gatherAllForOrgan } from './gathering';

export function filterOrgansWithSufficientEvidence(minimumSources: number = 1): readonly string[] {
  return CONSTITUTIONAL_ORGANS.map((organ) => organ.id).filter(
    (organId) => gatherAllForOrgan(organId).length >= minimumSources,
  );
}
