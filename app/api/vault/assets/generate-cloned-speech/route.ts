import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../src/authentication';
import { SovereignVaultManager } from '../../../../../src/vault/sovereign-vault-manager';
import { AssetFamily, SourceChamber } from '../../../../../src/vault/sovereign-vault-types';
import { CapabilityTarget } from '../../../../../src/core/sovereign-orchestrator/qiyamah-intent-types';
import { synthesizeSpeechWithClonedVoice } from '../../../../../src/chambers/ras-al-amr/voice-cloning-provider';
import { persistUploadedAsset } from '../../../../../src/vault/vault-asset-upload-storage';
import { getDb } from '../../../../../src/persistent-storage';
import { ConsumptionRepository } from '../../../../../src/persistent-storage/consumption-repository';
import { OperationType } from '../../../../../src/consumption-ledger/consumption-ledger-contracts';
import { getCurrentMonthKey } from '../../../../../src/consumption-ledger/cost-estimator';
import { authorisePaidOperation } from '../../../../../src/economy/paid-operation-gate';
import { SPEECH_CAPABILITY } from '../../../../../src/economy/pricing/sovereign-price-authority';

import {
  claimAttempt, completeAttempt, failAttempt,
  OPERATION_KEY_HEADER, readClientOperationKey,
} from '@/src/economy/paid-operation-attempts';
import { settleReservation, releaseReservation } from '@/src/economy/paid-operation-gate';

export const dynamic = 'force-dynamic';

/** The namespace this road's submission keys live in. */
const CLONED_SPEECH_SCOPE = 'vault:cloned-speech';

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
  // MEASURED: the settlement re-derived this number from the cost engine
  // inside its own try block. A hold and a charge computed in two places
  // are two numbers that can drift, and an estimate that threw there left
  // the hold stranded in silence. One number now, held and charged.
  let chargeUnits = 0;

  // The submission, claimed before a unit is held. Where the browser sends
  // a key, a press that arrives twice is answered once; where it does not,
  // each request stands alone and covers its own provider call.
  const claim = claimAttempt({
    db, creatorId: session.creatorId, scope: CLONED_SPEECH_SCOPE,
    clientKey: readClientOperationKey(request.headers.get(OPERATION_KEY_HEADER)),
  });
  if (claim.kind === 'in-flight') {
    return NextResponse.json(
      { status: 'failed', reason: 'operation-in-flight',
        message: 'هذا النطق يَجري الآن. انتظر نتيجته — ولم يُحسَب عليك مرّتين.' },
      { status: 409 },
    );
  }
  if (claim.kind === 'already-succeeded') {
    const replayed = replayClonedSpeechResult(claim.resultJson);
    if (replayed) return NextResponse.json(replayed, { status: 200 });
    return NextResponse.json(
      { status: 'failed', reason: 'already-performed',
        message: 'هذا النطق نُفِّذ من قبل. اطلبه من خزانتك بدلاً من إعادته.' },
      { status: 409 },
    );
  }

  /*  ── CHARGED BY THE CHARACTERS IT WILL SPEND ───────────────────────────
   *
   *    RULED 2026-11-03, decision 2: «يُحاسب توليد الكلام وفق الاستهلاك
   *    الفعلي للأحرف والتعريفة الفعلية للمزود… التكلفة الفعلية × 1.70.»
   *
   *    It supersedes what this road used to charge: a flat 30 units per
   *    OPERATION, taken from a provider COST catalog that was never a price
   *    authority. MEASURED against the real tariff, that flat figure broke
   *    even at 395 characters and lost money on every narration longer than
   *    that — and a scene's voice-over is long by nature. A 1,000-character
   *    narration cost the Empire 75.8 units and charged 30.
   *
   *    The quantity is the TEXT'S OWN LENGTH, which is what the provider
   *    meters, and never a number the browser states about it. The gate
   *    multiplies and rounds once, at the job, as the Constitution ratified.
   */
  const spokenCharacters = text.trim().length;
  const speechGate = authorisePaidOperation({
    db,
    creatorId: session.creatorId,
    role: session.role,
    // The catalog's flat per-operation entry is exactly what this road is
    // leaving behind, so it is not consulted at all.
    capability: null,
    gatewayId: 'elevenlabs',
    attemptKey: claim.attemptKey,
    sovereignCapability: SPEECH_CAPABILITY,
    quantity: spokenCharacters,
    metadata: { characters: spokenCharacters },
  });

  if (speechGate.kind === 'refused') {
    failAttempt(db, claim.attemptKey, `gate:${speechGate.reason}`);
    return NextResponse.json(
      {
        status: 'failed',
        reason: speechGate.reason,
        message: speechGate.messageAr,
        ...(speechGate.requiredUnits !== undefined ? { requiredUnits: speechGate.requiredUnits } : {}),
        ...(speechGate.availableUnits !== undefined ? { availableUnits: speechGate.availableUnits } : {}),
      },
      { status: speechGate.httpStatus },
    );
  }

  if (speechGate.kind === 'reserved') {
    reservationId = speechGate.reservationId;
    chargeUnits = speechGate.units;
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
      releaseReservation({
        db, creatorId: session.creatorId, attemptKey: claim.attemptKey,
        reservationId, reason: 'clone_speech_provider_error',
      });
    }
    // Closed, like the storage failure below it. A release that leaves the
    // attempt in-flight is a submission key nobody can reuse.
    failAttempt(db, claim.attemptKey, 'provider-error');
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
      // Voice and speech belong to Ras Al Amr by the Founder's own ruling,
      // and Article 1.3 names «الصوت المركب» among its responsibilities.
      creationChamber: SourceChamber.RAS_AL_AMR,
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
      settleReservation({
        db, creatorId: session.creatorId, attemptKey: claim.attemptKey,
        reservationId, units: chargeUnits, metadata: { assetId: asset.assetId },
      });
    }

    try {
      const ledger = new ConsumptionRepository(db);
      const charCount = text.trim().length;
      ledger.record({
        creatorId: session.creatorId,
        operationType: OperationType.TEXT_TO_SPEECH,
        // Superseded: the repository resolves the measured cost and its basis.
        costUsdEstimate: 0,
        units: charCount,
        monthKey: getCurrentMonthKey(),
        recordedAt: Date.now(),
      });
    } catch { /* non-fatal */ }

    const answer = { status: 'succeeded' as const, asset };
    // Closed, so a resent key is ANSWERED rather than performed again.
    completeAttempt(db, claim.attemptKey, answer);
    return NextResponse.json(answer);
  } catch (error) {
    if (reservationId) {
      releaseReservation({
        db, creatorId: session.creatorId, attemptKey: claim.attemptKey,
        reservationId, reason: 'clone_speech_storage_error',
      });
    }
    failAttempt(db, claim.attemptKey, 'storage-error');
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

/**
 * A stored answer, read back for a resent key. A row that will not parse
 * back into a success carrying an asset is no licence to spend again.
 */
function replayClonedSpeechResult(resultJson: string | null): unknown | null {
  if (typeof resultJson !== 'string') return null;
  try {
    const parsed = JSON.parse(resultJson) as { status?: unknown; asset?: { assetId?: unknown } };
    if (parsed?.status !== 'succeeded') return null;
    if (typeof parsed.asset?.assetId !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}
