import { MAGIC_HOUR_VIDEO_PROVIDER_ID } from '../core/sovereign-ai-integration/adapters/magic-hour-adapter';
import type { SovereignMediaModelDescriptor } from './types';

/**
 * Chief Architect-approved and production-authorized video model fleet.
 * Approval date: 2026-08-27. Production authorization: 2026-08-27 (Phase III).
 *
 * ALL entries carry verificationStatus: 'production-authorized' and
 * productionAuthorized: true per explicit Chief Architect Phase III order.
 *
 * Provider assignment notes:
 *   LTX 2.3, Kling 3.0, Seedance 2.0:
 *     Assigned to Magic Hour. active: true — selectable at runtime.
 *     REQUIRES_VERIFICATION: model strings, duration ranges, resolutions.
 *
 *   Veo 3.1:
 *     Google's video model. Production-authorized but active: false.
 *     No AZMA provider adapter exists — cannot dispatch until a Google
 *     video adapter is built and registered.
 *
 *   Sora 2:
 *     OpenAI's video model. Production-authorized but active: false.
 *     No AZMA provider adapter exists — cannot dispatch until an OpenAI
 *     video adapter is built and registered.
 */
export const VIDEO_MODEL_FLEET: readonly SovereignMediaModelDescriptor[] = [
  {
    modelId: 'ltx-2-3',
    providerId: MAGIC_HOUR_VIDEO_PROVIDER_ID,
    gatewayId: 'magic-hour',
    providerModelId: 'ltx-2.3',                // REQUIRES_VERIFICATION
    displayName: 'LTX 2.3',
    sovereignNameAr: 'الحركة الخفيفة',
    sovereignNoteAr: 'مقاطعُ قصيرة سريعة الإنجاز.',
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
    verificationStatus: 'production-authorized',
    // ── THE FOUNDER'S DESIGNATION, 2026-09-25 ──────────────────────
    //   «قد اختصصت ثلاثة مزودين فقط من المزود الرئيسي» — one for images and
    //   the infographic, two for video and its editing. This model is not
    //   among them, so production never routes to it. Its entry is kept, not
    //   deleted: the Empire's record of what it verified, what it costs and
    //   what it can do is worth more than the few lines it occupies, and a
    //   designation that changes should change a flag, not resurrect a file.
    productionAuthorized: false,
    active: true,
    internalNotes:
      'Production authorized by Chief Architect 2026-08-27 (Phase III). Magic Hour-hosted. ' +
      'All capabilities, providerModelId, duration range, and resolution require real-world verification.',
  },
  {
    modelId: 'kling-3-0',
    providerId: MAGIC_HOUR_VIDEO_PROVIDER_ID,
    gatewayId: 'magic-hour',
    providerModelId: 'kling-3.0',              // REQUIRES_VERIFICATION
    displayName: 'Kling 3.0',
    sovereignNameAr: 'الحركة المتّزنة',
    sovereignNoteAr: 'حركةٌ هادئة وثباتٌ في المشهد.',
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
    verificationStatus: 'production-authorized',
    // ── THE FOUNDER'S DESIGNATION, 2026-09-25 ──────────────────────
    //   «قد اختصصت ثلاثة مزودين فقط من المزود الرئيسي» — one for images and
    //   the infographic, two for video and its editing. This model is not
    //   among them, so production never routes to it. Its entry is kept, not
    //   deleted: the Empire's record of what it verified, what it costs and
    //   what it can do is worth more than the few lines it occupies, and a
    //   designation that changes should change a flag, not resurrect a file.
    productionAuthorized: false,
    active: true,
    internalNotes:
      'Production authorized by Chief Architect 2026-08-27 (Phase III). Magic Hour-hosted. ' +
      'All capabilities require real-world verification.',
  },
  {
    modelId: 'seedance-2-0',
    providerId: MAGIC_HOUR_VIDEO_PROVIDER_ID,
    gatewayId: 'magic-hour',
    providerModelId: 'seedance-2.0',           // VERIFIED 2026-09-22: docs.magichour.ai /v1/image-to-video model enum
    displayName: 'Seedance 2.0',
    sovereignNameAr: 'الحركة الراقصة',
    sovereignNoteAr: 'حركةٌ حيّة وانتقالاتٌ سلسة — للتوليد والتعديل.',
    mediaType: 'video',
    capabilities: ['video-generation'],
    qualityTier: 'high',                        // REQUIRES_VERIFICATION
    maxVideoResolution: '1080p',                // REQUIRES_VERIFICATION
    supportedAspectRatios: ['16:9', '9:16', '1:1'],  // REQUIRES_VERIFICATION
    minDurationSeconds: 1,                      // REQUIRES_VERIFICATION
    maxDurationSeconds: 8,                      // REQUIRES_VERIFICATION
    supportsTextToVideo: true,                  // REQUIRES_VERIFICATION
    supportsImageToVideo: true,                 // VERIFIED 2026-09-22: listed in the /v1/image-to-video model enum
    supportsAudio: undefined,                   // REQUIRES_VERIFICATION
    supportsCharacterConsistency: undefined,    // REQUIRES_VERIFICATION
    characteristicHints: [],
    supportedStyleIds: [],
    costCatalogKey: {
      gatewayId: 'magic-hour',
      capabilityTarget: 'video-generation',
      modelId: 'seedance-2-0',
    },
    verificationStatus: 'production-authorized',
    productionAuthorized: true,
    active: true,
    internalNotes:
      'Production authorized by Chief Architect 2026-08-27 (Phase III). Magic Hour-hosted. ' +
      'All capabilities require real-world verification.',
  },
  {
    // Veo 3.1 — Google's model, HOSTED BY MAGIC HOUR. Until 2026-09-22 this
    // entry pointed at a 'google-veo' gateway that has no adapter and carried
    // providerModelId 'veo-3.1', which is not an identifier any provider
    // accepts: the verified Magic Hour enum is 'veo3.1' (and 'veo3.1-lite',
    // 'veo3.1-audio'). Corrected to the binding that can actually dispatch it.
    // Activated under the Veo 3.1 production-proof order (2026-09-22), not as a
    // side effect of fixing the identifier.
    modelId: 'veo-3-1',
    providerId: MAGIC_HOUR_VIDEO_PROVIDER_ID,
    gatewayId: 'magic-hour',
    providerModelId: 'veo3.1',                 // VERIFIED 2026-09-22: docs.magichour.ai /v1/image-to-video model enum
    displayName: 'Veo 3.1',
    sovereignNameAr: 'الحركة السينمائيّة',
    sovereignNoteAr: 'مشهدٌ متكامل بإيقاعٍ سينمائيّ — للتوليد والتعديل.',
    mediaType: 'video',
    capabilities: ['video-generation'],
    qualityTier: 'ultra',                       // REQUIRES_VERIFICATION
    maxVideoResolution: '1080p',                // REQUIRES_VERIFICATION
    supportedAspectRatios: ['16:9', '9:16'],   // REQUIRES_VERIFICATION
    minDurationSeconds: 4,                      // VERIFIED 2026-09-22: provider 422 on 5s — «Possible values are 4, 6, 8, 16, 24, 32, 40, 48, 56»
    maxDurationSeconds: 56,                     // VERIFIED 2026-09-22 (same refusal)
    supportedDurationsSeconds: [4, 6, 8, 16, 24, 32, 40, 48, 56], // VERIFIED 2026-09-22: the provider's own list
    supportsTextToVideo: true,                  // REQUIRES_VERIFICATION
    supportsImageToVideo: true,                 // VERIFIED 2026-09-22: listed in the /v1/image-to-video model enum
    supportsAudio: undefined,                   // REQUIRES_VERIFICATION ('veo3.1-audio' is a separate enum value)
    supportsCharacterConsistency: undefined,    // REQUIRES_VERIFICATION
    characteristicHints: [],
    supportedStyleIds: [],
    costCatalogKey: {
      gatewayId: 'magic-hour',
      capabilityTarget: 'video-generation',
      modelId: 'veo-3-1',
    },
    verificationStatus: 'production-authorized',
    productionAuthorized: true,
    active: true,   // ACTIVATED 2026-09-22 by the Veo 3.1 image→video production-proof order
    internalNotes:
      'Production authorized by Chief Architect 2026-08-27 (Phase III). Magic Hour-hosted since the ' +
      'identifier correction of 2026-09-22 (providerModelId veo3.1). Activated the same day under the ' +
      'Veo 3.1 production-proof order; the proof record is the evidence it dispatches.',
  },
  {
    // Sora 2 is OpenAI's video model. No AZMA provider adapter exists for video.
    // active: false prevents this model from being selected.
    modelId: 'sora-2',
    providerId: 'openai-video',               // No adapter exists — future
    gatewayId: 'openai-video',
    providerModelId: 'sora-2',               // REQUIRES_VERIFICATION
    displayName: 'Sora 2',
    sovereignNameAr: 'الحركة الواسعة',
    sovereignNoteAr: 'مشاهدُ أطول وأوسع.',
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
    verificationStatus: 'production-authorized',
    // ── THE FOUNDER'S DESIGNATION, 2026-09-25 ──────────────────────
    //   Three models are designated: one for images and the infographic,
    //   two for video and its editing. This is not among them, so production
    //   never routes to it. The entry is kept, not deleted — what the Empire
    //   verified about it, what it costs and what it can do is worth more
    //   than the lines it occupies, and a designation that changes should
    //   change a flag rather than resurrect a file.
    productionAuthorized: false,
    active: false,  // No provider adapter — production-authorized but not yet dispatchable
    internalNotes:
      'Production authorized by Chief Architect 2026-08-27 (Phase III). OpenAI model. ' +
      'No AZMA OpenAI video adapter exists. active: false prevents runtime selection until ' +
      'an OpenAI video provider adapter is built and registered.',
  },
];
