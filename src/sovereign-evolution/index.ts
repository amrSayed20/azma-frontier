/**
 * AZMA OS — THE CONSTITUTIONAL EVOLUTION (CONTINUOUS MATURITY)
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Construction Phase X. See PHASE_X_ENGINEERING_REVIEW.ts for what this
 * phase built and deliberately did not build (most notably: no new
 * maturity measurement or history store — this module only records how
 * Wisdom's and Memory's own already-certified measurements change over
 * time, and verifies the Skeleton's declared identity is never altered).
 */

export type {
  EvolutionPhaseRecord,
  MaturitySnapshot,
  ImprovementRecord,
  RefinementObservation,
  ContinuityEvaluation,
  ConstitutionalEvolutionCertification,
} from './types';

export { CONSTITUTIONAL_EVOLUTION_HISTORY } from './evolution-registry';
export { getConstitutionalLearningForOrgan, listConstitutionalLearningForBody } from './learning-registry';

export {
  recordMaturitySnapshot,
  getMaturitySnapshotsForOrgan,
  getAllMaturitySnapshots,
  resetImprovementRegistry,
} from './improvement-registry';

export { evaluateImprovementForOrgan, identifyMostRefinedOrgan } from './refinement-layer';
export { getMaturityProgressionForOrgan } from './maturity-progression';
export { evaluateConstitutionalContinuity } from './continuity-evaluator';

export {
  verifyEvolutionPreservesConstitutionalIdentity,
  verifyImprovementStrengthensMaturity,
  verifyConstitutionalContinuityNeverBroken,
  verifyConstitutionalHistoryPreserved,
  verifyEvolutionServesTheCreator,
  verifyNoExecutionAuthorityExists,
} from './certification';

export { getConstitutionalEvolutionCertificationReport } from './queries';

/** Continuous Maturity Tracking + Evolution Awakening (Integration Campaign "The Living Body Integration") — brings Evolution, and transitively Wisdom, into living operation. */
export { beginContinuousMaturityTracking, endContinuousMaturityTracking, isTrackingMaturity } from './continuous-tracking';
export { EvolutionAwakening } from './EvolutionAwakening';
