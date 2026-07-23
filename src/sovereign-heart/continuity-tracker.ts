/**
 * AZMA OS — THE CONSTITUTIONAL HEART (AL-WATEEN)
 * The Constitutional Continuity Layer
 * Construction Phase IV
 *
 * Receives constitutional reality from the Nervous System (Phase II) by
 * observing every signal that crosses the Perception Bus — never a
 * second transport, never a duplicate Signal Log. Tracks only WHEN each
 * organ was last seen; computes a continuity STATUS from that timestamp
 * using the ONE shared rhythm (rhythm-registry.ts). There is exactly one
 * code path here, parameterized only by organId/lastSeenAt/rhythm — no
 * organ-specific branch exists anywhere in this file, which is what
 * "equal treatment, no privileged organ" means at the code level, not
 * merely as a stated intention.
 */

import { observeAll } from '../sovereign-nervous-system';
import type { ConstitutionalSignal } from '../sovereign-nervous-system';
import { CONSTITUTIONAL_ORGANS } from '../sovereign-body';
import type { ConstitutionalRhythm, OrganContinuityRecord, OrganContinuityStatus } from './types';

const lastSeenAtByOrgan = new Map<string, string>();

/** Records that an organ was observed at this signal's timestamp. Pure recording — computes nothing, judges nothing. */
export function recordSignalSeen(signal: ConstitutionalSignal): void {
  lastSeenAtByOrgan.set(signal.origin, signal.timestamp);
}

/** Subscribes the Continuity Layer to the Nervous System's Bus. Returns an unsubscribe function. */
export function beginReceivingConstitutionalReality(): () => void {
  return observeAll(recordSignalSeen);
}

function computeStatus(lastSeenAt: string | null, rhythm: ConstitutionalRhythm, now: number): OrganContinuityStatus {
  if (lastSeenAt === null) return 'never-observed';
  const elapsedMs = now - new Date(lastSeenAt).getTime();
  return elapsedMs > rhythm.silenceThresholdMs ? 'silent' : 'continuous';
}

/** The same formula, applied identically regardless of which organ is asked about — no organ receives privileged treatment. */
export function getOrganContinuity(
  organId: string,
  rhythm: ConstitutionalRhythm,
  now: number = Date.now(),
): OrganContinuityRecord {
  const lastSeenAt = lastSeenAtByOrgan.get(organId) ?? null;
  return { organId, lastSeenAt, status: computeStatus(lastSeenAt, rhythm, now) };
}

/**
 * Every organ known to the Skeleton (Phase I) — not only ones that have
 * reported — evaluated by the identical formula. An organ that has never
 * reported is not silently omitted; it is honestly recorded as
 * "never-observed," the same honesty discipline already applied to
 * every organ's implementationStatus in the Organ Registry.
 */
export function listAllOrganContinuity(
  rhythm: ConstitutionalRhythm,
  now: number = Date.now(),
): readonly OrganContinuityRecord[] {
  return CONSTITUTIONAL_ORGANS.map((organ) => getOrganContinuity(organ.id, rhythm, now));
}

/** Test/reset utility — clears all tracked continuity without touching the Nervous System itself. */
export function resetContinuityTracking(): void {
  lastSeenAtByOrgan.clear();
}
