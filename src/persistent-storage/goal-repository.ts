/**
 * MINISTRY IX — GOAL PERSISTENCE
 *
 * Durable repository for GoalContract. Implements the IGoalRepository
 * interface declared in goal-state.ts so the chamber layer never imports
 * from persistent-storage directly — the same inversion-of-dependency
 * pattern ICinematicLedger established in MAKMAN_GOAL_DISTRIBUTION_BRIDGE.ts.
 *
 * commercial_intent_json stores the full MakmanCommercialIntent as JSON,
 * including the CompiledAssemblyGraph. All fields are JSON-serializable;
 * no custom reviver is required.
 */

import type { DatabaseSync } from 'node:sqlite';
import type { GoalContract, GoalDependency, GoalMetric, SuccessCriterion } from '../chambers/makman-al-ghayah/goal-contracts';
import { GoalStatus, GoalPriority, PacingPreference, TransitionPreference } from '../chambers/makman-al-ghayah/goal-contracts';
import type { MakmanCommercialIntent } from '../chambers/makman-al-ghayah/MAKMAN_COMMERCIAL_DISTRIBUTION_CONTRACTS';
import type { IGoalRepository } from '../chambers/makman-al-ghayah/goal-state';

type GoalRow = {
  goal_id: string;
  subscriber_tenant_id: string;
  title: string;
  description: string;
  priority: string;
  status: string;
  dependencies_json: string;
  metrics_json: string;
  commercial_intent_json: string | null;
  pacing_preference: string | null;
  transition_preference: string | null;
  sovereign_purpose_statement: string | null;
  success_criteria_json: string | null;
  created_at_ms: number;
  updated_at_ms: number;
};

function rowToGoal(row: GoalRow): GoalContract {
  return {
    goalId: row.goal_id,
    subscriberTenantId: row.subscriber_tenant_id,
    title: row.title,
    description: row.description,
    priority: row.priority as GoalPriority,
    status: row.status as GoalStatus,
    dependencies: JSON.parse(row.dependencies_json) as GoalDependency[],
    metrics: JSON.parse(row.metrics_json) as GoalMetric[],
    commercialIntent: row.commercial_intent_json
      ? (JSON.parse(row.commercial_intent_json) as MakmanCommercialIntent)
      : undefined,
    pacingPreference: row.pacing_preference ? (row.pacing_preference as PacingPreference) : undefined,
    transitionPreference: row.transition_preference ? (row.transition_preference as TransitionPreference) : undefined,
    sovereignPurposeStatement: row.sovereign_purpose_statement ?? undefined,
    successCriteria: row.success_criteria_json
      ? (JSON.parse(row.success_criteria_json) as SuccessCriterion[])
      : undefined,
    createdAtMs: row.created_at_ms,
    updatedAtMs: row.updated_at_ms,
  };
}

export class GoalRepository implements IGoalRepository {
  constructor(private readonly db: DatabaseSync) {}

  public save(goal: GoalContract): void {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO goals (
          goal_id, subscriber_tenant_id, title, description, priority, status,
          dependencies_json, metrics_json, commercial_intent_json,
          pacing_preference, transition_preference, sovereign_purpose_statement,
          success_criteria_json, created_at_ms, updated_at_ms
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        goal.goalId,
        goal.subscriberTenantId,
        goal.title,
        goal.description,
        goal.priority,
        goal.status,
        JSON.stringify(goal.dependencies),
        JSON.stringify(goal.metrics),
        goal.commercialIntent ? JSON.stringify(goal.commercialIntent) : null,
        goal.pacingPreference ?? null,
        goal.transitionPreference ?? null,
        goal.sovereignPurposeStatement ?? null,
        goal.successCriteria !== undefined ? JSON.stringify(goal.successCriteria) : null,
        goal.createdAtMs,
        goal.updatedAtMs,
      );
  }

  public findByIdUnchecked(goalId: string): GoalContract | null {
    const row = this.db.prepare('SELECT * FROM goals WHERE goal_id = ?').get(goalId) as GoalRow | undefined;
    return row ? rowToGoal(row) : null;
  }

  public findByTenant(subscriberTenantId: string): readonly GoalContract[] {
    const rows = this.db
      .prepare('SELECT * FROM goals WHERE subscriber_tenant_id = ? ORDER BY created_at_ms DESC')
      .all(subscriberTenantId) as GoalRow[];
    return rows.map(rowToGoal);
  }

  public deleteById(goalId: string): void {
    this.db.prepare('DELETE FROM goals WHERE goal_id = ?').run(goalId);
  }

  public deleteAll(): void {
    this.db.exec('DELETE FROM goals');
  }
}
