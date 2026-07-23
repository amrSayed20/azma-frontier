/**
 * AZMA OS — THE CONSTITUTIONAL CONSCIOUSNESS
 * The Constitutional Harmony Observer
 * Construction Phase VII
 *
 * Recognizes harmony and imbalance as ONE structural, statistical fact,
 * not two mechanisms: whether every currently-participating organ (one
 * that has been observed at least once) shares the same presence status.
 * Deliberately non-evaluative — this file never decides that harmony is
 * "good" or imbalance is "bad," it only counts and compares, exactly as
 * this phase's Constitutional Limits require ("shall never produce
 * constitutional judgment"). "Currently-participating" excludes organs
 * that have never been observed at all — an organ that has not yet
 * joined the Body's living operation is neither harmonious nor
 * imbalanced with the rest, it is simply not yet part of the comparison
 * (the same honesty already applied to "never-observed" by the Heart).
 */

import { listAllOrganContinuity, CONSTITUTIONAL_RHYTHM } from '../sovereign-heart';
import type { OrganContinuityStatus } from '../sovereign-heart';
import type { ConstitutionalHarmonyObservation } from './types';

export function observeConstitutionalHarmony(): ConstitutionalHarmonyObservation {
  const allRecords = listAllOrganContinuity(CONSTITUTIONAL_RHYTHM);

  const statusCounts: Record<OrganContinuityStatus, number> = {
    continuous: 0,
    silent: 0,
    'never-observed': 0,
  };
  for (const record of allRecords) statusCounts[record.status] += 1;

  const participatingStatuses = allRecords
    .filter((record) => record.status !== 'never-observed')
    .map((record) => record.status);
  const distinctParticipatingStatuses = new Set(participatingStatuses);
  const harmonious = distinctParticipatingStatuses.size <= 1;

  return {
    harmonious,
    statusCounts,
    evidence: harmonious
      ? `All ${participatingStatuses.length} currently-participating organ(s) share the same presence status — no divergence detected.`
      : `Currently-participating organs diverge in presence status: continuous=${statusCounts.continuous}, silent=${statusCounts.silent}.`,
  };
}
