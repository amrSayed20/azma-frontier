/**
 * AZMA OS — THE IMPERIAL GATES
 * Public API — import from here, never directly from the individual
 * files.
 *
 * The constitutional entrances of the Living Empire (Landing, the
 * Imperial Gate, Login, Signup, Subscription), distinct from Chambers
 * and distinct from the separate Founder journey. See types.ts for the
 * full disclosure.
 *
 * NO PERSISTENT JOURNEY MEMORY, BY CONSTITUTIONAL RULING (2026-07-15):
 * a real bridge to the Sovereign Journey Engine would require reviving
 * an entire disconnected 14-step runtime kernel. The Council explicitly
 * rejected a temporary architectural substitute for that Responsibility
 * — "temporary functional limitation" is preferred over "temporary
 * architectural corruption." No first-time/returning distinction exists
 * anywhere in this module; every Gate arrival is treated identically.
 * Persistent Journey Memory remains reserved for a future, separately-
 * authorized Constitutional Bridge Package.
 */

export type { ImperialGateId, ImperialGateScore } from './types';
export { isImperialGateId } from './types';
export { IMPERIAL_GATE_SCORES } from './gate-registry';
export { resolveGateId } from './route-gate-context';
