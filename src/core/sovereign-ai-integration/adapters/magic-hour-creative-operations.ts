/**
 * AZMA OS — FOUR CREATIVE OPERATIONS, ON THE PROVIDER THAT ALREADY SERVES US
 *
 * ─── WHAT THIS ADDS, AND WHAT IT REFUSES TO ADD ─────────────────────────────
 *
 *   Background removal · lip sync · face swap · talking photo.
 *
 *   Every primitive already existed in `magic-hour-image-editing.ts` and is
 *   IMPORTED, not re-implemented: `engineBase`, `authHeaders`, the error type
 *   and its rejection vocabulary. One new thing is genuinely needed — an
 *   upload that can carry AUDIO and VIDEO, because the existing
 *   `uploadSource` is image-only by its own `ACCEPTED_EXTENSIONS` and sends
 *   `type: 'image'`. Lip sync and talking photo cannot exist without it.
 *
 * ─── WHAT WAS MEASURED BEFORE A LINE WAS WRITTEN ────────────────────────────
 *
 *   Probed live 2026-10-11 against the Empire's own credential. Every probe
 *   carried a DELIBERATE TYPE VIOLATION on one required field — a number where
 *   a string is demanded — so the request could never become a valid job and
 *   no credit could be charged, while the validator still named every other
 *   required field. (The earlier technique, `image_count: 0`, does not apply
 *   to these endpoints; a type violation does.)
 *
 *     /v1/image-background-remover   assets.image_file_path
 *     /v1/lip-sync                   start_seconds · end_seconds ·
 *                                    assets.video_source ('file'|'youtube') ·
 *                                    assets.video_file_path · assets.audio_file_path
 *     /v1/face-swap                   start_seconds · end_seconds ·
 *                                    assets.video_source · assets.video_file_path
 *     /v1/face-swap-photo             assets.target_file_path
 *     /v1/ai-talking-photo            start_seconds · end_seconds ·
 *                                    assets.image_file_path · assets.audio_file_path
 *
 *   Each answered `400` with named fields — route present, credential
 *   accepted, nothing created, nothing charged.
 *
 * ─── AND WHAT THE PROBES DO NOT PROVE ───────────────────────────────────────
 *
 *   A validator accepting a shape is NOT entitlement to run a paid job, and it
 *   is not a cost. Neither is recorded here as proven. The operation catalog
 *   keeps all four unavailable until a verified cost basis exists, and this
 *   module is the path that will be used the day that is granted — never a
 *   claim that it has been.
 *
 *   Nothing here fabricates an id, a URL, or a success. Every function returns
 *   BYTES or throws, for the reason the editing adapter records: a caller must
 *   be able to hash the output to prove it differs from its parent, and a URL
 *   cannot be hashed.
 */

import {
  engineBase,
  authHeaders,
  ImageEditError,
  type ImageEditRejection,
} from './magic-hour-image-editing';
import {
  verifyLikenessAcknowledgment,
  requiresLikenessAcknowledgment,
} from '../../../vault/likeness-acknowledgment';

// ─────────────────────────────────────────────────────────────────────────────
// 1 · THE FOUR OPERATIONS, NAMED ONCE
// ─────────────────────────────────────────────────────────────────────────────

export type CreativeOperationId =
  | 'background-removal'
  | 'lip-sync'
  | 'face-swap'
  | 'talking-photo';

/** The provider route each operation submits to. Measured, not assumed. */
export const CREATIVE_ENDPOINT: Readonly<Record<CreativeOperationId, string>> = {
  'background-removal': '/v1/image-background-remover',
  'lip-sync': '/v1/lip-sync',
  'face-swap': '/v1/face-swap',
  'talking-photo': '/v1/ai-talking-photo',
};

/** Which project namespace each operation's job is polled under. */
const PROJECT_PATH: Readonly<Record<CreativeOperationId, 'image-projects' | 'video-projects'>> = {
  'background-removal': 'image-projects',
  'lip-sync': 'video-projects',
  'face-swap': 'video-projects',
  'talking-photo': 'video-projects',
};

/** The binding recorded on a produced asset. Replaceable; never asset identity. */
export const CREATIVE_PROVIDER_ID: Readonly<Record<CreativeOperationId, string>> = {
  'background-removal': 'magic-hour-background-remover',
  'lip-sync': 'magic-hour-lip-sync',
  'face-swap': 'magic-hour-face-swap',
  'talking-photo': 'magic-hour-talking-photo',
};

