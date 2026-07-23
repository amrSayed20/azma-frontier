/**
 * AZMA OS — Sovereign Identity Orchestrator
 * DIRECTOR STAGE — Route Context Resolution (Construction ID SIO-005B)
 *
 * Resolves a pathname to a ChamberContext without inventing chamber
 * identity for routes that were never given one. Only the five routes
 * whose folder name is itself a defined ChamberContext id resolve
 * directly (verified against app/*\/page.tsx and ChamberContext in
 * src/core/tongue/constitution.ts). Every other route — including the
 * root path and the five routes with no constitutional chamber identity
 * (sovereign-member, sovereign-explorer, sovereign-gate, sovereign-vault,
 * sovereign-high-council) — resolves to 'universal', the ChamberContext
 * already and exactly defined for "no specific chamber."
 */

import type { ChamberContext } from '../../core/tongue';
import { resolveGateId } from '../../imperial-gates/route-gate-context';
import type { ImperialGateId } from '../../imperial-gates/types';

const ROUTE_CHAMBER_IDS: ReadonlySet<ChamberContext> = new Set<ChamberContext>([
  'sovereign-vault-palace',
  'hujjah-al-damighah',
  'qiyamah-chamber',
  'ras-amr',
  'makman-al-ghayah',
]);

/** Resolves a Next.js pathname to its constitutional ChamberContext. Unchanged — Gates are resolved separately, never merged into this table. */
export function resolveChamberContext(pathname: string | null): ChamberContext {
  const firstSegment = (pathname ?? '').split('/').filter(Boolean)[0] ?? '';
  return ROUTE_CHAMBER_IDS.has(firstSegment as ChamberContext)
    ? (firstSegment as ChamberContext)
    : 'universal';
}

/** A pathname resolves to either a Chamber (a creator workspace) or an Imperial Gate (a constitutional entrance) — never both. */
export type SceneIdentity = ChamberContext | ImperialGateId;

/**
 * Per "The Law of Cinematic Continuity": DirectorStage recognizes
 * Imperial Gates as their own identity, distinct from Chambers. Gate
 * routes are checked first since they're a small, closed set with no
 * overlap against ROUTE_CHAMBER_IDS; falls through to
 * resolveChamberContext (including its own 'universal' fallback) for
 * everything else.
 */
export function resolveSceneIdentity(pathname: string | null): SceneIdentity {
  const gateId = resolveGateId(pathname);
  return gateId ?? resolveChamberContext(pathname);
}
