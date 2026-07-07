/**
 * AZMA OS — RAS AL AMR
 * PACKAGE I — CONSTITUTIONAL FOUNDATION
 * STAGE 4 — STORY
 *
 * This is a faithful translation of the approved Constitutional Story
 * Declaration of RAS AL AMR. No constitutional statement has been added,
 * removed, reinterpreted, or rewritten.
 */

// ── Entry ─────────────────────────────────────────────────────────────────

export const RAS_AL_AMR_ENTRY = {
  notMerely: 'The creator shall not merely enter a chamber.',
  shallEnter: 'The creator shall enter a living creative journey.',
  understandsFirst:
    'The Chamber immediately understands the project before presenting direction.',
} as const;

// ── Discovery ─────────────────────────────────────────────────────────────

export const RAS_AL_AMR_DISCOVERY = {
  reveals: 'The Chamber gradually reveals possibilities.',
  never: 'It never overwhelms the creator with options.',
  ordering: 'Understanding always precedes recommendation.',
} as const;

// ── Guidance ──────────────────────────────────────────────────────────────

export const RAS_AL_AMR_GUIDANCE = {
  appearsOnlyWhen: 'Guidance shall appear only when it creates genuine value.',
  manner: [
    'The Chamber explains.',
    'It never commands.',
  ],
  teaches: [
    'It teaches through creation.',
    'Never through interruption.',
  ],
} as const;

// ── Creation ──────────────────────────────────────────────────────────────

export const RAS_AL_AMR_CREATION = {
  authorRemains: 'The creator remains the author of every important decision.',
  chamberSupports:
    'The Chamber continuously supports artistic intention without replacing it.',
} as const;

// ── Perfection ────────────────────────────────────────────────────────────

export const RAS_AL_AMR_PERFECTION = {
  isNot: 'Perfection is not the elimination of flaws.',
  is: 'Perfection is the faithful expression of intention.',
  refinementStandard:
    'Every refinement shall strengthen meaning rather than decoration.',
} as const;

// ── Screening ─────────────────────────────────────────────────────────────

export const RAS_AL_AMR_SCREENING = {
  transforms: 'Before release, the Chamber transforms into the audience.',
  experiences:
    'The creator experiences the work exactly as others will experience it.',
  remains: [
    'No editing distractions remain.',
    'Only the story.',
  ],
} as const;

// ── Export ────────────────────────────────────────────────────────────────

export const RAS_AL_AMR_EXPORT = {
  is: 'Export is the final creative responsibility.',
  confirms:
    'The Chamber confirms that the creator understands the destination and consequence of every exported version.',
  finalDecision: 'The final decision always belongs to the creator.',
} as const;

// ── Farewell ──────────────────────────────────────────────────────────────

export const RAS_AL_AMR_FAREWELL = {
  ends: 'The session ends with continuity rather than closure.',
  preserves: 'The Chamber preserves creative context for the next return.',
  leavesStronger: 'The creator leaves stronger than when the session began.',
} as const;

// ── THE CONSTITUTIONAL STORY (unified) ───────────────────────────────────

export const RAS_AL_AMR_STORY = {
  entry: RAS_AL_AMR_ENTRY,
  discovery: RAS_AL_AMR_DISCOVERY,
  guidance: RAS_AL_AMR_GUIDANCE,
  creation: RAS_AL_AMR_CREATION,
  perfection: RAS_AL_AMR_PERFECTION,
  screening: RAS_AL_AMR_SCREENING,
  export: RAS_AL_AMR_EXPORT,
  farewell: RAS_AL_AMR_FAREWELL,
} as const;
