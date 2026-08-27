// AZMA OS — Provider Cost Catalog.
// All gateway costs are defined here. Never embed prices in business logic.
// BLOCKER (per Section XXIII of Construction Directive): Magic Hour API contract
// has not been inspected. All Magic Hour entries are marked 'pending-discovery'
// until the Chief Architect provides the confirmed API contract and cost schedule.
// No paid generation may proceed via Magic Hour until this catalog is updated.

import type { ProviderCostCatalog } from './cost-engine-types';

export const CURRENT_PROVIDER_COST_CATALOG: ProviderCostCatalog = {
  catalogVersion: '0.2.0',
  publishedAt: 1753574400000, // 2026-07-27 — Magic Hour contract discovered; provider costs updated; AZMA conversion pending
  entries: [
    // ── MAGIC HOUR ────────────────────────────────────────────────────────────
    // STATUS: CONTRACT DISCOVERED — provider credit costs confirmed.
    // BLOCKER: azmaUnitsPerUnit = 0 (pending-discovery) until the Chief Architect
    // approves the MH credit → AZMA Unit conversion rate. Do NOT set
    // availability:'available' until that conversion is approved and catalogVersion bumped.
    //
    // Confirmed MH credit costs (from official docs, 2026-07-30):
    //   Image generation: ~5 MH credits/image (from quick-start example)
    //   Image upscaling: 50–200 MH credits (resolution-dependent)
    //   Text-to-video: variable — frames × per-frame cost (estimated at submission, final at completion)
    //   TTS: 0.1 MH credits per character, rounded up
    //   Voice cloning: 0.1 MH credits per character, rounded up
    //   Image editing: not explicitly documented — estimated ~5–25 MH credits
    //   Credits charged immediately for images; estimated-then-finalized for video.
    //   MH auto-refunds credits on failure and cancellation.
    {
      gatewayId: 'magic-hour',
      capabilityTarget: 'image-generation',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 generated image',
      availability: 'pending-discovery',
      catalogVersion: '0.2.0',
      effectiveFrom: 1753574400000,
      providerCreditCost: 5,
      providerCreditUnit: 'magic-hour-credits',
      notes: 'MH credit cost confirmed (~5/image). AZMA Unit conversion pending Chief Architect approval.',
    },
    {
      gatewayId: 'magic-hour',
      capabilityTarget: 'image-editing',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 edited image',
      availability: 'pending-discovery',
      catalogVersion: '0.2.0',
      effectiveFrom: 1753574400000,
      providerCreditCost: null,
      providerCreditUnit: 'magic-hour-credits',
      notes: 'MH credit cost for image editing not explicitly documented. Requires empirical test. AZMA Unit conversion pending.',
    },
    {
      gatewayId: 'magic-hour',
      capabilityTarget: 'image-upscaling',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 upscaled image (resolution-dependent: 50–200 MH credits)',
      availability: 'pending-discovery',
      catalogVersion: '0.2.0',
      effectiveFrom: 1753574400000,
      providerCreditCost: 200,
      providerCreditUnit: 'magic-hour-credits',
      notes: 'MH cost: 50–200 credits depending on output resolution. Using ceiling (200) for conservative reservation. AZMA Unit conversion pending.',
    },
    {
      gatewayId: 'magic-hour',
      capabilityTarget: 'video-generation',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 video generation (variable: estimated at submission, finalized at completion)',
      availability: 'pending-discovery',
      catalogVersion: '0.2.0',
      effectiveFrom: 1753574400000,
      providerCreditCost: null,
      providerCreditUnit: 'magic-hour-credits',
      notes: 'MH video cost = frames × per-frame-rate. Estimated at submission based on end_seconds × assumed 30fps. Adjusted at completion. Per-frame credit cost not publicly documented. AZMA Unit conversion pending.',
    },
    {
      gatewayId: 'magic-hour',
      capabilityTarget: 'text-to-speech',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 TTS generation (0.1 MH credits/character, rounded up)',
      availability: 'pending-discovery',
      catalogVersion: '0.2.0',
      effectiveFrom: 1753574400000,
      providerCreditCost: null,
      providerCreditUnit: 'magic-hour-credits',
      notes: 'MH cost: 0.1 credits/character, ceil(). For a 4096-char max: 410 MH credits. AZMA Unit conversion pending.',
    },
    {
      gatewayId: 'magic-hour',
      capabilityTarget: 'voice-cloning',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 voice clone generation (0.1 MH credits/character, rounded up)',
      availability: 'pending-discovery',
      catalogVersion: '0.2.0',
      effectiveFrom: 1753574400000,
      providerCreditCost: null,
      providerCreditUnit: 'magic-hour-credits',
      notes: 'MH cost: same as TTS — 0.1 credits/character, ceil(). AZMA Unit conversion pending.',
    },
    // ── MAGIC HOUR — MODEL-LEVEL IMAGE ENTRIES ────────────────────────────────
    // One entry per Chief Architect-approved image candidate.
    // All pending-discovery: AZMA Unit conversion not yet approved.
    // providerCreditCost is unknown until verification against actual Magic Hour API.
    {
      gatewayId: 'magic-hour',
      capabilityTarget: 'image-generation',
      modelId: 'z-image-turbo',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 generated image (Z-Image Turbo)',
      availability: 'pending-discovery',
      catalogVersion: '0.3.0',
      effectiveFrom: 1756310400000, // 2026-08-27
      providerCreditCost: null,
      providerCreditUnit: 'magic-hour-credits',
      notes: 'Approved candidate. providerCreditCost and AZMA Unit rate require verification.',
    },
    {
      gatewayId: 'magic-hour',
      capabilityTarget: 'image-generation',
      modelId: 'seedream-4',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 generated image (Seedream 4)',
      availability: 'pending-discovery',
      catalogVersion: '0.3.0',
      effectiveFrom: 1756310400000,
      providerCreditCost: null,
      providerCreditUnit: 'magic-hour-credits',
      notes: 'Approved candidate. providerCreditCost and AZMA Unit rate require verification.',
    },
    {
      gatewayId: 'magic-hour',
      capabilityTarget: 'image-generation',
      modelId: 'nano-banana-2',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 generated image (Nano Banana 2)',
      availability: 'pending-discovery',
      catalogVersion: '0.3.0',
      effectiveFrom: 1756310400000,
      providerCreditCost: null,
      providerCreditUnit: 'magic-hour-credits',
      notes: 'Approved candidate. providerCreditCost and AZMA Unit rate require verification.',
    },
    {
      gatewayId: 'magic-hour',
      capabilityTarget: 'image-generation',
      modelId: 'seedream-4-5',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 generated image (Seedream 4.5)',
      availability: 'pending-discovery',
      catalogVersion: '0.3.0',
      effectiveFrom: 1756310400000,
      providerCreditCost: null,
      providerCreditUnit: 'magic-hour-credits',
      notes: 'Approved candidate. providerCreditCost and AZMA Unit rate require verification.',
    },
    {
      gatewayId: 'magic-hour',
      capabilityTarget: 'image-generation',
      modelId: 'nano-banana-pro',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 generated image (Nano Banana Pro)',
      availability: 'pending-discovery',
      catalogVersion: '0.3.0',
      effectiveFrom: 1756310400000,
      providerCreditCost: null,
      providerCreditUnit: 'magic-hour-credits',
      notes: 'Approved candidate. providerCreditCost and AZMA Unit rate require verification.',
    },
    // ── MAGIC HOUR — MODEL-LEVEL VIDEO ENTRIES ────────────────────────────────
    {
      gatewayId: 'magic-hour',
      capabilityTarget: 'video-generation',
      modelId: 'ltx-2-3',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 video generation (LTX 2.3, variable duration)',
      availability: 'pending-discovery',
      catalogVersion: '0.3.0',
      effectiveFrom: 1756310400000,
      providerCreditCost: null,
      providerCreditUnit: 'magic-hour-credits',
      notes: 'Approved candidate. Variable credit cost (frames × per-frame rate). Verification required.',
    },
    {
      gatewayId: 'magic-hour',
      capabilityTarget: 'video-generation',
      modelId: 'kling-3-0',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 video generation (Kling 3.0, variable duration)',
      availability: 'pending-discovery',
      catalogVersion: '0.3.0',
      effectiveFrom: 1756310400000,
      providerCreditCost: null,
      providerCreditUnit: 'magic-hour-credits',
      notes: 'Approved candidate. Variable credit cost. Verification required.',
    },
    {
      gatewayId: 'magic-hour',
      capabilityTarget: 'video-generation',
      modelId: 'seedance-2-0',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 video generation (Seedance 2.0, variable duration)',
      availability: 'pending-discovery',
      catalogVersion: '0.3.0',
      effectiveFrom: 1756310400000,
      providerCreditCost: null,
      providerCreditUnit: 'magic-hour-credits',
      notes: 'Approved candidate. Variable credit cost. Verification required.',
    },
    {
      gatewayId: 'google-veo',
      capabilityTarget: 'video-generation',
      modelId: 'veo-3-1',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 video generation (Veo 3.1)',
      availability: 'pending-discovery',
      catalogVersion: '0.3.0',
      effectiveFrom: 1756310400000,
      providerCreditCost: null,
      providerCreditUnit: 'google-credits',
      notes: 'Approved candidate. No Google provider adapter. Pricing unknown. Verification required.',
    },
    {
      gatewayId: 'openai-video',
      capabilityTarget: 'video-generation',
      modelId: 'sora-2',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 video generation (Sora 2)',
      availability: 'pending-discovery',
      catalogVersion: '0.3.0',
      effectiveFrom: 1756310400000,
      providerCreditCost: null,
      providerCreditUnit: 'openai-usd',
      notes: 'Approved candidate. No OpenAI video adapter. Pricing unknown. Verification required.',
    },
    // ── OPENAI (image generation — existing Qiyamah pipeline) ─────────────────
    // OpenAI DALL-E 3 standard quality: ~$0.04/image = ~40 AZMA units at ~$0.001/unit
    // exchange rate: START pack 800 units / 99 EGP ≈ 8.08 units/EGP ≈ $0.001/unit (at 50 EGP/USD)
    {
      gatewayId: 'openai',
      capabilityTarget: 'image-generation',
      azmaUnitsPerUnit: 40,
      unitDescription: '1 generated image (DALL-E 3 standard quality, 1024×1024)',
      availability: 'available',
      catalogVersion: '0.1.0',
      effectiveFrom: 1753574400000,
    },
    // ── OPENAI TTS (existing Ras Al Amr Ministry II pipeline) ─────────────────
    // OpenAI TTS standard: ~$0.015/1000 chars. Flat per-call cost covers up to 4096 chars.
    // 20 AZMA units ≈ $0.02 per generation call — covers typical usage without per-char complexity.
    {
      gatewayId: 'openai',
      capabilityTarget: 'text-to-speech',
      azmaUnitsPerUnit: 20,
      unitDescription: '1 TTS generation (up to 4096 characters)',
      availability: 'available',
      catalogVersion: '0.1.0',
      effectiveFrom: 1753574400000,
    },
    // ── OPENAI VOICE CLONING ───────────────────────────────────────────────────
    // Voice cloning via OpenAI not yet integrated in production pipeline.
    {
      gatewayId: 'openai',
      capabilityTarget: 'voice-cloning',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 voice clone generation',
      availability: 'pending-discovery',
      catalogVersion: '0.1.0',
      effectiveFrom: 1753574400000,
      notes: 'Voice cloning provider not yet integrated. Cost pending confirmation.',
    },
  ],
};

// Model-aware lookup: tries exact (gatewayId + capabilityTarget + modelId) first,
// then falls back to the coarse (gatewayId + capabilityTarget) entry.
// All existing callers pass no modelId and continue to receive the coarse entry.
export function getCatalogEntry(
  gatewayId: string,
  capabilityTarget: string,
  catalog: ProviderCostCatalog = CURRENT_PROVIDER_COST_CATALOG,
  modelId?: string,
) {
  if (modelId) {
    const modelEntry = catalog.entries.find(
      (e) =>
        e.gatewayId === gatewayId &&
        e.capabilityTarget === capabilityTarget &&
        e.modelId === modelId,
    );
    if (modelEntry) return modelEntry;
  }
  // Coarse fallback: entry with no modelId discriminator.
  return catalog.entries.find(
    (e) =>
      e.gatewayId === gatewayId &&
      e.capabilityTarget === capabilityTarget &&
      !e.modelId,
  );
}
