/**
 * AZMA OS — Ras Al-Amr: Cinematic Frame & Timing Contract
 *
 * RAS AL AMR EXECUTION DIRECTIVE — PHASE 1 (OUTPUT TRUTH): the single source
 * of truth for WHEN a node is seen or heard and WHERE a visual layer sits on
 * the 1920×1080 frame. Both the Creator's live preview (app/ras-amr/page.tsx)
 * and the FFmpeg encoder (cinematic-ffmpeg-encoder.ts) call these pure
 * functions, so the MP4 contains exactly what the preview showed.
 *
 * A real render proved four divergences before this module existed: the
 * preview crossfaded while the MP4 hard-cut, the preview centred a layer while
 * the MP4 pinned it to the top-left corner in pixels, the preview contained an
 * image while the MP4 stretched it to 1920×1080, and audio nodes were sequenced
 * as if they were scenes. Every rule below is the preview's existing behaviour
 * (Package XXXII coordinate contract, Package XXXV crossfade), written down once.
 *
 * Pure: no I/O, no DOM, no FFmpeg.
 */

import type { AssemblyNode, SpatialDirective, TemporalDirective } from './assembly-contracts';

export const OUTPUT_FRAME_WIDTH = 1920;
export const OUTPUT_FRAME_HEIGHT = 1080;
export const OUTPUT_FRAME_ASPECT = OUTPUT_FRAME_WIDTH / OUTPUT_FRAME_HEIGHT;
export const DEFAULT_PLAY_DURATION_SECONDS = 5;
export const DEFAULT_CROSSFADE_SECONDS = 0.5;

// ==========================================
// 1. SOURCE WINDOW (trim semantics)
// ==========================================

export interface SourceWindow {
  /** How long the node occupies the master timeline. */
  readonly playDurationSeconds: number;
  /** Non-destructive IN point inside the source media. */
  readonly sourceInSeconds: number;
  /** Non-destructive OUT point inside the source media. */
  readonly sourceOutSeconds: number;
  /** How long time-based media (audio, video) actually plays: never longer than the slot. */
  readonly activeDurationSeconds: number;
}

/**
 * Trims only mean something for time-based media. The IN point defaults to 0;
 * the OUT point defaults to IN + slot length, so a trimmed clip still fills its
 * slot instead of ending early. A still image ignores trims entirely and is
 * visible for its whole slot (the preview has always behaved this way).
 */
export function resolveSourceWindow(temporal?: Partial<TemporalDirective>): SourceWindow {
  const playDurationSeconds = Math.max(0.001, temporal?.playDurationSeconds ?? DEFAULT_PLAY_DURATION_SECONDS);
  const sourceInSeconds = Math.max(0, temporal?.trimStartSeconds ?? 0);
  const rawOut = temporal?.trimEndSeconds;
  const sourceOutSeconds =
    rawOut !== undefined && rawOut > sourceInSeconds ? rawOut : sourceInSeconds + playDurationSeconds;
  const activeDurationSeconds = Math.max(0.001, Math.min(playDurationSeconds, sourceOutSeconds - sourceInSeconds));
  return { playDurationSeconds, sourceInSeconds, sourceOutSeconds, activeDurationSeconds };
}

// ==========================================
// 2. VISUAL WINDOW (crossfade semantics)
// ==========================================

export interface VisualWindow {
  readonly startSeconds: number;
  readonly playDurationSeconds: number;
  /** First instant the layer is drawn (start minus its own fade-in). */
  readonly visibleStartSeconds: number;
  /** Last instant the layer is drawn (end plus the next sibling's fade-in). */
  readonly visibleEndSeconds: number;
  readonly fadeInSeconds: number;
  readonly fadeOutSeconds: number;
}

function crossfadeSeconds(temporal?: Partial<TemporalDirective>): number {
  if (temporal?.transitionInType !== 'crossfade') return 0;
  return Math.max(0, temporal.transitionInDurationSeconds ?? DEFAULT_CROSSFADE_SECONDS);
}

/**
 * Package XXXV crossfade, exactly as the preview has rendered it: a node whose
 * transition is 'crossfade' ramps 0→1 during the `d` seconds BEFORE its start,
 * and the visual node before it in the same group ramps 1→0 during the `d`
 * seconds AFTER its own end. Later layers sit on top, so the incoming layer
 * dissolves over the outgoing one with no blank frame.
 */
