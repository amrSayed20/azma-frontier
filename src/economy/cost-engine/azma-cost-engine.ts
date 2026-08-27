import type {
  CapabilityTarget,
  CostEstimate,
  ProviderCostCatalog,
  ReservableEstimate,
} from './cost-engine-types';
import {
  CostUnavailableError,
  GatewayNotFoundError,
} from './cost-engine-types';
import { CURRENT_PROVIDER_COST_CATALOG, getCatalogEntry } from './provider-cost-catalog';
import type { CreatorBalance } from '../credit-ledger/credit-ledger-types';

export class AzmaUnitCostEngine {
  constructor(
    private readonly catalog: ProviderCostCatalog = CURRENT_PROVIDER_COST_CATALOG,
  ) {}

  // Returns the AZMA Unit cost for a capability via a gateway.
  // When modelId is provided, tries the model-specific entry first, then the
  // coarse gateway entry — backward-compatible for all existing callers.
  // Throws GatewayNotFoundError if no catalog entry exists.
  // Throws CostUnavailableError if availability is not 'available'.
  estimate(capabilityTarget: CapabilityTarget, gatewayId: string, modelId?: string): CostEstimate {
    const entry = getCatalogEntry(gatewayId, capabilityTarget, this.catalog, modelId);

    if (!entry) {
      throw new GatewayNotFoundError(gatewayId, capabilityTarget);
    }

    if (entry.availability !== 'available') {
      throw new CostUnavailableError(capabilityTarget, gatewayId, entry.availability);
    }

    return {
      capabilityTarget,
      gatewayId,
      estimatedAzmaUnits: entry.azmaUnitsPerUnit,
      availability: entry.availability,
      unitDescription: entry.unitDescription,
      catalogVersion: entry.catalogVersion,
    };
  }

  // Returns the estimate enriched with whether the Creator can proceed given their balance.
  // Never throws on pending-discovery — returns canProceed:false with blockerReason.
  estimateWithBalance(
    capabilityTarget: CapabilityTarget,
    gatewayId: string,
    balance: CreatorBalance,
    modelId?: string,
  ): ReservableEstimate {
    const entry = getCatalogEntry(gatewayId, capabilityTarget, this.catalog, modelId);

    if (!entry) {
      return {
        capabilityTarget,
        gatewayId,
        estimatedAzmaUnits: 0,
        availability: 'unavailable',
        unitDescription: 'unknown',
        catalogVersion: this.catalog.catalogVersion,
        canProceed: false,
        blockerReason: `No gateway entry found for ${gatewayId}/${capabilityTarget}`,
      };
    }

    if (entry.availability !== 'available') {
      return {
        capabilityTarget,
        gatewayId,
        estimatedAzmaUnits: 0,
        availability: entry.availability,
        unitDescription: entry.unitDescription,
        catalogVersion: entry.catalogVersion,
        canProceed: false,
        blockerReason: `Cost ${entry.availability} for ${capabilityTarget} via ${gatewayId}. ${entry.notes ?? ''}`.trim(),
      };
    }

    const canProceed = balance.availableUnits >= entry.azmaUnitsPerUnit;
    return {
      capabilityTarget,
      gatewayId,
      estimatedAzmaUnits: entry.azmaUnitsPerUnit,
      availability: 'available',
      unitDescription: entry.unitDescription,
      catalogVersion: entry.catalogVersion,
      canProceed,
      blockerReason: canProceed
        ? undefined
        : `Insufficient AZMA balance: need ${entry.azmaUnitsPerUnit}, have ${balance.availableUnits}`,
    };
  }

  // Lists all capabilities available via a given gateway.
  listAvailableCapabilities(gatewayId: string): CapabilityTarget[] {
    return this.catalog.entries
      .filter((e) => e.gatewayId === gatewayId && e.availability === 'available')
      .map((e) => e.capabilityTarget as CapabilityTarget);
  }

  getCatalogVersion(): string {
    return this.catalog.catalogVersion;
  }
}

// Singleton for production use.
let engineInstance: AzmaUnitCostEngine | null = null;

export function getAzmaCostEngine(): AzmaUnitCostEngine {
  if (!engineInstance) {
    engineInstance = new AzmaUnitCostEngine();
  }
  return engineInstance;
}

export function resetCostEngineForTests(): void {
  engineInstance = null;
}
