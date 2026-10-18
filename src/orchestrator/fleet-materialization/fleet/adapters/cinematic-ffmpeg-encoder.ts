/**
 * AZMA OS — Fleet Materialization Architecture
 * File: src/orchestrator/fleet-materialization/fleet/adapters/cinematic-ffmpeg-encoder.ts
 *
 * Cinematic FFmpeg Encoder.
 * Consumes a CompiledAssemblyGraph and produces a real H.264/AAC MP4 artifact
 * via the system ffmpeg binary (apt-get install -y ffmpeg on Ubuntu 26.04).
 *
 * No npm dependency. No WASM. No cloud provider.
 * Encoding is asynchronous — spawnEncoding() returns immediately.
 * Completion is polled via isEncodingComplete() / getEncodingError().
 *
 * Output paths (see rendersDir() — NOT under public/, which would let Next.js's
 * static handler serve finished films past the authorisation gate):
 *   $UPLOADS_DIR/renders/<operationId>.mp4   — final MP4
 *   $UPLOADS_DIR/renders/<operationId>.srt   — temporary SRT (when subtitles present)
 */

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import type {
  CompiledAssemblyGraph,
  CompiledNodeMix,
  CompiledTrackMix,
} from '../../../../chambers/ras-al-amr/pre-publishing-boundary';
import type { HydratedAssemblyTrack } from '../../../../chambers/ras-al-amr/vault-rehydration-bridge';

// ==========================================
// 1. JOB STATE TRACKING
// ==========================================

type JobState = 'running' | 'done' | Error;
const jobs = new Map<string, JobState>();

// ==========================================
// 2. PATH & MEDIA-TYPE HELPERS
// ==========================================

/**
 * Where finished films are written.
 *
 * ─── WHY THIS IS NO LONGER `public/renders` ─────────────────────────────────
 *
 *   Anything under `public/` is served by Next.js's own static handler, which
 *   runs BEFORE any route. Phase E built an authorisation gate at
 *   `app/renders/[...path]/route.ts`, and with the films still in `public/` the
 *   gate was unreachable code. MEASURED, against a planted file:
 *
 *       GET /renders/op_shadowtest_probe.mp4  →  200 · 33 bytes · raw file
 *
 *   The route never ran. Closing this at nginx alone would have proxied the
 *   request to Node, and Node would have handed the film over exactly as
 *   before — a vulnerability reported as closed while fully open. The one
 *   thing that caught it was planting a file and asking for it.
 *
 *   So films now live beside every other protected byte in the Empire, in
 *   UPLOADS_DIR, which `public/` cannot shadow because Next.js does not serve
 *   it. This also means a film outlives a deployment instead of sitting inside
 *   the release tree.
 *
 * ─── AND WHY IT IS A FUNCTION ───────────────────────────────────────────────
 *
 *   Read at CALL time, never frozen at import. A module-level `const` reading
 *   an environment variable has now caused three separate production defects in
 *   this repository — db.ts, the image-edit route, and clone-voice. The lesson
 *   is not "remember"; it is that the const form is a latent bug by
 *   construction, so the value is never available in that form.
 */
function rendersDir(): string {
  const base = process.env.UPLOADS_DIR;
  return base ? join(base, 'renders') : join(process.cwd(), 'public', 'renders');
}

/**
 * How an asset fills a target rectangle — the one definition in the Empire.
 *
 *   contain: preserve aspect ratio, pad to W×H with black.
 *   cover:   preserve aspect ratio, scale up and CROP to W×H.
 *   fill:    stretch to exactly W×H (may distort).
 *
 * `cover` is what the Founder means by «تستبدل مقاسات الأصل الواحد قدر
 * المستطاع... بشرط عدم المساس بالجودة»: the aspect ratio is preserved and the
 * overflow is cropped, so nothing is squeezed and nothing is invented. It is
 * also, exactly, `platform-adapter.ts`'s `crop-adapt` verdict.
 *
 * Lifted out of the node loop on 2026-09-29 because reframing a single asset
 * for a platform needs the same filter without a whole assembly graph around
 * it. One rule, two callers — never a second copy of a proven filter string.
 */
export function framingFilter(
  targetW: number,
  targetH: number,
  mode: 'contain' | 'cover' | 'fill' = 'contain',
): string {
  if (mode === 'cover') {
    return `scale=${targetW}:${targetH}:force_original_aspect_ratio=increase,crop=${targetW}:${targetH}`;
  }
  if (mode === 'fill') return `scale=${targetW}:${targetH}`;
  return `scale=${targetW}:${targetH}:force_original_aspect_ratio=decrease,`
    + `pad=${targetW}:${targetH}:(ow-iw)/2:(oh-ih)/2:color=black`;
}

/** XLII — output dimensions per profile.  Default = landscape when profile is absent. */
const PROFILE_DIMENSIONS: Record<string, { w: number; h: number }> = {
  landscape: { w: 1920, h: 1080 },
  portrait:  { w: 1080, h: 1920 },
  square:    { w: 1080, h: 1080 },
};

function getOutputDimensions(profile?: string): { w: number; h: number } {
  return PROFILE_DIMENSIONS[profile ?? 'landscape'] ?? PROFILE_DIMENSIONS['landscape'];
}

/** XLII — FFmpeg codec settings per quality tier. */
const QUALITY_SETTINGS: Record<string, { crf: number; preset: string }> = {
  standard: { crf: 28, preset: 'medium' },
  high:     { crf: 23, preset: 'fast' },
  maximum:  { crf: 18, preset: 'slow' },
};

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const VIDEO_EXTS = new Set(['.mp4', '.mov', '.webm', '.avi', '.mkv']);
const AUDIO_EXTS = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac']);

// ── THE RULE THAT WROTE THE FILE IS THE RULE THAT FINDS IT ────────────────
//   This function used to live here as a private copy, and its own comment
//   said it was "mirroring" the two modules that write assets. A rule kept in
//   three places is a rule that will be corrected in one, so it moved to the
//   Vault — which owns assets — and this module now reads the one definition.
import { resolveAssetPath } from '../../../../vault/asset-bytes';
export { resolveAssetPath };

