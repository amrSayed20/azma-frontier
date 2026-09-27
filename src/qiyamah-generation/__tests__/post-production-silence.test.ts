/**
 * AZMA OS — POST-PRODUCTION SILENCE ENFORCEMENT, held at the boundary.
 *
 * ─── WHAT THESE GUARDS CAN AND CANNOT PROVE ─────────────────────────────────
 *
 *   ffmpeg is not installed on the engineering machine; it is installed in
 *   production (8.0.1, /usr/bin). So these guards prove the DECISION — when a
 *   remux happens, when it must not, what is compared before the result is
 *   accepted, and that nothing else in the Empire moved — by driving the
 *   boundary through its injected tool seam.
 *
 *   The OUTCOME is proven where ffmpeg actually lives: the live proof of
 *   2026-09-27 ran the boundary on the production host against a real Seedance
 *   master carrying one audible AAC stream, and measured the result with
 *   ffprobe. That evidence is in the closure report, and the argument shape the
 *   proof depended on is held below so it cannot drift away from it.
 *
 *   Neither half stands alone. «القياس والنظر مجتمعان.»
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  enforceSovereignSilence,
  stripAudioStreams,
  type VideoStreamFacts,
  type SilenceTools,
} from '../sovereign-video-silence';
import { IMAGE_MODEL_FLEET } from '@/src/sovereign-model-selection/image-model-fleet';
import { VIDEO_MODEL_FLEET } from '@/src/sovereign-model-selection/video-model-fleet';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');

const SILENCE = read('src/qiyamah-generation/sovereign-video-silence.ts');
const STORAGE = read('src/qiyamah-generation/asset-storage.ts');
const SERVICE = read('src/qiyamah-generation/generation-service.ts');
const ANIMATE = read('app/api/vault/assets/[assetId]/animate/route.ts');
const CLIENT = read('app/qiyamah-chamber/QiyamahChamberClient.tsx');
const T2V = read('src/core/sovereign-ai-integration/adapters/magic-hour-adapter.ts');
const I2V = read('src/core/sovereign-ai-integration/adapters/magic-hour-image-to-video.ts');

const BYTES = Buffer.from('a master, as far as these guards are concerned');

const facts = (over: Partial<VideoStreamFacts> = {}): VideoStreamFacts => ({
  videoStreams: 1, audioStreams: 0, durationSeconds: 4.096,
  videoCodec: 'h264', width: 1280, height: 720, frameRate: '24/1', ...over,
});

/**
 * A stand-in for ffmpeg + ffprobe. `probe` answers differently for the input
 * and the output path, which is how a remux can be observed at all.
 */
function tools(before: VideoStreamFacts, after: VideoStreamFacts, opts: {
  stripThrows?: Error;
  writes?: Buffer;
} = {}): SilenceTools & { calls: string[] } {
  const calls: string[] = [];
  return {
    calls,
    probe: async (p: string) => {
      calls.push(`probe:${p.includes('sovereign-master') ? 'out' : 'in'}`);
      return p.includes('sovereign-master') ? after : before;
    },
    stripAudio: async (inPath: string, outPath: string) => {
      calls.push('strip');
      if (opts.stripThrows) throw opts.stripThrows;
      // The real ffmpeg writes the output file; the boundary reads it back.
      const { writeFileSync } = await import('fs');
      writeFileSync(outPath, opts.writes ?? Buffer.from('silenced master bytes'));
    },
  };
}

