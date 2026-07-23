/**
 * AZMA OS — THE CONSTITUTIONAL EVOLUTION
 * Continuous Maturity Tracking
 * Integration Campaign "The Living Body Integration"
 *
 * "Integrate Constitutional Evolution into continuous maturity
 * tracking" — a read-only subscriber to the Nervous System's Bus (a
 * fifth, joining the Heart, the Sovereign Core, Consciousness, and
 * Memory), whose only action is to call the Improvement Registry's own,
 * unmodified recordMaturitySnapshot() — turning the previously manual
 * audit trail into an automatic, continuous one. Records nothing itself
 * that recordMaturitySnapshot() didn't already do; only decides WHEN to
 * call it (on every signal).
 *
 * THIS IS ALSO HOW WISDOM ENTERS THE LIVING CYCLE: recordMaturitySnapshot
 * itself reads from the Constitutional Wisdom's own getMaturityForOrgan()
 * (Phase IX). Wisdom gains no subscription of its own — it remains a
 * pure, on-demand computation layer — but is now exercised continuously
 * BY this subscription rather than only when a caller manually asks.
 * This is a deliberate design choice, disclosed rather than assumed:
 * giving Wisdom a second, redundant subscription of its own would
 * duplicate a transport this module already reaches through Evolution.
 */

import { observeAll } from '../sovereign-nervous-system';
import type { ConstitutionalSignal } from '../sovereign-nervous-system';
import { recordMaturitySnapshot } from './improvement-registry';

let unsubscribe: (() => void) | null = null;
let tracking = false;

function onSignalToTrack(signal: ConstitutionalSignal): void {
  recordMaturitySnapshot(signal.origin);
}

/** Begins continuous maturity tracking. Idempotent — calling while already tracking does nothing, preventing a duplicate subscription. */
export function beginContinuousMaturityTracking(): void {
  if (tracking) return;
  unsubscribe = observeAll(onSignalToTrack);
  tracking = true;
}

export function endContinuousMaturityTracking(): void {
  if (unsubscribe !== null) unsubscribe();
  unsubscribe = null;
  tracking = false;
}

export function isTrackingMaturity(): boolean {
  return tracking;
}
