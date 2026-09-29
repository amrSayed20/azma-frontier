/**
 * AZMA OS — AN ASSET KNOWS ITS OWN SIZE
 *
 * ─── WHY THIS EXISTS ────────────────────────────────────────────────────────
 *
 *   FOUNDER, 2026-09-29, on مكمن الغاية: «مقاس الأصل ليس ثابتا في جميع
 *   المنصات. فتفهم الحجرة النية ثم تقوم بتغير الابعاد لتتناسب مع المنصات
 *   المحددة من المستخدم».
 *
 *   `src/sovereign-model-selection/platform-adapter.ts` already decides that,
 *   and decides it correctly — same ratio reuses, same orientation reframes,
 *   an orientation change must be regenerated and paid for with the Creator's
 *   explicit approval. It takes exactly one input: the master asset's aspect
 *   ratio. MEASURED 2026-09-29: `vault_assets` has no width, no height, no
 *   aspect column, and nothing writes one into its metadata JSON. The engine
 *   has never been able to run because its one input does not exist.
 *
 * ─── WHY THE FILE'S OWN BYTES, AND NOTHING ELSE ─────────────────────────────
 *
 *   Three sources were possible and two are rejected outright:
 *
 *     · A provider's claim about what it generated — rejected. It is a
 *       promise, not a measurement, and it is absent for every uploaded file.
 *     · A request parameter kept from generation time — rejected for the same
 *       reason, and it is silently wrong the moment anything re-encodes.
 *     · The bytes on disk — accepted. It is the only source that is true of
 *       every asset however it arrived, and it cannot disagree with itself.
 *
 *   No dependency and no subprocess. `ffmpeg` exists on the host for the
 *   cinematic encoder, and `ffprobe` ships beside it, but spawning a process
 *   to learn two integers puts a process boundary on a read path and makes the
 *   answer depend on the host's PATH. These headers are small, fixed, and
 *   documented; reading them is arithmetic.
 *
 * ─── WHAT IT REFUSES TO DO ──────────────────────────────────────────────────
 *
 *   It returns `null` rather than a guess. A file it cannot parse, a truncated
 *   download, a format nobody taught it — all of these are UNKNOWN, and
 *   UNKNOWN is never zero and never a default ratio. The caller must be able
 *   to say «لا أعرف مقاس هذا الأصل» out loud, because the Chamber will have to
 *   say it to a Creator.
 */

import { identifyByBytes } from '../vault/upload-content-validation';

export interface PixelDimensions {
  readonly width: number;
  readonly height: number;
}

/** The formats this module can MEASURE. A subset of what the Vault accepts. */
export type AssetImageFormat = 'png' | 'jpeg' | 'webp' | 'gif' | 'mp4';

/** The Vault's own signature table decides the format; this maps it to a reader. */
const BY_MIME: Readonly<Record<string, AssetImageFormat>> = {
  'image/png': 'png',
  'image/jpeg': 'jpeg',
  'image/webp': 'webp',
  'image/gif': 'gif',
  'video/mp4': 'mp4',
  // MOV is ISO base media: the same tkhd walk reads it.
  'video/quicktime': 'mp4',
};

const u16be = (b: Uint8Array, at: number) => (b[at] << 8) | b[at + 1];
const u32be = (b: Uint8Array, at: number) =>
  ((b[at] << 24) | (b[at + 1] << 16) | (b[at + 2] << 8) | b[at + 3]) >>> 0;
const u24le = (b: Uint8Array, at: number) => b[at] | (b[at + 1] << 8) | (b[at + 2] << 16);
const u16le = (b: Uint8Array, at: number) => b[at] | (b[at + 1] << 8);
const ascii = (b: Uint8Array, at: number, len: number) =>
  String.fromCharCode(...b.subarray(at, at + len));

/**
 * The format these bytes actually are — asked of the Empire's ONE authority.
 *
 * ─── WHY THIS NO LONGER CARRIES ITS OWN TABLE ───────────────────────────────
 *
 *   It did, for exactly one build, and the Founder caught it on sight:
 *   «لماذا بنيت ثلاث محركات موجوده». He was right about this one.
 *   `src/vault/upload-content-validation.ts` has held the Empire's magic-number
 *   table all along — it is what decides whether an upload is admitted at all.
 *
 *   The second table was not merely redundant, it was WRONG where the first is
 *   not: it called every file carrying an `ftyp` box an MP4, so a HEIC photo
 *   from a phone would have been handed to an MP4 box walker. The Vault's table
 *   separates MP4, MOV, AVIF and HEIC by `ftyp` BRAND, which is the entire
 *   difficulty of that format family.
 *
 *   Null for anything this module cannot measure — including formats the Vault
 *   rightly accepts, such as WAV or WebM. A sound file has no pixel size, and
 *   saying so is the truthful answer, not a failure.
 */
export function detectFormat(bytes: Uint8Array): AssetImageFormat | null {
  if (bytes.length < 12) return null;
  const identity = identifyByBytes(bytes);
  return identity ? (BY_MIME[identity.mimeType] ?? null) : null;
}

/** PNG: the IHDR chunk is mandatory and is always first. */
function readPng(b: Uint8Array): PixelDimensions | null {
  if (b.length < 24 || ascii(b, 12, 4) !== 'IHDR') return null;
  return { width: u32be(b, 16), height: u32be(b, 20) };
}

