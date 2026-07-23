/**
 * AZMA OS — THE IMPERIAL VOICE
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Registry Entry I — The Imperial Tongue Engine. See types.ts for the
 * full constitutional disclosure of what this module is (a faithful
 * composer over five already-certified capabilities) and is not (a new
 * capability, a duplicate of Constitutional Expression, Manifestation,
 * Awareness, Wisdom, Judgment, Conscience, or Memory).
 */

export type { ImperialVoice, ImperialVoiceCertification } from './types';

export { isIdentityCurrentlyPreserved } from './identity-preservation';
export { composeImperialVoice } from './voice-composer';

export {
  verifyProducesImperialVoice,
  verifyNeverFabricatesCitizenIntention,
  verifyNoAuthorityExercised,
  verifyPreservesConstitutionalIdentity,
  verifyNeverBecomesConstitutionalMemory,
} from './certification';

export { getImperialVoiceCertificationReport } from './queries';
