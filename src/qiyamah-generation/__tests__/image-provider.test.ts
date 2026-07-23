const mockGenerate = jest.fn();

jest.mock('openai', () => {
  return jest.fn().mockImplementation(() => ({
    images: { generate: mockGenerate },
  }));
});

import { generateImageViaProvider, resetProviderClientForTests } from '../image-provider';

describe('Qiyamah First Generation Path — Launch Provider wrapper', () => {
  const originalApiKey = process.env.OPENAI_API_KEY;

  beforeEach(() => {
    mockGenerate.mockReset();
    resetProviderClientForTests();
    process.env.OPENAI_API_KEY = 'test-key';
  });

  afterAll(() => {
    process.env.OPENAI_API_KEY = originalApiKey;
  });

  it('throws a clear error when no API key is configured — never fails silently', async () => {
    delete process.env.OPENAI_API_KEY;
    await expect(generateImageViaProvider('a sovereign vista', null)).rejects.toThrow(/OPENAI_API_KEY/);
  });

  it('returns image bytes from a b64_json response', async () => {
    mockGenerate.mockResolvedValue({ data: [{ b64_json: Buffer.from('hello').toString('base64') }] });
    const result = await generateImageViaProvider('a sovereign vista', 'cinematic');
    expect(result.bytes.toString()).toBe('hello');
    expect(result.mimeType).toBe('image/png');
    expect(mockGenerate).toHaveBeenCalledWith(
      expect.objectContaining({ prompt: 'a sovereign vista — style: cinematic' }),
    );
  });

  it('omits the style suffix when no style is supplied', async () => {
    mockGenerate.mockResolvedValue({ data: [{ b64_json: Buffer.from('x').toString('base64') }] });
    await generateImageViaProvider('a sovereign vista', null);
    expect(mockGenerate).toHaveBeenCalledWith(expect.objectContaining({ prompt: 'a sovereign vista' }));
  });

  it('fetches image bytes when the response provides a url instead of b64_json', async () => {
    mockGenerate.mockResolvedValue({ data: [{ url: 'https://provider.example/image.png' }] });
    const originalFetch = global.fetch;
    const mockFetch = jest.fn().mockResolvedValue({
      ok: true,
      // Buffer.from(str).buffer would return Node's shared, oversized pool
      // ArrayBuffer rather than a tightly-sized one — TextEncoder allocates
      // an ArrayBuffer sized exactly to the encoded bytes.
      arrayBuffer: async () => new TextEncoder().encode('remote-bytes').buffer,
    });
    global.fetch = mockFetch as unknown as typeof fetch;

    try {
      const result = await generateImageViaProvider('a sovereign vista', null);
      expect(mockFetch).toHaveBeenCalledWith('https://provider.example/image.png');
      expect(result.bytes.toString()).toBe('remote-bytes');
    } finally {
      global.fetch = originalFetch;
    }
  });

  it('throws honestly when the provider returns no image data', async () => {
    mockGenerate.mockResolvedValue({ data: [] });
    await expect(generateImageViaProvider('a sovereign vista', null)).rejects.toThrow(/no image data/);
  });
});