/**
 * What a file ACTUALLY carries — asked of the file, not of its name.
 *
 * ─── WHY AN EXTENSION IS NOT AN ANSWER ──────────────────────────────────────
 *
 *   MEASURED, on this encoder, against a real render:
 *
 *     · A browser microphone recording is `opus` inside a `.webm` container.
 *       `.webm` is in VIDEO_EXTS, so the Creator's voice was classified as a
 *       video clip and the filtergraph asked for `[1:v]`. There is no video
 *       stream in it. FFmpeg answered «Stream specifier ':v' ... matches no
 *       streams» and aborted — the whole film lost, not just the voice.
 *
 *     · A silent `.mp4` — a screen capture, an exported animation — is in
 *       VIDEO_EXTS, so the encoder added an audio entry for it and asked for
 *       `[1:a]`. Same abort, same whole film lost.
 *
 *   Both are the same mistake: a NAME was trusted about CONTENT. So the file
 *   is asked. `ffprobe` ships in the very package that provides `ffmpeg`
 *   (apt-get install -y ffmpeg), so if one is present the other is.
 *
 * ─── AND WHEN THE ASKING FAILS ──────────────────────────────────────────────
 *
 *   It falls back to exactly the extension guess that stood here before, so a
 *   missing ffprobe can only ever return this encoder to its prior behaviour —
 *   never to something worse. It says so on the way past, because a guess that
 *   silently replaces a measurement is how both defects above survived weeks.
 */
interface StreamTruth {
  readonly hasVideo: boolean;
  readonly hasAudio: boolean;
}

/** Keyed by resolved path. One ffprobe per distinct asset per process. */
const streamTruthCache = new Map<string, StreamTruth>();

function probeStreams(assetPath: string, uri: string): StreamTruth {
  const cached = streamTruthCache.get(assetPath);
  if (cached) return cached;

  const assumed: StreamTruth = {
    hasVideo: isImageUri(uri) || isVideoUri(uri),
    hasAudio: isAudioUri(uri) || isVideoUri(uri),
  };

  let truth: StreamTruth | null = null;
  try {
    const r = spawnSync(
      'ffprobe',
      ['-v', 'error', '-show_entries', 'stream=codec_type', '-of', 'csv=p=0', assetPath],
      { encoding: 'utf-8' },
    );
    if (r.status === 0 && typeof r.stdout === 'string') {
      const kinds = r.stdout.split(/[\r\n]+/).map((l) => l.trim()).filter(Boolean);
      truth = { hasVideo: kinds.includes('video'), hasAudio: kinds.includes('audio') };
    }
  } catch {
    // Falls through to the extension guess below.
  }

  if (!truth) {
    console.warn(
      `[CinematicEncoder] ffprobe could not read [${assetPath}] — falling back to its `
        + 'extension. Install ffprobe (it ships with ffmpeg) for the stream truth.',
    );
    truth = assumed;
  }

  streamTruthCache.set(assetPath, truth);
  return truth;
}

function getExt(uri: string): string {
  const dot = uri.lastIndexOf('.');
  return dot >= 0 ? uri.slice(dot).toLowerCase() : '';
}

function isImageUri(uri: string): boolean {
  return IMAGE_EXTS.has(getExt(uri));
}

function isVideoUri(uri: string): boolean {
  return VIDEO_EXTS.has(getExt(uri));
}

function isAudioUri(uri: string): boolean {
  return AUDIO_EXTS.has(getExt(uri));
}

export function getOutputPath(operationId: string): string {
  return join(rendersDir(), `${operationId}.mp4`);
}

// ==========================================
// 3. PUBLIC STATE QUERY API
// ==========================================

export function isEncodingComplete(operationId: string): boolean {
  return jobs.get(operationId) === 'done' && existsSync(getOutputPath(operationId));
}

export function getEncodingError(operationId: string): Error | null {
  const state = jobs.get(operationId);
  return state instanceof Error ? state : null;
}

// ==========================================
// 4. SPAWN ENTRY POINT
// ==========================================

export function spawnEncoding(
  operationId: string,
  graph: CompiledAssemblyGraph,
  resolvedVoicePaths: ReadonlyMap<string, string> = new Map(),
): void {
  mkdirSync(rendersDir(), { recursive: true });

  // MAG-LF-001C fix: buildFfmpegArgs() throws synchronously on graph validation
  // failure (missing secureStorageUri, asset not on disk, no active image nodes,
  // zero duration). The throw propagates to the adapter caller so the dispatcher
  // marks FAILED immediately — no phantom ACCEPTED, no false DISPATCHED state.
  const args = buildFfmpegArgs(graph, operationId, resolvedVoicePaths);

  jobs.set(operationId, 'running');

  const proc = spawn('ffmpeg', args, { stdio: ['ignore', 'pipe', 'pipe'] });

  let stderr = '';
  proc.stderr.on('data', (chunk: Buffer) => {
    stderr += chunk.toString();
    // Cap to avoid RangeError on long-running encodes with verbose FFmpeg output
    if (stderr.length > 50000) stderr = stderr.slice(-50000);
  });

  proc.on('close', (code: number | null) => {
    if (code === 0 && existsSync(getOutputPath(operationId))) {
      jobs.set(operationId, 'done');
    } else {
      jobs.set(
        operationId,
        new Error(
          `FFmpeg exited with code ${code ?? 'null'} for operation [${operationId}]. ` +
            `Last stderr: ${stderr.slice(-3000)}`,
        ),
      );
    }
  });

  proc.on('error', (err: Error) => {
    jobs.set(
      operationId,
      new Error(
        `FFmpeg spawn failed — ensure ffmpeg is installed (apt-get install -y ffmpeg). Error: ${err.message}`,
      ),
    );
  });
}

