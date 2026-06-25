/**
 * Chamber selection based on capability registry.
 */

import { CapabilityRegistry } from '../../chamber-integration';
import { ChamberTarget, WorkflowPlan } from '../types/orchestration-contracts';

export class ChamberSelector {
  constructor(private readonly capabilityRegistry: CapabilityRegistry) {}

  public select(plan: WorkflowPlan): readonly ChamberTarget[] {
    const targets: ChamberTarget[] = [];

    for (const step of plan.steps) {
      const entries = this.capabilityRegistry.findByName(step.capability);
      if (entries.length === 0) {
        throw new Error(`No chamber registered for capability ${step.capability}`);
      }

      const selected = entries[0];
      targets.push({
        stepId: step.stepId,
        chamberId: selected.chamberId,
        capability: step.capability
      });
    }

    return targets;
  }
}