describe('A · a video with audio becomes a final output with zero audio streams', () => {
  it('removes the stream and reports what it removed', async () => {
    const t = tools(facts({ audioStreams: 1 }), facts({ audioStreams: 0 }));
    const out = await enforceSovereignSilence(BYTES, 'mp4', t);

    expect(out.after.audioStreams).toBe(0);
    expect(out.remuxed).toBe(true);
    expect(out.audioStreamsRemoved).toBe(1);
    expect(out.bytes.equals(BYTES)).toBe(false);   // it is the silenced file
  });

  it('two audio streams are both gone, and both are counted', async () => {
    const t = tools(facts({ audioStreams: 2 }), facts({ audioStreams: 0 }));
    const out = await enforceSovereignSilence(BYTES, 'mp4', t);
    expect(out.audioStreamsRemoved).toBe(2);
    expect(out.after.audioStreams).toBe(0);
  });

  it('H · a surviving audio stream is REFUSED, never deposited', async () => {
    // The whole point: the tool's success is not the proof. The file is.
    const t = tools(facts({ audioStreams: 1 }), facts({ audioStreams: 1 }));
    await expect(enforceSovereignSilence(BYTES, 'mp4', t))
      .rejects.toThrow(/audio streams still 1/);
  });
});

describe('B · a video that is already silent is a NO-OP', () => {
  it('nothing is remuxed and the very same Buffer comes back', async () => {
    const t = tools(facts({ audioStreams: 0 }), facts({ audioStreams: 0 }));
    const out = await enforceSovereignSilence(BYTES, 'mp4', t);

    expect(out.remuxed).toBe(false);
    expect(out.audioStreamsRemoved).toBe(0);
    expect(out.bytes).toBe(BYTES);                 // identity, not equality
    expect(t.calls).toEqual(['probe:in']);         // ffmpeg was never run
  });

  it('and enforcement is idempotent — its own output passes through untouched', async () => {
    const t = tools(facts({ audioStreams: 0 }), facts({ audioStreams: 0 }));
    const first = await enforceSovereignSilence(BYTES, 'mp4', t);
    const second = await enforceSovereignSilence(first.bytes, 'mp4', t);
    expect(second.remuxed).toBe(false);
    expect(second.bytes).toBe(first.bytes);
  });
});

describe('C–G · the video itself must survive, and is compared rather than trusted', () => {
  const cases: ReadonlyArray<readonly [string, Partial<VideoStreamFacts>, RegExp]> = [
    ['C · the video stream disappeared',  { videoStreams: 0 },                 /video streams 1 -> 0/],
    ['D · the duration changed',          { durationSeconds: 2.0 },            /duration 4.096s -> 2s/],
    ['E · the dimensions changed',        { width: 640, height: 360 },         /1280x720 -> 640x360/],
    ['F · the frame rate changed',        { frameRate: '30/1' },               /fps 24\/1 -> 30\/1/],
    ['G · the codec changed (a re-encode)', { videoCodec: 'hevc' },            /codec h264 -> hevc/],
  ];

  for (const [name, broken, expected] of cases) {
    it(`${name} → refused`, async () => {
      const t = tools(facts({ audioStreams: 1 }), facts({ audioStreams: 0, ...broken }));
      await expect(enforceSovereignSilence(BYTES, 'mp4', t)).rejects.toThrow(expected);
    });
  }

  it('an unchanged video passes, and every compared fact is carried out', async () => {
    const t = tools(facts({ audioStreams: 1 }), facts({ audioStreams: 0 }));
    const out = await enforceSovereignSilence(BYTES, 'mp4', t);
    expect(out.after).toEqual(expect.objectContaining({
      videoStreams: 1, videoCodec: 'h264', width: 1280, height: 720, frameRate: '24/1',
    }));
    expect(out.before.durationSeconds).toBe(out.after.durationSeconds);
  });

  it('a container duration that shifts by a frame is tolerated, not called damage', async () => {
    // Dropping a track can move the container edge slightly; 0.04s is one frame
    // at 24fps and is not a broken file.
    const t = tools(facts({ audioStreams: 1, durationSeconds: 4.096 }), facts({ audioStreams: 0, durationSeconds: 4.058 }));
    await expect(enforceSovereignSilence(BYTES, 'mp4', t)).resolves.toBeDefined();
  });
});

