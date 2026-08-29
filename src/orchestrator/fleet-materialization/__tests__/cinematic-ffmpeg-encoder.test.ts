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
  mixPlan?: CompiledAssemblyGraph['mixPlan'];
} = {}): CompiledAssemblyGraph {
  const nodeId = overrides.nodeId ?? 'img-1';
  const trackId = 'track-1';
  const imageUri = overrides.imageUri ?? '/generated-assets/img.png';
  const startSec = overrides.startSec ?? 0;
  const durationSec = overrides.durationSec ?? 5;

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
                trimStartSeconds: 0,
                trimEndSeconds: durationSec,
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
