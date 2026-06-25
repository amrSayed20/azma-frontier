/**
 * Chamber loader abstraction for adapter registration.
 */

import { ChamberAdapter } from '../types/chamber-contracts';

export class ChamberLoader {
  private readonly adapters = new Map<string, ChamberAdapter>();

  public registerAdapter(adapter: ChamberAdapter): void {
    this.adapters.set(adapter.chamberId, adapter);
  }

  public unregisterAdapter(chamberId: string): void {
    this.adapters.delete(chamberId);
  }

  public getAdapter(chamberId: string): ChamberAdapter | undefined {
    return this.adapters.get(chamberId);
  }

  public listAdapters(): readonly ChamberAdapter[] {
    return Array.from(this.adapters.values());
  }

  public async load(chamberId: string): Promise<void> {
    const adapter = this.adapters.get(chamberId);
    if (!adapter) {
      throw new Error(`Adapter not found for chamber ${chamberId}`);
    }
    await adapter.load();
  }
}
