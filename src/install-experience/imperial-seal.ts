/**
 * AZMA OS - THE IMPERIAL SEAL, AS COORDINATES
 *
 * --- WHY THIS IS NOT INSIDE `seal-icon.tsx` ---------------------------------
 *
 *   The seal has two consumers that cannot both reach a JSX module: the Next
 *   renderer, which turns it into a favicon and an app icon, and the Empire
 *   itself, which must be able to EXPORT the mark as a file - a 1024 square
 *   for TikTok, for an app store, for whatever asks next.
 *
 *   Drawing it twice would give the Empire two marks that look alike until the
 *   day one of them is edited. So the mark lives here, framework-free, and
 *   `seal-icon.tsx` is a wrapper that renders it. There is one seal.
 *
 *   The history of what this replaced is recorded in that wrapper.
 */

// The Empire's gold, ranged so a raised surface can turn in the light.
const FACE_HI = '#FBF0C4';
const FACE = '#E8C65A';
const FACE_MID = '#C9A227';
const EDGE = '#8A6B12';
const EDGE_DEEP = '#4A3A08';
const GROUND_TOP = '#101A2E';
export const GROUND_BOT = '#05080F';

/** The crown's silhouette, in its own 0…200 × -5…110 space. Centre: (100, 52). */
const CROWN_PATHS = [
  '<path d="M15,92 L15,36 L47,64 L72,22 L100,8 L128,22 L153,64 L185,36 L185,92 Z"/>',
  '<rect x="8" y="92" width="184" height="18" rx="5"/>',
  '<circle cx="15" cy="30" r="8"/>',
  '<circle cx="72" cy="16" r="7"/>',
  '<circle cx="100" cy="4" r="9"/>',
  '<circle cx="128" cy="16" r="7"/>',
  '<circle cx="185" cy="30" r="8"/>',
].join('');

/** رُبع الحِزب — two squares, one turned a quarter. */
function octagram(cx: number, cy: number, r: number, width: number, opacity: number): string {
  return [Math.PI / 4, 0]
    .map((rotation) => {
      const points = [0, 1, 2, 3]
        .map((i) => {
          const a = (Math.PI / 2) * i + rotation;
          return `${(cx + r * Math.cos(a)).toFixed(2)},${(cy + r * Math.sin(a)).toFixed(2)}`;
        })
        .join(' ');
      return `<polygon points="${points}" fill="none" stroke="${FACE}" stroke-width="${width}" opacity="${opacity}"/>`;
    })
    .join('');
}

/**
 * The crown, raised.
 *
 * Depth is N copies of the same silhouette, each a step further along the
 * light's axis in a gold that darkens with distance, with the lit face last
 * and on top. A blurred shadow would have detached the mark from its ground;
 * this gives it a side.
 */
function crown(scale: number, depth: number, step: number): string {
  const x = 50 - 100 * scale;
  const y = 50 - 52 * scale;
  const sides: string[] = [];
  for (let i = depth; i >= 1; i -= 1) {
    const colour = i / depth > 0.55 ? EDGE_DEEP : EDGE;
    sides.push(
      `<g transform="translate(${(x + i * step).toFixed(2)},${(y + i * step).toFixed(2)}) scale(${scale})" fill="${colour}">${CROWN_PATHS}</g>`,
    );
  }
  return `${sides.join('')}<g transform="translate(${x.toFixed(2)},${y.toFixed(2)}) scale(${scale})" fill="url(#face)" stroke="${EDGE}" stroke-width="2.5" stroke-linejoin="round">${CROWN_PATHS}</g>`;
}

/** The machine beneath the throne. Deterministic — the seal never shifts. */
function circuitry(): string {
  const parts: string[] = [];
  for (let i = 0; i < 14; i += 1) {
    const y = (i * 17) % 100;
    const x0 = (i * 29) % 100;
    const run = 9 + ((i * 7) % 24);
    const turn = ((i * 7) % 3) - 1;
    parts.push(
      `<path d="M${x0},${y} h${run} l${turn * 4},${turn * 4} h${(run / 2).toFixed(1)}" fill="none" stroke="${FACE}" stroke-width="0.5" opacity="0.14"/>`,
      `<circle cx="${x0}" cy="${y}" r="0.8" fill="${FACE}" opacity="0.22"/>`,
    );
  }
  return parts.join('');
}

/** The whole seal as one SVG document, at whatever detail the size can carry. */
export function sealSvg(size: number): string {
  const full = size >= 96;
  const ringed = size >= 64;
  return [
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">',
    '<defs>',
    `<radialGradient id="ground" cx="50%" cy="38%" r="78%"><stop offset="0%" stop-color="${GROUND_TOP}"/><stop offset="100%" stop-color="${GROUND_BOT}"/></radialGradient>`,
    `<linearGradient id="face" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${FACE_HI}"/><stop offset="48%" stop-color="${FACE}"/><stop offset="100%" stop-color="${FACE_MID}"/></linearGradient>`,
    '</defs>',
    '<rect width="100" height="100" fill="url(#ground)"/>',
    full ? circuitry() : '',
    octagram(50, 50, ringed ? 40 : 44, ringed ? 1 : 1.6, ringed ? 0.58 : 0.7),
    ringed ? octagram(50, 50, 29, 0.4, 0.3) : '',
    ringed ? crown(0.3, 5, 0.34) : crown(0.4, 3, 0.5),
    '</svg>',
  ].join('');
}
