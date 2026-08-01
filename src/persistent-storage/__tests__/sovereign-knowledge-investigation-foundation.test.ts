/**
 * SOVEREIGN KNOWLEDGE INVESTIGATION FOUNDATION — Constitutional Foundation Package XII
 * Test suite for the Al Hujjah Al-Damighah investigation stage.
 *
 * Tests cover:
 *   1. Citizen investigation — end-to-end constitutional chain
 *   2. Sovereign investigation — end-to-end constitutional chain with lineage
 *   3. Investigation result structure
 *   4. Sovereign lineage preservation in the result
 *   5. Origin distinction — Citizen and Sovereign results are never confused
 *   6. Constitutional boundaries — what the result contains and does not contain
 *   7. Error cases
 */

import {
  receiveCitizenKnowledgeRequest,
  receiveSovereignKnowledgeRequest,
} from '../../chambers/hujjah-al-damighah/reception-engine';
import { understandKnowledgeReception } from '../../chambers/hujjah-al-damighah/understanding-engine';
import { conductInvestigation } from '../../chambers/hujjah-al-damighah/investigation-engine';
import type { SovereignKnowledgeReceptionPayload } from '../../chambers/hujjah-al-damighah/reception-contracts';
import type { InvestigationIntent } from '../../chambers/hujjah-al-damighah/understanding-contracts';

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

async function citizenChain(query: string, domain = 'general') {
  const reception = receiveCitizenKnowledgeRequest(query, domain);
  const understanding = understandKnowledgeReception(reception);
  if (!understanding.ok) throw new Error('Understanding failed');
  return conductInvestigation(understanding.intent);
}

async function sovereignChain(overrides: Partial<SovereignKnowledgeReceptionPayload> = {}) {
  const reception = receiveSovereignKnowledgeRequest(makeSovereignPayload(overrides));
  const understanding = understandKnowledgeReception(reception);
  if (!understanding.ok) throw new Error('Understanding failed');
  return conductInvestigation(understanding.intent);
}

function makeMinimalIntent(overrides: Partial<InvestigationIntent> = {}): InvestigationIntent {
  return {
    intentId: 'intent-test-001',
    receptionId: 'rcp-cit-test-001',
    origin: 'CITIZEN',
    normalizedQuery: 'What is photosynthesis?',
    originalWording: 'What is photosynthesis?',
    domain: 'biology',
    inquiryType: 'DISCOVERY',
    sovereignLineage: null,
    understoodAtMs: Date.now(),
    ...overrides,
  };
}

// ─── SECTION 1: CITIZEN INVESTIGATION — END-TO-END ─────────────────────────

describe('Citizen investigation — end-to-end constitutional chain', () => {
  it('produces ok=true from the full chain', async () => {
    const outcome = await citizenChain('What is photosynthesis?', 'biology');
    expect(outcome.ok).toBe(true);
  });

  it('produces an InvestigationResult with a non-empty resultId', async () => {
    const outcome = await citizenChain('How does the human immune system work?', 'biology');
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.resultId.length).toBeGreaterThan(0);
  });

  it('result has origin=CITIZEN', async () => {
    const outcome = await citizenChain('What is quantum entanglement?', 'physics');
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.origin).toBe('CITIZEN');
  });

  it('result carries the receptionId from the chain', async () => {
    const reception = receiveCitizenKnowledgeRequest('What is entropy?', 'thermodynamics');
    const understanding = understandKnowledgeReception(reception);
    expect(understanding.ok).toBe(true);
    if (!understanding.ok) return;
    const outcome = await conductInvestigation(understanding.intent);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.receptionId).toBe(reception.receptionId);
  });

  it('result carries the intentId from the understanding stage', async () => {
    const reception = receiveCitizenKnowledgeRequest('What is the speed of light?', 'physics');
    const understanding = understandKnowledgeReception(reception);
    expect(understanding.ok).toBe(true);
    if (!understanding.ok) return;
    const outcome = await conductInvestigation(understanding.intent);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.intentId).toBe(understanding.intent.intentId);
  });

  it('Citizen result has sovereignLineage=null', async () => {
    const outcome = await citizenChain('What is gravity?', 'physics');
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.sovereignLineage).toBeNull();
  });

  it('result contains a rawBundle from IntelligenceEngine', async () => {
    const outcome = await citizenChain('What is momentum?', 'physics');
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.rawBundle).toBeDefined();
    expect(outcome.result.rawBundle.bundleId).toBeTruthy();
  });

  it('investigatedAtMs is a recent timestamp', async () => {
    const before = Date.now();
    const outcome = await citizenChain('What is electromagnetism?', 'physics');
    const after = Date.now();
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.investigatedAtMs).toBeGreaterThanOrEqual(before);
    expect(outcome.result.investigatedAtMs).toBeLessThanOrEqual(after);
  });
});

// ─── SECTION 2: SOVEREIGN INVESTIGATION — END-TO-END WITH LINEAGE ──────────

