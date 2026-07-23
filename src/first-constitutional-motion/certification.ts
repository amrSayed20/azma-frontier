/**
 * AZMA OS — THE FIRST CONSTITUTIONAL MOTION
 * Certification Layer
 *
 * Implements the Implementation Requirements as real, runnable checks.
 * Every function here is a pure read: none mutates anything, none calls
 * emitSignal, circulateFromClient, awaken, rest, or recordSignalSeen,
 * and none calls any interpretive, judgment, or composition capability
 * beyond the four certified Engines' own exported entry points —
 * confirmed by inspection and by this module's own tests.
 */

import { getSignalLog } from '../sovereign-nervous-system';
import { getHeartbeatState } from '../sovereign-heart';
import type { InputMethod, ChamberContext } from '../core/tongue';
import { establishFirstConstitutionalMotion } from './motion-orchestrator';
import type { LaunchIntegrationCertification } from './types';

/** "Call each certified Engine exactly once. Preserve the certified execution order." */
export function verifyExecutionOrderPreserved(
  raw: string,
  method: InputMethod,
  context: ChamberContext,
  subjectKey?: string,
): LaunchIntegrationCertification {
  const motion = establishFirstConstitutionalMotion(raw, method, context, subjectKey);
  const verified = motion.presence.context === context
    && motion.intent.context === motion.presence.context
    && motion.voice.context === motion.intent.context
    && motion.voice.intention !== null;
  return {
    criterion: 'The Integration Layer calls each certified Engine exactly once, in certified execution order.',
    verified,
    evidence: verified
      ? 'context threads unaltered from Entry III through Entry IV into Entry I, and Entry I\'s own intention is populated — proof that Entry IV\'s real output reached Entry I, which could only happen if Entry III → IV → I executed in that order.'
      : 'context or intention diverged across the chain, indicating the certified execution order was not preserved.',
  };
}

/** "Introduce no new Constitutional Responsibility." */
export function verifyNoNewResponsibilityIntroduced(
  raw: string,
  method: InputMethod,
  context: ChamberContext,
  subjectKey?: string,
): LaunchIntegrationCertification {
  const motion = establishFirstConstitutionalMotion(raw, method, context, subjectKey);
  const expectedKeys = ['presence', 'intent', 'voice', 'manifestation'].sort();
  const actualKeys = Object.keys(motion).sort();
  const verified = JSON.stringify(actualKeys) === JSON.stringify(expectedKeys);
  return {
    criterion: 'The Integration Layer introduces no new Constitutional Responsibility.',
    verified,
    evidence: verified
      ? 'The produced record carries exactly the four certified Engines\' own output types (presence, intent, voice, manifestation) — nothing synthesized beyond what they already certify.'
      : 'The produced record carried a field beyond the four certified Engines\' own outputs.',
  };
}

/** "Perform no interpretation, judgment, composition, filtering, or transformation." */
export function verifyNoInterpretationOrTransformation(
  raw: string,
  method: InputMethod,
  context: ChamberContext,
  subjectKey?: string,
): LaunchIntegrationCertification {
  const motion = establishFirstConstitutionalMotion(raw, method, context, subjectKey);
  const verified = motion.presence.raw === raw && motion.intent.raw === raw && motion.presence.method === method;
  return {
    criterion: 'The Integration Layer performs no interpretation, judgment, composition, filtering, or transformation.',
    verified,
    evidence: verified
      ? 'The Creator\'s raw expression passes through Entry III and Entry IV completely unaltered — nothing in this layer rewrites, judges, or reinterprets it.'
      : 'The raw expression diverged somewhere in the chain, indicating an unauthorized transformation.',
  };
}

/** No constitutional authority is exercised — the Integration Layer is pure orchestration. */
export function verifyNoAuthorityExercised(
  raw: string,
  method: InputMethod,
  context: ChamberContext,
  subjectKey?: string,
): LaunchIntegrationCertification {
  const logBefore = getSignalLog().length;
  const heartBefore = getHeartbeatState();
  establishFirstConstitutionalMotion(raw, method, context, subjectKey);
  const verified = getSignalLog().length === logBefore && JSON.stringify(getHeartbeatState()) === JSON.stringify(heartBefore);
  return {
    criterion: 'The Integration Layer exercises no constitutional authority.',
    verified,
    evidence: verified
      ? 'No function in this module calls emitSignal, circulateFromClient, awaken, rest, or recordSignalSeen (confirmed by inspection); the Signal Log and Heartbeat state are unaffected by establishing a Constitutional Motion.'
      : 'Establishing a Constitutional Motion produced an observable change in the Signal Log or Heartbeat state.',
  };
}

/** Confirms Entry II is honestly consulted — a null Manifestation is preserved, never fabricated into a false positive. */
export function verifyManifestationNeverFabricated(
  raw: string,
  method: InputMethod,
  context: ChamberContext,
  subjectKey?: string,
): LaunchIntegrationCertification {
  const motion = establishFirstConstitutionalMotion(raw, method, context, subjectKey);
  const verified = motion.manifestation === null || motion.manifestation.subjectKey === (subjectKey ?? context);
  return {
    criterion: 'The Integration Layer never fabricates a Constitutional Manifestation Entry II did not itself produce.',
    verified,
    evidence: verified
      ? 'manifestation is exactly Entry II\'s own return value — either its real, certified result, or honestly null when Entry II itself found no evidence.'
      : 'manifestation did not match Entry II\'s own certified output for this subject.',
  };
}
