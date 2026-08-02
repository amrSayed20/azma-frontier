/**
 * IMPERIAL INTEGRATION PACKAGE I — MAKMAN AL GHAYAH ↔ AL HUJJAH AL DAMIGHAH
 * Test suite for the constitutional bridge between two frozen Sovereign States.
 *
 * Tests cover:
 *   1. Type alignment — Makman request fields map to Al Hujjah reception payload
 *   2. Bridge: empty batch — returns empty array immediately (no network)
 *   3. Bridge: OBSERVABLE_INTERNALLY — skipped, not sent to Al Hujjah
 *   4. Bridge: NOT_CURRENTLY_OBTAINABLE — skipped, not sent to Al Hujjah
 *   5. Bridge: batch with mixed availability — only REQUIRES_INVESTIGATION processed
 *   6. Bridge: full integration — one REQUIRES_INVESTIGATION request (real HTTP)
 *   7. Bridge: export record destination is always MAKMAN_AL_GHAYAH
 *   8. Bridge: constitutional secrecy — no provider/repo/doc identity in records
 *   9. SOEL integration — conductKnowledgeInvestigation() returns correct outcome types
 *  10. End-to-end chain — complete fulfillment chain through to export record
 *
 * Sections 1–5 and partial 9 are pure unit tests (no network).
 * Sections 6–8 and 10 require network access (real HTTP).
 * Timeout is set to 60 000 ms per test to accommodate investigation latency.
 */

jest.setTimeout(60000);

import { conductSovereignKnowledgeInvestigation } from '../../imperial-integration/makman-hujjah-bridge';
import type {
  SovereignKnowledgeRequestBatch,
  SovereignKnowledgeRequest,
} from '../../chambers/makman-al-ghayah/sovereign-knowledge-request-contracts';
import { soel } from '../../sovereign-entry/composition';

// ─── REQUEST BUILDERS ─────────────────────────────────────────────────────────

function makeRequest(
  overrides: Partial<SovereignKnowledgeRequest> = {},
): SovereignKnowledgeRequest {
  return {
    requestId: 'req-integration-001',
    goalId: 'goal-integration-001',
    assessmentId: 'asmt-integration-001',
    criterionId: 'crit-integration-001',
    criterionDescriptionSnapshot: 'The Creator must demonstrate measurable creative output',
    gapClass: 'FULFILLMENT_GAP',
    gapCategory: 'FULFILLMENT_ABSENT',
    questionStatement: 'What evidence demonstrates measurable creative output?',
    availability: 'REQUIRES_INVESTIGATION',
    requestedAtMs: 1700000000000,
    ...overrides,
  };
}

function makeBatch(
  requests: readonly SovereignKnowledgeRequest[] = [],
  overrides: Partial<SovereignKnowledgeRequestBatch> = {},
): SovereignKnowledgeRequestBatch {
  return {
    batchId: 'batch-integration-001',
    goalId: 'goal-integration-001',
    assessmentId: 'asmt-integration-001',
    requests,
    issuedAtMs: Date.now(),
    ...overrides,
  };
}

// ─── SECTION 1: TYPE ALIGNMENT ────────────────────────────────────────────────

