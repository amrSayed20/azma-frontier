/**
 * AZMA OS — THE SOVEREIGN BODY
 * THE CONSTITUTIONAL SKELETON — Type Definitions
 * Construction Phase I
 *
 * Authority: "AZMA OS — The Sovereign Body" (Constitutional Vision, Books
 * I-V, and the Constitutional Anatomy, Chapters I-XII).
 *
 * These types define constitutional STRUCTURE only. Nothing here
 * executes, schedules, decides, or reacts. The Skeleton "owns no runtime
 * behavior. It owns constitutional structure" (Construction Order,
 * Phase I). Every registry built from these types is therefore a
 * static, read-only, declarative dataset — the same discipline already
 * applied to the Sovereign Identity Layer and the Sovereign Capability
 * Diwan.
 */

// ── Constitutional Regions (Anatomy Ch. I, Article III) ───────────────────
// The exact six regions named in that Article, in that order. None
// invented, none renamed, none omitted.

export type ConstitutionalRegionId =
  | 'region-of-consciousness'
  | 'region-of-life'
  | 'region-of-identity'
  | 'region-of-intelligence'
  | 'region-of-creation'
  | 'region-of-governance';

export interface ConstitutionalRegion {
  readonly id: ConstitutionalRegionId;
  readonly name: string;
  readonly purpose: string;
  readonly correspondingSystemId: ConstitutionalSystemId;
}

// ── Constitutional Systems (Anatomy Ch. III, Article III) ─────────────────
// The exact six systems named in that Article. Each system corresponds
// 1:1 to a region of the same conceptual name (Article II of that
// chapter: "A Constitutional System is a living assembly of sovereign
// organs" occupying one region).

export type ConstitutionalSystemId =
  | 'system-of-life'
  | 'system-of-consciousness'
  | 'system-of-identity'
  | 'system-of-intelligence'
  | 'system-of-creation'
  | 'system-of-governance';

export interface ConstitutionalSystem {
  readonly id: ConstitutionalSystemId;
  readonly name: string;
  readonly purpose: string;
  readonly regionId: ConstitutionalRegionId;
  /** The organ(s) the vision names as principal to this system, if any (e.g. Al-Wateen for the System of Life). Empty where the vision names none. */
  readonly principalOrganIds: readonly string[];
}

// ── Constitutional Organs (Anatomy Ch. II) ─────────────────────────────────
// An organ's implementation status is recorded honestly — this Skeleton
// does not pretend an unbuilt or unreachable organ is live. Status
// values are the real, evidenced states found across this repository's
// own excavation history, not invented in the abstract.

export type OrganImplementationStatus =
  | 'not-yet-implemented'
  | 'implemented-but-unreachable'
  | 'implemented-and-live'
  | 'implemented-but-unconsumed';

export interface ConstitutionalOrgan {
  readonly id: string;
  readonly name: string;
  readonly regionId: ConstitutionalRegionId;
  readonly systemId: ConstitutionalSystemId;
  readonly constitutionalPurpose: string;
  readonly implementationStatus: OrganImplementationStatus;
  /** Path to the real repository artifact, or null if none exists yet. */
  readonly existingArtifactPath: string | null;
  readonly evidenceNote: string;
}

// ── Constitutional Relationships (Anatomy Ch. V) ───────────────────────────
// Relationships are bidirectional (Ch. V, Article II) — recording one
// entry per relationship is sufficient; the Skeleton does not require a
// mirrored second entry, since bidirectionality is a property of the
// relationship itself, not of how many records describe it.

export type ConstitutionalRelationshipKind =
  | 'depends-on'
  | 'supports'
  | 'consumes'
  | 'protects';

export interface ConstitutionalRelationship {
  readonly fromOrganId: string;
  readonly toOrganId: string;
  readonly kind: ConstitutionalRelationshipKind;
  readonly evidenceNote: string;
}

// ── Constitutional Boundaries (per-organ "shall never" clauses) ───────────
// Sourced verbatim (or near-verbatim) from each organ's own constitutional
// articles already declared in the Books/Anatomy — not invented here.

export interface ConstitutionalBoundary {
  readonly organId: string;
  readonly prohibitions: readonly string[];
  readonly sourceArticle: string;
}

// ── Constitutional Authority (the positive scope each organ may act within) ─

export interface ConstitutionalAuthority {
  readonly organId: string;
  readonly authorityScope: string;
  readonly sourceArticle: string;
}

// ── Constitutional Classification (the Skeleton's own meta-taxonomy) ──────
// "Classification" here means the taxonomy of constitutional CONSTRUCT
// KINDS the Skeleton itself recognizes (Region/System/Organ/Relationship/
// Boundary/Authority) — not an invented business taxonomy. No Book or
// Anatomy chapter names specific classification values for organs
// themselves, the same way no Dossier chapter ratified Capability
// categories before evidence existed (Sovereign Capability Diwan,
// SCD-001) — so this registry classifies the STRUCTURE, not guesses at
// content the Constitution never specified.

export type ConstitutionalConstructKind =
  | 'body'
  | 'region'
  | 'system'
  | 'organ'
  | 'relationship'
  | 'boundary'
  | 'authority';

export interface ConstitutionalClassification {
  readonly kind: ConstitutionalConstructKind;
  readonly description: string;
}

// ── The Constitutional Body itself (singular) ─────────────────────────────

export interface ConstitutionalBody {
  readonly name: string;
  readonly purpose: string;
  readonly foundingAuthority: string;
  readonly regionIds: readonly ConstitutionalRegionId[];
}
