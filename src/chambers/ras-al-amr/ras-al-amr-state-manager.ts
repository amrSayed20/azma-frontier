/**
 * AZMA OS - Phase 5: Ras Al-Amr Assembly Architecture
 * File: src/chambers/ras-al-amr/ras-al-amr-state-manager.ts
 * * The Ras Al-Amr State Manager.
 * The executable engine that processes non-destructive mutation payloads
 * and applies them to the Sovereign Canvas using immutable state transitions.
 * * Update Notice: Full integration of Spatial and Advanced Semantic Directives.
 *
 * PACKAGE XX — DIRECTION ASSEMBLY LAYER (2026-07-28): three new mutations
 * — REORDER_NODE, ADD_TRACK, MOVE_NODE_TO_TRACK — give the Direction
 * Workspace real non-destructive reordering and real grouping (multiple
 * AssemblyTracks, finally used as the "logical grouping" the type's own
 * doc comment always described). Enabling grouping meant a node's own
 * track could change at runtime, so REMOVE_NODE/UPDATE_TEMPORAL/
 * UPDATE_SPATIAL/UPDATE_ADVANCED_DIRECTIVE were also fixed to locate a
 * node by its own globally-unique id across every track (`locateNode`)
 * instead of trusting a caller-supplied `targetTrackId` that could go
 * stale the moment a node moves group — a correctness fix required by
 * this package, not scope creep. No new orchestration, no duplicate
 * canvas state, no execution/rendering logic.
 *
 * PACKAGE XXI — DIRECTION NODE LAYER (2026-07-28): one new mutation,
 * UPDATE_NODE_CLASSIFICATION, lets the Creator assign or change a
 * Direction Node's real cinematic role (assembly-contracts.ts's new
 * `DirectionNodeRole`) — reusing `locateNode()` for lookup, same as
 * every per-node handler since Package XX. No new node type, no new
 * runtime: `AssemblyNode` already was the Direction Node.
 *
 * PACKAGE XXII — MANUAL DIRECTION ENGINE (2026-07-28): three new
 * mutations — SET_NODE_ACTIVE, SET_NODE_EMPHASIS, SET_NODE_LOCK — give
 * the Creator real Activate/Disable, Mark as Primary/Supporting, and
 * Lock/Unlock Direction Decisions. "Promote Node"/"Demote Node" needed no
 * new mutation at all: searching existing architecture first found they
 * are exactly `REORDER_NODE` (Package XX) under new vocabulary. Locking a
 * node now genuinely protects its own direction decisions: every
 * per-node handler below except SET_NODE_LOCK itself and REMOVE_NODE now
 * checks `isNodeLocked()` first and no-ops if the node is locked —
 * otherwise "Lock Direction" would be an inert flag, not a real Direction
 * Decision. REMOVE_NODE is deliberately NOT lock-guarded: locking
 * protects a node's direction, not the Creator's separate right to
 * delete it outright.
 */

import { SovereignCanvas, AssemblyNode, AssemblyTrack } from './assembly-contracts';
import {
  CanvasMutationPayload,
  CanvasActionType,
  AddNodePayload,
  RemoveNodePayload,
  UpdateNodeTemporalPayload,
  UpdateNodeSpatialPayload,
  UpdateNodeAdvancedPayload,
  ReorderNodePayload,
  AddTrackPayload,
  MoveNodeToTrackPayload,
  UpdateNodeClassificationPayload,
  SetNodeActivePayload,
  SetNodeEmphasisPayload,
  SetNodeLockPayload,
  SetTrackVolumePayload
} from './assembly-directive-payloads';
import { CapabilityTarget } from '../../core/sovereign-orchestrator/qiyamah-intent-types';
import { AssetFamily } from '../../vault/sovereign-vault-types';

export class RasAlAmrStateManager {
  
