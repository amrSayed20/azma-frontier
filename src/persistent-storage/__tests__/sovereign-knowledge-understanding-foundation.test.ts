/**
 * SOVEREIGN KNOWLEDGE UNDERSTANDING FOUNDATION — Constitutional Foundation Package XI
 * Test suite for the Al Hujjah Al-Damighah understanding stage.
 *
 * Tests cover:
 *   1. Citizen understanding — valid receptions produce intent
 *   2. Citizen understanding — inquiry type classification
 *   3. Sovereign understanding — valid receptions produce intent
 *   4. Sovereign understanding — lineage preservation
 *   5. REJECTED reception — cannot be understood
 *   6. Intent record structure
 *   7. Origin distinction — Citizen and Sovereign intents are never confused
 */

import {
  receiveCitizenKnowledgeRequest,
  receiveSovereignKnowledgeRequest,
} from '../../chambers/hujjah-al-damighah/reception-engine';
import { understandKnowledgeReception } from '../../chambers/hujjah-al-damighah/understanding-engine';
import type { SovereignKnowledgeReceptionPayload } from '../../chambers/hujjah-al-damighah/reception-contracts';

// ─── TEST DATA ──────────────────────────────────────────────────────────────

function citizenReception(query: string, domain = 'general') {
  return receiveCitizenKnowledgeRequest(query, domain);
}

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

function sovereignReception(overrides: Partial<SovereignKnowledgeReceptionPayload> = {}) {
  return receiveSovereignKnowledgeRequest(makeSovereignPayload(overrides));
}

// ─── SECTION 1: CITIZEN UNDERSTANDING — VALID RECEPTIONS ───────────────────

describe('Citizen understanding — valid receptions produce intent', () => {
  it('returns ok=true for a RECEIVED citizen reception', () => {
    const outcome = understandKnowledgeReception(citizenReception('What is quantum computing?'));
    expect(outcome.ok).toBe(true);
  });

  it('produced intent has origin=CITIZEN', () => {
    const outcome = understandKnowledgeReception(citizenReception('How does DNA work?', 'biology'));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.origin).toBe('CITIZEN');
  });

  it('intent preserves the original query as originalWording', () => {
    const reception = citizenReception('  What is relativity?  ', 'physics');
    const outcome = understandKnowledgeReception(reception);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.originalWording).toBe(reception.citizenRequest?.query);
  });

  it('intent normalizedQuery is the query trimmed', () => {
    const reception = citizenReception('What is relativity?', 'physics');
    const outcome = understandKnowledgeReception(reception);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.normalizedQuery).toBe(reception.citizenRequest?.query.trim());
  });

  it('intent domain matches the citizen domain', () => {
    const outcome = understandKnowledgeReception(citizenReception('What is a black hole?', 'astrophysics'));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.domain).toBe('astrophysics');
  });

  it('intent carries the receptionId of its source reception', () => {
    const reception = citizenReception('What is entropy?', 'thermodynamics');
    const outcome = understandKnowledgeReception(reception);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.receptionId).toBe(reception.receptionId);
  });

  it('intent has a non-empty intentId', () => {
    const outcome = understandKnowledgeReception(citizenReception('What is gravity?', 'physics'));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.intentId.length).toBeGreaterThan(0);
  });

  it('citizen intent has sovereignLineage=null', () => {
    const outcome = understandKnowledgeReception(citizenReception('What is light?', 'optics'));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.sovereignLineage).toBeNull();
  });

  it('understoodAtMs is a recent timestamp', () => {
    const before = Date.now();
    const outcome = understandKnowledgeReception(citizenReception('What is sound?', 'acoustics'));
    const after = Date.now();
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.understoodAtMs).toBeGreaterThanOrEqual(before);
    expect(outcome.intent.understoodAtMs).toBeLessThanOrEqual(after);
  });
});

// ─── SECTION 2: CITIZEN UNDERSTANDING — INQUIRY TYPE CLASSIFICATION ─────────

