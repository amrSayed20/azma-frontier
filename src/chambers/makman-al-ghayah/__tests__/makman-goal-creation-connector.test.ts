import { createGoalFromCompiledAssembly } from '../MAKMAN_GOAL_CREATION_CONNECTOR';
import { GoalPriority, GoalStatus, PacingPreference, TransitionPreference } from '../goal-contracts';
import { CanvasType } from '../../ras-al-amr/assembly-contracts';
import type { CompiledAssemblyGraph } from '../../ras-al-amr/pre-publishing-boundary';
import { DistributionTier } from '../publication-contracts';
import type { MakmanCommercialIntent } from '../MAKMAN_COMMERCIAL_DISTRIBUTION_CONTRACTS';

function makeCompiledGraph(overrides: Partial<CompiledAssemblyGraph> = {}): CompiledAssemblyGraph {
  return {
    compilationId: 'comp-1',
    sourceCanvasId: 'canvas-1',
    subscriberTenantId: 'tenant-1',
    canvasType: CanvasType.CINEMATIC,
    hydratedCanvas: {
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      canvasType: CanvasType.CINEMATIC,
      title: 'A Compiled Work',
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

function makeCommercialIntent(overrides: Partial<MakmanCommercialIntent> = {}): MakmanCommercialIntent {
  return {
    publisherTenantId: 'tenant-1',
    compiledAssemblyGraph: makeCompiledGraph(),
    accessPolicy: { distributionTier: DistributionTier.PUBLIC_FREE, requiresAgeVerification: false },
    ...overrides,
  };
}

describe('PACKAGE IX — Formal Goal Contract Triad Closure: createGoalFromCompiledAssembly', () => {
  it('carries the compiled graph\'s own already-verified subscriberTenantId onto the new GoalContract', () => {
    const goal = createGoalFromCompiledAssembly(
      makeCompiledGraph({ subscriberTenantId: 'tenant-42' }),
      'a description',
      GoalPriority.HIGH,
      makeCommercialIntent(),
    );

    expect(goal.subscriberTenantId).toBe('tenant-42');
    expect(goal.title).toBe('A Compiled Work');
    expect(goal.description).toBe('a description');
    expect(goal.priority).toBe(GoalPriority.HIGH);
    expect(goal.status).toBe(GoalStatus.CREATED);
  });

  it('never invents a tenant id independent of the compiled graph', () => {
    const goalA = createGoalFromCompiledAssembly(
      makeCompiledGraph({ subscriberTenantId: 'tenant-a' }),
      'x',
      GoalPriority.LOW,
      makeCommercialIntent(),
    );
    const goalB = createGoalFromCompiledAssembly(
      makeCompiledGraph({ subscriberTenantId: 'tenant-b' }),
      'x',
      GoalPriority.LOW,
      makeCommercialIntent(),
    );

    expect(goalA.subscriberTenantId).toBe('tenant-a');
    expect(goalB.subscriberTenantId).toBe('tenant-b');
  });
});

describe('PACKAGE XI — Commercial Intent Durable Storage: createGoalFromCompiledAssembly', () => {
  it('carries the real, caller-supplied commercialIntent onto the new GoalContract', () => {
    const intent = makeCommercialIntent({
      publisherTenantId: 'tenant-42',
      accessPolicy: { distributionTier: DistributionTier.COMMERCIAL_PURCHASE, requiresAgeVerification: true },
      coverArtUri: 'https://vault.example/cover.png',
    });

    const goal = createGoalFromCompiledAssembly(makeCompiledGraph(), 'a description', GoalPriority.HIGH, intent);

    expect(goal.commercialIntent).toBe(intent);
    expect(goal.commercialIntent?.accessPolicy.distributionTier).toBe(DistributionTier.COMMERCIAL_PURCHASE);
    expect(goal.commercialIntent?.coverArtUri).toBe('https://vault.example/cover.png');
  });
});

describe('PACKAGE XV — Creator Pacing Preference Foundation: createGoalFromCompiledAssembly', () => {
  it('carries the real, caller-supplied pacingPreference onto the new GoalContract', () => {
    const goal = createGoalFromCompiledAssembly(
      makeCompiledGraph(),
      'a description',
      GoalPriority.HIGH,
      makeCommercialIntent(),
      PacingPreference.ENERGETIC,
    );

    expect(goal.pacingPreference).toBe(PacingPreference.ENERGETIC);
  });

  it('leaves pacingPreference honestly undefined when the Creator did not state one — never defaulted to a guessed tier', () => {
    const goal = createGoalFromCompiledAssembly(makeCompiledGraph(), 'a description', GoalPriority.HIGH, makeCommercialIntent());

    expect(goal.pacingPreference).toBeUndefined();
  });
});

describe('PACKAGE XVI — Creator Transition Preference Foundation: createGoalFromCompiledAssembly', () => {
  it('carries the real, caller-supplied transitionPreference onto the new GoalContract, independent of pacingPreference', () => {
    const goal = createGoalFromCompiledAssembly(
      makeCompiledGraph(),
      'a description',
      GoalPriority.HIGH,
      makeCommercialIntent(),
      PacingPreference.ENERGETIC,
      TransitionPreference.SOFT,
    );

    expect(goal.transitionPreference).toBe(TransitionPreference.SOFT);
    expect(goal.pacingPreference).toBe(PacingPreference.ENERGETIC);
  });

  it('leaves transitionPreference honestly undefined when the Creator did not state one, even when pacingPreference was stated', () => {
    const goal = createGoalFromCompiledAssembly(
      makeCompiledGraph(),
      'a description',
      GoalPriority.HIGH,
      makeCommercialIntent(),
      PacingPreference.ENERGETIC,
    );

    expect(goal.transitionPreference).toBeUndefined();
  });
});
