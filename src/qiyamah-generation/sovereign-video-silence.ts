/**
 * AZMA OS — POST-PRODUCTION SILENCE ENFORCEMENT
 *
 * ─── WHY THIS EXISTS, MEASURED AND NOT ASSUMED ──────────────────────────────
 *
 *   On 2026-09-27 the Empire began sending `audio: false` explicitly on both
 *   video dispatches, from one named constant, below every model choice. Then
 *   one 4-second production measured what came back:
 *
 *     operation  35084820-e44b-43a1-a3db-a0e678cecd46   model  seedance-2.0
 *     result     video streams 1   AUDIO STREAMS 1
 *                aac, 32kHz stereo, 134 kb/s, peak -7.0 dB, RMS -24.4 dB
 *
 *   An AUDIBLE track, not a muted one — and the provider's own output.mp4 was
 *   byte-identical to the deposited asset, so the track was the provider's.
 *   `audio: false` is a parameter this model does not honour.
 *
 *   So a request cannot be the boundary. The FILE is the only place the rule
 *   can be true, and this is the last place the file passes through before it
 *   becomes a sovereign asset.
 *
 * ─── WHAT IT IS, AND WHAT IT DELIBERATELY IS NOT ────────────────────────────
 *
 *   It removes audio streams. That is all. It is not an audio engine, not an
 *   audio service, not a policy registry and not a capability: there is no
 *   setting, no creator control and no route that reaches it. It cannot add,
 *   choose, mix or edit sound, because it has no code that could.
 *
 *   It does not re-encode. `-map 0:v -c copy -an` copies the video stream
 *   through untouched, so resolution, frame rate, duration and codec survive
 *   by construction rather than by luck — and the result is verified against
 *   the input before it is accepted, not assumed.
 *
 *   A file that is already silent is returned EXACTLY as it arrived, the same
 *   Buffer, unprocessed. Enforcement on a silent master is a no-op, so nothing
 *   is spent, nothing is rewritten and nothing can drift.
 *
 * ─── WHY IT REFUSES RATHER THAN DEGRADES ────────────────────────────────────
 *
 *   If inspection or the remux fails, this throws, and the caller's existing
 *   failure handling refuses the deposit. That is deliberate: the alternative
 *   is depositing a master that violates the rule while reporting success,
 *   which is the exact defect this boundary was ordered to close. The path
 *   already refuses a provider payload that is not a video; a master that
 *   cannot be made silent is refused the same way.
 *
 *   OPERATIONAL DEPENDENCY, STATED PLAINLY: this needs `ffmpeg` and `ffprobe`
 *   on the host. Production has them (ffmpeg 8.0.1, /usr/bin). The Empire
 *   already depends on ffmpeg for cinematic assembly, so this adds no new
 *   requirement — but if they ever vanish, video production refuses instead of
 *   quietly shipping sound.
 */

import { spawn } from 'node:child_process';
import { mkdtemp, writeFile, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

/** What a media inspection reports. Every field is read, never inferred. */
export interface VideoStreamFacts {
  readonly videoStreams: number;
  readonly audioStreams: number;
  readonly durationSeconds: number | null;
  readonly videoCodec: string | null;
  readonly width: number | null;
  readonly height: number | null;
  readonly frameRate: string | null;
}

export interface SilenceOutcome {
  /** The bytes that may become the sovereign asset — silenced, or untouched. */
  readonly bytes: Buffer;
  readonly before: VideoStreamFacts;
  readonly after: VideoStreamFacts;
  /** false when the master arrived silent and was passed through unprocessed. */
  readonly remuxed: boolean;
  readonly audioStreamsRemoved: number;
}

/**
 * The two external commands, behind one seam so the decision logic can be
 * proven without ffmpeg installed. Production passes neither and gets these.
 */
export interface SilenceTools {
  readonly probe: (filePath: string) => Promise<VideoStreamFacts>;
  readonly stripAudio: (inPath: string, outPath: string) => Promise<void>;
}

function run(command: string, args: readonly string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn(command, [...args], { stdio: ['ignore', 'pipe', 'pipe'] });
    let out = '';
    let err = '';
    proc.stdout.on('data', (c) => { out += String(c); });
    proc.stderr.on('data', (c) => { err += String(c); });
    proc.on('error', (e) => reject(new Error(
      `${command} could not be run — the host must provide it. ${e.message}`,
    )));
    proc.on('close', (code) => {
      if (code === 0) resolve(out);
      else reject(new Error(`${command} exited ${code}: ${err.trim().slice(0, 400)}`));
    });
  });
}

const num = (v: unknown): number | null => {
  const n = typeof v === 'string' ? Number(v) : typeof v === 'number' ? v : NaN;
  return Number.isFinite(n) ? n : null;
};

