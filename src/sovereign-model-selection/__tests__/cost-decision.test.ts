/**
 * Cost Decision Tests
 *
 * Covers construction-order points:
 *   3. Quality requirement cannot be downgraded for cost
 *   4. Cheaper equivalent model wins when capability is equivalent
 *   8. Paid generation cannot execute before cost approval
 *
 * No real provider calls. No real credits consumed.
 */

import { SovereignModelRegistry } from '../sovereign-model-registry';
import { SovereignModelSelector } from '../sovereign-model-selector';
import { buildImageCreationIntent } from '../intent-builder';
import type { CostLookupFn } from '../sovereign-model-selector';
import type { SovereignMediaModelDescriptor } from '../types';

// ── Test fixture builders ─────────────────────────────────────────────────────

function makeModel(overrides: Partial<SovereignMediaModelDescriptor>): SovereignMediaModelDescriptor {
  return {
    modelId: 'base',
    providerId: 'provider-a',
    gatewayId: 'gw-a',
    providerModelId: 'base-v1',
    displayName: 'Base',
    mediaType: 'image',
    capabilities: ['image-generation'],
    qualityTier: 'high',
    maxImageResolution: '1k',
    supportedAspectRatios: ['16:9'],
    characteristicHints: [],
    supportedStyleIds: [],
    costCatalogKey: { gatewayId: 'gw-a', capabilityTarget: 'image-generation' },
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

describe('Point 3+4: Cost decision invariants', () => {
  it('cost is only a tiebreaker — quality gate runs first', () => {
    const ultraExpensive = makeModel({
      modelId: 'ultra-expensive',
      qualityTier: 'ultra',
      maxImageResolution: '2k',
    });
    const standardCheap = makeModel({
      modelId: 'standard-cheap',
      qualityTier: 'standard',
    });

    const costFn: CostLookupFn = (_gw: string, _cap: string, mid?: string) => {
      if (mid === 'ultra-expensive') return 1000;
      if (mid === 'standard-cheap') return 1;
      return null;
    };

    const selector = new SovereignModelSelector(makeRegistry(ultraExpensive, standardCheap), costFn);
    const intent = buildImageCreationIntent('إعلان', 'advertising');
    expect(intent.qualityRequirement).toBe('ultra');

    const result = selector.select(intent);
    expect(result.selected).toBe(true);
    if (result.selected) {
      // Quality gate must pass first — ultra-expensive is the ONLY eligible model
      expect(result.selection.modelId).toBe('ultra-expensive');
      expect(result.selection.modelId).not.toBe('standard-cheap');
    }
  });

  it('selects cheapest within quality tier when health is tied', () => {
    // costCatalogKey.modelId is what the selector passes to the cost function (not model.modelId)
    const tier1 = makeModel({
      modelId: 'tier-std-1',
      qualityTier: 'standard',
      costCatalogKey: { gatewayId: 'gw-a', capabilityTarget: 'image-generation', modelId: 'tier-std-1' },
    });
    const tier2 = makeModel({
      modelId: 'tier-std-2',
      qualityTier: 'standard',
      costCatalogKey: { gatewayId: 'gw-a', capabilityTarget: 'image-generation', modelId: 'tier-std-2' },
    });
    const tier3 = makeModel({
      modelId: 'tier-std-3',
      qualityTier: 'standard',
      costCatalogKey: { gatewayId: 'gw-a', capabilityTarget: 'image-generation', modelId: 'tier-std-3' },
    });

    const costFn: CostLookupFn = (_gw: string, _cap: string, mid?: string) => {
      if (mid === 'tier-std-1') return 30;
      if (mid === 'tier-std-2') return 10;  // cheapest
      if (mid === 'tier-std-3') return 20;
      return null;
    };

    const selector = new SovereignModelSelector(
      makeRegistry(tier1, tier2, tier3),
      costFn,
      () => 0.80, // equal health
    );
    const intent = buildImageCreationIntent('test', 'abstract'); // abstract → standard quality
    const result = selector.select(intent);

    expect(result.selected).toBe(true);
    if (result.selected) expect(result.selection.modelId).toBe('tier-std-2');
  });

  it('selects healthiest model within tier even if slightly more expensive (within threshold)', () => {
    // Health tie threshold is 0.05. A difference > 0.05 means health wins over cost.
    const healthy = makeModel({ modelId: 'healthy-expensive', qualityTier: 'standard' });
    const unhealthy = makeModel({ modelId: 'unhealthy-cheap', qualityTier: 'standard' });

    const costFn: CostLookupFn = (_gw: string, _cap: string, mid?: string) => {
      if (mid === 'healthy-expensive') return 50;
      if (mid === 'unhealthy-cheap') return 5;
      return null;
    };

    const healthFn = (providerId: string) => {
      if (providerId === 'provider-a') return 0.95;
      return 0.50;
    };

    const healthyModel = makeModel({ modelId: 'healthy-expensive', providerId: 'provider-a', qualityTier: 'standard' });
    const unhealthyModel = makeModel({ modelId: 'unhealthy-cheap', providerId: 'provider-b', qualityTier: 'standard' });

    const selectorWithHealth = new SovereignModelSelector(
      makeRegistry(healthyModel, unhealthyModel),
      costFn,
      healthFn,
    );

    const intent = buildImageCreationIntent('test', 'abstract'); // abstract → standard quality
    const result = selectorWithHealth.select(intent);

    expect(result.selected).toBe(true);
    if (result.selected) {
      // Health difference > threshold (0.45 > 0.05) → healthy wins over cost
      expect(result.selection.modelId).toBe('healthy-expensive');
    }
  });

  it('returns null cost gracefully and does not crash the selector', () => {
    const model = makeModel({ modelId: 'no-cost-entry' });
    const nullCostFn: CostLookupFn = () => null;

    const selector = new SovereignModelSelector(makeRegistry(model), nullCostFn);
    const intent = buildImageCreationIntent('test', 'cinematic');
    const result = selector.select(intent);

    // Should still select — missing cost data is not a hard failure
    expect(result.selected).toBe(true);
  });
});

describe('Point 8: Paid generation cannot execute before cost approval', () => {
  it('generation-service returns all-candidates-unverified path when no model is authorized', () => {
    // This test proves that with all fleet models as approved-candidate (not production-authorized),
    // the selector falls through — generation service uses legacy path, no new model selected.
    // The cost approval gate (Creator sees cost, approves) is enforced upstream in the billing layer;
    // the selector layer's role is: if no authorized model → legacy path → existing gate unchanged.
    const { getProductionSelector, resetProductionRegistryForTests } = require('../production-registry');
    resetProductionRegistryForTests();

    const intent = buildImageCreationIntent('test', 'cinematic');
    const result = getProductionSelector().select(intent);

    // All 10 fleet models are approved-candidate → not production-authorized → all-candidates-unverified
    expect(result.selected).toBe(false);
    if (!result.selected) {
      expect(result.reason).toBe('all-candidates-unverified');
    }
  });

  it('a production-authorized model selection carries gatewayId for cost catalog lookup', () => {
    const model = makeModel({
      modelId: 'cost-gate-m',
      gatewayId: 'gw-test',
      costCatalogKey: { gatewayId: 'gw-test', capabilityTarget: 'image-generation' },
    });
    const selector = new SovereignModelSelector(makeRegistry(model));
    const intent = buildImageCreationIntent('test', 'cinematic');
    const result = selector.select(intent);

    expect(result.selected).toBe(true);
    if (result.selected) {
      // gatewayId must be present so the cost engine can price the generation
      // before the generation-service fires the orchestrator
      expect(result.selection.gatewayId).toBe('gw-test');
    }
  });

  it('ModelSelection carries both gatewayId (for cost) and providerId (for orchestrator)', () => {
    const model = makeModel({
      modelId: 'dual-ids',
      gatewayId: 'gateway-cost-key',
      providerId: 'orchestrator-provider-key',
    });
    const selector = new SovereignModelSelector(makeRegistry(model));
    const intent = buildImageCreationIntent('test', 'cinematic');
    const result = selector.select(intent);

    expect(result.selected).toBe(true);
    if (result.selected) {
      expect(result.selection.gatewayId).toBe('gateway-cost-key');
      expect(result.selection.providerId).toBe('orchestrator-provider-key');
      // They are different strings — the cost catalog and the orchestrator use different identifiers
      expect(result.selection.gatewayId).not.toBe(result.selection.providerId);
    }
  });

  it('cost catalog extension: getCatalogEntry resolves model-level entry when modelId provided', () => {
    const { getCatalogEntry, CURRENT_PROVIDER_COST_CATALOG } = require('../../economy/cost-engine/provider-cost-catalog');

    // The catalog has been extended with model-specific entries.
    // Verify the lookup function accepts the modelId parameter without crashing.
    // (getCatalogEntry(gatewayId, capabilityTarget, catalog, modelId?) — catalog must be provided explicitly)
    expect(() =>
      getCatalogEntry('magic-hour', 'image-generation', CURRENT_PROVIDER_COST_CATALOG, 'z-image-turbo'),
    ).not.toThrow();

    // Without modelId: same function call, coarse-level lookup — must not crash either.
    expect(() =>
      getCatalogEntry('magic-hour', 'image-generation', CURRENT_PROVIDER_COST_CATALOG),
    ).not.toThrow();
  });

  it('cost engine estimate() correctly processes optional modelId parameter', () => {
    const { AzmaUnitCostEngine } = require('../../economy/cost-engine/azma-cost-engine');
    const engine = new AzmaUnitCostEngine();

    // All catalog entries are 'pending-discovery' → CostUnavailableError is expected.
    // This test proves the parameter IS accepted (no TypeError), not that it returns a value.
    const withModelId = () => engine.estimate('image-generation', 'magic-hour', 'z-image-turbo');
    const withoutModelId = () => engine.estimate('image-generation', 'magic-hour');

    // Both should throw CostUnavailableError (not TypeError from bad params)
    expect(withModelId).toThrow();
    expect(withoutModelId).toThrow();

    try { withModelId(); } catch (e) {
      // Must NOT be a TypeError (which would mean the parameter was rejected)
      expect(e).not.toBeInstanceOf(TypeError);
      expect((e as Error).name).toBe('CostUnavailableError');
    }
  });
});
