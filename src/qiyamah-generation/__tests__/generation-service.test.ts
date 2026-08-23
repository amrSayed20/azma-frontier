// ─── MOCKS (must be declared before any imports) ─────────────────────────────

const mockOrchestrate = jest.fn();

jest.mock('../../core/sovereign-ai-integration/provider-bootstrap', () => ({
  getGenerationOrchestrator: () => ({ orchestrate: mockOrchestrate }),
}));
jest.mock('../asset-storage');
jest.mock('../../persistent-storage', () => ({
  getDb: jest.fn(() => 'fake-db-handle'),
  recordGeneration: jest.fn(),
  insertVaultAsset: jest.fn(),
}));

// ─── IMPORTS ──────────────────────────────────────────────────────────────────

import { persistGeneratedImage } from '../asset-storage';
import { resetRateLimiterForTests, recordGeneration } from '../rate-limiter';
import { recordGeneration as persistGenerationRecord, insertVaultAsset } from '../../persistent-storage';
import { generateImage } from '../generation-service';
import { AssetFamily } from '../../vault/sovereign-vault-types';
import { CapabilityTarget } from '../../core/sovereign-orchestrator/qiyamah-intent-types';

const mockPersistGeneratedImage = persistGeneratedImage as jest.Mock;
const mockPersistGenerationRecord = persistGenerationRecord as jest.Mock;
const mockInsertVaultAsset = insertVaultAsset as jest.Mock;

// ─── TEST HELPERS ─────────────────────────────────────────────────────────────

// 8-byte PNG magic + padding to 67 bytes — passes the integrity gate.
// persistGeneratedImage is mocked, so the bytes never touch the filesystem.
const PNG_HEADER = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(67 - 8, 0x00),
]);
const PNG_HEADER_B64 = PNG_HEADER.toString('base64');

function successOrchestration(content = PNG_HEADER_B64) {
  mockOrchestrate.mockResolvedValue({
    response: { finishReason: 'completed', content },
  });
}

// ─── SUITE ────────────────────────────────────────────────────────────────────