  /**
   * The core execution boundary for all canvas modifications.
   * Consumes a mutation payload and returns a newly instantiated Canvas state.
   */
  public applyMutation(currentCanvas: SovereignCanvas, mutation: CanvasMutationPayload): SovereignCanvas {
    
    // 1. Constitutional Security Execution
    if (currentCanvas.subscriberTenantId !== mutation.subscriberTenantId) {
      throw new Error(`Security Breach: Tenant [${mutation.subscriberTenantId}] attempted to mutate Canvas [${currentCanvas.canvasId}] owned by another sovereign entity.`);
    }

    if (currentCanvas.canvasId !== mutation.canvasId) {
      throw new Error(`State Error: Payload targeted Canvas [${mutation.canvasId}] but was applied to Canvas [${currentCanvas.canvasId}].`);
    }

    // 2. Clone for Immutable State Update
    const updatedCanvas: SovereignCanvas = {
      ...currentCanvas,
      tracks: [...currentCanvas.tracks],
      updatedAt: Date.now()
    };

    // 3. Route Mutation Payload
    switch (mutation.actionType) {
      case CanvasActionType.ADD_NODE:
        return this.handleAddNode(updatedCanvas, mutation);
      case CanvasActionType.REMOVE_NODE:
        return this.handleRemoveNode(updatedCanvas, mutation);
      case CanvasActionType.UPDATE_TEMPORAL:
        return this.handleUpdateTemporal(updatedCanvas, mutation);
      case CanvasActionType.UPDATE_SPATIAL:
        return this.handleUpdateSpatial(updatedCanvas, mutation);
      case CanvasActionType.UPDATE_ADVANCED_DIRECTIVE:
        return this.handleUpdateAdvanced(updatedCanvas, mutation);
      case CanvasActionType.REORDER_NODE:
        return this.handleReorderNode(updatedCanvas, mutation);
      case CanvasActionType.ADD_TRACK:
        return this.handleAddTrack(updatedCanvas, mutation);
      case CanvasActionType.MOVE_NODE_TO_TRACK:
        return this.handleMoveNodeToTrack(updatedCanvas, mutation);
      case CanvasActionType.UPDATE_NODE_CLASSIFICATION:
        return this.handleUpdateNodeClassification(updatedCanvas, mutation);
      case CanvasActionType.SET_NODE_ACTIVE:
        return this.handleSetNodeActive(updatedCanvas, mutation);
      case CanvasActionType.SET_NODE_EMPHASIS:
        return this.handleSetNodeEmphasis(updatedCanvas, mutation);
      case CanvasActionType.SET_NODE_LOCK:
        return this.handleSetNodeLock(updatedCanvas, mutation);
      case CanvasActionType.SET_TRACK_VOLUME:
        return this.handleSetTrackVolume(updatedCanvas, mutation);
      default:
        return updatedCanvas;
    }
  }

  /**
   * PACKAGE XX — DIRECTION ASSEMBLY LAYER: locates a node by its own
   * globally-unique id across every track, rather than trusting a
   * caller-supplied `targetTrackId` — which can go stale the instant a
   * node moves to a different group (MOVE_NODE_TO_TRACK). The single,
   * centralized fix that makes every existing handler correct once
   * grouping is real, instead of requiring every caller to track which
   * group a node currently lives in.
   */
  private locateNode(canvas: SovereignCanvas, nodeId: string): { trackIndex: number; nodeIndex: number } | null {
    for (let trackIndex = 0; trackIndex < canvas.tracks.length; trackIndex++) {
      const nodeIndex = canvas.tracks[trackIndex].nodes.findIndex((n) => n.nodeId === nodeId);
      if (nodeIndex !== -1) {
        return { trackIndex, nodeIndex };
      }
    }
    return null;
  }

  /**
   * PACKAGE XXII — MANUAL DIRECTION ENGINE: real enforcement for Lock
   * Direction — a node the Creator has locked cannot have its own
   * direction decisions mutated by any handler that calls this guard
   * (every per-node handler except SET_NODE_LOCK itself and
   * REMOVE_NODE). A node that no longer exists is honestly reported as
   * not locked — there is nothing left to protect.
   */
  private isNodeLocked(canvas: SovereignCanvas, nodeId: string): boolean {
    const location = this.locateNode(canvas, nodeId);
    if (!location) return false;
    return canvas.tracks[location.trackIndex].nodes[location.nodeIndex].isLocked === true;
  }

  // ==========================================
  // INTERNAL STATE HANDLERS
  // ==========================================

