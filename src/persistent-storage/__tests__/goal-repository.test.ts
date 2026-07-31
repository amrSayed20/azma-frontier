/**
 * MINISTRY IX — GOAL PERSISTENCE
 *
 * Proves the GoalRepository correctly persists and restores GoalContracts,
 * and that GoalState's write-through + repository fallback closes the
 * constitutional restart gap: a Goal committed in one process lifetime is
 * retrievable in a new GoalState instance backed by the same database.
 *
 * Three sections:
 *  1. GoalRepository — unit tests for every persistence method
 *  2. GoalState + GoalRepository — write-through cache integrity
 *  3. Restart simulation — the constitutional objective of Ministry IX
 */

import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../db';
import { GoalRepository } from '../goal-repository';
import { GoalState } from '../../chambers/makman-al-ghayah/goal-state';
import { GoalStatus, GoalPriority, PacingPreference, TransitionPreference } from '../../chambers/makman-al-ghayah/goal-contracts';
import type { GoalContract } from '../../chambers/makman-al-ghayah/goal-contracts';
import { DistributionTier } from '../../chambers/makman-al-ghayah/publication-contracts';
import type { MakmanCommercialIntent } from '../../chambers/makman-al-ghayah/MAKMAN_COMMERCIAL_DISTRIBUTION_CONTRACTS';
import { CanvasType } from '../../chambers/ras-al-amr/assembly-contracts';
import type { CompiledAssemblyGraph } from '../../chambers/ras-al-amr/pre-publishing-boundary';

function makeGraph(overrides: Partial<CompiledAssemblyGraph> = {}): CompiledAssemblyGraph {
  return {
    compilationId: 'comp-1',
    sourceCanvasId: 'canvas-1',
    subscriberTenantId: 'tenant-1',
    canvasType: CanvasType.CINEMATIC,
    hydratedCanvas: {
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      canvasType: CanvasType.CINEMATIC,
      title: 'A Film',
      tracks: [],
      createdAt: 0,
      updatedAt: 0,
    },
    metadata: { totalTracks: 0, totalNodes: 0, aggregatedAssetFamilies: [] },
    mixPlan: { nodeMixes: [], trackMixes: [] },
    subtitlePlan: { absoluteCues: [] },
    compiledAt: 0,
    ...overrides,
  };
}

