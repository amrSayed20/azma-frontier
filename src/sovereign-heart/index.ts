/**
 * AZMA OS — THE CONSTITUTIONAL HEART (AL-WATEEN)
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Construction Phase IV. See PHASE_IV_ENGINEERING_REVIEW.ts for what
 * this phase built and deliberately did not build (most notably: this
 * Heart is not auto-started anywhere).
 */

export type {
  ConstitutionalRhythm,
  OrganContinuityStatus,
  OrganContinuityRecord,
  HeartbeatState,
} from './types';

export { CONSTITUTIONAL_RHYTHM } from './rhythm-registry';

export {
  recordSignalSeen,
  beginReceivingConstitutionalReality,
  getOrganContinuity,
  listAllOrganContinuity,
  resetContinuityTracking,
} from './continuity-tracker';

export { tick, awaken, rest, getHeartbeatState } from './heartbeat';

export { getConstitutionalHealthSnapshot } from './queries';

export { HeartPulse } from './HeartPulse';
