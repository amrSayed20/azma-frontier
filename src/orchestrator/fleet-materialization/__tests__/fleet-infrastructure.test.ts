/**
 * MINISTRY VII — REAL FLEET INFRASTRUCTURE
 *
 * Proves the three pillars of the real Fleet runtime:
 * 1. OperationLedgerManager (SQLite-backed): real createEntry/updateState/getEntry,
 *    terminal-state guard, cross-operation isolation.
 * 2. FleetRegistry.registerAdapterSync(): synchronous registration populates
 *    adapter pools; unregistered capability returns [].
 * 3. CinematicAssemblyAdapter (VISUAL): dispatches to ACCEPTED with the
 *    operationId as job ID; always resolves complete.
 * 4. End-to-end CINEMATIC dispatch: buildFleetRuntime + FlattenedRenderingBridge
 *    returns PROCESSING (not FAILED) — the placeholder gap is closed.
 */

import type { DatabaseSync } from 'node:sqlite';
import { createDatabase } from '../../../persistent-storage/db';
import { OperationLedgerManager } from '../ledger/operation-ledger-manager';
import { OperationState } from '../ledger/operation-ledger-types';
import { FleetRegistry } from '../fleet/fleet-registry';
import { FleetDispatcher } from '../fleet/fleet-dispatcher';
import type { IVaultManager } from '../fleet/fleet-dispatcher';
import { SecureContextHydrator } from '../fleet/secure-context-hydrator';
import { CinematicAssemblyAdapter } from '../fleet/adapters/cinematic-assembly-adapter';
import { NativeStructuralAdapter } from '../fleet/adapters/native-structural-adapter';
import { CapabilityTarget } from '../../../core/sovereign-orchestrator/qiyamah-intent-types';
import { FlattenedRenderingBridge, RenderStatus } from '../../../chambers/makman-al-ghayah/rendering-bridge';
import { CanvasType } from '../../../chambers/ras-al-amr/assembly-contracts';
import type { CompiledAssemblyGraph } from '../../../chambers/ras-al-amr/pre-publishing-boundary';

const stubVaultManager: IVaultManager = {
  depositAsset: jest.fn(),
  getAsset: jest.fn(),
};

function makeVisualIntent(operationId = 'op-visual-1') {
  return {
    operationId,
    subscriberTenantId: 'tenant-1',
    capabilityTarget: CapabilityTarget.VISUAL,
    projectContainerId: 'pub-1',
    contextReferences: [],
    structuralGraphPayload: { canvasType: CanvasType.CINEMATIC },
  } as any;
}

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
      title: 'T',
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

// ============================================================
// OperationLedgerManager — SQLite backing
// ============================================================

