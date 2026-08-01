/**
 * SOVEREIGN FULFILLMENT GAP FOUNDATION
 * Constitutional Foundation Package VI
 *
 * Proves that the Empire can derive a truthful, machine-readable Gap from
 * a GoalFulfillmentAssessment; that Reality Gaps and Knowledge/Observability
 * Gaps remain constitutionally distinguishable; that no causal diagnosis is
 * fabricated; that SUPPORTS_FULFILLMENT produces no gap statement; and that
 * the Gap is correctly derived by SOEL from the latest persisted assessment.
 *
 * Eight sections:
 *  1. deriveGapReport() — ASSESSMENT_NOT_POSSIBLE → EVIDENCE_AVAILABILITY
 *  2. deriveGapReport() — INSUFFICIENT_EVIDENCE → EVIDENCE_SUFFICIENCY
 *  3. deriveGapReport() — SUPPORTS_NON_FULFILLMENT → FULFILLMENT_ABSENT
 *  4. deriveGapReport() — SUPPORTS_FULFILLMENT → NO_ACTIVE_GAP, null statement
 *  5. Empty criteria → empty criterionGaps
 *  6. Lineage and historical truth — goalId/assessmentId/snapshot preserved
 *  7. Reality Gap vs Knowledge/Observability Gap are constitutionally distinct
 *  8. SOEL integration — requestGapReport()
 */

import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../db';
import { GoalRepository } from '../goal-repository';
import { FulfillmentAssessmentRepository } from '../fulfillment-assessment-repository';
import { GoalState } from '../../chambers/makman-al-ghayah/goal-state';
import { GoalStatus, GoalPriority } from '../../chambers/makman-al-ghayah/goal-contracts';
import type { GoalContract } from '../../chambers/makman-al-ghayah/goal-contracts';
import type { GoalFulfillmentAssessment, CriterionAssessment } from '../../chambers/makman-al-ghayah/fulfillment-assessment-contracts';
import { deriveGapReport } from '../../chambers/makman-al-ghayah/fulfillment-gap-engine';
import type { FulfillmentGapCategory } from '../../chambers/makman-al-ghayah/fulfillment-gap-contracts';
import { SovereignOperationalEntryLayer } from '../../sovereign-entry/soel';
import type { MakmanGoalDistributionBridge } from '../../chambers/makman-al-ghayah/MAKMAN_GOAL_DISTRIBUTION_BRIDGE';
import type { PublicConsumptionBoundary } from '../../chambers/makman-al-ghayah/consumption-boundary';
import type { PrePublishingBoundary } from '../../chambers/ras-al-amr/pre-publishing-boundary';

// ─────────────────────────────────────────────────────────────────────────────
// Test helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeGoal(overrides: Partial<GoalContract> = {}): GoalContract {
  return {
    goalId: 'goal-1',
    subscriberTenantId: 'creator-1',
    title: 'A Milestone Film',
    description: 'A constitutional production.',
    priority: GoalPriority.HIGH,
    status: GoalStatus.CREATED,
    dependencies: [],
    metrics: [],
    createdAtMs: 1_000,
    updatedAtMs: 1_000,
    ...overrides,
  };
}

function makeCriterionAssessment(
  overrides: Partial<CriterionAssessment> & { evidenceVerdict: CriterionAssessment['evidenceVerdict'] },
): CriterionAssessment {
  return {
    criterionId: 'c-1',
    criterionDescriptionSnapshot: 'Reach 10,000 views.',
    observationCount: 0,
    authorizedCount: 0,
    deniedCount: 0,
    assessedAtMs: 10_000,
    ...overrides,
  };
}

