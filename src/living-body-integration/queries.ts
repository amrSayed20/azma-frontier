/**
 * AZMA OS — THE LIVING BODY INTEGRATION
 * Read-only Query Layer
 * Integration Campaign
 *
 * A single, whole-Body view over all 5 Certification Requirements — used
 * for Council review, never for decision-making.
 */

import {
  verifyContinuousCooperationAmongAllOrgans,
  verifyAuthoritySeparationPreserved,
  verifyInformationFlowsThroughCompleteLivingBody,
  verifyNoOrganAssumesAnothersResponsibility,
  verifyConstitutionalHarmonyPreserved,
} from './cooperation-certification';
import type { LivingBodyCooperationCertification } from './types';

export function getLivingBodyCooperationCertificationReport(): readonly LivingBodyCooperationCertification[] {
  return [
    verifyContinuousCooperationAmongAllOrgans(),
    verifyAuthoritySeparationPreserved(),
    verifyInformationFlowsThroughCompleteLivingBody(),
    verifyNoOrganAssumesAnothersResponsibility(),
    verifyConstitutionalHarmonyPreserved(),
  ];
}
