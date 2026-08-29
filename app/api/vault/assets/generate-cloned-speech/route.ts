import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { verifySession } from '../../../../../src/authentication';
import { SovereignVaultManager } from '../../../../../src/vault/sovereign-vault-manager';
import { AssetFamily } from '../../../../../src/vault/sovereign-vault-types';
import { CapabilityTarget } from '../../../../../src/core/sovereign-orchestrator/qiyamah-intent-types';
import { synthesizeSpeechWithClonedVoice } from '../../../../../src/chambers/ras-al-amr/voice-cloning-provider';
import { persistUploadedAsset } from '../../../../../src/vault/vault-asset-upload-storage';
import { getDb } from '../../../../../src/persistent-storage';
import { ConsumptionRepository } from '../../../../../src/persistent-storage/consumption-repository';
import { OperationType } from '../../../../../src/consumption-ledger/consumption-ledger-contracts';
import { estimateTtsCost, getCurrentMonthKey } from '../../../../../src/consumption-ledger/cost-estimator';
import { CreatorCreditRepository } from '../../../../../src/economy/credit-ledger/credit-ledger-repository';
import { AzmaUnitCostEngine } from '../../../../../src/economy/cost-engine/azma-cost-engine';
import { InsufficientBalanceError } from '../../../../../src/economy/credit-ledger/credit-ledger-types';
import { CostUnavailableError } from '../../../../../src/economy/cost-engine/cost-engine-types';

export const dynamic = 'force-dynamic';

const SESSION_COOKIE = 'azma_session';
const vaultManager = new SovereignVaultManager();
const MAX_TEXT_LENGTH = 4096;

/**
 * MINISTRY III — VOICE CLONING: SYNTHESIS BOUNDARY
 *
 * Accepts a cloned voice identity (VaultAsset with isClonedVoice:true +
 * clonedVoiceProviderId) and new text, calls ElevenLabs
 * /v1/text-to-speech/{voice_id} to generate genuinely new speech in the
 * cloned voice's timbre, and deposits the result as a real MEDIA VaultAsset.
 *
 * The generated audio is distinct from the reference recording:
 *   - Different file path (new UUID via persistUploadedAsset)
 *   - Different content (new text synthesized in the cloned voice)
 *   - Different assetId and originatingOperationId
 *
 * The cloned voice identity itself (STRUCTURAL) is never modified. Only
 * the generated speech (MEDIA) can be assigned to a Direction Node.
 *
 * Cost-gated identically to TTS (text-to-speech via elevenlabs):
 * pending-discovery → 503 for non-founders. Founders bypass.
 */
