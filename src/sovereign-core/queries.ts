/**
 * AZMA OS — THE SOVEREIGN CORE
 * Read-only Query Layer
 * Construction Phase V
 *
 * Whole-Body views over the Core's own layers — used for certification
 * and Council review, never for decision-making.
 */

import { CONSTITUTIONAL_ORGANS } from '../sovereign-body';
import { adviseOnOrgan } from './advisory-layer';
import type { ConstitutionalAdvisory } from './types';

/** The Core's advisory for every organ the Skeleton knows about — a full "Constitutional Mind snapshot," not a partial sample. */
export function getConstitutionalMindSnapshot(): readonly ConstitutionalAdvisory[] {
  return CONSTITUTIONAL_ORGANS.map((organ) => adviseOnOrgan(organ.id));
}
