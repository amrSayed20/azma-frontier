import { BenchmarkSpecRegistry, createDefaultSpecRegistry } from '../benchmark-spec-registry';
import { IMAGE_GENERATION_SPECS } from '../specs/image-generation-specs';
import { IMAGE_EDITING_SPECS } from '../specs/image-editing-specs';
import { IMAGE_UPSCALING_SPECS } from '../specs/image-upscaling-specs';
import { VIDEO_GENERATION_SPECS } from '../specs/video-generation-specs';
import { TEXT_TO_SPEECH_SPECS } from '../specs/text-to-speech-specs';
import { VOICE_CLONING_SPECS } from '../specs/voice-cloning-specs';
import { REFERENCE_FIXTURES, SPEC_REFERENCE_REQUIREMENTS } from '../benchmark-fixtures';
import type { BenchmarkSpec } from '../benchmark-types';

const ALL_SPECS = [
  ...IMAGE_GENERATION_SPECS,
  ...IMAGE_EDITING_SPECS,
  ...IMAGE_UPSCALING_SPECS,
  ...VIDEO_GENERATION_SPECS,
  ...TEXT_TO_SPEECH_SPECS,
  ...VOICE_CLONING_SPECS,
];

// ─── Spec integrity ───────────────────────────────────────────────────────────

describe('All benchmark specs — integrity', () => {
  it('all testIds are unique across all domains', () => {
    const ids = ALL_SPECS.map((s) => s.testId);
    const unique = new Set(ids);
    expect(unique.size).toBe(ids.length);
  });

  it('all specs have a non-empty testId, name, description, and prompt', () => {
    for (const spec of ALL_SPECS) {
      expect(spec.testId.trim().length).toBeGreaterThan(0);
      expect(spec.name.trim().length).toBeGreaterThan(0);
      expect(spec.description.trim().length).toBeGreaterThan(0);
      expect(spec.input.prompt.trim().length).toBeGreaterThan(0);
    }
  });

  it('all specs have at least one scoring dimension', () => {
    for (const spec of ALL_SPECS) {
      expect(spec.scoringDimensions.length).toBeGreaterThan(0);
    }
  });

  it('all specs have evaluation guidance', () => {
    for (const spec of ALL_SPECS) {
      expect(spec.evaluationGuidance.trim().length).toBeGreaterThan(0);
    }
  });

  it('all specs have a version string', () => {
    for (const spec of ALL_SPECS) {
      expect(spec.version).toMatch(/^\d+\.\d+\.\d+$/);
    }
  });

  it('editing and cloning specs have a referenceDescription', () => {
    const needsRef = [...IMAGE_EDITING_SPECS, ...VOICE_CLONING_SPECS];
    for (const spec of needsRef) {
      expect(spec.input.referenceDescription).toBeDefined();
      expect((spec.input.referenceDescription ?? '').trim().length).toBeGreaterThan(0);
    }
  });

  it('image generation specs have a resolution defined', () => {
    for (const spec of IMAGE_GENERATION_SPECS) {
      expect(spec.input.resolution).toBeDefined();
      expect(spec.input.resolution).toMatch(/^\d+x\d+$/);
    }
  });

  it('video generation specs have durationSeconds in parameters', () => {
    for (const spec of VIDEO_GENERATION_SPECS) {
      expect(spec.input.parameters.durationSeconds).toBeDefined();
      expect(typeof spec.input.parameters.durationSeconds).toBe('number');
    }
  });

  it('no spec prompt contains a credential, API key pattern, or secret-shaped string', () => {
    const secretPattern = /sk-[A-Za-z0-9]{20,}|Bearer [A-Za-z0-9]{10,}|password|api[_-]?key/i;
    for (const spec of ALL_SPECS) {
      expect(spec.input.prompt).not.toMatch(secretPattern);
    }
  });
});

// ─── Domain coverage ──────────────────────────────────────────────────────────

describe('Benchmark domain coverage', () => {
  it('image-generation has at least 6 specs', () => {
    expect(IMAGE_GENERATION_SPECS.length).toBeGreaterThanOrEqual(6);
  });

  it('image-editing has at least 3 specs', () => {
    expect(IMAGE_EDITING_SPECS.length).toBeGreaterThanOrEqual(3);
  });

  it('image-upscaling has at least 2 specs', () => {
    expect(IMAGE_UPSCALING_SPECS.length).toBeGreaterThanOrEqual(2);
  });

  it('video-generation has at least 4 specs', () => {
    expect(VIDEO_GENERATION_SPECS.length).toBeGreaterThanOrEqual(4);
  });

  it('text-to-speech has at least 4 specs', () => {
    expect(TEXT_TO_SPEECH_SPECS.length).toBeGreaterThanOrEqual(4);
  });

  it('voice-cloning has at least 3 specs', () => {
    expect(VOICE_CLONING_SPECS.length).toBeGreaterThanOrEqual(3);
  });

  it('all specs have the correct capability for their domain array', () => {
    for (const spec of IMAGE_GENERATION_SPECS) expect(spec.capability).toBe('image-generation');
    for (const spec of IMAGE_EDITING_SPECS) expect(spec.capability).toBe('image-editing');
    for (const spec of IMAGE_UPSCALING_SPECS) expect(spec.capability).toBe('image-upscaling');
    for (const spec of VIDEO_GENERATION_SPECS) expect(spec.capability).toBe('video-generation');
    for (const spec of TEXT_TO_SPEECH_SPECS) expect(spec.capability).toBe('text-to-speech');
    for (const spec of VOICE_CLONING_SPECS) expect(spec.capability).toBe('voice-cloning');
  });
});

