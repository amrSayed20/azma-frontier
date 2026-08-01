/**
 * SOVEREIGN KNOWLEDGE EXPORT FOUNDATION — Constitutional Foundation Package XIX
 * Test suite for exportKnowledgeResponse() and the KnowledgeExportRecord contract.
 *
 * Tests cover:
 *   1. Export record structure — all required fields present
 *   2. exportId uniqueness — each export event produces a distinct ID
 *   3. Destination routing — all four constitutional destinations produce valid records
 *   4. Response preservation — the response in the record is unchanged
 *   5. Declaration identity flows through export
 *   6. Confidence and verdict flow through export
 *   7. Uncertainty invariants flow through export
 *   8. Citizen path — sovereignLineage is null through export
 *   9. Sovereign path — sovereignLineage is preserved through export
 *  10. Constitutional secrecy — no provider/repository/document identity in export
 *  11. exportedAtMs — valid timestamp produced at export time
 *  12. Multiple exports from same response — independent records with different IDs
 *  13. Full chain integration — Reception → Response → Export (real HTTP)
 *
 * Sections 1–12 are pure unit tests (no network).
 * Section 13 requires network access (real HTTP to gutendex.com and Google Trends).
 * Timeout is set to 30 000 ms per test to accommodate real HTTP latency.
 */

jest.setTimeout(30000);

import { exportKnowledgeResponse } from '../../chambers/hujjah-al-damighah/knowledge-export-layer';
import type { KnowledgeExportRecord } from '../../chambers/hujjah-al-damighah/knowledge-export-contracts';
import type { SovereignKnowledgeResponse } from '../../chambers/hujjah-al-damighah/knowledge-response-contracts';
import type { SovereignRequestLineage } from '../../chambers/hujjah-al-damighah/understanding-contracts';
import { formulateResponse } from '../../chambers/hujjah-al-damighah/knowledge-response-layer';
import type { KnowledgeDeclaration } from '../../chambers/hujjah-al-damighah/knowledge-contracts';
import {
  receiveCitizenKnowledgeRequest,
  receiveSovereignKnowledgeRequest,
} from '../../chambers/hujjah-al-damighah/reception-engine';
import type { SovereignKnowledgeReceptionPayload } from '../../chambers/hujjah-al-damighah/reception-contracts';
import { understandKnowledgeReception } from '../../chambers/hujjah-al-damighah/understanding-engine';
import { conductInvestigation } from '../../chambers/hujjah-al-damighah/investigation-engine';
import { collectEvidence } from '../../chambers/hujjah-al-damighah/evidence-layer';
import { declareKnowledge } from '../../chambers/hujjah-al-damighah/knowledge-layer';

// ─── BUILDER HELPERS ──────────────────────────────────────────────────────────

const SOVEREIGN_LINEAGE: SovereignRequestLineage = {
  requestId: 'req-xix-001',
  goalId: 'goal-xix-001',
  assessmentId: 'asmt-xix-001',
  criterionId: 'crit-xix-001',
  criterionDescriptionSnapshot: 'The Creator must demonstrate consistent publishing',
  gapClass: 'FULFILLMENT_GAP',
  gapCategory: 'FULFILLMENT_ABSENT',
  availability: 'REQUIRES_INVESTIGATION',
  requestedAtMs: 1700000000000,
};

function makeCitizenDeclaration(
  overrides: Partial<KnowledgeDeclaration> = {},
): KnowledgeDeclaration {
  return {
    declarationId: 'kd-xix-citizen-001',
    collectionId: 'evc-xix-001',
    investigationResultId: 'ir-xix-001',
    intentId: 'intent-xix-001',
    receptionId: 'rcp-xix-001',
    origin: 'CITIZEN',
    sovereignLineage: null,
    claim: 'what is photosynthesis',
    domain: 'biology',
    declarationText:
      'The available evidence establishes confident knowledge regarding: what is photosynthesis. 3 evidence item(s) support this declaration.',
    evidenceCount: 3,
    confidenceScore: 92,
    confidenceLevel: 'ESTABLISHED',
    verdictId: 'accepted',
    isDefinitive: true,
    uncertaintyPresent: false,
    declaredAtMs: 1700000000000,
    ...overrides,
  };
}