export interface CreativeOperationResult {
  readonly providerId: string;
  readonly providerJobId: string;
  readonly bytes: Buffer;
  readonly mimeType: string;
  /** What the provider charged, as the provider stated it. Never estimated. */
  readonly creditsCharged: number | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 2 · UPLOADS THAT CARRY MORE THAN AN IMAGE
// ─────────────────────────────────────────────────────────────────────────────

export type UploadKind = 'image' | 'audio' | 'video';

/**
 * Extensions the provider reads, per kind.
 *
 * The image set is the one the existing adapter learned from the provider's own
 * refusal. The audio and video sets are the formats this Empire actually
 * produces and stores — mp3 and wav from the speech paths, mp4 from every
 * video path — and nothing speculative is listed: an extension we cannot
 * produce is an extension we cannot test.
 */
const ACCEPTED: Readonly<Record<UploadKind, ReadonlySet<string>>> = {
  image: new Set(['png', 'jpg', 'jpeg', 'jfif', 'heic', 'heif', 'webp', 'avif', 'jp2', 'tiff', 'tif', 'bmp']),
  audio: new Set(['mp3', 'wav', 'm4a', 'aac', 'ogg']),
  video: new Set(['mp4', 'mov', 'webm']),
};

interface UploadSlot { readonly upload_url: string; readonly file_path: string }

/**
 * Hand one source file to the engine and receive the reference it will read.
 *
 * Deliberately NOT a widening of `uploadSource`: that function is image-only
 * and three live paths depend on it. A second function with the kind as an
 * argument leaves the proven one untouched.
 *
 * The bytes go from here straight to the provider's signed URL. They are never
 * written to a new public location on the way, so this opens no hole in the
 * storage protections the security closure established.
 */
export async function uploadMedia(
  bytes: Buffer,
  extension: string,
  kind: UploadKind,
): Promise<string> {
  const ext = extension.replace(/^\./, '').toLowerCase();
  if (!ACCEPTED[kind].has(ext)) {
    throw new ImageEditError(
      'UNSUPPORTED_EXTENSION',
      `'${ext}' is not a ${kind} extension the engine reads`,
    );
  }

  const response = await fetch(`${engineBase()}/v1/files/upload-urls`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ items: [{ extension: ext, type: kind }] }),
  });
  if (!response.ok) {
    throw new ImageEditError('UPLOAD_FAILED', `upload-urls returned HTTP ${response.status}`);
  }

  const payload = (await response.json()) as { items?: UploadSlot[] };
  const slot = payload.items?.[0];
  if (!slot) throw new ImageEditError('UPLOAD_FAILED', 'the engine returned no upload slot');

  const put = await fetch(slot.upload_url, { method: 'PUT', body: new Uint8Array(bytes) });
  if (!put.ok) throw new ImageEditError('UPLOAD_FAILED', `PUT returned HTTP ${put.status}`);

  return slot.file_path;
}

// ─────────────────────────────────────────────────────────────────────────────
// 3 · SUBMIT, POLL, RETRIEVE — ONE IMPLEMENTATION FOR ALL FOUR
// ─────────────────────────────────────────────────────────────────────────────

interface JobResponse {
  error?: { code?: string; message?: string } | null;
  readonly id?: string;
  readonly status?: string;
  readonly credits_charged?: number;
  readonly downloads?: { readonly url?: string }[];
}

export interface RunOptions {
  readonly timeoutMs?: number;
  readonly pollIntervalMs?: number;
}

/**
 * Submit a job, wait for it, and return its BYTES.
 *
 * ─── SUBMISSION IS NOT COMPLETION ───────────────────────────────────────────
 *
 *   The directive names this explicitly for lip sync, and it is true of all
 *   four: the provider answers a submission with a job id and a `queued`
 *   status. Returning at that point would report a success for work that has
 *   not happened. This polls to a terminal state, and a job that ends
 *   `error` or `canceled` throws rather than returning a partial result.
 *
 *   Timeouts are deliberately longer for the video operations: a lip sync or a
 *   face swap renders frames, and 180 s is the image budget.
 */
