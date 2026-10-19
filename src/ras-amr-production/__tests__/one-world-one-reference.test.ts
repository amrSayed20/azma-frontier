/**
 * AZMA OS — RAS AL AMR, PHASE 4: one shared world, one approved reference.
 *
 * ─── WHAT IS PROVEN HERE, AND WHAT CANNOT BE ────────────────────────────────
 *
 *   PROVEN, with the provider doubled: the APPROVED frame is the asset handed
 *   to the image editor; the shared visual world reaches every scene on both
 *   roads; each scene's own instruction differs while the reference does not;
 *   each named refusal keeps its own cure.
 *
 *   NOT PROVEN HERE, and not claimed anywhere: how much of a product or a face
 *   actually survives an edit. That is a question only a real, paid generation
 *   can answer, and this Empire has not asked it. The mechanism is what is
 *   built and tested; the consistency it yields is unmeasured.
 */

const mockEdit = jest.fn();
const mockGenerate = jest.fn();

jest.mock('../../qiyamah-generation/image-edit-service', () => ({
  editSovereignImage: mockEdit,
}));
jest.mock('../../qiyamah-generation/generation-service', () => ({
  generateImage: mockGenerate,
}));
jest.mock('../../persistent-storage', () => ({
  getDb: jest.fn(() => 'fake-db-handle'),
}));

import { join } from 'path';
import { tmpdir } from 'os';
import {
  commissionScenePictures,
  composeSceneInstruction,
  commissionFailureSpokenAr,
} from '../qiyamah-commission';
import type { CommissionFailure } from '../qiyamah-commission';

const WORLD = 'مطبخٌ خشبيٌّ داكن، ضوءٌ ذهبيٌّ جانبيّ، خلفيّةٌ معتمة.';
const DEMANDS = [
  { order: 1, sceneId: 'scene-1', demandAr: 'برطمانُ العسلِ على الطاولة', seenAr: 'أوّل' },
  { order: 2, sceneId: 'scene-2', demandAr: 'ملعقةٌ ترفعُ خيطَ عسلٍ ذهبيّاً', seenAr: 'ثانٍ' },
  { order: 3, sceneId: 'scene-3', demandAr: 'يدٌ تُقدّمُ البرطمانَ نحوَ الكاميرا', seenAr: 'ثالث' },
];

const editedAs = (assetId: string) => ({
  status: 'succeeded' as const,
  asset: { assetId, secureStorageUri: `/uploads/${assetId}.png` },
  lineage: { parentAssetId: 'asset-reference', rootAssetId: 'asset-reference', version: 2 },
});

async function commission(extra: Record<string, unknown> = {}) {
  return commissionScenePictures({
    creatorId: 'creator-ref',
    // `founder` so the REAL entitlement guard runs and passes rather than
    // being replaced by a double; entitlement has its own tests.
    creatorRole: 'founder',
    demands: DEMANDS,
    ...extra,
  });
}

