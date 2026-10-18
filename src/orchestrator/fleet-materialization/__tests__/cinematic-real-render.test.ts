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
import { existsSync, mkdirSync, mkdtempSync, rmSync } from 'node:fs';
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
const savedEnv = { UPLOADS_DIR: process.env.UPLOADS_DIR };

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

/** The frame size the file actually has — not the one the UI asked for. */
function dimensions(file: string): string {
  const r = spawnSync('ffprobe', [
    '-v', 'error', '-select_streams', 'v:0', '-show_entries', 'stream=width,height',
    '-of', 'csv=p=0:s=x', file,
  ]);
  return r.stdout.toString().trim();
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
    // `spawnSync('mkdir', ['-p', ...])` stood here and does not exist on
    // Windows, so the fixtures were written into a directory that was never
    // created and every test in this file failed before ffmpeg was reached.
    mkdirSync(uploads, { recursive: true });
    // One variable decides where films go, and it is this one. The encoder
    // deliberately does NOT read a RENDERS_DIR of its own — see rendersDir().
    process.env.UPLOADS_DIR = uploads;

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
    if (savedEnv.UPLOADS_DIR === undefined) delete process.env.UPLOADS_DIR;
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

  it('mixes an audio-only .webm the Vault filed as video as sound, instead of failing the render', async () => {
    // Browsers report an audio .webm chosen from disk as video/webm.
    const out = await encode('op-real-webm-as-motion', graph([
      { trackId: 'main', nodes: [
        node('scene', 'blue.png', 'VISUAL', 0, 3),
        node('narration', 'recording.webm', 'MOTION', 0, 3),
      ] },
    ], 3));
    const [r, , b] = pixel(out, 1.5, 960, 540);
    expect(b).toBeGreaterThan(200);
    expect(r).toBeLessThan(60);
    expect(meanVolume(out, 0.3, 2.7)).toBeGreaterThan(-40);
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

  // ── THE TWO GUARDS CARRIED OVER FROM main ─────────────────────────────────
  //
  //   Both blend defects were found while measuring something else, and both
  //   are PRE-EXISTING: `blend` was handed one RGBA side and one YUV side, so
  //   it mixed across two colour spaces. They are kept here because the
  //   integration carries the repair, and a repair with no witness is a repair
  //   that comes undone.

  it('a blended layer does not bleed before its own window', async () => {
    // MEASURED before the repair: a SCREEN layer whose window opened at 3s was
    // already on screen at 1s. A layer appearing two seconds early is not a
    // colour artefact — it is the wrong shot.
    const out = await encode('op-real-blend-early', graph([{
      trackId: 'main',
      nodes: [
        node('base', 'red.png', 'VISUAL', 0, 6),
        node('over', 'blue.png', 'VISUAL', 3, 3, { visual: { blendMode: 'SCREEN' } }),
      ],
    }], 6));

    const before = pixel(out, 1, 960, 540);
    expect(before[0]).toBeGreaterThan(200);   // the shot that IS on the timeline
    expect(before[2]).toBeLessThan(30);       // and nothing of the one that is not
  });

  it('a MULTIPLY blend resolves in the colour space the preview used', async () => {
    // The chamber previews blend modes with CSS `mix-blend-mode`, defined in
    // sRGB, where blue multiplied into red is black. MEASURED before the
    // repair: (53,107,0) — a green neither layer contained.
    const out = await encode('op-real-blend-space', graph([{
      trackId: 'main',
      nodes: [
        node('base', 'red.png', 'VISUAL', 0, 6),
        node('over', 'blue.png', 'VISUAL', 3, 3, { visual: { blendMode: 'MULTIPLY' } }),
      ],
    }], 6));

    const [r, g, b] = pixel(out, 5, 960, 540);
    expect(Math.max(r, g, b)).toBeLessThan(30);
  });

  it('music longer than the pictures does not add black video after the last frame', async () => {
    // §6 item 1. The music here runs 6s under a single 2s image. Before this,
    // the film was 6 seconds: two of the Creator's work and four of black.
    const out = await encode('op-real-tail', graph([
      { trackId: 'main', nodes: [node('scene', 'red.png', 'VISUAL', 0, 2)] },
      { trackId: 'score', nodes: [node('score', 'music.mp3', 'AUDIO', 0, 6)] },
    ], 6));

    near(duration(out), 2, 0.3);
    // And the last frame is still the picture, not a black one.
    const last = pixel(out, 1.8, 960, 540);
    expect(last[0]).toBeGreaterThan(200);
  });

  // ── §3 · THE FRAME THE CREATOR CHOSE IS THE FRAME IN THE FILE ────────────
  //
  //   MEASURED on the merged encoder before this: every profile produced
  //   1920×1080. The chamber's selector was real and its preview obeyed it; the
  //   renderer read two module constants and ignored both.
  //
  //   One image, one second, four frames — the smallest real render that can
  //   tell a selector that works from a selector that only looks like it does.
  it.each([
    ['landscape', '1920x1080'],
    ['portrait', '1080x1920'],
    ['square', '1080x1080'],
    ['portrait-feed', '1080x1350'],
  ])('renders the %s profile at %s', async (profile, expected) => {
    const g = graph([{ trackId: 'main', nodes: [node('scene', 'red.png', 'VISUAL', 0, 1)] }], 1);
    (g.metadata as { outputProfile?: string }).outputProfile = profile;
    const out = await encode(`op-real-frame-${profile}`, g);
    expect(dimensions(out)).toBe(expected);
  });

  it('a portrait frame letterboxes a landscape photograph instead of stretching it', async () => {
    // red.png is 1920×1080. In a 1080×1920 frame it is contained, so the top
    // and bottom of the frame stay black and the middle carries the picture.
    // Stretched to fill, the corners would be red too.
    const g = graph([{ trackId: 'main', nodes: [node('scene', 'red.png', 'VISUAL', 0, 1)] }], 1);
    (g.metadata as { outputProfile?: string }).outputProfile = 'portrait';
    const out = await encode('op-real-frame-contain', g);

    expect(dimensions(out)).toBe('1080x1920');
    const centre = pixel(out, 0.5, 540, 960);
    const nearTop = pixel(out, 0.5, 540, 120);
    expect(centre[0]).toBeGreaterThan(200);   // the picture is there
    expect(nearTop[0]).toBeLessThan(40);      // and it was not stretched to the edge
  });
});
