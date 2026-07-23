/**
 * AZMA OS — THE CONSTITUTIONAL ACTUATION
 * Read-only Query Layer
 * Construction Campaign
 *
 * A single, whole-Body view over all 4 Certification Requirements — used
 * for Council review, never for decision-making.
 */

import {
  verifyEveryActuationOriginatesFromExecution,
  verifyExecutionPathwaysAreAuthorized,
  verifyEveryRoutingDecisionIsTraceable,
  verifyNoAuthorityExistsBeyondRouting,
} from './certification';
import type { ConstitutionalActuationCertification } from './types';

export function getConstitutionalActuationCertificationReport(): readonly ConstitutionalActuationCertification[] {
  return [
    verifyEveryActuationOriginatesFromExecution(),
    verifyExecutionPathwaysAreAuthorized(),
    verifyEveryRoutingDecisionIsTraceable(),
    verifyNoAuthorityExistsBeyondRouting(),
  ];
}