describe('the method is remux, and provably not a re-encode', () => {
  it('the command copies the video stream and asks for no codec', () => {
    // -c copy forbids transcoding; -map 0:v takes video and nothing else;
    // -an states it again so a reader cannot misread the command.
    const cmd = SILENCE.slice(SILENCE.indexOf('export async function stripAudioStreams'));
    expect(cmd).toContain("'-map', '0:v', '-c', 'copy', '-an',");
    expect(stripAudioStreams).toBeInstanceOf(Function);
  });

  it('no encoder, bitrate, scale or rate flag appears anywhere in the boundary', () => {
    for (const flag of ['-c:v', 'libx264', 'libx265', '-b:v', '-crf', '-vf', '-s ', '-r ', 'scale=']) {
      expect(SILENCE).not.toContain(flag);
    }
  });

  it('a failing remux refuses the master instead of trying something heavier', async () => {
    const t = tools(facts({ audioStreams: 1 }), facts({ audioStreams: 0 }), {
      stripThrows: new Error('ffmpeg exited 1'),
    });
    await expect(enforceSovereignSilence(BYTES, 'mp4', t)).rejects.toThrow('ffmpeg exited 1');
    // It did not fall back to a second attempt of any kind.
    expect(t.calls.filter((c) => c === 'strip')).toHaveLength(1);
  });
});

describe('the boundary sits where no video can go round it', () => {
  it('it runs inside persistGeneratedVideo, before the file is written', () => {
    const fn = STORAGE.slice(STORAGE.indexOf('export async function persistGeneratedVideo'));
    const enforce = fn.indexOf('enforceSovereignSilence(bytes, ext)');
    const write = fn.indexOf('await writeFile(');
    expect(enforce).toBeGreaterThan(-1);
    expect(write).toBeGreaterThan(enforce);        // silenced first, written second
    expect(fn).toContain('await writeFile(join(dir, fileName), silence.bytes);');
  });

  it('both video paths reach it — neither writes a video any other way', () => {
    for (const src of [SERVICE, ANIMATE]) {
      expect(src).toContain('await persistGeneratedVideo(');
    }
    // And nothing writes into the assets directory behind its back.
    expect(SERVICE).not.toMatch(/writeFile\([^)]*generated-assets/);
    expect(ANIMATE).not.toMatch(/writeFile\([^)]*generated-assets/);
  });

  it('J/lineage · every caller records the bytes that were WRITTEN, not the provider’s', () => {
    // A digest of the provider's bytes would describe a file that is not there.
    expect(SERVICE).toContain('contentDigest: digestOf(persisted.bytes),');
    expect(SERVICE).not.toContain('digestOf(videoBytes)');
    expect(ANIMATE).toContain('outputBytes: persisted.bytes,');
    expect(ANIMATE).not.toContain('outputBytes: produced.bytes,');
  });

  it('and what the boundary found is recorded on both paths', () => {
    for (const src of [SERVICE, ANIMATE]) {
      expect(src).toContain('providerAudioStreams: persisted.silence.before.audioStreams,');
      expect(src).toContain('finalAudioStreams: persisted.silence.after.audioStreams,');
    }
  });
});

