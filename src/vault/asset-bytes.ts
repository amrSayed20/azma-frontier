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
import { existsSync } from 'fs';
import { join } from 'path';

/**
 * ─── WHERE A PRIVATE FILM MAY BE WRITTEN, AND WHY IT IS NOT A FALLBACK ──────
 *
 *   Anything under `public/` is served by Next.js's own static handler, which
 *   runs BEFORE any route. The authorisation gate at `app/renders/[...path]`
 *   is therefore unreachable for a file sitting there. MEASURED on production
 *   before the gate existed: 25 finished films belonging to 7 Creators, each
 *   downloadable with no session and no cookie, and a proxy told to cache them.
 *
 *   `UPLOADS_DIR` is what moves the films out of that directory. The previous
 *   code treated its ABSENCE as a reason to fall back INTO `public/renders` —
 *   so a deployment that forgot one environment variable silently reopened the
 *   hole, and nothing would have said so. A security boundary that depends on
 *   remembering a variable is not a boundary.
 *
 *   So writing now FAILS CLOSED. A private render refuses to start rather than
 *   land where the gate cannot reach it. The only way to write into a publicly
 *   served directory is to say so explicitly, in a variable whose own name is
 *   the warning — and that mode exists for local work, never for a Creator's
 *   film on a public host.
 *
 *   READING is deliberately NOT symmetric. See resolveAssetPath below: the 28
 *   films already on production, and anything a legacy deployment left in
 *   `public/`, must keep resolving. Refusing to READ them would destroy access
 *   to real Creators' work in the name of protecting it.
 */
export const PUBLIC_RENDER_OUTPUT_OPT_IN = 'AZMA_ALLOW_PUBLIC_RENDER_OUTPUT';

export class RenderStorageNotConfiguredError extends Error {
  public readonly code = 'render-storage-not-configured';
  constructor() {
    super(
      'UPLOADS_DIR is not configured, so a finished film has nowhere private to be written. '
        + `Set UPLOADS_DIR to a directory outside public/, or set ${PUBLIC_RENDER_OUTPUT_OPT_IN}=1 `
        + 'to accept that renders will be served publicly without the authorisation gate.',
    );
    this.name = 'RenderStorageNotConfiguredError';
  }
}

/** True when this host has explicitly accepted publicly served render output. */
export function publicRenderOutputAllowed(): boolean {
  const raw = process.env[PUBLIC_RENDER_OUTPUT_OPT_IN];
  return raw === '1' || raw === 'true';
}

/**
 * The one directory a finished film may be written to.
 *
 * Throws `RenderStorageNotConfiguredError` when no private root is configured
 * and the public mode has not been explicitly accepted. Read at CALL time: an
 * environment variable frozen into a module constant has caused three separate
 * production defects in this repository.
 */
export function renderOutputDir(): string {
  const base = process.env.UPLOADS_DIR;
  if (base) return join(base, 'renders');
  if (publicRenderOutputAllowed()) return join(process.cwd(), 'public', 'renders');
  throw new RenderStorageNotConfiguredError();
}

/** The legacy location the same film may ALREADY occupy. Reading only. */
function legacyRenderDir(): string {
  return join(process.cwd(), 'public', 'renders');
}

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
    const name = secureStorageUri.slice('/renders/'.length);
    // The protected root first, because that is where every film written since
    // the gate exists. Then the legacy public location, because films predating
    // it are real Creators' work and must not become unreachable. Asked in that
    // order, a host that has both answers with the protected copy.
    const protectedPath = uploadsDir ? join(uploadsDir, 'renders', name) : null;
    if (protectedPath && existsSync(protectedPath)) return protectedPath;
    const legacyPath = join(legacyRenderDir(), name);
    if (existsSync(legacyPath)) return legacyPath;
    // Neither exists yet: name the protected one, so a caller that is about to
    // create it does not get pointed at `public/`.
    return protectedPath ?? legacyPath;
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
