import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { generateImage } from '../../../../src/qiyamah-generation';
import { verifySession } from '../../../../src/authentication';
import { getDb } from '../../../../src/persistent-storage';
import { ConsumptionRepository } from '../../../../src/persistent-storage/consumption-repository';
import { OperationType } from '../../../../src/consumption-ledger/consumption-ledger-contracts';
import { estimateImageGenerationCost, getCurrentMonthKey } from '../../../../src/consumption-ledger/cost-estimator';
import { CreatorCreditRepository } from '../../../../src/economy/credit-ledger/credit-ledger-repository';
import { AzmaUnitCostEngine } from '../../../../src/economy/cost-engine/azma-cost-engine';
import { TrialEntitlementService } from '../../../../src/economy/trial/trial-entitlement-service';
import { InsufficientBalanceError } from '../../../../src/economy/credit-ledger/credit-ledger-types';
import { CostUnavailableError } from '../../../../src/economy/cost-engine/cost-engine-types';
import { TrialExhaustedError } from '../../../../src/economy/trial/trial-entitlement-types';
import type { CostEstimate } from '../../../../src/economy/cost-engine/cost-engine-types';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';
// 'magic-hour' matches the cost-catalog gatewayId (provider-cost-catalog.ts).
// Note: the Magic Hour adapter's own providerId is 'magic-hour-image' — that is
// the orchestrator-internal ID used for provider selection, not the cost-accounting key.
const GATEWAY_ID = 'magic-hour';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: 'failed', reason: 'invalid-prompt', message: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const prompt = (body as { prompt?: unknown })?.prompt;
  const style = (body as { style?: unknown })?.style;
  const idea = (body as { idea?: unknown })?.idea;

  if (typeof prompt !== 'string') {
    return NextResponse.json({ status: 'failed', reason: 'invalid-prompt', message: 'A string prompt is required.' }, { status: 400 });
  }

  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized', message: 'Sign in to generate.' }, { status: 401 });
  }

  const db = getDb();
  const creditRepo = new CreatorCreditRepository(db);
  const costEngine = new AzmaUnitCostEngine();
  const trialService = new TrialEntitlementService(db);

  // CREDIT-FIRST GATE — ordered by entitlement type:
  //
  //   1. Founders bypass all economic checks entirely.
  //   2. Creators with a remaining free-launch trial entitlement proceed
  //      without a cost lookup — the cost catalog does not need to be
  //      resolved for a zero-cost entitlement.
  //   3. Creators who have exhausted their trial must have a paid AZMA Unit
  //      balance. The cost catalog must be resolved; if it is still
  //      pending-discovery the request is blocked with an honest message.
  //
  // This ordering ensures a free-entitled Creator is never blocked merely
  // because the paid-operation cost rate has not yet been approved.
  let reservationId: string | null = null;
  let usedTrial = false;
  let resolvedCostEstimate: CostEstimate | null = null;

  if (session.role !== 'founder') {
    const hasTrialLeft = trialService.hasRemainingTrial(session.creatorId, 'image');

    if (hasTrialLeft) {
      // Free-launch entitlement path — no cost lookup required.
      try {
        const rawIp = request.headers.get('x-forwarded-for') ?? request.headers.get('x-real-ip') ?? undefined;
        trialService.claimTrial(session.creatorId, 'image', rawIp ?? undefined);
        usedTrial = true;
      } catch (err) {
        if (err instanceof TrialExhaustedError) {
          return NextResponse.json(
            { status: 'failed', reason: 'payment-required', message: 'Trial entitlement exhausted. Purchase a credit pack to continue.' },
            { status: 402 },
          );
        }
        throw err;
      }
    } else {
      // Paid path — resolve cost before proceeding. Never invent a price;
      // block honestly if the cost rate is not yet approved.
      try {
        resolvedCostEstimate = costEngine.estimate('image-generation', GATEWAY_ID);
      } catch (err) {
        if (err instanceof CostUnavailableError) {
          return NextResponse.json(
            {
              status: 'failed',
              reason: 'cost-unavailable',
              message: 'Your free generation has been used. Paid image generation is coming soon — pricing is being finalized.',
            },
            { status: 503 },
          );
        }
        throw err;
      }

      const balance = creditRepo.getBalance(session.creatorId);
      const hasPaidBalance = balance.availableUnits >= resolvedCostEstimate.estimatedAzmaUnits;

      if (!hasPaidBalance) {
        return NextResponse.json(
          {
            status: 'failed',
            reason: 'payment-required',
            message: 'Insufficient AZMA Units. Purchase a credit pack to continue.',
            estimatedCost: resolvedCostEstimate.estimatedAzmaUnits,
            availableUnits: balance.availableUnits,
          },
          { status: 402 },
        );
      }

      // Reserve units before generation — release on failure, settle on success.
      try {
        const reservation = creditRepo.reserve(
          session.creatorId,
          resolvedCostEstimate.estimatedAzmaUnits,
          `qiyamah:gen:${randomUUID()}`,
          { capability: 'image-generation', gatewayId: GATEWAY_ID },
        );
        reservationId = reservation.reservationId;
      } catch (err) {
        if (err instanceof InsufficientBalanceError) {
          return NextResponse.json(
            { status: 'failed', reason: 'payment-required', message: 'Insufficient AZMA Units.' },
            { status: 402 },
          );
        }
        throw err;
      }
    }
  }

  const result = await generateImage({
    prompt,
    style: typeof style === 'string' ? style : undefined,
    creatorId: session.creatorId,
    originalIdea: typeof idea === 'string' && idea.trim().length > 0 ? idea.trim() : null,
  });

  if (result.status === 'failed') {
    // Release reservation on failure — units returned to available balance
    if (reservationId) {
      try { creditRepo.release(reservationId, 'generation_failed'); } catch { /* non-fatal */ }
    }
    const httpStatus = result.reason === 'invalid-prompt' ? 400 : result.reason === 'rate-limited' ? 429 : 502;
    return NextResponse.json(result, { status: httpStatus });
  }

  // Settle reservation on success using the pre-resolved estimate
  if (reservationId && resolvedCostEstimate) {
    try { creditRepo.settle(reservationId, resolvedCostEstimate.estimatedAzmaUnits); } catch { /* non-fatal */ }
  }

  // Record consumption for cost-discovery and non-trial Creators
  if (session.role !== 'founder' && !usedTrial) {
    try {
      const ledger = new ConsumptionRepository(db);
      ledger.record({
        creatorId: session.creatorId,
        operationType: OperationType.IMAGE_GENERATION,
        costUsdEstimate: estimateImageGenerationCost(),
        units: 1,
        monthKey: getCurrentMonthKey(),
        recordedAt: Date.now(),
      });
    } catch { /* non-fatal */ }
  }

  return NextResponse.json(result, { status: 200 });
}