describe('Citizen understanding — inquiry type classification', () => {
  function classify(query: string) {
    const outcome = understandKnowledgeReception(citizenReception(query, 'test'));
    if (!outcome.ok) throw new Error('Reception not ok');
    return outcome.intent.inquiryType;
  }

  it('classifies an evidence request correctly', () => {
    expect(classify('What does the research say about this?')).toBe('EVIDENCE_REQUEST');
    expect(classify('Can you provide data on conversion rates?')).toBe('EVIDENCE_REQUEST');
    expect(classify('Show me proof that this strategy works')).toBe('EVIDENCE_REQUEST');
  });

  it('classifies a comparison correctly', () => {
    expect(classify('What is the difference between React and Angular?')).toBe('COMPARISON');
    expect(classify('Which is better, SEO vs paid advertising?')).toBe('COMPARISON');
    expect(classify('Compare these two approaches')).toBe('COMPARISON');
  });

  it('classifies a learning request correctly', () => {
    expect(classify('How to start a podcast?')).toBe('LEARNING_REQUEST');
    expect(classify('How do I increase my subscriber count?')).toBe('LEARNING_REQUEST');
    expect(classify('Explain how compounding interest works')).toBe('LEARNING_REQUEST');
  });

  it('classifies a development request correctly', () => {
    expect(classify('Build a landing page for my product')).toBe('DEVELOPMENT');
    expect(classify('Create a marketing plan for Q4')).toBe('DEVELOPMENT');
    expect(classify('Design a content calendar')).toBe('DEVELOPMENT');
  });

  it('classifies a verification correctly', () => {
    expect(classify('Is this strategy effective?')).toBe('VERIFICATION');
    expect(classify('Does this approach actually work?')).toBe('VERIFICATION');
    expect(classify('Is it true that email marketing has higher ROI?')).toBe('VERIFICATION');
  });

  it('classifies an idea correctly', () => {
    expect(classify('What if I combined both approaches into one concept?')).toBe('IDEA');
    expect(classify('Explore the possibility of a hybrid model')).toBe('IDEA');
  });

  it('classifies a discovery correctly', () => {
    expect(classify('What is audience segmentation?')).toBe('DISCOVERY');
    expect(classify('What are the key principles of persuasion?')).toBe('DISCOVERY');
    expect(classify('Tell me about storytelling in marketing')).toBe('DISCOVERY');
  });

  it('falls back to QUESTION for unclassifiable queries', () => {
    expect(classify('Where did the first city appear in history?')).toBe('QUESTION');
    expect(classify('When did the printing press change publishing?')).toBe('QUESTION');
  });

  it('inquiry type is non-null for every valid Citizen reception', () => {
    const queries = [
      'What is machine learning?',
      'How to write better?',
      'Compare SEO and PPC',
      'Build a newsletter',
      'Is video content better than text?',
    ];
    for (const q of queries) {
      const outcome = understandKnowledgeReception(citizenReception(q, 'marketing'));
      expect(outcome.ok).toBe(true);
      if (!outcome.ok) continue;
      expect(outcome.intent.inquiryType).not.toBeNull();
    }
  });
});

// ─── SECTION 3: SOVEREIGN UNDERSTANDING — VALID RECEPTIONS ─────────────────

describe('Sovereign understanding — valid receptions produce intent', () => {
  it('returns ok=true for a RECEIVED sovereign reception', () => {
    const outcome = understandKnowledgeReception(sovereignReception());
    expect(outcome.ok).toBe(true);
  });

  it('produced intent has origin=SOVEREIGN', () => {
    const outcome = understandKnowledgeReception(sovereignReception());
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.origin).toBe('SOVEREIGN');
  });

  it('sovereign intent has inquiryType=null', () => {
    const outcome = understandKnowledgeReception(sovereignReception());
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.inquiryType).toBeNull();
  });

  it('sovereign intent has a non-null sovereignLineage', () => {
    const outcome = understandKnowledgeReception(sovereignReception());
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.sovereignLineage).not.toBeNull();
  });

  it('intent domain is "observation" for OBSERVATION_GAP', () => {
    const outcome = understandKnowledgeReception(sovereignReception({ gapClass: 'OBSERVATION_GAP' }));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.domain).toBe('observation');
  });

  it('intent domain is "fulfillment" for FULFILLMENT_GAP', () => {
    const outcome = understandKnowledgeReception(
      sovereignReception({ gapClass: 'FULFILLMENT_GAP', gapCategory: 'FULFILLMENT_ABSENT' }),
    );
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.domain).toBe('fulfillment');
  });

  it('normalizedQuery is the questionStatement trimmed', () => {
    const payload = makeSovereignPayload();
    const outcome = understandKnowledgeReception(receiveSovereignKnowledgeRequest(payload));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.normalizedQuery).toBe(payload.questionStatement.trim());
  });

  it('originalWording is the unmodified questionStatement', () => {
    const payload = makeSovereignPayload();
    const outcome = understandKnowledgeReception(receiveSovereignKnowledgeRequest(payload));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.originalWording).toBe(payload.questionStatement);
  });

  it('intent carries the receptionId of its source reception', () => {
    const reception = sovereignReception();
    const outcome = understandKnowledgeReception(reception);
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.receptionId).toBe(reception.receptionId);
  });
});

// ─── SECTION 4: SOVEREIGN UNDERSTANDING — LINEAGE PRESERVATION ─────────────

