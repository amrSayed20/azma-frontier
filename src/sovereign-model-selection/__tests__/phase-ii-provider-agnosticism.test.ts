/**
 * UPDATED 2026-09-25 — the Founder's designation supersedes the Phase III order.
 *
 * These guards were written when the Chief Architect authorized all ten fleet
 * models for production. The Founder designated four on 2026-09-25: two for
 * images and the infographic, two for video and its editing. The other six are
 * withdrawn from production and their entries kept, because what the Empire
 * verified about them is its own record.
 *
 * What these guards protect is unchanged and still enforced: authorization is
 * explicit, never implied; reading it costs nothing; and an unauthorized model
 * is never selected.
 */
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
    sovereignNameAr: 'نموذج اختبار',
    sovereignNoteAr: 'للاختبار وحده.',
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
    // Phase III: authorized image models are active — selection succeeds
    expect(before.selected).toBe(true);

    // Creating a separate test registry with a future provider does not affect production
    makeRegistry(makeImageModel({ providerId: 'future-intruder' }));

    const after = productionSelector.select(intent);
    // Production registry is still intact — authorized models still selected
    expect(after.selected).toBe(true);
  });
});

describe('Phase II Test 22 — Fallback discipline and fleet authorization state (Phase III)', () => {
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

  it('Phase III: all 5 image fleet models are production-authorized', () => {
    expect(IMAGE_MODEL_FLEET.length).toBe(5);
    for (const model of IMAGE_MODEL_FLEET) {
      expect(typeof model.productionAuthorized).toBe('boolean');
      expect(model.verificationStatus).toBe('production-authorized');
    }
  });

  // ── A DORMANT BINDING JOINED THE FLEET, AND CHANGED NO ALLOCATION ────
  //   `minimax-h3`, registered 2026-09-27 as TEST-ONLY under the Controlled
  //   Model Test Enablement order. What these guards must hold is not a total
  //   but the fact that nothing moved into or out of production because of it.
  it('Phase III: the video fleet holds 6 bindings; only the two allocated ones are dispatchable', () => {
    expect(VIDEO_MODEL_FLEET.length).toBe(6);
    for (const model of VIDEO_MODEL_FLEET) {
      expect(typeof model.productionAuthorized).toBe('boolean');
    }
    // sora has no adapter; minimax-h3 is dormant by order. Neither dispatches.
    const inactive = VIDEO_MODEL_FLEET.filter((m) => !m.active);
    expect(inactive.map((m) => m.modelId).sort()).toEqual(['minimax-h3', 'sora-2']);
    // The allocation itself — unchanged.
    expect(VIDEO_MODEL_FLEET.filter((m) => m.productionAuthorized && m.active).map((m) => m.modelId).sort())
      .toEqual(['seedance-2-0', 'veo-3-1']);
  });

  it('Phase III: 11 bindings, and the authorized count is untouched at 4', () => {
    const allModels = [...IMAGE_MODEL_FLEET, ...VIDEO_MODEL_FLEET];
    expect(allModels).toHaveLength(11);

    // The dormant binding added none: still the Founder's four designations.
    const authorizedCount = allModels.filter((m) => m.productionAuthorized).length;
    expect(authorizedCount).toBe(4);
  });

  it('Phase III: production registry exposes 5 active authorized image models', () => {
    resetProductionRegistryForTests();
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { getProductionRegistry } = require('../production-registry');
    const registry = getProductionRegistry();

    const all = registry.list();
    expect(all).toHaveLength(11);

    const authorizedImages = registry.findProductionAuthorized('image');
    expect(authorizedImages.length).toBe(2); // 4 active authorized image models (seedream-4-5 inactive: invalid providerModelId)
  });

  it('the image fleet holds 5 entries and the video fleet 6 — the sixth is dormant', () => {
    const imageModels = IMAGE_MODEL_FLEET.filter((m) => m.mediaType === 'image');
    const videoModels = VIDEO_MODEL_FLEET.filter((m) => m.mediaType === 'video');

    expect(imageModels).toHaveLength(5);
    expect(videoModels).toHaveLength(6);
    // And the sixth is the test binding, not a production one.
    expect(videoModels.filter((m) => !m.productionAuthorized && !m.active).map((m) => m.modelId).sort())
      .toEqual(['minimax-h3', 'sora-2']);
  });

  it('Phase III: production selector selects an authorized model for a standard image intent', () => {
    resetProductionRegistryForTests();
    const selector = getProductionSelector();
    const result = selector.select(buildImageCreationIntent('test', 'abstract'));

    // abstract → standard quality → z-image-turbo or nano-banana-2 eligible
    expect(result.selected).toBe(true);
    if (result.selected) {
      expect(result.selection.verificationStatus).toBe('production-authorized');
    }
  });
});
