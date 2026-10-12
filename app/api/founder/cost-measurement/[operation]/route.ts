import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { getDb, getCreator } from '@/src/persistent-storage';
import { CREATIVE_INPUT_SHAPE } from '@/src/vault/creative-operation-runner';
import { submitCreativeJob } from '@/src/vault/creative-job-service';
import type { CreativeOperationId } from '@/src/core/sovereign-ai-integration/adapters/magic-hour-creative-operations';
import {
  estimateSubmittedJob,
} from '@/src/economy/cost-engine/creative-operations-cost-worksheet';
import {
  campaignSpentCredits, campaignUnreportedJobs,
  COST_MEASUREMENT_CEILING_CREDITS, QIYAMAH_ACCEPTANCE_CAMPAIGN,
} from '@/src/economy/cost-engine/cost-measurement-authority';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

/**
 * POST /api/founder/cost-measurement/[operation]
 *
 * ─── A DOOR BESIDE THE DOOR, AND NOT A WAY THROUGH IT ───────────────────────
 *
 *   The Creator's door refuses these four operations because nobody has
 *   measured what they cost. This one exists to perform that measurement, and
 *   it is the Founder's alone.
 *
 *   What it does NOT do, and this is the whole design:
 *
 *     · it holds no permission of its own — `authorizeCostMeasurement` reads
 *       the role out of the database inside the runner, so this route cannot
 *       grant what it is not owed;
 *     · it builds no request shape, performs no ownership check, and touches
 *       no provider — the same `runCreativeOperation` the Creator's door uses
 *       does all of it, with every guard in the same order;
 *     · it cannot cross a policy block, a missing credential or an
 *       undesignated model. Only an unmeasured cost, which is the one thing a
 *       measurement can answer.
 *
 *   And the likeness declaration is NOT waived here. A face swap run for
 *   measurement is still a face swap, and the Founder declares his rights in
 *   the same words a Creator would.
 *
 * ─── THE CEILING IS READ, NOT REMEMBERED ────────────────────────────────────
 *
 *   What the campaign has already been charged is summed from the assets it
 *   deposited, each carrying the provider's own figure. A restart forgets
 *   nothing, and a second process cannot double-spend.
 */

function isCreativeOperation(value: string): value is CreativeOperationId {
  return Object.prototype.hasOwnProperty.call(CREATIVE_INPUT_SHAPE, value);
}

