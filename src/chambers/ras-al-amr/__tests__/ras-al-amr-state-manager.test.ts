import { RasAlAmrStateManager } from '../ras-al-amr-state-manager';
import { CanvasType } from '../assembly-contracts';
import type { SovereignCanvas } from '../assembly-contracts';
import { CanvasActionType } from '../assembly-directive-payloads';
import type { AddNodePayload } from '../assembly-directive-payloads';
import { CapabilityTarget } from '../../../core/sovereign-orchestrator/qiyamah-intent-types';
import { AssetFamily } from '../../../vault/sovereign-vault-types';

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

describe('The Narrative Canvas Foundation — RasAlAmrStateManager.ADD_NODE', () => {
  const manager = new RasAlAmrStateManager();

  it('carries the real asset family and capability onto the new node when the caller supplies them', () => {
    const mutation: AddNodePayload = {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      vaultAssetId: 'asset-audio-1',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.AUDIO,
    };

    const result = manager.applyMutation(makeEmptyCanvas(), mutation);
    const node = result.tracks[0].nodes[0];
    expect(node.assetFamily).toBe(AssetFamily.MEDIA);
    expect(node.capabilityOrigin).toBe(CapabilityTarget.AUDIO);
  });

  it('falls back to the prior hardcoded defaults when a caller omits the new fields — no breaking change', () => {
    const mutation: AddNodePayload = {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      vaultAssetId: 'asset-legacy-1',
    };

    const result = manager.applyMutation(makeEmptyCanvas(), mutation);
    const node = result.tracks[0].nodes[0];
    expect(node.assetFamily).toBe(AssetFamily.MEDIA);
    expect(node.capabilityOrigin).toBe(CapabilityTarget.VISUAL);
  });

  it('supports multiple real nodes coexisting in one track, each with its own real identity', () => {
    let canvas = makeEmptyCanvas();

    canvas = manager.applyMutation(canvas, {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      vaultAssetId: 'asset-visual-1',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.VISUAL,
    });

    canvas = manager.applyMutation(canvas, {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      vaultAssetId: 'asset-audio-1',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.AUDIO,
    });

    expect(canvas.tracks[0].nodes).toHaveLength(2);
    expect(canvas.tracks[0].nodes[0].assetId).toBe('asset-visual-1');
    expect(canvas.tracks[0].nodes[1].assetId).toBe('asset-audio-1');
    expect(canvas.tracks[0].nodes[0].capabilityOrigin).toBe(CapabilityTarget.VISUAL);
    expect(canvas.tracks[0].nodes[1].capabilityOrigin).toBe(CapabilityTarget.AUDIO);
  });

  it('removes exactly one node by id, leaving the others and their order untouched', () => {
    let canvas = makeEmptyCanvas();
    canvas = manager.applyMutation(canvas, {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      vaultAssetId: 'asset-a',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.VISUAL,
    });
    canvas = manager.applyMutation(canvas, {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      vaultAssetId: 'asset-b',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.MOTION,
    });
    const nodeToKeepId = canvas.tracks[0].nodes[1].nodeId;
    const nodeToRemoveId = canvas.tracks[0].nodes[0].nodeId;

    canvas = manager.applyMutation(canvas, {
      actionType: CanvasActionType.REMOVE_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: nodeToRemoveId,
    });

    expect(canvas.tracks[0].nodes).toHaveLength(1);
    expect(canvas.tracks[0].nodes[0].nodeId).toBe(nodeToKeepId);
    expect(canvas.tracks[0].nodes[0].assetId).toBe('asset-b');
  });
});

