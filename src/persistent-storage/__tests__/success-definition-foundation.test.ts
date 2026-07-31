/**
 * MILESTONE SUCCESS DEFINITION FOUNDATION
 * Constitutional Foundation Package III
 *
 * Proves that a GoalContract can carry an explicit Creator-defined Success
 * Definition, that it is constitutionally distinct from GoalStatus.COMPLETED,
 * that the definition survives restart, and that criteria replacement preserves
 * temporal honesty.
 *
 * Four sections:
 *  1. GoalRepository — successCriteria persistence
 *  2. SOEL.defineSuccessCriteria — all outcome paths
 *  3. Constitutional distinction — COMPLETED ≠ success criteria satisfied
 *  4. Restart simulation — Success Definition survives server restart
 */

import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../db';
import { GoalRepository } from '../goal-repository';
import { GoalState } from '../../chambers/makman-al-ghayah/goal-state';
import { GoalStatus, GoalPriority } from '../../chambers/makman-al-ghayah/goal-contracts';
import type { GoalContract } from '../../chambers/makman-al-ghayah/goal-contracts';
import { SovereignOperationalEntryLayer } from '../../sovereign-entry/soel';
import type { MakmanGoalDistributionBridge } from '../../chambers/makman-al-ghayah/MAKMAN_GOAL_DISTRIBUTION_BRIDGE';
import type { PublicConsumptionBoundary } from '../../chambers/makman-al-ghayah/consumption-boundary';
import type { PrePublishingBoundary } from '../../chambers/ras-al-amr/pre-publishing-boundary';

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