/** ffprobe, read as JSON. The counts come from the stream list itself. */
export async function inspectVideo(filePath: string): Promise<VideoStreamFacts> {
  const raw = await run('ffprobe', [
    '-v', 'error', '-print_format', 'json',
    '-show_entries', 'stream=codec_type,codec_name,width,height,r_frame_rate,duration:format=duration',
    filePath,
  ]);
  let parsed: { streams?: unknown[]; format?: { duration?: unknown } };
  try { parsed = JSON.parse(raw) as typeof parsed; } catch {
    throw new Error('ffprobe returned output that is not JSON');
  }
  const streams = Array.isArray(parsed.streams) ? parsed.streams as Record<string, unknown>[] : [];
  const video = streams.filter((s) => s['codec_type'] === 'video');
  const audio = streams.filter((s) => s['codec_type'] === 'audio');
  const first = video[0];
  return {
    videoStreams: video.length,
    audioStreams: audio.length,
    // The CONTAINER duration, which is what a player honours.
    durationSeconds: num(parsed.format?.duration),
    videoCodec: typeof first?.['codec_name'] === 'string' ? first['codec_name'] as string : null,
    width: num(first?.['width']),
    height: num(first?.['height']),
    frameRate: typeof first?.['r_frame_rate'] === 'string' ? first['r_frame_rate'] as string : null,
  };
}

/**
 * Remux, never re-encode. `-map 0:v` carries every video stream and no other;
 * `-c copy` forbids transcoding; `-an` states the intent a second time so a
 * reader of the command cannot misread it.
 */
export async function stripAudioStreams(inPath: string, outPath: string): Promise<void> {
  await run('ffmpeg', [
    '-hide_banner', '-loglevel', 'error', '-nostdin', '-y',
    '-i', inPath,
    '-map', '0:v', '-c', 'copy', '-an',
    outPath,
  ]);
}

const DEFAULT_TOOLS: SilenceTools = { probe: inspectVideo, stripAudio: stripAudioStreams };

/** The video facts that a remux must not change. Compared, never trusted. */
function assertVideoSurvived(before: VideoStreamFacts, after: VideoStreamFacts): void {
  const broken: string[] = [];
  if (after.audioStreams !== 0) broken.push(`audio streams still ${after.audioStreams}`);
  if (after.videoStreams !== before.videoStreams) broken.push(`video streams ${before.videoStreams} -> ${after.videoStreams}`);
  if (after.videoCodec !== before.videoCodec) broken.push(`codec ${before.videoCodec} -> ${after.videoCodec}`);
  if (after.width !== before.width || after.height !== before.height) {
    broken.push(`${before.width}x${before.height} -> ${after.width}x${after.height}`);
  }
  if (after.frameRate !== before.frameRate) broken.push(`fps ${before.frameRate} -> ${after.frameRate}`);
  // Dropping a track can shift the container duration by a frame or so; a
  // tenth of a second is the tolerance, and anything past it is a broken file.
  if (before.durationSeconds !== null && after.durationSeconds !== null
      && Math.abs(after.durationSeconds - before.durationSeconds) > 0.1) {
    broken.push(`duration ${before.durationSeconds}s -> ${after.durationSeconds}s`);
  }
  if (broken.length > 0) {
    throw new Error(`silence enforcement changed the video, so it was refused: ${broken.join('; ')}`);
  }
}

/**
 * THE BOUNDARY. Give it the bytes a provider returned; it gives back the bytes
 * that may become a sovereign master, carrying no audio stream.
 *
 * Already silent → the same Buffer, untouched, `remuxed: false`.
 */
export async function enforceSovereignSilence(
  bytes: Buffer,
  extension: 'mp4' | 'webm' = 'mp4',
  tools: SilenceTools = DEFAULT_TOOLS,
): Promise<SilenceOutcome> {
  const dir = await mkdtemp(join(tmpdir(), 'azma-silence-'));
  const inPath = join(dir, `provider-output.${extension}`);
  const outPath = join(dir, `sovereign-master.${extension}`);
  try {
    await writeFile(inPath, bytes);
    const before = await tools.probe(inPath);

    // IDEMPOTENT: a silent master is not touched at all.
    if (before.audioStreams === 0) {
      return { bytes, before, after: before, remuxed: false, audioStreamsRemoved: 0 };
    }

    await tools.stripAudio(inPath, outPath);
    const after = await tools.probe(outPath);
    assertVideoSurvived(before, after);

    return {
      bytes: await readFile(outPath),
      before,
      after,
      remuxed: true,
      audioStreamsRemoved: before.audioStreams,
    };
  } finally {
    await rm(dir, { recursive: true, force: true }).catch(() => { /* a temp dir, already gone or not ours */ });
  }
}
