import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { getDb } from '@/src/persistent-storage';
import { CREATIVE_INPUT_SHAPE } from '@/src/vault/creative-operation-runner';
import type { CreativeOperationId } from '@/src/core/sovereign-ai-integration/adapters/magic-hour-creative-operations';
import {
  submitCreativeJob, priceSubmission, resolveSourceFps,
} from '@/src/vault/creative-job-service';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * POST /api/vault/assets/[assetId]/creative/[operation]
 *
 * ─── IT STARTS A JOB. IT NO LONGER IS ONE ───────────────────────────────────
 *
 *   MEASURED 2026-10-12: two of nine paid jobs returned nothing to the caller
 *   — one cut at the edge's hundred-second limit, one dead after fifty-seven
 *   minutes — while the server finished, was charged, and deposited both. A
 *   Creator watching either would have been told «failed» about work they had
 *   paid for and which had succeeded.
 *
 *   So this door now answers in milliseconds with a durable job id, and
 *   `GET /api/qiyamah/jobs/[jobId]` answers the question «what happened?».
 *   Closing the tab costs nothing; pressing twice costs nothing, because the
 *   second press finds the first job and is handed it back.
 *
 * ─── AND IT STILL GRANTS NOTHING ────────────────────────────────────────────
 *
 *   Session, catalog verdict, ownership, family, derivability and the likeness
 *   declaration are all checked where they always were — inside
 *   `runCreativeOperation`, in that order. This file validates a shape, prices
 *   the request, and hands it on.
 */

function isCreativeOperation(value: string): value is CreativeOperationId {
  return Object.prototype.hasOwnProperty.call(CREATIVE_INPUT_SHAPE, value);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ assetId: string; operation: string }> },
) {
  const { assetId, operation } = await context.params;

  const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value ?? '');
  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'سجّل دخولك أوّلاً.' },
      { status: 401 },
    );
  }

  if (!isCreativeOperation(operation)) {
    return NextResponse.json(
      { status: 'failed', reason: 'unknown-operation', message: 'لا توجد عمليّةٌ بهذا الاسم.' },
      { status: 404 },
    );
  }

  let body: unknown = null;
  try { body = await request.json(); } catch { body = null; }
  const b = (body ?? {}) as {
    secondAssetId?: unknown; durationSeconds?: unknown;
    sourceFps?: unknown; likenessAcknowledgment?: unknown;
  };

  const outcome = await submitCreativeJob(getDb(), {
    operation,
    creatorId: session.creatorId,
    targetAssetId: assetId,
    secondAssetId: typeof b.secondAssetId === 'string' ? b.secondAssetId : undefined,
    durationSeconds: typeof b.durationSeconds === 'number' ? b.durationSeconds : undefined,
    sourceFps: typeof b.sourceFps === 'number' ? b.sourceFps : undefined,
    // Handed on EXACTLY as it arrived — never normalised, never defaulted.
    likenessAcknowledgment: b.likenessAcknowledgment,
  });

  if (!outcome.ok) {
    const status = outcome.reason === 'insufficient-balance' ? 402
      : outcome.reason === 'unpriceable' ? 400 : 409;
    console.error('[creative/submit]', operation, outcome.reason, outcome.detailEn);
    return NextResponse.json(
      {
        status: 'failed', reason: outcome.reason, message: outcome.messageAr,
        ...(outcome.requiredUnits === undefined ? {} : {
          requiredUnits: outcome.requiredUnits, availableUnits: outcome.availableUnits,
        }),
      },
      { status },
    );
  }

  return NextResponse.json({
    status: 'accepted',
    jobId: outcome.jobId,
    // False means: a job of this exact shape was already running, and this is
    // it. The Creator is not charged twice for pressing twice.
    startedNow: outcome.claimed,
    chargedUnits: outcome.chargedUnits,
    state: outcome.state,
    pollPath: `/api/qiyamah/jobs/${outcome.jobId}`,
  }, { status: 202 });
}

/**
 * GET — what this act will cost, before anything is spent.
 *
 * The same price the submission will use, from the same function. A quote a
 * Creator reads and a charge they pay that came from two places is how the two
 * drift apart.
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ assetId: string; operation: string }> },
) {
  const { assetId, operation } = await context.params;
  const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value ?? '');
  if (!session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized' }, { status: 401 });
  }
  if (!isCreativeOperation(operation)) {
    return NextResponse.json({ status: 'failed', reason: 'unknown-operation' }, { status: 404 });
  }

  const url = new URL(request.url);
  const seconds = Number(url.searchParams.get('durationSeconds'));
  const fps = Number(url.searchParams.get('sourceFps'));

  const base = {
    operation, creatorId: session.creatorId, targetAssetId: assetId,
    durationSeconds: Number.isFinite(seconds) && seconds > 0 ? seconds : undefined,
    sourceFps: Number.isFinite(fps) && fps > 0 ? fps : undefined,
  };
  // The same measurement the charge will use, so the quote and the charge can
  // never be two different numbers.
  const price = priceSubmission({ ...base, sourceFps: await resolveSourceFps(getDb(), base) });

  if (!price.ok) {
    return NextResponse.json({
      status: 'unpriceable',
      // Said plainly: this is not a refusal of the act, it is a refusal to
      // guess at what it would take from the Creator.
      message: 'لا نَستطيع تحديدَ كلفةِ هذا الطلب قبل تنفيذه — ولن نُنفّذ ما لا نَعرف كلفته.',
    }, { status: 200 });
  }

  // The Creator's view: the charge and its basis. No provider, no credits,
  // no uplift, no margin.
  return NextResponse.json({
    status: 'succeeded',
    chargedUnits: price.chargedUnits,
    basisAr: price.basisAr,
    quantity: price.quantity,
  });
}

/** A Creator's own recent jobs for this act — so a lost tab is recoverable. */
export async function PATCH(request: NextRequest) {
  // Reserved: a cancel path belongs here when the provider exposes one. It is
  // deliberately not implemented rather than faked — the provider documents no
  // cancellation for these endpoints, and a button that pretends to stop a
  // paid job is worse than no button.
  void request;
  return NextResponse.json(
    { status: 'failed', reason: 'not-implemented', message: 'لا يُمكن إيقافُ عمليّةٍ بدأت عند المحرّك.' },
    { status: 501 },
  );
}