function makeSoel(db: DatabaseSync, options: { withGoal?: GoalContract } = {}): SovereignOperationalEntryLayer {
  const goalRepo = new GoalRepository(db);
  const goalState = new GoalState(goalRepo);
  if (options.withGoal) goalState.register(options.withGoal);
  return new SovereignOperationalEntryLayer(
    goalState,
    {} as MakmanGoalDistributionBridge,
    {} as PublicConsumptionBoundary,
    {} as PrePublishingBoundary,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GoalRepository — successCriteria persistence
// ─────────────────────────────────────────────────────────────────────────────

describe('Package III — GoalRepository: successCriteria persistence', () => {
  let db: DatabaseSync;
  let repo: GoalRepository;

  beforeEach(() => {
    db = createDatabase(':memory:');
    repo = new GoalRepository(db);
  });

  afterEach(() => db.close());

  it('save() without successCriteria — field is undefined on restore', () => {
    repo.save(makeGoal());
    expect(repo.findByIdUnchecked('goal-1')!.successCriteria).toBeUndefined();
  });

  it('save() with successCriteria — array survives JSON round-trip', () => {
    repo.save(makeGoal({
      successCriteria: [
        { criterionId: 'c-1', description: 'Reach 10,000 views on primary platform.', definedAtMs: 5_000 },
        { criterionId: 'c-2', description: 'Generate at least 50 qualified leads.', definedAtMs: 5_000 },
      ],
    }));
    const restored = repo.findByIdUnchecked('goal-1');
    expect(restored!.successCriteria).toHaveLength(2);
    expect(restored!.successCriteria![0].criterionId).toBe('c-1');
    expect(restored!.successCriteria![0].description).toBe('Reach 10,000 views on primary platform.');
    expect(restored!.successCriteria![0].definedAtMs).toBe(5_000);
    expect(restored!.successCriteria![1].description).toBe('Generate at least 50 qualified leads.');
  });

  it('INSERT OR REPLACE — replacing successCriteria overwrites the prior list', () => {
    repo.save(makeGoal({ successCriteria: [{ criterionId: 'old', description: 'Old criterion.', definedAtMs: 1_000 }] }));
    repo.save(makeGoal({ successCriteria: [{ criterionId: 'new', description: 'New criterion.', definedAtMs: 2_000 }], updatedAtMs: 2_000 }));

    const restored = repo.findByIdUnchecked('goal-1');
    expect(restored!.successCriteria).toHaveLength(1);
    expect(restored!.successCriteria![0].criterionId).toBe('new');
  });

  it('save() with an empty successCriteria array — restored as empty array, not undefined', () => {
    repo.save(makeGoal({ successCriteria: [] }));
    const restored = repo.findByIdUnchecked('goal-1');
    expect(restored!.successCriteria).toEqual([]);
  });

  it('successCriteria persists alongside other Goal fields unchanged', () => {
    repo.save(makeGoal({
      sovereignPurposeStatement: 'Build the Empire.',
      successCriteria: [{ criterionId: 'c-1', description: 'A criterion.', definedAtMs: 1_000 }],
      status: GoalStatus.IN_PROGRESS,
    }));
    const restored = repo.findByIdUnchecked('goal-1');
    expect(restored!.sovereignPurposeStatement).toBe('Build the Empire.');
    expect(restored!.status).toBe(GoalStatus.IN_PROGRESS);
    expect(restored!.successCriteria![0].description).toBe('A criterion.');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. SOEL.defineSuccessCriteria — all outcome paths
// ─────────────────────────────────────────────────────────────────────────────

describe('Package III — SOEL.defineSuccessCriteria outcome paths', () => {
  let db: DatabaseSync;

  beforeEach(() => { db = createDatabase(':memory:'); });
  afterEach(() => db.close());

  it('returns ok:false / NOT_A_MILESTONE_GOAL for a Goal that has no sovereignPurposeStatement', () => {
    const soel = makeSoel(db, { withGoal: makeGoal() }); // no sovereignPurposeStatement
    const outcome = soel.defineSuccessCriteria('goal-1', 'creator-1', ['A criterion.']);
    expect(outcome.ok).toBe(false);
    expect(!outcome.ok && outcome.reason).toBe('NOT_A_MILESTONE_GOAL');
  });

  it('returns ok:true once the Goal is designated as a Milestone Goal', () => {
    const goal = makeGoal({ sovereignPurposeStatement: 'Build the Empire.' });
    const soel = makeSoel(db, { withGoal: goal });
    const outcome = soel.defineSuccessCriteria('goal-1', 'creator-1', ['A criterion.']);
    expect(outcome.ok).toBe(true);
  });

  it('returns ok:false / GOAL_NOT_FOUND for a Goal that does not exist', () => {
    const soel = makeSoel(db);
    const outcome = soel.defineSuccessCriteria('no-such-goal', 'creator-1', ['A criterion.']);
    expect(outcome.ok).toBe(false);
    expect(!outcome.ok && outcome.reason).toBe('GOAL_NOT_FOUND');
  });

  it('returns ok:false / GOAL_NOT_FOUND when the Goal belongs to a different tenant', () => {
    const soel = makeSoel(db, { withGoal: makeGoal({ subscriberTenantId: 'creator-2' }) });
    const outcome = soel.defineSuccessCriteria('goal-1', 'creator-1', ['A criterion.']);
    expect(outcome.ok).toBe(false);
    expect(!outcome.ok && outcome.reason).toBe('GOAL_NOT_FOUND');
  });

  it('returns ok:true with the updated Goal on success', () => {
    const soel = makeSoel(db, { withGoal: makeGoal({ sovereignPurposeStatement: 'Build the Empire.' }) });
    const outcome = soel.defineSuccessCriteria('goal-1', 'creator-1', ['Reach 10,000 views.']);
    expect(outcome.ok).toBe(true);
    expect(outcome.ok && outcome.goal.successCriteria).toHaveLength(1);
    expect(outcome.ok && outcome.goal.successCriteria![0].description).toBe('Reach 10,000 views.');
  });

  it('generates a criterionId and definedAtMs for each criterion', () => {
    const soel = makeSoel(db, { withGoal: makeGoal({ sovereignPurposeStatement: 'Build the Empire.' }) });
    const outcome = soel.defineSuccessCriteria('goal-1', 'creator-1', ['First.', 'Second.']);
    expect(outcome.ok && typeof outcome.goal.successCriteria![0].criterionId).toBe('string');
    expect(outcome.ok && outcome.goal.successCriteria![0].criterionId.length > 0).toBe(true);
    expect(outcome.ok && typeof outcome.goal.successCriteria![0].definedAtMs).toBe('number');
  });

  it('second call replaces the first criteria list entirely', () => {
    const soel = makeSoel(db, { withGoal: makeGoal({ sovereignPurposeStatement: 'Build the Empire.' }) });
    soel.defineSuccessCriteria('goal-1', 'creator-1', ['First criterion.', 'Second criterion.']);
    const second = soel.defineSuccessCriteria('goal-1', 'creator-1', ['Replacement only.']);

    expect(second.ok && second.goal.successCriteria).toHaveLength(1);
    expect(second.ok && second.goal.successCriteria![0].description).toBe('Replacement only.');
  });

  it('defineSuccessCriteria writes through to GoalRepository', () => {
    const goalRepo = new GoalRepository(db);
    const goalState = new GoalState(goalRepo);
    goalState.register(makeGoal({ sovereignPurposeStatement: 'Build the Empire.' }));
    const soel = new SovereignOperationalEntryLayer(
      goalState,
      {} as MakmanGoalDistributionBridge,
      {} as PublicConsumptionBoundary,
      {} as PrePublishingBoundary,
    );
    soel.defineSuccessCriteria('goal-1', 'creator-1', ['Persisted criterion.']);

    const persisted = goalRepo.findByIdUnchecked('goal-1');
    expect(persisted!.successCriteria).toHaveLength(1);
    expect(persisted!.successCriteria![0].description).toBe('Persisted criterion.');
  });

  it('existing Goal fields are preserved unchanged after defining criteria', () => {
    const original = makeGoal({
      title: 'Original Title',
      sovereignPurposeStatement: 'The Purpose.',
      status: GoalStatus.IN_PROGRESS,
    });
    const soel = makeSoel(db, { withGoal: original });
    const outcome = soel.defineSuccessCriteria('goal-1', 'creator-1', ['A criterion.']);
    expect(outcome.ok && outcome.goal.title).toBe('Original Title');
    expect(outcome.ok && outcome.goal.sovereignPurposeStatement).toBe('The Purpose.');
    expect(outcome.ok && outcome.goal.status).toBe(GoalStatus.IN_PROGRESS);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Constitutional distinction — COMPLETED ≠ success criteria satisfied
// ─────────────────────────────────────────────────────────────────────────────

describe('Package III — constitutional distinction: COMPLETED ≠ success criteria satisfied', () => {
  it('a Goal with status COMPLETED and successCriteria retains both fields independently', () => {
    const db = createDatabase(':memory:');
    const repo = new GoalRepository(db);

    const completedGoalWithCriteria = makeGoal({
      status: GoalStatus.COMPLETED,
      successCriteria: [
        { criterionId: 'c-1', description: 'Reach 50,000 views.', definedAtMs: 1_000 },
      ],
    });
    repo.save(completedGoalWithCriteria);

    const restored = repo.findByIdUnchecked('goal-1');
    // Both fields are present and independent
    expect(restored!.status).toBe(GoalStatus.COMPLETED);
    expect(restored!.successCriteria).toHaveLength(1);
    expect(restored!.successCriteria![0].description).toBe('Reach 50,000 views.');

    // COMPLETED status does NOT imply criterion was satisfied — they are separate facts
    // (No fulfillment judgment exists yet — that is future work)
    db.close();
  });

  it('a Goal can have successCriteria without being COMPLETED — definition precedes observation', () => {
    const db = createDatabase(':memory:');
    const repo = new GoalRepository(db);

    repo.save(makeGoal({
      status: GoalStatus.CREATED,
      successCriteria: [{ criterionId: 'c-1', description: 'Secure a distribution deal.', definedAtMs: 1_000 }],
    }));

    const restored = repo.findByIdUnchecked('goal-1');
    expect(restored!.status).toBe(GoalStatus.CREATED);
    expect(restored!.successCriteria![0].description).toBe('Secure a distribution deal.');
    db.close();
  });

  it('successCriteria is absent on a COMPLETED Goal when no definition was given — COMPLETED alone means nothing about purpose', () => {
    const db = createDatabase(':memory:');
    const repo = new GoalRepository(db);

    repo.save(makeGoal({ status: GoalStatus.COMPLETED }));
    const restored = repo.findByIdUnchecked('goal-1');

    expect(restored!.status).toBe(GoalStatus.COMPLETED);
    expect(restored!.successCriteria).toBeUndefined(); // No definition given — Empire does not invent one
    db.close();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Restart simulation — Success Definition survives server restart
// ─────────────────────────────────────────────────────────────────────────────

describe('Package III — Success Definition survives server restart', () => {
  it('successCriteria defined in one process lifetime is retrievable in a new instance', () => {
    const db = createDatabase(':memory:');

    // Process lifetime 1 — define Success Criteria
    const repo1 = new GoalRepository(db);
    repo1.save(makeGoal({
      successCriteria: [
        { criterionId: 'c-1', description: 'The Empire remembers what success means.', definedAtMs: 1_000 },
        { criterionId: 'c-2', description: 'Secure at least one distribution partner.', definedAtMs: 1_000 },
      ],
    }));

    // Process lifetime 2 — new repository instance, same database
    const repo2 = new GoalRepository(db);
    const restored = repo2.findByIdUnchecked('goal-1');

    expect(restored).not.toBeNull();
    expect(restored!.successCriteria).toHaveLength(2);
    expect(restored!.successCriteria![0].description).toBe('The Empire remembers what success means.');
    expect(restored!.successCriteria![1].description).toBe('Secure at least one distribution partner.');

    db.close();
  });

  it('criteria replacement in one lifetime is reflected in the next — new list, not merged', () => {
    const db = createDatabase(':memory:');

    const repo1 = new GoalRepository(db);
    repo1.save(makeGoal({ successCriteria: [{ criterionId: 'old', description: 'Original.', definedAtMs: 1_000 }] }));
    repo1.save(makeGoal({ successCriteria: [{ criterionId: 'new', description: 'Replacement.', definedAtMs: 2_000 }], updatedAtMs: 2_000 }));

    const repo2 = new GoalRepository(db);
    const restored = repo2.findByIdUnchecked('goal-1');

    expect(restored!.successCriteria).toHaveLength(1);
    expect(restored!.successCriteria![0].description).toBe('Replacement.');

    db.close();
  });
});
