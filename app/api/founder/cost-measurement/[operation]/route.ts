import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '@/src/authentication';
import { getDb, getCreator } from '@/src/persistent-storage';
import {
  runCreativeOperation,
  CREATIVE_INPUT_SHAPE,
  type CreativeRunRejection,
} from '@/src/vault/creative-operation-runner';
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

const HTTP_FOR: Readonly<Record<CreativeRunRejection, number>> = {
  unavailable: 409,
  'acknowledgment-required': 403,
  'not-found': 404,
  'wrong-family': 400,
  'not-derivable': 409,
  'duration-required': 400,
  'source-unreadable': 500,
  'engine-refused': 502,
  'output-rejected': 409,
};

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
  const outcome = await runCreativeOperation(db, {
    operation,
    creatorId: session.creatorId,
    targetAssetId: b.targetAssetId,
    secondAssetId: typeof b.secondAssetId === 'string' ? b.secondAssetId : undefined,
    durationSeconds: typeof b.durationSeconds === 'number' ? b.durationSeconds : undefined,
    likenessAcknowledgment: b.likenessAcknowledgment,
    costMeasurement: {
      campaignId: QIYAMAH_ACCEPTANCE_CAMPAIGN,
      expectedCredits: estimate.providerCredits,
    },
  });

  const spentAfter = campaignSpentCredits(db);

  if (!outcome.ok) {
    console.error('[cost-measurement]', operation, outcome.rejection, outcome.detailEn);
    return NextResponse.json(
      {
        status: 'failed',
        reason: outcome.rejection,
        detail: outcome.detailEn,
        expectedCredits: estimate.providerCredits,
        campaign: {
          id: QIYAMAH_ACCEPTANCE_CAMPAIGN,
          ceilingCredits: COST_MEASUREMENT_CEILING_CREDITS,
          spentCredits: spentAfter,
          remainingCredits: COST_MEASUREMENT_CEILING_CREDITS - spentAfter,
        },
      },
      { status: HTTP_FOR[outcome.rejection] },
    );
  }

  // Everything the acceptance report needs, in the provider's own figures.
  return NextResponse.json({
    status: 'succeeded',
    operation,
    expectedCredits: estimate.providerCredits,
    estimatedFrom: estimate.from,
    // What the provider actually charged for THIS job. Null when it reported
    // none — never a zero, which would read as «free».
    chargedCredits: outcome.providerCreditsCharged,
    chargeDelta: outcome.providerCreditsCharged === null
      ? null : outcome.providerCreditsCharged - estimate.providerCredits,
    asset: {
      assetId: outcome.assetId,
      parentAssetId: outcome.parentAssetId,
      secureStorageUri: outcome.storageUri,
    },
    campaign: {
      id: QIYAMAH_ACCEPTANCE_CAMPAIGN,
      ceilingCredits: COST_MEASUREMENT_CEILING_CREDITS,
      spentBeforeCredits: spentBefore,
      spentCredits: spentAfter,
      remainingCredits: COST_MEASUREMENT_CEILING_CREDITS - spentAfter,
      jobsWithNoReportedCharge: campaignUnreportedJobs(db),
    },
    lifecycle: 'DEPOSITED',
  });
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
