import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../src/authentication';
import { getDb } from '../../../../../src/persistent-storage';
import { CreatorCreditRepository } from '../../../../../src/economy/credit-ledger/credit-ledger-repository';
import { AzmaUnitCostEngine } from '../../../../../src/economy/cost-engine/azma-cost-engine';
import { TrialEntitlementService } from '../../../../../src/economy/trial/trial-entitlement-service';
import type { CapabilityTarget } from '../../../../../src/economy/cost-engine/cost-engine-types';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';

const VALID_CAPABILITIES: readonly CapabilityTarget[] = [
  'image-generation', 'image-editing', 'image-upscaling',
  'video-generation', 'text-to-speech', 'voice-cloning',
];

// POST /api/sovereign/economy/estimate
// Pre-flight cost transparency — Creator must know cost BEFORE creation starts.
// Body: { capability: CapabilityTarget, gatewayId?: string }
// Returns: AZMA Unit cost, whether Creator can proceed, trial status.
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
  const gatewayId = (body as { gatewayId?: unknown })?.gatewayId ?? 'openai';

  if (typeof capability !== 'string' || !VALID_CAPABILITIES.includes(capability as CapabilityTarget)) {
    return NextResponse.json(
      { error: 'invalid_capability', valid: VALID_CAPABILITIES },
      { status: 400 },
    );
  }

  if (typeof gatewayId !== 'string') {
    return NextResponse.json({ error: 'invalid_gateway_id' }, { status: 400 });
  }

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

  return NextResponse.json({
    capability,
    gatewayId,
    estimatedAzmaUnits: estimate.estimatedAzmaUnits,
    availability: estimate.availability,
    unitDescription: estimate.unitDescription,
    canProceed,
    blockerReason: canProceed ? undefined : estimate.blockerReason,
    availableUnits: balance.availableUnits,
    trialAvailable,
    catalogVersion: estimate.catalogVersion,
  });
}
