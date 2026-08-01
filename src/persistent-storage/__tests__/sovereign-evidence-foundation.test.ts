/**
 * SOVEREIGN EVIDENCE FOUNDATION — Constitutional Foundation Package XIII
 * Test suite for the Al Hujjah Al-Damighah evidence stage.
 *
 * Tests cover:
 *   1. Citizen chain — produces EvidenceCollection
 *   2. Sovereign chain — produces EvidenceCollection with lineage
 *   3. EvidenceCollection structure
 *   4. CollectedEvidence items — evidence preserved, not re-scored
 *   5. Sovereign lineage preservation
 *   6. Origin distinction
 *   7. Constitutional boundaries — what the collection contains and does not contain
 *   8. Constitutional guard — investigation not completed
 */

import {
  receiveCitizenKnowledgeRequest,
  receiveSovereignKnowledgeRequest,
} from '../../chambers/hujjah-al-damighah/reception-engine';
import { understandKnowledgeReception } from '../../chambers/hujjah-al-damighah/understanding-engine';
import { conductInvestigation } from '../../chambers/hujjah-al-damighah/investigation-engine';
import { collectEvidence } from '../../chambers/hujjah-al-damighah/evidence-layer';
import type { SovereignKnowledgeReceptionPayload } from '../../chambers/hujjah-al-damighah/reception-contracts';
import type { InvestigationResult } from '../../chambers/hujjah-al-damighah/investigation-contracts';

// ─── TEST DATA ──────────────────────────────────────────────────────────────

function makeSovereignPayload(
  overrides: Partial<SovereignKnowledgeReceptionPayload> = {},
): SovereignKnowledgeReceptionPayload {
  return {
    requestId: 'kr-goal-001-crit-A-1700000000000',
    goalId: 'goal-001',
    assessmentId: 'assessment-001',
    criterionId: 'crit-A',
    criterionDescriptionSnapshot: 'Reach 1000 subscribers within 90 days.',
    gapClass: 'OBSERVATION_GAP',
    gapCategory: 'EVIDENCE_AVAILABILITY',
    questionStatement: 'What is the current total subscriber count for this Creator?',
    availability: 'OBSERVABLE_INTERNALLY',
    requestedAtMs: 1700000000000,
    ...overrides,
  };
}

async function citizenInvestigationResult(query: string, domain = 'general') {
  const reception = receiveCitizenKnowledgeRequest(query, domain);
  const understanding = understandKnowledgeReception(reception);
  if (!understanding.ok) throw new Error('Understanding failed');
  const outcome = await conductInvestigation(understanding.intent);
  if (!outcome.ok) throw new Error('Investigation failed');
  return outcome.result;
}

async function sovereignInvestigationResult(
  overrides: Partial<SovereignKnowledgeReceptionPayload> = {},
) {
  const reception = receiveSovereignKnowledgeRequest(makeSovereignPayload(overrides));
  const understanding = understandKnowledgeReception(reception);
  if (!understanding.ok) throw new Error('Understanding failed');
  const outcome = await conductInvestigation(understanding.intent);
  if (!outcome.ok) throw new Error('Investigation failed');
  return outcome.result;
}

function makeCompletedResult(overrides: Partial<InvestigationResult> = {}): InvestigationResult {
  const base: InvestigationResult = {
    resultId: 'inv-test-001',
    intentId: 'intent-cit-test',
    receptionId: 'rcp-cit-test',
    origin: 'CITIZEN',
    rawBundle: {
      bundleId: 'bundle-test-001',
      claim: {
        id: 'claim-001',
        originalStatement: 'What is photosynthesis?',
        normalizedStatement: 'What is photosynthesis?',
        targetCategory: 'biology',
        timestampMs: Date.now(),
        keywords: ['what', 'photosynthesis'],
      },
      evidence: [],
      metadata: {
        investigationStatus: 'completed',
        totalSourcesScanned: 0,
        averageEvidenceScore: 0,
      },
      generatedAtMs: Date.now(),
    },
    sovereignLineage: null,
    investigatedAtMs: Date.now(),
  };
  return { ...base, ...overrides };
}

