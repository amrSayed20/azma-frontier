import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { verifySession } from '../../../../../src/authentication';
import { SovereignVaultManager } from '../../../../../src/vault/sovereign-vault-manager';
import { AssetFamily } from '../../../../../src/vault/sovereign-vault-types';
import { CapabilityTarget } from '../../../../../src/core/sovereign-orchestrator/qiyamah-intent-types';
import { persistUploadedAsset } from '../../../../../src/vault/vault-asset-upload-storage';
import { synthesizeSpeechWithClonedVoice } from '../../../../../src/chambers/ras-al-amr/voice-cloning-provider';
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

// ElevenLabs input limit matches the platform max (same as the previous OpenAI limit).
const MAX_TEXT_LENGTH = 4096;

// Curated preset voice whitelist — only these ElevenLabs voice IDs are accepted.
// Must stay in sync with ELEVENLABS_PRESET_VOICES in app/ras-amr/page.tsx.
const VALID_PRESET_VOICE_IDS = new Set([
  'pNInz6obpgDQGcFmaJgB', // Adam
  '21m00Tcm4TlvDq8ikWAM', // Rachel
  'TxGEqnHWrfWFTfGW9XjX', // Josh
  'EXAVITQu4vr4xnSDxMaL', // Bella
  'ErXwobaYiN019PkySvjV',  // Antoni
  'ThT5KcBeYPX3keUQqHPh',  // Dorothy
  'IKne3meq5aSn9XLyUdCD',  // Charlie
  'N2lVS1w4EtoT3dr4eOWO',  // Callum
]);

/**
 * MINISTRY II — TEXT TO SPEECH ENGINE (ElevenLabs):
 * The Creator writes text, picks one of the Empire's curated preset voices,
 * and receives a real generated Voice Asset via ElevenLabs. The result is
 * deposited through SovereignVaultManager exactly like every other real
 * asset, tagged isVoiceAsset so it is immediately visible in Ministry I's
 * Voice Library and assignable to any Direction Node.
 *
 * The same VOICE_CLONING_API_KEY used by Ministry III (cloning + synthesis)
 * is used here — no additional credential required.
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

  const text = (body as { text?: unknown })?.text;
  const voice = (body as { voice?: unknown })?.voice;
  const voiceDisplayNameRaw = (body as { voiceDisplayName?: unknown })?.voiceDisplayName;

  if (typeof text !== 'string' || text.trim().length === 0) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid-text', message: 'Text to speak is required.' },
      { status: 400 },
    );
  }
  if (text.length > MAX_TEXT_LENGTH) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid-text', message: `Text exceeds the maximum length of ${MAX_TEXT_LENGTH} characters.` },
      { status: 400 },
    );
  }
  if (typeof voice !== 'string' || !VALID_PRESET_VOICE_IDS.has(voice)) {
    return NextResponse.json(
      { status: 'failed', reason: 'invalid-voice', message: 'A valid preset voice is required.' },
      { status: 400 },
    );
  }

  // CREDIT-FIRST GATE: Founders bypass. Creators require AZMA Units.
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
      : `TTS — ElevenLabs`;

  let audioBytes: Buffer;
  try {
    const result = await synthesizeSpeechWithClonedVoice(text.trim(), voice);
    audioBytes = result.bytes;
  } catch (err) {
    if (reservationId) {
      try { new CreatorCreditRepository(db).release(reservationId, 'tts_provider_error'); } catch { /* non-fatal */ }
    }
    return NextResponse.json(
      {
        status: 'failed',
        reason: 'provider-error',
        message: err instanceof Error ? err.message : 'Speech generation provider returned an error.',
      },
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
        providerId: 'elevenlabs',
        generationPrompt: text.trim(),
        isVoiceAsset: true,
        voiceDisplayName,
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
      try { new CreatorCreditRepository(db).release(reservationId, 'tts_storage_error'); } catch { /* non-fatal */ }
    }
    return NextResponse.json(
      {
        status: 'failed',
        reason: 'storage-error',
        message: error instanceof Error ? error.message : 'Failed to persist the generated Voice Asset.',
      },
      { status: 500 },
    );
  }
}
