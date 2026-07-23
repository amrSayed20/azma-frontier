/**
 * AZMA OS — THE SOVEREIGN CORE
 * Live Perception Intake
 * Integration Package "The First Constitutional Thought"
 *
 * Brings the Core into living operation: subscribes read-only to the
 * Constitutional Nervous System's Bus — the same single subscription
 * point already used by the Heart (Phase IV's beginReceivingConstitutional
 * Reality). Deliberately NOT a second, separate subscription to
 * Circulation's own Flows: Circulation (Phase III) is itself a lens over
 * this same Bus, not a second transport, so any signal delivered via
 * circulateFromClient()/ingestCirculatedSignal() already arrives through
 * this one subscription once it lands in the Signal Log — proven by
 * test, not merely asserted (see
 * __tests__/first-constitutional-thought.test.ts). Subscribing twice
 * would duplicate a transport that already exists once, violating the
 * same "never duplicate" discipline applied throughout this campaign.
 *
 * On every signal received, the Core re-derives that organ's own
 * Understanding/Claims/Plan/Advisory (adviseOnOrgan — unchanged, still a
 * pure function) and caches the result. This module never calls
 * emitSignal, circulateFromClient, awaken, rest, or any other mutating
 * function anywhere in the Living Body — confirmed by inspection and by
 * this package's own tests (Constitutional Limits: "shall never modify
 * Constitutional Memory / Circulation / Al-Wateen").
 */

import { observeAll } from '../sovereign-nervous-system';
import type { ConstitutionalSignal } from '../sovereign-nervous-system';
import { adviseOnOrgan } from './advisory-layer';
import type { ConstitutionalAdvisory } from './types';

let latestAdvisoryByOrgan = new Map<string, ConstitutionalAdvisory>();
let receivedSignalCount = 0;
let unsubscribe: (() => void) | null = null;
let thinking = false;

function onSignalReceived(signal: ConstitutionalSignal): void {
  receivedSignalCount += 1;
  latestAdvisoryByOrgan.set(signal.origin, adviseOnOrgan(signal.origin));
}

/**
 * Begins the Core's live perception. Idempotent — calling while already
 * thinking does nothing, preventing a second, competing subscription
 * (mirroring the Heart's own awaken() guarantee).
 */
export function beginConstitutionalThought(): void {
  if (thinking) return;
  unsubscribe = observeAll(onSignalReceived);
  thinking = true;
}

/**
 * Ends the Core's live perception — unsubscribes from the Bus. Cached
 * advisories and the receipt count are preserved (only
 * resetPerceptionIntake() clears them), mirroring the Heart's own
 * rest()/resetContinuityTracking() split.
 */
export function endConstitutionalThought(): void {
  if (unsubscribe !== null) unsubscribe();
  unsubscribe = null;
  thinking = false;
}

export function isThinking(): boolean {
  return thinking;
}

/** The Core's own cached advisory for one organ, as of the last signal it received about that organ — null if none has arrived since the Core began thinking. */
export function getLatestAdvisoryForOrgan(organId: string): ConstitutionalAdvisory | null {
  return latestAdvisoryByOrgan.get(organId) ?? null;
}

export function getReceivedSignalCount(): number {
  return receivedSignalCount;
}

/** Test/reset utility — clears all live-perception state without touching the Nervous System or Circulation themselves. */
export function resetPerceptionIntake(): void {
  latestAdvisoryByOrgan = new Map();
  receivedSignalCount = 0;
}
