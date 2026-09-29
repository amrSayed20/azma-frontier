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
// 1b. SOVEREIGN PROVENANCE  (Constitution, Articles 5.3–5.6)
// ==========================================
//
// The constitution requires every sovereign asset to answer three questions
// that this model could not previously answer at all: where did it come from,
// which chamber made it, and may it be built upon.
//
// These are NEW columns beside the original nine. Nothing is renamed, nothing
// is dropped, and no parallel asset table is introduced — Article 15 forbids a
// second asset model, and the existing nine fields carry working code.

/**
 * The five constitutional chambers, plus the honest absence.
 *
 * Article 5.5 forbids attributing an asset to a chamber without evidence. The
 * 47 assets that predate provenance are therefore `UNKNOWN` — a measurement,
 * not a default, and never rewritten into a guess.
 */
export enum SourceChamber {
  HUJJAH_AL_DAMIGHAH = 'HUJJAH_AL_DAMIGHAH',
  QIYAMAH = 'QIYAMAH',
  RAS_AL_AMR = 'RAS_AL_AMR',
  KHAZAIN = 'KHAZAIN',
  MAKMAN_AL_GHAYAH = 'MAKMAN_AL_GHAYAH',
  /** Provenance unavailable. Article 5.5. Never inferred into a real chamber. */
  UNKNOWN = 'UNKNOWN',
}

/** How this asset came to exist. Article 5.3. */
export enum DerivationKind {
  /** Created from nothing but an instruction — no parent asset. */
  GENERATED = 'GENERATED',
  /** Supplied by the Creator from their own device. */
  UPLOADED = 'UPLOADED',
  /** Content changed inside an existing asset — Qiyamah. Has a parent. */
  MODIFIED = 'MODIFIED',
  /** A still brought into motion — Qiyamah. Has a parent. */
  ANIMATED = 'ANIMATED',
  /** Composed from several assets across time — Ras Al Amr. */
  RENDERED = 'RENDERED',
  /** Provenance predates the sovereign asset model. Article 5.5. */
  LEGACY = 'LEGACY',
}

/**
 * Where an asset stands in its life. Article 8.
 *
 * Declared, never inferred: Article A-6 of the architectural package forbids
 * concluding "this is final" from an asset's type or location.
 */
export enum LifecycleState {
  /** A working asset. May be derived from, may be composed with. */
  INTERMEDIATE = 'INTERMEDIATE',
  /** An export. Immutable — Article 8.2. Never edited in place. */
  FINAL = 'FINAL',
  /** A Final Work that a Published Revision points at. Article 8.3. */
  PUBLISHED = 'PUBLISHED',
}

/**
 * Whether a new asset may be derived from this one. Article 5.5.
 *
 * ─── THE DISTINCTION THE CONSTITUTION INSISTS ON ────────────────────────────
 *
 *   «لا يُفترض أنها قابلة للتعديل» does NOT mean unusable. A legacy asset stays
 *   viewable, selectable, composable and exportable — Article 6.1 of the
 *   directive says so in those words. What it may not do is act as the PARENT
 *   of a new asset, because a derivation records a lineage and a legacy asset
 *   has none to record.
 *
 *   Measured: 43 of the 47 legacy assets are media sitting in canvases the
 *   Creators work in today. Reading this state as "unusable" would empty those
 *   canvases.
 */
export enum DerivationPermission {
  /** May be derived from. The ordinary state of a sovereign asset. */
  ALLOWED = 'ALLOWED',
  /** Usable in every way except as the parent of a new asset. Article 5.5. */
  REQUIRES_ADOPTION = 'REQUIRES_ADOPTION',
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

  // PACKAGE IX — FORMAL GOAL CONTRACT TRIAD CLOSURE: the id of the formal
  // GoalContract created FROM a compiled assembly this asset was part of,
  // written back at Goal-creation time (see the creator-goal POST route
  // and SovereignVaultManager.linkGoalToAsset). Absent until a Goal has
  // actually been created for this asset — never guessed or backfilled.
  goalId?: string;

  // RAS AL AMR — MINISTRY I: VOICE ECOSYSTEM: a real, Creator-declared
  // classification distinguishing "this audio asset is a voice" from any
  // other audio (music, ambient sound, sound effect) — never inferred
  // from file content or MIME type, only ever set explicitly by the
  // Creator at upload time (POST /api/vault/assets/upload). `voiceDisplayName`
  // is the voice's own real identity label (e.g. "Warm Narrator"),
  // distinct from the underlying file's own name. Both genuinely optional
  // — absence means "not marked as a voice," never defaulted or guessed.
  isVoiceAsset?: boolean;
  voiceDisplayName?: string;

