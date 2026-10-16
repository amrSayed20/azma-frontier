/**
 * RAS AL AMR EXECUTION DIRECTIVE — PHASE 1 ACCEPTANCE: REAL RENDER PROOF
 *
 * Unlike cinematic-ffmpeg-encoder.test.ts (which mocks spawn), this suite runs
 * the real ffmpeg binary through the real spawnEncoding() path on generated
 * media, then measures the produced MP4: pixel colour at chosen instants and
 * mean audio level inside chosen windows. Each expectation is derived from the
 * same cinematic-timing.ts contract the Creator's preview draws with, so a
 * pass means the MP4 shows what the preview showed.
 *
 * Skipped automatically when ffmpeg/ffprobe are not installed.
 */

import { spawnSync } from 'node:child_process';
import { existsSync, mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CompiledAssemblyGraph } from '../../../chambers/ras-al-amr/pre-publishing-boundary';
import { computeVisualWindow, visualOpacityAt } from '../../../chambers/ras-al-amr/cinematic-timing';

const hasFfmpeg =
  spawnSync('ffmpeg', ['-version']).status === 0 && spawnSync('ffprobe', ['-version']).status === 0;
const describeReal = hasFfmpeg ? describe : describe.skip;

jest.setTimeout(120000);

type Encoder = typeof import('../fleet/adapters/cinematic-ffmpeg-encoder');

let workDir = '';
let uploads = '';
let encoder: Encoder;
const savedEnv = { UPLOADS_DIR: process.env.UPLOADS_DIR, RENDERS_DIR: process.env.RENDERS_DIR };

