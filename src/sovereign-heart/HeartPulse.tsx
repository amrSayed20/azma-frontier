/**
 * AZMA OS — THE CONSTITUTIONAL HEART (AL-WATEEN)
 * Heart Pulse — Application-Startup Activation
 * Integration Package "The First Constitutional Heartbeat"
 *
 * Mounted once, at the platform level (app/layout.tsx), as a sibling of
 * every chamber's own content — the same pattern already established by
 * the Sovereign Identity Layer's Director Stage (SIO-005B). Renders
 * nothing (returns null): the Heart has no visual presence, no DOM, no
 * Creator-facing behavior of any kind, exactly as this Integration
 * Package's Constitutional Limits require.
 *
 * SINGLETON GUARANTEE: awaken() is idempotent — it does nothing if the
 * Heart is already beating. Paired with a cleanup that calls rest(), this
 * survives React Strict Mode's mount→cleanup→re-mount double-invocation
 * in development without ever running two intervals at once: the
 * cleanup fully rests the Heart before the second mount awakens it
 * again. In ordinary production rendering, this component mounts once
 * and stays mounted for the life of the tab, so the Heart beats exactly
 * once, continuously, for as long as the Creator's session lasts.
 */

'use client';

import { useEffect } from 'react';
import { awaken, rest } from './heartbeat';

export function HeartPulse() {
  useEffect(() => {
    awaken();
    return () => {
      rest();
    };
  }, []);

  return null;
}
