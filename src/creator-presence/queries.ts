/**
 * AZMA OS — THE CREATOR PRESENCE
 * Read-only Query Layer
 * Registry Entry III — The Creator Welcome Engine
 *
 * A single, whole-picture view over this Engine's own certification
 * checks for one raw arrival — used for Council review, never for
 * decision-making.
 */

import {
  verifyFaithfullyPreservesRawPresence,
  verifyNeverInterpretsOrJudges,
  verifyNeverConstructsTongueIntent,
  verifyNoAuthorityExercised,
} from './certification';
import type { ChamberContext, InputMethod } from '../core/tongue';
import type { CreatorWelcomeCertification } from './types';

export function getCreatorWelcomeCertificationReport(
  raw: string,
  method: InputMethod,
  context: ChamberContext,
): readonly CreatorWelcomeCertification[] {
  return [
    verifyFaithfullyPreservesRawPresence(raw, method, context),
    verifyNeverInterpretsOrJudges(raw, method, context),
    verifyNeverConstructsTongueIntent(raw, method, context),
    verifyNoAuthorityExercised(raw, method, context),
  ];
}
