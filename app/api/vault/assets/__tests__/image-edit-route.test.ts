/**
 * AZMA OS — Phase D closure: the sovereign image-editing path, end to end.
 *
 * ─── WHAT THIS PROVES, AND WHAT IT DOES NOT ─────────────────────────────────
 *
 *   PROVES: the whole sequence — session, ownership, derivability, reading the
 *   parent's bytes, calling the engine, writing the result, refusing a result
 *   identical to the parent, removing the orphan when it refuses, and
 *   depositing a real derived asset with a correct lineage through the Vault
 *   contract.
 *
 *   DOES NOT PROVE: that the engine changes pixels. The engine is mocked here.
 *   That claim rests on a live call against a real production asset, recorded
 *   in the Phase D report and in the engine module's own header:
 *
 *     source 1,960,954 bytes  sha256 0ab57f32f4389268…
 *     result 1,804,819 bytes  sha256 144445c76165cea3…
 *
 *   The mock returns DIFFERENT bytes than it is given, because that is what the
 *   real engine did. A mock that echoed its input would be testing a fiction.
 */

import { POST } from '../[assetId]/edit/route';
import { NextRequest } from 'next/server';
import { mkdtempSync, writeFileSync, existsSync, readdirSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const OWNER = 'creator-alpha';
const OTHER = 'creator-beta';

const PARENT_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 1, 1, 1]);
const EDITED_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 9, 9, 9, 9]);

let uploadsDir: string;

// The engine is mocked; everything else is the real module.
const editMock = jest.fn();
jest.mock('@/src/core/sovereign-ai-integration/adapters/magic-hour-image-editing', () => {
  const actual = jest.requireActual('@/src/core/sovereign-ai-integration/adapters/magic-hour-image-editing');
  return {
    ...actual,
    imageEditingIsConfigured: () => process.env.MAGIC_HOUR_API_KEY !== undefined,
    editImageViaProvider: (...args: unknown[]) => editMock(...args),
  };
});

const sessionMock = jest.fn();
jest.mock('@/src/authentication', () => ({
  verifySession: (...args: unknown[]) => sessionMock(...args),
}));

import { getDb, resetDbSingletonForTests, getVaultAsset, listAssetLineage } from '@/src/persistent-storage';
import { SovereignVaultManager } from '@/src/vault/sovereign-vault-manager';
import { AssetFamily, SourceChamber, DerivationPermission } from '@/src/vault/sovereign-vault-types';
import { CapabilityTarget } from '@/src/core/sovereign-orchestrator/qiyamah-intent-types';

function call(assetId: string, body: unknown) {
  const request = new NextRequest(`http://localhost/api/vault/assets/${assetId}/edit`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Cookie: 'azma_session=s1' },
    body: JSON.stringify(body),
  });
  return POST(request, { params: Promise.resolve({ assetId }) });
}

async function seedParent(overrides: Record<string, unknown> = {}) {
  const asset = await new SovereignVaultManager().depositAsset({
    operationId: 'op-parent',
    subscriberTenantId: OWNER,
    capabilityTarget: CapabilityTarget.VISUAL,
    assetFamily: AssetFamily.MEDIA,
    secureStorageUri: '/uploads/parent-image.png',
    metadata: {},
    creationChamber: SourceChamber.QIYAMAH,
    ...overrides,
  } as Parameters<SovereignVaultManager['depositAsset']>[0]);
  // The bytes the route will read.
  writeFileSync(join(uploadsDir, 'parent-image.png'), PARENT_BYTES);
  return asset;
}

beforeEach(() => {
  uploadsDir = mkdtempSync(join(tmpdir(), 'azma-edit-'));
  process.env.UPLOADS_DIR = uploadsDir;
  process.env.MAGIC_HOUR_API_KEY = 'test-credential';
  process.env.AZMA_DB_PATH = ':memory:';
  resetDbSingletonForTests();

  editMock.mockReset();
  editMock.mockResolvedValue({ bytes: EDITED_BYTES, mimeType: 'image/png', creditsCharged: 50 });
  sessionMock.mockReset();
  sessionMock.mockReturnValue({ creatorId: OWNER });
});

afterEach(() => { resetDbSingletonForTests(); });

