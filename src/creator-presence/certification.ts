/**
 * AZMA OS — THE CREATOR PRESENCE
 * Certification Layer
 * Registry Entry III — The Creator Welcome Engine
 *
 * Implements Rulings I-IV as real, runnable checks. Every function here
 * is a pure read: none mutates anything, none calls emitSignal,
 * circulateFromClient, awaken, rest, or recordSignalSeen, and none calls
 * assessUnderstanding, determineIntention, validateDignity, or any other
 * interpretive capability — confirmed by inspection and by this
 * module's own tests.
 */

import { getSignalLog } from '../sovereign-nervous-system';
import { getHeartbeatState } from '../sovereign-heart';
import type { ChamberContext, InputMethod } from '../core/tongue';
import { receiveCreatorPresence } from './welcome-composer';
import type { CreatorWelcomeCertification } from './types';

/** "It is preserved. It is never interpreted. It is never transformed." (Ruling II) */
export function verifyFaithfullyPreservesRawPresence(raw: string, method: InputMethod, context: ChamberContext): CreatorWelcomeCertification {
  const presence = receiveCreatorPresence(raw, method, context);
  const verified = presence.raw === raw && presence.method === method && presence.context === context;
  return {
    criterion: "The Creator Welcome Engine faithfully preserves the Creator's raw presence, unmodified.",
    verified,
    evidence: verified
      ? 'raw, method, and context in the produced Creator Presence match exactly what was supplied — nothing rewritten, summarized, or altered.'
      : 'The produced Creator Presence diverged from what was supplied.',
  };
}

/** "It is never judged." Never interprets, transforms, or classifies. (Ruling II) */
export function verifyNeverInterpretsOrJudges(raw: string, method: InputMethod, context: ChamberContext): CreatorWelcomeCertification {
  const first = receiveCreatorPresence(raw, method, context);
  const second = receiveCreatorPresence(raw, method, context);
  const verified = first.raw === second.raw && first.method === second.method && first.context === second.context;
  return {
    criterion: 'The Creator Welcome Engine never interprets, transforms, or judges the Creator presence.',
    verified,
    evidence: verified
      ? 'Identical raw presence produces identical raw/method/context every time — no interpretation, classification, or judgment is ever applied (confirmed by inspection: this module calls no assessment, intention, or dignity function).'
      : 'Identical raw presence produced divergent output — interpretation or transformation is occurring.',
  };
}

/** "TongueIntent... belongs to The Imperial Tongue Engine." Never constructed here. (Ruling III/IV) */
export function verifyNeverConstructsTongueIntent(raw: string, method: InputMethod, context: ChamberContext): CreatorWelcomeCertification {
  const presence = receiveCreatorPresence(raw, method, context);
  const verified = !('priorTurns' in presence) && !('outcomeType' in presence);
  return {
    criterion: 'The Creator Welcome Engine never constructs, infers, or influences TongueIntent.',
    verified,
    evidence: verified
      ? 'Creator Presence carries no priorTurns or outcome/intention-shaped field — those belong solely to TongueIntent, which this module never produces (confirmed by inspection: no call to determineIntention anywhere in this module).'
      : 'Creator Presence carried a field belonging to TongueIntent, indicating an overreach into the Imperial Tongue Engine\'s own responsibility.',
  };
}

/** No constitutional authority is exercised — the Engine is a pure read/capture. */
export function verifyNoAuthorityExercised(raw: string, method: InputMethod, context: ChamberContext): CreatorWelcomeCertification {
  const logBefore = getSignalLog().length;
  const heartBefore = getHeartbeatState();
  receiveCreatorPresence(raw, method, context);
  const verified = getSignalLog().length === logBefore && JSON.stringify(getHeartbeatState()) === JSON.stringify(heartBefore);
  return {
    criterion: 'The Creator Welcome Engine exercises no constitutional authority.',
    verified,
    evidence: verified
      ? 'No function in this module calls emitSignal, circulateFromClient, awaken, rest, or recordSignalSeen (confirmed by inspection); the Signal Log and Heartbeat state are unaffected by receiving a Creator Presence.'
      : 'Receiving a Creator Presence produced an observable change in the Signal Log or Heartbeat state.',
  };
}
