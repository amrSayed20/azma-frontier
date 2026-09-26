import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../src/authentication';
import { getDb } from '../../../../../src/persistent-storage';
import { CreatorCreditRepository } from '../../../../../src/economy/credit-ledger/credit-ledger-repository';
import { AzmaUnitCostEngine } from '../../../../../src/economy/cost-engine/azma-cost-engine';
import { TrialEntitlementService } from '../../../../../src/economy/trial/trial-entitlement-service';
import type { CapabilityTarget } from '../../../../../src/economy/cost-engine/cost-engine-types';
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

// POST /api/sovereign/economy/estimate
// Pre-flight cost transparency — Creator must know cost BEFORE creation starts.
// Body: { capability: CapabilityTarget }   — the gateway is derived, not sent.
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

  const capability = (body as { capability?: unknown })?.capability;

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
  const canProceed = session.role === 'founder' ? true : (estimate.canProceed || trialAvailable);

  // A price the Empire cannot state is not quoted as zero — it is stated as
  // unknown, and the Creator is told so rather than shown a confident 0.
  const priced = estimate.availability === 'available';

  return NextResponse.json({
    capability,
    workAr: WORK_AR[capability as CapabilityTarget],
    estimatedAzmaUnits: priced ? estimate.estimatedAzmaUnits : null,
    priced,
    canProceed,
    availableUnits: balance.availableUnits,
    trialAvailable,
    blockerAr: canProceed
      ? undefined
      : trialAvailable === false && priced
        ? 'رصيدك لا يكفي لهذا العمل.'
        : 'هذا العمل غير متاحٍ الآن.',
  });
}
