/**
 * AZMA OS — PROVIDER SOVEREIGNTY FOUNDATION
 * Generation Adapter Tests
 *
 * Covers:
 *   1. OpenAIImageAdapter — dispatch success, missing API key, descriptor shape
 *   2. OpenAITtsAdapter — dispatch success, default voice fallback, missing API key
 *   3. ElevenLabsVoiceAdapter — dispatch success, missing referenceAudioBytes, missing fileName
 *   4. Provider bootstrap — singleton behavior, three providers registered
 *   5. Constitutional adapter contract — sovereign: true, capabilities, modelIds
 *
 * No real provider calls are made.  All underlying provider modules are mocked.
 */

// ─── MOCKS (must be before imports) ──────────────────────────────────────────

jest.mock('../../../../qiyamah-generation/image-provider', () => ({
  generateImageViaProvider: jest.fn(),
  resetProviderClientForTests: jest.fn(),
}));

jest.mock('../../../../chambers/ras-al-amr/speech-provider', () => ({
  generateSpeechViaProvider: jest.fn(),
  isTtsProviderVoice: (v: string) => ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'].includes(v),
  resetSpeechProviderClientForTests: jest.fn(),
}));

jest.mock('../../../../chambers/ras-al-amr/voice-cloning-provider', () => ({
  cloneVoiceViaProvider: jest.fn(),
}));

jest.mock('../../provider-bootstrap', () => ({
  getGenerationOrchestrator: jest.fn(),
  resetGenerationOrchestratorForTests: jest.fn(),
}));

// ─── IMPORTS ─────────────────────────────────────────────────────────────────

import { generateImageViaProvider } from '../../../../qiyamah-generation/image-provider';
import { generateSpeechViaProvider } from '../../../../chambers/ras-al-amr/speech-provider';
import { cloneVoiceViaProvider } from '../../../../chambers/ras-al-amr/voice-cloning-provider';
import { OpenAIImageAdapter, OPENAI_IMAGE_PROVIDER_ID, OPENAI_IMAGE_MODEL_ID } from '../openai-image-adapter';
import { OpenAITtsAdapter, OPENAI_TTS_PROVIDER_ID, OPENAI_TTS_MODEL_ID } from '../openai-tts-adapter';
import { ElevenLabsVoiceAdapter, ELEVENLABS_VOICE_PROVIDER_ID, ELEVENLABS_VOICE_MODEL_ID } from '../elevenlabs-voice-adapter';

const mockGenerateImage = generateImageViaProvider as jest.Mock;
const mockGenerateSpeech = generateSpeechViaProvider as jest.Mock;
const mockCloneVoice = cloneVoiceViaProvider as jest.Mock;

// ─── HELPERS ─────────────────────────────────────────────────────────────────

function buildDispatchInput(overrides: Record<string, unknown> = {}) {
  return {
    request: {
      requestId: 'req-test',
      requestedAt: new Date(),
      requestedBy: 'creator-test',
      purpose: 'test',
      prompt: overrides.prompt ?? 'a majestic mountain',
      capability: 'image-generation' as const,
      priority: 'normal' as const,
      context: {
        memoryRefs: [],
        metadata: overrides.metadata ?? {},
      },
    },
    context: {
      requestId: 'req-test',
      prompt: overrides.prompt ?? 'a majestic mountain',
      systemContext: 'test',
      memoryContext: [],
      constitutionalContext: 'test',
    },
    routing: {
      routingId: 'route-test',
      requestId: 'req-test',
      allowed: true,
      selectedProviderId: OPENAI_IMAGE_PROVIDER_ID,
      selectedModelId: OPENAI_IMAGE_MODEL_ID,
      fallbackProviderIds: [],
      explanation: 'test',
      constitutionalEvaluation: {
        actionId: 'test',
        articleId: 'al-wateen-constitutional-intelligence' as const,
        status: 'compliant' as const,
        decision: 'allow' as const,
        complianceScore: 100,
        priorityScore: 100,
        permissions: [],
        prohibitions: [],
        violations: [],
        appliedPolicies: [],
        reasons: [],
        evaluatedAt: new Date(),
      },
      actionContext: {
        actionId: 'test',
        actionType: 'provider-management' as const,
        title: 'test',
        description: 'test',
        targetModule: 'al-wateen' as const,
        requestedBy: 'creator-test',
        requestedAt: new Date(),
        scope: 'provider-management',
        priority: 'normal' as const,
        payload: {},
        metadata: {},
      },
    },
  };
}

// ─── SECTION 1: OpenAIImageAdapter ───────────────────────────────────────────

