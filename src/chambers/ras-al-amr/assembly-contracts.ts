/**
 * AZMA OS - Phase 5: Ras Al-Amr Assembly Architecture
 * File: src/chambers/ras-al-amr/assembly-contracts.ts
 *
 * The Sovereign Canvas & Timeline Contracts.
 * Governs the non-destructive, pure-reference structural assembly of Vault Assets
 * across Narrative, Directorial, and Cinematic domains.
 *
 * Preserves:
 * - Pure Reference-Based Assembly (No media duplication)
 * - Multi-Modal Canvases (Supports logic and temporal sequences)
 * - Non-Destructive Editing (Vault Assets remain completely immutable)
 * - Multi-Tenant Isolation (Strict canvas ownership)
 *
 * PACKAGE XXI — DIRECTION NODE LAYER (2026-07-28): "Ras Al Amr must begin
 * thinking in terms of Direction rather than files." No new runtime, no
 * new node type — `AssemblyNode` already IS the Direction Node; this
 * package gives it real cinematic identity: `nodeId` (already real) is
 * its identity, `temporal`/`spatial`/`customDirectives` (already real)
 * are its metadata, and the new `directionRole`
 * (`DirectionNodeRole` — Opening Shot/Dialogue Scene/Narration/Music
 * Layer/Ambient Layer/Transition/Closing Shot, the Chief Architect's own
 * examples) is its cinematic classification. "Mapping assets into
 * Direction Nodes" is `CanvasActionType.ADD_NODE`
 * (ras-al-amr-state-manager.ts) — already real since the Narrative Canvas
 * Foundation package; every placed asset was already becoming this exact
 * structure. `UPDATE_NODE_CLASSIFICATION` (new, Package XXI) lets the
 * Creator assign or change a node's role after placement, non-
 * destructively, reusing `locateNode()` (Package XX) for lookup.
 */

import { CapabilityTarget } from '../../core/sovereign-orchestrator/qiyamah-intent-types';
import { AssetFamily } from '../../vault/sovereign-vault-types';

// ==========================================
// 1. CANVAS TAXONOMY
// ==========================================

/**
 * Defines the operational nature of the assembly space.
 * Prevents Ras Al-Amr from being pigeonholed as a video-only NLE.
 */
export enum CanvasType {
  NARRATIVE = 'NARRATIVE',       // Linear/Branching logic assembly (Scripts, Storyboards)
  DIRECTORIAL = 'DIRECTORIAL',   // Rule/Constraint assembly (Shot plans, lighting logic)
  CINEMATIC = 'CINEMATIC'        // Temporal/Spatial media assembly (Video, Audio timeline)
}

// ==========================================
// 2. NON-DESTRUCTIVE DIRECTIVES
// ==========================================

/**
 * Governs when and how an asset plays within a Cinematic timeline.
 * Trims do not alter the base media; they only tell the renderer what segment to read.
 */
export interface TemporalDirective {
  globalStartTimeSeconds: number; // When the node starts on the master timeline
  playDurationSeconds: number;    // How long the node exists on the timeline
  trimStartSeconds?: number;      // Non-destructive IN point
  trimEndSeconds?: number;        // Non-destructive OUT point
}

/**
 * Governs visual placement on a multi-layer composition canvas.
 */
export interface SpatialDirective {
  zIndex: number;
  scaleX: number;
  scaleY: number;
  positionX: number;
  positionY: number;
  rotationDegrees: number;
}

// ==========================================
// 3. ASSEMBLY GRAPH NODES & TRACKS
// ==========================================

/**
 * PACKAGE XXI — DIRECTION NODE LAYER: a Direction Node's cinematic
 * classification — what a node MEANS to the direction of the work,
 * never how it is stored or technically typed (that remains assetFamily/
 * capabilityOrigin, unchanged). Named directly after the Chief
 * Architect's own examples, not an invented vocabulary. Genuinely
 * optional on AssemblyNode — an unclassified node is an honest, real
 * state, never defaulted or guessed.
 */
export enum DirectionNodeRole {
  OPENING_SHOT = 'OPENING_SHOT',
  DIALOGUE_SCENE = 'DIALOGUE_SCENE',
  NARRATION = 'NARRATION',
  MUSIC_LAYER = 'MUSIC_LAYER',
  AMBIENT_LAYER = 'AMBIENT_LAYER',
  TRANSITION = 'TRANSITION',
  CLOSING_SHOT = 'CLOSING_SHOT'
}

/**
 * The atomic structural unit of Ras Al-Amr.
 * A Node wraps a Vault Asset with non-destructive assembly rules.
 *
 * PACKAGE XXI — DIRECTION NODE LAYER: this IS the Direction Node the
 * Sovereign Direction State reasons about — no new type was introduced.
 * `nodeId` is its real Direction Node identity (unchanged, already
 * globally unique since the Narrative Canvas Foundation package).
 * `temporal`/`spatial`/`customDirectives` are its real Direction Node
 * metadata (unchanged — already real, already carried by every node;
 * this package reframes what they collectively mean rather than adding a
 * parallel metadata field). `directionRole` (new) is its real cinematic
 * classification — what transforms "an asset reference" into "a
 * Direction Node with cinematic identity," per this package's own
 * mandate. Absent for a node the Creator has not yet classified — never
 * inferred from assetFamily/capabilityOrigin or any other technical fact.
 */
export interface AssemblyNode {
  nodeId: string;
  assetId: string;                // Pure reference to the Sovereign Vault
  assetFamily: AssetFamily;       // Cached from Vault for quick track filtering
  capabilityOrigin: CapabilityTarget;

  // Directives
  temporal?: TemporalDirective;
  spatial?: SpatialDirective;

  // Extensible instructions (e.g., opacity, volume levels, text sequencing index)
  customDirectives?: Record<string, unknown>;

  /** PACKAGE XXI — the Creator's own, genuinely optional cinematic classification for this Direction Node. */
  directionRole?: DirectionNodeRole;
}

/**
 * A logical grouping of Assembly Nodes.
 * In a CINEMATIC canvas, this is a Timeline Track (e.g., "Audio Track 1").
 * In a NARRATIVE canvas, this is a Story Sequence (e.g., "Act 1").
 */
export interface AssemblyTrack {
  trackId: string;
  trackName: string;
  isMuted: boolean;               // Disables processing for this track
  isHidden: boolean;
  nodes: AssemblyNode[];
}

// ==========================================
// 4. THE SOVEREIGN CANVAS
// ==========================================

/**
 * The definitive immutable record of a user's assembly session.
 * This is the object loaded by the Ras Al-Amr UI to render the workspace.
 */
export interface SovereignCanvas {
  canvasId: string;
  subscriberTenantId: string;     // Absolute commercial multi-tenant isolation
  canvasType: CanvasType;
  title: string;
  
  tracks: AssemblyTrack[];
  
  // Allows a canvas to store global assembly rules (e.g., Master Volume, Global LUTs)
  globalDirectives?: Record<string, unknown>;
  
  createdAt: number;
  updatedAt: number;
}