describe('Qiyamah First Generation Path — Generation Service', () => {
  beforeEach(() => {
    resetRateLimiterForTests();
    mockOrchestrate.mockReset();
    mockPersistGeneratedImage.mockReset();
    mockPersistGenerationRecord.mockReset();
    mockInsertVaultAsset.mockReset();
  });

  // ── Validation ──────────────────────────────────────────────────────────────

  it('rejects an empty prompt honestly, without calling the provider', async () => {
    const result = await generateImage({ prompt: '   ' });
    expect(result).toEqual(expect.objectContaining({ status: 'failed', reason: 'invalid-prompt' }));
    expect(mockOrchestrate).not.toHaveBeenCalled();
  });

  it('rejects a prompt exceeding the maximum length', async () => {
    const result = await generateImage({ prompt: 'x'.repeat(1001) });
    expect(result).toEqual(expect.objectContaining({ status: 'failed', reason: 'invalid-prompt' }));
  });

  it('refuses generation once the interim rate limit is reached', async () => {
    for (let i = 0; i < 20; i++) recordGeneration();
    const result = await generateImage({ prompt: 'a sovereign vista' });
    expect(result).toEqual(expect.objectContaining({ status: 'failed', reason: 'rate-limited' }));
    expect(mockOrchestrate).not.toHaveBeenCalled();
  });

  // ── Successful path ──────────────────────────────────────────────────────────

  it('produces a real, persisted asset on the successful path, and durably records it', async () => {
    successOrchestration();
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
    successOrchestration();
    mockPersistGeneratedImage.mockResolvedValue({ assetId: 'abc-124', assetUrl: '/generated-assets/abc-124.png' });

    await generateImage({ prompt: 'a sovereign vista', creatorId: 'creator-42' });

    expect(mockPersistGenerationRecord).toHaveBeenCalledWith('fake-db-handle', expect.objectContaining({ creatorId: 'creator-42' }));
  });

  it('INTEGRATION PACKAGE I: deposits the generated asset into the real Sovereign Vault when a creatorId is present', async () => {
    successOrchestration();
    mockPersistGeneratedImage.mockResolvedValue({ assetId: 'abc-125', assetUrl: '/generated-assets/abc-125.png' });

    await generateImage({ prompt: 'a sovereign citadel', style: 'cinematic', creatorId: 'creator-42' });

    expect(mockInsertVaultAsset).toHaveBeenCalledWith('fake-db-handle', expect.objectContaining({
      subscriberTenantId: 'creator-42',
      originatingOperationId: 'abc-125',
      capabilityTarget: CapabilityTarget.VISUAL,
      assetFamily: AssetFamily.MEDIA,
      secureStorageUri: '/generated-assets/abc-125.png',
      metadata: expect.objectContaining({ generationPrompt: 'a sovereign citadel', generationStyle: 'cinematic' }),
    }));
  });

  it('does not deposit into the Vault when no creatorId is present — never a Vault asset with no real owner', async () => {
    successOrchestration();
    mockPersistGeneratedImage.mockResolvedValue({ assetId: 'abc-126', assetUrl: '/generated-assets/abc-126.png' });

    await generateImage({ prompt: 'a sovereign vista' });

    expect(mockInsertVaultAsset).not.toHaveBeenCalled();
  });

  it('a Vault deposit failure never turns an already-successful generation into a reported failure', async () => {
    successOrchestration();
    mockPersistGeneratedImage.mockResolvedValue({ assetId: 'abc-127', assetUrl: '/generated-assets/abc-127.png' });
    mockInsertVaultAsset.mockImplementation(() => { throw new Error('vault is unreachable'); });

    const result = await generateImage({ prompt: 'a sovereign vista', creatorId: 'creator-42' });

    expect(result.status).toBe('succeeded');
  });

  // ── Integrity gate ───────────────────────────────────────────────────────────

  it('integrity gate: rejects URL-as-bytes corruption (MagicHourVideoAdapter misrouting), never persists', async () => {
    // Simulate the bug: video adapter returns a GCS URL as content;
    // Buffer.from(url, 'base64') yields ~56 bytes of garbage — never a valid PNG.
    const corruptContent = Buffer.from('https://videos.magichour.ai/cmt5gsbae00kvkh013ovj7w4w/video.mp4').toString('base64');
    mockOrchestrate.mockResolvedValue({ response: { finishReason: 'completed', content: corruptContent } });

    const result = await generateImage({ prompt: 'a sovereign vista', creatorId: 'creator-42' });

    expect(result).toEqual(expect.objectContaining({ status: 'failed', reason: 'provider-error' }));
    expect(mockPersistGeneratedImage).not.toHaveBeenCalled();
    expect(mockInsertVaultAsset).not.toHaveBeenCalled();
  });

  it('integrity gate: rejects empty content — never persists a zero-byte file', async () => {
    mockOrchestrate.mockResolvedValue({ response: { finishReason: 'completed', content: '' } });

    const result = await generateImage({ prompt: 'a sovereign vista' });

    expect(result).toEqual(expect.objectContaining({ status: 'failed', reason: 'provider-error' }));
    expect(mockPersistGeneratedImage).not.toHaveBeenCalled();
  });

  it('integrity gate: rejects non-PNG binary content (e.g. MP4 bytes) — never persists', async () => {
    // MP4 ftyp box magic: 00 00 00 18 66 74 79 70 (not PNG)
    const mp4Bytes = Buffer.concat([
      Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]),
      Buffer.alloc(100, 0x00),
    ]);
    mockOrchestrate.mockResolvedValue({ response: { finishReason: 'completed', content: mp4Bytes.toString('base64') } });

    const result = await generateImage({ prompt: 'a sovereign vista' });

    expect(result).toEqual(expect.objectContaining({ status: 'failed', reason: 'provider-error' }));
    expect(mockPersistGeneratedImage).not.toHaveBeenCalled();
  });

  // ── Provider / orchestrator failures ─────────────────────────────────────────

  it('reports an honest failure when the orchestrator throws — never a fake success', async () => {
    mockOrchestrate.mockRejectedValue(new Error('provider is down'));

    const result = await generateImage({ prompt: 'a sovereign vista' });

    expect(result).toEqual(expect.objectContaining({ status: 'failed', reason: 'provider-error' }));
    expect(mockPersistGeneratedImage).not.toHaveBeenCalled();
  });

  it('reports an honest failure when the orchestrator returns a non-completed result', async () => {
    mockOrchestrate.mockResolvedValue({ response: { finishReason: 'blocked', content: '' } });

    const result = await generateImage({ prompt: 'a sovereign vista' });

    expect(result).toEqual(expect.objectContaining({ status: 'failed', reason: 'provider-error' }));
    expect(mockPersistGeneratedImage).not.toHaveBeenCalled();
  });

  it('reports an honest failure when persistence fails, after a real generation succeeded', async () => {
    successOrchestration();
    mockPersistGeneratedImage.mockRejectedValue(new Error('disk is full'));

    const result = await generateImage({ prompt: 'a sovereign vista' });

    expect(result).toEqual(expect.objectContaining({ status: 'failed', reason: 'storage-error', message: 'disk is full' }));
  });
});
