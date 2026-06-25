/**
 * AZMA OS – Makman Al-Ghayah
 * File: goal-state.ts
 *
 * Goal State Manager.
 */

import {
  GoalContract
} from './goal-contracts';

export class GoalState {
  private readonly goals =
    new Map<string, GoalContract>();

  /**
   * Registers a goal.
   */
  public register(
    goal: GoalContract
  ): void {

    this.goals.set(
      goal.goalId,
      goal
    );
  }

  /**
   * Updates a goal.
   */
  public update(
    goal: GoalContract
  ): void {

    this.goals.set(
      goal.goalId,
      goal
    );
  }

  /**
   * Retrieves a goal.
   */
  public getGoal(
    goalId: string
  ): GoalContract | undefined {

    return this.goals.get(
      goalId
    );
  }

  /**
   * Returns all goals.
   */
  public getGoals(): readonly GoalContract[] {

    return Array.from(
      this.goals.values()
    );
  }

  /**
   * Removes a goal.
   */
  public remove(
    goalId: string
  ): void {

    this.goals.delete(
      goalId
    );
  }

  /**
   * Clears all goals.
   */
  public clear(): void {

    this.goals.clear();
  }

  /**
   * Returns total count.
   */
  public size(): number {

    return this.goals.size;
  }
}
