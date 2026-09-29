/**
 * AZMA OS — A PLATFORM NAME BECOMES A RECTANGLE
 *
 * ─── THE ONE MISSING LINK ───────────────────────────────────────────────────
 *
 *   FOUNDER, 2026-09-29: «مقاس الأصل ليس ثابتا في جميع المنصات... فتقوم بتغير
 *   الابعاد لتتناسب مع المنصات المحددة من المستخدم».
 *
 *   MEASURED the same day: every piece of that road already existed and one
 *   link was missing. `platform-adapter.ts` knows each platform's ratio and
 *   decides reuse/reframe/regenerate. `cinematic-ffmpeg-encoder.ts` knows how
 *   to scale and crop to a rectangle, and has produced real films doing it.
 *   NOBODY translated a platform's NAME into that rectangle.
 *
 *   That is all this file is. It invents no ratio — every one comes from
 *   `resolvePlatformDimensions` — and it invents no resolution: the three
 *   rectangles are the encoder's own `PROFILE_DIMENSIONS`, so a reframed file
 *   is exactly the size the Empire's own productions already are.
 */

import { resolvePlatformDimensions } from '../sovereign-model-selection/platform-adapter';

export interface PlatformTarget {
  /** The platform as the Creator named it. */
  readonly platform: string;
  /** Its name in the Creator's own tongue, for anything shown on screen. */
  readonly label: string;
  /** The ratio `platform-adapter.ts` holds for it. */
  readonly aspectRatio: string;
  readonly width: number;
  readonly height: number;
  /** The encoder's profile name for this rectangle. */
  readonly outputProfile: 'landscape' | 'portrait' | 'square';
}

/**
 * The three rectangles the Empire produces at, keyed by ratio.
 *
 * These are `cinematic-ffmpeg-encoder.ts`'s own PROFILE_DIMENSIONS — not a
 * second opinion about what 16:9 means. A ratio outside these three has no
 * rectangle here and resolves to null rather than to the nearest guess.
 */
const RECTANGLE_BY_RATIO: Readonly<Record<string, { w: number; h: number; profile: PlatformTarget['outputProfile'] }>> = {
  '16:9': { w: 1920, h: 1080, profile: 'landscape' },
  '9:16': { w: 1080, h: 1920, profile: 'portrait' },
  '1:1':  { w: 1080, h: 1080, profile: 'square' },
};

/** The platforms the Empire can currently reframe for — every one with a rectangle. */
export function reframablePlatforms(): readonly string[] {
  return ['youtube', 'tiktok', 'instagram', 'instagram-story', 'instagram-reel',
    'facebook', 'x', 'linkedin', 'snapchat']
    .filter((p) => resolveTarget(p) !== null);
}

/**
 * What this platform wants, in pixels — or null when the Empire cannot say.
 *
 * Null for an unknown platform, and null for a known platform whose ratio the
 * Empire has no rectangle for. The caller must treat both as «لا نستطيع
 * تجهيزه لهذه المنصّة» and never fall back to a default shape: a Creator told
 * their portrait film fits YouTube has been lied to.
 */
export function resolveTarget(platform: string): PlatformTarget | null {
  const dimensions = resolvePlatformDimensions(platform);
  if (!dimensions) return null;
  const rectangle = RECTANGLE_BY_RATIO[dimensions.aspectRatio];
  if (!rectangle) return null;
  return {
    platform: platform.toLowerCase(),
    label: dimensions.label,
    aspectRatio: dimensions.aspectRatio,
    width: rectangle.w,
    height: rectangle.h,
    outputProfile: rectangle.profile,
  };
}