function makeSovereignDeclaration(
  overrides: Partial<KnowledgeDeclaration> = {},
): KnowledgeDeclaration {
  return {
    declarationId: 'kd-xix-sovereign-001',
    collectionId: 'evc-xix-sv-001',
    investigationResultId: 'ir-xix-sv-001',
    intentId: 'intent-xix-sv-001',
    receptionId: 'rcp-xix-sv-001',
    origin: 'SOVEREIGN',
    sovereignLineage: SOVEREIGN_LINEAGE,
    claim: 'what evidence shows consistent publishing',
    domain: 'distribution',
    declarationText:
      'The available evidence supports tentative knowledge regarding: what evidence shows consistent publishing, pending further verification. 1 evidence item(s) were found.',
    evidenceCount: 1,
    confidenceScore: 72,
    confidenceLevel: 'TENTATIVE',
    verdictId: 'under_review',
    isDefinitive: false,
    uncertaintyPresent: true,
    declaredAtMs: 1700000000000,
    ...overrides,
  };
}

function makeCitizenResponse(overrides: Partial<KnowledgeDeclaration> = {}): SovereignKnowledgeResponse {
  return formulateResponse(makeCitizenDeclaration(overrides));
}

function makeSovereignResponse(overrides: Partial<KnowledgeDeclaration> = {}): SovereignKnowledgeResponse {
  return formulateResponse(makeSovereignDeclaration(overrides));
}

// ─── SECTION 1: EXPORT RECORD STRUCTURE ──────────────────────────────────────

