/**
 * VI-A — CinematicFfmpegEncoder voice assignment proof
 *
 * Proves that resolved voice paths (Map<nodeId, secureStorageUri>) passed to
 * spawnEncoding() reach the actual FFmpeg -i argument list, with correct
 * temporal alignment and graceful skip on missing files.
 *
 * spawn() and existsSync() are mocked so no real FFmpeg process is started.
 */

import { EventEmitter } from 'node:events';
import { join } from 'node:path';

// Mocks must be declared before any imports that reference the mocked modules.
jest.mock('node:child_process', () => ({
  spawn: jest.fn(),
}));

jest.mock('node:fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
}));

import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import { spawnEncoding } from '../fleet/adapters/cinematic-ffmpeg-encoder';
import { CanvasType } from '../../../chambers/ras-al-amr/assembly-contracts';
import type { CompiledAssemblyGraph } from '../../../chambers/ras-al-amr/pre-publishing-boundary';

const mockSpawn = spawn as jest.Mock;
const mockExistsSync = existsSync as jest.Mock;

// Returns a minimal EventEmitter that satisfies the FFmpeg process interface.
function makeProcess() {
  const proc = new EventEmitter() as NodeJS.EventEmitter & {
    stderr: EventEmitter;
    stdout: EventEmitter;
  };
  (proc as any).stderr = new EventEmitter();
  (proc as any).stdout = new EventEmitter();
  return proc;
}

/**
 * Minimal valid CINEMATIC graph with one active image node.
 * The runtimeAsset.secureStorageUri resolves (via existsSync mock) to a path
 * that the encoder accepts.
 */
function makeImageGraph(overrides: {
  nodeId?: string;
  imageUri?: string;
  startSec?: number;
  durationSec?: number;
  trimStartSeconds?: number;  // VI-B
  trimEndSeconds?: number;    // VI-B
  mixPlan?: CompiledAssemblyGraph['mixPlan'];
} = {}): CompiledAssemblyGraph {
  const nodeId = overrides.nodeId ?? 'img-1';
  const trackId = 'track-1';
  const imageUri = overrides.imageUri ?? '/generated-assets/img.png';
  const startSec = overrides.startSec ?? 0;
  const durationSec = overrides.durationSec ?? 5;
  const trimStartSeconds = overrides.trimStartSeconds ?? 0;         // VI-B
  const trimEndSeconds = overrides.trimEndSeconds ?? durationSec;   // VI-B

  return {
    compilationId: 'comp-enc-1',
    sourceCanvasId: 'canvas-enc-1',
    subscriberTenantId: 'tenant-1',
    canvasType: CanvasType.CINEMATIC,
    hydratedCanvas: {
      canvasId: 'canvas-enc-1',
      subscriberTenantId: 'tenant-1',
      canvasType: CanvasType.CINEMATIC,
      title: 'Encoder Test',
      tracks: [
        {
          trackId,
          trackName: 'Track',
          isMuted: false,
          isHidden: false,
          nodes: [
            {
              nodeId,
              assetId: 'img-asset-1',
              assetFamily: 'MEDIA',
              capabilityOrigin: 'VISUAL',
              isActive: true,
              isLocked: false,
              temporal: {
                globalStartTimeSeconds: startSec,
                playDurationSeconds: durationSec,
                trimStartSeconds,    // VI-B: configurable via overrides
                trimEndSeconds,      // VI-B: configurable via overrides
              },
              spatial: { positionX: 0, positionY: 0, scaleX: 1, scaleY: 1, rotationDegrees: 0, zIndex: 0 },
              runtimeAsset: {
                assetId: 'img-asset-1',
                subscriberTenantId: 'tenant-1',
                originatingOperationId: 'op-img',
                capabilityTarget: 'VISUAL' as any,
                assetFamily: 'MEDIA' as any,
                secureStorageUri: imageUri,
                metadata: {},
                createdAt: 0,
                updatedAt: 0,
              },
            } as any,
          ],
        },
      ],
      createdAt: 0,
      updatedAt: 0,
    },
    metadata: {
      totalTracks: 1,
      totalNodes: 1,
      estimatedDurationSeconds: durationSec,
      aggregatedAssetFamilies: ['MEDIA'],
    },
    mixPlan: overrides.mixPlan ?? {
      nodeMixes: [{ nodeId, trackId, volumeDb: 0, panCenter: 0, isMuted: false }],
      trackMixes: [{ trackId, trackVolumeDb: 0, isMuted: false }],
    },
    subtitlePlan: { absoluteCues: [] },
    compiledAt: 0,
  };
}

