const mockSpeechCreate = jest.fn();

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    audio: { speech: { create: mockSpeechCreate } },
  }));
});

import { generateSpeechViaProvider, resetSpeechProviderClientForTests, isTtsProviderVoice, TTS_PROVIDER_VOICES } from '../speech-provider';

describe('Ministry II — Text To Speech: Launch Provider wrapper', () => {
  const originalApiKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    mockSpeechCreate.mockReset();
    resetSpeechProviderClientForTests();
    process.env.OPENAI_API_KEY = 'test-key';
  });

  afterAll(() => {
    process.env.OPENAI_API_KEY = originalApiKey;
  });

  it('throws a clear error when no API key is configured — never fails silently', async () => {
    delete process.env.OPENAI_API_KEY;
    await expect(generateSpeechViaProvider('hello', 'alloy')).rejects.toThrow(/OPENAI_API_KEY/);
  });

  it('returns real audio bytes from the provider response', async () => {
    mockSpeechCreate.mockResolvedValue({
      arrayBuffer: async () => new TextEncoder().encode('fake-mp3-bytes').buffer,
    });

    const result = await generateSpeechViaProvider('a line of dialogue', 'nova');

    expect(result.bytes.toString()).toBe('fake-mp3-bytes');
    expect(result.mimeType).toBe('audio/mpeg');
    expect(mockSpeechCreate).toHaveBeenCalledWith(
      expect.objectContaining({ input: 'a line of dialogue', voice: 'nova', model: 'tts-1' }),
    );
  });

  it('throws honestly when the provider returns empty audio data', async () => {
    mockSpeechCreate.mockResolvedValue({ arrayBuffer: async () => new ArrayBuffer(0) });
    await expect(generateSpeechViaProvider('x', 'alloy')).rejects.toThrow(/no audio data/);
  });

  it('recognizes only the Empire\'s own closed set of preset voices, never an arbitrary string', () => {
    for (const voice of TTS_PROVIDER_VOICES) {
      expect(isTtsProviderVoice(voice)).toBe(true);
    }
    expect(isTtsProviderVoice('some-cloned-voice-id')).toBe(false);
  });
});
