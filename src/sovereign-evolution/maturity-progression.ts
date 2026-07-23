/**
 * AZMA OS — THE CONSTITUTIONAL EVOLUTION
 * The Constitutional Maturity Progression
 * Construction Phase X
 *
 * A dedicated, discoverable entry point onto the Improvement Registry's
 * own chronological (append-only) record for one organ — the
 * Progression is simply that history read in order, not a new store.
 */

import { getMaturitySnapshotsForOrgan } from './improvement-registry';
import type { MaturitySnapshot } from './types';

export function getMaturityProgressionForOrgan(organId: string): readonly MaturitySnapshot[] {
  return getMaturitySnapshotsForOrgan(organId);
}