  private handleAddNode(canvas: SovereignCanvas, payload: AddNodePayload): SovereignCanvas {
    const trackIndex = canvas.tracks.findIndex(t => t.trackId === payload.targetTrackId);
    if (trackIndex === -1) {
      throw new Error(`State Error: Target Track [${payload.targetTrackId}] not found in Canvas.`);
    }

    const newNode: AssemblyNode = {
      nodeId: `node_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      assetId: payload.vaultAssetId,
      // NARRATIVE CANVAS FOUNDATION: real family/capability when the
      // caller provides them (every real caller now does); falls back to
      // the prior hardcoded defaults only for an older, untyped caller
      // that never supplied them, so nothing that already compiled breaks.
      assetFamily: payload.assetFamily ?? AssetFamily.MEDIA,
      capabilityOrigin: payload.capabilityOrigin ?? CapabilityTarget.VISUAL,
      temporal: payload.initialTemporal,
      spatial: payload.initialSpatial,
      customDirectives: {} // تمهيد الكائن لحمايته من أخطاء القراءة المستقبلية
    };

    const updatedTrack: AssemblyTrack = {
      ...canvas.tracks[trackIndex],
      nodes: [...canvas.tracks[trackIndex].nodes, newNode]
    };

    canvas.tracks[trackIndex] = updatedTrack;
    return canvas;
  }

  private handleRemoveNode(canvas: SovereignCanvas, payload: RemoveNodePayload): SovereignCanvas {
    const location = this.locateNode(canvas, payload.targetNodeId);
    if (!location) return canvas;

    const track = canvas.tracks[location.trackIndex];
    const updatedTrack: AssemblyTrack = {
      ...track,
      nodes: track.nodes.filter(n => n.nodeId !== payload.targetNodeId)
    };

    canvas.tracks[location.trackIndex] = updatedTrack;
    return canvas;
  }

  private handleUpdateTemporal(canvas: SovereignCanvas, payload: UpdateNodeTemporalPayload): SovereignCanvas {
    const location = this.locateNode(canvas, payload.targetNodeId);
    if (!location) return canvas;
    if (this.isNodeLocked(canvas, payload.targetNodeId)) return canvas;

    const { trackIndex, nodeIndex } = location;
    const track = canvas.tracks[trackIndex];

    const updatedNode: AssemblyNode = {
      ...track.nodes[nodeIndex],
      temporal: {
        ...track.nodes[nodeIndex].temporal,
        ...payload.temporalUpdates
      } as any 
    };

    const updatedTrack: AssemblyTrack = {
      ...track,
      nodes: [
        ...track.nodes.slice(0, nodeIndex),
        updatedNode,
        ...track.nodes.slice(nodeIndex + 1)
      ]
    };

    canvas.tracks[trackIndex] = updatedTrack;
    return canvas;
  }

  /**
   * Handles non-destructive updates to spatial positioning layers (Scale, Position, Rotation).
   */
  private handleUpdateSpatial(canvas: SovereignCanvas, payload: UpdateNodeSpatialPayload): SovereignCanvas {
    const location = this.locateNode(canvas, payload.targetNodeId);
    if (!location) return canvas;
    if (this.isNodeLocked(canvas, payload.targetNodeId)) return canvas;

    const { trackIndex, nodeIndex } = location;
    const track = canvas.tracks[trackIndex];

    const updatedNode: AssemblyNode = {
      ...track.nodes[nodeIndex],
      spatial: {
        ...track.nodes[nodeIndex].spatial,
        ...payload.spatialUpdates
      } as any // دمج آمن ومحمي للمصفوفة المكانية
    };

    const updatedTrack: AssemblyTrack = {
      ...track,
      nodes: [
        ...track.nodes.slice(0, nodeIndex),
        updatedNode,
        ...track.nodes.slice(nodeIndex + 1)
      ]
    };

    canvas.tracks[trackIndex] = updatedTrack;
    return canvas;
  }

  /**
   * Handles advanced multimodal injection (Audio, Visual, Structural, and Semantic links).
   * Persists data immutably inside customDirectives to remain clean and extensible.
   */
  private handleUpdateAdvanced(canvas: SovereignCanvas, payload: UpdateNodeAdvancedPayload): SovereignCanvas {
    const location = this.locateNode(canvas, payload.targetNodeId);
    if (!location) return canvas;
    if (this.isNodeLocked(canvas, payload.targetNodeId)) return canvas;

    const { trackIndex, nodeIndex } = location;
    const track = canvas.tracks[trackIndex];

    // حقن التوجيه المتقدم داخل حقل customDirectives لحماية العقود الأصلية من التمزيق
    const updatedNode: AssemblyNode = {
      ...track.nodes[nodeIndex],
      customDirectives: {
        ...track.nodes[nodeIndex].customDirectives,
        [payload.directiveKey]: payload.directivePayload
      }
    };

    const updatedTrack: AssemblyTrack = {
      ...track,
      nodes: [
        ...track.nodes.slice(0, nodeIndex),
        updatedNode,
        ...track.nodes.slice(nodeIndex + 1)
      ]
    };

    canvas.tracks[trackIndex] = updatedTrack;
    return canvas;
  }

  /**
   * PACKAGE XX — DIRECTION ASSEMBLY LAYER: non-destructive reordering.
   * Swaps a node with its immediate neighbor in the same track's array —
   * the same node objects, no data loss, no removal/recreation. A no-op
   * (not an error) at either boundary: moving the first node up, or the
   * last node down, leaves the canvas unchanged.
   */
  private handleReorderNode(canvas: SovereignCanvas, payload: ReorderNodePayload): SovereignCanvas {
    const location = this.locateNode(canvas, payload.targetNodeId);
    if (!location) return canvas;
    if (this.isNodeLocked(canvas, payload.targetNodeId)) return canvas;

    const { trackIndex, nodeIndex } = location;
    const track = canvas.tracks[trackIndex];
    const swapWithIndex = payload.direction === 'up' ? nodeIndex - 1 : nodeIndex + 1;

    if (swapWithIndex < 0 || swapWithIndex >= track.nodes.length) {
      return canvas;
    }

    const reorderedNodes = [...track.nodes];
    [reorderedNodes[nodeIndex], reorderedNodes[swapWithIndex]] = [reorderedNodes[swapWithIndex], reorderedNodes[nodeIndex]];

    canvas.tracks[trackIndex] = { ...track, nodes: reorderedNodes };
    return canvas;
  }

  /**
   * PACKAGE XX — DIRECTION ASSEMBLY LAYER: creates a new, empty group.
   * AssemblyTrack was already, by its own doc comment, "a logical
   * grouping of Assembly Nodes" — this is the first real caller that
   * creates more than the one track every canvas started with.
   */
  private handleAddTrack(canvas: SovereignCanvas, payload: AddTrackPayload): SovereignCanvas {
    const newTrack: AssemblyTrack = {
      trackId: `track_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      trackName: payload.trackName,
      isMuted: false,
      isHidden: false,
      nodes: []
    };

    canvas.tracks = [...canvas.tracks, newTrack];
    return canvas;
  }