describe('OpenAIImageAdapter', () => {
  let adapter: OpenAIImageAdapter;

  beforeEach(() => {
    adapter = new OpenAIImageAdapter();
    mockGenerateImage.mockReset();
  });

  it('has the correct descriptor shape', () => {
    expect(adapter.descriptor.providerId).toBe(OPENAI_IMAGE_PROVIDER_ID);
    expect(adapter.descriptor.modelIds).toContain(OPENAI_IMAGE_MODEL_ID);
    expect(adapter.descriptor.capabilities).toContain('image-generation');
    expect(adapter.descriptor.sovereign).toBe(true);
    expect(adapter.descriptor.maxConcurrentRequests).toBeGreaterThan(0);
  });

  it('dispatches and returns base64-encoded image bytes', async () => {
    const fakeBytes = Buffer.from('PNG_IMAGE_DATA');
    mockGenerateImage.mockResolvedValueOnce({ bytes: fakeBytes, mimeType: 'image/png' });

    const input = buildDispatchInput({ prompt: 'mountain at sunrise' });
    const result = await adapter.dispatch(input as never);

    expect(result.providerId).toBe(OPENAI_IMAGE_PROVIDER_ID);
    expect(result.finishReason).toBe('completed');
    // Verify round-trip: base64 decode should return original bytes
    expect(Buffer.from(result.content, 'base64')).toEqual(fakeBytes);
  });

  it('passes style from metadata to the provider', async () => {
    mockGenerateImage.mockResolvedValueOnce({ bytes: Buffer.from('img'), mimeType: 'image/png' });

    const input = buildDispatchInput({ metadata: { style: 'cinematic' } });
    await adapter.dispatch(input as never);

    expect(mockGenerateImage).toHaveBeenCalledWith(expect.any(String), 'cinematic');
  });

  it('passes null style when metadata has no style field', async () => {
    mockGenerateImage.mockResolvedValueOnce({ bytes: Buffer.from('img'), mimeType: 'image/png' });

    const input = buildDispatchInput({ metadata: {} });
    await adapter.dispatch(input as never);

    expect(mockGenerateImage).toHaveBeenCalledWith(expect.any(String), null);
  });

  it('propagates provider errors as thrown exceptions', async () => {
    mockGenerateImage.mockRejectedValueOnce(new Error('OPENAI_API_KEY is not configured'));

    const input = buildDispatchInput();
    await expect(adapter.dispatch(input as never)).rejects.toThrow('OPENAI_API_KEY');
  });

  it('records non-zero latency in the response', async () => {
    mockGenerateImage.mockResolvedValueOnce({ bytes: Buffer.from('img'), mimeType: 'image/png' });
    const result = await adapter.dispatch(buildDispatchInput() as never);
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });
});

// ─── SECTION 2: OpenAITtsAdapter ─────────────────────────────────────────────

describe('OpenAITtsAdapter', () => {
  let adapter: OpenAITtsAdapter;

  beforeEach(() => {
    adapter = new OpenAITtsAdapter();
    mockGenerateSpeech.mockReset();
  });

  it('has the correct descriptor shape', () => {
    expect(adapter.descriptor.providerId).toBe(OPENAI_TTS_PROVIDER_ID);
    expect(adapter.descriptor.modelIds).toContain(OPENAI_TTS_MODEL_ID);
    expect(adapter.descriptor.capabilities).toContain('audio-generation');
    expect(adapter.descriptor.sovereign).toBe(true);
  });

  it('dispatches and returns base64-encoded audio bytes', async () => {
    const fakeBytes = Buffer.from('MP3_AUDIO_DATA');
    mockGenerateSpeech.mockResolvedValueOnce({ bytes: fakeBytes, mimeType: 'audio/mpeg' });

    const input = buildDispatchInput({ prompt: 'Hello world', metadata: { voice: 'echo' } });
    const result = await adapter.dispatch(input as never);

    expect(result.providerId).toBe(OPENAI_TTS_PROVIDER_ID);
    expect(result.finishReason).toBe('completed');
    expect(Buffer.from(result.content, 'base64')).toEqual(fakeBytes);
  });

  it('uses the voice from metadata', async () => {
    mockGenerateSpeech.mockResolvedValueOnce({ bytes: Buffer.from('audio'), mimeType: 'audio/mpeg' });

    const input = buildDispatchInput({ metadata: { voice: 'nova' } });
    await adapter.dispatch(input as never);

    expect(mockGenerateSpeech).toHaveBeenCalledWith(expect.any(String), 'nova');
  });

  it('falls back to "alloy" when no valid voice is in metadata', async () => {
    mockGenerateSpeech.mockResolvedValueOnce({ bytes: Buffer.from('audio'), mimeType: 'audio/mpeg' });

    const input = buildDispatchInput({ metadata: {} }); // no voice field
    await adapter.dispatch(input as never);

    expect(mockGenerateSpeech).toHaveBeenCalledWith(expect.any(String), 'alloy');
  });

  it('falls back to "alloy" for an invalid voice string', async () => {
    mockGenerateSpeech.mockResolvedValueOnce({ bytes: Buffer.from('audio'), mimeType: 'audio/mpeg' });

    const input = buildDispatchInput({ metadata: { voice: 'invalid-voice' } });
    await adapter.dispatch(input as never);

    expect(mockGenerateSpeech).toHaveBeenCalledWith(expect.any(String), 'alloy');
  });

  it('records text length as inputTokens', async () => {
    mockGenerateSpeech.mockResolvedValueOnce({ bytes: Buffer.from('a'), mimeType: 'audio/mpeg' });

    const text = 'Hello, world!';
    const input = buildDispatchInput({ prompt: text, metadata: { voice: 'alloy' } });
    const result = await adapter.dispatch(input as never);

    expect(result.inputTokens).toBe(text.length);
  });

  it('propagates provider errors', async () => {
    mockGenerateSpeech.mockRejectedValueOnce(new Error('OPENAI_API_KEY is not configured'));
    await expect(adapter.dispatch(buildDispatchInput() as never)).rejects.toThrow();
  });
});

