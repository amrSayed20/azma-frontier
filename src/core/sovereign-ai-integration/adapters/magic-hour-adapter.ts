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

export const MAGIC_HOUR_IMAGE_PROVIDER_ID = 'magic-hour-image' as const;
export const MAGIC_HOUR_IMAGE_MODEL_ID = 'magic-hour-ai-image-generator' as const;

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

    // Submit image generation job
    const submission = await client.post<MagicHourJobResponse>('/v1/ai-image-generator', {
      image_count: 1,
      aspect_ratio: aspectRatio,
      resolution,
      style: { prompt: input.request.prompt },
    });

    // Poll until done (images complete quickly — usually < 30 seconds)
    const job = await client.pollUntilDone(`/v1/image-projects/${submission.id}`);

    const baseResponse = buildRawResponse(
      MAGIC_HOUR_IMAGE_PROVIDER_ID,
      MAGIC_HOUR_IMAGE_MODEL_ID,
      job,
      startedAt,
      { aspectRatio, resolution },
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

    return {
      ...baseResponse,
      content: imageBytes.toString('base64'),
      metadata: {
        ...baseResponse.metadata,
        mimeType: 'image/png',
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

    const endSeconds = (input.request.context.metadata['endSeconds'] as number | undefined) ?? 4;
    const aspectRatio = (input.request.context.metadata['aspectRatio'] as string | undefined) ?? '16:9';
    const resolution = (input.request.context.metadata['resolution'] as string | undefined) ?? '720p';

    // Submit text-to-video job
    // credits_charged at submission = ESTIMATE based on end_seconds × assumed 30fps
    const submission = await client.post<MagicHourJobResponse>('/v1/text-to-video', {
      end_seconds: endSeconds,
      aspect_ratio: aspectRatio,
      resolution,
      style: { prompt: input.request.prompt },
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
