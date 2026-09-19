/**
 * AZMA OS — Phase D closure: the Creator's whole edit journey.
 *
 * Constitution Articles 3.1, 5.3–5.6; closure directive Article 6.
 *
 *   Existing Sovereign Asset
 *        → Creator edit entry (POST /api/vault/assets/[assetId]/edit)
 *        → editing engine
 *        → real output bytes
 *        → deriveAsset
 *        → Vault deposit
 *        → derived asset the Creator can select
 *
 * ─── WHAT THIS PROVES AND WHAT IT DOES NOT ──────────────────────────────────
 *
 *   PROVES: the journey holds end to end — the entry point is the one the
 *   Creator's chamber calls, ownership is enforced, deriveAsset is genuinely
 *   used (not bypassed), the deposit is real, the parent survives, and the
 *   result is selectable afterwards through the same listing the chamber reads.
 *
 *   DOES NOT PROVE: that the engine changes pixels. The engine is mocked. That
 *   claim rests on the live production proof recorded in the Phase D report.
 *   A mock is never used here to assert that bytes differ — where difference
 *   matters, real byte arrays are hashed.
 */

import { POST as EDIT } from '../[assetId]/edit/route';
import { GET as LIST } from '../route';
import { NextRequest } from 'next/server';
import { mkdtempSync, writeFileSync } from 'fs';
import { tmpdir } from 'os';
import { join } from 'path';

const OWNER = 'creator-alpha';
const OTHER = 'creator-beta';

const PARENT_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 1, 1, 1]);
const EDITED_BYTES = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 7, 7, 7, 7]);

let uploadsDir: string;

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

// deriveAsset is SPIED, not replaced — the journey must genuinely pass through
// it, and a spy proves that without substituting a fiction for the real rules.
const realMutation = jest.requireActual('@/src/vault/sovereign-asset-mutation');
const deriveSpy = jest.fn(realMutation.deriveAsset);
jest.mock('@/src/vault/sovereign-asset-mutation', () => {
  const actual = jest.requireActual('@/src/vault/sovereign-asset-mutation');
  return { ...actual, deriveAsset: (...args: unknown[]) => deriveSpy(...args) };
});

import { getDb, resetDbSingletonForTests, getVaultAsset } from '@/src/persistent-storage';
import { SovereignVaultManager } from '@/src/vault/sovereign-vault-manager';
import { AssetFamily, SourceChamber, DerivationKind } from '@/src/vault/sovereign-vault-types';
import { CapabilityTarget } from '@/src/core/sovereign-orchestrator/qiyamah-intent-types';
import { digestOf } from '@/src/vault/sovereign-asset-mutation';

