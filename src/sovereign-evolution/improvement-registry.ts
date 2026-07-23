/**
 * AZMA OS — THE CONSTITUTIONAL EVOLUTION
 * The Constitutional Improvement Registry
 * Construction Phase X
 *
 * An append-only audit trail of maturity readings over time. This file
 * does NOT measure maturity itself — every score is read verbatim from
 * the Constitutional Wisdom's own getMaturityForOrgan() (Phase IX). It
 * only records WHEN a reading was taken, so later layers can observe how
 * maturity has moved across recorded points, without re-deriving the
 * measurement.
 */

import { getMaturityForOrgan } from '../sovereign-wisdom';
import type { MaturitySnapshot } from './types';

let snapshots: MaturitySnapshot[] = [];

/** Records the current maturity reading for one organ. Pure recording — the score itself comes entirely from Wisdom's own measurement. */
export function recordMaturitySnapshot(organId: string): MaturitySnapshot {
  const snapshot: MaturitySnapshot = {
    organId,
    maturityScore: getMaturityForOrgan(organId).maturityScore,
    recordedAt: new Date().toISOString(),
  };
  snapshots.push(snapshot);
  return snapshot;
}

export function getMaturitySnapshotsForOrgan(organId: string): readonly MaturitySnapshot[] {
  return snapshots.filter((snapshot) => snapshot.organId === organId);
}

export function getAllMaturitySnapshots(): readonly MaturitySnapshot[] {
  return [...snapshots];
}

/** Test/reset utility — clears the recorded audit trail without touching Wisdom's own measurement. */
export function resetImprovementRegistry(): void {
  snapshots = [];
}
