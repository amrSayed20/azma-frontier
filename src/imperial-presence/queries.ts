/**
 * AZMA OS — THE CONSTITUTIONAL IDENTITY
 * Read-only Query Layer
 * Construction Phase VI
 *
 * A single, whole-Body view over all 6 Certification Requirements — used
 * for Council review, never for decision-making.
 */

import {
  verifyOneConstitutionalFaceExists,
  verifyOneConstitutionalVoiceExists,
  verifyOneConstitutionalTongueExists,
  verifyEveryChamberInheritsOneConstitutionalIdentity,
  verifyAuthoritiesRemainUnified,
  verifyOneUninterruptedImperialPresence,
} from './certification';
import type { ConstitutionalIdentityCertification } from './types';

/** The full Certification Report — all 6 requirements, run and recorded together. */
export function getConstitutionalIdentityCertificationReport(): readonly ConstitutionalIdentityCertification[] {
  return [
    verifyOneConstitutionalFaceExists(),
    verifyOneConstitutionalVoiceExists(),
    verifyOneConstitutionalTongueExists(),
    verifyEveryChamberInheritsOneConstitutionalIdentity(),
    verifyAuthoritiesRemainUnified(),
    verifyOneUninterruptedImperialPresence(),
  ];
}
