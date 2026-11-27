import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { checkVaultAccess, VAULT_LOCKED_BODY } from '../../../../../src/vault/vault-access';
import { SovereignVaultManager } from '../../../../../src/vault/sovereign-vault-manager';
import { AssetFamily, SourceChamber } from '../../../../../src/vault/sovereign-vault-types';
import { CapabilityTarget } from '../../../../../src/core/sovereign-orchestrator/qiyamah-intent-types';
import { persistUploadedAsset } from '../../../../../src/vault/vault-asset-upload-storage';
import { synthesizeSpeechWithClonedVoice } from '../../../../../src/chambers/ras-al-amr/voice-cloning-provider';
import { getDb } from '../../../../../src/persistent-storage';
import { ConsumptionRepository } from '../../../../../src/persistent-storage/consumption-repository';
import { OperationType } from '../../../../../src/consumption-ledger/consumption-ledger-contracts';
import { getCurrentMonthKey } from '../../../../../src/consumption-ledger/cost-estimator';
import { authorisePaidOperation } from '../../../../../src/economy/paid-operation-gate';
import { SPEECH_CAPABILITY } from '../../../../../src/economy/pricing/sovereign-price-authority';
import { priceSpeechFromCredits } from '@/src/economy/pricing/speech-pricing';

import {
  claimAttempt, completeAttempt, failAttempt,
  OPERATION_KEY_HEADER, readClientOperationKey,
} from '@/src/economy/paid-operation-attempts';
import { settleReservation, releaseReservation } from '@/src/economy/paid-operation-gate';

export const dynamic = 'force-dynamic';

/** The namespace this road's submission keys live in. */
const SPEECH_SCOPE = 'vault:text-to-speech';

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
  const access = checkVaultAccess(request);

  if (access.status !== 'ok') {
    return NextResponse.json(
      access.status === 'no-session'
        ? { status: 'failed', reason: 'unauthorized', message: 'Sign in to generate speech.' }
        : VAULT_LOCKED_BODY,
      { status: access.status === 'no-session' ? 401 : 403 },
    );
  }
  const session = access.session;

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
  /** What the provider said this narration cost, in its own credits. */
  let meteredCredits: number | null = null;
  // MEASURED: the settlement re-derived this number from the cost engine
  // inside its own try block. A hold and a charge computed in two places
  // are two numbers that can drift, and an estimate that threw there left
  // the hold stranded in silence. One number now, held and charged.
  let chargeUnits = 0;

  // The submission, claimed before a unit is held. Where the browser sends
  // a key, a press that arrives twice is answered once; where it does not,
  // each request stands alone and covers its own provider call.
  const claim = claimAttempt({
    db, creatorId: session.creatorId, scope: SPEECH_SCOPE,
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
    const replayed = replaySpeechResult(claim.resultJson);
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
  /*  ── THE HOLD IS A CEILING, NOT THE CHARGE ───────────────────────────
   *
   *    MEASURED ON PRODUCTION 2026-11-03: a 134-character Arabic narration
   *    metered **54** provider credits, and a 12-character one metered 5 —
   *    about 0.41 credits per character. The provider's published line says
   *    one character is one credit; for diacritised Arabic it is not.
   *
   *    So the Creator's text length is an UPPER BOUND on the cost and never
   *    a measure of it. It is what can honestly be quoted before the
   *    narration exists, so it is what is held — and the settlement below
   *    follows the credits the provider reports, which is always less.
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
      : `TTS — ElevenLabs`;

  let audioBytes: Buffer;
  try {
    const result = await synthesizeSpeechWithClonedVoice(text.trim(), voice);
    audioBytes = result.bytes;
    // Carried out of this block because the settlement, further down, is the
    // only place that can act on it.
    meteredCredits = result.meteredCredits ?? null;
  } catch (err) {
    if (reservationId) {
      releaseReservation({
        db, creatorId: session.creatorId, attemptKey: claim.attemptKey,
        reservationId, reason: 'tts_provider_error',
      });
    }
    // Closed, like the storage failure below it. A release that leaves the
    // attempt in-flight is a submission key nobody can reuse.
    failAttempt(db, claim.attemptKey, 'provider-error');
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
      // Voice and speech belong to Ras Al Amr by the Founder's own ruling,
      // and Article 1.3 names «الصوت المركب» among its responsibilities.
      creationChamber: SourceChamber.RAS_AL_AMR,
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
      /*  ── SETTLED ON WHAT THE PROVIDER SAID IT COST ──────────────────────
       *
       *    «يجب أن يتطابق الاستهلاك المسجل مع العملية الفعلية لدى المزود.»
       *
       *    The figure comes from the provider's `character-cost` response
       *    header, which it returns on every call. The subscription counter
       *    does NOT serve here: measured three times at twenty-second
       *    intervals after a real call, it still read the pre-call value.
       *
       *    When the header is absent the hold stands — the Creator has their
       *    narration, and a provider that declined to state a cost is not a
       *    refund. `settleReservation` never takes more than was held.
       */
      const measured = priceSpeechFromCredits(meteredCredits);
      const settledUnits = measured.ok ? Math.min(measured.chargedUnits, chargeUnits) : chargeUnits;
      settleReservation({
        db, creatorId: session.creatorId, attemptKey: claim.attemptKey,
        reservationId, units: settledUnits,
        metadata: {
          assetId: asset.assetId,
          basis: measured.ok ? 'provider-metered-credits' : 'held-ceiling-unmetered',
          ...(measured.ok ? { meteredCredits: measured.credits } : {}),
          quotedCeilingUnits: chargeUnits,
        },
      });
      chargeUnits = settledUnits;
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
    // Closed, so a resent key is ANSWERED rather than spoken again.
    completeAttempt(db, claim.attemptKey, answer);
    return NextResponse.json(answer);
  } catch (error) {
    if (reservationId) {
      releaseReservation({
        db, creatorId: session.creatorId, attemptKey: claim.attemptKey,
        reservationId, reason: 'tts_storage_error',
      });
    }
    failAttempt(db, claim.attemptKey, 'storage-error');
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

/**
 * A stored answer, read back for a resent key. A row that will not parse
 * back into a success carrying an asset is no licence to spend again.
 */
function replaySpeechResult(resultJson: string | null): unknown | null {
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
