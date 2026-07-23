/**
 * AZMA OS — THE CONSTITUTIONAL MEMORY
 * Memory Awakening — Application-Startup Activation
 * Integration Campaign "The Living Body Integration"
 *
 * Mounted once, at the platform level (app/layout.tsx), as a sibling of
 * <DirectorStage />, <HeartPulse />, <CoreThought />, and
 * <ConsciousnessAwakening /> — the same activation pattern already
 * established across this campaign. Renders nothing (returns null): the
 * Constitutional Memory has no visual presence and no Creator-facing
 * behavior. Its only effect is that the Knowledge Repository (Phase
 * VIII) begins accumulating every Advisory the Sovereign Core produces,
 * live.
 */

'use client';

import { useEffect } from 'react';
import { beginConstitutionalRemembering, endConstitutionalRemembering } from './knowledge-repository';

export function MemoryAwakening() {
  useEffect(() => {
    beginConstitutionalRemembering();
    return () => {
      endConstitutionalRemembering();
    };
  }, []);

  return null;
}