describe('Phase D closure — the sovereign edit path', () => {
  it('produces a derived asset with a correct lineage', async () => {
    const parent = await seedParent();
    const response = await call(parent.assetId, { instruction: 'غيّر الخلفية إلى رفوف مكتبة' });
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(payload.status).toBe('succeeded');
    expect(payload.asset.parentAssetId).toBe(parent.assetId);
    expect(payload.asset.rootAssetId).toBe(parent.rootAssetId);
    expect(payload.asset.version).toBe(2);
    expect(payload.asset.creationChamber).toBe(SourceChamber.QIYAMAH);
    expect(payload.asset.subscriberTenantId).toBe(OWNER);
  });

  it('passes the Creator’s Arabic instruction to the engine unchanged', async () => {
    const parent = await seedParent();
    await call(parent.assetId, { instruction: 'أزل الشخص من الخلفية' });

    expect(editMock).toHaveBeenCalledTimes(1);
    const [bytes, ext, instruction] = editMock.mock.calls[0];
    expect(Buffer.from(bytes as Buffer).equals(PARENT_BYTES)).toBe(true);
    expect(ext).toBe('.png');
    expect(instruction).toBe('أزل الشخص من الخلفية');
  });

  it('writes the produced bytes as an independent file', async () => {
    const parent = await seedParent();
    const payload = await (await call(parent.assetId, { instruction: 'x' })).json();

    const written = payload.asset.secureStorageUri.replace('/uploads/', '');
    expect(existsSync(join(uploadsDir, written))).toBe(true);
    expect(payload.asset.secureStorageUri).not.toBe(parent.secureStorageUri);
  });

  it('deposits into the Vault — the result is a real, retrievable asset', async () => {
    const parent = await seedParent();
    const payload = await (await call(parent.assetId, { instruction: 'x' })).json();

    const stored = getVaultAsset(getDb(), payload.asset.assetId);
    expect(stored).not.toBeNull();
    expect(stored!.assetFamily).toBe(AssetFamily.MEDIA);
    expect(stored!.capabilityTarget).toBe(CapabilityTarget.VISUAL);
    // Usable downstream: Ras Al Amr may place it, and it may be edited again.
    expect(stored!.derivationPermission).toBe(DerivationPermission.ALLOWED);
  });

  it('keeps the parent intact and shows both in the lineage', async () => {
    const parent = await seedParent();
    const payload = await (await call(parent.assetId, { instruction: 'x' })).json();

    expect(getVaultAsset(getDb(), parent.assetId)).not.toBeNull();
    const lineage = listAssetLineage(getDb(), parent.assetId, OWNER);
    expect(lineage.map((a) => a.assetId)).toEqual([parent.assetId, payload.asset.assetId]);
  });

  it('records both content digests, proving the result is not its parent', async () => {
    const parent = await seedParent();
    const payload = await (await call(parent.assetId, { instruction: 'x' })).json();

    const md = payload.asset.metadata;
    expect(md.parentContentDigest).not.toBe(md.contentDigest);
    expect(md.derivedFromAssetId).toBe(parent.assetId);
    expect(md.mutationInstructionAr).toBe('x');
  });

  it('returns the sovereign asset, never a raw storage path as the answer', async () => {
    const parent = await seedParent();
    const payload = await (await call(parent.assetId, { instruction: 'x' })).json();
    expect(payload.asset.assetId).toBeTruthy();
    expect(payload.lineage.version).toBe(2);
  });

  it('a second edit builds a third version on the same root', async () => {
    const parent = await seedParent();
    const first = await (await call(parent.assetId, { instruction: 'x' })).json();

    // Write the derived file so the next edit can read it, and produce new bytes.
    const derivedName = first.asset.secureStorageUri.replace('/uploads/', '');
    writeFileSync(join(uploadsDir, derivedName), EDITED_BYTES);
    editMock.mockResolvedValue({
      bytes: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 5, 5, 5, 5]),
      mimeType: 'image/png', creditsCharged: 50,
    });

    const second = await (await call(first.asset.assetId, { instruction: 'y' })).json();
    expect(second.asset.version).toBe(3);
    expect(second.asset.rootAssetId).toBe(parent.assetId);
  });
});

describe('Phase D closure — THE ANTI-REPLAY GUARD, and no orphan file', () => {
  it('REFUSES when the engine returns the parent’s own bytes', async () => {
    const parent = await seedParent();
    editMock.mockResolvedValue({ bytes: PARENT_BYTES, mimeType: 'image/png', creditsCharged: 50 });

    const response = await call(parent.assetId, { instruction: 'x' });
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.reason).toBe('OUTPUT_IDENTICAL_TO_PARENT');
    expect(payload.message).toMatch(/لم يتغيّر/);
  });

  it('LEAVES NO ORPHAN FILE when it refuses', async () => {
    const parent = await seedParent();
    editMock.mockResolvedValue({ bytes: PARENT_BYTES, mimeType: 'image/png', creditsCharged: 50 });

    await call(parent.assetId, { instruction: 'x' });

    // Only the parent's own file remains — the result written a moment before
    // the refusal has been removed.
    const files = readdirSync(uploadsDir).filter((f) => f !== 'generated-assets');
    expect(files).toEqual(['parent-image.png']);
  });

  it('creates NO asset when it refuses', async () => {
    const parent = await seedParent();
    editMock.mockResolvedValue({ bytes: PARENT_BYTES, mimeType: 'image/png', creditsCharged: 50 });

    const before = (getDb().prepare('SELECT COUNT(*) AS n FROM vault_assets').get() as unknown as { n: number }).n;
    await call(parent.assetId, { instruction: 'x' });
    const after = (getDb().prepare('SELECT COUNT(*) AS n FROM vault_assets').get() as unknown as { n: number }).n;

    expect(after).toBe(before);
    expect(listAssetLineage(getDb(), parent.assetId, OWNER)).toHaveLength(1);
  });
});

