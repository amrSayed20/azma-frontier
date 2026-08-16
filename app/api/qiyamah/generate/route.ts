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

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';
const GATEWAY_ID = 'openai';

export async function POST(request: NextRequest) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: 'failed', reason: 'invalid-prompt', message: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const prompt = (body as { prompt?: unknown })?.prompt;
  const style = (body as { style?: unknown })?.style;

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

  // CREDIT-FIRST GATE: Founders bypass all economic checks.
  // Creators require either a paid AZMA Unit balance or a remaining trial entitlement.
  // Pre-flight: resolve cost BEFORE generation — NO COST WITHOUT PRIOR KNOWLEDGE.
  let reservationId: string | null = null;
  let usedTrial = false;

  if (session.role !== 'founder') {
    let costEstimate;
    try {
      costEstimate = costEngine.estimate('image-generation', GATEWAY_ID);
    } catch (err) {
      if (err instanceof CostUnavailableError) {
        return NextResponse.json(
          { status: 'failed', reason: 'cost-unavailable', message: 'Cost for this operation is not yet available. Generation blocked.' },
          { status: 503 },
        );
      }
      throw err;
    }

    const balance = creditRepo.getBalance(session.creatorId);
    const hasPaidBalance = balance.availableUnits >= costEstimate.estimatedAzmaUnits;
    const hasTrialLeft = trialService.hasRemainingTrial(session.creatorId, 'image');

    if (!hasPaidBalance && !hasTrialLeft) {
      return NextResponse.json(
        {
          status: 'failed',
          reason: 'payment-required',
          message: 'Insufficient AZMA Units. Purchase a credit pack to continue.',
          estimatedCost: costEstimate.estimatedAzmaUnits,
          availableUnits: balance.availableUnits,
        },
        { status: 402 },
      );
    }

    if (hasPaidBalance) {
      // Reserve units before generation — release on failure, settle on success
      try {
        const reservation = creditRepo.reserve(
          session.creatorId,
          costEstimate.estimatedAzmaUnits,
          `qiyamah:gen:${randomUUID()}`,
          { capability: 'image-generation', gatewayId: GATEWAY_ID },
        );
        reservationId = reservation.reservationId;
      } catch (err) {
        if (err instanceof InsufficientBalanceError) {
          // Balance changed between check and reserve — fall through to trial if available
          if (!hasTrialLeft) {
            return NextResponse.json(
              { status: 'failed', reason: 'payment-required', message: 'Insufficient AZMA Units.' },
              { status: 402 },
            );
          }
          // Use trial instead
        } else {
          throw err;
        }
      }
    }

    if (!reservationId) {
      // Use trial entitlement
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
    }
  }

  const result = await generateImage({
    prompt,
    style: typeof style === 'string' ? style : undefined,
    creatorId: session.creatorId,
  });

  if (result.status === 'failed') {
    // Release reservation on failure — units returned to available balance
    if (reservationId) {
      try { creditRepo.release(reservationId, 'generation_failed'); } catch { /* non-fatal */ }
    }
    const httpStatus = result.reason === 'invalid-prompt' ? 400 : result.reason === 'rate-limited' ? 429 : 502;
    return NextResponse.json(result, { status: httpStatus });
  }

  // Settle reservation on success
  if (reservationId) {
    try { creditRepo.settle(reservationId, /* actualUnits */ (costEngine.estimate('image-generation', GATEWAY_ID)).estimatedAzmaUnits); } catch { /* non-fatal */ }
  }

  // Record consumption for Founder cost-discovery (unchanged) and non-trial Creators
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
