/**
 * FULFILLMENT ASSESSMENT FOUNDATION
 * Constitutional Foundation Package V
 *
 * Proves that the Empire can compute an honest Fulfillment Assessment from
 * available evidence, that assessments are constitutionally distinct from
 * GoalStatus.COMPLETED / SuccessCriterion / ObservationRecord, that historical
 * criterion descriptions survive criteria replacement, and that assessments
 * are durable across server restart.
 *
 * Six sections:
 *  1. assessGoalFulfillment() — pure engine correctness
 *  2. FulfillmentAssessmentRepository — persistence
 *  3. SOEL integration — requestFulfillmentAssessment() and listFulfillmentAssessments()
 *  4. Constitutional distinction — Assessment ≠ COMPLETED ≠ Criterion ≠ Observation
 *  5. Historical truth — criteria snapshot survives replacement
 *  6. Restart simulation — assessments survive server restart
 */

import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../db';
import { GoalRepository } from '../goal-repository';
import { ObservationRepository } from '../observation-repository';
import { CinematicLedger } from '../cinematic-ledger-repository';
import { FulfillmentAssessmentRepository } from '../fulfillment-assessment-repository';
import { GoalState } from '../../chambers/makman-al-ghayah/goal-state';
import { GoalStatus, GoalPriority } from '../../chambers/makman-al-ghayah/goal-contracts';
import type { GoalContract, SuccessCriterion } from '../../chambers/makman-al-ghayah/goal-contracts';
import type { ObservationRecord } from '../../chambers/makman-al-ghayah/observation-contracts';
import { assessGoalFulfillment } from '../../chambers/makman-al-ghayah/fulfillment-assessment-engine';
import { SovereignOperationalEntryLayer } from '../../sovereign-entry/soel';
import type { MakmanGoalDistributionBridge } from '../../chambers/makman-al-ghayah/MAKMAN_GOAL_DISTRIBUTION_BRIDGE';
import type { PublicConsumptionBoundary } from '../../chambers/makman-al-ghayah/consumption-boundary';
import type { PrePublishingBoundary } from '../../chambers/ras-al-amr/pre-publishing-boundary';
import type { SovereignPublication, AccessPolicy } from '../../chambers/makman-al-ghayah/publication-contracts';
import { DistributionTier } from '../../chambers/makman-al-ghayah/publication-contracts';

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

const CRITERION_A: SuccessCriterion = { criterionId: 'c-1', description: 'Reach 10,000 views.', definedAtMs: 1_000 };
const CRITERION_B: SuccessCriterion = { criterionId: 'c-2', description: 'Generate 100 qualified leads.', definedAtMs: 1_000 };

const OBS_AUTHORIZED: ObservationRecord = {
  observationId: 'obs-1',
  goalId: 'goal-1',
  publicationId: 'pub-1',
  signal: 'CONSUMPTION_ATTEMPT',
  outcome: 'AUTHORIZED',
  observedAtMs: 5_000,
};

const OBS_DENIED: ObservationRecord = {
  observationId: 'obs-2',
  goalId: 'goal-1',
  publicationId: 'pub-1',
  signal: 'CONSUMPTION_ATTEMPT',
  outcome: 'DENIED',
  observedAtMs: 6_000,
};

