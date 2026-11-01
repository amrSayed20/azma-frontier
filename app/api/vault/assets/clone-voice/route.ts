import { NextRequest, NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';
import { verifySession } from '../../../../../src/authentication';
import { SovereignVaultManager } from '../../../../../src/vault/sovereign-vault-manager';
import { AssetFamily, isVoiceAsset, SourceChamber } from '../../../../../src/vault/sovereign-vault-types';
import { CapabilityTarget } from '../../../../../src/core/sovereign-orchestrator/qiyamah-intent-types';
import { cloneVoiceViaProvider } from '../../../../../src/chambers/ras-al-amr/voice-cloning-provider';
import { getDb } from '../../../../../src/persistent-storage';
import { ConsumptionRepository } from '../../../../../src/persistent-storage/consumption-repository';
import { OperationType } from '../../../../../src/consumption-ledger/consumption-ledger-contracts';
import { getCurrentMonthKey } from '../../../../../src/consumption-ledger/cost-estimator';
import { CreatorCreditRepository } from '../../../../../src/economy/credit-ledger/credit-ledger-repository';
import { AzmaUnitCostEngine } from '../../../../../src/economy/cost-engine/azma-cost-engine';
import { InsufficientBalanceError } from '../../../../../src/economy/credit-ledger/credit-ledger-types';
import { CostUnavailableError } from '../../../../../src/economy/cost-engine/cost-engine-types';

import {
  claimAttempt, completeAttempt, failAttempt, attachReservation,
  OPERATION_KEY_HEADER, readClientOperationKey,
} from '@/src/economy/paid-operation-attempts';
import { settleReservation, releaseReservation } from '@/src/economy/paid-operation-gate';

export const dynamic = 'force-dynamic';

/** The namespace this road's submission keys live in. */
const VOICE_CLONE_SCOPE = 'vault:voice-cloning';

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
  // MEASURED: the settlement re-derived this number from the cost engine
  // inside its own try block. A hold and a charge computed in two places
  // are two numbers that can drift, and an estimate that threw there left
  // the hold stranded in silence. One number now, held and charged.
  let chargeUnits = 0;

  // The submission, claimed before a unit is held. Where the browser sends
  // a key, a press that arrives twice is answered once; where it does not,
  // each request stands alone and covers its own provider call.
  const claim = claimAttempt({
    db, creatorId: session.creatorId, scope: VOICE_CLONE_SCOPE,
    clientKey: readClientOperationKey(request.headers.get(OPERATION_KEY_HEADER)),
  });
  if (claim.kind === 'in-flight') {
    return NextResponse.json(
      { status: 'failed', reason: 'operation-in-flight',
        message: 'استنساخ الصوت هذا يَجري الآن. انتظر نتيجته — ولم يُحسَب عليك مرّتين.' },
      { status: 409 },
    );
  }
  if (claim.kind === 'already-succeeded') {
    const replayed = replayVoiceCloneResult(claim.resultJson);
    if (replayed) return NextResponse.json(replayed, { status: 200 });
    return NextResponse.json(
      { status: 'failed', reason: 'already-performed',
        message: 'استنساخ الصوت هذا نُفِّذ من قبل. اطلبه من خزانتك بدلاً من إعادته.' },
      { status: 409 },
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

  const referenceAssetId = (body as { referenceAssetId?: unknown })?.referenceAssetId;
  const voiceDisplayNameRaw = (body as { voiceDisplayName?: unknown })?.voiceDisplayName;
  const consentConfirmed = (body as { consentConfirmed?: unknown })?.consentConfirmed;

  if (consentConfirmed !== true) {
    return NextResponse.json(
      { status: 'failed', reason: 'consent-required', message: 'You must confirm that you are authorized to clone this voice.' },
      { status: 400 },
    );
  }

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
    // ── A live production defect, found and proven by measurement ───────────
    //
    //   This read `join(process.cwd(), 'public', relativePath)` — with no
    //   UPLOADS_DIR at all. In production UPLOADS_DIR=/var/www/azma-uploads and
    //   public/uploads holds only a stale remnant from before that variable
    //   existed. Measured on the live server:
    //
    //     3 of 3 voice assets present in UPLOADS_DIR
    //     1 of 3 present in public/uploads
    //
    //   So two of every three Creator voices could not be used as a cloning
    //   reference at all, and the route answered 'source-unavailable' as though
    //   the Creator's own file were at fault.
    //
    //   Resolved the way the ffmpeg encoder already resolves it — the one place
    //   in the repository that had this right from the start.
    const uploadsBase = process.env.UPLOADS_DIR ?? join(process.cwd(), 'public', 'uploads');
    const uri = referenceAsset.secureStorageUri;
    const filePath = uri.startsWith('/generated-assets/')
      ? join(uploadsBase, 'generated-assets', uri.slice('/generated-assets/'.length))
      : join(uploadsBase, uri.replace(/^\/uploads\//, ''));
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

  // ── THE MONEY, MOVED TO WHERE NOTHING CAN REFUSE AFTER IT ───────────────
  //
  //   CORRECTED 2026-11-01. This block used to sit far above, BEFORE the
  //   request body was even parsed — so SEVEN refusals stood between the
  //   hold and the provider: a body that is not JSON, consent not given, no
  //   reference asset, an asset that is not a voice, one that is not the
  //   Creator's, an unreadable address, a file that would not open. Each one
  //   returned with the units still held and the attempt left `owed` and
  //   `in-flight`, which the resolver then reports `left-undecided` for ever.
  //
  //   It never fired, because `voice-cloning` is pending-discovery and the
  //   cost engine refuses before the hold is taken. It would have fired on
  //   the first day a price was approved. The identical defect was repaired
  //   in the upscale route in this same branch; this is the one it missed.

  if (session.role !== 'founder') {
    const costEngine = new AzmaUnitCostEngine();
    let costEstimate;
    try {
      costEstimate = costEngine.estimate('voice-cloning', 'elevenlabs');
    } catch (err) {
      if (err instanceof CostUnavailableError) {
        failAttempt(db, claim.attemptKey, 'cost-unavailable');
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
      failAttempt(db, claim.attemptKey, 'insufficient-balance');
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
        // The ATTEMPT's key, not a fresh one. This is the whole repair.
        claim.attemptKey,
        // The gateway the PRICE came from, so a later cost reconciliation
        // reads the same provider the charge was computed against.
        { capability: 'voice-cloning', gatewayId: 'elevenlabs' },
      );
      reservationId = reservation.reservationId;
      chargeUnits = reservation.reservedUnits;
      attachReservation(db, claim.attemptKey, reservation.reservationId, reservation.reservedUnits);
    } catch (err) {
      if (err instanceof InsufficientBalanceError) {
        failAttempt(db, claim.attemptKey, 'insufficient-balance');
        return NextResponse.json(
          { status: 'failed', reason: 'payment-required', message: 'Insufficient AZMA Units.' },
          { status: 402 },
        );
      }
      throw err;
    }
  }

  let cloneResult;
  try {
    cloneResult = await cloneVoiceViaProvider(referenceAudioBytes, referenceFileName, voiceDisplayName);
  } catch (error) {
    if (reservationId) {
      releaseReservation({
        db, creatorId: session.creatorId, attemptKey: claim.attemptKey,
        reservationId, reason: 'voice_clone_provider_error',
      });
    }
    // Closed, like the storage failure below it. A release that leaves the
    // attempt in-flight is a submission key nobody can reuse.
    failAttempt(db, claim.attemptKey, 'provider-error');
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
    // A cloned voice identity is NOT an audio file — it is a provider-backed
    // voice profile. Depositing it as STRUCTURAL with a semantic provider URI
    // (not the reference audio path) prevents the encoder from treating it as
    // playable audio. The Creator generates real speech separately via
    // POST /api/vault/assets/generate-cloned-speech.
    const asset = await vaultManager.depositAsset({
      // A cloned voice is a Ras Al Amr asset — the Voice Ministry lives there.
      creationChamber: SourceChamber.RAS_AL_AMR,
      operationId: referenceAsset.assetId,
      subscriberTenantId: session.creatorId,
      capabilityTarget: CapabilityTarget.AUDIO,
      assetFamily: AssetFamily.STRUCTURAL,
      secureStorageUri: `provider://elevenlabs-voice-clone/${cloneResult.voiceProviderId}`,
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
      settleReservation({
        db, creatorId: session.creatorId, attemptKey: claim.attemptKey,
        reservationId, units: chargeUnits, metadata: { assetId: asset.assetId },
      });
    }

    // Record consumption for cost discovery
    try {
      const ledger = new ConsumptionRepository(db);
      ledger.record({
        creatorId: session.creatorId,
        operationType: OperationType.VOICE_CLONE,
        // Superseded: the repository resolves the measured cost and its basis.
        costUsdEstimate: 0,
        units: 1,
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
        reservationId, reason: 'voice_clone_storage_error',
      });
    }
    failAttempt(db, claim.attemptKey, 'storage-error');
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

/**
 * A stored answer, read back for a resent key. A row that will not parse
 * back into a success carrying an asset is no licence to spend again.
 */
function replayVoiceCloneResult(resultJson: string | null): unknown | null {
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