export async function POST(
  request: NextRequest,
  context: { params: Promise<{ operation: string }> },
) {
  const { operation } = await context.params;

  const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value ?? '');
  if (!session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized' }, { status: 401 });
  }

  // A first check at the door, so a non-Founder is turned away before anything
  // is read. It is NOT the authority: the runner checks the role again, from
  // the database, where no caller can reach.
  const db = getDb();
  const creator = getCreator(db, session.creatorId);
  if (creator?.role !== 'founder') {
    return NextResponse.json({ status: 'failed', reason: 'not-the-founder' }, { status: 403 });
  }

  if (!isCreativeOperation(operation)) {
    return NextResponse.json({ status: 'failed', reason: 'unknown-operation' }, { status: 404 });
  }

  let body: unknown = null;
  try { body = await request.json(); } catch { body = null; }
  const b = (body ?? {}) as {
    targetAssetId?: unknown; secondAssetId?: unknown; durationSeconds?: unknown;
    sourceFps?: unknown; likenessAcknowledgment?: unknown; variant?: unknown;
  };

  if (typeof b.targetAssetId !== 'string' || b.targetAssetId.length === 0) {
    return NextResponse.json({ status: 'failed', reason: 'target-required' }, { status: 400 });
  }

  // ── WHAT THIS JOB IS EXPECTED TO COST, FROM THE JOB ITSELF ───────────────
  //
  //   The estimate refuses a frame-billed act without the source clip's own
  //   frame rate, because the charge IS the frame count. A refusal here is the
  //   estimator doing its job, and the measurement does not begin.
  const estimate = estimateSubmittedJob({
    operation,
    variant: b.variant === 'photo' || b.variant === 'video' ? b.variant : undefined,
    seconds: typeof b.durationSeconds === 'number' ? b.durationSeconds : undefined,
    fps: typeof b.sourceFps === 'number' ? b.sourceFps : undefined,
    imageCount: 1,
  });
  if (!estimate.ok) {
    return NextResponse.json(
      { status: 'failed', reason: 'estimate-impossible', missing: estimate.missing },
      { status: 400 },
    );
  }

  const spentBefore = campaignSpentCredits(db);

  // ── THE MEASUREMENT USES THE SAME DURABLE JOB A CREATOR USES ───────────
  //
  //   It submits and returns a job id rather than holding the connection: the
  //   campaign itself proved that a long job outlives the request. The
  //   campaign pays from its own ceiling, so no Creator balance is touched —
  //   `skipBalance` says that out loud rather than leaving it implied.
  const submitted = await submitCreativeJob(db, {
    operation,
    creatorId: session.creatorId,
    targetAssetId: b.targetAssetId,
    secondAssetId: typeof b.secondAssetId === 'string' ? b.secondAssetId : undefined,
    durationSeconds: typeof b.durationSeconds === 'number' ? b.durationSeconds : undefined,
    sourceFps: typeof b.sourceFps === 'number' ? b.sourceFps : undefined,
    likenessAcknowledgment: b.likenessAcknowledgment,
    skipBalance: true,
    costMeasurement: {
      campaignId: QIYAMAH_ACCEPTANCE_CAMPAIGN,
      expectedCredits: estimate.providerCredits,
    },
  });

  if (!submitted.ok) {
    console.error('[cost-measurement]', operation, submitted.reason, submitted.detailEn);
    return NextResponse.json(
      {
        status: 'failed',
        reason: submitted.reason,
        detail: submitted.detailEn,
        expectedCredits: estimate.providerCredits,
        campaign: {
          id: QIYAMAH_ACCEPTANCE_CAMPAIGN,
          ceilingCredits: COST_MEASUREMENT_CEILING_CREDITS,
          spentCredits: spentBefore,
          remainingCredits: COST_MEASUREMENT_CEILING_CREDITS - spentBefore,
        },
      },
      { status: 409 },
    );
  }

  return NextResponse.json({
    status: 'accepted',
    operation,
    jobId: submitted.jobId,
    startedNow: submitted.claimed,
    expectedCredits: estimate.providerCredits,
    estimatedFrom: estimate.from,
    pollPath: `/api/qiyamah/jobs/${submitted.jobId}`,
    campaign: {
      id: QIYAMAH_ACCEPTANCE_CAMPAIGN,
      ceilingCredits: COST_MEASUREMENT_CEILING_CREDITS,
      spentBeforeCredits: spentBefore,
      remainingCredits: COST_MEASUREMENT_CEILING_CREDITS - spentBefore,
      jobsWithNoReportedCharge: campaignUnreportedJobs(db),
    },
  }, { status: 202 });
}

/** What has been spent so far, so the campaign can be read without spending. */
export async function GET(request: NextRequest) {
  const session = verifySession(request.cookies.get(SESSION_COOKIE)?.value ?? '');
  if (!session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized' }, { status: 401 });
  }
  const db = getDb();
  if (getCreator(db, session.creatorId)?.role !== 'founder') {
    return NextResponse.json({ status: 'failed', reason: 'not-the-founder' }, { status: 403 });
  }
  const spent = campaignSpentCredits(db);
  return NextResponse.json({
    status: 'succeeded',
    campaign: {
      id: QIYAMAH_ACCEPTANCE_CAMPAIGN,
      ceilingCredits: COST_MEASUREMENT_CEILING_CREDITS,
      spentCredits: spent,
      remainingCredits: COST_MEASUREMENT_CEILING_CREDITS - spent,
      jobsWithNoReportedCharge: campaignUnreportedJobs(db),
    },
  });
}
