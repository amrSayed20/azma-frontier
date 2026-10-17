const mockVerifySession = jest.fn(() => ({ creatorId: 'creator-1', role: 'creator' }));
const mockPersist = jest.fn();

jest.mock('../../../../../../src/authentication', () => ({
  verifySession: () => mockVerifySession(),
}));
jest.mock('../../../../../../src/vault/vault-asset-upload-storage', () => ({
  persistUploadedAsset: (...args: unknown[]) => mockPersist(...args),
}));

import { NextRequest } from 'next/server';
import { POST } from '../route';

function upload(name: string, type: string, content = 'x') {
  const form = new FormData();
  form.append('file', new File([content], name, { type }));
  return new NextRequest('http://localhost/api/vault/assets/upload', {
    method: 'POST',
    headers: { Cookie: 'azma_session=s' },
    body: form,
  });
}

describe('vault upload — only safe extensions are stored', () => {
  beforeEach(() => mockPersist.mockReset());

  it.each([
    ['page.html', 'text/html'],
    ['logo.svg', 'image/svg+xml'],
    ['photo.html', 'image/png'],
    ['clip.js', 'video/mp4'],
    ['notes.htm', 'text/plain'],
    ['data.xml', 'application/json'],
    ['no-extension', 'image/png'],
  ])('refuses %s sent as %s before anything is written', async (name, type) => {
    const response = await POST(upload(name, type, '<script>alert(1)</script>'));
    expect(response.status).toBe(400);
    expect((await response.json()).reason).toBe('unsupported-file-type');
    expect(mockPersist).not.toHaveBeenCalled();
  });

  it('stores an allowed extension in lower case', async () => {
    mockPersist.mockRejectedValue(new Error('stop after the check'));
    await expect(POST(upload('Holiday.PNG', 'image/png'))).rejects.toThrow('stop after the check');
    expect(mockPersist).toHaveBeenCalledWith(expect.any(Buffer), '.png');
  });
});
