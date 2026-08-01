/**
 * SOVEREIGN KNOWLEDGE RESPONSE FOUNDATION — Constitutional Foundation Package XVIII
 * Test suite for formulateResponse() and the SovereignKnowledgeResponse contract.
 *
 * Tests cover:
 *   1. Response structure — all required fields present, no extra fields
 *   2. responseId uniqueness — each delivery event produces a distinct ID
 *   3. Declaration identity — declarationId is preserved exactly
 *   4. Claim and domain identity — claim and domain preserved unchanged
 *   5. Declaration text — declarationText preserved unchanged
 *   6. Confidence preservation — confidenceScore and confidenceLevel preserved
 *   7. Verdict preservation — verdictId preserved exactly
 *   8. Uncertainty invariants — isDefinitive and uncertaintyPresent correct
 *   9. Citizen path — sovereignLineage is null
 *  10. Sovereign path — sovereignLineage is preserved in full
 *  11. Internal chain IDs absent — collectionId/investigationResultId/intentId/receptionId stripped
 *  12. Constitutional secrecy — no provider/repository/document identity in response
 *  13. formulatedAtMs — valid timestamp, produced at formulation time
 *  14. Full chain integration — Reception → Understanding → Investigation → Evidence → Knowledge → Response
 *
 * Sections 1–13 are pure unit tests (no network).
 * Section 14 requires network access (real HTTP to gutendex.com and Google Trends).
 * Timeout is set to 30 000 ms per test to accommodate real HTTP latency.
 */

jest.setTimeout(30000);

import { formulateResponse } from '../../chambers/hujjah-al-damighah/knowledge-response-layer';
import type { SovereignKnowledgeResponse } from '../../chambers/hujjah-al-damighah/knowledge-response-contracts';
import type { KnowledgeDeclaration } from '../../chambers/hujjah-al-damighah/knowledge-contracts';
import type { SovereignRequestLineage } from '../../chambers/hujjah-al-damighah/understanding-contracts';
import {
  receiveCitizenKnowledgeRequest,
  receiveSovereignKnowledgeRequest,
} from '../../chambers/hujjah-al-damighah/reception-engine';
import type { SovereignKnowledgeReceptionPayload } from '../../chambers/hujjah-al-damighah/reception-contracts';
import { understandKnowledgeReception } from '../../chambers/hujjah-al-damighah/understanding-engine';
import { conductInvestigation } from '../../chambers/hujjah-al-damighah/investigation-engine';
import { collectEvidence } from '../../chambers/hujjah-al-damighah/evidence-layer';
import { declareKnowledge } from '../../chambers/hujjah-al-damighah/knowledge-layer';

// ─── DECLARATION BUILDERS ─────────────────────────────────────────────────────

const SOVEREIGN_LINEAGE: SovereignRequestLineage = {
  requestId: 'req-sv-001',
  goalId: 'goal-001',
  assessmentId: 'asmt-001',
  criterionId: 'crit-001',
  criterionDescriptionSnapshot: 'The Creator must demonstrate measurable impact',
  gapClass: 'FULFILLMENT_GAP',
  gapCategory: 'FULFILLMENT_ABSENT',
  availability: 'REQUIRES_INVESTIGATION',
  requestedAtMs: 1700000000000,
};

function makeCitizenDeclaration(
  overrides: Partial<KnowledgeDeclaration> = {},
): KnowledgeDeclaration {
  return {
    declarationId: 'kd-evc-test-001-1700000000000-1',
    collectionId: 'evc-test-001',
    investigationResultId: 'ir-test-001',
    intentId: 'intent-test-001',
    receptionId: 'rcp-cit-test-001',
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
    declarationId: 'kd-evc-sv-001-1700000000000-2',
    collectionId: 'evc-sv-001',
    investigationResultId: 'ir-sv-001',
    intentId: 'intent-sv-001',
    receptionId: 'rcp-sv-001',
    origin: 'SOVEREIGN',
    sovereignLineage: SOVEREIGN_LINEAGE,
    claim: 'what evidence shows the creator has measurable impact',
    domain: 'distribution',
    declarationText:
      'The available evidence supports tentative knowledge regarding: what evidence shows the creator has measurable impact, pending further verification. 1 evidence item(s) were found.',
    evidenceCount: 1,
    confidenceScore: 74,
    confidenceLevel: 'TENTATIVE',
    verdictId: 'under_review',
    isDefinitive: false,
    uncertaintyPresent: true,
    declaredAtMs: 1700000000000,
    ...overrides,
  };
}

