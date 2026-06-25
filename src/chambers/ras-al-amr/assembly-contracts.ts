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
 * The atomic structural unit of Ras Al-Amr. 
 * A Node wraps a Vault Asset with non-destructive assembly rules.
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