async function runCreativeJob(
  operation: CreativeOperationId,
  body: Record<string, unknown>,
  options: RunOptions = {},
): Promise<CreativeOperationResult> {
  const headers = authHeaders();
  const submitted = await fetch(`${engineBase()}${CREATIVE_ENDPOINT[operation]}`, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });

  if (!submitted.ok) {
    // 402 is the Empire's own account, not the Creator's request or asset.
    // Collapsing it into a generic engine error is a lie by vagueness.
    if (submitted.status === 402) {
      throw new ImageEditError('NO_CREDIT', `${operation}: the engine has no remaining credit`);
    }
    throw new ImageEditError('SUBMIT_FAILED', `${operation} returned HTTP ${submitted.status}`);
  }

  const job = (await submitted.json()) as JobResponse;
  if (!job.id) throw new ImageEditError('SUBMIT_FAILED', `${operation}: the engine returned no job id`);

  const isVideo = PROJECT_PATH[operation] === 'video-projects';
  const timeoutMs = options.timeoutMs ?? (isVideo ? 600_000 : 180_000);
  const intervalMs = options.pollIntervalMs ?? 3_000;
  const deadline = Date.now() + timeoutMs;

  let finished: JobResponse | null = null;
  while (Date.now() < deadline) {
    await new Promise((resolve) => setTimeout(resolve, intervalMs));

    const polled = await fetch(`${engineBase()}/v1/${PROJECT_PATH[operation]}/${job.id}`, { headers });
    // A single unreadable poll is not a verdict; the deadline is.
    if (!polled.ok) continue;

    const state = (await polled.json()) as JobResponse;
    if (state.status === 'complete') { finished = state; break; }
    if (state.status === 'error' || state.status === 'canceled') {
      const words = state.error?.message ? `: ${state.error.message.slice(0, 200)}` : '';
      throw new ImageEditError('RENDER_FAILED', `${operation}: the engine reported '${state.status}'${words}`);
    }
  }
  if (!finished) throw new ImageEditError('TIMED_OUT', `${operation}: no result within ${timeoutMs}ms`);

  const url = finished.downloads?.[0]?.url;
  if (!url) throw new ImageEditError('NO_OUTPUT', `${operation}: the completed job carried no result`);

  const downloaded = await fetch(url);
  if (!downloaded.ok) {
    throw new ImageEditError('NO_OUTPUT', `${operation}: download returned HTTP ${downloaded.status}`);
  }

  return {
    bytes: Buffer.from(await downloaded.arrayBuffer()),
    mimeType: downloaded.headers.get('content-type')?.split(';')[0]?.trim() ?? 'application/octet-stream',
    creditsCharged: typeof finished.credits_charged === 'number' ? finished.credits_charged : null,
    providerId: CREATIVE_PROVIDER_ID[operation],
    providerJobId: job.id,
  };
}

/** Exposed for contract tests, which must exercise the real body construction. */
export const __runCreativeJobForTests = runCreativeJob;

// ─────────────────────────────────────────────────────────────────────────────
// 4 · THE FOUR REAL PATHS
// ─────────────────────────────────────────────────────────────────────────────

/**
 * A · BACKGROUND REMOVAL — one image in, one image out.
 *
 * The source asset is untouched: its bytes are read, uploaded to the
 * provider's own signed URL, and the OUTPUT comes back as new bytes for the
 * caller to deposit as a derived asset.
 */
export async function removeBackgroundViaProvider(
  imageBytes: Buffer,
  imageExtension: string,
  options: RunOptions = {},
): Promise<CreativeOperationResult> {
  const image = await uploadMedia(imageBytes, imageExtension, 'image');
  return runCreativeJob('background-removal', { assets: { image_file_path: image } }, options);
}

/**
 * B · LIP SYNC — an existing clip, made to speak an existing audio.
 *
 * `video_source: 'file'` is stated rather than defaulted: the provider also
 * accepts `'youtube'`, and this Empire never hands a provider a third party's
 * URL on a Creator's behalf.
 */
export async function lipSyncViaProvider(
  videoBytes: Buffer,
  videoExtension: string,
  audioBytes: Buffer,
  audioExtension: string,
  endSeconds: number,
  options: RunOptions = {},
): Promise<CreativeOperationResult> {
  if (!Number.isFinite(endSeconds) || endSeconds <= 0) {
    throw new ImageEditError('SUBMIT_FAILED', 'lip-sync: a positive duration is required');
  }
  const video = await uploadMedia(videoBytes, videoExtension, 'video');
  const audio = await uploadMedia(audioBytes, audioExtension, 'audio');
  return runCreativeJob('lip-sync', {
    start_seconds: 0,
    end_seconds: endSeconds,
    assets: { video_source: 'file', video_file_path: video, audio_file_path: audio },
  }, options);
}

