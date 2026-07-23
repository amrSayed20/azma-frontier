/**
 * AZMA OS — THE CONSTITUTIONAL NAVIGATION LAYER
 * Chamber Directory — the single source of truth for where each real
 * Chamber lives.
 *
 * Inherits chamber identity from src/core/tongue/constitution.ts's own
 * ChamberContext/CONTEXT_ROLES (Operating Charter Article IV/X: inherit,
 * never duplicate). This file invents nothing — it only pairs two facts
 * that already exist separately: which ids are Chambers (the Tongue),
 * and that a Chamber's pathname is always "/" + its ChamberContext id
 * (the same fact src/sovereign-identity/director-stage/route-context.ts's
 * own ROUTE_CHAMBER_IDS already depends on).
 */

import { CONTEXT_ROLES, type ChamberContext } from '../core/tongue';
import type { ChamberDestination, ChamberDirectoryEntry } from './types';

const CHAMBER_DESTINATIONS: readonly ChamberDestination[] = (
  Object.keys(CONTEXT_ROLES) as ChamberContext[]
).filter((context): context is ChamberDestination => context !== 'universal');

export const CHAMBER_DIRECTORY: readonly ChamberDirectoryEntry[] = CHAMBER_DESTINATIONS.map((chamber) => ({
  chamber,
  pathname: `/${chamber}`,
  role: CONTEXT_ROLES[chamber],
}));

const CHAMBER_ID_SET: ReadonlySet<string> = new Set(CHAMBER_DESTINATIONS);

export function isChamberDestination(value: string): value is ChamberDestination {
  return CHAMBER_ID_SET.has(value);
}

export function getChamberPathname(chamber: ChamberDestination): string {
  return `/${chamber}`;
}
