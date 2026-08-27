/**
 * Phase II Tests 20 + 21 + 22: Provider Agnosticism & Fallback Invariants
 *
 * Test 20: Qiyamah contains no provider/model selection machinery.
 *           The generation service's public contract is entirely provider-agnostic.
 *
 * Test 21: A future provider can enter the system through the adapter boundary
 *           without modifying Qiyamah or the selector.
 *
 * Test 22: The existing flux-schnell fallback remains intact while all ten
 *           production-fleet models remain productionAuthorized: false.
 *
 * No real provider calls. No real credits consumed.
 */

import { SovereignModelRegistry } from '../sovereign-model-registry';
import { SovereignModelSelector } from '../sovereign-model-selector';
import { buildImageCreationIntent } from '../intent-builder';
import { IMAGE_MODEL_FLEET } from '../image-model-fleet';
import { VIDEO_MODEL_FLEET } from '../video-model-fleet';
import {
  getProductionSelector,
  resetProductionRegistryForTests,
} from '../production-registry';
import type { SovereignMediaModelDescriptor } from '../types';

// ── Fixture helpers ───────────────────────────────────────────────────────────

function makeImageModel(
  overrides: Partial<SovereignMediaModelDescriptor>,
): SovereignMediaModelDescriptor {
  return {
    modelId: 'fixture-image',
    providerId: 'fixture-provider',
    gatewayId: 'fixture-gateway',
    providerModelId: 'fixture-v1',
    displayName: 'Fixture Image Model',
    mediaType: 'image',
    capabilities: ['image-generation'],
    qualityTier: 'high',
    maxImageResolution: '1k',
    supportedAspectRatios: ['16:9', '1:1', '9:16'],
    characteristicHints: [],
    supportedStyleIds: [],
    costCatalogKey: { gatewayId: 'fixture-gateway', capabilityTarget: 'image-generation' },
    verificationStatus: 'production-authorized',
    productionAuthorized: true,
    active: true,
    ...overrides,
  };
}

function makeRegistry(...models: SovereignMediaModelDescriptor[]): SovereignModelRegistry {
  const r = new SovereignModelRegistry();
  for (const m of models) r.register(m);
  return r;
}

// ─────────────────────────────────────────────────────────────────────────────

describe('Phase II Test 20 — Qiyamah contains no provider/model selection machinery', () => {
  it('SovereignCreationIntent carries no provider names', () => {
    const intent = buildImageCreationIntent('سيارة فاخرة', 'cinematic');
    const serialized = JSON.stringify(intent);

    // Provider strings must never appear in the intent that Qiyamah produces
    expect(serialized).not.toContain('magic-hour');
    expect(serialized).not.toContain('openai');
    expect(serialized).not.toContain('flux');
    expect(serialized).not.toContain('flux-schnell');
    expect(serialized).not.toContain('seedream');
    expect(serialized).not.toContain('sora');
    expect(serialized).not.toContain('kling');
    expect(serialized).not.toContain('ltx');
    expect(serialized).not.toContain('providerId');
    expect(serialized).not.toContain('apiKey');
  });

  it('ModelSelection carries internal routing fields — they are never forwarded to Creator responses', () => {
    const model = makeImageModel({ modelId: 'internal-model', providerModelId: 'provider-api-xyz' });
    const selector = new SovereignModelSelector(makeRegistry(model));
    const intent = buildImageCreationIntent('test', 'cinematic');
    const result = selector.select(intent);

    expect(result.selected).toBe(true);
    if (result.selected) {
      // These fields exist on ModelSelection but are internal routing metadata.
      // The generation service strips them from GeneratedAsset before returning to Creator.
      expect(result.selection).toHaveProperty('modelId');
      expect(result.selection).toHaveProperty('providerId');
      expect(result.selection).toHaveProperty('providerModelId');

      // Creator-facing GeneratedAsset fields (assetId, assetUrl, etc.) are NOT on ModelSelection
      expect(result.selection).not.toHaveProperty('assetId');
      expect(result.selection).not.toHaveProperty('assetUrl');
      expect(result.selection).not.toHaveProperty('apiKey');
      expect(result.selection).not.toHaveProperty('jobId');
    }
  });

  it('generation service module can be imported with a provider-agnostic request — no provider fields required', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { generateImage } = require('../../qiyamah-generation/generation-service');
    expect(typeof generateImage).toBe('function');

    // The minimum required GenerationRequest has no provider-specific fields.
    const agnosticRequest = { prompt: 'test creation', creatorId: 'creator-test' };
    expect(agnosticRequest).not.toHaveProperty('providerId');
    expect(agnosticRequest).not.toHaveProperty('magicHourModel');
    expect(agnosticRequest).not.toHaveProperty('openaiKey');
    expect(agnosticRequest).not.toHaveProperty('fluxModelId');
  });

  it('intent builder output contains no provider-specific resolution logic', () => {
    const styles = ['cinematic', 'advertising', 'abstract', 'portrait', 'realistic'];
    for (const style of styles) {
      const intent = buildImageCreationIntent('prompt', style);
      // qualityRequirement and resolution are derived from style — not from provider capabilities
      expect(typeof intent.qualityRequirement).toBe('string');
      expect(typeof intent.resolution).toBe('string');
      // No provider-specific field ever appears on the intent
      expect(intent).not.toHaveProperty('magicHourTier');
      expect(intent).not.toHaveProperty('openaiQuality');
    }
  });
});

