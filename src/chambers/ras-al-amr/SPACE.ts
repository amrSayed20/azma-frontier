/**
 * AZMA OS — RAS AL AMR
 * PACKAGE I — CONSTITUTIONAL FOUNDATION
 * STAGE 7 — SPACE
 *
 * This is a faithful translation of the approved Constitutional Space
 * Declaration of RAS AL AMR. No constitutional statement has been added,
 * removed, reinterpreted, or rewritten.
 */

// ── Constitutional Principle (introductory) ──────────────────────────────

export const RAS_AL_AMR_SPACE_PRINCIPLE = {
  notDefinedBy: 'Space within RAS AL AMR is not defined by layout.',
  definedBy: 'It is defined by purpose.',
  existsBecause:
    "Every constitutional space shall exist because it serves the creator's journey.",
  never: 'No space shall exist merely for visual appearance.',
} as const;

// ── Workspace ─────────────────────────────────────────────────────────────

export const RAS_AL_AMR_WORKSPACE = {
  is: 'The Workspace is the living creative environment.',
  accommodates:
    'It shall accommodate every creative discipline supported by the Chamber while preserving one unified identity.',
  prioritizes:
    'The Workspace shall always prioritize creative flow over interface complexity.',
} as const;

// ── Viewing Space ─────────────────────────────────────────────────────────

export const RAS_AL_AMR_VIEWING_SPACE = {
  existsFor: 'The Viewing Space exists for observation.',
  allows: 'It allows the creator to examine the work without distraction.',
  ordering: 'Observation shall always precede judgment.',
} as const;

// ── Screening Space ───────────────────────────────────────────────────────

export const RAS_AL_AMR_SCREENING_SPACE = {
  existsFor: 'The Screening Space exists for audience simulation.',
  withdraws: 'When the creator enters this space, the Chamber withdraws.',
  remains: 'Only the creative work and the audience experience remain.',
  never: 'No editing activity shall interfere with this constitutional purpose.',
} as const;

// ── Discussion Space ──────────────────────────────────────────────────────

export const RAS_AL_AMR_DISCUSSION_SPACE = {
  existsFor:
    'The Discussion Space exists for dialogue between the creator and the Chamber.',
  practice: [
    'Recommendations shall be explained.',
    'Questions shall be answered.',
  ],
  preference:
    'Creative understanding shall always be preferred over unexplained authority.',
} as const;

// ── AI Space ──────────────────────────────────────────────────────────────

export const RAS_AL_AMR_AI_SPACE = {
  existsTo: 'The AI Space exists to provide constitutional assistance.',
  remains: [
    'Artificial Intelligence shall remain an advisor.',
    'Never the constitutional authority.',
    'Never the creator.',
  ],
  optional: 'Every recommendation shall remain optional.',
} as const;

// ── Creator Space ─────────────────────────────────────────────────────────

export const RAS_AL_AMR_CREATOR_SPACE = {
  belongsTo: 'The Creator Space belongs exclusively to the creator.',
  never: 'The Chamber shall never diminish creative ownership.',
  remains: 'The creator remains the highest authority over all creative decisions.',
} as const;

// ── Constitutional Principle of Space (closing) ──────────────────────────

export const RAS_AL_AMR_CONSTITUTIONAL_PRINCIPLE_OF_SPACE = {
  everySpaceShallPossess: {
    lead: 'Every constitutional space shall possess:',
    items: [
      'A single clear purpose.',
      'A defined creative responsibility.',
      'Respect for the creator.',
      'Consistency with the Constitutional Soul.',
    ],
  },
  necessity: 'No constitutional space shall exist without necessity.',
} as const;

// ── THE CONSTITUTIONAL SPACE (unified) ───────────────────────────────────

export const RAS_AL_AMR_SPACE = {
  principle: RAS_AL_AMR_SPACE_PRINCIPLE,
  workspace: RAS_AL_AMR_WORKSPACE,
  viewingSpace: RAS_AL_AMR_VIEWING_SPACE,
  screeningSpace: RAS_AL_AMR_SCREENING_SPACE,
  discussionSpace: RAS_AL_AMR_DISCUSSION_SPACE,
  aiSpace: RAS_AL_AMR_AI_SPACE,
  creatorSpace: RAS_AL_AMR_CREATOR_SPACE,
  constitutionalPrincipleOfSpace: RAS_AL_AMR_CONSTITUTIONAL_PRINCIPLE_OF_SPACE,
} as const;
