/**
 * AZMA OS — MAGIC HOUR PROVIDER ADAPTER
 *
 * Implements AIProviderAdapter for Magic Hour's image-generation,
 * text-to-video, and TTS capabilities.
 *
 * CONTRACT DISCOVERY SUMMARY (certified 2026-07-30):
 * - All Magic Hour creation endpoints are ASYNC: submit → poll for completion
 * - Image credits: charged immediately at submission, auto-refunded on error/cancel
 * - Video credits: estimated at submission (based on end_seconds × 30fps),
 *   ADJUSTED at completion based on actual fps. credits_charged field = estimate
 *   during rendering, final after complete/error/canceled.
 * - TTS/Voice credits: 0.1 MH credits per character, ceil(), charged at submission
 * - Failure: Magic Hour auto-refunds all credits. AZMA must release reservation.
 * - Cancellation: same as failure for AZMA purposes.
 * - Commercial use: covered on paid API plans.
 * - Download URLs: expire after 24 hours.
 *
 * SECURITY:
 * - MAGIC_HOUR_API_KEY stays in env vars — never in source, logs, or responses
 * - Provider job IDs are kept in metadata.magicHourJobId (internal audit only)
 * - Creator-facing responses never expose provider job IDs or credit amounts
 *
 * PENDING BLOCKERS:
 * - MH credit → AZMA Unit conversion rate not approved → catalog entries stay
 *   pending-discovery; adapter built but not activated in generation routes
 * - API base URL unconfirmed — configurable via MAGIC_HOUR_BASE_URL env var
 * - Rate/concurrency limits not documented — defaulting to maxConcurrentRequests: 3
 * - Webhook signature verification details not in public docs — polling used instead
 */

import type {
  AIProviderAdapter,
  AIProviderDescriptor,
  AIProviderDispatchInput,
  RawAIProviderResponse,
} from '../provider-contracts';

// ─── CONFIGURATION ────────────────────────────────────────────────────────────

const MAGIC_HOUR_BASE_URL =
  (typeof process !== 'undefined' && process.env['MAGIC_HOUR_BASE_URL']) ||
  'https://api.magichour.ai';

// Bounded polling: up to 120 attempts at 3-second intervals = 6-minute max wait.
// Both configurable via env vars — tests set small values to avoid real delays.
const MAX_POLL_ATTEMPTS =
  parseInt(typeof process !== 'undefined' ? (process.env['MAGIC_HOUR_MAX_POLL_ATTEMPTS'] ?? '120') : '120', 10);
const POLL_INTERVAL_MS =
  parseInt(typeof process !== 'undefined' ? (process.env['MAGIC_HOUR_POLL_INTERVAL_MS'] ?? '3000') : '3000', 10);

// ─── HTTP CLIENT (no SDK dependency — plain fetch) ────────────────────────────

interface MagicHourJobResponse {
  id: string;
  status: 'draft' | 'queued' | 'rendering' | 'complete' | 'error' | 'canceled';
  credits_charged: number;
  /** The provider's own statement of what it PRODUCED — not what was asked for. */
  end_seconds?: number;
  downloads?: Array<{ url: string; expires_at: string }>;
  error?: { message?: string; code?: string } | null;
  fps?: number;
  width?: number;
  height?: number;
}

class MagicHourClient {
  private readonly apiKey: string;
  private readonly baseUrl: string;

  constructor(apiKey: string, baseUrl: string = MAGIC_HOUR_BASE_URL) {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl;
  }

  private headers(): Record<string, string> {
    return {
      'Authorization': `Bearer ${this.apiKey}`,
      'Content-Type': 'application/json',
    };
  }

