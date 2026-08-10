'use client';

/**
 * AZMA OS — useWisdomState
 * A React hook that computes the Empire's current body-level wisdom state
 * on demand. The result reflects however many advisories the Sovereign Core
 * has accumulated and MemoryAwakening has archived in this browser session —
 * a truly honest measure (starts at zero, grows with each heartbeat cycle).
 *
 * Re-computing on every call is intentional: wisdom grows as the session
 * proceeds, and no stale snapshot should be served to a consumer that calls
 * the hook after new advisories have been archived.
 */

import { computeBodyWisdomState } from './body-wisdom';
import type { BodyWisdomState } from './body-wisdom';

export function useWisdomState(): BodyWisdomState {
  return computeBodyWisdomState();
}