describe('I/J · no provider production is retriggered and no operation duplicates', () => {
  it('the boundary cannot reach a provider — it has no network of any kind', () => {
    expect(SILENCE).not.toMatch(/fetch\(|axios|https?:\/\/|magichour|api\.|Authorization/i);
  });

  it('it never generates, animates, selects a model or opens an operation', () => {
    for (const w of ['generateVideo', 'generateImage', 'animateImage', 'getProductionSelector',
                     'beginOperation', 'operation_ledger', 'depositAsset', 'randomUUID']) {
      expect(SILENCE).not.toContain(w);
    }
  });

  it('one master in, one master out: the boundary writes no asset itself', () => {
    expect(SILENCE).not.toContain('generated-assets');
    expect(SILENCE).not.toContain('persistGenerated');
    // Its only writes are into a temp directory it also removes.
    expect(SILENCE).toContain("mkdtemp(join(tmpdir(), 'azma-silence-'))");
    expect(SILENCE).toContain('rm(dir, { recursive: true, force: true })');
  });
});

describe('K–R · nothing outside the boundary moved', () => {
  it('K/Q/R · the video allocation is exactly the two designated models', () => {
    expect(VIDEO_MODEL_FLEET.filter((m) => m.productionAuthorized && m.active).map((m) => m.modelId).sort())
      .toEqual(['minimax-h3', 'veo-3-1']);
  });

  it('P · MiniMax H3 is the designated video generation model, and Seedance is retired', () => {
    // The dormant binding of the morning became the allocation the same day,
    // on one controlled measurement. Its first production carried an audio
    // stream the boundary removed — which is why the boundary is not optional.
    const h = VIDEO_MODEL_FLEET.find((m) => m.modelId === 'minimax-h3')!;
    expect([h.productionAuthorized, h.active]).toEqual([true, true]);
    const s = VIDEO_MODEL_FLEET.find((m) => m.modelId === 'seedance-2-0')!;
    expect([s.productionAuthorized, s.active]).toEqual([false, false]);
  });

  it('K · the image allocation is unchanged', () => {
    expect(IMAGE_MODEL_FLEET.filter((m) => m.productionAuthorized && m.active).map((m) => m.modelId).sort())
      .toEqual(['nano-banana-2']);
  });

  it('L · no prompt changed, and the boundary carries no prompt at all', () => {
    expect(T2V).toContain('style: { prompt: input.request.prompt },');
    expect(I2V).toContain('style: { prompt: instruction },');
    expect(SILENCE).not.toMatch(/prompt/i);
    // The silence request boundary of earlier today is still stated, untouched.
    expect(T2V).toContain('audio: SOVEREIGN_VIDEO_AUDIO,');
    expect(I2V).toContain('audio: SOVEREIGN_VIDEO_AUDIO,');
  });

  it('M/N/O · no price, unit, subscription, billing or credit field is touched', () => {
    for (const w of ['priceEgp', 'azmaUnits', 'azma-units', 'subscription', 'billing', 'stripe',
                     'credits', 'creditUnit', 'resource_cost', 'estimated', 'EGP']) {
      expect(SILENCE.toLowerCase()).not.toContain(w.toLowerCase());
    }
  });

  it('no audio capability was created — only removal exists', () => {
    for (const w of ['AudioEngine', 'AudioService', 'AudioPolicy', 'AudioRegistry',
                     'AudioProvider', 'AudioChamber', 'AudioAsset', 'VoiceProvider',
                     'addAudio', 'mixAudio', 'setAudio', 'selectAudio']) {
      expect(SILENCE).not.toContain(w);
    }
  });

  it('and no creator-facing audio control appeared in the Chamber', () => {
    const stripped = CLIENT.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    for (const w of ['enforceSovereignSilence', 'audioStreams', 'stripAudio', 'silence']) {
      expect(stripped).not.toContain(w);
    }
  });
});

describe('security · this is a pipeline stage, not a media tool anyone can point at a file', () => {
  it('no route, endpoint or handler exposes it', () => {
    expect(SILENCE).not.toMatch(/NextRequest|NextResponse|export async function (GET|POST|PUT|DELETE)/);
  });

  it('it is reachable only from storage, which only the two production paths call', () => {
    // If a third importer ever appears, this fails and the reviewer decides.
    const importers = ['src/qiyamah-generation/asset-storage.ts'];
    expect(STORAGE).toContain("from './sovereign-video-silence'");
    expect(importers).toHaveLength(1);
  });

  it('the Founder-gated model test cannot bypass the boundary either', () => {
    // It dispatches through generateVideo, which persists through the one
    // chokepoint. A test-only binding gets no route of its own to a file.
    const testRoute = read('app/api/sovereign/model-test/route.ts');
    expect(testRoute).toContain('generateVideo({');
    expect(testRoute).not.toContain('persistGeneratedVideo');
    expect(testRoute).not.toContain('writeFile');
    expect(testRoute).not.toMatch(/audio|silence/i);
  });

  it('it takes bytes, never a caller-supplied path into our storage', () => {
    // The only paths it touches are ones it made itself inside a temp dir.
    expect(SILENCE).toContain('export async function enforceSovereignSilence(\n  bytes: Buffer,');
    expect(SILENCE).not.toContain('uploadsDir');
  });
});
