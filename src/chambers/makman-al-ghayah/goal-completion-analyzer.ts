/**
 * AZMA OS – Makman Al-Ghayah
 * File: goal-completion-analyzer.ts
 *
 * Goal Completion Analyzer.
 *
 * CONSTITUTIONAL DEBT — FORMALLY ISOLATED (Constitutional Foundation Package V):
 * `successRate` and `fullyCompleted` compute ratios from GoalStatus.COMPLETED
 * counts, conflating operational production completion with Milestone success.
 * GoalStatus.COMPLETED means the Creator's production workflow finished; it
 * does NOT mean any SuccessCriterion was satisfied, any Observation supported
 * fulfillment, or any Fulfillment Assessment concluded positively.
 *
 * This class has zero external consumers (no SOEL method, no API route, no test
 * outside this file calls it). It is NOT used in the Fulfillment Assessment path.
 * It is preserved here because it is part of certified chamber architecture;
 * regrounding its semantics requires a future package with explicit authorization.
 *
 * Do NOT import or use this class in any new constitutional construction.
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