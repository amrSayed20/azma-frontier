/**
 * AZMA OS — ONE AUTHORIZATION BOUNDARY, 2026-10-11.
 *
 * ─── THE GAP THESE CLOSE ────────────────────────────────────────────────────
 *
 *   `MultiProviderOrchestrator.execute` selects from
 *   `providerRegistry.list()` — every REGISTERED adapter — filtered only by
 *   declared capability, an internal model inventory and health. The sovereign
 *   fleet's `productionAuthorized` and `active` are not consulted on that
 *   path, and `preferredProviderId` is a +0.15 scoring nudge, never a
 *   constraint.
 *
 *   So a model the Chief Architect had not authorised could be reached merely
 *   because its adapter was registered. That is how `z-image-turbo`,
 *   `ltx-2.3` and `kling-3.0` produced real assets while carrying
 *   `productionAuthorized: false`.
 *
 *   The correction is that the sovereign selector is now the ONLY door into
 *   the orchestrator from this chamber: every non-selection fails closed.
 *
 * No test here needs a provider, a credential, or a paid request.
 */

const mockOrchestrate = jest.fn();
jest.mock('../../core/sovereign-ai-integration/provider-bootstrap', () => ({
  getGenerationOrchestrator: () => ({ orchestrate: mockOrchestrate }),
}));
jest.mock('../asset-storage', () => ({
  ...jest.requireActual('../asset-storage'),
  persistGeneratedImage: jest.fn(),
  persistGeneratedVideo: jest.fn(),
}));
jest.mock('../../persistent-storage', () => ({
  getDb: jest.fn(() => 'fake-db'),
  recordGeneration: jest.fn(),
  insertVaultAsset: jest.fn(),
  findVaultAssetByContentDigest: jest.fn(() => null),
  linkGenerationToVaultAsset: jest.fn(),
  getVaultAsset: jest.fn(() => null),
  getProject: jest.fn(() => null),
  listVaultAssetsForTenant: jest.fn(() => []),
  linkGoalToVaultAsset: jest.fn(),
}));

import { readFileSync } from 'fs';
import { join } from 'path';
import { generateImage, generateVideo } from '../generation-service';
import { resetRateLimiterForTests } from '../rate-limiter';
import { SovereignModelRegistry } from '../../sovereign-model-selection/sovereign-model-registry';
import { SovereignModelSelector } from '../../sovereign-model-selection/sovereign-model-selector';
import { IMAGE_MODEL_FLEET } from '../../sovereign-model-selection/image-model-fleet';
import { VIDEO_MODEL_FLEET } from '../../sovereign-model-selection/video-model-fleet';
import { buildImageCreationIntent } from '../../sovereign-model-selection/intent-builder';
import type { SovereignMediaModelDescriptor } from '../../sovereign-model-selection/types';

const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');
const SERVICE = read('src/qiyamah-generation/generation-service.ts');

const model = (over: Partial<SovereignMediaModelDescriptor>): SovereignMediaModelDescriptor => ({
  modelId: 'm', providerId: 'magic-hour-image', gatewayId: 'magic-hour',
  providerModelId: 'pm', displayName: 'D', sovereignNameAr: 'ن', sovereignNoteAr: 'و',
  mediaType: 'image', capabilities: ['text-to-image'], qualityTier: 'high',
  maxImageResolution: '2k',
  supportedAspectRatios: ['16:9', '9:16', '1:1'], characteristicHints: [], supportedStyleIds: [],
  costCatalogKey: { gatewayId: 'magic-hour', capabilityTarget: 'image-generation' },
  verificationStatus: 'production', productionAuthorized: true, active: true,
  ...over,
} as SovereignMediaModelDescriptor);

const selectWith = (models: readonly SovereignMediaModelDescriptor[]) => {
  const registry = new SovereignModelRegistry();
  for (const m of models) registry.register(m);
  return new SovereignModelSelector(registry)
    .select(buildImageCreationIntent('مشهد', 'cinematic'));
};

beforeEach(() => { resetRateLimiterForTests(); mockOrchestrate.mockReset(); });

// ─────────────────────────────────────────────────────────────────────────────
describe('1 · a registered adapter alone cannot authorize production', () => {
  it('the chamber refuses before the orchestrator is reached at all', async () => {
    // An unknown STYLE is not a non-selection — the intent builder resolves it
    // and an authorised model still answers, which is correct. A real
    // non-selection is what must be used: a model id the fleet does not hold.
    const r = await generateImage({ prompt: 'مشهد', testOnlyModelId: 'not-a-fleet-model' });
    expect(r.status).toBe('failed');
    expect(mockOrchestrate).not.toHaveBeenCalled();
  });

  it('no non-selection reaches the orchestrator — the fall-through is gone', () => {
    expect(SERVICE).not.toContain("fall through to the legacy orchestration path (no preferredProviderId");
    // Both paths refuse on every reason, including the one that used to pass.
    const refusals = SERVICE.match(/selectionResult\.reason === 'all-candidates-unverified'/g) ?? [];
    expect(refusals.length).toBe(2); // the image path and the video path
    expect(SERVICE).not.toMatch(/else if \(selectionResult\.reason !== 'all-candidates-unverified'\)/);
  });
});