// ==========================================
// 5. FFMPEG COMMAND BUILDER
// ==========================================

type BlendMode = 'NORMAL' | 'MULTIPLY' | 'SCREEN' | 'OVERLAY';

interface NodeEntry {
  path: string;
  kind: 'image' | 'video' | 'audio';
  /** Explicit FFmpeg input index (-i order). Assigned after all inputs are collected. */
  inputIdx: number;
  duration: number;            // playDurationSeconds (declared slot on timeline)
  startSec: number;            // globalStartTimeSeconds
  nodeId: string;
  trackId: string;
  trimStart: number;           // VI-B: effective trim start in source media (seconds)
  trimEnd: number;             // VI-B: effective trim end in source media (seconds)
  effectiveDuration: number;   // VI-B: trimEnd - trimStart (always ≥ 0.001)
  // VI-C: spatial composition (image/video nodes only; audio nodes use identity defaults)
  positionX: number;
  positionY: number;
  scaleX: number;
  scaleY: number;
  rotationDegrees: number;
  zIndex: number;
  opacity: number;             // VI-C: 0.0–1.0 alpha (VisualFilterDirective)
  blendMode: BlendMode;        // VI-C: composition blend mode
  framingMode: 'contain' | 'cover' | 'fill'; // XLII: how the asset fills its slot
  /** Whether the file itself carries an audio stream. Asked of it, not of its name. */
  hasOwnAudio: boolean;
  /** PACKAGE XXXV: seconds of 0→1 opacity ramp at this node's IN point. 0 = cut. */
  transitionInSeconds: number;
  /** PACKAGE XXXV: seconds this layer is held past its own end, under a successor's ramp. */
  holdSeconds: number;
}

