/**
 * AZMA OS – Makman Al-Ghayah
 * File: goal-progress-tracker.ts
 *
 * Goal Progress Tracker.
 */

import {
  GoalContract,
  GoalStatus
} from './goal-contracts';

export class GoalProgressTracker {

  /**
   * Returns completion percentage.
   */
  public calculateProgress(
    goals: readonly GoalContract[]
  ): number {

    if (
      goals.length === 0
    ) {
      return 0;
    }

    const completedGoals =
      goals.filter(
        goal =>
          goal.status ===
          GoalStatus.COMPLETED
      ).length;

    return (
      completedGoals /
      goals.length
    ) * 100;
  }

  /**
   * Checks whether all goals are completed.
   */
  public isFinished(
    goals: readonly GoalContract[]
  ): boolean {

    return goals.every(
      goal =>
        goal.status ===
        GoalStatus.COMPLETED
    );
  }

  /**
   * Returns number of completed goals.
   */
  public completedCount(
    goals: readonly GoalContract[]
  ): number {

    return goals.filter(
      goal =>
        goal.status ===
        GoalStatus.COMPLETED
    ).length;
  }

  /**
   * Returns number of active goals.
   */
  public activeCount(
    goals: readonly GoalContract[]
  ): number {

    return goals.filter(
      goal =>
        goal.status !==
        GoalStatus.COMPLETED
    ).length;
  }
}