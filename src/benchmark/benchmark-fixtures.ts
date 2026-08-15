import { FIXTURE_VERSION } from './benchmark-version';

// Reference fixture descriptors for editing and cloning benchmarks.
// These describe what reference input material is needed and how to obtain it —
// without embedding binary content in source. Prompts live in the spec files.
// Binary assets (source images, reference audio) are never stored in source.

export interface BenchmarkReferenceFixture {
  readonly fixtureId: string;
  readonly version: string;
  readonly usedBySpecIds: readonly string[];
  readonly mediaType: 'image' | 'audio' | 'video';
  readonly description: string;
  readonly acquisitionGuidance: string;
  readonly formatRequirements: Readonly<Record<string, unknown>>;
}

export const REFERENCE_FIXTURES: readonly BenchmarkReferenceFixture[] = [
  {
    fixtureId: 'ref-img-street-cobblestone-v1',
    version: FIXTURE_VERSION,
    usedBySpecIds: ['img-edit-001'],
    mediaType: 'image',
    description: 'A daytime photograph of a narrow European cobblestone street with a single parked car in the foreground and pedestrians visible in the background.',
    acquisitionGuidance: 'Use a royalty-free stock photograph (e.g., CC0 or similar license) of a cobblestone street scene. Required: the car must be clearly isolated in the foreground with visible cobblestones beneath. Minimum resolution 1024x1024.',
    formatRequirements: { format: 'PNG or JPEG', minResolution: '1024x1024', colorSpace: 'sRGB', maxFileSizeMB: 10 },
  },
  {
    fixtureId: 'ref-img-cityscape-v1',
    version: FIXTURE_VERSION,
    usedBySpecIds: ['img-edit-002'],
    mediaType: 'image',
    description: 'A daytime cityscape photograph with a recognizable skyline and a river or waterway in the foreground.',
    acquisitionGuidance: 'Use a CC0-licensed skyline photograph. Buildings must be clearly identifiable. River must be visible in foreground. No copyright watermarks. Minimum resolution 1280x720.',
    formatRequirements: { format: 'PNG or JPEG', minResolution: '1280x720', colorSpace: 'sRGB', maxFileSizeMB: 10 },
  },
  {
    fixtureId: 'ref-img-atelier-v1',
    version: FIXTURE_VERSION,
    usedBySpecIds: ['img-edit-003'],
    mediaType: 'image',
    description: "An artist's atelier with an easel holding a blank white canvas, natural window light from the left, oil painting materials in the foreground.",
    acquisitionGuidance: 'Use a CC0-licensed interior photograph of an artist studio. The canvas must be clearly visible on an easel and must be blank or near-blank. Window light source visible.',
    formatRequirements: { format: 'PNG or JPEG', minResolution: '1024x1024', colorSpace: 'sRGB', maxFileSizeMB: 10 },
  },
  {
    fixtureId: 'ref-img-cool-interior-v1',
    version: FIXTURE_VERSION,
    usedBySpecIds: ['img-edit-004'],
    mediaType: 'image',
    description: 'A cool-toned indoor photograph of a minimalist living room with white walls, grey furniture, and natural objects.',
    acquisitionGuidance: 'Use a CC0-licensed interior photograph. Color temperature must be measurably cool (approximately 4000–5000K). No strong color casts. Minimum resolution 1024x1024.',
    formatRequirements: { format: 'PNG or JPEG', minResolution: '1024x1024', colorSpace: 'sRGB', maxFileSizeMB: 10 },
  },
  {
    fixtureId: 'ref-img-compressed-portrait-v1',
    version: FIXTURE_VERSION,
    usedBySpecIds: ['img-up-001'],
    mediaType: 'image',
    description: 'A 512x512 JPEG portrait photograph with visible JPEG compression artifacts and limited fine detail in hair and fabric.',
    acquisitionGuidance: 'Use a CC0-licensed portrait photograph, resized to 512x512 and saved at JPEG quality 60–70 to introduce compression artifacts. The subject must include fine detail in hair, clothing texture, or similar.',
    formatRequirements: { format: 'JPEG', exactResolution: '512x512', jpegQuality: '60–70', maxFileSizeMB: 1 },
  },
  {
    fixtureId: 'ref-img-landscape-grain-v1',
    version: FIXTURE_VERSION,
    usedBySpecIds: ['img-up-002'],
    mediaType: 'image',
    description: 'A landscape photograph with a sharp foreground treeline and a soft-focus sky, moderate film grain throughout.',
    acquisitionGuidance: 'Use a CC0-licensed landscape photograph. Treeline must be in sharp focus. Sky must be clearly less detailed. Moderate film-grain noise should be present (ISO 3200 equivalent or artificial grain overlay).',
    formatRequirements: { format: 'PNG or JPEG', minResolution: '1024x768', colorSpace: 'sRGB', maxFileSizeMB: 10 },
  },
  {
    fixtureId: 'ref-img-high-contrast-interior-v1',
    version: FIXTURE_VERSION,
    usedBySpecIds: ['img-up-003'],
    mediaType: 'image',
    description: 'An interior photograph with a dark room foreground and a bright sunlit window in the background, significant clipping in shadows and highlights.',
    acquisitionGuidance: 'Use a CC0-licensed interior photograph with a window. Shadow areas should be clipped (pure black). Window area should be blown out (pure white). No HDR processing applied.',
    formatRequirements: { format: 'JPEG or RAW-derived JPEG', minResolution: '1024x768', maxFileSizeMB: 15 },
  },
  {
    fixtureId: 'ref-audio-neutral-en-v1',
    version: FIXTURE_VERSION,
    usedBySpecIds: ['voice-clone-001', 'voice-clone-003', 'voice-clone-004'],
    mediaType: 'audio',
    description: 'A 30-second clean recording of a single adult speaker in a neutral conversational register, no background noise, English language.',
    acquisitionGuidance: 'Record a single speaker in a quiet room (below -60dBFS noise floor). Speaker must be consistent across all cloning benchmarks (same person). Clip to exactly 30 seconds. No music, no reverb, no processing. Ensure you have the speaker\'s explicit consent for use in benchmark evaluation.',
    formatRequirements: { format: 'WAV', sampleRate: 44100, bitDepth: 16, channels: 1, durationSeconds: 30, maxFileSizeMB: 5 },
  },
  {
    fixtureId: 'ref-audio-neutral-en-for-cross-language-v1',
    version: FIXTURE_VERSION,
    usedBySpecIds: ['voice-clone-002'],
    mediaType: 'audio',
    description: 'A 30-second clean English-language recording of the same speaker used in ref-audio-neutral-en-v1. Serves as source for cross-language voice transfer evaluation.',
    acquisitionGuidance: 'Use the same speaker and session as ref-audio-neutral-en-v1. This fixture is explicitly the same reference audio — it is listed separately to document the cross-language test dependency.',
    formatRequirements: { format: 'WAV', sampleRate: 44100, bitDepth: 16, channels: 1, durationSeconds: 30, maxFileSizeMB: 5 },
  },
];

// Map from spec testId to required reference fixture IDs for quick lookup
export const SPEC_REFERENCE_REQUIREMENTS: Readonly<Record<string, readonly string[]>> = (() => {
  const map: Record<string, string[]> = {};
  for (const fixture of REFERENCE_FIXTURES) {
    for (const specId of fixture.usedBySpecIds) {
      if (!map[specId]) map[specId] = [];
      map[specId].push(fixture.fixtureId);
    }
  }
  return map;
})();
