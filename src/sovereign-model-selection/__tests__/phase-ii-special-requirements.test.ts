/**
 * Phase II Test 4: Creator Special Requirements Are Preserved
 *
 * Proves that characterConsistencyRequired and audioRequired on the intent
 * are treated as hard filters — incapable models are excluded before cost
 * or health enter the evaluation. Unknown capability (undefined) is never
 * assumed to be supported (Section XIV of Construction Order).
 *
 * No real provider calls. No real credits consumed.
 */

import { SovereignModelRegistry } from '../sovereign-model-registry';
import { SovereignModelSelector } from '../sovereign-model-selector';
import type { SovereignCreationIntent, SovereignMediaModelDescriptor } from '../types';

// ── Fixture builders ──────────────────────────────────────────────────────────

function makeVideoModel(
  overrides: Partial<SovereignMediaModelDescriptor>,
): SovereignMediaModelDescriptor {
  return {
    modelId: 'base-video',
    providerId: 'provider-v',
    gatewayId: 'gateway-v',
    providerModelId: 'base-video-v1',
    displayName: 'Base Video Model',
    mediaType: 'video',
    capabilities: ['video-generation'],
    qualityTier: 'high',
    maxVideoResolution: '1080p',
    minDurationSeconds: 0,
    maxDurationSeconds: 60,
    supportedAspectRatios: ['16:9', '9:16'],
    characteristicHints: [],
    supportedStyleIds: [],
    costCatalogKey: { gatewayId: 'gateway-v', capabilityTarget: 'video-generation' },
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

function makeVideoIntent(overrides: Partial<SovereignCreationIntent>): SovereignCreationIntent {
  return {
    mediaType: 'video',
    prompt: 'test scene',
    style: 'cinematic',
    qualityRequirement: 'high',
    resolution: '1080p',
    aspectRatio: '16:9',
    characteristicHints: [],
    durationSeconds: 5,
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('Phase II Test 4 — Character Consistency: hard filter', () => {
  it('selects a model that explicitly supports character consistency', () => {
    const noCC  = makeVideoModel({ modelId: 'no-cc',   supportsCharacterConsistency: false });
    const withCC = makeVideoModel({ modelId: 'with-cc', supportsCharacterConsistency: true });
    const selector = new SovereignModelSelector(makeRegistry(noCC, withCC));

    const result = selector.select(makeVideoIntent({ characterConsistencyRequired: true }));

    expect(result.selected).toBe(true);
    if (result.selected) {
      expect(result.selection.modelId).toBe('with-cc');
      expect(result.selection.modelId).not.toBe('no-cc');
    }
  });

  it('returns capability-unavailable when no model supports character consistency', () => {
    const noCC = makeVideoModel({ modelId: 'no-cc', supportsCharacterConsistency: false });
    const selector = new SovereignModelSelector(makeRegistry(noCC));

    const result = selector.select(makeVideoIntent({ characterConsistencyRequired: true }));

    expect(result.selected).toBe(false);
    if (!result.selected) {
      expect(result.reason).toBe('capability-unavailable');
    }
  });

  it('does NOT assume character consistency from undefined — treats undefined as unsupported', () => {
    // supportsCharacterConsistency is not set → undefined, which is NOT === true
    const unknownCC = makeVideoModel({ modelId: 'unknown-cc' });
    const selector = new SovereignModelSelector(makeRegistry(unknownCC));

    const result = selector.select(makeVideoIntent({ characterConsistencyRequired: true }));

    expect(result.selected).toBe(false);
    if (!result.selected) {
      expect(result.reason).toBe('capability-unavailable');
    }
  });

  it('character consistency filter applies before cost — cheaper non-CC model never wins', () => {
    const cheapNoCC  = makeVideoModel({
      modelId: 'cheap-no-cc',
      supportsCharacterConsistency: false,
      costCatalogKey: { gatewayId: 'gw', capabilityTarget: 'video-generation', modelId: 'cheap-no-cc' },
    });
    const expensiveCC = makeVideoModel({
      modelId: 'expensive-cc',
      supportsCharacterConsistency: true,
      costCatalogKey: { gatewayId: 'gw', capabilityTarget: 'video-generation', modelId: 'expensive-cc' },
    });
    const selector = new SovereignModelSelector(
      makeRegistry(cheapNoCC, expensiveCC),
      (_gw: string, _cap: string, mid?: string) => mid === 'cheap-no-cc' ? 1 : 100,
    );

    const result = selector.select(makeVideoIntent({ characterConsistencyRequired: true }));

    expect(result.selected).toBe(true);
    if (result.selected) {
      // expensive-cc wins — cost NEVER overrides a special requirement
      expect(result.selection.modelId).toBe('expensive-cc');
    }
  });

  it('no filtering applied when characterConsistencyRequired is undefined', () => {
    // Both models are eligible when the requirement is absent
    const noCC  = makeVideoModel({ modelId: 'no-cc',   supportsCharacterConsistency: false });
    const withCC = makeVideoModel({ modelId: 'with-cc', supportsCharacterConsistency: true });
    const selector = new SovereignModelSelector(makeRegistry(noCC, withCC));

    // No characterConsistencyRequired in intent
    const result = selector.select(makeVideoIntent({}));

    expect(result.selected).toBe(true); // At least one model qualifies
  });
});

describe('Phase II Test 4 — Audio: hard filter', () => {
  it('selects a model that explicitly supports audio', () => {
    const noAudio  = makeVideoModel({ modelId: 'no-audio',   supportsAudio: false });
    const withAudio = makeVideoModel({ modelId: 'with-audio', supportsAudio: true });
    const selector = new SovereignModelSelector(makeRegistry(noAudio, withAudio));

    const result = selector.select(makeVideoIntent({ audioRequired: true }));

    expect(result.selected).toBe(true);
    if (result.selected) {
      expect(result.selection.modelId).toBe('with-audio');
    }
  });

  it('returns capability-unavailable when no model supports audio', () => {
    const noAudio = makeVideoModel({ modelId: 'no-audio', supportsAudio: false });
    const selector = new SovereignModelSelector(makeRegistry(noAudio));

    const result = selector.select(makeVideoIntent({ audioRequired: true }));

    expect(result.selected).toBe(false);
    if (!result.selected) {
      expect(result.reason).toBe('capability-unavailable');
    }
  });

  it('treats undefined supportsAudio as not supported when audio is required', () => {
    const unknownAudio = makeVideoModel({ modelId: 'unknown-audio' }); // supportsAudio: undefined
    const selector = new SovereignModelSelector(makeRegistry(unknownAudio));

    const result = selector.select(makeVideoIntent({ audioRequired: true }));

    expect(result.selected).toBe(false);
    if (!result.selected) {
      expect(result.reason).toBe('capability-unavailable');
    }
  });

  it('audio filter applies before cost — cheaper no-audio model never wins when audio required', () => {
    const cheapNoAudio = makeVideoModel({
      modelId: 'cheap-no-audio',
      supportsAudio: false,
      costCatalogKey: { gatewayId: 'gw', capabilityTarget: 'video-generation', modelId: 'cheap-no-audio' },
    });
    const priceyAudio = makeVideoModel({
      modelId: 'pricey-audio',
      supportsAudio: true,
      costCatalogKey: { gatewayId: 'gw', capabilityTarget: 'video-generation', modelId: 'pricey-audio' },
    });
    const selector = new SovereignModelSelector(
      makeRegistry(cheapNoAudio, priceyAudio),
      (_gw: string, _cap: string, mid?: string) => mid === 'cheap-no-audio' ? 2 : 80,
    );

    const result = selector.select(makeVideoIntent({ audioRequired: true }));

    expect(result.selected).toBe(true);
    if (result.selected) {
      expect(result.selection.modelId).toBe('pricey-audio');
    }
  });
});

describe('Phase II Test 4 — Combined requirements', () => {
  it('both character consistency AND audio must be satisfied simultaneously', () => {
    const ccOnly    = makeVideoModel({ modelId: 'cc-only',    supportsCharacterConsistency: true,  supportsAudio: false });
    const audioOnly = makeVideoModel({ modelId: 'audio-only', supportsCharacterConsistency: false, supportsAudio: true });
    const both      = makeVideoModel({ modelId: 'both',       supportsCharacterConsistency: true,  supportsAudio: true });
    const selector  = new SovereignModelSelector(makeRegistry(ccOnly, audioOnly, both));

    const result = selector.select(makeVideoIntent({
      characterConsistencyRequired: true,
      audioRequired: true,
    }));

    expect(result.selected).toBe(true);
    if (result.selected) {
      expect(result.selection.modelId).toBe('both');
    }
  });

  it('returns capability-unavailable when only partial support is available', () => {
    const ccOnly    = makeVideoModel({ modelId: 'cc-only',    supportsCharacterConsistency: true,  supportsAudio: false });
    const audioOnly = makeVideoModel({ modelId: 'audio-only', supportsCharacterConsistency: false, supportsAudio: true });
    const selector  = new SovereignModelSelector(makeRegistry(ccOnly, audioOnly));

    const result = selector.select(makeVideoIntent({
      characterConsistencyRequired: true,
      audioRequired: true,
    }));

    expect(result.selected).toBe(false);
    if (!result.selected) {
      expect(result.reason).toBe('capability-unavailable');
    }
  });
});
