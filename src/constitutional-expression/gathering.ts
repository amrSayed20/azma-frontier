/**
 * AZMA OS — THE CONSTITUTIONAL EXPRESSION
 * Receiving Constitutional Outputs
 * Construction Campaign
 *
 * "Receive constitutional outputs" — one function per source organ,
 * each a pure read of that organ's own already-certified query. None is
 * modified; none is called with any argument that could mutate state.
 * Returns null when an organ has no real evidence yet for the given
 * subject organ — never a fabricated input.
 */

import { getOrganContinuity, CONSTITUTIONAL_RHYTHM } from '../sovereign-heart';
import { getLatestAdvisoryForOrgan } from '../sovereign-core';
import { getConditionForOrgan } from '../sovereign-consciousness';
import { getKnowledgeHistoryForOrgan } from '../sovereign-memory';
import { getMaturitySnapshotsForOrgan } from '../sovereign-evolution';
import type { ConstitutionalExpressionInput } from './types';

export function gatherFromAlWateen(organId: string): ConstitutionalExpressionInput | null {
  const continuity = getOrganContinuity(organId, CONSTITUTIONAL_RHYTHM);
  if (continuity.status === 'never-observed') return null;
  return {
    organId,
    sourceOrgan: 'al-wateen',
    summary: `Presence: ${continuity.status}${continuity.lastSeenAt ? ` (last seen ${continuity.lastSeenAt})` : ''}.`,
    evidence: 'src/sovereign-heart/continuity-tracker.ts (getOrganContinuity)',
    hasRealEvidence: true,
  };
}

export function gatherFromSovereignCore(organId: string): ConstitutionalExpressionInput | null {
  const advisory = getLatestAdvisoryForOrgan(organId);
  if (!advisory) return null;
  return {
    organId,
    sourceOrgan: 'sovereign-core',
    summary: advisory.summary,
    evidence: 'src/sovereign-core/perception-intake.ts (getLatestAdvisoryForOrgan)',
    hasRealEvidence: true,
  };
}

export function gatherFromConsciousness(organId: string): ConstitutionalExpressionInput | null {
  const condition = getConditionForOrgan(organId);
  const knownSignalTypes = Object.keys(condition.knownState);
  const hasRealEvidence = condition.presenceStatus !== 'never-observed' || knownSignalTypes.length > 0;
  if (!hasRealEvidence) return null;
  return {
    organId,
    sourceOrgan: 'constitutional-consciousness',
    summary: `Condition: presence=${condition.presenceStatus}, known signal types=${knownSignalTypes.join(', ') || 'none'}.`,
    evidence: 'src/sovereign-consciousness/condition-monitor.ts (getConditionForOrgan)',
    hasRealEvidence: true,
  };
}

export function gatherFromMemory(organId: string): ConstitutionalExpressionInput | null {
  const history = getKnowledgeHistoryForOrgan(organId);
  if (history.length === 0) return null;
  const mostRecent = history[history.length - 1];
  return {
    organId,
    sourceOrgan: 'constitutional-memory',
    summary: `${history.length} archived Advisory record(s); most recent: ${mostRecent.advisory.summary}`,
    evidence: 'src/sovereign-memory/knowledge-repository.ts (getKnowledgeHistoryForOrgan)',
    hasRealEvidence: true,
  };
}

export function gatherFromEvolution(organId: string): ConstitutionalExpressionInput | null {
  const snapshots = getMaturitySnapshotsForOrgan(organId);
  if (snapshots.length === 0) return null;
  const mostRecent = snapshots[snapshots.length - 1];
  return {
    organId,
    sourceOrgan: 'constitutional-evolution',
    summary: `Maturity: ${mostRecent.maturityScore} (${snapshots.length} recorded snapshot(s)).`,
    evidence: 'src/sovereign-evolution/improvement-registry.ts (getMaturitySnapshotsForOrgan)',
    hasRealEvidence: true,
  };
}

/** Gathers every available real input for one organ, across all 5 sources — organs with no evidence yet are silently absent, never fabricated. */
export function gatherAllForOrgan(organId: string): readonly ConstitutionalExpressionInput[] {
  return [
    gatherFromAlWateen(organId),
    gatherFromSovereignCore(organId),
    gatherFromConsciousness(organId),
    gatherFromMemory(organId),
    gatherFromEvolution(organId),
  ].filter((input): input is ConstitutionalExpressionInput => input !== null);
}
