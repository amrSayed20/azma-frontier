/**
 * AZMA OS — A required model is the model, or a refusal. Never a substitute.
 *
 * Sovereign Journey construction order §12 (2026-09-22): «No "Veo" button →
 * Seedance underneath. No "Seedance" button → generic provider default.»
 * The intent may name a model; the selector honours it alone or fails with
 * 'required-model-unavailable'. The infographic style is the first requirer:
 * it needs Nano Banana 2, the provider model verified to render text and
 * structure.
 */

import { SovereignModelRegistry } from '../sovereign-model-registry';
import { SovereignModelSelector } from '../sovereign-model-selector';
import { buildImageCreationIntent } from '../intent-builder';
import { IMAGE_MODEL_FLEET } from '../image-model-fleet';
import type { SovereignMediaModelDescriptor } from '../types';

function makeModel(overrides: Partial<SovereignMediaModelDescriptor>): SovereignMediaModelDescriptor {
  return {
    modelId: 'base', providerId: 'provider-a', gatewayId: 'gw-a', providerModelId: 'base-v1',
    displayName: 'Base', mediaType: 'image', capabilities: ['image-generation'],
    qualityTier: 'high', maxImageResolution: '1k', supportedAspectRatios: ['16:9'],
    characteristicHints: [], supportedStyleIds: [],
    costCatalogKey: { gatewayId: 'gw-a', capabilityTarget: 'image-generation' },
    verificationStatus: 'production-authorized', productionAuthorized: true, active: true,
    ...overrides,
  };
}
function registryOf(...models: SovereignMediaModelDescriptor[]): SovereignModelRegistry {
  const r = new SovereignModelRegistry();
  for (const m of models) r.register(m);
  return r;
}
const noCost = () => null;

describe('a required model is selected alone', () => {
  it('selects the required model even when a healthier, cheaper sibling exists', () => {
    const healthy = makeModel({ modelId: 'healthy-default', providerModelId: 'healthy-v1' });
    const required = makeModel({ modelId: 'nano-banana-2', providerModelId: 'nano-banana-2', qualityTier: 'standard' });
    const selector = new SovereignModelSelector(registryOf(healthy, required), noCost, () => 1.0);
    const result = selector.select({ ...buildImageCreationIntent('a chart', null), requiredModelId: 'nano-banana-2' });
    expect(result.selected).toBe(true);
    if (result.selected) {
      expect(result.selection.modelId).toBe('nano-banana-2');
      expect(result.selection.providerModelId).toBe('nano-banana-2');
    }
  });

  it('refuses — does not substitute — when the required model is inactive', () => {
    const active = makeModel({ modelId: 'other', providerModelId: 'other-v1' });
    const inactive = makeModel({ modelId: 'nano-banana-2', providerModelId: 'nano-banana-2', active: false });
    const selector = new SovereignModelSelector(registryOf(active, inactive), noCost);
    const result = selector.select({ ...buildImageCreationIntent('a chart', null), requiredModelId: 'nano-banana-2' });
    expect(result.selected).toBe(false);
    if (!result.selected) expect(result.reason).toBe('required-model-unavailable');
  });

  it('refuses when the required model does not exist at all', () => {
    const selector = new SovereignModelSelector(registryOf(makeModel({ modelId: 'only' })), noCost);
    const result = selector.select({ ...buildImageCreationIntent('x', null), requiredModelId: 'grok-imagine' });
    expect(result.selected).toBe(false);
    if (!result.selected) expect(result.reason).toBe('required-model-unavailable');
  });
});

describe('the infographic style requires Nano Banana 2', () => {
  it('the intent builder sets the requirement for infographic and for no other style', () => {
    expect(buildImageCreationIntent('sales by region', 'infographic').requiredModelId).toBe('nano-banana-2');
    for (const style of ['cinematic', 'realistic', 'advertising', 'abstract', null]) {
      expect(buildImageCreationIntent('x', style).requiredModelId).toBeUndefined();
    }
  });

  it('the production image fleet can satisfy it — nano-banana-2 is authorized, active, and names the verified provider id', () => {
    const nb2 = IMAGE_MODEL_FLEET.find((m) => m.modelId === 'nano-banana-2');
    expect(nb2).toBeDefined();
    expect(nb2!.productionAuthorized).toBe(true);
    expect(nb2!.active).toBe(true);
    expect(nb2!.providerModelId).toBe('nano-banana-2');
    expect(nb2!.supportedStyleIds).toContain('infographic');
    const registry = registryOf(...IMAGE_MODEL_FLEET);
    const result = new SovereignModelSelector(registry, noCost).select(buildImageCreationIntent('sales by region', 'infographic'));
    expect(result.selected).toBe(true);
    if (result.selected) expect(result.selection.providerModelId).toBe('nano-banana-2');
  });
});