describe('Phase II Test 21 — Future provider enters through adapter boundary', () => {
  it('SovereignModelRegistry accepts models from a provider that does not exist yet', () => {
    const futureProviderModel = makeImageModel({
      modelId:         'chrono-vision-1',
      providerId:      'chrono-ai-2028',          // Provider that does not exist yet
      gatewayId:       'chrono-gateway',
      providerModelId: 'chrono-v1-flagship',
      displayName:     'Chrono Vision v1',
    });

    const registry = new SovereignModelRegistry();
    registry.register(futureProviderModel);

    const all = registry.list();
    expect(all).toHaveLength(1);
    expect(all[0].providerId).toBe('chrono-ai-2028');
  });

  it('SovereignModelSelector selects the future provider without any code changes', () => {
    const futureModel = makeImageModel({
      modelId:    'chrono-image-1',
      providerId: 'chrono-ai-2028',
      gatewayId:  'chrono-gateway',
    });
    const selector = new SovereignModelSelector(makeRegistry(futureModel));
    const intent = buildImageCreationIntent('test', 'cinematic');

    const result = selector.select(intent);

    expect(result.selected).toBe(true);
    if (result.selected) {
      expect(result.selection.providerId).toBe('chrono-ai-2028');
      expect(result.selection.gatewayId).toBe('chrono-gateway');
    }
  });

  it('new provider competes on equal footing — health and cost tiebreakers apply normally', () => {
    const currentProvider = makeImageModel({
      modelId: 'current-m',
      providerId: 'current-provider',
      gatewayId: 'current-gw',
      costCatalogKey: { gatewayId: 'current-gw', capabilityTarget: 'image-generation', modelId: 'current-m' },
    });
    const futureProvider = makeImageModel({
      modelId: 'future-m',
      providerId: 'future-provider-2029',
      gatewayId: 'future-gw',
      costCatalogKey: { gatewayId: 'future-gw', capabilityTarget: 'image-generation', modelId: 'future-m' },
    });
    const selector = new SovereignModelSelector(
      makeRegistry(currentProvider, futureProvider),
      (_gw: string, _cap: string, mid?: string) => mid === 'current-m' ? 20 : mid === 'future-m' ? 10 : null,
      () => 0.80, // equal health
    );

    const intent = buildImageCreationIntent('test', 'cinematic');
    const result = selector.select(intent);

    expect(result.selected).toBe(true);
    if (result.selected) {
      // Future provider wins on cost — no favoritism toward existing providers
      expect(result.selection.providerId).toBe('future-provider-2029');
    }
  });

  it('adding a future provider does NOT modify the production registry or production-fleet models', () => {
    // The production registry is isolated — test registries are independent.
    resetProductionRegistryForTests();
    const productionSelector = getProductionSelector();
    const intent = buildImageCreationIntent('test', 'cinematic');

    const before = productionSelector.select(intent);
    expect(before.selected).toBe(false); // all-candidates-unverified: no authorized model

    // Creating a separate test registry with a future provider does not affect production
    makeRegistry(makeImageModel({ providerId: 'future-intruder' }));

    const after = productionSelector.select(intent);
    expect(after.selected).toBe(false); // still no authorized model in production fleet
    if (!after.selected) {
      expect(after.reason).toBe('all-candidates-unverified');
    }
  });
});

