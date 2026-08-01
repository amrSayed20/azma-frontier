/**
 * SOVEREIGN GAP CLASSIFICATION FOUNDATION
 * Constitutional Foundation Package VII
 *
 * Proves that every CriterionFulfillmentGap receives a constitutional GapClass
 * identifying the nature of the Gap; that EVIDENCE_AVAILABILITY and
 * EVIDENCE_SUFFICIENCY share the OBSERVATION_GAP class (both knowledge gaps);
 * that FULFILLMENT_ABSENT maps to FULFILLMENT_GAP (the reality gap); that
 * SUPPORTS_FULFILLMENT maps to NO_ACTIVE_GAP; that gapClass coexists with
 * gapCategory without replacing it; and that no cause is inferred.
 *
 * Five sections:
 *  1. Classification mapping — each FulfillmentGapCategory → correct GapClass
 *  2. Observation class collapses EVIDENCE_AVAILABILITY and EVIDENCE_SUFFICIENCY
 *  3. FULFILLMENT_GAP is constitutionally distinct from OBSERVATION_GAP
 *  4. NO_ACTIVE_GAP class — no gap, no fabricated class
 *  5. gapClass coexists with gapCategory; no causation; full report coverage
 */

import { deriveGapReport } from '../../chambers/makman-al-ghayah/fulfillment-gap-engine';
import type { GoalFulfillmentAssessment, CriterionAssessment } from '../../chambers/makman-al-ghayah/fulfillment-assessment-contracts';
import type { GapClass } from '../../chambers/makman-al-ghayah/fulfillment-gap-contracts';

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

