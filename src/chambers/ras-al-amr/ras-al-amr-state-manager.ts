/**
 * AZMA OS - Phase 5: Ras Al-Amr Assembly Architecture
 * File: src/chambers/ras-al-amr/ras-al-amr-state-manager.ts
 * * The Ras Al-Amr State Manager.
 * The executable engine that processes non-destructive mutation payloads 
 * and applies them to the Sovereign Canvas using immutable state transitions.
 * * Update Notice: Full integration of Spatial and Advanced Semantic Directives.
 */

import { SovereignCanvas, AssemblyNode, AssemblyTrack } from './assembly-contracts';
import { 
  CanvasMutationPayload, 
  CanvasActionType, 
  AddNodePayload, 
  RemoveNodePayload,
  UpdateNodeTemporalPayload,
  UpdateNodeSpatialPayload,
  UpdateNodeAdvancedPayload
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
      default:
        return updatedCanvas; 
    }
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
      assetFamily: AssetFamily.MEDIA, 
      capabilityOrigin: CapabilityTarget.VISUAL, 
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
    const trackIndex = canvas.tracks.findIndex(t => t.trackId === payload.targetTrackId);
    if (trackIndex === -1) return canvas;

    const updatedTrack: AssemblyTrack = {
      ...canvas.tracks[trackIndex],
      nodes: canvas.tracks[trackIndex].nodes.filter(n => n.nodeId !== payload.targetNodeId)
    };

    canvas.tracks[trackIndex] = updatedTrack;
    return canvas;
  }

  private handleUpdateTemporal(canvas: SovereignCanvas, payload: UpdateNodeTemporalPayload): SovereignCanvas {
    const trackIndex = canvas.tracks.findIndex(t => t.trackId === payload.targetTrackId);
    if (trackIndex === -1) return canvas;

    const track = canvas.tracks[trackIndex];
    const nodeIndex = track.nodes.findIndex(n => n.nodeId === payload.targetNodeId);
    if (nodeIndex === -1) return canvas;

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
    const trackIndex = canvas.tracks.findIndex(t => t.trackId === payload.targetTrackId);
    if (trackIndex === -1) return canvas;

    const track = canvas.tracks[trackIndex];
    const nodeIndex = track.nodes.findIndex(n => n.nodeId === payload.targetNodeId);
    if (nodeIndex === -1) return canvas;

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
    const trackIndex = canvas.tracks.findIndex(t => t.trackId === payload.targetTrackId);
    if (trackIndex === -1) return canvas;

    const track = canvas.tracks[trackIndex];
    const nodeIndex = track.nodes.findIndex(n => n.nodeId === payload.targetNodeId);
    if (nodeIndex === -1) return canvas;

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
}