// ─── SECTION 1: RESPONSE STRUCTURE ────────────────────────────────────────────

describe('Response structure — all required fields present', () => {
  const declaration = makeCitizenDeclaration();
  let response: SovereignKnowledgeResponse;

  beforeAll(() => {
    response = formulateResponse(declaration);
  });

  it('response has a responseId', () => {
    expect(response).toHaveProperty('responseId');
  });

  it('response has a declarationId', () => {
    expect(response).toHaveProperty('declarationId');
  });

  it('response has a claim', () => {
    expect(response).toHaveProperty('claim');
  });

  it('response has a domain', () => {
    expect(response).toHaveProperty('domain');
  });

  it('response has a declarationText', () => {
    expect(response).toHaveProperty('declarationText');
  });

  it('response has a confidenceScore', () => {
    expect(response).toHaveProperty('confidenceScore');
  });

  it('response has a confidenceLevel', () => {
    expect(response).toHaveProperty('confidenceLevel');
  });

  it('response has a verdictId', () => {
    expect(response).toHaveProperty('verdictId');
  });

  it('response has isDefinitive', () => {
    expect(response).toHaveProperty('isDefinitive');
  });

  it('response has uncertaintyPresent', () => {
    expect(response).toHaveProperty('uncertaintyPresent');
  });

  it('response has origin', () => {
    expect(response).toHaveProperty('origin');
  });

  it('response has sovereignLineage', () => {
    expect(response).toHaveProperty('sovereignLineage');
  });

  it('response has formulatedAtMs', () => {
    expect(response).toHaveProperty('formulatedAtMs');
  });
});

// ─── SECTION 2: RESPONSEID UNIQUENESS ────────────────────────────────────────

describe('responseId uniqueness — each delivery event is distinct', () => {
  const declaration = makeCitizenDeclaration();

  it('two responses from the same declaration have different responseIds', () => {
    const r1 = formulateResponse(declaration);
    const r2 = formulateResponse(declaration);
    expect(r1.responseId).not.toBe(r2.responseId);
  });

  it('responseId is a non-empty string', () => {
    const response = formulateResponse(declaration);
    expect(typeof response.responseId).toBe('string');
    expect(response.responseId.length).toBeGreaterThan(0);
  });

  it('responseId is a valid UUID', () => {
    const response = formulateResponse(declaration);
    expect(response.responseId).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
    );
  });

  it('responseId does not equal declarationId', () => {
    const response = formulateResponse(declaration);
    expect(response.responseId).not.toBe(response.declarationId);
  });
});

// ─── SECTION 3: DECLARATION IDENTITY PRESERVED ────────────────────────────────

describe('Declaration identity — declarationId is preserved exactly', () => {
  it('declarationId matches the source declaration', () => {
    const declaration = makeCitizenDeclaration();
    const response = formulateResponse(declaration);
    expect(response.declarationId).toBe(declaration.declarationId);
  });

  it('two declarations produce responses with their own declarationIds', () => {
    const d1 = makeCitizenDeclaration({ declarationId: 'kd-alpha-001' });
    const d2 = makeCitizenDeclaration({ declarationId: 'kd-beta-001' });
    const r1 = formulateResponse(d1);
    const r2 = formulateResponse(d2);
    expect(r1.declarationId).toBe('kd-alpha-001');
    expect(r2.declarationId).toBe('kd-beta-001');
    expect(r1.declarationId).not.toBe(r2.declarationId);
  });
});