/**
 * JPEG: walk the marker chain to any Start-Of-Frame.
 *
 * SOF0/1/2/… all carry height then width at the same offset. DHT (C4), DNL
 * (C8) and DAC (CC) share the C0..CF range and are NOT frame headers, so they
 * are skipped by name rather than by range.
 */
function readJpeg(b: Uint8Array): PixelDimensions | null {
  let i = 2;
  while (i + 9 < b.length) {
    if (b[i] !== 0xff) { i += 1; continue; }        // resync on padding
    const marker = b[i + 1];
    if (marker === 0xff) { i += 1; continue; }       // fill byte
    if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
    const length = u16be(b, i + 2);
    if (length < 2) return null;
    const isFrame = marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc;
    if (isFrame) return { height: u16be(b, i + 5), width: u16be(b, i + 7) };
    i += 2 + length;
  }
  return null;
}

/** WebP: three container shapes, each carrying the size in its own place. */
function readWebp(b: Uint8Array): PixelDimensions | null {
  const chunk = ascii(b, 12, 4);
  if (chunk === 'VP8X' && b.length >= 30) {
    return { width: u24le(b, 24) + 1, height: u24le(b, 27) + 1 };
  }
  if (chunk === 'VP8 ' && b.length >= 30) {
    // Lossy: a 3-byte start code precedes the 14-bit dimensions.
    return { width: u16le(b, 26) & 0x3fff, height: u16le(b, 28) & 0x3fff };
  }
  if (chunk === 'VP8L' && b.length >= 25) {
    // Lossless: 14 bits each, minus one, packed across four bytes.
    const bits = u32be(b, 21);
    const le = ((bits >>> 24) | ((bits >>> 8) & 0xff00) | ((bits << 8) & 0xff0000) | (bits << 24)) >>> 0;
    return { width: (le & 0x3fff) + 1, height: ((le >>> 14) & 0x3fff) + 1 };
  }
  return null;
}

/** GIF: the logical screen descriptor, little-endian, right after the header. */
function readGif(b: Uint8Array): PixelDimensions | null {
  if (b.length < 10) return null;
  return { width: u16le(b, 6), height: u16le(b, 8) };
}

/**
 * MP4 / MOV: the first video track's `tkhd`.
 *
 * Width and height live there as 16.16 fixed-point, and they are the
 * PRESENTATION size — which is what a platform cares about and what a viewer
 * sees. `tkhd` also carries a 3x3 display matrix; a phone video rotated 90°
 * stores landscape dimensions with a rotating matrix, and reporting that as
 * landscape would tell a Creator their portrait film is 16:9. The matrix is
 * read and the axes swapped when it rotates by a quarter turn.
 */
function readMp4(b: Uint8Array): PixelDimensions | null {
  const findBox = (start: number, end: number, name: string): [number, number] | null => {
    let at = start;
    while (at + 8 <= end) {
      let size = u32be(b, at);
      const type = ascii(b, at + 4, 4);
      let header = 8;
      if (size === 1) {
        // 64-bit size: the high word is zero for anything we can hold in memory.
        if (at + 16 > end) return null;
        size = u32be(b, at + 12);
        header = 16;
      } else if (size === 0) {
        size = end - at;
      }
      if (size < header) return null;
      if (type === name) return [at + header, Math.min(at + size, end)];
      at += size;
    }
    return null;
  };

  const moov = findBox(0, b.length, 'moov');
  if (!moov) return null;
  // Several traks: audio has a tkhd too, and its width/height are zero. The
  // first track with a real size is the visual one.
  let at = moov[0];
  while (at + 8 <= moov[1]) {
    const size = u32be(b, at) || (moov[1] - at);
    if (size < 8) return null;
    if (ascii(b, at + 4, 4) === 'trak') {
      const tkhd = findBox(at + 8, at + size, 'tkhd');
      if (tkhd) {
        const [s, e] = tkhd;
        const version = b[s];
        // version 0: 4-byte times; version 1: 8-byte. Then the 9-int matrix,
        // then width and height as the last two 32-bit fields of the box.
        const base = version === 1 ? s + 32 : s + 20;
        const matrixAt = base + 16;
        if (e >= matrixAt + 36 + 8) {
          const w = u32be(b, matrixAt + 36) / 65536;
          const h = u32be(b, matrixAt + 40) / 65536;
          if (w > 0 && h > 0) {
            // A quarter-turn matrix has a=d=0 and b,c non-zero.
            const a = u32be(b, matrixAt);
            const d = u32be(b, matrixAt + 16);
            const quarterTurn = a === 0 && d === 0;
            return quarterTurn
              ? { width: Math.round(h), height: Math.round(w) }
              : { width: Math.round(w), height: Math.round(h) };
          }
        }
      }
    }
    at += size;
  }
  return null;
}

/**
 * The asset's real pixel size, or null when these bytes cannot say.
 *
 * Null is a truthful answer and callers must carry it as one: never 0x0, never
 * a default ratio, never the size of something else.
 */
export function readDimensions(bytes: Uint8Array): PixelDimensions | null {
  const format = detectFormat(bytes);
  if (!format) return null;
  const read =
    format === 'png' ? readPng
    : format === 'jpeg' ? readJpeg
    : format === 'webp' ? readWebp
    : format === 'gif' ? readGif
    : readMp4;
  const d = read(bytes);
  if (!d) return null;
  // A parser that returns nonsense is a parser that failed.
  if (!Number.isFinite(d.width) || !Number.isFinite(d.height)) return null;
  if (d.width <= 0 || d.height <= 0) return null;
  return d;
}
