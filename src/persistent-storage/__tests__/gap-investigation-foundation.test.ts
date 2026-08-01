/**
 * SOVEREIGN GAP INVESTIGATION FOUNDATION
 * Constitutional Foundation Package VIII
 *
 * Proves that the Empire can derive the exact knowledge required before a
 * classified Fulfillment Gap can be understood; that OBSERVABLE_INTERNALLY
 * is correctly assigned to EVIDENCE_AVAILABILITY (platform signals already
 * record this automatically); that REQUIRES_INVESTIGATION is correctly
 * assigned to EVIDENCE_SUFFICIENCY and FULFILLMENT_ABSENT (external inquiry
 * is constitutionally required); that NO_ACTIVE_GAP criteria produce no
 * requirement; and that no causal diagnosis or recommendation is present.
 *
 * Six sections:
 *  1. Availability mapping — each FulfillmentGapCategory → correct KnowledgeAvailability
 *  2. NO_ACTIVE_GAP criteria are excluded from the report
 *  3. questionStatement is non-empty and names what must be learned (not why)
 *  4. KnowledgeRequirement preserves all gap-layer fields (goalId, assessmentId, etc.)
 *  5. Empty report when gap report has no active gaps
 *  6. Full multi-criterion report: mixed categories produce correct mixed requirements
 */

import { deriveGapReport } from '../../chambers/makman-al-ghayah/fulfillment-gap-engine';
import { deriveKnowledgeRequirements } from '../../chambers/makman-al-ghayah/gap-investigation-engine';
import type { GoalFulfillmentAssessment, CriterionAssessment } from '../../chambers/makman-al-ghayah/fulfillment-assessment-contracts';
import type { KnowledgeAvailability } from '../../chambers/makman-al-ghayah/gap-investigation-contracts';

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

