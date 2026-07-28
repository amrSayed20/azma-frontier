jest.mock('fs/promises', () => ({
  mkdir: jest.fn().mockResolvedValue(undefined),
  writeFile: jest.fn().mockResolvedValue(undefined),
}));

import { mkdir, writeFile } from 'fs/promises';
import { persistUploadedAsset } from '../vault-asset-upload-storage';

describe('PACKAGE XIX — Media Ingestion Layer: persistUploadedAsset', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('writes the uploaded file bytes to the uploads directory and returns a servable URL with the real extension preserved', async () => {
    const bytes = Buffer.from('fake-wav-bytes');
    const result = await persistUploadedAsset(bytes, '.wav');

    expect(mkdir).toHaveBeenCalledWith(expect.stringContaining('uploads'), { recursive: true });
    expect(writeFile).toHaveBeenCalledWith(expect.stringContaining(result.assetId), bytes);
    expect(result.assetUrl).toBe(`/uploads/${result.assetId}.wav`);
  });

  it('generates a distinct assetId for each call', async () => {
    const first = await persistUploadedAsset(Buffer.from('a'), '.png');
    const second = await persistUploadedAsset(Buffer.from('b'), '.png');
    expect(first.assetId).not.toBe(second.assetId);
  });

  it('drops an unsafe or malformed extension rather than trusting Creator-supplied input, protecting against path traversal', () => {
    const attempts = ['../../evil.sh', '.tar.gz.exe', '', '.', '/etc/passwd', '.this-is-way-too-long-to-be-a-real-extension'];
    return Promise.all(
      attempts.map(async (maliciousExtension) => {
        const result = await persistUploadedAsset(Buffer.from('x'), maliciousExtension);
        expect(result.assetUrl).toBe(`/uploads/${result.assetId}`);
        expect(result.assetUrl).not.toMatch(/\.\.|\/etc|evil|exe/);
      }),
    );
  });

  it('accepts a real, short alphanumeric extension', async () => {
    const result = await persistUploadedAsset(Buffer.from('x'), '.mp4');
    expect(result.assetUrl).toBe(`/uploads/${result.assetId}.mp4`);
  });
});
