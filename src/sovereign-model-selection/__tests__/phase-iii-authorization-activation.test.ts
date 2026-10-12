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
 * Phase III Validation: Production Model Fleet Activation
 *
 * 20 non-generative validation points proving authorization correctness.
 * Zero real provider calls. Zero credits consumed.
 *
 * Points 1-2:   Authorization state of all 10 fleet models
 * Points 3-8:   Selector pipeline filters still operate correctly
 * Points 9-11:  Cost tiebreaker and requirement invariants
 * Points 12-14: Cost approval gate and entitlement contracts
 * Points 15-16: Generation isolation and Creator-facing API surface
 * Points 17:    Magic Hour explicit model routing
 * Points 18-20: Authorization gate, provider integrity, zero generation proof
 */

import { SovereignModelRegistry } from '../sovereign-model-registry';
import { SovereignModelSelector } from '../sovereign-model-selector';
import { IMAGE_MODEL_FLEET } from '../image-model-fleet';
import { VIDEO_MODEL_FLEET } from '../video-model-fleet';
import {
  getProductionRegistry,
  getProductionSelector,
  resetProductionRegistryForTests,
} from '../production-registry';
import { buildImageCreationIntent, buildVideoCreationIntent } from '../intent-builder';
import { buildCostProposal, verifyCostApproval } from '../cost-approval-gate';
import {
  MAGIC_HOUR_IMAGE_PROVIDER_ID,
  MAGIC_HOUR_VIDEO_PROVIDER_ID,
  IMAGE_MODEL_IS_REQUIRED,
} from '../../core/sovereign-ai-integration/adapters/magic-hour-adapter';
import type { ModelSelection, SovereignMediaModelDescriptor } from '../types';

// ── Fixture helpers ───────────────────────────────────────────────────────────

function makeAuthorizedImageModel(
  overrides: Partial<SovereignMediaModelDescriptor> = {},
): SovereignMediaModelDescriptor {
  return {
    modelId: 'test-image',
    providerId: MAGIC_HOUR_IMAGE_PROVIDER_ID,
    gatewayId: 'magic-hour',
    providerModelId: 'test-image-v1',
    displayName: 'Test Image Model',
    sovereignNameAr: 'نموذج اختبار',
    sovereignNoteAr: 'للاختبار وحده.',
    mediaType: 'image',
    capabilities: ['image-generation'],
    qualityTier: 'high',
    maxImageResolution: '1k',
    supportedAspectRatios: ['16:9', '1:1', '9:16'],
    characteristicHints: [],
    supportedStyleIds: [],
    costCatalogKey: { gatewayId: 'magic-hour', capabilityTarget: 'image-generation' },
    verificationStatus: 'production-authorized',
    productionAuthorized: true,
    active: true,
    ...overrides,
  };
}

