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

export function prepareInteractionSession(request: KernelRequest): InteractionSession {
  const result = resolveCapability(request.intent);
  const preparedAt = new Date().toISOString();

  if (result.status === 'RESOLVED') {
    const { match } = result;
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
  };
}
