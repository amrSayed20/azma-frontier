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
import type { CompiledAssemblyGraph } from '../../../../chambers/ras-al-amr/pre-publishing-boundary';
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

export function spawnEncoding(operationId: string, graph: CompiledAssemblyGraph): void {
  mkdirSync(RENDERS_DIR, { recursive: true });

  let args: string[];
  try {
    args = buildFfmpegArgs(graph, operationId);
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
  duration: number;
  startSec: number;
  nodeId: string;
  trackId: string;
}

function buildFfmpegArgs(graph: CompiledAssemblyGraph, operationId: string): string[] {
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

      if (isImageUri(uri)) {
        imageInputs.push({ path: assetPath, kind: 'image', duration, startSec, nodeId: node.nodeId, trackId: track.trackId });
      } else if (isAudioUri(uri)) {
        audioInputs.push({ path: assetPath, kind: 'audio', duration, startSec, nodeId: node.nodeId, trackId: track.trackId });
      }
      // Text/structural nodes (TXT etc.) carry no media — silently skipped
    }
  }

  if (imageInputs.length === 0) {
    throw new Error(
      `CINEMATIC encoder: no active image nodes found for operation [${operationId}]. ` +
        `A CINEMATIC canvas must contain at least one active image node to produce a video.`,
    );
  }

  // Sort image inputs by their position on the master timeline
  imageInputs.sort((a, b) => a.startSec - b.startSec);

  // Total duration: prefer compiled metadata; fall back to max node end time
  const totalDuration =
    graph.metadata.estimatedDurationSeconds ??
    Math.max(
      ...imageInputs.map((n) => n.startSec + n.duration),
      ...audioInputs.map((n) => n.startSec + n.duration),
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

  // Still-image inputs: loop each frame for exactly its playDurationSeconds
  imageInputs.forEach(({ path, duration }) => {
    args.push('-loop', '1', '-t', String(duration), '-i', path);
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

  // Audio chain
  let finalAudioLabel: string;
  if (audioInputs.length === 0) {
    // No audio nodes — generate silent stereo audio for the full duration
    filterParts.push(`aevalsrc=0:c=stereo:s=44100:d=${totalDuration}[aout]`);
    finalAudioLabel = '[aout]';
  } else if (audioInputs.length === 1) {
    const inp = audioInputs[0];
    const nodeMix = graph.mixPlan.nodeMixes.find((m) => m.nodeId === inp.nodeId);
    const trackMix = graph.mixPlan.trackMixes.find((m) => m.trackId === inp.trackId);
    const volDb = (nodeMix?.isMuted ? -120 : (nodeMix?.volumeDb ?? 0)) +
                  (trackMix?.isMuted ? -120 : (trackMix?.trackVolumeDb ?? 0));
    const volLinear = Math.pow(10, Math.max(volDb, -120) / 20);
    const startMs = Math.round(inp.startSec * 1000);
    filterParts.push(
      `[${audioInputStart}:a]adelay=${startMs}|${startMs},` +
        `volume=${volLinear.toFixed(6)},atrim=0:${totalDuration},asetpts=PTS-STARTPTS[aout]`,
    );
    finalAudioLabel = '[aout]';
  } else {
    // Multiple audio inputs — delay + volume per node, then amix
    audioInputs.forEach((inp, i) => {
      const nodeIdx = audioInputStart + i;
      const nodeMix = graph.mixPlan.nodeMixes.find((m) => m.nodeId === inp.nodeId);
      const trackMix = graph.mixPlan.trackMixes.find((m) => m.trackId === inp.trackId);
      const volDb = (nodeMix?.isMuted ? -120 : (nodeMix?.volumeDb ?? 0)) +
                    (trackMix?.isMuted ? -120 : (trackMix?.trackVolumeDb ?? 0));
      const volLinear = Math.pow(10, Math.max(volDb, -120) / 20);
      const startMs = Math.round(inp.startSec * 1000);
      filterParts.push(
        `[${nodeIdx}:a]adelay=${startMs}|${startMs},volume=${volLinear.toFixed(6)}[a${i}]`,
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
// 6. SRT FILE WRITER
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
