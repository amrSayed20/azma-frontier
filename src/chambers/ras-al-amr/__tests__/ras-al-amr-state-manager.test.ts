import { RasAlAmrStateManager } from '../ras-al-amr-state-manager';
import { CanvasType, DirectionNodeRole } from '../assembly-contracts';
import type { SovereignCanvas } from '../assembly-contracts';
import { CanvasActionType } from '../assembly-directive-payloads';
import type { AddNodePayload, UpdateNodeAdvancedPayload, VoiceAssignmentDirective } from '../assembly-directive-payloads';
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

describe('PACKAGE XXI — Direction Node Layer: UPDATE_NODE_CLASSIFICATION', () => {
  const manager = new RasAlAmrStateManager();

  function canvasWithOneNode(): SovereignCanvas {
    return manager.applyMutation(makeEmptyCanvas(), {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      vaultAssetId: 'asset-a',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.VISUAL,
    });
  }

  it('assigns a real cinematic classification to a node that had none', () => {
    const canvas = canvasWithOneNode();
    const nodeId = canvas.tracks[0].nodes[0].nodeId;
    expect(canvas.tracks[0].nodes[0].directionRole).toBeUndefined();

    const result = manager.applyMutation(canvas, {
      actionType: CanvasActionType.UPDATE_NODE_CLASSIFICATION,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      directionRole: DirectionNodeRole.OPENING_SHOT,
    });

    expect(result.tracks[0].nodes[0].directionRole).toBe(DirectionNodeRole.OPENING_SHOT);
  });

  it('changes an already-classified node to a different real role', () => {
    let canvas = canvasWithOneNode();
    const nodeId = canvas.tracks[0].nodes[0].nodeId;
    canvas = manager.applyMutation(canvas, {
      actionType: CanvasActionType.UPDATE_NODE_CLASSIFICATION,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      directionRole: DirectionNodeRole.MUSIC_LAYER,
    });

    const result = manager.applyMutation(canvas, {
      actionType: CanvasActionType.UPDATE_NODE_CLASSIFICATION,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      directionRole: DirectionNodeRole.CLOSING_SHOT,
    });

    expect(result.tracks[0].nodes[0].directionRole).toBe(DirectionNodeRole.CLOSING_SHOT);
  });

  it('honestly returns a node to unclassified when the Creator supplies no role — never keeps a stale value', () => {
    let canvas = canvasWithOneNode();
    const nodeId = canvas.tracks[0].nodes[0].nodeId;
    canvas = manager.applyMutation(canvas, {
      actionType: CanvasActionType.UPDATE_NODE_CLASSIFICATION,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      directionRole: DirectionNodeRole.NARRATION,
    });

    const result = manager.applyMutation(canvas, {
      actionType: CanvasActionType.UPDATE_NODE_CLASSIFICATION,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      directionRole: undefined,
    });

    expect(result.tracks[0].nodes[0].directionRole).toBeUndefined();
  });

  it('never touches any other real field on the node — non-destructive', () => {
    const canvas = canvasWithOneNode();
    const nodeId = canvas.tracks[0].nodes[0].nodeId;

    const result = manager.applyMutation(canvas, {
      actionType: CanvasActionType.UPDATE_NODE_CLASSIFICATION,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      directionRole: DirectionNodeRole.TRANSITION,
    });

    expect(result.tracks[0].nodes[0].assetId).toBe('asset-a');
    expect(result.tracks[0].nodes[0].assetFamily).toBe(AssetFamily.MEDIA);
    expect(result.tracks[0].nodes[0].capabilityOrigin).toBe(CapabilityTarget.VISUAL);
  });

  it('locates the node by id even when a stale targetTrackId is supplied, after a real cross-group move', () => {
    let canvas = manager.applyMutation(canvasWithOneNode(), {
      actionType: CanvasActionType.ADD_TRACK,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      trackName: 'Group B',
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

    const result = manager.applyMutation(canvas, {
      actionType: CanvasActionType.UPDATE_NODE_CLASSIFICATION,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      directionRole: DirectionNodeRole.AMBIENT_LAYER,
    });

    expect(result.tracks[1].nodes[0].directionRole).toBe(DirectionNodeRole.AMBIENT_LAYER);
  });
});

describe('PACKAGE XXII — Manual Direction Engine: SET_NODE_ACTIVE / SET_NODE_EMPHASIS / SET_NODE_LOCK', () => {
  const manager = new RasAlAmrStateManager();

  function canvasWithOneNode(): SovereignCanvas {
    return manager.applyMutation(makeEmptyCanvas(), {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      vaultAssetId: 'asset-a',
      assetFamily: AssetFamily.MEDIA,
      capabilityOrigin: CapabilityTarget.VISUAL,
    });
  }

  it('Activate/Disable Node: real, stored, and toggle-able', () => {
    const canvas = canvasWithOneNode();
    const nodeId = canvas.tracks[0].nodes[0].nodeId;
    expect(canvas.tracks[0].nodes[0].isActive).toBeUndefined();

    const disabled = manager.applyMutation(canvas, {
      actionType: CanvasActionType.SET_NODE_ACTIVE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      active: false,
    });
    expect(disabled.tracks[0].nodes[0].isActive).toBe(false);

    const reactivated = manager.applyMutation(disabled, {
      actionType: CanvasActionType.SET_NODE_ACTIVE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      active: true,
    });
    expect(reactivated.tracks[0].nodes[0].isActive).toBe(true);
  });

  it('Mark as Primary / Mark as Supporting, and honestly clearing the mark', () => {
    const canvas = canvasWithOneNode();
    const nodeId = canvas.tracks[0].nodes[0].nodeId;
    expect(canvas.tracks[0].nodes[0].directionEmphasis).toBeUndefined();

    const primary = manager.applyMutation(canvas, {
      actionType: CanvasActionType.SET_NODE_EMPHASIS,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      emphasis: 'primary',
    });
    expect(primary.tracks[0].nodes[0].directionEmphasis).toBe('primary');

    const supporting = manager.applyMutation(primary, {
      actionType: CanvasActionType.SET_NODE_EMPHASIS,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      emphasis: 'supporting',
    });
    expect(supporting.tracks[0].nodes[0].directionEmphasis).toBe('supporting');

    const cleared = manager.applyMutation(supporting, {
      actionType: CanvasActionType.SET_NODE_EMPHASIS,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      emphasis: null,
    });
    expect(cleared.tracks[0].nodes[0].directionEmphasis).toBeUndefined();
  });

  it('Lock Direction / Unlock Direction: real, stored, and toggle-able', () => {
    const canvas = canvasWithOneNode();
    const nodeId = canvas.tracks[0].nodes[0].nodeId;

    const locked = manager.applyMutation(canvas, {
      actionType: CanvasActionType.SET_NODE_LOCK,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      locked: true,
    });
    expect(locked.tracks[0].nodes[0].isLocked).toBe(true);

    const unlocked = manager.applyMutation(locked, {
      actionType: CanvasActionType.SET_NODE_LOCK,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      locked: false,
    });
    expect(unlocked.tracks[0].nodes[0].isLocked).toBe(false);
  });

  it('a locked node can always be unlocked — SET_NODE_LOCK is never blocked by the lock it creates', () => {
    let canvas = canvasWithOneNode();
    const nodeId = canvas.tracks[0].nodes[0].nodeId;
    canvas = manager.applyMutation(canvas, {
      actionType: CanvasActionType.SET_NODE_LOCK,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      locked: true,
    });

    const result = manager.applyMutation(canvas, {
      actionType: CanvasActionType.SET_NODE_LOCK,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      locked: false,
    });

    expect(result.tracks[0].nodes[0].isLocked).toBe(false);
  });
});

describe('PACKAGE XXII — Manual Direction Engine: Lock Direction genuinely protects a node', () => {
  const manager = new RasAlAmrStateManager();

  function lockedCanvasWithTwoNodes(): { canvas: SovereignCanvas; lockedNodeId: string } {
    let canvas = manager.applyMutation(makeEmptyCanvas(), {
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
      capabilityOrigin: CapabilityTarget.VISUAL,
    });
    const lockedNodeId = canvas.tracks[0].nodes[0].nodeId;
    canvas = manager.applyMutation(canvas, {
      actionType: CanvasActionType.SET_NODE_LOCK,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: lockedNodeId,
      locked: true,
    });
    return { canvas, lockedNodeId };
  }

  it('blocks UPDATE_TEMPORAL on a locked node', () => {
    const { canvas, lockedNodeId } = lockedCanvasWithTwoNodes();
    const result = manager.applyMutation(canvas, {
      actionType: CanvasActionType.UPDATE_TEMPORAL,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: lockedNodeId,
      temporalUpdates: { globalStartTimeSeconds: 99, playDurationSeconds: 5 },
    });
    expect(result.tracks[0].nodes[0].temporal).toBeUndefined();
  });

  it('blocks REORDER_NODE (Promote/Demote) on a locked node', () => {
    const { canvas, lockedNodeId } = lockedCanvasWithTwoNodes();
    const result = manager.applyMutation(canvas, {
      actionType: CanvasActionType.REORDER_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: lockedNodeId,
      direction: 'down',
    });
    expect(result.tracks[0].nodes.map((n) => n.assetId)).toEqual(['asset-a', 'asset-b']);
  });

  it('blocks UPDATE_NODE_CLASSIFICATION on a locked node', () => {
    const { canvas, lockedNodeId } = lockedCanvasWithTwoNodes();
    const result = manager.applyMutation(canvas, {
      actionType: CanvasActionType.UPDATE_NODE_CLASSIFICATION,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: lockedNodeId,
      directionRole: DirectionNodeRole.OPENING_SHOT,
    });
    expect(result.tracks[0].nodes[0].directionRole).toBeUndefined();
  });

  it('blocks SET_NODE_ACTIVE and SET_NODE_EMPHASIS on a locked node', () => {
    const { canvas, lockedNodeId } = lockedCanvasWithTwoNodes();

    const activeResult = manager.applyMutation(canvas, {
      actionType: CanvasActionType.SET_NODE_ACTIVE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: lockedNodeId,
      active: false,
    });
    expect(activeResult.tracks[0].nodes[0].isActive).toBeUndefined();

    const emphasisResult = manager.applyMutation(canvas, {
      actionType: CanvasActionType.SET_NODE_EMPHASIS,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: lockedNodeId,
      emphasis: 'primary',
    });
    expect(emphasisResult.tracks[0].nodes[0].directionEmphasis).toBeUndefined();
  });

  it('blocks MOVE_NODE_TO_TRACK on a locked node', () => {
    const initial = lockedCanvasWithTwoNodes();
    const lockedNodeId = initial.lockedNodeId;
    const canvas = manager.applyMutation(initial.canvas, {
      actionType: CanvasActionType.ADD_TRACK,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      trackName: 'Group B',
    });
    const destinationTrackId = canvas.tracks[1].trackId;

    const result = manager.applyMutation(canvas, {
      actionType: CanvasActionType.MOVE_NODE_TO_TRACK,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      sourceTrackId: 'track-1',
      targetNodeId: lockedNodeId,
      destinationTrackId,
    });
    expect(result.tracks[0].nodes.some((n) => n.nodeId === lockedNodeId)).toBe(true);
    expect(result.tracks[1].nodes.length).toBe(0);
  });

  it('does NOT block REMOVE_NODE on a locked node — locking protects direction, not the right to delete', () => {
    const { canvas, lockedNodeId } = lockedCanvasWithTwoNodes();
    const result = manager.applyMutation(canvas, {
      actionType: CanvasActionType.REMOVE_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: lockedNodeId,
    });
    expect(result.tracks[0].nodes.some((n) => n.nodeId === lockedNodeId)).toBe(false);
  });

  it('does not affect an unlocked node in the same canvas', () => {
    const { canvas } = lockedCanvasWithTwoNodes();
    const unlockedNodeId = canvas.tracks[0].nodes[1].nodeId;

    const result = manager.applyMutation(canvas, {
      actionType: CanvasActionType.SET_NODE_ACTIVE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: unlockedNodeId,
      active: false,
    });
    expect(result.tracks[0].nodes[1].isActive).toBe(false);
  });
});

describe('MINISTRY I — Voice Ecosystem: UPDATE_ADVANCED_DIRECTIVE with directiveKey "voice"', () => {
  const manager = new RasAlAmrStateManager();

  it('assigns a real VoiceAssignmentDirective to a node via the already-generic UPDATE_ADVANCED_DIRECTIVE handler — zero new mutation logic required', () => {
    let canvas = makeEmptyCanvas();
    canvas = manager.applyMutation(canvas, {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      vaultAssetId: 'asset-node-1',
    } as AddNodePayload);
    const nodeId = canvas.tracks[0].nodes[0].nodeId;

    const voiceDirective: VoiceAssignmentDirective = { vaultAssetId: 'voice-asset-1' };
    const mutation: UpdateNodeAdvancedPayload = {
      actionType: CanvasActionType.UPDATE_ADVANCED_DIRECTIVE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      directiveKey: 'voice',
      directivePayload: voiceDirective,
    };

    const result = manager.applyMutation(canvas, mutation);

    expect(result.tracks[0].nodes[0].customDirectives?.voice).toEqual(voiceDirective);
    // Every other real customDirective survives untouched alongside it.
    expect(result.tracks[0].nodes[0].nodeId).toBe(nodeId);
  });

  it('respects Lock Direction — a locked node cannot receive a new voice assignment', () => {
    let canvas = makeEmptyCanvas();
    canvas = manager.applyMutation(canvas, {
      actionType: CanvasActionType.ADD_NODE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      vaultAssetId: 'asset-node-2',
    } as AddNodePayload);
    const nodeId = canvas.tracks[0].nodes[0].nodeId;

    canvas = manager.applyMutation(canvas, {
      actionType: CanvasActionType.SET_NODE_LOCK,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      locked: true,
    });

    const result = manager.applyMutation(canvas, {
      actionType: CanvasActionType.UPDATE_ADVANCED_DIRECTIVE,
      canvasId: 'canvas-1',
      subscriberTenantId: 'tenant-1',
      targetTrackId: 'track-1',
      targetNodeId: nodeId,
      directiveKey: 'voice',
      directivePayload: { vaultAssetId: 'voice-asset-2' } as VoiceAssignmentDirective,
    });

    expect(result.tracks[0].nodes[0].customDirectives?.voice).toBeUndefined();
  });
});
