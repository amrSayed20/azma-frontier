/**
 * AZMA OS — THE CONSTITUTIONAL NAVIGATION LAYER
 * Read-only Query Layer — a single, whole-layer view over both
 * Certification Requirements, used for Council review only.
 */

import {
  verifyEveryChamberHasOneNavigableDestination,
  verifyEveryChamberDestinationIsAKnownRoute,
} from './certification';
import type { ConstitutionalNavigationCertification } from './types';

export function getConstitutionalNavigationCertificationReport(): readonly ConstitutionalNavigationCertification[] {
  return [
    verifyEveryChamberHasOneNavigableDestination(),
    verifyEveryChamberDestinationIsAKnownRoute(),
  ];
}