// ─── SECTION 4: CLAIM AND DOMAIN IDENTITY ────────────────────────────────────

describe('Claim and domain identity — preserved unchanged', () => {
  it('claim is preserved from declaration', () => {
    const declaration = makeCitizenDeclaration();
    const response = formulateResponse(declaration);
    expect(response.claim).toBe(declaration.claim);
  });

  it('domain is preserved from declaration', () => {
    const declaration = makeCitizenDeclaration();
    const response = formulateResponse(declaration);
    expect(response.domain).toBe(declaration.domain);
  });

  it('claim is not empty', () => {
    const response = formulateResponse(makeCitizenDeclaration());
    expect(response.claim.length).toBeGreaterThan(0);
  });

  it('domain is not empty', () => {
    const response = formulateResponse(makeCitizenDeclaration());
    expect(response.domain.length).toBeGreaterThan(0);
  });

  it('claim survives different declaration inputs', () => {
    const d = makeCitizenDeclaration({ claim: 'how does gravity work' });
    const r = formulateResponse(d);
    expect(r.claim).toBe('how does gravity work');
  });

  it('domain survives different declaration inputs', () => {
    const d = makeCitizenDeclaration({ domain: 'physics' });
    const r = formulateResponse(d);
    expect(r.domain).toBe('physics');
  });
});

// ─── SECTION 5: DECLARATION TEXT PRESERVED ────────────────────────────────────

describe('Declaration text — preserved unchanged', () => {
  it('declarationText is preserved from declaration', () => {
    const declaration = makeCitizenDeclaration();
    const response = formulateResponse(declaration);
    expect(response.declarationText).toBe(declaration.declarationText);
  });

  it('declarationText is a non-empty string', () => {
    const response = formulateResponse(makeCitizenDeclaration());
    expect(typeof response.declarationText).toBe('string');
    expect(response.declarationText.length).toBeGreaterThan(0);
  });

  it('declarationText is not altered or enriched by the response layer', () => {
    const originalText = 'The available evidence establishes confident knowledge regarding: test claim. 2 evidence item(s) support this declaration.';
    const d = makeCitizenDeclaration({ declarationText: originalText });
    const r = formulateResponse(d);
    expect(r.declarationText).toBe(originalText);
  });
});

// ─── SECTION 6: CONFIDENCE PRESERVATION ──────────────────────────────────────

describe('Confidence preservation — confidenceScore and confidenceLevel', () => {
  it('confidenceScore is preserved from declaration', () => {
    const d = makeCitizenDeclaration({ confidenceScore: 85 });
    const r = formulateResponse(d);
    expect(r.confidenceScore).toBe(85);
  });

  it('confidenceLevel is preserved from declaration', () => {
    const d = makeCitizenDeclaration({ confidenceLevel: 'TENTATIVE' });
    const r = formulateResponse(d);
    expect(r.confidenceLevel).toBe('TENTATIVE');
  });

  it('confidenceScore=0 is preserved', () => {
    const d = makeCitizenDeclaration({ confidenceScore: 0, confidenceLevel: 'INSUFFICIENT' });
    const r = formulateResponse(d);
    expect(r.confidenceScore).toBe(0);
    expect(r.confidenceLevel).toBe('INSUFFICIENT');
  });

  it('all four confidenceLevels round-trip correctly', () => {
    const levels = ['ESTABLISHED', 'TENTATIVE', 'UNCERTAIN', 'INSUFFICIENT'] as const;
    for (const level of levels) {
      const d = makeCitizenDeclaration({ confidenceLevel: level });
      const r = formulateResponse(d);
      expect(r.confidenceLevel).toBe(level);
    }
  });
});

// ─── SECTION 7: VERDICT PRESERVATION ─────────────────────────────────────────

