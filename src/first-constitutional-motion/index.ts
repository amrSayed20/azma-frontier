/**
 * AZMA OS — THE FIRST CONSTITUTIONAL MOTION
 * Public API — import from here, never directly from the individual
 * files.
 *
 * The Constitutional Launch Integration Layer. See types.ts for the
 * full constitutional disclosure of what this module is (pure
 * orchestration of Registry Entries III → IV → I → II, using only
 * their existing public exports) and is not (an Engine, an Organ, or a
 * modification to any certified Engine).
 */

export type { FirstConstitutionalMotion, LaunchIntegrationCertification } from './types';

export { establishFirstConstitutionalMotion } from './motion-orchestrator';

export {
  verifyExecutionOrderPreserved,
  verifyNoNewResponsibilityIntroduced,
  verifyNoInterpretationOrTransformation,
  verifyNoAuthorityExercised,
  verifyManifestationNeverFabricated,
} from './certification';

export { getFirstConstitutionalMotionCertificationReport } from './queries';
