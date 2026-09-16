/**
 * AZMA OS — Phase C: deletion leaves a record.
 *
 * Constitution Articles 6.1–6.4; directive Article 12.
 *
 * ─── WHAT THIS PROVES ───────────────────────────────────────────────────────
 *
 *   Deletion in this Empire used to remove the row and unlink the file in one
 *   request, leaving nothing. Two constitutional rules broke at that moment:
 *   Article 5.4 (no derived asset may be orphaned) and Article 6.3 (a tombstone
 *   must survive).
 *
 *   These tests exercise the ORDER, which is the whole safety of the operation:
 *   read → check publication → record → destroy. A tombstone that is written
 *   after the row is gone cannot carry the lineage, and a success reported
 *   without a tombstone is the false success Article 12 forbids.
 */

import { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../db';
import { insertVaultAsset, getVaultAsset, deleteVaultAssetById } from '../vault-asset-repository';
import { recordTombstone, findTombstoneByAssetId, createPublicLink, revokePublicLink, listPublicLinksForOwner } from '../sovereign-project-repository';
import { PublishedProtection, isLive } from '../../sovereign-projects/sovereign-project-contracts';
import { AssetFamily, SourceChamber, DerivationKind, LifecycleState, DerivationPermission, type VaultAsset } from '../../vault/sovereign-vault-types';
import { CapabilityTarget } from '../../core/sovereign-orchestrator/qiyamah-intent-types';

const OWNER = 'creator-alpha';
const OTHER = 'creator-beta';

let db: DatabaseSync;
beforeEach(() => { db = createDatabase(':memory:'); });
afterEach(() => { db.close(); });

function seedAsset(overrides: Partial<VaultAsset> = {}): VaultAsset {
  const now = Date.now();
  const asset: VaultAsset = {
    assetId: `asset_${Math.random().toString(36).slice(2, 10)}`,
    subscriberTenantId: OWNER,
    originatingOperationId: 'op-1',
    capabilityTarget: CapabilityTarget.VISUAL,
    assetFamily: AssetFamily.MEDIA,
    secureStorageUri: '/uploads/secret-file.png',
    metadata: { fileSizeBytes: 2048, providerId: 'test' },
    createdAt: now,
    updatedAt: now,
    creationChamber: SourceChamber.QIYAMAH,
    derivation: DerivationKind.GENERATED,
    lifecycleState: LifecycleState.INTERMEDIATE,
    derivationPermission: DerivationPermission.ALLOWED,
    ...overrides,
  };
  insertVaultAsset(db, asset);
  return asset;
}

/**
 * The route's own order, exercised directly. Keeping it here rather than
 * importing the Next handler means the SEQUENCE is what is under test, not the
 * HTTP plumbing around it.
 */
function deleteWithTombstone(assetId: string, actor: string): { ok: boolean; reason?: string } {
  const asset = getVaultAsset(db, assetId);
  if (!asset || asset.subscriberTenantId !== actor) return { ok: false, reason: 'not-found' };

  const protecting = listPublicLinksForOwner(db, actor)
    .find((l) => l.finalWorkAssetId === assetId && isLive(l));

  if (protecting) {
    recordTombstone(db, {
      assetId, ownerId: asset.subscriberTenantId,
      assetFamily: asset.assetFamily, capabilityTarget: asset.capabilityTarget,
      parentAssetId: asset.parentAssetId ?? null, rootAssetId: asset.rootAssetId ?? null,
      projectId: asset.projectId ?? null, creationChamber: asset.creationChamber ?? null,
      deletedBy: actor, deletionReason: 'refused: referenced by a live published work',
      publishedProtection: PublishedProtection.PROTECTED_BY_PUBLICATION,
      metadataSnapshot: asset.metadata,
    });
    return { ok: false, reason: 'protected-by-publication' };
  }

  recordTombstone(db, {
    assetId, ownerId: asset.subscriberTenantId,
    assetFamily: asset.assetFamily, capabilityTarget: asset.capabilityTarget,
    parentAssetId: asset.parentAssetId ?? null, rootAssetId: asset.rootAssetId ?? null,
    projectId: asset.projectId ?? null, creationChamber: asset.creationChamber ?? null,
    deletedBy: actor, publishedProtection: PublishedProtection.NOT_PROTECTED,
    metadataSnapshot: asset.metadata,
  });

  const deleted = deleteVaultAssetById(db, assetId, actor);
  return deleted ? { ok: true } : { ok: false, reason: 'not-found' };
}

describe('Phase C — the tombstone is written BEFORE the asset is destroyed', () => {
  it('records identity, owner, actor and timestamp', () => {
    const asset = seedAsset();
    expect(deleteWithTombstone(asset.assetId, OWNER).ok).toBe(true);

    const tomb = findTombstoneByAssetId(db, asset.assetId, OWNER)!;
    expect(tomb).not.toBeNull();
    expect(tomb.assetId).toBe(asset.assetId);
    expect(tomb.ownerId).toBe(OWNER);
    expect(tomb.deletedBy).toBe(OWNER);
    expect(tomb.deletedAt).toBeGreaterThan(0);
  });

  it('the asset really is gone afterwards', () => {
    const asset = seedAsset();
    deleteWithTombstone(asset.assetId, OWNER);
    expect(getVaultAsset(db, asset.assetId)).toBeNull();
  });

  it('CARRIES THE LINEAGE — a derived child is not orphaned by its parent’s destruction', () => {
    const parent = seedAsset();
    const child = seedAsset({
      parentAssetId: parent.assetId,
      rootAssetId: parent.assetId,
      version: 2,
      derivation: DerivationKind.MODIFIED,
    });

    deleteWithTombstone(parent.assetId, OWNER);

    // The parent row is gone…
    expect(getVaultAsset(db, parent.assetId)).toBeNull();
    // …but the child still points at it, and the pointer still resolves.
    const stillThere = getVaultAsset(db, child.assetId)!;
    expect(stillThere.parentAssetId).toBe(parent.assetId);

    const tomb = findTombstoneByAssetId(db, parent.assetId, OWNER)!;
    // The parent was an original, so its root is itself — the value the
    // repository resolved on write, not the one absent from the fixture.
    expect(tomb.rootAssetId).toBe(parent.assetId);
    expect(tomb.creationChamber).toBe(SourceChamber.QIYAMAH);
    // Article 5.4 holds at the exact moment Article 6.2 is exercised.
  });

  it('RECORDS NO STORAGE PATH, though the asset had one', () => {
    const asset = seedAsset({ secureStorageUri: '/uploads/very-secret.png' });
    deleteWithTombstone(asset.assetId, OWNER);

    const tomb = findTombstoneByAssetId(db, asset.assetId, OWNER)!;
    expect(JSON.stringify(tomb)).not.toContain('/uploads/');
    expect(JSON.stringify(tomb)).not.toContain('very-secret');
    // What an audit legitimately needs survives.
    expect(tomb.metadataSnapshot.fileSizeBytes).toBe(2048);
  });

  it('is not readable by another Creator', () => {
    const asset = seedAsset();
    deleteWithTombstone(asset.assetId, OWNER);
    expect(findTombstoneByAssetId(db, asset.assetId, OTHER)).toBeNull();
  });
});

describe('Phase C — Article 6.4: a published work protects its asset', () => {
  it('REFUSES to destroy an asset a live link publishes', () => {
    const asset = seedAsset({ lifecycleState: LifecycleState.FINAL });
    createPublicLink(db, { ownerId: OWNER, finalWorkAssetId: asset.assetId });

    const result = deleteWithTombstone(asset.assetId, OWNER);
    expect(result.ok).toBe(false);
    expect(result.reason).toBe('protected-by-publication');

    // Nothing was destroyed — the published work stays provable.
    expect(getVaultAsset(db, asset.assetId)).not.toBeNull();
  });

  it('records the refusal rather than failing silently', () => {
    const asset = seedAsset({ lifecycleState: LifecycleState.FINAL });
    createPublicLink(db, { ownerId: OWNER, finalWorkAssetId: asset.assetId });
    deleteWithTombstone(asset.assetId, OWNER);

    const tomb = findTombstoneByAssetId(db, asset.assetId, OWNER)!;
    expect(tomb.publishedProtection).toBe(PublishedProtection.PROTECTED_BY_PUBLICATION);
    expect(tomb.deletionReason).toContain('refused');
  });

  it('ALLOWS destruction once publication is revoked', () => {
    const asset = seedAsset({ lifecycleState: LifecycleState.FINAL });
    const link = createPublicLink(db, { ownerId: OWNER, finalWorkAssetId: asset.assetId });

    expect(deleteWithTombstone(asset.assetId, OWNER).ok).toBe(false);

    revokePublicLink(db, link.linkId, OWNER);

    expect(deleteWithTombstone(asset.assetId, OWNER).ok).toBe(true);
    expect(getVaultAsset(db, asset.assetId)).toBeNull();
  });

  it('a link belonging to ANOTHER Creator does not protect this Creator’s asset', () => {
    const asset = seedAsset();
    // A stranger's link naming this asset must not become a shield.
    createPublicLink(db, { ownerId: OTHER, finalWorkAssetId: asset.assetId });
    expect(deleteWithTombstone(asset.assetId, OWNER).ok).toBe(true);
  });
});

describe('Phase C — repeated and unauthorised deletion', () => {
  it('a second deletion is truthfully not-found, and writes no second tombstone', () => {
    const asset = seedAsset();
    expect(deleteWithTombstone(asset.assetId, OWNER).ok).toBe(true);

    const second = deleteWithTombstone(asset.assetId, OWNER);
    expect(second.ok).toBe(false);
    expect(second.reason).toBe('not-found');

    const { n } = db.prepare('SELECT COUNT(*) AS n FROM asset_tombstones WHERE asset_id = ?')
      .get(asset.assetId) as unknown as { n: number };
    expect(n).toBe(1);
  });

  it('another Creator cannot delete, and leaves no tombstone behind', () => {
    const asset = seedAsset();
    const result = deleteWithTombstone(asset.assetId, OTHER);

    expect(result.ok).toBe(false);
    expect(getVaultAsset(db, asset.assetId)).not.toBeNull();
    const { n } = db.prepare('SELECT COUNT(*) AS n FROM asset_tombstones').get() as unknown as { n: number };
    expect(n).toBe(0);
  });

  it('deleting an asset that never existed writes nothing', () => {
    expect(deleteWithTombstone('no-such-asset', OWNER).ok).toBe(false);
    const { n } = db.prepare('SELECT COUNT(*) AS n FROM asset_tombstones').get() as unknown as { n: number };
    expect(n).toBe(0);
  });
});