function buildFfmpegArgs(
  graph: CompiledAssemblyGraph,
  operationId: string,
  resolvedVoicePaths: ReadonlyMap<string, string> = new Map(),
): string[] {
  const outputPath = getOutputPath(operationId);
  const { w: outW, h: outH } = getOutputDimensions(graph.metadata.outputProfile);
  const quality = QUALITY_SETTINGS[graph.metadata.exportQuality ?? 'high'] ?? QUALITY_SETTINGS['high'];

  const stillInputs: NodeEntry[] = [];   // still images: -loop 1 -t dur -i path
  const videoInputs: NodeEntry[] = [];   // video clips:  -i path (no loop)
  const audioFileInputs: NodeEntry[] = []; // standalone audio files

  // Walk every non-muted, non-hidden track and collect active nodes
  for (const track of graph.hydratedCanvas.tracks as HydratedAssemblyTrack[]) {
    if (track.isMuted || track.isHidden) continue;

    for (const node of track.nodes) {
      // isActive absent or true = active (per AssemblyNode constitutional comment)
      if (node.isActive === false) continue;

      const uri = node.runtimeAsset?.secureStorageUri;
      if (!uri) {
        throw new Error(
          `CINEMATIC encoder: node [${node.nodeId}] has no secureStorageUri. ` +
            `The graph may not have been fully hydrated by VaultRehydrationBridge.`,
        );
      }

      const assetPath = resolveAssetPath(uri);
      if (!existsSync(assetPath)) {
        throw new Error(
          `CINEMATIC encoder: asset for node [${node.nodeId}] not found at [${assetPath}]. ` +
            `Verify the file was uploaded and the Vault URI is correct.`,
        );
      }

      const duration = node.temporal?.playDurationSeconds ?? 5;
      const startSec = node.temporal?.globalStartTimeSeconds ?? 0;

      // VI-B: compute safe trim bounds from TemporalDirective
      const { trimStart, trimEnd, effectiveDuration } = computeTrimBounds(node.temporal, duration);

      // PACKAGE XXXV — the transition at this node's IN point.
      //
      // These two fields have been on `TemporalDirective` since Package XXXV and
      // this encoder never read either of them. MEASURED on a real render: a node
      // declaring `crossfade` arrived as a hard cut — at the midpoint of a
      // one-second declared ramp the outgoing layer was already at zero. The
      // chamber showed the Creator a dissolve the film did not contain.
      //
      // 0.5s is the contract's own stated default for an absent duration.
      const transitionIn = (node.temporal as { transitionInType?: string } | undefined)
        ?.transitionInType ?? 'cut';
      const rawTransitionSeconds = (node.temporal as { transitionInDurationSeconds?: number } | undefined)
        ?.transitionInDurationSeconds ?? 0.5;
      const transitionInSeconds =
        transitionIn === 'crossfade'
          ? Math.max(0, Math.min(rawTransitionSeconds, effectiveDuration))
          : 0;

      // VI-C: read spatial and visual directives (visual nodes only; audio uses identity defaults)
      const positionX = node.spatial?.positionX ?? 0;
      const positionY = node.spatial?.positionY ?? 0;
      const scaleX = Math.max(0.001, node.spatial?.scaleX ?? 1);
      const scaleY = Math.max(0.001, node.spatial?.scaleY ?? 1);
      const rotationDegrees = node.spatial?.rotationDegrees ?? 0;
      const zIndex = node.spatial?.zIndex ?? 0;
      const visualDir = (node.customDirectives as Record<string, unknown> | undefined)
        ?.['visual'] as { opacity?: number; blendMode?: string; framingMode?: string } | undefined;
      const opacity = Math.max(0, Math.min(1, visualDir?.opacity ?? 1));
      const rawBlend = visualDir?.blendMode ?? 'NORMAL';
      const blendMode: BlendMode = (['NORMAL', 'MULTIPLY', 'SCREEN', 'OVERLAY'] as const).includes(rawBlend as BlendMode)
        ? (rawBlend as BlendMode) : 'NORMAL';
      const rawFraming = visualDir?.framingMode ?? 'contain';
      const framingMode: 'contain' | 'cover' | 'fill' =
        rawFraming === 'cover' ? 'cover' : rawFraming === 'fill' ? 'fill' : 'contain';

      // inputIdx will be assigned below after all inputs are collected
      const base = {
        path: assetPath, duration, startSec, nodeId: node.nodeId, trackId: track.trackId,
        trimStart, trimEnd, effectiveDuration,
        positionX, positionY, scaleX, scaleY, rotationDegrees, zIndex, opacity, blendMode, framingMode,
        inputIdx: -1,
        transitionInSeconds,
        holdSeconds: 0,
      };

      // ── WHAT THE FILE CARRIES DECIDES WHICH LIST IT JOINS ───────────────
      //   Not its extension. See probeStreams() for the two renders this cost.
      const streams = probeStreams(assetPath, uri);

      if (isImageUri(uri)) {
        stillInputs.push({ ...base, kind: 'image', hasOwnAudio: false });
      } else if (streams.hasVideo) {
        videoInputs.push({ ...base, kind: 'video', hasOwnAudio: streams.hasAudio });
      } else if (streams.hasAudio) {
        audioFileInputs.push({
          ...base,
          kind: 'audio',
          hasOwnAudio: true,
          positionX: 0, positionY: 0, scaleX: 1, scaleY: 1, rotationDegrees: 0, zIndex: 0,
          opacity: 1, blendMode: 'NORMAL', framingMode: 'contain',
        });
      }
      // Text/structural nodes carry no media — silently skipped.
      // So is a media file carrying NEITHER stream: it cannot be composited and
      // naming it in the filtergraph would abort the entire film for one asset.
    }
  }

  // Assign explicit FFmpeg input indices.
  // Order: stills (with -loop), then videos, then standalone audio.
  let nextIdx = 0;
  stillInputs.forEach((e) => { e.inputIdx = nextIdx++; });
  videoInputs.forEach((e) => { e.inputIdx = nextIdx++; });
  const audioFileStart = nextIdx;
  audioFileInputs.forEach((e) => { e.inputIdx = nextIdx++; });

  // VI-A: Add voice-assigned audio entries from resolvedVoicePaths.
  // For each image/video node that has a resolved voice secureStorageUri, add a
  // standalone audio input that starts at the same globalStartTimeSeconds.
  for (const visEntry of [...stillInputs, ...videoInputs]) {
    const voiceUri = resolvedVoicePaths.get(visEntry.nodeId);
    if (!voiceUri) continue;
    const voicePath = resolveAssetPath(voiceUri);
    if (!existsSync(voicePath)) {
      console.warn(
        `[CinematicEncoder] voice file missing at [${voicePath}] for node [${visEntry.nodeId}] — skipping`,
      );
      continue;
    }
    audioFileInputs.push({
      path: voicePath,
      kind: 'audio',
      inputIdx: nextIdx++,
      duration: visEntry.duration,
      startSec: visEntry.startSec,
      nodeId: visEntry.nodeId,
      trackId: visEntry.trackId,
      trimStart: visEntry.trimStart,
      trimEnd: visEntry.trimEnd,
      effectiveDuration: visEntry.effectiveDuration,
      positionX: 0, positionY: 0, scaleX: 1, scaleY: 1, rotationDegrees: 0, zIndex: 0,
      opacity: 1, blendMode: 'NORMAL', framingMode: 'contain',
      hasOwnAudio: true,
      // A voice track is not a visual layer; it ramps through the mix plan's
      // fades, never through a visual transition.
      transitionInSeconds: 0,
      holdSeconds: 0,
    });
  }

  // XLII: For video nodes whose audio is NOT muted, extract audio from the video
  // stream itself as an additional audio entry.  No new -i argument is added —
  // the existing video input already carries the audio stream at [inputIdx:a].
  const videoAudioEntries: NodeEntry[] = [];
  for (const vidEntry of videoInputs) {
    // A clip with no audio stream has no `[idx:a]` to map. Naming one aborted
    // the entire render — MEASURED: «Stream specifier ':a' ... matches no
    // streams», exit −22, no file written, for a silent screen capture.
    if (!vidEntry.hasOwnAudio) continue;
    const nodeMix = graph.mixPlan.nodeMixes.find((m) => m.nodeId === vidEntry.nodeId);
    if (nodeMix?.isMuted) continue;
    videoAudioEntries.push({
      ...vidEntry,
      kind: 'audio',
      // inputIdx stays the same as the video — references [inputIdx:a] in the filter
    });
  }

  // All visual inputs for composition (stills + videos), sorted by zIndex
  const allVisualInputs = [...stillInputs, ...videoInputs];
  if (allVisualInputs.length === 0) {
    throw new Error(
      `CINEMATIC encoder: no active visual nodes found for operation [${operationId}]. ` +
        `A CINEMATIC canvas must contain at least one active image or video node.`,
    );
  }
  // ── WHEN TWO LAYERS SHARE A zIndex, THE LATER ONE IS ON TOP ───────────────
  //
  //   The tie used to be broken by nodeId, alphabetically. That is not a
  //   property of the timeline — it is a property of how the ids happened to be
  //   spelled, and it silently decided which of two overlapping layers the
  //   Creator would see. MEASURED: a node starting at 3s named `n-blue` was
  //   placed UNDER one starting at 0s named `n-red`, so its arrival could never
  //   be seen at all, with or without a transition.
  //
  //   Start time is the meaningful order: what enters later sits on top of what
  //   was already there, which is also the only arrangement in which a
  //   transition-in can be visible. nodeId remains the last resort, so the
  //   ordering stays total and the command line stays reproducible.
  allVisualInputs.sort((a, b) => {
    if (a.zIndex !== b.zIndex) return a.zIndex - b.zIndex;
    if (a.startSec !== b.startSec) return a.startSec - b.startSec;
    return a.nodeId.localeCompare(b.nodeId);
  });

  // ── PACKAGE XXXV — THE OUTGOING LAYER IS HELD, NOT RAMPED DOWN ───────────
  //
  //   The contract describes a crossfade as the incoming node ramping 0→1
  //   «while the preceding adjacent node ramps 1→0 simultaneously — no blank
  //   frame». Ramping BOTH is what produces a blank frame: at the midpoint the
  //   outgoing layer is at ½ over black and the incoming at ½ over that, so the
  //   frame carries ¼·A + ½·B and the picture dips dark through the middle.
  //
  //   Holding A at full opacity under a ramping B gives exactly (1−α)·A + α·B —
  //   a true dissolve, no dip, no blank frame. So the contract's requirement is
  //   met by holding the outgoing layer, and this is the one place that says so.
  //
  //   A layer only needs holding when it ENDS where its successor begins. When
  //   it already runs past that instant, as an establishing shot does, it is
  //   live throughout the ramp and nothing is added.
  const CROSSFADE_ADJACENCY_TOLERANCE_SECONDS = 0.05;
  for (const incoming of allVisualInputs) {
    if (incoming.transitionInSeconds <= 0) continue;
    let outgoing: NodeEntry | undefined;
    let outgoingEnd = -1;
    for (const candidate of allVisualInputs) {
      if (candidate === incoming || candidate.trackId !== incoming.trackId) continue;
      const candidateEnd = candidate.startSec + candidate.effectiveDuration;
      // Past the IN point already: live under the whole ramp, needs no hold.
      if (candidateEnd > incoming.startSec + CROSSFADE_ADJACENCY_TOLERANCE_SECONDS) continue;
      // Ends well before it: a gap the Creator placed, not a transition.
      if (candidateEnd < incoming.startSec - CROSSFADE_ADJACENCY_TOLERANCE_SECONDS) continue;
      if (candidateEnd > outgoingEnd) { outgoing = candidate; outgoingEnd = candidateEnd; }
    }
    if (outgoing) {
      outgoing.holdSeconds = Math.max(outgoing.holdSeconds, incoming.transitionInSeconds);
    }
  }

  // All audio entries: video-extracted audio first, then standalone audio files
  const allAudioEntries = [...videoAudioEntries, ...audioFileInputs];

  // Total duration: prefer compiled metadata; fall back to max effective node end time
  const totalDuration =
    graph.metadata.estimatedDurationSeconds ??
    Math.max(
      ...allVisualInputs.map((n) => n.startSec + n.effectiveDuration),
      ...allAudioEntries.map((n) => n.startSec + n.effectiveDuration),
      1,
    );

  if (totalDuration <= 0) {
    throw new Error(
      `CINEMATIC encoder: computed duration is ${totalDuration}s. ` +
        `Visual nodes must have temporal directives with positive playDurationSeconds.`,
    );
  }

  const args: string[] = ['-y'];

  // --- INPUTS ---

  // Still-image inputs: loop each frame for exactly its effectiveDuration
  // `holdSeconds` is added to `-t`: a still cannot be shown past the end of
  // its own looped input, so a layer held under a successor's crossfade must be
  // decoded for that long too. It is 0 for every node not holding anything.
  stillInputs.forEach(({ path, effectiveDuration, holdSeconds }) => {
    args.push('-loop', '1', '-t', String(effectiveDuration + holdSeconds), '-i', path);
  });

  // Video inputs: direct file read (no loop, no -t duration limit)
  videoInputs.forEach(({ path }) => {
    args.push('-i', path);
  });

  // Standalone audio inputs (voice-assigned entries also added to audioFileInputs above)
  audioFileInputs.forEach(({ path }) => {
    args.push('-i', path);
  });
  void audioFileStart; // used for index assignment only

  // --- FILTER_COMPLEX ---
  const filterParts: string[] = [];

  // Overlay composition pipeline — handles both stills and video clips
  buildVideoCompositionFilters(allVisualInputs, totalDuration, outW, outH).forEach((f) => filterParts.push(f));

  // Subtitle burning
  const hasSubs = graph.subtitlePlan.absoluteCues.length > 0;
  if (hasSubs) {
    const srtPath = writeSrtFile(operationId, graph);
    const escapedPath = srtPath.replace(/\\/g, '/');
    filterParts.push(
      `[vraw]subtitles='${escapedPath}':force_style='FontSize=24,PrimaryColour=&HFFFFFF,Outline=1'[vout]`,
    );
  } else {
    filterParts.push('[vraw]copy[vout]');
  }

  // Audio chain
  let finalAudioLabel: string;
  if (allAudioEntries.length === 0) {
    filterParts.push(`aevalsrc=0:c=stereo:s=44100:d=${totalDuration}[aout]`);
    finalAudioLabel = '[aout]';
  } else if (allAudioEntries.length === 1) {
    const inp = allAudioEntries[0];
    const nodeMix = graph.mixPlan.nodeMixes.find((m) => m.nodeId === inp.nodeId);
    const trackMix = graph.mixPlan.trackMixes.find((m) => m.trackId === inp.trackId);
    filterParts.push(
      buildAudioNodeFilter(inp, inp.inputIdx, totalDuration, nodeMix, trackMix) + '[aout]',
    );
    finalAudioLabel = '[aout]';
  } else {
    allAudioEntries.forEach((inp, i) => {
      const nodeMix = graph.mixPlan.nodeMixes.find((m) => m.nodeId === inp.nodeId);
      const trackMix = graph.mixPlan.trackMixes.find((m) => m.trackId === inp.trackId);
      filterParts.push(
        buildAudioNodeFilter(inp, inp.inputIdx, totalDuration, nodeMix, trackMix) + `[a${i}]`,
      );
    });
    const amixRefs = allAudioEntries.map((_, i) => `[a${i}]`).join('');
    filterParts.push(
      `${amixRefs}amix=inputs=${allAudioEntries.length}:normalize=0,` +
        `atrim=0:${totalDuration},asetpts=PTS-STARTPTS[aout]`,
    );
    finalAudioLabel = '[aout]';
  }

  args.push('-filter_complex', filterParts.join(';'));

  // --- OUTPUT MAPS ---
  args.push('-map', '[vout]');
  args.push('-map', finalAudioLabel);

  // --- CODEC + CONTAINER ---
  args.push(
    '-c:v', 'libx264',
    '-pix_fmt', 'yuv420p',
    '-preset', quality.preset,
    '-crf', String(quality.crf),
    '-c:a', 'aac',
    '-b:a', '128k',
    '-movflags', '+faststart',
    '-t', String(totalDuration),
    outputPath,
  );

  return args;
}

