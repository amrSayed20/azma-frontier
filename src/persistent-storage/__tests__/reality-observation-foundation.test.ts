/**
 * REALITY OBSERVATION FOUNDATION
 * Constitutional Foundation Package IV
 *
 * Proves that the platform can record real post-production signals as Observations
 * against the Milestone Goal that produced the publication, that the
 * publicationId → goalId bridge works through the cinematic ledger, that
 * Observations are constitutionally distinct from SuccessCriteria and GoalStatus,
 * and that Observations survive server restart.
 *
 * Five sections:
 *  1. CinematicLedger — goal_id bridge
 *  2. ObservationRepository — recording (known/unknown publication; AUTHORIZED/DENIED)
 *  3. ObservationRepository — reading and tenant isolation
 *  4. Constitutional distinction — Observation ≠ SuccessCriterion ≠ COMPLETED
 *  5. Restart simulation — Observations survive server restart
 */

import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../db';
import { CinematicLedger } from '../cinematic-ledger-repository';
import { ObservationRepository } from '../observation-repository';
import { GoalRepository } from '../goal-repository';
import { GoalState } from '../../chambers/makman-al-ghayah/goal-state';
import { GoalStatus, GoalPriority } from '../../chambers/makman-al-ghayah/goal-contracts';
import type { GoalContract } from '../../chambers/makman-al-ghayah/goal-contracts';
import { SovereignOperationalEntryLayer } from '../../sovereign-entry/soel';
import type { MakmanGoalDistributionBridge } from '../../chambers/makman-al-ghayah/MAKMAN_GOAL_DISTRIBUTION_BRIDGE';
import type { PublicConsumptionBoundary, ConsumptionResponse } from '../../chambers/makman-al-ghayah/consumption-boundary';
import type { PrePublishingBoundary } from '../../chambers/ras-al-amr/pre-publishing-boundary';
import type { SovereignPublication, AccessPolicy } from '../../chambers/makman-al-ghayah/publication-contracts';
import { DistributionTier } from '../../chambers/makman-al-ghayah/publication-contracts';
import type { AuthorizationResult } from '../../chambers/makman-al-ghayah/access-policy-engine';

function makePublication(overrides: Partial<SovereignPublication> = {}): SovereignPublication {
  return {
    publicationId: 'pub-1',
    sourceCompilationId: 'comp-1',
    publisherTenantId: 'creator-1',
    title: 'A Sovereign Film',
    description: 'A constitutional production.',
    accessPolicy: { distributionTier: DistributionTier.PUBLIC_FREE, requiresAgeVerification: false } as AccessPolicy,
    isPublished: true,
    publishedAt: 1_000,
    createdAt: 1_000,
    updatedAt: 1_000,
    ...overrides,
  };
}

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

