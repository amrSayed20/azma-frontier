/**
 * AZMA OS — THE CONSTITUTIONAL CIRCULATION
 * Construction Phase III — Type Definitions
 *
 * Authority: "The Constitutional Construction of the Living Body,"
 * Construction Phase III ("The Constitutional Circulation"), and its
 * authorizing Construction Package.
 *
 * CONSTITUTIONAL PRINCIPLE OF INHERITANCE, held again: the Circulation
 * does not invent a second Signal type, a second Organ Registry, or a
 * second set of Signal Types. It reuses ConstitutionalSignal and the 8
 * Signal Types from src/sovereign-nervous-system verbatim.
 *
 * DISCLOSED VOCABULARY DISCREPANCY: an earlier vision passage ("Phase
 * III, Article III") lists what circulates as "Identity, Purpose,
 * Awareness, Capability, Health, State, Authority, Availability,
 * Readiness, Trust" — 10 items, three of which (Awareness, Capability,
 * Trust) are not among the 8 Constitutional Signal Types Phase II
 * already built and certified, and one of Phase II's 8 (Need) is absent
 * from that list. This is the same category of cross-phase vocabulary
 * drift already found and resolved once before (the Four Domains vs. Six
 * Regions discrepancy, Phase I). Per that same precedent — reuse the
 * already-certified vocabulary rather than fork a competing one — the
 * Circulation uses Phase II's 8 Signal Types as authoritative and does
 * NOT introduce "Awareness" or "Trust" as new signal types. Flagged here
 * for Constitutional Review, not silently resolved.
 */

import type { ConstitutionalSignal } from '../sovereign-nervous-system';

// ── Constitutional Flow Channels ──────────────────────────────────────────
// The 5 named flows this Construction Phase requires. Each is a named,
// filtered LENS over the same underlying signals the Nervous System
// already carries — never a second transport, never a duplicate store.

export type ConstitutionalFlowId =
  | 'state-flow'
  | 'context-flow'
  | 'capability-flow'
  | 'authority-flow'
  | 'health-flow';

export interface ConstitutionalFlow {
  readonly id: ConstitutionalFlowId;
  readonly name: string;
  readonly purpose: string;
  /** What this flow filters for — never interpreted, only matched. */
  readonly filter: string;
}

// ── Constitutional Circulation Transport ──────────────────────────────────
// The one genuinely new mechanism this phase adds: propagating a signal
// across a runtime boundary (browser → server). It never interprets,
// decides, or orchestrates — it only ensures a signal that originated in
// one JavaScript runtime is also recorded in another.

export interface CirculationEnvelope {
  readonly draft: Omit<ConstitutionalSignal, 'signalId' | 'timestamp'>;
}

export interface CirculationResult {
  readonly circulated: boolean;
  readonly signal: ConstitutionalSignal | null;
  readonly reason: string | null;
}
