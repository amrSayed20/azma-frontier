'use client';

/**
 * AZMA OS — A DESTINATION'S OWN MARK, IN THE EMPIRE'S OWN COLOUR.
 *
 * ─── WHAT WAS THERE, AND WHY IT WAS NOT ENOUGH ──────────────────────────────
 *
 *   Each destination was drawn as a generic geometric glyph — ◈ ✈ ▶ ❖ ◉ ♪.
 *   They are tidy and they belong to nobody: a Creator scanning a list of
 *   destinations cannot tell YouTube from Facebook by a ▶ beside a ❖. A mark
 *   that has to be read is not a mark.
 *
 * ─── AND WHY NOT THE BRANDS' OWN COLOURS ────────────────────────────────────
 *
 *   «بالروز الخاصه بها ولكن بهويه المنصه» — the Founder, 2026-11-13. The
 *   SHAPE is what carries recognition; the colour is what carries ownership.
 *   Six brand colours scattered through a gold chamber would make the room
 *   belong to them. So every mark is drawn in `currentColor` and inherits the
 *   gold of whatever it sits in — recognisable at a glance, and unmistakably
 *   inside this Empire.
 *
 *   Drawn, not fetched: no logo file is downloaded from a provider, no
 *   request leaves the Creator's browser to render a list of destinations,
 *   and nothing here can fail to load.
 */
import React from 'react';

/** One path per destination, in a 24×24 box, drawn in the inherited colour. */
const PATHS: Readonly<Record<string, string>> = {
  youtube:
    'M23 12s0-3.9-.5-5.8a3 3 0 0 0-2.1-2.1C18.5 3.5 12 3.5 12 3.5s-6.5 0-8.4.6A3 3 0 0 0 1.5 6.2 '
    + 'C1 8.1 1 12 1 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.6 8.4.6 8.4.6s6.5 0 8.4-.6a3 3 0 0 0 '
    + '2.1-2.1C23 15.9 23 12 23 12ZM9.8 15.6V8.4l6.2 3.6-6.2 3.6Z',
  'facebook-page':
    'M22 12.06C22 6.5 17.52 2 12 2S2 6.5 2 12.06c0 5 3.66 9.15 8.44 9.94v-7.03H7.9v-2.91h2.54V9.85 '
    + 'c0-2.52 1.49-3.91 3.78-3.91 1.09 0 2.24.2 2.24.2v2.46h-1.26c-1.24 0-1.63.78-1.63 1.57v1.89h2.78 '
    + 'l-.45 2.91h-2.33V22c4.78-.79 8.43-4.94 8.43-9.94Z',
  'instagram-business':
    'M12 2.16c3.2 0 3.58.01 4.85.07 1.17.05 1.8.25 2.23.41.56.22.96.48 1.38.9.42.42.68.82.9 1.38 '
    + '.16.42.36 1.06.41 2.23.06 1.27.07 1.65.07 4.85s-.01 3.58-.07 4.85c-.05 1.17-.25 1.8-.41 2.23 '
    + '-.22.56-.48.96-.9 1.38-.42.42-.82.68-1.38.9-.42.16-1.06.36-2.23.41-1.27.06-1.65.07-4.85.07 '
    + 's-3.58-.01-4.85-.07c-1.17-.05-1.8-.25-2.23-.41-.56-.22-.96-.48-1.38-.9-.42-.42-.68-.82-.9-1.38 '
    + '-.16-.42-.36-1.06-.41-2.23-.06-1.27-.07-1.65-.07-4.85s.01-3.58.07-4.85c.05-1.17.25-1.8.41-2.23 '
    + '.22-.56.48-.96.9-1.38.42-.42.82-.68 1.38-.9.42-.16 1.06-.36 2.23-.41 1.27-.06 1.65-.07 4.85-.07Z '
    + 'M12 7.38a4.62 4.62 0 1 0 0 9.24 4.62 4.62 0 0 0 0-9.24Zm0 7.62a3 3 0 1 1 0-6 3 3 0 0 1 0 6Z '
    + 'M17.84 7.2a1.08 1.08 0 1 1-2.16 0 1.08 1.08 0 0 1 2.16 0Z',
  tiktok:
    'M16.6 5.82A4.28 4.28 0 0 1 15.54 3h-3.09v12.4a2.59 2.59 0 1 1-1.84-2.48V9.74a5.72 5.72 0 1 0 '
    + '4.93 5.66V9.4a7.3 7.3 0 0 0 4.26 1.36V7.67a4.28 4.28 0 0 1-3.2-1.85Z',
  telegram:
    'M21.9 4.3 18.8 19c-.23 1.03-.85 1.28-1.72.8l-4.75-3.5-2.3 2.2c-.25.26-.47.47-.95.47l.34-4.83 '
    + '8.78-7.93c.38-.34-.08-.53-.6-.19L6.78 13.2 2.1 11.73c-1.02-.32-1.04-1.02.21-1.5L20.6 3.1 '
    + 'c.85-.31 1.6.2 1.3 1.2Z',
  'telegram-user':
    'M21.9 4.3 18.8 19c-.23 1.03-.85 1.28-1.72.8l-4.75-3.5-2.3 2.2c-.25.26-.47.47-.95.47l.34-4.83 '
    + '8.78-7.93c.38-.34-.08-.53-.6-.19L6.78 13.2 2.1 11.73c-1.02-.32-1.04-1.02.21-1.5L20.6 3.1 '
    + 'c.85-.31 1.6.2 1.3 1.2Z',
  'google-drive':
    'M7.71 3.5h8.58l6.21 10.75h-8.58L7.71 3.5ZM6.5 4.6 1.5 13.3l4.29 7.2 5-8.7L6.5 4.6Z '
    + 'M7.07 15.25h15.43L18.2 22.5H2.78l4.29-7.25Z',
};

/** The Arabic name of each destination, for anyone who cannot see the mark. */
const NAMES: Readonly<Record<string, string>> = {
  youtube: 'يوتيوب',
  'facebook-page': 'فيسبوك',
  'instagram-business': 'إنستجرام',
  tiktok: 'تيك توك',
  telegram: 'تيليجرام',
  'telegram-user': 'تيليجرام بحسابك',
  'google-drive': 'جوجل درايف',
};

export interface DestinationMarkProps {
  readonly provider: string;
  readonly size?: number;
}

export default function DestinationMark({ provider, size = 18 }: DestinationMarkProps) {
  const d = PATHS[provider];
  const name = NAMES[provider] ?? 'وجهة';

  // A destination this Empire has no mark for is NOT drawn as some other
  // destination's mark. It keeps a neutral lozenge and its own name.
  if (!d) {
    return <span className="makman-mark" role="img" aria-label={name}>◈</span>;
  }

  return (
    <svg
      className="makman-mark-svg"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      // THE WHOLE POINT: the shape is theirs, the colour is ours. It takes
      // the gold of whatever it sits in and never carries a brand colour.
      fill="currentColor"
      role="img"
      aria-label={name}
      focusable="false"
    >
      <path d={d} />
    </svg>
  );
}
