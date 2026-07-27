jest.mock('../../persistent-storage', () => ({
  getDb: jest.fn(() => 'fake-db-handle'),
  insertVaultAsset: jest.fn(),
  getVaultAsset: jest.fn(),
  listVaultAssetsForTenant: jest.fn(),
  linkGoalToVaultAsset: jest.fn(),
}));

import { getDb, insertVaultAsset, getVaultAsset, listVaultAssetsForTenant, linkGoalToVaultAsset } from '../../persistent-storage';
import { SovereignVaultManager } from '../sovereign-vault-manager';
import { AssetFamily } from '../sovereign-vault-types';
import { CapabilityTarget } from '../../core/sovereign-orchestrator/qiyamah-intent-types';
import type { SovereignVaultDeposit, VaultAsset } from '../sovereign-vault-types';

const mockInsertVaultAsset = insertVaultAsset as jest.Mock;
const mockGetVaultAsset = getVaultAsset as jest.Mock;
const mockListVaultAssetsForTenant = listVaultAssetsForTenant as jest.Mock;
const mockLinkGoalToVaultAsset = linkGoalToVaultAsset as jest.Mock;

describe('SovereignVaultManager — migrated to Persistent Storage Foundation', () => {
  beforeEach(() => {
    mockInsertVaultAsset.mockReset();
    mockGetVaultAsset.mockReset();
    mockListVaultAssetsForTenant.mockReset();
    mockLinkGoalToVaultAsset.mockReset();
  });

  it('deposits an asset by persisting it through the shared database, preserving its own public contract', async () => {
    const manager = new SovereignVaultManager();
    const deposit: SovereignVaultDeposit = {
      operationId: 'op-1',
      subscriberTenantId: 'tenant-1',
      capabilityTarget: CapabilityTarget.VISUAL,
      assetFamily: AssetFamily.MEDIA,
      secureStorageUri: 's3://bucket/x.png',
      metadata: {},
    };

    const asset = await manager.depositAsset(deposit);

    expect(asset.subscriberTenantId).toBe('tenant-1');
    expect(getDb).toHaveBeenCalled();
    expect(mockInsertVaultAsset).toHaveBeenCalledWith('fake-db-handle', expect.objectContaining({ assetId: asset.assetId }));
  });

  it('retrieves an asset for its rightful tenant', async () => {
    const stored: VaultAsset = {
      assetId: 'asset-1', subscriberTenantId: 'tenant-1', originatingOperationId: 'op-1',
      capabilityTarget: CapabilityTarget.VISUAL, assetFamily: AssetFamily.MEDIA,
      secureStorageUri: 's3://bucket/x.png', metadata: {}, createdAt: 1, updatedAt: 1,
    };
    mockGetVaultAsset.mockReturnValue(stored);

    const manager = new SovereignVaultManager();
    const fetched = await manager.getAsset('asset-1', 'tenant-1');
    expect(fetched).toEqual(stored);
  });

  it('preserves the exact "not found" error behavior', async () => {
    mockGetVaultAsset.mockReturnValue(null);
    const manager = new SovereignVaultManager();
    await expect(manager.getAsset('missing', 'tenant-1')).rejects.toThrow('Vault Error: Asset [missing] not found.');
  });

  it('preserves the exact tenant-isolation error behavior', async () => {
    const stored: VaultAsset = {
      assetId: 'asset-1', subscriberTenantId: 'tenant-1', originatingOperationId: 'op-1',
      capabilityTarget: CapabilityTarget.VISUAL, assetFamily: AssetFamily.MEDIA,
      secureStorageUri: 's3://bucket/x.png', metadata: {}, createdAt: 1, updatedAt: 1,
    };
    mockGetVaultAsset.mockReturnValue(stored);

    const manager = new SovereignVaultManager();
    await expect(manager.getAsset('asset-1', 'tenant-2')).rejects.toThrow(
      'Vault Security Breach: Tenant [tenant-2] attempted to access Asset [asset-1] belonging to another sovereign owner.',
    );
  });

  it('INTEGRATION PACKAGE II: lists a tenant\'s real assets via the same shared database', async () => {
    const stored: VaultAsset[] = [
      {
        assetId: 'asset-1', subscriberTenantId: 'tenant-1', originatingOperationId: 'op-1',
        capabilityTarget: CapabilityTarget.VISUAL, assetFamily: AssetFamily.MEDIA,
        secureStorageUri: 's3://bucket/x.png', metadata: {}, createdAt: 2, updatedAt: 2,
      },
    ];
    mockListVaultAssetsForTenant.mockReturnValue(stored);

    const manager = new SovereignVaultManager();
    const results = await manager.listAssetsForTenant('tenant-1');

    expect(results).toEqual(stored);
    expect(mockListVaultAssetsForTenant).toHaveBeenCalledWith('fake-db-handle', 'tenant-1');
  });

  describe('PACKAGE IX — Formal Goal Contract Triad Closure: linkGoalToAsset', () => {
    const stored: VaultAsset = {
      assetId: 'asset-1', subscriberTenantId: 'tenant-1', originatingOperationId: 'op-1',
      capabilityTarget: CapabilityTarget.VISUAL, assetFamily: AssetFamily.MEDIA,
      secureStorageUri: 's3://bucket/x.png', metadata: {}, createdAt: 1, updatedAt: 1,
    };

    it('writes the goalId back onto the asset for its rightful tenant', async () => {
      mockGetVaultAsset.mockReturnValue(stored);
      const manager = new SovereignVaultManager();

      await manager.linkGoalToAsset('asset-1', 'tenant-1', 'goal-123');

      expect(mockLinkGoalToVaultAsset).toHaveBeenCalledWith('fake-db-handle', 'asset-1', 'goal-123');
    });

    it('refuses to link a Goal onto an asset belonging to another tenant', async () => {
      mockGetVaultAsset.mockReturnValue(stored);
      const manager = new SovereignVaultManager();

      await expect(manager.linkGoalToAsset('asset-1', 'tenant-2', 'goal-123')).rejects.toThrow(
        'Vault Security Breach: Tenant [tenant-2] attempted to link a Goal onto Asset [asset-1] belonging to another sovereign owner.',
      );
      expect(mockLinkGoalToVaultAsset).not.toHaveBeenCalled();
    });

    it('refuses to link a Goal onto an asset that does not exist', async () => {
      mockGetVaultAsset.mockReturnValue(null);
      const manager = new SovereignVaultManager();

      await expect(manager.linkGoalToAsset('missing', 'tenant-1', 'goal-123')).rejects.toThrow(
        'Vault Error: Asset [missing] not found.',
      );
      expect(mockLinkGoalToVaultAsset).not.toHaveBeenCalled();
    });
  });
});
