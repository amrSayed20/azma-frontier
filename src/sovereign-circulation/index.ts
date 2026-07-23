/**
 * AZMA OS — THE CONSTITUTIONAL CIRCULATION
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Construction Phase III. See PHASE_III_ENGINEERING_REVIEW.ts for what
 * this phase built and deliberately did not build.
 */

export type { ConstitutionalFlowId, ConstitutionalFlow, CirculationEnvelope, CirculationResult } from './types';
export { CONSTITUTIONAL_FLOWS } from './flow-registry';
export { circulateFromClient, ingestCirculatedSignal } from './transport';
export { observeStateFlow } from './state-flow';
export { observeContextFlow } from './context-flow';
export { observeCapabilityFlow } from './capability-flow';
export { observeAuthorityFlow } from './authority-flow';
export { observeHealthFlow } from './health-flow';
export { verifyCrossRuntimeContinuity } from './queries';
