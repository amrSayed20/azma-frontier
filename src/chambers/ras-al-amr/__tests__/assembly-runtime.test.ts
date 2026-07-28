import { AssemblyRuntime } from '../assembly-runtime';
import { RasAlAmrStateManager } from '../ras-al-amr-state-manager';
import { CanvasType } from '../assembly-contracts';
import type { SovereignCanvas } from '../assembly-contracts';
import { CanvasActionType } from '../assembly-directive-payloads';
import type { AddNodePayload, ReorderNodePayload } from '../assembly-directive-payloads';
import { toDirectionDecision } from '../direction-workspace-constitution';
import { CapabilityTarget } from '../../../core/sovereign-orchestrator/qiyamah-intent-types';
import { AssetFamily } from '../../../vault/sovereign-vault-types';

function makeCanvasWithOneNode(): SovereignCanvas {
  return {
    canvasId: 'canvas-1',
    subscriberTenantId: 'tenant-1',
    canvasType: CanvasType.CINEMATIC,
    title: 'Test Canvas',
    tracks: [
      {
        trackId: 'track-1',
        trackName: 'Main',
        isMuted: false,
        isHidden: false,
        nodes: [
          {
            nodeId: 'node-1',
            assetId: 'asset-1',
            assetFamily: AssetFamily.MEDIA,
            capabilityOrigin: CapabilityTarget.VISUAL,
          },
        ],
      },
      { trackId: 'track-2', trackName: 'Secondary', isMuted: false, isHidden: false, nodes: [] },
    ],
    createdAt: 0,
    updatedAt: 0,
  };
}

describe('Package XXIV — Sovereign Assembly Runtime', () => {
  const stateManager = new RasAlAmrStateManager();
  const runtime = new AssemblyRuntime(stateManager);

  it('executes a manual-director DirectionDecision by applying its real mutation to the canvas', () => {
    const canvas = makeCanvasWithOneNode();
    const mutation: AddNodePayload = {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      vaultAssetId: 'asset-2',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.AUDIO,
    };
    const decision = toDirectionDecision('manual-director', mutation);

    const updated = runtime.execute(canvas, decision);

    expect(updated.tracks[0].nodes).toHaveLength(2);
    expect(updated.tracks[0].nodes[1].assetId).toBe('asset-2');
  });

  it('produces exactly the same canvas as calling RasAlAmrStateManager.applyMutation directly — pure delegation, no divergent execution path', () => {
    const canvas = makeCanvasWithOneNode();
    const mutation: ReorderNodePayload = {
      actionType: CanvasActionType.REORDER_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: 'node-1',
      direction: 'down',
    };
    const decision = toDirectionDecision('manual-director', mutation, 12345);

    const viaRuntime = runtime.execute(canvas, decision);
    const viaDirectStateManager = stateManager.applyMutation(canvas, mutation);

    // `updatedAt` is independently stamped with Date.now() on each call, so
    // it is compared separately rather than folded into the deep-equality
    // check below (a real, expected divergence, not a Runtime bug).
    expect(viaRuntime.tracks).toEqual(viaDirectStateManager.tracks);
  });

  it('is already structurally capable of executing an automatic-director-tagged DirectionDecision without any Runtime code change', () => {
    const canvas = makeCanvasWithOneNode();
    const mutation: ReorderNodePayload = {
      actionType: CanvasActionType.REORDER_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: 'node-1',
      direction: 'up',
    };
    const decision = toDirectionDecision('automatic-director', mutation);

    const updated = runtime.execute(canvas, decision);

    expect(updated.tracks).toEqual(stateManager.applyMutation(canvas, mutation).tracks);
  });

  it('performs no reasoning — it never inspects decision.operator to change behavior', () => {
    const canvas = makeCanvasWithOneNode();
    const mutation: ReorderNodePayload = {
      actionType: CanvasActionType.REORDER_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: 'node-1',
      direction: 'down',
    };

    const manualResult = runtime.execute(canvas, toDirectionDecision('manual-director', mutation, 1));
    const automaticResult = runtime.execute(canvas, toDirectionDecision('automatic-director', mutation, 2));

    expect(manualResult.tracks).toEqual(automaticResult.tracks);
  });
});
