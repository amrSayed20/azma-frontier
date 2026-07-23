/**
 * AZMA OS — THE CONSTITUTIONAL NAVIGATION LAYER
 * Certification Layer
 *
 * Real, runnable checks — never prose assertions. Every function here is
 * a pure read: none mutates anything, none renders anything.
 */

import { CONTEXT_ROLES } from '../core/tongue';
import { KNOWN_APPLICATION_ROUTES } from '../imperial-presence';
import { CHAMBER_DIRECTORY } from './chamber-directory';
import type { ConstitutionalNavigationCertification } from './types';

/** Certification Requirement 1: "Verify that every real Chamber has exactly one navigable destination." */
export function verifyEveryChamberHasOneNavigableDestination(): ConstitutionalNavigationCertification {
  const chamberIds = Object.keys(CONTEXT_ROLES).filter((id) => id !== 'universal');
  const missing = chamberIds.filter((id) => !CHAMBER_DIRECTORY.some((entry) => entry.chamber === id));
  const duplicates = CHAMBER_DIRECTORY.length !== new Set(CHAMBER_DIRECTORY.map((entry) => entry.chamber)).size;
  const verified = missing.length === 0 && !duplicates;
  return {
    criterion: 'Every real Chamber (ChamberContext excluding "universal") has exactly one Chamber Directory entry.',
    verified,
    evidence: verified
      ? `All ${chamberIds.length} Chambers from src/core/tongue's ChamberContext resolve to exactly one Chamber Directory entry each.`
      : `Missing directory entries for: ${missing.join(', ') || 'none'}${duplicates ? '; duplicate entries also found' : ''}.`,
  };
}

/** Certification Requirement 2: "Verify that every Chamber destination resolves to a route the platform already certifies exists." */
export function verifyEveryChamberDestinationIsAKnownRoute(): ConstitutionalNavigationCertification {
  const unknown = CHAMBER_DIRECTORY.filter((entry) => !KNOWN_APPLICATION_ROUTES.includes(entry.pathname));
  return {
    criterion: 'Every Chamber Directory destination appears in the Imperial Presence registry\'s KNOWN_APPLICATION_ROUTES.',
    verified: unknown.length === 0,
    evidence: unknown.length === 0
      ? `All ${CHAMBER_DIRECTORY.length} Chamber destinations are already certified, real application routes.`
      : `Destinations not present in KNOWN_APPLICATION_ROUTES: ${unknown.map((entry) => entry.pathname).join(', ')}.`,
  };
}
