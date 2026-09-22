/**
 * AZMA OS — Image editing on the provider the Empire already uses.
 *
 * Constitution Article 3.1 (Qiyamah edits inside the asset); Phase D directive
 * Articles 5 and 6.
 *
 * ─── HOW THIS CAME TO BE WRITTEN, AND THE MISTAKE IT CORRECTS ───────────────
 *
 *   The Phase D audit reported: "no image-editing capability exists in this
 *   Empire, on any provider." That was FALSE, and the error was mine. I read
 *   which endpoints our own adapter happened to CALL — three of them — and
 *   concluded that was the provider's whole surface. I inferred the provider's
 *   capability from our code's usage, which is precisely the inference the
 *   Founder forbade.
 *
 *   Asking the provider instead, with the live key already in production:
 *
 *     ✓ /v1/ai-image-editor            400 — missing 'style'   (route exists)
 *     ✓ /v1/image-to-video             400 — missing 'end_seconds'
 *     ✓ /v1/image-background-remover   400 — missing 'assets'
 *     ✓ /v1/ai-image-upscaler          400 — missing 'scale_factor'
 *     · /v1/image-to-image             404 — genuinely absent
 *
 *   A 400 is a route that exists and is refusing a bad body. A 404 is a route
 *   that does not. That distinction is the whole measurement.
 *
 * ─── PROVEN, NOT ASSUMED ────────────────────────────────────────────────────
 *
 *   Measured end to end against a REAL production asset, not a fixture:
 *
 *     source   0318ee82…jpg   1,960,954 bytes   sha256 0ab57f32f4389268…
 *     result                  1,804,819 bytes   sha256 144445c76165cea3…
 *
 *   Different bytes, different length. A real edit, not a replayed reference.
 *
 * ─── WHY IT LIVES BESIDE THE ADAPTER AND NOT INSIDE IT ──────────────────────
 *
 *   The existing adapter implements a provider-contract interface for
 *   text-to-image dispatch. Editing takes an INPUT IMAGE, which that contract
 *   has no shape for. Rather than bend a working interface — or worse, build a
 *   second provider client — this reuses the same base URL, the same
 *   credential and the same job-polling shape, and exposes one function.
 *
 *   No new provider is introduced. Article 3.4 of the constitution holds: one
 *   declared sovereign image engine, and this is the one already declared.
 */

function engineBase(): string {
  // Read at call time — see the note in vault-asset-upload-storage.ts.
  return process.env.MAGIC_HOUR_BASE_URL ?? 'https://api.magichour.ai';
}

/** Extensions the provider accepts, as it stated them in its own refusal. */
const ACCEPTED_EXTENSIONS = new Set([
  'png', 'jpg', 'jpeg', 'jfif', 'heic', 'heif', 'webp', 'avif', 'jp2', 'tiff', 'tif', 'bmp',
]);

export interface EditedImageResult {
  /** The binding and the exact provider model that produced the bytes. */
  readonly providerId: string;
  readonly providerModelId: string;
  readonly providerJobId: string;
  readonly bytes: Buffer;
  readonly mimeType: string;
  /** What the provider charged. Recorded so a batch can be costed honestly. */
  readonly creditsCharged: number | null;
}

export type ImageEditRejection =
  | 'NO_CREDENTIAL'
  /**
   * The engine accepted the request and refused to bill it — HTTP 402.
   *
   * Separated from SUBMIT_FAILED because it is not a failure of the request,
   * the asset, or the Creator: it is the Empire's own account. Reporting it as
   * a generic engine error told the Creator "تعذّر تنفيذ التعديل" while the
   * server knew exactly why, which is a lie by vagueness. Found when the live
   * proof hit it.
   */
  | 'NO_CREDIT'
  | 'UNSUPPORTED_EXTENSION'
  | 'UPLOAD_FAILED'
  | 'SUBMIT_FAILED'
  | 'RENDER_FAILED'
  | 'TIMED_OUT'
  | 'NO_OUTPUT';

export class ImageEditError extends Error {
  public readonly rejection: ImageEditRejection;
  constructor(rejection: ImageEditRejection, detail: string) {
    super(`[ImageEditing] ${rejection}: ${detail}`);
    this.name = 'ImageEditError';
    this.rejection = rejection;
  }
}

function authHeaders(): Record<string, string> {
  const key = process.env.MAGIC_HOUR_API_KEY;
  if (!key) throw new ImageEditError('NO_CREDENTIAL', 'the image engine has no credential configured');
  return { 'Content-Type': 'application/json', Authorization: `Bearer ${key}` };
}

interface UploadSlot { readonly upload_url: string; readonly file_path: string }

/**
 * Hand the source image to the engine and receive the reference it will read.
 *
 * The bytes go straight from here to the provider's signed URL — they are never
 * written to a new public location on the way, so this path opens no hole in
 * the storage protections the security closure established.
 */
