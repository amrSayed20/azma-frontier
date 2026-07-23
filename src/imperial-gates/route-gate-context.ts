/**
 * AZMA OS — THE IMPERIAL GATES
 * Route Resolution
 *
 * Mirrors src/sovereign-identity/director-stage/route-context.ts's own
 * pattern exactly (first path segment → identity, or null if
 * unrecognized) — kept as a separate, parallel table rather than
 * merged into ROUTE_CHAMBER_IDS, since Gates are not Chambers.
 *
 * /founder is deliberately NOT mapped here — the Founder's own journey
 * is constitutionally separate from the Creator's (per "The Founder
 * Identity Resolution"); Imperial Gates belong to the Creator journey.
 */

import type { ImperialGateId } from './types';

const ROUTE_GATE_IDS: ReadonlyMap<string, ImperialGateId> = new Map([
  ['', 'landing'],
  ['login', 'login'],
  ['signup', 'signup'],
  ['subscribe', 'subscription'],
]);

/** Resolves a Next.js pathname to its Imperial Gate identity, or null if the route isn't a Gate. */
export function resolveGateId(pathname: string | null): ImperialGateId | null {
  const firstSegment = (pathname ?? '').split('/').filter(Boolean)[0] ?? '';
  return ROUTE_GATE_IDS.get(firstSegment) ?? null;
}
