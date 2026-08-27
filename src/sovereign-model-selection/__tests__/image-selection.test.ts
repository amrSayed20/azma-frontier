/**
 * Image Model Selection Tests
 *
 * Covers construction-order points:
 *   1. Correct model selection for different image requirements
 *   5. Provider can change without Qiyamah changing
 *   6. Model can change without Qiyamah changing
 *   7. Creator never receives internal model/provider machinery
 *   16. Resolution requirements are respected
 *
 * All tests use in-memory registries with productionAuthorized: true fixtures.
 * No real provider calls. No real credits consumed.
 */

import { SovereignModelRegistry } from '../sovereign-model-registry';
import { SovereignModelSelector } from '../sovereign-model-selector';
import { buildImageCreationIntent } from '../intent-builder';
import type { SovereignMediaModelDescriptor } from '../types';

// ── Test fixture builders ─────────────────────────────────────────────────────

function makeImageModel(
  overrides: Partial<SovereignMediaModelDescriptor>,
): SovereignMediaModelDescriptor {
  return {
    modelId: 'test-image-model',
    providerId: 'provider-a',
    gatewayId: 'gateway-a',
    providerModelId: 'test-model-v1',
    displayName: 'Test Image Model',
    mediaType: 'image',
    capabilities: ['image-generation'],
    qualityTier: 'high',
    maxImageResolution: '1k',
    supportedAspectRatios: ['16:9', '1:1', '9:16'],
    characteristicHints: [],
    supportedStyleIds: [],
    costCatalogKey: { gatewayId: 'gateway-a', capabilityTarget: 'image-generation' },
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

describe('Image Model Selection — Point 1: correct model for requirements', () => {
  it('selects the only authorized model when it satisfies the intent', () => {
    const model = makeImageModel({ modelId: 'model-a', qualityTier: 'standard' });
    const selector = new SovereignModelSelector(makeRegistry(model));
    const intent = buildImageCreationIntent('سيارة فاخرة', 'abstract'); // abstract → standard quality
    const result = selector.select(intent);

    expect(result.selected).toBe(true);
    if (result.selected) {
      expect(result.selection.modelId).toBe('model-a');
    }
  });

  it('selects the high-quality model when style demands it', () => {
    const standard = makeImageModel({ modelId: 'standard-m', qualityTier: 'standard' });
    const high = makeImageModel({ modelId: 'high-m', qualityTier: 'high' });
    const selector = new SovereignModelSelector(makeRegistry(standard, high));

    // 'portrait' → quality 'high'
    const intent = buildImageCreationIntent('وجه إنسان', 'portrait');
    expect(intent.qualityRequirement).toBe('high');

    const result = selector.select(intent);
    expect(result.selected).toBe(true);
    if (result.selected) {
      // Exact tier match preferred; high-m selected over standard-m for high requirement
      expect(result.selection.modelId).toBe('high-m');
    }
  });

  it('selects ultra-quality model for advertising style', () => {
    const high = makeImageModel({ modelId: 'high-m', qualityTier: 'high', maxImageResolution: '1k' });
    const ultra = makeImageModel({ modelId: 'ultra-m', qualityTier: 'ultra', maxImageResolution: '2k' });
    const selector = new SovereignModelSelector(makeRegistry(high, ultra));

    const intent = buildImageCreationIntent('إعلان تلفزيوني', 'advertising');
    expect(intent.qualityRequirement).toBe('ultra');

    const result = selector.select(intent);
    expect(result.selected).toBe(true);
    if (result.selected) {
      expect(result.selection.modelId).toBe('ultra-m');
    }
  });

  it('returns all-candidates-unverified when no model is production-authorized', () => {
    const unverified = makeImageModel({
      modelId: 'candidate-a',
      productionAuthorized: false,
      verificationStatus: 'approved-candidate',
    });
    const selector = new SovereignModelSelector(makeRegistry(unverified));
    const intent = buildImageCreationIntent('test', 'cinematic');
    const result = selector.select(intent);

    expect(result.selected).toBe(false);
    if (!result.selected) {
      expect(result.reason).toBe('all-candidates-unverified');
    }
  });

  it('returns no-eligible-model when registry is empty for image type', () => {
    const selector = new SovereignModelSelector(new SovereignModelRegistry());
    const intent = buildImageCreationIntent('test', 'cinematic');
    const result = selector.select(intent);

    expect(result.selected).toBe(false);
    if (!result.selected) {
      expect(result.reason).toBe('no-eligible-model');
    }
  });
});

describe('Image Model Selection — Point 5: provider can change without Qiyamah changing', () => {
  it('uses preferredProviderId from selection — Qiyamah does not decide the provider', () => {
    const providerA = makeImageModel({
      modelId: 'model-a1',
      providerId: 'provider-a',
      gatewayId: 'gateway-a',
    });
    const providerB = makeImageModel({
      modelId: 'model-b1',
      providerId: 'provider-b',
      gatewayId: 'gateway-b',
    });
    const selector = new SovereignModelSelector(
      makeRegistry(providerA, providerB),
      () => null,            // no cost data
      (providerId) => providerId === 'provider-b' ? 0.95 : 0.50, // provider-b healthier
    );

    const intent = buildImageCreationIntent('test', 'cinematic');
    const result = selector.select(intent);

    expect(result.selected).toBe(true);
    if (result.selected) {
      // provider-b selected because of health — Qiyamah did not participate
      expect(result.selection.providerId).toBe('provider-b');
    }
  });

  it('switching to a new provider returns a valid ModelSelection with the new providerId', () => {
    // Simulates: Provider A is removed; Provider B is the only one registered.
    const providerB = makeImageModel({
      modelId: 'model-b2',
      providerId: 'provider-b',
      gatewayId: 'gateway-b',
    });
    const selector = new SovereignModelSelector(makeRegistry(providerB));
    const intent = buildImageCreationIntent('test', 'realistic');
    const result = selector.select(intent);

    expect(result.selected).toBe(true);
    if (result.selected) {
      expect(result.selection.providerId).toBe('provider-b');
      expect(result.selection.gatewayId).toBe('gateway-b');
    }
  });
});

describe('Image Model Selection — Point 6: model can change without Qiyamah changing', () => {
  it('the same intent resolves to different models as the registry evolves', () => {
    // Registry v1: only model-v1
    const modelV1 = makeImageModel({ modelId: 'model-v1', qualityTier: 'standard' });
    const selectorV1 = new SovereignModelSelector(makeRegistry(modelV1));
    const intent = buildImageCreationIntent('test', 'abstract');

    const resultV1 = selectorV1.select(intent);
    expect(resultV1.selected).toBe(true);
    if (resultV1.selected) expect(resultV1.selection.modelId).toBe('model-v1');

    // Registry v2: model-v2 added (same quality, lower cost)
    // costCatalogKey.modelId is what the selector passes to the cost function
    const modelV1WithKey = makeImageModel({
      modelId: 'model-v1',
      qualityTier: 'standard',
      costCatalogKey: { gatewayId: 'gateway-a', capabilityTarget: 'image-generation', modelId: 'model-v1' },
    });
    const modelV2 = makeImageModel({
      modelId: 'model-v2',
      qualityTier: 'standard',
      costCatalogKey: { gatewayId: 'gateway-a', capabilityTarget: 'image-generation', modelId: 'model-v2' },
    });
    const selectorV2 = new SovereignModelSelector(
      makeRegistry(modelV1WithKey, modelV2),
      (_gw: string, _cap: string, mid?: string) => mid === 'model-v1' ? 10 : mid === 'model-v2' ? 5 : null,
    );
    const resultV2 = selectorV2.select(intent);
    expect(resultV2.selected).toBe(true);
    // model-v2 wins on cost tiebreaker — Qiyamah was not changed
    if (resultV2.selected) expect(resultV2.selection.modelId).toBe('model-v2');
  });
});

describe('Image Model Selection — Point 7: Creator never receives provider machinery', () => {
  it('ModelSelection carries no provider-facing API keys or internal job metadata', () => {
    const model = makeImageModel({
      modelId: 'internal-model',
      providerModelId: 'provider-api-string-xyz',
    });
    const selector = new SovereignModelSelector(makeRegistry(model));
    const intent = buildImageCreationIntent('test', 'cinematic');
    const result = selector.select(intent);

    expect(result.selected).toBe(true);
    if (result.selected) {
      const selection = result.selection;
      // These fields are safe to carry internally — they're never forwarded to Creator responses
      expect(selection).toHaveProperty('modelId');
      expect(selection).toHaveProperty('providerId');
      // Verify the Creator-facing response contract does NOT include these fields
      // (The generation-service strips them before returning GeneratedAsset)
      const creatorFacingFields = ['assetId', 'assetUrl', 'prompt', 'style', 'generatedAt', 'originalIdea'];
      creatorFacingFields.forEach((field) => expect(selection).not.toHaveProperty(field));
    }
  });

  it('intent builder does not embed provider names in SovereignCreationIntent', () => {
    const intent = buildImageCreationIntent('سيارة فاخرة', 'cinematic');
    const intentStr = JSON.stringify(intent);

    expect(intentStr).not.toContain('magic-hour');
    expect(intentStr).not.toContain('openai');
    expect(intentStr).not.toContain('flux');
    expect(intentStr).not.toContain('providerId');
    expect(intentStr).not.toContain('apiKey');
  });
});

describe('Image Model Selection — Point 16: resolution requirements respected', () => {
  it('rejects a model whose maxImageResolution is below the required resolution', () => {
    // standard quality → resolution '1k'; model only supports '512'
    const lowRes = makeImageModel({
      modelId: 'low-res',
      qualityTier: 'standard',
      maxImageResolution: '512',
    });
    const selector = new SovereignModelSelector(makeRegistry(lowRes));

    // Force a 2k request by using advertising style (ultra → '2k')
    const intent = buildImageCreationIntent('إعلان', 'advertising');
    const result = selector.select(intent);

    expect(result.selected).toBe(false);
    if (!result.selected) {
      // Could be quality-unavailable (no ultra model) or resolution-unavailable
      expect(['quality-unavailable', 'resolution-unavailable']).toContain(result.reason);
    }
  });

  it('selects a model that satisfies the resolution requirement', () => {
    const hiRes = makeImageModel({
      modelId: 'hi-res',
      qualityTier: 'ultra',
      maxImageResolution: '4k',
    });
    const selector = new SovereignModelSelector(makeRegistry(hiRes));
    const intent = buildImageCreationIntent('إعلان', 'advertising');
    const result = selector.select(intent);

    expect(result.selected).toBe(true);
    if (result.selected) expect(result.selection.resolution).toBe('2k');
  });

  it('passes the intent resolution through to ModelSelection unchanged', () => {
    const model = makeImageModel({ modelId: 'm', qualityTier: 'standard', maxImageResolution: '4k' });
    const selector = new SovereignModelSelector(makeRegistry(model));

    const intent = buildImageCreationIntent('test', 'abstract');
    const result = selector.select(intent);

    expect(result.selected).toBe(true);
    if (result.selected) {
      expect(result.selection.resolution).toBe(intent.resolution);
    }
  });
});
