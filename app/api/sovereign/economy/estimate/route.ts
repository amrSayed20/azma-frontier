import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../src/authentication';
import { getDb } from '../../../../../src/persistent-storage';
import { CreatorCreditRepository } from '../../../../../src/economy/credit-ledger/credit-ledger-repository';
import { AzmaUnitCostEngine } from '../../../../../src/economy/cost-engine/azma-cost-engine';
import { TrialEntitlementService } from '../../../../../src/economy/trial/trial-entitlement-service';
import type { CapabilityTarget } from '../../../../../src/economy/cost-engine/cost-engine-types';
import { creatorFacingCost, consumptionFor, SOVEREIGN_VALUE_BALANCE, BALANCE_PRICING_APPROVED } from '../../../../../src/economy/pricing/sovereign-value-balance';
import { creatorEstimate, measuredCostFor, type NewCapability } from '../../../../../src/economy/pricing/new-capability-pricing';
import { IMAGE_MODEL_FLEET } from '../../../../../src/sovereign-model-selection/image-model-fleet';
import { VIDEO_MODEL_FLEET } from '../../../../../src/sovereign-model-selection/video-model-fleet';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

const VALID_CAPABILITIES: readonly CapabilityTarget[] = [
  'image-generation', 'image-editing', 'image-upscaling',
  'video-generation', 'text-to-speech', 'voice-cloning',
];

/**
 * ── THE GATEWAY IS DERIVED, NEVER SUPPLIED ──────────────────────────────────
 *
 *   This route defaulted to 'openai' and accepted any gatewayId the caller
 *   sent. Both are wrong. The gateway a Creator's work will actually run on is
 *   whatever the DESIGNATED fleet declares — the Founder's designation, not a
 *   default written here and not a string from a browser. Reading it from the
 *   fleet means the price quoted is the price of the work that will be done,
 *   and it means no provider name can travel from a page into this estimate.
 */
function designatedGateway(capability: CapabilityTarget): string {
  const fleet = capability === 'video-generation' ? VIDEO_MODEL_FLEET : IMAGE_MODEL_FLEET;
  const designated = fleet.find((m) => m.productionAuthorized && m.active);
  return designated?.gatewayId ?? 'magic-hour';
}

/**
 * ── WHAT A CREATOR IS TOLD A THING COSTS ────────────────────────────────────
 *
 *   The catalog's own `unitDescription` reads «1 upscaled image (50–200 MH
 *   credits)», «1 generated image (Nano Banana 2)», «1 video generation (Veo
 *   3.1)». That field is for engineers reading logs, exactly as `displayName`
 *   is on the model fleet — it names providers and their products, and the
 *   Knowledge Source Abstraction Principle forbids it reaching a Creator.
 *   The same is true of `blockerReason`, which interpolates the gateway id.
 *
 *   So neither crosses this boundary. What crosses is the work, in Arabic.
 */
const WORK_AR: Record<CapabilityTarget, string> = {
  'image-generation': 'صورة واحدة',
  'image-editing':    'تعديل واحد على أصل',
  'image-upscaling':  'رفع دقّة أصل واحد',
  'video-generation': 'مقطع واحد',
  'text-to-speech':   'نطق واحد',
  'voice-cloning':    'صوت منسوخ واحد',
};

/**
 * ── WHAT THE STEP IN FRONT OF THE CREATOR ACTUALLY COSTS ────────────────────
 *
 *   MEASURED 2026-09-27: this route answered every capability «الكُلفة غير
 *   مُقدَّرة بعد», because the legacy catalog it read still carried
 *   azmaUnitsPerUnit: 0 and availability: 'pending-discovery' from before any
 *   price existed. A Creator was told the cost was unknown for work whose
 *   consumption the Founder had approved.
 *
 *   The approved consumption table is the authority now. It is the same table
 *   the ledger will debit, so what a Creator is shown before pressing and
 *   what leaves their Balance after are one number by construction, not two
 *   that must be kept in agreement.
 *
 *   PER-SECOND WORK IS PRICED ON THE REQUESTED SECONDS. The Creator chose
 *   them, sees them, and gets the same figure twice.
 */
const CAPABILITY_TO_CONSUMPTION: Record<CapabilityTarget, string | null> = {
  'image-generation': 'IMAGE_GENERATION',
  'image-editing':    'IMAGE_EDIT',
  'image-upscaling':  'UPSCALE_2X',
  'video-generation': 'VIDEO_GENERATION',
  // Not yet given an approved consumption. Told as unknown, never as zero.
  'text-to-speech':   null,
  'voice-cloning':    null,
};