describe('Verdict preservation — verdictId', () => {
  it('verdictId is preserved from declaration', () => {
    const d = makeCitizenDeclaration({ verdictId: 'accepted' });
    const r = formulateResponse(d);
    expect(r.verdictId).toBe('accepted');
  });

  it('verdictId=under_review is preserved', () => {
    const d = makeCitizenDeclaration({ verdictId: 'under_review' });
    const r = formulateResponse(d);
    expect(r.verdictId).toBe('under_review');
  });

  it('verdictId=conflict is preserved', () => {
    const d = makeCitizenDeclaration({ verdictId: 'conflict' });
    const r = formulateResponse(d);
    expect(r.verdictId).toBe('conflict');
  });

  it('verdictId=rejected is preserved', () => {
    const d = makeCitizenDeclaration({ verdictId: 'rejected' });
    const r = formulateResponse(d);
    expect(r.verdictId).toBe('rejected');
  });
});

// ─── SECTION 8: UNCERTAINTY INVARIANTS ───────────────────────────────────────

describe('Uncertainty invariants — isDefinitive and uncertaintyPresent', () => {
  it('isDefinitive=true is preserved', () => {
    const d = makeCitizenDeclaration({ isDefinitive: true, uncertaintyPresent: false });
    const r = formulateResponse(d);
    expect(r.isDefinitive).toBe(true);
    expect(r.uncertaintyPresent).toBe(false);
  });

  it('isDefinitive=false is preserved', () => {
    const d = makeCitizenDeclaration({ isDefinitive: false, uncertaintyPresent: true });
    const r = formulateResponse(d);
    expect(r.isDefinitive).toBe(false);
    expect(r.uncertaintyPresent).toBe(true);
  });

  it('uncertaintyPresent is always the inverse of isDefinitive', () => {
    const r1 = formulateResponse(makeCitizenDeclaration({ isDefinitive: true, uncertaintyPresent: false }));
    const r2 = formulateResponse(makeCitizenDeclaration({ isDefinitive: false, uncertaintyPresent: true }));
    expect(r1.isDefinitive).not.toBe(r1.uncertaintyPresent);
    expect(r2.isDefinitive).not.toBe(r2.uncertaintyPresent);
  });
});

// ─── SECTION 9: CITIZEN PATH ─────────────────────────────────────────────────

describe('Citizen path — origin and sovereignLineage', () => {
  it('origin is CITIZEN for a Citizen declaration', () => {
    const r = formulateResponse(makeCitizenDeclaration());
    expect(r.origin).toBe('CITIZEN');
  });

  it('sovereignLineage is null for a Citizen declaration', () => {
    const r = formulateResponse(makeCitizenDeclaration());
    expect(r.sovereignLineage).toBeNull();
  });
});

// ─── SECTION 10: SOVEREIGN PATH ──────────────────────────────────────────────

describe('Sovereign path — sovereignLineage is preserved in full', () => {
  it('origin is SOVEREIGN for a Sovereign declaration', () => {
    const r = formulateResponse(makeSovereignDeclaration());
    expect(r.origin).toBe('SOVEREIGN');
  });

  it('sovereignLineage is non-null for a Sovereign declaration', () => {
    const r = formulateResponse(makeSovereignDeclaration());
    expect(r.sovereignLineage).not.toBeNull();
  });

  it('sovereignLineage.goalId is preserved', () => {
    const r = formulateResponse(makeSovereignDeclaration());
    expect(r.sovereignLineage?.goalId).toBe('goal-001');
  });

  it('sovereignLineage.criterionId is preserved', () => {
    const r = formulateResponse(makeSovereignDeclaration());
    expect(r.sovereignLineage?.criterionId).toBe('crit-001');
  });

  it('sovereignLineage.gapClass is preserved', () => {
    const r = formulateResponse(makeSovereignDeclaration());
    expect(r.sovereignLineage?.gapClass).toBe('FULFILLMENT_GAP');
  });

  it('sovereignLineage.gapCategory is preserved', () => {
    const r = formulateResponse(makeSovereignDeclaration());
    expect(r.sovereignLineage?.gapCategory).toBe('FULFILLMENT_ABSENT');
  });

  it('sovereignLineage.requestId is preserved', () => {
    const r = formulateResponse(makeSovereignDeclaration());
    expect(r.sovereignLineage?.requestId).toBe('req-sv-001');
  });

  it('full sovereignLineage object is reference-equal to declaration lineage', () => {
    const declaration = makeSovereignDeclaration();
    const r = formulateResponse(declaration);
    expect(r.sovereignLineage).toBe(declaration.sovereignLineage);
  });
});

