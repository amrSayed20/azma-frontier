/**
 * AZMA OS — THE CONSTITUTIONAL WISDOM
 * Body-Level Wisdom Computation
 *
 * A single, honest snapshot of the Empire's accumulated wisdom across all
 * registered constitutional organs. Reads only from already-certified
 * sources (maturity-layer, faithfulness-evaluator, sovereign-body organ
 * registry) — no new reasoning, no fabrication, no judgment beyond what
 * each sub-layer already declares.
 *
 * All values are derived on demand: maturity scores are monotonically
 * non-decreasing counts of archived advisories (sovereign-memory), and
 * faithfulness verdicts are structural provenance checks only, never
 * content re-derivations.
 */

import { CONSTITUTIONAL_ORGANS } from '../sovereign-body';
import { getMaturityForOrgan } from './maturity-layer';
import { evaluateFaithfulnessForBody } from './faithfulness-evaluator';
import type { MaturityRecord, ConstitutionalFaithfulnessReport } from './types';

export interface BodyWisdomState {
  /** Sum of all organs' maturity scores — a monotonically non-decreasing measure of accumulated experience. */
  readonly totalMaturityScore: number;
  /** How many constitutional organs are registered. */
  readonly organCount: number;
  /** How many organs have accumulated at least one advisory (maturityScore > 0). */
  readonly matureOrganCount: number;
  /** Per-organ maturity records, in organ-registry order. */
  readonly organMaturity: readonly MaturityRecord[];
  /** Structural faithfulness check for every registered organ's most recent advisory. */
  readonly faithfulnessReports: readonly ConstitutionalFaithfulnessReport[];
  readonly computedAt: string;
}

export function computeBodyWisdomState(): BodyWisdomState {
  const organMaturity = CONSTITUTIONAL_ORGANS.map((organ) => getMaturityForOrgan(organ.id));
  const totalMaturityScore = organMaturity.reduce((sum, r) => sum + r.maturityScore, 0);
  const matureOrganCount = organMaturity.filter((r) => r.maturityScore > 0).length;
  const faithfulnessReports = evaluateFaithfulnessForBody();

  return {
    totalMaturityScore,
    organCount: CONSTITUTIONAL_ORGANS.length,
    matureOrganCount,
    organMaturity,
    faithfulnessReports,
    computedAt: new Date().toISOString(),
  };
}