  // RAS AL AMR — MINISTRY III: VOICE CLONING ENGINE: optional flags that
  // distinguish a cloned voice from an imported or TTS-generated one.
  // `isClonedVoice` is set only by the cloning route — never inferred.
  // `clonedVoiceProviderId` is the provider-issued voice identity for
  // this clone — an internal reference, never surfaced to the Creator.
  // Both absent means "not a cloned voice."
  isClonedVoice?: boolean;
  clonedVoiceProviderId?: string;
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

  /**
   * The SHA-256 of the bytes being deposited.
   *
   * Supplying it asks the Vault to refuse a duplicate: if this Creator already
   * owns an asset with these exact bytes, the deposit is rejected with
   * DUPLICATE_CONTENT naming the asset they already have. A path that cannot
   * cheaply hash its bytes omits it and nothing changes for it.
   */
  contentDigest?: string;

  // ── PHASE C: provenance at the moment of creation ─────────────────────────
  //
  // `creationChamber` is REQUIRED, and that is the whole mechanism. Every asset
  // in this Empire enters through depositAsset() — measured: `insertVaultAsset`
  // has exactly one caller, and it is that method. Making this field mandatory
  // turns the type checker into the enforcement: a new creation path cannot
  // compile without stating which chamber made the thing.
  //
  // Article 10 of the directive: the chamber must be the one that MATERIALLY
  // produced the asset, not one the request merely passed through. An optional
  // field would have been filled with whatever was convenient at each call site.

  /** The chamber that actually produced this asset. Article 10. */
  creationChamber: SourceChamber;

  /** How it came to exist. Defaults to GENERATED — an asset with no parent. */
  derivation?: DerivationKind;

  /**
   * The asset this was derived from. Its presence is what makes this a
   * derivation, and `depositAsset` validates it: ownership, existence, and the
   * parent's own right to be derived from. Article 7 of the directive.
   */
  parentAssetId?: string | null;

  /** The Sovereign Project this belongs to. Ownership is checked. Article 9. */
  projectId?: string | null;

  /** Declared, never inferred. Defaults to INTERMEDIATE. Article 11. */
  lifecycleState?: LifecycleState;

  /** Who performed the act. Defaults to the owning Creator. Article 5. */
  createdBy?: string | null;
}

/**
 * Why a deposit was refused.
 *
 * Article 7 of the directive: «Reject invalid cases rather than correcting them
 * silently». Each of these is a refusal the caller must handle, not a condition
 * this layer quietly repairs.
 */
export type DepositRejection =
  /** A parent was named that does not exist. */
  | 'PARENT_NOT_FOUND'
  /** The parent belongs to another Creator. Cross-owner derivation. */
  | 'PARENT_NOT_OWNED'
  /** The parent is legacy or otherwise not yet adoptable-from. Article 5.5. */
  | 'PARENT_NOT_DERIVABLE'
  /** An asset cannot be its own parent. */
  | 'CIRCULAR_LINEAGE'
  /** The named project does not exist or belongs to another Creator. */
  | 'PROJECT_NOT_OWNED'
  /** This Creator already owns an asset with these exact bytes. */
  | 'DUPLICATE_CONTENT';

/** Thrown by `depositAsset` when a deposit violates the constitution. */
export class SovereignDepositError extends Error {
  public readonly rejection: DepositRejection;
  /** On DUPLICATE_CONTENT, the asset the Creator already owns. */
  public readonly existingAssetId?: string;
  constructor(rejection: DepositRejection, detail: string, existingAssetId?: string) {
    super(`[SovereignVault] ${rejection}: ${detail}`);
    this.name = 'SovereignDepositError';
    this.rejection = rejection;
    this.existingAssetId = existingAssetId;
  }
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

  // ── SOVEREIGN PROVENANCE — Constitution, Article 5.3 ──────────────────────
  //
  // Every field below is OPTIONAL on the type, and that is deliberate rather
  // than lax: they arrive by ALTER TABLE onto a table holding 47 rows that
  // predate them. A required field would either break those rows or force this
  // model to invent values for them, and Article 5.5 forbids inventing.
  //
  // Reading them: absent means "this record predates provenance", which the
  // repository turns into the honest legacy defaults on the way out. Present
  // means the asset was born under the constitution and its lineage is real.