describe('one shared world, one approved reference', () => {
  beforeEach(() => {
    mockEdit.mockReset();
    mockGenerate.mockReset();
    process.env['MPT_HANDOFF_DIR'] = join(tmpdir(), 'azma-ref-test-handoff');
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    delete process.env['MPT_HANDOFF_DIR'];
    jest.restoreAllMocks();
  });

  it('the APPROVED frame is the asset the editor is given — every time', async () => {
    mockEdit
      .mockResolvedValueOnce(editedAs('asset-a'))
      .mockResolvedValueOnce(editedAs('asset-b'))
      .mockResolvedValueOnce(editedAs('asset-c'));

    const results = await commission({ referenceAssetId: 'asset-reference', visualWorldAr: WORLD });

    expect(mockEdit).toHaveBeenCalledTimes(3);
    for (const call of mockEdit.mock.calls) {
      expect(call[0].assetId).toBe('asset-reference');
      expect(call[0].creatorId).toBe('creator-ref');
    }
    // And nothing was generated from words: the reference road replaces it.
    expect(mockGenerate).not.toHaveBeenCalled();
    expect(results.map((r) => r.assetId)).toEqual(['asset-a', 'asset-b', 'asset-c']);
    expect(results.every((r) => r.usedReference)).toBe(true);
  });

  it('the shared world reaches every scene, and so does each scene own demand', async () => {
    mockEdit.mockResolvedValue(editedAs('asset-x'));

    await commission({ referenceAssetId: 'asset-reference', visualWorldAr: WORLD });

    const instructions = mockEdit.mock.calls.map((c) => c[0].instructionAr as string);
    expect(instructions).toHaveLength(3);
    for (const [i, instruction] of instructions.entries()) {
      expect(instruction).toContain(WORLD);                       // the world, unchanged
      expect(instruction).toContain(DEMANDS[i].demandAr);         // and this scene's own words
    }
  });

  it('the instructions DIFFER from each other while the reference stays the same', async () => {
    // The whole point of the road: one subject, three shots. If the three
    // instructions were equal, three identical pictures would be bought.
    mockEdit.mockResolvedValue(editedAs('asset-x'));

    await commission({ referenceAssetId: 'asset-reference', visualWorldAr: WORLD });

    const instructions = mockEdit.mock.calls.map((c) => c[0].instructionAr as string);
    expect(new Set(instructions).size).toBe(3);
    expect(new Set(mockEdit.mock.calls.map((c) => c[0].assetId as string)).size).toBe(1);
  });

  it('the world reaches the words road too, when there is no reference yet', async () => {
    // The first frame of a film has nothing to be built on, so it is generated
    // — and it must still belong to the same world, or the frame everything
    // else is built on would be the one frame outside it.
    mockGenerate.mockResolvedValue({
      status: 'succeeded',
      asset: { assetId: 'asset-first', assetUrl: '/generated-assets/asset-first.png' },
    });

    await commission({ visualWorldAr: WORLD });

    expect(mockEdit).not.toHaveBeenCalled();
    expect(mockGenerate).toHaveBeenCalledTimes(3);
    for (const [i, call] of mockGenerate.mock.calls.entries()) {
      expect(call[0].prompt).toContain(WORLD);
      expect(call[0].prompt).toContain(DEMANDS[i].demandAr);
    }
  });

  it('no world written means the instruction is the demand alone, exactly as before', async () => {
    // The guarantee for every caller that existed before this road: an absent
    // world is indistinguishable from the parameter never having existed.
    mockGenerate.mockResolvedValue({
      status: 'succeeded',
      asset: { assetId: 'a', assetUrl: '/generated-assets/a.png' },
    });

    await commission();

    expect(mockGenerate.mock.calls[0][0].prompt).toBe(DEMANDS[0].demandAr);
    expect(composeSceneInstruction({ demandAr: 'نصٌّ وحدَه' })).toBe('نصٌّ وحدَه');
  });

  it('each refusal of the editor keeps its own cure, and none becomes «it failed»', async () => {
    // The Founder, 2026-10-19: «افصل بين فشل المزوّد وفشل الحفظ وفشل ربط الأصل
    // بالمشهد.» These are the editor's own refusals, each carried to a name
    // whose sentence tells the Creator something different to DO.
    const cases: ReadonlyArray<[string, CommissionFailure]> = [
      ['no-credit', 'NO_CAPACITY'],
      ['timed-out', 'TIMED_OUT'],
      ['capability-unavailable', 'EDITOR_UNAVAILABLE'],
      ['model-unavailable', 'EDITOR_UNAVAILABLE'],
      ['rejected-by-lineage', 'UNCHANGED_BY_EDITOR'],
      ['not-found', 'REFERENCE_UNUSABLE'],
      ['not-derivable', 'REFERENCE_UNUSABLE'],
      ['source-unreadable', 'REFERENCE_UNUSABLE'],
      ['edit-failed', 'GENERATION_FAILED'],
    ];

    for (const [refusal, expected] of cases) {
      mockEdit.mockReset();
      mockEdit.mockResolvedValue({ status: 'failed', refusal });
      const results = await commissionScenePictures({
        creatorId: 'creator-ref', creatorRole: 'founder',
        demands: [DEMANDS[0]], referenceAssetId: 'asset-reference',
      });
      expect(results[0]).toMatchObject({ failure: expected, usedReference: true, sceneId: 'scene-1' });
      // And the sentence a Creator reads names no provider and no model.
      const spoken = commissionFailureSpokenAr(expected);
      expect(spoken.length).toBeGreaterThan(10);
      expect(spoken).not.toMatch(/magic|nano|banana|http|api/i);
    }
  });

  it('a scene that fails on the reference road does not fall back to generating from words', async () => {
    // Silently generating a lone picture for a scene whose siblings were all
    // built on the approved frame would break the very consistency the road
    // exists for — and the Creator would never be told that one shot came
    // from somewhere else.
    mockEdit.mockResolvedValue({ status: 'failed', refusal: 'edit-failed' });

    const results = await commission({ referenceAssetId: 'asset-reference' });

    expect(mockGenerate).not.toHaveBeenCalled();
    expect(results.every((r) => r.failure === 'GENERATION_FAILED')).toBe(true);
  });

  it('every frame comes back as its own sovereign asset, never a provider address', async () => {
    mockEdit
      .mockResolvedValueOnce(editedAs('asset-a'))
      .mockResolvedValueOnce(editedAs('asset-b'))
      .mockResolvedValueOnce(editedAs('asset-c'));

    const results = await commission({ referenceAssetId: 'asset-reference' });

    for (const r of results) {
      expect(r.assetId).toMatch(/^asset-/);
      expect(r.assetUrl).toMatch(/^\/uploads\//);
      expect(r.assetUrl).not.toMatch(/^https?:/);
    }
    // Three scenes, three distinct assets: the reference was not re-used as
    // the answer for any of them.
    expect(new Set(results.map((r) => r.assetId)).size).toBe(3);
    expect(results.map((r) => r.assetId)).not.toContain('asset-reference');
  });
});