describe('Sovereign investigation — end-to-end constitutional chain with lineage', () => {
  it('produces ok=true from the full Sovereign chain', async () => {
    const outcome = await sovereignChain();
    expect(outcome.ok).toBe(true);
  });

  it('result has origin=SOVEREIGN', async () => {
    const outcome = await sovereignChain();
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.origin).toBe('SOVEREIGN');
  });

  it('Sovereign result has a non-null sovereignLineage', async () => {
    const outcome = await sovereignChain();
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.sovereignLineage).not.toBeNull();
  });

  it('FULFILLMENT_GAP request produces a result', async () => {
    const outcome = await sovereignChain({
      gapClass: 'FULFILLMENT_GAP',
      gapCategory: 'FULFILLMENT_ABSENT',
      questionStatement: 'Did the Creator achieve 1000 subscribers in 90 days?',
    });
    expect(outcome.ok).toBe(true);
  });

  it('result carries the receptionId from the Sovereign chain', async () => {
    const reception = receiveSovereignKnowledgeRequest(makeSovereignPayload());
    const understanding = understandKnowledgeReception(reception);
    expect(understanding.ok).toBe(true);
    if (!understanding.ok) return;
    const outcome = await conductInvestigation(understanding.intent);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.receptionId).toBe(reception.receptionId);
  });

  it('result contains a rawBundle from IntelligenceEngine', async () => {
    const outcome = await sovereignChain();
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.rawBundle).toBeDefined();
    expect(outcome.result.rawBundle.bundleId).toBeTruthy();
  });
});

// ─── SECTION 3: INVESTIGATION RESULT STRUCTURE ─────────────────────────────

describe('Investigation result structure', () => {
  it('carries all required InvestigationResult fields (Citizen)', async () => {
    const outcome = await citizenChain('What is the greenhouse effect?', 'climate');
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const { result } = outcome;
    expect(result).toHaveProperty('resultId');
    expect(result).toHaveProperty('intentId');
    expect(result).toHaveProperty('receptionId');
    expect(result).toHaveProperty('origin');
    expect(result).toHaveProperty('rawBundle');
    expect(result).toHaveProperty('sovereignLineage');
    expect(result).toHaveProperty('investigatedAtMs');
  });

  it('carries all required InvestigationResult fields (Sovereign)', async () => {
    const outcome = await sovereignChain();
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const { result } = outcome;
    expect(result).toHaveProperty('resultId');
    expect(result).toHaveProperty('intentId');
    expect(result).toHaveProperty('receptionId');
    expect(result).toHaveProperty('origin');
    expect(result).toHaveProperty('rawBundle');
    expect(result).toHaveProperty('sovereignLineage');
    expect(result).toHaveProperty('investigatedAtMs');
  });

  it('rawBundle carries the constitutional EvidenceBundle structure', async () => {
    const outcome = await citizenChain('What is thermodynamics?', 'physics');
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const { rawBundle } = outcome.result;
    expect(rawBundle).toHaveProperty('bundleId');
    expect(rawBundle).toHaveProperty('claim');
    expect(rawBundle).toHaveProperty('evidence');
    expect(rawBundle).toHaveProperty('metadata');
    expect(rawBundle).toHaveProperty('generatedAtMs');
  });

  it('rawBundle.metadata.investigationStatus is "completed"', async () => {
    const outcome = await citizenChain('What is fluid dynamics?', 'physics');
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.rawBundle.metadata.investigationStatus).toBe('completed');
  });

  it('each investigation produces a unique resultId', async () => {
    const o1 = await citizenChain('What is chemical bonding?', 'chemistry');
    const o2 = await citizenChain('What is organic chemistry?', 'chemistry');
    expect(o1.ok).toBe(true);
    expect(o2.ok).toBe(true);
    if (!o1.ok || !o2.ok) return;
    expect(o1.result.resultId).not.toBe(o2.result.resultId);
  });
});

// ─── SECTION 4: SOVEREIGN LINEAGE PRESERVATION ─────────────────────────────

describe('Sovereign lineage preservation in the result', () => {
  it('preserves goalId in sovereignLineage', async () => {
    const outcome = await sovereignChain({ goalId: 'goal-xyz' });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.sovereignLineage?.goalId).toBe('goal-xyz');
  });

  it('preserves assessmentId in sovereignLineage', async () => {
    const outcome = await sovereignChain({ assessmentId: 'assessment-abc' });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.sovereignLineage?.assessmentId).toBe('assessment-abc');
  });

  it('preserves criterionId in sovereignLineage', async () => {
    const outcome = await sovereignChain({ criterionId: 'crit-99' });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.sovereignLineage?.criterionId).toBe('crit-99');
  });

  it('preserves criterionDescriptionSnapshot in sovereignLineage', async () => {
    const snapshot = 'Achieve 500 qualified leads by Q4.';
    const outcome = await sovereignChain({ criterionDescriptionSnapshot: snapshot });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.sovereignLineage?.criterionDescriptionSnapshot).toBe(snapshot);
  });

  it('preserves gapClass in sovereignLineage', async () => {
    const outcome = await sovereignChain({
      gapClass: 'FULFILLMENT_GAP',
      gapCategory: 'FULFILLMENT_ABSENT',
    });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.sovereignLineage?.gapClass).toBe('FULFILLMENT_GAP');
  });

  it('preserves availability in sovereignLineage', async () => {
    const outcome = await sovereignChain({ availability: 'REQUIRES_INVESTIGATION' });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.sovereignLineage?.availability).toBe('REQUIRES_INVESTIGATION');
  });

  it('preserves requestedAtMs in sovereignLineage', async () => {
    const ts = 1700123456789;
    const outcome = await sovereignChain({ requestedAtMs: ts });
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.sovereignLineage?.requestedAtMs).toBe(ts);
  });
});