describe('Sovereign understanding — lineage preservation', () => {
  it('preserves requestId in sovereignLineage', () => {
    const payload = makeSovereignPayload({ requestId: 'kr-specific-001' });
    const outcome = understandKnowledgeReception(receiveSovereignKnowledgeRequest(payload));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.sovereignLineage?.requestId).toBe('kr-specific-001');
  });

  it('preserves goalId in sovereignLineage', () => {
    const payload = makeSovereignPayload({ goalId: 'goal-xyz' });
    const outcome = understandKnowledgeReception(receiveSovereignKnowledgeRequest(payload));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.sovereignLineage?.goalId).toBe('goal-xyz');
  });

  it('preserves assessmentId in sovereignLineage', () => {
    const payload = makeSovereignPayload({ assessmentId: 'assessment-abc' });
    const outcome = understandKnowledgeReception(receiveSovereignKnowledgeRequest(payload));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.sovereignLineage?.assessmentId).toBe('assessment-abc');
  });

  it('preserves criterionId in sovereignLineage', () => {
    const payload = makeSovereignPayload({ criterionId: 'crit-99' });
    const outcome = understandKnowledgeReception(receiveSovereignKnowledgeRequest(payload));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.sovereignLineage?.criterionId).toBe('crit-99');
  });

  it('preserves criterionDescriptionSnapshot in sovereignLineage', () => {
    const snapshot = 'Achieve 500 qualified leads by Q4.';
    const payload = makeSovereignPayload({ criterionDescriptionSnapshot: snapshot });
    const outcome = understandKnowledgeReception(receiveSovereignKnowledgeRequest(payload));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.sovereignLineage?.criterionDescriptionSnapshot).toBe(snapshot);
  });

  it('preserves gapClass in sovereignLineage', () => {
    const payload = makeSovereignPayload({
      gapClass: 'FULFILLMENT_GAP',
      gapCategory: 'FULFILLMENT_ABSENT',
    });
    const outcome = understandKnowledgeReception(receiveSovereignKnowledgeRequest(payload));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.sovereignLineage?.gapClass).toBe('FULFILLMENT_GAP');
  });

  it('preserves gapCategory in sovereignLineage', () => {
    const payload = makeSovereignPayload({ gapCategory: 'EVIDENCE_SUFFICIENCY' });
    const outcome = understandKnowledgeReception(receiveSovereignKnowledgeRequest(payload));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.sovereignLineage?.gapCategory).toBe('EVIDENCE_SUFFICIENCY');
  });

  it('preserves availability in sovereignLineage', () => {
    const payload = makeSovereignPayload({ availability: 'REQUIRES_INVESTIGATION' });
    const outcome = understandKnowledgeReception(receiveSovereignKnowledgeRequest(payload));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.sovereignLineage?.availability).toBe('REQUIRES_INVESTIGATION');
  });

  it('preserves requestedAtMs in sovereignLineage', () => {
    const ts = 1700123456789;
    const payload = makeSovereignPayload({ requestedAtMs: ts });
    const outcome = understandKnowledgeReception(receiveSovereignKnowledgeRequest(payload));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.sovereignLineage?.requestedAtMs).toBe(ts);
  });
});

// ─── SECTION 5: REJECTED RECEPTION — CANNOT BE UNDERSTOOD ──────────────────

describe('REJECTED reception — cannot be understood', () => {
  it('returns ok=false when the reception is REJECTED (citizen)', () => {
    const rejected = receiveCitizenKnowledgeRequest('Hi', '');
    const outcome = understandKnowledgeReception(rejected);
    expect(outcome.ok).toBe(false);
  });

  it('returns ok=false when the reception is REJECTED (sovereign)', () => {
    const rejected = receiveSovereignKnowledgeRequest(
      makeSovereignPayload({ requestId: '', goalId: '' }),
    );
    const outcome = understandKnowledgeReception(rejected);
    expect(outcome.ok).toBe(false);
  });

  it('carries RECEPTION_REJECTED reason on failure', () => {
    const rejected = receiveCitizenKnowledgeRequest('Hi', '');
    const outcome = understandKnowledgeReception(rejected);
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.reason).toBe('RECEPTION_REJECTED');
  });

  it('preserves the original validation errors on failure', () => {
    const rejected = receiveCitizenKnowledgeRequest('Hi', '');
    expect(rejected.validationErrors.length).toBeGreaterThan(0);
    const outcome = understandKnowledgeReception(rejected);
    expect(outcome.ok).toBe(false);
    if (outcome.ok) return;
    expect(outcome.validationErrors).toEqual(rejected.validationErrors);
  });

  it('does not produce an intent from a REJECTED reception', () => {
    const rejected = receiveCitizenKnowledgeRequest('Hi', '');
    const outcome = understandKnowledgeReception(rejected);
    expect(outcome.ok).toBe(false);
    expect('intent' in outcome).toBe(false);
  });
});

