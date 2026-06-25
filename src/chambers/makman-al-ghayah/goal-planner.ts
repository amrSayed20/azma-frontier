/**
 * AZMA OS – Makman Al-Ghayah
 * File: goal-planner.ts
 *
 * Goal Planner.
 */

import {
  GoalContract,
  GoalStatus
} from './goal-contracts';

export class GoalPlanner {

  /**
   * Creates an execution plan.
   */
  public buildExecutionPlan(
    goals: readonly GoalContract[]
  ): GoalContract[] {

    return goals.filter(
      goal =>
        goal.status !==
        GoalStatus.COMPLETED
    );
  }

  /**
   * Returns executable goals.
   */
  public getExecutableGoals(
    goals: readonly GoalContract[]
  ): GoalContract[] {

    return goals.filter(
      goal =>
        goal.dependencies.length === 0
    );
  }

  /**
   * Returns completed goals.
   */
  public getCompletedGoals(
    goals: readonly GoalContract[]
  ): GoalContract[] {

    return goals.filter(
      goal =>
        goal.status ===
        GoalStatus.COMPLETED
    );
  }
}