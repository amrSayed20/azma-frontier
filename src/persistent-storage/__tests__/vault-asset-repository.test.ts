import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../db';
import { insertVaultAsset, getVaultAsset, listVaultAssetsForTenant, linkGoalToVaultAsset } from '../vault-asset-repository';
import { AssetFamily } from '../../vault/sovereign-vault-types';
import { CapabilityTarget } from '../../core/sovereign-orchestrator/qiyamah-intent-types';
import type { VaultAsset } from '../../vault/sovereign-vault-types';

describe('Persistent Storage Foundation — Vault asset metadata', () => {
  let db: DatabaseSync;

  beforeEach(() => {
    db = createDatabase(':memory:');
  });

  afterEach(() => {
    db.close();
  });

  it('durably stores and retrieves a Vault asset, metadata included', () => {
    const asset: VaultAsset = {
      assetId: 'asset-1',
      subscriberTenantId: 'tenant-1',
      originatingOperationId: 'op-1',
      capabilityTarget: CapabilityTarget.VISUAL,
      assetFamily: AssetFamily.MEDIA,
      secureStorageUri: 's3://bucket/asset-1.png',
      metadata: { fileSizeBytes: 1024, providerId: 'test-provider' },
      createdAt: 1_000,
      updatedAt: 1_000,
    };

    insertVaultAsset(db, asset);
    const fetched = getVaultAsset(db, 'asset-1');
    expect(fetched).toEqual(asset);
  });

  it('returns null for an asset that does not exist', () => {
    expect(getVaultAsset(db, 'no-such-asset')).toBeNull();
  });

  describe('INTEGRATION PACKAGE II — listVaultAssetsForTenant', () => {
    const baseAsset = (overrides: Partial<VaultAsset>): VaultAsset => ({
      assetId: 'asset-x',
      subscriberTenantId: 'tenant-1',
      originatingOperationId: 'op-x',
      capabilityTarget: CapabilityTarget.VISUAL,
      assetFamily: AssetFamily.MEDIA,
      secureStorageUri: 's3://bucket/x.png',
      metadata: {},
      createdAt: 1_000,
      updatedAt: 1_000,
      ...overrides,
    });

    it('lists only the given tenant\'s assets, most recent first', () => {
      insertVaultAsset(db, baseAsset({ assetId: 'a1', subscriberTenantId: 'tenant-1', createdAt: 1_000 }));
      insertVaultAsset(db, baseAsset({ assetId: 'a2', subscriberTenantId: 'tenant-1', createdAt: 3_000 }));
      insertVaultAsset(db, baseAsset({ assetId: 'a3', subscriberTenantId: 'tenant-2', createdAt: 2_000 }));

      const results = listVaultAssetsForTenant(db, 'tenant-1');

      expect(results.map((a) => a.assetId)).toEqual(['a2', 'a1']);
      expect(results.every((a) => a.subscriberTenantId === 'tenant-1')).toBe(true);
    });

    it('returns an empty list for a tenant with no assets', () => {
      expect(listVaultAssetsForTenant(db, 'nobody')).toEqual([]);
    });
  });

  describe('PACKAGE IX — Formal Goal Contract Triad Closure: linkGoalToVaultAsset', () => {
    it('writes the goalId onto the asset\'s own metadata, preserving every other field', () => {
      const asset: VaultAsset = {
        assetId: 'asset-1',
        subscriberTenantId: 'tenant-1',
        originatingOperationId: 'op-1',
        capabilityTarget: CapabilityTarget.VISUAL,
        assetFamily: AssetFamily.MEDIA,
        secureStorageUri: 's3://bucket/asset-1.png',
        metadata: { generationPrompt: 'a lone gate at dusk' },
        createdAt: 1_000,
        updatedAt: 1_000,
      };
      insertVaultAsset(db, asset);

      const linked = linkGoalToVaultAsset(db, 'asset-1', 'goal-123');

      expect(linked).toBe(true);
      const fetched = getVaultAsset(db, 'asset-1');
      expect(fetched?.metadata).toEqual({ generationPrompt: 'a lone gate at dusk', goalId: 'goal-123' });
    });

    it('returns false, never throws, for an asset that does not exist', () => {
      expect(linkGoalToVaultAsset(db, 'no-such-asset', 'goal-123')).toBe(false);
    });
  });
});
