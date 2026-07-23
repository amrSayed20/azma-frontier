/**
 * AZMA OS — THE CONSTITUTIONAL WISDOM
 * Read-only Query Layer
 * Construction Phase IX
 *
 * A single, whole-Body view over all 6 Certification Requirements — used
 * for Council review, never for decision-making.
 */

import {
  verifyWisdomDependsUponMemory,
  verifyWisdomDependsUponUnderstanding,
  verifyDistinguishesKnowledgeFromJudgment,
  verifyJudgmentsPreserveConstitutionalLaw,
  verifyMaturityIncreasesThroughExperience,
  verifyNoExecutionAuthorityExists,
} from './certification';
import type { ConstitutionalWisdomCertification } from './types';

export function getConstitutionalWisdomCertificationReport(): readonly ConstitutionalWisdomCertification[] {
  return [
    verifyWisdomDependsUponMemory(),
    verifyWisdomDependsUponUnderstanding(),
    verifyDistinguishesKnowledgeFromJudgment(),
    verifyJudgmentsPreserveConstitutionalLaw(),
    verifyMaturityIncreasesThroughExperience(),
    verifyNoExecutionAuthorityExists(),
  ];
}
