/**
 * AZMA OS — RAS AL AMR, PHASE 2: the frame a storyboard chose reaches the
 * picture that is commissioned for it.
 *
 * ─── THE DEFECT THESE TESTS WERE WRITTEN AGAINST ────────────────────────────
 *
 *   MEASURED at 57adbda: `GenerationRequest.platformTarget` existed and was
 *   honoured all the way to the provider payload — proven in Phase 1 — and the
 *   storyboard road filled it with nothing. A Creator could select «عمودي» in
 *   the chamber, watch a 9:16 preview, and have every commissioned scene
 *   generated 16:9, because `commissionScenePictures` named no frame.
 *
 * ─── WHERE THESE TESTS STOP, AND WHY THAT IS THE RIGHT PLACE ────────────────
 *
 *   The one double is the generation ORCHESTRATOR — the Empire's own boundary
 *   with every provider. Everything between the courier and that boundary is
 *   real code: the real `generateImage`, the real `buildImageCreationIntent`,
 *   the real production selector, the real `platform-adapter`. So what is
 *   asserted below is the metadata the adapter reads at
 *   magic-hour-adapter.ts:276 and sends as `aspect_ratio` — not a value this
 *   file arranged to see.
 *
 *   No provider is constructed, no socket is opened, nothing is charged. The
 *   last test proves that rather than claiming it.
 */

// ─── MOCKS (before any import) ───────────────────────────────────────────────

const mockOrchestrate = jest.fn();

jest.mock('../../core/sovereign-ai-integration/provider-bootstrap', () => ({
  getGenerationOrchestrator: () => ({ orchestrate: mockOrchestrate }),
}));
jest.mock('../../qiyamah-generation/asset-storage', () => ({
  ...jest.requireActual('../../qiyamah-generation/asset-storage'),
  persistGeneratedImage: jest.fn(),
}));
// The same double the generation service's own suite uses, for the same
// reason: a double that does not mirror its module tests something that does
// not exist.
jest.mock('../../persistent-storage', () => ({
  getDb: jest.fn(() => 'fake-db-handle'),
  recordGeneration: jest.fn(),
  insertVaultAsset: jest.fn(),
  findVaultAssetByContentDigest: jest.fn(() => null),
  linkGenerationToVaultAsset: jest.fn(),
  getVaultAsset: jest.fn(() => null),
  getProject: jest.fn(() => null),
  listVaultAssetsForTenant: jest.fn(() => []),
  linkGoalToVaultAsset: jest.fn(),
}));

// ─── IMPORTS ─────────────────────────────────────────────────────────────────

import { join } from 'path';
import { tmpdir } from 'os';
import { persistGeneratedImage } from '../../qiyamah-generation/asset-storage';
import { resetRateLimiterForTests } from '../../qiyamah-generation/rate-limiter';
import { commissionScenePictures } from '../qiyamah-commission';
import { OUTPUT_PROFILES } from '../../chambers/ras-al-amr/cinematic-timing';
import { getDefaultAspectRatio } from '../../sovereign-model-selection';

const mockPersistGeneratedImage = persistGeneratedImage as jest.Mock;

// A PNG header long enough to clear the format-integrity gate. The bytes never
// touch a disk: `persistGeneratedImage` is the double above.
const PNG_B64 = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(59, 0x00),
]).toString('base64');

/** One scene, commissioned for a given profile. Answers the provider metadata. */
async function commissionInProfile(profile?: keyof typeof OUTPUT_PROFILES) {
  mockOrchestrate.mockResolvedValue({ response: { finishReason: 'completed', content: PNG_B64 } });
  mockPersistGeneratedImage.mockResolvedValue({
    assetId: 'asset-under-test',
    assetUrl: '/generated-assets/asset-under-test.png',
  });

  const results = await commissionScenePictures({
    creatorId: 'creator-frame-test',
    // `founder` so the REAL entitlement guard runs and passes, rather than
    // being replaced by a double. Entitlement is not what is under test here,
    // and it is guarded by its own tests.
    creatorRole: 'founder',
    demands: [{ order: 1, demandAr: 'لقطةٌ لمنتجٍ على منصّةٍ ذهبيّة', seenAr: 'المشهد الأوّل' }],
    ...(profile ? { platformTarget: OUTPUT_PROFILES[profile].platformTarget } : {}),
  });

  expect(mockOrchestrate).toHaveBeenCalledTimes(1);
  return {
    metadata: mockOrchestrate.mock.calls[0][0].metadata as Record<string, unknown>,
    results,
  };
}

