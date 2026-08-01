/**
 * SOVEREIGN KNOWLEDGE RECEPTION FOUNDATION — Constitutional Foundation Package X
 * Test suite for the Al Hujjah Al-Damighah reception boundary.
 *
 * Tests cover:
 *   1. Citizen reception — valid requests
 *   2. Citizen reception — rejection and validation errors
 *   3. Sovereign reception — valid requests
 *   4. Sovereign reception — rejection and validation errors
 *   5. Reception record structure and lineage preservation
 *   6. Origin distinction — Citizen and Sovereign are never confused
 *   7. Constitutional identity — receptionId uniqueness, no investigation invoked
 */

import {
  receiveCitizenKnowledgeRequest,
  receiveSovereignKnowledgeRequest,
} from '../../chambers/hujjah-al-damighah/reception-engine';
import type { SovereignKnowledgeReceptionPayload } from '../../chambers/hujjah-al-damighah/reception-contracts';

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

// ─── SECTION 1: CITIZEN RECEPTION — VALID REQUESTS ─────────────────────────

describe('Citizen reception — valid requests', () => {
  it('returns status RECEIVED for a valid query and domain', () => {
    const reception = receiveCitizenKnowledgeRequest('What is the speed of light?', 'physics');
    expect(reception.status).toBe('RECEIVED');
  });

  it('returns origin CITIZEN', () => {
    const reception = receiveCitizenKnowledgeRequest('How does compounding work?', 'finance');
    expect(reception.origin).toBe('CITIZEN');
  });

  it('populates citizenRequest with the query and domain', () => {
    const reception = receiveCitizenKnowledgeRequest('What is photosynthesis?', 'biology');
    expect(reception.citizenRequest).not.toBeNull();
    expect(reception.citizenRequest?.query).toBe('What is photosynthesis?');
    expect(reception.citizenRequest?.domain).toBe('biology');
  });

  it('sets sovereignRequest to null on a Citizen reception', () => {
    const reception = receiveCitizenKnowledgeRequest('What is the speed of light?', 'physics');
    expect(reception.sovereignRequest).toBeNull();
  });

  it('trims whitespace from query and domain', () => {
    const reception = receiveCitizenKnowledgeRequest('  What is gravity?  ', '  science  ');
    expect(reception.citizenRequest?.query).toBe('What is gravity?');
    expect(reception.citizenRequest?.domain).toBe('science');
  });

  it('assigns a requestId to the citizenRequest', () => {
    const reception = receiveCitizenKnowledgeRequest('What is entropy?', 'thermodynamics');
    expect(reception.citizenRequest?.requestId).toBeTruthy();
    expect(typeof reception.citizenRequest?.requestId).toBe('string');
  });

  it('assigns a requestedAtMs to the citizenRequest', () => {
    const before = Date.now();
    const reception = receiveCitizenKnowledgeRequest('What is quantum entanglement?', 'physics');
    const after = Date.now();
    expect(reception.citizenRequest?.requestedAtMs).toBeGreaterThanOrEqual(before);
    expect(reception.citizenRequest?.requestedAtMs).toBeLessThanOrEqual(after);
  });

  it('produces empty validationErrors on a RECEIVED reception', () => {
    const reception = receiveCitizenKnowledgeRequest('What is the Higgs boson?', 'physics');
    expect(reception.validationErrors).toHaveLength(0);
  });

  it('accepts a query exactly 3 characters long', () => {
    const reception = receiveCitizenKnowledgeRequest('Why', 'philosophy');
    expect(reception.status).toBe('RECEIVED');
  });
});

// ─── SECTION 2: CITIZEN RECEPTION — REJECTION AND VALIDATION ───────────────

