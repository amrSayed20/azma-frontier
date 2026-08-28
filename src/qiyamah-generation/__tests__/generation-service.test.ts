// ─── MOCKS (must be declared before any imports) ─────────────────────────────

const mockOrchestrate = jest.fn();
const mockInsertVaultAssetVideo = jest.fn();

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
import { generateImage, generateVideo } from '../generation-service';
import { AssetFamily } from '../../vault/sovereign-vault-types';
import { CapabilityTarget } from '../../core/sovereign-orchestrator/qiyamah-intent-types';

const mockPersistGeneratedImage = persistGeneratedImage as jest.Mock;
const mockPersistGenerationRecord = persistGenerationRecord as jest.Mock;
const mockInsertVaultAsset = insertVaultAsset as jest.Mock;

// ─── TEST HELPERS ─────────────────────────────────────────────────────────────

// Image format fixtures — each passes the multi-format integrity gate.
// persistGeneratedImage is mocked, so bytes never touch the filesystem.
const PNG_HEADER = Buffer.concat([
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
  Buffer.alloc(67 - 8, 0x00), // 67 bytes total (well above the 12-byte minimum)
]);
const PNG_HEADER_B64 = PNG_HEADER.toString('base64');

const JPEG_HEADER = Buffer.concat([
  Buffer.from([0xff, 0xd8, 0xff, 0xe0]), // JPEG SOI + APP0 marker
  Buffer.alloc(12, 0x00),               // padding to clear the 12-byte minimum
]);
const JPEG_HEADER_B64 = JPEG_HEADER.toString('base64');

// WebP RIFF container header — exactly the 12 bytes needed to pass the gate.
const WEBP_HEADER = Buffer.concat([
  Buffer.from([0x52, 0x49, 0x46, 0x46]), // RIFF
  Buffer.alloc(4, 0x00),                  // file size (don't care)
  Buffer.from([0x57, 0x45, 0x42, 0x50]), // WEBP
]);
const WEBP_HEADER_B64 = WEBP_HEADER.toString('base64');

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

  it('integrity gate: rejects unrecognized binary format (e.g. MP4 bytes) — never persists', async () => {
    // MP4 ftyp box magic: 00 00 00 18 66 74 79 70 — not PNG, JPEG, or WebP
    const mp4Bytes = Buffer.concat([
      Buffer.from([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70]),
      Buffer.alloc(100, 0x00),
    ]);
    mockOrchestrate.mockResolvedValue({ response: { finishReason: 'completed', content: mp4Bytes.toString('base64') } });

    const result = await generateImage({ prompt: 'a sovereign vista' });

    expect(result).toEqual(expect.objectContaining({ status: 'failed', reason: 'provider-error' }));
    expect(mockPersistGeneratedImage).not.toHaveBeenCalled();
  });

  it('integrity gate: accepts valid JPEG content and calls persist with image/jpeg mimeType', async () => {
    mockOrchestrate.mockResolvedValue({ response: { finishReason: 'completed', content: JPEG_HEADER_B64 } });
    mockPersistGeneratedImage.mockResolvedValue({ assetId: 'jpeg-001', assetUrl: '/generated-assets/jpeg-001.jpg' });

    const result = await generateImage({ prompt: 'a sovereign vista' });

    expect(result.status).toBe('succeeded');
    expect(mockPersistGeneratedImage).toHaveBeenCalledWith(expect.any(Buffer), 'image/jpeg');
  });

  it('integrity gate: accepts valid WebP content and calls persist with image/webp mimeType', async () => {
    mockOrchestrate.mockResolvedValue({ response: { finishReason: 'completed', content: WEBP_HEADER_B64 } });
    mockPersistGeneratedImage.mockResolvedValue({ assetId: 'webp-001', assetUrl: '/generated-assets/webp-001.webp' });

    const result = await generateImage({ prompt: 'a sovereign vista' });

    expect(result.status).toBe('succeeded');
    expect(mockPersistGeneratedImage).toHaveBeenCalledWith(expect.any(Buffer), 'image/webp');
  });

  it('integrity gate: accepts valid PNG content and calls persist with image/png mimeType', async () => {
    successOrchestration();
    mockPersistGeneratedImage.mockResolvedValue({ assetId: 'png-001', assetUrl: '/generated-assets/png-001.png' });

    await generateImage({ prompt: 'a sovereign vista' });

    expect(mockPersistGeneratedImage).toHaveBeenCalledWith(expect.any(Buffer), 'image/png');
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

  // ── Clarity Package: originalIdea ────────────────────────────────────────────

  it('A+B: the constructed prompt (not the Creator\'s original idea) is what the orchestrator receives', async () => {
    successOrchestration();
    mockPersistGeneratedImage.mockResolvedValue({ assetId: 'abc-ab', assetUrl: '/generated-assets/ab.png' });

    const constructedPrompt = 'مشهد سينمائي بكاميرا 35mm، سيارة في القاهرة ليلًا، إضاءة درامية';
    const originalIdea = 'سيارة في القاهرة ليلًا';

    await generateImage({ prompt: constructedPrompt, originalIdea, creatorId: 'creator-ab' });

    const orchestrateCall = mockOrchestrate.mock.calls[0][0];
    // B: constructed prompt is what the orchestrator (and provider) receives
    expect(orchestrateCall.prompt).toBe(constructedPrompt);
    // A: the original idea is NOT what is sent to the provider
    expect(orchestrateCall.prompt).not.toBe(originalIdea);
  });

  it('C+D: originalIdea is persisted separately; the asset result carries both for downstream use', async () => {
    successOrchestration();
    mockPersistGeneratedImage.mockResolvedValue({ assetId: 'abc-cd', assetUrl: '/generated-assets/cd.png' });

    const constructedPrompt = 'مشهد سينمائي بكاميرا 35mm، فكرة بسيطة، إضاءة درامية سينمائية';
    const originalIdea = 'فكرة بسيطة';

    const result = await generateImage({ prompt: constructedPrompt, originalIdea });

    // D: originalIdea stored in the durable record
    expect(mockPersistGenerationRecord).toHaveBeenCalledWith('fake-db-handle', expect.objectContaining({
      prompt: constructedPrompt,
      originalIdea,
    }));

    // C: the asset result separates creator-facing text from engineering prompt
    if (result.status === 'succeeded') {
      expect(result.asset.originalIdea).toBe(originalIdea);
      expect(result.asset.prompt).toBe(constructedPrompt);
      expect(result.asset.prompt).not.toBe(result.asset.originalIdea);
    }
  });

  it('originalIdea defaults to null when not provided — anonymous or legacy calls unaffected', async () => {
    successOrchestration();
    mockPersistGeneratedImage.mockResolvedValue({ assetId: 'abc-null', assetUrl: '/generated-assets/null.png' });

    const result = await generateImage({ prompt: 'a sovereign vista' });

    expect(mockPersistGenerationRecord).toHaveBeenCalledWith('fake-db-handle', expect.objectContaining({
      originalIdea: null,
    }));

    if (result.status === 'succeeded') {
      expect(result.asset.originalIdea).toBeNull();
    }
  });
});