function seedLedger(ledger: CinematicLedger, goalId = 'goal-1', publicationId = 'pub-1'): void {
  ledger.record(
    makePublication({ publicationId, publisherTenantId: 'creator-1' }),
    'canvas-1',
    'NARRATIVE',
    'DYNAMIC',
    undefined,
    goalId,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. CinematicLedger — goal_id bridge
// ─────────────────────────────────────────────────────────────────────────────

describe('Package IV — CinematicLedger: goal_id bridge', () => {
  let db: DatabaseSync;
  let ledger: CinematicLedger;

  beforeEach(() => {
    db = createDatabase(':memory:');
    ledger = new CinematicLedger(db);
  });

  afterEach(() => db.close());

  it('record() with goalId stores goal_id in the ledger row', () => {
    ledger.record(makePublication(), 'canvas-1', 'NARRATIVE', 'DYNAMIC', undefined, 'goal-1');
    const row = ledger.getProductionRecord('pub-1', 'creator-1');
    expect(row).not.toBeNull();
    expect(row!.goalId).toBe('goal-1');
  });

  it('record() without goalId — goalId is undefined on retrieval', () => {
    ledger.record(makePublication(), 'canvas-1', 'NARRATIVE', 'DYNAMIC');
    const row = ledger.getProductionRecord('pub-1', 'creator-1');
    expect(row!.goalId).toBeUndefined();
  });

  it('updateProductionStatus() does not affect goalId — it is preserved', () => {
    ledger.record(makePublication(), 'canvas-1', 'NARRATIVE', 'PROCESSING', undefined, 'goal-99');
    ledger.updateProductionStatus('pub-1', 'COMPLETED', 'asset-1');
    const row = ledger.getProductionRecord('pub-1', 'creator-1');
    expect(row!.goalId).toBe('goal-99');
    expect(row!.renderStatus).toBe('COMPLETED');
  });

  it('listProductionsForCreator() also returns goalId', () => {
    ledger.record(makePublication(), 'canvas-1', 'NARRATIVE', 'DYNAMIC', undefined, 'goal-1');
    const records = ledger.listProductionsForCreator('creator-1');
    expect(records).toHaveLength(1);
    expect(records[0].goalId).toBe('goal-1');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. ObservationRepository — recording
// ─────────────────────────────────────────────────────────────────────────────

describe('Package IV — ObservationRepository: recording', () => {
  let db: DatabaseSync;
  let ledger: CinematicLedger;
  let repo: ObservationRepository;

  beforeEach(() => {
    db = createDatabase(':memory:');
    ledger = new CinematicLedger(db);
    repo = new ObservationRepository(db);
  });

  afterEach(() => db.close());

  it('recordConsumptionEvent() with a known publicationId — observation is recorded', () => {
    seedLedger(ledger);
    repo.recordConsumptionEvent('pub-1', true, 5_000);
    const obs = repo.listObservationsForGoal('goal-1', 'creator-1');
    expect(obs).toHaveLength(1);
  });

  it('recordConsumptionEvent() with an unknown publicationId — no observation is recorded', () => {
    repo.recordConsumptionEvent('pub-unknown', true, 5_000);
    const obs = repo.listObservationsForGoal('goal-1', 'creator-1');
    expect(obs).toHaveLength(0);
  });

  it('recordConsumptionEvent() when ledger has no goalId — no observation is recorded', () => {
    ledger.record(makePublication(), 'canvas-1', 'NARRATIVE', 'DYNAMIC');
    repo.recordConsumptionEvent('pub-1', true, 5_000);
    const obs = repo.listObservationsForGoal('goal-1', 'creator-1');
    expect(obs).toHaveLength(0);
  });

  it('isAuthorized=true → outcome is AUTHORIZED', () => {
    seedLedger(ledger);
    repo.recordConsumptionEvent('pub-1', true, 5_000);
    const obs = repo.listObservationsForGoal('goal-1', 'creator-1');
    expect(obs[0].outcome).toBe('AUTHORIZED');
  });

  it('isAuthorized=false → outcome is DENIED', () => {
    seedLedger(ledger);
    repo.recordConsumptionEvent('pub-1', false, 5_000);
    const obs = repo.listObservationsForGoal('goal-1', 'creator-1');
    expect(obs[0].outcome).toBe('DENIED');
  });

  it('signal is always CONSUMPTION_ATTEMPT', () => {
    seedLedger(ledger);
    repo.recordConsumptionEvent('pub-1', true, 5_000);
    const obs = repo.listObservationsForGoal('goal-1', 'creator-1');
    expect(obs[0].signal).toBe('CONSUMPTION_ATTEMPT');
  });

  it('observationId is a non-empty string', () => {
    seedLedger(ledger);
    repo.recordConsumptionEvent('pub-1', true, 5_000);
    const obs = repo.listObservationsForGoal('goal-1', 'creator-1');
    expect(typeof obs[0].observationId).toBe('string');
    expect(obs[0].observationId.length).toBeGreaterThan(0);
  });

  it('publicationId on the observation matches the recorded event', () => {
    seedLedger(ledger);
    repo.recordConsumptionEvent('pub-1', true, 5_000);
    const obs = repo.listObservationsForGoal('goal-1', 'creator-1');
    expect(obs[0].publicationId).toBe('pub-1');
  });

  it('observedAtMs reflects the timestampMs passed to recordConsumptionEvent()', () => {
    seedLedger(ledger);
    repo.recordConsumptionEvent('pub-1', true, 99_000);
    const obs = repo.listObservationsForGoal('goal-1', 'creator-1');
    expect(obs[0].observedAtMs).toBe(99_000);
  });

  it('multiple consumption events produce multiple observations', () => {
    seedLedger(ledger);
    repo.recordConsumptionEvent('pub-1', true, 1_000);
    repo.recordConsumptionEvent('pub-1', false, 2_000);
    repo.recordConsumptionEvent('pub-1', true, 3_000);
    const obs = repo.listObservationsForGoal('goal-1', 'creator-1');
    expect(obs).toHaveLength(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. ObservationRepository — reading and tenant isolation
// ─────────────────────────────────────────────────────────────────────────────

describe('Package IV — ObservationRepository: reading and tenant isolation', () => {
  let db: DatabaseSync;
  let ledger: CinematicLedger;
  let repo: ObservationRepository;

  beforeEach(() => {
    db = createDatabase(':memory:');
    ledger = new CinematicLedger(db);
    repo = new ObservationRepository(db);
  });

  afterEach(() => db.close());

  it('listObservationsForGoal returns empty array when no observations exist', () => {
    const obs = repo.listObservationsForGoal('goal-1', 'creator-1');
    expect(obs).toEqual([]);
  });

  it('listObservationsForGoal returns empty for a different creatorId (tenant isolation)', () => {
    seedLedger(ledger);
    repo.recordConsumptionEvent('pub-1', true, 5_000);
    const obs = repo.listObservationsForGoal('goal-1', 'creator-OTHER');
    expect(obs).toHaveLength(0);
  });

  it('listObservationsForGoal returns empty for a different goalId', () => {
    seedLedger(ledger, 'goal-1');
    repo.recordConsumptionEvent('pub-1', true, 5_000);
    const obs = repo.listObservationsForGoal('goal-DIFFERENT', 'creator-1');
    expect(obs).toHaveLength(0);
  });

  it('observations for two different goals are kept separate', () => {
    seedLedger(ledger, 'goal-1', 'pub-1');
    ledger.record(
      makePublication({ publicationId: 'pub-2', publisherTenantId: 'creator-1' }),
      'canvas-2', 'NARRATIVE', 'DYNAMIC', undefined, 'goal-2',
    );
    repo.recordConsumptionEvent('pub-1', true, 1_000);
    repo.recordConsumptionEvent('pub-2', false, 2_000);

    expect(repo.listObservationsForGoal('goal-1', 'creator-1')).toHaveLength(1);
    expect(repo.listObservationsForGoal('goal-2', 'creator-1')).toHaveLength(1);
    expect(repo.listObservationsForGoal('goal-1', 'creator-1')[0].outcome).toBe('AUTHORIZED');
    expect(repo.listObservationsForGoal('goal-2', 'creator-1')[0].outcome).toBe('DENIED');
  });

  it('observations are returned most recent first', () => {
    seedLedger(ledger);
    repo.recordConsumptionEvent('pub-1', true, 1_000);
    repo.recordConsumptionEvent('pub-1', false, 3_000);
    repo.recordConsumptionEvent('pub-1', true, 2_000);
    const obs = repo.listObservationsForGoal('goal-1', 'creator-1');
    expect(obs[0].observedAtMs).toBe(3_000);
    expect(obs[1].observedAtMs).toBe(2_000);
    expect(obs[2].observedAtMs).toBe(1_000);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Constitutional distinction — Observation ≠ SuccessCriterion ≠ COMPLETED
// ─────────────────────────────────────────────────────────────────────────────

describe('Package IV — constitutional distinction: Observation ≠ SuccessCriterion ≠ COMPLETED', () => {
  it('ObservationRecord has no fulfillmentState field — assessment is future work', () => {
    const db = createDatabase(':memory:');
    const ledger = new CinematicLedger(db);
    const repo = new ObservationRepository(db);
    seedLedger(ledger);
    repo.recordConsumptionEvent('pub-1', true, 5_000);
    const obs = repo.listObservationsForGoal('goal-1', 'creator-1');
    expect('fulfillmentState' in obs[0]).toBe(false);
    expect('satisfiedCriteria' in obs[0]).toBe(false);
    expect('score' in obs[0]).toBe(false);
    db.close();
  });

  it('a Goal with COMPLETED status and successCriteria can also have Observations — three independent facts', () => {
    const db = createDatabase(':memory:');
    const ledger = new CinematicLedger(db);
    const repo = new ObservationRepository(db);
    const goalRepo = new GoalRepository(db);

    goalRepo.save(makeGoal({
      status: GoalStatus.COMPLETED,
      successCriteria: [{ criterionId: 'c-1', description: 'Reach 10,000 views.', definedAtMs: 1_000 }],
    }));
    seedLedger(ledger);
    repo.recordConsumptionEvent('pub-1', true, 5_000);

    const restored = goalRepo.findByIdUnchecked('goal-1');
    const obs = repo.listObservationsForGoal('goal-1', 'creator-1');

    expect(restored!.status).toBe(GoalStatus.COMPLETED);
    expect(restored!.successCriteria).toHaveLength(1);
    expect(obs).toHaveLength(1);
    expect(obs[0].signal).toBe('CONSUMPTION_ATTEMPT');
    db.close();
  });

  it('Observations can exist without successCriteria — platform records reality regardless of Creator definitions', () => {
    const db = createDatabase(':memory:');
    const ledger = new CinematicLedger(db);
    const repo = new ObservationRepository(db);
    const goalRepo = new GoalRepository(db);

    goalRepo.save(makeGoal());
    seedLedger(ledger);
    repo.recordConsumptionEvent('pub-1', true, 5_000);

    const restored = goalRepo.findByIdUnchecked('goal-1');
    const obs = repo.listObservationsForGoal('goal-1', 'creator-1');

    expect(restored!.successCriteria).toBeUndefined();
    expect(obs).toHaveLength(1);
    db.close();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Restart simulation — Observations survive server restart
// ─────────────────────────────────────────────────────────────────────────────

describe('Package IV — Observations survive server restart', () => {
  it('observations recorded in one process lifetime are retrievable in a new instance', () => {
    const db = createDatabase(':memory:');
    const ledger1 = new CinematicLedger(db);
    const repo1 = new ObservationRepository(db);

    seedLedger(ledger1);
    repo1.recordConsumptionEvent('pub-1', true, 10_000);
    repo1.recordConsumptionEvent('pub-1', false, 20_000);

    const repo2 = new ObservationRepository(db);
    const obs = repo2.listObservationsForGoal('goal-1', 'creator-1');

    expect(obs).toHaveLength(2);
    expect(obs[0].observedAtMs).toBe(20_000);
    expect(obs[1].observedAtMs).toBe(10_000);

    db.close();
  });

  it('the goal_id bridge also survives restart — new CinematicLedger reads the same goal_id', () => {
    const db = createDatabase(':memory:');
    const ledger1 = new CinematicLedger(db);
    seedLedger(ledger1, 'goal-42', 'pub-42');

    const ledger2 = new CinematicLedger(db);
    const record = ledger2.getProductionRecord('pub-42', 'creator-1');
    expect(record!.goalId).toBe('goal-42');

    db.close();
  });

  it('SOEL.listObservationsForGoal returns empty when observation store not wired — backward compatible', () => {
    const db = createDatabase(':memory:');
    const goalRepo = new GoalRepository(db);
    const goalState = new GoalState(goalRepo);
    goalState.register(makeGoal());

    const soel = new SovereignOperationalEntryLayer(
      goalState,
      {} as MakmanGoalDistributionBridge,
      {} as PublicConsumptionBoundary,
      {} as PrePublishingBoundary,
    );

    const obs = soel.listObservationsForGoal('goal-1', 'creator-1');
    expect(obs).toEqual([]);
    db.close();
  });

  it('SOEL.requestConsumption() records observation when observation store is wired', async () => {
    const db = createDatabase(':memory:');
    const ledger = new CinematicLedger(db);
    const obsRepo = new ObservationRepository(db);
    const goalRepo = new GoalRepository(db);
    const goalState = new GoalState(goalRepo);
    goalState.register(makeGoal());

    seedLedger(ledger);

    const mockBoundary = {
      requestConsumption: async (): Promise<ConsumptionResponse> => ({
        isAuthorized: true,
        authorizationResult: { isAuthorized: true, requiredAction: 'GRANTED' } as AuthorizationResult,
      }),
    } as unknown as PublicConsumptionBoundary;

    const soel = new SovereignOperationalEntryLayer(
      goalState,
      {} as MakmanGoalDistributionBridge,
      mockBoundary,
      {} as PrePublishingBoundary,
      undefined,
      obsRepo,
    );

    await soel.requestConsumption('pub-1', 'viewer-1');

    const obs = soel.listObservationsForGoal('goal-1', 'creator-1');
    expect(obs).toHaveLength(1);
    expect(obs[0].signal).toBe('CONSUMPTION_ATTEMPT');
    expect(obs[0].outcome).toBe('AUTHORIZED');

    db.close();
  });
});
