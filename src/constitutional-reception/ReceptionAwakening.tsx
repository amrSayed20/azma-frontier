'use client';

/**
 * AZMA OS — CONSTITUTIONAL RECEPTION AWAKENING
 * Mounts the Constitutional Reception Queue as the 7th subscriber to the
 * Sovereign Nervous System Bus — joining HeartPulse, CoreThought,
 * ConsciousnessAwakening, MemoryAwakening, EvolutionAwakening, and
 * OperationsAwakening in app/layout.tsx.
 *
 * The queue is deliberately idempotent (beginConstitutionalReception is a
 * no-op when already receiving) so double-mounts in development StrictMode
 * are safe. Cleanup on unmount stops the subscription cleanly.
 */

import { useEffect } from 'react';
import { beginConstitutionalReception, endConstitutionalReception } from './reception-queue';

export function ReceptionAwakening(): null {
  useEffect(() => {
    beginConstitutionalReception();
    return () => {
      endConstitutionalReception();
    };
  }, []);
  return null;
}
