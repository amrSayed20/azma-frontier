'use client';

/**
 * AZMA OS — THE DRAWN SCENES.
 *
 * ─── WHY THESE EXIST ────────────────────────────────────────────────────────
 *
 *   FOUNDER, 2026-11-21: «لا تجعل المربعات فارغه املأها بالصور المبهره
 *   والهادئه».
 *
 *   They were four flat gradients. A coloured rectangle beside the words
 *   «what you can make here» promises a gallery and delivers a swatch.
 *
 * ─── AND WHY THEY ARE DRAWN, NOT PHOTOGRAPHED ──────────────────────────────
 *
 *   MEASURED: this Empire holds no production imagery it may publish.
 *   `public/generated-assets/` carries one deployment-verification
 *   screenshot; everything else lives in Creators' Vaults, and a Creator's
 *   asset is theirs, not ours. So the craft went into making the
 *   illustration beautiful rather than into making it look like a
 *   photograph of work we do not have — and the panel says so in as many
 *   words, right beneath these tiles.
 *
 *   Each scene is calm on purpose: a horizon, a ridge, still water, mist.
 *   Nothing moves, nothing flashes, and none of them depicts a person —
 *   a face here would be the one thing a viewer would try to read as real.
 *
 *   Inline SVG rather than files: no request leaves the Creator's browser
 *   to draw this page, and nothing here can fail to load.
 */
import type { ReactElement } from 'react';

export type SceneKind = 'image' | 'motion' | 'voice' | 'film';

/** Golden hour over dunes — warm, and the only scene lit from within. */
function Dunes(): ReactElement {
  return (
    <svg className="lp-scene" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="lp-sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1a1030" /><stop offset=".34" stopColor="#6b3d1c" />
          <stop offset=".56" stopColor="#d9913a" /><stop offset=".72" stopColor="#ffd98f" />
          <stop offset="1" stopColor="#8a5a1e" />
        </linearGradient>
        <radialGradient id="lp-sun" cx=".5" cy=".5">
          <stop offset="0" stopColor="#fffaea" /><stop offset=".34" stopColor="#ffe6a6" stopOpacity=".92" />
          <stop offset="1" stopColor="#ffb84d" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="300" height="400" fill="url(#lp-sky)" />
      <circle cx="150" cy="252" r="104" fill="url(#lp-sun)" />
      <circle cx="150" cy="252" r="27" fill="#fff6d6" opacity=".96" />
      <path d="M0 268 Q78 240 150 266 T300 258 V400 H0 Z" fill="#9a6520" opacity=".62" />
      <path d="M0 300 Q92 266 178 300 T300 292 V400 H0 Z" fill="#6b4114" opacity=".82" />
      <path d="M0 338 Q110 306 196 340 T300 332 V400 H0 Z" fill="#3b2109" />
      <path d="M0 376 Q120 352 210 378 T300 372 V400 H0 Z" fill="#1d1005" />
    </svg>
  );
}

/** Aurora over a ridge — the stillest way to draw movement. */
function Aurora(): ReactElement {
  return (
    <svg className="lp-scene" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="lp-night" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#090621" /><stop offset=".6" stopColor="#1b1152" /><stop offset="1" stopColor="#2a1a6e" />
        </linearGradient>
        <linearGradient id="lp-veil" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#18d7c4" stopOpacity="0" />
          <stop offset=".4" stopColor="#8f7bff" stopOpacity=".85" />
          <stop offset="1" stopColor="#e6b4ff" stopOpacity="0" />
        </linearGradient>
        <filter id="lp-soft"><feGaussianBlur stdDeviation="13" /></filter>
      </defs>
      <rect width="300" height="400" fill="url(#lp-night)" />
      <g filter="url(#lp-soft)" opacity=".95">
        <path d="M-20 150 Q80 60 160 140 T330 110" stroke="url(#lp-veil)" strokeWidth="46" fill="none" />
        <path d="M-20 215 Q90 130 180 205 T330 180" stroke="url(#lp-veil)" strokeWidth="30" fill="none" opacity=".7" />
        <path d="M-20 100 Q70 40 150 92 T330 70" stroke="#18d7c4" strokeWidth="16" fill="none" opacity=".35" />
      </g>
      <g fill="#fff8e2">
        <circle cx="48" cy="56" r="1.6" opacity=".85" /><circle cx="212" cy="40" r="1.2" opacity=".6" />
        <circle cx="266" cy="96" r="1.5" opacity=".7" /><circle cx="110" cy="30" r="1" opacity=".5" />
      </g>
      <path d="M0 312 L62 268 L116 310 L168 258 L232 316 L300 276 V400 H0 Z" fill="#0a0724" />
      <path d="M0 348 L74 318 L140 352 L210 312 L300 346 V400 H0 Z" fill="#050314" />
    </svg>
  );
}

