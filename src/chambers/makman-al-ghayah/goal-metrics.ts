/**
 * AZMA OS – Makman Al-Ghayah
 * File: goal-metrics.ts
 *
 * Goal Metrics Engine.
 */

import {
  GoalContract,
  GoalStatus
} from './goal-contracts';

export interface GoalMetricsSnapshot {
  readonly totalGoals: number;

  readonly completedGoals: number;

  readonly activeGoals: number;

  readonly blockedGoals: number;

  readonly failedGoals: number;

  readonly completionRate: number;
}

export class GoalMetrics {

  /**
   * Produces a metrics snapshot.
   */
  public snapshot(
    goals: readonly GoalContract[]
  ): GoalMetricsSnapshot {

    const totalGoals =
      goals.length;

    const completedGoals =
      goals.filter(
        goal =>
          goal.status ===
          GoalStatus.COMPLETED
      ).length;

    const activeGoals =
      goals.filter(
        goal =>
          goal.status ===
          GoalStatus.IN_PROGRESS
      ).length;

    const blockedGoals =
      goals.filter(
        goal =>
          goal.status ===
          GoalStatus.BLOCKED
      ).length;

    const failedGoals =
      goals.filter(
        goal =>
          goal.status ===
          GoalStatus.FAILED
      ).length;

    const completionRate =
      totalGoals === 0
        ? 0
        : (completedGoals / totalGoals) * 100;

    return {
      totalGoals,
      completedGoals,
      activeGoals,
      blockedGoals,
      failedGoals,
      completionRate
    };
  }
}