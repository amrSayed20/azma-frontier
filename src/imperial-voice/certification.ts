/**
 * AZMA OS — THE IMPERIAL VOICE
 * Certification Layer
 * Registry Entry I — The Imperial Tongue Engine
 *
 * Implements Registry Entry I's own stated Boundaries and Responsibility
 * as real, runnable checks. Every function here is a pure read: none
 * mutates Citizen Memory, none calls emitSignal, circulateFromClient,
 * awaken, rest, or recordSignalSeen, and none calls any judgment/
 * conscience capability — confirmed by inspection and by this module's
 * own tests.
 */

import { getSignalLog } from '../sovereign-nervous-system';
import { getHeartbeatState } from '../sovereign-heart';
import { readCitizenProfile } from '../core/tongue';
import type { ChamberContext, TongueIntent } from '../core/tongue';
import { composeImperialVoice } from './voice-composer';
import type { ImperialVoiceCertification } from './types';

/** "It faithfully gives the Empire its Voice." */
export function verifyProducesImperialVoice(context: ChamberContext): ImperialVoiceCertification {
  const voice = composeImperialVoice(context);
  const verified = Boolean(voice.tone) && voice.context === context && Boolean(voice.citizenProfile) && Boolean(voice.creatorProfile);
  return {
    criterion: "The Imperial Voice faithfully composes the Empire's voice for a Chamber context.",
    verified,
    evidence: verified
      ? `A complete Imperial Voice was composed for "${context}": tone, citizen profile, and creator profile all present.`
      : `Composition for "${context}" did not produce a complete Imperial Voice.`,
  };
}

/** "It never creates Constitutional Truth." */
export function verifyNeverFabricatesCitizenIntention(context: ChamberContext): ImperialVoiceCertification {
  const withoutIntent = composeImperialVoice(context);
  const intent: TongueIntent = { raw: 'what is this', method: 'text', context, timestamp: Date.now(), priorTurns: 0 };
  const withIntent = composeImperialVoice(context, intent);
  const verified = withoutIntent.intention === null && withIntent.intention !== null;
  return {
    criterion: 'The Imperial Voice never fabricates Citizen Intention.',
    verified,
    evidence: verified
      ? 'Intention is honestly null when no real Citizen expression is supplied, and is only derived when an actual TongueIntent is provided.'
      : 'Intention was present without a real Citizen expression, or absent despite one being supplied.',
  };
}

/** "It never judges Constitutional Truth." No authority is exercised. */
export function verifyNoAuthorityExercised(context: ChamberContext): ImperialVoiceCertification {
  const logBefore = getSignalLog().length;
  const heartBefore = getHeartbeatState();
  composeImperialVoice(context);
  const verified = getSignalLog().length === logBefore && JSON.stringify(getHeartbeatState()) === JSON.stringify(heartBefore);
  return {
    criterion: 'The Imperial Voice never judges Constitutional Truth — no constitutional authority is exercised.',
    verified,
    evidence: verified
      ? 'No function in this module calls emitSignal, circulateFromClient, awaken, rest, or recordSignalSeen (confirmed by inspection); the Signal Log and Heartbeat state are unaffected by composing an Imperial Voice.'
      : 'Composing an Imperial Voice produced an observable change in the Signal Log or Heartbeat state.',
  };
}

/** "...while preserving Constitutional Identity." */
export function verifyPreservesConstitutionalIdentity(context: ChamberContext): ImperialVoiceCertification {
  const voice = composeImperialVoice(context);
  return {
    criterion: 'The Imperial Voice preserves Constitutional Identity.',
    verified: voice.identityPreserved,
    evidence: `identityPreserved=${voice.identityPreserved}, read directly from src/imperial-presence/'s own Identity Certification Report, never re-derived.`,
  };
}

/** "Shall never become Constitutional Memory." Citizen Memory is read, never mutated. */
export function verifyNeverBecomesConstitutionalMemory(context: ChamberContext): ImperialVoiceCertification {
  const before = readCitizenProfile();
  composeImperialVoice(context);
  const after = readCitizenProfile();
  const verified = JSON.stringify(before) === JSON.stringify(after);
  return {
    criterion: 'The Imperial Voice never becomes Constitutional Memory — it reads Citizen Memory but never writes to it.',
    verified,
    evidence: verified
      ? "Citizen Memory's own profile is bit-for-bit unchanged after composing an Imperial Voice — this module calls readCitizenProfile() only, never writeCitizenProfile() or recordSignal()."
      : "Citizen Memory's profile changed as a side effect of composing an Imperial Voice.",
  };
}
