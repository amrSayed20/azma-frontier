import { MAGIC_HOUR_VIDEO_PROVIDER_ID } from '../core/sovereign-ai-integration/adapters/magic-hour-adapter';
import type { SovereignMediaModelDescriptor } from './types';

/**
 * Chief Architect-approved video model candidates.
 * Authorization date: 2026-08-27.
 *
 * ALL entries carry verificationStatus: 'approved-candidate' and
 * productionAuthorized: false. No model in this fleet dispatches a real
 * provider call or consumes provider credits.
 *
 * Provider assignment notes:
 *   LTX 2.3, Kling 3.0, Seedance 2.0:
 *     Tentatively assigned to Magic Hour (MH is known to host these models).
 *     REQUIRES_VERIFICATION: whether the MH /v1/text-to-video endpoint accepts
 *     a model parameter and what model strings to pass.
 *
 *   Veo 3.1:
 *     Google's video model. No provider adapter exists in AZMA OS.
 *     active: false — not selectable until a Google video adapter is built
 *     and registered.
 *
 *   Sora 2:
 *     OpenAI's video model. No provider adapter exists in AZMA OS.
 *     active: false — not selectable until an OpenAI video adapter is built
 *     and registered.
 */
export const VIDEO_MODEL_FLEET: readonly SovereignMediaModelDescriptor[] = [
  {
    modelId: 'ltx-2-3',
    providerId: MAGIC_HOUR_VIDEO_PROVIDER_ID,
    gatewayId: 'magic-hour',
    providerModelId: 'ltx-2.3',                // REQUIRES_VERIFICATION
    displayName: 'LTX 2.3',
    mediaType: 'video',
    capabilities: ['video-generation'],
    qualityTier: 'standard',                    // REQUIRES_VERIFICATION
    maxVideoResolution: '720p',                 // REQUIRES_VERIFICATION
    supportedAspectRatios: ['16:9', '9:16', '1:1'],  // REQUIRES_VERIFICATION
    minDurationSeconds: 1,                      // REQUIRES_VERIFICATION
    maxDurationSeconds: 8,                      // REQUIRES_VERIFICATION
    supportsTextToVideo: true,                  // REQUIRES_VERIFICATION
    supportsImageToVideo: undefined,            // REQUIRES_VERIFICATION — not confirmed
    supportsAudio: undefined,                   // REQUIRES_VERIFICATION
    supportsCharacterConsistency: undefined,    // REQUIRES_VERIFICATION
    characteristicHints: [],
    supportedStyleIds: [],
    costCatalogKey: {
      gatewayId: 'magic-hour',
      capabilityTarget: 'video-generation',
      modelId: 'ltx-2-3',
    },
    verificationStatus: 'approved-candidate',
    productionAuthorized: false,
    active: true,
    internalNotes:
      'Approved candidate 2026-08-27. Likely Magic Hour-hosted. All capabilities, ' +
      'providerModelId, duration range, and resolution require verification.',
  },
  {
    modelId: 'kling-3-0',
    providerId: MAGIC_HOUR_VIDEO_PROVIDER_ID,
    gatewayId: 'magic-hour',
    providerModelId: 'kling-3.0',              // REQUIRES_VERIFICATION
    displayName: 'Kling 3.0',
    mediaType: 'video',
    capabilities: ['video-generation'],
    qualityTier: 'high',                        // REQUIRES_VERIFICATION
    maxVideoResolution: '1080p',                // REQUIRES_VERIFICATION
    supportedAspectRatios: ['16:9', '9:16', '1:1'],  // REQUIRES_VERIFICATION
    minDurationSeconds: 1,                      // REQUIRES_VERIFICATION
    maxDurationSeconds: 10,                     // REQUIRES_VERIFICATION
    supportsTextToVideo: true,                  // REQUIRES_VERIFICATION
    supportsImageToVideo: undefined,            // REQUIRES_VERIFICATION
    supportsAudio: undefined,                   // REQUIRES_VERIFICATION
    supportsCharacterConsistency: undefined,    // REQUIRES_VERIFICATION
    characteristicHints: [],
    supportedStyleIds: [],
    costCatalogKey: {
      gatewayId: 'magic-hour',
      capabilityTarget: 'video-generation',
      modelId: 'kling-3-0',
    },
    verificationStatus: 'approved-candidate',
    productionAuthorized: false,
    active: true,
    internalNotes:
      'Approved candidate 2026-08-27. Likely Magic Hour-hosted. All capabilities require verification.',
  },
  {
    modelId: 'seedance-2-0',
    providerId: MAGIC_HOUR_VIDEO_PROVIDER_ID,
    gatewayId: 'magic-hour',
    providerModelId: 'seedance-2.0',           // REQUIRES_VERIFICATION
    displayName: 'Seedance 2.0',
    mediaType: 'video',
    capabilities: ['video-generation'],
    qualityTier: 'high',                        // REQUIRES_VERIFICATION
    maxVideoResolution: '1080p',                // REQUIRES_VERIFICATION
    supportedAspectRatios: ['16:9', '9:16', '1:1'],  // REQUIRES_VERIFICATION
    minDurationSeconds: 1,                      // REQUIRES_VERIFICATION
    maxDurationSeconds: 8,                      // REQUIRES_VERIFICATION
    supportsTextToVideo: true,                  // REQUIRES_VERIFICATION
    supportsImageToVideo: undefined,            // REQUIRES_VERIFICATION
    supportsAudio: undefined,                   // REQUIRES_VERIFICATION
    supportsCharacterConsistency: undefined,    // REQUIRES_VERIFICATION
    characteristicHints: [],
    supportedStyleIds: [],
    costCatalogKey: {
      gatewayId: 'magic-hour',
      capabilityTarget: 'video-generation',
      modelId: 'seedance-2-0',
    },
    verificationStatus: 'approved-candidate',
    productionAuthorized: false,
    active: true,
    internalNotes:
      'Approved candidate 2026-08-27. Likely Magic Hour-hosted. All capabilities require verification.',
  },
  {
    // Veo 3.1 is Google's video model. No AZMA provider adapter exists.
    // active: false prevents this model from being selected.
    // A Google video adapter must be registered before this model can be authorized.
    modelId: 'veo-3-1',
    providerId: 'google-veo',                  // No adapter exists — future
    gatewayId: 'google-veo',
    providerModelId: 'veo-3.1',               // REQUIRES_VERIFICATION
    displayName: 'Veo 3.1',
    mediaType: 'video',
    capabilities: ['video-generation'],
    qualityTier: 'ultra',                       // REQUIRES_VERIFICATION
    maxVideoResolution: '1080p',                // REQUIRES_VERIFICATION
    supportedAspectRatios: ['16:9', '9:16'],   // REQUIRES_VERIFICATION
    minDurationSeconds: 1,                      // REQUIRES_VERIFICATION
    maxDurationSeconds: 60,                     // REQUIRES_VERIFICATION
    supportsTextToVideo: true,                  // REQUIRES_VERIFICATION
    supportsImageToVideo: undefined,            // REQUIRES_VERIFICATION
    supportsAudio: undefined,                   // REQUIRES_VERIFICATION
    supportsCharacterConsistency: undefined,    // REQUIRES_VERIFICATION
    characteristicHints: [],
    supportedStyleIds: [],
    costCatalogKey: {
      gatewayId: 'google-veo',
      capabilityTarget: 'video-generation',
      modelId: 'veo-3-1',
    },
    verificationStatus: 'approved-candidate',
    productionAuthorized: false,
    active: false,  // No provider adapter — cannot dispatch
    internalNotes:
      'Approved candidate 2026-08-27. Google model. No AZMA adapter exists. ' +
      'Requires: (1) Google video provider adapter, (2) capability verification, ' +
      '(3) Chief Architect production authorization.',
  },
  {
    // Sora 2 is OpenAI's video model. No AZMA provider adapter exists for video.
    // active: false prevents this model from being selected.
    modelId: 'sora-2',
    providerId: 'openai-video',               // No adapter exists — future
    gatewayId: 'openai-video',
    providerModelId: 'sora-2',               // REQUIRES_VERIFICATION
    displayName: 'Sora 2',
    mediaType: 'video',
    capabilities: ['video-generation'],
    qualityTier: 'ultra',                      // REQUIRES_VERIFICATION
    maxVideoResolution: '1080p',               // REQUIRES_VERIFICATION
    supportedAspectRatios: ['16:9', '9:16', '1:1'],  // REQUIRES_VERIFICATION
    minDurationSeconds: 1,                     // REQUIRES_VERIFICATION
    maxDurationSeconds: 60,                    // REQUIRES_VERIFICATION
    supportsTextToVideo: true,                 // REQUIRES_VERIFICATION
    supportsImageToVideo: undefined,           // REQUIRES_VERIFICATION
    supportsAudio: undefined,                  // REQUIRES_VERIFICATION
    supportsCharacterConsistency: undefined,   // REQUIRES_VERIFICATION
    characteristicHints: [],
    supportedStyleIds: [],
    costCatalogKey: {
      gatewayId: 'openai-video',
      capabilityTarget: 'video-generation',
      modelId: 'sora-2',
    },
    verificationStatus: 'approved-candidate',
    productionAuthorized: false,
    active: false,  // No provider adapter — cannot dispatch
    internalNotes:
      'Approved candidate 2026-08-27. OpenAI model. No AZMA video adapter exists. ' +
      'Requires: (1) OpenAI video provider adapter, (2) capability verification, ' +
      '(3) Chief Architect production authorization.',
  },
];
