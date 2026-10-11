/**
 * AZMA OS — THE CREATIVE RUNNER · OWNERSHIP, SHAPE, LINEAGE, 2026-10-11.
 *
 * No test here reaches a provider, submits a job, or consumes a credit: the
 * four are refused at the catalog gate long before the network, which is both
 * the behaviour under test and the safety of testing it.
 */

const mockGetVaultAsset = jest.fn();
const mockDeriveAsset = jest.fn();
const mockPersist = jest.fn();
const mockReadFile = jest.fn();
const mockStateOf = jest.fn();

jest.mock('../../persistent-storage', () => ({
  getVaultAsset: (...a: unknown[]) => mockGetVaultAsset(...a),
}));
jest.mock('../vault-asset-upload-storage', () => ({
  persistUploadedAsset: (...a: unknown[]) => mockPersist(...a),
}));
jest.mock('../sovereign-asset-mutation', () => ({
  deriveAsset: (...a: unknown[]) => mockDeriveAsset(...a),
  mutationRejectionSpokenAr: (r: string) => `رُفض: ${r}`,
}));
jest.mock('fs/promises', () => ({ readFile: (...a: unknown[]) => mockReadFile(...a) }));
jest.mock('../../qiyamah-generation/operation-catalog', () => ({
  stateOfOperation: (...a: unknown[]) => mockStateOf(...a),
}));
jest.mock('../../core/sovereign-ai-integration/provider-bootstrap', () => ({
  configuredGatewayIds: () => ['magic-hour'],
}));

const mockRemoveBg = jest.fn();
const mockLipSync = jest.fn();
const mockTalking = jest.fn();
const mockFaceSwap = jest.fn();
jest.mock('../../core/sovereign-ai-integration/adapters/magic-hour-creative-operations', () => ({
  removeBackgroundViaProvider: (...a: unknown[]) => mockRemoveBg(...a),
  lipSyncViaProvider: (...a: unknown[]) => mockLipSync(...a),
  talkingPhotoViaProvider: (...a: unknown[]) => mockTalking(...a),
  faceSwapViaProvider: (...a: unknown[]) => mockFaceSwap(...a),
}));

import { runCreativeOperation, CREATIVE_INPUT_SHAPE } from '../creative-operation-runner';

const DB = 'fake-db' as never;
const OWNER = 'creator-1';

const asset = (over: Record<string, unknown> = {}) => ({
  assetId: 'asset_target', subscriberTenantId: OWNER, capabilityTarget: 'VISUAL',
  secureStorageUri: '/uploads/a.png', derivationPermission: 'ALLOWED',
  lifecycleState: 'FINAL', metadata: {}, ...over,
});

const shut = { runnable: false, reasonAr: 'موقوفة', detailEn: 'cost not verified', nameAr: 'إزالة الخلفيّة' };
const open = { runnable: true, reasonAr: '', detailEn: 'ok', nameAr: 'إزالة الخلفيّة' };

beforeEach(() => {
  for (const m of [mockGetVaultAsset, mockDeriveAsset, mockPersist, mockReadFile,
    mockStateOf, mockRemoveBg, mockLipSync, mockTalking, mockFaceSwap]) m.mockReset();
  mockReadFile.mockResolvedValue(Buffer.from([1, 2, 3, 4]));
  mockPersist.mockResolvedValue({ assetId: 'op-1', assetUrl: '/uploads/out.png' });
});

// ─────────────────────────────────────────────────────────────────────────────
describe('1 · the catalog decides, and it is asked FIRST', () => {
  it('a shut operation is refused before an asset is even read', async () => {
    mockStateOf.mockReturnValue(shut);
    const r = await runCreativeOperation(DB, {
      operation: 'background-removal', creatorId: OWNER, targetAssetId: 'asset_target',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.rejection).toBe('unavailable');
      // The Creator reads the catalog's own reason, not one invented here.
      expect(r.messageAr).toBe('موقوفة');
    }
    expect(mockGetVaultAsset).not.toHaveBeenCalled();
    expect(mockReadFile).not.toHaveBeenCalled();
    expect(mockRemoveBg).not.toHaveBeenCalled();
  });

  it('all four are shut today, so none reaches a provider', async () => {
    mockStateOf.mockReturnValue(shut);
    for (const operation of ['background-removal', 'lip-sync', 'face-swap', 'talking-photo'] as const) {
      const r = await runCreativeOperation(DB, {
        operation, creatorId: OWNER, targetAssetId: 'asset_target',
        secondAssetId: 'asset_second', durationSeconds: 5,
      });
      expect(r.ok).toBe(false);
    }
    for (const m of [mockRemoveBg, mockLipSync, mockTalking, mockFaceSwap]) {
      expect(m).not.toHaveBeenCalled();
    }
  });

  it('the runner holds no availability logic of its own', () => {
    const src = require('fs').readFileSync(
      require('path').join(process.cwd(), 'src/vault/creative-operation-runner.ts'), 'utf8');
    expect(src).not.toMatch(/process\.env|API_KEY|costBasisVerified|policyBlocked/);
  });
});

