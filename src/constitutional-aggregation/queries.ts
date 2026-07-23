/**
 * AZMA OS — THE CONSTITUTIONAL MANIFESTATION SYSTEM
 * Read-only Query Layer
 * Constitutional Package II
 *
 * A single, whole-picture view over this Package's own certification
 * checks for one subject — used for Council review, never for
 * decision-making.
 */

import {
  verifySupportsMultipleSources,
  verifyNeverCreatesConstitutionalTruth,
  verifyNeverFiltersOrPrioritizes,
  verifyPreservesConstitutionalIdentity,
  verifyNoAuthorityExercised,
} from './certification';
import type { ConstitutionalManifestationCertification } from './types';

export function getConstitutionalManifestationCertificationReport(
  subjectKey: string,
): readonly ConstitutionalManifestationCertification[] {
  return [
    verifySupportsMultipleSources(subjectKey),
    verifyNeverCreatesConstitutionalTruth(subjectKey),
    verifyNeverFiltersOrPrioritizes(subjectKey),
    verifyPreservesConstitutionalIdentity(subjectKey),
    verifyNoAuthorityExercised(),
  ];
}
