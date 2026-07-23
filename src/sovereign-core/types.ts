/**
 * AZMA OS — THE SOVEREIGN CORE (THE CONSTITUTIONAL MIND)
 * Construction Phase V — Type Definitions
 *
 * Authority: "The Constitutional Construction of the Living Body,"
 * Construction Phase V ("The Constitutional Mind — The Birth of the
 * Sovereign Core").
 *
 * DISCLOSURE, not invention: this phase's own Primary Objectives name a
 * "Constitutional Memory Integration Layer," and its Constitutional
 * Responsibilities require the Core to "Receive constitutional memory."
 * A dedicated search performed before any code in this module was
 * written confirmed that no module, class, or file named "Constitutional
 * Memory" exists anywhere in this repository — it is aspirational vision
 * text only. The only genuine historical record of constitutional
 * reality that already exists is the Constitutional Nervous System's own
 * append-only Signal Log (Phase II). This phase therefore treats that
 * Signal Log AS the platform's Constitutional Memory — organizing and
 * querying it (memory-integration.ts), never duplicating storage or
 * inventing a second history. This is the same "build a lens over what
 * already exists" discipline Phase III already applied to build
 * Circulation's 5 Flows over that same Bus. Flagged here for Council
 * review, exactly as every prior cross-phase inconsistency in this
 * campaign was flagged rather than silently resolved.
 */

import type { ConstitutionalSignal } from '../sovereign-nervous-system';
import type { OrganContinuityRecord } from '../sovereign-heart';
import type { ConstitutionalOrgan } from '../sovereign-body';

// ── Constitutional Understanding ───────────────────────────────────────────
// What the Core currently understands about one organ, assembled purely
// from already-existing constitutional inputs (the Skeleton, the Nervous
// System, and the Heart). Understanding organizes; it never judges.

export interface ConstitutionalUnderstanding {
  readonly organId: string;
  readonly knowledge: ConstitutionalOrgan | null;
  readonly continuity: OrganContinuityRecord;
  readonly memory: readonly ConstitutionalSignal[];
  readonly observedSignalTypes: readonly string[];
}

// ── Constitutional Claims (Reasoning Layer output) ─────────────────────────
// Certification Requirement 3 is explicit: the Core must distinguish
// fact from inference from uncertainty from recommendation. This
// discriminated union enforces that distinction at the type level, not
// merely in prose.

export type ConstitutionalClaimKind = 'fact' | 'inference' | 'uncertainty' | 'recommendation';

export interface ConstitutionalClaim {
  readonly claimId: string;
  readonly organId: string;
  readonly kind: ConstitutionalClaimKind;
  readonly statement: string;
  /** What this claim is grounded in — always traceable back to a real constitutional input, never invented. */
  readonly basedOn: string;
}

// ── Constitutional Plan (Planning Layer output) ────────────────────────────
// An ordered set of advisory steps. A Plan is inert data — nothing in
// this module ever invokes a step; producing the ordered list IS the
// Planning Layer's entire responsibility.

export interface ConstitutionalPlanStep {
  readonly stepId: string;
  readonly description: string;
  readonly justifiedByClaimId: string;
}

export interface ConstitutionalPlan {
  readonly organId: string;
  readonly steps: readonly ConstitutionalPlanStep[];
}

// ── Constitutional Advisory (Advisory Layer output) ────────────────────────
// The Core's complete, final synthesis for one organ — understanding,
// claims, and plan, bundled for a Council/Creator reader. Advisory, never
// directive: nothing downstream of this type is ever invoked
// automatically by the Core itself.

export interface ConstitutionalAdvisory {
  readonly organId: string;
  readonly summary: string;
  readonly understanding: ConstitutionalUnderstanding;
  readonly claims: readonly ConstitutionalClaim[];
  readonly plan: ConstitutionalPlan;
}
