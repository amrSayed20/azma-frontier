/**
 * AZMA OS – Makman Al-Ghayah
 * File: goal-completion-analyzer.ts
 *
 * Goal Completion Analyzer.
 */

import {
  GoalContract,
  GoalStatus
} from './goal-contracts';

export interface GoalCompletionReport {
  readonly totalGoals: number;

  readonly completedGoals: number;

  readonly incompleteGoals: number;

  readonly successRate: number;

  readonly fullyCompleted: boolean;
}

export class GoalCompletionAnalyzer {

  /**
   * Generates a completion report.
   */
  public analyze(
    goals: readonly GoalContract[]
  ): GoalCompletionReport {

    const totalGoals =
      goals.length;

    const completedGoals =
      goals.filter(
        goal =>
          goal.status ===
          GoalStatus.COMPLETED
      ).length;

    const incompleteGoals =
      totalGoals -
      completedGoals;

    const successRate =
      totalGoals === 0
        ? 0
        : (
            completedGoals /
            totalGoals
          ) * 100;

    return {
      totalGoals,

      completedGoals,

      incompleteGoals,

      successRate,

      fullyCompleted:
        incompleteGoals === 0
    };
  }

  /**
   * Checks whether every goal is complete.
   */
  public isFullyCompleted(
    goals: readonly GoalContract[]
  ): boolean {

    return goals.every(
      goal =>
        goal.status ===
        GoalStatus.COMPLETED
    );
  }
}