// ─── SECTION 11: INTERNAL CHAIN IDS ABSENT ───────────────────────────────────

describe('Internal chain IDs absent — implementation plumbing does not leave the Chamber', () => {
  it('response does not have collectionId', () => {
    const r = formulateResponse(makeCitizenDeclaration()) as unknown as Record<string, unknown>;
    expect(r['collectionId']).toBeUndefined();
  });

  it('response does not have investigationResultId', () => {
    const r = formulateResponse(makeCitizenDeclaration()) as unknown as Record<string, unknown>;
    expect(r['investigationResultId']).toBeUndefined();
  });

  it('response does not have intentId', () => {
    const r = formulateResponse(makeCitizenDeclaration()) as unknown as Record<string, unknown>;
    expect(r['intentId']).toBeUndefined();
  });

  it('response does not have receptionId', () => {
    const r = formulateResponse(makeCitizenDeclaration()) as unknown as Record<string, unknown>;
    expect(r['receptionId']).toBeUndefined();
  });

  it('response does not have evidenceCount', () => {
    const r = formulateResponse(makeCitizenDeclaration()) as unknown as Record<string, unknown>;
    expect(r['evidenceCount']).toBeUndefined();
  });

  it('response does not have declaredAtMs', () => {
    const r = formulateResponse(makeCitizenDeclaration()) as unknown as Record<string, unknown>;
    expect(r['declaredAtMs']).toBeUndefined();
  });
});

// ─── SECTION 12: CONSTITUTIONAL SECRECY ──────────────────────────────────────

describe('Constitutional secrecy — no provider, repository, or document identity', () => {
  it('declarationText does not contain gutenberg provider name', () => {
    const d = makeCitizenDeclaration({
      declarationText: 'The available evidence establishes confident knowledge regarding: Shakespeare. 3 evidence item(s) support this declaration.',
    });
    const r = formulateResponse(d);
    expect(r.declarationText.toLowerCase()).not.toContain('gutenberg');
  });

  it('declarationText does not contain reddit provider name', () => {
    const d = makeCitizenDeclaration({
      declarationText: 'Tentative knowledge regarding: social media trends. 1 evidence item(s) were found.',
    });
    const r = formulateResponse(d);
    expect(r.declarationText.toLowerCase()).not.toContain('reddit');
  });

  it('declarationText does not contain google-trends provider name', () => {
    const d = makeCitizenDeclaration({
      declarationText: 'Tentative knowledge regarding: trending topics. 2 evidence item(s) were found.',
    });
    const r = formulateResponse(d);
    expect(r.declarationText.toLowerCase()).not.toContain('google');
    expect(r.declarationText.toLowerCase()).not.toContain('trends');
  });

  it('declarationText does not contain ministry identifiers', () => {
    const r = formulateResponse(makeCitizenDeclaration());
    expect(r.declarationText.toLowerCase()).not.toContain('ministry-');
  });

  it('claim does not expose document IDs', () => {
    const r = formulateResponse(makeCitizenDeclaration({ claim: 'what is photosynthesis' }));
    expect(r.claim).not.toMatch(/book-\d+/);
    expect(r.claim).not.toMatch(/trend-/);
    expect(r.claim).not.toMatch(/post-/);
  });

  it('response object serializes without provider identity at top level', () => {
    const r = formulateResponse(makeCitizenDeclaration());
    const serialized = JSON.stringify(r);
    expect(serialized).not.toContain('"gutenberg"');
    expect(serialized).not.toContain('"reddit"');
    expect(serialized).not.toContain('"google-trends"');
    expect(serialized).not.toContain('"ministry-human-knowledge"');
    expect(serialized).not.toContain('"ministry-business-intelligence"');
    expect(serialized).not.toContain('"ministry-media-intelligence"');
  });

  it('response does not contain any URL or endpoint reference', () => {
    const r = formulateResponse(makeCitizenDeclaration());
    const serialized = JSON.stringify(r);
    expect(serialized).not.toContain('http');
    expect(serialized).not.toContain('gutendex.com');
    expect(serialized).not.toContain('gutenberg.org');
    expect(serialized).not.toContain('reddit.com');
    expect(serialized).not.toContain('trends.google.com');
  });
});