describe('Phase D closure — every refusal Article 4 requires', () => {
  it('refuses without a session', async () => {
    sessionMock.mockReturnValue(null);
    const response = await call('any-asset', { instruction: 'x' });
    expect(response.status).toBe(401);
  });

  it('refuses an asset that does not exist', async () => {
    const response = await call('no-such-asset', { instruction: 'x' });
    expect(response.status).toBe(404);
  });

  it('refuses an asset owned by ANOTHER Creator — as not-found, so ownership cannot be probed', async () => {
    const theirs = await seedParent({ subscriberTenantId: OTHER });
    const response = await call(theirs.assetId, { instruction: 'x' });

    expect(response.status).toBe(404);
    expect(editMock).not.toHaveBeenCalled();
  });

  it('refuses a deleted asset', async () => {
    const parent = await seedParent();
    getDb().prepare('DELETE FROM vault_assets WHERE asset_id = ?').run(parent.assetId);

    const response = await call(parent.assetId, { instruction: 'x' });
    expect(response.status).toBe(404);
  });

  it('refuses a legacy asset before adoption', async () => {
    getDb().prepare(
      `INSERT INTO vault_assets (asset_id, subscriber_tenant_id, originating_operation_id, capability_target, asset_family, secure_storage_uri, metadata, created_at, updated_at)
       VALUES ('legacy-1', ?, 'op', 'VISUAL', 'MEDIA', '/uploads/legacy-1.png', '{}', 1, 1)`,
    ).run(OWNER);

    const response = await call('legacy-1', { instruction: 'x' });
    const payload = await response.json();

    expect(response.status).toBe(409);
    expect(payload.reason).toBe('requires-adoption');
    expect(editMock).not.toHaveBeenCalled();
  });

  it('refuses an asset whose derivation right was withheld', async () => {
    const parent = await seedParent();
    getDb().prepare('UPDATE vault_assets SET derivation_permission = ? WHERE asset_id = ?')
      .run(DerivationPermission.REQUIRES_ADOPTION, parent.assetId);

    const response = await call(parent.assetId, { instruction: 'x' });
    expect(response.status).toBe(409);
  });

  it('refuses an asset that is not an image', async () => {
    const parent = await seedParent({
      capabilityTarget: CapabilityTarget.AUDIO,
      secureStorageUri: '/uploads/voice.mp3',
    });
    const response = await call(parent.assetId, { instruction: 'x' });
    const payload = await response.json();

    expect(response.status).toBe(400);
    expect(payload.reason).toBe('not-an-image');
  });

  it('refuses an empty instruction', async () => {
    const parent = await seedParent();
    const response = await call(parent.assetId, { instruction: '   ' });
    expect(response.status).toBe(400);
    expect(editMock).not.toHaveBeenCalled();
  });

  it('refuses an over-long instruction', async () => {
    const parent = await seedParent();
    const response = await call(parent.assetId, { instruction: 'x'.repeat(1001) });
    expect(response.status).toBe(400);
  });

  it('refuses when the engine has no credential — the ability is not offered blind', async () => {
    delete process.env.MAGIC_HOUR_API_KEY;
    const parent = await seedParent();
    const response = await call(parent.assetId, { instruction: 'x' });
    expect(response.status).toBe(503);
  });

  it('refuses when the source bytes cannot be read, without echoing a path', async () => {
    const parent = await seedParent({ secureStorageUri: '/uploads/missing-file.png' });
    const response = await call(parent.assetId, { instruction: 'x' });
    const payload = await response.json();

    expect(response.status).toBe(500);
    expect(JSON.stringify(payload)).not.toContain('/uploads/');
    expect(JSON.stringify(payload)).not.toContain(uploadsDir);
  });

  it('refuses an asset held somewhere this route cannot read', async () => {
    const parent = await seedParent({ secureStorageUri: 'provider://elevenlabs/voice-1' });
    const response = await call(parent.assetId, { instruction: 'x' });
    expect(response.status).toBe(400);
  });

  it('reports an engine failure honestly, and creates nothing', async () => {
    const parent = await seedParent();
    editMock.mockRejectedValue(new Error('engine exploded'));

    const before = (getDb().prepare('SELECT COUNT(*) AS n FROM vault_assets').get() as unknown as { n: number }).n;
    const response = await call(parent.assetId, { instruction: 'x' });
    const payload = await response.json();
    const after = (getDb().prepare('SELECT COUNT(*) AS n FROM vault_assets').get() as unknown as { n: number }).n;

    expect(response.status).toBe(502);
    expect(after).toBe(before);
    // The engine's own words never cross to the Creator.
    expect(JSON.stringify(payload)).not.toContain('exploded');
    expect(JSON.stringify(payload)).not.toMatch(/magic|hour|openai/i);
  });

  it('never names the engine in any refusal', async () => {
    const parent = await seedParent();
    for (const setup of [
      () => { editMock.mockResolvedValue({ bytes: PARENT_BYTES, mimeType: 'image/png', creditsCharged: 0 }); },
      () => { editMock.mockRejectedValue(new Error('x')); },
    ]) {
      setup();
      const payload = await (await call(parent.assetId, { instruction: 'x' })).json();
      expect(JSON.stringify(payload)).not.toMatch(/magichour|magic-hour|openai|gemini|provider/i);
    }
  });
});