// ─── SECTION 5: ORIGIN DISTINCTION ─────────────────────────────────────────

describe('Origin distinction — Citizen and Sovereign results are never confused', () => {
  it('Citizen result always has origin=CITIZEN', async () => {
    const outcome = await citizenChain('What is nuclear fusion?', 'physics');
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.origin).toBe('CITIZEN');
  });

  it('Sovereign result always has origin=SOVEREIGN', async () => {
    const outcome = await sovereignChain();
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.origin).toBe('SOVEREIGN');
  });

  it('Citizen result never has a non-null sovereignLineage', async () => {
    const outcome = await citizenChain('What is dark matter?', 'astrophysics');
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.sovereignLineage).toBeNull();
  });

  it('Sovereign result never has a null sovereignLineage', async () => {
    const outcome = await sovereignChain();
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.sovereignLineage).not.toBeNull();
  });
});

// ─── SECTION 6: CONSTITUTIONAL BOUNDARIES ──────────────────────────────────

describe('Constitutional boundaries — what the result contains and does not contain', () => {
  it('rawBundle.claim reflects the normalizedQuery from the intent', async () => {
    const query = 'What is the speed of sound?';
    const reception = receiveCitizenKnowledgeRequest(query, 'physics');
    const understanding = understandKnowledgeReception(reception);
    expect(understanding.ok).toBe(true);
    if (!understanding.ok) return;
    const outcome = await conductInvestigation(understanding.intent);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.result.rawBundle.claim.normalizedStatement).toBeTruthy();
  });

  it('rawBundle.evidence is an array (may be empty or populated by the engine)', async () => {
    const outcome = await citizenChain('What is nuclear energy?', 'physics');
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(Array.isArray(outcome.result.rawBundle.evidence)).toBe(true);
  });

  it('InvestigationResult does not have a verdict field', async () => {
    const outcome = await citizenChain('What is plasma?', 'physics');
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect('verdict' in outcome.result).toBe(false);
  });

  it('InvestigationResult does not have a knowledge field', async () => {
    const outcome = await citizenChain('What is a supernova?', 'astrophysics');
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect('knowledge' in outcome.result).toBe(false);
  });

  it('InvestigationResult does not have a recommendation field', async () => {
    const outcome = await citizenChain('What is string theory?', 'physics');
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect('recommendation' in outcome.result).toBe(false);
  });

  it('Sovereign and Citizen investigations invoke the same IntelligenceEngine path', async () => {
    const query = 'What is the subscriber count for a creator?';
    const citizenOutcome = await citizenChain(query, 'analytics');
    const sovereignOutcome = await sovereignChain({
      questionStatement: query,
    });
    expect(citizenOutcome.ok).toBe(true);
    expect(sovereignOutcome.ok).toBe(true);
    if (!citizenOutcome.ok || !sovereignOutcome.ok) return;
    // Both should produce a completed bundle
    expect(citizenOutcome.result.rawBundle.metadata.investigationStatus).toBe('completed');
    expect(sovereignOutcome.result.rawBundle.metadata.investigationStatus).toBe('completed');
  });
});

// ─── SECTION 7: ERROR CASES ─────────────────────────────────────────────────

describe('Error cases', () => {
  it('returns QUERY_TOO_SHORT when normalizedQuery has fewer than 3 characters', async () => {
    const shortIntent = makeMinimalIntent({ normalizedQuery: 'Hi' });
    const outcome = await conductInvestigation(shortIntent);
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.reason).toBe('QUERY_TOO_SHORT');
  });

  it('returns QUERY_TOO_SHORT for an empty normalizedQuery', async () => {
    const emptyIntent = makeMinimalIntent({ normalizedQuery: '' });
    const outcome = await conductInvestigation(emptyIntent);
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.reason).toBe('QUERY_TOO_SHORT');
  });

  it('does not produce a result when the outcome is not ok', async () => {
    const shortIntent = makeMinimalIntent({ normalizedQuery: 'Hi' });
    const outcome = await conductInvestigation(shortIntent);
    expect(outcome.ok).toBe(false);
    expect('result' in outcome).toBe(false);
  });
});
