import { MAGIC_HOUR_IMAGE_PROVIDER_ID } from '../core/sovereign-ai-integration/adapters/magic-hour-adapter';
import type { SovereignMediaModelDescriptor } from './types';

/**
 * Chief Architect-approved image model candidates.
 * Authorization date: 2026-08-27.
 *
 * ALL entries carry verificationStatus: 'approved-candidate' and
 * productionAuthorized: false. No model in this fleet dispatches a real
 * provider call or consumes provider credits until:
 *   1. Capability data is verified against the actual Magic Hour API.
 *   2. The Chief Architect explicitly sets productionAuthorized: true.
 *
 * providerModelId: assumed to match the Chief Architect's approved name as
 * the Magic Hour API model string. REQUIRES_VERIFICATION for every entry.
 *
 * qualityTier / maxImageResolution: conservative placeholder values.
 * REQUIRES_VERIFICATION for every entry before production authorization.
 */
export const IMAGE_MODEL_FLEET: readonly SovereignMediaModelDescriptor[] = [
  {
    modelId: 'z-image-turbo',
    providerId: MAGIC_HOUR_IMAGE_PROVIDER_ID,
    gatewayId: 'magic-hour',
    providerModelId: 'z-image-turbo',          // REQUIRES_VERIFICATION
    displayName: 'Z-Image Turbo',
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
    verificationStatus: 'approved-candidate',
    productionAuthorized: false,
    active: true,
    internalNotes:
      'Approved candidate 2026-08-27. providerModelId, qualityTier, maxImageResolution, ' +
      'and supportedAspectRatios all require verification against the Magic Hour API.',
  },
  {
    modelId: 'seedream-4',
    providerId: MAGIC_HOUR_IMAGE_PROVIDER_ID,
    gatewayId: 'magic-hour',
    providerModelId: 'seedream-4',              // REQUIRES_VERIFICATION
    displayName: 'Seedream 4',
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
    verificationStatus: 'approved-candidate',
    productionAuthorized: false,
    active: true,
    internalNotes:
      'Approved candidate 2026-08-27. All capability data requires verification.',
  },
  {
    modelId: 'nano-banana-2',
    providerId: MAGIC_HOUR_IMAGE_PROVIDER_ID,
    gatewayId: 'magic-hour',
    providerModelId: 'nano-banana-2',           // REQUIRES_VERIFICATION
    displayName: 'Nano Banana 2',
    mediaType: 'image',
    capabilities: ['image-generation'],
    qualityTier: 'standard',                    // REQUIRES_VERIFICATION
    maxImageResolution: '1k',                   // REQUIRES_VERIFICATION
    supportedAspectRatios: ['16:9', '1:1', '9:16'],  // REQUIRES_VERIFICATION
    characteristicHints: [],
    supportedStyleIds: [],
    costCatalogKey: {
      gatewayId: 'magic-hour',
      capabilityTarget: 'image-generation',
      modelId: 'nano-banana-2',
    },
    verificationStatus: 'approved-candidate',
    productionAuthorized: false,
    active: true,
    internalNotes:
      'Approved candidate 2026-08-27. All capability data requires verification.',
  },
  {
    // AZMA internal ID uses hyphen; providerModelId may use dot notation.
    modelId: 'seedream-4-5',
    providerId: MAGIC_HOUR_IMAGE_PROVIDER_ID,
    gatewayId: 'magic-hour',
    providerModelId: 'seedream-4.5',            // REQUIRES_VERIFICATION
    displayName: 'Seedream 4.5',
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
    verificationStatus: 'approved-candidate',
    productionAuthorized: false,
    active: true,
    internalNotes:
      'Approved candidate 2026-08-27. All capability data requires verification. ' +
      'providerModelId may be "seedream-4.5" or differ — confirm with Magic Hour API.',
  },
  {
    modelId: 'nano-banana-pro',
    providerId: MAGIC_HOUR_IMAGE_PROVIDER_ID,
    gatewayId: 'magic-hour',
    providerModelId: 'nano-banana-pro',         // REQUIRES_VERIFICATION
    displayName: 'Nano Banana Pro',
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
    verificationStatus: 'approved-candidate',
    productionAuthorized: false,
    active: true,
    internalNotes:
      'Approved candidate 2026-08-27. All capability data requires verification.',
  },
];
