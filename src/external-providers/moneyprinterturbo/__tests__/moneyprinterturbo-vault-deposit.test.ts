/**
 * MoneyPrinterTurbo → Sovereign Vault deposit — Certified Tests
 *
 * The Vault manager and the storage writer are mocked, so no database is
 * touched and nothing is written to disk. What is asserted is the honesty of
 * the record: the real provider identity, real generation metadata, and the
 * absence of any credential.
 */

process.env['MONEYPRINTERTURBO_API_KEY'] = 'mpt-test-key-sentinel';

const mockDepositAsset = jest.fn();
const mockPersist = jest.fn();

jest.mock('../../../vault/sovereign-vault-manager', () => ({
  SovereignVaultManager: jest.fn().mockImplementation(() => ({ depositAsset: mockDepositAsset })),
}));

jest.mock('../../../vault/vault-asset-upload-storage', () => ({
  persistUploadedAsset: (...args: unknown[]) => mockPersist(...args),
}));

import { depositProductionIntoVault } from '../moneyprinterturbo-vault-deposit';
import { MONEYPRINTERTURBO_PROVIDER_ID, type VideoProductionResult } from '../moneyprinterturbo-adapter';
import { AssetFamily } from '../../../vault/sovereign-vault-types';
import { CapabilityTarget } from '../../../core/sovereign-orchestrator/qiyamah-intent-types';

const production: VideoProductionResult = {
  providerId: MONEYPRINTERTURBO_PROVIDER_ID,
  taskId: 'task-abc',
  providerOutputPath: '/tasks/task-abc/final-1.mp4',
  bytes: Buffer.alloc(4096, 3),
  usage: { elapsedMs: 416_000, pollCount: 52, outputBytes: 4096 },
};

beforeEach(() => {
  mockDepositAsset.mockReset().mockImplementation(async (d) => ({ assetId: 'asset_1', ...d }));
  mockPersist.mockReset().mockResolvedValue({ assetId: 'uuid-1', assetUrl: '/uploads/uuid-1.mp4' });
});

describe('deposit', () => {
  it('writes the artefact as an .mp4 and deposits the resulting sovereign URI', async () => {
    await depositProductionIntoVault({
      creatorId: 'creator-1',
      production,
      request: { subject: 'قهوة عربية مختصة' },
    });

    expect(mockPersist).toHaveBeenCalledWith(production.bytes, '.mp4');
    expect(mockDepositAsset.mock.calls[0][0].secureStorageUri).toBe('/uploads/uuid-1.mp4');
  });

  it('files the asset as MOTION media owned by the creator', async () => {
    await depositProductionIntoVault({
      creatorId: 'creator-1',
      production,
      request: { subject: 'سيارة كهربائية' },
    });

    const deposit = mockDepositAsset.mock.calls[0][0];
    expect(deposit.capabilityTarget).toBe(CapabilityTarget.MOTION);
    expect(deposit.assetFamily).toBe(AssetFamily.MEDIA);
    expect(deposit.subscriberTenantId).toBe('creator-1');
  });

  it('records the real provider, never the creator-upload identity', async () => {
    await depositProductionIntoVault({
      creatorId: 'creator-1',
      production,
      request: { subject: 'قهوة' },
    });

    const { metadata } = mockDepositAsset.mock.calls[0][0];
    expect(metadata.providerId).toBe('moneyprinterturbo');
    expect(metadata.providerId).not.toBe('creator-upload');
    expect(metadata.providerTaskId).toBe('task-abc');
  });

  it('preserves generation metadata', async () => {
    await depositProductionIntoVault({
      creatorId: 'creator-1',
      production,
      request: { subject: 'قهوة عربية', language: 'Arabic', aspect: '9:16', subtitlesEnabled: true },
      generatedScript: 'تبدأ رحلة القهوة العربية المختصة...',
      searchTerms: ['specialty coffee roasting', 'fresh coffee beans'],
    });

    const { metadata } = mockDepositAsset.mock.calls[0][0];
    expect(metadata.generationSubject).toBe('قهوة عربية');
    expect(metadata.generationLanguage).toBe('Arabic');
    expect(metadata.generationAspect).toBe('9:16');
    expect(metadata.subtitlesBurnedIn).toBe(true);
    expect(metadata.generationScript).toContain('القهوة العربية');
    expect(metadata.generationSearchTerms).toEqual(['specialty coffee roasting', 'fresh coffee beans']);
    expect(metadata.fileSizeBytes).toBe(4096);
    expect(metadata.productionElapsedMs).toBe(416_000);
  });

  it('keeps plain source attribution but drops any signed url', async () => {
    await depositProductionIntoVault({
      creatorId: 'creator-1',
      production,
      request: { subject: 'قهوة' },
      sourceMedia: [
        { provider: 'pexels', url: 'https://videos.pexels.com/clip-1.mp4', durationSeconds: 12 },
        { provider: 'pexels', url: 'https://videos.pexels.com/clip-2.mp4?token=SECRET' },
      ],
    });

    const sources = mockDepositAsset.mock.calls[0][0].metadata.sourceMedia as Record<string, unknown>[];
    expect(sources[0]).toEqual({
      provider: 'pexels',
      url: 'https://videos.pexels.com/clip-1.mp4',
      durationSeconds: 12,
    });
    expect(sources[1]).toEqual({ provider: 'pexels' });
    expect(JSON.stringify(sources)).not.toContain('SECRET');
  });

  it('never lets a credential reach the asset record', async () => {
    await depositProductionIntoVault({
      creatorId: 'creator-1',
      production,
      request: { subject: 'قهوة' },
    });

    const serialized = JSON.stringify(mockDepositAsset.mock.calls[0][0]);
    expect(serialized).not.toContain('mpt-test-key-sentinel');
    expect(serialized).not.toMatch(/api[_-]?key/i);
  });

  it('omits optional metadata rather than writing empty placeholders', async () => {
    await depositProductionIntoVault({
      creatorId: 'creator-1',
      production,
      request: { subject: 'قهوة' },
    });

    const { metadata } = mockDepositAsset.mock.calls[0][0];
    expect(metadata).not.toHaveProperty('generationScript');
    expect(metadata).not.toHaveProperty('generationSearchTerms');
    expect(metadata).not.toHaveProperty('sourceMedia');
  });
});
