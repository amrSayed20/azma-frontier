/**
 * Chamber activation service.
 */

import { ChamberLifecycleManager } from '../lifecycle/chamber-lifecycle-manager';

export class ChamberActivationService {
  constructor(private readonly lifecycle: ChamberLifecycleManager) {}

  public async activate(chamberId: string): Promise<void> {
    await this.lifecycle.activate(chamberId);
  }
}
