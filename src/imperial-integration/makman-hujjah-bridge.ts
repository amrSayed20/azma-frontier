/**
 * AZMA OS — Imperial Integration Layer
 * MAKMAN AL GHAYAH ↔ AL HUJJAH AL DAMIGHAH BRIDGE
 * Imperial Integration Package I
 *
 * The constitutional bridge between two frozen Sovereign States.
 *
 * This module belongs to neither Makman Al-Ghayah nor Al Hujjah Al-Damighah.
 * It belongs to the Imperial Integration Layer — the only authority permitted
 * to orchestrate communication between frozen chambers.
 *
 * ─── WHAT THIS BRIDGE DOES ──────────────────────────────────────────────────
 *
 *   Receives a SovereignKnowledgeRequestBatch from Makman Al-Ghayah.
 *   For each request requiring investigation:
 *     1. Translates the request into Al Hujjah's reception vocabulary
 *     2. Submits it through Al Hujjah's constitutional entry boundary
 *     3. Runs the full certified chain:
 *          Reception → Understanding → Investigation → Evidence
 *            → Knowledge → Response → Export (destination: MAKMAN_AL_GHAYAH)
 *     4. Collects the resulting KnowledgeExportRecord
 *   Returns all successfully produced export records.
 *
 * ─── WHAT THIS BRIDGE DOES NOT DO ───────────────────────────────────────────
 *
 *   Does not re-investigate failed requests (each is best-effort).
 *   Does not modify any chamber's internal contracts.
 *   Does not redesign any constitutional layer.
 *   Does not manufacture knowledge where investigation fails.
 *   Does not expose any internal chain metadata to the caller.
 *
 * ─── AVAILABILITY FILTER ────────────────────────────────────────────────────
 *
 *   Only requests with availability=REQUIRES_INVESTIGATION are submitted.
 *   OBSERVABLE_INTERNALLY: the Empire already has the answer via platform
 *     signals; Al Hujjah is not the right authority. Skipped.
 *   NOT_CURRENTLY_OBTAINABLE: no mechanism can currently produce this
 *     knowledge. The Empire is honest — it does not manufacture investigation
 *     where none is constitutionally possible. Skipped.
 *
 * ─── RESILIENCE ──────────────────────────────────────────────────────────────
 *
 *   Requests run in parallel via Promise.allSettled. One request's failure
 *   never aborts the batch. The Empire delivers whatever knowledge it can
 *   obtain and reports the outcome honestly.
 *
 * ─── TYPE TRANSLATION ────────────────────────────────────────────────────────
 *
 *   Makman's SovereignKnowledgeRequest and Al Hujjah's
 *   SovereignKnowledgeReceptionPayload carry identical fields with identical
 *   string literal values. The types are declared independently by constitutional
 *   design (chambers do not import from each other). Structural assignment
 *   works without type assertion — TypeScript confirms the alignment.
 *
 *   This file is the only place in the Empire where Makman's vocabulary
 *   and Al Hujjah's vocabulary appear in the same scope. The bridge
 *   carries that mapping responsibility so neither chamber must.
 *
 * ─── REPOSITORY AUDIT ────────────────────────────────────────────────────────
 *
 *   Certified contracts reused, not duplicated:
 *     SovereignKnowledgeRequestBatch  — Makman's constitutional batch contract
 *     SovereignKnowledgeReceptionPayload — Al Hujjah's reception form
 *     receiveSovereignKnowledgeRequest — Al Hujjah's entry boundary
 *     understandKnowledgeReception    — Al Hujjah Understanding stage
 *     conductInvestigation            — Al Hujjah Investigation stage
 *     collectEvidence                 — Al Hujjah Evidence stage
 *     declareKnowledge                — Al Hujjah Knowledge stage
 *     formulateResponse               — Al Hujjah Response stage
 *     exportKnowledgeResponse         — Al Hujjah Export stage (MAKMAN_AL_GHAYAH)
 *     KnowledgeExportRecord           — the sealed delivery contract
 *
 *   Pre-constitutional bridge artifacts (EvidenceExporter, ChamberExportPayload,
 *   QiyamahPayloadTransformer, ExportedKnowledge, DispatchPayload) are all
 *   confirmed dead code. None are reused here. See Package XIX audit.
 */

import type { SovereignKnowledgeRequestBatch, SovereignKnowledgeRequest } from '../chambers/makman-al-ghayah/sovereign-knowledge-request-contracts';
import type { SovereignKnowledgeReceptionPayload } from '../chambers/hujjah-al-damighah/reception-contracts';
import { receiveSovereignKnowledgeRequest } from '../chambers/hujjah-al-damighah/reception-engine';
import { understandKnowledgeReception } from '../chambers/hujjah-al-damighah/understanding-engine';
import { conductInvestigation } from '../chambers/hujjah-al-damighah/investigation-engine';
import { collectEvidence } from '../chambers/hujjah-al-damighah/evidence-layer';
import { declareKnowledge } from '../chambers/hujjah-al-damighah/knowledge-layer';
import { formulateResponse } from '../chambers/hujjah-al-damighah/knowledge-response-layer';
import { exportKnowledgeResponse } from '../chambers/hujjah-al-damighah/knowledge-export-layer';
import type { KnowledgeExportRecord } from '../chambers/hujjah-al-damighah/knowledge-export-contracts';

