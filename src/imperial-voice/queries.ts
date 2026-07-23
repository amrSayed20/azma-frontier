/**
 * AZMA OS — THE IMPERIAL VOICE
 * Read-only Query Layer
 * Registry Entry I — The Imperial Tongue Engine
 *
 * A single, whole-picture view over this Engine's own certification
 * checks for one Chamber context — used for Council review, never for
 * decision-making.
 */

import {
  verifyProducesImperialVoice,
  verifyNeverFabricatesCitizenIntention,
  verifyNoAuthorityExercised,
  verifyPreservesConstitutionalIdentity,
  verifyNeverBecomesConstitutionalMemory,
} from './certification';
import type { ChamberContext } from '../core/tongue';
import type { ImperialVoiceCertification } from './types';

export function getImperialVoiceCertificationReport(context: ChamberContext): readonly ImperialVoiceCertification[] {
  return [
    verifyProducesImperialVoice(context),
    verifyNeverFabricatesCitizenIntention(context),
    verifyNoAuthorityExercised(context),
    verifyPreservesConstitutionalIdentity(context),
    verifyNeverBecomesConstitutionalMemory(context),
  ];
}