beforeEach(() => {
  mockSpawn.mockReturnValue(makeProcess());
  // By default all files "exist" so the encoder never throws on existsSync checks.
  mockExistsSync.mockReturnValue(true);
});

afterEach(() => {
  jest.clearAllMocks();
});

// ============================================================
// Voice path in FFmpeg args
// ============================================================

describe('VI-A — voice paths reach FFmpeg -i arguments', () => {
  it('resolved voice secureStorageUri appears in FFmpeg -i arguments', () => {
    const voiceUri = '/uploads/test-voice.mp3';
    const voicePaths = new Map([['img-1', voiceUri]]);
    const graph = makeImageGraph({ nodeId: 'img-1' });

    spawnEncoding('op-v-1', graph, voicePaths);

    const ffmpegArgs = mockSpawn.mock.calls[0][1] as string[];
    const expectedPath = join(process.cwd(), 'public', 'uploads/test-voice.mp3');
    expect(ffmpegArgs).toContain(expectedPath);
  });

  it('voice temporal alignment: voice adelay matches globalStartTimeSeconds of parent image node', () => {
    const voiceUri = '/uploads/timed-voice.mp3';
    // Image node starts at second 3
    const graph = makeImageGraph({ nodeId: 'img-start3', startSec: 3, durationSec: 5 });
    const voicePaths = new Map([['img-start3', voiceUri]]);

    spawnEncoding('op-v-timing', graph, voicePaths);

    const ffmpegArgs = mockSpawn.mock.calls[0][1] as string[];
    const filterIdx = ffmpegArgs.indexOf('-filter_complex');
    expect(filterIdx).toBeGreaterThan(-1);
    const filterStr = ffmpegArgs[filterIdx + 1];
    // Voice audio is the first (and only) audio input; adelay=3000|3000 aligns it to second 3
    expect(filterStr).toContain('adelay=3000|3000');
  });

  it('voice file missing on disk (existsSync false) is skipped — no throw, no -i for that path', () => {
    const voiceUri = '/uploads/missing-voice.mp3';
    const voicePaths = new Map([['img-1', voiceUri]]);
    const graph = makeImageGraph({ nodeId: 'img-1' });

    // Image file exists; voice file does not
    mockExistsSync.mockImplementation((p: string) => !p.includes('missing-voice.mp3'));

    expect(() => spawnEncoding('op-v-missing', graph, voicePaths)).not.toThrow();

    const ffmpegArgs = mockSpawn.mock.calls[0][1] as string[];
    const expectedVoicePath = join(process.cwd(), 'public', 'uploads/missing-voice.mp3');
    expect(ffmpegArgs).not.toContain(expectedVoicePath);
    // FFmpeg was still spawned (image encoding proceeds without the voice)
    expect(mockSpawn).toHaveBeenCalledTimes(1);
  });

  it('no voice paths (default) — FFmpeg args are identical in structure to the existing encode path', () => {
    const graph = makeImageGraph({ nodeId: 'img-1' });

    // Without voice map argument (backward-compatible call signature)
    spawnEncoding('op-no-voice', graph);

    const ffmpegArgs = mockSpawn.mock.calls[0][1] as string[];
    expect(ffmpegArgs).toContain('-filter_complex');
    expect(ffmpegArgs).toContain('-c:v');
    expect(ffmpegArgs).toContain('libx264');
    expect(ffmpegArgs).toContain('-c:a');
    expect(ffmpegArgs).toContain('aac');
  });

  it('voice nodeId not matching any image node — voice path is silently ignored', () => {
    const voicePaths = new Map([['no-such-image-node', '/uploads/orphan-voice.mp3']]);
    const graph = makeImageGraph({ nodeId: 'img-1' });

    spawnEncoding('op-v-orphan', graph, voicePaths);

    const ffmpegArgs = mockSpawn.mock.calls[0][1] as string[];
    const orphanPath = join(process.cwd(), 'public', 'uploads/orphan-voice.mp3');
    expect(ffmpegArgs).not.toContain(orphanPath);
  });

  it('voice inherits parent image node mix settings — volume filter reflects nodeMix.volumeDb', () => {
    const voiceUri = '/uploads/quiet-voice.mp3';
    // Node mix: -6 dB (≈ 0.501 linear)
    const graph = makeImageGraph({
      nodeId: 'img-mix',
      mixPlan: {
        nodeMixes: [{ nodeId: 'img-mix', trackId: 'track-1', volumeDb: -6, panCenter: 0, isMuted: false }],
        trackMixes: [{ trackId: 'track-1', trackVolumeDb: 0, isMuted: false }],
      },
    });
    const voicePaths = new Map([['img-mix', voiceUri]]);

    spawnEncoding('op-v-mix', graph, voicePaths);

    const ffmpegArgs = mockSpawn.mock.calls[0][1] as string[];
    const filterIdx = ffmpegArgs.indexOf('-filter_complex');
    const filterStr = ffmpegArgs[filterIdx + 1];
    // Linear volume for -6 dB ≈ 0.501187 — the encoder computes this
    expect(filterStr).toMatch(/volume=0\.50/);
  });
});

