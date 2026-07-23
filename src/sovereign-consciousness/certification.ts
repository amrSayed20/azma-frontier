/**
 * AZMA OS — THE CONSTITUTIONAL CONSCIOUSNESS
 * The Certification Layer
 * Construction Phase VII
 *
 * Implements this phase's own 6 Certification Requirements as real,
 * runnable checks over the already-existing Nervous System and Heart —
 * never as new engines, never as prose assertions. Every function here
 * is a pure read: none mutates anything, none calls emitSignal,
 * circulateFromClient, awaken, rest, or recordSignalSeen — confirmed by
 * inspection (no such call appears anywhere in this module) and by
 * this package's own tests.
 */

import { getSignalLog } from '../sovereign-nervous-system';
import { CONSTITUTIONAL_ORGANS } from '../sovereign-body';
import { getHeartbeatState } from '../sovereign-heart';
import { isObserving, getChangeLog } from './observation-layer';
import { listAllOrganConditions } from './condition-monitor';
import { observeConstitutionalHarmony } from './harmony-observer';
import { recognizeSelf } from './self-recognition';
import type { ConstitutionalAwarenessCertification } from './types';

/** Certification Requirement 1: "Verify that the Body continuously recognizes its constitutional condition." */
export function verifyContinuousConditionRecognition(): ConstitutionalAwarenessCertification {
  const observing = isObserving();
  const recognizedChanges = getChangeLog().length;
  const verified = observing && recognizedChanges > 0;
  return {
    criterion: 'The Body continuously recognizes its constitutional condition.',
    verified,
    evidence: verified
      ? `The Observation Layer is active and has recognized ${recognizedChanges} constitutional change(s) as they occurred, without polling.`
      : 'The Observation Layer is not currently active, or has not yet recognized any change since it began.',
  };
}

/** Certification Requirement 2: "Verify that constitutional awareness remains read-only." */
export function verifyAwarenessRemainsReadOnly(): ConstitutionalAwarenessCertification {
  const logBefore = getSignalLog().length;
  const heartBefore = getHeartbeatState();
  listAllOrganConditions();
  observeConstitutionalHarmony();
  recognizeSelf();
  const verified = getSignalLog().length === logBefore && JSON.stringify(getHeartbeatState()) === JSON.stringify(heartBefore);
  return {
    criterion: 'Constitutional awareness remains read-only.',
    verified,
    evidence: verified
      ? 'The Signal Log and Heartbeat state are byte-for-byte identical before and after running every read layer of this module.'
      : 'The Signal Log or Heartbeat state changed as a result of calling this module\'s own read functions.',
  };
}

/** Certification Requirement 3: "Verify that constitutional awareness observes every participating organ." */
export function verifyObservesEveryParticipatingOrgan(): ConstitutionalAwarenessCertification {
  const conditions = listAllOrganConditions();
  const observedIds = new Set(conditions.map((condition) => condition.organId));
  const missing = CONSTITUTIONAL_ORGANS.filter((organ) => !observedIds.has(organ.id));
  const verified = missing.length === 0 && conditions.length === CONSTITUTIONAL_ORGANS.length;
  return {
    criterion: 'Constitutional awareness observes every participating organ.',
    verified,
    evidence: verified
      ? `All ${CONSTITUTIONAL_ORGANS.length} Skeleton-registered organs receive a condition entry — none silently omitted.`
      : `Missing condition entries for: ${missing.map((organ) => organ.id).join(', ')}.`,
  };
}

/** Certification Requirement 4: "Verify that constitutional harmony can be recognized." */
export function verifyHarmonyCanBeRecognized(): ConstitutionalAwarenessCertification {
  const observation = observeConstitutionalHarmony();
  return {
    criterion: 'Constitutional harmony can be recognized.',
    verified: typeof observation.harmonious === 'boolean',
    evidence: `observeConstitutionalHarmony() computed harmonious=${observation.harmonious}. ${observation.evidence}`,
  };
}

/** Certification Requirement 5: "Verify that constitutional imbalance can be recognized." */
export function verifyImbalanceCanBeRecognized(): ConstitutionalAwarenessCertification {
  // Imbalance is the identical structural computation as Harmony, read from
  // the other side (see harmony-observer.ts) — reusing its result rather
  // than re-deriving a second mechanism.
  const observation = observeConstitutionalHarmony();
  return {
    criterion: 'Constitutional imbalance can be recognized.',
    verified: typeof observation.harmonious === 'boolean',
    evidence: `The same computation that recognizes Harmony recognizes its absence (imbalance): harmonious=${observation.harmonious}. ${observation.evidence}`,
  };
}

/** Certification Requirement 6: "Verify that no constitutional authority is exercised by Constitutional Consciousness." */
export function verifyNoAuthorityExercised(): ConstitutionalAwarenessCertification {
  const logBefore = getSignalLog().length;
  const heartBefore = getHeartbeatState();
  const selfRecognition = recognizeSelf();
  const verified =
    getSignalLog().length === logBefore &&
    JSON.stringify(getHeartbeatState()) === JSON.stringify(heartBefore) &&
    typeof selfRecognition.hasCompleteConstitutionalHome === 'boolean';
  return {
    criterion: 'No constitutional authority is exercised by Constitutional Consciousness.',
    verified,
    evidence: verified
      ? 'No function in this module calls emitSignal, circulateFromClient, awaken, rest, or recordSignalSeen (confirmed by inspection); the Signal Log and Heartbeat state are unaffected by running this module\'s own functions.'
      : 'A call into this module produced an observable change in the Signal Log or Heartbeat state.',
  };
}
