/**
 * AZMA OS – Makman Al-Ghayah
 * File: goal-dependency-resolver.ts
 *
 * Goal Dependency Resolver.
 */

import {
  GoalContract,
  GoalStatus
} from './goal-contracts';

export class GoalDependencyResolver {

  /**
   * Returns true if all dependencies are completed.
   */
  public canExecute(
    goal: GoalContract,
    goals: readonly GoalContract[]
  ): boolean {

    if (
      goal.dependencies.length === 0
    ) {
      return true;
    }

    return goal.dependencies.every(
      dependency => {

        const dependencyGoal =
          goals.find(
            candidate =>
              candidate.goalId ===
              dependency.goalId
          );

        return (
          dependencyGoal !==
            undefined &&
          dependencyGoal.status ===
            GoalStatus.COMPLETED
        );
      }
    );
  }

  /**
   * Returns unresolved dependency ids.
   */
  public getPendingDependencies(
    goal: GoalContract,
    goals: readonly GoalContract[]
  ): string[] {

    return goal.dependencies
      .filter(
        dependency => {

          const dependencyGoal =
            goals.find(
              candidate =>
                candidate.goalId ===
                dependency.goalId
            );

          return (
            dependencyGoal ===
              undefined ||
            dependencyGoal.status !==
              GoalStatus.COMPLETED
          );
        }
      )
      .map(
        dependency =>
          dependency.goalId
      );
  }
}