// ============================================================
// VI-B — Temporal & Audio Fidelity
// ============================================================

// Helper: extract filter_complex string from mocked FFmpeg args
function getFilterComplex(args: string[]): string {
  const idx = args.indexOf('-filter_complex');
  return idx >= 0 ? (args[idx + 1] ?? '') : '';
}

// Helper: find the -t value for the image loop input (the -t that precedes the first -i)
function getImageLoopDuration(args: string[]): string | undefined {
  const iIdx = args.indexOf('-i');
  if (iIdx < 0) return undefined;
  // Search backward from the -i for the nearest -t
  for (let j = iIdx - 1; j >= 0; j--) {
    if (args[j] === '-t') return args[j + 1];
  }
  return undefined;
}

describe('VI-B — Temporal & Audio Fidelity', () => {
  it('A — trimStartSeconds=2 on a 5s slot → image loop duration is 3s (effectiveDuration)', () => {
    const graph = makeImageGraph({ nodeId: 'img-a', durationSec: 5, trimStartSeconds: 2, trimEndSeconds: 5 });
    spawnEncoding('op-vib-a', graph);
    const args = mockSpawn.mock.calls[0][1] as string[];
    expect(getImageLoopDuration(args)).toBe('3');
  });

  it('B — trimEndSeconds=3 on a 5s slot → image loop duration is 3s (effectiveDuration)', () => {
    const graph = makeImageGraph({ nodeId: 'img-b', durationSec: 5, trimStartSeconds: 0, trimEndSeconds: 3 });
    spawnEncoding('op-vib-b', graph);
    const args = mockSpawn.mock.calls[0][1] as string[];
    expect(getImageLoopDuration(args)).toBe('3');
  });

  it('C — panCenter=0.5 produces pan filter with correct left/right gains in filter_complex', () => {
    const nodeId = 'img-c';
    const graph = makeImageGraph({
      nodeId,
      mixPlan: {
        nodeMixes: [{ nodeId, trackId: 'track-1', volumeDb: 0, panCenter: 0.5, isMuted: false }],
        trackMixes: [{ trackId: 'track-1', trackVolumeDb: 0, isMuted: false }],
      },
    });
    const voicePaths = new Map([[nodeId, '/uploads/voice-c.mp3']]);
    spawnEncoding('op-vib-c', graph, voicePaths);
    const fc = getFilterComplex(mockSpawn.mock.calls[0][1] as string[]);
    // panCenter=0.5 → leftGain = 1 - 0.5 = 0.5, rightGain = 1.0
    expect(fc).toContain('aformat=channel_layouts=stereo');
    expect(fc).toContain('pan=stereo|c0=0.500000*c0|c1=1.000000*c1');
  });

  it('D — fadeInSeconds=1 produces afade=t=in:st=0:d=1.000000 in audio filter chain', () => {
    const nodeId = 'img-d';
    const graph = makeImageGraph({
      nodeId,
      mixPlan: {
        nodeMixes: [{ nodeId, trackId: 'track-1', volumeDb: 0, panCenter: 0, isMuted: false, fadeInSeconds: 1 }],
        trackMixes: [{ trackId: 'track-1', trackVolumeDb: 0, isMuted: false }],
      },
    });
    const voicePaths = new Map([[nodeId, '/uploads/voice-d.mp3']]);
    spawnEncoding('op-vib-d', graph, voicePaths);
    const fc = getFilterComplex(mockSpawn.mock.calls[0][1] as string[]);
    expect(fc).toContain('afade=t=in:st=0:d=1.000000');
  });

  it('E — fadeOutSeconds=1 on 5s clip → afade=t=out:st=4.000000:d=1.000000', () => {
    const nodeId = 'img-e';
    const graph = makeImageGraph({
      nodeId,
      durationSec: 5,
      mixPlan: {
        nodeMixes: [{ nodeId, trackId: 'track-1', volumeDb: 0, panCenter: 0, isMuted: false, fadeOutSeconds: 1 }],
        trackMixes: [{ trackId: 'track-1', trackVolumeDb: 0, isMuted: false }],
      },
    });
    const voicePaths = new Map([[nodeId, '/uploads/voice-e.mp3']]);
    spawnEncoding('op-vib-e', graph, voicePaths);
    const fc = getFilterComplex(mockSpawn.mock.calls[0][1] as string[]);
    // effectiveDuration=5, fadeOutStart = 5 - 1 = 4
    expect(fc).toContain('afade=t=out:st=4.000000:d=1.000000');
  });

  it('F — undefined trim/fade/pan: no afade or pan filter; image -t unchanged; silent audio generated', () => {
    const graph = makeImageGraph({ nodeId: 'img-f' });
    spawnEncoding('op-vib-f', graph);
    const args = mockSpawn.mock.calls[0][1] as string[];
    const fc = getFilterComplex(args);
    expect(fc).not.toContain('afade');
    expect(fc).not.toContain('pan=stereo');
    // Still generates silent audio when no audio input
    expect(fc).toContain('aevalsrc=0:c=stereo');
    // Image duration unchanged (default: effectiveDuration = durationSec = 5)
    expect(getImageLoopDuration(args)).toBe('5');
  });

  it('G — fadeIn(10)+fadeOut(10) on 5s clip → each proportionally clamped to 2.5s', () => {
    const nodeId = 'img-g';
    const graph = makeImageGraph({
      nodeId,
      durationSec: 5,
      mixPlan: {
        nodeMixes: [{ nodeId, trackId: 'track-1', volumeDb: 0, panCenter: 0, isMuted: false, fadeInSeconds: 10, fadeOutSeconds: 10 }],
        trackMixes: [{ trackId: 'track-1', trackVolumeDb: 0, isMuted: false }],
      },
    });
    const voicePaths = new Map([[nodeId, '/uploads/voice-g.mp3']]);
    spawnEncoding('op-vib-g', graph, voicePaths);
    const fc = getFilterComplex(mockSpawn.mock.calls[0][1] as string[]);
    // fadeScale = 5/20 = 0.25; clampedFade = 10 * 0.25 = 2.5
    expect(fc).toContain('afade=t=in:st=0:d=2.500000');
    expect(fc).toContain('afade=t=out:st=2.500000:d=2.500000');
    // Sanity: no NaN or Infinity values in filter
    expect(fc).not.toMatch(/NaN|Infinity/);
  });

  it('H — VI-A voice reaches -i AND VI-B fade is applied to that voice', () => {
    const nodeId = 'img-h';
    const voiceUri = '/uploads/voice-h.mp3';
    const graph = makeImageGraph({
      nodeId,
      durationSec: 5,
      mixPlan: {
        nodeMixes: [{ nodeId, trackId: 'track-1', volumeDb: 0, panCenter: 0, isMuted: false, fadeInSeconds: 0.5 }],
        trackMixes: [{ trackId: 'track-1', trackVolumeDb: 0, isMuted: false }],
      },
    });
    const voicePaths = new Map([[nodeId, voiceUri]]);
    spawnEncoding('op-vib-h', graph, voicePaths);
    const args = mockSpawn.mock.calls[0][1] as string[];
    const fc = getFilterComplex(args);

    // VI-A: voice file appears as an FFmpeg input
    expect(args).toContain(join(process.cwd(), 'public', 'uploads/voice-h.mp3'));

    // VI-B: fade-in applied to the voice audio
    expect(fc).toContain('afade=t=in:st=0:d=0.500000');

    // Safety trim still present
    expect(fc).toContain('atrim=0:');

    // Source trim present (trimStart=0, trimEnd=5 for default temporal)
    expect(fc).toContain('atrim=0:5,asetpts=PTS-STARTPTS');
  });
});