describe('2 · active:false blocks execution even when authorized', () => {
  it('a retired model is not selected', () => {
    const r = selectWith([model({ modelId: 'retired', productionAuthorized: true, active: false })]);
    expect(r.selected).toBe(false);
  });
});

describe('3 · productionAuthorized:false blocks execution even when active', () => {
  it('an unauthorized model is not selected', () => {
    const r = selectWith([model({ modelId: 'awaiting', productionAuthorized: false, active: true })]);
    expect(r.selected).toBe(false);
  });
});

describe('4 · both flags are necessary but not sufficient', () => {
  it('a model that cannot meet the required quality refuses, and is never downgraded to', () => {
    // `advertising` demands the ultra tier (STYLE_QUALITY_MAP). A fully
    // authorised, fully active model that only reaches `standard` is still
    // refused — both flags are necessary, and not sufficient.
    const registry = new SovereignModelRegistry();
    registry.register(model({ modelId: 'too-low', qualityTier: 'standard', maxImageResolution: '1k' }));
    const r = new SovereignModelSelector(registry)
      .select(buildImageCreationIntent('مشهد', 'advertising'));
    expect(r.selected).toBe(false);
    if (!r.selected) {
      expect(r.reason).toBe('quality-unavailable');
      // And it is NOT the «nothing authorised» reason — the model WAS
      // authorised; it simply could not do the work.
      expect(r.reason).not.toBe('all-candidates-unverified');
    }
  });

  it('a model that cannot meet the required resolution refuses too', () => {
    const registry = new SovereignModelRegistry();
    registry.register(model({ modelId: 'low-res', qualityTier: 'ultra', maxImageResolution: '1k' }));
    const r = new SovereignModelSelector(registry)
      .select(buildImageCreationIntent('مشهد', 'advertising'));
    expect(r.selected).toBe(false);
    if (!r.selected) expect(r.reason).toBe('resolution-unavailable');
  });

  it('a required model that is not authorized is refused, not replaced', () => {
    const registry = new SovereignModelRegistry();
    registry.register(model({ modelId: 'authorized-other' }));
    registry.register(model({ modelId: 'required-but-off', productionAuthorized: false, active: true }));
    const intent = { ...buildImageCreationIntent('مشهد', 'cinematic'), requiredModelId: 'required-but-off' };
    const r = new SovereignModelSelector(registry).select(intent);
    expect(r.selected).toBe(false);
    if (!r.selected) expect(r.reason).toBe('required-model-unavailable');
  });
});

describe('5 · the legacy orchestration path cannot be reached unselected', () => {
  it('the image path returns a refusal rather than orchestrating', async () => {
    const r = await generateImage({ prompt: 'مشهد', testOnlyModelId: 'not-a-fleet-model' });
    expect(r.status).toBe('failed');
    if (r.status === 'failed') expect(r.reason).toBe('provider-error');
    expect(mockOrchestrate).not.toHaveBeenCalled();
  });

  it('the video path refuses on an impossible duration instead of orchestrating', async () => {
    const r = await generateVideo({ prompt: 'مشهد', durationSeconds: 9999 });
    expect(r.status).toBe('failed');
    expect(mockOrchestrate).not.toHaveBeenCalled();
  });

  it('the refusal a Creator reads names no provider and is in their language', async () => {
    const r = await generateVideo({ prompt: 'مشهد', durationSeconds: 9999 });
    if (r.status === 'failed') {
      expect(r.message).toMatch(/[؀-ۿ]/);
      expect(r.message).not.toMatch(/magic.?hour|openai|nano.?banana|minimax|veo|seedance|kling|ltx|flux/i);
    }
  });
});

describe('6 · the three unresolved models remain blocked', () => {
  it.each(['z-image-turbo', 'ltx-2-3', 'kling-3-0'])('%s is not selectable', (id) => {
    const all = [...IMAGE_MODEL_FLEET, ...VIDEO_MODEL_FLEET];
    const m = all.find((x) => x.modelId === id);
    expect(m).toBeDefined();
    const registry = new SovereignModelRegistry();
    for (const x of all) registry.register(x);
    expect(registry.findProductionAuthorized(m!.mediaType).map((x) => x.modelId)).not.toContain(id);
  });

  it('their flags are UNCHANGED by this package', () => {
    // Asserting the exclusion, never a flag's value: if the Chief Architect
    // authorises one, it becomes selectable by HIS edit and this still passes.
    for (const id of ['z-image-turbo', 'ltx-2-3', 'kling-3-0']) {
      const m = [...IMAGE_MODEL_FLEET, ...VIDEO_MODEL_FLEET].find((x) => x.modelId === id)!;
      if (!m.productionAuthorized || !m.active) {
        const registry = new SovereignModelRegistry();
        registry.register(m);
        expect(registry.findProductionAuthorized(m.mediaType)).toHaveLength(0);
      }
    }
  });

  it('historical production is not read as current authorization', () => {
    // All three produced real assets. Nothing in the selection path consults
    // production history, and no note can authorise.
    const reg = read('src/sovereign-model-selection/sovereign-model-registry.ts');
    const sel = read('src/sovereign-model-selection/sovereign-model-selector.ts');
    for (const src of [reg, sel]) {
      expect(src).not.toMatch(/internalNotes|generationModel|vault_assets|historicallyProven/);
    }
  });
});

