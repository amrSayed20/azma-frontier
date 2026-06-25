/**
 * AZMA OS – Al-Wateen Assistant
 * File: failover-engine.ts
 *
 * Failover and redundancy management.
 */

import { ILogger } from '../utils/logger';

export interface FailoverTarget {
  readonly targetId: string;
  readonly isPrimary: boolean;
  readonly isAvailable: boolean;
  activate(): Promise<boolean>;
  deactivate(): Promise<boolean>;
}

export interface FailoverGroup {
  readonly groupId: string;
  readonly targets: readonly FailoverTarget[];
  getCurrentActive(): FailoverTarget | undefined;
}

export class FailoverEngine {
  private groups: Map<string, FailoverGroup> = new Map();

  constructor(private readonly logger: ILogger) {
    this.logger.info('FailoverEngine', 'Initialized');
  }

  public registerFailoverGroup(group: FailoverGroup): void {
    this.groups.set(group.groupId, group);
  }

  public async initiateFailover(groupId: string): Promise<boolean> {
    const group = this.groups.get(groupId);

    if (!group) {
      this.logger.warn('FailoverEngine', `Failover group not found: ${groupId}`);
      return false;
    }

    try {
      this.logger.info('FailoverEngine', `Initiating failover for group: ${groupId}`);

      const current = group.getCurrentActive();
      const availableTargets = group.targets.filter(t => t.isAvailable && t !== current);

      if (availableTargets.length === 0) {
        this.logger.error('FailoverEngine', `No available failover targets for group: ${groupId}`);
        return false;
      }

      if (current) {
        const deactivated = await current.deactivate();
        if (!deactivated) {
          this.logger.warn('FailoverEngine', `Failed to deactivate current target for group: ${groupId}`);
        }
      }

      const primaryTarget = availableTargets.find(t => t.isPrimary) || availableTargets[0];
      const activated = await primaryTarget.activate();

      if (activated) {
        this.logger.info('FailoverEngine', `Failover succeeded for group: ${groupId}`, {
          newActive: primaryTarget.targetId
        });
        return true;
      } else {
        this.logger.error('FailoverEngine', `Failed to activate failover target for group: ${groupId}`);
        return false;
      }
    } catch (error) {
      this.logger.error(
        'FailoverEngine',
        `Error during failover for group: ${groupId}`,
        error instanceof Error ? error : undefined
      );
      return false;
    }
  }

  public getActiveTarget(groupId: string): FailoverTarget | undefined {
    const group = this.groups.get(groupId);
    return group?.getCurrentActive();
  }
}
