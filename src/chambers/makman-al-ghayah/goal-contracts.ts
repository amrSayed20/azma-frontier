/**
 * AZMA OS – Makman Al-Ghayah
 * File: goal-contracts.ts
 *
 * Immutable contracts for executable goals.
 */

import type { MakmanCommercialIntent } from './MAKMAN_COMMERCIAL_DISTRIBUTION_CONTRACTS';

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

  /**
   * PACKAGE IX — FORMAL GOAL CONTRACT TRIAD CLOSURE: the sovereign owner
   * of this Goal. Without this field, any read of GoalState's own
   * getGoals() would mix every Creator's Goals together — the exact
   * cross-tenant leak the Chief Architect ruled out as constitutionally
   * unsafe. Sourced directly from the originating CompiledAssemblyGraph's
   * own subscriberTenantId (see MAKMAN_GOAL_CREATION_CONNECTOR.ts) —
   * never invented, never inferred.
   */
  readonly subscriberTenantId: string;

  readonly title: string;

  readonly description: string;

  readonly priority: GoalPriority;

  readonly status: GoalStatus;

  readonly dependencies: readonly GoalDependency[];

  readonly metrics: readonly GoalMetric[];

  readonly createdAtMs: number;

  readonly updatedAtMs: number;

  /**
   * PACKAGE XI — COMMERCIAL INTENT DURABLE STORAGE: the real
   * MakmanCommercialIntent the Creator declared at submission time,
   * carried onto the Goal itself at creation (see
   * MAKMAN_GOAL_CREATION_CONNECTOR.ts) so it survives exactly as long as
   * the Goal does in GoalState — the same durability every other field
   * on this contract already has, no more and no less. Absent when a
   * Goal was created without this package's own wiring (should not occur
   * going forward, but old callers/tests may still omit it honestly).
   */
  readonly commercialIntent?: MakmanCommercialIntent;
}