// ─── SECTION 1: CITIZEN CHAIN — PRODUCES EVIDENCE COLLECTION ───────────────

describe('Citizen chain — produces EvidenceCollection', () => {
  it('produces ok=true from the full Citizen chain', async () => {
    const result = await citizenInvestigationResult('What is photosynthesis?', 'biology');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
  });

  it('collection has origin=CITIZEN', async () => {
    const result = await citizenInvestigationResult('What is thermodynamics?', 'physics');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.collection.origin).toBe('CITIZEN');
  });

  it('collection carries a non-empty collectionId', async () => {
    const result = await citizenInvestigationResult('What is chemical bonding?', 'chemistry');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.collection.collectionId.length).toBeGreaterThan(0);
  });

  it('Citizen collection has sovereignLineage=null', async () => {
    const result = await citizenInvestigationResult('What is nuclear fusion?', 'physics');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.collection.sovereignLineage).toBeNull();
  });

  it('collectedAtMs is a recent timestamp', async () => {
    const result = await citizenInvestigationResult('What is plasma?', 'physics');
    const before = Date.now();
    const outcome = collectEvidence(result);
    const after = Date.now();
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.collection.collectedAtMs).toBeGreaterThanOrEqual(before);
    expect(outcome.collection.collectedAtMs).toBeLessThanOrEqual(after);
  });

  it('collection carries the investigationResultId from its source result', async () => {
    const result = await citizenInvestigationResult('What is electricity?', 'physics');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.collection.investigationResultId).toBe(result.resultId);
  });

  it('collection carries the intentId from its source result', async () => {
    const result = await citizenInvestigationResult('What is magnetism?', 'physics');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.collection.intentId).toBe(result.intentId);
  });

  it('collection carries the receptionId from its source result', async () => {
    const result = await citizenInvestigationResult('What is entropy?', 'thermodynamics');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.collection.receptionId).toBe(result.receptionId);
  });
});

// ─── SECTION 2: SOVEREIGN CHAIN — PRODUCES EVIDENCE COLLECTION ─────────────

describe('Sovereign chain — produces EvidenceCollection with lineage', () => {
  it('produces ok=true from the full Sovereign chain', async () => {
    const result = await sovereignInvestigationResult();
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
  });

  it('collection has origin=SOVEREIGN', async () => {
    const result = await sovereignInvestigationResult();
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.collection.origin).toBe('SOVEREIGN');
  });

  it('Sovereign collection has a non-null sovereignLineage', async () => {
    const result = await sovereignInvestigationResult();
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.collection.sovereignLineage).not.toBeNull();
  });

  it('FULFILLMENT_GAP Sovereign request produces a collection', async () => {
    const result = await sovereignInvestigationResult({
      gapClass: 'FULFILLMENT_GAP',
      gapCategory: 'FULFILLMENT_ABSENT',
      questionStatement: 'Did the Creator achieve 1000 subscribers in 90 days?',
    });
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
  });
});

// ─── SECTION 3: EVIDENCECOLLECTION STRUCTURE ───────────────────────────────

