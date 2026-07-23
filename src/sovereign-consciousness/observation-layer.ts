/**
 * AZMA OS — THE CONSTITUTIONAL CONSCIOUSNESS
 * The Constitutional Observation Layer
 * Construction Phase VII
 *
 * Subscribes read-only to the Nervous System's Bus (observeAll) — a
 * third subscriber, joining the Heart's continuity tracker (Phase IV)
 * and the Sovereign Core's perception intake (Integration Package "The
 * First Constitutional Thought"). It does not duplicate either: it never
 * derives Understanding/Claims (the Core's job) and never tracks
 * continuity itself (the Heart's job) — it only recognizes CHANGE: each
 * time a signal arrives, it compares the origin organ's current presence
 * status (read from the Heart, unchanged) against the last status this
 * layer itself recognized for that organ, and records a
 * ConstitutionalChangeRecord if it differs. This is the concrete
 * mechanism behind this phase's "Recognize constitutional change"
 * responsibility.
 *
 * DISCLOSED LIMITATION, found while writing this file's own tests: this
 * mechanism is event-driven, not polling — it re-checks an organ's
 * presence status only at the moment a NEW signal arrives from that same
 * organ. Since emitting a signal itself always makes an organ
 * "continuous" again (recordSignalSeen updates lastSeenAt before this
 * layer's own callback runs), this design can reliably recognize an
 * organ's ARRIVAL (never-observed -> continuous) but can never observe
 * it passively FALLING silent — there is no signal to react to when
 * nothing arrives. Building a timer to poll for silence would require
 * this layer to run its own independent clock, duplicating the Heart's
 * own rhythm mechanism, which this phase's Constitutional Limits
 * explicitly forbid ("shall never replace the Heart"). Disclosed here
 * rather than silently built around or hidden.
 *
 * Deliberately NOT auto-started anywhere in this Construction Phase —
 * the same discipline already applied to the Heart (Phase IV) and the
 * Sovereign Core (Phase V): built and proven correct by test, left
 * dormant pending its own future, separately-authorized activation
 * Integration Package.
 */

import { observeAll } from '../sovereign-nervous-system';
import type { ConstitutionalSignal } from '../sovereign-nervous-system';
import { getOrganContinuity, CONSTITUTIONAL_RHYTHM } from '../sovereign-heart';
import type { OrganContinuityStatus } from '../sovereign-heart';
import type { ConstitutionalChangeRecord } from './types';

let lastRecognizedStatusByOrgan = new Map<string, OrganContinuityStatus>();
let changeLog: ConstitutionalChangeRecord[] = [];
let unsubscribe: (() => void) | null = null;
let observing = false;

function onSignalObserved(signal: ConstitutionalSignal): void {
  const currentStatus = getOrganContinuity(signal.origin, CONSTITUTIONAL_RHYTHM).status;
  const previousStatus = lastRecognizedStatusByOrgan.get(signal.origin) ?? null;

  if (previousStatus !== currentStatus) {
    changeLog.push({
      organId: signal.origin,
      from: previousStatus,
      to: currentStatus,
      recognizedAt: new Date().toISOString(),
    });
    lastRecognizedStatusByOrgan.set(signal.origin, currentStatus);
  }
}

/** Begins live observation. Idempotent — calling while already observing does nothing, preventing a second, competing subscription. */
export function beginConstitutionalObservation(): void {
  if (observing) return;
  unsubscribe = observeAll(onSignalObserved);
  observing = true;
}

/** Ends live observation — unsubscribes from the Bus. The change log and last-recognized statuses are preserved (only resetObservationLayer() clears them). */
export function endConstitutionalObservation(): void {
  if (unsubscribe !== null) unsubscribe();
  unsubscribe = null;
  observing = false;
}

export function isObserving(): boolean {
  return observing;
}

/** Every constitutional change this layer has recognized so far, oldest first. */
export function getChangeLog(): readonly ConstitutionalChangeRecord[] {
  return [...changeLog];
}

/** Test/reset utility — clears all recognized-change state without touching the Nervous System or the Heart themselves. */
export function resetObservationLayer(): void {
  lastRecognizedStatusByOrgan = new Map();
  changeLog = [];
}
