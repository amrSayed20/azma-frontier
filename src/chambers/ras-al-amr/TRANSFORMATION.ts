/**
 * AZMA OS — RAS AL AMR
 * PACKAGE I — CONSTITUTIONAL FOUNDATION
 * STAGE 10 — TRANSFORMATION
 *
 * This is a faithful translation of the approved Constitutional
 * Transformation Declaration of RAS AL AMR. No constitutional statement has
 * been added, removed, reinterpreted, or rewritten.
 */

// ── Constitutional Principle (introductory) ──────────────────────────────

export const RAS_AL_AMR_TRANSFORMATION_PRINCIPLE = {
  everySession: 'Every completed creative session shall produce positive transformation.',
  is: 'Transformation is the constitutional purpose of growth.',
  nothing: 'Nothing should leave the Chamber unchanged.',
} as const;

// ── Project Transformation ────────────────────────────────────────────────

export const RAS_AL_AMR_PROJECT_TRANSFORMATION = {
  becomesStronger: 'Every project shall become stronger than when it entered.',
  improves: {
    lead: 'The Chamber shall improve:',
    items: [
      'Creative clarity.',
      'Emotional communication.',
      'Narrative strength.',
      'Artistic consistency.',
      'Technical refinement.',
    ],
  },
  without: "Without compromising the creator's original intention.",
} as const;

// ── Creator Transformation ────────────────────────────────────────────────

export const RAS_AL_AMR_CREATOR_TRANSFORMATION = {
  strengthens: 'Every creative journey shall strengthen the creator.',
  develops: {
    lead: 'The Chamber shall help develop:',
    items: [
      'Artistic confidence.',
      'Creative judgment.',
      'Professional discipline.',
      'Storytelling ability.',
      'Independent creative thinking.',
    ],
  },
  becomes: 'The creator shall become more capable, never more dependent.',
} as const;

// ── Chamber Transformation ────────────────────────────────────────────────

export const RAS_AL_AMR_CHAMBER_TRANSFORMATION = {
  improves: 'The Chamber shall continuously improve its understanding.',
  learnsFrom: {
    lead: 'It learns from:',
    items: [
      'Accepted recommendations.',
      'Rejected recommendations.',
      'Creative evolution.',
      'Director DNA.',
      'Artistic growth.',
    ],
  },
  never: 'The Chamber shall never stop learning.',
} as const;

// ── Continuous Improvement ────────────────────────────────────────────────

export const RAS_AL_AMR_CONTINUOUS_IMPROVEMENT = {
  cumulative: 'Transformation is cumulative.',
  everySessionShallLeave: {
    lead: 'Every session shall leave:',
    items: [
      'The project stronger.',
      'The creator wiser.',
      'The Chamber more understanding.',
    ],
  },
  completionStandard:
    'No session shall be considered complete unless all three have progressed.',
} as const;

// ── Constitutional Limits ─────────────────────────────────────────────────

export const RAS_AL_AMR_TRANSFORMATION_LIMITS = {
  shallNever: {
    lead: 'Transformation shall never:',
    items: [
      'Replace identity.',
      'Force conformity.',
      'Reduce originality.',
      'Punish experimentation.',
      'Prioritize automation over creativity.',
    ],
  },
  existsTo:
    "Transformation exists to reveal the strongest version of the creator's own vision.",
} as const;

// ── Success Principle ─────────────────────────────────────────────────────

export const RAS_AL_AMR_TRANSFORMATION_SUCCESS_PRINCIPLE = {
  achievedWhen: 'The highest constitutional success is achieved when:',
  statement: [
    'The creator no longer notices the Chamber...',
    'only the improvement of the work.',
  ],
} as const;

// ── THE CONSTITUTIONAL TRANSFORMATION (unified) ──────────────────────────

export const RAS_AL_AMR_TRANSFORMATION = {
  principle: RAS_AL_AMR_TRANSFORMATION_PRINCIPLE,
  projectTransformation: RAS_AL_AMR_PROJECT_TRANSFORMATION,
  creatorTransformation: RAS_AL_AMR_CREATOR_TRANSFORMATION,
  chamberTransformation: RAS_AL_AMR_CHAMBER_TRANSFORMATION,
  continuousImprovement: RAS_AL_AMR_CONTINUOUS_IMPROVEMENT,
  constitutionalLimits: RAS_AL_AMR_TRANSFORMATION_LIMITS,
  successPrinciple: RAS_AL_AMR_TRANSFORMATION_SUCCESS_PRINCIPLE,
} as const;