/**
 * C · TALKING PHOTO — a still, animated to speak an existing audio.
 *
 * Deliberately a SEPARATE function from lip sync, with a different input
 * contract and a different provider route. The directive requires the two to
 * stay distinct, and they are distinct in fact: one takes a clip, this takes a
 * photograph, and collapsing them would make the interface lie about which.
 */
export async function talkingPhotoViaProvider(
  imageBytes: Buffer,
  imageExtension: string,
  audioBytes: Buffer,
  audioExtension: string,
  endSeconds: number,
  options: RunOptions = {},
): Promise<CreativeOperationResult> {
  if (!Number.isFinite(endSeconds) || endSeconds <= 0) {
    throw new ImageEditError('SUBMIT_FAILED', 'talking-photo: a positive duration is required');
  }
  const image = await uploadMedia(imageBytes, imageExtension, 'image');
  const audio = await uploadMedia(audioBytes, audioExtension, 'audio');
  return runCreativeJob('talking-photo', {
    start_seconds: 0,
    end_seconds: endSeconds,
    assets: { image_file_path: image, audio_file_path: audio },
  }, options);
}

/**
 * D · FACE SWAP — AND THE ONE THING THAT MAY OPEN IT.
 *
 * ─── WHAT WAS MISSING, AND WHAT NOW STANDS IN ITS PLACE ─────────────────────
 *
 *   The provider route is present and our credential is accepted. What was
 *   absent on 2026-10-11 was a POLICY: the Empire's three published documents
 *   — terms, privacy and refunds — contain no word on likeness or on the
 *   consent of the person whose face is taken. That remains measured and true.
 *
 *   The Chief Architect then ordered the safeguard itself: an explicit
 *   responsibility acknowledgment, never pre-checked, recorded against the
 *   specific request, enforced server-side and unbypassable. That safeguard is
 *   `src/vault/likeness-acknowledgment.ts`, and this gate is now its teeth.
 *
 *   So the precondition is no longer «a document somebody must write». It is a
 *   DECLARATION the Creator must make, in their own words, every time. The
 *   gate verifies that declaration and nothing else. It still cannot observe
 *   consent, and it still never infers it: it reads no asset, no owner and no
 *   metadata — only the acknowledgment handed to it — so possession can never
 *   become permission by accident.
 *
 * ─── AND THE OPERATION IS STILL SHUT TODAY ──────────────────────────────────
 *
 *   For a different reason, recorded separately: no real paid job has returned
 *   its final billing, so no cost basis is verified, and the catalog keeps the
 *   card shut on that count. Nothing here claims otherwise. The published
 *   likeness clause in the Empire's own terms is also still unwritten — the
 *   Creator's declaration is the Creator's, and it is not the Empire's
 *   published policy.
 */
export type FaceSwapPermission =
  | { readonly permitted: true }
  | { readonly permitted: false; readonly reasonEn: string };

export function faceSwapIsPermitted(acknowledgment?: unknown): FaceSwapPermission {
  const verdict = verifyLikenessAcknowledgment(acknowledgment);
  if (!verdict.ok) {
    return {
      permitted: false,
      reasonEn:
        `face swap requires the Creator's own likeness acknowledgment (${verdict.rejection}). `
        + 'Possession of an image or a video is never read as consent, and the Empire '
        + 'does not acknowledge on a Creator\'s behalf.',
    };
  }
  return { permitted: true };
}

export async function faceSwapViaProvider(
  targetVideoBytes: Buffer,
  targetVideoExtension: string,
  sourceFaceBytes: Buffer,
  sourceFaceExtension: string,
  endSeconds: number,
  /**
   * The Creator's own declaration. REQUIRED — and deliberately not defaulted:
   * a parameter with a default would be the Empire acknowledging for them.
   */
  acknowledgment: unknown,
  options: RunOptions = {},
): Promise<CreativeOperationResult> {
  // THE GATE IS INSIDE THE PATH, not only on the door. A future caller that
  // forgets to check — a script, a new route, a job queue — is refused here,
  // where it cannot be forgotten, and before one byte is uploaded.
  const permission = faceSwapIsPermitted(acknowledgment);
  if (!permission.permitted) {
    throw new ImageEditError('SUBMIT_FAILED', `face-swap refused: ${permission.reasonEn}`);
  }
  const video = await uploadMedia(targetVideoBytes, targetVideoExtension, 'video');
  const face = await uploadMedia(sourceFaceBytes, sourceFaceExtension, 'image');
  return runCreativeJob('face-swap', {
    start_seconds: 0,
    end_seconds: endSeconds,
    assets: { video_source: 'file', video_file_path: video, image_file_path: face },
  }, options);
}