  async post<T>(path: string, body: unknown): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'POST',
      headers: this.headers(),
      body: JSON.stringify(body),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '(unreadable body)');
      throw new MagicHourApiError(response.status, path, text);
    }
    return response.json() as Promise<T>;
  }

  async get<T>(path: string): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method: 'GET',
      headers: this.headers(),
    });
    if (!response.ok) {
      const text = await response.text().catch(() => '(unreadable body)');
      throw new MagicHourApiError(response.status, path, text);
    }
    return response.json() as Promise<T>;
  }

  // Polls until status is complete, error, or canceled. Bounded by MAX_POLL_ATTEMPTS.
  async pollUntilDone(pollPath: string): Promise<MagicHourJobResponse> {
    let attempts = 0;
    while (attempts < MAX_POLL_ATTEMPTS) {
      await delay(POLL_INTERVAL_MS);
      const job = await this.get<MagicHourJobResponse>(pollPath);
      if (job.status === 'complete' || job.status === 'error' || job.status === 'canceled') {
        return job;
      }
      attempts++;
    }
    throw new MagicHourTimeoutError(pollPath, MAX_POLL_ATTEMPTS);
  }
}

// ─── ERRORS ───────────────────────────────────────────────────────────────────

export class MagicHourApiError extends Error {
  constructor(
    readonly statusCode: number,
    readonly path: string,
    readonly body: string,
  ) {
    // Never log the body without scrubbing — it may contain internal details.
    // Keep message opaque enough to be safe in any log sink.
    super(`Magic Hour API error ${statusCode} at ${path}`);
    this.name = 'MagicHourApiError';
  }
}

export class MagicHourTimeoutError extends Error {
  constructor(readonly pollPath: string, readonly attempts: number) {
    super(`Magic Hour job polling timed out after ${attempts} attempts at ${pollPath}`);
    this.name = 'MagicHourTimeoutError';
  }
}

// ─── SHARED UTILITIES ─────────────────────────────────────────────────────────

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getMagicHourClient(): MagicHourClient {
  const apiKey = process.env['MAGIC_HOUR_API_KEY'];
  if (!apiKey) throw new Error('MAGIC_HOUR_API_KEY is not configured');
  return new MagicHourClient(apiKey);
}

function buildRawResponse(
  providerId: string,
  modelId: string,
  job: MagicHourJobResponse,
  startedAt: number,
  extra?: Record<string, unknown>,
): RawAIProviderResponse {
  const downloadUrl = job.downloads?.[0]?.url ?? null;

  if (job.status === 'error' || job.status === 'canceled') {
    return {
      providerId,
      modelId,
      content: '',
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: Date.now() - startedAt,
      finishReason: 'failed',
      metadata: {
        magicHourJobId: job.id,
        magicHourStatus: job.status,
        magicHourCreditsCharged: job.credits_charged,
        // credits_charged on error = what was refunded (may be 0)
        magicHourRefunded: true,
        // The provider's own words for the failure, so an attempt that broke
        // here can say why. Never a URL, never a credential.
        magicHourErrorCode: job.error?.code ?? null,
        magicHourErrorMessage: job.error?.message?.slice(0, 240) ?? null,
        ...extra,
      },
    };
  }

  return {
    providerId,
    modelId,
    content: downloadUrl ?? '',
    inputTokens: 0,
    outputTokens: 0,
    latencyMs: Date.now() - startedAt,
    finishReason: 'completed',
    metadata: {
      magicHourJobId: job.id,
      magicHourStatus: job.status,
      magicHourCreditsCharged: job.credits_charged,
      magicHourRefunded: false,
      downloadUrl,
      ...extra,
    },
  };
}

// ─── IMAGE GENERATION ADAPTER ─────────────────────────────────────────────────

/**
 * ── THE SOVEREIGN SILENCE BOUNDARY ──────────────────────────────
 *
 *   A sovereign video master carries no audio.
 *
 *   MEASURED 2026-09-27 with ffprobe on every sovereign video this Empire has
 *   produced: each carried 1 video stream AND 1 audio stream. Neither request
 *   sent an `audio` field, so what arrived was the PROVIDER'S default — and a
 *   default is not a boundary. It belongs to the provider, it may differ per
 *   model, and it can change without notice.
 *
 *   `false` is sent EXPLICITLY, and from one named constant, so the rule has
 *   a single source and a reader can see it at the point of dispatch. It is
 *   not a UI choice, not a prompt instruction, and not an omission — those
 *   were exactly the three ways the Empire had of appearing silent without
 *   being so. Every video model passes through here, including a test-only
 *   binding, so none of them can be silent by luck.
 *
 *   Optional audio, if it is ever wanted, is a separate capability under a
 *   separate order. Until then this value has no other setting.
 */
