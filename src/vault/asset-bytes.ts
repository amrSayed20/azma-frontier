/**
 * AZMA OS — WHERE AN ASSET'S BYTES ACTUALLY ARE
 *
 * A `secureStorageUri` is a web address («/uploads/x.png», «/generated-assets/
 * y.mp4»). Anything that must read the asset itself has to turn that into a
 * path on the host, and the rule for doing so is set by whoever WROTE the file
 * — `vault-asset-upload-storage.ts` and `qiyamah-generation/asset-storage.ts`,
 * both keyed on `UPLOADS_DIR`.
 *
 * MEASURED 2026-09-29: that rule existed as a private copy inside
 * `cinematic-ffmpeg-encoder.ts`, whose own comment said it was mirroring the
 * two writers. A rule kept in three places is a rule that will be corrected in
 * one. It lives here now, owned by the Vault, which owns assets — and the
 * encoder was pointed at it rather than given a fourth copy.
 */

import { open, stat } from 'fs/promises';
import { join } from 'path';

/** The host path that serves `secureStorageUri`, by the writers' own rule. */
export function resolveAssetPath(secureStorageUri: string): string {
  const uploadsDir = process.env.UPLOADS_DIR;
  const uploadsBase = uploadsDir ?? join(process.cwd(), 'public', 'uploads');
  const generatedBase = uploadsDir
    ? join(uploadsDir, 'generated-assets')
    : join(process.cwd(), 'public', 'generated-assets');
  if (secureStorageUri.startsWith('/uploads/')) {
    return join(uploadsBase, secureStorageUri.slice('/uploads/'.length));
  }
  if (secureStorageUri.startsWith('/generated-assets/')) {
    return join(generatedBase, secureStorageUri.slice('/generated-assets/'.length));
  }
  // ── AND THE FILMS THE EMPIRE RENDERS ITSELF ───────────────────────
  //
  //   MEASURED ON PRODUCTION 2026-10-12, by the acceptance campaign's own
  //   first lip-sync job: a Creator's finished film is addressed
  //   «/renders/op_render_….mp4», this resolver had never heard of that prefix,
  //   and the legacy fallback below sent it to `public/renders/…` where no
  //   file has ever been written. The runner reported «an input's bytes are
  //   not on the server» about an asset that was sitting on the server — so
  //   NO creative operation, edit, upscale or animation could ever be
  //   performed on a film the Empire itself produced.
  //
  //   The rule is the writer's own, not a guess:
  //   `cinematic-ffmpeg-encoder.ts` → `rendersDir()` → `$UPLOADS_DIR/renders`.
  if (secureStorageUri.startsWith('/renders/')) {
    const rendersBase = uploadsDir
      ? join(uploadsDir, 'renders')
      : join(process.cwd(), 'public', 'renders');
    return join(rendersBase, secureStorageUri.slice('/renders/'.length));
  }
  // Unknown URI scheme — legacy fallback, unchanged from the encoder's copy.
  return join(process.cwd(), 'public', secureStorageUri.replace(/^\//, ''));
}

/**
 * How much of a large file is read to learn two integers. A 400MB film is
 * never pulled into memory: everything a dimension reader needs is in one of
 * two bounded windows.
 */
export const WINDOW_BYTES = 1024 * 1024;

const ascii = (b: Uint8Array, at: number, len: number) =>
  String.fromCharCode(...b.subarray(at, at + len));
const u32be = (b: Uint8Array, at: number) =>
  ((b[at] << 24) | (b[at + 1] << 16) | (b[at + 2] << 8) | b[at + 3]) >>> 0;

/** Walks the top-level box chain; returns the end of `ftyp` and whether `moov` is present. */
function surveyBoxes(b: Uint8Array): { ftypEnd: number; hasMoov: boolean } {
  let at = 0;
  let ftypEnd = 0;
  let hasMoov = false;
  while (at + 8 <= b.length) {
    const size = u32be(b, at);
    const type = ascii(b, at + 4, 4);
    if (type === 'ftyp') ftypEnd = at + (size || 8);
    if (type === 'moov') { hasMoov = true; break; }
    if (size < 8) break;
    at += size;
  }
  return { ftypEnd, hasMoov };
}

/**
 * The bytes a dimension reader needs, or null when this asset cannot say.
 *
 * Small files are read whole. For a large one the head is read first, which is
 * complete for every image format and for any MP4 whose `moov` sits at the
 * front — the Empire's own encoder writes `-movflags +faststart`, so every
 * film it produces qualifies. A video uploaded from a Creator's device may
 * carry `moov` at the tail instead; that case reads a second window from the
 * end and splices the `moov` box behind the file's real `ftyp`, so the reader
 * receives a buffer that is a truthful, if abbreviated, MP4.
 *
 * Returns null when there is no such file, or it cannot be read. That is a
 * fact about the asset, not an error to raise: a Creator whose file is gone
 * must be told «لا نعرف مقاسه», not shown a crash.
 */
export async function readAssetHead(
  secureStorageUri: string,
  windowBytes: number = WINDOW_BYTES,
): Promise<Uint8Array | null> {
  const path = resolveAssetPath(secureStorageUri);
  let handle;
  try {
    const info = await stat(path);
    if (!info.isFile() || info.size === 0) return null;
    handle = await open(path, 'r');

    const headLen = Math.min(info.size, windowBytes);
    const head = Buffer.alloc(headLen);
    await handle.read(head, 0, headLen, 0);
    if (info.size <= windowBytes) return head;

    // Only an ISO base-media file can hide what we need past the window.
    if (ascii(head, 4, 4) !== 'ftyp') return head;
    const survey = surveyBoxes(head);
    if (survey.hasMoov) return head;

    const tailLen = Math.min(info.size, windowBytes);
    const tail = Buffer.alloc(tailLen);
    await handle.read(tail, 0, tailLen, info.size - tailLen);

    // Find a `moov` whose whole box lies inside this window.
    for (let at = 0; at + 8 <= tail.length; at += 1) {
      if (ascii(tail, at + 4, 4) !== 'moov') continue;
      const size = u32be(tail, at);
      if (size < 8 || at + size > tail.length) continue;
      const ftyp = head.subarray(0, survey.ftypEnd || 8);
      return Buffer.concat([ftyp, tail.subarray(at, at + size)]);
    }
    return head;
  } catch {
    return null;
  } finally {
    await handle?.close().catch(() => {});
  }
}
