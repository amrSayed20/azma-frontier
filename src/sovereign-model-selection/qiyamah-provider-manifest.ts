/**
 * AZMA OS — THE PROVIDER/MODEL MANIFEST OF حجرة القيامة
 *
 * ─── WHAT THIS IS ───────────────────────────────────────────────────────────
 *
 *   One version-controlled statement of which provider, which model and which
 *   mode every one of the ten acts actually executes on — and, where an act
 *   legitimately chooses, WHICH SET it may choose from and by what policy.
 *
 *   It is not a second authority. Every line is bound by a contract test to
 *   the code that really executes it: the adapter constant, the fleet flag, the
 *   required-model rule, or the endpoint map. The manifest cannot drift from
 *   production, because the drift breaks a test rather than a Creator.
 *
 * ─── WHY A MANIFEST AND NOT JUST THE FLEET ──────────────────────────────────
 *
 *   MEASURED 2026-10-12: image generation had NO pin. Its stability came from
 *   the authorized pool happening to hold exactly one model — and the server's
 *   own logs show `nano-banana-pro` dispatched on a day when it was authorized,
 *   at 150 credits where nano-banana-2 costs 100. One boolean on one fleet
 *   entry silently changed what production used and what it cost.
 *
 *   So a changed pool must now break a test. `AUTHORIZED_CANDIDATES` below is
 *   the Architect's approved set; the test compares it against what the fleet
 *   would actually permit. Authorizing a model without ruling on it here is
 *   not forbidden by a comment — it fails the build.
 *
 * ─── AND WHAT IT DELIBERATELY DOES NOT HOLD ─────────────────────────────────
 *
 *   No price (the Balance and `new-capability-pricing` own that), no Creator
 *   text, and no provider name that could reach a surface. An asset's identity
 *   never carries a provider; this file is read by tests and by the report.
 */

export const QIYAMAH_MANIFEST_VERSION = '1.0' as const;
export const QIYAMAH_MANIFEST_RULED_ON = '2026-10-12' as const;

/** How the executing model is decided for an act. */
export type SelectionPolicy =
  /** One model, named in code. No selection happens at all. */
  | 'fixed-constant'
  /** The selector is told the model as a REQUIREMENT and refuses to substitute. */
  | 'required-model'
  /** The selector chooses from the authorized pool; the pool is pinned here. */
  | 'selector-from-authorized-pool'
  /** The Creator chooses, and the selector filters by the authorized pool. */
  | 'creator-chooses-from-authorized-pool'
  /** The endpoint IS the capability — no model identifier exists to send. */
  | 'endpoint-is-the-model';

export interface ManifestEntry {
  readonly operation: string;
  readonly nameAr: string;
  readonly providerId: string;
  readonly endpoint: string;
  /** The exact provider model id, when one is sent. Null when none exists. */
  readonly providerModelId: string | null;
  /** Every model this act may run on. One entry unless it truly routes. */
  readonly authorizedCandidates: readonly string[];
  readonly policy: SelectionPolicy;
  /** The mode/quality strings this Empire sends, exactly. */
  readonly sentConfiguration: readonly string[];
  /** Where the rule lives in code — what the contract test binds to. */
  readonly enforcedBy: string;
  /** Who prices it for a Creator. */
  readonly priceAuthority: string;
  /**
   * Live production evidence on the CURRENT release line, or null.
   * A provider job id, or a server dispatch log line. Never a test.
   */
  readonly liveEvidence: string | null;
}

