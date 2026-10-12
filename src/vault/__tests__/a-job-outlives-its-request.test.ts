/**
 * AZMA OS — SUBMISSION IS NOT COMPLETION · 2026-10-12
 *
 * ─── WHAT WAS MEASURED, AND WHAT IT COST TO LEARN ───────────────────────────
 *
 *   Nine paid jobs ran on production. TWO returned nothing to the caller — one
 *   cut at the edge's hundred-second ceiling, one dead on the wire after
 *   fifty-seven minutes — and BOTH completed, were charged, and deposited.
 *
 *   A Creator in that position reads «failed» about work they paid for. These
 *   tests hold the four promises that make that impossible, and each one is a
 *   separate `it` because each can break on its own.
 */

import { DatabaseSync } from 'node:sqlite';
import { SCHEMA_STATEMENTS } from '../../persistent-storage/schema';
import {
  claimJob, getJob, readJobTruthfully, markDeposited, markFailed, markUnknown,
  idempotencyKeyFor, liveJobByKey, WORKER_BOOT_ID,
} from '../../persistent-storage/creative-job-repository';

const freshDb = (): DatabaseSync => {
  const db = new DatabaseSync(':memory:');
  for (const statement of SCHEMA_STATEMENTS) db.exec(statement);
  return db;
};

const JOB = {
  creatorId: 'creator-1',
  operation: 'lip-sync',
  targetAssetId: 'asset_clip',
  secondAssetId: 'asset_voice',
  durationSeconds: 3,
  sourceFps: 25,
  chargedUnits: 128,
};

describe('1 · a retry does not buy a second job', () => {
  it('the same request twice yields ONE job', () => {
    const db = freshDb();
    const first = claimJob(db, JOB);
    const second = claimJob(db, JOB);
    expect(first.claimed).toBe(true);
    expect(second.claimed).toBe(false);
    expect(second.row.jobId).toBe(first.row.jobId);
  });

  it('and the key is the request itself — no clock, no nonce', () => {
    // A key with time in it makes every retry unique, which is the duplicate
    // this exists to prevent.
    const a = idempotencyKeyFor(JOB);
    const b = idempotencyKeyFor({ ...JOB });
    expect(a).toBe(b);
  });

  it('a different duration is a different job', () => {
    expect(idempotencyKeyFor({ ...JOB, durationSeconds: 5 })).not.toBe(idempotencyKeyFor(JOB));
  });

  it('another Creator’s identical request is a different job', () => {
    expect(idempotencyKeyFor({ ...JOB, creatorId: 'creator-2' })).not.toBe(idempotencyKeyFor(JOB));
  });

  it('once it has finished, a fresh submission IS allowed to run again', () => {
    const db = freshDb();
    const first = claimJob(db, JOB);
    markDeposited(db, first.row.jobId, { outputAssetId: 'asset_out', providerCreditsCharged: 75 });
    const second = claimJob(db, JOB);
    // A Creator may deliberately run the same act twice. What is prevented is
    // a DUPLICATE OF A RUNNING JOB, not a second deliberate act.
    expect(second.claimed).toBe(true);
    expect(second.row.jobId).not.toBe(first.row.jobId);
  });

  it('a finished job is not «live» for the next retry to find', () => {
    const db = freshDb();
    const { row } = claimJob(db, JOB);
    markFailed(db, row.jobId, 'engine-refused', 'x');
    expect(liveJobByKey(db, row.idempotencyKey)).toBeNull();
  });
});

describe('2 · a job never reports failure because a request ended', () => {
  it('a claimed job starts PROCESSING, not failed and not finished', () => {
    const db = freshDb();
    const { row } = claimJob(db, JOB);
    expect(row.state).toBe('PROCESSING');
    expect(row.finishedAtMs).toBeNull();
  });

  it('only a real verdict writes a terminal state', () => {
    const db = freshDb();
    const { row } = claimJob(db, JOB);
    markDeposited(db, row.jobId, { outputAssetId: 'asset_out', providerCreditsCharged: 75 });
    const after = getJob(db, row.jobId)!;
    expect(after.state).toBe('DEPOSITED');
    expect(after.outputAssetId).toBe('asset_out');
    expect(after.providerCreditsCharged).toBe(75);
    expect(after.finishedAtMs).not.toBeNull();
  });

  it('a failure carries its reason and never an asset', () => {
    const db = freshDb();
    const { row } = claimJob(db, JOB);
    markFailed(db, row.jobId, 'engine-refused', 'the engine refused');
    const after = getJob(db, row.jobId)!;
    expect(after.state).toBe('FAILED');
    expect(after.outputAssetId).toBeNull();
    expect(after.errorReason).toBe('engine-refused');
  });
});

describe('3 · a job nobody is running says so, and says UNKNOWN', () => {
  it('a job from this boot keeps running', () => {
    const db = freshDb();
    const { row } = claimJob(db, JOB);
    expect(readJobTruthfully(db, row.jobId)!.state).toBe('PROCESSING');
  });

  it('a job left by a process that is gone becomes UNKNOWN on reading', () => {
    const db = freshDb();
    const { row } = claimJob(db, JOB);
    // The process that owned it is gone — a restart, a crash, a redeploy.
    db.prepare('UPDATE creative_jobs SET worker_boot_id = ? WHERE job_id = ?')
      .run('a-previous-boot', row.jobId);
    const read = readJobTruthfully(db, row.jobId)!;
    expect(read.state).toBe('UNKNOWN');
  });

  it('UNKNOWN is never FAILED — a charge may exist, and we do not pretend', () => {
    const db = freshDb();
    const { row } = claimJob(db, JOB);
    markUnknown(db, row.jobId, 'process gone');
    const after = getJob(db, row.jobId)!;
    expect(after.state).toBe('UNKNOWN');
    expect(after.errorReason).toBeNull();
  });

  it('and a terminal job is never re-opened as UNKNOWN', () => {
    const db = freshDb();
    const { row } = claimJob(db, JOB);
    markDeposited(db, row.jobId, { outputAssetId: 'a', providerCreditsCharged: 1 });
    markUnknown(db, row.jobId, 'late arrival');
    expect(getJob(db, row.jobId)!.state).toBe('DEPOSITED');
  });

  it('the boot id of this process is what distinguishes them', () => {
    expect(typeof WORKER_BOOT_ID).toBe('string');
    expect(WORKER_BOOT_ID.length).toBeGreaterThan(8);
  });
});

describe('4 · the record holds every thread the report must follow', () => {
  it('request, provider job, charge, output and parent are all on one row', () => {
    const db = freshDb();
    const { row } = claimJob(db, JOB);
    db.prepare('UPDATE creative_jobs SET provider_job_id = ? WHERE job_id = ?')
      .run('cmv_provider_job', row.jobId);
    markDeposited(db, row.jobId, { outputAssetId: 'asset_out', providerCreditsCharged: 75 });
    const after = getJob(db, row.jobId)!;
    expect(after.targetAssetId).toBe('asset_clip');      // the original
    expect(after.providerJobId).toBe('cmv_provider_job'); // the provider's own
    expect(after.outputAssetId).toBe('asset_out');        // what it produced
    expect(after.providerCreditsCharged).toBe(75);        // what it cost us
    expect(after.chargedUnits).toBe(128);                 // what the Creator paid
  });

  it('the frame rate the charge was computed from is kept', () => {
    const db = freshDb();
    const { row } = claimJob(db, JOB);
    expect(row.sourceFps).toBe(25);
    // Without it, nobody could later check why 75 frames were billed.
  });
});
