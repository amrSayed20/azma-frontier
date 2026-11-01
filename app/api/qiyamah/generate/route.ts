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
import {
  claimAttempt, completeAttempt, failAttempt, attachReservation, markSettlement,
  OPERATION_KEY_HEADER, readClientOperationKey,
} from '../../../../src/economy/paid-operation-attempts';
import { settleReservation } from '../../../../src/economy/paid-operation-gate';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';
/** The namespaces these two roads' submission keys live in. */
const VIDEO_SCOPE = 'qiyamah:video';
const IMAGE_SCOPE = 'qiyamah:image';
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

    // ── THE SUBMISSION, CLAIMED BEFORE A SINGLE UNIT IS HELD ─────────────
    //
    //   MEASURED 2026-11-01: this road ALREADY had a stable key — `intentKey`,
    //   minted by the browser and required — and `acceptVideoProduction`
    //   already refuses to start a second production for it. But the
    //   RESERVATION was keyed on `randomUUID()`, so a resent key produced no
    //   second video and a second hold and a second settlement all the same.
    //   One press, charged twice, for the dearest act in the Empire.
    //
    //   The validation moved above the money for this: a request that will be
    //   refused for want of a key must not first take units.
    const videoIntentKeyRaw = (body as { intentKey?: unknown })?.intentKey;
    if (typeof videoIntentKeyRaw !== 'string' || videoIntentKeyRaw.trim().length === 0) {
      return NextResponse.json(
        { status: 'failed', operationId, stage: 'validate', reason: 'intent-key-required',
          message: 'تعذّر بدء الإنتاج. أعد تحميل الصفحة ثم حاول.' },
        { status: 400 },
      );
    }
    const videoIntentKey = videoIntentKeyRaw.trim().slice(0, 100);

    const videoClaim = claimAttempt({
      db, creatorId: session.creatorId, scope: VIDEO_SCOPE, clientKey: videoIntentKey,
    });

    // A key already spoken for: the production that exists is handed back, and
    // the money is not touched at all. No hold, no charge, no provider.
    if (videoClaim.kind === 'in-flight' || videoClaim.kind === 'already-succeeded') {
      const existing = await acceptVideoProduction({
        creatorId: session.creatorId,
        intentKey: videoIntentKey,
        request: {
          operationId, prompt,
          style: typeof style === 'string' ? style : undefined,
          creatorId: session.creatorId,
          durationSeconds: 6,
          ...(aspectRatio ? { aspectRatio } : {}),
          originalIdea: typeof idea === 'string' && idea.trim().length > 0 ? idea.trim() : null,
        },
      });
      return NextResponse.json(
        {
          status: 'accepted', capability: 'generate-video',
          operationId: existing.operationId, state: existing.state,
          reused: true,
          observeAt: `/api/qiyamah/operations/${existing.operationId}`,
        },
        { status: 202 },
      );
    }

    if (videoResolvedCostEstimate) {
      const balance = creditRepo.getBalance(session.creatorId);
      if (balance.availableUnits < videoResolvedCostEstimate.estimatedAzmaUnits) {
        failAttempt(db, videoClaim.attemptKey, 'insufficient-balance');
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
          // The ATTEMPT's key, not a fresh one. This is the whole repair.
          videoClaim.attemptKey,
          { capability: 'video-generation', gatewayId: GATEWAY_ID },
        );
        videoReservationId = reservation.reservationId;
        attachReservation(db, videoClaim.attemptKey, reservation.reservationId, reservation.reservedUnits);
      } catch (err) {
        if (err instanceof InsufficientBalanceError) {
          failAttempt(db, videoClaim.attemptKey, 'insufficient-balance');
          return NextResponse.json(
            { status: 'failed', operationId, stage: 'gate', reason: 'payment-required', message: 'Insufficient AZMA Units.' },
            { status: 402 },
          );
        }
        failAttempt(db, videoClaim.attemptKey, 'reserve-failed');
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
    // provider call, never a second charge. It is read and validated above,
    // before anything is held.
    const accepted = await acceptVideoProduction({
      creatorId: session.creatorId,
      intentKey: videoIntentKey,
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
      // A settlement that cannot be applied is no longer swallowed: the
      // Creator keeps their production and the debt is recorded where the
      // resolver reads it.
      settleReservation({
        db, creatorId: session.creatorId,
        attemptKey: videoClaim.attemptKey,
        reservationId: videoReservationId,
        units: videoResolvedCostEstimate.estimatedAzmaUnits,
        metadata: { operationId: accepted.operationId },
      });
    }

    // The submission is closed, so a resent key is answered rather than
    // charged. An entitled production has no hold and owes nothing.
    completeAttempt(db, videoClaim.attemptKey, {
      status: 'accepted', operationId: accepted.operationId, state: accepted.state,
    });

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

  // ── THE SUBMISSION, CLAIMED BEFORE A TRIAL OR A UNIT IS SPENT ────────────
  //
  //   The image road has no required key of its own, so it reads the shared
  //   header. Where the browser sends one, a press that arrives twice is
  //   answered once. Where it does not, each request stands alone and holds
  //   its own units — the unimproved behaviour, which is the safe side: an
  //   uncovered paid call is worse than a charge for a second press.
  //
  //   Claimed BEFORE the trial is claimed, so a resent key cannot burn a
  //   second free generation either.
  const imageClaim = claimAttempt({
    db, creatorId: session.creatorId, scope: IMAGE_SCOPE,
    clientKey: readClientOperationKey(request.headers.get(OPERATION_KEY_HEADER)),
  });
  if (imageClaim.kind === 'in-flight') {
    return NextResponse.json(
      { status: 'failed', operationId, stage: 'gate', reason: 'operation-in-flight',
        message: 'هذا الإنتاج يَجري الآن. انتظر نتيجته — ولم يُحسَب عليك مرّتين.' },
      { status: 409 },
    );
  }
  if (imageClaim.kind === 'already-succeeded') {
    const replayed = replayJson(imageClaim.resultJson);
    if (replayed) return NextResponse.json(replayed, { status: 200 });
    return NextResponse.json(
      { status: 'failed', operationId, stage: 'gate', reason: 'already-performed',
        message: 'هذا الإنتاج نُفِّذ من قبل. اطلبه من خزانتك بدلاً من إعادته.' },
      { status: 409 },
    );
  }

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
          failAttempt(db, imageClaim.attemptKey, 'trial-exhausted');
          return NextResponse.json(
            { status: 'failed', operationId, stage: 'gate', reason: 'payment-required',
              message: 'Trial entitlement exhausted. Purchase a credit pack to continue.' },
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
          failAttempt(db, imageClaim.attemptKey, 'cost-unavailable');
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
        failAttempt(db, imageClaim.attemptKey, 'insufficient-balance');
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
          // The ATTEMPT's key, not a fresh one. This is the whole repair.
          imageClaim.attemptKey,
          { capability: 'image-generation', gatewayId: GATEWAY_ID },
        );
        reservationId = reservation.reservationId;
        attachReservation(db, imageClaim.attemptKey, reservation.reservationId, reservation.reservedUnits);
          failAttempt(db, imageClaim.attemptKey, 'insufficient-balance');
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
    // ── D-8 · WHAT HAPPENED TO THE CREATOR'S BALANCE, SAID EXACTLY ────────
    //
    //   The release was already here, wrapped in `catch { /* non-fatal */ }`.
    //   Non-fatal to the REQUEST — but if it threw, units stayed reserved and
    //   the chamber still showed a bare «تعذّر إتمام الإنتاج». A Creator could
    //   not tell a failure that cost them nothing from one that held their
    //   units, and the interface said the same thing either way.
    //
    //   Three outcomes, and they are not interchangeable:
    //     'released'    — units were reserved and are back. PROVEN here.
    //     'none'        — nothing was ever reserved, so nothing could be taken.
    //     'unresolved'  — a reservation exists and the release threw. We do
    //                     NOT claim the Creator was not charged; we say it is
    //                     unresolved, because that is what is true.
    let balanceOutcome: 'released' | 'none' | 'unresolved' = 'none';
    if (reservationId) {
      try {
        creditRepo.release(reservationId, 'generation_failed');
        markSettlement(db, imageClaim.attemptKey, 'released');
        balanceOutcome = 'released';
      } catch (err) {
        // 'unresolved' is still the honest word to the Creator — and now the
        // attempt stays `owed`, so the resolver will come back to it.
        balanceOutcome = 'unresolved';
        console.error('[qiyamah/generate] reservation release failed:', operationId,
          err instanceof Error ? err.message.slice(0, 120) : 'unknown');
      }
    }
    failAttempt(db, imageClaim.attemptKey, `generation:${result.reason}`);
    // provider-error → 422 (4xx, not intercepted by Cloudflare); storage-error/unknown → 502
    const httpStatus =
      result.reason === 'invalid-prompt'  ? 400 :
      result.reason === 'rate-limited'    ? 429 :
      result.reason === 'provider-error'  ? 422 :
      502;
    return NextResponse.json({ ...result, balanceOutcome }, { status: httpStatus });
  }

  // Settle on success using the pre-resolved estimate. A settlement the ledger
  // refuses is recorded as a debt now, not swallowed.
  if (reservationId && resolvedCostEstimate) {
    settleReservation({
      db, creatorId: session.creatorId,
      attemptKey: imageClaim.attemptKey,
      reservationId,
      units: resolvedCostEstimate.estimatedAzmaUnits,
      metadata: { operationId },
    });
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
  const answer = { ...result, operationId };
  // Closed, so a resent key is ANSWERED rather than generated again.
  completeAttempt(db, imageClaim.attemptKey, answer);
  return NextResponse.json(answer, { status: 200 });
}

/**
 * A stored answer, read back for a resent key.
 *
 * A row that will not parse back into a success is NOT a licence to generate
 * again: the caller refuses instead.
 */
function replayJson(resultJson: string | null): unknown | null {
  if (typeof resultJson !== 'string') return null;
  try {
    const parsed = JSON.parse(resultJson) as { status?: unknown };
    return parsed?.status === 'succeeded' || parsed?.status === 'accepted' ? parsed : null;
  } catch {
    return null;
  }
}