// ============================================================
// VI-C — Full Cinematic Overlay Composition
// ============================================================

/**
 * Multi-node graph builder for VI-C composition tests.
 * Each node entry becomes one active VISUAL image node in a single track.
 * Supports all spatial (positionX/Y, scaleX/Y, rotationDegrees, zIndex) and
 * visual (opacity, blendMode) directives required by VI-C.
 */
function makeMultiNodeGraph(
  nodes: Array<{
    nodeId: string;
    imageUri?: string;
    startSec?: number;
    durationSec?: number;
    positionX?: number;
    positionY?: number;
    scaleX?: number;
    scaleY?: number;
    rotationDegrees?: number;
    zIndex?: number;
    opacity?: number;
    blendMode?: string;
  }>,
): CompiledAssemblyGraph {
  const trackId = 'track-multi';
  const maxEnd = Math.max(...nodes.map((n) => (n.startSec ?? 0) + (n.durationSec ?? 5)));
  return {
    compilationId: 'comp-multi',
    sourceCanvasId: 'canvas-multi',
    subscriberTenantId: 'tenant-1',
    canvasType: CanvasType.CINEMATIC,
    hydratedCanvas: {
      canvasId: 'canvas-multi',
      subscriberTenantId: 'tenant-1',
      canvasType: CanvasType.CINEMATIC,
      title: 'Multi-Node VI-C Test',
      tracks: [
        {
          trackId,
          trackName: 'Multi Track',
          isMuted: false,
          isHidden: false,
          nodes: nodes.map((n) => ({
            nodeId: n.nodeId,
            assetId: `asset-${n.nodeId}`,
            assetFamily: 'MEDIA',
            capabilityOrigin: 'VISUAL',
            isActive: true,
            isLocked: false,
            temporal: {
              globalStartTimeSeconds: n.startSec ?? 0,
              playDurationSeconds: n.durationSec ?? 5,
              trimStartSeconds: 0,
              trimEndSeconds: n.durationSec ?? 5,
            },
            spatial: {
              positionX: n.positionX ?? 0,
              positionY: n.positionY ?? 0,
              scaleX: n.scaleX ?? 1,
              scaleY: n.scaleY ?? 1,
              rotationDegrees: n.rotationDegrees ?? 0,
              zIndex: n.zIndex ?? 0,
            },
            customDirectives:
              n.blendMode !== undefined || n.opacity !== undefined
                ? { visual: { opacity: n.opacity ?? 1, blendMode: n.blendMode ?? 'NORMAL' } }
                : {},
            runtimeAsset: {
              assetId: `asset-${n.nodeId}`,
              subscriberTenantId: 'tenant-1',
              originatingOperationId: 'op-multi',
              capabilityTarget: 'VISUAL' as any,
              assetFamily: 'MEDIA' as any,
              secureStorageUri: n.imageUri ?? '/generated-assets/img.png',
              metadata: {},
              createdAt: 0,
              updatedAt: 0,
            },
          })) as any[],
        },
      ],
      createdAt: 0,
      updatedAt: 0,
    },
    metadata: {
      totalTracks: 1,
      totalNodes: nodes.length,
      estimatedDurationSeconds: maxEnd,
      aggregatedAssetFamilies: ['MEDIA'],
    },
    mixPlan: {
      nodeMixes: nodes.map((n) => ({
        nodeId: n.nodeId,
        trackId,
        volumeDb: 0,
        panCenter: 0,
        isMuted: false,
      })),
      trackMixes: [{ trackId, trackVolumeDb: 0, isMuted: false }],
    },
    subtitlePlan: { absoluteCues: [] },
    compiledAt: 0,
  };
}

