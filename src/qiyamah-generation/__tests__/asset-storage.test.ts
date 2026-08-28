jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
}));

import { mkdir, writeFile } from 'fs/promises';
import { persistGeneratedImage } from '../asset-storage';

describe('Qiyamah First Generation Path — binary asset persistence', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('writes the generated image bytes to the generated-assets directory and returns a servable URL', async () => {
    const bytes = Buffer.from('fake-png-bytes');
    const result = await persistGeneratedImage(bytes);

    expect(mkdir).toHaveBeenCalledWith(expect.stringContaining('generated-assets'), { recursive: true });
    expect(writeFile).toHaveBeenCalledWith(expect.stringContaining(result.assetId), bytes);
    expect(result.assetUrl).toBe(`/generated-assets/${result.assetId}.png`);
  });

  it('uses .png extension when mimeType defaults to image/png', async () => {
    const result = await persistGeneratedImage(Buffer.from('fake'), 'image/png');
    expect(result.assetUrl).toMatch(/\.png$/);
  });

  it('uses .jpg extension for image/jpeg mimeType', async () => {
    const result = await persistGeneratedImage(Buffer.from('fake'), 'image/jpeg');
    expect(result.assetUrl).toMatch(/\.jpg$/);
    expect(writeFile).toHaveBeenCalledWith(expect.stringContaining('.jpg'), expect.any(Buffer));
  });

  it('uses .webp extension for image/webp mimeType', async () => {
    const result = await persistGeneratedImage(Buffer.from('fake'), 'image/webp');
    expect(result.assetUrl).toMatch(/\.webp$/);
    expect(writeFile).toHaveBeenCalledWith(expect.stringContaining('.webp'), expect.any(Buffer));
  });

  it('falls back to .png extension for unrecognized mimeType', async () => {
    const result = await persistGeneratedImage(Buffer.from('fake'), 'application/octet-stream');
    expect(result.assetUrl).toMatch(/\.png$/);
  });

  it('generates a distinct assetId for each call', async () => {
    const first = await persistGeneratedImage(Buffer.from('a'));
    const second = await persistGeneratedImage(Buffer.from('b'));
    expect(first.assetId).not.toBe(second.assetId);
  });
});
