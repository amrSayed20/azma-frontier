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
