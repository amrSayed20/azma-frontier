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
  return crypto.randomUUID();
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
