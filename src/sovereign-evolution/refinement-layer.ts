/**
 * AZMA OS — THE CONSTITUTIONAL EVOLUTION
 * The Constitutional Refinement Layer
 * Construction Phase X
 *
 * Purely comparative and observational — never acts on what it observes.
 * "Guide constitutional refinement" is satisfied by surfacing where
 * recorded maturity has grown, not by executing any change. Reads only
 * from the Improvement Registry's own recorded snapshots; never records
 * a new one itself (that separation of responsibility belongs to
 * improvement-registry.ts alone).
 */

import { CONSTITUTIONAL_ORGANS } from '../sovereign-body';
import { getMaturitySnapshotsForOrgan } from './improvement-registry';
import type { ImprovementRecord, RefinementObservation } from './types';

export function evaluateImprovementForOrgan(organId: string): ImprovementRecord {
  const organSnapshots = getMaturitySnapshotsForOrgan(organId);
  if (organSnapshots.length < 2) {
    return {
      organId,
      improved: false,
      delta: 0,
      evidence: 'Fewer than 2 recorded snapshots — insufficient history to evaluate improvement.',
    };
  }
  const first = organSnapshots[0];
  const last = organSnapshots[organSnapshots.length - 1];
  const delta = last.maturityScore - first.maturityScore;
  return {
    organId,
    improved: delta >= 0,
    delta,
    evidence: `Maturity moved from ${first.maturityScore} to ${last.maturityScore} across ${organSnapshots.length} recorded snapshots (delta ${delta}) — never decreased.`,
  };
}

/** Identifies which organ shows the largest recorded maturity growth so far — an observation, never an instruction. */
export function identifyMostRefinedOrgan(): RefinementObservation {
  const candidates = CONSTITUTIONAL_ORGANS.map((organ) => evaluateImprovementForOrgan(organ.id)).filter(
    (record) => getMaturitySnapshotsForOrgan(record.organId).length >= 2,
  );
  if (candidates.length === 0) {
    return { organId: null, delta: 0, evidence: 'No organ has at least 2 recorded maturity snapshots yet.' };
  }
  const best = candidates.reduce((leader, candidate) => (candidate.delta > leader.delta ? candidate : leader));
  return {
    organId: best.organId,
    delta: best.delta,
    evidence: `${best.organId} shows the largest recorded maturity growth so far (delta ${best.delta}).`,
  };
}
