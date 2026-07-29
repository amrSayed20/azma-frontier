/**
 * AZMA OS - Phase 5: Ras Al-Amr Assembly Architecture
 * File: src/chambers/ras-al-amr/assembly-directive-payloads.ts
 * * The Non-Destructive Assembly Directives.
 * Defines the strict mutation payloads and advanced directive structures 
 * used to manipulate the Sovereign Canvas without altering underlying Vault Assets.
 * * Update Notice: Clean integration of the Semantic Hybrid Core (No Patching Rule).
 */

import { TemporalDirective, SpatialDirective, DirectionNodeRole } from './assembly-contracts';

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

/**
 * RAS AL AMR — MINISTRY I: VOICE ECOSYSTEM (Voice Selection).
 * Non-destructive assignment of a real, Vault-owned voice asset to a
 * Direction Node — the Creator's own declared choice, never inferred.
 * `vaultAssetId` must reference a real VaultAsset the Creator marked as a
 * voice (see isVoiceAsset(), sovereign-vault-types.ts); this directive
 * itself does not enforce that — the assigning UI is responsible for only
 * offering real voice assets, the same trust boundary every other
 * customDirective already relies on.
 */
export interface VoiceAssignmentDirective {
  vaultAssetId: string;
}

// ==========================================
// 2. CANVAS MUTATION ACTION PAYLOADS
// ==========================================

export enum CanvasActionType {
  ADD_NODE = 'ADD_NODE',
  REMOVE_NODE = 'REMOVE_NODE',
  UPDATE_TEMPORAL = 'UPDATE_TEMPORAL',
  UPDATE_SPATIAL = 'UPDATE_SPATIAL',
  UPDATE_ADVANCED_DIRECTIVE = 'UPDATE_ADVANCED_DIRECTIVE',
  /** PACKAGE XX — DIRECTION ASSEMBLY LAYER: non-destructive reordering — swaps a node with its adjacent neighbor within the same track. */
  REORDER_NODE = 'REORDER_NODE',
  /** PACKAGE XX — DIRECTION ASSEMBLY LAYER: creates a new, real, empty group (AssemblyTrack was already "a logical grouping of Assembly Nodes" by its own doc comment — this is that concept, finally used). */
  ADD_TRACK = 'ADD_TRACK',
  /** PACKAGE XX — DIRECTION ASSEMBLY LAYER: moves an existing node from one group to another — the write-side of "asset grouping can be changed." */
  MOVE_NODE_TO_TRACK = 'MOVE_NODE_TO_TRACK',
  /** PACKAGE XXI — DIRECTION NODE LAYER: assigns or changes a node's real cinematic classification (DirectionNodeRole). */
  UPDATE_NODE_CLASSIFICATION = 'UPDATE_NODE_CLASSIFICATION',
  /** PACKAGE XXII — MANUAL DIRECTION ENGINE: Activate Node / Disable Node. */
  SET_NODE_ACTIVE = 'SET_NODE_ACTIVE',
  /** PACKAGE XXII — MANUAL DIRECTION ENGINE: Mark as Primary / Mark as Supporting (or clear the mark). */
  SET_NODE_EMPHASIS = 'SET_NODE_EMPHASIS',
  /** PACKAGE XXII — MANUAL DIRECTION ENGINE: Lock Direction / Unlock Direction. */
  SET_NODE_LOCK = 'SET_NODE_LOCK'
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
  /**
   * NARRATIVE CANVAS FOUNDATION: the real asset's own family/capability,
   * carried through so the node this creates reflects genuine
   * constitutional identity rather than a placeholder. Optional so any
   * existing untyped caller keeps compiling unchanged; RasAlAmrStateManager
   * falls back to its prior hardcoded defaults only when omitted.
   */
  assetFamily?: import('../../vault/sovereign-vault-types').AssetFamily;
  capabilityOrigin?: import('../../core/sovereign-orchestrator/qiyamah-intent-types').CapabilityTarget;
  initialTemporal?: TemporalDirective;
  initialSpatial?: SpatialDirective;
}

// PACKAGE XX — DIRECTION ASSEMBLY LAYER: now that a node can move between
// groups (MOVE_NODE_TO_TRACK), `targetTrackId` below is no longer
// consulted for locating the node — nodeId is already globally unique,
// so RasAlAmrStateManager now scans every track by nodeId instead of
// trusting a caller-supplied track hint that could go stale the instant
// a node moves group. The field is kept (not removed) so no existing
// caller's payload shape needs to change; it is simply harmless now.

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
  directiveKey: 'audio' | 'visual' | 'structural' | 'semantic' | 'voice'; // دمج أصيل ومباشر — 'voice' added Ministry I
  directivePayload:
    | AudioMixingDirective
    | VisualFilterDirective
    | StructuralLogicDirective
    | SemanticLinkDirective
    | VoiceAssignmentDirective;   // توسيع العقد ليشمل اختيار الصوت (وزارة الصوت الأولى)
}

