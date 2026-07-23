/**
 * AZMA OS — THE FIRST CONSTITUTIONAL MOTION
 * Read-only Query Layer
 *
 * A single, whole-picture view over this Integration Layer's own
 * certification checks for one Constitutional Motion — used for
 * Council review, never for decision-making.
 */

import {
  verifyExecutionOrderPreserved,
  verifyNoNewResponsibilityIntroduced,
  verifyNoInterpretationOrTransformation,
  verifyNoAuthorityExercised,
  verifyManifestationNeverFabricated,
} from './certification';
import type { InputMethod, ChamberContext } from '../core/tongue';
import type { LaunchIntegrationCertification } from './types';

export function getFirstConstitutionalMotionCertificationReport(
  raw: string,
  method: InputMethod,
  context: ChamberContext,
  subjectKey?: string,
): readonly LaunchIntegrationCertification[] {
  return [
    verifyExecutionOrderPreserved(raw, method, context, subjectKey),
    verifyNoNewResponsibilityIntroduced(raw, method, context, subjectKey),
    verifyNoInterpretationOrTransformation(raw, method, context, subjectKey),
    verifyNoAuthorityExercised(raw, method, context, subjectKey),
    verifyManifestationNeverFabricated(raw, method, context, subjectKey),
  ];
}