/**
 * ── EVERY STEP QUOTED UNDER ITS OWN APPROVED RULE ───────────────────────────
 *
 *   The map above answers «what does this CAPABILITY cost». That is not always
 *   the same question as «what does this STEP cost», and where they differ the
 *   capability map quietly borrows another rule's number:
 *
 *     · an infographic is an image generation, but the approved table prices
 *       INFOGRAPHIC in its own row;
 *     · animating a still is priced as MOTION, not as VIDEO_GENERATION.
 *
 *   Both pairs carry the SAME figure today, which is exactly what makes the
 *   borrowing dangerous: it is invisible until the Founder changes one of
 *   them, and then the Chamber shows a price that belongs to another act. A
 *   limit copied from another authority governs a path it never governed.
 *
 *   So a caller may name the step it is about to run, and the capability is
 *   DERIVED from it rather than sent alongside — one table, so a step and a
 *   capability can never be paired wrongly by whoever writes the next screen.
 *   `capability` on its own is still accepted, unchanged, for every existing
 *   caller.
 */
const CHAMBER_STEPS: Readonly<Record<string, { readonly capability: CapabilityTarget; readonly workAr: string }>> = {
  IMAGE_GENERATION: { capability: 'image-generation', workAr: 'صورة واحدة' },
  INFOGRAPHIC:      { capability: 'image-generation', workAr: 'إنفوغرافيك واحد' },
  IMAGE_EDIT:       { capability: 'image-editing',    workAr: 'تعديل واحد على أصل' },
  VIDEO_GENERATION: { capability: 'video-generation', workAr: 'مقطع واحد' },
  MOTION:           { capability: 'video-generation', workAr: 'تحريك أصل واحد' },
  UPSCALE_2X:       { capability: 'image-upscaling',  workAr: 'رفع دقّة أصل واحد' },
};

/**
 * ── THE FIVE ACTS THE CAMPAIGN MEASURED ─────────────────────────────────────
 *
 *   MEASURED 2026-10-12 on the deployed release: the Operations Center asks
 *   this door for the price of every act a Creator may RUN. Those four acts
 *   were shut until the paid campaign measured them, so nobody had ever asked
 *   — and on the release that opened them, every visit produced
 *
 *       400 POST /api/sovereign/economy/estimate   × 15
 *
 *   because this table had never been taught their names. The Creator was not
 *   shown a wrong price; they were shown NO price on four of the ten cards,
 *   which is the same debt wearing a quieter coat.
 *
 *   The prices are NOT restated here. `new-capability-pricing` is their one
 *   authority — measured provider cost × 1.70, rounded once on the whole job —
 *   and this door reads it through `creatorEstimate`, the same function the
 *   panel and the runner read. One number, three readers.
 *
 *   Two of them are billed PER FRAME, so a single figure cannot exist before
 *   the Creator chooses a clip: the frame rate belongs to their file. Those
 *   answer `priced: false` with the basis stated in Arabic — never a 400,
 *   which tells a Creator nothing, and never a confident zero.
 */
const MEASURED_STEPS: Readonly<Record<string, {
  readonly capability: CapabilityTarget;
  readonly workAr: string;
  readonly measured: NewCapability;
}>> = {
  BACKGROUND_REMOVAL: { capability: 'image-editing',    workAr: 'إزالة خلفيّة أصل واحد',     measured: 'BACKGROUND_REMOVAL' },
  UPSCALE_4X:         { capability: 'image-upscaling',  workAr: 'رفع دقّة أصل أربعَ مرّات',  measured: 'UPSCALE_4X' },
  TALKING_PHOTO:      { capability: 'video-generation', workAr: 'إنطاق صورة واحدة',          measured: 'TALKING_PHOTO' },
  LIP_SYNC:           { capability: 'video-generation', workAr: 'مزامنة شفاه مقطع واحد',     measured: 'LIP_SYNC' },
  FACE_SWAP:          { capability: 'video-generation', workAr: 'تبديل وجه في مقطع واحد',    measured: 'FACE_SWAP' },
};

