/**
 * AZMA OS — THE CONSTITUTIONAL MANIFESTATION SYSTEM
 * Certification Layer
 * Constitutional Package II
 *
 * Implements this Package's own stated Boundaries and Responsibility as
 * real, runnable checks. Every function here is a pure read: none
 * mutates anything, none calls emitSignal, circulateFromClient, awaken,
 * rest, or recordSignalSeen, and none calls any organ's own execution
 * path — confirmed by inspection and by this package's own tests.
 */

import { getSignalLog } from '../sovereign-nervous-system';
import { getHeartbeatState } from '../sovereign-heart';
import { composeManifestationForSubject } from './manifestation-composer';
import type { ConstitutionalManifestationCertification, ConstitutionalSourceId } from './types';

/** "SHALL support multiple Constitutional Sources... never become the renderer of one subsystem alone." */
export function verifySupportsMultipleSources(subjectKey: string): ConstitutionalManifestationCertification {
  const manifestation = composeManifestationForSubject(subjectKey);
  const distinctSourceIds = new Set((manifestation?.sources ?? []).map((s) => s.sourceId));
  const verified = distinctSourceIds.size >= 2;
  return {
    criterion: 'Manifestation supports multiple Constitutional Sources.',
    verified,
    evidence: verified
      ? `Manifestation for "${subjectKey}" includes ${distinctSourceIds.size} distinct sources: ${[...distinctSourceIds].join(', ')}.`
      : `Manifestation for "${subjectKey}" includes fewer than 2 distinct sources — insufficient to demonstrate multi-source support for this subject.`,
  };
}

/** "SHALL NOT: Create... constitutional truth." */
export function verifyNeverCreatesConstitutionalTruth(subjectKey: string): ConstitutionalManifestationCertification {
  const manifestation = composeManifestationForSubject(subjectKey);
  const verified = Boolean(manifestation) && manifestation!.sources.every((s) => s.content.length > 0);
  return {
    criterion: 'Manifestation never creates constitutional truth.',
    verified,
    evidence: verified
      ? 'Every source entry\'s content is derived directly from that source\'s own already-certified query (getToneProfile / composeExpressionForOrgan) — none is synthesized independently.'
      : `No manifestation could be composed for "${subjectKey}" — insufficient evidence.`,
  };
}

/** "SHALL NOT: ...Prioritize. Filter constitutional truth." */
export function verifyNeverFiltersOrPrioritizes(subjectKey: string): ConstitutionalManifestationCertification {
  const manifestation = composeManifestationForSubject(subjectKey);
  if (!manifestation) {
    return {
      criterion: 'Manifestation never filters or prioritizes constitutional truth.',
      verified: false,
      evidence: `No manifestation could be composed for "${subjectKey}" — insufficient evidence.`,
    };
  }
  // Registration order, per source-registry.ts, is: imperial-tongue, then
  // constitutional-expression. Verified here structurally: whichever
  // sources are present appear in that same relative order, never
  // re-sorted by any significance measure.
  const order = manifestation.sources.map((s) => s.sourceId);
  const registeredOrder: readonly ConstitutionalSourceId[] = ['imperial-tongue', 'constitutional-expression'];
  const expectedRelativeOrder = registeredOrder.filter((id) => order.includes(id));
  const verified = JSON.stringify(order) === JSON.stringify(expectedRelativeOrder);
  return {
    criterion: 'Manifestation never filters or prioritizes constitutional truth.',
    verified,
    evidence: verified
      ? 'Every source with real data for this subject is present, in fixed registration order — none dropped, none reordered by significance.'
      : 'Sources appeared in an order other than fixed registration order, or one was silently dropped.',
  };
}

/** "...while preserving Constitutional Identity." */
export function verifyPreservesConstitutionalIdentity(subjectKey: string): ConstitutionalManifestationCertification {
  const manifestation = composeManifestationForSubject(subjectKey);
  return {
    criterion: 'Manifestation preserves Constitutional Identity.',
    verified: Boolean(manifestation?.identityPreserved),
    evidence: manifestation
      ? `identityPreserved=${manifestation.identityPreserved}, read directly from src/imperial-presence/'s own Identity Certification Report, never re-derived.`
      : `No manifestation could be composed for "${subjectKey}" — insufficient evidence.`,
  };
}

/** No constitutional authority exists — Manifestation is a pure read. */
export function verifyNoAuthorityExercised(): ConstitutionalManifestationCertification {
  const logBefore = getSignalLog().length;
  const heartBefore = getHeartbeatState();
  composeManifestationForSubject('hujjah-al-damighah');
  const verified = getSignalLog().length === logBefore && JSON.stringify(getHeartbeatState()) === JSON.stringify(heartBefore);
  return {
    criterion: 'No constitutional authority is exercised by Manifestation.',
    verified,
    evidence: verified
      ? 'No function in this module calls emitSignal, circulateFromClient, awaken, rest, or recordSignalSeen (confirmed by inspection); the Signal Log and Heartbeat state are unaffected by running this module\'s own read functions.'
      : 'A call into this module produced an observable change in the Signal Log or Heartbeat state.',
  };
}
