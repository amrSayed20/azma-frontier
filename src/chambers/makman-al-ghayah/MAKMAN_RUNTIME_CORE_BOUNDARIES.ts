/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * OPERATIONAL FOUNDATION — MAKMAN RUNTIME CORE (WORK PACKAGE G: RUNTIME BOUNDARIES)
 * (Construction ID MAG-OPF-001)
 *
 * The directive's own "shall not" list, mapped to grounding and to a
 * verified compliance statement for each item.
 */

export const MAKMAN_RUNTIME_CORE_SHALL_NEVER = [
  {
    prohibition: 'Modify any Living Layer.',
    constitutionalGrounding: 'The Chief Architect\'s Frozen Constitutional Personality principle.',
    verifiedCompliance: 'git status confirms zero modifications to any GOAL_PRESENCE_*.ts, GOAL_AWARENESS_*.ts, GOAL_GUARDIAN_*.ts, GOAL_STRATEGY_*.ts, or GOAL_COMMUNICATION_*.ts file. MAKMAN_RUNTIME_CORE_ORCHESTRATION.ts only imports their Identity types, never redefines them.',
  },
  {
    prohibition: 'Introduce new constitutional concepts.',
    constitutionalGrounding: 'This Package\'s own Constitutional Boundaries.',
    verifiedCompliance: 'Goal Commitment is the one new term this directive itself introduced, not this Package — given the narrowest possible grounded reading (Article VIII + MAG-CIC-001) rather than an invented concept, and explicitly flagged for confirmation (MAKMAN_RUNTIME_CORE_GOAL_COMMITMENT.ts). CreatorAuthorizationDecision is reused from MAG-CIC-001, not reinvented.',
  },
  {
    prohibition: 'Reinterpret constitutional decisions.',
    constitutionalGrounding: 'The Chief Architect\'s Frozen Constitutional Personality principle.',
    verifiedCompliance: 'MAKMAN_RUNTIME_CORE_ORCHESTRATION.ts performs no Awareness classification, no Guardian protection-domain detection, no Strategy analysis, and no Communication channel logic — those remain exactly the declarative architecture they were certified as.',
  },
  {
    prohibition: 'Bypass Goal Commitment.',
    constitutionalGrounding: 'MAKMAN_RUNTIME_CORE_GOAL_COMMITMENT.ts.',
    verifiedCompliance: 'MakmanGoalRuntime.commitGoal() is the only method in the Package that calls goal-state.ts\'s update()/remove(); every other stage throws MakmanRuntimeSequenceError if called out of order.',
  },
  {
    prohibition: 'Perform infrastructure responsibilities.',
    constitutionalGrounding: 'This Package\'s own Constitutional Boundaries.',
    verifiedCompliance: 'No network call, no database, no external API, no file I/O, no cross-chamber invocation exists anywhere in this Package\'s files. generateLayerId() is an in-memory counter, not infrastructure.',
  },
  {
    prohibition: 'Contain business policy unrelated to Runtime orchestration.',
    constitutionalGrounding: 'This Package\'s own Constitutional Boundaries.',
    verifiedCompliance: 'The only conditional logic in MAKMAN_RUNTIME_CORE_ORCHESTRATION.ts is stage-sequence validation (MakmanRuntimeSequenceError) and a two-way operation switch (update vs. remove) that passes arguments through unchanged — no scoring, no classification, no recommendation content.',
  },
] as const;

export const MAKMAN_RUNTIME_CORE_BOUNDARIES_DECLARATION = {
  everyProhibitionVerified: true,
  status: 'OPERATIONAL FOUNDATION, WORK PACKAGE G, RUNTIME BOUNDARIES, complete.',
} as const;

export const MAKMAN_RUNTIME_CORE_BOUNDARIES_SUMMARY = {
  shallNever: MAKMAN_RUNTIME_CORE_SHALL_NEVER,
  declaration: MAKMAN_RUNTIME_CORE_BOUNDARIES_DECLARATION,
} as const;