describe('VI-C — Full Cinematic Overlay Composition', () => {
  it('A — positionX/positionY propagate to overlay=x=<posX>:y=<posY> in filter_complex', () => {
    const graph = makeMultiNodeGraph([{ nodeId: 'n-a', positionX: 100, positionY: 200 }]);
    spawnEncoding('op-vic-a', graph);
    const fc = getFilterComplex(mockSpawn.mock.calls[0][1] as string[]);
    expect(fc).toContain('overlay=x=100:y=200');
  });

  it('B — scaleX=0.5, scaleY=0.5 → scale=960:540 (half of 1920×1080) in filter_complex', () => {
    const graph = makeMultiNodeGraph([{ nodeId: 'n-b', scaleX: 0.5, scaleY: 0.5 }]);
    spawnEncoding('op-vic-b', graph);
    const fc = getFilterComplex(mockSpawn.mock.calls[0][1] as string[]);
    // targetW = round(1920 * 0.5) = 960, targetH = round(1080 * 0.5) = 540
    expect(fc).toContain('scale=960:540');
  });

  it('C — rotationDegrees=90 → rotate=1.570796 (π/2 radians) in filter_complex', () => {
    const graph = makeMultiNodeGraph([{ nodeId: 'n-c', rotationDegrees: 90 }]);
    spawnEncoding('op-vic-c', graph);
    const fc = getFilterComplex(mockSpawn.mock.calls[0][1] as string[]);
    expect(fc).toContain('rotate=1.570796');
  });

  it('D — opacity=0.5 with NORMAL blend → colorchannelmixer=aa=0.500000 in filter_complex', () => {
    const graph = makeMultiNodeGraph([{ nodeId: 'n-d', opacity: 0.5, blendMode: 'NORMAL' }]);
    spawnEncoding('op-vic-d', graph);
    const fc = getFilterComplex(mockSpawn.mock.calls[0][1] as string[]);
    expect(fc).toContain('colorchannelmixer=aa=0.500000');
  });

  it('E — lower zIndex node is overlaid first (earlier position in filter chain)', () => {
    // n-high (zIndex=2) must appear AFTER n-low (zIndex=1) in filter_complex.
    // Encoder sorts ascending: zIndex=1 → FFmpeg input 0 → [vn0]; zIndex=2 → input 1 → [vn1].
    const graph = makeMultiNodeGraph([
      { nodeId: 'n-high', zIndex: 2, imageUri: '/generated-assets/high.png' },
      { nodeId: 'n-low',  zIndex: 1, imageUri: '/generated-assets/low.png' },
    ]);
    spawnEncoding('op-vic-e', graph);
    const fc = getFilterComplex(mockSpawn.mock.calls[0][1] as string[]);
    // Both NORMAL nodes get [vn0] and [vn1] overlay labels in z-order
    expect(fc).toContain('[vn0]');
    expect(fc).toContain('[vn1]');
    // [canvas0][vn0] overlay must precede [canvas1][vn1] overlay in the filter string
    const idxFirst  = fc.indexOf('[canvas0][vn0]');
    const idxSecond = fc.indexOf('[canvas1][vn1]');
    expect(idxFirst).toBeGreaterThanOrEqual(0);
    expect(idxSecond).toBeGreaterThan(idxFirst);
  });

  it('F — blendMode=MULTIPLY → blend=all_mode=multiply and white identity canvas in filter_complex', () => {
    const graph = makeMultiNodeGraph([{ nodeId: 'n-f', blendMode: 'MULTIPLY', opacity: 1 }]);
    spawnEncoding('op-vic-f', graph);
    const fc = getFilterComplex(mockSpawn.mock.calls[0][1] as string[]);
    expect(fc).toContain('blend=all_mode=multiply');
    expect(fc).toContain('color=c=white');
  });

  it('G — temporal overlap: two active-window enable expressions both present in filter_complex', () => {
    // n-g0: [0,3), n-g1: [2,5) — windows overlap
    const graph = makeMultiNodeGraph([
      { nodeId: 'n-g0', startSec: 0, durationSec: 3 },
      { nodeId: 'n-g1', startSec: 2, durationSec: 3 },
    ]);
    spawnEncoding('op-vic-g', graph);
    const fc = getFilterComplex(mockSpawn.mock.calls[0][1] as string[]);
    expect(fc).toContain("enable='between(t,0,3)'");
    expect(fc).toContain("enable='between(t,2,5)'");
  });

  it('H — VI-A regression: voice path still reaches FFmpeg -i args under VI-C encoder', () => {
    const nodeId = 'n-h';
    const voiceUri = '/uploads/voice-vic-h.mp3';
    const graph = makeMultiNodeGraph([{ nodeId }]);
    const voicePaths = new Map([[nodeId, voiceUri]]);
    spawnEncoding('op-vic-h', graph, voicePaths);
    const args = mockSpawn.mock.calls[0][1] as string[];
    expect(args).toContain(join(process.cwd(), 'public', 'uploads/voice-vic-h.mp3'));
  });

  it('I — VI-B regression: trim and fade-in still applied to audio chain under VI-C encoder', () => {
    // Uses makeImageGraph (which supports trimStartSeconds/trimEndSeconds overrides)
    // to verify VI-B directives remain intact after VI-C changes.
    const graph = makeImageGraph({
      nodeId: 'n-i',
      durationSec: 7,
      trimStartSeconds: 2,
      trimEndSeconds: 5,
      mixPlan: {
        nodeMixes: [{ nodeId: 'n-i', trackId: 'track-1', volumeDb: 0, panCenter: 0, isMuted: false, fadeInSeconds: 1 }],
        trackMixes: [{ trackId: 'track-1', trackVolumeDb: 0, isMuted: false }],
      },
    });
    const voicePaths = new Map([['n-i', '/uploads/voice-vic-i.mp3']]);
    spawnEncoding('op-vic-i', graph, voicePaths);
    const fc = getFilterComplex(mockSpawn.mock.calls[0][1] as string[]);
    // VI-B trim: source trimmed to [2s, 5s]
    expect(fc).toContain('atrim=2:5,asetpts=PTS-STARTPTS');
    // VI-B fade-in: 1 second fade from silence
    expect(fc).toContain('afade=t=in:st=0:d=1.000000');
  });
});

