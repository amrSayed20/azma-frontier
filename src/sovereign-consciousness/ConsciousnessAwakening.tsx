/**
 * AZMA OS — THE CONSTITUTIONAL CONSCIOUSNESS
 * Consciousness Awakening — Application-Startup Activation
 * Integration Campaign "The Living Body Integration"
 *
 * Mounted once, at the platform level (app/layout.tsx), as a sibling of
 * <DirectorStage />, <HeartPulse />, and <CoreThought /> — the same
 * activation pattern already established twice this campaign. Renders
 * nothing (returns null): Consciousness has no visual presence and no
 * Creator-facing behavior, exactly as this Integration Campaign's Out of
 * Scope requires ("No UI redesign"). Its only effect is that
 * Consciousness's own Observation Layer (Phase VII) begins recognizing
 * organ arrivals as constitutional change, live.
 */

'use client';

import { useEffect } from 'react';
import { beginConstitutionalObservation, endConstitutionalObservation } from './observation-layer';

export function ConsciousnessAwakening() {
  useEffect(() => {
    beginConstitutionalObservation();
    return () => {
      endConstitutionalObservation();
    };
  }, []);

  return null;
}
