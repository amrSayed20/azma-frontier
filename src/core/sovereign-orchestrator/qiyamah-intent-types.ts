/**
 * AZMA OS - Phase 4: Materialization Architecture
 * File: src/chambers/qiyamah/qiyamah-intent-types.ts
 * 
 * The Polymorphic Intent Family.
 * Defines the universal communication contract between Qiyamah's operational
 * domains and Al-Watin Al-Siyadi's Fleet.
 * 
 * Preserves:
 * - Creator Sovereignty (Infinite Paths via optional context)
 * - Vault-Centric Ownership (VaultContextReference)
 * - Multi-Tenant Isolation (subscriberTenantId)
 * - Operation-Centric Execution (operationId)
 * - Fleet Agnosticism (Capability targets instead of vendor media types)
 */

/**
 * Capability Targets replace technology-specific media types.
 * This ensures the architecture supports future generative capabilities
 * without modifying the core orchestrator.
 */
export enum CapabilityTarget {
  WRITING = 'WRITING',
  DIRECTORIAL = 'DIRECTORIAL',
  VISUAL = 'VISUAL',
  MOTION = 'MOTION',
  AUDIO = 'AUDIO'
}

/**
 * VaultContextReference enforces the Vault-Centric Ownership model.
 * Domains do not hold assets; they reference assets owned by the user.
 */
export interface VaultContextReference {
  assetId: string;
  contextWeight: number; // 0.0 to 1.0 (Defines how strongly this asset influences the operation)
  role: string;          // e.g., 'BASE_NARRATIVE', 'VISUAL_ANCHOR', 'KINETIC_DRIVE'
}

/**
 * The immutable foundation of all Qiyamah operations.
 */
export interface BaseAZMAIntent {
  operationId: string;
  subscriberTenantId: string;       // Absolute commercial isolation
  capabilityTarget: CapabilityTarget;
  contextReferences: VaultContextReference[];
  projectContainerId?: string;      // Strictly optional organizational metadata
}

/**
 * Represents the capability to materialize narrative, dialogue, and structural text.
 */
export interface WritingIntent extends BaseAZMAIntent {
  capabilityTarget: CapabilityTarget.WRITING;
  structuralFormat: 'SCREENPLAY' | 'NARRATIVE' | 'DIALOGUE' | 'OUTLINE';
  thematicParameters: Record<string, string>;
  toneMarkers: string[];
}

/**
 * Represents the capability to define rules, physics, and visual logic.
 */
export interface DirectorialIntent extends BaseAZMAIntent {
  capabilityTarget: CapabilityTarget.DIRECTORIAL;
  cameraLogic: string;
  spatialMovement: string;
  lensRules: string;
  lightingParameters: string;
  scenePacing: string;
}

/**
 * Represents the capability to materialize static visual representation.
 */
export interface VisualIntent extends BaseAZMAIntent {
  capabilityTarget: CapabilityTarget.VISUAL;
  aspectRatio: string;
  compositionWeights: Record<string, number>;
  aestheticRules: string[];
}

/**
 * Represents the capability to materialize kinetic and temporal behavior.
 */
export interface MotionIntent extends BaseAZMAIntent {
  capabilityTarget: CapabilityTarget.MOTION;
  durationVectorsSeconds: number;
  physicsScales: string; // e.g., 'FLUID_DYNAMICS', 'REALISTIC_GRAVITY'
  kineticMarkers: string[];
}

/**
 * Represents the capability to materialize auditory frequency, soundscapes, and vocal presence.
 */
export interface AudioIntent extends BaseAZMAIntent {
  capabilityTarget: CapabilityTarget.AUDIO;
  soundscapeLayers: string[];
  frequencyRules: string;
  vocalPresence?: string;
  tempoBPM?: number;
}

/**
 * The definitive Polymorphic Intent Family.
 * Al-Watin Al-Siyadi consumes this union type, reads the BaseAZMAIntent properties
 * to perform routing and accounting, and passes the specialized payload to the Fleet.
 */
export type AZMAPolymorphicIntent = 
  | WritingIntent 
  | DirectorialIntent 
  | VisualIntent 
  | MotionIntent 
  | AudioIntent;