export function computeVisualWindow(
  temporal: Partial<TemporalDirective> | undefined,
  nextVisualSiblingTemporal: Partial<TemporalDirective> | undefined,
): VisualWindow {
  const startSeconds = Math.max(0, temporal?.globalStartTimeSeconds ?? 0);
  const { playDurationSeconds } = resolveSourceWindow(temporal);
  const requestedFadeIn = crossfadeSeconds(temporal);
  const visibleStartSeconds = Math.max(0, startSeconds - requestedFadeIn);
  const fadeInSeconds = startSeconds - visibleStartSeconds;
  const fadeOutSeconds = crossfadeSeconds(nextVisualSiblingTemporal);
  return {
    startSeconds,
    playDurationSeconds,
    visibleStartSeconds,
    visibleEndSeconds: startSeconds + playDurationSeconds + fadeOutSeconds,
    fadeInSeconds,
    fadeOutSeconds,
  };
}

/** Opacity multiplier (0..1) of a visual layer at master-timeline time `t`. */
export function visualOpacityAt(window: VisualWindow, t: number): number {
  if (t < window.visibleStartSeconds || t >= window.visibleEndSeconds) return 0;
  if (window.fadeInSeconds > 0 && t < window.startSeconds) {
    return Math.max(0, Math.min(1, (t - window.visibleStartSeconds) / window.fadeInSeconds));
  }
  const end = window.startSeconds + window.playDurationSeconds;
  if (window.fadeOutSeconds > 0 && t >= end) {
    return Math.max(0, Math.min(1, 1 - (t - end) / window.fadeOutSeconds));
  }
  return 1;
}

/**
 * For every visual node, the next VISUAL node in the same group (array order,
 * which is the order the Creator arranges with promote/demote). Audio nodes are
 * skipped: a music node between two images must never cancel their crossfade.
 */
export function mapNextVisualSiblings<T extends AssemblyNode>(
  tracks: readonly { readonly nodes: readonly T[] }[],
  isVisual: (node: T) => boolean,
): Map<string, T | undefined> {
  const next = new Map<string, T | undefined>();
  for (const track of tracks) {
    const visual = track.nodes.filter(isVisual);
    visual.forEach((node, index) => next.set(node.nodeId, visual[index + 1]));
  }
  return next;
}

/**
 * Stacking order shared by preview and encoder: zIndex ascending, then the
 * node's position in the canvas (group order, then node order). Later = on top.
 */
export function orderVisualLayers<T extends AssemblyNode>(
  tracks: readonly { readonly nodes: readonly T[] }[],
  isVisual: (node: T) => boolean,
): T[] {
  const ordered: { node: T; order: number }[] = [];
  let order = 0;
  for (const track of tracks) {
    for (const node of track.nodes) {
      if (isVisual(node)) ordered.push({ node, order: order++ });
    }
  }
  ordered.sort((a, b) => {
    const za = a.node.spatial?.zIndex ?? 0;
    const zb = b.node.spatial?.zIndex ?? 0;
    return za !== zb ? za - zb : a.order - b.order;
  });
  return ordered.map((entry) => entry.node);
}

// ==========================================
// 3. FRAME GEOMETRY (Package XXXII coordinate contract)
// ==========================================

export interface LayerGeometry {
  /** Layer box as a fraction of the frame, before rotation. */
  readonly widthFraction: number;
  readonly heightFraction: number;
  /** Layer centre as a fraction of the frame. */
  readonly centerXFraction: number;
  readonly centerYFraction: number;
  readonly rotationDegrees: number;
}

/**
 * Package XXXII: positionX/positionY are percentage-point offsets of the
 * layer's CENTRE from the frame centre. At scale 1 a layer is contained in the
 * 1920×1080 frame with its own aspect ratio preserved (never stretched); scaleX
 * and scaleY then multiply that contained box. `assetAspect` = width / height;
 * unknown aspect falls back to the full frame.
 */
export function computeLayerGeometry(
  spatial: Partial<SpatialDirective> | undefined,
  assetAspect?: number,
): LayerGeometry {
  const contained =
    assetAspect && Number.isFinite(assetAspect) && assetAspect > 0
      ? assetAspect >= OUTPUT_FRAME_ASPECT
        ? { w: 1, h: OUTPUT_FRAME_ASPECT / assetAspect }
        : { w: assetAspect / OUTPUT_FRAME_ASPECT, h: 1 }
      : { w: 1, h: 1 };
  return {
    widthFraction: contained.w * Math.max(0.001, spatial?.scaleX ?? 1),
    heightFraction: contained.h * Math.max(0.001, spatial?.scaleY ?? 1),
    centerXFraction: 0.5 + (spatial?.positionX ?? 0) / 100,
    centerYFraction: 0.5 + (spatial?.positionY ?? 0) / 100,
    rotationDegrees: spatial?.rotationDegrees ?? 0,
  };
}
