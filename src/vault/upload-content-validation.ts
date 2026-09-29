/**
 * AZMA OS — Sovereign Vault: what a file actually IS, not what it claims to be.
 *
 * ─── WHAT WAS MEASURED, ON THE SHIPPED UPLOAD ROUTE ─────────────────────────
 *
 *   The entire type decision was one line:
 *
 *       MIME_CAPABILITY_MAP.find((entry) => mimeType.startsWith(entry.prefix))
 *
 *   and `mimeType` was `file.type` — a string the BROWSER supplies and the
 *   uploader fully controls. Nothing ever looked at the bytes. So any content
 *   at all could be stored as an image by declaring `image/avif`, and the
 *   filename decided the extension.
 *
 *   That was the link that made the whole chain work: open self-service signup
 *   → upload arbitrary bytes labelled as an image → the file is served on a
 *   public path → an unauthenticated request hands it to the image decoder.
 *   Upgrading Next and sharp closes the decoder holes that were known on the
 *   day of the audit. This file closes the door those holes were reached
 *   through, so the next decoder CVE is not automatically an exposure again.
 *
 * ─── HOW A FILE IS IDENTIFIED HERE ──────────────────────────────────────────
 *
 *   By signature — the magic bytes every container format begins with. The
 *   declared MIME type and the filename extension are then required to AGREE
 *   with what the bytes say. Disagreement is a rejection, never a correction:
 *   a file whose bytes say one thing and whose name says another is not a
 *   mistake to be tidied up, it is the shape of an attack.
 *
 * ─── WHAT IS DELIBERATELY NOT ACCEPTED ──────────────────────────────────────
 *
 *   AVIF and HEIC are refused outright. They are the formats that reach
 *   libheif, which is where sharp's heap-corruption advisories live
 *   (GHSA-rgj7-g3m4-5g8c), and no part of this Empire has ever needed them.
 *   Refusing a format nobody uses removes a decoder from the attack surface at
 *   no cost to any Creator. SVG is refused for a different reason: it is a
 *   document that executes script, not a picture, and serving one from the
 *   Creator's own origin would be stored cross-site scripting.
 */

/** What the bytes turned out to be. */
export interface ContentIdentity {
  /** The canonical MIME type, decided by the bytes alone. */
  readonly mimeType: string;
  /** The extension this Empire stores such a file under. Leading dot. */
  readonly extension: string;
  /** Extensions a Creator may legitimately have named this file with. */
  readonly allowedExtensions: readonly string[];
}

export type ValidationRejection =
  /** Nothing recognised the leading bytes. */
  | 'unrecognised-content'
  /** Recognised, but this Empire does not accept that format. */
  | 'unsupported-format'
  /** The bytes and the declared type disagree. */
  | 'declared-type-mismatch'
  /** The bytes and the filename extension disagree. */
  | 'extension-mismatch'
  /** Nothing to inspect. */
  | 'empty-file'
  /** Larger than the ceiling. */
  | 'file-too-large';

export type ValidationOutcome =
  | { readonly ok: true; readonly identity: ContentIdentity }
  | { readonly ok: false; readonly rejection: ValidationRejection };

/** A resource ceiling, unchanged from the route this replaces. */
export const MAX_UPLOAD_BYTES = 50 * 1024 * 1024;

interface Signature {
  readonly mimeType: string;
  readonly extension: string;
  readonly allowedExtensions: readonly string[];
  /** Bytes that must match at `offset`. */
  readonly magic: readonly number[];
  readonly offset: number;
  /** For ISO-BMFF containers, the brand that follows `ftyp` at byte 8. */
  readonly ftypBrands?: readonly string[];
}

const ASCII = (text: string): number[] => [...text].map((c) => c.charCodeAt(0));

/**
 * Ordered most specific first. ISO-BMFF entries are checked by brand, because
 * MP4, MOV, AVIF and HEIC share the same `ftyp` header and differ only there —
 * which is exactly how a HEIC would otherwise arrive dressed as a video.
 */
