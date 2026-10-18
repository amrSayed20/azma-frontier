/**
 * AZMA OS — THE GOLDEN RENDER · Ministry IV's encoder, measured in a real MP4
 *
 * ─── WHY THIS FILE EXISTS ───────────────────────────────────────────────────
 *
 *   `cinematic-ffmpeg-encoder.test.ts` mocks `spawn`. It proves the command
 *   line was assembled; it cannot prove the film is right. Four defects lived
 *   behind that distinction for weeks — transitions that never faded, clips
 *   that never appeared, a microphone recording that was silent, a layer in
 *   the wrong place — and every one of them passed the mocked suite.
 *
 *   So this suite runs the REAL ffmpeg through the encoder's own
 *   `spawnEncoding()` and then reads the OUTPUT back: pixels sampled at named
 *   instants, loudness measured per window, duration probed. What it asserts
 *   is the film, not the arguments.
 *
 *   It skips when ffmpeg/ffprobe are absent — and a skip is NOT evidence. The
 *   report that cites it must say which of the two happened.
 */

import { spawnSync } from 'node:child_process';
import { mkdtempSync, mkdirSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import type { CompiledAssemblyGraph } from '@/src/chambers/ras-al-amr/pre-publishing-boundary';

const FFMPEG = process.env.AZMA_FFMPEG ?? 'ffmpeg';
const FFPROBE = process.env.AZMA_FFPROBE ?? 'ffprobe';

const hasFfmpeg =
  spawnSync(FFMPEG, ['-version']).status === 0 && spawnSync(FFPROBE, ['-version']).status === 0;
const describeReal = hasFfmpeg ? describe : describe.skip;

type Encoder = typeof import('../fleet/adapters/cinematic-ffmpeg-encoder');
let encoder: Encoder;
let workDir = '';
let uploads = '';

function ffmpeg(args: string[]): void {
  const r = spawnSync(FFMPEG, ['-v', 'error', '-y', ...args], { cwd: uploads });
  if (r.status !== 0) throw new Error(`ffmpeg failed: ${r.stderr?.toString().slice(0, 400)}`);
}

/** One pixel of the finished film, at one instant. The only honest witness. */
function pixel(file: string, t: number, x: number, y: number): [number, number, number] {
  const r = spawnSync(FFMPEG, [
    '-v', 'error', '-ss', String(t), '-i', file,
    // ISOLATED, after two wrong diagnoses of my own: the option that breaks
    // this read is `-pix_fmt rgb24` as an OUTPUT option. It makes ffmpeg insert
    // an auto-scaler, the scaler cannot handle a 1x1 frame ("non positive size
    // for width '0'"), stdout comes back empty, and the helper then reports
    // "no pixel" — indistinguishable from a black frame. That false reading is
    // what first made position-and-scale look broken.
    //
    // NOT the cause, though both were claimed first: the missing `-an`, and
    // `crop=1:1` itself. MEASURED on ffmpeg 8 and 9, with and without an audio
    // stream: `crop=1:1:x:y,format=rgb24` and no `-pix_fmt` reads correctly.
    // Cropping to 2x2 and scaling down keeps `-pix_fmt` usable, and is exact.
    '-an', '-vf', `crop=2:2:${x}:${y},scale=1:1`, '-frames:v', '1',
    '-f', 'rawvideo', '-pix_fmt', 'rgb24', '-',
  ], { maxBuffer: 1 << 22 });
  const b = r.stdout;
  if (!b || b.length < 3) {
    throw new Error(`no pixel at t=${t} (${x},${y}): ${String(r.stderr).slice(0, 300)}`);
  }
  return [b[0]!, b[1]!, b[2]!];
}

function meanDb(file: string, from: number, to: number): number {
  const r = spawnSync(FFMPEG, [
    '-v', 'info', '-ss', String(from), '-to', String(to), '-i', file,
    '-af', 'volumedetect', '-vn', '-f', 'null', '-',
  ], { encoding: 'utf8' });
  const m = /mean_volume:\s*(-?[\d.]+) dB/.exec(r.stderr ?? '');
  if (!m) throw new Error('no volumedetect reading');
  return Number(m[1]);
}

function durationOf(file: string): number {
  const r = spawnSync(FFPROBE, [
    '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file,
  ], { encoding: 'utf8' });
  return Number((r.stdout ?? '').trim());
}

type NodeOpts = {
  temporal?: Record<string, unknown>;
  spatial?: Record<string, unknown>;
  visual?: Record<string, unknown>;
};

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
      title: 'Golden render',
      tracks: tracks.map((t) => ({
        trackId: t.trackId, trackName: t.trackId, isMuted: false, isHidden: false, nodes: t.nodes,
      })),
      createdAt: 0,
      updatedAt: 0,
    },
    metadata: {
      totalTracks: tracks.length,
      totalNodes: tracks.reduce((n, t) => n + t.nodes.length, 0),
      estimatedDurationSeconds: total,
      aggregatedAssetFamilies: ['MEDIA'],
    },
    mixPlan: { nodeMixes: [], trackMixes: [] },
    subtitlePlan: { absoluteCues: [] },
    compiledAt: 0,
  } as unknown as CompiledAssemblyGraph;
}