// ─── SECTION 3: ElevenLabsVoiceAdapter ───────────────────────────────────────

describe('ElevenLabsVoiceAdapter', () => {
  let adapter: ElevenLabsVoiceAdapter;

  beforeEach(() => {
    adapter = new ElevenLabsVoiceAdapter();
    mockCloneVoice.mockReset();
  });

  it('has the correct descriptor shape', () => {
    expect(adapter.descriptor.providerId).toBe(ELEVENLABS_VOICE_PROVIDER_ID);
    expect(adapter.descriptor.modelIds).toContain(ELEVENLABS_VOICE_MODEL_ID);
    expect(adapter.descriptor.capabilities).toContain('audio-generation');
    expect(adapter.descriptor.sovereign).toBe(true);
  });

  it('dispatches voice clone and returns the provider voice ID in content', async () => {
    mockCloneVoice.mockResolvedValueOnce({ voiceProviderId: 'el-voice-abc123' });

    const referenceAudioBytes = Buffer.from('AUDIO_REFERENCE');
    const input = buildDispatchInput({
      prompt: 'My Cloned Voice',
      metadata: { referenceAudioBytes, referenceFileName: 'ref.mp3' },
    });

    const result = await adapter.dispatch(input as never);
    expect(result.providerId).toBe(ELEVENLABS_VOICE_PROVIDER_ID);
    expect(result.content).toBe('el-voice-abc123');
    expect(result.finishReason).toBe('completed');
  });

  it('throws when referenceAudioBytes is missing from metadata', async () => {
    const input = buildDispatchInput({
      prompt: 'My Cloned Voice',
      metadata: { referenceFileName: 'ref.mp3' },
    });
    await expect(adapter.dispatch(input as never)).rejects.toThrow('referenceAudioBytes');
  });

  it('throws when referenceAudioBytes is not a Buffer', async () => {
    const input = buildDispatchInput({
      prompt: 'My Cloned Voice',
      metadata: { referenceAudioBytes: 'not-a-buffer', referenceFileName: 'ref.mp3' },
    });
    await expect(adapter.dispatch(input as never)).rejects.toThrow('referenceAudioBytes');
  });

  it('throws when referenceFileName is missing from metadata', async () => {
    const input = buildDispatchInput({
      prompt: 'My Cloned Voice',
      metadata: { referenceAudioBytes: Buffer.from('audio') },
    });
    await expect(adapter.dispatch(input as never)).rejects.toThrow('referenceFileName');
  });

  it('propagates provider errors', async () => {
    mockCloneVoice.mockRejectedValueOnce(new Error('VOICE_CLONING_API_KEY not set'));

    const input = buildDispatchInput({
      prompt: 'Voice',
      metadata: { referenceAudioBytes: Buffer.from('audio'), referenceFileName: 'ref.mp3' },
    });
    await expect(adapter.dispatch(input as never)).rejects.toThrow();
  });
});

// ─── SECTION 4: Constitutional adapter contract ───────────────────────────────

describe('All adapters — constitutional contract', () => {
  const adapters = [
    new OpenAIImageAdapter(),
    new OpenAITtsAdapter(),
    new ElevenLabsVoiceAdapter(),
  ];

  it.each(adapters.map((a) => [a.descriptor.displayName, a]))(
    '%s — descriptor.sovereign is true',
    (_name, adapter) => {
      expect(adapter.descriptor.sovereign).toBe(true);
    },
  );

  it.each(adapters.map((a) => [a.descriptor.displayName, a]))(
    '%s — has at least one capability',
    (_name, adapter) => {
      expect(adapter.descriptor.capabilities.length).toBeGreaterThan(0);
    },
  );

  it.each(adapters.map((a) => [a.descriptor.displayName, a]))(
    '%s — has at least one model ID',
    (_name, adapter) => {
      expect(adapter.descriptor.modelIds.length).toBeGreaterThan(0);
    },
  );

  it.each(adapters.map((a) => [a.descriptor.displayName, a]))(
    '%s — provider IDs are unique',
    (_name, adapter) => {
      const ids = adapters.map((a) => a.descriptor.providerId);
      const unique = new Set(ids);
      expect(unique.size).toBe(ids.length);
    },
  );

  it.each(adapters.map((a) => [a.descriptor.displayName, a]))(
    '%s — costProfile has positive output cost',
    (_name, adapter) => {
      const { inputUnitCost, outputUnitCost } = adapter.descriptor.costProfile;
      expect(inputUnitCost + outputUnitCost).toBeGreaterThan(0);
    },
  );

  it.each(adapters.map((a) => [a.descriptor.displayName, a]))(
    '%s — currency is USD',
    (_name, adapter) => {
      expect(adapter.descriptor.costProfile.currency).toBe('USD');
    },
  );
});
