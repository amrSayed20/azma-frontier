/**
 * AZMA OS — THE CONSTITUTIONAL DECISION
 * Read-only Query Layer
 * Construction Campaign
 *
 * A single, whole-Body view over all 6 Certification Requirements — used
 * for Council review, never for decision-making.
 */

import {
  verifyEveryDecisionOriginatesFromWill,
  verifyEveryDecisionGroundedInWisdom,
  verifyEveryDecisionPreservesConstitutionalLaw,
  verifyUnauthorizedDecisionsAreRejected,
  verifyZeroExecutionAuthorityExists,
  verifyDecisionsRemainFullyTraceable,
} from './certification';
import type { ConstitutionalDecisionCertification } from './types';

export function getConstitutionalDecisionCertificationReport(): readonly ConstitutionalDecisionCertification[] {
  return [
    verifyEveryDecisionOriginatesFromWill(),
    verifyEveryDecisionGroundedInWisdom(),
    verifyEveryDecisionPreservesConstitutionalLaw(),
    verifyUnauthorizedDecisionsAreRejected(),
    verifyZeroExecutionAuthorityExists(),
    verifyDecisionsRemainFullyTraceable(),
  ];
}