  /**
   * PACKAGE XX — DIRECTION ASSEMBLY LAYER: moves an existing node from
   * one group to another — the write-side of "asset grouping can be
   * changed." Non-destructive: the node's own identity, temporal/
   * spatial/customDirectives all survive unchanged; only which track's
   * array contains it changes. Throws if either the source or
   * destination track genuinely does not exist — the same failure mode
   * ADD_NODE already uses for an unknown target track, since a move
   * across two named containers deserves the same integrity guarantee
   * as creating a node in one.
   */
  private handleMoveNodeToTrack(canvas: SovereignCanvas, payload: MoveNodeToTrackPayload): SovereignCanvas {
    const sourceIndex = canvas.tracks.findIndex(t => t.trackId === payload.sourceTrackId);
    const destinationIndex = canvas.tracks.findIndex(t => t.trackId === payload.destinationTrackId);

    if (sourceIndex === -1 || destinationIndex === -1) {
      throw new Error(`State Error: Source [${payload.sourceTrackId}] or destination [${payload.destinationTrackId}] track not found for node move.`);
    }

    if (sourceIndex === destinationIndex) return canvas;
    if (this.isNodeLocked(canvas, payload.targetNodeId)) return canvas;

    const sourceTrack = canvas.tracks[sourceIndex];
    const node = sourceTrack.nodes.find(n => n.nodeId === payload.targetNodeId);
    if (!node) return canvas;

    canvas.tracks[sourceIndex] = {
      ...sourceTrack,
      nodes: sourceTrack.nodes.filter(n => n.nodeId !== payload.targetNodeId)
    };

    const destinationTrack = canvas.tracks[destinationIndex];
    canvas.tracks[destinationIndex] = {
      ...destinationTrack,
      nodes: [...destinationTrack.nodes, node]
    };

    return canvas;
  }

