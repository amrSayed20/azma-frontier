import { ImageResponse } from 'next/og';

/**
 * AZMA OS — THE IMPERIAL SEAL
 *
 * ─── WHAT THIS REPLACED, AND WHY IT HAD TO ──────────────────────────────────
 *
 *   Until 2026-10-08 this function drew the CJK character 徵 in a gold ring,
 *   and that mark was the Empire's face in every browser tab, every installed
 *   app, and — the day it was noticed — the public icon about to be submitted
 *   to TikTok. The Founder: «فهى لا تمت للمنصه بصله ولا حتى تحمل حرفا من
 *   اسمها». A sovereign Arabic platform does not sign itself in a script that
 *   is not its own.
 *
 *   The glyph is REMOVED, not covered. Nothing here renders text at all now.
 *
 * ─── WHY THE MARK IS DRAWN, NOT TYPESET ─────────────────────────────────────
 *
 *   The replacement is a crown standing inside رُبع الحِزب — the eight-pointed
 *   seal, two squares crossed, geometry that belongs to this platform's own
 *   world rather than borrowed from another's. Both are PATHS.
 *
 *   That is deliberate. A typeset mark depends on a font being present in the
 *   renderer, and `ImageResponse` has no font the Empire did not hand it; the
 *   old 徵 survived only because a CJK face happened to be reachable. A mark
 *   made of coordinates renders identically everywhere, forever, with nothing
 *   to ship alongside it.
 *
 * ─── AND WHY IT IS NOT ONE DRAWING AT EVERY SIZE ────────────────────────────
 *
 *   This is called at 32, 180, 192 and 512. A 32px favicon given the full
 *   emblem — circuitry, two rings, a crown with five jewels — is not a small
 *   emblem, it is a smudge. So detail is SPENT BY SIZE: below 96px the
 *   circuitry goes, below 64px the inner ring goes too and the crown grows to
 *   fill what they left. The mark stays recognisable at a tab's width because
 *   at that width it is a simpler mark.
 */

import { sealSvg, GROUND_BOT } from './imperial-seal';

export function renderSealIcon(size: number): ImageResponse {
  // Satori renders no `<svg>` child of its own, but it renders an image —
  // so the seal travels as a data URI rather than as elements.
  const source = `data:image/svg+xml;base64,${Buffer.from(sealSvg(size)).toString('base64')}`;
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: GROUND_BOT,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={source} alt="" width={size} height={size} />
      </div>
    ),
    { width: size, height: size },
  );
}
