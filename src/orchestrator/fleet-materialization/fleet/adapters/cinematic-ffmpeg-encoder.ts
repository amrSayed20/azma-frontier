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

import { spawn } from 'node:child_process';
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
      };

      if (isImageUri(uri)) {
        stillInputs.push({ ...base, kind: 'image' });
      } else if (isVideoUri(uri)) {
        videoInputs.push({ ...base, kind: 'video' });
      } else if (isAudioUri(uri)) {
        audioFileInputs.push({
          ...base,
          kind: 'audio',
          positionX: 0, positionY: 0, scaleX: 1, scaleY: 1, rotationDegrees: 0, zIndex: 0,
          opacity: 1, blendMode: 'NORMAL', framingMode: 'contain',
        });
      }
      // Text/structural nodes carry no media — silently skipped
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
    });
  }

  // XLII: For video nodes whose audio is NOT muted, extract audio from the video
  // stream itself as an additional audio entry.  No new -i argument is added —
  // the existing video input already carries the audio stream at [inputIdx:a].
  const videoAudioEntries: NodeEntry[] = [];
  for (const vidEntry of videoInputs) {
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
  allVisualInputs.sort((a, b) =>
    a.zIndex !== b.zIndex ? a.zIndex - b.zIndex : a.nodeId.localeCompare(b.nodeId),
  );

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
  stillInputs.forEach(({ path, effectiveDuration }) => {
    args.push('-loop', '1', '-t', String(effectiveDuration), '-i', path);
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
    const endSec = node.startSec + node.effectiveDuration;
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
    const scaleFilter = node.framingMode === 'cover'
      ? `scale=${targetW}:${targetH}:force_original_aspect_ratio=increase,crop=${targetW}:${targetH}`
      : node.framingMode === 'fill'
        ? `scale=${targetW}:${targetH}`
        : `scale=${targetW}:${targetH}:force_original_aspect_ratio=decrease,pad=${targetW}:${targetH}:(ow-iw)/2:(oh-ih)/2:color=black`;

    if (node.kind === 'video') {
      // VIDEO: trim source to [trimStart, trimEnd], normalise PTS, then shift to output position S.
      // This makes the clip play from its own frame 0 starting at output time S.
      const videoParts: string[] = [
        `trim=${node.trimStart.toFixed(6)}:${node.trimEnd.toFixed(6)}`,
        `setpts=PTS-STARTPTS+(${startSec.toFixed(6)}/TB)`,
        scaleFilter,
        'format=rgba',
      ];
      if (hasRotation) {
        videoParts.splice(3, 0, `rotate=${rotRad.toFixed(6)}:fillcolor=0x00000000`);
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
      if (node.opacity < 0.9999) {
        parts.push(`colorchannelmixer=aa=${node.opacity.toFixed(6)}`);
      }
      filters.push(`${ffStreamRef}${parts.join(',')}[vn${idx}]`);
      filters.push(
        `${canvasIn}[vn${idx}]overlay=x=${ffmpegX}:y=${ffmpegY}` +
          `:format=auto:enable='between(t,${startSec},${endSec})'${canvasOut}`,
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

      filters.push(
        `color=c=${identityColor}:size=${outW}x${outH}:rate=25:d=${totalDuration}[id${idx}]`,
      );

      const layerParts: string[] = [scaleFilter];
      if (hasRotation) {
        layerParts.push(`rotate=${rotRad.toFixed(6)}:fillcolor=${rotFillcolor}`);
      }
      filters.push(`${ffStreamRef}${layerParts.join(',')}[vl${idx}]`);

      filters.push(
        `[id${idx}][vl${idx}]overlay=x=${ffmpegX}:y=${ffmpegY}` +
          `:enable='between(t,${startSec},${endSec})'[nm${idx}]`,
      );

      filters.push(
        `${canvasIn}[nm${idx}]blend=all_mode=${ffBlend}:all_opacity=${node.opacity.toFixed(6)}${canvasOut}`,
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
