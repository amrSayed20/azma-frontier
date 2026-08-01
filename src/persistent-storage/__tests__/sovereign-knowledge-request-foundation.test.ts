/**
 * SOVEREIGN KNOWLEDGE REQUEST FOUNDATION
 * Constitutional Foundation Package IX
 *
 * Proves that Makman Al-Ghayah can formally issue typed Knowledge Requests
 * to Al Hujjah Al-Damighah; that every active KnowledgeRequirement becomes
 * exactly one SovereignKnowledgeRequest; that all gap-layer vocabulary is
 * carried forward verbatim; that requests carry a unique identity; that an
 * empty batch is produced when there are no active gaps; and that no request
 * contains answers, conclusions, recommendations, or AI reasoning.
 *
 * Six sections:
 *  1. One requirement → one request (one-to-one mapping)
 *  2. All vocabulary fields are inherited verbatim from the KnowledgeRequirement
 *  3. Every request carries a requestId and requestedAtMs
 *  4. Batch metadata (batchId, goalId, assessmentId, issuedAtMs)
 *  5. Empty batch when no active gaps exist
 *  6. Multi-requirement batch with mixed gap categories
 */

import { deriveGapReport } from '../../chambers/makman-al-ghayah/fulfillment-gap-engine';
import { deriveKnowledgeRequirements } from '../../chambers/makman-al-ghayah/gap-investigation-engine';
import { buildKnowledgeRequests } from '../../chambers/makman-al-ghayah/sovereign-knowledge-request-engine';
import type { GoalFulfillmentAssessment, CriterionAssessment } from '../../chambers/makman-al-ghayah/fulfillment-assessment-contracts';

// ─────────────────────────────────────────────────────────────────────────────
// Test helpers
// ─────────────────────────────────────────────────────────────────────────────

function makeCa(
  overrides: Partial<CriterionAssessment> & { evidenceVerdict: CriterionAssessment['evidenceVerdict'] },
): CriterionAssessment {
  return {
    criterionId: 'c-1',
    criterionDescriptionSnapshot: 'Generate 100 qualified leads.',
    observationCount: 0,
    authorizedCount: 0,
    deniedCount: 0,
    assessedAtMs: 10_000,
    ...overrides,
  };
}

function makeAssessment(criterionAssessments: readonly CriterionAssessment[]): GoalFulfillmentAssessment {
  return {
    assessmentId: 'fa-test',
    goalId: 'goal-1',
    assessedAtMs: 10_000,
    overallVerdict: criterionAssessments.length === 0
      ? 'ASSESSMENT_NOT_POSSIBLE'
      : criterionAssessments[0].evidenceVerdict,
    criterionAssessments,
  };
}