// ─── TYPE TRANSLATION ─────────────────────────────────────────────────────────

/**
 * Translate Makman's request vocabulary into Al Hujjah's reception vocabulary.
 *
 * Both types carry structurally identical fields with identical string literal
 * values. The chambers declare them independently — the bridge is the only
 * place where both appear together.
 *
 * No type assertion is needed — TypeScript confirms structural compatibility.
 */
function buildReceptionPayload(
  request: SovereignKnowledgeRequest,
): SovereignKnowledgeReceptionPayload {
  return {
    requestId: request.requestId,
    goalId: request.goalId,
    assessmentId: request.assessmentId,
    criterionId: request.criterionId,
    criterionDescriptionSnapshot: request.criterionDescriptionSnapshot,
    gapClass: request.gapClass,
    gapCategory: request.gapCategory,
    questionStatement: request.questionStatement,
    availability: request.availability,
    requestedAtMs: request.requestedAtMs,
  };
}

// ─── SINGLE REQUEST CHAIN ─────────────────────────────────────────────────────

/**
 * Run one Sovereign Knowledge Request through the complete Al Hujjah chain
 * and return the sealed KnowledgeExportRecord addressed to Makman Al-Ghayah.
 *
 * Throws on any constitutional failure so the batch's Promise.allSettled
 * can isolate the failure to this request without aborting others.
 */
async function investigateOneRequest(
  request: SovereignKnowledgeRequest,
): Promise<KnowledgeExportRecord> {
  const payload = buildReceptionPayload(request);

  // Stage 1: Reception
  const reception = receiveSovereignKnowledgeRequest(payload);
  if (reception.status !== 'RECEIVED') {
    throw new Error(
      `[MakmanHujjahBridge] Reception rejected for request ${request.requestId}: ${reception.validationErrors.join(', ')}`,
    );
  }

  // Stage 2: Understanding
  const understanding = understandKnowledgeReception(reception);
  if (!understanding.ok) {
    throw new Error(
      `[MakmanHujjahBridge] Understanding failed for request ${request.requestId}`,
    );
  }

  // Stage 3: Investigation (async — real HTTP providers)
  const investigation = await conductInvestigation(understanding.intent);
  if (!investigation.ok) {
    throw new Error(
      `[MakmanHujjahBridge] Investigation failed for request ${request.requestId}: ${investigation.reason}`,
    );
  }

  // Stage 4: Evidence
  const evidenceOutcome = collectEvidence(investigation.result);
  if (!evidenceOutcome.ok) {
    throw new Error(
      `[MakmanHujjahBridge] Evidence collection failed for request ${request.requestId}: ${evidenceOutcome.reason}`,
    );
  }

  // Stage 5: Knowledge (always succeeds — honest declaration from evidence)
  const declaration = declareKnowledge(evidenceOutcome.collection);

  // Stage 6: Response (always succeeds — pure mapping from declaration)
  const response = formulateResponse(declaration);

  // Stage 7: Export (always succeeds — sealed constitutional receipt)
  return exportKnowledgeResponse(response, 'MAKMAN_AL_GHAYAH');
}

// ─── BRIDGE ENTRY POINT ───────────────────────────────────────────────────────

/**
 * Conduct sovereign knowledge investigation for a complete batch of requests
 * from Makman Al-Ghayah, returning the sealed export records for each
 * successfully investigated request.
 *
 * Only requests with `availability === 'REQUIRES_INVESTIGATION'` are submitted
 * to Al Hujjah. Other availability values indicate the knowledge either lives
 * inside platform signals (OBSERVABLE_INTERNALLY) or cannot currently be
 * obtained (NOT_CURRENTLY_OBTAINABLE) — neither case belongs to Al Hujjah.
 *
 * Requests that fail at any stage are silently omitted from the result.
 * The Empire reports what it could learn, not what it could not.
 * The caller may inspect `records.length` vs the original batch size to
 * determine coverage.
 *
 * Returns an empty array when the batch is empty, contains no investigable
 * requests, or when all investigations fail.
 */
export async function conductSovereignKnowledgeInvestigation(
  batch: SovereignKnowledgeRequestBatch,
): Promise<readonly KnowledgeExportRecord[]> {
  const investigable = batch.requests.filter(
    (r) => r.availability === 'REQUIRES_INVESTIGATION',
  );

  if (investigable.length === 0) return [];

  const settled = await Promise.allSettled(
    investigable.map((request) => investigateOneRequest(request)),
  );

  return settled
    .filter(
      (result): result is PromiseFulfilledResult<KnowledgeExportRecord> =>
        result.status === 'fulfilled',
    )
    .map((result) => result.value);
}