const SIGNATURES: readonly Signature[] = [
  // ── Images the Empire accepts ──
  { mimeType: 'image/png',  extension: '.png',  allowedExtensions: ['.png'],
    magic: [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a], offset: 0 },
  { mimeType: 'image/jpeg', extension: '.jpg',  allowedExtensions: ['.jpg', '.jpeg'],
    magic: [0xff, 0xd8, 0xff], offset: 0 },
  { mimeType: 'image/gif',  extension: '.gif',  allowedExtensions: ['.gif'],
    magic: ASCII('GIF8'), offset: 0 },
  // RIFF....WEBP — the WEBP tag at byte 8 is what separates it from WAV/AVI.
  { mimeType: 'image/webp', extension: '.webp', allowedExtensions: ['.webp'],
    magic: ASCII('WEBP'), offset: 8 },

  // ── Audio ──
  { mimeType: 'audio/wav',  extension: '.wav',  allowedExtensions: ['.wav'],
    magic: ASCII('WAVE'), offset: 8 },
  { mimeType: 'audio/mpeg', extension: '.mp3',  allowedExtensions: ['.mp3'],
    magic: ASCII('ID3'), offset: 0 },
  { mimeType: 'audio/mpeg', extension: '.mp3',  allowedExtensions: ['.mp3'],
    magic: [0xff, 0xfb], offset: 0 },
  { mimeType: 'audio/ogg',  extension: '.ogg',  allowedExtensions: ['.ogg', '.oga'],
    magic: ASCII('OggS'), offset: 0 },
  { mimeType: 'audio/flac', extension: '.flac', allowedExtensions: ['.flac'],
    magic: ASCII('fLaC'), offset: 0 },

  // ── Video ──
  { mimeType: 'video/mp4',  extension: '.mp4',  allowedExtensions: ['.mp4', '.m4v'],
    magic: ASCII('ftyp'), offset: 4,
    ftypBrands: ['isom', 'iso2', 'mp41', 'mp42', 'avc1', 'M4V ', 'dash'] },
  { mimeType: 'video/quicktime', extension: '.mov', allowedExtensions: ['.mov'],
    magic: ASCII('ftyp'), offset: 4, ftypBrands: ['qt  '] },
  { mimeType: 'video/webm', extension: '.webm', allowedExtensions: ['.webm'],
    magic: [0x1a, 0x45, 0xdf, 0xa3], offset: 0 },
];

/**
 * Formats recognised on sight and refused on purpose.
 *
 * Naming them separately from "unrecognised" matters: a Creator who uploads a
 * HEIC photo from a phone deserves to be told the format is not accepted,
 * which is true, rather than that their file is corrupt, which is not.
 */
const REFUSED_BRANDS: readonly string[] = [
  'avif', 'avis',                       // AV1 image — reaches libheif
  'heic', 'heix', 'hevc', 'hevx', 'heim', 'heis', 'hevm', 'hevs', 'mif1', 'msf1',
];

const ARABIC_REJECTION: Readonly<Record<ValidationRejection, string>> = {
  'empty-file': 'الملفّ فارغ.',
  'file-too-large': 'الملفّ أكبر من الحدّ المسموح به.',
  'unrecognised-content': 'تعذّر التعرّف على نوع هذا الملفّ من محتواه.',
  'unsupported-format': 'هذه الصيغة غير مقبولة. استعمل PNG أو JPEG أو WebP للصور.',
  'declared-type-mismatch': 'محتوى الملفّ لا يطابق نوعه المُعلن.',
  'extension-mismatch': 'امتداد الملفّ لا يطابق محتواه.',
};

/**
 * What the Creator is told. Says what to do, and never names a decoder, a
 * library, a signature table or an advisory — the same rule the chamber's
 * failure vocabulary follows.
 */
export function rejectionSpokenAr(rejection: ValidationRejection): string {
  return ARABIC_REJECTION[rejection];
}

function matchesAt(bytes: Uint8Array, magic: readonly number[], offset: number): boolean {
  if (bytes.length < offset + magic.length) return false;
  for (let i = 0; i < magic.length; i += 1) {
    if (bytes[offset + i] !== magic[i]) return false;
  }
  return true;
}

/** The four-character brand of an ISO-BMFF container, or null if it is not one. */
function ftypBrandOf(bytes: Uint8Array): string | null {
  if (!matchesAt(bytes, ASCII('ftyp'), 4)) return null;
  if (bytes.length < 12) return null;
  return String.fromCharCode(bytes[8], bytes[9], bytes[10], bytes[11]);
}

/** Lowercased extension including the dot, or '' when the name carries none. */
export function extensionOf(fileName: string): string {
  const lastDot = fileName.lastIndexOf('.');
  if (lastDot === -1) return '';
  return fileName.slice(lastDot).toLowerCase();
}

/**
 * Identify a file by its leading bytes, then require its declared type and its
 * name to agree.
 *
 * `declaredMimeType` and `fileName` are attacker-controlled and are never
 * trusted to decide anything — they are only ever checked for agreement with
 * what the bytes already established.
 */