function ffmpeg(args: string[]): void {
  const r = spawnSync('ffmpeg', ['-v', 'error', '-y', ...args], { cwd: uploads });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${r.stderr?.toString()}`);
}

/** RGB of one pixel at time t. */
function pixel(file: string, t: number, x: number, y: number): [number, number, number] {
  const r = spawnSync('ffmpeg', [
    '-v', 'error', '-ss', String(t), '-i', file, '-frames:v', '1',
    '-vf', `crop=1:1:${x}:${y},format=rgb24`, '-f', 'rawvideo', '-',
  ]);
  const b = r.stdout as Buffer;
  return [b[0], b[1], b[2]];
}

/** Mean volume (dB) between two instants. */
function meanVolume(file: string, from: number, to: number): number {
  const r = spawnSync('ffmpeg', ['-v', 'info', '-ss', String(from), '-to', String(to), '-i', file, '-af', 'volumedetect', '-vn', '-f', 'null', '-']);
  const m = /mean_volume: (-?[0-9.]+) dB/.exec(r.stderr?.toString() ?? '');
  return m ? Number(m[1]) : -999;
}

function duration(file: string): number {
  const r = spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file]);
  return Number(r.stdout.toString().trim());
}

type NodeOpts = { temporal?: Record<string, unknown>; spatial?: Record<string, unknown>; visual?: Record<string, unknown> };

function node(nodeId: string, file: string, capability: string, start: number, dur: number, opts: NodeOpts = {}) {
  return {
    nodeId,
    assetId: `asset-${nodeId}`,
    assetFamily: 'MEDIA',
    capabilityOrigin: capability,
    isActive: true,
    isLocked: false,
    temporal: { globalStartTimeSeconds: start, playDurationSeconds: dur, ...(opts.temporal ?? {}) },
    spatial: { positionX: 0, positionY: 0, scaleX: 1, scaleY: 1, rotationDegrees: 0, zIndex: 0, ...(opts.spatial ?? {}) },
    customDirectives: opts.visual ? { visual: opts.visual } : undefined,
    runtimeAsset: {
      assetId: `asset-${nodeId}`,
      subscriberTenantId: 'tenant-real',
      originatingOperationId: 'op-src',
      capabilityTarget: capability,
      assetFamily: 'MEDIA',
      secureStorageUri: `/uploads/${file}`,
      metadata: {},
      createdAt: 0,
      updatedAt: 0,
    },
  };
}

function graph(tracks: { trackId: string; nodes: ReturnType<typeof node>[] }[], total: number): CompiledAssemblyGraph {
  return {
    compilationId: 'comp-real',
    sourceCanvasId: 'canvas-real',
    subscriberTenantId: 'tenant-real',
    canvasType: 'CINEMATIC',
    hydratedCanvas: {
      canvasId: 'canvas-real',
      subscriberTenantId: 'tenant-real',
      canvasType: 'CINEMATIC',
      title: 'Real render',
      tracks: tracks.map((t) => ({ trackId: t.trackId, trackName: t.trackId, isMuted: false, isHidden: false, nodes: t.nodes })),
      createdAt: 0,
      updatedAt: 0,
    },
    metadata: { totalTracks: tracks.length, totalNodes: tracks.reduce((n, t) => n + t.nodes.length, 0), estimatedDurationSeconds: total, aggregatedAssetFamilies: ['MEDIA'] },
    mixPlan: { nodeMixes: [], trackMixes: [] },
    subtitlePlan: { absoluteCues: [] },
    compiledAt: 0,
  } as unknown as CompiledAssemblyGraph;
}

async function encode(operationId: string, g: CompiledAssemblyGraph): Promise<string> {
  encoder.spawnEncoding(operationId, g);
  for (let i = 0; i < 600; i++) {
    if (encoder.isEncodingComplete(operationId)) return encoder.getOutputPath(operationId);
    const err = encoder.getEncodingError(operationId);
    if (err) throw err;
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`encode ${operationId} timed out`);
}

const near = (value: number, expected: number, tolerance: number) =>
  expect(Math.abs(value - expected)).toBeLessThanOrEqual(tolerance);

describeReal('Ras Al-Amr real render — the MP4 matches the preview contract', () => {
  beforeAll(async () => {
    workDir = mkdtempSync(join(tmpdir(), 'azma-real-render-'));
    uploads = join(workDir, 'uploads');
    spawnSync('mkdir', ['-p', uploads]);
    process.env.UPLOADS_DIR = uploads;
    process.env.RENDERS_DIR = join(workDir, 'renders');

    ffmpeg(['-f', 'lavfi', '-i', 'color=c=red:s=1920x1080', '-frames:v', '1', 'red.png']);
    ffmpeg(['-f', 'lavfi', '-i', 'color=c=blue:s=1920x1080', '-frames:v', '1', 'blue.png']);
    ffmpeg(['-f', 'lavfi', '-i', 'color=c=red:s=1080x1920', '-frames:v', '1', 'portrait.png']);
    // 2s green clip with its own 660 Hz soundtrack
    ffmpeg(['-f', 'lavfi', '-i', 'color=c=lime:s=1280x720:d=2', '-f', 'lavfi', '-i', 'sine=f=660:d=2', '-pix_fmt', 'yuv420p', '-shortest', 'clip.mp4']);
    // Browser-style microphone recording: Opus in a .webm container
    ffmpeg(['-f', 'lavfi', '-i', 'sine=f=440:d=3', '-c:a', 'libopus', 'recording.webm']);
    ffmpeg(['-f', 'lavfi', '-i', 'sine=f=880:d=6', 'music.mp3']);

    jest.resetModules();
    encoder = await import('../fleet/adapters/cinematic-ffmpeg-encoder');
  });

  afterAll(() => {
    process.env.UPLOADS_DIR = savedEnv.UPLOADS_DIR;
    process.env.RENDERS_DIR = savedEnv.RENDERS_DIR;
    if (savedEnv.UPLOADS_DIR === undefined) delete process.env.UPLOADS_DIR;
    if (savedEnv.RENDERS_DIR === undefined) delete process.env.RENDERS_DIR;
    if (workDir) rmSync(workDir, { recursive: true, force: true });
  });

  it('renders the crossfade, the video clip with its sound, the webm recording and the music on one timeline', async () => {
    const crossfade = { transitionInType: 'crossfade', transitionInDurationSeconds: 1 };
    const out = await encode('op-real-mixed', graph([
      {
        trackId: 'main',
        nodes: [
          node('scene-red', 'red.png', 'VISUAL', 0, 4),
          // Audio between two scenes in the same group must not cancel their crossfade.
          node('music', 'music.mp3', 'AUDIO', 4, 3),
          node('scene-blue', 'blue.png', 'VISUAL', 4, 4, { temporal: crossfade }),
          node('scene-clip', 'clip.mp4', 'MOTION', 8, 2),
        ],
      },
      { trackId: 'voice', nodes: [node('mic', 'recording.webm', 'AUDIO', 0, 3)] },
    ], 10));

    expect(existsSync(out)).toBe(true);
    expect(existsSync(out.replace(/\.mp4$/, '.partial.mp4'))).toBe(false);
    near(duration(out), 10, 0.2);

    // Before the dissolve: pure red.
    const [r1, , b1] = pixel(out, 2.0, 960, 540);
    expect(r1).toBeGreaterThan(230);
    expect(b1).toBeLessThan(25);

    // Mid-dissolve: the blend the preview draws at t=3.5.
    const blueTemporal = { globalStartTimeSeconds: 4, playDurationSeconds: 4, transitionInType: 'crossfade' as const, transitionInDurationSeconds: 1 };
    const blueOpacity = visualOpacityAt(computeVisualWindow(blueTemporal, undefined), 3.5);
    expect(blueOpacity).toBeCloseTo(0.5, 2);
    const [r2, , b2] = pixel(out, 3.5, 960, 540);
    near(r2, 255 * (1 - blueOpacity), 40);
    near(b2, 255 * blueOpacity, 40);

    // After the dissolve: pure blue.
    const [r3, , b3] = pixel(out, 5.0, 960, 540);
    expect(b3).toBeGreaterThan(230);
    expect(r3).toBeLessThan(25);

    // The video clip is on screen in its own window (contained 16:9 green).
    const [r4, g4, b4] = pixel(out, 9.0, 960, 540);
    expect(g4).toBeGreaterThan(200);
    expect(r4).toBeLessThan(60);
    expect(b4).toBeLessThan(60);

    // Microphone recording (webm/opus), music (mp3) and the clip's own sound are all audible.
    expect(meanVolume(out, 0.5, 2.5)).toBeGreaterThan(-40);
    expect(meanVolume(out, 5.0, 6.5)).toBeGreaterThan(-40);
    expect(meanVolume(out, 8.3, 9.7)).toBeGreaterThan(-40);
  });

  it('renders a canvas that holds only a video clip', async () => {
    const out = await encode('op-real-video-only', graph([
      { trackId: 'main', nodes: [node('only-clip', 'clip.mp4', 'MOTION', 0, 2)] },
    ], 2));
    const [r, g, b] = pixel(out, 1.0, 960, 540);
    expect(g).toBeGreaterThan(200);
    expect(r).toBeLessThan(60);
    expect(b).toBeLessThan(60);
  });

  it('places and sizes layers by the Package XXXII contract (centre offsets, contained, never stretched)', async () => {
    const out = await encode('op-real-geometry', graph([
      {
        trackId: 'main',
        nodes: [
          // 16:9 red at half size, centre moved 25% of the frame to the right.
          node('half', 'red.png', 'VISUAL', 0, 2, { spatial: { scaleX: 0.5, scaleY: 0.5, positionX: 25 } }),
          // Portrait red at full size, later in time.
          node('portrait', 'portrait.png', 'VISUAL', 2, 2),
        ],
      },
    ], 4));

    // Half-size layer: 960×540 box centred at (1440, 540) → spans x 960..1920, y 270..810.
    expect(pixel(out, 1.0, 1440, 540)[0]).toBeGreaterThan(230);
    expect(pixel(out, 1.0, 1100, 400)[0]).toBeGreaterThan(230);
    expect(pixel(out, 1.0, 480, 540)[0]).toBeLessThan(25);
    expect(pixel(out, 1.0, 1440, 100)[0]).toBeLessThan(25);

    // Portrait contained: 607×1080 centred → spans x ≈ 656..1264; outside stays black.
    expect(pixel(out, 3.0, 960, 540)[0]).toBeGreaterThan(230);
    expect(pixel(out, 3.0, 300, 540)[0]).toBeLessThan(25);
    expect(pixel(out, 3.0, 1600, 540)[0]).toBeLessThan(25);
  });

  it('stacks equal-zIndex layers in canvas order, not by node id', async () => {
    const out = await encode('op-real-order', graph([
      {
        trackId: 'main',
        nodes: [
          // Ids chosen so a lexical sort would put blue underneath.
          node('z-bottom-red', 'red.png', 'VISUAL', 0, 2),
          node('a-top-blue', 'blue.png', 'VISUAL', 0, 2),
        ],
      },
    ], 2));
    const [r, , b] = pixel(out, 1.0, 960, 540);
    expect(b).toBeGreaterThan(230);
    expect(r).toBeLessThan(25);
  });
});
