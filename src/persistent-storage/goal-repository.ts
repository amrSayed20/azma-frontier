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
  archived_at_ms: number | null;
  archived_by: string | null;
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
    archivedAtMs: row.archived_at_ms ?? undefined,
    archivedBy: row.archived_by ?? undefined,
  };
}

/** How many goals one response may carry. A page, never a ceiling on ownership. */
export const DEFAULT_GOAL_PAGE = 50;
const MAX_GOAL_PAGE = 200;
const boundPage = (n: number) => Math.max(1, Math.min(Math.floor(n) || DEFAULT_GOAL_PAGE, MAX_GOAL_PAGE));

export class GoalRepository implements IGoalRepository {
  constructor(private readonly db: DatabaseSync) {}

  public save(goal: GoalContract): void {
    this.db
      .prepare(
        `INSERT OR REPLACE INTO goals (
          goal_id, subscriber_tenant_id, title, description, priority, status,
          dependencies_json, metrics_json, commercial_intent_json,
          pacing_preference, transition_preference, sovereign_purpose_statement,
          success_criteria_json, created_at_ms, updated_at_ms,
          archived_at_ms, archived_by
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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
        goal.archivedAtMs ?? null,
        goal.archivedBy ?? null,
      );
  }

  public findByIdUnchecked(goalId: string): GoalContract | null {
    const row = this.db.prepare('SELECT * FROM goals WHERE goal_id = ?').get(goalId) as GoalRow | undefined;
    return row ? rowToGoal(row) : null;
  }

  /**
   * ─── THE CHAMBER CARRIES WHAT IS OPEN, NOT EVERYTHING EVER MADE ─────────
   *
   *   MEASURED on production 2026-09-29: this query had no LIMIT and no
   *   status filter, so every chamber open sent 21 goals and 54.4KB — every
   *   goal the Creator had ever made, including the abandoned ones, growing
   *   without end. Article 6.1: «إخفاء الأصل من العرض العادي».
   *
   *   Archived goals are EXCLUDED, not deleted, and are asked for by name
   *   through `findArchivedByTenant`. The cap is explicit so the size of this
   *   response can never again be a function of how long someone has been a
   *   Creator; `total` tells the caller how many there really are, so a bound
   *   is never mistaken for an ending.
   */
  public findByTenant(subscriberTenantId: string, limit = DEFAULT_GOAL_PAGE): readonly GoalContract[] {
    const rows = this.db
      .prepare(
        `SELECT * FROM goals
         WHERE subscriber_tenant_id = ? AND (status IS NULL OR status != ?)
         ORDER BY created_at_ms DESC LIMIT ?`,
      )
      .all(subscriberTenantId, GoalStatus.ARCHIVED, boundPage(limit)) as GoalRow[];
    return rows.map(rowToGoal);
  }

  /** The goals put away, asked for deliberately. Never loaded with the room. */
  public findArchivedByTenant(subscriberTenantId: string, limit = DEFAULT_GOAL_PAGE): readonly GoalContract[] {
    const rows = this.db
      .prepare(
        `SELECT * FROM goals
         WHERE subscriber_tenant_id = ? AND status = ?
         ORDER BY archived_at_ms DESC, created_at_ms DESC LIMIT ?`,
      )
      .all(subscriberTenantId, GoalStatus.ARCHIVED, boundPage(limit)) as GoalRow[];
    return rows.map(rowToGoal);
  }

  /** How many this Creator actually has, open and archived. A bound is not an ending. */
  public countByTenant(subscriberTenantId: string): { readonly open: number; readonly archived: number } {
    const row = this.db
      .prepare(
        `SELECT
           SUM(CASE WHEN status = ? THEN 0 ELSE 1 END) AS open_count,
           SUM(CASE WHEN status = ? THEN 1 ELSE 0 END) AS archived_count
         FROM goals WHERE subscriber_tenant_id = ?`,
      )
      .get(GoalStatus.ARCHIVED, GoalStatus.ARCHIVED, subscriberTenantId) as
        { open_count: number | null; archived_count: number | null } | undefined;
    return { open: Number(row?.open_count ?? 0), archived: Number(row?.archived_count ?? 0) };
  }

  public deleteById(goalId: string): void {
    this.db.prepare('DELETE FROM goals WHERE goal_id = ?').run(goalId);
  }

  public deleteAll(): void {
    this.db.exec('DELETE FROM goals');
  }
}