export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json(
      { status: 'failed', reason: 'unauthorized', message: 'Sign in to generate speech.' },
      { status: 401 },
    );
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

  const clonedVoiceAssetId = (body as { clonedVoiceAssetId?: unknown })?.clonedVoiceAssetId;
  const text = (body as { text?: unknown })?.text;
  const voiceDisplayNameRaw = (body as { voiceDisplayName?: unknown })?.voiceDisplayName;

  if (typeof clonedVoiceAssetId !== 'string' || clonedVoiceAssetId.trim().length === 0) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid-asset', message: 'A cloned voice asset ID is required.' },
      { status: 400 },
    );
  }
  if (typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid-text', message: 'Text to speak is required.' },
      { status: 400 },
    );
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      {
        status: 'failed',
        reason: 'invalid-text',
        message: `Text exceeds the maximum length of ${MAX_TEXT_LENGTH} characters.`,
      },
      { status: 400 },
    );
  }

  // Verify the asset is a real cloned voice identity with a provider voice ID.
  let clonedVoiceAsset;
  try {
    clonedVoiceAsset = await vaultManager.getAsset(clonedVoiceAssetId.trim(), session.creatorId);
  } catch (error) {
    return NextResponse.json(
      {
        status: 'failed',
        reason: 'asset-not-found',
        message: error instanceof Error ? error.message : 'Cloned voice asset not found.',
      },
      { status: 404 },
    );
  }

  if (clonedVoiceAsset.metadata.isClonedVoice !== true) {
    return NextResponse.json(
      { status: 'failed', reason: 'not-a-cloned-voice', message: 'The selected asset is not a cloned voice identity.' },
      { status: 400 },
    );
  }

  const voiceProviderId = clonedVoiceAsset.metadata.clonedVoiceProviderId;
  if (typeof voiceProviderId !== 'string' || voiceProviderId.trim().length === 0) {
    return NextResponse.json(
      { status: 'failed', reason: 'missing-provider-id', message: 'The cloned voice identity has no provider voice ID.' },
      { status: 422 },
    );
  }

  // CREDIT-FIRST GATE: Founders bypass. Non-founders require AZMA Units.
  const db = getDb();
  let reservationId: string | null = null;

  if (session.role !== 'founder') {
    const costEngine = new AzmaUnitCostEngine();
    let costEstimate;
    try {
      costEstimate = costEngine.estimate('text-to-speech', 'elevenlabs');
    } catch (err) {
      if (err instanceof CostUnavailableError) {
        return NextResponse.json(
          {
            status: 'failed',
            reason: 'cost-unavailable',
            message: 'Cloned voice speech generation cost is not yet available. Generation blocked.',
          },
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
        `clone-speech:${randomUUID()}`,
        { capability: 'text-to-speech', gatewayId: 'elevenlabs' },
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

  const voiceDisplayName =
    typeof voiceDisplayNameRaw === 'string' && voiceDisplayNameRaw.trim().length > 0
      ? voiceDisplayNameRaw.trim()
      : `Generated — ${typeof clonedVoiceAsset.metadata.voiceDisplayName === 'string' ? clonedVoiceAsset.metadata.voiceDisplayName : 'Cloned Voice'}`;

  let synthResult;
  try {
    synthResult = await synthesizeSpeechWithClonedVoice(text.trim(), voiceProviderId.trim());
  } catch (error) {
    if (reservationId) {
      try { new CreatorCreditRepository(db).release(reservationId, 'clone_speech_provider_error'); } catch { /* non-fatal */ }
    }
    return NextResponse.json(
      {
        status: 'failed',
        reason: 'provider-error',
        message: error instanceof Error ? error.message : 'The Launch Provider failed to generate speech.',
      },
      { status: 502 },
    );
  }

  try {
    const persisted = await persistUploadedAsset(synthResult.bytes, '.mp3');

    const asset = await vaultManager.depositAsset({
      operationId: persisted.assetId,
      subscriberTenantId: session.creatorId,
      capabilityTarget: CapabilityTarget.AUDIO,
      assetFamily: AssetFamily.MEDIA,
      secureStorageUri: persisted.assetUrl,
      metadata: {
        fileSizeBytes: synthResult.bytes.length,
        isVoiceAsset: true,
        voiceDisplayName,
        generationPrompt: text.trim(),
        providerId: 'elevenlabs-voice-clone-synthesis',
        sourceClonedVoiceAssetId: clonedVoiceAssetId.trim(),
      },
    });

    if (reservationId) {
      try {
        const costEngine = new AzmaUnitCostEngine();
        const cost = costEngine.estimate('text-to-speech', 'elevenlabs').estimatedAzmaUnits;
        new CreatorCreditRepository(db).settle(reservationId, cost);
      } catch { /* non-fatal */ }
    }

    try {
      const ledger = new ConsumptionRepository(db);
      const charCount = text.trim().length;
      ledger.record({
        creatorId: session.creatorId,
        operationType: OperationType.TEXT_TO_SPEECH,
        costUsdEstimate: estimateTtsCost(charCount),
        units: charCount,
        monthKey: getCurrentMonthKey(),
        recordedAt: Date.now(),
      });
    } catch { /* non-fatal */ }

    return NextResponse.json({ status: 'succeeded', asset });
  } catch (error) {
    if (reservationId) {
      try { new CreatorCreditRepository(db).release(reservationId, 'clone_speech_storage_error'); } catch { /* non-fatal */ }
    }
    return NextResponse.json(
      {
        status: 'failed',
        reason: 'storage-error',
        message: error instanceof Error ? error.message : 'Failed to persist the generated audio.',
      },
      { status: 500 },
    );
  }
}