function buildRequestsForVerdict(verdict: CriterionAssessment['evidenceVerdict'], criterionId = 'c-1') {
  const obs = verdict === 'INSUFFICIENT_EVIDENCE' ? 3 : 0;
  const ca = makeCa({ evidenceVerdict: verdict, criterionId, observationCount: obs });
  const gapReport = deriveGapReport(makeAssessment([ca]));
  const reqReport = deriveKnowledgeRequirements(gapReport);
  return buildKnowledgeRequests(reqReport);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. One requirement → one request
// ─────────────────────────────────────────────────────────────────────────────

describe('Package IX — one-to-one mapping: KnowledgeRequirement → SovereignKnowledgeRequest', () => {
  it('EVIDENCE_AVAILABILITY requirement produces exactly one request', () => {
    const batch = buildRequestsForVerdict('ASSESSMENT_NOT_POSSIBLE');
    expect(batch.requests).toHaveLength(1);
  });

  it('EVIDENCE_SUFFICIENCY requirement produces exactly one request', () => {
    const batch = buildRequestsForVerdict('INSUFFICIENT_EVIDENCE');
    expect(batch.requests).toHaveLength(1);
  });

  it('FULFILLMENT_ABSENT requirement produces exactly one request', () => {
    const batch = buildRequestsForVerdict('SUPPORTS_NON_FULFILLMENT');
    expect(batch.requests).toHaveLength(1);
  });

  it('SUPPORTS_FULFILLMENT (no gap) produces zero requests', () => {
    const batch = buildRequestsForVerdict('SUPPORTS_FULFILLMENT');
    expect(batch.requests).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Vocabulary fields inherited verbatim from KnowledgeRequirement
// ─────────────────────────────────────────────────────────────────────────────

describe('Package IX — all gap-layer fields are inherited verbatim in the request', () => {
  it('questionStatement is carried forward from the requirement', () => {
    const batch = buildRequestsForVerdict('ASSESSMENT_NOT_POSSIBLE');
    expect(batch.requests[0].questionStatement.length).toBeGreaterThan(0);
  });

  it('criterionDescriptionSnapshot is inherited verbatim', () => {
    const desc = 'Achieve 1 million podcast downloads.';
    const ca = makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE', criterionDescriptionSnapshot: desc });
    const gapReport = deriveGapReport(makeAssessment([ca]));
    const reqReport = deriveKnowledgeRequirements(gapReport);
    const batch = buildKnowledgeRequests(reqReport);
    expect(batch.requests[0].criterionDescriptionSnapshot).toBe(desc);
  });

  it('gapClass is inherited from the requirement', () => {
    const batch = buildRequestsForVerdict('ASSESSMENT_NOT_POSSIBLE');
    expect(batch.requests[0].gapClass).toBe('OBSERVATION_GAP');
  });

  it('gapCategory is inherited from the requirement', () => {
    const batch = buildRequestsForVerdict('ASSESSMENT_NOT_POSSIBLE');
    expect(batch.requests[0].gapCategory).toBe('EVIDENCE_AVAILABILITY');
  });

  it('availability is inherited from the requirement', () => {
    const batchInternal = buildRequestsForVerdict('ASSESSMENT_NOT_POSSIBLE');
    expect(batchInternal.requests[0].availability).toBe('OBSERVABLE_INTERNALLY');

    const batchExternal = buildRequestsForVerdict('SUPPORTS_NON_FULFILLMENT');
    expect(batchExternal.requests[0].availability).toBe('REQUIRES_INVESTIGATION');
  });

  it('goalId is inherited from the requirement', () => {
    const ca = makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' });
    const assessment: GoalFulfillmentAssessment = {
      assessmentId: 'fa-xyz',
      goalId: 'goal-abc',
      assessedAtMs: 5_000,
      overallVerdict: 'ASSESSMENT_NOT_POSSIBLE',
      criterionAssessments: [ca],
    };
    const gapReport = deriveGapReport(assessment);
    const reqReport = deriveKnowledgeRequirements(gapReport);
    const batch = buildKnowledgeRequests(reqReport);
    expect(batch.requests[0].goalId).toBe('goal-abc');
  });

  it('assessmentId is inherited from the requirement', () => {
    const ca = makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' });
    const assessment: GoalFulfillmentAssessment = {
      assessmentId: 'fa-xyz',
      goalId: 'goal-abc',
      assessedAtMs: 5_000,
      overallVerdict: 'ASSESSMENT_NOT_POSSIBLE',
      criterionAssessments: [ca],
    };
    const gapReport = deriveGapReport(assessment);
    const reqReport = deriveKnowledgeRequirements(gapReport);
    const batch = buildKnowledgeRequests(reqReport);
    expect(batch.requests[0].assessmentId).toBe('fa-xyz');
  });

  it('criterionId is inherited from the requirement', () => {
    const ca = makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE', criterionId: 'crit-77' });
    const gapReport = deriveGapReport(makeAssessment([ca]));
    const reqReport = deriveKnowledgeRequirements(gapReport);
    const batch = buildKnowledgeRequests(reqReport);
    expect(batch.requests[0].criterionId).toBe('crit-77');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. Every request carries a requestId and requestedAtMs
// ─────────────────────────────────────────────────────────────────────────────

describe('Package IX — request identity: requestId and requestedAtMs', () => {
  it('each request has a non-empty requestId string', () => {
    const batch = buildRequestsForVerdict('ASSESSMENT_NOT_POSSIBLE');
    expect(batch.requests[0].requestId.length).toBeGreaterThan(0);
  });

  it('each request has a positive requestedAtMs timestamp', () => {
    const batch = buildRequestsForVerdict('ASSESSMENT_NOT_POSSIBLE');
    expect(batch.requests[0].requestedAtMs).toBeGreaterThan(0);
  });

  it('requestId contains the criterionId so it is distinguishable per criterion', () => {
    const batch = buildRequestsForVerdict('ASSESSMENT_NOT_POSSIBLE', 'crit-special');
    expect(batch.requests[0].requestId).toContain('crit-special');
  });

  it('different criteria in the same batch have different requestIds', () => {
    const cas = [
      makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE', criterionId: 'c-1' }),
      makeCa({ evidenceVerdict: 'INSUFFICIENT_EVIDENCE',   criterionId: 'c-2', observationCount: 2 }),
    ];
    const gapReport = deriveGapReport(makeAssessment(cas));
    const reqReport = deriveKnowledgeRequirements(gapReport);
    const batch = buildKnowledgeRequests(reqReport);
    const [r1, r2] = batch.requests;
    expect(r1.requestId).not.toBe(r2.requestId);
  });

  it('no request carries an answer, result, conclusion, or reasoning field', () => {
    const batch = buildRequestsForVerdict('ASSESSMENT_NOT_POSSIBLE');
    const req = batch.requests[0];
    expect(req).not.toHaveProperty('answer');
    expect(req).not.toHaveProperty('result');
    expect(req).not.toHaveProperty('conclusion');
    expect(req).not.toHaveProperty('reasoning');
    expect(req).not.toHaveProperty('investigation');
    expect(req).not.toHaveProperty('aiOutput');
    expect(req).not.toHaveProperty('recommendation');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. Batch metadata
// ─────────────────────────────────────────────────────────────────────────────

describe('Package IX — batch metadata: batchId, goalId, assessmentId, issuedAtMs', () => {
  it('batch has a non-empty batchId', () => {
    const batch = buildRequestsForVerdict('ASSESSMENT_NOT_POSSIBLE');
    expect(batch.batchId.length).toBeGreaterThan(0);
  });

  it('batch goalId matches the source goal', () => {
    const ca = makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' });
    const assessment: GoalFulfillmentAssessment = {
      assessmentId: 'fa-m',
      goalId: 'goal-meta',
      assessedAtMs: 1_000,
      overallVerdict: 'ASSESSMENT_NOT_POSSIBLE',
      criterionAssessments: [ca],
    };
    const gapReport = deriveGapReport(assessment);
    const reqReport = deriveKnowledgeRequirements(gapReport);
    const batch = buildKnowledgeRequests(reqReport);
    expect(batch.goalId).toBe('goal-meta');
  });

  it('batch assessmentId matches the source assessment', () => {
    const ca = makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' });
    const assessment: GoalFulfillmentAssessment = {
      assessmentId: 'fa-meta',
      goalId: 'goal-meta',
      assessedAtMs: 1_000,
      overallVerdict: 'ASSESSMENT_NOT_POSSIBLE',
      criterionAssessments: [ca],
    };
    const gapReport = deriveGapReport(assessment);
    const reqReport = deriveKnowledgeRequirements(gapReport);
    const batch = buildKnowledgeRequests(reqReport);
    expect(batch.assessmentId).toBe('fa-meta');
  });

  it('batch issuedAtMs is a positive integer', () => {
    const batch = buildRequestsForVerdict('ASSESSMENT_NOT_POSSIBLE');
    expect(batch.issuedAtMs).toBeGreaterThan(0);
  });

  it('batchId contains the goalId for distinguishability', () => {
    const ca = makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' });
    const assessment: GoalFulfillmentAssessment = {
      assessmentId: 'fa-b',
      goalId: 'goal-batch-check',
      assessedAtMs: 1_000,
      overallVerdict: 'ASSESSMENT_NOT_POSSIBLE',
      criterionAssessments: [ca],
    };
    const gapReport = deriveGapReport(assessment);
    const reqReport = deriveKnowledgeRequirements(gapReport);
    const batch = buildKnowledgeRequests(reqReport);
    expect(batch.batchId).toContain('goal-batch-check');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Empty batch when no active gaps
// ─────────────────────────────────────────────────────────────────────────────

describe('Package IX — empty batch when no active gaps exist', () => {
  it('all SUPPORTS_FULFILLMENT criteria produce an empty requests array', () => {
    const cas = [
      makeCa({ evidenceVerdict: 'SUPPORTS_FULFILLMENT', criterionId: 'c-1', observationCount: 5 }),
      makeCa({ evidenceVerdict: 'SUPPORTS_FULFILLMENT', criterionId: 'c-2', observationCount: 8 }),
    ];
    const gapReport = deriveGapReport(makeAssessment(cas));
    const reqReport = deriveKnowledgeRequirements(gapReport);
    const batch = buildKnowledgeRequests(reqReport);
    expect(batch.requests).toHaveLength(0);
  });

  it('empty criteria assessment produces an empty batch', () => {
    const gapReport = deriveGapReport(makeAssessment([]));
    const reqReport = deriveKnowledgeRequirements(gapReport);
    const batch = buildKnowledgeRequests(reqReport);
    expect(batch.requests).toHaveLength(0);
    expect(batch.batchId.length).toBeGreaterThan(0);
    expect(batch.issuedAtMs).toBeGreaterThan(0);
  });

  it('empty batch still carries goalId and assessmentId', () => {
    const assessment: GoalFulfillmentAssessment = {
      assessmentId: 'fa-empty',
      goalId: 'goal-empty',
      assessedAtMs: 1_000,
      overallVerdict: 'ASSESSMENT_NOT_POSSIBLE',
      criterionAssessments: [],
    };
    const gapReport = deriveGapReport(assessment);
    const reqReport = deriveKnowledgeRequirements(gapReport);
    const batch = buildKnowledgeRequests(reqReport);
    expect(batch.goalId).toBe('goal-empty');
    expect(batch.assessmentId).toBe('fa-empty');
    expect(batch.requests).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Full multi-criterion batch with mixed gap categories
// ─────────────────────────────────────────────────────────────────────────────

describe('Package IX — full mixed batch: correct requests, exclusions, and request structure', () => {
  it('three active gaps produce three requests; one SUPPORTS_FULFILLMENT is excluded', () => {
    const cas = [
      makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE',  criterionId: 'c-1' }),
      makeCa({ evidenceVerdict: 'INSUFFICIENT_EVIDENCE',    criterionId: 'c-2', observationCount: 3 }),
      makeCa({ evidenceVerdict: 'SUPPORTS_NON_FULFILLMENT', criterionId: 'c-3', observationCount: 2 }),
      makeCa({ evidenceVerdict: 'SUPPORTS_FULFILLMENT',     criterionId: 'c-4', observationCount: 10 }),
    ];
    const gapReport = deriveGapReport(makeAssessment(cas));
    const reqReport = deriveKnowledgeRequirements(gapReport);
    const batch = buildKnowledgeRequests(reqReport);

    expect(batch.requests).toHaveLength(3);
    const ids = batch.requests.map((r) => r.criterionId);
    expect(ids).toContain('c-1');
    expect(ids).toContain('c-2');
    expect(ids).toContain('c-3');
    expect(ids).not.toContain('c-4');
  });

  it('availabilities in the mixed batch are correctly assigned per gap category', () => {
    const cas = [
      makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE',  criterionId: 'c-1' }),
      makeCa({ evidenceVerdict: 'INSUFFICIENT_EVIDENCE',    criterionId: 'c-2', observationCount: 3 }),
      makeCa({ evidenceVerdict: 'SUPPORTS_NON_FULFILLMENT', criterionId: 'c-3', observationCount: 1 }),
    ];
    const gapReport = deriveGapReport(makeAssessment(cas));
    const reqReport = deriveKnowledgeRequirements(gapReport);
    const batch = buildKnowledgeRequests(reqReport);

    const byId = Object.fromEntries(batch.requests.map((r) => [r.criterionId, r]));
    expect(byId['c-1'].availability).toBe('OBSERVABLE_INTERNALLY');
    expect(byId['c-2'].availability).toBe('REQUIRES_INVESTIGATION');
    expect(byId['c-3'].availability).toBe('REQUIRES_INVESTIGATION');
  });

  it('all requests in a batch share the same requestedAtMs', () => {
    const cas = [
      makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE', criterionId: 'c-1' }),
      makeCa({ evidenceVerdict: 'INSUFFICIENT_EVIDENCE',   criterionId: 'c-2', observationCount: 2 }),
    ];
    const gapReport = deriveGapReport(makeAssessment(cas));
    const reqReport = deriveKnowledgeRequirements(gapReport);
    const batch = buildKnowledgeRequests(reqReport);

    const timestamps = new Set(batch.requests.map((r) => r.requestedAtMs));
    expect(timestamps.size).toBe(1);
    expect([...timestamps][0]).toBe(batch.issuedAtMs);
  });

  it('no request in the batch carries diagnostic, recommendation, or AI fields', () => {
    const cas = [
      makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE',  criterionId: 'c-1' }),
      makeCa({ evidenceVerdict: 'SUPPORTS_NON_FULFILLMENT', criterionId: 'c-2', observationCount: 1 }),
    ];
    const gapReport = deriveGapReport(makeAssessment(cas));
    const reqReport = deriveKnowledgeRequirements(gapReport);
    const batch = buildKnowledgeRequests(reqReport);

    for (const req of batch.requests) {
      expect(req).not.toHaveProperty('answer');
      expect(req).not.toHaveProperty('investigation');
      expect(req).not.toHaveProperty('recommendation');
      expect(req).not.toHaveProperty('cause');
      expect(req).not.toHaveProperty('diagnosis');
      expect(req).not.toHaveProperty('aiOutput');
      expect(req).not.toHaveProperty('conclusion');
    }
  });
});