describe('Ras Al Amr to Qiyamah: the frame a storyboard chose', () => {
  beforeEach(() => {
    resetRateLimiterForTests();
    mockOrchestrate.mockReset();
    mockPersistGeneratedImage.mockReset();
    // The handoff copies the finished picture where the production workshop can
    // open it. That path is not under test, and must not be this host's real
    // provider directory: it is pointed at a scratch directory, where the copy
    // of a mocked asset simply fails and the scene carries no workshop path —
    // exactly as it would if the handoff failed in production.
    process.env['MPT_HANDOFF_DIR'] = join(tmpdir(), 'azma-frame-test-handoff');
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    delete process.env['MPT_HANDOFF_DIR'];
    jest.restoreAllMocks();
  });

  it('a portrait storyboard commissions a portrait picture', async () => {
    const { metadata } = await commissionInProfile('portrait');
    expect(metadata).toMatchObject({ aspectRatio: '9:16' });
  });

  it('a landscape storyboard commissions a landscape picture', async () => {
    const { metadata } = await commissionInProfile('landscape');
    expect(metadata).toMatchObject({ aspectRatio: '16:9' });
  });

  it('a square storyboard commissions a square picture', async () => {
    const { metadata } = await commissionInProfile('square');
    expect(metadata).toMatchObject({ aspectRatio: '1:1' });
  });

  it('naming no frame leaves every older caller exactly where it was', async () => {
    // The whole guarantee for the callers that existed before this phase:
    // omitting the frame must be indistinguishable from the parameter never
    // having existed. 16:9 is platform-adapter.ts's documented default,
    // asserted rather than restated as a rule of this module.
    const { metadata, results } = await commissionInProfile();
    expect(metadata).toMatchObject({ aspectRatio: '16:9' });
    // And it still COMPLETES. The id asserted here is deliberately not a
    // literal: what comes back is the SOVEREIGN asset's id, minted by the
    // Vault deposit, not the id of the file that was persisted — a file id is
    // not an asset id, and a test that confuses them pins the wrong thing.
    expect(results[0]?.failure).toBeUndefined();
    expect(results[0]?.assetUrl).toBe('/generated-assets/asset-under-test.png');
  });

  it('the 4:5 feed frame is contained in the nearest portrait, by the platform own rule', async () => {
    // DECLARED, not covered: the generation vocabulary has no 4:5 name, so the
    // nearest portrait one is used. `assessMasterAdaptability` is the authority
    // that makes that the correct commission — it classes 9:16 serving 4:5 as
    // `crop-adapt` («reframing only; no new generation»), where a landscape
    // master for a portrait frame would be `regenerate-required`.
    const { metadata } = await commissionInProfile('portrait-feed');
    expect(metadata).toMatchObject({ aspectRatio: '9:16' });
  });

  it('the courier invents no vocabulary: every frame names a platform the adapter knows', () => {
    // The courier carries a NAME and understands none of it. If a profile ever
    // declared a name `platform-adapter.ts` does not hold, that map answers
    // 16:9 for it and a portrait film would quietly come back landscape — this
    // phase's defect, returned through a different door. So each declared name
    // is required to resolve to the shape its own row already states.
    const expectedRatio: Record<keyof typeof OUTPUT_PROFILES, string> = {
      landscape: '16:9',
      portrait: '9:16',
      square: '1:1',
      'portrait-feed': '9:16',
    };
    for (const [profile, frame] of Object.entries(OUTPUT_PROFILES)) {
      expect(getDefaultAspectRatio(frame.platformTarget))
        .toBe(expectedRatio[profile as keyof typeof OUTPUT_PROFILES]);
    }
  });

  it('reaches no provider and spends nothing: the orchestrator is the only boundary crossed', async () => {
    const realFetch = global.fetch;
    const spy = jest.fn();
    (global as unknown as { fetch: unknown }).fetch = spy;
    try {
      await commissionInProfile('portrait');
      expect(spy).not.toHaveBeenCalled();
      expect(mockOrchestrate).toHaveBeenCalledTimes(1);
    } finally {
      (global as unknown as { fetch: unknown }).fetch = realFetch;
    }
  });
});
