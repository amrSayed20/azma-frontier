/**
 * AZMA OS — PROVIDER SOVEREIGNTY FOUNDATION
 * ElevenLabs Voice Cloning Adapter
 *
 * Wraps the certified voice-cloning-provider.ts behind AIProviderAdapter.
 *
 * Voice cloning requires binary audio bytes as input — a mismatch with
 * the text-centric SovereignAIRequest.prompt field.  This adapter bridges
 * the gap: the caller places the reference audio Buffer in
 * request.context.metadata.referenceAudioBytes and the file name in
 * metadata.referenceFileName; the display name goes in request.prompt.
 *
 * The cloned voice's provider-issued ID is returned in content.
 * The clone-voice route keeps its direct call path for Phase 1 because
 * binary input routing is not yet wired through the sovereign generation
 * dispatcher — this adapter is registered for provider-registry visibility
 * and future wiring.  Reported as a known limitation in the construction
 * report.
 */

import type { AIProviderAdapter, AIProviderDescriptor, AIProviderDispatchInput, RawAIProviderResponse } from '../provider-contracts';
import { cloneVoiceViaProvider } from '../../../chambers/ras-al-amr/voice-cloning-provider';

export const ELEVENLABS_VOICE_PROVIDER_ID = 'elevenlabs-voice' as const;
export const ELEVENLABS_VOICE_MODEL_ID = 'elevenlabs-voice-clone-v1' as const;

const DESCRIPTOR: AIProviderDescriptor = {
  providerId: ELEVENLABS_VOICE_PROVIDER_ID,
  displayName: 'ElevenLabs Voice Cloning',
  providerFamily: 'managed',
  capabilities: ['audio-generation'],
  modelIds: [ELEVENLABS_VOICE_MODEL_ID],
  maxConcurrentRequests: 3,
  costProfile: { inputUnitCost: 0, outputUnitCost: 0.30, currency: 'USD' },
  sovereign: true,
};

export class ElevenLabsVoiceAdapter implements AIProviderAdapter {
  public readonly descriptor: AIProviderDescriptor = DESCRIPTOR;

  public async dispatch(input: AIProviderDispatchInput): Promise<RawAIProviderResponse> {
    const startedAt = Date.now();

    const referenceAudioBytes = input.request.context.metadata['referenceAudioBytes'];
    const referenceFileName = input.request.context.metadata['referenceFileName'];
    const voiceDisplayName = input.request.prompt;

    if (!Buffer.isBuffer(referenceAudioBytes)) {
      throw new Error(
        'ElevenLabs voice cloning requires referenceAudioBytes (Buffer) in request context metadata.',
      );
    }
    if (typeof referenceFileName !== 'string' || referenceFileName.trim().length === 0) {
      throw new Error(
        'ElevenLabs voice cloning requires referenceFileName (string) in request context metadata.',
      );
    }

    const result = await cloneVoiceViaProvider(
      referenceAudioBytes,
      referenceFileName,
      voiceDisplayName,
    );

    return {
      providerId: ELEVENLABS_VOICE_PROVIDER_ID,
      modelId: ELEVENLABS_VOICE_MODEL_ID,
      content: result.voiceProviderId,
      inputTokens: 0,
      outputTokens: 0,
      latencyMs: Date.now() - startedAt,
      finishReason: 'completed',
      metadata: { voiceProviderId: result.voiceProviderId },
    };
  }
}