// ─── BenchmarkSpecRegistry ────────────────────────────────────────────────────

describe('BenchmarkSpecRegistry', () => {
  let registry: BenchmarkSpecRegistry;

  beforeEach(() => {
    registry = new BenchmarkSpecRegistry();
  });

  it('registers and retrieves a spec by testId', () => {
    const spec = IMAGE_GENERATION_SPECS[0];
    registry.register(spec);
    expect(registry.get(spec.testId)).toBe(spec);
  });

  it('returns undefined for an unregistered testId', () => {
    expect(registry.get('nonexistent-id')).toBeUndefined();
  });

  it('throws on duplicate testId registration', () => {
    const spec = IMAGE_GENERATION_SPECS[0];
    registry.register(spec);
    expect(() => registry.register(spec)).toThrow('img-gen-001');
  });

  it('listByCapability returns only specs with that capability', () => {
    registry.register(IMAGE_GENERATION_SPECS[0]);
    registry.register(IMAGE_EDITING_SPECS[0]);
    const imageGenSpecs = registry.listByCapability('image-generation');
    expect(imageGenSpecs).toHaveLength(1);
    expect(imageGenSpecs[0].testId).toBe(IMAGE_GENERATION_SPECS[0].testId);
  });

  it('listAll returns all registered specs', () => {
    registry.register(IMAGE_GENERATION_SPECS[0]);
    registry.register(IMAGE_EDITING_SPECS[0]);
    expect(registry.listAll()).toHaveLength(2);
  });

  it('count returns the correct number of registered specs', () => {
    expect(registry.count()).toBe(0);
    registry.register(IMAGE_GENERATION_SPECS[0]);
    expect(registry.count()).toBe(1);
    registry.register(IMAGE_GENERATION_SPECS[1]);
    expect(registry.count()).toBe(2);
  });
});

// ─── createDefaultSpecRegistry ────────────────────────────────────────────────

describe('createDefaultSpecRegistry', () => {
  let registry: BenchmarkSpecRegistry;

  beforeEach(() => {
    registry = createDefaultSpecRegistry();
  });

  it('contains all specs from all domains', () => {
    expect(registry.count()).toBe(ALL_SPECS.length);
  });

  it('can retrieve every spec by its testId', () => {
    for (const spec of ALL_SPECS) {
      expect(registry.get(spec.testId)).toBeDefined();
    }
  });

  it('lists correct count per capability', () => {
    expect(registry.listByCapability('image-generation').length).toBe(IMAGE_GENERATION_SPECS.length);
    expect(registry.listByCapability('image-editing').length).toBe(IMAGE_EDITING_SPECS.length);
    expect(registry.listByCapability('image-upscaling').length).toBe(IMAGE_UPSCALING_SPECS.length);
    expect(registry.listByCapability('video-generation').length).toBe(VIDEO_GENERATION_SPECS.length);
    expect(registry.listByCapability('text-to-speech').length).toBe(TEXT_TO_SPEECH_SPECS.length);
    expect(registry.listByCapability('voice-cloning').length).toBe(VOICE_CLONING_SPECS.length);
  });
});

// ─── Reference fixtures ───────────────────────────────────────────────────────

describe('REFERENCE_FIXTURES', () => {
  it('all fixture IDs are unique', () => {
    const ids = REFERENCE_FIXTURES.map((f) => f.fixtureId);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all fixtures have a non-empty description and acquisitionGuidance', () => {
    for (const fixture of REFERENCE_FIXTURES) {
      expect(fixture.description.trim().length).toBeGreaterThan(0);
      expect(fixture.acquisitionGuidance.trim().length).toBeGreaterThan(0);
    }
  });

  it('all fixtures reference at least one spec that exists in ALL_SPECS', () => {
    const specIds = new Set(ALL_SPECS.map((s) => s.testId));
    for (const fixture of REFERENCE_FIXTURES) {
      for (const specId of fixture.usedBySpecIds) {
        expect(specIds.has(specId)).toBe(true);
      }
    }
  });

  it('no fixture contains credential-shaped strings', () => {
    const credentialPattern = /api[_-]?key|bearer|sk-[A-Za-z0-9]{10,}|password/i;
    for (const fixture of REFERENCE_FIXTURES) {
      expect(fixture.description).not.toMatch(credentialPattern);
      expect(fixture.acquisitionGuidance).not.toMatch(credentialPattern);
    }
  });
});

describe('SPEC_REFERENCE_REQUIREMENTS', () => {
  it('all spec IDs in the requirements map exist in ALL_SPECS', () => {
    const specIds = new Set(ALL_SPECS.map((s: BenchmarkSpec) => s.testId));
    for (const specId of Object.keys(SPEC_REFERENCE_REQUIREMENTS)) {
      expect(specIds.has(specId)).toBe(true);
    }
  });

  it('editing specs appear in the reference requirements map', () => {
    for (const spec of IMAGE_EDITING_SPECS) {
      expect(SPEC_REFERENCE_REQUIREMENTS[spec.testId]).toBeDefined();
    }
  });

  it('voice cloning specs appear in the reference requirements map', () => {
    for (const spec of VOICE_CLONING_SPECS) {
      expect(SPEC_REFERENCE_REQUIREMENTS[spec.testId]).toBeDefined();
    }
  });
});