// ==========================================
// 6. VI-C VIDEO COMPOSITION HELPER
// ==========================================

/**
 * Builds all filter_complex filter strings for the visual overlay composition pipeline.
 * imageInputs must be sorted by zIndex ascending (lower zIndex = below in z-order).
 *
 * NORMAL: scale → [rotate] → format=rgba → [colorchannelmixer=aa] → overlay with enable
 * Non-NORMAL (MULTIPLY/SCREEN/OVERLAY): scale → [rotate] onto an identity-color canvas →
 *   blend with main canvas. Identity color ensures the blend is a no-op outside the active
 *   temporal window so no split+crop complexity is needed.
 *
 * Identity colors (value that makes the blend formula equal to the base):
 *   MULTIPLY → white (A×1=A)
 *   SCREEN   → black (A+0−A×0=A)
 *   OVERLAY  → gray 0x808080 (maps to A for both halves of the piecewise formula)
 *
 * Emits [vraw] as the final named output label consumed by the subtitle/copy step.
 */
/**
 * Builds all filter_complex filter strings for the visual overlay composition pipeline.
 * visualInputs must be sorted by zIndex ascending (lower zIndex = below in z-order).
 * Each entry carries an explicit inputIdx (FFmpeg -i order) and a kind ('image'|'video').
 *
 * Still images: the FFmpeg input is looped for effectiveDuration, PTS starts at 0.
 *   Overlay enable='between(t,S,E)' shows the still only during its slot. ✓
 *
 * Video clips: the FFmpeg input starts playing from PTS=0 at the same instant the
 *   output canvas starts.  To make the clip appear at output position S playing from
 *   its own frame 0, we apply:
 *     trim=trimStart:trimEnd  → extract the desired clip segment
 *     setpts=PTS-STARTPTS+(S/TB)  → normalise to 0 then shift PTS to S
 *   Then overlay with enable='between(t,S,E)':eof_action=pass so the base canvas
 *   shows through before and after the clip's window. ✓
 */
