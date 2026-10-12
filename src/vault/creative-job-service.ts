/**
 * AZMA OS — SUBMISSION IS NOT COMPLETION, AND NOW THE CODE SAYS SO
 *
 * ─── WHAT THIS SEPARATES, AND WHY IT HAD TO BE SEPARATED ────────────────────
 *
 *   Measured on production, 2026-10-12: of nine paid jobs, two returned
 *   nothing to the caller. One hit the edge's hundred-second ceiling (HTTP
 *   524); one died on the wire after fifty-seven minutes. BOTH completed
 *   server-side, were charged, and deposited their assets.
 *
 *   A Creator watching either of those would have been told «failed» about
 *   work that succeeded and that they had paid for. That is the exact class of
 *   untruth this chamber keeps removing, so the shape changes:
 *
 *       submit  →  a durable job id, in milliseconds
 *       poll    →  the state the job is ACTUALLY in
 *
 *   Nothing about the execution sequence moves. `runCreativeOperation` still
 *   performs every guard in the same order and is still the only path to a
 *   provider. What changes is who waits for it: a background task, not a
 *   browser holding a socket open through a proxy that will cut it.
 *
 * ─── THE FOUR PROMISES THIS FILE KEEPS ──────────────────────────────────────
 *
 *   1. A retry does not buy a second job. The idempotency key is the request
 *      itself, and a live job of the same shape is HANDED BACK.
 *   2. A job never reports failure because a request timed out. Only the
 *      runner's own verdict writes FAILED.
 *   3. A job nobody is running says UNKNOWN, with the provider's job id, so
 *      the question can be settled rather than guessed.
 *   4. The charge is reserved before the provider is called and settled or
 *      released by the outcome — never left hanging on a lost connection.
 */

import type { DatabaseSync } from 'node:sqlite';
import {
  claimJob, getJob, readJobTruthfully, markDeposited, markFailed,
  type CreativeJobRow,
} from '../persistent-storage/creative-job-repository';
import { CreatorCreditRepository } from '../economy/credit-ledger/credit-ledger-repository';
import {
  runCreativeOperation, type CreativeRunRequest, type CreativeRunRejection,
} from './creative-operation-runner';
import {
  priceNewCapability, type NewCapability, type PriceVerdict,
} from '../economy/pricing/new-capability-pricing';
import type { CreativeOperationId } from '../core/sovereign-ai-integration/adapters/magic-hour-creative-operations';
import { getVaultAsset } from '../persistent-storage';
import { measureSourceFps } from './asset-frame-rate';

/** Which priced capability each act consumes. One map, read by both paths. */
export const CAPABILITY_OF_OPERATION: Readonly<Record<CreativeOperationId, NewCapability>> = {
  'background-removal': 'BACKGROUND_REMOVAL',
  'lip-sync': 'LIP_SYNC',
  'face-swap': 'FACE_SWAP',
  'talking-photo': 'TALKING_PHOTO',
};

export interface SubmitRequest {
  readonly operation: CreativeOperationId;
  readonly creatorId: string;
  readonly targetAssetId: string;
  readonly secondAssetId?: string;
  readonly durationSeconds?: number;
  /** The SOURCE clip's measured frame rate. Required by a frame-billed act. */
  readonly sourceFps?: number;
  readonly likenessAcknowledgment?: unknown;
  /** A Founder cost measurement, when this is one. Never set by a Creator. */
  readonly costMeasurement?: CreativeRunRequest['costMeasurement'];
  /** Set only by the measurement door: the campaign pays, not the Creator. */
  readonly skipBalance?: boolean;
}

export type SubmitOutcome =
  | {
      readonly ok: true;
      readonly jobId: string;
      /** False when a live job of the same shape already existed. */
      readonly claimed: boolean;
      readonly chargedUnits: number | null;
      readonly state: CreativeJobRow['state'];
    }
  | {
      readonly ok: false;
      readonly reason: 'unpriceable' | 'insufficient-balance' | 'rejected';
      readonly messageAr: string;
      readonly detailEn: string;
      readonly rejection?: CreativeRunRejection;
      readonly requiredUnits?: number;
      readonly availableUnits?: number;
    };