describe('EvidenceCollection structure', () => {
  it('carries all required EvidenceCollection fields (Citizen)', async () => {
    const result = await citizenInvestigationResult('What is the greenhouse effect?', 'climate');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const { collection } = outcome;
    expect(collection).toHaveProperty('collectionId');
    expect(collection).toHaveProperty('investigationResultId');
    expect(collection).toHaveProperty('intentId');
    expect(collection).toHaveProperty('receptionId');
    expect(collection).toHaveProperty('origin');
    expect(collection).toHaveProperty('claim');
    expect(collection).toHaveProperty('items');
    expect(collection).toHaveProperty('sovereignLineage');
    expect(collection).toHaveProperty('totalSourcesScanned');
    expect(collection).toHaveProperty('collectedAtMs');
  });

  it('carries all required EvidenceCollection fields (Sovereign)', async () => {
    const result = await sovereignInvestigationResult();
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const { collection } = outcome;
    expect(collection).toHaveProperty('collectionId');
    expect(collection).toHaveProperty('claim');
    expect(collection).toHaveProperty('items');
    expect(collection).toHaveProperty('sovereignLineage');
    expect(collection).toHaveProperty('totalSourcesScanned');
  });

  it('claim carries the SovereignClaim from the investigation', async () => {
    const result = await citizenInvestigationResult('What is fluid dynamics?', 'physics');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.collection.claim).toBe(result.rawBundle.claim);
  });

  it('items is an array', async () => {
    const result = await citizenInvestigationResult('What is quantum tunneling?', 'physics');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(Array.isArray(outcome.collection.items)).toBe(true);
  });

  it('totalSourcesScanned matches the investigation metadata', async () => {
    const result = await citizenInvestigationResult('What is wave-particle duality?', 'physics');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.collection.totalSourcesScanned).toBe(
      Number(result.rawBundle.metadata.totalSourcesScanned),
    );
  });

  it('each call produces a unique collectionId', async () => {
    const r1 = await citizenInvestigationResult('What is Newtonian mechanics?', 'physics');
    const r2 = await citizenInvestigationResult('What is special relativity?', 'physics');
    const o1 = collectEvidence(r1);
    const o2 = collectEvidence(r2);
    expect(o1.ok).toBe(true);
    expect(o2.ok).toBe(true);
    if (!o1.ok || !o2.ok) return;
    expect(o1.collection.collectionId).not.toBe(o2.collection.collectionId);
  });
});

// ─── SECTION 4: COLLECTED EVIDENCE ITEMS ───────────────────────────────────

describe('CollectedEvidence items — evidence preserved, not re-scored', () => {
  it('each item carries the canonical Evidence object from the bundle', async () => {
    const result = await citizenInvestigationResult('What is convection?', 'physics');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const { items } = outcome.collection;
    for (let i = 0; i < items.length; i++) {
      expect(items[i].evidence).toBe(result.rawBundle.evidence[i]);
    }
  });

  it('each item carries the investigationResultId', async () => {
    const result = await citizenInvestigationResult('What is radiation?', 'physics');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    for (const item of outcome.collection.items) {
      expect(item.investigationResultId).toBe(result.resultId);
    }
  });

  it('each item carries the intentId', async () => {
    const result = await citizenInvestigationResult('What is dark energy?', 'physics');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    for (const item of outcome.collection.items) {
      expect(item.intentId).toBe(result.intentId);
    }
  });

  it('each item carries the receptionId', async () => {
    const result = await citizenInvestigationResult('What is string theory?', 'physics');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    for (const item of outcome.collection.items) {
      expect(item.receptionId).toBe(result.receptionId);
    }
  });

  it('each item carries the correct origin', async () => {
    const result = await citizenInvestigationResult('What is superconductivity?', 'physics');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    for (const item of outcome.collection.items) {
      expect(item.origin).toBe('CITIZEN');
    }
  });

  it('evidence confidenceScore is preserved from Investigation, not recomputed', async () => {
    const result = await citizenInvestigationResult('What is osmosis?', 'biology');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    for (let i = 0; i < outcome.collection.items.length; i++) {
      const originalEvidence = result.rawBundle.evidence[i];
      expect(outcome.collection.items[i].evidence.confidenceScore).toBe(
        originalEvidence.confidenceScore,
      );
    }
  });

  it('evidence confidenceLevel is preserved from Investigation, not recomputed', async () => {
    const result = await citizenInvestigationResult('What is diffusion?', 'biology');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    for (let i = 0; i < outcome.collection.items.length; i++) {
      const originalEvidence = result.rawBundle.evidence[i];
      expect(outcome.collection.items[i].evidence.confidenceLevel).toBe(
        originalEvidence.confidenceLevel,
      );
    }
  });

  it('collection item count matches the bundle evidence count', async () => {
    const result = await citizenInvestigationResult('What is protein synthesis?', 'biology');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.collection.items.length).toBe(result.rawBundle.evidence.length);
  });
});