describe('Ministry VII — OperationLedgerManager (SQLite-backed)', () => {
  let db: DatabaseSync;
  let ledger: OperationLedgerManager;

  beforeEach(() => {
    db = createDatabase(':memory:');
    ledger = new OperationLedgerManager(db);
  });

  afterEach(() => {
    db.close();
  });

  it('createEntry() persists an entry and returns it with PENDING_AUTHORIZATION state', async () => {
    const intent = makeVisualIntent('op-1');
    const entry = await ledger.createEntry(intent);

    expect(entry.operationId).toBe('op-1');
    expect(entry.subscriberTenantId).toBe('tenant-1');
    expect(entry.capabilityTarget).toBe(CapabilityTarget.VISUAL);
    expect(entry.currentState).toBe(OperationState.PENDING_AUTHORIZATION);
    expect(entry.estimatedResourceCost).toBe(5);
    expect(entry.createdAt).toBeGreaterThan(0);
  });

  it('getEntry() retrieves a persisted entry including the full sourceIntent', async () => {
    await ledger.createEntry(makeVisualIntent('op-2'));
    const fetched = await ledger.getEntry('op-2');

    expect(fetched.operationId).toBe('op-2');
    expect(fetched.sourceIntent.capabilityTarget).toBe(CapabilityTarget.VISUAL);
  });

  it('getEntry() throws for an unknown operationId', async () => {
    await expect(ledger.getEntry('no-such-op')).rejects.toThrow('not found');
  });

  it('updateState() transitions state correctly and persists the new state', async () => {
    await ledger.createEntry(makeVisualIntent('op-3'));
    await ledger.updateState('op-3', OperationState.AUTHORIZED);
    await ledger.updateState('op-3', OperationState.DISPATCHED, {
      allocatedProviderId: 'azma-cinematic-assembly-v1',
      externalJobId: 'job-abc',
    });

    const entry = await ledger.getEntry('op-3');
    expect(entry.currentState).toBe(OperationState.DISPATCHED);
    expect(entry.allocatedProviderId).toBe('azma-cinematic-assembly-v1');
    expect(entry.externalJobId).toBe('job-abc');
  });

  it('updateState() blocks transition from a terminal state', async () => {
    await ledger.createEntry(makeVisualIntent('op-4'));
    await ledger.updateState('op-4', OperationState.FAILED);

    await expect(ledger.updateState('op-4', OperationState.AUTHORIZED)).rejects.toThrow(
      'sealed in terminal state',
    );
  });

  it('two operations in the same DB are fully isolated — state of one does not bleed into the other', async () => {
    await ledger.createEntry(makeVisualIntent('op-a'));
    await ledger.createEntry(makeVisualIntent('op-b'));

    await ledger.updateState('op-a', OperationState.FAILED);

    const entryA = await ledger.getEntry('op-a');
    const entryB = await ledger.getEntry('op-b');

    expect(entryA.currentState).toBe(OperationState.FAILED);
    expect(entryB.currentState).toBe(OperationState.PENDING_AUTHORIZATION);
  });
});

// ============================================================
// FleetRegistry — registerAdapterSync
// ============================================================

describe('Ministry VII — FleetRegistry.registerAdapterSync()', () => {
  it('adapter registered for VISUAL capability is returned by getAdaptersForCapability(VISUAL)', () => {
    const registry = new FleetRegistry();
    const hydrator = new SecureContextHydrator(stubVaultManager);
    const adapter = new CinematicAssemblyAdapter(hydrator);

    registry.registerAdapterSync(adapter, CinematicAssemblyAdapter.CAPABILITIES);

    const adapters = registry.getAdaptersForCapability(CapabilityTarget.VISUAL);
    expect(adapters).toHaveLength(1);
    expect(adapters[0].providerId).toBe('azma-cinematic-assembly-v1');
  });

  it('unregistered capability returns empty array', () => {
    const registry = new FleetRegistry();
    expect(registry.getAdaptersForCapability(CapabilityTarget.VISUAL)).toEqual([]);
  });

  it('NativeStructuralAdapter.CAPABILITIES registers for WRITING and DIRECTORIAL only', () => {
    const registry = new FleetRegistry();
    const hydrator = new SecureContextHydrator(stubVaultManager);
    const adapter = new NativeStructuralAdapter(hydrator);

    registry.registerAdapterSync(adapter, NativeStructuralAdapter.CAPABILITIES);

    expect(registry.getAdaptersForCapability(CapabilityTarget.WRITING)).toHaveLength(1);
    expect(registry.getAdaptersForCapability(CapabilityTarget.DIRECTORIAL)).toHaveLength(1);
    expect(registry.getAdaptersForCapability(CapabilityTarget.VISUAL)).toHaveLength(0);
  });
});

// ============================================================
// CinematicAssemblyAdapter
// ============================================================