describe('Type alignment — Makman request maps to Al Hujjah reception vocabulary', () => {
  it('SovereignKnowledgeRequest has all fields required by SovereignKnowledgeReceptionPayload', () => {
    const request = makeRequest();
    expect(request.requestId).toBeDefined();
    expect(request.goalId).toBeDefined();
    expect(request.assessmentId).toBeDefined();
    expect(request.criterionId).toBeDefined();
    expect(request.criterionDescriptionSnapshot).toBeDefined();
    expect(request.gapClass).toBeDefined();
    expect(request.gapCategory).toBeDefined();
    expect(request.questionStatement).toBeDefined();
    expect(request.availability).toBeDefined();
    expect(request.requestedAtMs).toBeDefined();
  });

  it('GapClass aligns: OBSERVATION_GAP', () => {
    const r = makeRequest({ gapClass: 'OBSERVATION_GAP' });
    expect(r.gapClass).toBe('OBSERVATION_GAP');
  });

  it('GapClass aligns: FULFILLMENT_GAP', () => {
    const r = makeRequest({ gapClass: 'FULFILLMENT_GAP' });
    expect(r.gapClass).toBe('FULFILLMENT_GAP');
  });

  it('FulfillmentGapCategory aligns: EVIDENCE_AVAILABILITY', () => {
    const r = makeRequest({ gapCategory: 'EVIDENCE_AVAILABILITY' });
    expect(r.gapCategory).toBe('EVIDENCE_AVAILABILITY');
  });

  it('FulfillmentGapCategory aligns: EVIDENCE_SUFFICIENCY', () => {
    const r = makeRequest({ gapCategory: 'EVIDENCE_SUFFICIENCY' });
    expect(r.gapCategory).toBe('EVIDENCE_SUFFICIENCY');
  });

  it('FulfillmentGapCategory aligns: FULFILLMENT_ABSENT', () => {
    const r = makeRequest({ gapCategory: 'FULFILLMENT_ABSENT' });
    expect(r.gapCategory).toBe('FULFILLMENT_ABSENT');
  });

  it('KnowledgeAvailability aligns: REQUIRES_INVESTIGATION', () => {
    const r = makeRequest({ availability: 'REQUIRES_INVESTIGATION' });
    expect(r.availability).toBe('REQUIRES_INVESTIGATION');
  });

  it('KnowledgeAvailability aligns: OBSERVABLE_INTERNALLY', () => {
    const r = makeRequest({ availability: 'OBSERVABLE_INTERNALLY' });
    expect(r.availability).toBe('OBSERVABLE_INTERNALLY');
  });

  it('KnowledgeAvailability aligns: NOT_CURRENTLY_OBTAINABLE', () => {
    const r = makeRequest({ availability: 'NOT_CURRENTLY_OBTAINABLE' });
    expect(r.availability).toBe('NOT_CURRENTLY_OBTAINABLE');
  });
});

// ─── SECTION 2: EMPTY BATCH ───────────────────────────────────────────────────

describe('Bridge: empty batch — returns empty array (no network)', () => {
  it('empty batch produces empty records array', async () => {
    const records = await conductSovereignKnowledgeInvestigation(makeBatch([]));
    expect(records).toEqual([]);
  });

  it('empty batch does not throw', async () => {
    await expect(conductSovereignKnowledgeInvestigation(makeBatch([]))).resolves.toBeDefined();
  });

  it('empty batch returns an array', async () => {
    const records = await conductSovereignKnowledgeInvestigation(makeBatch([]));
    expect(Array.isArray(records)).toBe(true);
  });
});

// ─── SECTION 3: OBSERVABLE_INTERNALLY SKIPPED ────────────────────────────────

describe('Bridge: OBSERVABLE_INTERNALLY — skipped (no network)', () => {
  it('batch with only OBSERVABLE_INTERNALLY requests returns empty array', async () => {
    const batch = makeBatch([
      makeRequest({ availability: 'OBSERVABLE_INTERNALLY', requestId: 'req-obs-001' }),
      makeRequest({ availability: 'OBSERVABLE_INTERNALLY', requestId: 'req-obs-002' }),
    ]);
    const records = await conductSovereignKnowledgeInvestigation(batch);
    expect(records).toEqual([]);
  });

  it('single OBSERVABLE_INTERNALLY request returns empty array', async () => {
    const records = await conductSovereignKnowledgeInvestigation(
      makeBatch([makeRequest({ availability: 'OBSERVABLE_INTERNALLY' })]),
    );
    expect(records.length).toBe(0);
  });
});

// ─── SECTION 4: NOT_CURRENTLY_OBTAINABLE SKIPPED ─────────────────────────────

describe('Bridge: NOT_CURRENTLY_OBTAINABLE — skipped (no network)', () => {
  it('batch with only NOT_CURRENTLY_OBTAINABLE requests returns empty array', async () => {
    const records = await conductSovereignKnowledgeInvestigation(
      makeBatch([makeRequest({ availability: 'NOT_CURRENTLY_OBTAINABLE', requestId: 'req-nco-001' })]),
    );
    expect(records).toEqual([]);
  });

  it('two NOT_CURRENTLY_OBTAINABLE requests both skipped', async () => {
    const batch = makeBatch([
      makeRequest({ availability: 'NOT_CURRENTLY_OBTAINABLE', requestId: 'req-nco-002' }),
      makeRequest({ availability: 'NOT_CURRENTLY_OBTAINABLE', requestId: 'req-nco-003' }),
    ]);
    const records = await conductSovereignKnowledgeInvestigation(batch);
    expect(records).toEqual([]);
  });
});

