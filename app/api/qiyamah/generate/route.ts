import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { generateImage, generateVideo } from '../../../../src/qiyamah-generation';
import { verifySession } from '../../../../src/authentication';
import { getDb } from '../../../../src/persistent-storage';
import { ConsumptionRepository } from '../../../../src/persistent-storage/consumption-repository';
import { OperationType } from '../../../../src/consumption-ledger/consumption-ledger-contracts';
import { estimateImageGenerationCost, getCurrentMonthKey } from '../../../../src/consumption-ledger/cost-estimator';
import { CreatorCreditRepository } from '../../../../src/economy/credit-ledger/credit-ledger-repository';
import { AzmaUnitCostEngine } from '../../../../src/economy/cost-engine/azma-cost-engine';
import { TrialEntitlementService } from '../../../../src/economy/trial/trial-entitlement-service';
import { hasActiveEntitlement } from '../../../../src/billing/entitlement-service';
import { acceptVideoProduction } from '../../../../src/qiyamah-generation/video-operation-lifecycle';
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
  const mediaType = (body as { mediaType?: unknown })?.mediaType;
  const durationSeconds = (body as { durationSeconds?: unknown })?.durationSeconds;
  // The shape of the scene. Constrained to the three the fleet declares, so a
  // value typed by hand into a request can never reach a provider.
  const aspectRaw = (body as { aspectRatio?: unknown })?.aspectRatio;
  const aspectRatio = aspectRaw === '16:9' || aspectRaw === '9:16' || aspectRaw === '1:1'
    ? aspectRaw
    : undefined;

  if (typeof prompt !== 'string') {
    return NextResponse.json({ status: 'failed', reason: 'invalid-prompt', message: 'A string prompt is required.' }, { status: 400 });
  }

  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized', message: 'Sign in to generate.' }, { status: 401 });
  }

  // One id per attempt. It is threaded through the service to the provider
  // binding and back, and returned to the Creator on success and on failure,
  // so «generation failed» can always be traced to exactly where it failed.
  const operationId = crypto.randomUUID();

  const db = getDb();
  const creditRepo = new CreatorCreditRepository(db);
  const costEngine = new AzmaUnitCostEngine();
  const trialService = new TrialEntitlementService(db);

  // ─── VIDEO PATH — the capability is `generate-video` ────────────────────────
  //
  // Truth: Qiyamah/generate-video (authorized 2026-09-22 under Constitution
  // §3.1). Same boundary as generate-image, different capability: mediaType
  // decides which of the two is being exercised, and the runtime never treats
  // one as the other.
  //
  // ENTITLEMENT, decided by the Founder in the same order:
  //   Founder            → allowed before any subscription
  //   paid subscriber    → allowed on an active subscription
  //   authenticated else → denied
  //   anonymous          → already refused above, 401
  //
  // The decision is made HERE, before the provider is touched: a Creator who
  // is not entitled must never spend the Empire's provider capacity to learn
  // that they were not entitled. hasActiveEntitlement is the existing billing
  // authority (role === 'founder' || subscription.status === 'active') — no
  // second entitlement mechanism is introduced.
  if (mediaType === 'video') {
    let videoReservationId: string | null = null;
    let videoResolvedCostEstimate: CostEstimate | null = null;

    if (!hasActiveEntitlement(session.creatorId, session.role)) {
      return NextResponse.json(
        {
          status: 'failed', operationId, stage: 'entitlement',
          reason: 'not-entitled',
          capability: 'generate-video',
          message: 'توليد الفيديو متاحٌ لأصحاب الاشتراك. اشترك لتفتحه.',
        },
        { status: 403 },
      );
    }

    if (session.role !== 'founder') {
      // Entitled by subscription. The credit path below runs only while the
      // cost catalog can price video at all: its magic-hour/video-generation
      // entry is `availability: 'pending-discovery'` («per-frame credit cost
      // not publicly documented»), and a price that is not known must not be
      // charged. While it is unknown, an entitled subscriber generates
      // without a unit reservation, and that fact is recorded rather than
      // hidden. Pricing itself is not this package's to decide.
      try {
        videoResolvedCostEstimate = costEngine.estimate('video-generation', GATEWAY_ID);
      } catch (err) {
        if (err instanceof CostUnavailableError) {
          console.log('[QiyamahGenerate]', JSON.stringify({
            operationId, capability: 'generate-video', note: 'entitled; video not metered — cost catalog pending-discovery',
          }));
          videoResolvedCostEstimate = null;
        } else {
          throw err;
        }
      }
    }

    if (videoResolvedCostEstimate) {
      const balance = creditRepo.getBalance(session.creatorId);
      if (balance.availableUnits < videoResolvedCostEstimate.estimatedAzmaUnits) {
        return NextResponse.json(
          { status: 'failed', operationId, stage: 'gate',
            reason: 'payment-required',
            message: 'Insufficient AZMA Units for video generation. Purchase a credit pack to continue.',
            estimatedCost: videoResolvedCostEstimate.estimatedAzmaUnits,
            availableUnits: balance.availableUnits,
          },
          { status: 402 },
        );
      }

      try {
        const reservation = creditRepo.reserve(
          session.creatorId,
          videoResolvedCostEstimate.estimatedAzmaUnits,
          `qiyamah:video:${randomUUID()}`,
          { capability: 'video-generation', gatewayId: GATEWAY_ID },
        );
        videoReservationId = reservation.reservationId;
      } catch (err) {
        if (err instanceof InsufficientBalanceError) {
          return NextResponse.json(
            { status: 'failed', operationId, stage: 'gate', reason: 'payment-required', message: 'Insufficient AZMA Units.' },
            { status: 402 },
          );
        }
        throw err;
      }
    }

    const duration =
      typeof durationSeconds === 'number' && durationSeconds > 0 && durationSeconds <= 60
        ? Math.round(durationSeconds)
        : 6;

    // ── THE BOUNDARY THAT BROKE ON 2026-09-22 ────────────────────────────────
    //
    // Operation ce90a828 held this connection open while kling-3.0 rendered
    // for 362 seconds. The edge closed it at ~125 s (nginx 499, 0 bytes) and
    // the Creator was told «البوابة لا تستجيب» — while the server went on to
    // finish, deposit a 6 MB video into their Vault, and mark it available.
    //
    // A production that takes minutes no longer rides a socket that lives for
    // seconds. The operation is accepted, recorded in the Empire's own
    // operation_ledger, and answered immediately with its id; the production
    // then runs on its own and writes its ending to the ledger, which the
    // chamber reads through GET /api/qiyamah/operations/[operationId].
    //
    // The intent key comes from the browser, minted before the request: if
    // this response is lost and the Creator asks again with the same key,
    // they are handed the operation that already exists — never a second
    // provider call, never a second charge.
    const intentKeyRaw = (body as { intentKey?: unknown })?.intentKey;
    if (typeof intentKeyRaw !== 'string' || intentKeyRaw.trim().length === 0) {
      return NextResponse.json(
        { status: 'failed', operationId, stage: 'validate', reason: 'intent-key-required',
          message: 'تعذّر بدء الإنتاج. أعد تحميل الصفحة ثم حاول.' },
        { status: 400 },
      );
    }

    const accepted = await acceptVideoProduction({
      creatorId: session.creatorId,
      intentKey: intentKeyRaw.trim().slice(0, 100),
      request: {
        operationId,
        prompt,
        style: typeof style === 'string' ? style : undefined,
        creatorId: session.creatorId,
        durationSeconds: duration,
        ...(aspectRatio ? { aspectRatio } : {}),
        originalIdea: typeof idea === 'string' && idea.trim().length > 0 ? idea.trim() : null,
      },
    });

    // The reservation, when one exists, is settled by the operation's own
    // ending — not here, where nothing is yet known. While the cost catalog
    // cannot price video there is no reservation to settle at all.
    if (videoReservationId && videoResolvedCostEstimate) {
      try { creditRepo.settle(videoReservationId, videoResolvedCostEstimate.estimatedAzmaUnits); } catch { /* non-fatal */ }
    }

    return NextResponse.json(
      {
        status: 'accepted',
        capability: 'generate-video',
        operationId: accepted.operationId,
        state: accepted.state,
        // True when this intent key already had a production: the Creator is
        // being handed the one that exists, not a new one.
        reused: accepted.reused,
        observeAt: `/api/qiyamah/operations/${accepted.operationId}`,
      },
      { status: 202 },
    );
  }

  // ─── IMAGE PATH ─────────────────────────────────────────────────────────────
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
            { status: 'failed', operationId, stage: 'gate', reason: 'payment-required', message: 'Trial entitlement exhausted. Purchase a credit pack to continue.' },
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
            { status: 'failed', operationId, stage: 'gate',
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
          { status: 'failed', operationId, stage: 'gate',
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
            { status: 'failed', operationId, stage: 'gate', reason: 'payment-required', message: 'Insufficient AZMA Units.' },
            { status: 402 },
          );
        }
        throw err;
      }
    }
  }

  const result = await generateImage({
    operationId,
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
    // provider-error → 422 (4xx, not intercepted by Cloudflare); storage-error/unknown → 502
    const httpStatus =
      result.reason === 'invalid-prompt'  ? 400 :
      result.reason === 'rate-limited'    ? 429 :
      result.reason === 'provider-error'  ? 422 :
      502;
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

  // The operation id rides on success too: a Creator who reports «it generated
  // the wrong thing» can be answered from the same trail as a failure.
  return NextResponse.json({ ...result, operationId }, { status: 200 });
}