export const SOVEREIGN_VIDEO_AUDIO = false as const;

export const MAGIC_HOUR_IMAGE_PROVIDER_ID = 'magic-hour-image' as const;
export const MAGIC_HOUR_IMAGE_MODEL_ID = 'magic-hour-ai-image-generator' as const;
// Authorized free-launch model — Chief Architect approval 2026-08-23. Never changed without a new authorization.
export const MAGIC_HOUR_IMAGE_FREE_LAUNCH_MODEL = 'flux-schnell' as const;

const MH_IMAGE_DESCRIPTOR: AIProviderDescriptor = {
  providerId: MAGIC_HOUR_IMAGE_PROVIDER_ID,
  displayName: 'Magic Hour Image Generation',
  providerFamily: 'magic-hour',
  capabilities: ['image-generation'],
  modelIds: [MAGIC_HOUR_IMAGE_MODEL_ID],
  maxConcurrentRequests: 3,
  // Provider-internal cost not exposed via costProfile — managed by AzmaUnitCostEngine
  costProfile: { inputUnitCost: 0, outputUnitCost: 0, currency: 'magic-hour-credits' },
  sovereign: true,
};

export class MagicHourImageAdapter implements AIProviderAdapter {
  public readonly descriptor: AIProviderDescriptor = MH_IMAGE_DESCRIPTOR;

  public async dispatch(input: AIProviderDispatchInput): Promise<RawAIProviderResponse> {
    const startedAt = Date.now();
    const client = getMagicHourClient();

    const aspectRatio = (input.request.context.metadata['aspectRatio'] as string | undefined) ?? '16:9';
    const resolution = (input.request.context.metadata['resolution'] as string | undefined) ?? '1k';

    // Model selection: use providerModelId from SovereignModelSelector when available.
    // Falls back to MAGIC_HOUR_IMAGE_FREE_LAUNCH_MODEL (flux-schnell) for legacy
    // requests and while approved candidates await production authorization.
    const selectedProviderModelId =
      input.request.context.metadata['providerModelId'] as string | undefined;
    const modelToUse = selectedProviderModelId ?? MAGIC_HOUR_IMAGE_FREE_LAUNCH_MODEL;

    // Production observability — internal only, never Creator-facing
    console.log(
      '[MagicHourImageAdapter] dispatch',
      JSON.stringify({ model: modelToUse, aspectRatio, resolution, requestId: input.request.requestId }),
    );

    // Submit image generation job
    const submission = await client.post<MagicHourJobResponse>('/v1/ai-image-generator', {
      image_count: 1,
      aspect_ratio: aspectRatio,
      resolution,
      style: { prompt: input.request.prompt },
      model: modelToUse,
    });

    console.log('[MagicHourImageAdapter] job-submitted', JSON.stringify({ jobId: submission.id, model: modelToUse }));

    // Poll until done (images complete quickly — usually < 30 seconds)
    const job = await client.pollUntilDone(`/v1/image-projects/${submission.id}`);

    console.log(
      '[MagicHourImageAdapter] job-complete',
      JSON.stringify({ jobId: job.id, status: job.status, creditsCharged: job.credits_charged, latencyMs: Date.now() - startedAt }),
    );

    const baseResponse = buildRawResponse(
      MAGIC_HOUR_IMAGE_PROVIDER_ID,
      MAGIC_HOUR_IMAGE_MODEL_ID,
      job,
      startedAt,
      // `providerModelId` is the model this binding actually sent — the
      // generic MAGIC_HOUR_IMAGE_MODEL_ID above names the binding, not the
      // model, and provenance must record what was executed.
      { aspectRatio, resolution, providerModelId: modelToUse },
    );

    // The generation-service contract requires content to be base64-encoded binary.
    // Magic Hour returns a download URL (expires in 24h) — we fetch the bytes here,
    // inside the adapter, so the rest of the pipeline is unchanged.
    // Video/TTS adapters are NOT changed: their callers handle URL content differently.
    const downloadUrl = baseResponse.metadata['downloadUrl'] as string | null;
    if (baseResponse.finishReason !== 'completed' || !downloadUrl) {
      return baseResponse;
    }

    const imageResponse = await fetch(downloadUrl);
    if (!imageResponse.ok) {
      throw new Error(`Magic Hour image download failed: HTTP ${imageResponse.status}`);
    }
    const imageBytes = Buffer.from(await imageResponse.arrayBuffer());
    // Read the actual content-type declared by the CDN — do not assume PNG.
    // The generation service performs its own byte-level format validation
    // independently; this value is informational metadata only.
    const mimeType =
      imageResponse.headers.get('content-type')?.split(';')[0]?.trim() ??
      'application/octet-stream';

    return {
      ...baseResponse,
      content: imageBytes.toString('base64'),
      metadata: {
        ...baseResponse.metadata,
        mimeType,
        encoding: 'base64',
      },
    };
  }
}

