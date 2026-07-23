/**
 * AZMA OS — THE CONSTITUTIONAL DECISION (IMPERIAL JUDGMENT)
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Construction Campaign. See ENGINEERING_REVIEW.ts for what this module
 * built and deliberately did not build (most notably: no execution, no
 * Bus subscription of its own — pull-based over Will's queue only,
 * consulting Wisdom/Memory/Awareness/Law as read-only context).
 */

export type {
  ConstitutionalDecisionVerdict,
  ConstitutionalDecision,
  DecisionRejection,
  ConstitutionalDecisionCertification,
} from './types';

export { CONSTITUTIONAL_DECISION_PIPELINE } from './decision-registry';
export { CONSTITUTIONAL_JUDGMENT_TREE } from './judgment-registry';
export { evaluateIntentionForDecision } from './decision-evaluator';

export {
  processIntentionsIntoDecisions,
  getDecisionQueue,
  getDecisionsForOrgan,
  getDecisionRejections,
  resetDecisionQueue,
} from './decision-queue';

export { getFullDecisionHistory, getDecisionHistoryByVerdict, getDecisionHistoryForOrgan } from './decision-history';

export {
  verifyEveryDecisionOriginatesFromWill,
  verifyEveryDecisionGroundedInWisdom,
  verifyEveryDecisionPreservesConstitutionalLaw,
  verifyUnauthorizedDecisionsAreRejected,
  verifyZeroExecutionAuthorityExists,
  verifyDecisionsRemainFullyTraceable,
} from './certification';

export { getConstitutionalDecisionCertificationReport } from './queries';
