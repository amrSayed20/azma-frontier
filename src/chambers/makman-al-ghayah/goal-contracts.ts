/**
 * AZMA OS – Makman Al-Ghayah
 * File: goal-contracts.ts
 *
 * Immutable contracts for executable goals.
 */

export enum GoalStatus {
  CREATED = 'CREATED',
  PLANNED = 'PLANNED',
  IN_PROGRESS = 'IN_PROGRESS',
  BLOCKED = 'BLOCKED',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED'
}

export enum GoalPriority {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface GoalMetric {
  readonly key: string;
  readonly value: number;
}

export interface GoalDependency {
  readonly goalId: string;
}

export interface GoalContract {
  readonly goalId: string;

  readonly title: string;

  readonly description: string;

  readonly priority: GoalPriority;

  readonly status: GoalStatus;

  readonly dependencies: readonly GoalDependency[];

  readonly metrics: readonly GoalMetric[];

  readonly createdAtMs: number;

  readonly updatedAtMs: number;
}