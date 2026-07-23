/**
 * AZMA OS — THE CONSTITUTIONAL EXPRESSION (THE IMPERIAL EXPRESSION)
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Construction Campaign. See ENGINEERING_REVIEW.ts for what this module
 * built and deliberately did not build (most notably: no UI, no
 * dashboard, no Creator-facing surface — data only, per this Campaign's
 * own Out of Scope).
 */

export type {
  ExpressionSourceOrgan,
  ConstitutionalExpressionInput,
  ConstitutionalExpressionDignity,
  ConstitutionalExpression,
  ConstitutionalExpressionCertification,
} from './types';

export { EXPRESSION_SOURCE_REGISTRY, EXPRESSION_SOURCE_PRIORITY_ORDER } from './expression-registry';

export {
  gatherFromAlWateen,
  gatherFromSovereignCore,
  gatherFromConsciousness,
  gatherFromMemory,
  gatherFromEvolution,
  gatherAllForOrgan,
} from './gathering';

export { filterOrgansWithSufficientEvidence } from './expression-filter';
export { prioritizeInputs } from './expression-prioritizer';
export { composeExpressionForOrgan } from './expression-composer';

export {
  verifyExpressionOriginatesFromRealEvidence,
  verifyExpressionNeverAltersTruth,
  verifyMultipleOrgansBecomeOneVoice,
  verifyExpressionPreservesDignity,
  verifyNoOrganBypassesExpressionLayer,
} from './certification';

export { composeExpressionsForRelevantOrgans, getConstitutionalExpressionCertificationReport } from './queries';