// ─────────────────────────────────────────────────────────────────────────────
// 5 · READINESS — SAID SEPARATELY FROM CAPABILITY
// ─────────────────────────────────────────────────────────────────────────────

/** Whether the Empire holds a credential for this engine at all. */
export function creativeOperationsAreConfigured(): boolean {
  return Boolean(process.env.MAGIC_HOUR_API_KEY);
}

/**
 * What this module can and cannot claim, per operation — for the catalog and
 * for the acceptance report. Not one field asserts production readiness.
 */
export interface CreativeOperationReadiness {
  readonly operation: CreativeOperationId;
  readonly endpoint: string;
  /** The route answered a probe with a named field list. Measured. */
  readonly routeProbed: boolean;
  /** The probe carried our credential and was not rejected for it. Measured. */
  readonly credentialAccepted: boolean;
  /** A real paid job has completed. ALWAYS false until one has. */
  readonly productionProven: boolean;
  /** A provider cost is established from evidence. */
  readonly costBasisVerified: boolean;
  /** A policy decision blocks it, independent of any technical fact. */
  readonly policyBlocked: boolean;
  /**
   * The Creator must make an explicit declaration before it runs at all.
   *
   * Said separately from `policyBlocked` on purpose. A blocked operation is
   * one NOBODY may run; this one is one no CREATOR may run silently. Folding
   * the two together would mean that satisfying the declaration looked like
   * satisfying a policy, and it does not.
   */
  readonly requiresLikenessAcknowledgment: boolean;
}

export const CREATIVE_READINESS: readonly CreativeOperationReadiness[] = [
  {
    operation: 'background-removal', endpoint: CREATIVE_ENDPOINT['background-removal'],
    routeProbed: true, credentialAccepted: true,
    productionProven: false, costBasisVerified: false, policyBlocked: false,
    requiresLikenessAcknowledgment: requiresLikenessAcknowledgment('background-removal'),
  },
  {
    operation: 'lip-sync', endpoint: CREATIVE_ENDPOINT['lip-sync'],
    routeProbed: true, credentialAccepted: true,
    productionProven: false, costBasisVerified: false, policyBlocked: false,
    requiresLikenessAcknowledgment: requiresLikenessAcknowledgment('lip-sync'),
  },
  {
    operation: 'talking-photo', endpoint: CREATIVE_ENDPOINT['talking-photo'],
    routeProbed: true, credentialAccepted: true,
    productionProven: false, costBasisVerified: false, policyBlocked: false,
    requiresLikenessAcknowledgment: requiresLikenessAcknowledgment('talking-photo'),
  },
  {
    operation: 'face-swap', endpoint: CREATIVE_ENDPOINT['face-swap'],
    routeProbed: true, credentialAccepted: true,
    productionProven: false, costBasisVerified: false,
    // NO LONGER BLOCKED BY AN ABSENT SAFEGUARD, and still shut.
    //
    //   On 2026-10-11 this read `policyBlocked: true` because no likeness
    //   safeguard existed anywhere in the Empire. The Chief Architect then
    //   ordered the safeguard and its exact terms, and it is now built,
    //   enforced below the route, and tested. That particular block is
    //   therefore closed by HIS ruling, not by an engineer's opinion.
    //
    //   What keeps the card shut today is the line above it: no paid job
    //   has returned its final billing, so no cost is measured. And what
    //   keeps every single run honest is the line below it.
    policyBlocked: false,
    requiresLikenessAcknowledgment: requiresLikenessAcknowledgment('face-swap'),
  },
];

export function readinessOf(operation: CreativeOperationId): CreativeOperationReadiness {
  const found = CREATIVE_READINESS.find((r) => r.operation === operation);
  if (!found) throw new Error(`no readiness record for '${operation}'`);
  return found;
}

export type { ImageEditRejection };
