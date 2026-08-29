/**
 * AZMA OS — RAS AL AMR: MINISTRY III — VOICE CLONING ENGINE
 * The Launch Provider Wrapper (Voice Cloning)
 *
 * The ONE point of contact with the certified Launch Provider's voice
 * cloning API. Deliberately isolated behind this single function,
 * mirroring speech-provider.ts (Ministry II) and
 * src/qiyamah-generation/image-provider.ts's own shape exactly — same
 * provider-neutrality principle, same isolation contract — per the Chief
 * Engineer Operating Charter's AI-provider-neutrality rule. Lives in
 * src/chambers/ras-al-amr/, never src/qiyamah-generation/: per the
 * Sovereign Direction State ruling, voice belongs to Ras Al Amr, never
 * Qiyamah.
 *
 * The provider's own identity is never surfaced to the Creator. The env
 * var VOICE_CLONING_API_KEY is provider-neutral by design — swapping
 * the underlying provider requires only changing this file and the key
 * value, nothing else.
 */

export interface ProviderVoiceCloneResult {
  /** The provider-issued voice identifier for this clone — internal only, never exposed to the Creator. */
  readonly voiceProviderId: string;
}

export interface ProviderSpeechFromCloneResult {
  readonly bytes: Buffer;
  readonly mimeType: string;
}

/**
 * Sends a reference audio sample to the Launch Provider and returns the
 * provider-issued voice identity for the resulting clone. The caller is
 * responsible for persisting the result as a Sovereign Voice Asset.
 */
export async function cloneVoiceViaProvider(
  referenceAudioBytes: Buffer,
  referenceFileName: string,
  voiceDisplayName: string,
): Promise<ProviderVoiceCloneResult> {
  const apiKey = process.env.VOICE_CLONING_API_KEY;
  if (!apiKey) {
    throw new Error('VOICE_CLONING_API_KEY is not configured — the Launch Provider cannot be reached.');
  }

  const form = new FormData();
  form.append('name', voiceDisplayName);
  form.append(
    'files',
    new Blob([new Uint8Array(referenceAudioBytes)], { type: 'audio/mpeg' }),
    referenceFileName,
  );

  const response = await fetch('https://api.elevenlabs.io/v1/voices/add', {
    method: 'POST',
    headers: { 'xi-api-key': apiKey },
    body: form,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(
      `The Launch Provider returned an error (${response.status}): ${detail || 'unknown error'}`,
    );
  }

  const data = (await response.json()) as { voice_id?: string };
  if (!data.voice_id) {
    throw new Error('The Launch Provider returned a response with no voice identifier.');
  }

  return { voiceProviderId: data.voice_id };
}

/**
 * Calls ElevenLabs /v1/text-to-speech/{voice_id} to synthesize new speech
 * using a previously cloned voice identity. The same VOICE_CLONING_API_KEY
 * is used for both cloning and synthesis — no additional credential required.
 *
 * The resulting audio is NOT the reference recording replayed. ElevenLabs
 * synthesizes new speech in the timbre and prosody of the cloned voice,
 * speaking whatever text the Creator provides.
 */
export async function synthesizeSpeechWithClonedVoice(
  text: string,
  voiceId: string,
): Promise<ProviderSpeechFromCloneResult> {
  const apiKey = process.env.VOICE_CLONING_API_KEY;
  if (!apiKey) {
    throw new Error('VOICE_CLONING_API_KEY is not configured — the Launch Provider cannot be reached.');
  }

  const response = await fetch(
    `https://api.elevenlabs.io/v1/text-to-speech/${encodeURIComponent(voiceId)}`,
    {
      method: 'POST',
      headers: {
        'xi-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ text, model_id: 'eleven_multilingual_v2' }),
    },
  );

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(
      `The Launch Provider returned an error (${response.status}): ${detail || 'unknown error'}`,
    );
  }

  const arrayBuffer = await response.arrayBuffer();
  const bytes = Buffer.from(arrayBuffer);
  if (bytes.length === 0) {
    throw new Error('The Launch Provider returned no audio data.');
  }

  return { bytes, mimeType: 'audio/mpeg' };
}
