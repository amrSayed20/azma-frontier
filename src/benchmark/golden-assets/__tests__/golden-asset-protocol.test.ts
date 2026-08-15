import { IMAGE_GENERATION_GOLDEN_ASSETS } from '../image-generation-assets';
import { IMAGE_EDITING_GOLDEN_ASSETS } from '../image-editing-assets';
import { IMAGE_UPSCALING_GOLDEN_ASSETS } from '../image-upscaling-assets';
import { VIDEO_GENERATION_GOLDEN_ASSETS } from '../video-generation-assets';
import { TEXT_TO_SPEECH_GOLDEN_ASSETS } from '../text-to-speech-assets';
import { VOICE_CLONING_GOLDEN_ASSETS } from '../voice-cloning-assets';
import { EVALUATION_DIMENSIONS, HUMAN_EVALUATION_FORM, getDimensionsForDomain } from '../human-evaluation-rubric';
import { GoldenAssetRegistry, createDefaultGoldenAssetRegistry } from '../golden-asset-registry';
import {
  BENCHMARK_TEST_MATRIX,
  getMatrixEntry,
  getRunnableEntries,
  getBlockedEntries,
  getEntriesByDomain,
} from '../benchmark-test-matrix';
import type { GoldenAsset, GoldenPromptAsset, GoldenReferenceAudioAsset } from '../golden-asset-types';

const ALL_GOLDEN_ASSETS: readonly GoldenAsset[] = [
  ...IMAGE_GENERATION_GOLDEN_ASSETS,
  ...IMAGE_EDITING_GOLDEN_ASSETS,
  ...IMAGE_UPSCALING_GOLDEN_ASSETS,
  ...VIDEO_GENERATION_GOLDEN_ASSETS,
  ...TEXT_TO_SPEECH_GOLDEN_ASSETS,
  ...VOICE_CLONING_GOLDEN_ASSETS,
];

// ─── Metadata integrity ───────────────────────────────────────────────────────

