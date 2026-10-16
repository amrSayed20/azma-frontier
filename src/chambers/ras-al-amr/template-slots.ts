/**
 * AZMA OS — Ras Al-Amr: where a ready template places the next visual scene.
 *
 * A template is a grammar of slot durations plus a transition preference.
 * Slots run back to back, exactly as the template's own preview plays them;
 * a crossfade dissolves into the slot during the seconds before its start
 * (cinematic-timing.ts), so the slot keeps its full duration and the film's
 * length is the sum of its slots. Sound layers never take a slot.
 *
 * Pure: no I/O, no DOM.
 */

import type { AssemblyNode, SovereignCanvas, TemporalDirective } from './assembly-contracts';
import { DEFAULT_CROSSFADE_SECONDS, DEFAULT_PLAY_DURATION_SECONDS } from './cinematic-timing';

export interface TemplateSlotGrammar {
  transitionPreference: 'cut' | 'crossfade';
  transitionDurationSeconds?: number;
  slotDurations: readonly number[];
}

export type SoundNodeTest = (node: AssemblyNode) => boolean;

/** Where the visual scenes on the canvas end (sound layers ignored). */
export function visualScenesEnd(canvas: SovereignCanvas, isSoundNode: SoundNodeTest): number {
  return canvas.tracks
    .flatMap((t) => t.nodes)
    .filter((n) => !isSoundNode(n))
    .reduce(
      (acc, n) => Math.max(acc, (n.temporal?.globalStartTimeSeconds ?? 0) + (n.temporal?.playDurationSeconds ?? DEFAULT_PLAY_DURATION_SECONDS)),
      0,
    );
}

/** Timing for the next visual scene added under a template. */
export function computeTemplateSlotTemporal(
  template: TemplateSlotGrammar,
  canvas: SovereignCanvas,
  isSoundNode: SoundNodeTest,
): TemporalDirective {
  const slotIndex = canvas.tracks.flatMap((t) => t.nodes).filter((n) => !isSoundNode(n)).length;
  const slotDuration = slotIndex < template.slotDurations.length
    ? template.slotDurations[slotIndex]
    : DEFAULT_PLAY_DURATION_SECONDS;
  const useCrossfade = template.transitionPreference === 'crossfade' && slotIndex > 0;
  const fadeSeconds = Math.min(template.transitionDurationSeconds ?? DEFAULT_CROSSFADE_SECONDS, slotDuration / 2);
  return {
    globalStartTimeSeconds: visualScenesEnd(canvas, isSoundNode),
    playDurationSeconds: slotDuration,
    trimStartSeconds: undefined,
    trimEndSeconds: undefined,
    transitionInType: useCrossfade ? 'crossfade' : 'cut',
    transitionInDurationSeconds: useCrossfade ? fadeSeconds : undefined,
  };
}