describe('7 · the authorized models still reach their adapters', () => {
  it('an authorized active model is selected and carries its provider binding', () => {
    const r = selectWith([model({ modelId: 'live-one', providerModelId: 'pm-live' })]);
    expect(r.selected).toBe(true);
    if (r.selected) {
      expect(r.selection.modelId).toBe('live-one');
      expect(r.selection.providerModelId).toBe('pm-live');
    }
  });

  it('the real fleet still yields a designated model for image and for video', () => {
    for (const [fleet, media] of [[IMAGE_MODEL_FLEET, 'image'], [VIDEO_MODEL_FLEET, 'video']] as const) {
      const registry = new SovereignModelRegistry();
      for (const m of fleet) registry.register(m);
      expect(registry.findProductionAuthorized(media).length).toBeGreaterThan(0);
    }
  });
});

describe('8 · failing closed does not duplicate, bypass recovery, or misreport', () => {
  it('a refusal never calls the orchestrator, so no paid operation can start', async () => {
    await generateVideo({ prompt: 'مشهد', durationSeconds: 9999 });
    expect(mockOrchestrate).not.toHaveBeenCalled();
  });

  it('a refusal is reported as failed with a reason, never as a success', async () => {
    const r = await generateVideo({ prompt: 'مشهد', durationSeconds: 9999 });
    expect(r.status).toBe('failed');
    if (r.status === 'failed') expect(r.reason).toBe('provider-error');
  });

  it('the refusal is raised at `select`, before any intent key is spent', () => {
    // `failAt(trail, ..., 'select', 'selection', ...)` — the stage is named, so
    // a caller's idempotency key is still unused and recovery is unaffected.
    expect(SERVICE).toContain("failAt(trail, 'provider-error', 'select', 'selection',");
  });
});

describe('9 · every execution entry point is protected', () => {
  it('the edit act checks both flags before dispatching its hard-coded model', () => {
    // The act moved out of the route on 2026-10-19, so that رأس الأمر could
    // make one scene out of another scene's approved frame without a second
    // authority on how an edited image becomes a sovereign asset. The RULE is
    // unchanged and is asserted in the same words — at the one place that now
    // dispatches, which is what «entry point» means.
    const r = read('src/qiyamah-generation/image-edit-service.ts');
    expect(r).toContain('IMAGE_MODEL_FLEET.find((m) => m.modelId === IMAGE_EDIT_MODEL_ID)');
    expect(r).toContain('!editBinding.productionAuthorized || !editBinding.active');
    // And the check precedes the dispatch.
    expect(r.indexOf('editBinding')).toBeLessThan(r.indexOf('await editImageViaProvider('));
  });

  it('and the route no longer dispatches at all, so it cannot bypass that check', () => {
    // A thin door is only thin while it stays thin: if a future edit calls the
    // provider from the route again, the flags above would not be consulted.
    const r = read('app/api/vault/assets/[assetId]/edit/route.ts');
    expect(r).not.toContain('editImageViaProvider(');
    expect(r).toContain('editSovereignImage(');
  });

  it('the animate route refuses when the selector does not select', () => {
    const r = read('app/api/vault/assets/[assetId]/animate/route.ts');
    expect(r).toContain('getProductionSelector().select(');
    expect(r).toContain('if (!selection.selected)');
    expect(r.indexOf('if (!selection.selected)')).toBeLessThan(r.indexOf('animateImageViaProvider('));
  });

  it('the upscale route binds no model, so it has no model to authorize', () => {
    const r = read('app/api/vault/assets/[assetId]/upscale/route.ts');
    expect(r).toContain('upscaleImageViaProvider(');
    // No model argument exists on this call — there is nothing to choose.
    expect(r).not.toMatch(/upscaleImageViaProvider\([^)]*model/);
  });

  it('the Founder-gated test path is the one deliberate exception, and it is gated', () => {
    const r = read('app/api/sovereign/model-test/route.ts');
    expect(r).toContain('verifyFounderSession');
    // And the production route never reads the override.
    expect(read('app/api/qiyamah/generate/route.ts')).not.toContain('testOnlyModelId');
  });
});
