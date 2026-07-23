/**
 * AZMA OS — THE CONSTITUTIONAL EXECUTION
 * Read-only Query Layer
 * Construction Campaign
 *
 * A single, whole-Body view over all 5 Certification Requirements — used
 * for Council review, never for decision-making.
 */

import {
  verifyEveryExecutionOriginatesFromApprovedDecision,
  verifyUnauthorizedExecutionsAreRejected,
  verifyEveryExecutionRemainsFullyTraceable,
  verifyExecutionResultsAreFaithfullyRecorded,
  verifyZeroDecisionMakingAuthorityExists,
} from './certification';
import type { ConstitutionalExecutionCertification } from './types';

export function getConstitutionalExecutionCertificationReport(): readonly ConstitutionalExecutionCertification[] {
  return [
    verifyEveryExecutionOriginatesFromApprovedDecision(),
    verifyUnauthorizedExecutionsAreRejected(),
    verifyEveryExecutionRemainsFullyTraceable(),
    verifyExecutionResultsAreFaithfullyRecorded(),
    verifyZeroDecisionMakingAuthorityExists(),
  ];
}