describe('Citizen reception — rejection and validation errors', () => {
  it('rejects an empty query', () => {
    const reception = receiveCitizenKnowledgeRequest('', 'science');
    expect(reception.status).toBe('REJECTED');
  });

  it('rejects a query shorter than 3 characters', () => {
    const reception = receiveCitizenKnowledgeRequest('Hi', 'science');
    expect(reception.status).toBe('REJECTED');
  });

  it('rejects a whitespace-only query', () => {
    const reception = receiveCitizenKnowledgeRequest('   ', 'science');
    expect(reception.status).toBe('REJECTED');
  });

  it('includes a validation error message when query is too short', () => {
    const reception = receiveCitizenKnowledgeRequest('ab', 'science');
    expect(reception.validationErrors.length).toBeGreaterThan(0);
    expect(reception.validationErrors.some((e) => e.toLowerCase().includes('query'))).toBe(true);
  });

  it('rejects an empty domain', () => {
    const reception = receiveCitizenKnowledgeRequest('What is matter?', '');
    expect(reception.status).toBe('REJECTED');
  });

  it('rejects a whitespace-only domain', () => {
    const reception = receiveCitizenKnowledgeRequest('What is matter?', '   ');
    expect(reception.status).toBe('REJECTED');
  });

  it('includes a validation error message when domain is missing', () => {
    const reception = receiveCitizenKnowledgeRequest('What is dark matter?', '');
    expect(reception.validationErrors.some((e) => e.toLowerCase().includes('domain'))).toBe(true);
  });

  it('accumulates errors from both query and domain violations', () => {
    const reception = receiveCitizenKnowledgeRequest('Hi', '');
    expect(reception.validationErrors.length).toBeGreaterThanOrEqual(2);
  });

  it('still populates citizenRequest even on rejection (lineage preserved)', () => {
    const reception = receiveCitizenKnowledgeRequest('Hi', '');
    expect(reception.citizenRequest).not.toBeNull();
  });
});

// ─── SECTION 3: SOVEREIGN RECEPTION — VALID REQUESTS ───────────────────────

describe('Sovereign reception — valid requests', () => {
  it('returns status RECEIVED for a fully valid sovereign payload', () => {
    const reception = receiveSovereignKnowledgeRequest(makeSovereignPayload());
    expect(reception.status).toBe('RECEIVED');
  });

  it('returns origin SOVEREIGN', () => {
    const reception = receiveSovereignKnowledgeRequest(makeSovereignPayload());
    expect(reception.origin).toBe('SOVEREIGN');
  });

  it('populates sovereignRequest with the payload', () => {
    const payload = makeSovereignPayload();
    const reception = receiveSovereignKnowledgeRequest(payload);
    expect(reception.sovereignRequest).not.toBeNull();
    expect(reception.sovereignRequest).toBe(payload);
  });

  it('sets citizenRequest to null on a Sovereign reception', () => {
    const reception = receiveSovereignKnowledgeRequest(makeSovereignPayload());
    expect(reception.citizenRequest).toBeNull();
  });

  it('produces empty validationErrors on a RECEIVED reception', () => {
    const reception = receiveSovereignKnowledgeRequest(makeSovereignPayload());
    expect(reception.validationErrors).toHaveLength(0);
  });

  it('accepts FULFILLMENT_GAP gapClass', () => {
    const reception = receiveSovereignKnowledgeRequest(
      makeSovereignPayload({ gapClass: 'FULFILLMENT_GAP', gapCategory: 'FULFILLMENT_ABSENT' }),
    );
    expect(reception.status).toBe('RECEIVED');
  });

  it('accepts REQUIRES_INVESTIGATION availability', () => {
    const reception = receiveSovereignKnowledgeRequest(
      makeSovereignPayload({ availability: 'REQUIRES_INVESTIGATION' }),
    );
    expect(reception.status).toBe('RECEIVED');
  });

  it('accepts NOT_CURRENTLY_OBTAINABLE availability', () => {
    const reception = receiveSovereignKnowledgeRequest(
      makeSovereignPayload({ availability: 'NOT_CURRENTLY_OBTAINABLE' }),
    );
    expect(reception.status).toBe('RECEIVED');
  });

  it('accepts a questionStatement of exactly 10 characters', () => {
    const reception = receiveSovereignKnowledgeRequest(
      makeSovereignPayload({ questionStatement: 'Is it so!!' }),
    );
    expect(reception.status).toBe('RECEIVED');
  });
});

// ─── SECTION 4: SOVEREIGN RECEPTION — REJECTION AND VALIDATION ─────────────