export const QIYAMAH_PROVIDER_MANIFEST: readonly ManifestEntry[] = [
  {
    operation: 'image', nameAr: 'صورة',
    providerId: 'magic-hour-image', endpoint: '/v1/ai-image-generator',
    providerModelId: 'nano-banana-2',
    authorizedCandidates: ['nano-banana-2'],
    policy: 'selector-from-authorized-pool',
    sentConfiguration: ['aspect_ratio from the Creator', 'resolution from the style quality tier'],
    enforcedBy: 'IMAGE_MODEL_FLEET productionAuthorized && active, compared to this list',
    priceAuthority: 'OPERATION_CONSUMPTION · IMAGE_GENERATION · 200 units/image',
    liveEvidence: '[MagicHourImageAdapter] job-submitted {"model":"nano-banana-2"}',
  },
  {
    operation: 'infographic', nameAr: 'إنفوغرافيك',
    providerId: 'magic-hour-image', endpoint: '/v1/ai-image-generator',
    providerModelId: 'nano-banana-2',
    authorizedCandidates: ['nano-banana-2'],
    policy: 'required-model',
    sentConfiguration: ['aspect_ratio from the Creator', "resolution '1k' (style tier: standard)"],
    enforcedBy: "STYLE_REQUIRED_MODEL_MAP.infographic — the selector refuses rather than substitutes",
    priceAuthority: 'OPERATION_CONSUMPTION · INFOGRAPHIC · 200 units/image',
    liveEvidence: '[SovereignGeneration] model-selection {"style":"infographic","modelId":"nano-banana-2"}',
  },
  {
    operation: 'video', nameAr: 'فيديو',
    providerId: 'magic-hour-video', endpoint: '/v1/text-to-video',
    providerModelId: 'minimax-h3',
    authorizedCandidates: ['minimax-h3'],
    policy: 'required-model',
    sentConfiguration: ["resolution '720p'", 'end_seconds from the Creator', 'audio: the sovereign boundary'],
    enforcedBy: 'QIYAMAH_VIDEO_GENERATION_MODEL passed as requiredModelId',
    priceAuthority: 'OPERATION_CONSUMPTION · VIDEO_GENERATION · 200 units/requested second',
    liveEvidence: '[SovereignGeneration] video-model-selection {"modelId":"minimax-h3"}',
  },
  {
    operation: 'edit', nameAr: 'تعديل',
    providerId: 'magic-hour-image-editor', endpoint: '/v1/ai-image-editor',
    providerModelId: 'nano-banana-2',
    authorizedCandidates: ['nano-banana-2'],
    policy: 'fixed-constant',
    sentConfiguration: ['style.prompt — the Creator’s instruction'],
    enforcedBy: 'IMAGE_EDIT_MODEL_ID in magic-hour-image-editing.ts',
    priceAuthority: 'OPERATION_CONSUMPTION · IMAGE_EDIT · 200 units/image',
    liveEvidence: 'vault_assets.metadata.mutationProviderId = magic-hour-image-editor',
  },
  {
    operation: 'animate', nameAr: 'تحريك',
    providerId: 'magic-hour-image-to-video', endpoint: '/v1/image-to-video',
    providerModelId: 'veo3.1',
    authorizedCandidates: ['veo-3-1'],
    policy: 'creator-chooses-from-authorized-pool',
    sentConfiguration: ['end_seconds from the fleet’s own duration list'],
    enforcedBy: 'the page filters productionAuthorized && active && supportsImageToVideo; '
      + 'the route passes the choice as requiredModelId so the selector filters it again',
    priceAuthority: 'OPERATION_CONSUMPTION · MOTION · 200 units/requested second',
    liveEvidence: 'vault_assets.metadata.mutationProviderId = magic-hour-image-to-video',
  },
  {
    operation: 'upscale-2x', nameAr: 'رفع الدقّة ضِعفين',
    providerId: 'magic-hour-image-upscaler', endpoint: '/v1/ai-image-upscaler',
    providerModelId: null,
    authorizedCandidates: [],
    policy: 'endpoint-is-the-model',
    sentConfiguration: ['scale_factor: 2', "style.mode: 'preserve'"],
    enforcedBy: 'UPSCALE_SCALE_FACTOR and UPSCALE_MODE',
    priceAuthority: 'OPERATION_CONSUMPTION · UPSCALE_2X · 50 units/operation',
    liveEvidence: 'first live upscale 2026-09-27, charged 25 credits',
  },
  {
    operation: 'upscale-4x', nameAr: 'رفع الدقّة أربعَ مرّات',
    providerId: 'magic-hour-image-upscaler', endpoint: '/v1/ai-image-upscaler',
    providerModelId: null,
    authorizedCandidates: [],
    policy: 'endpoint-is-the-model',
    sentConfiguration: ['scale_factor: 4', "style.mode: 'preserve'"],
    enforcedBy: 'UPSCALE_FACTORS — creatorPriceExists gates execution',
    priceAuthority: 'new-capability-pricing · UPSCALE_4X · 100 credits × 1.70 → 170 units',
    liveEvidence: 'provider job cmv5c2l8q073zmj01xymsmdeg — complete, 100 credits, 5504×3072',
  },
  {
    operation: 'background-removal', nameAr: 'إزالة الخلفيّة',
    providerId: 'magic-hour-background-remover', endpoint: '/v1/image-background-remover',
    providerModelId: null,
    authorizedCandidates: [],
    policy: 'endpoint-is-the-model',
    sentConfiguration: ['assets.image_file_path only — the endpoint has one mode'],
    enforcedBy: 'CREATIVE_ENDPOINT[background-removal]',
    priceAuthority: 'new-capability-pricing · 5 credits/image × 1.70 → 9 units',
    liveEvidence: 'provider job cmv59080s0582l801e5hqmspr — complete, 5 credits',
  },
  {
    operation: 'lip-sync', nameAr: 'مزامنة الشفاه',
    providerId: 'magic-hour-lip-sync', endpoint: '/v1/lip-sync',
    providerModelId: null,
    authorizedCandidates: [],
    policy: 'endpoint-is-the-model',
    sentConfiguration: ["style.generation_mode: 'standard'", 'video_source: file', 'start/end_seconds'],
    enforcedBy: 'LIP_SYNC_GENERATION_MODE',
    priceAuthority: 'new-capability-pricing · 1 credit/frame × 1.70 → ceil(frames × 1.7) units',
    liveEvidence: 'provider job cmv59ivor01zemd01s1tp7g60 — complete, 25 credits for 25 frames',
  },
  {
    operation: 'face-swap', nameAr: 'تبديل الوجه',
    providerId: 'magic-hour-face-swap', endpoint: '/v1/face-swap',
    providerModelId: null,
    authorizedCandidates: [],
    policy: 'endpoint-is-the-model',
    sentConfiguration: ["style.version: 'default'", "face_swap_mode: 'all-faces'", 'video_source: file'],
    enforcedBy: 'FACE_SWAP_STYLE_VERSION and FACE_SWAP_FACE_MODE',
    priceAuthority: 'new-capability-pricing · 1 credit/frame × 1.70 → ceil(frames × 1.7) units',
    liveEvidence: 'provider job cmv5bvh7u0b8mmn016j1kszpv — complete, 25 credits for 25 frames',
  },
  {
    operation: 'talking-photo', nameAr: 'صورة ناطقة',
    providerId: 'magic-hour-talking-photo', endpoint: '/v1/ai-talking-photo',
    providerModelId: null,
    authorizedCandidates: [],
    policy: 'endpoint-is-the-model',
    sentConfiguration: ["style.generation_mode: 'realistic'", 'start/end_seconds'],
    enforcedBy: 'TALKING_PHOTO_GENERATION_MODE',
    priceAuthority: 'new-capability-pricing · 48 credits/second × 1.70 → ceil(s × 81.6) units',
    liveEvidence: 'provider job cmv59prfj092po50107ra2f2j — complete, 48 credits for one second',
  },
];

export const manifestFor = (operation: string): ManifestEntry | undefined =>
  QIYAMAH_PROVIDER_MANIFEST.find((m) => m.operation === operation);

/**
 * The ten acts a Creator meets, in the manifest's own terms.
 *
 * `upscale` appears twice because 2× and 4× are two priced acts on one
 * endpoint — and pretending they are one would hide that only one of them has
 * ever been sold.
 */
export const MANIFEST_OPERATION_COUNT = 11 as const;
