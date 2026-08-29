/**
 * MINISTRY III — VOICE CLONING ENGINE: proves the real Launch Provider
 * wrapper (cloneVoiceViaProvider) correctly isolates all provider
 * communication, fails clearly when unconfigured, and returns the
 * provider-issued voice identity on success — mirroring
 * speech-provider.test.ts (Ministry II) in structure and intent.
 */

const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

import { cloneVoiceViaProvider, synthesizeSpeechWithClonedVoice } from '../voice-cloning-provider';

describe('Ministry III — Voice Cloning: Launch Provider wrapper', () => {
  const originalApiKey = process.env.VOICE_CLONING_API_KEY;

  beforeEach(() => {
    mockFetch.mockReset();
    process.env.VOICE_CLONING_API_KEY = 'test-cloning-key';
  });

  afterAll(() => {
    process.env.VOICE_CLONING_API_KEY = originalApiKey;
  });

  it('throws a clear error when VOICE_CLONING_API_KEY is not configured — never fails silently', async () => {
    delete process.env.VOICE_CLONING_API_KEY;
    await expect(
      cloneVoiceViaProvider(Buffer.from('audio'), 'ref.mp3', 'My Narrator'),
    ).rejects.toThrow(/VOICE_CLONING_API_KEY/);
  });

  it('calls the provider with the correct API key header and returns the provider voice id', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ voice_id: 'pNInz6obpgDQGcFmaJgB' }),
      text: async () => '',
    });

    const result = await cloneVoiceViaProvider(
      Buffer.from('fake-audio-bytes'),
      'sample.mp3',
      'Warm Narrator',
    );

    expect(result.voiceProviderId).toBe('pNInz6obpgDQGcFmaJgB');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(options.method).toBe('POST');
    expect(options.headers['xi-api-key']).toBe('test-cloning-key');
    expect(options.body).toBeInstanceOf(FormData);
  });

  it('throws clearly when the provider returns an HTTP error status', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 422,
      text: async () => 'audio file too short',
      json: async () => ({}),
    });

    await expect(
      cloneVoiceViaProvider(Buffer.from('tiny'), 'tiny.mp3', 'name'),
    ).rejects.toThrow(/422/);
  });

  it('throws clearly when the provider returns success but no voice identifier', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({}),
      text: async () => '',
    });

    await expect(
      cloneVoiceViaProvider(Buffer.from('audio'), 'ref.mp3', 'name'),
    ).rejects.toThrow(/no voice identifier/);
  });

  it('includes the voice display name in the form data sent to the provider', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ voice_id: 'abc-123' }),
      text: async () => '',
    });

    await cloneVoiceViaProvider(Buffer.from('bytes'), 'voice.mp3', 'Imperial Commander');

    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    const form = options.body as FormData;
    expect(form.get('name')).toBe('Imperial Commander');
  });
});

// ─── SYNTHESIS ────────────────────────────────────────────────────────────────

describe('Ministry III — Voice Cloning: synthesizeSpeechWithClonedVoice', () => {
  const originalApiKey = process.env.VOICE_CLONING_API_KEY;

  beforeEach(() => {
    mockFetch.mockReset();
    process.env.VOICE_CLONING_API_KEY = 'test-cloning-key';
  });

  afterAll(() => {
    process.env.VOICE_CLONING_API_KEY = originalApiKey;
  });

  it('throws clearly when VOICE_CLONING_API_KEY is absent', async () => {
    delete process.env.VOICE_CLONING_API_KEY;
    await expect(
      synthesizeSpeechWithClonedVoice('Hello world', 'voice-id-123'),
    ).rejects.toThrow(/VOICE_CLONING_API_KEY/);
  });

  it('calls /v1/text-to-speech/{voice_id} with the API key and returns audio bytes', async () => {
    const fakeContent = 'MP3_AUDIO_BYTES';
    // Use a fresh ArrayBuffer (not a Buffer's .buffer slice) to avoid Node.js
    // shared-pool padding, ensuring the round-trip assertion is exact.
    const fakeArrayBuffer = new TextEncoder().encode(fakeContent).buffer;
    const fakeAudio = Buffer.from(fakeArrayBuffer);
    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: async () => fakeArrayBuffer,
      text: async () => '',
    });

    const result = await synthesizeSpeechWithClonedVoice(
      'المملكة السيادية تتكلم بصوت جديد',
      'pNInz6obpgDQGcFmaJgB',
    );

    expect(result.bytes).toEqual(fakeAudio);
    expect(result.mimeType).toBe('audio/mpeg');

    const [url, options] = mockFetch.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(url).toContain('/v1/text-to-speech/pNInz6obpgDQGcFmaJgB');
    expect(options.method).toBe('POST');
    expect(options.headers['xi-api-key']).toBe('test-cloning-key');
    expect(options.headers['Content-Type']).toBe('application/json');

    const body = JSON.parse(options.body as string);
    expect(body.text).toBe('المملكة السيادية تتكلم بصوت جديد');
    expect(body.model_id).toBe('eleven_multilingual_v2');
  });

  it('URL-encodes the voice_id in the endpoint path', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: async () => Buffer.from('audio').buffer,
      text: async () => '',
    });

    await synthesizeSpeechWithClonedVoice('text', 'voice/with/slashes');

    const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).not.toContain('voice/with/slashes');
    expect(url).toContain('voice%2Fwith%2Fslashes');
  });

  it('throws on provider HTTP error with status code in message', async () => {
    mockFetch.mockResolvedValue({
      ok: false,
      status: 404,
      text: async () => 'voice not found',
      arrayBuffer: async () => new ArrayBuffer(0),
    });

    await expect(
      synthesizeSpeechWithClonedVoice('text', 'nonexistent-voice'),
    ).rejects.toThrow(/404/);
  });

  it('throws when provider returns empty audio bytes', async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      arrayBuffer: async () => new ArrayBuffer(0),
      text: async () => '',
    });

    await expect(
      synthesizeSpeechWithClonedVoice('text', 'voice-id'),
    ).rejects.toThrow(/no audio data/);
  });
});
