import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { verifySession } from '../../../../../src/authentication';
import { SovereignVaultManager } from '../../../../../src/vault/sovereign-vault-manager';
import { AssetFamily, isVoiceAsset } from '../../../../../src/vault/sovereign-vault-types';
import { CapabilityTarget } from '../../../../../src/core/sovereign-orchestrator/qiyamah-intent-types';
import { cloneVoiceViaProvider } from '../../../../../src/chambers/ras-al-amr/voice-cloning-provider';
import { getDb } from '../../../../../src/persistent-storage';
import { ConsumptionRepository } from '../../../../../src/persistent-storage/consumption-repository';
import { OperationType } from '../../../../../src/consumption-ledger/consumption-ledger-contracts';
import { estimateVoiceCloneCost, getCurrentMonthKey } from '../../../../../src/consumption-ledger/cost-estimator';
import { CreatorCreditRepository } from '../../../../../src/economy/credit-ledger/credit-ledger-repository';
import { AzmaUnitCostEngine } from '../../../../../src/economy/cost-engine/azma-cost-engine';
import { InsufficientBalanceError } from '../../../../../src/economy/credit-ledger/credit-ledger-types';
import { CostUnavailableError } from '../../../../../src/economy/cost-engine/cost-engine-types';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';
const vaultManager = new SovereignVaultManager();

// Only assets stored by this platform's own upload/generation pipeline
// can serve as cloning references — externally-hosted URIs cannot be
// read from the local filesystem.
const LOCAL_UPLOAD_PATH_PREFIX = '/uploads/';

/**
 * MINISTRY III — VOICE CLONING ENGINE: the Creator selects one of their
 * own Sovereign Voice Assets as a reference, submits it to the Launch
 * Provider for cloning, and the resulting cloned voice identity is
 * immediately deposited as a new Sovereign Voice Asset — tagged
 * isVoiceAsset/isClonedVoice/voiceDisplayName exactly like every other
 * real Voice Asset (Ministry I imported, Ministry II TTS-generated), so
 * it appears in the same Voice Library and is immediately assignable to
 * Direction Nodes via the existing VoiceAssignmentDirective path. No
 * second library, no parallel voice pipeline, no duplicate state.
 *
 * Gated behind the same billing entitlement every real AI capability
 * requires — voice cloning consumes a paid Launch Provider just as TTS
 * and image generation do.
 */
