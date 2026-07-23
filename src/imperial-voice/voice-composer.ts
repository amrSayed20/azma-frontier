/**
 * AZMA OS — THE IMPERIAL VOICE
 * The Voice Composer
 * Registry Entry I — The Imperial Tongue Engine
 *
 * Composes THE IMPERIAL VOICE: the Empire's living voice for one Chamber
 * context, faithfully assembled from five already-certified capabilities
 * — Voice, Constitutional Identity, Citizen Memory, Citizen Intention,
 * Creator Service. Never invents, judges, filters, or ranks; every field
 * traces to a real read.
 *
 * Unlike constitutional-aggregation's composer (renamed from
 * constitutional-manifestation, which returns null when no registered
 * source has evidence for a subject), this composer
 * always returns a complete ImperialVoice: Voice, Citizen Memory, and
 * Creator Service are global capabilities with constitutional neutral
 * defaults (src/core/tongue/memory.ts's own DEFAULT_CITIZEN_PROFILE),
 * never absent. Only Citizen Intention is conditional, because it alone
 * requires the Citizen's own real, unmodified expression.
 */

import { getToneProfile, readCitizenProfile, inferCreatorProfile, determineIntention } from '../core/tongue';
import type { ChamberContext, TongueIntent } from '../core/tongue';
import { isIdentityCurrentlyPreserved } from './identity-preservation';
import type { ImperialVoice } from './types';

let voiceSequence = 0;

/**
 * `intent`, when supplied, must be the Citizen's own real, unmodified
 * expression — never fabricated. Omit it when composing outside a live
 * Citizen interaction; `intention` is then honestly null rather than
 * invented.
 */
export function composeImperialVoice(context: ChamberContext, intent?: TongueIntent): ImperialVoice {
  const citizenProfile = readCitizenProfile();
  voiceSequence += 1;
  return {
    voiceId: `imperial-voice-${context}-${voiceSequence}`,
    context,
    tone: getToneProfile(context),
    citizenProfile,
    creatorProfile: inferCreatorProfile(citizenProfile),
    intention: intent ? determineIntention(intent, citizenProfile) : null,
    identityPreserved: isIdentityCurrentlyPreserved(),
    generatedAt: new Date().toISOString(),
  };
}
