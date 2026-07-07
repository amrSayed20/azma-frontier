/**
 * AZMA OS — RAS AL AMR
 * PACKAGE I — CONSTITUTIONAL FOUNDATION
 * STAGE 6 — TIME
 *
 * This is a faithful translation of the approved Constitutional Time
 * Declaration of RAS AL AMR. No constitutional statement has been added,
 * removed, reinterpreted, or rewritten.
 */

// ── Creative Time ─────────────────────────────────────────────────────────

export const RAS_AL_AMR_CREATIVE_TIME = {
  measuredBy:
    'Time inside RAS AL AMR is measured by creative progress rather than elapsed minutes.',
  never: 'The Chamber shall never pressure the creator through artificial urgency.',
  precedence: 'Creative depth always takes precedence over speed.',
} as const;

// ── Pace ──────────────────────────────────────────────────────────────────

export const RAS_AL_AMR_PACE = {
  adapts: "The Chamber shall adapt its pace to the creator's workflow.",
  supports:
    'It shall support deliberate refinement and rapid iteration without changing its constitutional identity.',
} as const;

// ── Focus States ──────────────────────────────────────────────────────────

export const RAS_AL_AMR_FOCUS_STATES = {
  recognizes: 'The Chamber shall recognize different creative focus states.',
  deepConcentration: 'When deep concentration exists, interruptions shall be minimized.',
  guidanceNeeded: 'When guidance is needed, assistance shall appear with restraint.',
} as const;

// ── Deep Editing ──────────────────────────────────────────────────────────

export const RAS_AL_AMR_DEEP_EDITING = {
  feelContinuous: 'Long creative sessions shall feel continuous.',
  preserves:
    'The Chamber shall preserve concentration and reduce unnecessary context switching.',
  objective: 'Creative immersion is a constitutional objective.',
} as const;

// ── Rapid Editing ─────────────────────────────────────────────────────────

export const RAS_AL_AMR_RAPID_EDITING = {
  remainsResponsive:
    'When the creator intentionally works quickly, the Chamber shall remain responsive without sacrificing clarity or constitutional quality.',
} as const;

// ── Interruption Recovery ─────────────────────────────────────────────────

export const RAS_AL_AMR_INTERRUPTION_RECOVERY = {
  shallNotBreak: 'Interruptions shall not break the creative journey.',
  restores:
    'When the creator returns, the Chamber shall restore creative continuity with clarity and confidence.',
} as const;

// ── Automatic Continuation ────────────────────────────────────────────────

export const RAS_AL_AMR_AUTOMATIC_CONTINUATION = {
  remembers: 'The Chamber shall always remember where meaningful creative work paused.',
  feelsNatural: 'Continuation shall feel natural.',
  neverLost: 'The creator shall never feel lost after returning.',
} as const;

// ── Constitutional Principle ──────────────────────────────────────────────

export const RAS_AL_AMR_TIME_CONSTITUTIONAL_PRINCIPLE = {
  never: [
    'The creator shall never feel rushed.',
    'The creator shall never feel abandoned.',
  ],
  existsToServe: [
    'Creative time exists to serve artistic excellence.',
    'Never productivity alone.',
  ],
} as const;

// ── THE CONSTITUTIONAL TIME (unified) ────────────────────────────────────

export const RAS_AL_AMR_TIME = {
  creativeTime: RAS_AL_AMR_CREATIVE_TIME,
  pace: RAS_AL_AMR_PACE,
  focusStates: RAS_AL_AMR_FOCUS_STATES,
  deepEditing: RAS_AL_AMR_DEEP_EDITING,
  rapidEditing: RAS_AL_AMR_RAPID_EDITING,
  interruptionRecovery: RAS_AL_AMR_INTERRUPTION_RECOVERY,
  automaticContinuation: RAS_AL_AMR_AUTOMATIC_CONTINUATION,
  constitutionalPrinciple: RAS_AL_AMR_TIME_CONSTITUTIONAL_PRINCIPLE,
} as const;