/** Rings on still water — sound, drawn as the thing sound actually does. */
function Rings(): ReactElement {
  return (
    <svg className="lp-scene" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="lp-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#03201e" /><stop offset=".46" stopColor="#0b4d47" />
          <stop offset=".56" stopColor="#9ff0e4" /><stop offset="1" stopColor="#062e2b" />
        </linearGradient>
        <radialGradient id="lp-haze" cx=".5" cy=".55">
          <stop offset="0" stopColor="#eafff9" stopOpacity=".9" /><stop offset="1" stopColor="#18d7c4" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="300" height="400" fill="url(#lp-water)" />
      <ellipse cx="150" cy="222" rx="150" ry="54" fill="url(#lp-haze)" />
      <g fill="none" stroke="#dffaf4" strokeLinecap="round">
        <ellipse cx="150" cy="224" rx="26" ry="8" opacity=".95" strokeWidth="1.8" />
        <ellipse cx="150" cy="224" rx="56" ry="17" opacity=".66" strokeWidth="1.5" />
        <ellipse cx="150" cy="224" rx="92" ry="27" opacity=".42" strokeWidth="1.3" />
        <ellipse cx="150" cy="224" rx="132" ry="39" opacity=".24" strokeWidth="1.1" />
        <ellipse cx="150" cy="224" rx="176" ry="52" opacity=".12" strokeWidth="1" />
      </g>
      <rect y="236" width="300" height="164" fill="#04231f" opacity=".85" />
      <g stroke="#9ff0e4" strokeWidth="1" opacity=".3" fill="none">
        <path d="M0 262 Q70 254 150 262 T300 258" /><path d="M0 292 Q80 284 160 292 T300 288" />
        <path d="M0 326 Q74 318 152 326 T300 322" />
      </g>
    </svg>
  );
}

/** Light shafts through layered mist — depth, which is what a cut gives. */
function Shafts(): ReactElement {
  return (
    <svg className="lp-scene" viewBox="0 0 300 400" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <defs>
        <linearGradient id="lp-mist" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#140a2e" /><stop offset=".48" stopColor="#3a2360" />
          <stop offset=".72" stopColor="#b98a5e" /><stop offset="1" stopColor="#f3d6a8" />
        </linearGradient>
        <linearGradient id="lp-shaft" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffeec4" stopOpacity=".58" /><stop offset="1" stopColor="#ffeec4" stopOpacity="0" />
        </linearGradient>
        <filter id="lp-soft2"><feGaussianBlur stdDeviation="9" /></filter>
      </defs>
      <rect width="300" height="400" fill="url(#lp-mist)" />
      <circle cx="186" cy="118" r="34" fill="#fff4da" opacity=".9" />
      <circle cx="186" cy="118" r="62" fill="#ffe9bd" opacity=".16" filter="url(#lp-soft2)" />
      <g filter="url(#lp-soft2)" opacity=".5">
        <path d="M150 90 L104 400 L190 400 Z" fill="url(#lp-shaft)" />
        <path d="M210 96 L250 400 L186 400 Z" fill="url(#lp-shaft)" />
      </g>
      <path d="M0 236 L58 186 L106 232 L156 176 L214 240 L266 196 L300 228 V400 H0 Z" fill="#2c1b4c" opacity=".78" />
      <path d="M0 282 L70 236 L132 286 L198 232 L262 288 L300 262 V400 H0 Z" fill="#1b1033" opacity=".88" />
      <path d="M0 330 L84 290 L158 336 L236 288 L300 324 V400 H0 Z" fill="#0c0720" />
    </svg>
  );
}

const SCENES: Readonly<Record<SceneKind, () => ReactElement>> = {
  image: Dunes,
  motion: Aurora,
  voice: Rings,
  film: Shafts,
};

export function TileScene({ kind }: { readonly kind: SceneKind }): ReactElement {
  const Scene = SCENES[kind];
  return <Scene />;
}
