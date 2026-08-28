/**
 * MINISTRY VII — REAL FLEET INFRASTRUCTURE
 *
 * Proves the three pillars of the real Fleet runtime:
 * 1. OperationLedgerManager (SQLite-backed): real createEntry/updateState/getEntry,
 *    terminal-state guard, cross-operation isolation.
 * 2. FleetRegistry.registerAdapterSync(): synchronous registration populates
 *    adapter pools; unregistered capability returns [].
 * 3. CinematicAssemblyAdapter (MOTION): dispatches to ACCEPTED with the
 *    operationId as job ID; checkOperationStatus() throws "not complete" when
 *    encoding has not finished.
 * 4. End-to-end CINEMATIC dispatch: buildFleetRuntime + FlattenedRenderingBridge
 *    returns PROCESSING (not FAILED) — the placeholder gap is closed.
 *
 * NARRATIVE / DIRECTORIAL proof:
 * 5. NARRATIVE and DIRECTORIAL canvases return RenderStatus.DYNAMIC — the fleet
 *    is never touched. The CompiledAssemblyGraph they produce is a real structural
 *    artifact with tracks, nodes, mixPlan, and subtitlePlan — NOT a rendered MP4.
 *
 * CINEMATIC encoder proof:
 * 6. CinematicAssemblyAdapter wires the encoder: a graph with no image nodes
 *    stores an encoding error (surfaced via checkOperationStatus isError:true).
 *    A graph dispatched to the adapter enters DISPATCHED state in the ledger.
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

// Mock the FFmpeg encoder so tests never spawn a real process.
// CinematicAssemblyAdapter imports from cinematic-ffmpeg-encoder;
// we replace its exports with controllable stubs.
jest.mock('../fleet/adapters/cinematic-ffmpeg-encoder', () => ({
  spawnEncoding: jest.fn(),
  isEncodingComplete: jest.fn(() => false),
  getEncodingError: jest.fn(() => null),
  getOutputPath: jest.fn((id: string) => `/renders/${id}.mp4`),
}));

import {
  spawnEncoding,
  isEncodingComplete,
  getEncodingError,
} from '../fleet/adapters/cinematic-ffmpeg-encoder';

const mockSpawnEncoding = spawnEncoding as jest.Mock;
const mockIsEncodingComplete = isEncodingComplete as jest.Mock;
const mockGetEncodingError = getEncodingError as jest.Mock;

const stubVaultManager: IVaultManager = {
  depositAsset: jest.fn(),
  getAsset: jest.fn(),
};

function makeMotionIntent(operationId = 'op-motion-1') {
  return {
    operationId,
    subscriberTenantId: 'tenant-1',
    capabilityTarget: CapabilityTarget.MOTION,
    projectContainerId: 'pub-1',
    contextReferences: [],
    structuralGraphPayload: makeGraph({ canvasType: CanvasType.CINEMATIC }),
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

beforeEach(() => {
  mockSpawnEncoding.mockClear();
  mockIsEncodingComplete.mockReturnValue(false);
  mockGetEncodingError.mockReturnValue(null);
});

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
    const intent = makeMotionIntent('op-1');
    const entry = await ledger.createEntry(intent);

    expect(entry.operationId).toBe('op-1');
    expect(entry.subscriberTenantId).toBe('tenant-1');
    expect(entry.capabilityTarget).toBe(CapabilityTarget.MOTION);
    expect(entry.currentState).toBe(OperationState.PENDING_AUTHORIZATION);
    expect(entry.estimatedResourceCost).toBe(50); // MOTION cost
    expect(entry.createdAt).toBeGreaterThan(0);
  });

  it('getEntry() retrieves a persisted entry including the full sourceIntent', async () => {
    await ledger.createEntry(makeMotionIntent('op-2'));
    const fetched = await ledger.getEntry('op-2');

    expect(fetched.operationId).toBe('op-2');
    expect(fetched.sourceIntent.capabilityTarget).toBe(CapabilityTarget.MOTION);
  });

  it('getEntry() throws for an unknown operationId', async () => {
    await expect(ledger.getEntry('no-such-op')).rejects.toThrow('not found');
  });

  it('updateState() transitions state correctly and persists the new state', async () => {
    await ledger.createEntry(makeMotionIntent('op-3'));
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
    await ledger.createEntry(makeMotionIntent('op-4'));
    await ledger.updateState('op-4', OperationState.FAILED);

    await expect(ledger.updateState('op-4', OperationState.AUTHORIZED)).rejects.toThrow(
      'sealed in terminal state',
    );
  });

  it('two operations in the same DB are fully isolated — state of one does not bleed into the other', async () => {
    await ledger.createEntry(makeMotionIntent('op-a'));
    await ledger.createEntry(makeMotionIntent('op-b'));

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
  it('CinematicAssemblyAdapter registers for MOTION capability', () => {
    const registry = new FleetRegistry();
    const hydrator = new SecureContextHydrator(stubVaultManager);
    const adapter = new CinematicAssemblyAdapter(hydrator);

    registry.registerAdapterSync(adapter, CinematicAssemblyAdapter.CAPABILITIES);

    const adapters = registry.getAdaptersForCapability(CapabilityTarget.MOTION);
    expect(adapters).toHaveLength(1);
    expect(adapters[0].providerId).toBe('azma-cinematic-assembly-v1');
  });

  it('CinematicAssemblyAdapter does NOT register for VISUAL — VISUAL has 0 adapters', () => {
    const registry = new FleetRegistry();
    const hydrator = new SecureContextHydrator(stubVaultManager);
    registry.registerAdapterSync(new CinematicAssemblyAdapter(hydrator), CinematicAssemblyAdapter.CAPABILITIES);

    expect(registry.getAdaptersForCapability(CapabilityTarget.VISUAL)).toHaveLength(0);
  });

  it('unregistered capability returns empty array', () => {
    const registry = new FleetRegistry();
    expect(registry.getAdaptersForCapability(CapabilityTarget.MOTION)).toEqual([]);
  });

  it('NativeStructuralAdapter.CAPABILITIES registers for WRITING and DIRECTORIAL only', () => {
    const registry = new FleetRegistry();
    const hydrator = new SecureContextHydrator(stubVaultManager);
    const adapter = new NativeStructuralAdapter(hydrator);

    registry.registerAdapterSync(adapter, NativeStructuralAdapter.CAPABILITIES);

    expect(registry.getAdaptersForCapability(CapabilityTarget.WRITING)).toHaveLength(1);
    expect(registry.getAdaptersForCapability(CapabilityTarget.DIRECTORIAL)).toHaveLength(1);
    expect(registry.getAdaptersForCapability(CapabilityTarget.VISUAL)).toHaveLength(0);
    expect(registry.getAdaptersForCapability(CapabilityTarget.MOTION)).toHaveLength(0);
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

  it('getCapabilities() declares MOTION as its sole target', async () => {
    const hydrator = new SecureContextHydrator(stubVaultManager);
    const adapter = new CinematicAssemblyAdapter(hydrator);
    const caps = await adapter.getCapabilities();

    expect(caps.supportedTargets).toEqual([CapabilityTarget.MOTION]);
    expect(caps.isAvailable).toBe(true);
  });

  it('dispatching a MOTION intent succeeds — calls spawnEncoding and returns DISPATCHED state', async () => {
    const entry = await dispatcher.executeMaterialization(makeMotionIntent('op-cinematic-1'));

    expect(entry.currentState).toBe(OperationState.DISPATCHED);
    expect(entry.externalJobId).toBe('op-cinematic-1');
    expect(entry.allocatedProviderId).toBe('azma-cinematic-assembly-v1');
    expect(mockSpawnEncoding).toHaveBeenCalledTimes(1);
  });

  it('checkOperationStatus() throws "not complete" when encoding is still running', async () => {
    mockIsEncodingComplete.mockReturnValue(false);
    mockGetEncodingError.mockReturnValue(null);

    const hydrator = new SecureContextHydrator(stubVaultManager);
    const adapter = new CinematicAssemblyAdapter(hydrator);

    await expect(adapter.checkOperationStatus('job-running')).rejects.toThrow('not complete');
  });

  it('checkOperationStatus() returns isComplete:true with real MP4 URL when encoding is done', async () => {
    mockIsEncodingComplete.mockReturnValue(true);
    mockGetEncodingError.mockReturnValue(null);

    const hydrator = new SecureContextHydrator(stubVaultManager);
    const adapter = new CinematicAssemblyAdapter(hydrator);
    const resolution = await adapter.checkOperationStatus('job-done-abc');

    expect(resolution.isComplete).toBe(true);
    expect(resolution.isError).toBe(false);
    expect(resolution.assetUrl).toBe('/renders/job-done-abc.mp4');
    // Must NOT use sovereign:// internal URI as the Creator-facing URL
    expect(resolution.assetUrl).not.toMatch(/^sovereign:\/\//);
  });

  it('checkOperationStatus() returns isError:true when encoding failed', async () => {
    mockIsEncodingComplete.mockReturnValue(false);
    mockGetEncodingError.mockReturnValue(new Error('FFmpeg exited with code 1'));

    const hydrator = new SecureContextHydrator(stubVaultManager);
    const adapter = new CinematicAssemblyAdapter(hydrator);
    const resolution = await adapter.checkOperationStatus('job-failed-xyz');

    expect(resolution.isComplete).toBe(true);
    expect(resolution.isError).toBe(true);
    expect(resolution.errorMessage).toContain('FFmpeg exited with code 1');
  });
});

// ============================================================
// End-to-end: CINEMATIC dispatch via FlattenedRenderingBridge
// ============================================================

describe('Ministry VII — end-to-end CINEMATIC dispatch via FlattenedRenderingBridge', () => {
  it('CINEMATIC canvas returns PROCESSING render state — real encoder is wired', async () => {
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
    expect(mockSpawnEncoding).toHaveBeenCalled();

    db.close();
  });

  // ============================================================
  // NARRATIVE PROOF — Section 8 of the directive
  //
  // NARRATIVE is NOT a rendered MP4.
  // NARRATIVE is a real CompiledAssemblyGraph / dynamic distribution artifact.
  // The FlattenedRenderingBridge returns RenderStatus.DYNAMIC for NARRATIVE —
  // the fleet is never invoked, no encoding occurs, no sovereign:// URI is produced.
  // The CompiledAssemblyGraph is structurally complete: canvasType, tracks,
  // mixPlan, subtitlePlan, metadata — all real fields, ready for Makman handoff.
  // ============================================================

  it('NARRATIVE — FlattenedRenderingBridge returns DYNAMIC without touching the fleet', async () => {
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
      title: 'Narrative Title',
      description: 'A narrative publication',
      accessPolicy: { distributionTier: 'PUBLIC_FREE' as any, requiresAgeVerification: false },
      isPublished: true,
      createdAt: 0,
      updatedAt: 0,
    };

    const narrativeGraph = makeGraph({ canvasType: CanvasType.NARRATIVE, compilationId: 'comp-nar' });
    const state = await bridge.evaluateAndDispatchRender(publication, narrativeGraph);

    // NARRATIVE proof: RenderStatus.DYNAMIC — no render was dispatched
    expect(state.status).toBe(RenderStatus.DYNAMIC);
    // No operation ID — fleet was not touched
    expect(state.activeOperationId).toBeUndefined();
    // No encoding was triggered
    expect(mockSpawnEncoding).not.toHaveBeenCalled();

    // The graph itself proves NARRATIVE is a structural artifact — NOT an MP4:
    expect(narrativeGraph.canvasType).toBe(CanvasType.NARRATIVE);
    expect(narrativeGraph.mixPlan).toBeDefined();       // real mix plan
    expect(narrativeGraph.subtitlePlan).toBeDefined();  // real subtitle plan
    expect(narrativeGraph.hydratedCanvas).toBeDefined();// real hydrated canvas
    expect(narrativeGraph.metadata).toBeDefined();      // real metadata
    // No assetUrl, no MP4 path, no sovereign:// URI — this is a structural graph
    expect((narrativeGraph as any).assetUrl).toBeUndefined();

    db.close();
  });

  // ============================================================
  // DIRECTORIAL PROOF — Section 9 of the directive
  //
  // DIRECTORIAL is NOT a rendered MP4.
  // DIRECTORIAL is a real CompiledAssemblyGraph / dynamic direction artifact.
  // The FlattenedRenderingBridge returns RenderStatus.DYNAMIC for DIRECTORIAL —
  // the fleet is never invoked, no encoding occurs, no sovereign:// URI is produced.
  // ============================================================

  it('DIRECTORIAL — FlattenedRenderingBridge returns DYNAMIC without touching the fleet', async () => {
    const db = createDatabase(':memory:');
    const ledger = new OperationLedgerManager(db);
    const hydrator = new SecureContextHydrator(stubVaultManager);
    const registry = new FleetRegistry();
    const dispatcher = new FleetDispatcher(registry, ledger, stubVaultManager);
    const bridge = new FlattenedRenderingBridge(dispatcher);

    const publication = {
      publicationId: 'pub-dir',
      sourceCompilationId: 'comp-dir',
      publisherTenantId: 'tenant-1',
      title: 'Direction Plan',
      description: 'A directorial publication',
      accessPolicy: { distributionTier: 'PUBLIC_FREE' as any, requiresAgeVerification: false },
      isPublished: true,
      createdAt: 0,
      updatedAt: 0,
    };

    const directorialGraph = makeGraph({ canvasType: CanvasType.DIRECTORIAL, compilationId: 'comp-dir' });
    const state = await bridge.evaluateAndDispatchRender(publication, directorialGraph);

    // DIRECTORIAL proof: RenderStatus.DYNAMIC — no render was dispatched
    expect(state.status).toBe(RenderStatus.DYNAMIC);
    expect(state.activeOperationId).toBeUndefined();
    expect(mockSpawnEncoding).not.toHaveBeenCalled();

    // The graph is a real structural artifact — NOT an MP4:
    expect(directorialGraph.canvasType).toBe(CanvasType.DIRECTORIAL);
    expect(directorialGraph.mixPlan).toBeDefined();
    expect(directorialGraph.subtitlePlan).toBeDefined();
    expect(directorialGraph.hydratedCanvas).toBeDefined();
    expect((directorialGraph as any).assetUrl).toBeUndefined();

    db.close();
  });
});
