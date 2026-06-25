/**
 * Chamber lifecycle manager for load/activate/deactivate state transitions.
 */

import { ChamberRegistry } from '../registry/chamber-registry';
import { ChamberStatus } from '../types/chamber-contracts';
import { ChamberLoader } from '../loading/chamber-loader';

export class ChamberLifecycleManager {
  constructor(
    private readonly registry: ChamberRegistry,
    private readonly loader: ChamberLoader
  ) {}

  public async load(chamberId: string): Promise<void> {
    await this.loader.load(chamberId);
    this.registry.updateStatus(chamberId, ChamberStatus.LOADED);
  }

  public async activate(chamberId: string): Promise<void> {
    const adapter = this.loader.getAdapter(chamberId);
    if (!adapter) {
      throw new Error(`Adapter not found for chamber ${chamberId}`);
    }

    await adapter.activate();
    this.registry.updateStatus(chamberId, ChamberStatus.ACTIVE);
  }

  public async deactivate(chamberId: string): Promise<void> {
    const adapter = this.loader.getAdapter(chamberId);
    if (!adapter) {
      throw new Error(`Adapter not found for chamber ${chamberId}`);
    }

    await adapter.deactivate();
    this.registry.updateStatus(chamberId, ChamberStatus.INACTIVE);
  }
}