function classOf(verdict: CriterionAssessment['evidenceVerdict']): GapClass {
  const ca = makeCa({ evidenceVerdict: verdict, observationCount: verdict === 'INSUFFICIENT_EVIDENCE' ? 1 : 0 });
  return deriveGapReport(makeAssessment([ca])).criterionGaps[0].gapClass;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. Classification mapping
// ─────────────────────────────────────────────────────────────────────────────

describe('Package VII — classification mapping: verdict → GapClass', () => {
  it('ASSESSMENT_NOT_POSSIBLE → OBSERVATION_GAP', () => {
    expect(classOf('ASSESSMENT_NOT_POSSIBLE')).toBe<GapClass>('OBSERVATION_GAP');
  });

  it('INSUFFICIENT_EVIDENCE → OBSERVATION_GAP', () => {
    expect(classOf('INSUFFICIENT_EVIDENCE')).toBe<GapClass>('OBSERVATION_GAP');
  });

  it('SUPPORTS_NON_FULFILLMENT → FULFILLMENT_GAP', () => {
    expect(classOf('SUPPORTS_NON_FULFILLMENT')).toBe<GapClass>('FULFILLMENT_GAP');
  });

  it('SUPPORTS_FULFILLMENT → NO_ACTIVE_GAP', () => {
    expect(classOf('SUPPORTS_FULFILLMENT')).toBe<GapClass>('NO_ACTIVE_GAP');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 2. Observation class: EVIDENCE_AVAILABILITY and EVIDENCE_SUFFICIENCY share OBSERVATION_GAP
// ─────────────────────────────────────────────────────────────────────────────

describe('Package VII — OBSERVATION_GAP collapses both knowledge/observability categories', () => {
  it('no-observations gap class equals observations-but-insufficient gap class', () => {
    const noObs = classOf('ASSESSMENT_NOT_POSSIBLE');
    const insuf = classOf('INSUFFICIENT_EVIDENCE');
    expect(noObs).toBe(insuf);
  });

  it('both knowledge-gap categories produce OBSERVATION_GAP, not FULFILLMENT_GAP', () => {
    expect(classOf('ASSESSMENT_NOT_POSSIBLE')).not.toBe<GapClass>('FULFILLMENT_GAP');
    expect(classOf('INSUFFICIENT_EVIDENCE')).not.toBe<GapClass>('FULFILLMENT_GAP');
  });

  it('OBSERVATION_GAP gapCategory is still distinct between the two evidence categories', () => {
    const caAvail = makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' });
    const caSuff = makeCa({ evidenceVerdict: 'INSUFFICIENT_EVIDENCE', observationCount: 3 });
    const gapAvail = deriveGapReport(makeAssessment([caAvail])).criterionGaps[0];
    const gapSuff = deriveGapReport(makeAssessment([caSuff])).criterionGaps[0];
    expect(gapAvail.gapClass).toBe(gapSuff.gapClass);
    expect(gapAvail.gapCategory).not.toBe(gapSuff.gapCategory);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. FULFILLMENT_GAP is constitutionally distinct from OBSERVATION_GAP
// ─────────────────────────────────────────────────────────────────────────────

describe('Package VII — FULFILLMENT_GAP is the reality gap, distinct from knowledge gaps', () => {
  it('FULFILLMENT_GAP class is not OBSERVATION_GAP', () => {
    expect(classOf('SUPPORTS_NON_FULFILLMENT')).not.toBe<GapClass>('OBSERVATION_GAP');
  });

  it('FULFILLMENT_GAP does not share a class with either knowledge-gap verdict', () => {
    const noObsClass = classOf('ASSESSMENT_NOT_POSSIBLE');
    const insufClass = classOf('INSUFFICIENT_EVIDENCE');
    const fulfClass = classOf('SUPPORTS_NON_FULFILLMENT');
    expect(fulfClass).not.toBe(noObsClass);
    expect(fulfClass).not.toBe(insufClass);
  });

  it('all three distinct gap classes (OBSERVATION_GAP, FULFILLMENT_GAP, NO_ACTIVE_GAP) are reachable', () => {
    const classes = new Set([
      classOf('ASSESSMENT_NOT_POSSIBLE'),
      classOf('INSUFFICIENT_EVIDENCE'),
      classOf('SUPPORTS_NON_FULFILLMENT'),
      classOf('SUPPORTS_FULFILLMENT'),
    ]);
    expect(classes.has('OBSERVATION_GAP')).toBe(true);
    expect(classes.has('FULFILLMENT_GAP')).toBe(true);
    expect(classes.has('NO_ACTIVE_GAP')).toBe(true);
    expect(classes.size).toBe(3);
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 4. NO_ACTIVE_GAP class
// ─────────────────────────────────────────────────────────────────────────────

describe('Package VII — NO_ACTIVE_GAP class: evidence supports fulfillment', () => {
  it('SUPPORTS_FULFILLMENT gap class is NO_ACTIVE_GAP', () => {
    const ca = makeCa({ evidenceVerdict: 'SUPPORTS_FULFILLMENT', observationCount: 10, authorizedCount: 10 });
    const gap = deriveGapReport(makeAssessment([ca])).criterionGaps[0];
    expect(gap.gapClass).toBe<GapClass>('NO_ACTIVE_GAP');
  });

  it('NO_ACTIVE_GAP class coexists with null gapStatement', () => {
    const ca = makeCa({ evidenceVerdict: 'SUPPORTS_FULFILLMENT', observationCount: 5 });
    const gap = deriveGapReport(makeAssessment([ca])).criterionGaps[0];
    expect(gap.gapClass).toBe<GapClass>('NO_ACTIVE_GAP');
    expect(gap.gapStatement).toBeNull();
  });

  it('NO_ACTIVE_GAP class is not OBSERVATION_GAP or FULFILLMENT_GAP', () => {
    const cls = classOf('SUPPORTS_FULFILLMENT');
    expect(cls).not.toBe<GapClass>('OBSERVATION_GAP');
    expect(cls).not.toBe<GapClass>('FULFILLMENT_GAP');
  });
});

// ─────────────────────────────────────────────────────────────────────────────
// 5. gapClass coexists with gapCategory; no causation; full report coverage
// ─────────────────────────────────────────────────────────────────────────────

describe('Package VII — gapClass coexists with gapCategory and preserves no-causation rule', () => {
  it('gapClass is present on every CriterionFulfillmentGap in a report', () => {
    const cas = [
      makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE', criterionId: 'c-1' }),
      makeCa({ evidenceVerdict: 'INSUFFICIENT_EVIDENCE', criterionId: 'c-2', observationCount: 2 }),
    ];
    const report = deriveGapReport(makeAssessment(cas));
    for (const gap of report.criterionGaps) {
      expect(gap.gapClass).toBeDefined();
      expect(['OBSERVATION_GAP', 'FULFILLMENT_GAP', 'NO_ACTIVE_GAP']).toContain(gap.gapClass);
    }
  });

  it('gapCategory is still present alongside gapClass — Package VII does not remove it', () => {
    const ca = makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' });
    const gap = deriveGapReport(makeAssessment([ca])).criterionGaps[0];
    expect(gap.gapCategory).toBe('EVIDENCE_AVAILABILITY');
    expect(gap.gapClass).toBe<GapClass>('OBSERVATION_GAP');
  });

  it('gapClass does not replace gapCategory — both are machine-readable', () => {
    const ca = makeCa({ evidenceVerdict: 'INSUFFICIENT_EVIDENCE', observationCount: 5 });
    const gap = deriveGapReport(makeAssessment([ca])).criterionGaps[0];
    expect(gap.gapCategory).toBeDefined();
    expect(gap.gapClass).toBeDefined();
  });

  it('OBSERVATION_GAP class carries no causal sub-diagnosis', () => {
    const ca = makeCa({ evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE' });
    const gap = deriveGapReport(makeAssessment([ca])).criterionGaps[0];
    expect(gap.gapClass).toBe<GapClass>('OBSERVATION_GAP');
    // No business/creative/distribution/strategic sub-class is present
    expect(gap).not.toHaveProperty('subClass');
    expect(gap).not.toHaveProperty('domainClass');
    expect(gap).not.toHaveProperty('causeClass');
  });

  it('FULFILLMENT_GAP class carries no causal sub-diagnosis', () => {
    const ca = makeCa({ evidenceVerdict: 'SUPPORTS_NON_FULFILLMENT', observationCount: 10 });
    const gap = deriveGapReport(makeAssessment([ca])).criterionGaps[0];
    expect(gap.gapClass).toBe<GapClass>('FULFILLMENT_GAP');
    expect(gap).not.toHaveProperty('subClass');
    expect(gap).not.toHaveProperty('domainClass');
    expect(gap).not.toHaveProperty('causeClass');
  });

  it('empty criteria report contains no criterion gaps and no classifications', () => {
    const report = deriveGapReport(makeAssessment([]));
    expect(report.criterionGaps).toHaveLength(0);
  });

  it('criterionDescriptionSnapshot is still preserved alongside gapClass', () => {
    const ca = makeCa({
      evidenceVerdict: 'ASSESSMENT_NOT_POSSIBLE',
      criterionDescriptionSnapshot: 'Reach 10,000 subscribers.',
    });
    const gap = deriveGapReport(makeAssessment([ca])).criterionGaps[0];
    expect(gap.criterionDescriptionSnapshot).toBe('Reach 10,000 subscribers.');
    expect(gap.gapClass).toBe<GapClass>('OBSERVATION_GAP');
  });
});