describe('Export record structure — all required fields present', () => {
  let record: KnowledgeExportRecord;

  beforeAll(() => {
    record = exportKnowledgeResponse(makeCitizenResponse(), 'CITIZEN');
  });

  it('record has an exportId', () => {
    expect(record).toHaveProperty('exportId');
  });

  it('record has a destination', () => {
    expect(record).toHaveProperty('destination');
  });

  it('record has a response', () => {
    expect(record).toHaveProperty('response');
  });

  it('record has an exportedAtMs', () => {
    expect(record).toHaveProperty('exportedAtMs');
  });

  it('exportId is a non-empty string', () => {
    expect(typeof record.exportId).toBe('string');
    expect(record.exportId.length).toBeGreaterThan(0);
  });

  it('exportId is a valid UUID', () => {
    expect(record.exportId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('response is an object', () => {
    expect(typeof record.response).toBe('object');
    expect(record.response).not.toBeNull();
  });

  it('exportedAtMs is a positive number', () => {
    expect(typeof record.exportedAtMs).toBe('number');
    expect(record.exportedAtMs).toBeGreaterThan(0);
  });
});

// ─── SECTION 2: EXPORTID UNIQUENESS ──────────────────────────────────────────

describe('exportId uniqueness — each export event is distinct', () => {
  const response = makeCitizenResponse();

  it('two exports of the same response produce different exportIds', () => {
    const r1 = exportKnowledgeResponse(response, 'CITIZEN');
    const r2 = exportKnowledgeResponse(response, 'CITIZEN');
    expect(r1.exportId).not.toBe(r2.exportId);
  });

  it('two exports to different destinations produce different exportIds', () => {
    const r1 = exportKnowledgeResponse(response, 'CITIZEN');
    const r2 = exportKnowledgeResponse(response, 'MAKMAN_AL_GHAYAH');
    expect(r1.exportId).not.toBe(r2.exportId);
  });

  it('exportId does not equal the responseId', () => {
    const record = exportKnowledgeResponse(response, 'CITIZEN');
    expect(record.exportId).not.toBe(record.response.responseId);
  });

  it('exportId does not equal the declarationId', () => {
    const record = exportKnowledgeResponse(response, 'CITIZEN');
    expect(record.exportId).not.toBe(record.response.declarationId);
  });
});

// ─── SECTION 3: DESTINATION ROUTING ──────────────────────────────────────────

describe('Destination routing — all four constitutional destinations produce valid records', () => {
  const response = makeCitizenResponse();

  it('CITIZEN destination produces a valid record', () => {
    const record = exportKnowledgeResponse(response, 'CITIZEN');
    expect(record.destination).toBe('CITIZEN');
  });

  it('MAKMAN_AL_GHAYAH destination produces a valid record', () => {
    const record = exportKnowledgeResponse(response, 'MAKMAN_AL_GHAYAH');
    expect(record.destination).toBe('MAKMAN_AL_GHAYAH');
  });

  it('QIYAMAH destination produces a valid record', () => {
    const record = exportKnowledgeResponse(response, 'QIYAMAH');
    expect(record.destination).toBe('QIYAMAH');
  });

  it('RAS_AL_AMR destination produces a valid record', () => {
    const record = exportKnowledgeResponse(response, 'RAS_AL_AMR');
    expect(record.destination).toBe('RAS_AL_AMR');
  });

  it('destination is preserved exactly across all four', () => {
    const destinations = ['CITIZEN', 'MAKMAN_AL_GHAYAH', 'QIYAMAH', 'RAS_AL_AMR'] as const;
    for (const dest of destinations) {
      const record = exportKnowledgeResponse(response, dest);
      expect(record.destination).toBe(dest);
    }
  });
});

// ─── SECTION 4: RESPONSE PRESERVATION ────────────────────────────────────────

describe('Response preservation — the response in the record is unchanged', () => {
  it('response in record is the same reference as the input response', () => {
    const response = makeCitizenResponse();
    const record = exportKnowledgeResponse(response, 'CITIZEN');
    expect(record.response).toBe(response);
  });

  it('response.responseId is preserved through export', () => {
    const response = makeCitizenResponse();
    const record = exportKnowledgeResponse(response, 'CITIZEN');
    expect(record.response.responseId).toBe(response.responseId);
  });

  it('response.declarationText is preserved through export', () => {
    const response = makeCitizenResponse();
    const record = exportKnowledgeResponse(response, 'CITIZEN');
    expect(record.response.declarationText).toBe(response.declarationText);
  });

  it('response.claim is preserved through export', () => {
    const response = makeCitizenResponse();
    const record = exportKnowledgeResponse(response, 'CITIZEN');
    expect(record.response.claim).toBe(response.claim);
  });

  it('response.domain is preserved through export', () => {
    const response = makeCitizenResponse();
    const record = exportKnowledgeResponse(response, 'CITIZEN');
    expect(record.response.domain).toBe(response.domain);
  });
});

// ─── SECTION 5: DECLARATION IDENTITY THROUGH EXPORT ─────────────────────────

describe('Declaration identity — flows through export', () => {
  it('declarationId is reachable through the export record', () => {
    const declaration = makeCitizenDeclaration({ declarationId: 'kd-export-test-007' });
    const response = formulateResponse(declaration);
    const record = exportKnowledgeResponse(response, 'CITIZEN');
    expect(record.response.declarationId).toBe('kd-export-test-007');
  });

  it('two export records from different declarations carry distinct declarationIds', () => {
    const d1 = makeCitizenDeclaration({ declarationId: 'kd-alpha' });
    const d2 = makeCitizenDeclaration({ declarationId: 'kd-beta' });
    const r1 = exportKnowledgeResponse(formulateResponse(d1), 'CITIZEN');
    const r2 = exportKnowledgeResponse(formulateResponse(d2), 'CITIZEN');
    expect(r1.response.declarationId).toBe('kd-alpha');
    expect(r2.response.declarationId).toBe('kd-beta');
  });
});

// ─── SECTION 6: CONFIDENCE AND VERDICT THROUGH EXPORT ────────────────────────

describe('Confidence and verdict — flow through export', () => {
  it('confidenceScore is preserved through export', () => {
    const record = exportKnowledgeResponse(makeCitizenResponse({ confidenceScore: 85 }), 'CITIZEN');
    expect(record.response.confidenceScore).toBe(85);
  });

  it('confidenceLevel ESTABLISHED flows through export', () => {
    const record = exportKnowledgeResponse(
      makeCitizenResponse({ confidenceLevel: 'ESTABLISHED' }),
      'CITIZEN',
    );
    expect(record.response.confidenceLevel).toBe('ESTABLISHED');
  });

  it('confidenceLevel INSUFFICIENT flows through export', () => {
    const record = exportKnowledgeResponse(
      makeCitizenResponse({ confidenceScore: 20, confidenceLevel: 'INSUFFICIENT' }),
      'MAKMAN_AL_GHAYAH',
    );
    expect(record.response.confidenceLevel).toBe('INSUFFICIENT');
  });

  it('verdictId=accepted flows through export', () => {
    const record = exportKnowledgeResponse(
      makeCitizenResponse({ verdictId: 'accepted' }),
      'QIYAMAH',
    );
    expect(record.response.verdictId).toBe('accepted');
  });

  it('verdictId=rejected flows through export', () => {
    const record = exportKnowledgeResponse(
      makeCitizenResponse({ verdictId: 'rejected', isDefinitive: false, uncertaintyPresent: true }),
      'RAS_AL_AMR',
    );
    expect(record.response.verdictId).toBe('rejected');
  });
});

// ─── SECTION 7: UNCERTAINTY INVARIANTS THROUGH EXPORT ────────────────────────

describe('Uncertainty invariants — flow through export', () => {
  it('isDefinitive=true flows through export', () => {
    const record = exportKnowledgeResponse(
      makeCitizenResponse({ isDefinitive: true, uncertaintyPresent: false }),
      'CITIZEN',
    );
    expect(record.response.isDefinitive).toBe(true);
    expect(record.response.uncertaintyPresent).toBe(false);
  });

  it('uncertaintyPresent=true flows through export', () => {
    const record = exportKnowledgeResponse(
      makeCitizenResponse({ isDefinitive: false, uncertaintyPresent: true }),
      'CITIZEN',
    );
    expect(record.response.isDefinitive).toBe(false);
    expect(record.response.uncertaintyPresent).toBe(true);
  });

  it('isDefinitive is always the inverse of uncertaintyPresent through export', () => {
    const r1 = exportKnowledgeResponse(
      makeCitizenResponse({ isDefinitive: true, uncertaintyPresent: false }),
      'CITIZEN',
    );
    const r2 = exportKnowledgeResponse(
      makeCitizenResponse({ isDefinitive: false, uncertaintyPresent: true }),
      'CITIZEN',
    );
    expect(r1.response.isDefinitive).not.toBe(r1.response.uncertaintyPresent);
    expect(r2.response.isDefinitive).not.toBe(r2.response.uncertaintyPresent);
  });
});

// ─── SECTION 8: CITIZEN PATH THROUGH EXPORT ──────────────────────────────────

describe('Citizen path — sovereignLineage is null through export', () => {
  it('origin is CITIZEN through export', () => {
    const record = exportKnowledgeResponse(makeCitizenResponse(), 'CITIZEN');
    expect(record.response.origin).toBe('CITIZEN');
  });

  it('sovereignLineage is null for Citizen export', () => {
    const record = exportKnowledgeResponse(makeCitizenResponse(), 'CITIZEN');
    expect(record.response.sovereignLineage).toBeNull();
  });

  it('Citizen response exported to QIYAMAH still has null sovereignLineage', () => {
    const record = exportKnowledgeResponse(makeCitizenResponse(), 'QIYAMAH');
    expect(record.response.sovereignLineage).toBeNull();
    expect(record.destination).toBe('QIYAMAH');
  });
});

// ─── SECTION 9: SOVEREIGN PATH THROUGH EXPORT ────────────────────────────────

describe('Sovereign path — sovereignLineage is preserved through export', () => {
  it('origin is SOVEREIGN through export', () => {
    const record = exportKnowledgeResponse(makeSovereignResponse(), 'MAKMAN_AL_GHAYAH');
    expect(record.response.origin).toBe('SOVEREIGN');
  });

  it('sovereignLineage is non-null for Sovereign export', () => {
    const record = exportKnowledgeResponse(makeSovereignResponse(), 'MAKMAN_AL_GHAYAH');
    expect(record.response.sovereignLineage).not.toBeNull();
  });

  it('sovereignLineage.goalId is preserved through export', () => {
    const record = exportKnowledgeResponse(makeSovereignResponse(), 'MAKMAN_AL_GHAYAH');
    expect(record.response.sovereignLineage?.goalId).toBe('goal-xix-001');
  });

  it('sovereignLineage.criterionId is preserved through export', () => {
    const record = exportKnowledgeResponse(makeSovereignResponse(), 'MAKMAN_AL_GHAYAH');
    expect(record.response.sovereignLineage?.criterionId).toBe('crit-xix-001');
  });

  it('sovereignLineage.gapClass is preserved through export', () => {
    const record = exportKnowledgeResponse(makeSovereignResponse(), 'MAKMAN_AL_GHAYAH');
    expect(record.response.sovereignLineage?.gapClass).toBe('FULFILLMENT_GAP');
  });

  it('full lineage object is reference-equal through export', () => {
    const response = makeSovereignResponse();
    const record = exportKnowledgeResponse(response, 'MAKMAN_AL_GHAYAH');
    expect(record.response.sovereignLineage).toBe(response.sovereignLineage);
  });
});

// ─── SECTION 10: CONSTITUTIONAL SECRECY ──────────────────────────────────────

describe('Constitutional secrecy — no provider, repository, or document identity', () => {
  it('serialized export record does not contain gutenberg provider name', () => {
    const record = exportKnowledgeResponse(makeCitizenResponse(), 'CITIZEN');
    expect(JSON.stringify(record)).not.toContain('"gutenberg"');
  });

  it('serialized export record does not contain reddit provider name', () => {
    const record = exportKnowledgeResponse(makeCitizenResponse(), 'CITIZEN');
    expect(JSON.stringify(record)).not.toContain('"reddit"');
  });

  it('serialized export record does not contain google-trends provider name', () => {
    const record = exportKnowledgeResponse(makeCitizenResponse(), 'CITIZEN');
    expect(JSON.stringify(record)).not.toContain('"google-trends"');
  });

  it('serialized export record does not contain ministry identifiers', () => {
    const record = exportKnowledgeResponse(makeCitizenResponse(), 'CITIZEN');
    const serialized = JSON.stringify(record);
    expect(serialized).not.toContain('ministry-human-knowledge');
    expect(serialized).not.toContain('ministry-business-intelligence');
    expect(serialized).not.toContain('ministry-media-intelligence');
  });

  it('serialized export record does not contain document ID patterns', () => {
    const record = exportKnowledgeResponse(makeCitizenResponse(), 'CITIZEN');
    const serialized = JSON.stringify(record);
    expect(serialized).not.toMatch(/book-\d+/);
    expect(serialized).not.toMatch(/trend-[a-z]/);
    expect(serialized).not.toMatch(/post-[a-z0-9]/);
  });

  it('serialized export record does not contain internal chain IDs from the declaration', () => {
    const record = exportKnowledgeResponse(makeCitizenResponse(), 'CITIZEN');
    const serialized = JSON.stringify(record);
    expect(serialized).not.toContain('"collectionId"');
    expect(serialized).not.toContain('"investigationResultId"');
    expect(serialized).not.toContain('"intentId"');
    expect(serialized).not.toContain('"receptionId"');
    expect(serialized).not.toContain('"evidenceCount"');
  });

  it('serialized export record does not contain URLs', () => {
    const record = exportKnowledgeResponse(makeCitizenResponse(), 'CITIZEN');
    const serialized = JSON.stringify(record);
    expect(serialized).not.toContain('http');
    expect(serialized).not.toContain('gutendex.com');
    expect(serialized).not.toContain('gutenberg.org');
    expect(serialized).not.toContain('reddit.com');
    expect(serialized).not.toContain('trends.google.com');
  });
});

// ─── SECTION 11: EXPORTEDATMS ─────────────────────────────────────────────────

describe('exportedAtMs — timestamp produced at export time', () => {
  it('exportedAtMs is approximately now', () => {
    const before = Date.now();
    const record = exportKnowledgeResponse(makeCitizenResponse(), 'CITIZEN');
    const after = Date.now();
    expect(record.exportedAtMs).toBeGreaterThanOrEqual(before);
    expect(record.exportedAtMs).toBeLessThanOrEqual(after);
  });

  it('exportedAtMs is greater than formulatedAtMs (export happens after response)', () => {
    const response = makeCitizenResponse();
    const record = exportKnowledgeResponse(response, 'CITIZEN');
    expect(record.exportedAtMs).toBeGreaterThanOrEqual(record.response.formulatedAtMs);
  });

  it('exportedAtMs is not equal to the declaration timestamp', () => {
    const record = exportKnowledgeResponse(makeCitizenResponse(), 'CITIZEN');
    expect(record.exportedAtMs).not.toBe(1700000000000);
  });
});

// ─── SECTION 12: MULTIPLE EXPORTS FROM SAME RESPONSE ─────────────────────────

describe('Multiple exports from same response — independent records', () => {
  it('same response exported to four destinations produces four distinct exportIds', () => {
    const response = makeCitizenResponse();
    const r1 = exportKnowledgeResponse(response, 'CITIZEN');
    const r2 = exportKnowledgeResponse(response, 'MAKMAN_AL_GHAYAH');
    const r3 = exportKnowledgeResponse(response, 'QIYAMAH');
    const r4 = exportKnowledgeResponse(response, 'RAS_AL_AMR');
    const ids = [r1.exportId, r2.exportId, r3.exportId, r4.exportId];
    const unique = new Set(ids);
    expect(unique.size).toBe(4);
  });

  it('all four exports carry the same responseId', () => {
    const response = makeCitizenResponse();
    const r1 = exportKnowledgeResponse(response, 'CITIZEN');
    const r2 = exportKnowledgeResponse(response, 'MAKMAN_AL_GHAYAH');
    expect(r1.response.responseId).toBe(r2.response.responseId);
  });

  it('all four exports carry the same declarationId', () => {
    const response = makeCitizenResponse();
    const r1 = exportKnowledgeResponse(response, 'CITIZEN');
    const r2 = exportKnowledgeResponse(response, 'QIYAMAH');
    expect(r1.response.declarationId).toBe(r2.response.declarationId);
  });
});

// ─── SECTION 13: FULL CHAIN INTEGRATION ──────────────────────────────────────

describe('Full chain integration — Reception → Export (real HTTP)', () => {
  it('produces a KnowledgeExportRecord from a real Citizen chain', async () => {
    const reception = receiveCitizenKnowledgeRequest('What is photosynthesis?', 'biology');
    const understanding = understandKnowledgeReception(reception);
    expect(understanding.ok).toBe(true);
    if (!understanding.ok) return;

    const investigation = await conductInvestigation(understanding.intent);
    expect(investigation.ok).toBe(true);
    if (!investigation.ok) return;

    const evidence = collectEvidence(investigation.result);
    expect(evidence.ok).toBe(true);
    if (!evidence.ok) return;

    const declaration = declareKnowledge(evidence.collection);
    const response = formulateResponse(declaration);
    const record = exportKnowledgeResponse(response, 'CITIZEN');

    expect(record.exportId).toBeDefined();
    expect(record.destination).toBe('CITIZEN');
    expect(record.response.declarationId).toBe(declaration.declarationId);
    expect(record.response.claim).toBe(declaration.claim);
  });

  it('real chain export to MAKMAN_AL_GHAYAH preserves all constitutional fields', async () => {
    const reception = receiveCitizenKnowledgeRequest('Romeo and Juliet themes', 'literature');
    const understanding = understandKnowledgeReception(reception);
    if (!understanding.ok) return;

    const investigation = await conductInvestigation(understanding.intent);
    if (!investigation.ok) return;

    const evidence = collectEvidence(investigation.result);
    if (!evidence.ok) return;

    const declaration = declareKnowledge(evidence.collection);
    const response = formulateResponse(declaration);
    const record = exportKnowledgeResponse(response, 'MAKMAN_AL_GHAYAH');

    expect(record.destination).toBe('MAKMAN_AL_GHAYAH');
    expect(record.response.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(record.response.confidenceScore).toBeLessThanOrEqual(100);
    expect(['accepted', 'under_review', 'conflict', 'rejected']).toContain(
      record.response.verdictId,
    );
  });

  it('real chain export does not expose any provider identity', async () => {
    const reception = receiveCitizenKnowledgeRequest('Shakespeare tragedy', 'literature');
    const understanding = understandKnowledgeReception(reception);
    if (!understanding.ok) return;

    const investigation = await conductInvestigation(understanding.intent);
    if (!investigation.ok) return;

    const evidence = collectEvidence(investigation.result);
    if (!evidence.ok) return;

    const declaration = declareKnowledge(evidence.collection);
    const response = formulateResponse(declaration);
    const record = exportKnowledgeResponse(response, 'QIYAMAH');
    const serialized = JSON.stringify(record);

    expect(serialized).not.toContain('"gutenberg"');
    expect(serialized).not.toContain('"reddit"');
    expect(serialized).not.toContain('"google-trends"');
    expect(serialized).not.toContain('ministry-human-knowledge');
    expect(serialized).not.toContain('ministry-business-intelligence');
    expect(serialized).not.toContain('ministry-media-intelligence');
    expect(serialized).not.toContain('http');
  });

  it('real chain Sovereign path export preserves lineage', async () => {
    const sovereignPayload: SovereignKnowledgeReceptionPayload = {
      requestId: 'req-xix-pkg19',
      goalId: 'goal-xix-pkg19',
      assessmentId: 'asmt-xix-pkg19',
      criterionId: 'crit-xix-pkg19',
      criterionDescriptionSnapshot: 'The Creator must demonstrate consistent output',
      questionStatement: 'What evidence shows consistent creative output?',
      gapClass: 'FULFILLMENT_GAP',
      gapCategory: 'FULFILLMENT_ABSENT',
      availability: 'REQUIRES_INVESTIGATION',
      requestedAtMs: Date.now(),
    };

    const reception = receiveSovereignKnowledgeRequest(sovereignPayload);
    const understanding = understandKnowledgeReception(reception);
    if (!understanding.ok) return;

    const investigation = await conductInvestigation(understanding.intent);
    if (!investigation.ok) return;

    const evidence = collectEvidence(investigation.result);
    if (!evidence.ok) return;

    const declaration = declareKnowledge(evidence.collection);
    const response = formulateResponse(declaration);
    const record = exportKnowledgeResponse(response, 'MAKMAN_AL_GHAYAH');

    expect(record.response.origin).toBe('SOVEREIGN');
    expect(record.response.sovereignLineage).not.toBeNull();
    expect(record.response.sovereignLineage?.goalId).toBe('goal-xix-pkg19');
    expect(record.response.sovereignLineage?.criterionId).toBe('crit-xix-pkg19');
  });

  it('same response can be exported to all four destinations with different exportIds', async () => {
    const reception = receiveCitizenKnowledgeRequest('Pride and Prejudice', 'literature');
    const understanding = understandKnowledgeReception(reception);
    if (!understanding.ok) return;

    const investigation = await conductInvestigation(understanding.intent);
    if (!investigation.ok) return;

    const evidence = collectEvidence(investigation.result);
    if (!evidence.ok) return;

    const declaration = declareKnowledge(evidence.collection);
    const response = formulateResponse(declaration);

    const r1 = exportKnowledgeResponse(response, 'CITIZEN');
    const r2 = exportKnowledgeResponse(response, 'MAKMAN_AL_GHAYAH');
    const r3 = exportKnowledgeResponse(response, 'QIYAMAH');
    const r4 = exportKnowledgeResponse(response, 'RAS_AL_AMR');

    const ids = new Set([r1.exportId, r2.exportId, r3.exportId, r4.exportId]);
    expect(ids.size).toBe(4);

    for (const record of [r1, r2, r3, r4]) {
      expect(record.response.declarationId).toBe(declaration.declarationId);
    }
  });
});
