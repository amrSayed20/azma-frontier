/**
 * AZMA OS — THE JOB THAT OUTLIVES ITS REQUEST
 *
 * ─── WHY THIS EXISTS, MEASURED ──────────────────────────────────────────────
 *
 *   The acceptance campaign of 2026-10-12 ran nine paid jobs. Two of them
 *   returned NOTHING to the caller — one HTTP 524 at the edge's hundred-second
 *   limit, one dead connection after fifty-seven minutes — while the server
 *   completed both, was charged for both, and deposited both assets.
 *
 *   A Creator in that position reads «failed» about work that succeeded and
 *   that they paid for. So the request stops being the job: it STARTS one, and
 *   the job lives here until it reaches a terminal state.
 *
 * ─── THE FIVE STATES, AND THE ONE THAT IS USUALLY MISSING ───────────────────
 *
 *   PROCESSING · DEPOSITED · FAILED · CANCELLED — and UNKNOWN.
 *
 *   UNKNOWN is the honest answer to a question this Empire can actually be
 *   asked: a job was PROCESSING, the process that owned it is gone, and
 *   nobody knows whether the provider finished. Reporting FAILED there would
 *   be a lie about a charge that may exist; reporting PROCESSING would be a
 *   lie about work nobody is doing. The provider's own job id is kept so the
 *   question can be settled rather than guessed.
 */

import type { DatabaseSync } from 'node:sqlite';
import { randomUUID, createHash } from 'crypto';

/** One boot of this process. A job owned by another boot is nobody's. */
export const WORKER_BOOT_ID = randomUUID();

export type CreativeJobState =
  | 'PROCESSING'
  | 'DEPOSITED'
  | 'FAILED'
  | 'CANCELLED'
  | 'UNKNOWN';

export const TERMINAL_STATES: readonly CreativeJobState[] = [
  'DEPOSITED', 'FAILED', 'CANCELLED', 'UNKNOWN',
];

export interface CreativeJobRow {
  readonly jobId: string;
  readonly creatorId: string;
  readonly operation: string;
  readonly targetAssetId: string;
  readonly secondAssetId: string | null;
  readonly durationSeconds: number | null;
  readonly sourceFps: number | null;
  readonly idempotencyKey: string;
  readonly state: CreativeJobState;
  readonly workerBootId: string | null;
  readonly providerJobId: string | null;
  readonly providerCreditsCharged: number | null;
  readonly chargedUnits: number | null;
  readonly reservationId: string | null;
  readonly outputAssetId: string | null;
  readonly errorReason: string | null;
  readonly errorDetail: string | null;
  readonly createdAtMs: number;
  readonly updatedAtMs: number;
  readonly finishedAtMs: number | null;
}

type Row = Record<string, unknown>;

const toRow = (r: Row): CreativeJobRow => ({
  jobId: r.job_id as string,
  creatorId: r.creator_id as string,
  operation: r.operation as string,
  targetAssetId: r.target_asset_id as string,
  secondAssetId: (r.second_asset_id as string | null) ?? null,
  durationSeconds: (r.duration_seconds as number | null) ?? null,
  sourceFps: (r.source_fps as number | null) ?? null,
  idempotencyKey: r.idempotency_key as string,
  state: r.state as CreativeJobState,
  workerBootId: (r.worker_boot_id as string | null) ?? null,
  providerJobId: (r.provider_job_id as string | null) ?? null,
  providerCreditsCharged: (r.provider_credits_charged as number | null) ?? null,
  chargedUnits: (r.charged_units as number | null) ?? null,
  reservationId: (r.reservation_id as string | null) ?? null,
  outputAssetId: (r.output_asset_id as string | null) ?? null,
  errorReason: (r.error_reason as string | null) ?? null,
  errorDetail: (r.error_detail as string | null) ?? null,
  createdAtMs: r.created_at_ms as number,
  updatedAtMs: r.updated_at_ms as number,
  finishedAtMs: (r.finished_at_ms as number | null) ?? null,
});

/**
 * What makes two submissions THE SAME submission.
 *
 * Creator, act, both inputs and the duration. A Creator pressing twice, a
 * browser retrying a lost connection, and a double-tap on a phone all produce
 * this same key — and `claimJob` hands all three the one running job instead
 * of buying a second one.
 *
 * It deliberately does NOT include a timestamp or a nonce: those would make
 * every retry unique, which is exactly the duplicate this prevents.
 */
export function idempotencyKeyFor(input: {
  readonly creatorId: string;
  readonly operation: string;
  readonly targetAssetId: string;
  readonly secondAssetId?: string | null;
  readonly durationSeconds?: number | null;
}): string {
  return createHash('sha256').update([
    input.creatorId, input.operation, input.targetAssetId,
    input.secondAssetId ?? '', String(input.durationSeconds ?? ''),
  ].join('\u0000')).digest('hex').slice(0, 32);
}

/** A job of this exact shape that is still running, if one exists. */
export function liveJobByKey(db: DatabaseSync, key: string): CreativeJobRow | null {
  const row = db.prepare(
    "SELECT * FROM creative_jobs WHERE idempotency_key = ? AND state = 'PROCESSING' ORDER BY created_at_ms DESC LIMIT 1",
  ).get(key) as Row | undefined;
  return row ? toRow(row) : null;
}

