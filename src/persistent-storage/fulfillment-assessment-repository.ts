/**
 * AZMA OS — PERSISTENT STORAGE
 * Fulfillment Assessment Repository
 *
 * FULFILLMENT ASSESSMENT FOUNDATION — Constitutional Foundation Package V
 *
 * Implements IFulfillmentAssessmentStore via the `fulfillment_assessments`
 * SQLite table. Each persisted row is an immutable historical snapshot of
 * the Empire's judgment at a specific point in time — it is never updated,
 * only appended. Past assessments survive Creator criteria changes because
 * `criteria_assessments_json` snapshots the criterion descriptions at the
 * moment the assessment was drawn, not references to the current live criteria.
 *
 * `publisher_tenant_id` is passed by SOEL from the verified session at write
 * time and stored for tenant-isolated reads — no join required.
 */

import type { DatabaseSync } from 'node:sqlite';
import type {
  IFulfillmentAssessmentStore,
  GoalFulfillmentAssessment,
  CriterionAssessment,
  CriterionEvidenceVerdict,
} from '../chambers/makman-al-ghayah/fulfillment-assessment-contracts';

interface AssessmentRow {
  assessment_id: string;
  goal_id: string;
  publisher_tenant_id: string;
  assessed_at_ms: number;
  overall_verdict: string;
  criteria_assessments_json: string;
}

function rowToAssessment(row: AssessmentRow): GoalFulfillmentAssessment {
  const criterionAssessments = JSON.parse(row.criteria_assessments_json) as CriterionAssessment[];
  return {
    assessmentId: row.assessment_id,
    goalId: row.goal_id,
    assessedAtMs: row.assessed_at_ms,
    overallVerdict: row.overall_verdict as CriterionEvidenceVerdict,
    criterionAssessments,
  };
}

export class FulfillmentAssessmentRepository implements IFulfillmentAssessmentStore {
  constructor(private readonly db: DatabaseSync) {}

  public save(assessment: GoalFulfillmentAssessment, creatorId: string): void {
    this.db
      .prepare(
        `INSERT INTO fulfillment_assessments
          (assessment_id, goal_id, publisher_tenant_id, assessed_at_ms, overall_verdict, criteria_assessments_json)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        assessment.assessmentId,
        assessment.goalId,
        creatorId,
        assessment.assessedAtMs,
        assessment.overallVerdict,
        JSON.stringify(assessment.criterionAssessments),
      );
  }

  public findLatestForGoal(goalId: string, creatorId: string): GoalFulfillmentAssessment | null {
    const row = this.db
      .prepare(
        'SELECT * FROM fulfillment_assessments WHERE goal_id = ? AND publisher_tenant_id = ? ORDER BY assessed_at_ms DESC, ROWID DESC LIMIT 1',
      )
      .get(goalId, creatorId) as unknown as AssessmentRow | undefined;

    return row ? rowToAssessment(row) : null;
  }

  public listForGoal(goalId: string, creatorId: string): readonly GoalFulfillmentAssessment[] {
    const rows = this.db
      .prepare(
        'SELECT * FROM fulfillment_assessments WHERE goal_id = ? AND publisher_tenant_id = ? ORDER BY assessed_at_ms DESC, ROWID DESC',
      )
      .all(goalId, creatorId) as unknown as AssessmentRow[];

    return rows.map(rowToAssessment);
  }
}
