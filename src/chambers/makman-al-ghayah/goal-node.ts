/**
 * AZMA OS – Makman Al-Ghayah
 * File: goal-node.ts
 *
 * Goal Node implementation.
 */

import {
  GoalContract,
  GoalPriority,
  GoalStatus
} from './goal-contracts';
import type { MakmanCommercialIntent } from './MAKMAN_COMMERCIAL_DISTRIBUTION_CONTRACTS';

export class GoalNode implements GoalContract {
  public readonly goalId: string;

  public readonly subscriberTenantId: string;

  public readonly title: string;

  public readonly description: string;

  public readonly priority: GoalPriority;

  public readonly status: GoalStatus;

  public readonly dependencies;

  public readonly metrics;

  public readonly createdAtMs: number;

  public readonly updatedAtMs: number;

  public readonly commercialIntent?: MakmanCommercialIntent;

  constructor(
    goal: GoalContract
  ) {
    this.goalId = goal.goalId;

    this.subscriberTenantId = goal.subscriberTenantId;

    this.title = goal.title;

    this.description = goal.description;

    this.priority = goal.priority;

    this.status = goal.status;

    this.dependencies = goal.dependencies;

    this.metrics = goal.metrics;

    this.createdAtMs = goal.createdAtMs;

    this.updatedAtMs = goal.updatedAtMs;

    this.commercialIntent = goal.commercialIntent;
  }

  public isCompleted(): boolean {
    return this.status === GoalStatus.COMPLETED;
  }

  public isBlocked(): boolean {
    return this.status === GoalStatus.BLOCKED;
  }

  public hasDependencies(): boolean {
    return this.dependencies.length > 0;
  }
}