function makeAssessment(
  criterionAssessments: readonly CriterionAssessment[],
  overrides: Partial<GoalFulfillmentAssessment> = {},
): GoalFulfillmentAssessment {
  const overallVerdict =
    criterionAssessments.length === 0
      ? ('ASSESSMENT_NOT_POSSIBLE' as const)
      : criterionAssessments[0].evidenceVerdict;
  return {
    assessmentId: 'fa-test-1',
    goalId: 'goal-1',
    assessedAtMs: 10_000,
    overallVerdict,
    criterionAssessments,
    ...overrides,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ASSESSMENT_NOT_POSSIBLE → EVIDENCE_AVAILABILITY
// ─────────────────────────────────────────────────────────────────────────────

describe('Package VI — deriveGapReport(): ASSESSMENT_NOT_POSSIBLE → EVIDENCE_AVAILABILITY', () => {
  const ca = makeCriterionAssessment({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' });
  const assessment = makeAssessment([ca]);

  it('gapCategory is EVIDENCE_AVAILABILITY', () => {
    const report = deriveGapReport(assessment);
    expect(report.criterionGaps[0].gapCategory).toBe<FulfillmentGapCategory>('EVIDENCE_AVAILABILITY');
  });

  it('gapStatement is non-null and mentions the criterion description', () => {
    const report = deriveGapReport(assessment);
    const stmt = report.criterionGaps[0].gapStatement;
    expect(stmt).not.toBeNull();
    expect(stmt).toContain('Reach 10,000 views.');
  });

  it('gapStatement does not contain a causal diagnosis', () => {
    const report = deriveGapReport(assessment);
    const stmt = report.criterionGaps[0].gapStatement!;
    expect(stmt).not.toMatch(/because|caused by|reason|failed|wrong/i);
  });

  it('gapStatement does not claim the criterion has failed', () => {
    const report = deriveGapReport(assessment);
    const stmt = report.criterionGaps[0].gapStatement!;
    expect(stmt.toLowerCase()).not.toContain('has not succeeded');
    expect(stmt.toLowerCase()).not.toContain('has failed');
  });

  it('evidenceVerdict is preserved on the criterion gap', () => {
    const report = deriveGapReport(assessment);
    expect(report.criterionGaps[0].evidenceVerdict).toBe('ASSESSMENT_NOT_POSSIBLE');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. INSUFFICIENT_EVIDENCE → EVIDENCE_SUFFICIENCY
// ─────────────────────────────────────────────────────────────────────────────

describe('Package VI — deriveGapReport(): INSUFFICIENT_EVIDENCE → EVIDENCE_SUFFICIENCY', () => {
  const ca = makeCriterionAssessment({
    evidenceVerdict: 'INSUFFICIENT_EVIDENCE',
    observationCount: 5,
    authorizedCount: 3,
    deniedCount: 2,
  });
  const assessment = makeAssessment([ca]);

  it('gapCategory is EVIDENCE_SUFFICIENCY', () => {
    const report = deriveGapReport(assessment);
    expect(report.criterionGaps[0].gapCategory).toBe<FulfillmentGapCategory>('EVIDENCE_SUFFICIENCY');
  });

  it('gapStatement includes the observation count', () => {
    const report = deriveGapReport(assessment);
    expect(report.criterionGaps[0].gapStatement).toContain('5');
  });

  it('gapStatement includes the criterion description', () => {
    const report = deriveGapReport(assessment);
    expect(report.criterionGaps[0].gapStatement).toContain('Reach 10,000 views.');
  });

  it('gapStatement is non-null', () => {
    const report = deriveGapReport(assessment);
    expect(report.criterionGaps[0].gapStatement).not.toBeNull();
  });

  it('gapStatement uses singular "observation" when count is 1', () => {
    const singleObs = makeCriterionAssessment({
      evidenceVerdict: 'INSUFFICIENT_EVIDENCE',
      observationCount: 1,
    });
    const report = deriveGapReport(makeAssessment([singleObs]));
    expect(report.criterionGaps[0].gapStatement).toContain('1 consumption observation,');
  });

  it('gapStatement uses plural "observations" when count is not 1', () => {
    const report = deriveGapReport(assessment);
    expect(report.criterionGaps[0].gapStatement).toContain('observations,');
  });

  it('evidenceVerdict is preserved', () => {
    const report = deriveGapReport(assessment);
    expect(report.criterionGaps[0].evidenceVerdict).toBe('INSUFFICIENT_EVIDENCE');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. SUPPORTS_NON_FULFILLMENT → FULFILLMENT_ABSENT
// ─────────────────────────────────────────────────────────────────────────────

describe('Package VI — deriveGapReport(): SUPPORTS_NON_FULFILLMENT → FULFILLMENT_ABSENT', () => {
  const ca = makeCriterionAssessment({
    evidenceVerdict: 'SUPPORTS_NON_FULFILLMENT',
    observationCount: 10,
    authorizedCount: 0,
    deniedCount: 10,
  });
  const assessment = makeAssessment([ca]);

  it('gapCategory is FULFILLMENT_ABSENT', () => {
    const report = deriveGapReport(assessment);
    expect(report.criterionGaps[0].gapCategory).toBe<FulfillmentGapCategory>('FULFILLMENT_ABSENT');
  });

  it('gapStatement is non-null', () => {
    const report = deriveGapReport(assessment);
    expect(report.criterionGaps[0].gapStatement).not.toBeNull();
  });

  it('gapStatement includes the criterion description', () => {
    const report = deriveGapReport(assessment);
    expect(report.criterionGaps[0].gapStatement).toContain('Reach 10,000 views.');
  });

  it('gapStatement does not invent a cause', () => {
    const report = deriveGapReport(assessment);
    const stmt = report.criterionGaps[0].gapStatement!;
    expect(stmt).not.toMatch(/because|caused by|reason|targeting|audience/i);
  });

  it('evidenceVerdict is preserved', () => {
    const report = deriveGapReport(assessment);
    expect(report.criterionGaps[0].evidenceVerdict).toBe('SUPPORTS_NON_FULFILLMENT');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. SUPPORTS_FULFILLMENT → NO_ACTIVE_GAP, null statement
// ─────────────────────────────────────────────────────────────────────────────

describe('Package VI — deriveGapReport(): SUPPORTS_FULFILLMENT → NO_ACTIVE_GAP', () => {
  const ca = makeCriterionAssessment({
    evidenceVerdict: 'SUPPORTS_FULFILLMENT',
    observationCount: 20,
    authorizedCount: 20,
    deniedCount: 0,
  });
  const assessment = makeAssessment([ca]);

  it('gapCategory is NO_ACTIVE_GAP', () => {
    const report = deriveGapReport(assessment);
    expect(report.criterionGaps[0].gapCategory).toBe<FulfillmentGapCategory>('NO_ACTIVE_GAP');
  });

  it('gapStatement is null — the Empire does not fabricate a gap', () => {
    const report = deriveGapReport(assessment);
    expect(report.criterionGaps[0].gapStatement).toBeNull();
  });

  it('evidenceVerdict is preserved', () => {
    const report = deriveGapReport(assessment);
    expect(report.criterionGaps[0].evidenceVerdict).toBe('SUPPORTS_FULFILLMENT');
  });

  it('criterionDescriptionSnapshot is still preserved even when no active gap', () => {
    const report = deriveGapReport(assessment);
    expect(report.criterionGaps[0].criterionDescriptionSnapshot).toBe('Reach 10,000 views.');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Empty criteria → empty criterionGaps
// ─────────────────────────────────────────────────────────────────────────────

describe('Package VI — deriveGapReport(): empty criteria', () => {
  it('criterionGaps is empty when assessment has no criterionAssessments', () => {
    const assessment = makeAssessment([]);
    const report = deriveGapReport(assessment);
    expect(report.criterionGaps).toHaveLength(0);
  });

  it('goalId is still preserved when criteria are empty', () => {
    const assessment = makeAssessment([], { goalId: 'goal-99' });
    const report = deriveGapReport(assessment);
    expect(report.goalId).toBe('goal-99');
  });

  it('assessmentId is still preserved when criteria are empty', () => {
    const assessment = makeAssessment([], { assessmentId: 'fa-empty' });
    const report = deriveGapReport(assessment);
    expect(report.assessmentId).toBe('fa-empty');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Lineage and historical truth
// ─────────────────────────────────────────────────────────────────────────────

describe('Package VI — deriveGapReport(): lineage and historical truth', () => {
  it('goalId on report matches the assessment', () => {
    const assessment = makeAssessment([], { goalId: 'goal-abc' });
    expect(deriveGapReport(assessment).goalId).toBe('goal-abc');
  });

  it('assessmentId on report matches the assessment', () => {
    const assessment = makeAssessment([], { assessmentId: 'fa-xyz' });
    expect(deriveGapReport(assessment).assessmentId).toBe('fa-xyz');
  });

  it('goalId on each criterion gap matches the assessment goalId', () => {
    const ca = makeCriterionAssessment({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' });
    const assessment = makeAssessment([ca], { goalId: 'goal-lineage' });
    const report = deriveGapReport(assessment);
    expect(report.criterionGaps[0].goalId).toBe('goal-lineage');
  });

  it('assessmentId on each criterion gap matches the assessment assessmentId', () => {
    const ca = makeCriterionAssessment({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' });
    const assessment = makeAssessment([ca], { assessmentId: 'fa-lineage' });
    const report = deriveGapReport(assessment);
    expect(report.criterionGaps[0].assessmentId).toBe('fa-lineage');
  });

  it('criterionId on each criterion gap matches the source criterion assessment', () => {
    const ca = makeCriterionAssessment({ evidenceVerdict: 'INSUFFICIENT_EVIDENCE', criterionId: 'c-99' });
    const report = deriveGapReport(makeAssessment([ca]));
    expect(report.criterionGaps[0].criterionId).toBe('c-99');
  });

  it('criterionDescriptionSnapshot is carried forward exactly from the source assessment', () => {
    const ca = makeCriterionAssessment({
      evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE',
      criterionDescriptionSnapshot: 'Reach a new market segment in MENA.',
    });
    const report = deriveGapReport(makeAssessment([ca]));
    expect(report.criterionGaps[0].criterionDescriptionSnapshot).toBe('Reach a new market segment in MENA.');
  });

  it('identifiedAtMs matches the criterionAssessment.assessedAtMs', () => {
    const ca = makeCriterionAssessment({ evidenceVerdict: 'INSUFFICIENT_EVIDENCE', assessedAtMs: 99_000 });
    const report = deriveGapReport(makeAssessment([ca]));
    expect(report.criterionGaps[0].identifiedAtMs).toBe(99_000);
  });

  it('derivedAtMs is a positive number', () => {
    const report = deriveGapReport(makeAssessment([]));
    expect(report.derivedAtMs).toBeGreaterThan(0);
  });

  it('multiple criteria each get their own gap entry', () => {
    const ca1 = makeCriterionAssessment({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE', criterionId: 'c-1' });
    const ca2 = makeCriterionAssessment({
      evidenceVerdict: 'INSUFFICIENT_EVIDENCE',
      criterionId: 'c-2',
      observationCount: 3,
    });
    const report = deriveGapReport(makeAssessment([ca1, ca2]));
    expect(report.criterionGaps).toHaveLength(2);
    expect(report.criterionGaps[0].criterionId).toBe('c-1');
    expect(report.criterionGaps[1].criterionId).toBe('c-2');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 7. Reality Gap vs Knowledge/Observability Gap — constitutionally distinct
// ─────────────────────────────────────────────────────────────────────────────

describe('Package VI — constitutional distinction: Reality Gap vs Knowledge/Observability Gap', () => {
  it('EVIDENCE_AVAILABILITY is NOT a reality gap — must not be FULFILLMENT_ABSENT', () => {
    const ca = makeCriterionAssessment({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' });
    const gap = deriveGapReport(makeAssessment([ca])).criterionGaps[0];
    expect(gap.gapCategory).not.toBe<FulfillmentGapCategory>('FULFILLMENT_ABSENT');
  });

  it('EVIDENCE_SUFFICIENCY is NOT a reality gap — must not be FULFILLMENT_ABSENT', () => {
    const ca = makeCriterionAssessment({ evidenceVerdict: 'INSUFFICIENT_EVIDENCE', observationCount: 5 });
    const gap = deriveGapReport(makeAssessment([ca])).criterionGaps[0];
    expect(gap.gapCategory).not.toBe<FulfillmentGapCategory>('FULFILLMENT_ABSENT');
  });

  it('only SUPPORTS_NON_FULFILLMENT maps to FULFILLMENT_ABSENT (the reality gap)', () => {
    const ca = makeCriterionAssessment({ evidenceVerdict: 'SUPPORTS_NON_FULFILLMENT' });
    const gap = deriveGapReport(makeAssessment([ca])).criterionGaps[0];
    expect(gap.gapCategory).toBe<FulfillmentGapCategory>('FULFILLMENT_ABSENT');
  });

  it('EVIDENCE_AVAILABILITY and EVIDENCE_SUFFICIENCY produce different gap categories', () => {
    const caAvail = makeCriterionAssessment({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' });
    const caSuff = makeCriterionAssessment({ evidenceVerdict: 'INSUFFICIENT_EVIDENCE', observationCount: 3 });
    const gapAvail = deriveGapReport(makeAssessment([caAvail])).criterionGaps[0];
    const gapSuff = deriveGapReport(makeAssessment([caSuff])).criterionGaps[0];
    expect(gapAvail.gapCategory).not.toBe(gapSuff.gapCategory);
  });

  it('EVIDENCE_AVAILABILITY statement does not claim the outcome has not occurred', () => {
    const ca = makeCriterionAssessment({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' });
    const stmt = deriveGapReport(makeAssessment([ca])).criterionGaps[0].gapStatement!;
    expect(stmt.toLowerCase()).not.toContain('has not been fulfilled');
    expect(stmt.toLowerCase()).not.toContain('has not succeeded');
  });

  it('EVIDENCE_SUFFICIENCY statement does not claim the outcome has not occurred', () => {
    const ca = makeCriterionAssessment({ evidenceVerdict: 'INSUFFICIENT_EVIDENCE', observationCount: 7 });
    const stmt = deriveGapReport(makeAssessment([ca])).criterionGaps[0].gapStatement!;
    expect(stmt.toLowerCase()).not.toContain('has not been fulfilled');
    expect(stmt.toLowerCase()).not.toContain('has not succeeded');
  });

  it('all four gap categories are reachable and mutually exclusive for a given verdict', () => {
    const caAvail = makeCriterionAssessment({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' });
    const caSuff = makeCriterionAssessment({ evidenceVerdict: 'INSUFFICIENT_EVIDENCE', observationCount: 1 });
    const caAbsent = makeCriterionAssessment({ evidenceVerdict: 'SUPPORTS_NON_FULFILLMENT' });
    const caFulfilled = makeCriterionAssessment({ evidenceVerdict: 'SUPPORTS_FULFILLMENT' });
    const categories = [caAvail, caSuff, caAbsent, caFulfilled].map(
      (ca) => deriveGapReport(makeAssessment([ca])).criterionGaps[0].gapCategory,
    );
    expect(new Set(categories).size).toBe(4);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 8. SOEL integration — requestGapReport()
// ─────────────────────────────────────────────────────────────────────────────

describe('Package VI — SOEL integration: requestGapReport()', () => {
  let db: DatabaseSync;

  beforeEach(() => { db = createDatabase(':memory:'); });
  afterEach(() => db.close());

  function makeSoel(seedGoal?: GoalContract, seedAssessment?: GoalFulfillmentAssessment) {
    const goalRepo = new GoalRepository(db);
    const goalState = new GoalState(goalRepo);
    if (seedGoal) goalState.register(seedGoal);

    const assessRepo = new FulfillmentAssessmentRepository(db);
    if (seedAssessment) assessRepo.save(seedAssessment, seedGoal?.subscriberTenantId ?? 'creator-1');

    return new SovereignOperationalEntryLayer(
      goalState,
      {} as MakmanGoalDistributionBridge,
      {} as PublicConsumptionBoundary,
      {} as PrePublishingBoundary,
      undefined,
      undefined,
      assessRepo,
    );
  }

  it('returns ok:false GOAL_NOT_FOUND when goal does not exist', () => {
    const soel = makeSoel();
    const outcome = soel.requestGapReport('no-such-goal', 'creator-1');
    expect(outcome.ok).toBe(false);
    expect(!outcome.ok && outcome.reason).toBe('GOAL_NOT_FOUND');
  });

  it('returns ok:false GOAL_NOT_FOUND for a goal belonging to a different Creator', () => {
    const goal = makeGoal({ subscriberTenantId: 'creator-2' });
    const soel = makeSoel(goal);
    const outcome = soel.requestGapReport('goal-1', 'creator-1');
    expect(outcome.ok).toBe(false);
    expect(!outcome.ok && outcome.reason).toBe('GOAL_NOT_FOUND');
  });

  it('returns ok:false NO_ASSESSMENT_AVAILABLE when no assessment has been made yet', () => {
    const goal = makeGoal();
    const soel = makeSoel(goal);
    const outcome = soel.requestGapReport('goal-1', 'creator-1');
    expect(outcome.ok).toBe(false);
    expect(!outcome.ok && outcome.reason).toBe('NO_ASSESSMENT_AVAILABLE');
  });

  it('returns ok:true with a gap report when an assessment exists', () => {
    const goal = makeGoal();
    const ca = makeCriterionAssessment({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' });
    const assessment = makeAssessment([ca]);
    const soel = makeSoel(goal, assessment);
    const outcome = soel.requestGapReport('goal-1', 'creator-1');
    expect(outcome.ok).toBe(true);
  });

  it('gap report goalId matches the Goal', () => {
    const goal = makeGoal({ goalId: 'goal-9' });
    const assessment = makeAssessment([], { goalId: 'goal-9' });
    const soel = makeSoel(goal, assessment);
    const outcome = soel.requestGapReport('goal-9', 'creator-1');
    expect(outcome.ok && outcome.gapReport.goalId).toBe('goal-9');
  });

  it('gap report assessmentId matches the assessment', () => {
    const goal = makeGoal();
    const ca = makeCriterionAssessment({ evidenceVerdict: 'INSUFFICIENT_EVIDENCE', observationCount: 2 });
    const assessment = makeAssessment([ca], { assessmentId: 'fa-specific' });
    const soel = makeSoel(goal, assessment);
    const outcome = soel.requestGapReport('goal-1', 'creator-1');
    expect(outcome.ok && outcome.gapReport.assessmentId).toBe('fa-specific');
  });

  it('gap report derives from the LATEST assessment (most recently saved)', () => {
    const goal = makeGoal();
    const goalRepo = new GoalRepository(db);
    const goalState = new GoalState(goalRepo);
    goalState.register(goal);

    const assessRepo = new FulfillmentAssessmentRepository(db);
    const old = makeAssessment([], { assessmentId: 'fa-old' });
    const latest = makeAssessment(
      [makeCriterionAssessment({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' })],
      { assessmentId: 'fa-latest' },
    );
    assessRepo.save(old, 'creator-1');
    assessRepo.save(latest, 'creator-1');

    const soel = new SovereignOperationalEntryLayer(
      goalState,
      {} as MakmanGoalDistributionBridge,
      {} as PublicConsumptionBoundary,
      {} as PrePublishingBoundary,
      undefined,
      undefined,
      assessRepo,
    );

    const outcome = soel.requestGapReport('goal-1', 'creator-1');
    expect(outcome.ok && outcome.gapReport.assessmentId).toBe('fa-latest');
  });

  it('criterion gaps in the report reflect the latest assessment criteria', () => {
    const goal = makeGoal();
    const ca = makeCriterionAssessment({
      evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE',
      criterionDescriptionSnapshot: 'Achieve 10M impressions.',
    });
    const assessment = makeAssessment([ca]);
    const soel = makeSoel(goal, assessment);
    const outcome = soel.requestGapReport('goal-1', 'creator-1');
    expect(outcome.ok && outcome.gapReport.criterionGaps[0].criterionDescriptionSnapshot).toBe('Achieve 10M impressions.');
  });
});