  /**
   * PACKAGE XXI — DIRECTION NODE LAYER: assigns or changes a Direction
   * Node's real cinematic classification. Non-destructive — every other
   * real field on the node (temporal, spatial, customDirectives,
   * assetFamily, capabilityOrigin) survives unchanged; only
   * `directionRole` is overwritten with whatever the Creator's own
   * request specifies, including `undefined` to honestly return a node
   * to "not yet classified" rather than requiring a fabricated default.
   */
  private handleUpdateNodeClassification(canvas: SovereignCanvas, payload: UpdateNodeClassificationPayload): SovereignCanvas {
    const location = this.locateNode(canvas, payload.targetNodeId);
    if (!location) return canvas;
    if (this.isNodeLocked(canvas, payload.targetNodeId)) return canvas;

    const { trackIndex, nodeIndex } = location;
    const track = canvas.tracks[trackIndex];

    const updatedNode: AssemblyNode = {
      ...track.nodes[nodeIndex],
      directionRole: payload.directionRole
    };

    canvas.tracks[trackIndex] = {
      ...track,
      nodes: [
        ...track.nodes.slice(0, nodeIndex),
        updatedNode,
        ...track.nodes.slice(nodeIndex + 1)
      ]
    };

    return canvas;
  }

  /**
   * PACKAGE XXII — MANUAL DIRECTION ENGINE: Activate Node / Disable Node.
   * Non-destructive, subject to the node's own lock.
   */
  private handleSetNodeActive(canvas: SovereignCanvas, payload: SetNodeActivePayload): SovereignCanvas {
    const location = this.locateNode(canvas, payload.targetNodeId);
    if (!location) return canvas;
    if (this.isNodeLocked(canvas, payload.targetNodeId)) return canvas;

    const { trackIndex, nodeIndex } = location;
    const track = canvas.tracks[trackIndex];

    const updatedNode: AssemblyNode = {
      ...track.nodes[nodeIndex],
      isActive: payload.active
    };

    canvas.tracks[trackIndex] = {
      ...track,
      nodes: [
        ...track.nodes.slice(0, nodeIndex),
        updatedNode,
        ...track.nodes.slice(nodeIndex + 1)
      ]
    };

    return canvas;
  }

  /**
   * PACKAGE XXII — MANUAL DIRECTION ENGINE: Mark as Primary / Mark as
   * Supporting (or `null` to honestly clear the mark). Non-destructive,
   * subject to the node's own lock.
   */
  private handleSetNodeEmphasis(canvas: SovereignCanvas, payload: SetNodeEmphasisPayload): SovereignCanvas {
    const location = this.locateNode(canvas, payload.targetNodeId);
    if (!location) return canvas;
    if (this.isNodeLocked(canvas, payload.targetNodeId)) return canvas;

    const { trackIndex, nodeIndex } = location;
    const track = canvas.tracks[trackIndex];

    const updatedNode: AssemblyNode = {
      ...track.nodes[nodeIndex],
      directionEmphasis: payload.emphasis ?? undefined
    };

    canvas.tracks[trackIndex] = {
      ...track,
      nodes: [
        ...track.nodes.slice(0, nodeIndex),
        updatedNode,
        ...track.nodes.slice(nodeIndex + 1)
      ]
    };

    return canvas;
  }

  /**
   * PACKAGE XXII — MANUAL DIRECTION ENGINE: Lock Direction / Unlock
   * Direction. Deliberately NOT subject to `isNodeLocked()` itself —
   * otherwise a locked node could never be unlocked again.
   */
  private handleSetNodeLock(canvas: SovereignCanvas, payload: SetNodeLockPayload): SovereignCanvas {
    const location = this.locateNode(canvas, payload.targetNodeId);
    if (!location) return canvas;

    const { trackIndex, nodeIndex } = location;
    const track = canvas.tracks[trackIndex];

    const updatedNode: AssemblyNode = {
      ...track.nodes[nodeIndex],
      isLocked: payload.locked
    };

    canvas.tracks[trackIndex] = {
      ...track,
      nodes: [
        ...track.nodes.slice(0, nodeIndex),
        updatedNode,
        ...track.nodes.slice(nodeIndex + 1)
      ]
    };

    return canvas;
  }

  /**
   * MINISTRY IV — SOVEREIGN MIXING ENGINE: sets the track-level volume
   * attenuation for the named track. No per-node lock guard — track-level
   * mixing is a separate concern from per-node Direction Decisions. No-ops
   * silently if `targetTrackId` does not match any track in the canvas.
   */
  private handleSetTrackVolume(canvas: SovereignCanvas, payload: SetTrackVolumePayload): SovereignCanvas {
    const trackIndex = canvas.tracks.findIndex((t) => t.trackId === payload.targetTrackId);
    if (trackIndex === -1) return canvas;

    canvas.tracks[trackIndex] = { ...canvas.tracks[trackIndex], trackVolumeDb: payload.volumeDb };
    return canvas;
  }
}