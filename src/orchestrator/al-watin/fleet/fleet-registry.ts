/**
 * AZMA OS - Phase 4: Materialization Architecture
 * File: src/orchestrator/al-watin/fleet/fleet-registry.ts
 * 
 * The Fleet Registry implementation.
 * The executable memory layer that categorizes and manages all active 
 * IProviderAdapter instances across Al-Watin Al-Siyadi's multi-modal ecosystem.
 */

import { CapabilityTarget } from '../../../core/sovereign-orchestrator/qiyamah-intent-types';
import { IProviderAdapter, IFleetRegistry } from './fleet-types';

export class FleetRegistry implements IFleetRegistry {
  // A two-dimensional map isolating adapters into distinct Capability Pools.
  // Pool Structure: Map<CapabilityTarget, Map<providerId, IProviderAdapter>>
  private readonly adapterPools: Map<CapabilityTarget, Map<string, IProviderAdapter>>;

  constructor() {
    this.adapterPools = new Map<CapabilityTarget, Map<string, IProviderAdapter>>();
    
    // Initialize the pools for every constitutionally approved capability target
    Object.values(CapabilityTarget).forEach((target) => {
      this.adapterPools.set(target as CapabilityTarget, new Map<string, IProviderAdapter>());
    });
  }

  /**
   * Registers a new provider adapter into the fleet ecosystem at runtime.
   * Interrogates the adapter's capabilities and injects it into all applicable pools.
   */
  public async registerAdapter(adapter: IProviderAdapter): Promise<void> {
    const capabilities = await adapter.getCapabilities();

    if (!capabilities.supportedTargets || capabilities.supportedTargets.length === 0) {
      throw new Error(`Fleet Registry Error: Adapter [${adapter.providerId}] supports zero capabilities.`);
    }

    // Populate the adapter into its respective capability pools
    capabilities.supportedTargets.forEach((target) => {
      const pool = this.adapterPools.get(target);
      if (pool) {
        pool.set(adapter.providerId, adapter);
      }
    });
  }

  /**
   * Safely decommissions a provider adapter from all active capability pools.
   * Useful for dynamic load balancing or responding to vendor outages.
   */
  public removeAdapter(providerId: string): void {
    this.adapterPools.forEach((pool) => {
      pool.delete(providerId);
    });
  }

  /**
   * Retrieves all active adapters capable of fulfilling a specific intent target.
   * Used by the FleetDispatcher during the Invocation Phase for routing decisions.
   */
  public getAdaptersForCapability(target: CapabilityTarget): IProviderAdapter[] {
    const pool = this.adapterPools.get(target);
    
    if (!pool || pool.size === 0) {
      return [];
    }
    
    return Array.from(pool.values());
  }

  /**
   * Retrieves a specific adapter by its exact ID across all pools.
   * Used by the FleetDispatcher during the asynchronous Resolution Phase.
   */
  public getAdapterById(providerId: string): IProviderAdapter | undefined {
    for (const pool of this.adapterPools.values()) {
      if (pool.has(providerId)) {
        return pool.get(providerId);
      }
    }
    return undefined;
  }
} 