'use client';
/**
 * AZMA OS — THE CONSTITUTIONAL NAVIGATION LAYER
 * Imperative navigation — for the rare case where a Creator's action
 * (not a rendered link) triggers a Chamber transition. Wraps next/
 * navigation's router.push so no Chamber calls window.location.href for
 * a route this application itself serves. Uses the identical underlying
 * primitive (useRouter().push) already used by the Imperial Experience
 * Engine's own beginHandoff — this hook does not compete with it, it is
 * the same mechanism made available outside a ceremonial handoff.
 */

import { useRouter } from 'next/navigation';
import { getChamberPathname, isChamberDestination } from './chamber-directory';
import type { ChamberDestination } from './types';

export interface ConstitutionalNavigation {
  readonly goTo: (destination: ChamberDestination | (string & {})) => void;
}

export function useConstitutionalNavigation(): ConstitutionalNavigation {
  const router = useRouter();

  function goTo(destination: ChamberDestination | (string & {})): void {
    const pathname = isChamberDestination(destination) ? getChamberPathname(destination) : destination;
    router.push(pathname);
  }

  return { goTo };
}
