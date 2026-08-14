'use client';
/**
 * AZMA OS — THE CONSTITUTIONAL NAVIGATION LAYER
 * Imperative navigation — for the rare case where a Creator's action
 * (not a rendered link) triggers a Chamber transition. Uses
 * window.location.assign (full-page navigation) to avoid an RSC
 * client-side navigation failure observed in production via Cloudflare.
 */

import { getChamberPathname, isChamberDestination } from './chamber-directory';
import type { ChamberDestination } from './types';

export interface ConstitutionalNavigation {
  readonly goTo: (destination: ChamberDestination | (string & {})) => void;
}

export function useConstitutionalNavigation(): ConstitutionalNavigation {
  function goTo(destination: ChamberDestination | (string & {})): void {
    const pathname = isChamberDestination(destination) ? getChamberPathname(destination) : destination;
    window.location.assign(pathname);
  }

  return { goTo };
}
