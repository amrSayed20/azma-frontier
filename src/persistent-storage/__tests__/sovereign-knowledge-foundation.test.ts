/**
 * SOVEREIGN KNOWLEDGE FOUNDATION — Constitutional Foundation Package XIV
 * Test suite for the Al Hujjah Al-Damighah knowledge declaration stage.
 *
 * Tests cover:
 *   1. Confidence score computation — derived from evidence item scores
 *   2. Confidence level classification — ESTABLISHED/TENTATIVE/UNCERTAIN/INSUFFICIENT
 *   3. Verdict derivation — from evaluateVerdict() via confidence
 *   4. Declaration text — constitutional secrecy and honest conclusions
 *   5. Uncertainty and definitiveness — isDefinitive / uncertaintyPresent invariants
 *   6. KnowledgeDeclaration structure — fields present and absent
 *   7. Lineage preservation — all chain IDs carried forward
 *   8. Sovereign lineage — preserved in full from Makman path
 *   9. Citizen full chain — Reception → Understanding → Investigation → Evidence → Knowledge
 *  10. Sovereign full chain — same chain via Sovereign path with lineage
 *
 * Note: jest.setTimeout extended to 30 000 ms — the IntelligenceEngine now
 * queries three active providers in parallel as of Package XVII.
 */

jest.setTimeout(30000);

import {
  receiveCitizenKnowledgeRequest,
  receiveSovereignKnowledgeRequest,
} from '../../chambers/hujjah-al-damighah/reception-engine';
import type { SovereignKnowledgeReceptionPayload } from '../../chambers/hujjah-al-damighah/reception-contracts';
import { understandKnowledgeReception } from '../../chambers/hujjah-al-damighah/understanding-engine';
import type { SovereignRequestLineage } from '../../chambers/hujjah-al-damighah/understanding-contracts';
import { conductInvestigation } from '../../chambers/hujjah-al-damighah/investigation-engine';
import { collectEvidence } from '../../chambers/hujjah-al-damighah/evidence-layer';
import type { CollectedEvidence, EvidenceCollection } from '../../chambers/hujjah-al-damighah/evidence-contracts';
import { ConfidenceLevel } from '../../chambers/hujjah-al-damighah/domain/evidence.types';
import type { Evidence, SovereignClaim } from '../../chambers/hujjah-al-damighah/domain/evidence.types';
import { declareKnowledge } from '../../chambers/hujjah-al-damighah/knowledge-layer';

// ─── MOCK BUILDERS ────────────────────────────────────────────────────────────

function makeEvidence(confidenceScore: number, overrides: Partial<Evidence> = {}): Evidence {
  return {
    id: `ev-${confidenceScore}-${Math.floor(Math.random() * 10000)}`,
    claimId: 'claim-test-001',
    sourceId: 'test-source-001',
    sourceProvider: 'test-provider',
    extractedText: '[Extracted context matching claim]: what is photosynthesis',
    confidenceScore,
    confidenceLevel:
      confidenceScore >= 0.7
        ? ConfidenceLevel.HIGH
        : confidenceScore >= 0.4
          ? ConfidenceLevel.MODERATE
          : ConfidenceLevel.LOW,
    ...overrides,
  };
}

function makeItem(
  confidenceScore: number,
  overrides: Partial<CollectedEvidence> = {},
): CollectedEvidence {
  return {
    evidence: makeEvidence(confidenceScore),
    investigationResultId: 'ir-test-001',
    intentId: 'intent-test-001',
    receptionId: 'rcp-cit-test-001',
    origin: 'CITIZEN',
    collectedAtMs: 1700000000000,
    ...overrides,
  };
}

const DEFAULT_CLAIM: SovereignClaim = {
  id: 'claim-test-001',
  originalStatement: 'What is photosynthesis?',
  normalizedStatement: 'what is photosynthesis',
  targetCategory: 'biology',
  timestampMs: 1700000000000,
  keywords: ['photosynthesis'],
};

function makeCollection(
  items: CollectedEvidence[] = [],
  overrides: Partial<EvidenceCollection> = {},
): EvidenceCollection {
  return {
    collectionId: 'evc-test-001',
    investigationResultId: 'ir-test-001',
    intentId: 'intent-test-001',
    receptionId: 'rcp-cit-test-001',
    origin: 'CITIZEN',
    claim: DEFAULT_CLAIM,
    items,
    sovereignLineage: null,
    totalSourcesScanned: items.length > 0 ? 5 : 0,
    collectedAtMs: 1700000000000,
    ...overrides,
  };
}

