/**
 * AZMA OS — Al Hujjah Al-Damighah
 * SOVEREIGN KNOWLEDGE RECEPTION FOUNDATION — Constitutional Foundation Package X
 *
 * The constitutional reception boundary of Al Hujjah Al-Damighah.
 *
 * This is the only constitutional entrance into Al Hujjah's investigation
 * lifecycle. Nothing may reach the Investigation Engine without first passing
 * through this boundary and producing a RECEIVED KnowledgeReception.
 *
 * This module accepts both constitutional citizens:
 *   receiveCitizenKnowledgeRequest  — a Creator's voluntary question
 *   receiveSovereignKnowledgeRequest — Makman's formal constitutional request
 *
 * Each request is validated according to its own constitutional language.
 * A unified KnowledgeReception is produced in both cases.
 *
 * WHAT THIS MODULE DOES NOT DO:
 *   Does not invoke IntelligenceEngine.
 *   Does not invoke any repository provider.
 *   Does not search for knowledge.
 *   Does not produce evidence, verdicts, or recommendations.
 *   Does not route requests to any investigation path.
 *   Does not modify any other module.
 *
 * Those responsibilities belong to future constitutional packages.
 */

import type {
  KnowledgeReceptionOrigin,
  ReceptionGapClass,
  ReceptionGapCategory,
  ReceptionKnowledgeAvailability,
  CitizenKnowledgeRequest,
  SovereignKnowledgeReceptionPayload,
  KnowledgeReception,
  ReceptionStatus,
} from './reception-contracts';

const VALID_GAP_CLASSES: readonly ReceptionGapClass[] = [
  'OBSERVATION_GAP',
  'FULFILLMENT_GAP',
  'NO_ACTIVE_GAP',
];

const VALID_GAP_CATEGORIES: readonly ReceptionGapCategory[] = [
  'EVIDENCE_AVAILABILITY',
  'EVIDENCE_SUFFICIENCY',
  'FULFILLMENT_ABSENT',
  'NO_ACTIVE_GAP',
];

const VALID_AVAILABILITY_VALUES: readonly ReceptionKnowledgeAvailability[] = [
  'OBSERVABLE_INTERNALLY',
  'REQUIRES_INVESTIGATION',
  'NOT_CURRENTLY_OBTAINABLE',
];

let receptionSequence = 0;

function nextReceptionId(prefix: 'cit' | 'sov', atMs: number): string {
  receptionSequence += 1;
  return `rcp-${prefix}-${atMs}-${receptionSequence}`;
}

function validateCitizenInput(query: string, domain: string): readonly string[] {
  const errors: string[] = [];
  if (!query || query.trim().length < 3) {
    errors.push('Query must be at least 3 characters.');
  }
  if (!domain || domain.trim().length === 0) {
    errors.push('Domain must be specified.');
  }
  return errors;
}

function validateSovereignPayload(payload: SovereignKnowledgeReceptionPayload): readonly string[] {
  const errors: string[] = [];
  if (!payload.requestId || payload.requestId.trim().length === 0) {
    errors.push('requestId is required.');
  }
  if (!payload.goalId || payload.goalId.trim().length === 0) {
    errors.push('goalId is required.');
  }
  if (!payload.assessmentId || payload.assessmentId.trim().length === 0) {
    errors.push('assessmentId is required.');
  }
  if (!payload.criterionId || payload.criterionId.trim().length === 0) {
    errors.push('criterionId is required.');
  }
  if (!payload.questionStatement || payload.questionStatement.trim().length < 10) {
    errors.push('questionStatement must be at least 10 characters.');
  }
  if (!VALID_GAP_CLASSES.includes(payload.gapClass)) {
    errors.push(`gapClass "${String(payload.gapClass)}" is not a valid constitutional gap class.`);
  }
  if (!VALID_GAP_CATEGORIES.includes(payload.gapCategory)) {
    errors.push(
      `gapCategory "${String(payload.gapCategory)}" is not a valid constitutional gap category.`,
    );
  }
  if (!VALID_AVAILABILITY_VALUES.includes(payload.availability)) {
    errors.push(
      `availability "${String(payload.availability)}" is not a valid constitutional availability value.`,
    );
  }
  return errors;
}

/**
 * Receive a Citizen Knowledge Request at the constitutional reception boundary.
 *
 * A `query` of fewer than 3 characters or an empty `domain` produces a
 * REJECTED reception. All other valid inputs produce a RECEIVED reception.
 *
 * `citizenRequest.requestId` and `citizenRequest.requestedAtMs` are
 * assigned by the reception engine — the Creator does not supply them.
 * `query` and `domain` are preserved after trimming.
 *
 * Does not invoke the Investigation Engine.
 * Does not search any repository or provider.
 */
export function receiveCitizenKnowledgeRequest(query: string, domain: string): KnowledgeReception {
  const receivedAtMs = Date.now();
  const validationErrors = validateCitizenInput(query, domain);
  const status: ReceptionStatus = validationErrors.length === 0 ? 'RECEIVED' : 'REJECTED';
  const receptionId = nextReceptionId('cit', receivedAtMs);
  const citizenRequest: CitizenKnowledgeRequest = {
    requestId: `cit-req-${receivedAtMs}-${receptionSequence}`,
    query: query.trim(),
    domain: domain.trim(),
    requestedAtMs: receivedAtMs,
  };
  return {
    receptionId,
    origin: 'CITIZEN' as KnowledgeReceptionOrigin,
    status,
    citizenRequest,
    sovereignRequest: null,
    validationErrors,
    receivedAtMs,
  };
}

/**
 * Receive a Sovereign Knowledge Request at the constitutional reception boundary.
 *
 * The `payload` carries Makman Al-Ghayah's formal constitutional question.
 * All fields are validated according to Al Hujjah's own reception language.
 * The payload is preserved intact in the KnowledgeReception for lineage.
 *
 * `receivedAtMs` is assigned by the reception engine — it records when
 * Al Hujjah acknowledged this Sovereign request.
 *
 * Does not invoke the Investigation Engine.
 * Does not search any repository or provider.
 * Does not modify or re-interpret the payload's constitutional vocabulary.
 */
export function receiveSovereignKnowledgeRequest(
  payload: SovereignKnowledgeReceptionPayload,
): KnowledgeReception {
  const receivedAtMs = Date.now();
  const validationErrors = validateSovereignPayload(payload);
  const status: ReceptionStatus = validationErrors.length === 0 ? 'RECEIVED' : 'REJECTED';
  return {
    receptionId: nextReceptionId('sov', receivedAtMs),
    origin: 'SOVEREIGN' as KnowledgeReceptionOrigin,
    status,
    citizenRequest: null,
    sovereignRequest: payload,
    validationErrors,
    receivedAtMs,
  };
}