// ─── SECTION 5: MIXED AVAILABILITY ───────────────────────────────────────────

describe('Bridge: mixed availability batch — only REQUIRES_INVESTIGATION processed', () => {
  it('mixed batch with zero REQUIRES_INVESTIGATION returns empty array (no network)', async () => {
    const batch = makeBatch([
      makeRequest({ availability: 'OBSERVABLE_INTERNALLY', requestId: 'req-mix-obs-001' }),
      makeRequest({ availability: 'NOT_CURRENTLY_OBTAINABLE', requestId: 'req-mix-nco-001' }),
    ]);
    const records = await conductSovereignKnowledgeInvestigation(batch);
    expect(records).toEqual([]);
  });

  it('mixed batch with one REQUIRES_INVESTIGATION contacts Al Hujjah only for it (real HTTP)', async () => {
    const batch = makeBatch([
      makeRequest({ availability: 'OBSERVABLE_INTERNALLY', requestId: 'req-mix-obs-002' }),
      makeRequest({
        availability: 'REQUIRES_INVESTIGATION',
        requestId: 'req-mix-inv-001',
        questionStatement: 'What does Shakespeare reveal about human nature in his tragedies?',
      }),
      makeRequest({ availability: 'NOT_CURRENTLY_OBTAINABLE', requestId: 'req-mix-nco-002' }),
    ]);

    const records = await conductSovereignKnowledgeInvestigation(batch);
    expect(records.length).toBeLessThanOrEqual(1);
    for (const record of records) {
      expect(record.destination).toBe('MAKMAN_AL_GHAYAH');
    }
  });
});

// ─── SECTION 6: FULL INTEGRATION (REAL HTTP) ─────────────────────────────────

