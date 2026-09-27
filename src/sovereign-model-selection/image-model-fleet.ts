import { MAGIC_HOUR_IMAGE_PROVIDER_ID } from '../core/sovereign-ai-integration/adapters/magic-hour-adapter';
import type { SovereignMediaModelDescriptor } from './types';

/**
 * Chief Architect-approved and production-authorized image model fleet.
 * Approval date: 2026-08-27. Production authorization: 2026-08-27 (Phase III).
 *
 * ALL entries carry verificationStatus: 'production-authorized' and
 * productionAuthorized: true per explicit Chief Architect Phase III order.
 *
 * providerModelId: assumed to match Magic Hour API model strings.
 * REQUIRES_VERIFICATION: real-world API verification of model strings,
 * qualityTier, maxImageResolution, and supportedAspectRatios is still
 * pending. Authorization precedes API verification — the Chief Architect
 * will perform real-world model tests after Phase III deployment.
 */
export const IMAGE_MODEL_FLEET: readonly SovereignMediaModelDescriptor[] = [
  {
    modelId: 'z-image-turbo',
    providerId: MAGIC_HOUR_IMAGE_PROVIDER_ID,
    gatewayId: 'magic-hour',
    providerModelId: 'z-image-turbo',          // REQUIRES_VERIFICATION
    displayName: 'Z-Image Turbo',
    sovereignNameAr: 'الرَّيْشة السريعة',
    sovereignNoteAr: 'أسرع طريقٍ إلى صورة، للمسودّات والتجريب.',
    mediaType: 'image',
    capabilities: ['image-generation'],
    qualityTier: 'standard',                    // REQUIRES_VERIFICATION
    maxImageResolution: '1k',                   // REQUIRES_VERIFICATION
    supportedAspectRatios: ['16:9', '1:1', '9:16', '4:3', '3:4'],  // REQUIRES_VERIFICATION
    characteristicHints: [],
    supportedStyleIds: [],
    costCatalogKey: {
      gatewayId: 'magic-hour',
      capabilityTarget: 'image-generation',
      modelId: 'z-image-turbo',
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
      'Production authorized by Chief Architect 2026-08-27 (Phase III). ' +
      'providerModelId, qualityTier, maxImageResolution, and supportedAspectRatios ' +
      'require real-world verification against the Magic Hour API.',
  },
  {
    modelId: 'seedream-4',
    providerId: MAGIC_HOUR_IMAGE_PROVIDER_ID,
    gatewayId: 'magic-hour',
    providerModelId: 'seedream-v4',              // VERIFIED: docs.magichour.ai /v1/ai-image-generator enum 2026-08-27
    displayName: 'Seedream 4',
    sovereignNameAr: 'الرَّيْشة الواسعة',
    sovereignNoteAr: 'للمشاهد العامّة والتكوينات المتنوّعة.',
    mediaType: 'image',
    capabilities: ['image-generation'],
    qualityTier: 'high',                        // REQUIRES_VERIFICATION
    maxImageResolution: '1k',                   // REQUIRES_VERIFICATION
    supportedAspectRatios: ['16:9', '1:1', '9:16', '4:3', '3:4'],  // REQUIRES_VERIFICATION
    characteristicHints: [],
    supportedStyleIds: [],
    costCatalogKey: {
      gatewayId: 'magic-hour',
      capabilityTarget: 'image-generation',
      modelId: 'seedream-4',
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
      'Production authorized by Chief Architect 2026-08-27 (Phase III). ' +
      'All capability data requires real-world verification.',
  },
  {
    modelId: 'nano-banana-2',
    providerId: MAGIC_HOUR_IMAGE_PROVIDER_ID,
    gatewayId: 'magic-hour',
    providerModelId: 'nano-banana-2',           // VERIFIED 2026-09-22: docs.magichour.ai /v1/ai-image-generator AND /v1/ai-image-editor model enums
    displayName: 'Nano Banana 2',
    sovereignNameAr: 'رَّيْشة النَّصّ والترتيب',
    sovereignNoteAr: 'تُجيد الحرف المقروء والتخطيط المرتّب — وهي وحدها للإنفوغراف.',
    mediaType: 'image',
    capabilities: ['image-generation'],
    // ── THE FOUNDER'S FINAL ALLOCATION, 2026-09-27 ─────────────────
    //
    //   One model per capability. Where there is one designated model, a
    //   quality filter can no longer choose a better one — it can only refuse
    //   the Founder's own choice. So this tier is set by the DESIGNATION, and
    //   is marked as such rather than dressed as a measurement nobody made.
    //   Every tier in this file was, and the retired ones still are, a
    //   REQUIRES_VERIFICATION guess.
    //
    //   MEASURED 2026-09-27 under the Controlled Model Tests: 1376x768 at
    //   resolution '1k' for 100 credits, photographic, no artefact — and it
    //   rendered «قصر الخزانة السيادية» legibly where the retired video model
    //   produced malformed Arabic.
    //
    //   WHY THE TIER HAD TO MOVE: at 'standard' this model was excluded from
    //   six of the Chamber's fourteen styles, because the filter demands
    //   'high' for cinematic and 'ultra' for advertising. That is why a second
    //   image model was added beside it on 2026-09-25 — and why the reference
    //   image of 2026-09-27 resolved to Pro at 150 credits although this model
    //   had already been designated. A designation the machinery silently
    //   overrides is not a designation.
    //
    //   The resolution cap is OMITTED, not raised. The selector reads an absent
    //   cap as «no declared cap», which is exactly what is true: the endpoint
    //   documents up to 4k and the per-model cap is undocumented. Writing '2k'
    //   would be inventing a measurement to pass a filter.
    qualityTier: 'ultra',                       // FOUNDER'S DESIGNATION 2026-09-27 — not a measurement
    supportedAspectRatios: ['16:9', '1:1', '9:16'],  // VERIFIED 2026-09-22: the generator's aspect_ratio enum
    characteristicHints: ['legible-text', 'structured-layout', 'iconography', 'clean-background'],
    // ── THE ONE IMAGE MODEL OF THIS EMPIRE ─────────────────────────
    //
    //   The Founder designated it for images and the infographic on
    //   2026-09-25. It had declared `supportedStyleIds: ['infographic']` — a
    //   narrowing written when four other image models were authorized beside
    //   it. MEASURED the moment the designation took effect: a cinematic
    //   intent returned `selected: false`, and thirteen of the Chamber's
    //   fourteen styles would have been offered and refused.
    //
    //   Its scope is widened by the Founder's own ruling, taken when the
    //   consequence was put to him rather than after. `supportedStyleIds`
    //   omitted means every style; the infographic still REQUIRES this model
    //   through STYLE_REQUIRED_MODEL_MAP, which is a separate and stronger
    //   guarantee — the selector refuses rather than substitutes.
    //
    //   HONESTLY RECORDED: its verified strengths are legible text and
    //   structured layout. Its quality in the cinematic and photographic
    //   styles is not yet measured on real output.
    //
    //   MEASURED while widening it: nothing in the selector reads this field
    //   at all. It is a description, not a gate — the gate is
    //   STYLE_REQUIRED_MODEL_MAP. So it now describes what is true: this model
    //   serves every style the Chamber offers, and is REQUIRED for one.
    supportedStyleIds: [
      'cinematic', 'photorealistic', 'advertising', 'documentary', 'artistic',
      'sci-fi', 'animation', 'fantasy', 'portrait', 'fashion', 'architectural',
      'historical', 'abstract', 'infographic',
    ],
    costCatalogKey: {
      gatewayId: 'magic-hour',
      capabilityTarget: 'image-generation',
      modelId: 'nano-banana-2',
    },
    verificationStatus: 'production-authorized',
    productionAuthorized: true,
    active: true,
    internalNotes:
      'Production authorized by Chief Architect 2026-08-27 (Phase III). ' +
      'All capability data requires real-world verification.',
  },
  {
    // AZMA internal ID uses hyphen; providerModelId may use dot notation.
    modelId: 'seedream-4-5',
    providerId: MAGIC_HOUR_IMAGE_PROVIDER_ID,
    gatewayId: 'magic-hour',
    providerModelId: 'seedream-v4.5',            // INVALID: not in Magic Hour /v1/ai-image-generator enum (verified 2026-08-27)
    displayName: 'Seedream 4.5',
    sovereignNameAr: 'الرَّيْشة المدقّقة',
    sovereignNoteAr: 'تفصيلٌ أعلى وزمنٌ أطول.',
    mediaType: 'image',
    capabilities: ['image-generation'],
    qualityTier: 'high',                        // REQUIRES_VERIFICATION
    maxImageResolution: '2k',                   // REQUIRES_VERIFICATION
    supportedAspectRatios: ['16:9', '1:1', '9:16', '4:3', '3:4'],  // REQUIRES_VERIFICATION
    characteristicHints: [],
    supportedStyleIds: [],
    costCatalogKey: {
      gatewayId: 'magic-hour',
      capabilityTarget: 'image-generation',
      modelId: 'seedream-4-5',
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
    active: false,
    internalNotes:
      'Production authorized by Chief Architect 2026-08-27 (Phase III). ' +
      'DEACTIVATED 2026-08-27: providerModelId "seedream-v4.5" is not a valid Magic Hour API enum value. ' +
      'The closest candidate in the official enum is "seedream-v5-pro" but the mapping is unconfirmed. ' +
      'active: false prevents selection until the correct providerModelId is identified and authorized by the Chief Architect. ' +
      'Architectural identity preserved for audit continuity.',
  },
  {
    modelId: 'nano-banana-pro',
    providerId: MAGIC_HOUR_IMAGE_PROVIDER_ID,
    gatewayId: 'magic-hour',
    providerModelId: 'nano-banana-pro',         // REQUIRES_VERIFICATION
    displayName: 'Nano Banana Pro',
    sovereignNameAr: 'رَّيْشة النَّصّ المتقدّمة',
    sovereignNoteAr: 'حرفٌ وتخطيطٌ بدقّةٍ أعلى.',
    mediaType: 'image',
    capabilities: ['image-generation'],
    qualityTier: 'ultra',                       // REQUIRES_VERIFICATION
    maxImageResolution: '2k',                   // REQUIRES_VERIFICATION
    supportedAspectRatios: ['16:9', '1:1', '9:16', '4:3', '3:4', '21:9'],  // REQUIRES_VERIFICATION
    characteristicHints: [],
    supportedStyleIds: [],
    costCatalogKey: {
      gatewayId: 'magic-hour',
      capabilityTarget: 'image-generation',
      modelId: 'nano-banana-pro',
    },
    verificationStatus: 'production-authorized',
    // ── THE FOUNDER'S DESIGNATION, 2026-09-25 ──────────────────────
    //   «قد اختصصت ثلاثة مزودين فقط من المزود الرئيسي» — one for images and
    //   the infographic, two for video and its editing. This model is not
    //   among them, so production never routes to it. Its entry is kept, not
    //   deleted: the Empire's record of what it verified, what it costs and
    //   what it can do is worth more than the few lines it occupies, and a
    //   designation that changes should change a flag, not resurrect a file.
    // ── THE FOURTH DESIGNATED MODEL, 2026-09-25 ───────────────────
    //
    //   The Founder designated three, and the consequence was measured
    //   before it shipped: six of the Chamber's fourteen styles —
    //   advertising, photorealistic, portrait, cinematic, architectural
    //   and fashion — ask for a quality tier above `standard`, and the
    //   selector refuses rather than downgrade a Creator's work in
    //   silence. With one standard-tier image model those six would have
    //   been offered and refused.
    //
    //   Put to the Founder with the alternatives, he ruled: add a
    //   high-quality model beside it. This is that model — the same
    //   family, `ultra` tier, so every style the Chamber offers can be
    //   served. The infographic still REQUIRES nano-banana-2 and this
    //   does not touch that.
    //
    // ── AND RETIRED, 2026-09-27, BY THE FINAL ALLOCATION ───────────
    //
    //   The ruling above is superseded. The Founder's final allocation names
    //   Nano Banana 2 for images AND the infographic; Pro is not in that table.
    //   The six styles it was added to cover are now served by raising Nano
    //   Banana 2's own tier — which is what the 2026-09-25 designation had
    //   always meant and the machinery had silently overridden.
    //
    //   RETIRED, NOT DELETED. Its entry, its assets, its generations, its
    //   provider jobs and its measured 150-credit history all stand untouched.
    //   Only new production stops here.
    productionAuthorized: false,   // RETIRED 2026-09-27 — the Founder's final allocation
    active: false,                 // RETIRED 2026-09-27 — history preserved, new production stopped
    internalNotes:
      'RETIRED for new production 2026-09-27 by the final allocation of the Founder (Nano Banana 2 ' +
      'is the one image model). History, assets and cost records preserved. ' +
      'Production authorized by Chief Architect 2026-08-27 (Phase III). ' +
      'All capability data requires real-world verification.',
  },
];
