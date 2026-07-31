/**
 * SOVEREIGN PURPOSE → MILESTONE GOAL FOUNDATION
 * Constitutional Foundation Package II
 *
 * Proves that a GoalContract can be constitutionally designated as a Milestone
 * Goal serving the Creator's Sovereign Purpose, that the designation survives
 * restart, and that the temporal guarantee holds: the Purpose wording at
 * designation time is preserved even if the Purpose is later updated.
 *
 * Four sections:
 *  1. GoalRepository — sovereignPurposeStatement persistence
 *  2. SOEL.designateGoalAsMilestone — all outcome paths
 *  3. Temporal semantics — snapshot survives Purpose updates
 *  4. Restart simulation — Milestone designation survives server restart
 */

import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../db';
import { GoalRepository } from '../goal-repository';
import { SovereignPurposeRepository } from '../sovereign-purpose-repository';
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
    title: 'A Sovereign Film',
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

function seedCreator(db: DatabaseSync, creatorId: string): void {
  db.prepare(
    'INSERT INTO creators (creator_id, email, password_hash, role, display_name, preferred_locale, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
  ).run(creatorId, `${creatorId}@test.com`, 'hash', 'creator', null, null, Date.now());
}

function makeSoel(db: DatabaseSync, options: { withGoal?: GoalContract } = {}): SovereignOperationalEntryLayer {
  const goalRepo = new GoalRepository(db);
  const goalState = new GoalState(goalRepo);
  if (options.withGoal) goalState.register(options.withGoal);
  const purposeRepo = new SovereignPurposeRepository(db);
  return new SovereignOperationalEntryLayer(
    goalState,
    {} as MakmanGoalDistributionBridge,
    {} as PublicConsumptionBoundary,
    {} as PrePublishingBoundary,
    purposeRepo,
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. GoalRepository — sovereignPurposeStatement persistence
// ─────────────────────────────────────────────────────────────────────────────

describe('Package II — GoalRepository: sovereignPurposeStatement persistence', () => {
  let db: DatabaseSync;
  let repo: GoalRepository;

  beforeEach(() => {
    db = createDatabase(':memory:');
    repo = new GoalRepository(db);
  });

  afterEach(() => db.close());

  it('save() without sovereignPurposeStatement — field is undefined on restore', () => {
    repo.save(makeGoal());
    expect(repo.findByIdUnchecked('goal-1')!.sovereignPurposeStatement).toBeUndefined();
  });

  it('save() with sovereignPurposeStatement — field survives round-trip', () => {
    repo.save(makeGoal({ sovereignPurposeStatement: 'Build the world\'s first sovereign creative OS.' }));
    const restored = repo.findByIdUnchecked('goal-1');
    expect(restored!.sovereignPurposeStatement).toBe('Build the world\'s first sovereign creative OS.');
  });

  it('INSERT OR REPLACE — updating sovereignPurposeStatement overwrites the prior value', () => {
    repo.save(makeGoal());
    repo.save(makeGoal({ sovereignPurposeStatement: 'New purpose.', updatedAtMs: 2_000 }));
    expect(repo.findByIdUnchecked('goal-1')!.sovereignPurposeStatement).toBe('New purpose.');
  });

  it('findByTenant() — sovereignPurposeStatement is present on all returned Goals', () => {
    repo.save(makeGoal({ goalId: 'goal-a', sovereignPurposeStatement: 'A vision.' }));
    repo.save(makeGoal({ goalId: 'goal-b' }));
    const results = repo.findByTenant('creator-1');
    const withPurpose = results.find((g) => g.goalId === 'goal-a');
    const withoutPurpose = results.find((g) => g.goalId === 'goal-b');
    expect(withPurpose!.sovereignPurposeStatement).toBe('A vision.');
    expect(withoutPurpose!.sovereignPurposeStatement).toBeUndefined();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. SOEL.designateGoalAsMilestone — all outcome paths
// ─────────────────────────────────────────────────────────────────────────────

describe('Package II — SOEL.designateGoalAsMilestone outcome paths', () => {
  let db: DatabaseSync;

  beforeEach(() => {
    db = createDatabase(':memory:');
    seedCreator(db, 'creator-1');
  });

  afterEach(() => db.close());

  it('returns ok:false / NO_SOVEREIGN_PURPOSE when the Creator has no Purpose set', () => {
    const soel = makeSoel(db, { withGoal: makeGoal() });
    const outcome = soel.designateGoalAsMilestone('goal-1', 'creator-1');
    expect(outcome.ok).toBe(false);
    expect(!outcome.ok && outcome.reason).toBe('NO_SOVEREIGN_PURPOSE');
  });

  it('returns ok:false / GOAL_NOT_FOUND for a Goal that does not exist', () => {
    new SovereignPurposeRepository(db).setSovereignPurpose('creator-1', 'A vision.');
    const soel = makeSoel(db);
    const outcome = soel.designateGoalAsMilestone('no-such-goal', 'creator-1');
    expect(outcome.ok).toBe(false);
    expect(!outcome.ok && outcome.reason).toBe('GOAL_NOT_FOUND');
  });

  it('returns ok:false / GOAL_NOT_FOUND when the Goal belongs to a different tenant', () => {
    seedCreator(db, 'creator-2');
    new SovereignPurposeRepository(db).setSovereignPurpose('creator-1', 'A vision.');
    const soel = makeSoel(db, { withGoal: makeGoal({ subscriberTenantId: 'creator-2' }) });
    // creator-1 tries to designate creator-2's goal
    const outcome = soel.designateGoalAsMilestone('goal-1', 'creator-1');
    expect(outcome.ok).toBe(false);
    expect(!outcome.ok && outcome.reason).toBe('GOAL_NOT_FOUND');
  });

  it('returns ok:true with the updated Goal when everything is wired correctly', () => {
    new SovereignPurposeRepository(db).setSovereignPurpose('creator-1', 'Build the sovereign Empire.');
    const soel = makeSoel(db, { withGoal: makeGoal() });
    const outcome = soel.designateGoalAsMilestone('goal-1', 'creator-1');
    expect(outcome.ok).toBe(true);
    expect(outcome.ok && outcome.goal.sovereignPurposeStatement).toBe('Build the sovereign Empire.');
  });

  it('snapshots the Purpose wording at designation time into the Goal', () => {
    new SovereignPurposeRepository(db).setSovereignPurpose('creator-1', 'Original purpose wording.');
    const soel = makeSoel(db, { withGoal: makeGoal() });
    const outcome = soel.designateGoalAsMilestone('goal-1', 'creator-1');
    expect(outcome.ok && outcome.goal.sovereignPurposeStatement).toBe('Original purpose wording.');
  });

  it('designation writes through to the GoalRepository — Goal reads back as Milestone after designation', () => {
    new SovereignPurposeRepository(db).setSovereignPurpose('creator-1', 'A sovereign vision.');
    const goalRepo = new GoalRepository(db);
    const goalState = new GoalState(goalRepo);
    goalState.register(makeGoal());
    const purposeRepo = new SovereignPurposeRepository(db);
    const soel = new SovereignOperationalEntryLayer(
      goalState,
      {} as MakmanGoalDistributionBridge,
      {} as PublicConsumptionBoundary,
      {} as PrePublishingBoundary,
      purposeRepo,
    );

    soel.designateGoalAsMilestone('goal-1', 'creator-1');

    const persisted = goalRepo.findByIdUnchecked('goal-1');
    expect(persisted!.sovereignPurposeStatement).toBe('A sovereign vision.');
  });

  it('existing Goal fields are preserved unchanged after designation', () => {
    new SovereignPurposeRepository(db).setSovereignPurpose('creator-1', 'A vision.');
    const original = makeGoal({ title: 'The Original Title', status: GoalStatus.IN_PROGRESS });
    const soel = makeSoel(db, { withGoal: original });
    const outcome = soel.designateGoalAsMilestone('goal-1', 'creator-1');
    expect(outcome.ok && outcome.goal.title).toBe('The Original Title');
    expect(outcome.ok && outcome.goal.status).toBe(GoalStatus.IN_PROGRESS);
    expect(outcome.ok && outcome.goal.goalId).toBe('goal-1');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Temporal semantics — snapshot survives Purpose updates
// ─────────────────────────────────────────────────────────────────────────────

describe('Package II — temporal semantics: snapshot survives Sovereign Purpose update', () => {
  it('sovereignPurposeStatement in a Goal retains original wording after Creator updates their Purpose', () => {
    const db = createDatabase(':memory:');
    seedCreator(db, 'creator-t');

    const purposeRepo = new SovereignPurposeRepository(db);
    purposeRepo.setSovereignPurpose('creator-t', 'Original Purpose.');

    // Designate a Goal as Milestone under the original Purpose
    const goalRepo = new GoalRepository(db);
    const goalState = new GoalState(goalRepo);
    goalState.register(makeGoal({ goalId: 'goal-t', subscriberTenantId: 'creator-t' }));
    const soel = new SovereignOperationalEntryLayer(
      goalState,
      {} as MakmanGoalDistributionBridge,
      {} as PublicConsumptionBoundary,
      {} as PrePublishingBoundary,
      purposeRepo,
    );
    soel.designateGoalAsMilestone('goal-t', 'creator-t');

    // Creator later updates their Sovereign Purpose wording
    purposeRepo.setSovereignPurpose('creator-t', 'Completely Reworded Purpose.');

    // The Goal's snapshot must still show the ORIGINAL wording
    const persisted = goalRepo.findByIdUnchecked('goal-t');
    expect(persisted!.sovereignPurposeStatement).toBe('Original Purpose.');

    // The current Purpose has changed
    expect(purposeRepo.getSovereignPurpose('creator-t')!.purposeStatement).toBe('Completely Reworded Purpose.');

    db.close();
  });

  it('re-designation after Purpose update stamps the new wording — explicit Creator act, not accidental overwrite', () => {
    const db = createDatabase(':memory:');
    seedCreator(db, 'creator-r');

    const purposeRepo = new SovereignPurposeRepository(db);
    purposeRepo.setSovereignPurpose('creator-r', 'First Purpose.');

    const goalRepo = new GoalRepository(db);
    const goalState = new GoalState(goalRepo);
    goalState.register(makeGoal({ goalId: 'goal-r', subscriberTenantId: 'creator-r' }));
    const soel = new SovereignOperationalEntryLayer(
      goalState,
      {} as MakmanGoalDistributionBridge,
      {} as PublicConsumptionBoundary,
      {} as PrePublishingBoundary,
      purposeRepo,
    );

    soel.designateGoalAsMilestone('goal-r', 'creator-r');
    expect(goalRepo.findByIdUnchecked('goal-r')!.sovereignPurposeStatement).toBe('First Purpose.');

    // Creator updates Purpose and explicitly re-designates the Goal
    purposeRepo.setSovereignPurpose('creator-r', 'Second Purpose.');
    soel.designateGoalAsMilestone('goal-r', 'creator-r');

    // The snapshot now reflects the new Purpose — this is correct; the Creator explicitly re-affirmed the relationship
    expect(goalRepo.findByIdUnchecked('goal-r')!.sovereignPurposeStatement).toBe('Second Purpose.');

    db.close();
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Restart simulation — Milestone designation survives server restart
// ─────────────────────────────────────────────────────────────────────────────

describe('Package II — Milestone designation survives server restart', () => {
  it('a Goal designated as Milestone in one process lifetime is retrievable as Milestone in a new instance', () => {
    const db = createDatabase(':memory:');
    seedCreator(db, 'creator-rs');

    // Process lifetime 1 — designate a Milestone Goal
    const purposeRepo1 = new SovereignPurposeRepository(db);
    purposeRepo1.setSovereignPurpose('creator-rs', 'The Empire remembers why.');

    const goalRepo1 = new GoalRepository(db);
    const goalState1 = new GoalState(goalRepo1);
    goalState1.register(makeGoal({ goalId: 'goal-rs', subscriberTenantId: 'creator-rs' }));
    const soel1 = new SovereignOperationalEntryLayer(
      goalState1,
      {} as MakmanGoalDistributionBridge,
      {} as PublicConsumptionBoundary,
      {} as PrePublishingBoundary,
      purposeRepo1,
    );
    soel1.designateGoalAsMilestone('goal-rs', 'creator-rs');

    // Process lifetime 2 — new repository instances, same database (restart simulation)
    const goalRepo2 = new GoalRepository(db);
    const goalState2 = new GoalState(goalRepo2);

    // Map starts empty after restart; getGoal() falls back to repository
    expect(goalState2.size()).toBe(0);

    const restored = goalState2.getGoal('goal-rs');
    expect(restored).not.toBeUndefined();
    expect(restored!.sovereignPurposeStatement).toBe('The Empire remembers why.');

    db.close();
  });

  it('a non-Milestone Goal before designation has no sovereignPurposeStatement after restart', () => {
    const db = createDatabase(':memory:');

    const repo = new GoalRepository(db);
    repo.save(makeGoal({ goalId: 'plain-goal' }));

    const repo2 = new GoalRepository(db);
    const restored = repo2.findByIdUnchecked('plain-goal');
    expect(restored!.sovereignPurposeStatement).toBeUndefined();

    db.close();
  });
});
