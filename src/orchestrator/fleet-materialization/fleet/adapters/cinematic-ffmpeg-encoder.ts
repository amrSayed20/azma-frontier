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
 * Output paths:
 *   public/renders/<operationId>.mp4   — final MP4
 *   public/renders/<operationId>.srt   — temporary SRT (when subtitles present)
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

const RENDERS_DIR = join(process.cwd(), 'public', 'renders');
const OUTPUT_WIDTH = 1920;
const OUTPUT_HEIGHT = 1080;

const IMAGE_EXTS = new Set(['.jpg', '.jpeg', '.png', '.webp', '.gif']);
const AUDIO_EXTS = new Set(['.mp3', '.wav', '.ogg', '.m4a', '.aac', '.flac']);

function resolveAssetPath(secureStorageUri: string): string {
  return join(process.cwd(), 'public', secureStorageUri.replace(/^\//, ''));
}

function getExt(uri: string): string {
  const dot = uri.lastIndexOf('.');
  return dot >= 0 ? uri.slice(dot).toLowerCase() : '';
}

function isImageUri(uri: string): boolean {
  return IMAGE_EXTS.has(getExt(uri));
}

function isAudioUri(uri: string): boolean {
  return AUDIO_EXTS.has(getExt(uri));
}

export function getOutputPath(operationId: string): string {
  return join(RENDERS_DIR, `${operationId}.mp4`);
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
  mkdirSync(RENDERS_DIR, { recursive: true });

  let args: string[];
  try {
    args = buildFfmpegArgs(graph, operationId, resolvedVoicePaths);
  } catch (err) {
    // Graph validation or asset resolution failed before spawn.
    // Store the error so checkOperationStatus() can surface it honestly.
    jobs.set(operationId, err instanceof Error ? err : new Error(String(err)));
    return;
  }

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

interface NodeEntry {
  path: string;
  kind: 'image' | 'audio';
  duration: number;            // playDurationSeconds (declared slot on timeline)
  startSec: number;            // globalStartTimeSeconds
  nodeId: string;
  trackId: string;
  trimStart: number;           // VI-B: effective trim start in source media (seconds)
  trimEnd: number;             // VI-B: effective trim end in source media (seconds)
  effectiveDuration: number;   // VI-B: trimEnd - trimStart (always ≥ 0.001)
}

function buildFfmpegArgs(
  graph: CompiledAssemblyGraph,
  operationId: string,
  resolvedVoicePaths: ReadonlyMap<string, string> = new Map(),
): string[] {
  const outputPath = getOutputPath(operationId);
  const imageInputs: NodeEntry[] = [];
  const audioInputs: NodeEntry[] = [];

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

      if (isImageUri(uri)) {
        imageInputs.push({ path: assetPath, kind: 'image', duration, startSec, nodeId: node.nodeId, trackId: track.trackId, trimStart, trimEnd, effectiveDuration });
      } else if (isAudioUri(uri)) {
        audioInputs.push({ path: assetPath, kind: 'audio', duration, startSec, nodeId: node.nodeId, trackId: track.trackId, trimStart, trimEnd, effectiveDuration });
      }
      // Text/structural nodes (TXT etc.) carry no media — silently skipped
    }
  }

  // VI-A: Add voice-assigned audio entries.
  // For each image node that has a resolved voice secureStorageUri, add an audio
  // input that starts at the same globalStartTimeSeconds as the image node.
  // The voice entry inherits the image node's nodeId/trackId so it picks up the
  // same volumeDb/isMuted mix settings from mixPlan. Missing files are skipped
  // gracefully — they never throw or abort the encode.
  for (const imgEntry of imageInputs) {
    const voiceUri = resolvedVoicePaths.get(imgEntry.nodeId);
    if (!voiceUri) continue;
    const voicePath = resolveAssetPath(voiceUri);
    if (!existsSync(voicePath)) {
      console.warn(
        `[CinematicEncoder] voice file missing at [${voicePath}] for node [${imgEntry.nodeId}] — skipping`,
      );
      continue;
    }
    audioInputs.push({
      path: voicePath,
      kind: 'audio',
      duration: imgEntry.duration,
      startSec: imgEntry.startSec,
      nodeId: imgEntry.nodeId,
      trackId: imgEntry.trackId,
      trimStart: imgEntry.trimStart,
      trimEnd: imgEntry.trimEnd,
      effectiveDuration: imgEntry.effectiveDuration,
    });
  }

  if (imageInputs.length === 0) {
    throw new Error(
      `CINEMATIC encoder: no active image nodes found for operation [${operationId}]. ` +
        `A CINEMATIC canvas must contain at least one active image node to produce a video.`,
    );
  }

  // Sort image inputs by their position on the master timeline
  imageInputs.sort((a, b) => a.startSec - b.startSec);

  // Total duration: prefer compiled metadata; fall back to max effective node end time (VI-B)
  const totalDuration =
    graph.metadata.estimatedDurationSeconds ??
    Math.max(
      ...imageInputs.map((n) => n.startSec + n.effectiveDuration),
      ...audioInputs.map((n) => n.startSec + n.effectiveDuration),
      1,
    );

  if (totalDuration <= 0) {
    throw new Error(
      `CINEMATIC encoder: computed duration is ${totalDuration}s. ` +
        `Image nodes must have temporal directives with positive playDurationSeconds.`,
    );
  }

  const args: string[] = ['-y'];

  // --- INPUTS ---

  // Still-image inputs: loop each frame for exactly its effectiveDuration (VI-B: respects trim)
  imageInputs.forEach(({ path, effectiveDuration }) => {
    args.push('-loop', '1', '-t', String(effectiveDuration), '-i', path);
  });

  // Audio inputs: standard file read
  const audioInputStart = imageInputs.length;
  audioInputs.forEach(({ path }) => {
    args.push('-i', path);
  });

  // --- FILTER_COMPLEX ---
  const filterParts: string[] = [];

  // Scale + letterbox each image to OUTPUT_WIDTH × OUTPUT_HEIGHT
  imageInputs.forEach((_, idx) => {
    filterParts.push(
      `[${idx}:v]scale=${OUTPUT_WIDTH}:${OUTPUT_HEIGHT}:force_original_aspect_ratio=decrease,` +
        `pad=${OUTPUT_WIDTH}:${OUTPUT_HEIGHT}:(ow-iw)/2:(oh-ih)/2,setsar=1,fps=25[img${idx}]`,
    );
  });

  // Concat all scaled images into a single video stream
  const imgRefs = imageInputs.map((_, idx) => `[img${idx}]`).join('');
  filterParts.push(`${imgRefs}concat=n=${imageInputs.length}:v=1:a=0[vraw]`);

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

  // Audio chain — VI-B: trim, fade, pan now consumed via buildAudioNodeFilter()
  let finalAudioLabel: string;
  if (audioInputs.length === 0) {
    // No audio nodes — generate silent stereo audio for the full duration
    filterParts.push(`aevalsrc=0:c=stereo:s=44100:d=${totalDuration}[aout]`);
    finalAudioLabel = '[aout]';
  } else if (audioInputs.length === 1) {
    const inp = audioInputs[0];
    const nodeMix = graph.mixPlan.nodeMixes.find((m) => m.nodeId === inp.nodeId);
    const trackMix = graph.mixPlan.trackMixes.find((m) => m.trackId === inp.trackId);
    filterParts.push(
      buildAudioNodeFilter(inp, audioInputStart, totalDuration, nodeMix, trackMix) + '[aout]',
    );
    finalAudioLabel = '[aout]';
  } else {
    // Multiple audio inputs — each gets full VI-B fidelity treatment, then amix
    audioInputs.forEach((inp, i) => {
      const nodeIdx = audioInputStart + i;
      const nodeMix = graph.mixPlan.nodeMixes.find((m) => m.nodeId === inp.nodeId);
      const trackMix = graph.mixPlan.trackMixes.find((m) => m.trackId === inp.trackId);
      filterParts.push(
        buildAudioNodeFilter(inp, nodeIdx, totalDuration, nodeMix, trackMix) + `[a${i}]`,
      );
    });
    const amixRefs = audioInputs.map((_, i) => `[a${i}]`).join('');
    filterParts.push(
      `${amixRefs}amix=inputs=${audioInputs.length}:normalize=0,` +
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
// 6. VI-B TEMPORAL & AUDIO FIDELITY HELPERS
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
  const srtPath = join(RENDERS_DIR, `${operationId}.srt`);
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
