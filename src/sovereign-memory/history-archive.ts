/**
 * AZMA OS — THE CONSTITUTIONAL MEMORY
 * The Constitutional History Archive
 * Construction Phase VIII
 *
 * A read-only lens over the Nervous System's own append-only Signal Log
 * (Phase II) — never a second store, never a duplicate transport. The
 * Signal Log is already immutable by construction (getSignalLog()
 * returns a fresh copy on every call; nothing in this repository ever
 * removes or reorders an entry). This file adds genuinely new archival
 * query shapes (by organ, by time range) that did not exist before this
 * phase, without re-implementing storage.
 */

import { getSignalLog, getSignalHistoryForOrgan } from '../sovereign-nervous-system';
import type { ConstitutionalSignal } from '../sovereign-nervous-system';

/** The complete constitutional history, exactly as it happened — read-only. */
export function getFullHistory(): readonly ConstitutionalSignal[] {
  return getSignalLog();
}

/** One organ's complete constitutional history, oldest first — read-only. */
export function getHistoryForOrgan(organId: string): readonly ConstitutionalSignal[] {
  return getSignalHistoryForOrgan(organId);
}

/** Every signal whose timestamp falls within [fromIso, toIso] (inclusive) — a genuinely new archival view this phase adds. */
export function getHistoryWithinRange(fromIso: string, toIso: string): readonly ConstitutionalSignal[] {
  return getSignalLog().filter((signal) => signal.timestamp >= fromIso && signal.timestamp <= toIso);
}

/**
 * Confirms the archive has not been rewritten: every entry present in an
 * earlier snapshot is still present, unchanged, at the same position, in
 * a later read. A real immutability check, not an assumption — history
 * may only grow, never be edited or reordered.
 */
export function verifyHistoryImmutable(
  earlierSnapshot: readonly ConstitutionalSignal[],
): { immutable: boolean; evidence: string } {
  const currentLog = getSignalLog();
  const prefixUnchanged = earlierSnapshot.every(
    (signal, index) => JSON.stringify(currentLog[index]) === JSON.stringify(signal),
  );
  const onlyGrew = currentLog.length >= earlierSnapshot.length;
  const immutable = prefixUnchanged && onlyGrew;
  return {
    immutable,
    evidence: immutable
      ? `Every one of the ${earlierSnapshot.length} previously-recorded signal(s) remains present, unchanged, at its original position; the archive has only grown (now ${currentLog.length}).`
      : 'The earlier snapshot\'s entries no longer match the current archive at their original positions, or the archive shrank.',
  };
}
