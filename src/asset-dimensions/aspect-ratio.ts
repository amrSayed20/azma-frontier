/**
 * AZMA OS — PIXELS INTO THE WORD THE ADAPTER SPEAKS
 *
 * `platform-adapter.ts` compares aspect ratios as STRINGS:
 *
 *     if (masterAspectRatio === targetAspectRatio) return 'direct-reuse';
 *
 * So a 1920×1080 film must arrive as exactly `'16:9'` — the same characters
 * YouTube's entry carries — or the adapter will never say an asset fits a
 * platform it plainly fits, and the Chamber will offer to charge a Creator for
 * a regeneration they do not need.
 *
 * ─── WHY SNAPPING, AND WHY A STATED TOLERANCE ───────────────────────────────
 *
 *   1920×1080 reduces to 16:9 by arithmetic alone. 1918×1080 reduces to
 *   959:540 — a true ratio, a useless word. Encoders, crops and a provider's
 *   own rounding produce sizes that are 16:9 to any eye and not to a divisor,
 *   so a ratio within one percent of a canonical family IS that family, and
 *   one percent is narrow enough that no two families in this table can be
 *   confused: the closest pair is 3:2 (1.5000) and 16:10 (1.6000), six percent
 *   apart.
 *
 *   Outside every family the exact reduced ratio is returned instead. It is
 *   still true, and the adapter will treat it by orientation, which is the
 *   correct conservative answer for a shape the Empire has no name for.
 */

import type { PixelDimensions } from './read-dimensions';

/** Within this relative distance of a family's value, a ratio IS that family. */
export const FAMILY_TOLERANCE = 0.01;

/**
 * The shapes the Empire names. Every ratio used by `PLATFORM_MAP` is here —
 * 16:9, 9:16 and 1:1 — beside the ones Creators actually upload and produce.
 */
export const CANONICAL_FAMILIES: readonly string[] = [
  '21:9', '16:9', '16:10', '3:2', '4:3', '5:4', '1:1',
  '4:5', '3:4', '2:3', '10:16', '9:16',
];

function valueOf(family: string): number {
  const [w, h] = family.split(':').map(Number);
  return w / h;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

/**
 * The aspect ratio of these pixels, as the word the adapter speaks.
 *
 * Returns null for dimensions that cannot have a ratio, so a caller can never
 * hand `getOrientation` a string it would silently read as 'landscape'.
 */
export function toAspectRatio(d: PixelDimensions | null): string | null {
  if (!d) return null;
  const { width, height } = d;
  if (!Number.isFinite(width) || !Number.isFinite(height)) return null;
  if (width <= 0 || height <= 0) return null;

  const value = width / height;
  let best: { family: string; distance: number } | null = null;
  for (const family of CANONICAL_FAMILIES) {
    const distance = Math.abs(value - valueOf(family)) / valueOf(family);
    if (distance <= FAMILY_TOLERANCE && (!best || distance < best.distance)) {
      best = { family, distance };
    }
  }
  if (best) return best.family;

  const w = Math.round(width);
  const h = Math.round(height);
  const divisor = gcd(w, h) || 1;
  return `${w / divisor}:${h / divisor}`;
}
