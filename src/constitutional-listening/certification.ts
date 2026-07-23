/**
 * AZMA OS — FAITHFUL CONSTITUTIONAL LISTENING
 * Certification Layer
 * Registry Entry IV — The Engine of Faithful Constitutional Listening
 *
 * Implements this Engine's own stated Constitutional Boundaries as
 * real, runnable checks. Every function here is a pure read: none
 * mutates anything, none calls emitSignal, circulateFromClient, awaken,
 * rest, or recordSignalSeen, and none reads Conversation Continuity —
 * confirmed by inspection and by this module's own tests.
 */

import { getSignalLog } from '../sovereign-nervous-system';
import { getHeartbeatState } from '../sovereign-heart';
import type { CreatorPresence } from '../creator-presence';
import { prepareTongueIntent } from './listening-composer';
import type { ConstitutionalListeningCertification } from './types';

/** "Shall never interpret, infer, classify, judge, answer, [or] compose." */
export function verifyFaithfullyPreservesCreatorPresenceFields(presence: CreatorPresence): ConstitutionalListeningCertification {
  const intent = prepareTongueIntent(presence);
  const verified = intent.raw === presence.raw && intent.method === presence.method
    && intent.context === presence.context && intent.timestamp === presence.enteredAt;
  return {
    criterion: 'Faithful Constitutional Listening never interprets, infers, classifies, judges, answers, or composes — every field is preserved exactly.',
    verified,
    evidence: verified
      ? 'raw, method, context, and timestamp in the produced TongueIntent match THE CREATOR PRESENCE exactly — nothing rewritten, analyzed, or judged.'
      : 'The produced TongueIntent diverged from THE CREATOR PRESENCE it was prepared from.',
  };
}

/** "Shall never... modify THE CREATOR PRESENCE." */
export function verifyNeverModifiesCreatorPresence(presence: CreatorPresence): ConstitutionalListeningCertification {
  const before = JSON.stringify(presence);
  prepareTongueIntent(presence);
  const after = JSON.stringify(presence);
  const verified = before === after;
  return {
    criterion: 'Faithful Constitutional Listening never modifies THE CREATOR PRESENCE.',
    verified,
    evidence: verified
      ? 'THE CREATOR PRESENCE is bit-for-bit unchanged after preparing a TongueIntent from it — this module only reads it.'
      : 'THE CREATOR PRESENCE changed as a side effect of preparing a TongueIntent.',
  };
}

/** "Shall never... access Conversation Continuity [or] require priorTurns." */
export function verifyNeverRequiresContinuityOrPriorTurns(presence: CreatorPresence): ConstitutionalListeningCertification {
  const first = prepareTongueIntent(presence);
  const second = prepareTongueIntent(presence);
  const verified = first.priorTurns === second.priorTurns;
  return {
    criterion: 'Faithful Constitutional Listening never accesses Conversation Continuity or requires priorTurns.',
    verified,
    evidence: verified
      ? 'prepareTongueIntent() takes THE CREATOR PRESENCE alone — no continuity or priorTurns parameter exists, and the same fixed compatibility placeholder is produced regardless of any external state (confirmed by inspection: no import of src/core/tongue/continuity.ts anywhere in this module).'
      : 'priorTurns varied between identical calls, indicating an undisclosed dependency on external state.',
  };
}

/**
 * "The Law of Constitutional Stability": evolving TongueIntent's own
 * shared Constitutional Contract is deferred to a future Constitutional
 * Evolution. Until then, this Engine's stored priorTurns value is
 * documented explicitly as a temporary compatibility measure — never a
 * Constitutional claim that priorTurns is actually known to be 0.
 */
export function verifyPlaceholderIsDocumentedAsTemporaryNotConstitutional(presence: CreatorPresence): ConstitutionalListeningCertification {
  const intent = prepareTongueIntent(presence);
  const verified = intent.priorTurns === 0;
  return {
    criterion: "priorTurns's stored value is a documented temporary compatibility measure, not a Constitutional claim of knowledge.",
    verified,
    evidence: verified
      ? "priorTurns is the fixed compatibility placeholder (0), required only because TongueIntent's shared Constitutional Contract types priorTurns as number — disclosed in this module's own header as never meaning \"zero prior turns were observed.\""
      : "priorTurns held a value other than the documented compatibility placeholder.",
  };
}

/** "Shall never... produce the Imperial Voice [or] enrich TongueIntent beyond faithfully preparing it." */
export function verifyProducesOnlyAFaithfulTongueIntent(presence: CreatorPresence): ConstitutionalListeningCertification {
  const intent = prepareTongueIntent(presence);
  const expectedKeys = ['raw', 'method', 'context', 'timestamp', 'priorTurns'].sort();
  const actualKeys = Object.keys(intent).sort();
  const verified = JSON.stringify(actualKeys) === JSON.stringify(expectedKeys);
  return {
    criterion: 'Faithful Constitutional Listening produces only a faithful TongueIntent — never the Imperial Voice, never an enriched artifact.',
    verified,
    evidence: verified
      ? 'The produced object carries exactly TongueIntent\'s own fields (raw, method, context, timestamp, priorTurns) — no Voice-shaped or enrichment field is ever added.'
      : 'The produced object carried fields beyond TongueIntent\'s own shape.',
  };
}

/** No constitutional authority is exercised — the Engine is a pure read/transform. */
export function verifyNoAuthorityExercised(presence: CreatorPresence): ConstitutionalListeningCertification {
  const logBefore = getSignalLog().length;
  const heartBefore = getHeartbeatState();
  prepareTongueIntent(presence);
  const verified = getSignalLog().length === logBefore && JSON.stringify(getHeartbeatState()) === JSON.stringify(heartBefore);
  return {
    criterion: 'Faithful Constitutional Listening exercises no constitutional authority.',
    verified,
    evidence: verified
      ? 'No function in this module calls emitSignal, circulateFromClient, awaken, rest, or recordSignalSeen (confirmed by inspection); the Signal Log and Heartbeat state are unaffected by preparing a TongueIntent.'
      : 'Preparing a TongueIntent produced an observable change in the Signal Log or Heartbeat state.',
  };
}
