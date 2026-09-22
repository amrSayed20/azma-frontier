/**
 * AZMA OS — Qiyamah
 * Generation observability: every attempt leaves a trail that can be read.
 *
 * ─── WHY ─────────────────────────────────────────────────────────────────────
 *
 *   On 2026-09-22 a generation was requested in production, nothing was
 *   recorded, and nobody could say why: the orchestration call sat inside
 *   `catch {}` and the Creator saw «generation failed». An attempt that
 *   cannot explain itself cannot be repaired.
 *
 *   This is a logger with a spine, not an engine: one operation id per
 *   attempt, threaded from the route through the service to the provider
 *   binding and back into the response, and one JSON line per stage on the
 *   server. Reading the log for an operation id answers, in order:
 *
 *     requested → selected → submitted → provider done → downloaded →
 *     file persisted → record inserted → asset deposited → available
 *
 *   or exactly where that chain broke and what the provider said.
 *
 *   No secrets: provider messages are trimmed and never include headers,
 *   keys or download URLs.
 */

export type OperationKind = 'image-generation' | 'video-generation' | 'image-edit' | 'image-animation';

export type FailureCategory =
  | 'invalid-input'
  | 'rate-limited'
  | 'selection'
  | 'provider-unavailable'
  | 'provider-rejected'
  | 'provider-failed'
  | 'provider-timeout'
  | 'download'
  | 'invalid-output'
  | 'storage'
  | 'record'
  | 'deposit'
  | 'ownership';

export interface OperationFailure {
  readonly operationId: string;
  readonly stage: string;
  readonly category: FailureCategory;
  /** Safe to show and to log: trimmed, no secrets, no URLs. */
  readonly detail: string;
}

export interface OperationTrail {
  readonly operationId: string;
  /** Record that a stage was reached, with what is known at that point. */
  stage(name: string, data?: Record<string, unknown>): void;
  /** Record the failure and return it in the shape a route can answer with. */
  fail(stage: string, category: FailureCategory, detail: string, data?: Record<string, unknown>): OperationFailure;
  /** The attempt reached its end successfully. */
  done(data?: Record<string, unknown>): void;
}

const MAX_DETAIL = 240;

/** Trim a provider's or an exception's words to something safe to keep. */
export function safeDetail(err: unknown): string {
  const raw = err instanceof Error ? err.message : typeof err === 'string' ? err : JSON.stringify(err ?? null);
  return (raw ?? '')
    .replace(/https?:\/\/\S+/g, '[url]')
    .replace(/(api[_-]?key|authorization|bearer)\s*[:=]\s*\S+/gi, '$1=[redacted]')
    .slice(0, MAX_DETAIL);
}

export function beginOperation(init: {
  readonly operationId: string;
  readonly kind: OperationKind;
  readonly ownerId: string | null;
  readonly sourceAssetId?: string | null;
}): OperationTrail {
  const startedAt = Date.now();
  const base = {
    operationId: init.operationId,
    kind: init.kind,
    ownerId: init.ownerId,
    sourceAssetId: init.sourceAssetId ?? null,
  };
  const line = (stage: string, extra: Record<string, unknown>) => {
    console.log('[QiyamahOperation]', JSON.stringify({ ...base, stage, elapsedMs: Date.now() - startedAt, ...extra }));
  };
  line('requested', { requestedAt: startedAt });

  return {
    operationId: init.operationId,
    stage: (name, data = {}) => line(name, data),
    fail: (stage, category, detail, data = {}) => {
      const failure: OperationFailure = { operationId: init.operationId, stage, category, detail: detail.slice(0, MAX_DETAIL) };
      line('failed', { failedAt: stage, category, detail: failure.detail, ...data });
      return failure;
    },
    done: (data = {}) => line('available', data),
  };
}
