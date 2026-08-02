/**
 * AZMA OS — SOVEREIGN CHAMBER MANIFEST
 * Constitutional Type Definitions
 *
 * The constitutional contract through which the Empire understands a
 * chamber. This is not documentation, not a UI file, and not an
 * infrastructure runtime manifest. It is the single source of truth
 * for what each chamber IS, what it CAN do, and what it CANNOT do —
 * the language every chamber speaks so the Empire can coordinate them.
 *
 * Reuse decisions:
 * - ChamberContext (src/core/tongue/constitution) — already the
 *   canonical chamber-identifier type in the Empire; Diwan reuses it;
 *   this module follows the same discipline rather than inventing
 *   a parallel scheme.
 * - capabilityId strings cross-reference the Sovereign Capability
 *   Diwan (src/sovereign-capability/diwan.ts) where the capability
 *   already has a governance record there. They are strings, not
 *   typed references, so that new production capabilities may be
 *   declared here before they complete Diwan certification.
 *
 * Not reused and why:
 * - ChamberManifest (src/core/chamber-integration) — that type is the
 *   OS infrastructure layer: adapter paths, message contracts, cache
 *   TTLs. This manifest is the constitutional layer: purpose, inputs,
 *   outputs, preconditions, modes, and boundaries.
 * - ConstitutionalCapability (src/sovereign-capability) — that type
 *   carries governance state (certification, visibility, lifecycle,
 *   relationships). This manifest adds what the Diwan does not have:
 *   inputs, output type, preconditions, failure conditions, and
 *   interaction and operating modes.
 */

import type { ChamberContext } from '../core/tongue/constitution';

// ── Chamber Identity ──────────────────────────────────────────────────────
// 'universal' is a tone context, not a constitutional chamber; excluded.

export type ManifestChamberContext = Exclude<ChamberContext, 'universal'>;

// ── Interaction Modes ─────────────────────────────────────────────────────
// Three modes that define HOW a Creator may trigger or consume a capability.
// 'browse' — no text input required; clicking or tapping is sufficient.
// 'write'  — a text input is required.
// 'listen' — capability can be triggered or consumed via voice.

export type ManifestInteractionMode = 'browse' | 'write' | 'listen';

// ── Operating Modes ───────────────────────────────────────────────────────
// 'guided'   — the chamber leads the Creator through a defined sequence.
// 'explorer' — the Creator operates freely; the chamber follows their lead.

export type ManifestOperatingMode = 'guided' | 'explorer';

// ── Input Declaration ─────────────────────────────────────────────────────

export type ManifestInputType =
  | 'text'        // free-form text: queries, prompts, purpose statements
  | 'selection'   // choice from a defined set: domain, style, voice
  | 'file'        // binary upload: audio, subtitle, image
  | 'identifier'; // reference to an existing record: goalId, canvasId, nodeId

export interface ManifestInput {
  readonly name: string;
  readonly type: ManifestInputType;
  readonly description: string;
}

// ── Capability Declaration ────────────────────────────────────────────────
// A single production-ready operation the chamber exposes.
// Only real, wired capabilities belong here. Nothing theoretical.
// Nothing reserved. The 'capabilityId' cross-references the Sovereign
// Capability Diwan's id where that governance record already exists.

export interface SovereignChamberCapability {
  readonly capabilityId: string;
  readonly displayName: string;
  readonly purpose: string;
  readonly requiredInputs: readonly ManifestInput[];
  readonly optionalInputs: readonly ManifestInput[];
  readonly outputType: string;
  readonly preconditions: readonly string[];
  readonly failureConditions: readonly string[];
  readonly interactionModes: readonly ManifestInteractionMode[];
  readonly operatingModes: readonly ManifestOperatingMode[];
}

// ── Constitutional Boundary ───────────────────────────────────────────────
// What the chamber does, what it refuses, and what it hands off.

export interface ManifestDelegation {
  readonly to: ManifestChamberContext;
  readonly reason: string;
}

export interface SovereignChamberBoundary {
  /** What this chamber is constitutionally authorized to do. */
  readonly canDo: readonly string[];
  /** What this chamber explicitly refuses to do — architectural prohibitions. */
  readonly cannotDo: readonly string[];
  /** Operations the chamber does not own but may trigger in another chamber. */
  readonly delegates: readonly ManifestDelegation[];
}

// ── The Sovereign Chamber Manifest ───────────────────────────────────────
// The complete constitutional declaration for one chamber.

export interface SovereignChamberManifest {
  readonly chamberId: ManifestChamberContext;
  readonly constitutionalName: string;
  readonly constitutionalResponsibility: string;
  readonly capabilities: readonly SovereignChamberCapability[];
  readonly boundary: SovereignChamberBoundary;
}
