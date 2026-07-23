/**
 * AZMA OS — THE CONSTITUTIONAL EXECUTION (CONSTITUTIONAL ACTION)
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Construction Campaign. See ENGINEERING_REVIEW.ts for what this module
 * built and deliberately did not build (most notably: "execution" here
 * means recording a faithful receipt, never a real side effect on any
 * organ, provider, or external system — see types.ts's own disclosure).
 */

export type {
  ConstitutionalActionKind,
  ConstitutionalAction,
  ConstitutionalExecution,
  ExecutionResult,
  ExecutionRejection,
  ConstitutionalExecutionCertification,
} from './types';

export { CONSTITUTIONAL_EXECUTION_PIPELINE } from './execution-registry';
export { CONSTITUTIONAL_ACTION } from './action-registry';
export { evaluateDecisionForExecution } from './execution-evaluator';

export {
  getExecutionQueue,
  getExecutionsForOrgan,
  hasProcessedDecision,
  resetExecutionQueue,
} from './execution-queue';

export {
  appendExecutionResult,
  getAllExecutionResults,
  getExecutionResult,
  resetExecutionResultRegistry,
} from './execution-result-registry';

export {
  processDecisionsIntoExecutions,
  getExecutionRejections,
  resetExecutionRejections,
} from './execution-pipeline';

export {
  verifyEveryExecutionOriginatesFromApprovedDecision,
  verifyUnauthorizedExecutionsAreRejected,
  verifyEveryExecutionRemainsFullyTraceable,
  verifyExecutionResultsAreFaithfullyRecorded,
  verifyZeroDecisionMakingAuthorityExists,
} from './certification';

export { getConstitutionalExecutionCertificationReport } from './queries';
