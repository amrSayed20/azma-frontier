/**
 * Self-healing coordinator triggered by health outcomes.
 */

import {
  HealthCheckResult,
  HealthStatus,
  RecoveryAction,
  RecoveryActionType,
  RecoveryResult
} from '../types/al-wateen.types';
import { buildId } from '../utils/ids';
import { now } from '../utils/time';
import { RecoveryEngine } from './recovery-engine';

export class SelfHealingCoordinator {
  constructor(private readonly recoveryEngine: RecoveryEngine) {}

  public async heal(results: readonly HealthCheckResult[]): Promise<readonly RecoveryResult[]> {
    const recoveries: RecoveryResult[] = [];

    for (const result of results) {
      if (result.status !== HealthStatus.CRITICAL) {
        continue;
      }

      const action: RecoveryAction = {
        id: buildId('recovery'),
        type: RecoveryActionType.RESTART_SERVICE,
        target: result.component,
        reason: result.message,
        createdAt: now(),
        metadata: {
          checkId: result.checkId
        }
      };

      recoveries.push(await this.recoveryEngine.execute(action));
    }

    return recoveries;
  }
}