  /** The asset this one was derived from. Absent for an original. Article 5.3. */
  parentAssetId?: string | null;
  /** First asset in the lineage. Equals assetId for an original. Article 5.3. */
  rootAssetId?: string;
  /** Position in the lineage, starting at 1. Article 5.6. */
  version?: number;
  /** How this asset came to exist. Article 5.3. */
  derivation?: DerivationKind;
  /** The chamber that made it. UNKNOWN where unprovable — Article 5.5. */
  creationChamber?: SourceChamber;
  /** The Sovereign Project it belongs to. Null for a free asset. Article 7.4. */
  projectId?: string | null;
  /** Intermediate, final, or published. Declared, never inferred. Article 8. */
  lifecycleState?: LifecycleState;
  /** Whether a new asset may be derived from this one. Article 5.5. */
  derivationPermission?: DerivationPermission;
  /** Who brought it into being. Article 8.4. */
  createdBy?: string | null;
  /** Who last changed its record, and when. Article 8.4. */
  lastModifiedBy?: string | null;
  lastModifiedAt?: number | null;
  /** SHA-256 of this asset's own bytes — the queryable copy of what metadata holds. */
  contentDigest?: string | null;
  /**
   * The asset's real pixel size, read from its own bytes at deposit.
   *
   * NULL means «لا نعرف مقاس هذا الأصل» and nothing else: a row written before
   * this existed, a file no longer on disk, or a format the reader was never
   * taught. مكمن الغاية must be able to say that to a Creator rather than
   * assume a shape and offer to charge them for adapting it.
   */
  pixelWidth?: number | null;
  pixelHeight?: number | null;
}

/**
 * What the constitution says about an asset that predates it.
 *
 * Article 5.5: a legacy asset is not attributed to a chamber, is not given an
 * invented parent or version history, and is not made unusable. It is marked
 * for what it is and left otherwise whole.
 *
 * `rootAssetId` is the asset's own id, which is not an invention: an asset with
 * no recorded parent IS the first of its own lineage. That is the one thing
 * about its history that can be stated without guessing.
 */
export function legacyProvenanceFor(assetId: string): {
  parentAssetId: null;
  rootAssetId: string;
  version: number;
  derivation: DerivationKind;
  creationChamber: SourceChamber;
  projectId: null;
  lifecycleState: LifecycleState;
  derivationPermission: DerivationPermission;
} {
  return {
    parentAssetId: null,
    rootAssetId: assetId,
    version: 1,
    derivation: DerivationKind.LEGACY,
    creationChamber: SourceChamber.UNKNOWN,
    projectId: null,
    // Not FINAL: calling an asset final because it is old would be exactly the
    // inference Article 8 forbids.
    lifecycleState: LifecycleState.INTERMEDIATE,
    derivationPermission: DerivationPermission.REQUIRES_ADOPTION,
  };
}

/** Whether this asset may act as the parent of a new one. Article 5.5. */
export function isDerivable(asset: VaultAsset): boolean {
  return (asset.derivationPermission ?? DerivationPermission.REQUIRES_ADOPTION)
    === DerivationPermission.ALLOWED;
}

/**
 * Whether this asset predates the sovereign provenance model.
 *
 * Read from the recorded derivation rather than from a missing column, so that
 * an asset adopted by its owner stops being legacy the moment its lineage
 * becomes real.
 */
export function isLegacyAsset(asset: VaultAsset): boolean {
  return (asset.derivation ?? DerivationKind.LEGACY) === DerivationKind.LEGACY;
}

// ==========================================
// 4. RAS AL AMR — MINISTRY I: VOICE LIBRARY
// ==========================================
// A real, queryable Voice Library reusing the Vault's own already-durable
// asset catalog — no new storage system, no separate registry. A "voice"
// is simply any VaultAsset the Creator explicitly marked as one at
// upload time (see POST /api/vault/assets/upload).

export function isVoiceAsset(asset: VaultAsset): boolean {
  return asset.metadata.isVoiceAsset === true;
}

export function filterVoiceLibrary(assets: readonly VaultAsset[]): VaultAsset[] {
  return assets.filter(isVoiceAsset);
}