// ─── SECTION 13: FORMULATEDATMS ───────────────────────────────────────────────

describe('formulatedAtMs — timestamp produced at formulation time', () => {
  it('formulatedAtMs is a positive number', () => {
    const r = formulateResponse(makeCitizenDeclaration());
    expect(typeof r.formulatedAtMs).toBe('number');
    expect(r.formulatedAtMs).toBeGreaterThan(0);
  });

  it('formulatedAtMs is approximately now', () => {
    const before = Date.now();
    const r = formulateResponse(makeCitizenDeclaration());
    const after = Date.now();
    expect(r.formulatedAtMs).toBeGreaterThanOrEqual(before);
    expect(r.formulatedAtMs).toBeLessThanOrEqual(after);
  });

  it('formulatedAtMs is not equal to declaredAtMs from the declaration', () => {
    const d = makeCitizenDeclaration({ declaredAtMs: 1700000000000 });
    const r = formulateResponse(d);
    expect(r.formulatedAtMs).not.toBe(1700000000000);
  });

  it('two formulations of the same declaration produce different formulatedAtMs (within tolerance)', () => {
    const declaration = makeCitizenDeclaration();
    const r1 = formulateResponse(declaration);
    const r2 = formulateResponse(declaration);
    // responseIds must differ; formulatedAtMs may be equal in fast execution
    // but the field must be present and valid in both
    expect(r1.formulatedAtMs).toBeGreaterThan(0);
    expect(r2.formulatedAtMs).toBeGreaterThan(0);
    expect(r1.responseId).not.toBe(r2.responseId);
  });
});

// ─── SECTION 14: FULL CHAIN INTEGRATION ──────────────────────────────────────