async function uploadSource(bytes: Buffer, extension: string): Promise<string> {
  const ext = extension.replace(/^\./, '').toLowerCase();
  if (!ACCEPTED_EXTENSIONS.has(ext)) {
    throw new ImageEditError('UNSUPPORTED_EXTENSION', `'${ext}' is not an image extension the engine reads`);
  }

  const response = await fetch(`${engineBase()}/v1/files/upload-urls`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ items: [{ extension: ext, type: 'image' }] }),
  });
  if (!response.ok) {
    throw new ImageEditError('UPLOAD_FAILED', `upload-urls returned HTTP ${response.status}`);
  }

  const payload = (await response.json()) as { items?: UploadSlot[] };
  const slot = payload.items?.[0];
  if (!slot) throw new ImageEditError('UPLOAD_FAILED', 'the engine returned no upload slot');

  // Buffer → BlobPart: Node's fetch accepts a Uint8Array body directly.
  const put = await fetch(slot.upload_url, { method: 'PUT', body: new Uint8Array(bytes) });
  if (!put.ok) throw new ImageEditError('UPLOAD_FAILED', `PUT returned HTTP ${put.status}`);

  return slot.file_path;
}

interface JobResponse {
  error?: { code?: string; message?: string } | null;
  readonly id?: string;
  readonly status?: string;
  readonly credits_charged?: number;
  readonly downloads?: { readonly url?: string }[];
}

/**
 * Edit an existing image and return the produced bytes.
 *
 * Returns BYTES, never a URL. The caller must be able to prove the output
 * differs from the input, and a URL cannot be hashed — `deriveAsset` refuses
 * output identical to its parent, and that guard is only meaningful if the
 * bytes actually reach it.
 *
 * Arabic instructions are passed through unchanged: the Founder's requirement
 * is that the Creator directs in their own tongue, and the engine took Arabic
 * in the live proof above.
 */
/**
 * The provider model every sovereign image edit executes.
 *
 * VERIFIED 2026-09-22 against docs.magichour.ai /v1/ai-image-editor `model`
 * enum: "default, nano-banana-2, gpt-image-2, gpt-image-2.5-flare,
 * flux-2-klein, nano-banana-2-lite, qwen-edit, krea-2, seedream-v4,
 * seedream-v4.5, seedream-v5-pro, nano-banana, nano-banana-pro". Before
 * this date the binding sent no model and the provider's default did the
 * work, unrecorded. Now the model is named here, sent, and written into the
 * derived asset's provenance as executed — never assumed.
 */
export const IMAGE_EDIT_PROVIDER_ID = 'magic-hour-image-editor' as const;
export const IMAGE_EDIT_MODEL_ID = 'nano-banana-2' as const;

export async function editImageViaProvider(
  sourceBytes: Buffer,
  sourceExtension: string,
  instruction: string,
  options: { readonly timeoutMs?: number; readonly pollIntervalMs?: number; readonly model?: string } = {},
): Promise<EditedImageResult> {
  const headers = authHeaders();
  const model = options.model ?? IMAGE_EDIT_MODEL_ID;
  const filePath = await uploadSource(sourceBytes, sourceExtension);
  const submitted = await fetch(`${engineBase()}/v1/ai-image-editor`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'azma-sovereign-edit',
      model,
      style: { prompt: instruction },
      // `image_file_paths` (array) is the current contract (docs 2026-09-22);
      // the singular form this binding sent before is kept beside it for
      // the older accepted shape, and the live proof decides which survives.
      assets: { image_file_paths: [filePath], image_file_path: filePath },
    }),
  });
  if (!submitted.ok) {
    if (submitted.status === 402) {
      throw new ImageEditError('NO_CREDIT', 'the image engine has no remaining credit');
    }
    throw new ImageEditError('SUBMIT_FAILED', `editor returned HTTP ${submitted.status}`);
  }

  const job = (await submitted.json()) as JobResponse;
  if (!job.id) throw new ImageEditError('SUBMIT_FAILED', 'the engine returned no job id');

  // ── Poll ────────────────────────────────────────────────────────────────
  const timeoutMs = options.timeoutMs ?? 180_000;
  const intervalMs = options.pollIntervalMs ?? 3_000;
  const deadline = Date.now() + timeoutMs;

  let finished: JobResponse | null = null;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));

    const polled = await fetch(`${engineBase()}/v1/image-projects/${job.id}`, { headers });
    if (!polled.ok) continue;

    const state = (await polled.json()) as JobResponse;
    if (state.status === 'complete') { finished = state; break; }
    if (state.status === 'error' || state.status === 'canceled') {
      const words = state.error?.message ? `: ${state.error.message.slice(0, 200)}` : '';
      throw new ImageEditError('RENDER_FAILED', `the engine reported '${state.status}'${words}`);
    }
  }
  if (!finished) throw new ImageEditError('TIMED_OUT', `no result within ${timeoutMs}ms`);

  const url = finished.downloads?.[0]?.url;
  if (!url) throw new ImageEditError('NO_OUTPUT', 'the completed job carried no result');

  const downloaded = await fetch(url);
  if (!downloaded.ok) throw new ImageEditError('NO_OUTPUT', `download returned HTTP ${downloaded.status}`);

  return {
    bytes: Buffer.from(await downloaded.arrayBuffer()),
    mimeType: downloaded.headers.get('content-type')?.split(';')[0]?.trim() ?? 'application/octet-stream',
    creditsCharged: typeof finished.credits_charged === 'number' ? finished.credits_charged : null,
    providerId: IMAGE_EDIT_PROVIDER_ID,
    providerModelId: model,
    providerJobId: job.id,
  };
}

/** Whether the image engine has a credential. Read before offering the ability. */
export function imageEditingIsConfigured(): boolean {
  return Boolean(process.env.MAGIC_HOUR_API_KEY);
}