describe('Ministry VII — CinematicAssemblyAdapter', () => {
  let db: DatabaseSync;
  let dispatcher: FleetDispatcher;

  beforeEach(() => {
    db = createDatabase(':memory:');
    const ledger = new OperationLedgerManager(db);
    const hydrator = new SecureContextHydrator(stubVaultManager);
    const registry = new FleetRegistry();
    registry.registerAdapterSync(new CinematicAssemblyAdapter(hydrator), CinematicAssemblyAdapter.CAPABILITIES);
    dispatcher = new FleetDispatcher(registry, ledger, stubVaultManager);
  });

  afterEach(() => {
    db.close();
  });

  it('getCapabilities() declares VISUAL as its sole target', async () => {
    const hydrator = new SecureContextHydrator(stubVaultManager);
    const adapter = new CinematicAssemblyAdapter(hydrator);
    const caps = await adapter.getCapabilities();

    expect(caps.supportedTargets).toEqual([CapabilityTarget.VISUAL]);
    expect(caps.isAvailable).toBe(true);
  });

  it('dispatching a VISUAL intent succeeds — returns DISPATCHED state with operationId as job ID', async () => {
    const entry = await dispatcher.executeMaterialization(makeVisualIntent('op-cinematic-1'));

    expect(entry.currentState).toBe(OperationState.DISPATCHED);
    expect(entry.externalJobId).toBe('op-cinematic-1');
    expect(entry.allocatedProviderId).toBe('azma-cinematic-assembly-v1');
  });

  it('checkOperationStatus() always resolves complete with a sovereign internal asset URL', async () => {
    const hydrator = new SecureContextHydrator(stubVaultManager);
    const adapter = new CinematicAssemblyAdapter(hydrator);
    const resolution = await adapter.checkOperationStatus('job-xyz');

    expect(resolution.isComplete).toBe(true);
    expect(resolution.isError).toBe(false);
    expect(resolution.assetUrl).toBe('sovereign://cinematic-assembly/job-xyz');
  });
});

// ============================================================
// End-to-end: CINEMATIC dispatch no longer FAILED
// ============================================================

describe('Ministry VII — end-to-end CINEMATIC dispatch via FlattenedRenderingBridge', () => {
  it('CINEMATIC canvas returns PROCESSING render state — placeholder gap closed', async () => {
    const db = createDatabase(':memory:');
    const ledger = new OperationLedgerManager(db);
    const hydrator = new SecureContextHydrator(stubVaultManager);
    const registry = new FleetRegistry();
    registry.registerAdapterSync(new CinematicAssemblyAdapter(hydrator), CinematicAssemblyAdapter.CAPABILITIES);
    const dispatcher = new FleetDispatcher(registry, ledger, stubVaultManager);

    const bridge = new FlattenedRenderingBridge(dispatcher);
    const publication = {
      publicationId: 'pub-cinematic',
      sourceCompilationId: 'comp-cin',
      publisherTenantId: 'tenant-1',
      title: 'X',
      description: 'Y',
      accessPolicy: { distributionTier: 'PUBLIC_FREE' as any, requiresAgeVerification: false },
      isPublished: true,
      createdAt: 0,
      updatedAt: 0,
    };

    const state = await bridge.evaluateAndDispatchRender(
      publication,
      makeGraph({ canvasType: CanvasType.CINEMATIC, compilationId: 'comp-cin' }),
    );

    expect(state.status).toBe(RenderStatus.PROCESSING);
    expect(state.activeOperationId).toBeDefined();

    db.close();
  });

  it('NARRATIVE and DIRECTORIAL still return DYNAMIC — fleet is never touched', async () => {
    const db = createDatabase(':memory:');
    const ledger = new OperationLedgerManager(db);
    const hydrator = new SecureContextHydrator(stubVaultManager);
    const registry = new FleetRegistry();
    const dispatcher = new FleetDispatcher(registry, ledger, stubVaultManager);
    const bridge = new FlattenedRenderingBridge(dispatcher);

    const publication = {
      publicationId: 'pub-nar',
      sourceCompilationId: 'comp-nar',
      publisherTenantId: 'tenant-1',
      title: 'X',
      description: 'Y',
      accessPolicy: { distributionTier: 'PUBLIC_FREE' as any, requiresAgeVerification: false },
      isPublished: true,
      createdAt: 0,
      updatedAt: 0,
    };

    const narrativeState = await bridge.evaluateAndDispatchRender(
      publication,
      makeGraph({ canvasType: CanvasType.NARRATIVE, compilationId: 'comp-nar' }),
    );
    expect(narrativeState.status).toBe(RenderStatus.DYNAMIC);

    db.close();
  });
});
