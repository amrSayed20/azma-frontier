/**
 * AZMA OS — THE CONSTITUTIONAL WILL (THE IMPERIAL INTENTION)
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Construction Campaign. See ENGINEERING_REVIEW.ts for what this module
 * built and deliberately did not build (most notably: no execution, no
 * Bus subscription of its own — pull-based over Reception's queue only).
 */

export type {
  IntentionReadiness,
  ConstitutionalIntention,
  IntentionRejection,
  ConstitutionalWillCertification,
} from './types';

export { CONSTITUTIONAL_WILL_PIPELINE } from './will-registry';
export { CONSTITUTIONAL_INTENTION_READINESS_STATES, CONSTITUTIONAL_INTENTION_FORMATION_RULE } from './intention-registry';
export { evaluateReceptionForIntention } from './intention-evaluator';

export {
  processReceptionQueueIntoIntentions,
  getIntentionQueue,
  getIntentionsForOrgan,
  getIntentionRejections,
  resetIntentionQueue,
} from './intention-queue';

export { isReady, listReadyIntentions } from './readiness-layer';

export {
  verifyEveryIntentionOriginatesFromReception,
  verifyIntentionsPreserveConstitutionalLaw,
  verifyUnauthorizedIntentionsAreRejected,
  verifyReadinessDistinguishedFromExecution,
  verifyNoExecutionAuthorityExists,
} from './certification';

export { getConstitutionalWillCertificationReport } from './queries';