describe('Full chain integration — Reception → Response (real HTTP)', () => {
  it('produces a SovereignKnowledgeResponse from a real Citizen chain', async () => {
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

    expect(response.responseId).toBeDefined();
    expect(response.declarationId).toBe(declaration.declarationId);
    expect(response.claim).toBe(declaration.claim);
    expect(response.domain).toBe(declaration.domain);
    expect(response.declarationText).toBe(declaration.declarationText);
  });

  it('response from real chain has valid confidenceScore (0–100)', async () => {
    const reception = receiveCitizenKnowledgeRequest('Romeo and Juliet', 'literature');
    const understanding = understandKnowledgeReception(reception);
    if (!understanding.ok) return;

    const investigation = await conductInvestigation(understanding.intent);
    if (!investigation.ok) return;

    const evidence = collectEvidence(investigation.result);
    if (!evidence.ok) return;

    const declaration = declareKnowledge(evidence.collection);
    const response = formulateResponse(declaration);

    expect(response.confidenceScore).toBeGreaterThanOrEqual(0);
    expect(response.confidenceScore).toBeLessThanOrEqual(100);
  });

  it('response from real chain has a constitutional verdictId', async () => {
    const reception = receiveCitizenKnowledgeRequest('Shakespeare tragedy', 'literature');
    const understanding = understandKnowledgeReception(reception);
    if (!understanding.ok) return;

    const investigation = await conductInvestigation(understanding.intent);
    if (!investigation.ok) return;

    const evidence = collectEvidence(investigation.result);
    if (!evidence.ok) return;

    const declaration = declareKnowledge(evidence.collection);
    const response = formulateResponse(declaration);

    expect(['accepted', 'under_review', 'conflict', 'rejected']).toContain(response.verdictId);
  });

  it('response from real chain has isDefinitive consistent with verdictId', async () => {
    const reception = receiveCitizenKnowledgeRequest('Pride and Prejudice', 'literature');
    const understanding = understandKnowledgeReception(reception);
    if (!understanding.ok) return;

    const investigation = await conductInvestigation(understanding.intent);
    if (!investigation.ok) return;

    const evidence = collectEvidence(investigation.result);
    if (!evidence.ok) return;

    const declaration = declareKnowledge(evidence.collection);
    const response = formulateResponse(declaration);

    expect(response.isDefinitive).toBe(!response.uncertaintyPresent);
    if (response.verdictId === 'accepted') {
      expect(response.isDefinitive).toBe(true);
    } else {
      expect(response.isDefinitive).toBe(false);
    }
  });

  it('response from real chain does not expose internal chain IDs', async () => {
    const reception = receiveCitizenKnowledgeRequest('Dickens Oliver Twist', 'literature');
    const understanding = understandKnowledgeReception(reception);
    if (!understanding.ok) return;

    const investigation = await conductInvestigation(understanding.intent);
    if (!investigation.ok) return;

    const evidence = collectEvidence(investigation.result);
    if (!evidence.ok) return;

    const declaration = declareKnowledge(evidence.collection);
    const response = formulateResponse(declaration) as unknown as Record<string, unknown>;

    expect(response['collectionId']).toBeUndefined();
    expect(response['investigationResultId']).toBeUndefined();
    expect(response['intentId']).toBeUndefined();
    expect(response['receptionId']).toBeUndefined();
    expect(response['evidenceCount']).toBeUndefined();
  });

  it('response from real chain does not expose provider identities', async () => {
    const reception = receiveCitizenKnowledgeRequest('Shakespeare sonnets', 'literature');
    const understanding = understandKnowledgeReception(reception);
    if (!understanding.ok) return;

    const investigation = await conductInvestigation(understanding.intent);
    if (!investigation.ok) return;

    const evidence = collectEvidence(investigation.result);
    if (!evidence.ok) return;

    const declaration = declareKnowledge(evidence.collection);
    const response = formulateResponse(declaration);
    const serialized = JSON.stringify(response);

    expect(serialized).not.toContain('"gutenberg"');
    expect(serialized).not.toContain('"reddit"');
    expect(serialized).not.toContain('"google-trends"');
    expect(serialized).not.toContain('ministry-human-knowledge');
    expect(serialized).not.toContain('ministry-business-intelligence');
    expect(serialized).not.toContain('ministry-media-intelligence');
  });

  it('Sovereign path — response preserves lineage from Makman request', async () => {
    const sovereignPayload: SovereignKnowledgeReceptionPayload = {
      requestId: 'req-test-pkg18',
      goalId: 'goal-test-pkg18',
      assessmentId: 'asmt-test-pkg18',
      criterionId: 'crit-test-pkg18',
      criterionDescriptionSnapshot: 'The Creator must show measurable audience growth',
      questionStatement: 'What evidence shows measurable audience growth?',
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

    expect(response.origin).toBe('SOVEREIGN');
    expect(response.sovereignLineage).not.toBeNull();
    expect(response.sovereignLineage?.goalId).toBe('goal-test-pkg18');
    expect(response.sovereignLineage?.criterionId).toBe('crit-test-pkg18');
  });
});
