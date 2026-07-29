/**
 * MINISTRY III — VOICE CLONING ENGINE: proves the real Launch Provider
 * wrapper (cloneVoiceViaProvider) correctly isolates all provider
 * communication, fails clearly when unconfigured, and returns the
 * provider-issued voice identity on success — mirroring
 * speech-provider.test.ts (Ministry II) in structure and intent.
 */

const mockFetch = jest.fn();
global.fetch = mockFetch as typeof fetch;

import { cloneVoiceViaProvider } from '../voice-cloning-provider';

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
