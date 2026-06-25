/**
 * Registry for chamber capability indexing and lookup.
 */

import { ChamberCapability } from '../types/chamber-contracts';

export interface CapabilityEntry {
  readonly chamberId: string;
  readonly capability: ChamberCapability;
}

export class CapabilityRegistry {
  private readonly capabilities = new Map<string, CapabilityEntry[]>();

  public register(chamberId: string, capability: ChamberCapability): void {
    const key = capability.name;
    const current = this.capabilities.get(key) ?? [];
    this.capabilities.set(key, [...current, { chamberId, capability }]);
  }

  public unregisterChamber(chamberId: string): void {
    for (const [key, entries] of this.capabilities.entries()) {
      const filtered = entries.filter(entry => entry.chamberId !== chamberId);
      if (filtered.length === 0) {
        this.capabilities.delete(key);
      } else {
        this.capabilities.set(key, filtered);
      }
    }
  }

  public findByName(capabilityName: string): readonly CapabilityEntry[] {
    return this.capabilities.get(capabilityName) ?? [];
  }

  public listAll(): Readonly<Record<string, readonly CapabilityEntry[]>> {
    const snapshot: Record<string, readonly CapabilityEntry[]> = {};
    for (const [key, value] of this.capabilities.entries()) {
      snapshot[key] = value;
    }
    return snapshot;
  }
}
