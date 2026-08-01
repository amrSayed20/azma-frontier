/**
 * AZMA OS — Al Hujjah Al-Damighah
 * SOVEREIGN KNOWLEDGE UNDERSTANDING FOUNDATION — Constitutional Foundation Package XI
 *
 * The Understanding Engine is the mandatory bridge between Reception and
 * Investigation. It produces an InvestigationIntent from a RECEIVED
 * KnowledgeReception, establishing what is truly being asked before any
 * investigation begins.
 *
 * This engine does exactly three things:
 *   1. Guards against REJECTED receptions (refuses to produce an intent).
 *   2. For Citizen requests: classifies the inquiry type and normalises the query.
 *   3. For Sovereign requests: extracts and preserves the constitutional lineage.
 *
 * WHAT THIS ENGINE DOES NOT DO:
 *   Does not invoke IntelligenceEngine.
 *   Does not invoke any repository provider.
 *   Does not search for knowledge.
 *   Does not produce evidence, verdicts, or recommendations.
 *   Does not communicate with Makman or any other Sovereign State.
 *   Does not modify the Reception record.
 */

import type { KnowledgeReception, ReceptionGapClass } from './reception-contracts';
import type {
  InquiryType,
  SovereignRequestLineage,
  InvestigationIntent,
  UnderstandingOutcome,
} from './understanding-contracts';

let understandingSequence = 0;

function generateIntentId(prefix: 'cit' | 'sov', receptionId: string): string {
  understandingSequence += 1;
  return `intent-${prefix}-${receptionId}-${understandingSequence}`;
}

/**
 * Classify the inquiry type of a Citizen's query by lexical analysis.
 *
 * Priority order is intentional: more specific patterns are checked first
 * so that a query like "How to build a solar panel — evidence needed?" is
 * classified as LEARNING_REQUEST (the leading intent) rather than DEVELOPMENT.
 *
 * This is a lexical heuristic — not AI inference. It establishes a calibration
 * signal for the Investigation Engine. A future Understanding enhancement may
 * refine classification without changing this engine's constitutional role.
 */
function classifyInquiryType(query: string): InquiryType {
  const q = query.toLowerCase();

  if (/\b(evidence|proof|data|statistics?|studies|study|research|source|sources|cite|citation)\b/.test(q)) {
    return 'EVIDENCE_REQUEST';
  }
  if (/\b(vs\.?|versus|compar[ei]|difference between|better than|worse than|which is better|pros and cons)\b/.test(q)) {
    return 'COMPARISON';
  }
  if (/\b(how to|how do|how can|steps? to|step-by-step|explain how|help me understand|teach me|guide me|tutorial)\b/.test(q)) {
    return 'LEARNING_REQUEST';
  }
  if (/\b(build|create|develop|make|implement|design|construct|write a|write an)\b/.test(q)) {
    return 'DEVELOPMENT';
  }
  if (/\b(is this|is it|does this|does it|can this|can it|are they|should i|should we|verify|confirm|true|false|accurate|correct|real|fact)\b/.test(q)) {
    return 'VERIFICATION';
  }
  if (/\b(idea|concept|possibility|could we|what if|imagine|explore|hypothetical|scenario)\b/.test(q)) {
    return 'IDEA';
  }
  if (/\b(what is|what are|what was|what were|who is|who are|discover|find out|tell me about|describe|overview|explain)\b/.test(q)) {
    return 'DISCOVERY';
  }
  return 'QUESTION';
}

/**
 * Derive the investigation domain for a Sovereign request from its gap class.
 *
 * The Sovereign path carries no explicit domain — the gap's constitutional
 * classification determines the domain within which investigation proceeds.
 *
 * OBSERVATION_GAP → 'observation' (the gap concerns measurable platform signals)
 * FULFILLMENT_GAP → 'fulfillment' (the gap concerns whether outcomes were achieved)
 * NO_ACTIVE_GAP   → 'general'     (no active gap — should not normally reach here)
 */
function deriveSovereignDomain(gapClass: ReceptionGapClass): string {
  switch (gapClass) {
    case 'OBSERVATION_GAP':
      return 'observation';
    case 'FULFILLMENT_GAP':
      return 'fulfillment';
    case 'NO_ACTIVE_GAP':
      return 'general';
  }
}

function understandCitizen(reception: KnowledgeReception, atMs: number): InvestigationIntent {
  const req = reception.citizenRequest!;
  return {
    intentId: generateIntentId('cit', reception.receptionId),
    receptionId: reception.receptionId,
    origin: 'CITIZEN',
    originalWording: req.query,
    normalizedQuery: req.query.trim(),
    domain: req.domain,
    inquiryType: classifyInquiryType(req.query),
    sovereignLineage: null,
    understoodAtMs: atMs,
  };
}

function understandSovereign(reception: KnowledgeReception, atMs: number): InvestigationIntent {
  const req = reception.sovereignRequest!;
  const lineage: SovereignRequestLineage = {
    requestId: req.requestId,
    goalId: req.goalId,
    assessmentId: req.assessmentId,
    criterionId: req.criterionId,
    criterionDescriptionSnapshot: req.criterionDescriptionSnapshot,
    gapClass: req.gapClass,
    gapCategory: req.gapCategory,
    availability: req.availability,
    requestedAtMs: req.requestedAtMs,
  };
  return {
    intentId: generateIntentId('sov', reception.receptionId),
    receptionId: reception.receptionId,
    origin: 'SOVEREIGN',
    originalWording: req.questionStatement,
    normalizedQuery: req.questionStatement.trim(),
    domain: deriveSovereignDomain(req.gapClass),
    inquiryType: null,
    sovereignLineage: lineage,
    understoodAtMs: atMs,
  };
}

/**
 * Transform a KnowledgeReception into a constitutional InvestigationIntent.
 *
 * Only RECEIVED receptions may be understood. A REJECTED reception failed
 * constitutional validation at the boundary — its payload cannot be trusted
 * to form a truthful investigation intent. In this case the outcome carries
 * the original validation errors so the caller can surface them.
 *
 * On success, the returned InvestigationIntent is the ONLY form the
 * Investigation Engine is permitted to receive. No investigation may bypass
 * this stage.
 *
 * Does not invoke IntelligenceEngine.
 * Does not search any repository or provider.
 * Does not produce evidence, verdicts, or knowledge.
 */
export function understandKnowledgeReception(reception: KnowledgeReception): UnderstandingOutcome {
  if (reception.status !== 'RECEIVED') {
    return {
      ok: false,
      reason: 'RECEPTION_REJECTED',
      validationErrors: reception.validationErrors,
    };
  }

  const atMs = Date.now();
  const intent =
    reception.origin === 'CITIZEN'
      ? understandCitizen(reception, atMs)
      : understandSovereign(reception, atMs);

  return { ok: true, intent };
}