// Every test below opens the gate deliberately, to reach the behaviour behind it.
describe('2 · ownership is checked on the server, for every input', () => {
  beforeEach(() => mockStateOf.mockReturnValue(open));

  it("another Creator's asset is answered exactly as an absent one", async () => {
    mockGetVaultAsset.mockReturnValue(asset({ subscriberTenantId: 'someone-else' }));
    const r = await runCreativeOperation(DB, {
      operation: 'background-removal', creatorId: OWNER, targetAssetId: 'asset_target',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.rejection).toBe('not-found');
  });

  it('an absent asset gets the SAME answer, so an id cannot be probed', async () => {
    mockGetVaultAsset.mockReturnValue(null);
    const a = await runCreativeOperation(DB, {
      operation: 'background-removal', creatorId: OWNER, targetAssetId: 'nope',
    });
    mockGetVaultAsset.mockReturnValue(asset({ subscriberTenantId: 'other' }));
    const b = await runCreativeOperation(DB, {
      operation: 'background-removal', creatorId: OWNER, targetAssetId: 'asset_target',
    });
    expect(a.ok).toBe(false); expect(b.ok).toBe(false);
    if (!a.ok && !b.ok) expect(a.messageAr).toBe(b.messageAr);
  });

  it("the SECOND input's ownership is checked too", async () => {
    mockStateOf.mockReturnValue({ ...open, nameAr: 'صورة ناطقة' });
    mockGetVaultAsset.mockImplementation((_db: unknown, id: string) =>
      id === 'asset_target' ? asset() : asset({ assetId: 'asset_second', subscriberTenantId: 'thief', capabilityTarget: 'AUDIO' }));
    const r = await runCreativeOperation(DB, {
      operation: 'talking-photo', creatorId: OWNER, targetAssetId: 'asset_target',
      secondAssetId: 'asset_second', durationSeconds: 5,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.rejection).toBe('not-found');
    expect(mockTalking).not.toHaveBeenCalled();
  });
});

describe('3 · each operation takes the family it needs, and refuses another', () => {
  beforeEach(() => mockStateOf.mockReturnValue(open));

  it('background removal refuses a clip', async () => {
    mockGetVaultAsset.mockReturnValue(asset({ capabilityTarget: 'MOTION' }));
    const r = await runCreativeOperation(DB, {
      operation: 'background-removal', creatorId: OWNER, targetAssetId: 'asset_target',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.rejection).toBe('wrong-family');
  });

  it('lip sync needs a CLIP as its target, not a photograph', async () => {
    mockStateOf.mockReturnValue({ ...open, nameAr: 'مزامنة الشفاه' });
    mockGetVaultAsset.mockReturnValue(asset({ capabilityTarget: 'VISUAL' }));
    const r = await runCreativeOperation(DB, {
      operation: 'lip-sync', creatorId: OWNER, targetAssetId: 'asset_target',
      secondAssetId: 'a2', durationSeconds: 5,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.rejection).toBe('wrong-family');
  });

  it('talking photo needs an AUDIO second input', async () => {
    mockStateOf.mockReturnValue({ ...open, nameAr: 'صورة ناطقة' });
    mockGetVaultAsset.mockImplementation((_db: unknown, id: string) =>
      id === 'asset_target' ? asset() : asset({ assetId: 'a2', capabilityTarget: 'VISUAL' }));
    const r = await runCreativeOperation(DB, {
      operation: 'talking-photo', creatorId: OWNER, targetAssetId: 'asset_target',
      secondAssetId: 'a2', durationSeconds: 5,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.rejection).toBe('wrong-family');
  });

  it('an operation that needs two inputs refuses to run with one', async () => {
    mockStateOf.mockReturnValue({ ...open, nameAr: 'مزامنة الشفاه' });
    mockGetVaultAsset.mockReturnValue(asset({ capabilityTarget: 'MOTION' }));
    const r = await runCreativeOperation(DB, {
      operation: 'lip-sync', creatorId: OWNER, targetAssetId: 'asset_target', durationSeconds: 5,
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.rejection).toBe('wrong-family');
  });

  it('an asset that forbids derivation is refused', async () => {
    // `derivation` must be present: an asset with none is LEGACY, and the
    // constitution lets a legacy asset through the derivability check by
    // design. Omitting it would have tested the legacy escape, not the rule.
    mockGetVaultAsset.mockReturnValue(asset({
      derivation: 'GENERATED', derivationPermission: 'FORBIDDEN',
    }));
    const r = await runCreativeOperation(DB, {
      operation: 'background-removal', creatorId: OWNER, targetAssetId: 'asset_target',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.rejection).toBe('not-derivable');
  });

  it('a duration is demanded where the provider demands one', async () => {
    mockStateOf.mockReturnValue({ ...open, nameAr: 'مزامنة الشفاه' });
    mockGetVaultAsset.mockImplementation((_db: unknown, id: string) =>
      id === 'asset_target' ? asset({ capabilityTarget: 'MOTION' }) : asset({ capabilityTarget: 'AUDIO' }));
    const r = await runCreativeOperation(DB, {
      operation: 'lip-sync', creatorId: OWNER, targetAssetId: 'asset_target', secondAssetId: 'a2',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.rejection).toBe('duration-required');
  });

  it('and background removal needs none, because the provider asks for none', async () => {
    mockGetVaultAsset.mockReturnValue(asset());
    mockRemoveBg.mockResolvedValue({
      bytes: Buffer.from([9, 9]), mimeType: 'image/png', creditsCharged: 4,
      providerId: 'magic-hour-background-remover', providerJobId: 'j1',
    });
    mockDeriveAsset.mockResolvedValue({
      ok: true, asset: { assetId: 'asset_out', secureStorageUri: '/uploads/out.png' },
    });
    const r = await runCreativeOperation(DB, {
      operation: 'background-removal', creatorId: OWNER, targetAssetId: 'asset_target',
    });
    expect(r.ok).toBe(true);
  });
});

describe('4 · the original asset is preserved, and the output earns its place', () => {
  beforeEach(() => {
    mockStateOf.mockReturnValue(open);
    mockGetVaultAsset.mockReturnValue(asset());
    mockRemoveBg.mockResolvedValue({
      bytes: Buffer.from([7, 7, 7]), mimeType: 'image/png', creditsCharged: 4,
      providerId: 'magic-hour-background-remover', providerJobId: 'job-7',
    });
  });

  it('nothing writes to or deletes the parent', async () => {
    mockDeriveAsset.mockResolvedValue({ ok: true, asset: { assetId: 'asset_out', secureStorageUri: '/u/o.png' } });
    await runCreativeOperation(DB, {
      operation: 'background-removal', creatorId: OWNER, targetAssetId: 'asset_target',
    });
    const src = require('fs').readFileSync(
      require('path').join(process.cwd(), 'src/vault/creative-operation-runner.ts'), 'utf8');
    expect(src).not.toMatch(/writeFile|unlink|rm\(|deleteVaultAsset|UPDATE |DELETE /);
  });

  it('the lineage is recorded through deriveAsset, with the parent and its bytes', async () => {
    mockDeriveAsset.mockResolvedValue({ ok: true, asset: { assetId: 'asset_out', secureStorageUri: '/u/o.png' } });
    await runCreativeOperation(DB, {
      operation: 'background-removal', creatorId: OWNER, targetAssetId: 'asset_target',
    });
    const call = mockDeriveAsset.mock.calls[0][0];
    expect(call.parentAssetId).toBe('asset_target');
    expect(call.ownerId).toBe(OWNER);
    expect(Buffer.isBuffer(call.parentBytes)).toBe(true);
    expect(Buffer.isBuffer(call.outputBytes)).toBe(true);
    expect(call.chamber).toBe('QIYAMAH');
  });

  it('the provider binding is recorded as provenance — never as asset identity', async () => {
    mockDeriveAsset.mockResolvedValue({ ok: true, asset: { assetId: 'asset_out', secureStorageUri: '/u/o.png' } });
    const r = await runCreativeOperation(DB, {
      operation: 'background-removal', creatorId: OWNER, targetAssetId: 'asset_target',
    });
    const call = mockDeriveAsset.mock.calls[0][0];
    expect(call.providerProvenance.providerJobId).toBe('job-7');
    expect(call.providerProvenance.creditsCharged).toBe(4);
    // And the asset id is the VAULT'S, not the provider's job id.
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.assetId).toBe('asset_out');
      expect(r.assetId).not.toBe('job-7');
    }
  });

  it('an output identical to its parent is refused, and reported as such', async () => {
    mockDeriveAsset.mockResolvedValue({ ok: false, rejection: 'OUTPUT_IDENTICAL_TO_PARENT' });
    const r = await runCreativeOperation(DB, {
      operation: 'background-removal', creatorId: OWNER, targetAssetId: 'asset_target',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.rejection).toBe('output-rejected');
      expect(r.messageAr).toContain('OUTPUT_IDENTICAL_TO_PARENT');
    }
  });

  it('a background removal is deposited as a PNG — JPEG has no alpha', () => {
    expect(CREATIVE_INPUT_SHAPE['background-removal'].outputExtension).toBe('.png');
  });

  it('the runner never mints an asset id or a URL of its own', () => {
    const src = require('fs').readFileSync(
      require('path').join(process.cwd(), 'src/vault/creative-operation-runner.ts'), 'utf8');
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(code).not.toMatch(/Date\.now\(\)/);
    expect(code).not.toMatch(/Math\.random\(\)/);
    expect(code).not.toMatch(/https?:\/\//);
  });
});

describe('5 · failures are told apart, and none becomes a success', () => {
  beforeEach(() => {
    mockStateOf.mockReturnValue(open);
    mockGetVaultAsset.mockReturnValue(asset());
  });

  it('unreadable bytes are reported without echoing a storage path', async () => {
    mockReadFile.mockRejectedValue(new Error('ENOENT /var/www/azma-uploads/a.png'));
    const r = await runCreativeOperation(DB, {
      operation: 'background-removal', creatorId: OWNER, targetAssetId: 'asset_target',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) {
      expect(r.rejection).toBe('source-unreadable');
      expect(r.messageAr).not.toMatch(/var|uploads|ENOENT/);
      expect(r.detailEn).not.toMatch(/var\/www/);
    }
  });

  it("the Empire's own lack of credit is not blamed on the Creator's asset", async () => {
    const { ImageEditError } = jest.requireActual(
      '../../core/sovereign-ai-integration/adapters/magic-hour-image-editing');
    mockRemoveBg.mockRejectedValue(new ImageEditError('NO_CREDIT', 'none left'));
    const r = await runCreativeOperation(DB, {
      operation: 'background-removal', creatorId: OWNER, targetAssetId: 'asset_target',
    });
    expect(r.ok).toBe(false);
    if (!r.ok) expect(r.messageAr).toMatch(/ليست المشكلةُ في أصلك/);
  });

  it('no provider name reaches the Creator in any refusal', async () => {
    const { ImageEditError } = jest.requireActual(
      '../../core/sovereign-ai-integration/adapters/magic-hour-image-editing');
    for (const rejection of ['SUBMIT_FAILED', 'RENDER_FAILED', 'TIMED_OUT', 'NO_OUTPUT']) {
      mockRemoveBg.mockRejectedValue(new ImageEditError(rejection as never, 'engine words'));
      const r = await runCreativeOperation(DB, {
        operation: 'background-removal', creatorId: OWNER, targetAssetId: 'asset_target',
      });
      expect(r.ok).toBe(false);
      if (!r.ok) {
        expect(r.messageAr).not.toMatch(/magic.?hour|engine words|HTTP/i);
      }
    }
  });

  it('a refusal never carries an assetId', async () => {
    mockReadFile.mockRejectedValue(new Error('gone'));
    const r = await runCreativeOperation(DB, {
      operation: 'background-removal', creatorId: OWNER, targetAssetId: 'asset_target',
    });
    expect(Object.keys(r)).not.toContain('assetId');
  });
});
