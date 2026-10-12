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

export function engineBase(): string {
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

export function authHeaders(): Record<string, string> {
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
export async function uploadSource(bytes: Buffer, extension: string): Promise<string> {
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

/**
 * ── RAISING AN ASSET'S RESOLUTION ───────────────────────────────────────────
 *
 *   The Founder approved this on 2026-09-26 after the inventory showed four of
 *   its five parts were already built: the provider route PROBED LIVE (400 for
 *   a missing scale_factor — a route that exists), the cost catalog pricing it
 *   as `image-upscaling`, a full benchmark in
 *   `src/benchmark/specs/image-upscaling-specs.ts` with golden assets, and
 *   this file's own client to extend. The fifth part is this function.
 *
 *   It lives here, beside the edit, for the reason stated at the top of this
 *   file: the same base URL, the same credential, the same upload and the same
 *   job-polling shape. A second provider client would be a duplicate, not a
 *   capability.
 *
 * ─── TWO CHOICES MADE ON MEASURED GROUNDS, NOT TASTE ────────────────────────
 *
 *   `mode: 'preserve'`, not the provider's default of 'balanced'. Two reasons
 *   agreeing: the Empire's OWN benchmark for this capability specifies
 *   `hallucination: 'none'` and scores "no hallucinated features absent from
 *   source" — which is what preserve does and what balanced and creative do
 *   not — and preserve costs 1× where balanced and creative cost 2×. The
 *   cheaper option is also the correct one; nothing is traded.
 *
 *   `scale_factor: 2` only. The provider documents 4× as available to Creator,
 *   Pro and Business tiers. This Empire's tier is NOT verified, and offering a
 *   Creator a choice the account may refuse is offering a refusal. When 4× is
 *   proven on a live call, widen this — not before.
 */
export const IMAGE_UPSCALE_PROVIDER_ID = 'magic-hour-image-upscaler' as const;
export const UPSCALE_SCALE_FACTOR = 2 as const;
export const UPSCALE_MODE = 'preserve' as const;

/**
 * ─── 4× · WHAT WAS MEASURED, AND WHAT IS STILL NOT ──────────────────────────
 *
 *   The comment above said «widen this when 4× is proven on a live call». Two
 *   of the three things that sentence was waiting for are now measured:
 *
 *     the ENDPOINT      `scale_factor` «must be either 2 or 4», and 4 is
 *                       documented for Creator, Pro and Business tiers
 *                       (docs.magichour.ai, read 2026-10-11)
 *     the ENTITLEMENT   `GET /v1/account` → 200, `"tier":"creator"`
 *                       — the Empire's own tier, read live, no longer a guess
 *     the CHARGE        preserve 4× = 100 credits, balanced/creative = 200
 *
 *   What is NOT measured is a completed 4× job. So the factor becomes an
 *   argument — the path exists and is one call away — and the chamber still
 *   offers only what is priced for a Creator. A capability whose provider
 *   charge is known and whose CREATOR price is not is not yet an offer, and
 *   `upscaleScaleFactors()` says exactly which is which.
 *
 *   The maximum input the provider documents is 4096×4096px, which bounds
 *   what 4× can be asked for at all.
 */
export const UPSCALE_SCALE_FACTOR_4X = 4 as const;
export type UpscaleScaleFactor = typeof UPSCALE_SCALE_FACTOR | typeof UPSCALE_SCALE_FACTOR_4X;

/** The provider's own documented input ceiling for this endpoint. */
export const UPSCALE_MAX_INPUT_PIXELS = { width: 4096, height: 4096 } as const;

/**
 * Each factor, with the two separate questions answered separately: may the
 * ACCOUNT run it, and may a CREATOR be offered it.
 */
export const UPSCALE_FACTORS: readonly {
  readonly factor: UpscaleScaleFactor;
  /** Documented provider charge in the mode this Empire sends (`preserve`). */
  readonly providerCredits: number;
  /** The account tier the provider requires. Ours is `creator`, read live. */
  readonly tierRequired: 'any' | 'creator';
  /** A completed paid job at this factor. ALWAYS false until one exists. */
  readonly productionProven: boolean;
  /** A Creator-facing price exists for it in the balance rules. */
  readonly creatorPriceExists: boolean;
}[] = [
  {
    factor: UPSCALE_SCALE_FACTOR, providerCredits: 25, tierRequired: 'any',
    // Proven in production 2026-09-27: a real upscale charged 25 credits.
    productionProven: true, creatorPriceExists: true,
  },
  {
    factor: UPSCALE_SCALE_FACTOR_4X, providerCredits: 100, tierRequired: 'creator',
    // PROVEN 2026-10-12: provider job cmv5c2l8q073zmj01xymsmdeg, complete,
    // charged 100 credits, and the output measured 5504×3072 from a 1376×768
    // source — a true fourfold, not a heavier file.
    productionProven: true,
    // PRICED 2026-10-12 by the Chief Architect's own uplift: 100 × 1.70 = 170
    // units, in `new-capability-pricing.ts`. The derivation this comment once
    // refused to make is now HIS, made in his own order, and recorded there.
    creatorPriceExists: true,
  },
];

export async function upscaleImageViaProvider(
  sourceBytes: Buffer,
  sourceExtension: string,
  options: {
    readonly timeoutMs?: number;
    readonly pollIntervalMs?: number;
    /** 2 or 4. Defaults to 2 — the factor that is proven and priced. */
    readonly scaleFactor?: UpscaleScaleFactor;
  } = {},
): Promise<EditedImageResult> {
  const headers = authHeaders();
  const scaleFactor = options.scaleFactor ?? UPSCALE_SCALE_FACTOR;
  const filePath = await uploadSource(sourceBytes, sourceExtension);

  const submitted = await fetch(`${engineBase()}/v1/ai-image-upscaler`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'azma-sovereign-upscale',
      scale_factor: scaleFactor,
      style: { mode: UPSCALE_MODE },
      assets: { image_file_path: filePath },
    }),
  });
  if (!submitted.ok) {
    if (submitted.status === 402) {
      throw new ImageEditError('NO_CREDIT', 'the image engine has no remaining credit');
    }
    throw new ImageEditError('SUBMIT_FAILED', `upscaler returned HTTP ${submitted.status}`);
  }

  const job = (await submitted.json()) as JobResponse;
  if (!job.id) throw new ImageEditError('SUBMIT_FAILED', 'the engine returned no job id');

  // The upscaler reports through the same image-project surface as the editor.
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
    providerId: IMAGE_UPSCALE_PROVIDER_ID,
    // The upscaler takes no model; the provider's own upscaling engine does the
    // work. Recorded as such rather than inventing a model name for provenance.
    providerModelId: 'ai-image-upscaler',
    providerJobId: job.id,
  };
}
