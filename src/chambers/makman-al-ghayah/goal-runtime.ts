/**
 * AZMA OS – Makman Al-Ghayah
 * File: goal-runtime.ts
 *
 * Goal Runtime.
 */

import { GoalContract } from './goal-contracts';
import { GoalOrchestrator } from './goal-orchestrator';

export class GoalRuntime {
  constructor(
    private readonly orchestrator: GoalOrchestrator
  ) {}

  /**
   * Executes runtime planning cycle.
   */
  public execute(
    goals: readonly GoalContract[]
  ): GoalContract[] {

    return this.orchestrator.orchestrate(
      goals
    );
  }

  /**
   * Returns whether runtime has work.
   */
  public hasWork(
    goals: readonly GoalContract[]
  ): boolean {

    return (
      this.execute(
        goals
      ).length > 0
    );
  }
}