// ─── VIDEO GENERATION SUITE ───────────────────────────────────────────────────

const VIDEO_URL = 'https://cdn.magichour.ai/cmt5gsbae00kvkh013ovj7w4w/video.mp4';

function successVideoOrchestration(content = VIDEO_URL) {
  mockOrchestrate.mockResolvedValue({
    response: { finishReason: 'completed', content, providerId: 'magic-hour-video' },
  });
}

describe('Qiyamah Video Generation Path — generateVideo()', () => {
  beforeEach(() => {
    mockOrchestrate.mockReset();
    mockPersistGeneratedImage.mockReset();
    mockPersistGenerationRecord.mockReset();
    mockInsertVaultAsset.mockReset();
    mockInsertVaultAssetVideo.mockReset();
  });

  // ── Validation ────────────────────────────────────────────────────────────

  it('rejects an empty prompt without calling the provider', async () => {
    const result = await generateVideo({ prompt: '   ', durationSeconds: 6 });
    expect(result).toEqual(expect.objectContaining({ status: 'failed', reason: 'invalid-prompt' }));
    expect(mockOrchestrate).not.toHaveBeenCalled();
  });

  it('rejects a prompt exceeding the maximum length', async () => {
    const result = await generateVideo({ prompt: 'x'.repeat(1001), durationSeconds: 6 });
    expect(result).toEqual(expect.objectContaining({ status: 'failed', reason: 'invalid-prompt' }));
    expect(mockOrchestrate).not.toHaveBeenCalled();
  });

  // ── Orchestration contract ────────────────────────────────────────────────

  it('orchestrates with taskHint: video — never taskHint: image', async () => {
    successVideoOrchestration();

    await generateVideo({ prompt: 'a sovereign scene', durationSeconds: 6, creatorId: 'creator-v1' });

    const call = mockOrchestrate.mock.calls[0][0];
    expect(call.taskHint).toBe('video');
    expect(call.taskHint).not.toBe('image');
  });

  it('passes durationSeconds to orchestration metadata', async () => {
    successVideoOrchestration();

    await generateVideo({ prompt: 'a sovereign scene', durationSeconds: 8, creatorId: 'creator-v2' });

    const call = mockOrchestrate.mock.calls[0][0];
    expect(call.metadata).toMatchObject({ durationSeconds: 8 });
  });

  // ── URL contract — NOT base64 ─────────────────────────────────────────────

  it('takes the video URL directly from content — never calls Buffer.from(content, base64)', async () => {
    successVideoOrchestration();

    const result = await generateVideo({ prompt: 'a sovereign scene', durationSeconds: 6, creatorId: 'creator-v3' });

    expect(result.status).toBe('succeeded');
    if (result.status === 'succeeded') {
      expect(result.asset.assetUrl).toBe(VIDEO_URL);
    }
    // persistGeneratedImage is the file-writer — must NOT be called for video
    expect(mockPersistGeneratedImage).not.toHaveBeenCalled();
  });

  it('rejects an empty content string — no URL returned from provider', async () => {
    mockOrchestrate.mockResolvedValue({ response: { finishReason: 'completed', content: '' } });

    const result = await generateVideo({ prompt: 'a sovereign scene', durationSeconds: 6 });

    expect(result).toEqual(expect.objectContaining({ status: 'failed', reason: 'provider-error' }));
    expect(mockPersistGenerationRecord).not.toHaveBeenCalled();
  });

  it('rejects a non-HTTP content string', async () => {
    mockOrchestrate.mockResolvedValue({ response: { finishReason: 'completed', content: 'not-a-url' } });

    const result = await generateVideo({ prompt: 'a sovereign scene', durationSeconds: 6 });

    expect(result).toEqual(expect.objectContaining({ status: 'failed', reason: 'provider-error' }));
  });

  // ── Persistence and Vault ─────────────────────────────────────────────────

  it('stores the video URL in generation_records with mediaType video', async () => {
    successVideoOrchestration();

    await generateVideo({ prompt: 'a sovereign scene', durationSeconds: 6, creatorId: 'creator-v4' });

    expect(mockPersistGenerationRecord).toHaveBeenCalledWith('fake-db-handle', expect.objectContaining({
      assetUrl: VIDEO_URL,
      mediaType: 'video',
      creatorId: 'creator-v4',
    }));
  });

  it('deposits into Vault with CapabilityTarget.MOTION — never VISUAL', async () => {
    successVideoOrchestration();

    await generateVideo({ prompt: 'a sovereign scene', durationSeconds: 6, creatorId: 'creator-v5' });

    expect(mockInsertVaultAsset).toHaveBeenCalledWith('fake-db-handle', expect.objectContaining({
      capabilityTarget: CapabilityTarget.MOTION,
      assetFamily: AssetFamily.MEDIA,
      secureStorageUri: VIDEO_URL,
      subscriberTenantId: 'creator-v5',
    }));
  });

  it('does NOT deposit into Vault when no creatorId — no orphaned Vault assets', async () => {
    successVideoOrchestration();

    await generateVideo({ prompt: 'a sovereign scene', durationSeconds: 6 });

    expect(mockInsertVaultAsset).not.toHaveBeenCalled();
  });

  it('returns succeeded with durationSeconds in the asset', async () => {
    successVideoOrchestration();

    const result = await generateVideo({ prompt: 'a sovereign scene', durationSeconds: 8, creatorId: 'creator-v6' });

    expect(result.status).toBe('succeeded');
    if (result.status === 'succeeded') {
      expect(result.asset.durationSeconds).toBe(8);
      expect(result.asset.assetUrl).toBe(VIDEO_URL);
    }
  });

  // ── Provider failures ─────────────────────────────────────────────────────

  it('reports an honest provider-error when the orchestrator throws', async () => {
    mockOrchestrate.mockRejectedValue(new Error('provider is down'));

    const result = await generateVideo({ prompt: 'a sovereign scene', durationSeconds: 6 });

    expect(result).toEqual(expect.objectContaining({ status: 'failed', reason: 'provider-error' }));
    expect(mockPersistGenerationRecord).not.toHaveBeenCalled();
  });

  it('reports an honest provider-error when finishReason is not completed', async () => {
    mockOrchestrate.mockResolvedValue({ response: { finishReason: 'blocked', content: '' } });

    const result = await generateVideo({ prompt: 'a sovereign scene', durationSeconds: 6 });

    expect(result).toEqual(expect.objectContaining({ status: 'failed', reason: 'provider-error' }));
  });

  it('a Vault deposit failure never turns an already-successful video generation into a failure', async () => {
    successVideoOrchestration();
    mockInsertVaultAsset.mockImplementation(() => { throw new Error('vault is unreachable'); });

    const result = await generateVideo({ prompt: 'a sovereign scene', durationSeconds: 6, creatorId: 'creator-v7' });

    expect(result.status).toBe('succeeded');
  });
});
