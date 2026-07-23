/**
 * AZMA OS — THE SOVEREIGN CORE
 * The Constitutional Memory Integration Layer
 * Construction Phase V
 *
 * DISCLOSURE (see types.ts header): no "Constitutional Memory" module
 * exists anywhere in this repository. The Nervous System's own
 * append-only Signal Log (Phase II) is the only genuine historical
 * record of constitutional reality that already exists, so this layer
 * treats it as the Core's memory substrate — reading it, organizing it
 * per organ, NEVER writing to it. "Constitutional memory is integrated
 * without altering historical truth" (Certification Requirement 4) is
 * satisfied by construction: this file contains no call to emitSignal or
 * any other mutating function anywhere in the Nervous System or
 * Circulation — only getSignalLog/getSignalHistoryForOrgan reads.
 */

import { getSignalHistoryForOrgan, getSignalLog } from '../sovereign-nervous-system';
import type { ConstitutionalSignal } from '../sovereign-nervous-system';

/** The full constitutional history of one organ, oldest first — read-only. */
export function getConstitutionalMemoryForOrgan(organId: string): readonly ConstitutionalSignal[] {
  return getSignalHistoryForOrgan(organId);
}

/** The full constitutional history of the entire Sovereign Body, exactly as it happened — read-only, never reordered or rewritten. */
export function getFullConstitutionalMemory(): readonly ConstitutionalSignal[] {
  return getSignalLog();
}