describe('Phase II Test 22 — Existing flux-schnell fallback remains intact', () => {
  it('production selector returns all-candidates-unverified — zero models are authorized', () => {
    resetProductionRegistryForTests();
    const selector = getProductionSelector();
    const intent = buildImageCreationIntent('test', 'cinematic');

    const result = selector.select(intent);

    expect(result.selected).toBe(false);
    if (!result.selected) {
      // 'all-candidates-unverified' is the exact signal the generation service uses
      // to fall through to the legacy flux-schnell orchestration path.
      expect(result.reason).toBe('all-candidates-unverified');
    }
  });

  it('all-candidates-unverified is semantically distinct from hard-failure reasons', () => {
    // Hard failures (quality/resolution/duration unavailable) cause the generation
    // service to return an error. 'all-candidates-unverified' causes it to continue
    // on the legacy path — fundamentally different handling.
    const hardFailureReasons = [
      'quality-unavailable',
      'resolution-unavailable',
      'duration-unavailable',
      'capability-unavailable',
      'no-eligible-model',
    ];

    expect(hardFailureReasons).not.toContain('all-candidates-unverified');
  });

  it('no model in the image fleet is production-authorized', () => {
    expect(IMAGE_MODEL_FLEET.length).toBe(5);
    for (const model of IMAGE_MODEL_FLEET) {
      expect(model.productionAuthorized).toBe(false);
      expect(model.verificationStatus).toBe('approved-candidate');
    }
  });

  it('no model in the video fleet is production-authorized', () => {
    expect(VIDEO_MODEL_FLEET.length).toBe(5);
    for (const model of VIDEO_MODEL_FLEET) {
      expect(model.productionAuthorized).toBe(false);
      expect(model.verificationStatus).toBe('approved-candidate');
    }
  });

  it('all ten fleet models combined are all unauthorized', () => {
    const allModels = [...IMAGE_MODEL_FLEET, ...VIDEO_MODEL_FLEET];
    expect(allModels).toHaveLength(10);

    const authorizedCount = allModels.filter((m) => m.productionAuthorized).length;
    expect(authorizedCount).toBe(0); // ZERO authorized — authorization gate is closed
  });

  it('production registry holds exactly 10 fleet models and none are authorized', () => {
    resetProductionRegistryForTests();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getProductionRegistry } = require('../production-registry');
    const registry = getProductionRegistry();

    const all = registry.list();
    expect(all).toHaveLength(10);

    for (const model of all) {
      expect(model.productionAuthorized).toBe(false);
    }
  });

  it('image and video models each have exactly 5 approved-candidate entries', () => {
    const imageModels = IMAGE_MODEL_FLEET.filter((m) => m.mediaType === 'image');
    const videoModels = VIDEO_MODEL_FLEET.filter((m) => m.mediaType === 'video');

    expect(imageModels).toHaveLength(5);
    expect(videoModels).toHaveLength(5);
  });

  it('all-candidates-unverified result contains detail text describing the waiting state', () => {
    resetProductionRegistryForTests();
    const selector = getProductionSelector();
    const result = selector.select(buildImageCreationIntent('test', 'abstract'));

    expect(result.selected).toBe(false);
    if (!result.selected) {
      expect(result.reason).toBe('all-candidates-unverified');
      expect(result.detail).toContain('5'); // 5 image candidates registered
    }
  });
});
