jest.mock('../image-provider');
jest.mock('../asset-storage');
jest.mock('../../persistent-storage', () => ({
  getDb: jest.fn(() => 'fake-db-handle'),
  recordGeneration: jest.fn(),
}));

import { generateImageViaProvider } from '../image-provider';
import { persistGeneratedImage } from '../asset-storage';
import { resetRateLimiterForTests, recordGeneration } from '../rate-limiter';
import { recordGeneration as persistGenerationRecord } from '../../persistent-storage';
import { generateImage } from '../generation-service';

const mockGenerateImageViaProvider = generateImageViaProvider as jest.Mock;
const mockPersistGeneratedImage = persistGeneratedImage as jest.Mock;
const mockPersistGenerationRecord = persistGenerationRecord as jest.Mock;

describe('Qiyamah First Generation Path — Generation Service', () => {
  beforeEach(() => {
    resetRateLimiterForTests();
    mockGenerateImageViaProvider.mockReset();
    mockPersistGeneratedImage.mockReset();
    mockPersistGenerationRecord.mockReset();
  });

  it('rejects an empty prompt honestly, without calling the provider', async () => {
    const result = await generateImage({ prompt: '   ' });
    expect(result).toEqual(expect.objectContaining({ status: 'failed', reason: 'invalid-prompt' }));
    expect(mockGenerateImageViaProvider).not.toHaveBeenCalled();
  });

  it('rejects a prompt exceeding the maximum length', async () => {
    const result = await generateImage({ prompt: 'x'.repeat(1001) });
    expect(result).toEqual(expect.objectContaining({ status: 'failed', reason: 'invalid-prompt' }));
  });

  it('refuses generation once the interim rate limit is reached', async () => {
    for (let i = 0; i < 20; i++) recordGeneration();
    const result = await generateImage({ prompt: 'a sovereign vista' });
    expect(result).toEqual(expect.objectContaining({ status: 'failed', reason: 'rate-limited' }));
    expect(mockGenerateImageViaProvider).not.toHaveBeenCalled();
  });

  it('produces a real, persisted asset on the successful path, and durably records it', async () => {
    mockGenerateImageViaProvider.mockResolvedValue({ bytes: Buffer.from('img'), mimeType: 'image/png' });
    mockPersistGeneratedImage.mockResolvedValue({ assetId: 'abc-123', assetUrl: '/generated-assets/abc-123.png' });

    const result = await generateImage({ prompt: 'a sovereign vista', style: 'cinematic' });

    expect(result.status).toBe('succeeded');
    if (result.status === 'succeeded') {
      expect(result.asset.assetUrl).toBe('/generated-assets/abc-123.png');
      expect(result.asset.prompt).toBe('a sovereign vista');
      expect(result.asset.style).toBe('cinematic');
    }
    expect(mockPersistGenerationRecord).toHaveBeenCalledWith('fake-db-handle', expect.objectContaining({
      creatorId: null,
      prompt: 'a sovereign vista',
      style: 'cinematic',
      assetUrl: '/generated-assets/abc-123.png',
    }));
  });

  it('passes a real creatorId through to the durable record when supplied', async () => {
    mockGenerateImageViaProvider.mockResolvedValue({ bytes: Buffer.from('img'), mimeType: 'image/png' });
    mockPersistGeneratedImage.mockResolvedValue({ assetId: 'abc-124', assetUrl: '/generated-assets/abc-124.png' });

    await generateImage({ prompt: 'a sovereign vista', creatorId: 'creator-42' });

    expect(mockPersistGenerationRecord).toHaveBeenCalledWith('fake-db-handle', expect.objectContaining({ creatorId: 'creator-42' }));
  });

  it('reports an honest failure when the Launch Provider errors — never a fake success', async () => {
    mockGenerateImageViaProvider.mockRejectedValue(new Error('provider is down'));
    const result = await generateImage({ prompt: 'a sovereign vista' });
    expect(result).toEqual(expect.objectContaining({ status: 'failed', reason: 'provider-error', message: 'provider is down' }));
    expect(mockPersistGeneratedImage).not.toHaveBeenCalled();
  });

  it('reports an honest failure when persistence fails, after a real generation succeeded', async () => {
    mockGenerateImageViaProvider.mockResolvedValue({ bytes: Buffer.from('img'), mimeType: 'image/png' });
    mockPersistGeneratedImage.mockRejectedValue(new Error('disk is full'));

    const result = await generateImage({ prompt: 'a sovereign vista' });
    expect(result).toEqual(expect.objectContaining({ status: 'failed', reason: 'storage-error', message: 'disk is full' }));
  });
});
