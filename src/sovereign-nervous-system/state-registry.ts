/**
 * AZMA OS — THE CONSTITUTIONAL NERVOUS SYSTEM
 * The Constitutional State Registry
 * Construction Phase II
 *
 * "Every constitutional state shall be observable" (Engineering
 * Requirements). This module holds the ONE piece of genuinely mutable
 * runtime state in this Construction Phase: the last-known signal of
 * each type, per organ. It records only — it never branches on the
 * values it stores, never scores them, never raises anything, never
 * decides whether a state is "good" or "bad." That would be
 * interpretation, which this phase explicitly forbids (Out of Scope:
 * "Any interpretation of signals").
 */

import type { ConstitutionalSignal, ConstitutionalSignalType } from './types';

type OrganStateRecord = Partial<Record<ConstitutionalSignalType, ConstitutionalSignal>>;

const organStates = new Map<string, OrganStateRecord>();

/** Records a signal as the given organ's new last-known state for its signal type. Pure recording — no branching on content. */
export function recordOrganState(signal: ConstitutionalSignal): void {
  const existing = organStates.get(signal.origin) ?? {};
  organStates.set(signal.origin, { ...existing, [signal.signalType]: signal });
}

/** Reads one organ's complete last-known observable state, across every signal type it has reported. */
export function observeOrganState(organId: string): Readonly<OrganStateRecord> {
  return organStates.get(organId) ?? {};
}

/** Reads one organ's last-known state for a single signal type, or null if never reported. */
export function observeOrganStateOfType(
  organId: string,
  signalType: ConstitutionalSignalType,
): ConstitutionalSignal | null {
  return organStates.get(organId)?.[signalType] ?? null;
}

/** Every organ id that has reported at least one signal so far. Read-only enumeration — not a decision about who "should" have reported. */
export function listObservedOrganIds(): readonly string[] {
  return Array.from(organStates.keys());
}