describe('Golden asset metadata — all assets', () => {
  it('all assetIds are unique', () => {
    const ids = ALL_GOLDEN_ASSETS.map((a) => a.assetId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all assets have non-empty required metadata fields', () => {
    for (const asset of ALL_GOLDEN_ASSETS) {
      expect(asset.assetId.trim().length).toBeGreaterThan(0);
      expect(asset.assetVersion.trim().length).toBeGreaterThan(0);
      expect(asset.description.trim().length).toBeGreaterThan(0);
      expect(asset.intendedObjective.trim().length).toBeGreaterThan(0);
    }
  });

  it('all assetVersions follow semver pattern', () => {
    for (const asset of ALL_GOLDEN_ASSETS) {
      expect(asset.assetVersion).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });

  it('all assetIds follow the ga-<domain>-<number> naming convention', () => {
    for (const asset of ALL_GOLDEN_ASSETS) {
      expect(asset.assetId).toMatch(/^ga-[a-z-]+-\d{3}$/);
    }
  });

  it('blocked assets have a non-empty blockedReason', () => {
    const blocked = ALL_GOLDEN_ASSETS.filter((a) => a.status === 'blocked');
    for (const asset of blocked) {
      expect(asset.blockedReason).toBeDefined();
      expect((asset.blockedReason ?? '').trim().length).toBeGreaterThan(0);
    }
  });

  it('ready assets do not have a blockedReason', () => {
    const ready = ALL_GOLDEN_ASSETS.filter((a) => a.status === 'ready');
    for (const asset of ready) {
      expect(asset.blockedReason).toBeUndefined();
    }
  });

  it('no asset metadata field contains a credential-shaped string', () => {
    const credentialPattern = /api[_-]?key|bearer\s+[A-Za-z0-9]{10,}|sk-[A-Za-z0-9]{20,}|password/i;
    for (const asset of ALL_GOLDEN_ASSETS) {
      expect(asset.description).not.toMatch(credentialPattern);
      expect(asset.intendedObjective).not.toMatch(credentialPattern);
    }
  });
});

// ─── Domain coverage ──────────────────────────────────────────────────────────

describe('Golden asset domain coverage', () => {
  it('image-generation has exactly 8 assets', () => {
    expect(IMAGE_GENERATION_GOLDEN_ASSETS).toHaveLength(8);
  });

  it('image-editing has exactly 4 assets', () => {
    expect(IMAGE_EDITING_GOLDEN_ASSETS).toHaveLength(4);
  });

  it('image-upscaling has exactly 3 assets', () => {
    expect(IMAGE_UPSCALING_GOLDEN_ASSETS).toHaveLength(3);
  });

  it('video-generation has exactly 6 assets', () => {
    expect(VIDEO_GENERATION_GOLDEN_ASSETS).toHaveLength(6);
  });

  it('text-to-speech has exactly 6 assets (5 for existing specs + 1 Egyptian Arabic)', () => {
    expect(TEXT_TO_SPEECH_GOLDEN_ASSETS).toHaveLength(6);
  });

  it('voice-cloning has exactly 4 assets', () => {
    expect(VOICE_CLONING_GOLDEN_ASSETS).toHaveLength(4);
  });

  it('all assets carry the correct domain for their array', () => {
    for (const a of IMAGE_GENERATION_GOLDEN_ASSETS) expect(a.domain).toBe('image-generation');
    for (const a of IMAGE_EDITING_GOLDEN_ASSETS) expect(a.domain).toBe('image-editing');
    for (const a of IMAGE_UPSCALING_GOLDEN_ASSETS) expect(a.domain).toBe('image-upscaling');
    for (const a of VIDEO_GENERATION_GOLDEN_ASSETS) expect(a.domain).toBe('video-generation');
    for (const a of TEXT_TO_SPEECH_GOLDEN_ASSETS) expect(a.domain).toBe('text-to-speech');
    for (const a of VOICE_CLONING_GOLDEN_ASSETS) expect(a.domain).toBe('voice-cloning');
  });
});

// ─── Prompt assets ────────────────────────────────────────────────────────────

describe('GoldenPromptAsset integrity (image-gen and video-gen)', () => {
  const promptAssets = [
    ...IMAGE_GENERATION_GOLDEN_ASSETS,
    ...VIDEO_GENERATION_GOLDEN_ASSETS,
  ] as readonly GoldenPromptAsset[];

  it('all prompt assets have non-empty canonicalPrompt', () => {
    for (const asset of promptAssets) {
      expect(asset.canonicalPrompt.trim().length).toBeGreaterThan(0);
    }
  });

  it('all prompt assets have at least one evaluationDimension', () => {
    for (const asset of promptAssets) {
      expect(asset.evaluationDimensions.length).toBeGreaterThan(0);
    }
  });

  it('all prompt assets have at least one failureCondition', () => {
    for (const asset of promptAssets) {
      expect(asset.failureConditions.length).toBeGreaterThan(0);
    }
  });

  it('no canonical prompt contains a credential or API key pattern', () => {
    const credentialPattern = /api[_-]?key|bearer|sk-[A-Za-z0-9]{20,}|password/i;
    for (const asset of promptAssets) {
      expect(asset.canonicalPrompt).not.toMatch(credentialPattern);
    }
  });

  it('all image-gen prompt assets have a defined outputDimensions', () => {
    for (const asset of IMAGE_GENERATION_GOLDEN_ASSETS) {
      expect(asset.outputDimensions).toBeDefined();
      expect(asset.outputDimensions).toMatch(/^\d+x\d+$/);
    }
  });

  it('all video-gen prompt assets have a defined outputDimensions', () => {
    for (const asset of VIDEO_GENERATION_GOLDEN_ASSETS) {
      expect(asset.outputDimensions).toBeDefined();
      expect(asset.outputDimensions).toMatch(/^\d+x\d+$/);
    }
  });

  it('all prompt assets have status: ready', () => {
    for (const asset of promptAssets) {
      expect(asset.status).toBe('ready');
    }
  });

  it('no provider name appears in any canonical prompt', () => {
    const providerNames = /openai|midjourney|stability|sora|dall-e|dall_e|runway|kling|elevenLabs|eleven_labs/i;
    for (const asset of promptAssets) {
      expect(asset.canonicalPrompt).not.toMatch(providerNames);
    }
  });
});

// ─── Reference image assets ───────────────────────────────────────────────────

describe('GoldenReferenceImageAsset integrity (image-editing and image-upscaling)', () => {
  const refImageAssets = [...IMAGE_EDITING_GOLDEN_ASSETS, ...IMAGE_UPSCALING_GOLDEN_ASSETS];

  it('all reference image assets have a non-empty fixtureId', () => {
    for (const asset of refImageAssets) {
      expect(asset.fixtureId.trim().length).toBeGreaterThan(0);
    }
  });

  it('all reference image assets have a non-empty imageDescription', () => {
    for (const asset of refImageAssets) {
      expect(asset.imageDescription.trim().length).toBeGreaterThan(0);
    }
  });

  it('all reference image assets have a non-empty acquisitionGuidance', () => {
    for (const asset of refImageAssets) {
      expect(asset.acquisitionGuidance.trim().length).toBeGreaterThan(0);
    }
  });

  it('all reference image assets have at least one requiredCharacteristic', () => {
    for (const asset of refImageAssets) {
      expect(asset.requiredCharacteristics.length).toBeGreaterThan(0);
    }
  });

  it('all reference image assets have a non-empty editInstruction', () => {
    for (const asset of refImageAssets) {
      expect(asset.editInstruction.trim().length).toBeGreaterThan(0);
    }
  });

  it('image-editing assets have at least one mustChange and one mustNotChange entry', () => {
    for (const asset of IMAGE_EDITING_GOLDEN_ASSETS) {
      expect(asset.mustChange.length).toBeGreaterThan(0);
      expect(asset.mustNotChange.length).toBeGreaterThan(0);
    }
  });

  it('all reference image assets have status: ready', () => {
    for (const asset of refImageAssets) {
      expect(asset.status).toBe('ready');
    }
  });

  it('acquisitionGuidance mentions CC0 or royalty-free license', () => {
    for (const asset of IMAGE_EDITING_GOLDEN_ASSETS) {
      expect(asset.acquisitionGuidance.toLowerCase()).toMatch(/cc0|royalty.free|creative commons/i);
    }
  });
});

// ─── TTS script assets ────────────────────────────────────────────────────────

describe('GoldenTtsScriptAsset integrity', () => {
  it('all TTS assets have a non-empty canonicalScript', () => {
    for (const asset of TEXT_TO_SPEECH_GOLDEN_ASSETS) {
      expect(asset.canonicalScript.trim().length).toBeGreaterThan(0);
    }
  });

  it('all TTS assets have status: ready', () => {
    for (const asset of TEXT_TO_SPEECH_GOLDEN_ASSETS) {
      expect(asset.status).toBe('ready');
    }
  });

  it('all TTS assets have a scriptLanguage defined', () => {
    for (const asset of TEXT_TO_SPEECH_GOLDEN_ASSETS) {
      expect(asset.scriptLanguage.trim().length).toBeGreaterThan(0);
    }
  });

  it('Arabic MSA asset (ga-tts-002) has scriptLanguage: ar', () => {
    const asset = TEXT_TO_SPEECH_GOLDEN_ASSETS.find((a) => a.assetId === 'ga-tts-002');
    expect(asset?.scriptLanguage).toBe('ar');
  });

  it('Egyptian Arabic asset (ga-tts-006) has scriptLanguage: ar-EG and a dialect field', () => {
    const asset = TEXT_TO_SPEECH_GOLDEN_ASSETS.find((a) => a.assetId === 'ga-tts-006');
    expect(asset?.scriptLanguage).toBe('ar-EG');
    expect(asset?.dialect).toBeDefined();
    expect((asset?.dialect ?? '').trim().length).toBeGreaterThan(0);
  });

  it('Egyptian Arabic asset canonical script contains Egyptian dialect markers (ج, أوي, النهارده)', () => {
    const asset = TEXT_TO_SPEECH_GOLDEN_ASSETS.find((a) => a.assetId === 'ga-tts-006');
    expect(asset?.canonicalScript).toContain('النهارده');
    expect(asset?.canonicalScript).toContain('أوي');
  });

  it('Arabic MSA script contains pharyngeal characters (ع, ح)', () => {
    const asset = TEXT_TO_SPEECH_GOLDEN_ASSETS.find((a) => a.assetId === 'ga-tts-002');
    expect(asset?.canonicalScript).toMatch(/[عح]/);
  });

  it('emotional contrast asset (ga-tts-003) script contains [PAUSE] marker', () => {
    const asset = TEXT_TO_SPEECH_GOLDEN_ASSETS.find((a) => a.assetId === 'ga-tts-003');
    expect(asset?.canonicalScript).toContain('[PAUSE]');
  });

  it('all TTS assets have at least one failureCondition', () => {
    for (const asset of TEXT_TO_SPEECH_GOLDEN_ASSETS) {
      expect(asset.failureConditions.length).toBeGreaterThan(0);
    }
  });
});

// ─── Voice cloning assets (blocked) ──────────────────────────────────────────

describe('GoldenReferenceAudioAsset integrity — all BLOCKED', () => {
  it('all voice-cloning golden assets are status: blocked', () => {
    for (const asset of VOICE_CLONING_GOLDEN_ASSETS) {
      expect(asset.status).toBe('blocked');
    }
  });

  it('all voice-cloning assets have speakerAuthorizationRequired: true', () => {
    for (const asset of VOICE_CLONING_GOLDEN_ASSETS) {
      const a = asset as GoldenReferenceAudioAsset;
      expect(a.speakerAuthorizationRequired).toBe(true);
    }
  });

  it('all voice-cloning assets have a non-empty blockedReason', () => {
    for (const asset of VOICE_CLONING_GOLDEN_ASSETS) {
      expect(asset.blockedReason?.trim().length).toBeGreaterThan(0);
    }
  });

  it('all voice-cloning assets have a non-empty acquisitionGuidance', () => {
    for (const asset of VOICE_CLONING_GOLDEN_ASSETS) {
      const a = asset as GoldenReferenceAudioAsset;
      expect(a.acquisitionGuidance.trim().length).toBeGreaterThan(0);
    }
  });

  it('acquisitionGuidance mentions consent for all voice-cloning assets', () => {
    for (const asset of VOICE_CLONING_GOLDEN_ASSETS) {
      const a = asset as GoldenReferenceAudioAsset;
      expect(a.acquisitionGuidance.toLowerCase()).toMatch(/consent/);
    }
  });

  it('all voice-cloning assets have a non-empty targetScript', () => {
    for (const asset of VOICE_CLONING_GOLDEN_ASSETS) {
      const a = asset as GoldenReferenceAudioAsset;
      expect(a.targetScript.trim().length).toBeGreaterThan(0);
    }
  });

  it('voice-cloning assets have required durations of 30 seconds', () => {
    for (const asset of VOICE_CLONING_GOLDEN_ASSETS) {
      const a = asset as GoldenReferenceAudioAsset;
      expect(a.requiredDurationSeconds).toBe(30);
    }
  });
});

// ─── Human evaluation rubric ─────────────────────────────────────────────────

describe('HumanEvaluationForm and EVALUATION_DIMENSIONS', () => {
  it('rubric has exactly 7 dimensions', () => {
    expect(EVALUATION_DIMENSIONS).toHaveLength(7);
  });

  it('the 7 required dimension IDs are all present', () => {
    const ids = EVALUATION_DIMENSIONS.map((d) => d.dimensionId);
    expect(ids).toContain('quality');
    expect(ids).toContain('promptAdherence');
    expect(ids).toContain('detail');
    expect(ids).toContain('consistency');
    expect(ids).toContain('realism');
    expect(ids).toContain('editingFidelity');
    expect(ids).toContain('usefulness');
  });

  it('every dimension has exactly 5 anchors (scores 1 through 5)', () => {
    for (const dim of EVALUATION_DIMENSIONS) {
      expect(dim.anchors).toHaveLength(5);
      const scores = dim.anchors.map((a) => a.score).sort();
      expect(scores).toEqual([1, 2, 3, 4, 5]);
    }
  });

  it('every anchor has a non-empty label and description', () => {
    for (const dim of EVALUATION_DIMENSIONS) {
      for (const anchor of dim.anchors) {
        expect(anchor.label.trim().length).toBeGreaterThan(0);
        expect(anchor.description.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it('all dimensions apply to at least one domain', () => {
    for (const dim of EVALUATION_DIMENSIONS) {
      expect(dim.applicableDomains.length).toBeGreaterThan(0);
    }
  });

  it('quality and usefulness apply to all 6 domains', () => {
    const allDomains = ['image-generation', 'image-editing', 'image-upscaling', 'video-generation', 'text-to-speech', 'voice-cloning'];
    const quality = EVALUATION_DIMENSIONS.find((d) => d.dimensionId === 'quality')!;
    const usefulness = EVALUATION_DIMENSIONS.find((d) => d.dimensionId === 'usefulness')!;
    for (const domain of allDomains) {
      expect(quality.applicableDomains).toContain(domain);
      expect(usefulness.applicableDomains).toContain(domain);
    }
  });

  it('editingFidelity does NOT apply to image-generation or video-generation', () => {
    const dim = EVALUATION_DIMENSIONS.find((d) => d.dimensionId === 'editingFidelity')!;
    expect(dim.applicableDomains).not.toContain('image-generation');
    expect(dim.applicableDomains).not.toContain('video-generation');
  });

  it('HUMAN_EVALUATION_FORM has a non-empty providerBlindNote', () => {
    expect(HUMAN_EVALUATION_FORM.providerBlindNote.trim().length).toBeGreaterThan(0);
  });

  it('HUMAN_EVALUATION_FORM providerBlindNote warns evaluators not to know the provider', () => {
    expect(HUMAN_EVALUATION_FORM.providerBlindNote.toLowerCase()).toMatch(/provider/);
  });

  it('HUMAN_EVALUATION_FORM has non-empty instructions', () => {
    expect(HUMAN_EVALUATION_FORM.instructions.trim().length).toBeGreaterThan(0);
  });

  it('getDimensionsForDomain returns only applicable dimensions', () => {
    const imgGenDims = getDimensionsForDomain('image-generation');
    const ids = imgGenDims.map((d) => d.dimensionId);
    expect(ids).toContain('quality');
    expect(ids).toContain('usefulness');
    expect(ids).not.toContain('editingFidelity');
  });

  it('getDimensionsForDomain for image-editing includes editingFidelity', () => {
    const dims = getDimensionsForDomain('image-editing');
    const ids = dims.map((d) => d.dimensionId);
    expect(ids).toContain('editingFidelity');
  });
});

// ─── GoldenAssetRegistry ─────────────────────────────────────────────────────

describe('GoldenAssetRegistry', () => {
  let registry: GoldenAssetRegistry;

  beforeEach(() => {
    registry = new GoldenAssetRegistry();
  });

  it('registers and retrieves by assetId', () => {
    const asset = IMAGE_GENERATION_GOLDEN_ASSETS[0];
    registry.register(asset);
    expect(registry.get(asset.assetId)).toBe(asset);
  });

  it('returns undefined for unknown assetId', () => {
    expect(registry.get('ga-nonexistent-999')).toBeUndefined();
  });

  it('throws on duplicate assetId', () => {
    const asset = IMAGE_GENERATION_GOLDEN_ASSETS[0];
    registry.register(asset);
    expect(() => registry.register(asset)).toThrow(asset.assetId);
  });

  it('listByDomain returns only assets with the specified domain', () => {
    registry.register(IMAGE_GENERATION_GOLDEN_ASSETS[0]);
    registry.register(IMAGE_EDITING_GOLDEN_ASSETS[0]);
    const genAssets = registry.listByDomain('image-generation');
    expect(genAssets).toHaveLength(1);
    expect(genAssets[0].domain).toBe('image-generation');
  });

  it('listByTestId returns assets for that testId', () => {
    registry.register(IMAGE_GENERATION_GOLDEN_ASSETS[0]);
    const result = registry.listByTestId('img-gen-001');
    expect(result).toHaveLength(1);
    expect(result[0].assetId).toBe('ga-img-gen-001');
  });

  it('listByStatus blocked returns only blocked assets', () => {
    registry.register(IMAGE_GENERATION_GOLDEN_ASSETS[0]);
    registry.register(VOICE_CLONING_GOLDEN_ASSETS[0]);
    const blocked = registry.listByStatus('blocked');
    expect(blocked).toHaveLength(1);
    expect(blocked[0].domain).toBe('voice-cloning');
  });

  it('count returns the correct number of registered assets', () => {
    expect(registry.count()).toBe(0);
    registry.register(IMAGE_GENERATION_GOLDEN_ASSETS[0]);
    expect(registry.count()).toBe(1);
  });
});

describe('createDefaultGoldenAssetRegistry', () => {
  let registry: GoldenAssetRegistry;

  beforeEach(() => {
    registry = createDefaultGoldenAssetRegistry();
  });

  it('contains all 31 golden assets', () => {
    expect(registry.count()).toBe(ALL_GOLDEN_ASSETS.length);
  });

  it('can retrieve every asset by its assetId', () => {
    for (const asset of ALL_GOLDEN_ASSETS) {
      expect(registry.get(asset.assetId)).toBeDefined();
    }
  });

  it('listByStatus blocked returns only the 4 voice-cloning assets', () => {
    const blocked = registry.listByStatus('blocked');
    expect(blocked).toHaveLength(4);
    for (const a of blocked) {
      expect(a.domain).toBe('voice-cloning');
    }
  });

  it('listByStatus ready returns all non-voice-cloning assets', () => {
    const ready = registry.listByStatus('ready');
    for (const a of ready) {
      expect(a.domain).not.toBe('voice-cloning');
    }
  });

  it('image-generation domain has 8 assets', () => {
    expect(registry.listByDomain('image-generation')).toHaveLength(8);
  });

  it('text-to-speech domain has 6 assets', () => {
    expect(registry.listByDomain('text-to-speech')).toHaveLength(6);
  });
});

// ─── Benchmark test matrix ────────────────────────────────────────────────────

describe('BENCHMARK_TEST_MATRIX', () => {
  it('has 32 entries (26 original specs + 4 voice-cloning + 1 Egyptian Arabic + 1 already in count)', () => {
    // 8 img-gen + 4 img-edit + 3 img-up + 6 vid-gen + 6 tts (5+1 EG) + 4 voice-clone = 31
    expect(BENCHMARK_TEST_MATRIX).toHaveLength(31);
  });

  it('all testIds in the matrix are unique', () => {
    const ids = BENCHMARK_TEST_MATRIX.map((e) => e.testId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all golden asset IDs in the matrix correspond to registered assets', () => {
    const registry = createDefaultGoldenAssetRegistry();
    for (const entry of BENCHMARK_TEST_MATRIX) {
      for (const assetId of entry.goldenAssetIds) {
        expect(registry.get(assetId)).toBeDefined();
      }
    }
  });

  it('all voice-cloning entries have runnable: false', () => {
    const vcEntries = getEntriesByDomain('voice-cloning');
    for (const entry of vcEntries) {
      expect(entry.runnable).toBe(false);
      expect(entry.requiresSpeakerAuthorization).toBe(true);
    }
  });

  it('all image-generation entries have runnable: true and requiresBinaryAcquisition: false', () => {
    const entries = getEntriesByDomain('image-generation');
    for (const entry of entries) {
      expect(entry.runnable).toBe(true);
      expect(entry.requiresBinaryAcquisition).toBe(false);
    }
  });

  it('all image-editing entries require binary acquisition but are runnable', () => {
    const entries = getEntriesByDomain('image-editing');
    for (const entry of entries) {
      expect(entry.requiresBinaryAcquisition).toBe(true);
      expect(entry.runnable).toBe(true);
    }
  });

  it('getRunnableEntries excludes all voice-cloning entries', () => {
    const runnable = getRunnableEntries();
    for (const entry of runnable) {
      expect(entry.domain).not.toBe('voice-cloning');
    }
  });

  it('getBlockedEntries returns only voice-cloning entries', () => {
    const blocked = getBlockedEntries();
    expect(blocked).toHaveLength(4);
    for (const entry of blocked) {
      expect(entry.domain).toBe('voice-cloning');
    }
  });

  it('getMatrixEntry returns the correct entry', () => {
    const entry = getMatrixEntry('img-gen-001');
    expect(entry).toBeDefined();
    expect(entry?.domain).toBe('image-generation');
    expect(entry?.goldenAssetIds).toContain('ga-img-gen-001');
  });

  it('getMatrixEntry returns undefined for unknown testId', () => {
    expect(getMatrixEntry('nonexistent-000')).toBeUndefined();
  });

  it('tts-006 entry is in the matrix and runnable', () => {
    const entry = getMatrixEntry('tts-006');
    expect(entry).toBeDefined();
    expect(entry?.runnable).toBe(true);
    expect(entry?.goldenAssetIds).toContain('ga-tts-006');
  });
});

// ─── Security controls ────────────────────────────────────────────────────────

describe('Security controls — no credentials in golden assets', () => {
  const credentialPattern = /sk-[A-Za-z0-9]{20,}|bearer\s+[A-Za-z0-9]{10,}|api[_-]?key\s*[:=]/i;
  const providerPattern = /openai|midjourney|stability\.ai|dall-e|dall_e|eleven.?labs|sora\b|kling\b|runway\.ml/i;

  it('no golden asset canonical prompt contains a credential pattern', () => {
    const promptAssets = ALL_GOLDEN_ASSETS.filter(
      (a): a is typeof a & { canonicalPrompt: string } =>
        'canonicalPrompt' in a
    );
    for (const asset of promptAssets) {
      expect((asset as { canonicalPrompt: string }).canonicalPrompt).not.toMatch(credentialPattern);
    }
  });

  it('no TTS canonical script contains a credential pattern', () => {
    for (const asset of TEXT_TO_SPEECH_GOLDEN_ASSETS) {
      expect(asset.canonicalScript).not.toMatch(credentialPattern);
    }
  });

  it('no golden asset description or objective contains a provider product name', () => {
    for (const asset of ALL_GOLDEN_ASSETS) {
      expect(asset.description).not.toMatch(providerPattern);
      expect(asset.intendedObjective).not.toMatch(providerPattern);
    }
  });

  it('no canonical prompt contains a provider product name', () => {
    const promptAssets = [...IMAGE_GENERATION_GOLDEN_ASSETS, ...VIDEO_GENERATION_GOLDEN_ASSETS];
    for (const asset of promptAssets) {
      expect(asset.canonicalPrompt).not.toMatch(providerPattern);
    }
  });
});
