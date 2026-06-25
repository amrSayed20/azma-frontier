/**
 * AZMA OS - Phase 3: Execution Layer
 * File: src/agents/director/director-types.ts
 * * Defines the Sovereign Contracts, Content Policy enforcement, and 
 * Production Package structures required by the Director Agent.
 */

import { PlannerOutput, ProjectDNA } from '../planner/planner-types';

// ==========================================
// ALMANTAHAA VISUAL IDENTITY CONTRACT
// ==========================================

export enum AlmantahaaColorPalette {
  PrimaryGlow = '#FFE680',
  Gold = '#D4AF37',
  Bronze = '#8B6508',
  Dark = '#0A0A0A',
  Black = '#000000',
  Text = '#E5E7EB'
}

export enum AlmantahaaEffects {
  SovereignGlass = 'Sovereign Glass Effect',
  PremiumGlassmorphism = 'Premium Glassmorphism',
  CinematicGlow = 'Cinematic Glow',
  LayeredDepth = 'Layered Depth',
  SoftReflections = 'Soft Reflections',
  GoldIllumination = 'Gold Illumination',
  LuxuryStudio = 'Luxury Studio Appearance'
}

export interface GlobalAesthetic {
  basePalette: AlmantahaaColorPalette[];
  mandatoryEffects: AlmantahaaEffects[];
  lightingDirective: string;
  compositionRules: string;
}

// ==========================================
// SOVEREIGN CONTENT POLICY ENFORCEMENT
// ==========================================

export enum ClearanceStatus {
  APPROVED = 'APPROVED',
  REJECTED_EXPLICIT_CONTENT = 'REJECTED_EXPLICIT_CONTENT',
  PENDING_REVIEW = 'PENDING_REVIEW'
}

export interface PolicyClearance {
  status: ClearanceStatus;
  clearedAt: number;
  guardSignature: string; // Cryptographic or systemic verification hash
  flaggedReasons?: string[];
}

// ==========================================
// METADATA & MULTI-USER ISOLATION
// ==========================================

export interface PackageMetadata {
  packageId: string;
  plannerId: string;
  projectId: string;
  subscriberTenantId: string; // Ensures isolation in commercial multi-user environment
  sessionToken: string;
  createdAt: number;
  targetChambers: string[]; // e.g., ['video-chamber', 'audio-chamber']
}

// ==========================================
// PRODUCTION DIRECTIVES (AGENT PAYLOADS)
// ==========================================

export interface ShotListFrame {
  sequenceId: string;
  durationSeconds: number;
  optimizedPrompt: string;
  cameraMovement: string;
  aestheticOverrides?: Partial<GlobalAesthetic>;
}

export interface VideoDirective {
  totalDurationSeconds: number;
  aspectRatio: string;
  frames: ShotListFrame[];
}

export interface AudioDirective {
  voiceoverScript: string;
  pacingMarkers: Record<number, string>; // e.g., { 12: "dramatic pause" }
  tone: string;
}

export interface AssetDependencies {
  requiredVaultAssets: string[]; // Array of IDs pointing to Sovereign Vault
}

export interface ProductionDirectives {
  video?: VideoDirective;
  audio?: AudioDirective;
  assets: AssetDependencies;
}

// ==========================================
// MASTER PRODUCTION PACKAGE
// ==========================================

export interface ProductionPackage {
  metadata: PackageMetadata;
  policyClearance: PolicyClearance; // MUST BE APPROVED to proceed to specialized agents
  aestheticContract: GlobalAesthetic;
  directives: ProductionDirectives;
}

// ==========================================
// DIRECTOR I/O
// ==========================================

export interface DirectorInput {
  plannerOutput: PlannerOutput; 
  projectDna: ProjectDNA;       
  subscriberTenantId: string;
}

export interface DirectorOutput {
  success: boolean;
  package?: ProductionPackage;
  error?: string;
}