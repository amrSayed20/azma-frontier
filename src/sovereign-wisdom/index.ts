/**
 * AZMA OS — THE CONSTITUTIONAL WISDOM (IMPERIAL MATURITY)
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Construction Phase IX. See PHASE_IX_ENGINEERING_REVIEW.ts for what
 * this phase built and deliberately did not build (most notably: no new
 * reasoning is introduced — Judgment only verifies a Claim's structural
 * provenance, and the Wisdom Archive remains deliberately unpopulated
 * per Constitutional Decision Two).
 */

export type {
  WisdomInput,
  WisdomInputDescriptor,
  ConstitutionalJudgmentVerdict,
  ConstitutionalJudgment,
  ReflectionSummary,
  MaturityRecord,
  LearningIntegrationSummary,
  DecisionPrinciple,
  ConstitutionalFaithfulnessReport,
  ConstitutionalWisdomCertification,
} from './types';

export { CONSTITUTIONAL_WISDOM_INPUTS } from './wisdom-registry';
export { judgeClaim, judgeAdvisory } from './judgment-layer';
export { reflectOnOrgan } from './reflection-engine';
export { getMaturityForOrgan } from './maturity-layer';
export { integrateLearningForOrgan } from './learning-integration';
export { CONSTITUTIONAL_DECISION_PRINCIPLES } from './decision-principles';
export { evaluateFaithfulnessForOrgan, evaluateFaithfulnessForBody } from './faithfulness-evaluator';

export {
  verifyWisdomDependsUponMemory,
  verifyWisdomDependsUponUnderstanding,
  verifyDistinguishesKnowledgeFromJudgment,
  verifyJudgmentsPreserveConstitutionalLaw,
  verifyMaturityIncreasesThroughExperience,
  verifyNoExecutionAuthorityExists,
} from './certification';

export { getConstitutionalWisdomCertificationReport } from './queries';