// ─── SECTION 5: SOVEREIGN LINEAGE PRESERVATION ─────────────────────────────

describe('Sovereign lineage preservation', () => {
  it('goalId is preserved in sovereignLineage', async () => {
    const result = await sovereignInvestigationResult({ goalId: 'goal-xyz' });
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.collection.sovereignLineage?.goalId).toBe('goal-xyz');
  });

  it('criterionId is preserved in sovereignLineage', async () => {
    const result = await sovereignInvestigationResult({ criterionId: 'crit-99' });
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.collection.sovereignLineage?.criterionId).toBe('crit-99');
  });

  it('gapClass is preserved in sovereignLineage', async () => {
    const result = await sovereignInvestigationResult({
      gapClass: 'FULFILLMENT_GAP',
      gapCategory: 'FULFILLMENT_ABSENT',
    });
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.collection.sovereignLineage?.gapClass).toBe('FULFILLMENT_GAP');
  });

  it('availability is preserved in sovereignLineage', async () => {
    const result = await sovereignInvestigationResult({ availability: 'REQUIRES_INVESTIGATION' });
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.collection.sovereignLineage?.availability).toBe('REQUIRES_INVESTIGATION');
  });
});

// ─── SECTION 6: ORIGIN DISTINCTION ─────────────────────────────────────────

describe('Origin distinction', () => {
  it('Citizen collection never has SOVEREIGN origin', async () => {
    const result = await citizenInvestigationResult('What is catalysis?', 'chemistry');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.collection.origin).not.toBe('SOVEREIGN');
  });

  it('Sovereign collection never has CITIZEN origin', async () => {
    const result = await sovereignInvestigationResult();
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.collection.origin).not.toBe('CITIZEN');
  });

  it('Citizen collection always has null sovereignLineage', async () => {
    const result = await citizenInvestigationResult('What is oxidation?', 'chemistry');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.collection.sovereignLineage).toBeNull();
  });

  it('Sovereign collection always has non-null sovereignLineage', async () => {
    const result = await sovereignInvestigationResult();
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.collection.sovereignLineage).not.toBeNull();
  });
});

// ─── SECTION 7: CONSTITUTIONAL BOUNDARIES ──────────────────────────────────

describe('Constitutional boundaries', () => {
  it('EvidenceCollection does not have a verdict field', async () => {
    const result = await citizenInvestigationResult('What is reduction?', 'chemistry');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect('verdict' in outcome.collection).toBe(false);
  });

  it('EvidenceCollection does not have a knowledge field', async () => {
    const result = await citizenInvestigationResult('What is fermentation?', 'biology');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect('knowledge' in outcome.collection).toBe(false);
  });

  it('EvidenceCollection does not have a recommendation field', async () => {
    const result = await citizenInvestigationResult('What is metabolism?', 'biology');
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect('recommendation' in outcome.collection).toBe(false);
  });

  it('an empty items array is constitutionally valid', () => {
    const result = makeCompletedResult();
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.collection.items).toHaveLength(0);
  });
});

// ─── SECTION 8: CONSTITUTIONAL GUARD ───────────────────────────────────────

describe('Constitutional guard — investigation not completed', () => {
  it('returns INVESTIGATION_NOT_COMPLETED when investigationStatus is not "completed"', () => {
    const result = makeCompletedResult({
      rawBundle: {
        ...makeCompletedResult().rawBundle,
        metadata: {
          investigationStatus: 'in_progress',
          totalSourcesScanned: 0,
          averageEvidenceScore: 0,
        },
      },
    });
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.reason).toBe('INVESTIGATION_NOT_COMPLETED');
  });

  it('does not produce a collection when investigation is not completed', () => {
    const result = makeCompletedResult({
      rawBundle: {
        ...makeCompletedResult().rawBundle,
        metadata: {
          investigationStatus: 'failed',
          totalSourcesScanned: 0,
          averageEvidenceScore: 0,
        },
      },
    });
    const outcome = collectEvidence(result);
    expect(outcome.ok).toBe(false);
    expect('collection' in outcome).toBe(false);
  });
});
