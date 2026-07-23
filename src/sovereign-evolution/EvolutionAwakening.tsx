/**
 * AZMA OS — THE CONSTITUTIONAL EVOLUTION
 * Evolution Awakening — Application-Startup Activation
 * Integration Campaign "The Living Body Integration"
 *
 * Mounted once, at the platform level (app/layout.tsx), completing the
 * set of live activations alongside <DirectorStage />, <HeartPulse />,
 * <CoreThought />, <ConsciousnessAwakening />, and <MemoryAwakening />.
 * Renders nothing (returns null). Its only effect is that maturity
 * snapshots are now recorded automatically as real signals occur,
 * rather than only when a caller manually invokes
 * recordMaturitySnapshot().
 */

'use client';

import { useEffect } from 'react';
import { beginContinuousMaturityTracking, endContinuousMaturityTracking } from './continuous-tracking';

export function EvolutionAwakening() {
  useEffect(() => {
    beginContinuousMaturityTracking();
    return () => {
      endContinuousMaturityTracking();
    };
  }, []);

  return null;
}
