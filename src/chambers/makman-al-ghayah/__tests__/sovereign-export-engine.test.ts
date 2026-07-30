/**
 * PACKAGE XXVII — SOVEREIGN EXPORT ENGINE: proves, with real code (not
 * mocked business logic), that the already-existing, already-wired chain
 * — MakmanGoalDistributionBridge.bridgeToDestination() ->
 * FlattenedRenderingBridge.evaluateAndDispatchRender() ->
 * PublicConsumptionBoundary.requestConsumption() — is the constitutional
 * Sovereign Export Engine: it delivers the already-rendered Render Graph
 * without ever thinking, rendering, modifying, or directing. None of
 * these three files had any test before this package.
 *
 * Also proves the honestly disclosed gap: FlattenedRenderingBridge's own
 * CINEMATIC-flattening path genuinely fails today (not fabricated as a
 * false success) because the real FleetDispatcher it depends on is
 * composed with the pre-existing, disclosed placeholder
 * (createUnbuiltAlWatinPlaceholder, MAG-LF-001) — a platform-level gap
 * this package does not attempt to close, per its own "do not implement
 * new orchestration/new media processing" prohibition.
 */
import { FlattenedRenderingBridge, RenderStatus } from '../rendering-bridge';
import { MakmanGoalDistributionBridge, MakmanPublicationRegistry } from '../MAKMAN_GOAL_DISTRIBUTION_BRIDGE';
import { PublicConsumptionBoundary } from '../consumption-boundary';
import { SovereignAccessPolicyEngine } from '../access-policy-engine';
import { MonetizationLedgerGateway } from '../monetization-ledger-gateway';
import { DistributionTier } from '../publication-contracts';
import type { SovereignPublication } from '../publication-contracts';
import { GoalPriority, GoalStatus } from '../goal-contracts';
import type { GoalContract } from '../goal-contracts';
import type { RuntimeChainContext } from '../MAKMAN_OPERATIONAL_DELIVERY_CONTRACTS';
import type { MakmanCommercialIntent } from '../MAKMAN_COMMERCIAL_DISTRIBUTION_CONTRACTS';
import { CanvasType } from '../../ras-al-amr/assembly-contracts';
import type { CompiledAssemblyGraph } from '../../ras-al-amr/pre-publishing-boundary';
import { createUnbuiltAlWatinPlaceholder } from '../../../sovereign-entry/unbuilt-al-watin-placeholder';
import type { IVaultManager } from '../../../orchestrator/fleet-materialization/fleet/fleet-dispatcher';

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

const stubVaultManager: IVaultManager = {
  depositAsset: jest.fn(),
  getAsset: jest.fn(),
};

function makeFleetDispatcher() {
  return createUnbuiltAlWatinPlaceholder(stubVaultManager);
}

describe('Package XXVII — Sovereign Export Engine: FlattenedRenderingBridge', () => {
  it('resolves DYNAMIC without ever touching Fleet dispatch, for NARRATIVE and DIRECTORIAL graphs', async () => {
    const bridge = new FlattenedRenderingBridge(makeFleetDispatcher());
    const publication: SovereignPublication = {
      publicationId: 'pub-1',
      sourceCompilationId: 'comp-1',
      publisherTenantId: 'tenant-1',
      title: 'X',
      description: 'Y',
      accessPolicy: { distributionTier: DistributionTier.PUBLIC_FREE, requiresAgeVerification: false },
      isPublished: true,
      createdAt: 0,
      updatedAt: 0,
    };

    const narrativeState = await bridge.evaluateAndDispatchRender(publication, makeCompiledGraph({ canvasType: CanvasType.NARRATIVE }));
    expect(narrativeState.status).toBe(RenderStatus.DYNAMIC);

    const directorialState = await bridge.evaluateAndDispatchRender(publication, makeCompiledGraph({ canvasType: CanvasType.DIRECTORIAL }));
    expect(directorialState.status).toBe(RenderStatus.DYNAMIC);
  });

  it('honestly resolves to FAILED — never a fabricated COMPLETED — when CINEMATIC flattening hits the disclosed Fleet/Ledger placeholder gap', async () => {
    const bridge = new FlattenedRenderingBridge(makeFleetDispatcher());
    const publication: SovereignPublication = {
      publicationId: 'pub-2',
      sourceCompilationId: 'comp-2',
      publisherTenantId: 'tenant-1',
      title: 'X',
      description: 'Y',
      accessPolicy: { distributionTier: DistributionTier.PUBLIC_FREE, requiresAgeVerification: false },
      isPublished: true,
      createdAt: 0,
      updatedAt: 0,
    };

    const state = await bridge.evaluateAndDispatchRender(publication, makeCompiledGraph({ canvasType: CanvasType.CINEMATIC, compilationId: 'comp-2' }));

    expect(state.status).toBe(RenderStatus.FAILED);
    expect(bridge.getRenderState('pub-2')?.status).toBe(RenderStatus.FAILED);
  });
});

