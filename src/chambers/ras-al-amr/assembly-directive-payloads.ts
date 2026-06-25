/**
 * AZMA OS - Phase 5: Ras Al-Amr Assembly Architecture
 * File: src/chambers/ras-al-amr/assembly-directive-payloads.ts
 * * The Non-Destructive Assembly Directives.
 * Defines the strict mutation payloads and advanced directive structures 
 * used to manipulate the Sovereign Canvas without altering underlying Vault Assets.
 * * Update Notice: Clean integration of the Semantic Hybrid Core (No Patching Rule).
 */

import { TemporalDirective, SpatialDirective } from './assembly-contracts';

// ==========================================
// 1. ADVANCED MULTI-MODAL DIRECTIVES 
// ==========================================

/**
 * Non-destructive auditory manipulations applied over the base audio asset.
 */
export interface AudioMixingDirective {
  volumeDb: number;        // e.g., 0 for unity gain, -6 for attenuation
  panCenter: number;       // -1.0 (Hard Left) to 1.0 (Hard Right)
  isMuted: boolean;
}

/**
 * Non-destructive visual transformations applied over the base image/motion asset.
 */
export interface VisualFilterDirective {
  opacity: number;         // 0.0 to 1.0
  blendMode: 'NORMAL' | 'MULTIPLY' | 'SCREEN' | 'OVERLAY';
  colorGradeReferenceId?: string; // Points to a structural logic asset defining LUTs
}

/**
 * Non-destructive logical links applied to structural base assets (Scripts/Rules).
 * Essential for the NARRATIVE and DIRECTORIAL canvases.
 */
export interface StructuralLogicDirective {
  executionOrderIndex: number;
  branchingCondition?: string; // e.g., "IF Scene_1_Day"
}

/**
 * Non-destructive semantic link tying this temporal node to a specific text block 
 * coming from the Hujjah Chamber. Essential for the Hybrid Timeline Core Engine.
 */
export interface SemanticLinkDirective {
  linkedScriptBlockId: string;   // The ID of the text block (e.g., "hook_sentence_1")
  autoRippleOnTextEdit: boolean; // If true, moving/modifying text adjusts the video automatically
}

// ==========================================
// 2. CANVAS MUTATION ACTION PAYLOADS
// ==========================================

export enum CanvasActionType {
  ADD_NODE = 'ADD_NODE',
  REMOVE_NODE = 'REMOVE_NODE',
  UPDATE_TEMPORAL = 'UPDATE_TEMPORAL',
  UPDATE_SPATIAL = 'UPDATE_SPATIAL',
  UPDATE_ADVANCED_DIRECTIVE = 'UPDATE_ADVANCED_DIRECTIVE'
}

/**
 * The constitutional security base for all Ras Al-Amr modifications.
 */
export interface BaseCanvasMutation {
  actionType: CanvasActionType;
  canvasId: string;
  subscriberTenantId: string; // Enforces absolute multi-tenant mutation security
}

export interface AddNodePayload extends BaseCanvasMutation {
  actionType: CanvasActionType.ADD_NODE;
  targetTrackId: string;
  vaultAssetId: string;       // The strict pointer to the Sovereign Vault
  initialTemporal?: TemporalDirective;
  initialSpatial?: SpatialDirective;
}

export interface RemoveNodePayload extends BaseCanvasMutation {
  actionType: CanvasActionType.REMOVE_NODE;
  targetTrackId: string;
  targetNodeId: string;
}

export interface UpdateNodeTemporalPayload extends BaseCanvasMutation {
  actionType: CanvasActionType.UPDATE_TEMPORAL;
  targetNodeId: string;
  targetTrackId: string;
  temporalUpdates: Partial<TemporalDirective>;
}

export interface UpdateNodeSpatialPayload extends BaseCanvasMutation {
  actionType: CanvasActionType.UPDATE_SPATIAL;
  targetNodeId: string;
  targetTrackId: string;
  spatialUpdates: Partial<SpatialDirective>;
}

export interface UpdateNodeAdvancedPayload extends BaseCanvasMutation {
  actionType: CanvasActionType.UPDATE_ADVANCED_DIRECTIVE;
  targetNodeId: string;
  targetTrackId: string;
  directiveKey: 'audio' | 'visual' | 'structural' | 'semantic'; // دمج أصيل ومباشر
  directivePayload: 
    | AudioMixingDirective 
    | VisualFilterDirective 
    | StructuralLogicDirective 
    | SemanticLinkDirective;   // توسيع العقد ليشمل الرابط الدلالي
}

/**
 * The definitive union type consumed by the Ras Al-Amr State Manager.
 */
export type CanvasMutationPayload = 
  | AddNodePayload 
  | RemoveNodePayload
  | UpdateNodeTemporalPayload 
  | UpdateNodeSpatialPayload 
  | UpdateNodeAdvancedPayload;