// ============================================================
// Storage Root Resolution — UPLOADS_DIR aware (Phase II repair)
// ============================================================

describe('Storage Root Resolution — UPLOADS_DIR aware', () => {
  let savedUploadsDir: string | undefined;

  beforeEach(() => {
    savedUploadsDir = process.env.UPLOADS_DIR;
  });

  afterEach(() => {
    if (savedUploadsDir === undefined) delete process.env.UPLOADS_DIR;
    else process.env.UPLOADS_DIR = savedUploadsDir;
  });

  it('Test 1 — /uploads/ URI resolves against UPLOADS_DIR root when UPLOADS_DIR is set', () => {
    process.env.UPLOADS_DIR = '/var/www/azma-uploads';
    const graph = makeImageGraph({ imageUri: '/uploads/fresh-upload.jpg' });

    expect(() => spawnEncoding('op-uploads-dir', graph)).not.toThrow();
    expect(mockSpawn).toHaveBeenCalledTimes(1);
    const ffmpegArgs = mockSpawn.mock.calls[0][1] as string[];
    // Path must be UPLOADS_DIR/fresh-upload.jpg — not {cwd}/public/uploads/fresh-upload.jpg
    expect(ffmpegArgs).toContain(join('/var/www/azma-uploads', 'fresh-upload.jpg'));
  });

  it('Test 2 — /generated-assets/ URI resolves against UPLOADS_DIR/generated-assets when UPLOADS_DIR is set', () => {
    process.env.UPLOADS_DIR = '/var/www/azma-uploads';
    const graph = makeImageGraph({ imageUri: '/generated-assets/fresh-gen.png' });

    expect(() => spawnEncoding('op-generated-dir', graph)).not.toThrow();
    expect(mockSpawn).toHaveBeenCalledTimes(1);
    const ffmpegArgs = mockSpawn.mock.calls[0][1] as string[];
    expect(ffmpegArgs).toContain(join('/var/www/azma-uploads', 'generated-assets', 'fresh-gen.png'));
  });

  it('Test 3 — asset present at UPLOADS_DIR but absent from public/ is found; missing altogether is honest failure', () => {
    process.env.UPLOADS_DIR = '/var/www/azma-uploads';
    const graph = makeImageGraph({ imageUri: '/uploads/new-upload.jpg' });
    // File exists only at UPLOADS_DIR path (not at public/uploads/)
    mockExistsSync.mockImplementation((p: string) =>
      p === join('/var/www/azma-uploads', 'new-upload.jpg'),
    );

    // Must NOT throw — the encoder resolves to UPLOADS_DIR and the file is there
    expect(() => spawnEncoding('op-found-in-uploads-dir', graph)).not.toThrow();
    expect(mockSpawn).toHaveBeenCalledTimes(1);

    jest.clearAllMocks();
    mockSpawn.mockReturnValue(makeProcess());

    // Completely missing file still produces an honest failure
    mockExistsSync.mockReturnValue(false);
    expect(() => spawnEncoding('op-missing-uploads-dir', graph)).toThrow('not found at');
    expect(mockSpawn).not.toHaveBeenCalled();
  });

  it('Test 4 — full pipeline: both upload and generated-asset URIs resolve through UPLOADS_DIR in one encode', () => {
    process.env.UPLOADS_DIR = '/var/www/azma-uploads';
    const graph = makeMultiNodeGraph([
      { nodeId: 'n-upload',    imageUri: '/uploads/fresh-uuid.jpg',              startSec: 0, durationSec: 5 },
      { nodeId: 'n-generated', imageUri: '/generated-assets/fresh-qiyamah.png',  startSec: 5, durationSec: 5 },
    ]);

    expect(() => spawnEncoding('op-full-uploads-dir', graph)).not.toThrow();
    expect(mockSpawn).toHaveBeenCalledTimes(1);
    const ffmpegArgs = mockSpawn.mock.calls[0][1] as string[];
    expect(ffmpegArgs).toContain(join('/var/www/azma-uploads', 'fresh-uuid.jpg'));
    expect(ffmpegArgs).toContain(join('/var/www/azma-uploads', 'generated-assets', 'fresh-qiyamah.png'));
  });

  it('legacy path preserved — /uploads/ and /generated-assets/ fall back to public/ when UPLOADS_DIR is absent', () => {
    delete process.env.UPLOADS_DIR;

    const graphUpload = makeImageGraph({ imageUri: '/uploads/legacy.jpg' });
    expect(() => spawnEncoding('op-legacy-upload', graphUpload)).not.toThrow();
    expect(mockSpawn.mock.calls[0][1]).toContain(join(process.cwd(), 'public', 'uploads', 'legacy.jpg'));

    jest.clearAllMocks();
    mockSpawn.mockReturnValue(makeProcess());

    const graphGen = makeImageGraph({ imageUri: '/generated-assets/legacy-gen.png' });
    expect(() => spawnEncoding('op-legacy-gen', graphGen)).not.toThrow();
    expect(mockSpawn.mock.calls[0][1]).toContain(join(process.cwd(), 'public', 'generated-assets', 'legacy-gen.png'));
  });
});

