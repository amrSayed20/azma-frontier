/**
 * AZMA OS — THE CONSTITUTIONAL NERVOUS SYSTEM
 * Construction Phase II — Type Definitions
 *
 * Authority: "The Constitutional Construction of the Living Body,"
 * Construction Phase II ("The Constitutional Nervous System"), and the
 * authorizing Construction Package's Engineering Requirements.
 *
 * CONSTITUTIONAL PRINCIPLE OF INHERITANCE: this file defines only what
 * is genuinely NEW to the Nervous System (the Signal itself, Signal
 * Types, and the Perception contracts). It does not redefine organs,
 * regions, systems, boundaries, or authorities — those are inherited by
 * reference from src/sovereign-body/ (the Skeleton, Phase I) and the
 * Constitutional Event vocabulary is inherited from
 * src/sovereign-identity/ (SIO-009). No duplicate constitutional
 * definitions are introduced anywhere in this module.
 */

import type { ConstitutionalEvent } from '../sovereign-identity/constitutional-cooperation';

// ── Constitutional Signal Types (Phase II, Article III) ───────────────────
// The exact 8 kinds of constitutional fact a signal may carry, verbatim
// from that Article. Distinct from the Constitutional Event vocabulary
// (which describes WHAT happened in the Creator's journey) — Signal
// Types describe WHAT KIND of constitutional fact is being reported.

export type ConstitutionalSignalType =
  | 'State'
  | 'Health'
  | 'Need'
  | 'Purpose'
  | 'Readiness'
  | 'Identity'
  | 'Authority'
  | 'Availability';

export const CONSTITUTIONAL_SIGNAL_TYPES: readonly ConstitutionalSignalType[] = [
  'State',
  'Health',
  'Need',
  'Purpose',
  'Readiness',
  'Identity',
  'Authority',
  'Availability',
] as const;

// ── The Constitutional Signal ─────────────────────────────────────────────
// Every field required by this Construction Package's Engineering
// Requirements: Origin, Identity, Authority, Purpose, Timestamp,
// Traceability. "Origin" is an organ id inherited from the Skeleton's
// Organ Registry (src/sovereign-body) — never a newly-invented
// identifier. "content" is deliberately unknown/opaque: the Nervous
// System carries constitutional fact, it never interprets it (Article
// I) — so this type cannot know or constrain what the content means.

export interface ConstitutionalSignal {
  /** Traceability — a unique id for this exact signal instance. */
  readonly signalId: string;
  /** Origin — the organ id (from src/sovereign-body's Organ Registry) that reported this signal. Every signal possesses exactly one constitutional origin (Article VIII). */
  readonly origin: string;
  /** Identity — what kind of constitutional fact this is. */
  readonly signalType: ConstitutionalSignalType;
  /** Purpose — optionally, which Constitutional Event (inherited from SIO-009) this signal relates to, if any. */
  readonly relatedEvent: ConstitutionalEvent | null;
  /** Authority — the constitutional authority under which this signal was reported (normally the reporting organ's own name). */
  readonly reportingAuthority: string;
  /** A short, human-readable description of the constitutional fact — never interpreted or acted upon by the Nervous System itself. */
  readonly purpose: string;
  /** Timestamp — ISO 8601, set at the moment of emission. */
  readonly timestamp: string;
  /** The opaque fact being carried. The Nervous System never reads into this beyond passing it along. */
  readonly content: unknown;
}

// ── Constitutional Perception Interfaces ──────────────────────────────────
// What every organ's perception endpoint must be capable of. A pure
// contract — no organ's real source file is modified to implement this;
// it exists so any organ (present or future) CAN connect.

export interface PerceptionEndpoint {
  readonly organId: string;
  /** Reports a signal on this organ's behalf. Pure transport — performs no interpretation, decision, or scheduling of its own. */
  readonly report: (signal: Omit<ConstitutionalSignal, 'signalId' | 'origin' | 'timestamp'>) => ConstitutionalSignal;
  /** Reads this organ's own last-known observable state, per signal type. */
  readonly observeSelf: () => Readonly<Partial<Record<ConstitutionalSignalType, ConstitutionalSignal>>>;
}

/** A listener registered on the Perception Bus. Receives signals verbatim — it may act on them elsewhere, but the Bus itself never inspects what a listener does. */
export type SignalListener = (signal: ConstitutionalSignal) => void;