function makeGoal(overrides: Partial<GoalContract> = {}): GoalContract {
  return {
    goalId: 'goal-1',
    subscriberTenantId: 'tenant-1',
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

// ─────────────────────────────────────────────────────────────────────────────
// 1. GoalRepository — direct persistence tests
// ─────────────────────────────────────────────────────────────────────────────

describe('Ministry IX — GoalRepository persistence', () => {
  let db: DatabaseSync;
  let repo: GoalRepository;

  beforeEach(() => {
    db = createDatabase(':memory:');
    repo = new GoalRepository(db);
  });

  afterEach(() => {
    db.close();
  });

  it('save() and findByIdUnchecked() — all scalar fields survive round-trip', () => {
    const goal = makeGoal();
    repo.save(goal);

    const restored = repo.findByIdUnchecked('goal-1');
    expect(restored).not.toBeNull();
    expect(restored!.goalId).toBe('goal-1');
    expect(restored!.subscriberTenantId).toBe('tenant-1');
    expect(restored!.title).toBe('A Sovereign Film');
    expect(restored!.description).toBe('A constitutional production.');
    expect(restored!.priority).toBe(GoalPriority.HIGH);
    expect(restored!.status).toBe(GoalStatus.CREATED);
    expect(restored!.createdAtMs).toBe(1_000);
    expect(restored!.updatedAtMs).toBe(1_000);
  });

  it('save() — dependencies and metrics survive JSON round-trip', () => {
    const goal = makeGoal({
      dependencies: [{ goalId: 'dep-1' }, { goalId: 'dep-2' }],
      metrics: [{ key: 'views', value: 42 }],
    });
    repo.save(goal);

    const restored = repo.findByIdUnchecked('goal-1');
    expect(restored!.dependencies).toEqual([{ goalId: 'dep-1' }, { goalId: 'dep-2' }]);
    expect(restored!.metrics).toEqual([{ key: 'views', value: 42 }]);
  });

  it('save() with full commercialIntent — nested CompiledAssemblyGraph survives JSON serialization', () => {
    const intent: MakmanCommercialIntent = {
      publisherTenantId: 'tenant-1',
      compiledAssemblyGraph: makeGraph(),
      accessPolicy: { distributionTier: DistributionTier.COMMERCIAL_PURCHASE, requiresAgeVerification: true },
      coverArtUri: 'vault://cover.png',
    };
    repo.save(makeGoal({ commercialIntent: intent }));

    const restored = repo.findByIdUnchecked('goal-1');
    expect(restored!.commercialIntent).toEqual(intent);
    expect(restored!.commercialIntent?.accessPolicy.distributionTier).toBe(DistributionTier.COMMERCIAL_PURCHASE);
    expect(restored!.commercialIntent?.coverArtUri).toBe('vault://cover.png');
  });

  it('save() with no commercialIntent — optional field stored as null, restored as undefined', () => {
    repo.save(makeGoal());

    const restored = repo.findByIdUnchecked('goal-1');
    expect(restored!.commercialIntent).toBeUndefined();
  });

  it('save() with pacingPreference — enum stored and restored', () => {
    repo.save(makeGoal({ pacingPreference: PacingPreference.ENERGETIC }));

    expect(repo.findByIdUnchecked('goal-1')!.pacingPreference).toBe(PacingPreference.ENERGETIC);
  });

  it('save() with transitionPreference — enum stored and restored, independent of pacingPreference', () => {
    repo.save(makeGoal({ pacingPreference: PacingPreference.CONTEMPLATIVE, transitionPreference: TransitionPreference.SOFT }));

    const restored = repo.findByIdUnchecked('goal-1');
    expect(restored!.transitionPreference).toBe(TransitionPreference.SOFT);
    expect(restored!.pacingPreference).toBe(PacingPreference.CONTEMPLATIVE);
  });

  it('save() with no pacing or transition preference — both restored as undefined', () => {
    repo.save(makeGoal());

    const restored = repo.findByIdUnchecked('goal-1');
    expect(restored!.pacingPreference).toBeUndefined();
    expect(restored!.transitionPreference).toBeUndefined();
  });

  it('findByIdUnchecked() returns null for an unknown goalId', () => {
    expect(repo.findByIdUnchecked('no-such-goal')).toBeNull();
  });

  it('INSERT OR REPLACE — save() twice updates the row without duplication', () => {
    repo.save(makeGoal({ status: GoalStatus.CREATED }));
    repo.save(makeGoal({ status: GoalStatus.COMPLETED, updatedAtMs: 2_000 }));

    const restored = repo.findByIdUnchecked('goal-1');
    expect(restored!.status).toBe(GoalStatus.COMPLETED);
    expect(restored!.updatedAtMs).toBe(2_000);

    expect(repo.findByTenant('tenant-1')).toHaveLength(1);
  });

  it('findByTenant() returns only that tenant\'s goals, ordered most-recent first by createdAtMs', () => {
    repo.save(makeGoal({ goalId: 'goal-a', subscriberTenantId: 'tenant-1', createdAtMs: 1_000 }));
    repo.save(makeGoal({ goalId: 'goal-b', subscriberTenantId: 'tenant-1', createdAtMs: 3_000 }));
    repo.save(makeGoal({ goalId: 'goal-c', subscriberTenantId: 'tenant-2', createdAtMs: 2_000 }));

    const results = repo.findByTenant('tenant-1');
    expect(results).toHaveLength(2);
    expect(results[0].goalId).toBe('goal-b');
    expect(results[1].goalId).toBe('goal-a');
    expect(results.every((g) => g.subscriberTenantId === 'tenant-1')).toBe(true);
  });

  it('findByTenant() returns empty array for a tenant with no goals', () => {
    expect(repo.findByTenant('nobody')).toEqual([]);
  });

  it('deleteById() removes the goal from the repository', () => {
    repo.save(makeGoal());
    repo.deleteById('goal-1');

    expect(repo.findByIdUnchecked('goal-1')).toBeNull();
  });

  it('deleteById() is safe for an unknown goalId — no error', () => {
    expect(() => repo.deleteById('no-such-goal')).not.toThrow();
  });

  it('deleteAll() removes all goals regardless of tenant', () => {
    repo.save(makeGoal({ goalId: 'goal-a', subscriberTenantId: 'tenant-1' }));
    repo.save(makeGoal({ goalId: 'goal-b', subscriberTenantId: 'tenant-2' }));
    repo.deleteAll();

    expect(repo.findByTenant('tenant-1')).toHaveLength(0);
    expect(repo.findByTenant('tenant-2')).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. GoalState + GoalRepository — write-through cache integrity
// ─────────────────────────────────────────────────────────────────────────────

describe('Ministry IX — GoalState + GoalRepository write-through', () => {
  let db: DatabaseSync;
  let repo: GoalRepository;
  let state: GoalState;

  beforeEach(() => {
    db = createDatabase(':memory:');
    repo = new GoalRepository(db);
    state = new GoalState(repo);
  });

  afterEach(() => {
    db.close();
  });

  it('register() writes through to the repository', () => {
    state.register(makeGoal());

    expect(repo.findByIdUnchecked('goal-1')).not.toBeNull();
    expect(repo.findByIdUnchecked('goal-1')!.status).toBe(GoalStatus.CREATED);
  });

  it('update() writes the new status through to the repository', () => {
    state.register(makeGoal());
    state.update(makeGoal({ status: GoalStatus.COMPLETED, updatedAtMs: 2_000 }), { isAuthorized: true });

    expect(repo.findByIdUnchecked('goal-1')!.status).toBe(GoalStatus.COMPLETED);
  });

  it('remove() deletes from the repository when authorized', () => {
    state.register(makeGoal());
    state.remove('goal-1', { isAuthorized: true });

    expect(repo.findByIdUnchecked('goal-1')).toBeNull();
  });

  it('clear() deletes all goals from the repository when authorized', () => {
    state.register(makeGoal({ goalId: 'goal-a' }));
    state.register(makeGoal({ goalId: 'goal-b' }));
    state.clear({ isAuthorized: true });

    expect(repo.findByTenant('tenant-1')).toHaveLength(0);
  });

  it('getGoalsForTenant() reads from the repository — includes goals not yet in the cache', () => {
    repo.save(makeGoal({ goalId: 'persisted-directly' }));

    const results = state.getGoalsForTenant('tenant-1');
    expect(results.some((g) => g.goalId === 'persisted-directly')).toBe(true);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Restart simulation — the constitutional objective of Ministry IX
// ─────────────────────────────────────────────────────────────────────────────

describe('Ministry IX — Goal survives server restart', () => {
  it('a Goal committed in one GoalState instance is retrievable in a new instance backed by the same database', () => {
    const db = createDatabase(':memory:');

    // Process lifetime 1 — submit and commit a Goal
    const repo1 = new GoalRepository(db);
    const state1 = new GoalState(repo1);
    state1.register(makeGoal({ goalId: 'committed-goal', status: GoalStatus.CREATED }));
    state1.update(
      makeGoal({ goalId: 'committed-goal', status: GoalStatus.COMPLETED, updatedAtMs: 5_000 }),
      { isAuthorized: true },
    );

    // Process lifetime 2 — new GoalState, same database (simulates restart)
    const repo2 = new GoalRepository(db);
    const state2 = new GoalState(repo2);

    // Map starts empty after restart
    expect(state2.size()).toBe(0);

    // getGoal() falls back to the repository and returns the durable Goal
    const restored = state2.getGoal('committed-goal');
    expect(restored).not.toBeUndefined();
    expect(restored!.goalId).toBe('committed-goal');
    expect(restored!.status).toBe(GoalStatus.COMPLETED);
    expect(restored!.updatedAtMs).toBe(5_000);

    // Cache is now warm — a second call hits the Map
    expect(state2.size()).toBe(1);
    expect(state2.getGoal('committed-goal')).toBe(restored);

    db.close();
  });

  it('a Goal with commercialIntent survives restart — commercial decisions are durable', () => {
    const db = createDatabase(':memory:');

    const intent: MakmanCommercialIntent = {
      publisherTenantId: 'tenant-1',
      compiledAssemblyGraph: makeGraph(),
      accessPolicy: { distributionTier: DistributionTier.SUBSCRIPTION_ONLY, requiresAgeVerification: false },
    };

    const state1 = new GoalState(new GoalRepository(db));
    state1.register(makeGoal({ commercialIntent: intent }));

    const state2 = new GoalState(new GoalRepository(db));
    const restored = state2.getGoal('goal-1');

    expect(restored!.commercialIntent).toEqual(intent);
    expect(restored!.commercialIntent?.accessPolicy.distributionTier).toBe(DistributionTier.SUBSCRIPTION_ONLY);

    db.close();
  });

  it('getGoalsForTenant() after restart returns the full tenant history from the repository', () => {
    const db = createDatabase(':memory:');

    const state1 = new GoalState(new GoalRepository(db));
    state1.register(makeGoal({ goalId: 'goal-x', subscriberTenantId: 'tenant-99', createdAtMs: 1_000 }));
    state1.register(makeGoal({ goalId: 'goal-y', subscriberTenantId: 'tenant-99', createdAtMs: 2_000 }));

    const state2 = new GoalState(new GoalRepository(db));
    const results = state2.getGoalsForTenant('tenant-99');

    expect(results).toHaveLength(2);
    expect(results.map((g) => g.goalId).sort()).toEqual(['goal-x', 'goal-y']);

    db.close();
  });
});
