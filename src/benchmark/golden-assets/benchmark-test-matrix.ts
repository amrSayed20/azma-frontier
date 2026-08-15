import type { GoldenAssetDomain } from './golden-asset-types';

// The test matrix is the authoritative run list for the full benchmark.
// Each entry maps one spec testId to the golden assets required to run it,
// and documents the binary acquisition requirements for that test.
// Entries with requiresSpeakerAuthorization: true cannot run until
// written speaker consent is on file.

export interface TestMatrixEntry {
  readonly testId: string;
  readonly goldenAssetIds: readonly string[];
  readonly domain: GoldenAssetDomain;
  readonly requiresBinaryAcquisition: boolean;  // true if a reference image or audio must be sourced
  readonly requiresSpeakerAuthorization: boolean; // true if speaker consent is a prerequisite
  readonly runnable: boolean;  // false when blocked by missing authorization or binary
}

export const BENCHMARK_TEST_MATRIX: readonly TestMatrixEntry[] = [
  // ─── Image Generation (8 specs) ──────────────────────────────────────────
  { testId: 'img-gen-001', goldenAssetIds: ['ga-img-gen-001'], domain: 'image-generation', requiresBinaryAcquisition: false, requiresSpeakerAuthorization: false, runnable: true },
  { testId: 'img-gen-002', goldenAssetIds: ['ga-img-gen-002'], domain: 'image-generation', requiresBinaryAcquisition: false, requiresSpeakerAuthorization: false, runnable: true },
  { testId: 'img-gen-003', goldenAssetIds: ['ga-img-gen-003'], domain: 'image-generation', requiresBinaryAcquisition: false, requiresSpeakerAuthorization: false, runnable: true },
  { testId: 'img-gen-004', goldenAssetIds: ['ga-img-gen-004'], domain: 'image-generation', requiresBinaryAcquisition: false, requiresSpeakerAuthorization: false, runnable: true },
  { testId: 'img-gen-005', goldenAssetIds: ['ga-img-gen-005'], domain: 'image-generation', requiresBinaryAcquisition: false, requiresSpeakerAuthorization: false, runnable: true },
  { testId: 'img-gen-006', goldenAssetIds: ['ga-img-gen-006'], domain: 'image-generation', requiresBinaryAcquisition: false, requiresSpeakerAuthorization: false, runnable: true },
  { testId: 'img-gen-007', goldenAssetIds: ['ga-img-gen-007'], domain: 'image-generation', requiresBinaryAcquisition: false, requiresSpeakerAuthorization: false, runnable: true },
  { testId: 'img-gen-008', goldenAssetIds: ['ga-img-gen-008'], domain: 'image-generation', requiresBinaryAcquisition: false, requiresSpeakerAuthorization: false, runnable: true },

  // ─── Image Editing (4 specs) ─────────────────────────────────────────────
  // Requires CC0 reference images — standard acquisition, no special authorization
  { testId: 'img-edit-001', goldenAssetIds: ['ga-img-edit-001'], domain: 'image-editing', requiresBinaryAcquisition: true, requiresSpeakerAuthorization: false, runnable: true },
  { testId: 'img-edit-002', goldenAssetIds: ['ga-img-edit-002'], domain: 'image-editing', requiresBinaryAcquisition: true, requiresSpeakerAuthorization: false, runnable: true },
  { testId: 'img-edit-003', goldenAssetIds: ['ga-img-edit-003'], domain: 'image-editing', requiresBinaryAcquisition: true, requiresSpeakerAuthorization: false, runnable: true },
  { testId: 'img-edit-004', goldenAssetIds: ['ga-img-edit-004'], domain: 'image-editing', requiresBinaryAcquisition: true, requiresSpeakerAuthorization: false, runnable: true },

  // ─── Image Upscaling (3 specs) ───────────────────────────────────────────
  { testId: 'img-up-001', goldenAssetIds: ['ga-img-up-001'], domain: 'image-upscaling', requiresBinaryAcquisition: true, requiresSpeakerAuthorization: false, runnable: true },
  { testId: 'img-up-002', goldenAssetIds: ['ga-img-up-002'], domain: 'image-upscaling', requiresBinaryAcquisition: true, requiresSpeakerAuthorization: false, runnable: true },
  { testId: 'img-up-003', goldenAssetIds: ['ga-img-up-003'], domain: 'image-upscaling', requiresBinaryAcquisition: true, requiresSpeakerAuthorization: false, runnable: true },

  // ─── Video Generation (6 specs) ──────────────────────────────────────────
  { testId: 'vid-gen-001', goldenAssetIds: ['ga-vid-gen-001'], domain: 'video-generation', requiresBinaryAcquisition: false, requiresSpeakerAuthorization: false, runnable: true },
  { testId: 'vid-gen-002', goldenAssetIds: ['ga-vid-gen-002'], domain: 'video-generation', requiresBinaryAcquisition: false, requiresSpeakerAuthorization: false, runnable: true },
  { testId: 'vid-gen-003', goldenAssetIds: ['ga-vid-gen-003'], domain: 'video-generation', requiresBinaryAcquisition: false, requiresSpeakerAuthorization: false, runnable: true },
  { testId: 'vid-gen-004', goldenAssetIds: ['ga-vid-gen-004'], domain: 'video-generation', requiresBinaryAcquisition: false, requiresSpeakerAuthorization: false, runnable: true },
  { testId: 'vid-gen-005', goldenAssetIds: ['ga-vid-gen-005'], domain: 'video-generation', requiresBinaryAcquisition: false, requiresSpeakerAuthorization: false, runnable: true },
  { testId: 'vid-gen-006', goldenAssetIds: ['ga-vid-gen-006'], domain: 'video-generation', requiresBinaryAcquisition: false, requiresSpeakerAuthorization: false, runnable: true },

  // ─── Text-to-Speech (6 scripts: 5 from existing specs + tts-006 Egyptian Arabic) ───
  { testId: 'tts-001', goldenAssetIds: ['ga-tts-001'], domain: 'text-to-speech', requiresBinaryAcquisition: false, requiresSpeakerAuthorization: false, runnable: true },
  { testId: 'tts-002', goldenAssetIds: ['ga-tts-002'], domain: 'text-to-speech', requiresBinaryAcquisition: false, requiresSpeakerAuthorization: false, runnable: true },
  { testId: 'tts-003', goldenAssetIds: ['ga-tts-003'], domain: 'text-to-speech', requiresBinaryAcquisition: false, requiresSpeakerAuthorization: false, runnable: true },
  { testId: 'tts-004', goldenAssetIds: ['ga-tts-004'], domain: 'text-to-speech', requiresBinaryAcquisition: false, requiresSpeakerAuthorization: false, runnable: true },
  { testId: 'tts-005', goldenAssetIds: ['ga-tts-005'], domain: 'text-to-speech', requiresBinaryAcquisition: false, requiresSpeakerAuthorization: false, runnable: true },
  // tts-006: Egyptian Arabic — golden asset defined; corresponding spec is pending addition
  { testId: 'tts-006', goldenAssetIds: ['ga-tts-006'], domain: 'text-to-speech', requiresBinaryAcquisition: false, requiresSpeakerAuthorization: false, runnable: true },

  // ─── Voice Cloning (4 specs) — all blocked pending speaker authorization ─
  { testId: 'voice-clone-001', goldenAssetIds: ['ga-voice-clone-001'], domain: 'voice-cloning', requiresBinaryAcquisition: true, requiresSpeakerAuthorization: true, runnable: false },
  { testId: 'voice-clone-002', goldenAssetIds: ['ga-voice-clone-002'], domain: 'voice-cloning', requiresBinaryAcquisition: true, requiresSpeakerAuthorization: true, runnable: false },
  { testId: 'voice-clone-003', goldenAssetIds: ['ga-voice-clone-003'], domain: 'voice-cloning', requiresBinaryAcquisition: true, requiresSpeakerAuthorization: true, runnable: false },
  { testId: 'voice-clone-004', goldenAssetIds: ['ga-voice-clone-004'], domain: 'voice-cloning', requiresBinaryAcquisition: true, requiresSpeakerAuthorization: true, runnable: false },
];

// Lookup helpers

export function getMatrixEntry(testId: string): TestMatrixEntry | undefined {
  return BENCHMARK_TEST_MATRIX.find((e) => e.testId === testId);
}

export function getRunnableEntries(): readonly TestMatrixEntry[] {
  return BENCHMARK_TEST_MATRIX.filter((e) => e.runnable);
}

export function getBlockedEntries(): readonly TestMatrixEntry[] {
  return BENCHMARK_TEST_MATRIX.filter((e) => !e.runnable);
}

export function getEntriesByDomain(domain: GoldenAssetDomain): readonly TestMatrixEntry[] {
  return BENCHMARK_TEST_MATRIX.filter((e) => e.domain === domain);
}