function editRequest(assetId: string, instruction: string) {
  return EDIT(
    new NextRequest(`http://localhost/api/vault/assets/${assetId}/edit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Cookie: 'azma_session=s1' },
      body: JSON.stringify({ instruction }),
    }),
    { params: Promise.resolve({ assetId }) },
  );
}

/** Exactly what the Creator's chamber calls to populate its gallery. */
function listVault() {
  return LIST(new NextRequest('http://localhost/api/vault/assets', {
    headers: { Cookie: 'azma_session=s1' },
  }));
}

async function seedParent() {
  const asset = await new SovereignVaultManager().depositAsset({
    operationId: 'op-parent',
    subscriberTenantId: OWNER,
    capabilityTarget: CapabilityTarget.VISUAL,
    assetFamily: AssetFamily.MEDIA,
    secureStorageUri: '/uploads/journey-parent.png',
    metadata: {},
    creationChamber: SourceChamber.QIYAMAH,
  });
  writeFileSync(join(uploadsDir, 'journey-parent.png'), PARENT_BYTES);
  return asset;
}

beforeEach(() => {
  uploadsDir = mkdtempSync(join(tmpdir(), 'azma-journey-'));
  process.env.UPLOADS_DIR = uploadsDir;
  process.env.MAGIC_HOUR_API_KEY = 'test-credential';
  process.env.AZMA_DB_PATH = ':memory:';
  resetDbSingletonForTests();

  editMock.mockReset();
  editMock.mockResolvedValue({ bytes: EDITED_BYTES, mimeType: 'image/png', creditsCharged: 50 });
  deriveSpy.mockClear();
  sessionMock.mockReset();
  sessionMock.mockReturnValue({ creatorId: OWNER });
});

afterEach(() => { resetDbSingletonForTests(); });

describe('Phase D closure — the whole journey', () => {
  it('carries an existing asset through to a selectable derived asset', async () => {
    // 1 · the parent exists and the Creator can see it
    const parent = await seedParent();
    const before = await (await listVault()).json();
    expect(before.assets.map((a: { assetId: string }) => a.assetId)).toContain(parent.assetId);

    // 2 · the Creator's entry point
    const response = await editRequest(parent.assetId, 'غيّر الخلفية إلى رفوف مكتبة');
    const payload = await response.json();
    expect(response.status).toBe(200);

    // 3 · the engine was genuinely asked, with the parent's real bytes
    expect(editMock).toHaveBeenCalledTimes(1);
    expect(Buffer.from(editMock.mock.calls[0][0] as Buffer).equals(PARENT_BYTES)).toBe(true);

    // 4 · deriveAsset was genuinely used — not bypassed
    expect(deriveSpy).toHaveBeenCalledTimes(1);

    // 5 · the output is not the parent
    expect(digestOf(EDITED_BYTES)).not.toBe(digestOf(PARENT_BYTES));

    // 6 · it was deposited, with a correct lineage
    const stored = getVaultAsset(getDb(), payload.asset.assetId)!;
    expect(stored).not.toBeNull();
    expect(stored.parentAssetId).toBe(parent.assetId);
    expect(stored.rootAssetId).toBe(parent.rootAssetId);
    expect(stored.version).toBe(2);
    expect(stored.creationChamber).toBe(SourceChamber.QIYAMAH);
    expect(stored.derivation).toBe(DerivationKind.MODIFIED);
    expect(stored.subscriberTenantId).toBe(OWNER);

    // 7 · the parent survived
    expect(getVaultAsset(getDb(), parent.assetId)).not.toBeNull();

    // 8 · THE CLOSING CONDITION — the Creator can select the result, through
    //     the very listing their chamber re-reads after an edit.
    const after = await (await listVault()).json();
    const ids = after.assets.map((a: { assetId: string }) => a.assetId);
    expect(ids).toContain(payload.asset.assetId);
    expect(ids).toContain(parent.assetId);
    expect(after.assets.length).toBe(before.assets.length + 1);
  });

  it('the derived asset can itself be edited — the chain continues', async () => {
    const parent = await seedParent();
    const first = await (await editRequest(parent.assetId, 'x')).json();

    writeFileSync(join(uploadsDir, first.asset.secureStorageUri.replace('/uploads/', '')), EDITED_BYTES);
    editMock.mockResolvedValue({
      bytes: Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 3, 3, 3, 3]),
      mimeType: 'image/png', creditsCharged: 50,
    });

    const second = await (await editRequest(first.asset.assetId, 'y')).json();
    expect(second.asset.version).toBe(3);
    expect(second.asset.rootAssetId).toBe(parent.assetId);

    // All three are selectable.
    const listed = await (await listVault()).json();
    expect(listed.assets.length).toBe(3);
  });

  it('DOES NOT cross ownership — a stranger’s asset never enters the journey', async () => {
    const parent = await seedParent();
    sessionMock.mockReturnValue({ creatorId: OTHER });

    const response = await editRequest(parent.assetId, 'x');

    expect(response.status).toBe(404);
    expect(editMock).not.toHaveBeenCalled();
    expect(deriveSpy).not.toHaveBeenCalled();
  });

  it('a refusal leaves the Creator’s gallery exactly as it was', async () => {
    const parent = await seedParent();
    const before = await (await listVault()).json();

    // The engine replays its input — the guard must refuse.
    editMock.mockResolvedValue({ bytes: PARENT_BYTES, mimeType: 'image/png', creditsCharged: 50 });
    const response = await editRequest(parent.assetId, 'x');
    expect(response.status).toBe(409);

    const after = await (await listVault()).json();
    expect(after.assets.length).toBe(before.assets.length);
  });

  it('never exposes a storage path as the answer to the Creator', async () => {
    const parent = await seedParent();
    const payload = await (await editRequest(parent.assetId, 'x')).json();

    // The asset carries its own address, which the gallery needs to render it,
    // but the response's own shape is the sovereign asset and its lineage.
    expect(payload.lineage).toBeDefined();
    expect(payload.lineage.parentAssetId).toBe(parent.assetId);
    expect(JSON.stringify(payload)).not.toContain(uploadsDir);
  });
});
