'use client';

import { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { ExperiencePhase } from './types';

export interface UseExperienceLifecycleOptions {
  /** How long the ceremonial reveal plays before the Experience settles into 'stable'. */
  readonly revealDurationMs: number;
  /** How long the ceremonial handoff plays before navigation actually occurs. */
  readonly handoffDurationMs: number;
}

export interface ExperienceLifecycle {
  readonly phase: ExperiencePhase;
  /** Begins the ceremonial handoff, then navigates — the Operating System Handoff step of the Engine -> Experience -> Lifecycle -> Presentation -> OS Handoff chain. */
  readonly beginHandoff: (destinationHref: string) => void;
}

/**
 * AZMA OS — THE IMPERIAL EXPERIENCE ENGINE (IXE)
 * The generic Experience lifecycle — owned by the Engine layer, shared
 * by every Experience Pipeline. Arrival is the first consumer; a future
 * Experience reuses this exact hook rather than inventing its own phase
 * model (see CONSTITUTIONAL_CONTRACT.ts, Extension Rules).
 */
export function useExperienceLifecycle({ revealDurationMs, handoffDurationMs }: UseExperienceLifecycleOptions): ExperienceLifecycle {
  const router = useRouter();
  const [phase, setPhase] = useState<ExperiencePhase>('entering');

  useEffect(() => {
    const settle = setTimeout(() => setPhase('stable'), revealDurationMs);
    return () => clearTimeout(settle);
  }, [revealDurationMs]);

  const beginHandoff = useCallback((destinationHref: string) => {
    setPhase('exiting');
    setTimeout(() => router.replace(destinationHref), handoffDurationMs);
  }, [handoffDurationMs, router]);

  return { phase, beginHandoff };
}