async function encode(operationId: string, g: CompiledAssemblyGraph): Promise<string> {
  encoder.spawnEncoding(operationId, g);
  for (let i = 0; i < 900; i += 1) {
    if (encoder.isEncodingComplete(operationId)) return encoder.getOutputPath(operationId);
    const err = encoder.getEncodingError(operationId);
    if (err) throw new Error(String(err));
    await new Promise((r) => setTimeout(r, 200));
  }
  throw new Error(`encode ${operationId} timed out`);
}

describeReal('Ministry IV encoder — the film matches what the chamber showed', () => {
  jest.setTimeout(240_000);

  beforeAll(() => {
    workDir = mkdtempSync(join(tmpdir(), 'azma-golden-'));
    uploads = join(workDir, 'uploads');
    mkdirSync(uploads, { recursive: true });
    process.env.UPLOADS_DIR = uploads;
    process.env.RENDERS_DIR = join(workDir, 'renders');
    mkdirSync(process.env.RENDERS_DIR, { recursive: true });

    ffmpeg(['-f', 'lavfi', '-i', 'color=c=red:s=1920x1080', '-frames:v', '1', 'red.png']);
    ffmpeg(['-f', 'lavfi', '-i', 'color=c=blue:s=1920x1080', '-frames:v', '1', 'blue.png']);
    // A 2-second green clip — a Creator's own video on the timeline.
    ffmpeg(['-f', 'lavfi', '-i', 'color=c=green:s=640x360:r=25:d=2',
      '-c:v', 'libx264', '-pix_fmt', 'yuv420p', 'green.mp4']);
    ffmpeg(['-f', 'lavfi', '-i', 'sine=frequency=440:duration=3', '-c:a', 'libmp3lame', 'tone.mp3']);
    // A browser microphone recording: opus inside a .webm container.
    ffmpeg(['-f', 'lavfi', '-i', 'sine=frequency=880:duration=3', '-c:a', 'libopus', 'voice.webm']);

    jest.resetModules();
    // eslint-disable-next-line @typescript-eslint/no-require-imports, global-require
    encoder = require('../fleet/adapters/cinematic-ffmpeg-encoder') as Encoder;
  });

  it('DEFECT 1 — a crossfade is a RAMP in the film, not a cut', async () => {
    // Red 0→4s. Blue enters at 3.0s declaring a 1s crossfade. At 3.5s the
    // frame must be a blend of the two; a cut gives pure blue, which is what
    // the chamber's preview never showed.
    const file = await encode('op_golden_fade', graph([{
      trackId: 'V1',
      nodes: [
        node('n-red', 'red.png', 'VISUAL', 0, 4),
        node('n-blue', 'blue.png', 'VISUAL', 3, 3, {
          temporal: { transitionInType: 'crossfade', transitionInDurationSeconds: 1 },
        }),
      ],
    }], 6));

    const mid = pixel(file, 3.5, 960, 540);
    expect(mid[2]).toBeGreaterThan(40);          // blue is arriving
    expect(mid[0]).toBeGreaterThan(40);          // red has not vanished
  });

  it('DEFECT 2 — a Creator video clip appears in its own window', async () => {
    const file = await encode('op_golden_clip', graph([{
      trackId: 'V1',
      nodes: [
        node('n-red', 'red.png', 'VISUAL', 0, 2),
        node('n-clip', 'green.mp4', 'MOTION', 2, 2),
      ],
    }], 4));

    const inClip = pixel(file, 3.0, 960, 540);
    expect(inClip[1]).toBeGreaterThan(80);       // green is on screen
    expect(inClip[0]).toBeLessThan(80);
  });

  it('DEFECT 3 — a .webm microphone recording is heard', async () => {
    const file = await encode('op_golden_webm', graph([
      { trackId: 'V1', nodes: [node('n-red', 'red.png', 'VISUAL', 0, 3)] },
      { trackId: 'A1', nodes: [node('n-voice', 'voice.webm', 'AUDIO', 0, 3)] },
    ], 3));

    expect(meanDb(file, 0.5, 2.5)).toBeGreaterThan(-60);
  });

  it('DEFECT 4 — a half-scale layer sits where the chamber put it', async () => {
    // scale 0.5 at the canvas centre: the middle is red, the far corner black.
    const file = await encode('op_golden_place', graph([{
      trackId: 'V1',
      nodes: [node('n-red', 'red.png', 'VISUAL', 0, 2, {
        spatial: { positionX: 0, positionY: 0, scaleX: 0.5, scaleY: 0.5, rotationDegrees: 0, zIndex: 0 },
      })],
    }], 2));

    const centre = pixel(file, 1.0, 960, 540);
    const corner = pixel(file, 1.0, 40, 40);
    expect(centre[0]).toBeGreaterThan(150);      // the layer is centred
    expect(corner[0]).toBeLessThan(60);          // and does not fill the frame
  });

  it('DEFECT 1b — a crossfade over an ENDING shot leaves no blank frame', async () => {
    // The contract forbids a blank frame. Here red ENDS exactly where blue
    // begins, so unless red is held under the ramp the dissolve happens over
    // black — which is the blank frame, arriving dressed as a transition.
    const file = await encode('op_golden_hold', graph([{
      trackId: 'V1',
      nodes: [
        node('n-red', 'red.png', 'VISUAL', 0, 3),
        node('n-blue', 'blue.png', 'VISUAL', 3, 3, {
          temporal: { transitionInType: 'crossfade', transitionInDurationSeconds: 1 },
        }),
      ],
    }], 6));

    const mid = pixel(file, 3.5, 960, 540);
    expect(mid[0]).toBeGreaterThan(40);          // the outgoing shot is held
    expect(mid[2]).toBeGreaterThan(40);          // the incoming shot is arriving
  });

  it('a blended layer does not bleed before its own window', async () => {
    // PRE-EXISTING, found while measuring the ramp: a SCREEN layer whose window
    // opened at 3s was already on screen at 0.2s, because `blend` was handed
    // one RGBA side and one YUV side. A layer appearing three seconds early is
    // not a colour artefact; it is the wrong shot.
    const file = await encode('op_golden_blend_early', graph([{
      trackId: 'V1',
      nodes: [
        node('n-red', 'red.png', 'VISUAL', 0, 6),
        node('n-blue', 'blue.png', 'VISUAL', 3, 3, { visual: { blendMode: 'SCREEN' } }),
      ],
    }], 6));

    const before = pixel(file, 1.0, 960, 540);
    expect(before[0]).toBeGreaterThan(200);      // the shot that IS on the timeline
    expect(before[2]).toBeLessThan(30);          // and nothing of the one that is not
  });

  it('a MULTIPLY blend resolves in the colour space the chamber previewed', async () => {
    // The chamber previews blend modes with CSS `mix-blend-mode`, defined in
    // sRGB. Blue multiplied into red is black. MEASURED before the repair:
    // (53,107,0) — a green neither layer contained.
    const file = await encode('op_golden_blend_space', graph([{
      trackId: 'V1',
      nodes: [
        node('n-red', 'red.png', 'VISUAL', 0, 6),
        node('n-blue', 'blue.png', 'VISUAL', 3, 3, { visual: { blendMode: 'MULTIPLY' } }),
      ],
    }], 6));

    const [r, g, b] = pixel(file, 5.0, 960, 540);
    expect(Math.max(r, g, b)).toBeLessThan(30);
  });

  it('a crossfade on a blended layer ramps the blend itself', async () => {
    // This branch carries no alpha channel, so the ramp runs from the blend's
    // identity colour to the layer — which is the same journey as "no effect"
    // to "full effect". Half way through a declared one-second ramp, SCREEN
    // must be part of the way to magenta and no further.
    const file = await encode('op_golden_blend_ramp', graph([{
      trackId: 'V1',
      nodes: [
        node('n-red', 'red.png', 'VISUAL', 0, 6),
        node('n-blue', 'blue.png', 'VISUAL', 3, 3, {
          temporal: { transitionInType: 'crossfade', transitionInDurationSeconds: 1 },
          visual: { blendMode: 'SCREEN' },
        }),
      ],
    }], 6));

    const mid = pixel(file, 3.5, 960, 540);
    expect(mid[0]).toBeGreaterThan(200);         // the base shot is untouched
    expect(mid[2]).toBeGreaterThan(40);          // the blend has begun
    expect(mid[2]).toBeLessThan(220);            // and has not finished
    expect(pixel(file, 5.0, 960, 540)[2]).toBeGreaterThan(220); // but does finish
  });

  it('and the film is as long as the timeline says', async () => {
    const file = await encode('op_golden_len', graph([{
      trackId: 'V1',
      nodes: [node('n-red', 'red.png', 'VISUAL', 0, 3)],
    }], 3));
    expect(Math.abs(durationOf(file) - 3)).toBeLessThanOrEqual(0.5);
  });
});