function buildVideoCompositionFilters(
  visualInputs: NodeEntry[],
  totalDuration: number,
  outW: number,
  outH: number,
): string[] {
  const filters: string[] = [];

  if (visualInputs.length === 0) {
    filters.push(
      `color=c=black:size=${outW}x${outH}:rate=25:d=${totalDuration}[vraw]`,
    );
    return filters;
  }

  // Base black canvas — all visual nodes are layered on top of this
  filters.push(
    `color=c=black:size=${outW}x${outH}:rate=25:d=${totalDuration}[canvas0]`,
  );

  visualInputs.forEach((node, idx) => {
    const targetW = Math.max(1, Math.round(outW * node.scaleX));
    const targetH = Math.max(1, Math.round(outH * node.scaleY));
    // XLII — COORDINATE CONVERSION: positionX/positionY are percentage-point offsets
    // from the output canvas center (canvas contract: 0,0 = center).
    // FFmpeg overlay x/y is the TOP-LEFT pixel of the layer.
    // centerPx = outW * (50 + positionX) / 100
    // ffmpegX = centerPx - targetW / 2
    const ffmpegX = Math.round(outW * (50 + node.positionX) / 100 - targetW / 2);
    const ffmpegY = Math.round(outH * (50 + node.positionY) / 100 - targetH / 2);
    const rotRad = (node.rotationDegrees * Math.PI) / 180;
    const startSec = node.startSec;
    // The hold keeps an outgoing layer on screen under its successor's ramp.
    // Zero for every node that nothing fades in over.
    const endSec = node.startSec + node.effectiveDuration + node.holdSeconds;
    const fadeIn = node.transitionInSeconds;
    const canvasIn = `[canvas${idx}]`;
    // Last node writes directly to [vraw] so the subtitle/copy step can pick it up
    const canvasOut = idx < visualInputs.length - 1 ? `[canvas${idx + 1}]` : '[vraw]';
    const hasRotation = Math.abs(node.rotationDegrees) > 0.001;
    // Use explicit inputIdx (not array idx) to reference the correct FFmpeg -i stream
    const ffStreamRef = `[${node.inputIdx}:v]`;

    // XLII — scale filter respects framingMode:
    // contain: preserve aspect ratio, pad to targetW×targetH with black
    // cover:   preserve aspect ratio, scale up and crop to targetW×targetH
    // fill:    stretch to exact targetW×targetH (may distort)
    const scaleFilter = framingFilter(targetW, targetH, node.framingMode);

    if (node.kind === 'video') {
      // VIDEO: trim source to [trimStart, trimEnd], normalise PTS, then shift to output position S.
      // This makes the clip play from its own frame 0 starting at output time S.
      const videoParts: string[] = [
        `trim=${node.trimStart.toFixed(6)}:${node.trimEnd.toFixed(6)}`,
        `setpts=PTS-STARTPTS+(${startSec.toFixed(6)}/TB)`,
      ];
      // A clip cannot be held past its own last frame, so the last frame is
      // cloned for the hold. Freezing a frame under a dissolve is what an
      // editor does; the alternative is black, which the contract forbids.
      if (node.holdSeconds > 0) {
        videoParts.push(`tpad=stop_mode=clone:stop_duration=${node.holdSeconds.toFixed(6)}`);
      }
      videoParts.push(scaleFilter, 'format=rgba');
      if (hasRotation) {
        videoParts.splice(videoParts.length - 1, 0, `rotate=${rotRad.toFixed(6)}:fillcolor=0x00000000`);
      }
      // PACKAGE XXXV — the ramp. The clip's PTS was already shifted onto the
      // canvas clock above, so `st` is the node's own IN point.
      if (fadeIn > 0) {
        videoParts.push(`fade=t=in:st=${startSec.toFixed(6)}:d=${fadeIn.toFixed(6)}:alpha=1`);
      }
      if (node.opacity < 0.9999) {
        videoParts.push(`colorchannelmixer=aa=${node.opacity.toFixed(6)}`);
      }
      filters.push(`${ffStreamRef}${videoParts.join(',')}[vn${idx}]`);
      filters.push(
        `${canvasIn}[vn${idx}]overlay=x=${ffmpegX}:y=${ffmpegY}` +
          `:format=auto:eof_action=pass:enable='between(t,${startSec},${endSec})'${canvasOut}`,
      );
    } else if (node.blendMode === 'NORMAL') {
      // STILL IMAGE — NORMAL blend: scale → [rotate] → rgba → [opacity] → overlay
      const parts: string[] = [scaleFilter];
      if (hasRotation) {
        parts.push(`rotate=${rotRad.toFixed(6)}:fillcolor=0x00000000`);
      }
      parts.push('format=rgba');
      if (fadeIn > 0) {
        // PACKAGE XXXV — a still's input is `-loop 1 -t d`, so its own clock
        // starts at 0 no matter where on the timeline it sits. An alpha ramp
        // written against that clock would run during canvas seconds 0..d,
        // finishing long before the layer is ever shown — which is precisely
        // why a declared crossfade arrived as a cut. The layer is moved onto
        // the canvas clock first; then `st` is the node's real IN point.
        parts.push(`setpts=PTS-STARTPTS+(${startSec.toFixed(6)}/TB)`);
        parts.push(`fade=t=in:st=${startSec.toFixed(6)}:d=${fadeIn.toFixed(6)}:alpha=1`);
      }
      if (node.opacity < 0.9999) {
        parts.push(`colorchannelmixer=aa=${node.opacity.toFixed(6)}`);
      }
      filters.push(`${ffStreamRef}${parts.join(',')}[vn${idx}]`);
      filters.push(
        `${canvasIn}[vn${idx}]overlay=x=${ffmpegX}:y=${ffmpegY}` +
          `:format=auto${fadeIn > 0 ? ':eof_action=pass' : ''}` +
          `:enable='between(t,${startSec},${endSec})'${canvasOut}`,
      );
    } else {
      // STILL IMAGE — Non-NORMAL blend via identity-canvas trick.
      const ffBlend = node.blendMode.toLowerCase();
      const identityColor =
        node.blendMode === 'MULTIPLY'
          ? 'white'
          : node.blendMode === 'SCREEN'
            ? 'black'
            : '0x808080';
      const rotFillcolor =
        node.blendMode === 'MULTIPLY'
          ? '0xffffff'
          : node.blendMode === 'SCREEN'
            ? '0x000000'
            : '0x808080';

      // ── BOTH SIDES OF A BLEND MUST BE IN THE SAME COLOUR SPACE ────────────
      //
      //   `blend` mixes whatever planes it is handed. The canvas arrived here as
      //   RGBA (the overlay chain above emits `format=auto` from an rgba layer)
      //   while the identity composite arrived as FFmpeg's default YUV, so the
      //   blend was computed across two different colour spaces.
      //
      //   MEASURED, on a real file, blue over red:
      //     MULTIPLY  → (53,107,0), a green the Creator never placed
      //     SCREEN    → the layer bleeding at (255,0,179) from the FIRST frame,
      //                 three seconds before its own window opened
      //   With both sides pinned to planar RGB:
      //     MULTIPLY  → (0,0,0)       — red × blue, correct
      //     SCREEN    → (255,0,254)   — red + blue, correct
      //     and pure red before the window, as the timeline says
      //
      //   The chamber previews these same modes with CSS `mix-blend-mode`,
      //   which is defined in sRGB. Pinning the film to RGB is therefore not a
      //   preference — it is what makes the film agree with the preview.
      filters.push(
        `color=c=${identityColor}:size=${outW}x${outH}:rate=25:d=${totalDuration},`
          + `format=gbrp[id${idx}]`,
      );

      const layerParts: string[] = [scaleFilter];
      if (hasRotation) {
        layerParts.push(`rotate=${rotRad.toFixed(6)}:fillcolor=${rotFillcolor}`);
      }
      layerParts.push('format=gbrp');
      if (fadeIn > 0) {
        // PACKAGE XXXV — here the ramp is in COLOUR, not in alpha: it runs from
        // the blend's identity colour to the layer, which is the same thing as
        // running from "blend has no effect" to "blend at full force". Alpha
        // would be wrong twice over — this branch carries no alpha channel, and
        // `fade`'s alpha output is premultiplied, which MEASURED at (253,0,236)
        // where (255,0,255) was owed.
        //
        // Same clock correction as the other two branches, and for the same
        // reason: a still's own clock starts at 0 wherever it sits.
        layerParts.push(`setpts=PTS-STARTPTS+(${startSec.toFixed(6)}/TB)`);
        layerParts.push(
          `fade=t=in:st=${startSec.toFixed(6)}:d=${fadeIn.toFixed(6)}:c=${identityColor}`,
        );
      }
      filters.push(`${ffStreamRef}${layerParts.join(',')}[vl${idx}]`);

      filters.push(
        `[id${idx}][vl${idx}]overlay=x=${ffmpegX}:y=${ffmpegY}:format=auto` +
          `${fadeIn > 0 ? ':eof_action=pass' : ''}` +
          `:enable='between(t,${startSec},${endSec})'[nm${idx}]`,
      );

      filters.push(`${canvasIn}format=gbrp[cf${idx}]`);
      filters.push(`[nm${idx}]format=gbrp[nf${idx}]`);
      filters.push(
        `[cf${idx}][nf${idx}]blend=all_mode=${ffBlend}:all_opacity=${node.opacity.toFixed(6)}${canvasOut}`,
      );
    }
  });

  return filters;
}