describe('PACKAGE XX — Direction Assembly Layer: REORDER_NODE', () => {
  const manager = new RasAlAmrStateManager();

  function addThreeNodes(): SovereignCanvas {
    let canvas = makeEmptyCanvas();
    for (const assetId of ['asset-a', 'asset-b', 'asset-c']) {
      canvas = manager.applyMutation(canvas, {
        actionType: CanvasActionType.ADD_NODE,
        canvasId: 'canvas-1',
        subscriberTenantId: 'tenant-1',
        targetTrackId: 'track-1',
        vaultAssetId: assetId,
        assetFamily: AssetFamily.MEDIA,
        capabilityOrigin: CapabilityTarget.VISUAL,
      });
    }
    return canvas;
  }

  it('moves a node up, swapping it with its immediate predecessor — non-destructive, same node objects', () => {
    const canvas = addThreeNodes();
    const middleNodeId = canvas.tracks[0].nodes[1].nodeId;

    const result = manager.applyMutation(canvas, {
      actionType: CanvasActionType.REORDER_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: middleNodeId,
      direction: 'up',
    });

    expect(result.tracks[0].nodes.map((n) => n.assetId)).toEqual(['asset-b', 'asset-a', 'asset-c']);
  });

  it('moves a node down, swapping it with its immediate successor', () => {
    const canvas = addThreeNodes();
    const firstNodeId = canvas.tracks[0].nodes[0].nodeId;

    const result = manager.applyMutation(canvas, {
      actionType: CanvasActionType.REORDER_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: firstNodeId,
      direction: 'down',
    });

    expect(result.tracks[0].nodes.map((n) => n.assetId)).toEqual(['asset-b', 'asset-a', 'asset-c']);
  });

  it('is a safe no-op moving the first node up, or the last node down — never throws, never reorders', () => {
    const canvas = addThreeNodes();
    const firstNodeId = canvas.tracks[0].nodes[0].nodeId;
    const lastNodeId = canvas.tracks[0].nodes[2].nodeId;

    const upResult = manager.applyMutation(canvas, {
      actionType: CanvasActionType.REORDER_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: firstNodeId,
      direction: 'up',
    });
    expect(upResult.tracks[0].nodes.map((n) => n.assetId)).toEqual(['asset-a', 'asset-b', 'asset-c']);

    const downResult = manager.applyMutation(canvas, {
      actionType: CanvasActionType.REORDER_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: lastNodeId,
      direction: 'down',
    });
    expect(downResult.tracks[0].nodes.map((n) => n.assetId)).toEqual(['asset-a', 'asset-b', 'asset-c']);
  });

  it('locates the node by id even when a stale targetTrackId is supplied — real robustness, not a guess', () => {
    const canvas = addThreeNodes();
    const middleNodeId = canvas.tracks[0].nodes[1].nodeId;

    const result = manager.applyMutation(canvas, {
      actionType: CanvasActionType.REORDER_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'this-track-id-does-not-exist',
      targetNodeId: middleNodeId,
      direction: 'up',
    });

    expect(result.tracks[0].nodes.map((n) => n.assetId)).toEqual(['asset-b', 'asset-a', 'asset-c']);
  });
});

describe('PACKAGE XX — Direction Assembly Layer: ADD_TRACK (real grouping)', () => {
  const manager = new RasAlAmrStateManager();

  it('creates a new, real, empty group with the Creator\'s own chosen name', () => {
    const canvas = makeEmptyCanvas();

    const result = manager.applyMutation(canvas, {
      actionType: CanvasActionType.ADD_TRACK,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      trackName: 'B-Roll',
    });

    expect(result.tracks).toHaveLength(2);
    expect(result.tracks[1].trackName).toBe('B-Roll');
    expect(result.tracks[1].nodes).toEqual([]);
  });

  it('generates a distinct trackId for each new group', () => {
    let canvas = makeEmptyCanvas();
    canvas = manager.applyMutation(canvas, {
      actionType: CanvasActionType.ADD_TRACK,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      trackName: 'Group A',
    });
    canvas = manager.applyMutation(canvas, {
      actionType: CanvasActionType.ADD_TRACK,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      trackName: 'Group B',
    });

    expect(canvas.tracks[1].trackId).not.toBe(canvas.tracks[2].trackId);
  });
});

