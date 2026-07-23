/**
 * AZMA OS — THE CONSTITUTIONAL NAVIGATION LAYER
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Package IV, "Living Experience Foundation." See
 * CONSTITUTIONAL_NAVIGATION_LAYER_ENGINEERING_REVIEW.ts for what this
 * package built, what it deliberately left untouched, and why.
 */

export type {
  ChamberDestination,
  ChamberDirectoryEntry,
  ConstitutionalNavigationCertification,
} from './types';

export { CHAMBER_DIRECTORY, isChamberDestination, getChamberPathname } from './chamber-directory';
export { ConstitutionalLink } from './ConstitutionalLink';
export { useConstitutionalNavigation } from './useConstitutionalNavigation';
export type { ConstitutionalNavigation } from './useConstitutionalNavigation';

export {
  verifyEveryChamberHasOneNavigableDestination,
  verifyEveryChamberDestinationIsAKnownRoute,
} from './certification';

export { getConstitutionalNavigationCertificationReport } from './queries';
