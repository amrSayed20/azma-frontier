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
    // -- MEASURED 2026-09-27, under the Audio Silence Boundary order --------
    //   `audio: false` was sent explicitly on /v1/text-to-video (verified in
    //   the shipped bundle of release 20260927-071712-594df00) and this model
    //   returned a 4s master carrying an AUDIBLE AAC track: 32kHz stereo,
    //   134 kb/s, peak -7.0 dB, RMS -24.4 dB. The provider's own output.mp4 is
    //   BYTE-IDENTICAL to the deposited asset (sha256 ff31e610...), so the
    //   track is the provider's and nothing inside AZMA added it.
    //   So: this model emits audio, and it does not honour the parameter that
    //   asks it not to. Recorded as measured, never inferred.
    supportsAudio: true,                        // MEASURED 2026-09-27: emits audio unconditionally; ignores `audio: false`
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
    // ── A DORMANT BINDING, REGISTERED FOR ONE CONTROLLED TEST ──────────
    //
    //   Registered under the Controlled Model Test Enablement order of
    //   2026-09-27, which states plainly: «This directive DOES NOT authorize
    //   either model for normal production» and «Do NOT remove Seedance».
    //
    //   `productionAuthorized: false` and `active: false` are what keep it
    //   dormant, and they are not decoration. The selector's very first step
    //   filters the fleet to `productionAuthorized && active`, so a normal
    //   creator request CANNOT reach this model — not because a condition
    //   elsewhere forbids it, but because it is never in the pool at all.
    //   Even an explicit `requiredModelId` is refused with
    //   'required-model-unavailable', because that filter runs on the
    //   authorized pool and not on the fleet.
    //
    //   It is addressable ONLY through the Founder-gated test path, which
    //   resolves an AZMA fleet id — never a provider string — and never
    //   touches the selector.
    modelId: 'minimax-h3',
    providerId: MAGIC_HOUR_VIDEO_PROVIDER_ID,
    gatewayId: 'magic-hour',
    providerModelId: 'minimax-h3',             // VERIFIED 2026-09-27: docs.magichour.ai /v1/text-to-video model enum
    displayName: 'MiniMax H3',
    sovereignNameAr: 'حركة قيد الاختبار',
    sovereignNoteAr: 'بنيةٌ تحت الاختبار وحده — لا تُعرض على منشئ.',
    mediaType: 'video',
    capabilities: ['video-generation'],
    qualityTier: 'standard',                   // REQUIRES_VERIFICATION
    maxVideoResolution: '1080p',               // DOCUMENTED 2026-09-27: «Supports 480p, 720p, 1080p» — not yet measured
    supportedAspectRatios: ['16:9', '9:16', '1:1'],  // DOCUMENTED 2026-09-27 — not yet measured
    minDurationSeconds: 1,                     // DOCUMENTED 2026-09-27: «any integer from 1 to 30»
    maxDurationSeconds: 30,                    // DOCUMENTED 2026-09-27 (same source)
    supportsTextToVideo: true,                 // DOCUMENTED 2026-09-27: present in the text-to-video model enum
    supportsImageToVideo: undefined,           // REQUIRES_VERIFICATION
    supportsAudio: undefined,                  // REQUIRES_VERIFICATION — the provider documents an `audio` toggle
    supportsCharacterConsistency: undefined,   // REQUIRES_VERIFICATION
    characteristicHints: [],
    supportedStyleIds: [],
    costCatalogKey: {
      gatewayId: 'magic-hour',
      capabilityTarget: 'video-generation',
      modelId: 'minimax-h3',
    },
    verificationStatus: 'approved-candidate',
    productionAuthorized: false,               // TEST-ONLY. Not a production allocation.
    active: false,                             // TEST-ONLY. The selector never sees it.
    internalNotes:
      'TEST-ONLY dormant binding, registered 2026-09-27 under the Controlled Model Test Enablement ' +
      'order so that exactly one controlled comparison against the Seedance reference can be run ' +
      'through the Founder-gated test path. It is NOT an allocation, NOT a replacement for Seedance, ' +
      'and NOT visible to any creator. Its capability figures are the provider DOCUMENTATION, not ' +
      'measurements — nothing here has been proven by a production. Activating it would require a ' +
      'separate constitutional order.',
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