// ─── SECTION 6: INTENT RECORD STRUCTURE ────────────────────────────────────

describe('Intent record structure', () => {
  it('Citizen intent carries all required InvestigationIntent fields', () => {
    const outcome = understandKnowledgeReception(citizenReception('What is time?', 'physics'));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const { intent } = outcome;
    expect(intent).toHaveProperty('intentId');
    expect(intent).toHaveProperty('receptionId');
    expect(intent).toHaveProperty('origin');
    expect(intent).toHaveProperty('normalizedQuery');
    expect(intent).toHaveProperty('originalWording');
    expect(intent).toHaveProperty('domain');
    expect(intent).toHaveProperty('inquiryType');
    expect(intent).toHaveProperty('sovereignLineage');
    expect(intent).toHaveProperty('understoodAtMs');
  });

  it('Sovereign intent carries all required InvestigationIntent fields', () => {
    const outcome = understandKnowledgeReception(sovereignReception());
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const { intent } = outcome;
    expect(intent).toHaveProperty('intentId');
    expect(intent).toHaveProperty('receptionId');
    expect(intent).toHaveProperty('origin');
    expect(intent).toHaveProperty('normalizedQuery');
    expect(intent).toHaveProperty('originalWording');
    expect(intent).toHaveProperty('domain');
    expect(intent).toHaveProperty('inquiryType');
    expect(intent).toHaveProperty('sovereignLineage');
    expect(intent).toHaveProperty('understoodAtMs');
  });

  it('SovereignRequestLineage carries all required lineage fields', () => {
    const outcome = understandKnowledgeReception(sovereignReception());
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    const lineage = outcome.intent.sovereignLineage!;
    expect(lineage).toHaveProperty('requestId');
    expect(lineage).toHaveProperty('goalId');
    expect(lineage).toHaveProperty('assessmentId');
    expect(lineage).toHaveProperty('criterionId');
    expect(lineage).toHaveProperty('criterionDescriptionSnapshot');
    expect(lineage).toHaveProperty('gapClass');
    expect(lineage).toHaveProperty('gapCategory');
    expect(lineage).toHaveProperty('availability');
    expect(lineage).toHaveProperty('requestedAtMs');
  });

  it('each call to understandKnowledgeReception produces a unique intentId', () => {
    const r1 = citizenReception('What is mass?', 'physics');
    const r2 = citizenReception('What is energy?', 'physics');
    const o1 = understandKnowledgeReception(r1);
    const o2 = understandKnowledgeReception(r2);
    expect(o1.ok).toBe(true);
    expect(o2.ok).toBe(true);
    if (!o1.ok || !o2.ok) return;
    expect(o1.intent.intentId).not.toBe(o2.intent.intentId);
  });
});

// ─── SECTION 7: ORIGIN DISTINCTION ─────────────────────────────────────────

describe('Origin distinction — Citizen and Sovereign intents are never confused', () => {
  it('Citizen intent never has a SOVEREIGN origin', () => {
    const outcome = understandKnowledgeReception(citizenReception('What is momentum?', 'physics'));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.origin).not.toBe('SOVEREIGN');
  });

  it('Sovereign intent never has a CITIZEN origin', () => {
    const outcome = understandKnowledgeReception(sovereignReception());
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.origin).not.toBe('CITIZEN');
  });

  it('Citizen intent always has null sovereignLineage', () => {
    const outcome = understandKnowledgeReception(citizenReception('What is force?', 'physics'));
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.sovereignLineage).toBeNull();
  });

  it('Sovereign intent always has null inquiryType', () => {
    const outcome = understandKnowledgeReception(sovereignReception());
    expect(outcome.ok).toBe(true);
    if (!outcome.ok) return;
    expect(outcome.intent.inquiryType).toBeNull();
  });

  it('two different origin paths for the same question produce distinct intents', () => {
    const question = 'What is the current subscriber count?';
    const citizenOutcome = understandKnowledgeReception(citizenReception(question, 'analytics'));
    const sovereignOutcome = understandKnowledgeReception(
      sovereignReception({ questionStatement: question }),
    );
    expect(citizenOutcome.ok).toBe(true);
    expect(sovereignOutcome.ok).toBe(true);
    if (!citizenOutcome.ok || !sovereignOutcome.ok) return;
    expect(citizenOutcome.intent.origin).toBe('CITIZEN');
    expect(sovereignOutcome.intent.origin).toBe('SOVEREIGN');
    expect(citizenOutcome.intent.intentId).not.toBe(sovereignOutcome.intent.intentId);
  });
});