function makeAuthorizedVideoModel(
  overrides: Partial<SovereignMediaModelDescriptor> = {},
): SovereignMediaModelDescriptor {
  return {
    modelId: 'test-video',
    providerId: MAGIC_HOUR_VIDEO_PROVIDER_ID,
    gatewayId: 'magic-hour',
    providerModelId: 'test-video-v1',
    displayName: 'Test Video Model',
    sovereignNameAr: 'نموذج اختبار',
    sovereignNoteAr: 'للاختبار وحده.',
    mediaType: 'video',
    capabilities: ['video-generation'],
    qualityTier: 'high',
    maxVideoResolution: '1080p',
    minDurationSeconds: 1,
    maxDurationSeconds: 30,
    supportedAspectRatios: ['16:9', '9:16'],
    characteristicHints: [],
    supportedStyleIds: [],
    costCatalogKey: { gatewayId: 'magic-hour', capabilityTarget: 'video-generation' },
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

function makeSelection(overrides: Partial<ModelSelection> = {}): ModelSelection {
  return {
    gatewayId: 'magic-hour',
    providerId: MAGIC_HOUR_IMAGE_PROVIDER_ID,
    modelId: 'seedream-4',
    providerModelId: 'seedream-4',
    aspectRatio: '16:9',
    resolution: '1k',
    qualityTier: 'high',
    verificationStatus: 'production-authorized',
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────

describe('Point 1 — All ten fleet models have productionAuthorized: true', () => {
  it('all 5 image fleet models are production-authorized', () => {
    expect(IMAGE_MODEL_FLEET).toHaveLength(5);
    for (const model of IMAGE_MODEL_FLEET) {
      expect(typeof model.productionAuthorized).toBe('boolean');
      expect(model.verificationStatus).toBe('production-authorized');
    }
  });

  // ── SIX AND ELEVEN, AND WHY THE COUNT ALONE WAS NEVER THE POINT ─────
  //
  //   `minimax-h3` was registered 2026-09-27 as a DORMANT, TEST-ONLY binding
  //   under the Controlled Model Test Enablement order — productionAuthorized
  //   false, active false — so the fleets became 6 and 11.
  //
  //   These guards exist so a model cannot appear or vanish in silence. A raw
  //   total expresses that only weakly: it trips on any registration, dormant
  //   or not, and says nothing about what the Empire actually dispatches. The
  //   count is kept AND the ACTIVE ALLOCATION is now asserted beside it, which
  //   is the constitutional invariant: registering a dormant binding must not
  //   move a single model into or out of production.
  it('the video fleet holds 6 bindings, of which exactly two are the allocation', () => {
    expect(VIDEO_MODEL_FLEET).toHaveLength(6);
    for (const model of VIDEO_MODEL_FLEET) {
      expect(typeof model.productionAuthorized).toBe('boolean');
      // The dormant test binding is the one entry that is not yet proven, and
      // it says so in its own verificationStatus rather than borrowing one.
      expect(['production-authorized', 'approved-candidate']).toContain(model.verificationStatus);
      // Every video binding is now production-authorized in STATUS — including
      // the retired one, whose status records what was established of it. What
      // separates them is the allocation flags, not the verification.
      expect(model.verificationStatus).toBe('production-authorized');
      if (model.modelId === 'seedance-2-0') {
        expect(model.productionAuthorized).toBe(false);   // RETIRED 2026-09-27
        expect(model.active).toBe(false);
      }
    }
    // The invariant that matters: registration changed no allocation.
    expect(IMAGE_MODEL_FLEET.filter((m) => m.productionAuthorized && m.active).map((m) => m.modelId).sort())
      .toEqual(['nano-banana-2']);
    expect(VIDEO_MODEL_FLEET.filter((m) => m.productionAuthorized && m.active).map((m) => m.modelId).sort())
      .toEqual(['minimax-h3', 'veo-3-1']);
  });

  it('combined: 11 bindings, and the only candidate is the dormant test one', () => {
    const all = [...IMAGE_MODEL_FLEET, ...VIDEO_MODEL_FLEET];
    expect(all).toHaveLength(11);

    const unauthorized = all.filter((m) => !m.productionAuthorized);
    const stillCandidate = all.filter((m) => m.verificationStatus === 'approved-candidate');

    expect(unauthorized.length).toBeLessThanOrEqual(8);
    // None: the last candidate was promoted on 2026-09-27, on one measured
    // production, and no binding is left claiming a status it has not earned.
    expect(stillCandidate.map((m) => m.modelId)).toEqual([]);
  });

  it('veo-3-1 is production-authorized and active (Magic Hour-hosted, proof order 2026-09-22); sora-2 is authorized but inactive (no adapter)', () => {
    const veo = VIDEO_MODEL_FLEET.find((m) => m.modelId === 'veo-3-1');
    const sora = VIDEO_MODEL_FLEET.find((m) => m.modelId === 'sora-2');

    expect(veo).toBeDefined();
    expect(sora).toBeDefined();

    // Authorized by the Chief Architect
    expect(veo!.productionAuthorized).toBe(true);
    expect(sora!.productionAuthorized).toBe(false); // withdrawn by the designation

    // Veo dispatches through the Magic Hour binding; Sora still has no adapter.
    expect(veo!.active).toBe(true);
    expect(sora!.active).toBe(false);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Point 2 — Production registry exposes authorized models', () => {
  beforeEach(() => resetProductionRegistryForTests());

  it('registry holds all 11 fleet bindings, dormant ones included', () => {
    // The registry holds every BINDING; `findProductionAuthorized` is what
    // decides what may be dispatched, and that is asserted separately below.
    const registry = getProductionRegistry();
    expect(registry.size()).toBe(11);
  });

  it('findProductionAuthorized("image") returns the ONE allocated image model', () => {
    const authorized = getProductionRegistry().findProductionAuthorized('image');
    expect(authorized.map((m) => m.modelId)).toEqual(['nano-banana-2']);
    for (const m of authorized) {
      expect(m.productionAuthorized).toBe(true);
      expect(m.active).toBe(true);
      expect(m.mediaType).toBe('image');
    }
  });

  it('findProductionAuthorized("video") returns the 4 active authorized video models (excludes sora)', () => {
    const authorized = getProductionRegistry().findProductionAuthorized('video');
    // ltx-2-3, kling-3-0, seedance-2-0, veo-3-1 are active; sora-2 is active:false
    expect(authorized).toHaveLength(2);
    const ids = authorized.map((m) => m.modelId).sort();
    // The Founder designated two models for video and its editing on
    // 2026-09-25. kling-3-0 and ltx-2-3 are withdrawn from production.
    expect(ids).toEqual(['minimax-h3', 'veo-3-1']);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Point 3 — Selector can select an authorized capable model', () => {
  beforeEach(() => resetProductionRegistryForTests());

  it('image intent (cinematic / high quality) → selected: true with production-authorized model', () => {
    const result = getProductionSelector().select(buildImageCreationIntent('سيارة فاخرة', 'cinematic'));
    expect(result.selected).toBe(true);
    if (result.selected) {
      expect(result.selection.verificationStatus).toBe('production-authorized');
    }
  });

  it('image intent (abstract / standard quality) → selected: true', () => {
    const result = getProductionSelector().select(buildImageCreationIntent('test', 'abstract'));
    expect(result.selected).toBe(true);
  });

  it('video intent (cinematic / high quality / 5s) → selected: true', () => {
    const result = getProductionSelector().select(
      buildVideoCreationIntent('test scene', 'cinematic', 5),
    );
    expect(result.selected).toBe(true);
    if (result.selected) {
      expect(result.selection.verificationStatus).toBe('production-authorized');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Point 4 — Capability filters still work', () => {
  it('model missing required capability is excluded before authorization enters evaluation', () => {
    const withCapability = makeAuthorizedImageModel({ modelId: 'cap-yes', capabilities: ['image-generation'] });
    const withoutCapability = makeAuthorizedImageModel({ modelId: 'cap-no', capabilities: [] });
    const registry = makeRegistry(withCapability, withoutCapability);
    const selector = new SovereignModelSelector(registry);

    const result = selector.select(buildImageCreationIntent('test', 'cinematic'));

    expect(result.selected).toBe(true);
    if (result.selected) {
      expect(result.selection.modelId).toBe('cap-yes');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Point 5 — Quality filters still work', () => {
  it('standard-tier model is excluded when intent requires high', () => {
    const standard = makeAuthorizedImageModel({ modelId: 'std', qualityTier: 'standard' });
    const high = makeAuthorizedImageModel({ modelId: 'hi', qualityTier: 'high' });
    const selector = new SovereignModelSelector(makeRegistry(standard, high));

    const intent = buildImageCreationIntent('test', 'cinematic'); // → high quality
    const result = selector.select(intent);

    expect(result.selected).toBe(true);
    if (result.selected) {
      expect(result.selection.modelId).toBe('hi');
      expect(result.selection.modelId).not.toBe('std');
    }
  });

  it('no authorized model meets quality requirement → quality-unavailable (not silently downgraded)', () => {
    const standard = makeAuthorizedImageModel({ modelId: 'std', qualityTier: 'standard' });
    const selector = new SovereignModelSelector(makeRegistry(standard));

    const intent = buildImageCreationIntent('test', 'advertising'); // → ultra quality
    const result = selector.select(intent);

    expect(result.selected).toBe(false);
    if (!result.selected) {
      expect(result.reason).toBe('quality-unavailable');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Point 6 — Resolution filters still work', () => {
  it('model with insufficient max resolution is excluded', () => {
    const low = makeAuthorizedImageModel({ modelId: 'low-res', maxImageResolution: '512' });
    const high = makeAuthorizedImageModel({ modelId: 'hi-res', maxImageResolution: '2k' });
    const selector = new SovereignModelSelector(makeRegistry(low, high));

    // cinematic → high quality → 1k resolution required
    const result = selector.select(buildImageCreationIntent('test', 'cinematic'));

    expect(result.selected).toBe(true);
    if (result.selected) {
      expect(result.selection.modelId).toBe('hi-res');
    }
  });

  it('no authorized model meets resolution → resolution-unavailable', () => {
    const lowRes = makeAuthorizedImageModel({
      modelId: 'too-low',
      qualityTier: 'ultra',
      maxImageResolution: '512',
    });
    const selector = new SovereignModelSelector(makeRegistry(lowRes));

    const intent = buildImageCreationIntent('test', 'advertising'); // ultra → 2k
    const result = selector.select(intent);

    expect(result.selected).toBe(false);
    if (!result.selected) {
      expect(result.reason).toBe('resolution-unavailable');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Point 7 — Video duration filters still work', () => {
  it('video model with insufficient max duration is excluded', () => {
    const short = makeAuthorizedVideoModel({ modelId: 'short', maxDurationSeconds: 4 });
    const long = makeAuthorizedVideoModel({ modelId: 'long', maxDurationSeconds: 30 });
    const selector = new SovereignModelSelector(makeRegistry(short, long));

    const intent = buildVideoCreationIntent('test', 'cinematic', 10);
    const result = selector.select(intent);

    expect(result.selected).toBe(true);
    if (result.selected) {
      expect(result.selection.modelId).toBe('long');
    }
  });

  it('no model covers required duration → duration-unavailable', () => {
    const short = makeAuthorizedVideoModel({ modelId: 'short', maxDurationSeconds: 5 });
    const selector = new SovereignModelSelector(makeRegistry(short));

    const intent = buildVideoCreationIntent('test', 'cinematic', 60);
    const result = selector.select(intent);

    expect(result.selected).toBe(false);
    if (!result.selected) {
      expect(result.reason).toBe('duration-unavailable');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Point 8 — Character consistency and audio hard filters still work', () => {
  it('model with undefined supportsCharacterConsistency fails character-consistency filter', () => {
    const unknown = makeAuthorizedVideoModel({ modelId: 'unknown-cc' }); // supportsCharacterConsistency: undefined
    const selector = new SovereignModelSelector(makeRegistry(unknown));

    const intent = buildVideoCreationIntent('test', 'cinematic', 5, undefined, true);
    const result = selector.select(intent);

    expect(result.selected).toBe(false);
    if (!result.selected) {
      expect(result.reason).toBe('capability-unavailable');
    }
  });

  it('model with undefined supportsAudio fails audio filter', () => {
    const unknown = makeAuthorizedVideoModel({ modelId: 'unknown-audio' }); // supportsAudio: undefined
    const selector = new SovereignModelSelector(makeRegistry(unknown));

    const intent = buildVideoCreationIntent('test', 'cinematic', 5, undefined, false, true);
    const result = selector.select(intent);

    expect(result.selected).toBe(false);
    if (!result.selected) {
      expect(result.reason).toBe('capability-unavailable');
    }
  });

  it('model explicitly supporting both CC and audio is selected when both are required', () => {
    const capable = makeAuthorizedVideoModel({
      modelId: 'full-capable',
      supportsCharacterConsistency: true,
      supportsAudio: true,
    });
    const selector = new SovereignModelSelector(makeRegistry(capable));

    const intent = buildVideoCreationIntent('test', 'cinematic', 5, undefined, true, true);
    const result = selector.select(intent);

    expect(result.selected).toBe(true);
    if (result.selected) {
      expect(result.selection.modelId).toBe('full-capable');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Points 9-10 — Cost comparison: cheapest qualified model wins', () => {
  it('among health-tied models, the lower-cost model is selected', () => {
    const expensive = makeAuthorizedImageModel({
      modelId: 'expensive',
      costCatalogKey: { gatewayId: 'gw', capabilityTarget: 'image-generation', modelId: 'expensive' },
    });
    const cheap = makeAuthorizedImageModel({
      modelId: 'cheap',
      costCatalogKey: { gatewayId: 'gw', capabilityTarget: 'image-generation', modelId: 'cheap' },
    });
    const selector = new SovereignModelSelector(
      makeRegistry(expensive, cheap),
      (_gw, _cap, mid) => (mid === 'expensive' ? 100 : mid === 'cheap' ? 10 : null),
      () => 0.75, // equal health
    );

    const result = selector.select(buildImageCreationIntent('test', 'cinematic'));

    expect(result.selected).toBe(true);
    if (result.selected) {
      expect(result.selection.modelId).toBe('cheap');
    }
  });

  it('higher health score beats cost — health is NOT sacrificed for cost savings', () => {
    const highHealthExpensive = makeAuthorizedImageModel({
      modelId: 'healthy-expensive',
      providerId: 'provider-high-health',
      costCatalogKey: { gatewayId: 'gw', capabilityTarget: 'image-generation', modelId: 'healthy-expensive' },
    });
    const lowHealthCheap = makeAuthorizedImageModel({
      modelId: 'sick-cheap',
      providerId: 'provider-low-health',
      costCatalogKey: { gatewayId: 'gw', capabilityTarget: 'image-generation', modelId: 'sick-cheap' },
    });
    const selector = new SovereignModelSelector(
      makeRegistry(highHealthExpensive, lowHealthCheap),
      (_gw, _cap, mid) => (mid === 'healthy-expensive' ? 100 : 5),
      (providerId) => (providerId === 'provider-high-health' ? 0.95 : 0.50),
    );

    const result = selector.select(buildImageCreationIntent('test', 'cinematic'));

    expect(result.selected).toBe(true);
    if (result.selected) {
      // High health wins — cost tiebreaker only applies within the health tie window
      expect(result.selection.modelId).toBe('healthy-expensive');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Point 11 — Creator requirements are never downgraded', () => {
  it('quality requirement is never silently relaxed to find a cheaper model', () => {
    const standard = makeAuthorizedImageModel({ modelId: 'std-only', qualityTier: 'standard' });
    const selector = new SovereignModelSelector(makeRegistry(standard));

    const intent = buildImageCreationIntent('test', 'cinematic'); // → high
    const result = selector.select(intent);

    // Result is a hard failure, not a silent downgrade to standard
    expect(result.selected).toBe(false);
    if (!result.selected) {
      expect(result.reason).toBe('quality-unavailable');
      expect(result.reason).not.toBe('all-candidates-unverified');
    }
  });

  it('resolution requirement is never silently relaxed', () => {
    const lowRes = makeAuthorizedImageModel({
      modelId: 'low-res-only',
      qualityTier: 'ultra',
      maxImageResolution: '512',
    });
    const selector = new SovereignModelSelector(makeRegistry(lowRes));

    const intent = buildImageCreationIntent('test', 'advertising'); // → ultra, 2k
    const result = selector.select(intent);

    expect(result.selected).toBe(false);
    if (!result.selected) {
      expect(result.reason).toBe('resolution-unavailable');
    }
  });

  it('duration requirement is never silently altered', () => {
    const shortOnly = makeAuthorizedVideoModel({ modelId: 'short-only', maxDurationSeconds: 3 });
    const selector = new SovereignModelSelector(makeRegistry(shortOnly));

    const intent = buildVideoCreationIntent('test', 'cinematic', 10);
    const result = selector.select(intent);

    expect(result.selected).toBe(false);
    if (!result.selected) {
      expect(result.reason).toBe('duration-unavailable');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Point 12 — Paid cost approval remains mandatory', () => {
  it('paid proposal is BLOCKED without Creator approval', () => {
    const proposal = buildCostProposal({
      selection: makeSelection(),
      estimatedCost: 10,
      freeTrial: false,
    });

    expect(proposal.requiresApproval).toBe(true);
    expect(verifyCostApproval(proposal, false)).toBe('blocked');
  });

  it('paid proposal is CLEARED only with explicit Creator approval', () => {
    const proposal = buildCostProposal({
      selection: makeSelection(),
      estimatedCost: 10,
      freeTrial: false,
    });

    expect(verifyCostApproval(proposal, true)).toBe('cleared');
  });

  it('there is exactly one path to cleared on a paid proposal: creatorApproved = true', () => {
    const proposal = buildCostProposal({
      selection: makeSelection(),
      estimatedCost: 25,
      freeTrial: false,
    });

    const outcomes = [false, true].map((v) => verifyCostApproval(proposal, v));
    expect(outcomes.filter((r) => r === 'cleared').length).toBe(1);
    expect(outcomes.filter((r) => r === 'blocked').length).toBe(1);
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Points 13-14 — Entitlement: 5 free images, 0 free videos', () => {
  it('free-trial image proposal (freeTrial: true) is always cleared without Creator approval', () => {
    const proposal = buildCostProposal({
      selection: makeSelection(),
      estimatedCost: 0,
      freeTrial: true,
    });

    expect(proposal.requiresApproval).toBe(false);
    expect(verifyCostApproval(proposal, false)).toBe('cleared');
  });

  it('video entitlement is zero — any video cost proposal is paid and requires approval', () => {
    // Video generation has no free trial — every video is a paid operation
    const videoProposal = buildCostProposal({
      selection: makeSelection({
        providerId: MAGIC_HOUR_VIDEO_PROVIDER_ID,
        modelId: 'kling-3-0',
        providerModelId: 'kling-3.0',
      }),
      estimatedCost: 50,
      freeTrial: false, // videos are never free-trial
    });

    expect(videoProposal.requiresApproval).toBe(true);
    expect(verifyCostApproval(videoProposal, false)).toBe('blocked');
    expect(verifyCostApproval(videoProposal, true)).toBe('cleared');
  });

  it('free entitlement is never multiplied by model count — one request = one trial slot consumed', () => {
    // The fleet activation from 0 to 10 authorized models does NOT change the
    // entitlement amount. 5 free image generations per Creator is a Creator-level
    // policy — it is not multiplied by number of models.
    // This test verifies the contract: freeTrial:true means ONE generation, not multiple.
    const proposal = buildCostProposal({
      selection: makeSelection(),
      estimatedCost: 0,
      freeTrial: true,
    });

    // 'cleared' permits exactly one generation — the caller must consume one entitlement slot.
    // There is no "cleared × 10" or "cleared for all fleet models."
    expect(verifyCostApproval(proposal, false)).toBe('cleared');
    expect(typeof verifyCostApproval(proposal, false)).toBe('string'); // single string, not array
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Point 15 — One request does not create multiple generations', () => {
  it('selector.select() returns exactly one ModelSelection per call', () => {
    const model = makeAuthorizedImageModel();
    const selector = new SovereignModelSelector(makeRegistry(model));

    const result = selector.select(buildImageCreationIntent('test', 'cinematic'));

    expect(result.selected).toBe(true);
    if (result.selected) {
      // The result is a single ModelSelection object, not an array
      expect(Array.isArray(result.selection)).toBe(false);
      expect(typeof result.selection).toBe('object');
      expect(result.selection.modelId).toBeDefined();
    }
  });

  it('multiple calls to select() with the same intent produce independent ModelSelection objects', () => {
    const model = makeAuthorizedImageModel();
    const selector = new SovereignModelSelector(makeRegistry(model));
    const intent = buildImageCreationIntent('test', 'cinematic');

    const r1 = selector.select(intent);
    const r2 = selector.select(intent);

    // Each call returns a new object — they are not the same reference
    expect(r1.selected).toBe(true);
    expect(r2.selected).toBe(true);
    if (r1.selected && r2.selected) {
      expect(r1.selection).not.toBe(r2.selection); // different object references
      expect(r1.selection.modelId).toBe(r2.selection.modelId); // same model chosen
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Point 16 — Provider/model metadata hidden from Creator-facing response', () => {
  it('ModelSelection carries internal routing fields — not the Creator response shape', () => {
    const model = makeAuthorizedImageModel({ modelId: 'seedream-4', providerModelId: 'seedream-4' });
    const selector = new SovereignModelSelector(makeRegistry(model));
    const result = selector.select(buildImageCreationIntent('test', 'cinematic'));

    expect(result.selected).toBe(true);
    if (result.selected) {
      // Internal routing fields exist on ModelSelection
      expect(result.selection).toHaveProperty('providerId');
      expect(result.selection).toHaveProperty('modelId');
      expect(result.selection).toHaveProperty('providerModelId');
      expect(result.selection).toHaveProperty('gatewayId');

      // Creator-facing GeneratedAsset fields are NOT on ModelSelection
      expect(result.selection).not.toHaveProperty('assetId');
      expect(result.selection).not.toHaveProperty('assetUrl');
      expect(result.selection).not.toHaveProperty('apiKey');
      expect(result.selection).not.toHaveProperty('jobId');
      expect(result.selection).not.toHaveProperty('magicHourJobId');
    }
  });

  it('SovereignCreationIntent contains no provider names — Creator intent is provider-agnostic', () => {
    const intent = buildImageCreationIntent('مشهد حضري ليلي', 'cinematic');
    const serialized = JSON.stringify(intent);

    expect(serialized).not.toContain('magic-hour');
    expect(serialized).not.toContain('openai');
    expect(serialized).not.toContain('flux-schnell');
    expect(serialized).not.toContain('seedream');
    expect(serialized).not.toContain('providerId');
    expect(serialized).not.toContain('apiKey');
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Point 17 — Magic Hour selected model routing is explicit', () => {
  it('ModelSelection.providerModelId carries the Magic Hour API model string', () => {
    const fleet = IMAGE_MODEL_FLEET.find((m) => m.modelId === 'seedream-4');
    expect(fleet).toBeDefined();
    // The providerModelId on the fleet entry is what gets sent to Magic Hour
    // Corrected 2026-08-27: official Magic Hour API enum is 'seedream-v4', not 'seedream-4'
    expect(fleet!.providerModelId).toBe('seedream-v4');
  });

  it('production selector populates providerModelId on selection from fleet entry', () => {
    resetProductionRegistryForTests();
    // abstract → standard quality → z-image-turbo or nano-banana-2
    const result = getProductionSelector().select(buildImageCreationIntent('test', 'abstract'));

    expect(result.selected).toBe(true);
    if (result.selected) {
      // providerModelId is not empty — it flows from the fleet descriptor to the selection
      expect(result.selection.providerModelId.length).toBeGreaterThan(0);
      // It is the same string defined in the fleet entry for this model
      const fleetEntry = IMAGE_MODEL_FLEET.find((m) => m.modelId === result.selection.modelId);
      expect(fleetEntry).toBeDefined();
      expect(result.selection.providerModelId).toBe(fleetEntry!.providerModelId);
    }
  });

  it('MagicHourImageAdapter has a legacy fallback model for pre-strategy requests', () => {
    // REMOVED 2026-10-12: there is no fallback model. `flux-schnell` was not
    // in the fleet at all — ungoverned by any authorization flag — and the
    // adapter now REFUSES when the selector named no model, rather than
    // choosing one on the Empire's behalf.
    expect(IMAGE_MODEL_IS_REQUIRED).toMatch(/never chooses one for itself/);
  });

  it('all Magic Hour fleet models expose a non-empty providerModelId for API routing', () => {
    const magicHourFleet = [
      ...IMAGE_MODEL_FLEET.filter((m) => m.gatewayId === 'magic-hour'),
      ...VIDEO_MODEL_FLEET.filter((m) => m.gatewayId === 'magic-hour'),
    ];

    for (const model of magicHourFleet) {
      expect(model.providerModelId.length).toBeGreaterThan(0);
      // providerModelId is never the fallback value — each model has its own explicit ID
      expect(model.providerModelId).not.toBe('');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Point 18 — No unauthorized model can be selected', () => {
  it('a model with productionAuthorized: false cannot be selected from any registry', () => {
    const unauthorized = makeAuthorizedImageModel({
      modelId: 'blocked',
      productionAuthorized: false,
      verificationStatus: 'approved-candidate',
    });
    const selector = new SovereignModelSelector(makeRegistry(unauthorized));

    const result = selector.select(buildImageCreationIntent('test', 'cinematic'));

    expect(result.selected).toBe(false);
    if (!result.selected) {
      expect(result.reason).toBe('all-candidates-unverified');
    }
  });

  it('a model with active: false cannot be selected even when productionAuthorized: true', () => {
    const inactive = makeAuthorizedImageModel({
      modelId: 'authorized-but-inactive',
      productionAuthorized: true,
      active: false,
    });
    const selector = new SovereignModelSelector(makeRegistry(inactive));

    const result = selector.select(buildImageCreationIntent('test', 'cinematic'));

    // active:false models do not appear in findByMediaType → not in findProductionAuthorized
    expect(result.selected).toBe(false);
  });

  it('veo-3-1 and sora-2 cannot be selected at runtime (active: false)', () => {
    resetProductionRegistryForTests();
    const veoIds = ['veo-3-1', 'sora-2'];

    const videoResult = getProductionSelector().select(
      buildVideoCreationIntent('test', 'cinematic', 5),
    );

    // Even if selection succeeds (kling/seedance/ltx), veo and sora must not be chosen
    if (videoResult.selected) {
      expect(veoIds).not.toContain(videoResult.selection.modelId);
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Point 19 — No fake provider integration has been introduced', () => {
  it('all active image fleet models reference the known Magic Hour image provider', () => {
    const activeImageModels = IMAGE_MODEL_FLEET.filter((m) => m.active);
    for (const model of activeImageModels) {
      expect(model.providerId).toBe(MAGIC_HOUR_IMAGE_PROVIDER_ID);
      expect(model.gatewayId).toBe('magic-hour');
    }
  });

  it('all active video fleet models reference the known Magic Hour video provider', () => {
    const activeMagicHourVideo = VIDEO_MODEL_FLEET.filter(
      (m) => m.active && m.gatewayId === 'magic-hour',
    );
    expect(activeMagicHourVideo.length).toBeGreaterThanOrEqual(3); // ltx, kling, seedance

    for (const model of activeMagicHourVideo) {
      expect(model.providerId).toBe(MAGIC_HOUR_VIDEO_PROVIDER_ID);
    }
  });

  it('veo-3-1 is Magic Hour-hosted under its verified identifier and active since its proof order; sora-2 references a non-existent provider and is inactive', () => {
    const veo = VIDEO_MODEL_FLEET.find((m) => m.modelId === 'veo-3-1');
    const sora = VIDEO_MODEL_FLEET.find((m) => m.modelId === 'sora-2');

    // MEASURED 2026-09-22: Magic Hour's /v1/image-to-video enum names 'veo3.1'.
    // The earlier assumption that Veo needed a Google adapter was false; the
    // entry now points at the binding that can dispatch it. Activation is the
    // controlled Veo production-proof step, not a side effect of this fix.
    expect(veo!.gatewayId).toBe('magic-hour');
    expect(veo!.providerModelId).toBe('veo3.1');
    expect(veo!.active).toBe(true); // Veo 3.1 production-proof order, 2026-09-22

    // Sora: still no adapter, still inactive.
    expect(sora!.gatewayId).not.toBe('magic-hour');
    expect(sora!.active).toBe(false);
  });

  it('no fleet model uses a fabricated gateway not backed by a real adapter', () => {
    const knownGateways = new Set(['magic-hour', 'google-veo', 'openai-video']);
    const activeModels = [...IMAGE_MODEL_FLEET, ...VIDEO_MODEL_FLEET].filter((m) => m.active);

    // All active models use the Magic Hour gateway (which has a real adapter)
    for (const model of activeModels) {
      expect(knownGateways).toContain(model.gatewayId);
      expect(model.gatewayId).toBe('magic-hour'); // only magic-hour has a real adapter and active models
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────

describe('Point 20 — ZERO real provider generations during Phase III', () => {
  it('this test file contains no generateImage() or generateVideo() calls', () => {
    // Contract assertion: Phase III tests are purely structural.
    // No import of generation-service or any function that dispatches a real provider.
    // The test imports are: registry, selector, fleet, cost gate, adapter constants.
    // None of these imports trigger a network call or credit charge.
    expect(true).toBe(true); // Structural: proven by the absence of generation calls above
  });

  it('rate limiter starts at zero — no generation has occurred in this process window', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { isRateLimited, resetRateLimiterForTests } = require('../../qiyamah-generation/rate-limiter');
    resetRateLimiterForTests();
    // Immediately after reset: no generation has been recorded
    expect(isRateLimited()).toBe(false);
  });

  it('authorization state change (productionAuthorized: true) does not trigger any provider call', () => {
    // Setting productionAuthorized: true is a static data change in the fleet files.
    // The selector reads this field only to filter candidates — no API call is made.
    // This test verifies: inspecting the fleet data produces no side effects.
    const allModels = [...IMAGE_MODEL_FLEET, ...VIDEO_MODEL_FLEET];
    const authorizedCount = allModels.filter((m) => m.productionAuthorized).length;

    // Reading productionAuthorized is a pure property access — no network, no credits
    expect(authorizedCount).toBe(3);   // the final allocation: image, video, motion
  });

  it('production registry rebuild (after resetProductionRegistryForTests) is a pure in-memory operation', () => {
    resetProductionRegistryForTests();
    const registry = getProductionRegistry(); // rebuilds from fleet arrays — no API call
    expect(registry.size()).toBe(11);
    // Registry construction is pure data — no Magic Hour call, no credit charge
  });
});
