/**
 * AZMA OS — SOVEREIGN INTERACTION KERNEL
 * Constitutional Entry Point
 *
 * prepareInteractionSession() is the only public function in this module.
 * It translates a KernelRequest into an InteractionSession using the
 * SovereignChamberManifests exclusively — no hardcoded chamber knowledge,
 * no AI reasoning, no runtime execution, no chamber invocation.
 */

import { resolveCapability } from './capability-resolver';
import type {
  KernelRequest,
  KernelIntent,
  InteractionSession,
  ResolvedCapability,
} from './types';
import type { ManifestInteractionMode, ManifestOperatingMode } from '../sovereign-chamber-manifest';
import type { ChamberContext } from '../core/tongue';
import { composeImperialVoice } from '../imperial-voice';
import { establishFirstConstitutionalMotion } from '../first-constitutional-motion';
import type { ImperialVoice } from '../imperial-voice';
import type { FirstConstitutionalMotion } from '../first-constitutional-motion';
import { computeBodyWisdomState } from '../sovereign-wisdom/body-wisdom';
import { getArrivalRecord } from '../visitor-presence';
import { getChamberIdentityProfileV2 } from '../chamber-identity';
import type { ChamberIdentityProfileV2 } from '../chamber-identity';
import { getVisionDocument } from '../chamber-vision';
import type { ImperialVisionDocument } from '../chamber-vision';
import type { ChamberId } from '../chamber-identity';

function generateSessionId(): string {
  // crypto.randomUUID() requires a secure context (HTTPS).
  // getRandomValues() works on plain HTTP too — use it as a fallback.
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  bytes[6] = (bytes[6] & 0x0f) | 0x40;
  bytes[8] = (bytes[8] & 0x3f) | 0x80;
  const hex = Array.from(bytes, (b) => b.toString(16).padStart(2, '0'));
  return `${hex.slice(0, 4).join('')}-${hex.slice(4, 6).join('')}-${hex.slice(6, 8).join('')}-${hex.slice(8, 10).join('')}-${hex.slice(10).join('')}`;
}

function determineInteractionMode(
  intent: KernelIntent,
  resolved: ResolvedCapability,
): ManifestInteractionMode {
  if (intent.kind === 'voice') return 'listen';
  if (intent.kind === 'text') return intent.preferredMode;
  // navigate — derive from the capability's first declared interaction mode
  return resolved.capability.interactionModes[0];
}

function determineOperatingMode(resolved: ResolvedCapability): ManifestOperatingMode {
  return resolved.capability.operatingModes[0];
}

function buildImperialVoiceForSession(
  request: KernelRequest,
  chamberId: string,
): { imperialVoice: ImperialVoice; constitutionalMotion: FirstConstitutionalMotion | null } {
  const context = chamberId as ChamberContext;
  if (request.intent.kind === 'text') {
    const motion = establishFirstConstitutionalMotion(request.intent.rawText, 'text', context);
    return { imperialVoice: motion.voice, constitutionalMotion: motion };
  }
  if (request.intent.kind === 'voice') {
    const motion = establishFirstConstitutionalMotion(request.intent.transcript, 'voice', context);
    return { imperialVoice: motion.voice, constitutionalMotion: motion };
  }
  return { imperialVoice: composeImperialVoice(context), constitutionalMotion: null };
}

export function prepareInteractionSession(request: KernelRequest): InteractionSession {
  const result = resolveCapability(request.intent);
  const preparedAt = new Date().toISOString();

  const { totalMaturityScore, matureOrganCount, organCount } = computeBodyWisdomState();
  const wisdomContext = { totalMaturityScore, matureOrganCount, organCount };

  const arrivalRecord = getArrivalRecord();
  const visitContext = {
    arrivalCount: arrivalRecord?.arrivalCount ?? 0,
    isReturning: arrivalRecord?.isReturning ?? false,
  };

  if (result.status === 'RESOLVED') {
    const { match } = result;
    const { imperialVoice, constitutionalMotion } = buildImperialVoiceForSession(
      request,
      match.chamberId,
    );
    const chamberIdAsChamberId = match.chamberId as ChamberId;
    const chamberIdentity: ChamberIdentityProfileV2 = getChamberIdentityProfileV2(chamberIdAsChamberId);
    const chamberVision: ImperialVisionDocument = getVisionDocument(chamberIdAsChamberId);
    return {
      sessionId: generateSessionId(),
      status: 'RESOLVED',
      resolvedCapability: match,
      candidates: [],
      activeInteractionMode: determineInteractionMode(request.intent, match),
      activeOperatingMode: determineOperatingMode(match),
      requiredInputs: match.capability.requiredInputs,
      optionalInputs: match.capability.optionalInputs,
      preconditions: match.capability.preconditions,
      preparedAt,
      imperialVoice,
      constitutionalMotion,
      wisdomContext,
      visitContext,
      chamberIdentity,
      chamberVision,
    };
  }

  if (result.status === 'NEEDS_CLARIFICATION') {
    return {
      sessionId: generateSessionId(),
      status: 'NEEDS_CLARIFICATION',
      resolvedCapability: null,
      candidates: result.candidates,
      activeInteractionMode: null,
      activeOperatingMode: null,
      requiredInputs: [],
      optionalInputs: [],
      preconditions: [],
      preparedAt,
      imperialVoice: null,
      constitutionalMotion: null,
      wisdomContext,
      visitContext,
      chamberIdentity: null,
      chamberVision: null,
    };
  }

  return {
    sessionId: generateSessionId(),
    status: 'NO_MATCHING_CAPABILITY',
    resolvedCapability: null,
    candidates: [],
    activeInteractionMode: null,
    activeOperatingMode: null,
    requiredInputs: [],
    optionalInputs: [],
    preconditions: [],
    preparedAt,
    imperialVoice: null,
    constitutionalMotion: null,
    wisdomContext,
    visitContext,
    chamberIdentity: null,
    chamberVision: null,
  };
}
