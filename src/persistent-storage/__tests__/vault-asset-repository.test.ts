import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../db';
import { insertVaultAsset, getVaultAsset } from '../vault-asset-repository';
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
});