// ─── TEXT-TO-VIDEO ADAPTER ────────────────────────────────────────────────────

export const MAGIC_HOUR_VIDEO_PROVIDER_ID = 'magic-hour-video' as const;
export const MAGIC_HOUR_VIDEO_MODEL_ID = 'magic-hour-text-to-video' as const;

const MH_VIDEO_DESCRIPTOR: AIProviderDescriptor = {
  providerId: MAGIC_HOUR_VIDEO_PROVIDER_ID,
  displayName: 'Magic Hour Text-to-Video',
  providerFamily: 'magic-hour',
  capabilities: ['video-generation'], // text-to-video — must NOT claim image-generation; no consumer route yet
  modelIds: [MAGIC_HOUR_VIDEO_MODEL_ID],
  maxConcurrentRequests: 3,
  costProfile: { inputUnitCost: 0, outputUnitCost: 0, currency: 'magic-hour-credits' },
  sovereign: true,
};

export class MagicHourVideoAdapter implements AIProviderAdapter {
  public readonly descriptor: AIProviderDescriptor = MH_VIDEO_DESCRIPTOR;

  public async dispatch(input: AIProviderDispatchInput): Promise<RawAIProviderResponse> {
    const startedAt = Date.now();
    const client = getMagicHourClient();

    // ── THE DURATION THE CREATOR CHOSE, NOT A NUMBER WRITTEN HERE ─────────
    //
    //   MEASURED on production 2026-09-26, operation
    //   57b0af62-921f-454b-8d27-aebd785fa3d7: the Creator selected 6 seconds,
    //   the Chamber sent 6, the route validated 6, the service put 6 into the
    //   orchestration metadata under `durationSeconds`, and the orchestrator
    //   passed it through verbatim — and this line read `endSeconds`, a key
    //   NOTHING in the text-to-video path has ever written. It fell to 4, and
    //   the provider's own record confirms `end_seconds: 4`, 97 frames at
    //   24fps, 4.096 seconds. Every duration the fleet offers — up to 56
    //   seconds — produced exactly 4.
    //
    //   `durationSeconds` is what the sovereign path provides, so that is what
    //   is read. `endSeconds` is kept ahead of it because the image-to-video
    //   binding names its own option that way and is already correct; neither
    //   caller is changed.
    //
    //   The `?? 4` is gone. A duration that cannot be established is refused,
    //   not invented — the same rule that makes the model selector refuse
    //   rather than substitute. A silent default here charged a Creator for a
    //   production they did not ask for.
    const requestedSeconds =
      (input.request.context.metadata['endSeconds'] as number | undefined)
      ?? (input.request.context.metadata['durationSeconds'] as number | undefined);
    if (typeof requestedSeconds !== 'number' || !Number.isFinite(requestedSeconds) || requestedSeconds <= 0) {
      throw new Error(
        '[MagicHourVideoAdapter] no duration was supplied for this production; '
        + 'refusing rather than substituting one',
      );
    }
    const endSeconds = requestedSeconds;
    const aspectRatio = (input.request.context.metadata['aspectRatio'] as string | undefined) ?? '16:9';
    const resolution = (input.request.context.metadata['resolution'] as string | undefined) ?? '720p';

    // Model selection: use providerModelId from SovereignModelSelector when available.
    // When no model is specified, the Magic Hour API uses its default model.
    const selectedProviderModelId =
      input.request.context.metadata['providerModelId'] as string | undefined;

    // Submit text-to-video job
    // credits_charged at submission = ESTIMATE based on end_seconds × assumed 30fps
    const submission = await client.post<MagicHourJobResponse>('/v1/text-to-video', {
      end_seconds: endSeconds,
      aspect_ratio: aspectRatio,
      resolution,
      // The boundary, not a default — see SOVEREIGN_VIDEO_AUDIO.
      audio: SOVEREIGN_VIDEO_AUDIO,
      style: { prompt: input.request.prompt },
      ...(selectedProviderModelId ? { model: selectedProviderModelId } : {}),
    });

    const estimatedCredits = submission.credits_charged;

    // Poll until done — video may take several minutes
    const job = await client.pollUntilDone(`/v1/video-projects/${submission.id}`);

    // credits_charged at completion = FINAL (adjusted for actual fps)
    const finalCredits = job.credits_charged;
    const creditAdjustment = finalCredits - estimatedCredits;

    return buildRawResponse(
      MAGIC_HOUR_VIDEO_PROVIDER_ID,
      MAGIC_HOUR_VIDEO_MODEL_ID,
      job,
      startedAt,
      {
        aspectRatio, resolution, endSeconds,
        providerModelId: selectedProviderModelId ?? 'default',
        // What was ASKED FOR and what was MADE are two facts. The Vault
        // recorded the request and described it as the result; the provider's
        // own completed job states what it actually produced.
        magicHourRequestedSeconds: endSeconds,
        magicHourProducedSeconds: typeof job.end_seconds === 'number' ? job.end_seconds : null,
        magicHourEstimatedCredits: estimatedCredits,
        magicHourCreditAdjustment: creditAdjustment,
        magicHourFps: job.fps,
        magicHourWidth: job.width,
        magicHourHeight: job.height,
      },
    );
  }
}