/**
 * PACKAGE XX — DIRECTION ASSEMBLY LAYER: moves a node one position up or
 * down within its own track's array — non-destructive (the same node
 * object, no removal/recreation), reusing the already-real array-order
 * signal Packages XIII/XIV already derive `executionOrderIndex`/
 * `globalStartTimeSeconds` from.
 */
export interface ReorderNodePayload extends BaseCanvasMutation {
  actionType: CanvasActionType.REORDER_NODE;
  targetTrackId: string;
  targetNodeId: string;
  direction: 'up' | 'down';
}

/**
 * PACKAGE XX — DIRECTION ASSEMBLY LAYER: creates a new, empty group
 * (AssemblyTrack). No canvas-level identity beyond a name — grouping
 * itself is the pre-existing AssemblyTrack concept, not a new one.
 */
export interface AddTrackPayload extends BaseCanvasMutation {
  actionType: CanvasActionType.ADD_TRACK;
  trackName: string;
}

/**
 * PACKAGE XX — DIRECTION ASSEMBLY LAYER: moves an existing node from one
 * group to another, non-destructively (the node's own identity, temporal/
 * spatial/customDirectives all survive the move unchanged).
 */
export interface MoveNodeToTrackPayload extends BaseCanvasMutation {
  actionType: CanvasActionType.MOVE_NODE_TO_TRACK;
  sourceTrackId: string;
  targetNodeId: string;
  destinationTrackId: string;
}

/**
 * PACKAGE XXI — DIRECTION NODE LAYER: assigns or changes a Direction
 * Node's real cinematic classification, non-destructively. `targetTrackId`
 * is kept only for shape consistency with every other per-node mutation —
 * exactly like REMOVE_NODE/UPDATE_TEMPORAL/UPDATE_SPATIAL/
 * UPDATE_ADVANCED_DIRECTIVE, it is not consulted for lookup;
 * RasAlAmrStateManager locates the node by its own globally-unique id via
 * locateNode() (Package XX).
 */
export interface UpdateNodeClassificationPayload extends BaseCanvasMutation {
  actionType: CanvasActionType.UPDATE_NODE_CLASSIFICATION;
  targetTrackId: string;
  targetNodeId: string;
  directionRole?: DirectionNodeRole;
}

/**
 * PACKAGE XXII — MANUAL DIRECTION ENGINE: Activate Node / Disable Node.
 * Non-destructive — every other real field survives unchanged. Subject
 * to a node's own lock (RasAlAmrStateManager's own lock-guard account).
 */
export interface SetNodeActivePayload extends BaseCanvasMutation {
  actionType: CanvasActionType.SET_NODE_ACTIVE;
  targetTrackId: string;
  targetNodeId: string;
  active: boolean;
}

/**
 * PACKAGE XXII — MANUAL DIRECTION ENGINE: Mark as Primary / Mark as
 * Supporting — the Creator's own DECLARED emphasis, `null` to honestly
 * clear a mark rather than forcing a permanent choice. Deliberately
 * distinct from any Automatic-Director-derived "primary" judgment (see
 * assembly-contracts.ts's own header). Subject to a node's own lock.
 */
export interface SetNodeEmphasisPayload extends BaseCanvasMutation {
  actionType: CanvasActionType.SET_NODE_EMPHASIS;
  targetTrackId: string;
  targetNodeId: string;
  emphasis: 'primary' | 'supporting' | null;
}

/**
 * PACKAGE XXII — MANUAL DIRECTION ENGINE: Lock Direction / Unlock
 * Direction. This mutation itself is NEVER subject to the lock-guard it
 * creates — otherwise a locked node could never be unlocked.
 */
export interface SetNodeLockPayload extends BaseCanvasMutation {
  actionType: CanvasActionType.SET_NODE_LOCK;
  targetTrackId: string;
  targetNodeId: string;
  locked: boolean;
}

/**
 * The definitive union type consumed by the Ras Al-Amr State Manager.
 */
export type CanvasMutationPayload =
  | AddNodePayload
  | RemoveNodePayload
  | UpdateNodeTemporalPayload
  | UpdateNodeSpatialPayload
  | UpdateNodeAdvancedPayload
  | ReorderNodePayload
  | AddTrackPayload
  | MoveNodeToTrackPayload
  | UpdateNodeClassificationPayload
  | SetNodeActivePayload
  | SetNodeEmphasisPayload
  | SetNodeLockPayload;