// ==========================================
// 7. VI-B TEMPORAL & AUDIO FIDELITY HELPERS
// ==========================================

/**
 * Computes safe trim bounds from a TemporalDirective.
 * Clamps to [0, playDurationSeconds] and guarantees effectiveDuration ≥ 0.001.
 * When trimStartSeconds/trimEndSeconds are absent, returns the full slot duration.
 */
function computeTrimBounds(
  temporal: { trimStartSeconds?: number; trimEndSeconds?: number } | undefined,
  playDurationSeconds: number,
): { trimStart: number; trimEnd: number; effectiveDuration: number } {
  const trimStart = Math.max(0, temporal?.trimStartSeconds ?? 0);
  const rawTrimEnd = temporal?.trimEndSeconds ?? playDurationSeconds;
  const trimEnd = Math.max(trimStart + 0.001, Math.min(rawTrimEnd, playDurationSeconds));
  return { trimStart, trimEnd, effectiveDuration: trimEnd - trimStart };
}

/**
 * Builds the FFmpeg filter-complex expression for one audio input.
 * Consumes VI-B directives in order: trim → fade-in → fade-out → delay → volume → pan → safety-trim.
 * Returns the string starting with `[inputIdx:a]` and ending before the output label.
 * Caller appends the label: `[aout]` or `[a0]` etc.
 *
 * Safe defaults when directives are absent:
 *   trim: full range (trimStart=0, trimEnd=effectiveDuration) — no-op
 *   fade: 0 → no afade filter inserted
 *   pan: 0 → no pan filter inserted
 *   volume: 0 dB → 1.000000 (unity)
 */
