/**
 * Chamber deactivation service.
 */

import { ChamberLifecycleManager } from '../lifecycle/chamber-lifecycle-manager';

export class ChamberDeactivationService {
  constructor(private readonly lifecycle: ChamberLifecycleManager) {}

  public async deactivate(chamberId: string): Promise<void> {
    await this.lifecycle.deactivate(chamberId);
  }
}
