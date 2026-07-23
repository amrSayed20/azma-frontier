/**
 * AZMA OS — THE CONSTITUTIONAL CONSCIOUSNESS (THE LIVING AWARENESS)
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Construction Phase VII. See PHASE_VII_ENGINEERING_REVIEW.ts for what
 * this phase built and deliberately did not build (most notably: the
 * Observation Layer is not auto-started anywhere — the same discipline
 * already applied to the Heart before Phase IV's own activation package
 * and the Sovereign Core before Phase V's own activation package).
 */

export type {
  AwarenessDimension,
  AwarenessDimensionDescriptor,
  OrganCondition,
  ConstitutionalHarmonyObservation,
  ConstitutionalChangeRecord,
  SelfRecognitionResult,
  ConstitutionalAwarenessCertification,
} from './types';

export { CONSTITUTIONAL_AWARENESS_DIMENSIONS } from './awareness-registry';
export { getAwarenessStateForOrgan, listAwareOrganIds } from './awareness-state';
export { isOrganPresent, listPresentOrganIds } from './presence-layer';
export { getConditionForOrgan, listAllOrganConditions } from './condition-monitor';
export { observeConstitutionalHarmony } from './harmony-observer';
export { recognizeSelf } from './self-recognition';

export {
  beginConstitutionalObservation,
  endConstitutionalObservation,
  isObserving,
  getChangeLog,
  resetObservationLayer,
} from './observation-layer';

export {
  verifyContinuousConditionRecognition,
  verifyAwarenessRemainsReadOnly,
  verifyObservesEveryParticipatingOrgan,
  verifyHarmonyCanBeRecognized,
  verifyImbalanceCanBeRecognized,
  verifyNoAuthorityExercised,
} from './certification';

export { getConstitutionalAwarenessCertificationReport } from './queries';

/** Consciousness Awakening (Integration Campaign "The Living Body Integration") — brings Consciousness into living operation. */
export { ConsciousnessAwakening } from './ConsciousnessAwakening';
