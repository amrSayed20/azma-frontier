/**
 * AZMA OS — THE CONSTITUTIONAL RUNTIME COORDINATOR
 * Package I — The First Living Operational Cycle
 *
 * Decides WHEN the Dispatch Coordinator runs — never WHAT it does or in
 * WHAT ORDER (dispatch-coordinator.ts's own responsibility). Subscribes
 * to the same shared Nervous System Bus every other live organ already
 * observes, but reads nothing from the signal itself — the callback
 * only triggers the existing, already-safe dispatch sequence. Ensures
 * Constitutional Reception's own subscription is active FIRST, so its
 * queue is already populated by the time this coordinator's own
 * callback runs for the same signal (subscriber order is insertion
 * order on the shared Bus).
 */

import { observeAll } from '../sovereign-nervous-system';
import { beginConstitutionalReception, endConstitutionalReception } from '../constitutional-reception';
import { runDispatchCycle } from './dispatch-coordinator';
import { recordAuditEntry } from './audit-layer';

let unsubscribe: (() => void) | null = null;
let operating = false;

function onSignalToOperate(): void {
  const cycle = runDispatchCycle();
  recordAuditEntry(cycle);
}

/** Begins the Living Operational Cycle. Idempotent — calling while already operating does nothing, preventing a duplicate subscription. */
export function beginConstitutionalOperationalCycle(): void {
  if (operating) return;
  beginConstitutionalReception();
  unsubscribe = observeAll(onSignalToOperate);
  operating = true;
}

export function endConstitutionalOperationalCycle(): void {
  if (unsubscribe !== null) unsubscribe();
  unsubscribe = null;
  endConstitutionalReception();
  operating = false;
}

export function isOperating(): boolean {
  return operating;
}
