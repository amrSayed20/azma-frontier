/**
 * AZMA OS — THE CONSTITUTIONAL HEART (AL-WATEEN)
 * Read-only Query Layer
 * Construction Phase IV
 */

import { listAllOrganContinuity } from './continuity-tracker';
import { getHeartbeatState } from './heartbeat';
import { CONSTITUTIONAL_RHYTHM } from './rhythm-registry';
import type { OrganContinuityRecord } from './types';

/** A single, complete snapshot of the Heart's own state and every organ's continuity — the raw material a future Sovereign Core would interpret, presented here without interpretation. */
export function getConstitutionalHealthSnapshot(): {
  heartbeat: ReturnType<typeof getHeartbeatState>;
  organs: readonly OrganContinuityRecord[];
} {
  return {
    heartbeat: getHeartbeatState(),
    organs: listAllOrganContinuity(CONSTITUTIONAL_RHYTHM),
  };
}

export { getOrganContinuity, listAllOrganContinuity } from './continuity-tracker';