function buildAudioNodeFilter(
  inp: NodeEntry,
  inputIdx: number,
  totalDuration: number,
  nodeMix: CompiledNodeMix | undefined,
  trackMix: CompiledTrackMix | undefined,
): string {
  // Volume (unchanged from pre-VI-B)
  const volDb =
    (nodeMix?.isMuted ? -120 : (nodeMix?.volumeDb ?? 0)) +
    (trackMix?.isMuted ? -120 : (trackMix?.trackVolumeDb ?? 0));
  const volLinear = Math.pow(10, Math.max(volDb, -120) / 20);
  const startMs = Math.round(inp.startSec * 1000);

  // VI-B: Pan — stereo balance; skip filter entirely when neutral
  const panCenter = nodeMix?.panCenter ?? 0;

  // VI-B: Fades — clamp so fadeIn + fadeOut ≤ effectiveDuration (prevents silence gap)
  const rawFadeIn = Math.max(0, nodeMix?.fadeInSeconds ?? 0);
  const rawFadeOut = Math.max(0, nodeMix?.fadeOutSeconds ?? 0);
  const totalFadeRequest = rawFadeIn + rawFadeOut;
  const fadeScale =
    totalFadeRequest > 0 && totalFadeRequest > inp.effectiveDuration
      ? inp.effectiveDuration / totalFadeRequest
      : 1;
  const fadeIn = rawFadeIn * fadeScale;
  const fadeOut = rawFadeOut * fadeScale;

  const parts: string[] = [];

  // Step 1: Trim source to [trimStart, trimEnd] and reset timestamps
  parts.push(`atrim=${inp.trimStart}:${inp.trimEnd},asetpts=PTS-STARTPTS`);

  // Step 2: Fade-in from the trimmed content start
  if (fadeIn > 0.0001) {
    parts.push(`afade=t=in:st=0:d=${fadeIn.toFixed(6)}`);
  }

  // Step 3: Fade-out ending at the trimmed content end
  if (fadeOut > 0.0001) {
    const fadeOutStart = Math.max(0, inp.effectiveDuration - fadeOut);
    parts.push(`afade=t=out:st=${fadeOutStart.toFixed(6)}:d=${fadeOut.toFixed(6)}`);
  }

  // Step 4: Position on the global timeline (unchanged VI-A behavior)
  parts.push(`adelay=${startMs}|${startMs}`);

  // Step 5: Volume (unchanged VI-A behavior)
  parts.push(`volume=${volLinear.toFixed(6)}`);

  // Step 6: Stereo pan — normalise to stereo first so mono sources work safely
  if (Math.abs(panCenter) > 0.001) {
    const leftGain = (panCenter <= 0 ? 1.0 : 1.0 - panCenter).toFixed(6);
    const rightGain = (panCenter >= 0 ? 1.0 : 1.0 + panCenter).toFixed(6);
    parts.push(
      `aformat=channel_layouts=stereo,pan=stereo|c0=${leftGain}*c0|c1=${rightGain}*c1`,
    );
  }

  // Step 7: Safety trim and re-sync (unchanged VI-A behavior)
  parts.push(`atrim=0:${totalDuration},asetpts=PTS-STARTPTS`);

  return `[${inputIdx}:a]${parts.join(',')}`;
}

// ==========================================
// 7. SRT FILE WRITER
// ==========================================

function writeSrtFile(operationId: string, graph: CompiledAssemblyGraph): string {
  const srtPath = join(rendersDir(), `${operationId}.srt`);
  const cues = graph.subtitlePlan.absoluteCues;

  const lines: string[] = [];
  cues.forEach((cue, idx) => {
    lines.push(String(idx + 1));
    lines.push(`${srtTime(cue.absoluteStartSeconds)} --> ${srtTime(cue.absoluteEndSeconds)}`);
    lines.push(cue.text);
    lines.push('');
  });

  writeFileSync(srtPath, lines.join('\n'), 'utf-8');
  return srtPath;
}

function srtTime(seconds: number): string {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  const ms = Math.round((seconds % 1) * 1000);
  return `${pad2(h)}:${pad2(m)}:${pad2(s)},${String(ms).padStart(3, '0')}`;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}
