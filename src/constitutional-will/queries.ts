/**
 * AZMA OS — THE CONSTITUTIONAL WILL
 * Read-only Query Layer
 * Construction Campaign
 *
 * A single, whole-Body view over all 5 Certification Requirements — used
 * for Council review, never for decision-making.
 */

import {
  verifyEveryIntentionOriginatesFromReception,
  verifyIntentionsPreserveConstitutionalLaw,
  verifyUnauthorizedIntentionsAreRejected,
  verifyReadinessDistinguishedFromExecution,
  verifyNoExecutionAuthorityExists,
} from './certification';
import type { ConstitutionalWillCertification } from './types';

export function getConstitutionalWillCertificationReport(): readonly ConstitutionalWillCertification[] {
  return [
    verifyEveryIntentionOriginatesFromReception(),
    verifyIntentionsPreserveConstitutionalLaw(),
    verifyUnauthorizedIntentionsAreRejected(),
    verifyReadinessDistinguishedFromExecution(),
    verifyNoExecutionAuthorityExists(),
  ];
}
