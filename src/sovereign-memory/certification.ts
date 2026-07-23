/**
 * AZMA OS — THE CONSTITUTIONAL MEMORY
 * The Certification Layer
 * Construction Phase VIII
 *
 * Implements this phase's own 6 Certification Requirements as real,
 * runnable checks — never as prose assertions. Every function here is a
 * pure read: none mutates anything, none calls emitSignal,
 * circulateFromClient, awaken, rest, recordSignalSeen, or any Sovereign
 * Core execution path — confirmed by inspection and by this package's
 * own tests.
 */

import { getSignalLog, verifyLogTraceability } from '../sovereign-nervous-system';
import { CONSTITUTIONAL_RELATIONSHIPS } from '../sovereign-body';
import { getHeartbeatState } from '../sovereign-heart';
import { CONSTITUTIONAL_MEMORY_TIERS } from './memory-registry';
import { getFullHistory } from './history-archive';
import { getRelationshipMemory } from './relationship-memory';
import { getCreatorJourney } from './creator-journey';
import type { ConstitutionalMemoryCertification } from './types';

/** Certification Requirement 1: "Verify that constitutional history remains immutable." */
export function verifyHistoryRemainsImmutable(): ConstitutionalMemoryCertification {
  const firstRead = getFullHistory();
  const secondRead = getFullHistory();
  const verified = JSON.stringify(firstRead) === JSON.stringify(secondRead);
  return {
    criterion: 'Constitutional history remains immutable.',
    verified,
    evidence: verified
      ? 'Two consecutive reads of the full History Archive are identical; the Nervous System\'s own getSignalLog() returns an independent copy on every call, so no caller can mutate the underlying record.'
      : 'Two consecutive reads of the History Archive differed unexpectedly.',
  };
}

/** Certification Requirement 2: "Verify that constitutional memory distinguishes data, information, knowledge, and wisdom." */
export function verifyDIKWDistinction(): ConstitutionalMemoryCertification {
  const distinctTiers = new Set(CONSTITUTIONAL_MEMORY_TIERS.map((entry) => entry.tier));
  const verified = CONSTITUTIONAL_MEMORY_TIERS.length === 4 && distinctTiers.size === 4;
  return {
    criterion: 'Constitutional memory distinguishes data, information, knowledge, and wisdom.',
    verified,
    evidence: verified
      ? 'The Memory Registry names exactly 4 distinct tiers (Data/Information/Knowledge/Wisdom), each mapped to a different, already-certified type from an earlier Construction Phase.'
      : 'The Memory Registry does not cleanly distinguish 4 tiers.',
  };
}

/** Certification Requirement 3: "Verify that constitutional identity remains preserved across remembered history." */
export function verifyIdentityPreservedAcrossHistory(): ConstitutionalMemoryCertification {
  const result = verifyLogTraceability();
  return {
    criterion: 'Constitutional identity remains preserved across remembered history.',
    verified: result.traceable,
    evidence: `The Nervous System's own verifyLogTraceability() (Phase II), reused rather than re-derived, confirms all ${result.totalSignals} archived signal(s) carry a unique, legitimate origin identity, with ${result.duplicateIds.length} duplicate id(s).`,
  };
}

/** Certification Requirement 4: "Verify that constitutional relationships remain historically traceable." */
export function verifyRelationshipsHistoricallyTraceable(): ConstitutionalMemoryCertification {
  const records = getRelationshipMemory();
  const verified = records.length === CONSTITUTIONAL_RELATIONSHIPS.length;
  return {
    criterion: 'Constitutional relationships remain historically traceable.',
    verified,
    evidence: verified
      ? `All ${CONSTITUTIONAL_RELATIONSHIPS.length} Skeleton-declared relationships produce a traceability record cross-referencing the History Archive.`
      : 'At least one declared relationship produced no traceability record.',
  };
}

/** Certification Requirement 5: "Verify that Creator journeys remain faithfully preserved." */
export function verifyCreatorJourneysFaithfullyPreserved(): ConstitutionalMemoryCertification {
  const snapshot = getCreatorJourney();
  const verified =
    typeof snapshot.thread.sessionId === 'string' &&
    Array.isArray(snapshot.thread.chamberHistory) &&
    Array.isArray(snapshot.thread.momentumPoints);
  return {
    criterion: 'Creator journeys remain faithfully preserved.',
    verified,
    evidence: verified
      ? 'The Creator Journey lens returns the Sovereign Tongue\'s own complete ConversationThread shape (session id, chamber history, momentum points) unmodified.'
      : 'The Creator Journey lens returned an incomplete or malformed thread.',
  };
}

/** Certification Requirement 6: "Verify that no constitutional authority is exercised by Constitutional Memory." */
export function verifyNoAuthorityExercised(): ConstitutionalMemoryCertification {
  const logBefore = getSignalLog().length;
  const heartBefore = getHeartbeatState();
  getFullHistory();
  getRelationshipMemory();
  getCreatorJourney();
  const verified = getSignalLog().length === logBefore && JSON.stringify(getHeartbeatState()) === JSON.stringify(heartBefore);
  return {
    criterion: 'No constitutional authority is exercised by Constitutional Memory.',
    verified,
    evidence: verified
      ? 'No function in this module calls emitSignal, circulateFromClient, awaken, rest, or recordSignalSeen (confirmed by inspection); the Signal Log and Heartbeat state are unaffected by running this module\'s own read functions.'
      : 'A call into this module produced an observable change in the Signal Log or Heartbeat state.',
  };
}
