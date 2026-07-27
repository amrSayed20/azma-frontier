/**
 * AZMA OS – Makman Al-Ghayah
 * File: goal-state.ts
 *
 * Goal State Manager.
 *
 * CONSTITUTIONAL INTEGRITY CORRECTION (MAG-CIC-001): update/remove/clear
 * previously performed unconditional mutation with no Creator-authorization
 * gate, directly at odds with Article VII ("never rewrite/cancel a Goal
 * without authorization") and Article VIII (approval mandatory before
 * deleting a Goal). CreatorAuthorizationDecision reuses the isAuthorized/
 * reason shape already established by access-policy-engine.ts's
 * AuthorizationResult — not a new authorization concept, the same decision
 * shape applied to the mutation boundary instead of the consumption boundary.
 */

import {
  GoalContract
} from './goal-contracts';

/**
 * A Creator's authorization decision for a Goal mutation.
 * Mirrors access-policy-engine.ts's AuthorizationResult shape.
 */
export interface CreatorAuthorizationDecision {
  readonly isAuthorized: boolean;
  readonly rejectionReason?: string;
}

export class GoalStateAuthorizationError extends Error {
  constructor(operation: 'update' | 'remove' | 'clear', goalId: string, reason?: string) {
    super(`Creator Authorization required to ${operation} Goal [${goalId}]${reason ? `: ${reason}` : '.'}`);
    this.name = 'GoalStateAuthorizationError';
  }
}

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
   * ARTICLE VII / ARTICLE VIII: rejected without Creator Authorization.
   */
  public update(
    goal: GoalContract,
    authorization: CreatorAuthorizationDecision
  ): void {

    if (!authorization.isAuthorized) {
      throw new GoalStateAuthorizationError('update', goal.goalId, authorization.rejectionReason);
    }

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
   * PACKAGE IX — FORMAL GOAL CONTRACT TRIAD CLOSURE: returns only the
   * Goals belonging to one sovereign owner. getGoals() alone is unsafe
   * to expose across a tenant boundary — this is the tenant-respecting
   * read SOEL's own forward actually uses.
   */
  public getGoalsForTenant(
    subscriberTenantId: string
  ): readonly GoalContract[] {

    return Array.from(
      this.goals.values()
    ).filter((goal) => goal.subscriberTenantId === subscriberTenantId);
  }

  /**
   * Removes a goal.
   * ARTICLE VII / ARTICLE VIII: rejected without Creator Authorization.
   */
  public remove(
    goalId: string,
    authorization: CreatorAuthorizationDecision
  ): void {

    if (!authorization.isAuthorized) {
      throw new GoalStateAuthorizationError('remove', goalId, authorization.rejectionReason);
    }

    this.goals.delete(
      goalId
    );
  }

  /**
   * Clears all goals.
   * ARTICLE VII / ARTICLE VIII: clear() removes every Goal at once — the
   * same constitutional act as remove(), applied in bulk — and is gated
   * identically. Rejected without Creator Authorization.
   */
  public clear(
    authorization: CreatorAuthorizationDecision
  ): void {

    if (!authorization.isAuthorized) {
      throw new GoalStateAuthorizationError('clear', '*', authorization.rejectionReason);
    }

    this.goals.clear();
  }

  /**
   * Returns total count.
   */
  public size(): number {

    return this.goals.size;
  }
}
