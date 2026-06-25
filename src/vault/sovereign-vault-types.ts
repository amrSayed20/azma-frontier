/**
 * AZMA OS - Phase 4: Materialization Architecture
 * File: src/vault/sovereign-vault-types.ts
 * 
 * The Sovereign Vault Deposition Contracts.
 * Governs the structures used to safely deposit and index materialized assets 
 * returned by Al-Watin Al-Siyadi's Fleet into the user's central ownership layer.
 * 
 * Preserves:
 * - Vault-Centric Ownership (Absolute tenant binding)
 * - First-Class Directorial Assets (Media vs. Structural taxonomy)
 * - Operation-Centric Lineage (Immutable link to originating operation)
 * - Non-Linearity (Assets are independent of project pipelines)
 */

import { CapabilityTarget } from '../core/sovereign-orchestrator/qiyamah-intent-types';

// ==========================================
// 1. ASSET TAXONOMY
// ==========================================

/**
 * Defines the fundamental structural nature of the generated asset.
 * Enforces the constitutional rule that Qiyamah generates both media and logic.
 */
export enum AssetFamily {
  MEDIA = 'MEDIA',           // Binary files (e.g., MP4, WAV, PNG, WEBP)
  STRUCTURAL = 'STRUCTURAL'  // Document/Logic files (e.g., JSON shot definitions, TXT scripts)
}

// ==========================================
// 2. METADATA & DEPOSITION PAYLOADS
// ==========================================

/**
 * Flexible metadata structure to accommodate the varied outputs of different capabilities.
 */
   export interface VaultAssetMetadata {
     [key: string]: unknown; 
    // Existing properties...
    // Universal Metadata
  fileSizeBytes?: number;
  providerId?: string;               // The fleet adapter that fulfilled the materialization
  generationPrompt?: string;         // The exact raw prompt or instruction used
  
  // Media-Specific Metadata (Visual, Motion, Audio)
  durationSeconds?: number;
  dimensions?: string;               // e.g., '1920x1080'
  frameRate?: number;
  
  // Structural-Specific Metadata (Writing, Directorial)
  documentFormat?: string;           // e.g., 'SCREENPLAY_JSON', 'CAMERA_PLAN_XML'
  wordCount?: number;
}

/**
 * The internal payload dispatched by Al-Watin's Asynchronous Deposition Handler
 * to the Sovereign Vault once a fleet operation resolves successfully.
 */
export interface SovereignVaultDeposit {
  operationId: string;
  subscriberTenantId: string;
  capabilityTarget: CapabilityTarget;
  assetFamily: AssetFamily;
  secureStorageUri: string;          // Cloud URL for media, or direct document URI for structural
  metadata: VaultAssetMetadata;
}

// ==========================================
// 3. THE SOVEREIGN ASSET RECORD
// ==========================================

/**
 * The definitive immutable record of a user-owned asset residing in the Sovereign Vault.
 * This is the object queried when a user wants to load an asset into a new Qiyamah domain,
 * assemble a timeline in Ras Al-Amr, or publish via Makman Al-Ghayah.
 */
export interface VaultAsset {
  assetId: string;                   // The unique universal identifier for this asset
  subscriberTenantId: string;        // The sovereign owner
  originatingOperationId: string;    // The operation that birthed this asset
  capabilityTarget: CapabilityTarget;// The Qiyamah capability that originated the asset
  assetFamily: AssetFamily;
  
  secureStorageUri: string;
  metadata: VaultAssetMetadata;
  
  createdAt: number;
  updatedAt: number;
  
  // Note: Application of the Sovereign Seal (Al-Khatm Al-Siyadi) is deferred 
  // to Makman Al-Ghayah and is NOT automatically applied to this raw generation record.
}