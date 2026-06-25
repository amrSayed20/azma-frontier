/**
 * AZMA OS – Makman Al-Ghayah
 * File: goal-prioritization-engine.ts
 *
 * Goal Prioritization Engine.
 */

import {
  GoalContract,
  GoalPriority
} from './goal-contracts';

export class GoalPrioritizationEngine {

  /**
   * Sorts goals by priority.
   */
  public prioritize(
    goals: readonly GoalContract[]
  ): GoalContract[] {

    return [...goals].sort(
      (
        left,
        right
      ) =>
        this.priorityWeight(
          right.priority
        ) -
        this.priorityWeight(
          left.priority
        )
    );
  }

  /**
   * Converts priority into numeric weight.
   */
  private priorityWeight(
    priority: GoalPriority
  ): number {

    switch (priority) {

      case GoalPriority.CRITICAL:
        return 4;

      case GoalPriority.HIGH:
        return 3;

      case GoalPriority.MEDIUM:
        return 2;

      case GoalPriority.LOW:
        return 1;

      default:
        return 0;
    }
  }
}