const SOVEREIGN_PAYLOAD: SovereignKnowledgeReceptionPayload = {
  requestId: 'kr-goal-001-crit-A-1700000000000',
  goalId: 'goal-001',
  assessmentId: 'assessment-001',
  criterionId: 'crit-A',
  criterionDescriptionSnapshot: 'Reach 1000 subscribers within 90 days.',
  gapClass: 'OBSERVATION_GAP',
  gapCategory: 'EVIDENCE_AVAILABILITY',
  questionStatement: 'What is the current subscriber count for this Creator?',
  availability: 'OBSERVABLE_INTERNALLY',
  requestedAtMs: 1700000000000,
};

const SOVEREIGN_LINEAGE: SovereignRequestLineage = {
  requestId: 'kr-goal-001-crit-A-1700000000000',
  goalId: 'goal-001',
  assessmentId: 'assessment-001',
  criterionId: 'crit-A',
  criterionDescriptionSnapshot: 'Reach 1000 subscribers within 90 days.',
  gapClass: 'OBSERVATION_GAP',
  gapCategory: 'EVIDENCE_AVAILABILITY',
  availability: 'OBSERVABLE_INTERNALLY',
  requestedAtMs: 1700000000000,
};

// ─── FULL CHAIN HELPERS ───────────────────────────────────────────────────────

async function citizenKnowledgeChain(query: string, domain = 'general') {
  const reception = receiveCitizenKnowledgeRequest(query, domain);
  const understanding = understandKnowledgeReception(reception);
  if (!understanding.ok) throw new Error('Understanding failed');
  const investigationOutcome = await conductInvestigation(understanding.intent);
  if (!investigationOutcome.ok) throw new Error('Investigation failed');
  const collectionOutcome = collectEvidence(investigationOutcome.result);
  if (!collectionOutcome.ok) throw new Error('Evidence collection failed');
  return {
    reception,
    intent: understanding.intent,
    investigationResult: investigationOutcome.result,
    collection: collectionOutcome.collection,
    declaration: declareKnowledge(collectionOutcome.collection),
  };
}

async function sovereignKnowledgeChain(overrides: Partial<SovereignKnowledgeReceptionPayload> = {}) {
  const reception = receiveSovereignKnowledgeRequest({ ...SOVEREIGN_PAYLOAD, ...overrides });
  const understanding = understandKnowledgeReception(reception);
  if (!understanding.ok) throw new Error('Understanding failed');
  const investigationOutcome = await conductInvestigation(understanding.intent);
  if (!investigationOutcome.ok) throw new Error('Investigation failed');
  const collectionOutcome = collectEvidence(investigationOutcome.result);
  if (!collectionOutcome.ok) throw new Error('Evidence collection failed');
  return {
    reception,
    intent: understanding.intent,
    investigationResult: investigationOutcome.result,
    collection: collectionOutcome.collection,
    declaration: declareKnowledge(collectionOutcome.collection),
  };
}

// ─── SECTION 1: CONFIDENCE SCORE COMPUTATION ─────────────────────────────────

