import { AzmaUnitCostEngine } from '../azma-cost-engine';
import { CostUnavailableError, GatewayNotFoundError } from '../cost-engine-types';
import type { ProviderCostCatalog } from '../cost-engine-types';
import type { CreatorBalance } from '../../credit-ledger/credit-ledger-types';

const MOCK_CATALOG: ProviderCostCatalog = {
  catalogVersion: '0.1.0-test',
  publishedAt: 1753574400000,
  entries: [
    {
      gatewayId: 'openai',
      capabilityTarget: 'image-generation',
      azmaUnitsPerUnit: 40,
      unitDescription: '1 image',
      availability: 'available',
      catalogVersion: '0.1.0-test',
      effectiveFrom: 1753574400000,
    },
    {
      gatewayId: 'magic-hour',
      capabilityTarget: 'video-generation',
      azmaUnitsPerUnit: 0,
      unitDescription: '1 video',
      availability: 'pending-discovery',
      catalogVersion: '0.1.0-test',
      effectiveFrom: 1753574400000,
      notes: 'API contract not inspected.',
    },
  ],
};

function makeBalance(available: number): CreatorBalance {
  return {
    creatorId: 'creator-001',
    availableUnits: available,
    reservedUnits: 0,
    totalPurchased: available,
    totalSpent: 0,
    updatedAt: Date.now(),
  };
}

describe('AzmaUnitCostEngine — estimate()', () => {
  const engine = new AzmaUnitCostEngine(MOCK_CATALOG);

  // SCENARIO 18: Available capability returns correct AZMA unit cost
  it('returns cost estimate for an available capability', () => {
    const estimate = engine.estimate('image-generation', 'openai');
    expect(estimate.estimatedAzmaUnits).toBe(40);
    expect(estimate.availability).toBe('available');
    expect(estimate.gatewayId).toBe('openai');
  });

  // SCENARIO 19: Pending-discovery throws CostUnavailableError
  it('throws CostUnavailableError for pending-discovery capability', () => {
    expect(() => engine.estimate('video-generation', 'magic-hour')).toThrow(CostUnavailableError);
  });

  // SCENARIO 20: Unknown gateway throws GatewayNotFoundError
  it('throws GatewayNotFoundError for unknown gateway', () => {
    expect(() => engine.estimate('image-generation', 'unknown-gateway')).toThrow(GatewayNotFoundError);
  });
});

describe('AzmaUnitCostEngine — estimateWithBalance()', () => {
  const engine = new AzmaUnitCostEngine(MOCK_CATALOG);

  // SCENARIO 21: Creator with sufficient balance can proceed
  it('returns canProceed:true when Creator has sufficient balance', () => {
    const result = engine.estimateWithBalance('image-generation', 'openai', makeBalance(100));
    expect(result.canProceed).toBe(true);
    expect(result.estimatedAzmaUnits).toBe(40);
    expect(result.blockerReason).toBeUndefined();
  });

  // SCENARIO 22: Creator with insufficient balance cannot proceed
  it('returns canProceed:false when Creator balance is too low', () => {
    const result = engine.estimateWithBalance('image-generation', 'openai', makeBalance(10));
    expect(result.canProceed).toBe(false);
    expect(result.blockerReason).toMatch(/insufficient/i);
  });

  // SCENARIO 23: Pending-discovery returns canProceed:false without throwing
  it('returns canProceed:false for pending-discovery without throwing', () => {
    const result = engine.estimateWithBalance('video-generation', 'magic-hour', makeBalance(999));
    expect(result.canProceed).toBe(false);
    expect(result.blockerReason).toMatch(/pending-discovery|API contract/i);
  });

  // SCENARIO 24: Unknown gateway returns canProceed:false, availability:unavailable
  it('returns canProceed:false for unknown gateway', () => {
    const result = engine.estimateWithBalance('image-generation', 'ghost-gateway', makeBalance(999));
    expect(result.canProceed).toBe(false);
    expect(result.availability).toBe('unavailable');
  });
});

describe('AzmaUnitCostEngine — listAvailableCapabilities()', () => {
  it('lists only available capabilities for a gateway', () => {
    const engine = new AzmaUnitCostEngine(MOCK_CATALOG);
    const caps = engine.listAvailableCapabilities('openai');
    expect(caps).toContain('image-generation');
    expect(caps).not.toContain('video-generation');
  });
});
