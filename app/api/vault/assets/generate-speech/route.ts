import { NextRequest, NextResponse } from 'next/server';
import { verifySession } from '../../../../../src/authentication';
import { hasActiveEntitlement } from '../../../../../src/billing';
import { SovereignVaultManager } from '../../../../../src/vault/sovereign-vault-manager';
import { AssetFamily } from '../../../../../src/vault/sovereign-vault-types';
import { CapabilityTarget } from '../../../../../src/core/sovereign-orchestrator/qiyamah-intent-types';
import { persistUploadedAsset } from '../../../../../src/vault/vault-asset-upload-storage';
import { generateSpeechViaProvider, isTtsProviderVoice } from '../../../../../src/chambers/ras-al-amr/speech-provider';

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

  if (!hasActiveEntitlement(session.creatorId, session.role)) {
    return NextResponse.json(
      { status: 'failed', reason: 'payment-required', message: 'An active subscription is required to generate speech.' },
      { status: 402 },
    );
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

  const voiceDisplayName =
    typeof voiceDisplayNameRaw === 'string' && voiceDisplayNameRaw.trim().length > 0
      ? voiceDisplayNameRaw.trim()
      : `TTS — ${voice}`;

  let providerResult;
  try {
    providerResult = await generateSpeechViaProvider(text.trim(), voice);
  } catch (error) {
    return NextResponse.json(
      { status: 'failed', reason: 'provider-error', message: error instanceof Error ? error.message : 'The Launch Provider failed to generate speech.' },
      { status: 502 },
    );
  }

  try {
    const persisted = await persistUploadedAsset(providerResult.bytes, '.mp3');
    const asset = await vaultManager.depositAsset({
      operationId: persisted.assetId,
      subscriberTenantId: session.creatorId,
      capabilityTarget: CapabilityTarget.AUDIO,
      assetFamily: AssetFamily.MEDIA,
      secureStorageUri: persisted.assetUrl,
      metadata: {
        fileSizeBytes: providerResult.bytes.length,
        providerId: 'openai-tts-1',
        generationPrompt: text.trim(),
        isVoiceAsset: true,
        voiceDisplayName,
      },
    });

    return NextResponse.json({ status: 'succeeded', asset });
  } catch (error) {
    return NextResponse.json(
      { status: 'failed', reason: 'storage-error', message: error instanceof Error ? error.message : 'Failed to persist the generated Voice Asset.' },
      { status: 500 },
    );
  }
}