describe('Confidence score computation — derived from evidence item scores', () => {
  it('empty collection produces confidenceScore=0', () => {
    const collection = makeCollection([]);
    const declaration = declareKnowledge(collection);
    expect(declaration.confidenceScore).toBe(0);
  });

  it('single item with confidenceScore=0.5 produces confidenceScore=50', () => {
    const collection = makeCollection([makeItem(0.5)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.confidenceScore).toBe(50);
  });

  it('single item with confidenceScore=0.93 produces confidenceScore=93', () => {
    const collection = makeCollection([makeItem(0.93)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.confidenceScore).toBe(93);
  });

  it('two items [0.80, 0.60] produce average confidenceScore=70', () => {
    const collection = makeCollection([makeItem(0.8), makeItem(0.6)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.confidenceScore).toBe(70);
  });

  it('three items [0.90, 0.85, 0.95] produce average confidenceScore=90', () => {
    const collection = makeCollection([makeItem(0.9), makeItem(0.85), makeItem(0.95)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.confidenceScore).toBe(90);
  });

  it('confidenceScore is always an integer (no decimal points)', () => {
    const collection = makeCollection([makeItem(0.333), makeItem(0.666)]);
    const declaration = declareKnowledge(collection);
    expect(Number.isInteger(declaration.confidenceScore)).toBe(true);
  });
});

// ─── SECTION 2: CONFIDENCE LEVEL CLASSIFICATION ──────────────────────────────

describe('Confidence level classification — ESTABLISHED/TENTATIVE/UNCERTAIN/INSUFFICIENT', () => {
  it('empty collection produces INSUFFICIENT', () => {
    const collection = makeCollection([]);
    const declaration = declareKnowledge(collection);
    expect(declaration.confidenceLevel).toBe('INSUFFICIENT');
  });

  it('confidenceScore=39 produces INSUFFICIENT', () => {
    const collection = makeCollection([makeItem(0.39)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.confidenceLevel).toBe('INSUFFICIENT');
  });

  it('confidenceScore=40 produces UNCERTAIN', () => {
    const collection = makeCollection([makeItem(0.4)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.confidenceLevel).toBe('UNCERTAIN');
  });

  it('confidenceScore=69 produces UNCERTAIN', () => {
    const collection = makeCollection([makeItem(0.69)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.confidenceLevel).toBe('UNCERTAIN');
  });

  it('confidenceScore=70 produces TENTATIVE', () => {
    const collection = makeCollection([makeItem(0.7)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.confidenceLevel).toBe('TENTATIVE');
  });

  it('confidenceScore=89 produces TENTATIVE', () => {
    const collection = makeCollection([makeItem(0.89)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.confidenceLevel).toBe('TENTATIVE');
  });

  it('confidenceScore=90 produces ESTABLISHED', () => {
    const collection = makeCollection([makeItem(0.9)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.confidenceLevel).toBe('ESTABLISHED');
  });
});

// ─── SECTION 3: VERDICT DERIVATION ──────────────────────────────────────────

describe('Verdict derivation — from confidence via evaluateVerdict()', () => {
  it('empty collection produces verdictId=rejected', () => {
    const collection = makeCollection([]);
    const declaration = declareKnowledge(collection);
    expect(declaration.verdictId).toBe('rejected');
  });

  it('confidenceScore=50 produces verdictId=rejected', () => {
    const collection = makeCollection([makeItem(0.5)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.verdictId).toBe('rejected');
  });

  it('confidenceScore=70 produces verdictId=under_review', () => {
    const collection = makeCollection([makeItem(0.7)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.verdictId).toBe('under_review');
  });

  it('confidenceScore=89 produces verdictId=under_review', () => {
    const collection = makeCollection([makeItem(0.89)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.verdictId).toBe('under_review');
  });

  it('confidenceScore=90 produces verdictId=accepted', () => {
    const collection = makeCollection([makeItem(0.9)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.verdictId).toBe('accepted');
  });
});

// ─── SECTION 4: DECLARATION TEXT — CONSTITUTIONAL SECRECY ────────────────────

describe('Declaration text — honest conclusions, no internal identifiers exposed', () => {
  it('empty collection states no evidence was found', () => {
    const collection = makeCollection([]);
    const declaration = declareKnowledge(collection);
    expect(declaration.declarationText).toContain('No evidence was found');
  });

  it('accepted verdict states confident knowledge is established', () => {
    const collection = makeCollection([makeItem(0.9)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.declarationText).toContain('establishes confident knowledge');
  });

  it('under_review verdict states tentative knowledge pending verification', () => {
    const collection = makeCollection([makeItem(0.7)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.declarationText).toContain('tentative knowledge');
    expect(declaration.declarationText).toContain('pending further verification');
  });

  it('rejected verdict states evidence was insufficient', () => {
    const collection = makeCollection([makeItem(0.3)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.declarationText).toContain('insufficient to establish knowledge');
  });

  it('declaration text contains the claim statement', () => {
    const collection = makeCollection([makeItem(0.5)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.declarationText).toContain(DEFAULT_CLAIM.normalizedStatement);
  });

  it('declaration text does not expose sourceProvider values', () => {
    const ev = makeEvidence(0.8, { sourceProvider: 'gutenberg' });
    const item = makeItem(0.8, { evidence: ev });
    const collection = makeCollection([item]);
    const declaration = declareKnowledge(collection);
    expect(declaration.declarationText).not.toContain('gutenberg');
    expect(declaration.declarationText).not.toContain('sourceProvider');
  });

  it('declaration text does not expose sourceId values', () => {
    const ev = makeEvidence(0.8, { sourceId: 'gutenberg-doc-xyz-12345' });
    const item = makeItem(0.8, { evidence: ev });
    const collection = makeCollection([item]);
    const declaration = declareKnowledge(collection);
    expect(declaration.declarationText).not.toContain('gutenberg-doc-xyz-12345');
    expect(declaration.declarationText).not.toContain('sourceId');
  });

  it('declaration text does not produce recommendations', () => {
    const collection = makeCollection([makeItem(0.9)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.declarationText).not.toContain('contentOpportunities');
    expect(declaration.declarationText).not.toContain('Explore source');
    expect(declaration.declarationText).not.toContain('recommend');
  });

  it('empty collection declaration text does not expose internal identifiers', () => {
    const collection = makeCollection([]);
    const declaration = declareKnowledge(collection);
    expect(declaration.declarationText).not.toContain('sourceProvider');
    expect(declaration.declarationText).not.toContain('sourceId');
    expect(declaration.declarationText).not.toContain('gutenberg');
  });

  it('each unique claim text appears in the declaration', () => {
    const claim: SovereignClaim = {
      ...DEFAULT_CLAIM,
      normalizedStatement: 'what are the principles of thermodynamics',
      targetCategory: 'physics',
    };
    const collection = makeCollection([makeItem(0.5)], { claim });
    const declaration = declareKnowledge(collection);
    expect(declaration.declarationText).toContain('what are the principles of thermodynamics');
  });
});

// ─── SECTION 5: UNCERTAINTY AND DEFINITIVENESS ───────────────────────────────

describe('Uncertainty and definitiveness — constitutional invariants', () => {
  it('empty collection: isDefinitive=false', () => {
    const collection = makeCollection([]);
    const declaration = declareKnowledge(collection);
    expect(declaration.isDefinitive).toBe(false);
  });

  it('empty collection: uncertaintyPresent=true', () => {
    const collection = makeCollection([]);
    const declaration = declareKnowledge(collection);
    expect(declaration.uncertaintyPresent).toBe(true);
  });

  it('confidenceScore=90 (accepted): isDefinitive=true', () => {
    const collection = makeCollection([makeItem(0.9)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.isDefinitive).toBe(true);
  });

  it('confidenceScore=90 (accepted): uncertaintyPresent=false', () => {
    const collection = makeCollection([makeItem(0.9)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.uncertaintyPresent).toBe(false);
  });

  it('under_review verdict: isDefinitive=false', () => {
    const collection = makeCollection([makeItem(0.75)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.isDefinitive).toBe(false);
  });

  it('uncertaintyPresent is always the inverse of isDefinitive', () => {
    const scores = [0, 0.3, 0.5, 0.7, 0.8, 0.9, 0.95];
    for (const score of scores) {
      const collection = makeCollection(score === 0 ? [] : [makeItem(score)]);
      const declaration = declareKnowledge(collection);
      expect(declaration.uncertaintyPresent).toBe(!declaration.isDefinitive);
    }
  });
});

// ─── SECTION 6: KNOWLEDGE DECLARATION STRUCTURE ──────────────────────────────

describe('KnowledgeDeclaration structure — fields present and delivery flags absent', () => {
  it('carries all required constitutional fields', () => {
    const collection = makeCollection([makeItem(0.7)]);
    const declaration = declareKnowledge(collection);
    expect(declaration).toHaveProperty('declarationId');
    expect(declaration).toHaveProperty('collectionId');
    expect(declaration).toHaveProperty('investigationResultId');
    expect(declaration).toHaveProperty('intentId');
    expect(declaration).toHaveProperty('receptionId');
    expect(declaration).toHaveProperty('origin');
    expect(declaration).toHaveProperty('sovereignLineage');
    expect(declaration).toHaveProperty('claim');
    expect(declaration).toHaveProperty('domain');
    expect(declaration).toHaveProperty('declarationText');
    expect(declaration).toHaveProperty('evidenceCount');
    expect(declaration).toHaveProperty('confidenceScore');
    expect(declaration).toHaveProperty('confidenceLevel');
    expect(declaration).toHaveProperty('verdictId');
    expect(declaration).toHaveProperty('isDefinitive');
    expect(declaration).toHaveProperty('uncertaintyPresent');
    expect(declaration).toHaveProperty('declaredAtMs');
  });

  it('declarationId starts with kd-', () => {
    const collection = makeCollection([makeItem(0.8)]);
    const declaration = declareKnowledge(collection);
    expect(declaration.declarationId).toMatch(/^kd-/);
  });

  it('evidenceCount equals items.length', () => {
    const items = [makeItem(0.5), makeItem(0.6), makeItem(0.7)];
    const collection = makeCollection(items);
    const declaration = declareKnowledge(collection);
    expect(declaration.evidenceCount).toBe(3);
  });

  it('evidenceCount=0 for empty collection', () => {
    const collection = makeCollection([]);
    const declaration = declareKnowledge(collection);
    expect(declaration.evidenceCount).toBe(0);
  });

  it('does NOT have allowDispatch field (delivery flag)', () => {
    const collection = makeCollection([makeItem(0.9)]);
    const declaration = declareKnowledge(collection);
    expect('allowDispatch' in declaration).toBe(false);
  });

  it('does NOT have allowArchive field (delivery flag)', () => {
    const collection = makeCollection([makeItem(0.9)]);
    const declaration = declareKnowledge(collection);
    expect('allowArchive' in declaration).toBe(false);
  });

  it('does NOT have allowMemory field (delivery flag)', () => {
    const collection = makeCollection([makeItem(0.9)]);
    const declaration = declareKnowledge(collection);
    expect('allowMemory' in declaration).toBe(false);
  });

  it('does NOT have a recommendation field', () => {
    const collection = makeCollection([makeItem(0.9)]);
    const declaration = declareKnowledge(collection);
    expect('recommendation' in declaration).toBe(false);
  });
});

// ─── SECTION 7: LINEAGE PRESERVATION ─────────────────────────────────────────

describe('Lineage preservation — all constitutional chain IDs carried into declaration', () => {
  it('collectionId matches the input collection', () => {
    const collection = makeCollection([], { collectionId: 'evc-unique-abc' });
    const declaration = declareKnowledge(collection);
    expect(declaration.collectionId).toBe('evc-unique-abc');
  });

  it('investigationResultId matches the input collection', () => {
    const collection = makeCollection([], { investigationResultId: 'ir-xyz-999' });
    const declaration = declareKnowledge(collection);
    expect(declaration.investigationResultId).toBe('ir-xyz-999');
  });

  it('intentId matches the input collection', () => {
    const collection = makeCollection([], { intentId: 'intent-custom-001' });
    const declaration = declareKnowledge(collection);
    expect(declaration.intentId).toBe('intent-custom-001');
  });

  it('receptionId matches the input collection', () => {
    const collection = makeCollection([], { receptionId: 'rcp-custom-001' });
    const declaration = declareKnowledge(collection);
    expect(declaration.receptionId).toBe('rcp-custom-001');
  });

  it('origin=CITIZEN is preserved', () => {
    const collection = makeCollection([], { origin: 'CITIZEN' });
    const declaration = declareKnowledge(collection);
    expect(declaration.origin).toBe('CITIZEN');
  });

  it('Citizen collection has null sovereignLineage in declaration', () => {
    const collection = makeCollection([], { origin: 'CITIZEN', sovereignLineage: null });
    const declaration = declareKnowledge(collection);
    expect(declaration.sovereignLineage).toBeNull();
  });

  it('claim field equals collection.claim.normalizedStatement', () => {
    const collection = makeCollection([], {
      claim: { ...DEFAULT_CLAIM, normalizedStatement: 'what is quantum entanglement' },
    });
    const declaration = declareKnowledge(collection);
    expect(declaration.claim).toBe('what is quantum entanglement');
  });
});

// ─── SECTION 8: SOVEREIGN LINEAGE ────────────────────────────────────────────

describe('Sovereign lineage — preserved in full from Makman path', () => {
  it('Sovereign collection: origin=SOVEREIGN preserved', () => {
    const collection = makeCollection([], {
      origin: 'SOVEREIGN',
      sovereignLineage: SOVEREIGN_LINEAGE,
    });
    const declaration = declareKnowledge(collection);
    expect(declaration.origin).toBe('SOVEREIGN');
  });

  it('Sovereign collection: sovereignLineage is non-null', () => {
    const collection = makeCollection([], {
      origin: 'SOVEREIGN',
      sovereignLineage: SOVEREIGN_LINEAGE,
    });
    const declaration = declareKnowledge(collection);
    expect(declaration.sovereignLineage).not.toBeNull();
  });

  it('preserves goalId from lineage', () => {
    const collection = makeCollection([], {
      origin: 'SOVEREIGN',
      sovereignLineage: { ...SOVEREIGN_LINEAGE, goalId: 'goal-xyz-special' },
    });
    const declaration = declareKnowledge(collection);
    expect(declaration.sovereignLineage?.goalId).toBe('goal-xyz-special');
  });

  it('preserves criterionId from lineage', () => {
    const collection = makeCollection([], {
      origin: 'SOVEREIGN',
      sovereignLineage: { ...SOVEREIGN_LINEAGE, criterionId: 'crit-99' },
    });
    const declaration = declareKnowledge(collection);
    expect(declaration.sovereignLineage?.criterionId).toBe('crit-99');
  });

  it('preserves gapClass from lineage', () => {
    const collection = makeCollection([], {
      origin: 'SOVEREIGN',
      sovereignLineage: { ...SOVEREIGN_LINEAGE, gapClass: 'FULFILLMENT_GAP' },
    });
    const declaration = declareKnowledge(collection);
    expect(declaration.sovereignLineage?.gapClass).toBe('FULFILLMENT_GAP');
  });
});

// ─── SECTION 9: CITIZEN FULL CHAIN ───────────────────────────────────────────

describe('Citizen full chain — Reception → Understanding → Investigation → Evidence → Knowledge', () => {
  it('produces a KnowledgeDeclaration with origin=CITIZEN', async () => {
    const { declaration } = await citizenKnowledgeChain('What is photosynthesis?', 'biology');
    expect(declaration.origin).toBe('CITIZEN');
  });

  it('declarationId is non-empty', async () => {
    const { declaration } = await citizenKnowledgeChain(
      'How does the immune system work?',
      'biology',
    );
    expect(declaration.declarationId.length).toBeGreaterThan(0);
  });

  it('receptionId chains from Reception to Declaration', async () => {
    const { reception, declaration } = await citizenKnowledgeChain(
      'What is entropy?',
      'thermodynamics',
    );
    expect(declaration.receptionId).toBe(reception.receptionId);
  });

  it('intentId chains from Understanding to Declaration', async () => {
    const { intent, declaration } = await citizenKnowledgeChain(
      'What is quantum mechanics?',
      'physics',
    );
    expect(declaration.intentId).toBe(intent.intentId);
  });

  it('collectionId chains from Evidence to Declaration', async () => {
    const { collection, declaration } = await citizenKnowledgeChain(
      'What is the speed of light?',
      'physics',
    );
    expect(declaration.collectionId).toBe(collection.collectionId);
  });

  it('Citizen declaration has null sovereignLineage', async () => {
    const { declaration } = await citizenKnowledgeChain(
      'What is dark matter?',
      'astrophysics',
    );
    expect(declaration.sovereignLineage).toBeNull();
  });

  it('declaredAtMs is a recent timestamp', async () => {
    const before = Date.now();
    const { declaration } = await citizenKnowledgeChain('What is gravity?', 'physics');
    const after = Date.now();
    expect(declaration.declaredAtMs).toBeGreaterThanOrEqual(before);
    expect(declaration.declaredAtMs).toBeLessThanOrEqual(after);
  });
});

// ─── SECTION 10: SOVEREIGN FULL CHAIN ────────────────────────────────────────

describe('Sovereign full chain — Reception → Understanding → Investigation → Evidence → Knowledge', () => {
  it('produces a KnowledgeDeclaration with origin=SOVEREIGN', async () => {
    const { declaration } = await sovereignKnowledgeChain();
    expect(declaration.origin).toBe('SOVEREIGN');
  });

  it('Sovereign declaration has non-null sovereignLineage', async () => {
    const { declaration } = await sovereignKnowledgeChain();
    expect(declaration.sovereignLineage).not.toBeNull();
  });

  it('preserves goalId through the full Sovereign chain', async () => {
    const { declaration } = await sovereignKnowledgeChain({ goalId: 'goal-integration-test' });
    expect(declaration.sovereignLineage?.goalId).toBe('goal-integration-test');
  });

  it('receptionId chains from Sovereign Reception to Declaration', async () => {
    const { reception, declaration } = await sovereignKnowledgeChain();
    expect(declaration.receptionId).toBe(reception.receptionId);
  });

  it('FULFILLMENT_GAP sovereign request produces a declaration', async () => {
    const { declaration } = await sovereignKnowledgeChain({
      gapClass: 'FULFILLMENT_GAP',
      gapCategory: 'FULFILLMENT_ABSENT',
      questionStatement: 'Did the Creator achieve 1000 subscribers in 90 days?',
    });
    expect(declaration.declarationId).toBeTruthy();
    expect(declaration.sovereignLineage?.gapClass).toBe('FULFILLMENT_GAP');
  });
});
