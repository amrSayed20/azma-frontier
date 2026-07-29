/**
 * AZMA OS — RAS AL AMR: MINISTRY II — TEXT TO SPEECH ENGINE
 * The Launch Provider Wrapper (Speech)
 *
 * The ONE point of contact with the certified Launch Provider's
 * text-to-speech API (OpenAI). Deliberately isolated behind this single
 * function, mirroring src/qiyamah-generation/image-provider.ts's own
 * shape exactly — same client-caching pattern, same isolation principle
 * — per the Chief Engineer Operating Charter's AI-provider-neutrality
 * principle. Lives in src/chambers/ras-al-amr/, never
 * src/qiyamah-generation/: per the Sovereign Direction State ruling,
 * voice generation belongs to Ras Al Amr, never Qiyamah.
 */

import OpenAI from 'openai';

export interface ProviderSpeechResult {
  readonly bytes: Buffer;
  readonly mimeType: string;
}

/**
 * The Empire's own closed, real set of available preset voices — never a
 * Creator-typed free-text value. A subset of OpenAI's own documented
 * built-in voices (openai/resources/audio/speech.d.ts).
 */
export const TTS_PROVIDER_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const;
export type TtsProviderVoice = (typeof TTS_PROVIDER_VOICES)[number];

export function isTtsProviderVoice(value: string): value is TtsProviderVoice {
  return (TTS_PROVIDER_VOICES as readonly string[]).includes(value);
}

let cachedClient: OpenAI | null = null;

function getClient(): OpenAI {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY is not configured — the Launch Provider cannot be reached.');
  }
  if (!cachedClient) {
    cachedClient = new OpenAI({ apiKey });
  }
  return cachedClient;
}

/** Resets the cached client — used only by tests to force re-reading process.env. */
export function resetSpeechProviderClientForTests(): void {
  cachedClient = null;
}

export async function generateSpeechViaProvider(text: string, voice: TtsProviderVoice): Promise<ProviderSpeechResult> {
  const client = getClient();

  const response = await client.audio.speech.create({
    model: 'tts-1',
    voice,
    input: text,
    response_format: 'mp3',
  });

  const bytes = Buffer.from(await response.arrayBuffer());
  if (bytes.length === 0) {
    throw new Error('The Launch Provider returned no audio data.');
  }

  return { bytes, mimeType: 'audio/mpeg' };
}
