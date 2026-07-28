/**
 * PACKAGE XXVI — SOVEREIGN RENDERING ENGINE: proves, end-to-end and with
 * real code (not mocked business logic), that PrePublishingBoundary
 * (the already-existing, already-sole-live compilation path — see this
 * package's own disclosure in direction-workspace-constitution.ts) is
 * constitutionally the Rendering Engine: it faithfully materializes the
 * exact Sovereign Direction State — including the effects of every real
 * DirectionDecision executed through AssemblyRuntime — into one unified
 * Render Graph (CompiledAssemblyGraph). No test previously existed for
 * this file at all; only persistent-storage's DB layer is mocked, exactly
 * matching the established pattern in sovereign-vault-manager.test.ts.
 */
jest.mock('../../../persistent-storage', () => ({
  getDb: jest.fn(() => 'fake-db-handle'),
  insertVaultAsset: jest.fn(),
  getVaultAsset: jest.fn(),
  listVaultAssetsForTenant: jest.fn(),
  linkGoalToVaultAsset: jest.fn(),
}));

import { getVaultAsset } from '../../../persistent-storage';
import { SovereignVaultManager } from '../../../vault/sovereign-vault-manager';
import { AssetFamily } from '../../../vault/sovereign-vault-types';
import type { VaultAsset } from '../../../vault/sovereign-vault-types';
import { CapabilityTarget } from '../../../core/sovereign-orchestrator/qiyamah-intent-types';

import { PrePublishingBoundary } from '../pre-publishing-boundary';
import { VaultRehydrationBridge } from '../vault-rehydration-bridge';
import { AssemblyRuntime } from '../assembly-runtime';
import { RasAlAmrStateManager } from '../ras-al-amr-state-manager';
import { CanvasType, DirectionNodeRole } from '../assembly-contracts';
import type { SovereignCanvas } from '../assembly-contracts';
import { CanvasActionType } from '../assembly-directive-payloads';
import type {
  AddNodePayload,
  AddTrackPayload,
  ReorderNodePayload,
  UpdateNodeClassificationPayload,
  SetNodeActivePayload,
  SetNodeLockPayload,
} from '../assembly-directive-payloads';
import { toDirectionDecision } from '../direction-workspace-constitution';

const mockGetVaultAsset = getVaultAsset as jest.Mock;

function makeVaultAsset(assetId: string): VaultAsset {
  return {
    assetId,
    subscriberTenantId: 'tenant-1',
    originatingOperationId: 'op-1',
    capabilityTarget: CapabilityTarget.VISUAL,
    assetFamily: AssetFamily.MEDIA,
    secureStorageUri: `s3://bucket/${assetId}.png`,
    metadata: {},
    createdAt: 1,
    updatedAt: 1,
  };
}

function makeEmptyCanvas(): SovereignCanvas {
  return {
    canvasId: 'canvas-1',
    subscriberTenantId: 'tenant-1',
    canvasType: CanvasType.CINEMATIC,
    title: 'Test Canvas',
    tracks: [{ trackId: 'track-1', trackName: 'Main', isMuted: false, isHidden: false, nodes: [] }],
    createdAt: 0,
    updatedAt: 0,
  };
}

describe('Package XXVI — Sovereign Rendering Engine (PrePublishingBoundary as Render Graph producer)', () => {
  const stateManager = new RasAlAmrStateManager();
  const runtime = new AssemblyRuntime(stateManager);
  const vaultManager = new SovereignVaultManager();
  const rehydrationBridge = new VaultRehydrationBridge(vaultManager);
  const boundary = new PrePublishingBoundary(rehydrationBridge);

  beforeEach(() => {
    mockGetVaultAsset.mockReset();
    mockGetVaultAsset.mockImplementation((_db: unknown, assetId: string) => makeVaultAsset(assetId));
  });

  it('produces one Render Graph reflecting the accumulated effect of Direction Decisions issued by BOTH operators, executed only through AssemblyRuntime', async () => {
    let canvas = makeEmptyCanvas();

    // Manual Director adds the first node.
    const addNodeMutation: AddNodePayload = {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-1',
      vaultAssetId: 'asset-alpha',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.VISUAL,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', addNodeMutation));

    // Automatic Director adds a second node.
    const addSecondNodeMutation: AddNodePayload = {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-1',
      vaultAssetId: 'asset-beta',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.AUDIO,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('automatic-director', addSecondNodeMutation));

    const [firstNodeId, secondNodeId] = canvas.tracks[0].nodes.map((n) => n.nodeId);

    // Manual Director creates a second group.
    const addTrackMutation: AddTrackPayload = {
      actionType: CanvasActionType.ADD_TRACK,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      trackName: 'Secondary',
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', addTrackMutation));

    // Manual Director reorders the two nodes (swap).
    const reorderMutation: ReorderNodePayload = {
      actionType: CanvasActionType.REORDER_NODE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-1',
      targetNodeId: secondNodeId,
      direction: 'up',
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', reorderMutation));

    // Manual Director classifies the (now-first) node.
    const classifyMutation: UpdateNodeClassificationPayload = {
      actionType: CanvasActionType.UPDATE_NODE_CLASSIFICATION,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-1',
      targetNodeId: secondNodeId,
      directionRole: DirectionNodeRole.OPENING_SHOT,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', classifyMutation));

    // Manual Director disables the other node.
    const disableMutation: SetNodeActivePayload = {
      actionType: CanvasActionType.SET_NODE_ACTIVE,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-1',
      targetNodeId: firstNodeId,
      active: false,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', disableMutation));

    // Manual Director locks the classified node's direction.
    const lockMutation: SetNodeLockPayload = {
      actionType: CanvasActionType.SET_NODE_LOCK,
      canvasId: canvas.canvasId,
      subscriberTenantId: canvas.subscriberTenantId,
      targetTrackId: 'track-1',
      targetNodeId: secondNodeId,
      locked: true,
    };
    canvas = runtime.execute(canvas, toDirectionDecision('manual-director', lockMutation));

    // Now materialize the current Sovereign Direction State into the Render Graph.
    const graph = await boundary.compileForPublishing(canvas, 'tenant-1');

    // Every Direction Node participates in the graph.
    const graphNodeIds = graph.hydratedCanvas.tracks[0].nodes.map((n) => n.nodeId);
    expect(graphNodeIds).toEqual([secondNodeId, firstNodeId]); // reflects the executed reorder
    expect(graph.hydratedCanvas.tracks).toHaveLength(2); // reflects ADD_TRACK
    expect(graph.hydratedCanvas.tracks[1].trackName).toBe('Secondary');

    // Every executed Direction Decision's effect is visible in the graph.
    const classifiedNode = graph.hydratedCanvas.tracks[0].nodes.find((n) => n.nodeId === secondNodeId);
    const disabledNode = graph.hydratedCanvas.tracks[0].nodes.find((n) => n.nodeId === firstNodeId);
    expect(classifiedNode?.directionRole).toBe(DirectionNodeRole.OPENING_SHOT);
    expect(classifiedNode?.isLocked).toBe(true);
    expect(disabledNode?.isActive).toBe(false);

    // Each hydrated node also carries its real Vault asset — full identity, not a stub.
    expect(classifiedNode?.runtimeAsset.assetId).toBe('asset-beta');
    expect(disabledNode?.runtimeAsset.assetId).toBe('asset-alpha');

    // Metadata is a real, computed fact — both nodes counted (RenderingEngine never decides to skip inactive nodes; that would be a decision).
    expect(graph.metadata.totalNodes).toBe(2);
  });
});