// ============================================================
// Repair C — pre-spawn validation throws synchronously (MAG-LF-001C)
// ============================================================

describe('Repair C — spawnEncoding throws synchronously on invalid graph', () => {
  it('throws when graph has no active image nodes — FFmpeg is never spawned', () => {
    const emptyGraph: CompiledAssemblyGraph = {
      compilationId: 'comp-empty',
      sourceCanvasId: 'canvas-empty',
      subscriberTenantId: 'tenant-1',
      canvasType: CanvasType.CINEMATIC,
      hydratedCanvas: {
        canvasId: 'canvas-empty',
        subscriberTenantId: 'tenant-1',
        canvasType: CanvasType.CINEMATIC,
        title: 'Empty',
        tracks: [],
        createdAt: 0,
        updatedAt: 0,
      },
      metadata: { totalTracks: 0, totalNodes: 0, aggregatedAssetFamilies: [] },
      mixPlan: { nodeMixes: [], trackMixes: [] },
      subtitlePlan: { absoluteCues: [] },
      compiledAt: 0,
    };

    expect(() => spawnEncoding('op-empty-nodes', emptyGraph)).toThrow('no active image nodes');
    expect(mockSpawn).not.toHaveBeenCalled();
  });

  it('throws when active node has no secureStorageUri — FFmpeg is never spawned', () => {
    const graph = makeImageGraph({ nodeId: 'no-uri-node' });
    // Strip secureStorageUri to simulate an un-hydrated graph
    (graph.hydratedCanvas.tracks[0].nodes[0] as any).runtimeAsset.secureStorageUri = undefined;

    expect(() => spawnEncoding('op-no-uri', graph)).toThrow('has no secureStorageUri');
    expect(mockSpawn).not.toHaveBeenCalled();
  });

  it('throws when asset file does not exist on disk — FFmpeg is never spawned', () => {
    const graph = makeImageGraph({ nodeId: 'missing-asset', imageUri: '/vault/missing-proof.png' });
    // Image file does not exist
    mockExistsSync.mockImplementation((p: string) => !p.includes('missing-proof.png'));

    expect(() => spawnEncoding('op-missing-file', graph)).toThrow('not found at');
    expect(mockSpawn).not.toHaveBeenCalled();
  });

  it('valid graph still spawns FFmpeg — repair does not break the happy path', () => {
    const graph = makeImageGraph({ nodeId: 'valid-node' });
    // existsSync returns true by default in beforeEach

    expect(() => spawnEncoding('op-valid', graph)).not.toThrow();
    expect(mockSpawn).toHaveBeenCalledTimes(1);
  });
});