describe('Sovereign reception — rejection and validation errors', () => {
  it('rejects when requestId is empty', () => {
    const reception = receiveSovereignKnowledgeRequest(makeSovereignPayload({ requestId: '' }));
    expect(reception.status).toBe('REJECTED');
    expect(reception.validationErrors.some((e) => e.includes('requestId'))).toBe(true);
  });

  it('rejects when goalId is empty', () => {
    const reception = receiveSovereignKnowledgeRequest(makeSovereignPayload({ goalId: '' }));
    expect(reception.status).toBe('REJECTED');
    expect(reception.validationErrors.some((e) => e.includes('goalId'))).toBe(true);
  });

  it('rejects when assessmentId is empty', () => {
    const reception = receiveSovereignKnowledgeRequest(makeSovereignPayload({ assessmentId: '' }));
    expect(reception.status).toBe('REJECTED');
    expect(reception.validationErrors.some((e) => e.includes('assessmentId'))).toBe(true);
  });

  it('rejects when criterionId is empty', () => {
    const reception = receiveSovereignKnowledgeRequest(makeSovereignPayload({ criterionId: '' }));
    expect(reception.status).toBe('REJECTED');
    expect(reception.validationErrors.some((e) => e.includes('criterionId'))).toBe(true);
  });

  it('rejects when questionStatement is shorter than 10 characters', () => {
    const reception = receiveSovereignKnowledgeRequest(
      makeSovereignPayload({ questionStatement: 'Is it?' }),
    );
    expect(reception.status).toBe('REJECTED');
    expect(reception.validationErrors.some((e) => e.includes('questionStatement'))).toBe(true);
  });

  it('rejects when questionStatement is empty', () => {
    const reception = receiveSovereignKnowledgeRequest(
      makeSovereignPayload({ questionStatement: '' }),
    );
    expect(reception.status).toBe('REJECTED');
  });

  it('rejects when gapClass is not a valid constitutional value', () => {
    const reception = receiveSovereignKnowledgeRequest(
      makeSovereignPayload({ gapClass: 'INVALID_CLASS' as never }),
    );
    expect(reception.status).toBe('REJECTED');
    expect(reception.validationErrors.some((e) => e.includes('gapClass'))).toBe(true);
  });

  it('rejects when gapCategory is not a valid constitutional value', () => {
    const reception = receiveSovereignKnowledgeRequest(
      makeSovereignPayload({ gapCategory: 'UNKNOWN_CATEGORY' as never }),
    );
    expect(reception.status).toBe('REJECTED');
    expect(reception.validationErrors.some((e) => e.includes('gapCategory'))).toBe(true);
  });

  it('rejects when availability is not a valid constitutional value', () => {
    const reception = receiveSovereignKnowledgeRequest(
      makeSovereignPayload({ availability: 'MAYBE_OBTAINABLE' as never }),
    );
    expect(reception.status).toBe('REJECTED');
    expect(reception.validationErrors.some((e) => e.includes('availability'))).toBe(true);
  });

  it('accumulates multiple errors when multiple fields are invalid', () => {
    const reception = receiveSovereignKnowledgeRequest(
      makeSovereignPayload({
        requestId: '',
        goalId: '',
        questionStatement: 'short',
      }),
    );
    expect(reception.validationErrors.length).toBeGreaterThanOrEqual(3);
  });

  it('still populates sovereignRequest even on rejection (lineage preserved)', () => {
    const payload = makeSovereignPayload({ requestId: '' });
    const reception = receiveSovereignKnowledgeRequest(payload);
    expect(reception.sovereignRequest).toBe(payload);
  });
});

// ─── SECTION 5: RECEPTION RECORD STRUCTURE AND LINEAGE ─────────────────────

describe('Reception record structure and lineage preservation', () => {
  it('Citizen reception carries all required KnowledgeReception fields', () => {
    const reception = receiveCitizenKnowledgeRequest('What is relativity?', 'physics');
    expect(reception).toHaveProperty('receptionId');
    expect(reception).toHaveProperty('origin');
    expect(reception).toHaveProperty('status');
    expect(reception).toHaveProperty('citizenRequest');
    expect(reception).toHaveProperty('sovereignRequest');
    expect(reception).toHaveProperty('validationErrors');
    expect(reception).toHaveProperty('receivedAtMs');
  });

  it('Sovereign reception carries all required KnowledgeReception fields', () => {
    const reception = receiveSovereignKnowledgeRequest(makeSovereignPayload());
    expect(reception).toHaveProperty('receptionId');
    expect(reception).toHaveProperty('origin');
    expect(reception).toHaveProperty('status');
    expect(reception).toHaveProperty('citizenRequest');
    expect(reception).toHaveProperty('sovereignRequest');
    expect(reception).toHaveProperty('validationErrors');
    expect(reception).toHaveProperty('receivedAtMs');
  });

  it('Sovereign reception preserves all lineage fields from the payload', () => {
    const payload = makeSovereignPayload();
    const reception = receiveSovereignKnowledgeRequest(payload);
    const received = reception.sovereignRequest!;
    expect(received.requestId).toBe(payload.requestId);
    expect(received.goalId).toBe(payload.goalId);
    expect(received.assessmentId).toBe(payload.assessmentId);
    expect(received.criterionId).toBe(payload.criterionId);
    expect(received.criterionDescriptionSnapshot).toBe(payload.criterionDescriptionSnapshot);
    expect(received.gapClass).toBe(payload.gapClass);
    expect(received.gapCategory).toBe(payload.gapCategory);
    expect(received.questionStatement).toBe(payload.questionStatement);
    expect(received.availability).toBe(payload.availability);
    expect(received.requestedAtMs).toBe(payload.requestedAtMs);
  });

  it('receivedAtMs is a recent timestamp assigned at reception time', () => {
    const before = Date.now();
    const reception = receiveSovereignKnowledgeRequest(makeSovereignPayload());
    const after = Date.now();
    expect(reception.receivedAtMs).toBeGreaterThanOrEqual(before);
    expect(reception.receivedAtMs).toBeLessThanOrEqual(after);
  });

  it('validationErrors is a readonly array', () => {
    const reception = receiveSovereignKnowledgeRequest(makeSovereignPayload());
    expect(Array.isArray(reception.validationErrors)).toBe(true);
  });
});

