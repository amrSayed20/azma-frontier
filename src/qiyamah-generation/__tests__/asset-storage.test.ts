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

  it('generates a distinct assetId for each call', async () => {
    const first = await persistGeneratedImage(Buffer.from('a'));
    const second = await persistGeneratedImage(Buffer.from('b'));
    expect(first.assetId).not.toBe(second.assetId);
  });
});