/**
 * What this job will cost the Creator, before anything is spent.
 *
 * A refusal here is the point: an act whose charge cannot be bounded must not
 * be offered. A frame-billed act with no measured frame rate is exactly that.
 */
export function priceSubmission(request: SubmitRequest): PriceVerdict {
  return priceNewCapability({
    capability: CAPABILITY_OF_OPERATION[request.operation],
    imageCount: 1,
    requestedSeconds: request.durationSeconds,
    sourceFps: request.sourceFps,
  });
}

/**
 * The frame rate a frame-billed act must be priced with — MEASURED BY US.
 *
 * Asked of the file, not of the browser and not of a default. A Creator never
 * learns the word «fps»: they choose a clip and a duration, and the Empire
 * reads the rest off their own asset. Null means the price cannot be stated,
 * and `priceSubmission` then refuses rather than guesses.
 */
export async function resolveSourceFps(
  db: DatabaseSync,
  request: SubmitRequest,
): Promise<number | undefined> {
  if (request.sourceFps && request.sourceFps > 0) return request.sourceFps;
  const capability = CAPABILITY_OF_OPERATION[request.operation];
  if (capability !== 'LIP_SYNC' && capability !== 'FACE_SWAP') return undefined;
  const target = getVaultAsset(db, request.targetAssetId);
  if (!target || target.subscriberTenantId !== request.creatorId) return undefined;
  const fps = await measureSourceFps(target.secureStorageUri);
  return fps ?? undefined;
}

/**
 * Start the work and return at once.
 *
 * The background task is deliberately NOT awaited. Its failure path writes to
 * the job row, so nothing is lost by not holding it: the row is the record.
 */
export async function submitCreativeJob(
  db: DatabaseSync,
  rawRequest: SubmitRequest,
): Promise<SubmitOutcome> {
  // The frame rate is measured off the Creator's own file before anything is
  // priced, reserved or sent. One resolution, used by the quote and by the
  // charge — a quote and a charge computed from different numbers is how the
  // two drift apart.
  const request: SubmitRequest = {
    ...rawRequest,
    sourceFps: await resolveSourceFps(db, rawRequest),
  };
  const price = priceSubmission(request);
  const paying = !request.skipBalance;

  if (paying && !price.ok) {
    return {
      ok: false, reason: 'unpriceable',
      messageAr: 'لا يُمكن تحديدُ كلفةِ هذا الطلب قبل تنفيذه، فلن يُنفَّذ.',
      detailEn: price.missing,
    };
  }

  const credits = new CreatorCreditRepository(db);
  let reservationId: string | null = null;
  let chargedUnits: number | null = null;

  if (paying && price.ok) {
    chargedUnits = price.chargedUnits;
    const balance = credits.getBalance(request.creatorId);
    if (balance.availableUnits < chargedUnits) {
      return {
        ok: false, reason: 'insufficient-balance',
        messageAr: 'رصيدُك لا يَكفي لهذه العمليّة.',
        detailEn: `needs ${chargedUnits}, has ${balance.availableUnits}`,
        requiredUnits: chargedUnits,
        availableUnits: balance.availableUnits,
      };
    }
  }

  // ── THE JOB IS CLAIMED BEFORE A SINGLE CREDIT MOVES ────────────────────
  //   A retry that arrives while this one runs finds it here and is handed
  //   the same job — so two presses can never become two charges.
  const { claimed, row } = claimJob(db, {
    creatorId: request.creatorId,
    operation: request.operation,
    targetAssetId: request.targetAssetId,
    secondAssetId: request.secondAssetId ?? null,
    durationSeconds: request.durationSeconds ?? null,
    sourceFps: request.sourceFps ?? null,
    chargedUnits,
  });
  if (!claimed) {
    return { ok: true, jobId: row.jobId, claimed: false, chargedUnits: row.chargedUnits, state: row.state };
  }

  if (paying && chargedUnits !== null) {
    try {
      const reservation = credits.reserve(
        request.creatorId, chargedUnits, `qiyamah:creative:${row.jobId}`,
        { capability: request.operation, gatewayId: 'magic-hour' },
      );
      reservationId = reservation.reservationId;
      db.prepare('UPDATE creative_jobs SET reservation_id = ? WHERE job_id = ?')
        .run(reservationId, row.jobId);
    } catch (err) {
      markFailed(db, row.jobId, 'reservation-failed', String(err).slice(0, 200));
      return {
        ok: false, reason: 'insufficient-balance',
        messageAr: 'تعذّر حجزُ رصيدك لهذه العمليّة.',
        detailEn: String(err).slice(0, 200),
      };
    }
  }

  // Fire and DO NOT await. The row is the record of what happens next.
  void executeJob(db, row.jobId, request, reservationId, credits);

  return { ok: true, jobId: row.jobId, claimed: true, chargedUnits, state: 'PROCESSING' };
}

