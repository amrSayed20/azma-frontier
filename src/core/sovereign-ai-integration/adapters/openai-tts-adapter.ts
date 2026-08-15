/**
 * AZMA OS — PROVIDER SOVEREIGNTY FOUNDATION
 * OpenAI Text-to-Speech Adapter
 *
 * Wraps the certified speech-provider.ts behind the AIProviderAdapter
 * contract.  The Creator-selected voice is passed through
 * DNAOrchestrationRequest.metadata.voice and extracted here from
 * input.request.context.metadata.voice.
 *
 * Binary audio bytes are base64-encoded in content and decoded by the
 * calling route — same bridge pattern as OpenAIImageAdapter.
 */

import type { AIProviderAdapter, AIProviderDescriptor, AIProviderDispatchInput, RawAIProviderResponse } from '../provider-contracts';
import { generateSpeechViaProvider, isTtsProviderVoice } from '../../../chambers/ras-al-amr/speech-provider';

export const OPENAI_TTS_PROVIDER_ID = 'openai-tts' as const;
export const OPENAI_TTS_MODEL_ID = 'openai-tts-1' as const;

const DESCRIPTOR: AIProviderDescriptor = {
  providerId: OPENAI_TTS_PROVIDER_ID,
  displayName: 'OpenAI Text-to-Speech',
  providerFamily: 'managed',
  capabilities: ['audio-generation'],
  modelIds: [OPENAI_TTS_MODEL_ID],
  maxConcurrentRequests: 10,
  costProfile: { inputUnitCost: 0.000015, outputUnitCost: 0, currency: 'USD' },
  sovereign: true,
};

export class OpenAITtsAdapter implements AIProviderAdapter {
  public readonly descriptor: AIProviderDescriptor = DESCRIPTOR;

  public async dispatch(input: AIProviderDispatchInput): Promise<RawAIProviderResponse> {
    const startedAt = Date.now();
    const text = input.request.prompt;
    const voiceRaw = input.request.context.metadata['voice'];
    const voice =
      typeof voiceRaw === 'string' && isTtsProviderVoice(voiceRaw) ? voiceRaw : 'alloy';

    const result = await generateSpeechViaProvider(text, voice);

    return {
      providerId: OPENAI_TTS_PROVIDER_ID,
      modelId: OPENAI_TTS_MODEL_ID,
      content: result.bytes.toString('base64'),
      inputTokens: text.length,
      outputTokens: 0,
      latencyMs: Date.now() - startedAt,
      finishReason: 'completed',
      metadata: { mimeType: result.mimeType, encoding: 'base64' },
    };
  }
}
