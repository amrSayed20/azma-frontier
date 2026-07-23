/**
 * AZMA OS — THE CONSTITUTIONAL IDENTITY (THE IMPERIAL PRESENCE)
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Construction Phase VI. See PHASE_VI_ENGINEERING_REVIEW.ts for what
 * this phase built and deliberately did not build (most notably: no new
 * Face/Voice/Tongue/Authority/Director engine — all 9 objectives already
 * had complete, certified, live prior art; this module certifies and
 * unifies it instead of duplicating it).
 */

export type {
  ConstitutionalIdentityObjective,
  ObjectiveArtifactMapping,
  ConstitutionalIdentityCertification,
  ChamberIdentityCoverage,
} from './types';

export { CONSTITUTIONAL_IDENTITY_OBJECTIVES } from './objective-registry';
export { KNOWN_APPLICATION_ROUTES } from './presence-registry';

export {
  verifyOneConstitutionalFaceExists,
  verifyOneConstitutionalVoiceExists,
  verifyOneConstitutionalTongueExists,
  verifyEveryChamberInheritsOneConstitutionalIdentity,
  verifyAuthoritiesRemainUnified,
  verifyOneUninterruptedImperialPresence,
} from './certification';

export { getConstitutionalIdentityCertificationReport } from './queries';