/**
 * What these bytes ARE, decided by the bytes alone — or null.
 *
 * ─── ONE TABLE OF MAGIC NUMBERS IN THE EMPIRE ───────────────────────────────
 *
 *   Lifted out of `validateUploadContent` on 2026-09-29, unchanged, because a
 *   second caller appeared: `src/asset-dimensions/read-dimensions.ts` needs to
 *   know a file's format before it can read its size, and it had written its
 *   own detector — a second, poorer table that called every `ftyp` file an
 *   MP4, so a HEIC photo would have been handed to an MP4 box walker.
 *
 *   The Founder, 2026-09-29: «لماذا بنيت ثلاث محركات موجوده». He was right
 *   about this one. SIGNATURES already distinguishes MP4 from MOV, AVIF and
 *   HEIC by `ftyp` brand, which is the whole difficulty. Extending the
 *   authority costs one export; duplicating it costs a divergence nobody sees
 *   until a Creator uploads the file that exposes it.
 *
 *   It answers only about SIGNED formats. Plain text and JSON carry no
 *   signature and are still decided by `validateUploadContent`, where the
 *   declared type is part of the evidence.
 */
export function identifyByBytes(bytes: Uint8Array): ContentIdentity | null {
  const brand = ftypBrandOf(bytes);
  for (const signature of SIGNATURES) {
    if (!matchesAt(bytes, signature.magic, signature.offset)) continue;
    if (signature.ftypBrands) {
      if (brand === null || !signature.ftypBrands.includes(brand)) continue;
    }
    return {
      mimeType: signature.mimeType,
      extension: signature.extension,
      allowedExtensions: signature.allowedExtensions,
    };
  }
  return null;
}

export function validateUploadContent(
  bytes: Uint8Array,
  declaredMimeType: string,
  fileName: string,
): ValidationOutcome {
  if (bytes.length === 0) return { ok: false, rejection: 'empty-file' };
  if (bytes.length > MAX_UPLOAD_BYTES) return { ok: false, rejection: 'file-too-large' };

  // A format we recognise and refuse is reported as refused, not as unknown.
  const brand = ftypBrandOf(bytes);
  if (brand !== null && REFUSED_BRANDS.includes(brand.toLowerCase().trim() || brand)) {
    return { ok: false, rejection: 'unsupported-format' };
  }
  // SVG is a script-bearing document, not a picture. Checked by prefix because
  // it is text and carries no binary signature.
  const head = Buffer.from(bytes.slice(0, 256)).toString('utf-8').trimStart().toLowerCase();
  if (head.startsWith('<svg') || (head.startsWith('<?xml') && head.includes('<svg'))) {
    return { ok: false, rejection: 'unsupported-format' };
  }

  let identity: ContentIdentity | null = identifyByBytes(bytes);

  // Plain text and JSON carry no signature. They are accepted only when the
  // bytes decode as UTF-8 without control characters — which is a real check
  // on the content, not a shrug at the declared type.
  if (identity === null && (declaredMimeType.startsWith('text/') || declaredMimeType === 'application/json')) {
    if (isPlainTextual(bytes)) {
      const isJson = declaredMimeType === 'application/json';
      identity = {
        mimeType: isJson ? 'application/json' : 'text/plain',
        extension: isJson ? '.json' : '.txt',
        allowedExtensions: isJson ? ['.json'] : ['.txt', '.md', '.csv'],
      };
    }
  }

  if (identity === null) return { ok: false, rejection: 'unrecognised-content' };

  // The declared type must agree with the bytes. Compared by family so that a
  // browser reporting 'audio/mp3' or 'image/jpg' is not punished for a spelling
  // the standard never settled — but an image declared as a video still fails.
  const declaredFamily = declaredMimeType.split('/')[0]?.toLowerCase() ?? '';
  const actualFamily = identity.mimeType.split('/')[0];
  if (declaredMimeType.length > 0 && declaredFamily !== actualFamily) {
    return { ok: false, rejection: 'declared-type-mismatch' };
  }

  // The name must agree too. An absent extension is allowed — the Empire
  // supplies the right one — but a stated extension that contradicts the bytes
  // is refused rather than silently rewritten.
  const named = extensionOf(fileName);
  if (named.length > 0 && !identity.allowedExtensions.includes(named)) {
    return { ok: false, rejection: 'extension-mismatch' };
  }

  return { ok: true, identity };
}

/** Whether these bytes are text a person could read, rather than a binary. */
function isPlainTextual(bytes: Uint8Array): boolean {
  const sample = bytes.slice(0, 4096);
  for (const byte of sample) {
    // Control characters other than tab, newline and carriage return mean this
    // is a binary wearing a text/* label.
    if (byte < 0x09) return false;
    if (byte > 0x0d && byte < 0x20) return false;
  }
  try {
    new TextDecoder('utf-8', { fatal: true }).decode(sample);
    return true;
  } catch {
    return false;
  }
}
