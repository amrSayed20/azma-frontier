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
 * Output paths (see rendersDir() — $UPLOADS_DIR/renders, NOT public/, which
 * would let Next.js's static handler serve finished films past the
 * authorisation gate):
 *   $UPLOADS_DIR/renders/<operationId>.partial.mp4 — written while FFmpeg runs
 *   $UPLOADS_DIR/renders/<operationId>.mp4         — final MP4, renamed into place only on success
 *   $UPLOADS_DIR/renders/<operationId>.srt         — temporary SRT (when subtitles present)
 *
 * RAS AL AMR EXECUTION DIRECTIVE — PHASE 1 (OUTPUT TRUTH): a real render
 * proved the MP4 diverged from the Creator's preview. This encoder now reads
 * timing, crossfades, stacking and frame geometry from the same pure contract
 * the preview uses (chambers/ras-al-amr/cinematic-timing.ts):
 *   - crossfades are rendered as alpha fades on the exact preview windows;
 *   - video clips (MOTION) are composed like images, with their own audio;
 *   - media kind comes from the Vault capability, so a browser recording
 *     saved as .webm is decoded as audio instead of silently dropped;
 *   - layers are contained (aspect preserved) and centred per Package XXXII,
 *     instead of stretched to 1920×1080 and pinned to the top-left in pixels;
 *   - stacking is zIndex, then canvas order (the preview's DOM order).
 */

import { spawn, spawnSync } from 'node:child_process';
import { existsSync, mkdirSync, renameSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { resolveAssetPath } from '../../../../vault/asset-bytes';
import type {
  CompiledAssemblyGraph,
  CompiledNodeMix,
  CompiledTrackMix,
} from '../../../../chambers/ras-al-amr/pre-publishing-boundary';
import type { HydratedAssemblyNode, HydratedAssemblyTrack } from '../../../../chambers/ras-al-amr/vault-rehydration-bridge';
import {
  OUTPUT_FRAME_HEIGHT,
  OUTPUT_FRAME_WIDTH,
  computeVisualWindow,
  mapNextVisualSiblings,
  orderVisualLayers,
  resolveSourceWindow,
} from '../../../../chambers/ras-al-amr/cinematic-timing';
import type { SourceWindow, VisualWindow } from '../../../../chambers/ras-al-amr/cinematic-timing';

// ==========================================
// 1. JOB STATE TRACKING
// ==========================================

type JobState = 'running' | 'done' | Error;
const jobs = new Map<string, JobState>();

// ==========================================
// 2. PATH & MEDIA-TYPE HELPERS
// ==========================================

const OUTPUT_WIDTH = OUTPUT_FRAME_WIDTH;
const OUTPUT_HEIGHT = OUTPUT_FRAME_HEIGHT;
const OUTPUT_FPS = 25;
const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif', '.bmp']);
const VIDEO_EXTS = new Set(['.mp4', '.mov', '.m4v', '.webm', '.mkv', '.avi']);
const AUDIO_EXTS = new Set(['.mp3', '.wav', '.ogg', '.oga', '.opus', '.weba', '.m4a', '.aac', '.flac']);

/**
 * How an asset fills a target rectangle — the one definition in the Empire.
 *
 * KEPT through this integration although the composition pipeline below no
 * longer calls it: `src/platform-reframe/reframe-execution.ts` does, to
 * reframe ONE asset for ONE platform with no assembly graph around it.
 * Dropping it because the renderer stopped using it would have broken a live
 * capability that has nothing to do with the timeline.
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

/**
 * Where finished films are written.
 *
 * ─── WHY THIS IS NOT `public/renders` ───────────────────────────────────────
 *
 *   Anything under `public/` is served by Next.js's own static handler, which
 *   runs BEFORE any route. Phase E built an authorisation gate at
 *   `app/renders/[...path]/route.ts`, and with the films still in `public/`
 *   the gate was unreachable code. MEASURED, against a planted file:
 *
 *       GET /renders/op_shadowtest_probe.mp4  ->  200 · 33 bytes · raw file
 *
 *   The route never ran. So films live beside every other protected byte, in
 *   UPLOADS_DIR, which `public/` cannot shadow. RE-MEASURED on the live server
 *   2026-10-18, against a real film of the 28 already there:
 *
 *       GET /renders/op_render_1787944987450_9xwap8f8.mp4 (no session) -> 404
 *
 *   This is deliberately keyed on UPLOADS_DIR and NOT on a RENDERS_DIR of its
 *   own. A separate variable that production does not set would default back to
 *   `public/renders` and silently reopen the hole — and would also hide the 28
 *   films already written, so a render Makman had adopted would stop resolving.
 *
 * ─── AND WHY IT IS A FUNCTION ───────────────────────────────────────────────
 *
 *   Read at CALL time, never frozen at import. A module-level `const` reading
 *   an environment variable has caused three separate production defects in
 *   this repository. The lesson is not "remember"; the const form is a latent
 *   bug by construction, so the value is never available in that form.
 */
function rendersDir(): string {
  const base = process.env.UPLOADS_DIR;
  return base ? join(base, 'renders') : join(process.cwd(), 'public', 'renders');
}

// ── THE RULE THAT WROTE THE FILE IS THE RULE THAT FINDS IT ────────────────
//   A private copy stood here, and its own comment said it was "mirroring"
//   the two modules that write assets. A rule kept in three places is a rule
//   that will be corrected in one. It lives in the Vault, which owns assets,
//   and this module reads that one definition. The copy also did not know the
//   `/renders/` prefix, and failed operations on production name assets with
//   exactly that prefix.

function getExt(uri: string): string {
  const dot = uri.lastIndexOf('.');
  return dot >= 0 ? uri.slice(dot).toLowerCase() : '';
}

type MediaKind = 'image' | 'video' | 'audio' | 'none';

/**
 * The Vault capability is the authority: an AUDIO asset is audio whatever its
 * container (a Chrome microphone recording is audio/webm), a MOTION asset is
 * video. The file extension only decides when no capability is known.
 */
function classifyMedia(uri: string, capability: string | undefined): MediaKind {
  const ext = getExt(uri);
  if (capability === 'AUDIO') return 'audio';
  if (capability === 'MOTION') return 'video';
  if (capability === 'VISUAL') return VIDEO_EXTS.has(ext) ? 'video' : 'image';
  if (capability) return 'none';
  if (IMAGE_EXTS.has(ext)) return 'image';
  if (AUDIO_EXTS.has(ext)) return 'audio';
  if (VIDEO_EXTS.has(ext)) return 'video';
  return 'none';
}

/**
 * False only when ffprobe positively finds no picture stream — an audio-only
 * file the Vault filed as video before uploads were classified by their
 * streams. Any probe failure keeps the file a video.
 */
function probeHasVideo(path: string): boolean {
  if (typeof spawnSync !== 'function') return true;
  try {
    const result = spawnSync(
      'ffprobe',
      ['-v', 'error', '-select_streams', 'v', '-show_entries', 'stream=index', '-of', 'csv=p=0', path],
      { encoding: 'utf-8', timeout: 15000 },
    );
    return result.status !== 0 || String(result.stdout ?? '').trim().length > 0;
  } catch {
    return true;
  }
}

/** True when the file carries an audio stream. Any probe failure counts as "no audio". */
function probeHasAudio(path: string): boolean {
  if (typeof spawnSync !== 'function') return false;
  try {
    const result = spawnSync(
      'ffprobe',
      ['-v', 'error', '-select_streams', 'a', '-show_entries', 'stream=index', '-of', 'csv=p=0', path],
      { encoding: 'utf-8', timeout: 15000 },
    );
    return result.status === 0 && String(result.stdout ?? '').trim().length > 0;
  } catch {
    return false;
  }
}

export function getOutputPath(operationId: string): string {
  return join(rendersDir(), `${operationId}.mp4`);
}

function getPartialOutputPath(operationId: string): string {
  return join(rendersDir(), `${operationId}.partial.mp4`);
}

// ==========================================
// 3. PUBLIC STATE QUERY API
// ==========================================

/**
 * The final file only ever appears through an atomic rename after FFmpeg
 * exits 0, so its existence alone proves a complete encode — which is what
 * lets a status check survive a server restart that cleared the jobs Map.
 */
export function isEncodingComplete(operationId: string): boolean {
  const state = jobs.get(operationId);
  if (state === 'running' || state instanceof Error) return false;
  return existsSync(getOutputPath(operationId));
}

export function getEncodingError(operationId: string): Error | null {
  const state = jobs.get(operationId);
  return state instanceof Error ? state : null;
}

/** Whether this server process is (or was) running the encode. False after a restart. */
export function isEncodingTracked(operationId: string): boolean {
  return jobs.has(operationId);
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
  // failure (missing secureStorageUri, asset not on disk, no active visual nodes,
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
    const partialPath = getPartialOutputPath(operationId);
    if (code === 0 && existsSync(partialPath)) {
      try {
        renameSync(partialPath, getOutputPath(operationId));
        jobs.set(operationId, 'done');
      } catch (err) {
        jobs.set(
          operationId,
          new Error(`FFmpeg finished but the MP4 could not be moved into place: ${(err as Error).message}`),
        );
      }
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

interface VisualEntry {
  kind: 'image' | 'video';
  path: string;
  inputIndex: number;
  nodeId: string;
  trackId: string;
  window: VisualWindow;
  source: SourceWindow;
  positionX: number;
  positionY: number;
  scaleX: number;
  scaleY: number;
  rotationDegrees: number;
  opacity: number;             // VisualFilterDirective 0.0–1.0
  blendMode: BlendMode;
}

interface AudioEntry {
  path: string;
  inputIndex: number;
  nodeId: string;
  trackId: string;
  startSec: number;            // where the sound begins on the master timeline
  trimStart: number;           // IN point inside the source (seconds)
  trimEnd: number;             // OUT point inside the source (seconds)
  effectiveDuration: number;   // trimEnd - trimStart (always ≥ 0.001)
}

interface CollectedNode {
  node: HydratedAssemblyNode;
  trackId: string;
  path: string;
  kind: MediaKind;
}

function fmt(value: number): string {
  return Number(value.toFixed(6)).toString();
}

function buildFfmpegArgs(
  graph: CompiledAssemblyGraph,
  operationId: string,
  resolvedVoicePaths: ReadonlyMap<string, string> = new Map(),
): string[] {
  const outputPath = getPartialOutputPath(operationId);

  // Walk every non-muted, non-hidden track and collect active nodes with media.
  const collected = new Map<string, CollectedNode>();
  const liveTracks: HydratedAssemblyTrack[] = [];
  for (const track of graph.hydratedCanvas.tracks as HydratedAssemblyTrack[]) {
    if (track.isMuted || track.isHidden) continue;
    const liveNodes: HydratedAssemblyNode[] = [];
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

      const capability = (node.runtimeAsset?.capabilityTarget ?? node.capabilityOrigin) as string | undefined;
      let kind = classifyMedia(uri, capability);
      // A "video" with no picture is a sound (see probeHasVideo).
      if (kind === 'video' && !probeHasVideo(assetPath)) kind = 'audio';
      // Text/structural nodes (TXT etc.) carry no media — silently skipped
      if (kind === 'none') continue;
      collected.set(node.nodeId, { node, trackId: track.trackId, path: assetPath, kind });
      liveNodes.push(node);
    }
    liveTracks.push({ ...track, nodes: liveNodes });
  }

  const isVisual = (node: HydratedAssemblyNode) => {
    const kind = collected.get(node.nodeId)?.kind;
    return kind === 'image' || kind === 'video';
  };
  const nextVisualSibling = mapNextVisualSiblings(liveTracks, isVisual);

  // Inputs: visual layers first, in stacking order (lower zIndex, then earlier
  // in the canvas = drawn first = underneath), then standalone audio files.
  const visualEntries: VisualEntry[] = orderVisualLayers(liveTracks, isVisual).map((node, index) => {
    const info = collected.get(node.nodeId)!;
    const visualDir = (node.customDirectives as Record<string, unknown> | undefined)
      ?.['visual'] as { opacity?: number; blendMode?: string } | undefined;
    const rawBlend = visualDir?.blendMode ?? 'NORMAL';
    return {
      kind: info.kind as 'image' | 'video',
      path: info.path,
      inputIndex: index,
      nodeId: node.nodeId,
      trackId: info.trackId,
      window: computeVisualWindow(node.temporal, nextVisualSibling.get(node.nodeId)?.temporal),
      source: resolveSourceWindow(node.temporal),
      positionX: node.spatial?.positionX ?? 0,
      positionY: node.spatial?.positionY ?? 0,
      scaleX: Math.max(0.001, node.spatial?.scaleX ?? 1),
      scaleY: Math.max(0.001, node.spatial?.scaleY ?? 1),
      rotationDegrees: node.spatial?.rotationDegrees ?? 0,
      opacity: Math.max(0, Math.min(1, visualDir?.opacity ?? 1)),
      blendMode: (['NORMAL', 'MULTIPLY', 'SCREEN', 'OVERLAY'] as const).includes(rawBlend as BlendMode)
        ? (rawBlend as BlendMode)
        : 'NORMAL',
    };
  });

  if (visualEntries.length === 0) {
    throw new Error(
      `CINEMATIC encoder: no active visual nodes found for operation [${operationId}]. ` +
        `A CINEMATIC canvas must contain at least one active image or video node to produce a video.`,
    );
  }

  const audioEntries: AudioEntry[] = [];
  let nextInputIndex = visualEntries.length;

  // Standalone audio nodes (music, uploads, microphone recordings, TTS).
  for (const info of collected.values()) {
    if (info.kind !== 'audio') continue;
    const source = resolveSourceWindow(info.node.temporal);
    audioEntries.push({
      path: info.path,
      inputIndex: nextInputIndex++,
      nodeId: info.node.nodeId,
      trackId: info.trackId,
      startSec: Math.max(0, info.node.temporal?.globalStartTimeSeconds ?? 0),
      trimStart: source.sourceInSeconds,
      trimEnd: source.sourceInSeconds + source.activeDurationSeconds,
      effectiveDuration: source.activeDurationSeconds,
    });
  }

  // A video clip's own soundtrack plays for as long as the clip is on screen,
  // exactly as the preview's <video> element does.
  for (const entry of visualEntries) {
    if (entry.kind !== 'video' || !probeHasAudio(entry.path)) continue;
    const visibleDuration = entry.window.visibleEndSeconds - entry.window.visibleStartSeconds;
    const audible = Math.max(0.001, Math.min(visibleDuration, entry.source.sourceOutSeconds - entry.source.sourceInSeconds));
    audioEntries.push({
      path: entry.path,
      inputIndex: entry.inputIndex,
      nodeId: entry.nodeId,
      trackId: entry.trackId,
      startSec: entry.window.visibleStartSeconds,
      trimStart: entry.source.sourceInSeconds,
      trimEnd: entry.source.sourceInSeconds + audible,
      effectiveDuration: audible,
    });
  }

  // VI-A: voice-assigned audio. For each visual node with a resolved voice
  // secureStorageUri, the voice starts with the scene and reads the scene's own
  // source window (VI-B trims), at most for the scene's slot.
  // The voice inherits the scene's nodeId/trackId so it picks up the same
  // volumeDb/isMuted mix settings from mixPlan. Missing files are skipped
  // gracefully — they never throw or abort the encode.
  const voiceEntries: AudioEntry[] = [];
  for (const entry of visualEntries) {
    const voiceUri = resolvedVoicePaths.get(entry.nodeId);
    if (!voiceUri) continue;
    const voicePath = resolveAssetPath(voiceUri);
    if (!existsSync(voicePath)) {
      console.warn(
        `[CinematicEncoder] voice file missing at [${voicePath}] for node [${entry.nodeId}] — skipping`,
      );
      continue;
    }
    voiceEntries.push({
      path: voicePath,
      inputIndex: nextInputIndex++,
      nodeId: entry.nodeId,
      trackId: entry.trackId,
      startSec: entry.window.startSeconds,
      trimStart: entry.source.sourceInSeconds,
      trimEnd: entry.source.sourceInSeconds + entry.source.activeDurationSeconds,
      effectiveDuration: entry.source.activeDurationSeconds,
    });
  }
  audioEntries.push(...voiceEntries);

  // ── THE FILM IS AS LONG AS THERE IS PICTURE ───────────────────────────────
  //
  //   A Creator who lays 30 seconds of music under 10 seconds of images used to
  //   get a 30-second film: ten seconds of their work, then twenty seconds of
  //   BLACK carrying the rest of the track. The duration was taken from the
  //   furthest visible OR audible point, so sound decided the length of a
  //   picture. Both the previous renderer and the integrated one did this.
  //
  //   The last frame now ends the film, and the audio chain's own safety trim
  //   (`atrim=0:totalDuration`) cuts the tail with it. A declared duration that
  //   is SHORTER still wins — that is the Creator shortening their own
  //   timeline, which is theirs to do.
  const lastFrameSeconds = Math.max(...visualEntries.map((n) => n.window.visibleEndSeconds), 1);
  const declaredSeconds = graph.metadata.estimatedDurationSeconds;
  const totalDuration = Math.min(declaredSeconds ?? lastFrameSeconds, lastFrameSeconds);

  if (totalDuration <= 0) {
    throw new Error(
      `CINEMATIC encoder: computed duration is ${totalDuration}s. ` +
        `Visual nodes must have temporal directives with positive playDurationSeconds.`,
    );
  }

  const args: string[] = ['-y'];

  // --- INPUTS ---
  // Still images loop for exactly their visible window; video clips are read as-is
  // and trimmed inside the filter graph so their audio stream stays addressable.
  visualEntries.forEach((entry) => {
    if (entry.kind === 'image') {
      const visibleDuration = entry.window.visibleEndSeconds - entry.window.visibleStartSeconds;
      args.push('-loop', '1', '-t', fmt(visibleDuration), '-i', entry.path);
    } else {
      args.push('-i', entry.path);
    }
  });
  audioEntries.forEach((entry) => {
    if (entry.inputIndex >= visualEntries.length) args.push('-i', entry.path);
  });

  // --- FILTER_COMPLEX ---
  const filterParts: string[] = [];

  // VI-C: Full overlay composition pipeline. Visual nodes are layered onto a
  // 1920×1080 black canvas in stacking order; each is drawn only inside its
  // visible window, with crossfade alpha ramps where the preview has them.
  buildVideoCompositionFilters(visualEntries, totalDuration).forEach((f) => filterParts.push(f));

  // Subtitle burning
  const hasSubs = graph.subtitlePlan.absoluteCues.length > 0;
  if (hasSubs) {
    const srtPath = writeSrtFile(operationId, graph);
    // FFmpeg subtitle filter requires forward slashes and escaped colons on Linux
    const escapedPath = srtPath.replace(/\\/g, '/');
    filterParts.push(
      `[vraw]subtitles='${escapedPath}':force_style='FontSize=24,PrimaryColour=&HFFFFFF,Outline=1'[vout]`,
    );
  } else {
    filterParts.push('[vraw]copy[vout]');
  }

  // Audio chain — VI-B: trim, fade, pan consumed via buildAudioNodeFilter()
  let finalAudioLabel: string;
  if (audioEntries.length === 0) {
    // No audio nodes — generate silent stereo audio for the full duration
    filterParts.push(`aevalsrc=0:c=stereo:s=44100:d=${totalDuration}[aout]`);
    finalAudioLabel = '[aout]';
  } else if (audioEntries.length === 1) {
    const inp = audioEntries[0];
    const nodeMix = graph.mixPlan.nodeMixes.find((m) => m.nodeId === inp.nodeId);
    const trackMix = graph.mixPlan.trackMixes.find((m) => m.trackId === inp.trackId);
    filterParts.push(
      buildAudioNodeFilter(inp, inp.inputIndex, totalDuration, nodeMix, trackMix) + '[aout]',
    );
    finalAudioLabel = '[aout]';
  } else {
    // Multiple audio inputs — each gets full VI-B fidelity treatment, then amix
    audioEntries.forEach((inp, i) => {
      const nodeMix = graph.mixPlan.nodeMixes.find((m) => m.nodeId === inp.nodeId);
      const trackMix = graph.mixPlan.trackMixes.find((m) => m.trackId === inp.trackId);
      filterParts.push(
        buildAudioNodeFilter(inp, inp.inputIndex, totalDuration, nodeMix, trackMix) + `[a${i}]`,
      );
    });
    const amixRefs = audioEntries.map((_, i) => `[a${i}]`).join('');
    filterParts.push(
      `${amixRefs}amix=inputs=${audioEntries.length}:normalize=0,` +
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
    '-preset', 'fast',
    '-crf', '23',
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
 * visualEntries must be in stacking order (first = bottom). Each layer:
 *
 *   [video only] trim to its source window → reset timestamps → 25 fps
 *   scale       contain the source in 1920×1080 (aspect preserved), then × scaleX/scaleY
 *   format=rgba → [rotate, expanding the box with transparent corners]
 *   [opacity]   colorchannelmixer=aa (NORMAL only; blend modes use all_opacity)
 *   setpts      shift the layer to its visibleStart on the master timeline
 *   [fades]     alpha fade-in / fade-out on the crossfade windows
 *   overlay     centred at (50% + positionX%, 50% + positionY%) of the frame,
 *               enabled only inside the visible window
 *
 * Non-NORMAL (MULTIPLY/SCREEN/OVERLAY) layers are first overlaid onto an
 * identity-colour canvas, then blended with the main canvas. Identity colours
 * make the blend a mathematical no-op wherever the layer is absent or transparent:
 *   MULTIPLY → white (A×1=A) · SCREEN → black (A+0−A×0=A) · OVERLAY → gray 0x808080
 *
 * Emits [vraw] as the final named output label consumed by the subtitle/copy step.
 */
function buildVideoCompositionFilters(visualEntries: VisualEntry[], totalDuration: number): string[] {
  const filters: string[] = [];

  // Base black canvas — all visual nodes are layered on top of this
  filters.push(
    `color=c=black:size=${OUTPUT_WIDTH}x${OUTPUT_HEIGHT}:rate=${OUTPUT_FPS}:d=${totalDuration}[canvas0]`,
  );

  visualEntries.forEach((entry, idx) => {
    const { window } = entry;
    const visibleStart = window.visibleStartSeconds;
    const visibleEnd = window.visibleEndSeconds;
    const canvasIn = `[canvas${idx}]`;
    // Last node writes directly to [vraw] so the subtitle/copy step can pick it up
    const canvasOut = idx < visualEntries.length - 1 ? `[canvas${idx + 1}]` : '[vraw]';
    const rotRad = (entry.rotationDegrees * Math.PI) / 180;
    const hasRotation = Math.abs(entry.rotationDegrees) > 0.001;
    const isNormal = entry.blendMode === 'NORMAL';

    const layer: string[] = [];
    if (entry.kind === 'video') {
      const visibleDuration = visibleEnd - visibleStart;
      const clipEnd = Math.min(entry.source.sourceOutSeconds, entry.source.sourceInSeconds + visibleDuration);
      layer.push(
        `trim=start=${fmt(entry.source.sourceInSeconds)}:end=${fmt(Math.max(clipEnd, entry.source.sourceInSeconds + 0.04))}`,
        'setpts=PTS-STARTPTS',
        `fps=${OUTPUT_FPS}`,
      );
    }
    // Contain-fit into the frame, then apply the Creator's own scale.
    layer.push(
      `scale=w='max(1,trunc(min(${OUTPUT_WIDTH}/iw,${OUTPUT_HEIGHT}/ih)*iw*${fmt(entry.scaleX)}))'` +
        `:h='max(1,trunc(min(${OUTPUT_WIDTH}/iw,${OUTPUT_HEIGHT}/ih)*ih*${fmt(entry.scaleY)}))'`,
    );
    layer.push('format=rgba');
    if (hasRotation) {
      // Expand the output box so corners are not cropped; corners stay transparent.
      const a = rotRad.toFixed(6);
      layer.push(`rotate=${a}:ow='rotw(${a})':oh='roth(${a})':fillcolor=0x00000000`);
    }
    if (isNormal && entry.opacity < 0.9999) {
      layer.push(`colorchannelmixer=aa=${entry.opacity.toFixed(6)}`);
    }
    layer.push(`setpts=PTS-STARTPTS+${fmt(visibleStart)}/TB`);
    if (window.fadeInSeconds > 0.0001) {
      layer.push(`fade=t=in:st=${fmt(visibleStart)}:d=${fmt(window.fadeInSeconds)}:alpha=1`);
    }
    if (window.fadeOutSeconds > 0.0001) {
      const fadeOutStart = window.startSeconds + window.playDurationSeconds;
      layer.push(`fade=t=out:st=${fmt(fadeOutStart)}:d=${fmt(window.fadeOutSeconds)}:alpha=1`);
    }

    // Package XXXII: the layer's CENTRE sits at (50% + X%, 50% + Y%) of the frame.
    const centerX = OUTPUT_WIDTH * (0.5 + entry.positionX / 100);
    const centerY = OUTPUT_HEIGHT * (0.5 + entry.positionY / 100);
    const position = `x='${fmt(centerX)}-w/2':y='${fmt(centerY)}-h/2'`;
    const enable = `enable='between(t,${fmt(visibleStart)},${fmt(visibleEnd)})'`;

    if (isNormal) {
      filters.push(`[${entry.inputIndex}:v]${layer.join(',')}[vn${idx}]`);
      filters.push(`${canvasIn}[vn${idx}]overlay=${position}:format=auto:${enable}${canvasOut}`);
    } else {
      const ffBlend = entry.blendMode.toLowerCase(); // 'multiply' | 'screen' | 'overlay'
      const identityColor =
        entry.blendMode === 'MULTIPLY' ? 'white' : entry.blendMode === 'SCREEN' ? 'black' : '0x808080';

      // ── BOTH SIDES OF A BLEND MUST BE IN THE SAME COLOUR SPACE ────────────
      //
      //   `blend` mixes whatever planes it is handed. The canvas arrives here
      //   as RGBA (the overlay chain above emits `format=auto` from an rgba
      //   layer) while the identity composite arrived as FFmpeg's default YUV,
      //   so the blend was computed across two different colour spaces.
      //
      //   MEASURED on a real file, blue over red, on ffmpeg 9.0.2 locally AND
      //   8.0.1 on the live server, byte-identical on both:
      //     MULTIPLY  -> (53,107,0), a green the Creator never placed
      //     SCREEN    -> the layer bleeding at (255,0,179) from the FIRST
      //                  frame, three seconds before its window opened
      //   With both sides pinned to planar RGB:
      //     MULTIPLY  -> (0,0,0)     — red x blue, correct
      //     SCREEN    -> (255,0,254) — red + blue, correct
      //     and pure red before the window, as the timeline says
      //
      //   The chamber previews these modes with CSS `mix-blend-mode`, which is
      //   defined in sRGB. Pinning the film to RGB is therefore not a
      //   preference — it is what makes the film agree with the preview.
      filters.push(
        `color=c=${identityColor}:size=${OUTPUT_WIDTH}x${OUTPUT_HEIGHT}:rate=${OUTPUT_FPS}`
          + `:d=${totalDuration},format=gbrp[id${idx}]`,
      );
      filters.push(`[${entry.inputIndex}:v]${layer.join(',')},format=gbrp[vl${idx}]`);
      // Overlay actual content onto identity canvas only during its visible window
      filters.push(`[id${idx}][vl${idx}]overlay=${position}:format=auto:${enable}[nm${idx}]`);
      // Blend identity+content composite with main canvas, both sides in RGB
      filters.push(`${canvasIn}format=gbrp[cf${idx}]`);
      filters.push(`[nm${idx}]format=gbrp[nf${idx}]`);
      filters.push(
        `[cf${idx}][nf${idx}]blend=all_mode=${ffBlend}:all_opacity=${entry.opacity.toFixed(6)}${canvasOut}`,
      );
    }
  });

  return filters;
}

// ==========================================
// 7. VI-B AUDIO FIDELITY HELPER
// ==========================================

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
  inp: AudioEntry,
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
// 8. SRT FILE WRITER
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
