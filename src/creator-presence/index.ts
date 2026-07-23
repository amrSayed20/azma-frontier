/**
 * AZMA OS — THE CREATOR PRESENCE
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Registry Entry III — The Creator Welcome Engine. See types.ts for the
 * full constitutional disclosure of what this module is (a faithful,
 * minimal capture of the Creator's raw arrival) and is not (TongueIntent,
 * which belongs solely to the Imperial Tongue Engine).
 */

export type { CreatorPresence, CreatorWelcomeCertification } from './types';

export { receiveCreatorPresence } from './welcome-composer';

export {
  verifyFaithfullyPreservesRawPresence,
  verifyNeverInterpretsOrJudges,
  verifyNeverConstructsTongueIntent,
  verifyNoAuthorityExercised,
} from './certification';

export { getCreatorWelcomeCertificationReport } from './queries';