export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'Sign in to clone a voice.' },
      { status: 401 },
    );
  }

  // CREDIT-FIRST GATE: Founders bypass. Creators require AZMA Units.
  // Voice cloning cost is currently pending-discovery — blocks generation with clear message.
  const db = getDb();
  let reservationId: string | null = null;

  if (session.role !== 'founder') {
    const costEngine = new AzmaUnitCostEngine();
    let costEstimate;
    try {
      costEstimate = costEngine.estimate('voice-cloning', 'openai');
    } catch (err) {
      if (err instanceof CostUnavailableError) {
        return NextResponse.json(
          { status: 'failed', reason: 'cost-unavailable', message: 'Voice cloning cost is not yet available. Generation blocked.' },
          { status: 503 },
        );
      }
      throw err;
    }

    const creditRepo = new CreatorCreditRepository(db);
    const balance = creditRepo.getBalance(session.creatorId);

    if (balance.availableUnits < costEstimate.estimatedAzmaUnits) {
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

    try {
      const reservation = creditRepo.reserve(
        session.creatorId,
        costEstimate.estimatedAzmaUnits,
        `voice-clone:${randomUUID()}`,
        { capability: 'voice-cloning', gatewayId: 'openai' },
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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid-request', message: 'Request body must be valid JSON.' },
      { status: 400 },
    );
  }

  const referenceAssetId = (body as { referenceAssetId?: unknown })?.referenceAssetId;
  const voiceDisplayNameRaw = (body as { voiceDisplayName?: unknown })?.voiceDisplayName;

  if (typeof referenceAssetId !== 'string' || referenceAssetId.trim().length === 0) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid-reference', message: 'A reference voice asset ID is required.' },
      { status: 400 },
    );
  }

  const requestedDisplayName =
    typeof voiceDisplayNameRaw === 'string' && voiceDisplayNameRaw.trim().length > 0
      ? voiceDisplayNameRaw.trim()
      : undefined;

  // Fetch the reference asset — enforces tenant isolation (getAsset throws
  // if the asset belongs to a different Creator).
  let referenceAsset;
  try {
    referenceAsset = await vaultManager.getAsset(referenceAssetId.trim(), session.creatorId);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'failed',
        reason: 'reference-not-found',
        message: error instanceof Error ? error.message : 'Reference asset not found.',
      },
      { status: 404 },
    );
  }

  if (!isVoiceAsset(referenceAsset)) {
    return NextResponse.json(
      { status: 'failed', reason: 'not-a-voice', message: 'The selected asset is not a Voice Asset.' },
      { status: 400 },
    );
  }

  if (!referenceAsset.secureStorageUri.startsWith(LOCAL_UPLOAD_PATH_PREFIX)) {
    return NextResponse.json(
      {
        status: 'failed',
        reason: 'unsupported-source',
        message: 'This Voice Asset cannot be used as a cloning reference.',
      },
      { status: 400 },
    );
  }

  // Read the reference audio from the platform's own local storage.
  // Strips the leading "/" so path.join works correctly cross-platform.
  let referenceAudioBytes: Buffer;
  try {
    const relativePath = referenceAsset.secureStorageUri.replace(/^\//, '');
    const filePath = join(process.cwd(), 'public', relativePath);
    referenceAudioBytes = await readFile(filePath);
  } catch {
    return NextResponse.json(
      { status: 'failed', reason: 'source-unavailable', message: 'The reference Voice Asset file could not be read.' },
      { status: 500 },
    );
  }

  const voiceDisplayName =
    requestedDisplayName ??
    (typeof referenceAsset.metadata.voiceDisplayName === 'string'
      ? `Clone of ${referenceAsset.metadata.voiceDisplayName}`
      : 'Cloned Voice');

  const referenceFileName = referenceAsset.secureStorageUri.split('/').pop() ?? 'reference.mp3';

  let cloneResult;
  try {
    cloneResult = await cloneVoiceViaProvider(referenceAudioBytes, referenceFileName, voiceDisplayName);
  } catch (error) {
    if (reservationId) {
      try { new CreatorCreditRepository(db).release(reservationId, 'voice_clone_provider_error'); } catch { /* non-fatal */ }
    }
    return NextResponse.json(
      {
        status: 'failed',
        reason: 'provider-error',
        message: error instanceof Error ? error.message : 'The Launch Provider failed to clone the voice.',
      },
      { status: 502 },
    );
  }

  // Deposit the cloned voice as a new Sovereign Voice Asset — the same
  // SovereignVaultManager.depositAsset() boundary every other real asset
  // (Qiyamah generations, Creator uploads, Ministry II TTS) goes through.
  try {
    const asset = await vaultManager.depositAsset({
      operationId: referenceAsset.assetId,
      subscriberTenantId: session.creatorId,
      capabilityTarget: CapabilityTarget.AUDIO,
      assetFamily: AssetFamily.MEDIA,
      secureStorageUri: referenceAsset.secureStorageUri,
      metadata: {
        isVoiceAsset: true,
        isClonedVoice: true,
        voiceDisplayName,
        clonedVoiceProviderId: cloneResult.voiceProviderId,
        providerId: 'voice-cloning-provider',
      },
    });

    // Settle reservation on success
    if (reservationId) {
      try {
        const costEngine = new AzmaUnitCostEngine();
        const cost = costEngine.estimate('voice-cloning', 'openai').estimatedAzmaUnits;
        new CreatorCreditRepository(db).settle(reservationId, cost);
      } catch { /* non-fatal */ }
    }

    // Record consumption for cost discovery
    try {
      const ledger = new ConsumptionRepository(db);
      ledger.record({
        creatorId: session.creatorId,
        operationType: OperationType.VOICE_CLONE,
        costUsdEstimate: estimateVoiceCloneCost(),
        units: 1,
        monthKey: getCurrentMonthKey(),
        recordedAt: Date.now(),
      });
    } catch { /* non-fatal */ }

    return NextResponse.json({ status: 'succeeded', asset });
  } catch (error) {
    if (reservationId) {
      try { new CreatorCreditRepository(db).release(reservationId, 'voice_clone_storage_error'); } catch { /* non-fatal */ }
    }
    return NextResponse.json(
      {
        status: 'failed',
        reason: 'storage-error',
        message: error instanceof Error ? error.message : 'Failed to persist the cloned Voice Asset.',
      },
      { status: 500 },
    );
  }
}
