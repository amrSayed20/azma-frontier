/**
 * AZMA OS — THE CONSTITUTIONAL RECEPTION
 * Read-only Query Layer
 * Construction Campaign
 *
 * A single, whole-Body view over all 5 Certification Requirements — used
 * for Council review, never for decision-making.
 */

import {
  verifyEveryReceptionOriginatesFromExpressionLayer,
  verifyNoOrganCommunicatesDirectlyWithRecipient,
  verifyReceptionPreservesDignity,
  verifyConstitutionalPriorityRespected,
  verifyUnauthorizedReceptionNeverOccurs,
} from './certification';
import type { ConstitutionalReceptionCertification } from './types';

export function getConstitutionalReceptionCertificationReport(): readonly ConstitutionalReceptionCertification[] {
  return [
    verifyEveryReceptionOriginatesFromExpressionLayer(),
    verifyNoOrganCommunicatesDirectlyWithRecipient(),
    verifyReceptionPreservesDignity(),
    verifyConstitutionalPriorityRespected(),
    verifyUnauthorizedReceptionNeverOccurs(),
  ];
}
