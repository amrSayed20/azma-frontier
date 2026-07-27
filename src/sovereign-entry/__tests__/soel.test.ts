import { SovereignOperationalEntryLayer } from '../soel';
import { GoalState } from '../../chambers/makman-al-ghayah/goal-state';
import { GoalStatus, GoalPriority } from '../../chambers/makman-al-ghayah/goal-contracts';
import type { GoalContract } from '../../chambers/makman-al-ghayah/goal-contracts';
import { DistributionTier } from '../../chambers/makman-al-ghayah/publication-contracts';
import type { MakmanCommercialIntent } from '../../chambers/makman-al-ghayah/MAKMAN_COMMERCIAL_DISTRIBUTION_CONTRACTS';
import type { MakmanGoalDistributionBridge } from '../../chambers/makman-al-ghayah/MAKMAN_GOAL_DISTRIBUTION_BRIDGE';
import type { PublicConsumptionBoundary } from '../../chambers/makman-al-ghayah/consumption-boundary';
import type { PrePublishingBoundary } from '../../chambers/ras-al-amr/pre-publishing-boundary';
import type { CompiledAssemblyGraph } from '../../chambers/ras-al-amr/pre-publishing-boundary';

function makeGoal(overrides: Partial<GoalContract> = {}): GoalContract {
  return {
    goalId: 'goal-1',
    subscriberTenantId: 'tenant-1',
    title: 'A Compiled Work',
    description: 'a promotional film',
    priority: GoalPriority.MEDIUM,
    status: GoalStatus.CREATED,
    dependencies: [],
    metrics: [],
    createdAtMs: 0,
    updatedAtMs: 0,
    ...overrides,
  };
}

describe('PACKAGE IX — Formal Goal Contract Triad Closure: SOEL.getCreatorGoal', () => {
  it('returns the Goal to its rightful tenant', () => {
    const goalState = new GoalState();
    goalState.register(makeGoal());
    // getCreatorGoal only touches goalState — the other three collaborators
    // are never reached by this method, so stand-ins are sufficient here.
    const soel = new SovereignOperationalEntryLayer(
      goalState,
      {} as MakmanGoalDistributionBridge,
      {} as PublicConsumptionBoundary,
      {} as PrePublishingBoundary,
    );

    expect(soel.getCreatorGoal('goal-1', 'tenant-1')).toEqual(makeGoal());
  });

  it('returns undefined — never the Goal, never an error — for a mismatched tenant', () => {
    const goalState = new GoalState();
    goalState.register(makeGoal());
    const soel = new SovereignOperationalEntryLayer(
      goalState,
      {} as MakmanGoalDistributionBridge,
      {} as PublicConsumptionBoundary,
      {} as PrePublishingBoundary,
    );

    expect(soel.getCreatorGoal('goal-1', 'tenant-2')).toBeUndefined();
  });

  it('returns undefined for a Goal id that does not exist — indistinguishable from the wrong-tenant case', () => {
    const goalState = new GoalState();
    const soel = new SovereignOperationalEntryLayer(
      goalState,
      {} as MakmanGoalDistributionBridge,
      {} as PublicConsumptionBoundary,
      {} as PrePublishingBoundary,
    );

    expect(soel.getCreatorGoal('no-such-goal', 'tenant-1')).toBeUndefined();
  });
});

describe('PACKAGE IX — GoalState.getGoalsForTenant', () => {
  it('returns only the Goals belonging to the requested tenant', () => {
    const goalState = new GoalState();
    goalState.register(makeGoal({ goalId: 'goal-a', subscriberTenantId: 'tenant-1' }));
    goalState.register(makeGoal({ goalId: 'goal-b', subscriberTenantId: 'tenant-2' }));
    goalState.register(makeGoal({ goalId: 'goal-c', subscriberTenantId: 'tenant-1' }));

    const results = goalState.getGoalsForTenant('tenant-1');

    expect(results.map((g) => g.goalId).sort()).toEqual(['goal-a', 'goal-c']);
  });

  it('returns an empty list for a tenant with no Goals, rather than leaking another tenant\'s', () => {
    const goalState = new GoalState();
    goalState.register(makeGoal({ goalId: 'goal-a', subscriberTenantId: 'tenant-1' }));

    expect(goalState.getGoalsForTenant('tenant-2')).toEqual([]);
  });
});

describe('PACKAGE XI — Commercial Intent Durable Storage: round-trip through GoalState', () => {
  it('survives register() -> update() -> getGoal(), reachable via SOEL.getCreatorGoal like any other field', () => {
    const commercialIntent: MakmanCommercialIntent = {
      publisherTenantId: 'tenant-1',
      compiledAssemblyGraph: {} as unknown as CompiledAssemblyGraph,
      accessPolicy: { distributionTier: DistributionTier.COMMERCIAL_PURCHASE, requiresAgeVerification: true },
      coverArtUri: 'https://vault.example/cover.png',
    };

    const goalState = new GoalState();
    goalState.register(makeGoal({ commercialIntent }));
    goalState.update(
      { ...makeGoal({ commercialIntent }), status: GoalStatus.COMPLETED, updatedAtMs: 1 },
      { isAuthorized: true },
    );

    const soel = new SovereignOperationalEntryLayer(
      goalState,
      {} as MakmanGoalDistributionBridge,
      {} as PublicConsumptionBoundary,
      {} as PrePublishingBoundary,
    );

    expect(soel.getCreatorGoal('goal-1', 'tenant-1')?.commercialIntent).toEqual(commercialIntent);
  });
});