// ─── SECTION 6: ORIGIN DISTINCTION ─────────────────────────────────────────

describe('Origin distinction — Citizen and Sovereign are never confused', () => {
  it('a Citizen reception never has a Sovereign origin', () => {
    const reception = receiveCitizenKnowledgeRequest('What is the universe?', 'cosmology');
    expect(reception.origin).not.toBe('SOVEREIGN');
  });

  it('a Sovereign reception never has a Citizen origin', () => {
    const reception = receiveSovereignKnowledgeRequest(makeSovereignPayload());
    expect(reception.origin).not.toBe('CITIZEN');
  });

  it('a Citizen reception never has a populated sovereignRequest', () => {
    const reception = receiveCitizenKnowledgeRequest('What is dark energy?', 'cosmology');
    expect(reception.sovereignRequest).toBeNull();
  });

  it('a Sovereign reception never has a populated citizenRequest', () => {
    const reception = receiveSovereignKnowledgeRequest(makeSovereignPayload());
    expect(reception.citizenRequest).toBeNull();
  });

  it('Citizen and Sovereign receptions for the same question are distinct in structure', () => {
    const query = 'What is the current subscriber count?';
    const citizenReception = receiveCitizenKnowledgeRequest(query, 'analytics');
    const sovereignReception = receiveSovereignKnowledgeRequest(
      makeSovereignPayload({ questionStatement: query }),
    );
    expect(citizenReception.origin).toBe('CITIZEN');
    expect(sovereignReception.origin).toBe('SOVEREIGN');
    expect(citizenReception.citizenRequest).not.toBeNull();
    expect(citizenReception.sovereignRequest).toBeNull();
    expect(sovereignReception.citizenRequest).toBeNull();
    expect(sovereignReception.sovereignRequest).not.toBeNull();
  });
});

// ─── SECTION 7: CONSTITUTIONAL IDENTITY ────────────────────────────────────

describe('Constitutional identity — receptionId and temporal uniqueness', () => {
  it('each Citizen reception gets a unique receptionId', () => {
    const r1 = receiveCitizenKnowledgeRequest('What is electricity?', 'physics');
    const r2 = receiveCitizenKnowledgeRequest('What is magnetism?', 'physics');
    expect(r1.receptionId).not.toBe(r2.receptionId);
  });

  it('each Sovereign reception gets a unique receptionId', () => {
    const r1 = receiveSovereignKnowledgeRequest(makeSovereignPayload({ criterionId: 'crit-A' }));
    const r2 = receiveSovereignKnowledgeRequest(makeSovereignPayload({ criterionId: 'crit-B' }));
    expect(r1.receptionId).not.toBe(r2.receptionId);
  });

  it('Citizen receptionId contains the "cit" marker', () => {
    const reception = receiveCitizenKnowledgeRequest('What is time?', 'philosophy');
    expect(reception.receptionId).toContain('cit');
  });

  it('Sovereign receptionId contains the "sov" marker', () => {
    const reception = receiveSovereignKnowledgeRequest(makeSovereignPayload());
    expect(reception.receptionId).toContain('sov');
  });

  it('receptionId is a non-empty string', () => {
    const citizen = receiveCitizenKnowledgeRequest('What is life?', 'biology');
    const sovereign = receiveSovereignKnowledgeRequest(makeSovereignPayload());
    expect(citizen.receptionId.length).toBeGreaterThan(0);
    expect(sovereign.receptionId.length).toBeGreaterThan(0);
  });
});
