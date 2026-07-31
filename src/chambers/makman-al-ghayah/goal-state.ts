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
 *
 * MINISTRY IX — GOAL PERSISTENCE: GoalState now accepts an optional
 * IGoalRepository. When present, every write is mirrored to the durable
 * store (write-through cache). getGoal() falls back to the repository on
 * a Map miss so Goals survive server restart, deployment, and multi-instance
 * execution. The in-memory Map becomes an operational cache only; the
 * repository is the constitutional source of truth.
 *
 * IGoalRepository is declared here so the chamber layer defines the
 * contract it needs — persistent-storage/goal-repository.ts implements it
 * without creating a reverse dependency from chamber to infrastructure.
 * Same inversion-of-dependency pattern as ICinematicLedger.
 */

import { GoalContract } from './goal-contracts';

/**
 * A Creator's authorization decision for a Goal mutation.
 * Mirrors access-policy-engine.ts's AuthorizationResult shape.
 */
export interface CreatorAuthorizationDecision {
  readonly isAuthorized: boolean;
  readonly rejectionReason?: string;
}

/**
 * MINISTRY IX — constitutional persistence contract for GoalContracts.
 * Declared in the chamber; implemented by persistent-storage/goal-repository.ts.
 * GoalState depends on this interface, never on the concrete repository class.
 */
export interface IGoalRepository {
  save(goal: GoalContract): void;
  findByIdUnchecked(goalId: string): GoalContract | null;
  findByTenant(subscriberTenantId: string): readonly GoalContract[];
  deleteById(goalId: string): void;
  deleteAll(): void;
}

export class GoalStateAuthorizationError extends Error {
  constructor(operation: 'update' | 'remove' | 'clear', goalId: string, reason?: string) {
    super(`Creator Authorization required to ${operation} Goal [${goalId}]${reason ? `: ${reason}` : '.'}`);
    this.name = 'GoalStateAuthorizationError';
  }
}

export class GoalState {
  private readonly goals = new Map<string, GoalContract>();
  private readonly repository: IGoalRepository | undefined;

  constructor(repository?: IGoalRepository) {
    this.repository = repository;
  }

  /**
   * Registers a goal. Writes through to the repository when present.
   */
  public register(goal: GoalContract): void {
    this.goals.set(goal.goalId, goal);
    this.repository?.save(goal);
  }

  /**
   * Updates a goal.
   * ARTICLE VII / ARTICLE VIII: rejected without Creator Authorization.
   * Writes through to the repository when present.
   */
  public update(goal: GoalContract, authorization: CreatorAuthorizationDecision): void {
    if (!authorization.isAuthorized) {
      throw new GoalStateAuthorizationError('update', goal.goalId, authorization.rejectionReason);
    }
    this.goals.set(goal.goalId, goal);
    this.repository?.save(goal);
  }

  /**
   * Retrieves a goal. On a Map miss, falls back to the repository and
   * warms the cache — ensures Goals survive server restarts.
   */
  public getGoal(goalId: string): GoalContract | undefined {
    const cached = this.goals.get(goalId);
    if (cached) return cached;
    if (!this.repository) return undefined;
    const durable = this.repository.findByIdUnchecked(goalId);
    if (durable) this.goals.set(goalId, durable);
    return durable ?? undefined;
  }

  /**
   * Returns all goals. Uses the Map (which mirrors the repository during an
   * active process). For a cross-restart full list, callers should use
   * getGoalsForTenant() which reads from the repository directly.
   */
  public getGoals(): readonly GoalContract[] {
    return Array.from(this.goals.values());
  }

  /**
   * PACKAGE IX — FORMAL GOAL CONTRACT TRIAD CLOSURE: returns only the
   * Goals belonging to one sovereign owner. When a repository is present,
   * reads from the durable store so tenants see their full history after
   * restart — not just Goals created in the current process lifetime.
   */
  public getGoalsForTenant(subscriberTenantId: string): readonly GoalContract[] {
    if (this.repository) {
      return this.repository.findByTenant(subscriberTenantId);
    }
    return Array.from(this.goals.values()).filter((goal) => goal.subscriberTenantId === subscriberTenantId);
  }

  /**
   * Removes a goal.
   * ARTICLE VII / ARTICLE VIII: rejected without Creator Authorization.
   * Deletes from the repository when present.
   */
  public remove(goalId: string, authorization: CreatorAuthorizationDecision): void {
    if (!authorization.isAuthorized) {
      throw new GoalStateAuthorizationError('remove', goalId, authorization.rejectionReason);
    }
    this.goals.delete(goalId);
    this.repository?.deleteById(goalId);
  }

  /**
   * Clears all goals.
   * ARTICLE VII / ARTICLE VIII: clear() removes every Goal at once — the
   * same constitutional act as remove(), applied in bulk — and is gated
   * identically. Rejected without Creator Authorization.
   * Deletes all rows from the repository when present.
   */
  public clear(authorization: CreatorAuthorizationDecision): void {
    if (!authorization.isAuthorized) {
      throw new GoalStateAuthorizationError('clear', '*', authorization.rejectionReason);
    }
    this.goals.clear();
    this.repository?.deleteAll();
  }

  /**
   * Returns total count. Reflects the in-memory cache — may be lower than
   * the repository row count immediately after restart before cache warming.
   */
  public size(): number {
    return this.goals.size;
  }
}
