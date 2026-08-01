/**
 * AZMA OS — Al Hujjah Al-Damighah
 * SOVEREIGN KNOWLEDGE UNDERSTANDING FOUNDATION — Constitutional Foundation Package XI
 *
 * Understanding is the mandatory stage between Reception and Investigation.
 * It transforms a validated KnowledgeReception into a constitutional
 * InvestigationIntent — the only form Al Hujjah's Investigation Engine
 * is permitted to receive.
 *
 * ─── WHAT UNDERSTANDING ESTABLISHES ────────────────────────────────────────
 *
 *   Reception answers:  Who is speaking?
 *   Understanding answers: What is truly being asked?
 *
 *   Understanding discovers no evidence.
 *   Understanding reaches no conclusion.
 *   Understanding performs no search.
 *   Understanding makes no recommendation.
 *
 *   It prepares a truthful investigation by establishing:
 *     — the normalized form of the question
 *     — the preserved original wording
 *     — the nature of the inquiry (for Citizen requests)
 *     — the constitutional lineage (for Sovereign requests)
 *     — the domain within which investigation shall proceed
 *
 * ─── CITIZEN UNDERSTANDING ──────────────────────────────────────────────────
 *
 *   A Citizen's query is classified into one of eight InquiryTypes.
 *   Classification is performed by lexical analysis of the query text.
 *   No AI inference is used. No external system is consulted.
 *   The classification is honest about its own limitations — it is a
 *   constitutional preparation signal, not a judgment of the question's merit.
 *
 *   `inquiryType` is populated. `sovereignLineage` is null.
 *
 * ─── SOVEREIGN UNDERSTANDING ────────────────────────────────────────────────
 *
 *   A Sovereign request carries its own semantic structure — the
 *   `questionStatement` already names exactly what must be learned.
 *   Understanding extracts and preserves the full constitutional lineage:
 *   goalId, assessmentId, criterionId, gapClass, gapCategory, availability.
 *
 *   `sovereignLineage` is populated. `inquiryType` is null.
 *
 * ─── THE IMMUTABLE CONSTITUTIONAL ORDER ─────────────────────────────────────
 *
 *   Reception → Understanding → Investigation → Evidence → Knowledge → Export
 *
 *   No investigation shall begin without a valid InvestigationIntent.
 *   No InvestigationIntent exists without a RECEIVED KnowledgeReception.
 *   This chain is constitutional and immutable.
 */

import type {
  KnowledgeReceptionOrigin,
  ReceptionGapClass,
  ReceptionGapCategory,
  ReceptionKnowledgeAvailability,
} from './reception-contracts';

/**
 * The constitutional classification of a Citizen's inquiry.
 *
 * Determined by lexical analysis of the query text alone.
 * Used by the Investigation Engine to calibrate the investigation approach.
 *
 * QUESTION       — seeks an answer to a general question
 * VERIFICATION   — seeks to confirm or disprove a specific claim
 * DISCOVERY      — seeks to learn what something is or how it works
 * COMPARISON     — seeks to compare two or more things
 * EVIDENCE_REQUEST — seeks supporting data, studies, or proof
 * LEARNING_REQUEST — seeks to understand how to do something
 * DEVELOPMENT    — seeks to build, create, or implement something
 * IDEA           — explores a concept, possibility, or hypothetical
 */
export type InquiryType =
  | 'QUESTION'
  | 'VERIFICATION'
  | 'DISCOVERY'
  | 'COMPARISON'
  | 'EVIDENCE_REQUEST'
  | 'LEARNING_REQUEST'
  | 'DEVELOPMENT'
  | 'IDEA';

/**
 * The constitutional lineage carried by every Sovereign InvestigationIntent.
 *
 * Derived entirely from the SovereignKnowledgeReceptionPayload. No field
 * is modified or re-derived. Lineage preservation is constitutional — every
 * investigation result must be traceable to the exact criterion and gap
 * that originated the request.
 *
 * `availability` is the constitutional routing signal: it names where the
 * knowledge can come from (OBSERVABLE_INTERNALLY, REQUIRES_INVESTIGATION, or
 * NOT_CURRENTLY_OBTAINABLE) and will be used by the Investigation Engine to
 * determine which investigation path to take.
 */
export interface SovereignRequestLineage {
  readonly requestId: string;
  readonly goalId: string;
  readonly assessmentId: string;
  readonly criterionId: string;
  readonly criterionDescriptionSnapshot: string;
  readonly gapClass: ReceptionGapClass;
  readonly gapCategory: ReceptionGapCategory;
  readonly availability: ReceptionKnowledgeAvailability;
  readonly requestedAtMs: number;
}

/**
 * The unified constitutional investigation intent.
 *
 * The only form the Investigation Engine is permitted to receive.
 * Produced by the Understanding Engine from a RECEIVED KnowledgeReception.
 *
 * `intentId`        — unique identity for this intent
 * `receptionId`     — the KnowledgeReception that produced this intent
 * `origin`          — CITIZEN or SOVEREIGN
 * `normalizedQuery` — the investigation question in its canonical form
 * `originalWording` — the original text exactly as received, preserved intact
 * `domain`          — the knowledge domain within which investigation proceeds;
 *                     for Citizen: the Creator's declared domain;
 *                     for Sovereign: derived from the gap's constitutional class
 * `inquiryType`     — non-null for CITIZEN; null for SOVEREIGN
 * `sovereignLineage`— non-null for SOVEREIGN; null for CITIZEN
 * `understoodAtMs`  — when Understanding produced this intent
 *
 * Exactly one of `inquiryType` and `sovereignLineage` is non-null,
 * determined by `origin`. The null field carries no information.
 */
export interface InvestigationIntent {
  readonly intentId: string;
  readonly receptionId: string;
  readonly origin: KnowledgeReceptionOrigin;
  readonly normalizedQuery: string;
  readonly originalWording: string;
  readonly domain: string;
  readonly inquiryType: InquiryType | null;
  readonly sovereignLineage: SovereignRequestLineage | null;
  readonly understoodAtMs: number;
}

/**
 * The outcome of the Understanding Engine.
 *
 * Understanding may only succeed when given a RECEIVED KnowledgeReception.
 * A REJECTED reception cannot be understood — it was not constitutionally
 * received and its payload cannot be trusted to form a valid intent.
 *
 * ok=true  → InvestigationIntent is available; Investigation may be invoked.
 * ok=false → reception was REJECTED; the original validation errors are preserved.
 */
export type UnderstandingOutcome =
  | { readonly ok: true; readonly intent: InvestigationIntent }
  | {
      readonly ok: false;
      readonly reason: 'RECEPTION_REJECTED';
      readonly validationErrors: readonly string[];
    };