describe('Package XXVII — Sovereign Export Engine: MakmanGoalDistributionBridge', () => {
  function makeCompletedGoal(goalId: string): GoalContract {
    return {
      goalId,
      subscriberTenantId: 'tenant-1',
      title: 'A Compiled Work',
      description: 'desc',
      priority: GoalPriority.MEDIUM,
      status: GoalStatus.COMPLETED,
      dependencies: [],
      metrics: [],
      createdAtMs: 0,
      updatedAtMs: 0,
    };
  }

  function makeChainContext(goalId: string): RuntimeChainContext {
    return {
      goalId,
      presenceId: 'presence-1',
      awarenessId: 'awareness-1',
      guardianId: 'guardian-1',
      strategyId: 'strategy-1',
      communicationId: 'communication-1',
    };
  }

  function makeIntent(overrides: Partial<MakmanCommercialIntent> = {}): MakmanCommercialIntent {
    return {
      publisherTenantId: 'tenant-1',
      compiledAssemblyGraph: makeCompiledGraph({ canvasType: CanvasType.NARRATIVE }),
      accessPolicy: { distributionTier: DistributionTier.PUBLIC_FREE, requiresAgeVerification: false },
      ...overrides,
    };
  }

  it('rejects a Goal that has not reached COMPLETED — Export never proceeds on an unfinished Goal', async () => {
    const registry = new MakmanPublicationRegistry();
    const renderingBridge = new FlattenedRenderingBridge(makeFleetDispatcher());
    const bridge = new MakmanGoalDistributionBridge(registry, renderingBridge);

    const inProgressGoal: GoalContract = { ...makeCompletedGoal('goal-1'), status: GoalStatus.IN_PROGRESS };

    await expect(
      bridge.bridgeToDestination(inProgressGoal, makeChainContext('goal-1'), makeIntent()),
    ).rejects.toThrow(/status is \[IN_PROGRESS\]/);
  });

  it('forwards the exact same Render Graph it received to the Rendering Engine, unmodified — Export consumes only the Render Graph', async () => {
    const registry = new MakmanPublicationRegistry();
    const renderingBridge = new FlattenedRenderingBridge(makeFleetDispatcher());
    const bridge = new MakmanGoalDistributionBridge(registry, renderingBridge);

    const graph = makeCompiledGraph({ canvasType: CanvasType.NARRATIVE, compilationId: 'comp-77' });
    const goal = makeCompletedGoal('goal-2');
    const result = await bridge.bridgeToDestination(goal, makeChainContext('goal-2'), makeIntent({ compiledAssemblyGraph: graph }));

    expect(result.publication.sourceCompilationId).toBe('comp-77');
    expect(result.renderState.status).toBe(RenderStatus.DYNAMIC);
    expect(await registry.getPublication(result.publication.publicationId)).toEqual(result.publication);
  });

  it('rejects a mismatched Goal identity between the Goal and its chain context', async () => {
    const registry = new MakmanPublicationRegistry();
    const renderingBridge = new FlattenedRenderingBridge(makeFleetDispatcher());
    const bridge = new MakmanGoalDistributionBridge(registry, renderingBridge);

    await expect(
      bridge.bridgeToDestination(makeCompletedGoal('goal-3'), makeChainContext('goal-DIFFERENT'), makeIntent()),
    ).rejects.toThrow(/identity mismatch/);
  });
});

describe('Package XXVII — Sovereign Export Engine: PublicConsumptionBoundary (delivery)', () => {
  function makePublication(overrides: Partial<SovereignPublication> = {}): SovereignPublication {
    return {
      publicationId: 'pub-1',
      sourceCompilationId: 'comp-1',
      publisherTenantId: 'tenant-1',
      title: 'X',
      description: 'Y',
      accessPolicy: { distributionTier: DistributionTier.PUBLIC_FREE, requiresAgeVerification: false },
      isPublished: true,
      createdAt: 0,
      updatedAt: 0,
      ...overrides,
    };
  }

  it('denies delivery of a PRIVATE publication to an unrelated consumer — never leaks the payload', async () => {
    const registry = new MakmanPublicationRegistry();
    const renderingBridge = new FlattenedRenderingBridge(makeFleetDispatcher());
    registry.register(makePublication({ accessPolicy: { distributionTier: DistributionTier.PRIVATE, requiresAgeVerification: false } }));

    const boundary = new PublicConsumptionBoundary(registry, new SovereignAccessPolicyEngine(), new MonetizationLedgerGateway(), renderingBridge);

    const response = await boundary.requestConsumption('pub-1', 'some-other-tenant');

    expect(response.isAuthorized).toBe(false);
    expect(response.payload).toBeUndefined();
  });

  it('delivers the already-rendered DYNAMIC payload for an authorized PUBLIC_FREE publication whose graph was already rendered', async () => {
    const registry = new MakmanPublicationRegistry();
    const renderingBridge = new FlattenedRenderingBridge(makeFleetDispatcher());
    const publication = makePublication();
    registry.register(publication);
    // Real render dispatch, exactly as the Distribution Bridge would trigger it.
    await renderingBridge.evaluateAndDispatchRender(publication, makeCompiledGraph({ canvasType: CanvasType.NARRATIVE }));

    const boundary = new PublicConsumptionBoundary(registry, new SovereignAccessPolicyEngine(), new MonetizationLedgerGateway(), renderingBridge);

    const response = await boundary.requestConsumption('pub-1');

    expect(response.isAuthorized).toBe(true);
    expect(response.deliveryStatus).toBe(RenderStatus.DYNAMIC);
    expect(response.payload).toEqual({ format: 'DYNAMIC', sourceCompilationId: 'comp-1' });
  });

  it('honestly reports PENDING when access is authorized but rendering has not been dispatched yet — never fabricates a payload', async () => {
    const registry = new MakmanPublicationRegistry();
    const renderingBridge = new FlattenedRenderingBridge(makeFleetDispatcher());
    registry.register(makePublication());

    const boundary = new PublicConsumptionBoundary(registry, new SovereignAccessPolicyEngine(), new MonetizationLedgerGateway(), renderingBridge);

    const response = await boundary.requestConsumption('pub-1');

    expect(response.isAuthorized).toBe(true);
    expect(response.deliveryStatus).toBe(RenderStatus.PENDING);
    expect(response.payload).toBeUndefined();
  });
});
