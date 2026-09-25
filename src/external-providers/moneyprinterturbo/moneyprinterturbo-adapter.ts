/**
 * AZMA OS — EXTERNAL CAPABILITY PROVIDER: MoneyPrinterTurbo
 *
 * An isolated, replaceable adapter over a self-hosted MoneyPrinterTurbo
 * service (pinned image digest, bound to loopback, never public). It exists
 * to support low-cost launch experiments — it is deliberately NOT registered
 * in src/core/sovereign-ai-integration/adapters, so it can never enter the
 * automatic provider-selection pool and can never displace Magic.
 *
 * The adapter is a courier, not an owner: it submits work, waits, and hands
 * back bytes plus honest metadata. Turning that output into a sovereign asset
 * is the Vault's decision alone — see moneyprinterturbo-vault-deposit.ts.
 *
 * Credentials are read from the environment on every call and are never
 * logged, never returned, and never placed in asset metadata.
 */

export const MONEYPRINTERTURBO_PROVIDER_ID = 'moneyprinterturbo' as const;

/** Mirrors app/models/const.py in the pinned provider build. */
const TASK_STATE_FAILED = -1;
const TASK_STATE_COMPLETE = 1;

function intFromEnv(name: string, fallback: number): number {
  const raw = typeof process !== 'undefined' ? process.env[name] : undefined;
  const parsed = raw ? parseInt(raw, 10) : NaN;
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

export interface MoneyPrinterTurboConfig {
  readonly baseUrl: string;
  readonly apiKey: string;
  /** Per-HTTP-request ceiling. */
  readonly requestTimeoutMs: number;
  /** Whole-production ceiling; a render of a 60s vertical video takes ~5-7 min. */
  readonly taskTimeoutMs: number;
  readonly pollIntervalMs: number;
  /** Applies to transient transport failures only — never to a failed task. */
  readonly maxTransientRetries: number;
  /**
   * What the Empire will hold in memory while carrying one finished production
   * to the Vault. This is the adapter's own limit and it speaks for nothing
   * else — in particular it is NOT the Vault's, which this path never asks.
   *
   * MEASURED 2026-09-25, the first real storyboard film: five scenes written
   * in الحُجّة الدامغة, 137 seconds of Arabic narration at 1920x1080, came to
   * 82,314,643 bytes. The previous ceiling was 50MB, copied from
   * MAX_UPLOAD_BYTES — a rule about what a Creator may post from a browser,
   * governing a path that never consults it. It refused a film the Vault
   * would have taken, and the Creator was told the production had failed when
   * the production had succeeded.
   */
  readonly maxOutputBytes: number;
}

export function resolveConfig(): MoneyPrinterTurboConfig {
  const apiKey = (typeof process !== 'undefined' ? process.env['MONEYPRINTERTURBO_API_KEY'] : undefined) ?? '';
  if (!apiKey) {
    throw new MoneyPrinterTurboConfigError(
      'MONEYPRINTERTURBO_API_KEY is not configured — the provider cannot be reached.',
    );
  }
  return {
    baseUrl: (typeof process !== 'undefined' ? process.env['MONEYPRINTERTURBO_BASE_URL'] : undefined)
      ?? 'http://127.0.0.1:8080',
    apiKey,
    requestTimeoutMs: intFromEnv('MONEYPRINTERTURBO_REQUEST_TIMEOUT_MS', 30_000),
    taskTimeoutMs: intFromEnv('MONEYPRINTERTURBO_TASK_TIMEOUT_MS', 1_800_000),
    pollIntervalMs: intFromEnv('MONEYPRINTERTURBO_POLL_INTERVAL_MS', 6_000),
    maxTransientRetries: intFromEnv('MONEYPRINTERTURBO_MAX_RETRIES', 3),
    // 256MB: roughly three times the longest film measured on this Empire, on
    // a host with 6GB free and the buffer alive only until the bytes reach
    // disk. Large enough that ordinary work passes; small enough that a
    // runaway provider cannot exhaust the process.
    maxOutputBytes: intFromEnv('MONEYPRINTERTURBO_MAX_OUTPUT_BYTES', 256 * 1024 * 1024),
  };
}

export function isMoneyPrinterTurboConfigured(): boolean {
  return Boolean(typeof process !== 'undefined' && process.env['MONEYPRINTERTURBO_API_KEY']);
}

// ── Errors ───────────────────────────────────────────────────────────────────
// Distinct types so a caller can tell "the provider is down" from "this
// request was rejected" from "the render failed" — each warrants a different
// Creator-facing response.

export class MoneyPrinterTurboError extends Error {
  public readonly providerId = MONEYPRINTERTURBO_PROVIDER_ID;
  constructor(message: string) {
    super(message);
    this.name = 'MoneyPrinterTurboError';
  }
}

export class MoneyPrinterTurboConfigError extends MoneyPrinterTurboError {
  constructor(message: string) {
    super(message);
    this.name = 'MoneyPrinterTurboConfigError';
  }
}

export class MoneyPrinterTurboApiError extends MoneyPrinterTurboError {
  constructor(public readonly statusCode: number, public readonly detail: string) {
    super(`MoneyPrinterTurbo API error ${statusCode}: ${detail}`);
    this.name = 'MoneyPrinterTurboApiError';
  }
}

export class MoneyPrinterTurboTimeoutError extends MoneyPrinterTurboError {
  constructor(public readonly taskId: string, public readonly waitedMs: number) {
    super(`MoneyPrinterTurbo task ${taskId} exceeded ${waitedMs}ms`);
    this.name = 'MoneyPrinterTurboTimeoutError';
  }
}

export class MoneyPrinterTurboTaskFailedError extends MoneyPrinterTurboError {
  constructor(public readonly taskId: string, public readonly reason: string) {
    super(`MoneyPrinterTurbo task ${taskId} failed: ${reason}`);
    this.name = 'MoneyPrinterTurboTaskFailedError';
  }
}

export class MoneyPrinterTurboOutputTooLargeError extends MoneyPrinterTurboError {
  constructor(public readonly byteLength: number, public readonly limit: number) {
    super(`MoneyPrinterTurbo output is ${byteLength} bytes, above the ${limit}-byte ceiling`);
    this.name = 'MoneyPrinterTurboOutputTooLargeError';
  }
}

// ── Request / result shapes ──────────────────────────────────────────────────

/**
 * The Chamber writes its visual intent as prose, and the stock library is
 * searched with it term by term. MEASURED 2026-09-25 on the live workshop:
 * passed through whole, the sentence's own full stop reached the library as
 * part of the query — term='awakening.' and term='desolate landscape.' —
 * searching for a phrase no catalogue is indexed under.
 *
 * So the prose is split where it already divides and each term is handed over
 * as a term: trimmed, stripped of the punctuation that ended a sentence rather
 * than named a thing, and emptied entries dropped.
 */
function toSearchTerms(terms: readonly string[]): string {
  return terms
    .flatMap((line) => line.split(','))
    .map((term) => term.trim().replace(/^[\s.,;:،؛—-]+|[\s.,;:،؛—-]+$/g, ''))
    .filter((term) => term.length > 0)
    .join(', ');
}

export interface VideoProductionRequest {
  readonly subject: string;
  /**
   * The exact words to be narrated. When given, the provider speaks these
   * instead of writing its own script from `subject` with a foreign model —
   * so a film built from الحُجّة الدامغة's scenes says what that
   * Chamber said, and evidence does not get paraphrased on its way to a screen.
   */
  readonly script?: string;
  /**
   * What to show, in the form a stock library can be asked for it. Without it
   * the provider infers a picture from the words — MEASURED 2026-09-25, that
   * inference put a crucifix over narration about أصحاب الكهف.
   */
  readonly visualTerms?: readonly string[];
  readonly language?: string;
  readonly paragraphCount?: number;
  readonly voiceName?: string;
  readonly aspect?: '9:16' | '16:9' | '1:1';
  readonly clipDurationSeconds?: number;
  readonly subtitlesEnabled?: boolean;
  readonly fontName?: string;
}

export interface ProviderUsage {
  readonly elapsedMs: number;
  readonly pollCount: number;
  readonly outputBytes: number;
}

export interface VideoProductionResult {
  readonly providerId: typeof MONEYPRINTERTURBO_PROVIDER_ID;
  readonly taskId: string;
  /** The provider's own serving path, kept for traceability — not a sovereign URI. */
  readonly providerOutputPath: string;
  readonly bytes: Buffer;
  readonly usage: ProviderUsage;
}

export interface TaskStatus {
  readonly taskId: string;
  readonly state: number;
  readonly progress: number;
  readonly videos: readonly string[];
  readonly error?: string;
}

interface ProviderEnvelope<T> {
  readonly status?: number;
  readonly message?: string;
  readonly data?: T;
}

const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/** Only transport-level faults and 5xx are worth retrying; a 4xx is a real rejection. */
function isTransient(err: unknown): boolean {
  if (err instanceof MoneyPrinterTurboApiError) return err.statusCode >= 500;
  return err instanceof MoneyPrinterTurboError ? false : true;
}

export class MoneyPrinterTurboAdapter {
  public readonly providerId = MONEYPRINTERTURBO_PROVIDER_ID;

  constructor(private readonly config: MoneyPrinterTurboConfig = resolveConfig()) {}

  private async request(path: string, init: RequestInit = {}): Promise<Response> {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), this.config.requestTimeoutMs);
    try {
      return await fetch(`${this.config.baseUrl}${path}`, {
        ...init,
        signal: controller.signal,
        headers: {
          ...(init.headers ?? {}),
          'x-api-key': this.config.apiKey,
        },
      });
    } finally {
      clearTimeout(timer);
    }
  }

  private async requestJson<T>(path: string, init: RequestInit = {}): Promise<T> {
    let lastError: unknown;
    for (let attempt = 0; attempt <= this.config.maxTransientRetries; attempt += 1) {
      try {
        const response = await this.request(path, init);
        if (!response.ok) {
          throw new MoneyPrinterTurboApiError(response.status, (await response.text()).slice(0, 300));
        }
        const envelope = (await response.json()) as ProviderEnvelope<T>;
        if (envelope.data === undefined) {
          throw new MoneyPrinterTurboApiError(response.status, `response carried no data: ${envelope.message ?? ''}`);
        }
        return envelope.data;
      } catch (err) {
        lastError = err;
        if (!isTransient(err) || attempt === this.config.maxTransientRetries) break;
        await delay(this.config.pollIntervalMs);
      }
    }
    throw lastError instanceof MoneyPrinterTurboError
      ? lastError
      : new MoneyPrinterTurboError(`MoneyPrinterTurbo unreachable: ${String(lastError)}`);
  }

  /** Provider health check. Never throws — an unreachable provider is a false, not an error. */
  public async checkHealth(): Promise<boolean> {
    try {
      const response = await this.request('/ping');
      return response.ok;
    } catch {
      return false;
    }
  }

  /** Submit a production task; returns the provider's task id. */
  public async submitProduction(request: VideoProductionRequest): Promise<string> {
    const data = await this.requestJson<{ task_id: string }>('/api/v1/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        video_subject: request.subject,
        // Omitted rather than sent empty: the provider writes its own script
        // only when this is absent, and an empty string is not an absence.
        ...(request.script ? { video_script: request.script } : {}),
        ...(request.visualTerms && request.visualTerms.length > 0
          ? { video_terms: toSearchTerms(request.visualTerms), match_materials_to_script: true }
          : {}),
        video_language: request.language ?? 'Arabic',
        paragraph_number: request.paragraphCount ?? 2,
        voice_name: request.voiceName ?? '',
        video_source: 'pexels',
        video_aspect: request.aspect ?? '9:16',
        video_clip_duration: request.clipDurationSeconds ?? 5,
        video_count: 1,
        subtitle_enabled: request.subtitlesEnabled ?? true,
        font_name: request.fontName ?? 'NotoSansArabic-Bold.ttf',
      }),
    });
    if (!data?.task_id) {
      throw new MoneyPrinterTurboError('MoneyPrinterTurbo accepted the request but returned no task id');
    }
    return data.task_id;
  }

  /** Single status read. */
  public async pollTask(taskId: string): Promise<TaskStatus> {
    const d = await this.requestJson<{
      task_id: string; state: number; progress?: number; videos?: string[]; error?: string;
    }>(`/api/v1/tasks/${encodeURIComponent(taskId)}`);
    return {
      taskId: d.task_id,
      state: d.state,
      progress: d.progress ?? 0,
      videos: d.videos ?? [],
      error: d.error,
    };
  }

  /** Poll until the task completes, fails, or the whole-production ceiling is hit. */
  public async awaitCompletion(taskId: string): Promise<{ status: TaskStatus; pollCount: number }> {
    const deadline = Date.now() + this.config.taskTimeoutMs;
    let pollCount = 0;
    while (Date.now() < deadline) {
      await delay(this.config.pollIntervalMs);
      pollCount += 1;
      const status = await this.pollTask(taskId);
      if (status.state === TASK_STATE_COMPLETE) return { status, pollCount };
      if (status.state === TASK_STATE_FAILED) {
        throw new MoneyPrinterTurboTaskFailedError(taskId, status.error ?? 'provider reported failure');
      }
    }
    throw new MoneyPrinterTurboTimeoutError(taskId, this.config.taskTimeoutMs);
  }

  /** Retrieve a finished artefact, refusing anything above the size ceiling. */
  public async retrieveOutput(providerPath: string): Promise<Buffer> {
    const response = await this.request(providerPath);
    if (!response.ok) {
      throw new MoneyPrinterTurboApiError(response.status, `could not retrieve ${providerPath}`);
    }

    const declared = Number(response.headers.get('content-length') ?? NaN);
    if (Number.isFinite(declared) && declared > this.config.maxOutputBytes) {
      throw new MoneyPrinterTurboOutputTooLargeError(declared, this.config.maxOutputBytes);
    }

    const bytes = Buffer.from(await response.arrayBuffer());
    if (bytes.length > this.config.maxOutputBytes) {
      throw new MoneyPrinterTurboOutputTooLargeError(bytes.length, this.config.maxOutputBytes);
    }
    return bytes;
  }

  /** The whole journey: submit, wait, retrieve. Owns nothing it returns. */
  public async produce(request: VideoProductionRequest): Promise<VideoProductionResult> {
    const startedAt = Date.now();
    const taskId = await this.submitProduction(request);
    const { status, pollCount } = await this.awaitCompletion(taskId);

    const providerOutputPath = status.videos[0];
    if (!providerOutputPath) {
      throw new MoneyPrinterTurboTaskFailedError(taskId, 'task completed without producing a video');
    }

    const bytes = await this.retrieveOutput(providerOutputPath);

    return {
      providerId: MONEYPRINTERTURBO_PROVIDER_ID,
      taskId,
      providerOutputPath,
      bytes,
      usage: {
        elapsedMs: Date.now() - startedAt,
        pollCount,
        outputBytes: bytes.length,
      },
    };
  }
}
