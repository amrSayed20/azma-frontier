// AZMA OS — Provider Cost Catalog.
// All gateway costs are defined here. Never embed prices in business logic.
// BLOCKER (per Section XXIII of Construction Directive): Magic Hour API contract
// has not been inspected. All Magic Hour entries are marked 'pending-discovery'
// until the Chief Architect provides the confirmed API contract and cost schedule.
// No paid generation may proceed via Magic Hour until this catalog is updated.

import type { ProviderCostCatalog } from './cost-engine-types';

export const CURRENT_PROVIDER_COST_CATALOG: ProviderCostCatalog = {
  catalogVersion: '0.1.0',
  publishedAt: 1753574400000, // 2025-07-27 — initial catalog with pending-discovery entries
  entries: [
    // ── MAGIC HOUR ────────────────────────────────────────────────────────────
    // STATUS: PENDING-DISCOVERY — API contract not yet inspected.
    // Do NOT set availability:'available' until costs are confirmed with the
    // Chief Architect and the catalog version is bumped.
    {
      gatewayId: 'magic-hour',
      capabilityTarget: 'image-generation',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 generated image',
      availability: 'pending-discovery',
      catalogVersion: '0.1.0',
      effectiveFrom: 1753574400000,
      notes: 'BLOCKED: Magic Hour API contract not inspected. Cost unknown.',
    },
    {
      gatewayId: 'magic-hour',
      capabilityTarget: 'image-editing',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 edited image',
      availability: 'pending-discovery',
      catalogVersion: '0.1.0',
      effectiveFrom: 1753574400000,
      notes: 'BLOCKED: Magic Hour API contract not inspected. Cost unknown.',
    },
    {
      gatewayId: 'magic-hour',
      capabilityTarget: 'image-upscaling',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 upscaled image',
      availability: 'pending-discovery',
      catalogVersion: '0.1.0',
      effectiveFrom: 1753574400000,
      notes: 'BLOCKED: Magic Hour API contract not inspected. Cost unknown.',
    },
    {
      gatewayId: 'magic-hour',
      capabilityTarget: 'video-generation',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 video clip',
      availability: 'pending-discovery',
      catalogVersion: '0.1.0',
      effectiveFrom: 1753574400000,
      notes: 'BLOCKED: Magic Hour API contract not inspected. Cost unknown.',
    },
    {
      gatewayId: 'magic-hour',
      capabilityTarget: 'text-to-speech',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 TTS generation',
      availability: 'pending-discovery',
      catalogVersion: '0.1.0',
      effectiveFrom: 1753574400000,
      notes: 'BLOCKED: Magic Hour API contract not inspected. Cost unknown.',
    },
    {
      gatewayId: 'magic-hour',
      capabilityTarget: 'voice-cloning',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 voice clone generation',
      availability: 'pending-discovery',
      catalogVersion: '0.1.0',
      effectiveFrom: 1753574400000,
      notes: 'BLOCKED: Magic Hour API contract not inspected. Cost unknown.',
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

export function getCatalogEntry(
  gatewayId: string,
  capabilityTarget: string,
  catalog: ProviderCostCatalog = CURRENT_PROVIDER_COST_CATALOG,
) {
  return catalog.entries.find(
    (e) => e.gatewayId === gatewayId && e.capabilityTarget === capabilityTarget,
  );
}
