import { NextRequest, NextResponse } from 'next/server';
import { generateImage } from '../../../../src/qiyamah-generation';
import { verifySession } from '../../../../src/authentication';
import { hasActiveEntitlement } from '../../../../src/billing';
import { getDb } from '../../../../src/persistent-storage';
import { ConsumptionRepository } from '../../../../src/persistent-storage/consumption-repository';
import { OperationType } from '../../../../src/consumption-ledger/consumption-ledger-contracts';
import { estimateImageGenerationCost, getCurrentMonthKey } from '../../../../src/consumption-ledger/cost-estimator';
import { checkConsumptionCap, BETA_USAGE_CAP } from '../../../../src/consumption-ledger/consumption-cap-enforcer';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

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

  // BILLING FOUNDATION: generation now REQUIRES a real, authenticated
  // session with an active entitlement (Founders always pass; Creators
  // need an active subscription). This is a deliberate, disclosed
  // behavior change — anonymous/unauthenticated generation, allowed by
  // every prior Package, is no longer permitted, since this Package's
  // own Objective is exactly to gate this capability behind payment.
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized', message: 'Sign in to generate.' }, { status: 401 });
  }

  if (!hasActiveEntitlement(session.creatorId, session.role)) {
    return NextResponse.json({ status: 'failed', reason: 'payment-required', message: 'An active subscription is required to generate.' }, { status: 402 });
  }

  // CONSUMPTION CAP: Founders are exempt; all other Creators are checked
  // against the Founder Beta monthly cap before any provider call is made.
  if (session.role !== 'founder') {
    const ledger = new ConsumptionRepository(getDb());
    const usage = ledger.getMonthlyUsage(session.creatorId, getCurrentMonthKey());
    const cap = checkConsumptionCap(usage, BETA_USAGE_CAP, OperationType.IMAGE_GENERATION, 1);
    if (!cap.allowed) {
      return NextResponse.json(
        { status: 'failed', reason: 'usage-cap-reached', message: cap.reason },
        { status: 429 },
      );
    }
  }

  const result = await generateImage({
    prompt,
    style: typeof style === 'string' ? style : undefined,
    creatorId: session.creatorId,
  });

  if (result.status === 'failed') {
    const httpStatus = result.reason === 'invalid-prompt' ? 400 : result.reason === 'rate-limited' ? 429 : 502;
    return NextResponse.json(result, { status: httpStatus });
  }

  // Record consumption only after a confirmed success — no charge for failures.
  if (session.role !== 'founder') {
    try {
      const ledger = new ConsumptionRepository(getDb());
      ledger.record({
        creatorId: session.creatorId,
        operationType: OperationType.IMAGE_GENERATION,
        costUsdEstimate: estimateImageGenerationCost(),
        units: 1,
        monthKey: getCurrentMonthKey(),
        recordedAt: Date.now(),
      });
    } catch { /* non-fatal: cost tracking must never block the Creator's result */ }
  }

  return NextResponse.json(result, { status: 200 });
}
