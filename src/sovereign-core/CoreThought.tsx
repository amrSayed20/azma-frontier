/**
 * AZMA OS — THE SOVEREIGN CORE
 * Core Thought — Application-Startup Activation
 * Integration Package "The First Constitutional Thought"
 *
 * Mounted once, at the platform level (app/layout.tsx), as a sibling of
 * <DirectorStage /> and <HeartPulse /> — the same activation pattern
 * already established for the Heart. Renders nothing (returns null): the
 * Core has no visual presence and no Creator-facing behavior of any
 * kind, exactly as this Integration Package's Out of Scope requires
 * ("No Creator-facing AI assistant"). Its only effect is that the Core's
 * own internal cache (getLatestAdvisoryForOrgan) begins updating as real
 * constitutional signals arrive — nothing external is ever mutated, and
 * nothing downstream automatically acts on what the Core produces.
 */

'use client';

import { useEffect } from 'react';
import { beginConstitutionalThought, endConstitutionalThought } from './perception-intake';

export function CoreThought() {
  useEffect(() => {
    beginConstitutionalThought();
    return () => {
      endConstitutionalThought();
    };
  }, []);

  return null;
}
