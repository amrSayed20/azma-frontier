/**
 * Selection Invariants Tests
 *
 * Covers construction-order points:
 *   3. Quality requirement cannot be downgraded for cost
 *   4. Cheaper equivalent model wins when capability is equivalent
 *   11. One request produces one generation by default
 *   12. Platform adaptation prefers reuse of the master when viable
 *   13. Regeneration requires a distinct approved paid execution
 *   14. Unknown/unverified model capability cannot be silently assumed
 *
 * No real provider calls. No real credits consumed.
 */

import { SovereignModelRegistry } from '../sovereign-model-registry';
import { SovereignModelSelector } from '../sovereign-model-selector';
import { buildImageCreationIntent } from '../intent-builder';
import { assessMasterAdaptability } from '../platform-adapter';
import type { SovereignMediaModelDescriptor } from '../types';

// ── Test fixture builders ─────────────────────────────────────────────────────

function makeModel(overrides: Partial<SovereignMediaModelDescriptor>): SovereignMediaModelDescriptor {
  return {
    modelId: 'base-model',
    providerId: 'provider-a',
    gatewayId: 'gateway-a',
    providerModelId: 'base-v1',
    displayName: 'Base Model',
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

describe('Point 3: Quality requirement cannot be downgraded for cost', () => {
  it('does NOT select a standard model when intent requires ultra — even if it is cheaper', () => {
    const expensiveUltra = makeModel({
      modelId: 'expensive-ultra',
      qualityTier: 'ultra',
      maxImageResolution: '2k',
    });
    const cheapStandard = makeModel({
      modelId: 'cheap-standard',
      qualityTier: 'standard',
    });
    const selector = new SovereignModelSelector(
      makeRegistry(expensiveUltra, cheapStandard),
      // cheap-standard costs 1, expensive-ultra costs 100
      (_gw: string, _cap: string, mid?: string) => mid === 'cheap-standard' ? 1 : 100,
    );

    const intent = buildImageCreationIntent('إعلان تلفزيوني', 'advertising');
    expect(intent.qualityRequirement).toBe('ultra');

    const result = selector.select(intent);
    expect(result.selected).toBe(true);
    if (result.selected) {
      expect(result.selection.modelId).toBe('expensive-ultra');
      expect(result.selection.modelId).not.toBe('cheap-standard');
    }
  });

  it('does NOT downgrade from high to standard when high is the minimum', () => {
    const highModel = makeModel({ modelId: 'high-m', qualityTier: 'high' });
    const cheapStd = makeModel({ modelId: 'cheap-std', qualityTier: 'standard' });
    const selector = new SovereignModelSelector(
      makeRegistry(highModel, cheapStd),
      (_gw: string, _cap: string, mid?: string) => mid === 'cheap-std' ? 1 : 50,
    );

    // portrait → quality 'high'
    const intent = buildImageCreationIntent('وجه', 'portrait');
    expect(intent.qualityRequirement).toBe('high');

    const result = selector.select(intent);
    expect(result.selected).toBe(true);
    if (result.selected) {
      expect(result.selection.modelId).toBe('high-m');
    }
  });

  it('returns quality-unavailable rather than silently downgrading', () => {
    // Only a standard model available, but intent requires ultra
    const stdOnly = makeModel({ modelId: 'std-only', qualityTier: 'standard' });
    const selector = new SovereignModelSelector(makeRegistry(stdOnly));
    const intent = buildImageCreationIntent('إعلان', 'advertising');

    const result = selector.select(intent);
    expect(result.selected).toBe(false);
    if (!result.selected) expect(result.reason).toBe('quality-unavailable');
  });
});

describe('Point 4: Cheaper equivalent model wins when capability is equivalent', () => {
  it('selects the cheaper model when both have equal quality and health', () => {
    // costCatalogKey.modelId is what the selector passes to the cost function (not model.modelId)
    const expensive = makeModel({
      modelId: 'expensive-m',
      qualityTier: 'standard',
      costCatalogKey: { gatewayId: 'gw-a', capabilityTarget: 'image-generation', modelId: 'expensive-m' },
    });
    const cheap = makeModel({
      modelId: 'cheap-m',
      qualityTier: 'standard',
      costCatalogKey: { gatewayId: 'gw-a', capabilityTarget: 'image-generation', modelId: 'cheap-m' },
    });
    const selector = new SovereignModelSelector(
      makeRegistry(expensive, cheap),
      (_gw: string, _cap: string, mid?: string) => mid === 'expensive-m' ? 50 : mid === 'cheap-m' ? 10 : null,
      // Equal health: both 0.80
      () => 0.80,
    );

    const intent = buildImageCreationIntent('test', 'abstract'); // abstract → standard quality
    const result = selector.select(intent);

    expect(result.selected).toBe(true);
    if (result.selected) expect(result.selection.modelId).toBe('cheap-m');
  });

  it('does NOT use cost to downgrade — only tiebreaks within same quality tier', () => {
    const highCheap = makeModel({ modelId: 'high-cheap', qualityTier: 'high' });
    const standardExpensive = makeModel({ modelId: 'std-expensive', qualityTier: 'standard' });
    const selector = new SovereignModelSelector(
      makeRegistry(highCheap, standardExpensive),
      (_gw: string, _cap: string, mid?: string) => mid === 'high-cheap' ? 100 : 5,
      () => 0.80,
    );

    // portrait → quality 'high' required
    const intent = buildImageCreationIntent('test', 'portrait');
    const result = selector.select(intent);

    expect(result.selected).toBe(true);
    if (result.selected) {
      // high-cheap wins — quality requirement must be met first; cost only breaks ties within tier
      expect(result.selection.modelId).toBe('high-cheap');
    }
  });

  it('prefers exact tier match over over-quality — avoids paying for unused quality', () => {
    // standard required; both standard-m and ultra-m are available at same cost
    const stdModel = makeModel({ modelId: 'std-exact', qualityTier: 'standard' });
    const ultraModel = makeModel({ modelId: 'ultra-overkill', qualityTier: 'ultra', maxImageResolution: '2k' });
    const selector = new SovereignModelSelector(
      makeRegistry(stdModel, ultraModel),
      () => 20, // same cost for both
      () => 0.80,
    );

    const intent = buildImageCreationIntent('test', 'abstract'); // abstract → standard quality
    expect(intent.qualityRequirement).toBe('standard');

    const result = selector.select(intent);
    expect(result.selected).toBe(true);
    if (result.selected) {
      // Exact tier match preferred → std-exact selected, not ultra-overkill
      expect(result.selection.modelId).toBe('std-exact');
    }
  });
});

describe('Point 11: One request produces one generation', () => {
  it('SovereignModelSelector.select() returns exactly one ModelSelection per call', () => {
    const model = makeModel({ modelId: 'singleton-m' });
    const selector = new SovereignModelSelector(makeRegistry(model));
    const intent = buildImageCreationIntent('test', 'cinematic');

    const result = selector.select(intent);
    expect(result.selected).toBe(true);
    if (result.selected) {
      // Result is a single ModelSelection object, not an array of alternatives
      expect(Array.isArray(result.selection)).toBe(false);
      expect(typeof result.selection).toBe('object');
      expect(typeof result.selection.modelId).toBe('string');
    }
  });

  it('returns one selection even when many models are eligible', () => {
    const models = Array.from({ length: 10 }, (_, i) =>
      makeModel({ modelId: `model-${i}` }), // default qualityTier: 'high'
    );
    const selector = new SovereignModelSelector(makeRegistry(...models));
    const intent = buildImageCreationIntent('test', 'cinematic'); // cinematic → high
    const result = selector.select(intent);

    expect(result.selected).toBe(true);
    if (result.selected) {
      // Exactly ONE model selected
      expect(typeof result.selection.modelId).toBe('string');
      expect((result as { alternatives?: unknown }).alternatives).toBeUndefined();
    }
  });
});

describe('Point 12: Platform adaptation prefers reuse of the master', () => {
  it('returns direct-reuse when aspect ratios match', () => {
    expect(assessMasterAdaptability('16:9', '16:9')).toBe('direct-reuse');
    expect(assessMasterAdaptability('1:1', '1:1')).toBe('direct-reuse');
    expect(assessMasterAdaptability('9:16', '9:16')).toBe('direct-reuse');
  });

  it('returns crop-adapt when both ratios share the same landscape/portrait orientation', () => {
    // 16:9 → 4:3 — both landscape; can crop
    expect(assessMasterAdaptability('16:9', '4:3')).toBe('crop-adapt');
  });

  it('returns regenerate-required when orientation differs', () => {
    // 16:9 (landscape) → 9:16 (portrait): cannot crop to fit
    expect(assessMasterAdaptability('16:9', '9:16')).toBe('regenerate-required');
    expect(assessMasterAdaptability('9:16', '16:9')).toBe('regenerate-required');
  });
});

describe('Point 13: Regeneration requires a distinct approved paid execution', () => {
  it('regenerate-required from assessMasterAdaptability does NOT auto-trigger generation', () => {
    // assessMasterAdaptability only returns a classification — it does not call any provider.
    // The responsibility to launch a new generation (and obtain Creator approval for paid executions)
    // lies entirely in the calling layer. This test proves the boundary is clean.
    const adaptability = assessMasterAdaptability('16:9', '9:16');
    expect(adaptability).toBe('regenerate-required');
    // The function returns a string constant — no side effects, no network calls, no promises.
    expect(typeof adaptability).toBe('string');
  });

  it('the selector itself does not re-invoke generation on failure — it returns a failure result', () => {
    // Proving selection failure is always a clean return, not a retry loop.
    const selector = new SovereignModelSelector(new SovereignModelRegistry());
    const intent = buildImageCreationIntent('test', 'cinematic');
    const result = selector.select(intent);

    expect(result.selected).toBe(false);
    // The result is a synchronous value — no retries, no alternative-generation side-effects.
    expect(typeof result).toBe('object');
  });
});

describe('Point 14: Unknown/unverified model capability cannot be silently assumed', () => {
  it('inactive models are excluded from selection even if production-authorized', () => {
    const inactive = makeModel({
      modelId: 'inactive-m',
      active: false,
      productionAuthorized: true,
    });
    const selector = new SovereignModelSelector(makeRegistry(inactive));
    const intent = buildImageCreationIntent('test', 'cinematic');
    const result = selector.select(intent);

    // active: false means registry does not expose it via findProductionAuthorized
    expect(result.selected).toBe(false);
  });

  it('approved-candidate models (not production-authorized) never power a real selection', () => {
    const candidate = makeModel({
      modelId: 'candidate-m',
      verificationStatus: 'approved-candidate',
      productionAuthorized: false,
    });
    const selector = new SovereignModelSelector(makeRegistry(candidate));
    const intent = buildImageCreationIntent('test', 'cinematic');
    const result = selector.select(intent);

    expect(result.selected).toBe(false);
    if (!result.selected) expect(result.reason).toBe('all-candidates-unverified');
  });

  it('verified-but-not-production-authorized models cannot be selected', () => {
    const verified = makeModel({
      modelId: 'verified-not-auth',
      verificationStatus: 'verified',
      productionAuthorized: false,
    });
    const selector = new SovereignModelSelector(makeRegistry(verified));
    const intent = buildImageCreationIntent('test', 'cinematic');
    const result = selector.select(intent);

    expect(result.selected).toBe(false);
    if (!result.selected) expect(result.reason).toBe('all-candidates-unverified');
  });

  it('all 10 fleet models are approved-candidate (not production-authorized) by default', () => {
    const { getProductionRegistry } = require('../production-registry');
    const { resetProductionRegistryForTests } = require('../production-registry');
    resetProductionRegistryForTests();
    const registry = getProductionRegistry();

    const allModels = registry.list();
    expect(allModels.length).toBe(10);
    for (const model of allModels) {
      expect(model.productionAuthorized).toBe(false);
      expect(model.verificationStatus).toBe('approved-candidate');
    }
  });
});