// ─── TEXT-TO-SPEECH ADAPTER ───────────────────────────────────────────────────

export const MAGIC_HOUR_TTS_PROVIDER_ID = 'magic-hour-tts' as const;
export const MAGIC_HOUR_TTS_MODEL_ID = 'magic-hour-ai-voice-generator' as const;

const MH_TTS_DESCRIPTOR: AIProviderDescriptor = {
  providerId: MAGIC_HOUR_TTS_PROVIDER_ID,
  displayName: 'Magic Hour AI Voice Generator',
  providerFamily: 'magic-hour',
  capabilities: ['audio-generation'],
  modelIds: [MAGIC_HOUR_TTS_MODEL_ID],
  maxConcurrentRequests: 3,
  costProfile: { inputUnitCost: 0, outputUnitCost: 0, currency: 'magic-hour-credits' },
  sovereign: true,
};

// Magic Hour TTS credit formula: ceil(characterCount × 0.1)
export function estimateMagicHourTtsCredits(characterCount: number): number {
  return Math.ceil(characterCount * 0.1);
}

export class MagicHourTtsAdapter implements AIProviderAdapter {
  public readonly descriptor: AIProviderDescriptor = MH_TTS_DESCRIPTOR;

  public async dispatch(input: AIProviderDispatchInput): Promise<RawAIProviderResponse> {
    const startedAt = Date.now();
    const client = getMagicHourClient();

    const text = input.request.prompt;
    const voice = (input.request.context.metadata['voice'] as string | undefined) ?? 'alloy';
    const estimatedCredits = estimateMagicHourTtsCredits(text.length);

    // Submit TTS job
    const submission = await client.post<MagicHourJobResponse>('/v1/ai-voice-generator', {
      text,
      voice,
    });

    // Poll until done
    const job = await client.pollUntilDone(`/v1/audio-projects/${submission.id}`);

    return buildRawResponse(
      MAGIC_HOUR_TTS_PROVIDER_ID,
      MAGIC_HOUR_TTS_MODEL_ID,
      job,
      startedAt,
      {
        voice,
        characterCount: text.length,
        magicHourEstimatedCredits: estimatedCredits,
      },
    );
  }
}

// ─── FACTORY ──────────────────────────────────────────────────────────────────

export function isMagicHourConfigured(): boolean {
  return Boolean(process.env['MAGIC_HOUR_API_KEY']);
}
