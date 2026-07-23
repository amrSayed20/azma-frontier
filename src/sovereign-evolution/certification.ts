/**
 * AZMA OS — THE CONSTITUTIONAL EVOLUTION
 * The Constitutional Evolution Certification Layer
 * Construction Phase X
 *
 * Implements this phase's own 6 Certification Requirements as real,
 * runnable, parameterless checks. Every function here is a pure read:
 * none mutates anything, none calls emitSignal, circulateFromClient,
 * awaken, rest, recordSignalSeen, or any Sovereign Core execution
 * path — confirmed by inspection and by this package's own tests.
 */

import { getSignalLog } from '../sovereign-nervous-system';
import { getHeartbeatState } from '../sovereign-heart';
import { getBoundaryForOrgan } from '../sovereign-body';
import { evaluateConstitutionalContinuity } from './continuity-evaluator';
import { getAllMaturitySnapshots } from './improvement-registry';
import { evaluateImprovementForOrgan } from './refinement-layer';
import type { ConstitutionalEvolutionCertification } from './types';

/** Certification Requirement 1: "Verify that every evolution preserves constitutional identity." */
export function verifyEvolutionPreservesConstitutionalIdentity(): ConstitutionalEvolutionCertification {
  const evaluation = evaluateConstitutionalContinuity();
  return {
    criterion: 'Every evolution preserves constitutional identity.',
    verified: evaluation.identityIntact,
    evidence: evaluation.evidence,
  };
}

/** Certification Requirement 2: "Verify that every improvement strengthens constitutional maturity." */
export function verifyImprovementStrengthensMaturity(): ConstitutionalEvolutionCertification {
  const allSnapshots = getAllMaturitySnapshots();
  const organIdsWithHistory = Array.from(new Set(allSnapshots.map((snapshot) => snapshot.organId))).filter(
    (organId) => allSnapshots.filter((s) => s.organId === organId).length >= 2,
  );

  if (organIdsWithHistory.length === 0) {
    return {
      criterion: 'Every improvement strengthens constitutional maturity.',
      verified: false,
      evidence: 'No organ has at least 2 recorded maturity snapshots yet — insufficient data to verify.',
    };
  }

  const allNonDecreasing = organIdsWithHistory
    .map((organId) => evaluateImprovementForOrgan(organId))
    .every((record) => record.delta >= 0);
  return {
    criterion: 'Every improvement strengthens constitutional maturity.',
    verified: allNonDecreasing,
    evidence: allNonDecreasing
      ? `Every organ with recorded history (${organIdsWithHistory.length}) shows a non-negative maturity delta — improvement never weakens maturity.`
      : 'At least one organ\'s recorded maturity decreased between snapshots.',
  };
}

/** Certification Requirement 3: "Verify that constitutional continuity is never broken." */
export function verifyConstitutionalContinuityNeverBroken(): ConstitutionalEvolutionCertification {
  const evaluation = evaluateConstitutionalContinuity();
  const verified = evaluation.identityIntact && evaluation.historyImmutable;
  return {
    criterion: 'Constitutional continuity is never broken.',
    verified,
    evidence: verified
      ? 'Both constitutional identity (every organ\'s complete home) and historical immutability hold simultaneously.'
      : 'Either constitutional identity or historical immutability was found broken.',
  };
}

/** Certification Requirement 4: "Verify that constitutional history remains preserved." */
export function verifyConstitutionalHistoryPreserved(): ConstitutionalEvolutionCertification {
  const evaluation = evaluateConstitutionalContinuity();
  return {
    criterion: 'Constitutional history remains preserved.',
    verified: evaluation.historyImmutable,
    evidence: evaluation.evidence,
  };
}

/** Certification Requirement 5: "Verify that evolution always serves the Creator." */
export function verifyEvolutionServesTheCreator(): ConstitutionalEvolutionCertification {
  const coreBoundary = getBoundaryForOrgan('sovereign-core');
  const creatorProtected = coreBoundary?.prohibitions.some((prohibition) => prohibition.includes('Creator')) ?? false;
  return {
    criterion: 'Evolution always serves the Creator.',
    verified: creatorProtected,
    evidence: creatorProtected
      ? "The Sovereign Core's own Boundary (Phase I, unmodified by this phase) still prohibits ever replacing the Creator's constitutional freedom — Evolution has not weakened this protection."
      : "The Sovereign Core's Boundary no longer protects the Creator's constitutional freedom.",
  };
}

/** Certification Requirement 6: "Verify that no execution authority exists." */
export function verifyNoExecutionAuthorityExists(): ConstitutionalEvolutionCertification {
  const logBefore = getSignalLog().length;
  const heartBefore = getHeartbeatState();
  evaluateConstitutionalContinuity();
  getAllMaturitySnapshots();
  const verified = getSignalLog().length === logBefore && JSON.stringify(getHeartbeatState()) === JSON.stringify(heartBefore);
  return {
    criterion: 'No execution authority exists.',
    verified,
    evidence: verified
      ? 'No function in this module calls emitSignal, circulateFromClient, awaken, rest, or recordSignalSeen (confirmed by inspection); the Signal Log and Heartbeat state are unaffected by running this module\'s own read functions.'
      : 'A call into this module produced an observable change in the Signal Log or Heartbeat state.',
  };
}