describe('PACKAGE XX — Direction Assembly Layer: MOVE_NODE_TO_TRACK (real grouping, write side)', () => {
  const manager = new RasAlAmrStateManager();

  function canvasWithTwoGroupsAndOneNode(): SovereignCanvas {
    let canvas = manager.applyMutation(makeEmptyCanvas(), {
      actionType: CanvasActionType.ADD_TRACK,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      trackName: 'Group B',
    });
    canvas = manager.applyMutation(canvas, {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      vaultAssetId: 'asset-a',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.VISUAL,
    });
    return canvas;
  }

  it('moves a node from its source group into the destination group, non-destructively', () => {
    const canvas = canvasWithTwoGroupsAndOneNode();
    const nodeId = canvas.tracks[0].nodes[0].nodeId;
    const destinationTrackId = canvas.tracks[1].trackId;

    const result = manager.applyMutation(canvas, {
      actionType: CanvasActionType.MOVE_NODE_TO_TRACK,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      sourceTrackId: 'track-1',
      targetNodeId: nodeId,
      destinationTrackId,
    });

    expect(result.tracks[0].nodes).toHaveLength(0);
    expect(result.tracks[1].nodes).toHaveLength(1);
    expect(result.tracks[1].nodes[0].nodeId).toBe(nodeId);
    expect(result.tracks[1].nodes[0].assetId).toBe('asset-a');
  });

  it('throws when either the source or destination track genuinely does not exist — the same integrity guarantee ADD_NODE already has', () => {
    const canvas = canvasWithTwoGroupsAndOneNode();
    const nodeId = canvas.tracks[0].nodes[0].nodeId;

    expect(() =>
      manager.applyMutation(canvas, {
        actionType: CanvasActionType.MOVE_NODE_TO_TRACK,
        canvasId: 'canvas-1',
        subscriberTenantId: 'tenant-1',
        sourceTrackId: 'track-1',
        targetNodeId: nodeId,
        destinationTrackId: 'no-such-track',
      }),
    ).toThrow();
  });

  it('is a safe no-op moving a node to the group it is already in', () => {
    const canvas = canvasWithTwoGroupsAndOneNode();
    const nodeId = canvas.tracks[0].nodes[0].nodeId;

    const result = manager.applyMutation(canvas, {
      actionType: CanvasActionType.MOVE_NODE_TO_TRACK,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      sourceTrackId: 'track-1',
      targetNodeId: nodeId,
      destinationTrackId: 'track-1',
    });

    expect(result.tracks[0].nodes).toHaveLength(1);
    expect(result.tracks[0].nodes[0].nodeId).toBe(nodeId);
  });
});

describe('PACKAGE XX — Direction Assembly Layer: node lookup remains correct after a cross-group move', () => {
  const manager = new RasAlAmrStateManager();

  it('UPDATE_TEMPORAL still finds and updates a node after it moved to a different group, even with a stale targetTrackId', () => {
    let canvas = manager.applyMutation(makeEmptyCanvas(), {
      actionType: CanvasActionType.ADD_TRACK,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      trackName: 'Group B',
    });
    canvas = manager.applyMutation(canvas, {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      vaultAssetId: 'asset-a',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.VISUAL,
    });
    const nodeId = canvas.tracks[0].nodes[0].nodeId;
    const destinationTrackId = canvas.tracks[1].trackId;

    canvas = manager.applyMutation(canvas, {
      actionType: CanvasActionType.MOVE_NODE_TO_TRACK,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      sourceTrackId: 'track-1',
      targetNodeId: nodeId,
      destinationTrackId,
    });

    // The node now lives in the second group, but this caller still
    // supplies the OLD (now stale) 'track-1' as targetTrackId — the fix
    // this package makes necessary.
    const result = manager.applyMutation(canvas, {
      actionType: CanvasActionType.UPDATE_TEMPORAL,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      temporalUpdates: { globalStartTimeSeconds: 5, playDurationSeconds: 10 },
    });

    expect(result.tracks[1].nodes[0].temporal?.globalStartTimeSeconds).toBe(5);
    expect(result.tracks[1].nodes[0].temporal?.playDurationSeconds).toBe(10);
  });
});
