/**
 * AZMA OS — VISITOR PRESENCE
 * Public API — import from here, never directly from individual files.
 *
 * The two genuinely missing pieces identified by the Arrival Runtime
 * Foundation audit — see ../imperial-experience-engine/
 * ARRIVAL_RUNTIME_FOUNDATION_CONTRACT.ts for the full inventory of
 * what already existed and did not need to be rebuilt.
 */

export type { ArrivalRecord } from './arrival-record';
export { nextArrivalRecord, recordArrival, getArrivalRecord } from './arrival-record';

export type { PresenceState, PresenceMachineOptions, PresenceTracker } from './presence-tracker';
export { PresenceMachine, createPresenceTracker } from './presence-tracker';

export { useVisitorPresence } from './use-visitor-presence';