/**
 * The background half. It owns the outcome, and writes it down.
 *
 * Every exit writes a terminal state and resolves the reservation. A path that
 * could leave a job PROCESSING for ever, or units reserved for ever, is the
 * same silent debt this chamber has closed twice before.
 */
async function executeJob(
  db: DatabaseSync,
  jobId: string,
  request: SubmitRequest,
  reservationId: string | null,
  credits: CreatorCreditRepository,
): Promise<void> {
  try {
    const outcome = await runCreativeOperation(db, {
      operation: request.operation,
      creatorId: request.creatorId,
      targetAssetId: request.targetAssetId,
      secondAssetId: request.secondAssetId,
      durationSeconds: request.durationSeconds,
      likenessAcknowledgment: request.likenessAcknowledgment,
      costMeasurement: request.costMeasurement,
    });

    if (outcome.ok) {
      markDeposited(db, jobId, {
        outputAssetId: outcome.assetId,
        providerCreditsCharged: outcome.providerCreditsCharged,
      });
      if (reservationId) {
        const job = getJob(db, jobId);
        try { credits.settle(reservationId, job?.chargedUnits ?? 0); } catch { /* non-fatal */ }
      }
      return;
    }

    markFailed(db, jobId, outcome.rejection, outcome.detailEn);
    if (reservationId) {
      // The Creator pays for an act that did not happen exactly never.
      try { credits.release(reservationId, `creative_${outcome.rejection}`); } catch { /* non-fatal */ }
    }
  } catch (err) {
    markFailed(db, jobId, 'engine-refused', String(err).slice(0, 300));
    if (reservationId) {
      try { credits.release(reservationId, 'creative_threw'); } catch { /* non-fatal */ }
    }
  }
}

/** What a Creator's poll is answered with. Never more than is known. */
export interface JobView {
  readonly jobId: string;
  readonly operation: string;
  readonly state: CreativeJobRow['state'];
  readonly stateAr: string;
  readonly chargedUnits: number | null;
  readonly assetId: string | null;
  readonly parentAssetId: string;
  readonly errorAr: string | null;
  readonly startedAtMs: number;
  readonly finishedAtMs: number | null;
}

const STATE_AR: Readonly<Record<CreativeJobRow['state'], string>> = {
  PROCESSING: 'جارٍ الآن — أغلِق الصفحةَ إن شئت، فالعملُ لا يَتوقّف.',
  DEPOSITED: 'تَمّ، وأُودِع في خزانتك بانتظار قبولك.',
  FAILED: 'لم يَتِمّ، ولم يُخصَم من رصيدك شيء.',
  CANCELLED: 'أُلغيت.',
  UNKNOWN: 'انقطعت متابعتُنا لهذه العمليّة. قد تكون تَمّت عند المحرّك، ولا نَدّعي '
    + 'علمَ ما لا نَعلم — راجِعنا بمعرّفها.',
};

/** Read one job, as its owner. Another Creator's job is not found. */
export function viewJob(db: DatabaseSync, jobId: string, creatorId: string): JobView | null {
  const row = readJobTruthfully(db, jobId);
  if (!row || row.creatorId !== creatorId) return null;
  return {
    jobId: row.jobId,
    operation: row.operation,
    state: row.state,
    stateAr: STATE_AR[row.state],
    chargedUnits: row.chargedUnits,
    assetId: row.outputAssetId,
    parentAssetId: row.targetAssetId,
    errorAr: row.state === 'FAILED' ? STATE_AR.FAILED : null,
    startedAtMs: row.createdAtMs,
    finishedAtMs: row.finishedAtMs,
  };
}