function requirementForVerdict(verdict: CriterionAssessment['evidenceVerdict']) {
  const obs = verdict === 'INSUFFICIENT_EVIDENCE' ? 3 : 0;
  const ca = makeCa({ evidenceVerdict: verdict, observationCount: obs });
  const gapReport = deriveGapReport(makeAssessment([ca]));
  return deriveKnowledgeRequirements(gapReport);
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Availability mapping
// ─────────────────────────────────────────────────────────────────────────────

describe('Package VIII — availability mapping: verdict → KnowledgeAvailability', () => {
  it('ASSESSMENT_NOT_POSSIBLE → OBSERVABLE_INTERNALLY', () => {
    const report = requirementForVerdict('ASSESSMENT_NOT_POSSIBLE');
    expect(report.requirements).toHaveLength(1);
    expect(report.requirements[0].availability).toBe<KnowledgeAvailability>('OBSERVABLE_INTERNALLY');
  });

  it('INSUFFICIENT_EVIDENCE → REQUIRES_INVESTIGATION', () => {
    const report = requirementForVerdict('INSUFFICIENT_EVIDENCE');
    expect(report.requirements).toHaveLength(1);
    expect(report.requirements[0].availability).toBe<KnowledgeAvailability>('REQUIRES_INVESTIGATION');
  });

  it('SUPPORTS_NON_FULFILLMENT → REQUIRES_INVESTIGATION', () => {
    const report = requirementForVerdict('SUPPORTS_NON_FULFILLMENT');
    expect(report.requirements).toHaveLength(1);
    expect(report.requirements[0].availability).toBe<KnowledgeAvailability>('REQUIRES_INVESTIGATION');
  });

  it('EVIDENCE_SUFFICIENCY and FULFILLMENT_ABSENT both map to REQUIRES_INVESTIGATION', () => {
    const suff = requirementForVerdict('INSUFFICIENT_EVIDENCE').requirements[0].availability;
    const absent = requirementForVerdict('SUPPORTS_NON_FULFILLMENT').requirements[0].availability;
    expect(suff).toBe(absent);
    expect(suff).toBe<KnowledgeAvailability>('REQUIRES_INVESTIGATION');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. NO_ACTIVE_GAP criteria are excluded from the report
// ─────────────────────────────────────────────────────────────────────────────

describe('Package VIII — NO_ACTIVE_GAP criteria produce no KnowledgeRequirement', () => {
  it('SUPPORTS_FULFILLMENT produces zero requirements', () => {
    const report = requirementForVerdict('SUPPORTS_FULFILLMENT');
    expect(report.requirements).toHaveLength(0);
  });

  it('report with only SUPPORTS_FULFILLMENT criteria has empty requirements array', () => {
    const cas = [
      makeCa({ evidenceVerdict: 'SUPPORTS_FULFILLMENT', criterionId: 'c-1', observationCount: 5 }),
      makeCa({ evidenceVerdict: 'SUPPORTS_FULFILLMENT', criterionId: 'c-2', observationCount: 10 }),
    ];
    const gapReport = deriveGapReport(makeAssessment(cas));
    const report = deriveKnowledgeRequirements(gapReport);
    expect(report.requirements).toHaveLength(0);
  });

  it('mixed report excludes only the NO_ACTIVE_GAP criterion', () => {
    const cas = [
      makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE', criterionId: 'c-1' }),
      makeCa({ evidenceVerdict: 'SUPPORTS_FULFILLMENT',    criterionId: 'c-2', observationCount: 10 }),
    ];
    const gapReport = deriveGapReport(makeAssessment(cas));
    const report = deriveKnowledgeRequirements(gapReport);
    expect(report.requirements).toHaveLength(1);
    expect(report.requirements[0].criterionId).toBe('c-1');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. questionStatement: non-empty, names what must be learned
// ─────────────────────────────────────────────────────────────────────────────

describe('Package VIII — questionStatement names what must be learned without causal diagnosis', () => {
  it('EVIDENCE_AVAILABILITY questionStatement is non-empty', () => {
    const req = requirementForVerdict('ASSESSMENT_NOT_POSSIBLE').requirements[0];
    expect(req.questionStatement.length).toBeGreaterThan(0);
  });

  it('EVIDENCE_SUFFICIENCY questionStatement is non-empty', () => {
    const req = requirementForVerdict('INSUFFICIENT_EVIDENCE').requirements[0];
    expect(req.questionStatement.length).toBeGreaterThan(0);
  });

  it('FULFILLMENT_ABSENT questionStatement is non-empty', () => {
    const req = requirementForVerdict('SUPPORTS_NON_FULFILLMENT').requirements[0];
    expect(req.questionStatement.length).toBeGreaterThan(0);
  });

  it('EVIDENCE_AVAILABILITY questionStatement references the criterion description', () => {
    const description = 'Reach 50,000 monthly active users.';
    const ca = makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE', criterionDescriptionSnapshot: description });
    const gapReport = deriveGapReport(makeAssessment([ca]));
    const req = deriveKnowledgeRequirements(gapReport).requirements[0];
    expect(req.questionStatement).toContain(description);
  });

  it('FULFILLMENT_ABSENT questionStatement references the criterion description', () => {
    const description = 'Achieve 1,000 paid subscribers.';
    const ca = makeCa({ evidenceVerdict: 'SUPPORTS_NON_FULFILLMENT', criterionDescriptionSnapshot: description, observationCount: 5 });
    const gapReport = deriveGapReport(makeAssessment([ca]));
    const req = deriveKnowledgeRequirements(gapReport).requirements[0];
    expect(req.questionStatement).toContain(description);
  });

  it('questionStatement contains no causal language ("because", "failed", "wrong")', () => {
    for (const verdict of ['ASSESSMENT_NOT_POSSIBLE', 'INSUFFICIENT_EVIDENCE', 'SUPPORTS_NON_FULFILLMENT'] as const) {
      const req = requirementForVerdict(verdict).requirements[0];
      const lower = req.questionStatement.toLowerCase();
      expect(lower).not.toContain('because');
      expect(lower).not.toContain(' failed');
      expect(lower).not.toContain('wrong');
      expect(lower).not.toContain('you should');
      expect(lower).not.toContain('recommend');
    }
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. KnowledgeRequirement preserves gap-layer fields
// ─────────────────────────────────────────────────────────────────────────────

describe('Package VIII — KnowledgeRequirement carries all gap-layer identification fields', () => {
  it('goalId is preserved from the gap report', () => {
    const ca = makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' });
    const assessment: GoalFulfillmentAssessment = {
      assessmentId: 'fa-xyz',
      goalId: 'goal-abc',
      assessedAtMs: 5_000,
      overallVerdict: 'ASSESSMENT_NOT_POSSIBLE',
      criterionAssessments: [ca],
    };
    const gapReport = deriveGapReport(assessment);
    const req = deriveKnowledgeRequirements(gapReport).requirements[0];
    expect(req.goalId).toBe('goal-abc');
  });

  it('assessmentId is preserved from the gap report', () => {
    const ca = makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' });
    const assessment: GoalFulfillmentAssessment = {
      assessmentId: 'fa-xyz',
      goalId: 'goal-abc',
      assessedAtMs: 5_000,
      overallVerdict: 'ASSESSMENT_NOT_POSSIBLE',
      criterionAssessments: [ca],
    };
    const gapReport = deriveGapReport(assessment);
    const req = deriveKnowledgeRequirements(gapReport).requirements[0];
    expect(req.assessmentId).toBe('fa-xyz');
  });

  it('criterionId is preserved from the source criterion', () => {
    const ca = makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE', criterionId: 'crit-99' });
    const gapReport = deriveGapReport(makeAssessment([ca]));
    const req = deriveKnowledgeRequirements(gapReport).requirements[0];
    expect(req.criterionId).toBe('crit-99');
  });

  it('criterionDescriptionSnapshot is preserved verbatim', () => {
    const desc = 'Reach 1 million impressions across all channels.';
    const ca = makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE', criterionDescriptionSnapshot: desc });
    const gapReport = deriveGapReport(makeAssessment([ca]));
    const req = deriveKnowledgeRequirements(gapReport).requirements[0];
    expect(req.criterionDescriptionSnapshot).toBe(desc);
  });

  it('gapClass is preserved from the CriterionFulfillmentGap', () => {
    const ca = makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' });
    const gapReport = deriveGapReport(makeAssessment([ca]));
    const req = deriveKnowledgeRequirements(gapReport).requirements[0];
    expect(req.gapClass).toBe('OBSERVATION_GAP');
  });

  it('gapCategory is preserved from the CriterionFulfillmentGap', () => {
    const ca = makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' });
    const gapReport = deriveGapReport(makeAssessment([ca]));
    const req = deriveKnowledgeRequirements(gapReport).requirements[0];
    expect(req.gapCategory).toBe('EVIDENCE_AVAILABILITY');
  });

  it('identifiedAtMs is preserved from the gap', () => {
    const ca = makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE', assessedAtMs: 77_777 });
    const gapReport = deriveGapReport(makeAssessment([ca]));
    const req = deriveKnowledgeRequirements(gapReport).requirements[0];
    expect(req.identifiedAtMs).toBe(77_777);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. Empty report when gap report has no active gaps
// ─────────────────────────────────────────────────────────────────────────────

describe('Package VIII — empty requirement report when no active gaps exist', () => {
  it('gap report with zero criteria produces empty requirements', () => {
    const gapReport = deriveGapReport(makeAssessment([]));
    const report = deriveKnowledgeRequirements(gapReport);
    expect(report.requirements).toHaveLength(0);
  });

  it('report metadata (goalId, assessmentId, derivedAtMs) is still present on empty report', () => {
    const assessment: GoalFulfillmentAssessment = {
      assessmentId: 'fa-empty',
      goalId: 'goal-empty',
      assessedAtMs: 1_000,
      overallVerdict: 'ASSESSMENT_NOT_POSSIBLE',
      criterionAssessments: [],
    };
    const gapReport = deriveGapReport(assessment);
    const report = deriveKnowledgeRequirements(gapReport);
    expect(report.goalId).toBe('goal-empty');
    expect(report.assessmentId).toBe('fa-empty');
    expect(report.derivedAtMs).toBeGreaterThan(0);
    expect(report.requirements).toHaveLength(0);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 6. Full multi-criterion report with mixed categories
// ─────────────────────────────────────────────────────────────────────────────

describe('Package VIII — full mixed-criterion report', () => {
  it('three active gaps produce three requirements with correct availabilities', () => {
    const cas = [
      makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE',  criterionId: 'c-1', criterionDescriptionSnapshot: 'Reach 10k users.' }),
      makeCa({ evidenceVerdict: 'INSUFFICIENT_EVIDENCE',    criterionId: 'c-2', criterionDescriptionSnapshot: 'Achieve $10k MRR.', observationCount: 3 }),
      makeCa({ evidenceVerdict: 'SUPPORTS_NON_FULFILLMENT', criterionId: 'c-3', criterionDescriptionSnapshot: 'Hit #1 Product Hunt.', observationCount: 2 }),
      makeCa({ evidenceVerdict: 'SUPPORTS_FULFILLMENT',     criterionId: 'c-4', criterionDescriptionSnapshot: 'Ship v1 publicly.', observationCount: 10 }),
    ];
    const gapReport = deriveGapReport(makeAssessment(cas));
    const report = deriveKnowledgeRequirements(gapReport);

    expect(report.requirements).toHaveLength(3);

    const availabilities = report.requirements.map((r) => r.availability);
    expect(availabilities).toContain<KnowledgeAvailability>('OBSERVABLE_INTERNALLY');
    expect(availabilities.filter((a) => a === 'REQUIRES_INVESTIGATION')).toHaveLength(2);

    const criterionIds = report.requirements.map((r) => r.criterionId);
    expect(criterionIds).toContain('c-1');
    expect(criterionIds).toContain('c-2');
    expect(criterionIds).toContain('c-3');
    expect(criterionIds).not.toContain('c-4');
  });

  it('report-level goalId and assessmentId match the source gap report', () => {
    const ca = makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' });
    const assessment: GoalFulfillmentAssessment = {
      assessmentId: 'fa-multi',
      goalId: 'goal-multi',
      assessedAtMs: 8_000,
      overallVerdict: 'ASSESSMENT_NOT_POSSIBLE',
      criterionAssessments: [ca],
    };
    const gapReport = deriveGapReport(assessment);
    const report = deriveKnowledgeRequirements(gapReport);
    expect(report.goalId).toBe('goal-multi');
    expect(report.assessmentId).toBe('fa-multi');
  });

  it('derivedAtMs is a positive integer on the report', () => {
    const ca = makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' });
    const gapReport = deriveGapReport(makeAssessment([ca]));
    const report = deriveKnowledgeRequirements(gapReport);
    expect(report.derivedAtMs).toBeGreaterThan(0);
  });

  it('no requirement carries a recommendation, remedy, or causal sub-field', () => {
    const cas = [
      makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE',  criterionId: 'c-1' }),
      makeCa({ evidenceVerdict: 'INSUFFICIENT_EVIDENCE',    criterionId: 'c-2', observationCount: 2 }),
      makeCa({ evidenceVerdict: 'SUPPORTS_NON_FULFILLMENT', criterionId: 'c-3', observationCount: 1 }),
    ];
    const gapReport = deriveGapReport(makeAssessment(cas));
    const report = deriveKnowledgeRequirements(gapReport);
    for (const req of report.requirements) {
      expect(req).not.toHaveProperty('remedy');
      expect(req).not.toHaveProperty('recommendation');
      expect(req).not.toHaveProperty('cause');
      expect(req).not.toHaveProperty('causeClass');
      expect(req).not.toHaveProperty('diagnosis');
    }
  });
});
