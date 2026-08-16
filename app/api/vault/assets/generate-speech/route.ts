import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { verifySession } from '../../../../../src/authentication';
import { SovereignVaultManager } from '../../../../../src/vault/sovereign-vault-manager';
import { AssetFamily } from '../../../../../src/vault/sovereign-vault-types';
import { CapabilityTarget } from '../../../../../src/core/sovereign-orchestrator/qiyamah-intent-types';
import { persistUploadedAsset } from '../../../../../src/vault/vault-asset-upload-storage';
import { isTtsProviderVoice } from '../../../../../src/chambers/ras-al-amr/speech-provider';
import { getGenerationOrchestrator } from '../../../../../src/core/sovereign-ai-integration/provider-bootstrap';
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

// OpenAI's own real, documented TTS input limit (openai/resources/audio/speech.d.ts:
// "The text to generate audio for. The maximum length is 4096 characters.") — not an
// invented platform limit.
const MAX_TEXT_LENGTH = 4096;

/**
 * MINISTRY II — TEXT TO SPEECH ENGINE: the Creator writes text, chooses one
 * of the Empire's own closed set of preset voices, and receives a real
 * generated Voice Asset — deposited through the exact same
 * SovereignVaultManager.depositAsset() boundary every other real asset
 * (Qiyamah generations, Creator uploads) already goes through, and tagged
 * with the same isVoiceAsset/voiceDisplayName metadata Ministry I already
 * established, so imported and generated voices coexist in one
 * constitutional Voice Library — no second library, no duplicated
 * pipeline. This route performs no cinematic direction, rendering, or
 * export — its responsibility ends the moment the Voice Asset exists.
 *
 * Gated behind the same billing entitlement every other real AI
 * generation capability requires (Billing Foundation) — TTS consumes the
 * same paid Launch Provider, so it must not be a free, unmetered
 * bypass of that gate.
 */
export async function POST(request: NextRequest) {
  const sessionId = request.cookies.get(SESSION_COOKIE)?.value;
  const session = sessionId ? verifySession(sessionId) : null;

  if (!session) {
    return NextResponse.json({ status: 'failed', reason: 'unauthorized', message: 'Sign in to generate speech.' }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ status: 'failed', reason: 'invalid-request', message: 'Request body must be valid JSON.' }, { status: 400 });
  }

  const text = (body as { text?: unknown })?.text;
  const voice = (body as { voice?: unknown })?.voice;
  const voiceDisplayNameRaw = (body as { voiceDisplayName?: unknown })?.voiceDisplayName;

  if (typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json({ status: 'failed', reason: 'invalid-text', message: 'Text to speak is required.' }, { status: 400 });
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid-text', message: `Text exceeds the maximum length of ${MAX_TEXT_LENGTH} characters.` },
      { status: 400 },
    );
  }
  if (typeof voice !== 'string' || !isTtsProviderVoice(voice)) {
    return NextResponse.json({ status: 'failed', reason: 'invalid-voice', message: 'A valid preset voice is required.' }, { status: 400 });
  }

  // CREDIT-FIRST GATE: Founders bypass. Creators require AZMA Units.
  // Pre-flight cost check before any provider call — NO COST WITHOUT PRIOR KNOWLEDGE.
  const db = getDb();
  let reservationId: string | null = null;

  if (session.role !== 'founder') {
    const costEngine = new AzmaUnitCostEngine();
    let costEstimate;
    try {
      costEstimate = costEngine.estimate('text-to-speech', 'openai');
    } catch (err) {
      if (err instanceof CostUnavailableError) {
        return NextResponse.json(
          { status: 'failed', reason: 'cost-unavailable', message: 'TTS cost is not yet available. Generation blocked.' },
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
        `tts:gen:${randomUUID()}`,
        { capability: 'text-to-speech', gatewayId: 'openai' },
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
      : `TTS — ${voice}`;

  // Route through the sovereign orchestration path — provider selection,
  // constitutional routing, and fallback handled by DNAOrchestratorRuntime.
  // The TTS adapter places base64-encoded audio bytes in
  // NormalizedAIResponse.content; we decode back to Buffer here.
  const speechOrchestration = await getGenerationOrchestrator().orchestrate({
    requestId: crypto.randomUUID(),
    requestedBy: session.creatorId,
    prompt: text.trim(),
    taskHint: 'audio',
    chamberId: 'ras-al-amr',
    purpose: 'Sovereign text-to-speech generation for Creator',
    metadata: { voice },
  });

  if (speechOrchestration.response.finishReason !== 'completed') {
    if (reservationId) {
      try { new CreatorCreditRepository(db).release(reservationId, 'tts_provider_unavailable'); } catch { /* non-fatal */ }
    }
    return NextResponse.json(
      {
        status: 'failed',
        reason: 'provider-error',
        message:
          'No speech generation provider was available. The capability may require an API credential to be configured.',
      },
      { status: 502 },
    );
  }

  let audioBytes: Buffer;
  try {
    audioBytes = Buffer.from(speechOrchestration.response.content, 'base64');
  } catch {
    return NextResponse.json(
      { status: 'failed', reason: 'provider-error', message: 'The speech generation response could not be decoded.' },
      { status: 502 },
    );
  }

  try {
    const persisted = await persistUploadedAsset(audioBytes, '.mp3');
    const asset = await vaultManager.depositAsset({
      operationId: persisted.assetId,
      subscriberTenantId: session.creatorId,
      capabilityTarget: CapabilityTarget.AUDIO,
      assetFamily: AssetFamily.MEDIA,
      secureStorageUri: persisted.assetUrl,
      metadata: {
        fileSizeBytes: audioBytes.length,
        providerId: speechOrchestration.response.providerId ?? 'sovereign-provider',
        generationPrompt: text.trim(),
        isVoiceAsset: true,
        voiceDisplayName,
      },
    });

    // Settle reservation on success
    if (reservationId) {
      try {
        const costEngine = new AzmaUnitCostEngine();
        const cost = costEngine.estimate('text-to-speech', 'openai').estimatedAzmaUnits;
        new CreatorCreditRepository(db).settle(reservationId, cost);
      } catch { /* non-fatal */ }
    }

    // Record consumption for cost discovery (Founders and all Creators)
    try {
      const ledger = new ConsumptionRepository(db);
      const charCount = (text as string).trim().length;
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
      try { new CreatorCreditRepository(db).release(reservationId, 'tts_storage_error'); } catch { /* non-fatal */ }
    }
    return NextResponse.json(
      { status: 'failed', reason: 'storage-error', message: error instanceof Error ? error.message : 'Failed to persist the generated Voice Asset.' },
      { status: 500 },
    );
  }
}
