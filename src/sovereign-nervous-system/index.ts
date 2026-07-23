/**
 * AZMA OS — THE CONSTITUTIONAL NERVOUS SYSTEM
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Construction Phase II. See PHASE_II_ENGINEERING_REVIEW.ts for what
 * this phase built and deliberately did not build.
 */

export type {
  ConstitutionalSignal,
  ConstitutionalSignalType,
  PerceptionEndpoint,
  SignalListener,
} from './types';

export { CONSTITUTIONAL_EVENTS, CONSTITUTIONAL_SIGNAL_TYPES } from './signal-vocabulary';
export type { ConstitutionalEvent } from './signal-vocabulary';

export { isLegitimateSignalOrigin, assertLegitimateSignalOrigin } from './signal-origin-registry';

export {
  recordOrganState,
  observeOrganState,
  observeOrganStateOfType,
  listObservedOrganIds,
} from './state-registry';

export { emitSignal, observeOrgan, observeSignalType, observeAll, getSignalLog } from './perception-bus';

export { createPerceptionEndpointForOrgan, PERCEPTION_CONTRACT } from './perception-contracts';

export {
  getSignalHistoryForOrgan,
  verifyLogTraceability,
  getObservedOrgansSummary,
} from './queries';
