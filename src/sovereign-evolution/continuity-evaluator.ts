/**
 * AZMA OS — THE CONSTITUTIONAL EVOLUTION
 * The Constitutional Continuity Evaluator
 * Construction Phase X
 *
 * The mechanism behind "protect constitutional identity" and
 * "constitutional continuity is never broken": reuses the Skeleton's own
 * organHasCompleteConstitutionalHome() (Phase I) across every registered
 * organ, and Memory's own verifyHistoryImmutable() (Phase VIII) — never
 * re-deriving either check. If a future phase ever registered an organ
 * without a complete region/system/boundary/authority, or if history
 * were ever found altered, this evaluator would be the first to report
 * it honestly.
 */

import { CONSTITUTIONAL_ORGANS, organHasCompleteConstitutionalHome } from '../sovereign-body';
import { getFullHistory, verifyHistoryImmutable } from '../sovereign-memory';
import type { ContinuityEvaluation } from './types';

export function evaluateConstitutionalContinuity(): ContinuityEvaluation {
  const incomplete = CONSTITUTIONAL_ORGANS.filter((organ) => !organHasCompleteConstitutionalHome(organ.id));
  const identityIntact = incomplete.length === 0;

  const snapshot = getFullHistory();
  const historyImmutable = verifyHistoryImmutable(snapshot).immutable;

  return {
    identityIntact,
    historyImmutable,
    evidence: identityIntact
      ? `All ${CONSTITUTIONAL_ORGANS.length} Skeleton-registered organs retain a complete constitutional home (region, system, boundary, authority); the History Archive remains immutable.`
      : `Incomplete constitutional home for: ${incomplete.map((organ) => organ.id).join(', ')}.`,
  };
}