// POST /api/sovereign/economy/estimate
// Pre-flight cost transparency — Creator must know cost BEFORE creation starts.
// Body: { step: one of CHAMBER_STEPS, quantity?: requested seconds }
//   — or, for existing callers, { capability: CapabilityTarget }.
//   The gateway is derived, never sent; so is the capability when a step is.
// Returns: AZMA Units, the Creator's balance, and whether they may proceed.
export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ error: 'unauthorized' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: 'invalid_json' }, { status: 400 });
  }

  // A named step decides the capability. Nothing else may.
  const rawStep = (body as { step?: unknown })?.step;
  const known = (s: string) => Object.prototype.hasOwnProperty.call(CHAMBER_STEPS, s)
    || Object.prototype.hasOwnProperty.call(MEASURED_STEPS, s);
  const step = typeof rawStep === 'string' && known(rawStep) ? rawStep : null;
  const measuredStep = step ? MEASURED_STEPS[step] : undefined;

  if (typeof rawStep === 'string' && step === null) {
    return NextResponse.json(
      { error: 'invalid_step', valid: [...Object.keys(CHAMBER_STEPS), ...Object.keys(MEASURED_STEPS)] },
      { status: 400 },
    );
  }

  const capability = measuredStep
    ? measuredStep.capability
    : step
      ? CHAMBER_STEPS[step]!.capability
      : (body as { capability?: unknown })?.capability;

  if (typeof capability !== 'string' || !VALID_CAPABILITIES.includes(capability as CapabilityTarget)) {
    return NextResponse.json(
      { error: 'invalid_capability', valid: VALID_CAPABILITIES },
      { status: 400 },
    );
  }

  const gatewayId = designatedGateway(capability as CapabilityTarget);

  const db = getDb();
  const repo = new CreatorCreditRepository(db);
  const balance = repo.getBalance(session.creatorId);
  const engine = new AzmaUnitCostEngine();

  const estimate = engine.estimateWithBalance(capability as CapabilityTarget, gatewayId, balance);

  // ── The step's own consumption, from the approved table ──────────────────
  //   `quantity` is REQUESTED seconds for per-second work, and 1 otherwise.
  //   It is clamped rather than trusted: a browser cannot quote itself a
  //   cheaper step by sending a smaller number than it will ask to produce.
  const rawQuantity = (body as { quantity?: unknown })?.quantity;
  const askedSeconds = Math.max(1, Math.min(600, Math.round(typeof rawQuantity === 'number' ? rawQuantity : 1)));

  let balanceConsumed: number | null = null;
  let quantity = 1;
  let perSecond = false;
  // Set only when the act's charge genuinely cannot be stated from this door:
  // its basis is the Creator's own file, which this door has never seen.
  let priceDependsAr: string | null = null;

  if (measuredStep) {
    const measured = measuredCostFor(measuredStep.measured);
    perSecond = measured.basis === 'per-requested-second';
    const est = creatorEstimate({
      capability: measuredStep.measured,
      imageCount: 1,
      requestedSeconds: perSecond ? askedSeconds : undefined,
    });
    if ('missingAr' in est) {
      // PER FRAME. The frame rate lives in the Creator's clip, so no single
      // figure exists yet — and the basis is told rather than a number
      // guessed. The exact charge is stated in the act's own workspace, where
      // the asset is chosen and the server has measured its frames.
      priceDependsAr = measured.basisAr;
    } else {
      balanceConsumed = est.chargedUnits;
      quantity = est.quantity;
    }
  } else {
    const consumptionCapability = step ?? CAPABILITY_TO_CONSUMPTION[capability as CapabilityTarget];
    const rule = consumptionCapability ? consumptionFor(consumptionCapability) : undefined;
    perSecond = rule?.quantity === 'per-requested-second';
    quantity = perSecond ? askedSeconds : 1;
    const stepCost = consumptionCapability ? creatorFacingCost(consumptionCapability, quantity) : null;
    balanceConsumed = stepCost && BALANCE_PRICING_APPROVED ? stepCost.balanceConsumed : null;
  }

  const trialService = new TrialEntitlementService(db);
  const trialCapability = capability === 'image-generation' || capability === 'image-editing' || capability === 'image-upscaling'
    ? 'image' as const
    : capability === 'video-generation'
      ? 'video' as const
      : null;

  const trialAvailable = trialCapability
    ? trialService.hasRemainingTrial(session.creatorId, trialCapability)
    : false;

  // Founder bypass — Founders always can proceed
  //   Sufficiency is judged against what this step will ACTUALLY consume,
  //   not against the legacy catalog that never priced it.
  const affordable = balanceConsumed === null
    ? estimate.canProceed
    : balance.availableUnits >= balanceConsumed;
  const canProceed = session.role === 'founder' ? true : (affordable || trialAvailable);

  // A price the Empire cannot state is not quoted as zero — it is stated as
  // unknown, and the Creator is told so rather than shown a confident 0.
  const priced = balanceConsumed !== null;

  return NextResponse.json({
    capability,
    workAr: measuredStep
      ? measuredStep.workAr
      : step ? CHAMBER_STEPS[step]!.workAr : WORK_AR[capability as CapabilityTarget],
    // What this step takes from the Balance. Named in the Empire's own unit.
    estimatedAzmaUnits: balanceConsumed,
    unitNameAr: SOVEREIGN_VALUE_BALANCE.nameAr,
    quantity,
    perSecond,
    priced,
    canProceed,
    availableUnits: balance.availableUnits,
    trialAvailable,
    // Why there is no single figure, when there is none. An act billed by the
    // frames of the Creator's own clip HAS a price — it simply cannot be one
    // number before they choose the clip. Saying that is not the same as
    // saying the act is unavailable, and the two were one sentence before.
    priceDependsAr: priceDependsAr ?? undefined,
    blockerAr: canProceed
      ? undefined
      : priced
        ? 'رصيدك لا يكفي لهذا العمل.'
        : priceDependsAr
          ? 'كلفةُ هذا العمل تُقرأ بعد اختيارك أصلَك.'
          : 'هذا العمل غير متاحٍ الآن.',
  });
}