export function getJob(db: DatabaseSync, jobId: string): CreativeJobRow | null {
  const row = db.prepare('SELECT * FROM creative_jobs WHERE job_id = ?').get(jobId) as Row | undefined;
  return row ? toRow(row) : null;
}

export function jobsOfCreator(db: DatabaseSync, creatorId: string, limit = 20): readonly CreativeJobRow[] {
  return (db.prepare(
    'SELECT * FROM creative_jobs WHERE creator_id = ? ORDER BY created_at_ms DESC LIMIT ?',
  ).all(creatorId, limit) as Row[]).map(toRow);
}

export interface NewCreativeJob {
  readonly creatorId: string;
  readonly operation: string;
  readonly targetAssetId: string;
  readonly secondAssetId?: string | null;
  readonly durationSeconds?: number | null;
  readonly sourceFps?: number | null;
  readonly chargedUnits: number | null;
  readonly reservationId?: string | null;
}

/**
 * Take the job, or hand back the one already running.
 *
 * `claimed: false` is not a failure: it is the retry being told «this is
 * already yours and already running», which is the whole point of the key.
 */
export function claimJob(
  db: DatabaseSync,
  job: NewCreativeJob,
): { readonly claimed: boolean; readonly row: CreativeJobRow } {
  const key = idempotencyKeyFor(job);
  const live = liveJobByKey(db, key);
  if (live) return { claimed: false, row: live };

  const now = Date.now();
  const jobId = `job_${now}_${randomUUID().slice(0, 8)}`;
  db.prepare(
    `INSERT INTO creative_jobs (
       job_id, creator_id, operation, target_asset_id, second_asset_id,
       duration_seconds, source_fps, idempotency_key, state, worker_boot_id,
       charged_units, reservation_id, created_at_ms, updated_at_ms
     ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'PROCESSING', ?, ?, ?, ?, ?)`,
  ).run(
    jobId, job.creatorId, job.operation, job.targetAssetId, job.secondAssetId ?? null,
    job.durationSeconds ?? null, job.sourceFps ?? null, key, WORKER_BOOT_ID,
    job.chargedUnits ?? null, job.reservationId ?? null, now, now,
  );
  return { claimed: true, row: getJob(db, jobId)! };
}

/** The provider's own job id, the moment it is known. */
export function recordProviderJob(db: DatabaseSync, jobId: string, providerJobId: string): void {
  db.prepare('UPDATE creative_jobs SET provider_job_id = ?, updated_at_ms = ? WHERE job_id = ?')
    .run(providerJobId, Date.now(), jobId);
}

export function markDeposited(db: DatabaseSync, jobId: string, result: {
  readonly outputAssetId: string;
  readonly providerCreditsCharged: number | null;
  readonly providerJobId?: string | null;
}): void {
  const now = Date.now();
  db.prepare(
    `UPDATE creative_jobs SET state = 'DEPOSITED', output_asset_id = ?,
       provider_credits_charged = ?, provider_job_id = COALESCE(?, provider_job_id),
       updated_at_ms = ?, finished_at_ms = ? WHERE job_id = ?`,
  ).run(result.outputAssetId, result.providerCreditsCharged, result.providerJobId ?? null, now, now, jobId);
}

export function markFailed(db: DatabaseSync, jobId: string, reason: string, detail: string): void {
  const now = Date.now();
  db.prepare(
    `UPDATE creative_jobs SET state = 'FAILED', error_reason = ?, error_detail = ?,
       updated_at_ms = ?, finished_at_ms = ? WHERE job_id = ?`,
  ).run(reason, detail.slice(0, 500), now, now, jobId);
}

export function markCancelled(db: DatabaseSync, jobId: string): void {
  const now = Date.now();
  db.prepare(
    `UPDATE creative_jobs SET state = 'CANCELLED', updated_at_ms = ?, finished_at_ms = ? WHERE job_id = ?`,
  ).run(now, now, jobId);
}

/**
 * A job nobody is running any more.
 *
 * Called when a job is READ and found PROCESSING under a boot id that is not
 * this process's. It is not a failure and not a success: the provider may well
 * have finished. The provider job id stays, so the question is answerable.
 */
export function markUnknown(db: DatabaseSync, jobId: string, detail: string): void {
  const now = Date.now();
  db.prepare(
    `UPDATE creative_jobs SET state = 'UNKNOWN', error_detail = ?, updated_at_ms = ?,
       finished_at_ms = ? WHERE job_id = ? AND state = 'PROCESSING'`,
  ).run(detail.slice(0, 500), now, now, jobId);
}

/**
 * Read a job and tell the truth about it, including the truth that nobody
 * knows. The ONLY place a PROCESSING job becomes UNKNOWN.
 */
export function readJobTruthfully(db: DatabaseSync, jobId: string): CreativeJobRow | null {
  const row = getJob(db, jobId);
  if (!row) return null;
  if (row.state === 'PROCESSING' && row.workerBootId !== WORKER_BOOT_ID) {
    markUnknown(db, jobId,
      'the process that was running this job is no longer running; the provider may have completed it');
    return getJob(db, jobId);
  }
  return row;
}