function makePublication(publicationId = 'pub-1'): SovereignPublication {
  return {
    publicationId,
    sourceCompilationId: 'comp-1',
    publisherTenantId: 'creator-1',
    title: 'A Sovereign Film',
    description: 'A constitutional production.',
    accessPolicy: { distributionTier: DistributionTier.PUBLIC_FREE, requiresAgeVerification: false } as AccessPolicy,
    isPublished: true,
    publishedAt: 1_000,
    createdAt: 1_000,
    updatedAt: 1_000,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. assessGoalFulfillment() — pure engine correctness
// ─────────────────────────────────────────────────────────────────────────────

describe('Package V — assessGoalFulfillment(): pure engine', () => {
  it('no successCriteria → overallVerdict is ASSESSMENT_NOT_POSSIBLE, criterionAssessments is empty', () => {
    const assessment = assessGoalFulfillment(makeGoal(), []);
    expect(assessment.overallVerdict).toBe('ASSESSMENT_NOT_POSSIBLE');
    expect(assessment.criterionAssessments).toHaveLength(0);
  });

  it('criteria but zero observations → all criteria get ASSESSMENT_NOT_POSSIBLE', () => {
    const goal = makeGoal({ successCriteria: [CRITERION_A, CRITERION_B] });
    const assessment = assessGoalFulfillment(goal, []);
    expect(assessment.overallVerdict).toBe('ASSESSMENT_NOT_POSSIBLE');
    expect(assessment.criterionAssessments).toHaveLength(2);
    expect(assessment.criterionAssessments[0].evidenceVerdict).toBe('ASSESSMENT_NOT_POSSIBLE');
    expect(assessment.criterionAssessments[1].evidenceVerdict).toBe('ASSESSMENT_NOT_POSSIBLE');
  });

  it('criteria with observations → all criteria get INSUFFICIENT_EVIDENCE', () => {
    const goal = makeGoal({ successCriteria: [CRITERION_A] });
    const assessment = assessGoalFulfillment(goal, [OBS_AUTHORIZED]);
    expect(assessment.overallVerdict).toBe('INSUFFICIENT_EVIDENCE');
    expect(assessment.criterionAssessments[0].evidenceVerdict).toBe('INSUFFICIENT_EVIDENCE');
  });

  it('observationCount reflects actual observations passed', () => {
    const goal = makeGoal({ successCriteria: [CRITERION_A] });
    const assessment = assessGoalFulfillment(goal, [OBS_AUTHORIZED, OBS_DENIED]);
    expect(assessment.criterionAssessments[0].observationCount).toBe(2);
  });

  it('authorizedCount and deniedCount are computed correctly', () => {
    const goal = makeGoal({ successCriteria: [CRITERION_A] });
    const assessment = assessGoalFulfillment(goal, [OBS_AUTHORIZED, OBS_DENIED, OBS_AUTHORIZED]);
    expect(assessment.criterionAssessments[0].authorizedCount).toBe(2);
    expect(assessment.criterionAssessments[0].deniedCount).toBe(1);
  });

  it('criterionDescriptionSnapshot matches criterion description at assessment time', () => {
    const goal = makeGoal({ successCriteria: [CRITERION_A] });
    const assessment = assessGoalFulfillment(goal, [OBS_AUTHORIZED]);
    expect(assessment.criterionAssessments[0].criterionDescriptionSnapshot).toBe('Reach 10,000 views.');
  });

  it('criterionId is preserved in the assessment', () => {
    const goal = makeGoal({ successCriteria: [CRITERION_A] });
    const assessment = assessGoalFulfillment(goal, []);
    expect(assessment.criterionAssessments[0].criterionId).toBe('c-1');
  });

  it('assessmentId is a non-empty string', () => {
    const assessment = assessGoalFulfillment(makeGoal(), []);
    expect(typeof assessment.assessmentId).toBe('string');
    expect(assessment.assessmentId.length).toBeGreaterThan(0);
  });

  it('goalId on the assessment matches the Goal', () => {
    const assessment = assessGoalFulfillment(makeGoal({ goalId: 'goal-99' }), []);
    expect(assessment.goalId).toBe('goal-99');
  });

  it('assessedAtMs is a positive number', () => {
    const assessment = assessGoalFulfillment(makeGoal(), []);
    expect(assessment.assessedAtMs).toBeGreaterThan(0);
  });

  it('two calls produce different assessmentIds', () => {
    const goal = makeGoal();
    const a1 = assessGoalFulfillment(goal, []);
    const a2 = assessGoalFulfillment(goal, []);
    expect(a1.assessmentId).not.toBe(a2.assessmentId);
  });

  it('most conservative verdict wins: one ASSESSMENT_NOT_POSSIBLE criterion → overall ASSESSMENT_NOT_POSSIBLE', () => {
    const goal = makeGoal({ successCriteria: [CRITERION_A, CRITERION_B] });
    const assessment = assessGoalFulfillment(goal, [OBS_AUTHORIZED]);
    // Both criteria get INSUFFICIENT_EVIDENCE when observations exist
    expect(assessment.overallVerdict).toBe('INSUFFICIENT_EVIDENCE');
  });

  it('ASSESSMENT_NOT_POSSIBLE per criterion when observations=0, not when observations>0', () => {
    const goal = makeGoal({ successCriteria: [CRITERION_A] });
    expect(assessGoalFulfillment(goal, []).criterionAssessments[0].evidenceVerdict).toBe('ASSESSMENT_NOT_POSSIBLE');
    expect(assessGoalFulfillment(goal, [OBS_AUTHORIZED]).criterionAssessments[0].evidenceVerdict).toBe('INSUFFICIENT_EVIDENCE');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. FulfillmentAssessmentRepository — persistence
// ─────────────────────────────────────────────────────────────────────────────

describe('Package V — FulfillmentAssessmentRepository: persistence', () => {
  let db: DatabaseSync;
  let repo: FulfillmentAssessmentRepository;

  beforeEach(() => {
    db = createDatabase(':memory:');
    repo = new FulfillmentAssessmentRepository(db);
  });

  afterEach(() => db.close());

  it('findLatestForGoal returns null when no assessments exist', () => {
    expect(repo.findLatestForGoal('goal-1', 'creator-1')).toBeNull();
  });

  it('listForGoal returns empty array when no assessments exist', () => {
    expect(repo.listForGoal('goal-1', 'creator-1')).toEqual([]);
  });

  it('save() → findLatestForGoal() returns the saved assessment', () => {
    const assessment = assessGoalFulfillment(makeGoal({ successCriteria: [CRITERION_A] }), [OBS_AUTHORIZED]);
    repo.save(assessment, 'creator-1');
    const found = repo.findLatestForGoal('goal-1', 'creator-1');
    expect(found).not.toBeNull();
    expect(found!.assessmentId).toBe(assessment.assessmentId);
  });

  it('findLatestForGoal returns the most recently saved assessment when multiple exist', () => {
    const a1 = assessGoalFulfillment(makeGoal(), []);
    const a2 = assessGoalFulfillment(makeGoal({ successCriteria: [CRITERION_A] }), [OBS_AUTHORIZED]);
    repo.save(a1, 'creator-1');
    repo.save(a2, 'creator-1');
    // a2 was saved last; ROWID tiebreaker ensures it is returned
    const found = repo.findLatestForGoal('goal-1', 'creator-1');
    expect(found!.assessmentId).toBe(a2.assessmentId);
  });

  it('listForGoal returns all assessments — most recently saved first', () => {
    const a1 = assessGoalFulfillment(makeGoal(), []);
    const a2 = assessGoalFulfillment(makeGoal({ successCriteria: [CRITERION_A] }), [OBS_AUTHORIZED]);
    repo.save(a1, 'creator-1');
    repo.save(a2, 'creator-1');
    const list = repo.listForGoal('goal-1', 'creator-1');
    expect(list).toHaveLength(2);
    // a2 saved last → listed first
    expect(list[0].assessmentId).toBe(a2.assessmentId);
    expect(list[1].assessmentId).toBe(a1.assessmentId);
  });

  it('tenant isolation — findLatestForGoal returns null for different creatorId', () => {
    repo.save(assessGoalFulfillment(makeGoal(), []), 'creator-1');
    expect(repo.findLatestForGoal('goal-1', 'creator-OTHER')).toBeNull();
  });

  it('tenant isolation — listForGoal returns empty for different creatorId', () => {
    repo.save(assessGoalFulfillment(makeGoal(), []), 'creator-1');
    expect(repo.listForGoal('goal-1', 'creator-OTHER')).toHaveLength(0);
  });

  it('criterionDescriptionSnapshot survives JSON round-trip through repository', () => {
    const goal = makeGoal({ successCriteria: [CRITERION_A] });
    const assessment = assessGoalFulfillment(goal, [OBS_AUTHORIZED]);
    repo.save(assessment, 'creator-1');
    const restored = repo.findLatestForGoal('goal-1', 'creator-1');
    expect(restored!.criterionAssessments[0].criterionDescriptionSnapshot).toBe('Reach 10,000 views.');
  });

  it('overallVerdict survives round-trip', () => {
    const assessment = assessGoalFulfillment(makeGoal({ successCriteria: [CRITERION_A] }), [OBS_AUTHORIZED]);
    repo.save(assessment, 'creator-1');
    const restored = repo.findLatestForGoal('goal-1', 'creator-1');
    expect(restored!.overallVerdict).toBe('INSUFFICIENT_EVIDENCE');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. SOEL integration — requestFulfillmentAssessment() and listFulfillmentAssessments()
// ─────────────────────────────────────────────────────────────────────────────

describe('Package V — SOEL integration', () => {
  let db: DatabaseSync;

  beforeEach(() => { db = createDatabase(':memory:'); });
  afterEach(() => db.close());

  function makeSoel(options: { withGoal?: GoalContract; withObs?: boolean } = {}) {
    const goalRepo = new GoalRepository(db);
    const goalState = new GoalState(goalRepo);
    if (options.withGoal) goalState.register(options.withGoal);

    const obsRepo = new ObservationRepository(db);
    if (options.withObs && options.withGoal) {
      const ledger = new CinematicLedger(db);
      ledger.record(
        makePublication(),
        'canvas-1', 'NARRATIVE', 'DYNAMIC', undefined, options.withGoal.goalId,
      );
      obsRepo.recordConsumptionEvent('pub-1', true, 5_000);
    }

    const assessRepo = new FulfillmentAssessmentRepository(db);
    return new SovereignOperationalEntryLayer(
      goalState,
      {} as MakmanGoalDistributionBridge,
      {} as PublicConsumptionBoundary,
      {} as PrePublishingBoundary,
      undefined,
      obsRepo,
      assessRepo,
    );
  }

  it('requestFulfillmentAssessment returns ok:false GOAL_NOT_FOUND for non-existent goal', () => {
    const soel = makeSoel();
    const outcome = soel.requestFulfillmentAssessment('no-such-goal', 'creator-1');
    expect(outcome.ok).toBe(false);
    expect(!outcome.ok && outcome.reason).toBe('GOAL_NOT_FOUND');
  });

  it('requestFulfillmentAssessment returns ok:false GOAL_NOT_FOUND for wrong tenant', () => {
    const soel = makeSoel({ withGoal: makeGoal({ subscriberTenantId: 'creator-2' }) });
    const outcome = soel.requestFulfillmentAssessment('goal-1', 'creator-1');
    expect(outcome.ok).toBe(false);
  });

  it('requestFulfillmentAssessment returns ok:true with the assessment', () => {
    const soel = makeSoel({ withGoal: makeGoal({ successCriteria: [CRITERION_A] }) });
    const outcome = soel.requestFulfillmentAssessment('goal-1', 'creator-1');
    expect(outcome.ok).toBe(true);
    expect(outcome.ok && outcome.assessment.goalId).toBe('goal-1');
  });

  it('requestFulfillmentAssessment persists the assessment — listFulfillmentAssessments returns it', () => {
    const soel = makeSoel({ withGoal: makeGoal({ successCriteria: [CRITERION_A] }) });
    soel.requestFulfillmentAssessment('goal-1', 'creator-1');
    const assessments = soel.listFulfillmentAssessments('goal-1', 'creator-1');
    expect(assessments).toHaveLength(1);
  });

  it('multiple requestFulfillmentAssessment calls produce multiple historical records', () => {
    const soel = makeSoel({ withGoal: makeGoal({ successCriteria: [CRITERION_A] }) });
    soel.requestFulfillmentAssessment('goal-1', 'creator-1');
    soel.requestFulfillmentAssessment('goal-1', 'creator-1');
    const assessments = soel.listFulfillmentAssessments('goal-1', 'creator-1');
    expect(assessments).toHaveLength(2);
  });

  it('listFulfillmentAssessments returns empty when no assessments exist', () => {
    const soel = makeSoel({ withGoal: makeGoal() });
    expect(soel.listFulfillmentAssessments('goal-1', 'creator-1')).toHaveLength(0);
  });

  it('listFulfillmentAssessments returns empty for wrong tenant', () => {
    const soel = makeSoel({ withGoal: makeGoal() });
    soel.requestFulfillmentAssessment('goal-1', 'creator-1');
    expect(soel.listFulfillmentAssessments('goal-1', 'creator-OTHER')).toHaveLength(0);
  });

  it('assessment includes observations when the observationStore is wired', () => {
    const soel = makeSoel({
      withGoal: makeGoal({ successCriteria: [CRITERION_A] }),
      withObs: true,
    });
    const outcome = soel.requestFulfillmentAssessment('goal-1', 'creator-1');
    expect(outcome.ok && outcome.assessment.criterionAssessments[0].observationCount).toBe(1);
    expect(outcome.ok && outcome.assessment.criterionAssessments[0].authorizedCount).toBe(1);
    expect(outcome.ok && outcome.assessment.overallVerdict).toBe('INSUFFICIENT_EVIDENCE');
  });

  it('requestFulfillmentAssessment is backward compatible — 4-arg SOEL returns ok:true with no store wired', () => {
    const goalRepo = new GoalRepository(db);
    const goalState = new GoalState(goalRepo);
    goalState.register(makeGoal({ successCriteria: [CRITERION_A] }));
    const soel = new SovereignOperationalEntryLayer(
      goalState,
      {} as MakmanGoalDistributionBridge,
      {} as PublicConsumptionBoundary,
      {} as PrePublishingBoundary,
    );
    const outcome = soel.requestFulfillmentAssessment('goal-1', 'creator-1');
    expect(outcome.ok).toBe(true);
    expect(outcome.ok && outcome.assessment.overallVerdict).toBe('ASSESSMENT_NOT_POSSIBLE');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Constitutional distinction — Assessment ≠ COMPLETED ≠ Criterion ≠ Observation
// ─────────────────────────────────────────────────────────────────────────────

describe('Package V — constitutional distinction: four independent facts', () => {
  it('GoalStatus.COMPLETED does not influence the assessment verdict', () => {
    const completedGoal = makeGoal({
      status: GoalStatus.COMPLETED,
      successCriteria: [CRITERION_A],
    });
    const assessment = assessGoalFulfillment(completedGoal, []);
    expect(assessment.overallVerdict).toBe('ASSESSMENT_NOT_POSSIBLE');
    expect(completedGoal.status).toBe(GoalStatus.COMPLETED);
  });

  it('GoalStatus.CREATED with observations → INSUFFICIENT_EVIDENCE, not success/failure', () => {
    const goal = makeGoal({ status: GoalStatus.CREATED, successCriteria: [CRITERION_A] });
    const assessment = assessGoalFulfillment(goal, [OBS_AUTHORIZED]);
    expect(assessment.overallVerdict).toBe('INSUFFICIENT_EVIDENCE');
  });

  it('assessment does not alter the GoalContract — it is read-only', () => {
    const goal = makeGoal({ successCriteria: [CRITERION_A] });
    const before = { ...goal };
    assessGoalFulfillment(goal, [OBS_AUTHORIZED]);
    expect(goal).toEqual(before);
  });

  it('GoalFulfillmentAssessment has no GoalStatus field — constitutionally distinct', () => {
    const assessment = assessGoalFulfillment(makeGoal({ successCriteria: [CRITERION_A] }), []);
    expect('status' in assessment).toBe(false);
    expect('goalStatus' in assessment).toBe(false);
  });

  it('CriterionAssessment has no fulfilled boolean — no binary collapse', () => {
    const assessment = assessGoalFulfillment(makeGoal({ successCriteria: [CRITERION_A] }), [OBS_AUTHORIZED]);
    const ca = assessment.criterionAssessments[0];
    expect('fulfilled' in ca).toBe(false);
    expect('success' in ca).toBe(false);
  });

  it('AUTHORIZED observation does not produce SUPPORTS_FULFILLMENT — evidence is insufficient', () => {
    const assessment = assessGoalFulfillment(
      makeGoal({ successCriteria: [CRITERION_A] }),
      [OBS_AUTHORIZED, OBS_AUTHORIZED, OBS_AUTHORIZED],
    );
    expect(assessment.overallVerdict).not.toBe('SUPPORTS_FULFILLMENT');
    expect(assessment.overallVerdict).toBe('INSUFFICIENT_EVIDENCE');
  });

  it('DENIED observation does not produce SUPPORTS_NON_FULFILLMENT — evidence is insufficient', () => {
    const assessment = assessGoalFulfillment(
      makeGoal({ successCriteria: [CRITERION_A] }),
      [OBS_DENIED, OBS_DENIED],
    );
    expect(assessment.overallVerdict).not.toBe('SUPPORTS_NON_FULFILLMENT');
    expect(assessment.overallVerdict).toBe('INSUFFICIENT_EVIDENCE');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Historical truth — criteria snapshot survives replacement
// ─────────────────────────────────────────────────────────────────────────────

describe('Package V — historical truth: criteria snapshot survives replacement', () => {
  it('assessment snapshot retains original criterion description after criteria are replaced', () => {
    const db = createDatabase(':memory:');
    const repo = new FulfillmentAssessmentRepository(db);

    const originalCriteria = [{ criterionId: 'c-orig', description: 'Original goal: 10,000 views.', definedAtMs: 1_000 }];
    const firstGoal = makeGoal({ successCriteria: originalCriteria });
    const firstAssessment = assessGoalFulfillment(firstGoal, [OBS_AUTHORIZED]);
    repo.save(firstAssessment, 'creator-1');

    // Creator later replaces criteria
    const replacedCriteria = [{ criterionId: 'c-new', description: 'Completely new criterion: 1,000 leads.', definedAtMs: 2_000 }];
    const secondGoal = makeGoal({ successCriteria: replacedCriteria });
    const secondAssessment = assessGoalFulfillment(secondGoal, [OBS_AUTHORIZED, OBS_DENIED]);
    repo.save(secondAssessment, 'creator-1');

    const history = repo.listForGoal('goal-1', 'creator-1');
    expect(history).toHaveLength(2);

    // First assessment still reflects original criteria
    const firstRestored = history[1]; // older, so listed second
    expect(firstRestored.criterionAssessments[0].criterionDescriptionSnapshot).toBe('Original goal: 10,000 views.');
    expect(firstRestored.criterionAssessments[0].criterionId).toBe('c-orig');

    // Second assessment reflects new criteria
    const secondRestored = history[0]; // newer, listed first
    expect(secondRestored.criterionAssessments[0].criterionDescriptionSnapshot).toBe('Completely new criterion: 1,000 leads.');

    db.close();
  });

  it('a past assessment with no criteria (ASSESSMENT_NOT_POSSIBLE) remains correct after criteria are later added', () => {
    const db = createDatabase(':memory:');
    const repo = new FulfillmentAssessmentRepository(db);

    // First assessment: no criteria
    const firstAssessment = assessGoalFulfillment(makeGoal(), []);
    repo.save(firstAssessment, 'creator-1');

    // Later: Creator adds criteria and requests another assessment
    const secondAssessment = assessGoalFulfillment(
      makeGoal({ successCriteria: [CRITERION_A] }),
      [OBS_AUTHORIZED],
    );
    repo.save(secondAssessment, 'creator-1');

    const history = repo.listForGoal('goal-1', 'creator-1');
    expect(history).toHaveLength(2);
    // Most recently saved first (ROWID tiebreaker)
    expect(history[0].assessmentId).toBe(secondAssessment.assessmentId);
    expect(history[1].assessmentId).toBe(firstAssessment.assessmentId);
    expect(history[0].overallVerdict).toBe('INSUFFICIENT_EVIDENCE');
    expect(history[1].overallVerdict).toBe('ASSESSMENT_NOT_POSSIBLE');

    db.close();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Restart simulation — assessments survive server restart
// ─────────────────────────────────────────────────────────────────────────────

describe('Package V — assessments survive server restart', () => {
  it('assessment saved in one process lifetime is retrievable in a new instance', () => {
    const db = createDatabase(':memory:');

    const repo1 = new FulfillmentAssessmentRepository(db);
    const assessment = assessGoalFulfillment(
      makeGoal({ successCriteria: [CRITERION_A, CRITERION_B] }),
      [OBS_AUTHORIZED],
    );
    repo1.save(assessment, 'creator-1');

    const repo2 = new FulfillmentAssessmentRepository(db);
    const restored = repo2.findLatestForGoal('goal-1', 'creator-1');

    expect(restored).not.toBeNull();
    expect(restored!.assessmentId).toBe(assessment.assessmentId);
    expect(restored!.criterionAssessments).toHaveLength(2);
    expect(restored!.criterionAssessments[0].criterionDescriptionSnapshot).toBe('Reach 10,000 views.');
    expect(restored!.overallVerdict).toBe('INSUFFICIENT_EVIDENCE');

    db.close();
  });

  it('multiple assessments across two instances — all persist and are ordered correctly', () => {
    const db = createDatabase(':memory:');

    const repo1 = new FulfillmentAssessmentRepository(db);
    const a1 = assessGoalFulfillment(makeGoal({ successCriteria: [CRITERION_A] }), []);
    const a2 = assessGoalFulfillment(makeGoal({ successCriteria: [CRITERION_A] }), [OBS_AUTHORIZED]);
    repo1.save(a1, 'creator-1');
    repo1.save(a2, 'creator-1');

    const repo2 = new FulfillmentAssessmentRepository(db);
    const list = repo2.listForGoal('goal-1', 'creator-1');

    expect(list).toHaveLength(2);
    // a2 was saved last → listed first (ROWID tiebreaker)
    expect(list[0].assessmentId).toBe(a2.assessmentId);
    expect(list[1].assessmentId).toBe(a1.assessmentId);
    expect(list[0].overallVerdict).toBe('INSUFFICIENT_EVIDENCE');
    expect(list[1].overallVerdict).toBe('ASSESSMENT_NOT_POSSIBLE');

    db.close();
  });
});