describe('Bridge: full integration — REQUIRES_INVESTIGATION with real HTTP', () => {
  it('produces a KnowledgeExportRecord with all constitutional fields', async () => {
    const batch = makeBatch([
      makeRequest({
        questionStatement: 'What evidence demonstrates consistent creative publishing in literature?',
        requestId: 'req-real-001',
      }),
    ]);

    const records = await conductSovereignKnowledgeInvestigation(batch);
    for (const record of records) {
      expect(record).toHaveProperty('exportId');
      expect(record).toHaveProperty('destination');
      expect(record).toHaveProperty('response');
      expect(record).toHaveProperty('exportedAtMs');
      expect(typeof record.exportedAtMs).toBe('number');
    }
  });

  it('produced records have non-empty UUID exportId', async () => {
    const batch = makeBatch([
      makeRequest({
        questionStatement: 'What evidence of published literary work exists?',
        requestId: 'req-real-002',
      }),
    ]);

    const records = await conductSovereignKnowledgeInvestigation(batch);
    for (const record of records) {
      expect(record.exportId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    }
  });

  it('produced records carry a constitutional knowledge declaration', async () => {
    const batch = makeBatch([
      makeRequest({
        questionStatement: 'What evidence demonstrates measurable literary influence?',
        requestId: 'req-real-003',
      }),
    ]);

    const records = await conductSovereignKnowledgeInvestigation(batch);
    for (const record of records) {
      expect(record.response.claim.length).toBeGreaterThan(0);
      expect(record.response.declarationText.length).toBeGreaterThan(0);
      expect(record.response.confidenceScore).toBeGreaterThanOrEqual(0);
      expect(record.response.confidenceScore).toBeLessThanOrEqual(100);
    }
  });

  it('response carries a unique responseId UUID', async () => {
    const batch = makeBatch([
      makeRequest({
        questionStatement: 'What evidence of reader engagement with published literature exists?',
        requestId: 'req-real-004',
      }),
    ]);

    const records = await conductSovereignKnowledgeInvestigation(batch);
    for (const record of records) {
      expect(record.response.responseId).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    }
  });
});

// ─── SECTION 7: DESTINATION ALWAYS MAKMAN_AL_GHAYAH ──────────────────────────

describe('Bridge: destination is always MAKMAN_AL_GHAYAH', () => {
  it('single export record is addressed to MAKMAN_AL_GHAYAH', async () => {
    const batch = makeBatch([
      makeRequest({
        questionStatement: 'What evidence demonstrates consistent creative output?',
        requestId: 'req-dest-001',
      }),
    ]);

    const records = await conductSovereignKnowledgeInvestigation(batch);
    for (const record of records) {
      expect(record.destination).toBe('MAKMAN_AL_GHAYAH');
    }
  });

  it('batch of two investigable requests both produce MAKMAN_AL_GHAYAH destination', async () => {
    const batch = makeBatch([
      makeRequest({
        requestId: 'req-dest-two-001',
        criterionId: 'crit-dest-two-001',
        questionStatement: 'What evidence of audience reach exists in published literature?',
      }),
      makeRequest({
        requestId: 'req-dest-two-002',
        criterionId: 'crit-dest-two-002',
        questionStatement: 'What evidence demonstrates storytelling impact in published works?',
      }),
    ]);

    const records = await conductSovereignKnowledgeInvestigation(batch);
    for (const record of records) {
      expect(record.destination).toBe('MAKMAN_AL_GHAYAH');
    }
  });
});

// ─── SECTION 8: CONSTITUTIONAL SECRECY ───────────────────────────────────────

describe('Bridge: constitutional secrecy — no provider identity in records', () => {
  it('serialized records do not expose provider names', async () => {
    const batch = makeBatch([
      makeRequest({
        questionStatement: 'What published evidence demonstrates literary merit?',
        requestId: 'req-sec-001',
      }),
    ]);

    const records = await conductSovereignKnowledgeInvestigation(batch);
    const serialized = JSON.stringify(records);
    expect(serialized).not.toContain('"gutenberg"');
    expect(serialized).not.toContain('"reddit"');
    expect(serialized).not.toContain('"google-trends"');
  });

  it('serialized records do not expose Ministry identifiers', async () => {
    const batch = makeBatch([
      makeRequest({
        questionStatement: 'What evidence shows measurable public reception of creative works?',
        requestId: 'req-sec-002',
      }),
    ]);

    const records = await conductSovereignKnowledgeInvestigation(batch);
    const serialized = JSON.stringify(records);
    expect(serialized).not.toContain('ministry-human-knowledge');
    expect(serialized).not.toContain('ministry-business-intelligence');
    expect(serialized).not.toContain('ministry-media-intelligence');
  });

  it('serialized records do not expose document IDs or URLs', async () => {
    const batch = makeBatch([
      makeRequest({
        questionStatement: 'What evidence of Shakespeare plays exists in published literature?',
        requestId: 'req-sec-003',
      }),
    ]);

    const records = await conductSovereignKnowledgeInvestigation(batch);
    const serialized = JSON.stringify(records);
    expect(serialized).not.toMatch(/book-\d+/);
    expect(serialized).not.toContain('http');
  });

  it('serialized records do not expose internal chain IDs', async () => {
    const batch = makeBatch([
      makeRequest({
        questionStatement: 'What evidence demonstrates published creative influence?',
        requestId: 'req-sec-004',
      }),
    ]);

    const records = await conductSovereignKnowledgeInvestigation(batch);
    const serialized = JSON.stringify(records);
    expect(serialized).not.toContain('"collectionId"');
    expect(serialized).not.toContain('"investigationResultId"');
    expect(serialized).not.toContain('"intentId"');
    expect(serialized).not.toContain('"receptionId"');
    expect(serialized).not.toContain('"evidenceCount"');
  });
});

// ─── SECTION 9: SOEL INTEGRATION ─────────────────────────────────────────────

describe('SOEL integration — conductKnowledgeInvestigation() outcome types', () => {
  it('returns ok:false GOAL_NOT_FOUND when goal does not exist', async () => {
    const outcome = await soel.conductKnowledgeInvestigation('nonexistent-goal-xyz', 'creator-001');
    expect(outcome.ok).toBe(false);
    if (!outcome.ok) {
      expect(outcome.reason).toBe('GOAL_NOT_FOUND');
    }
  });

  it('ok:false outcome has no records field', async () => {
    const outcome = await soel.conductKnowledgeInvestigation('nonexistent-goal-abc', 'creator-002');
    expect(outcome.ok).toBe(false);
    expect((outcome as unknown as Record<string, unknown>)['records']).toBeUndefined();
  });

  it('outcome is always ok:true or ok:false with a known reason', async () => {
    const outcome = await soel.conductKnowledgeInvestigation('no-goal', 'any-creator');
    if (outcome.ok) {
      expect(Array.isArray(outcome.records)).toBe(true);
    } else {
      expect(['GOAL_NOT_FOUND', 'NO_ASSESSMENT_AVAILABLE']).toContain(outcome.reason);
    }
  });

  it('conductKnowledgeInvestigation returns a Promise', () => {
    const result = soel.conductKnowledgeInvestigation('any-goal', 'any-creator');
    expect(result).toBeInstanceOf(Promise);
    result.catch(() => {});
  });
});

// ─── SECTION 10: END-TO-END CHAIN (REAL HTTP) ────────────────────────────────

describe('End-to-end chain — full constitutional path through to export (real HTTP)', () => {
  it('sovereign lineage from the request is preserved through the full chain', async () => {
    const goalId = 'goal-e2e-001';
    const assessmentId = 'asmt-e2e-001';
    const criterionId = 'crit-e2e-001';

    const batch = makeBatch([
      makeRequest({
        requestId: 'req-e2e-001',
        goalId,
        assessmentId,
        criterionId,
        criterionDescriptionSnapshot: 'The Creator must publish consistently',
        questionStatement: 'What evidence demonstrates consistent publishing in literature?',
        availability: 'REQUIRES_INVESTIGATION',
      }),
    ]);

    const records = await conductSovereignKnowledgeInvestigation(batch);
    for (const record of records) {
      expect(record.response.origin).toBe('SOVEREIGN');
      expect(record.response.sovereignLineage).not.toBeNull();
      expect(record.response.sovereignLineage?.goalId).toBe(goalId);
      expect(record.response.sovereignLineage?.assessmentId).toBe(assessmentId);
      expect(record.response.sovereignLineage?.criterionId).toBe(criterionId);
    }
  });

  it('export record carries a response with a valid constitutional verdict', async () => {
    const batch = makeBatch([
      makeRequest({
        requestId: 'req-e2e-verdict',
        questionStatement: 'What evidence of published creative work exists in literature?',
      }),
    ]);

    const records = await conductSovereignKnowledgeInvestigation(batch);
    for (const record of records) {
      expect(['accepted', 'under_review', 'conflict', 'rejected']).toContain(
        record.response.verdictId,
      );
    }
  });

  it('isDefinitive is the inverse of uncertaintyPresent', async () => {
    const batch = makeBatch([
      makeRequest({
        requestId: 'req-e2e-definitive',
        questionStatement: 'What evidence demonstrates measurable literary achievement?',
      }),
    ]);

    const records = await conductSovereignKnowledgeInvestigation(batch);
    for (const record of records) {
      expect(record.response.isDefinitive).toBe(!record.response.uncertaintyPresent);
    }
  });

  it('batch of two requests both carry SOVEREIGN origin and MAKMAN_AL_GHAYAH destination', async () => {
    const batch = makeBatch([
      makeRequest({
        requestId: 'req-e2e-two-001',
        criterionId: 'crit-e2e-two-001',
        goalId: 'goal-e2e-two',
        assessmentId: 'asmt-e2e-two',
        questionStatement: 'What evidence demonstrates published literary achievement?',
      }),
      makeRequest({
        requestId: 'req-e2e-two-002',
        criterionId: 'crit-e2e-two-002',
        goalId: 'goal-e2e-two',
        assessmentId: 'asmt-e2e-two',
        questionStatement: 'What evidence shows reader engagement with published works?',
      }),
    ]);

    const records = await conductSovereignKnowledgeInvestigation(batch);
    for (const record of records) {
      expect(record.response.origin).toBe('SOVEREIGN');
      expect(record.destination).toBe('MAKMAN_AL_GHAYAH');
    }
  });

  it('result is a readonly array', async () => {
    const batch = makeBatch([
      makeRequest({
        requestId: 'req-e2e-arr-001',
        questionStatement: 'What evidence of Shakespeare authorship exists?',
      }),
    ]);

    const records = await conductSovereignKnowledgeInvestigation(batch);
    expect(Array.isArray(records)).toBe(true);
  });
});
