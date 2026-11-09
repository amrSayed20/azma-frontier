/**
 * AZMA OS — RAS AL AMR: THE CREATOR CAN TAKE A STEP BACK.
 *
 * ─── WHY THIS IS A FEW PURE FUNCTIONS AND NOT A REACT HOOK ──────────────────
 *
 *   Every creative change in the workshop already passes through ONE place:
 *   `commit(next: SovereignCanvas)`. Description, visual demand, order, a
 *   scene added or removed, duration, transition, an asset attached or
 *   detached — all of them hand that function a whole new immutable canvas.
 *
 *   So the history is not a log of actions to replay. It is a stack of
 *   canvases, and «undo» is simply the previous one. That makes it testable
 *   without a browser, which is the point: a rule nobody can run is a rule
 *   nobody checks.
 *
 * ─── WHAT UNDO MUST NEVER DO, BY THE FOUNDER'S DIRECTIVE ────────────────────
 *
 *   «ألا يؤدي التراجع إلى حذف أصل سيادي أو إفساد عملية إنتاج جارية.»
 *
 *   Neither is possible from here, and both are structural rather than
 *   promised:
 *
 *     · A canvas REFERENCES sovereign assets by id; it never owns their
 *       bytes. Stepping back to an earlier canvas detaches a reference at
 *       most. The asset stays in the Vault, paid for and the Creator's.
 *     · This module holds no production state and cannot cancel one. The
 *       workshop refuses to step back WHILE a production runs — see
 *       `canStepBack` — because a canvas that changes under a commission
 *       would attach its picture to a scene that no longer asked for it.
 */
import type { SovereignCanvas } from './assembly-contracts';

/** How many steps back a Creator may take. */
export const HISTORY_DEPTH = 40 as const;

export interface StoryboardHistory {
  /** Older canvases, oldest first. The last entry is one step back. */
  readonly past: readonly SovereignCanvas[];
  /** Canvases stepped away from, newest first. */
  readonly future: readonly SovereignCanvas[];
}

export const EMPTY_HISTORY: StoryboardHistory = { past: [], future: [] };

/**
 * A new change was made. The canvas that WAS current becomes the step back,
 * and anything stepped away from is gone — a new branch replaces it, which is
 * what every editor does and what a Creator expects.
 */
export function remember(
  history: StoryboardHistory,
  current: SovereignCanvas | null,
): StoryboardHistory {
  if (!current) return history;
  const past = [...history.past, current];
  return {
    // Trimmed from the OLD end: the steps a Creator reaches for are the
    // recent ones, and an unbounded stack of whole canvases is a leak.
    past: past.length > HISTORY_DEPTH ? past.slice(past.length - HISTORY_DEPTH) : past,
    future: [],
  };
}

export interface Step {
  readonly canvas: SovereignCanvas;
  readonly history: StoryboardHistory;
}

/** One step back, or null when there is nowhere to go. */
export function stepBack(
  history: StoryboardHistory,
  current: SovereignCanvas | null,
): Step | null {
  if (history.past.length === 0 || !current) return null;
  const canvas = history.past[history.past.length - 1]!;
  return {
    canvas,
    history: {
      past: history.past.slice(0, -1),
      future: [current, ...history.future],
    },
  };
}

/** One step forward again, or null when there is nowhere to go. */
export function stepForward(
  history: StoryboardHistory,
  current: SovereignCanvas | null,
): Step | null {
  if (history.future.length === 0 || !current) return null;
  const canvas = history.future[0]!;
  return {
    canvas,
    history: {
      past: [...history.past, current],
      future: history.future.slice(1),
    },
  };
}

/**
 * Whether a step may be taken at all.
 *
 * A production in flight is the one thing that forbids it: a commission is
 * already carrying a scene id, and a canvas that moves underneath it would
 * attach the finished picture to a scene that no longer asked for it — or to
 * no scene at all.
 */
export function canStepBack(history: StoryboardHistory, productionInFlight: boolean): boolean {
  return !productionInFlight && history.past.length > 0;
}

export function canStepForward(history: StoryboardHistory, productionInFlight: boolean): boolean {
  return !productionInFlight && history.future.length > 0;
}

/**
 * Every asset id the canvas still points at. Used to prove that a step back
 * never strands a sovereign asset: the Vault keeps what it was paid for
 * whether a canvas references it or not.
 */
export function referencedAssetIds(canvas: SovereignCanvas): ReadonlySet<string> {
  const ids = new Set<string>();
  for (const track of canvas.tracks) {
    for (const node of track.nodes) {
      if (typeof node.assetId === 'string' && node.assetId.length > 0) ids.add(node.assetId);
    }
  }
  return ids;
}
