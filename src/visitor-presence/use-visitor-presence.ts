'use client';

import { useEffect, useState } from 'react';
import { createPresenceTracker, type PresenceState } from './presence-tracker';

/**
 * AZMA OS — VISITOR PRESENCE
 * React hook wrapper over createPresenceTracker.
 *
 * Not yet consumed by any page — exported and ready. Wiring a page's
 * visible behavior to presence state is a Welcome-Experience decision,
 * not a runtime-foundation one.
 */
export function useVisitorPresence(): PresenceState {
  const [state, setState] = useState<PresenceState>('present');

  useEffect(() => {
    // The tracker always starts 'present' (see PresenceMachine), matching
    // this hook's initial state, so no synchronous setState is needed here
    // — only the subscription for future changes.
    const tracker = createPresenceTracker();
    const unsubscribe = tracker.subscribe(setState);
    return () => {
      unsubscribe();
      tracker.destroy();
    };
  }, []);

  return state;
}
