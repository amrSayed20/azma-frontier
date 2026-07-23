/**
 * AZMA OS — THE CONSTITUTIONAL MANIFESTATION SYSTEM
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Constitutional Package II. See ENGINEERING_REVIEW.ts for what this
 * module built and deliberately did not build (most notably: no real
 * UI, dashboard, or rendering surface — data only, per the same
 * established discipline as every other module in this constitutional
 * communication chain; see types.ts's own disclosure).
 */

export type {
  ConstitutionalSourceId,
  ConstitutionalSourceDescriptor,
  ConstitutionalSourceInput,
  ConstitutionalManifestation,
  ConstitutionalManifestationCertification,
} from './types';

export { CONSTITUTIONAL_SOURCES } from './source-registry';
export { gatherFromImperialTongue, gatherFromConstitutionalExpression, gatherFromAllSources } from './source-adapters';
export { isIdentityCurrentlyPreserved } from './identity-preservation';
export { composeManifestationForSubject } from './manifestation-composer';

export {
  verifySupportsMultipleSources,
  verifyNeverCreatesConstitutionalTruth,
  verifyNeverFiltersOrPrioritizes,
  verifyPreservesConstitutionalIdentity,
  verifyNoAuthorityExercised,
} from './certification';

export { getConstitutionalManifestationCertificationReport } from './queries';
