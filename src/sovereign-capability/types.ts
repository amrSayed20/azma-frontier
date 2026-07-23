/**
 * AZMA OS — THE SOVEREIGN CAPABILITY DIWAN
 * Constitutional Declaration Model (Construction ID SCD-001)
 * Campaign A — Constitutional Declaration Foundation
 *
 * Authority: "The Sovereign Capability Diwan — Constitutional Dossier,"
 * Chapters I–III, per the approved Architectural Blueprint.
 *
 * Every type below declares constitutional STRUCTURE only — what a
 * capability record looks like. None of it executes, schedules,
 * orchestrates, or invokes anything (Diwan Ch. I Art. VII). This file
 * describes WHAT a capability is, never HOW it is fulfilled (Diwan Ch. II
 * Art. I/VII) — no field here may hold implementation detail, a provider
 * name, a framework, or a technology.
 */

import type { ChamberContext } from '../core/tongue';

// ── Constitutional Ownership Model ────────────────────────────────────────
// Diwan Ch. II Art. V: ownership belongs to a Sovereign Chamber — never to
// Runtime, Infrastructure, an AI provider, or a programming language.
// Reuses the already-certified ChamberContext type (src/core/tongue) rather
// than inventing a parallel chamber-identifier scheme.

export type CapabilityOwner = ChamberContext;

// ── Constitutional Category Model ─────────────────────────────────────────
// Diwan Ch. III Art. II names "a constitutional category" as part of a
// capability's birth identity. Campaign A (SCD-001) left this as an open
// string, since no Dossier chapter ratifies category values in advance —
// the Constitutional Council ruled categories "shall emerge from
// constitutional discovery... never be designed in advance." Campaign B
// (SCD-002) then discovered the Empire's 30 real capabilities from
// repository evidence. This is that ratified taxonomy (SCD-003) — every
// value below was derived FROM the 30 discovered capabilities' actual
// shared shapes (see taxonomy.ts for the full derivation), not designed
// independently of them.

export type CapabilityCategory =
  | 'investigation'
  | 'verdict-revision'
  | 'engagement-mode'
  | 'generation-commitment'
  | 'production-assembly'
  | 'distribution-and-access'
  | 'vault-record-management'
  | 'treasure-transfer';

// ── Constitutional Visibility Model ───────────────────────────────────────
// Diwan Ch. II Art. VI names the exact 9 constitutional consumer types.
// Verbatim, none invented, none omitted.

export type ConstitutionalConsumer =
  | 'User Interface'
  | 'Sovereign Tongue'
  | 'Recommendation Systems'
  | 'Automation'
  | 'Documentation'
  | 'Public APIs'
  | 'Future AI Agents'
  | 'Analytics'
  | 'Commercial Systems';

export interface CapabilityVisibility {
  /** Whether this capability is currently meant to be discoverable at all. */
  readonly discoverable: boolean;
  /** Which constitutional consumer types may discover it. */
  readonly visibleTo: readonly ConstitutionalConsumer[];
}

// ── Constitutional Lifecycle Model ────────────────────────────────────────
// Diwan Ch. III Art. IX names these exact 6 observation states. This is
// the only part of the lifecycle encoded as a live-usable type — the
// surrounding PROCESS (birth/certification/publication/consumption/
// evolution/retirement, Ch. III Art. I,III,IV,VI,VII,X,XI) is documented
// separately in lifecycle.ts as a contract, not executable transition
// logic (see that file's header for why).

export type CapabilityLifecycleState =
  | 'active'
  | 'awaiting-certification'
  | 'deprecated'
  | 'retired'
  | 'restricted'
  | 'unavailable';

// ── Constitutional Certification Model ────────────────────────────────────
// Diwan Ch. III Art. III: certification confirms purpose, ownership,
// relationship with existing capabilities, necessity, and constitutional
// compliance. This record only stores the OUTCOME of that governance
// process — it contains no logic that performs certification.

export type CapabilityCertificationStatus =
  | 'certified'
  | 'awaiting-certification'
  | 'not-certified';

export interface CertificationRecord {
  readonly status: CapabilityCertificationStatus;
  /** ISO date string, or null if never certified. */
  readonly certifiedAt: string | null;
  /**
   * The constitutional body responsible for this capability's
   * certification — for every capability declared so far, "The
   * Constitutional Council." Left as a plain string rather than a closed
   * enum: per-chamber certifying-authority delegation is not yet defined
   * by any ratified Dossier chapter.
   */
  readonly certifyingAuthority: string;
}

// ── Constitutional Relationship Model ─────────────────────────────────────
// Diwan Ch. II Art. XI and Ch. III Art. VIII name these exact 4
// relationship kinds. Composition never removes independent ownership —
// a relationship is a declared reference, not a merge.

export type CapabilityRelationshipKind =
  | 'depends-on'
  | 'supports'
  | 'extends'
  | 'composes-with';

export interface CapabilityRelationship {
  readonly kind: CapabilityRelationshipKind;
  readonly capabilityId: string;
}

// ── Constitutional Retirement Model ───────────────────────────────────────
// Diwan Ch. III Art. X: retirement is recorded, never silent. All four
// fields are named explicitly in that Article.

export interface RetirementRecord {
  readonly retiredAt: string;
  readonly reason: string;
  readonly replacedBy: string | null;
  readonly affectsExistingJourneys: boolean;
}

// ── The Constitutional Capability Declaration ─────────────────────────────
// Every field above assembled into the one constitutional record type a
// capability may be declared with. This interface is the complete
// "constitutional declaration model" this campaign was authorized to
// construct.

export interface ConstitutionalCapability {
  readonly id: string;
  readonly name: string;
  readonly owner: CapabilityOwner;
  /** What this capability enables the Creator to accomplish — never how. */
  readonly purpose: string;
  readonly category: CapabilityCategory;
  readonly visibility: CapabilityVisibility;
  readonly lifecycleState: CapabilityLifecycleState;
  readonly certification: CertificationRecord;
  readonly relationships: readonly CapabilityRelationship[];
  readonly retirement: RetirementRecord | null;
  readonly constitutionalAuthority: string;
}
