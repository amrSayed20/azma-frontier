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
    productionAuthorized: true,
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
    productionAuthorized: true,
    active: true,
    internalNotes:
      'Production authorized by Chief Architect 2026-08-27 (Phase III). ' +
      'All capability data requires real-world verification.',
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
    providerModelId: 'seedream-v4.5',            // VERIFIED: Magic Hour platform model list 2026-08-27
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
    verificationStatus: 'production-authorized',
    productionAuthorized: true,
    active: true,
    internalNotes:
      'Production authorized by Chief Architect 2026-08-27 (Phase III). ' +
      'All capability data requires real-world verification. ' +
      'providerModelId verified as "seedream-v4.5" per Magic Hour platform model list 2026-08-27.',
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
    verificationStatus: 'production-authorized',
    productionAuthorized: true,
    active: true,
    internalNotes:
      'Production authorized by Chief Architect 2026-08-27 (Phase III). ' +
      'All capability data requires real-world verification.',
  },
];
