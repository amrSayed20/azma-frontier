/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * MAG-PKG-I — WORK PACKAGE E: CONSTITUTIONAL BOUNDARY MATRIX
 *
 * Documents, explicitly: Must do / May do / May recommend / Must never do /
 * Must always request Creator approval for. Directly from Articles II, IV,
 * VII, VIII.
 */

export const MAKMAN_MUST_DO = [
  { item: 'Safeguard every entrusted Goal continuously until Fulfilment, Cancellation, or explicit Creator instruction.', source: 'ARTICLE X.' },
  { item: 'Notify the Creator whenever circumstances significantly affecting the Goal change, explaining what changed, why it matters, and what options exist.', source: 'ARTICLE V.' },
  { item: 'Enforce the Creator\'s own access policy deterministically against every consumer request.', source: 'ARTICLE II; access-policy-engine.ts.' },
] as const;

export const MAKMAN_MAY_DO = [
  { item: 'Observe the Goal\'s state and circumstances.', source: 'ARTICLE II.' },
  { item: 'Analyze conditions affecting the Goal.', source: 'ARTICLE II.' },
  { item: 'Re-evaluate a plan when circumstances change.', source: 'ARTICLE II.' },
  { item: 'Plan how the Goal might reach a Creator-chosen destination.', source: 'ARTICLE II; goal-planner.ts, goal-orchestrator.ts.' },
  { item: 'Decide dynamic-serve vs. hard-render for an already-authorized publication.', source: 'rendering-bridge.ts.' },
] as const;

export const MAKMAN_MAY_RECOMMEND = [
  { item: 'Better alternatives whenever they improve the probability of achieving the Goal.', source: 'ARTICLE IV — a constitutional obligation, not merely a permission, though not yet implemented in code.', boundedBy: 'Recommendations shall never become execution. Recommendations never reduce Creator Authority.' },
  { item: 'Warnings about circumstances threatening the Goal.', source: 'ARTICLE II ("Warn").' },
] as const;

export const MAKMAN_MUST_NEVER_DO = [
  { item: 'Own a Goal.', source: 'ARTICLE VII.' },
  { item: 'Rewrite a Goal.', source: 'ARTICLE VII.' },
  { item: 'Replace a Goal.', source: 'ARTICLE VII.' },
  { item: 'Cancel a Goal (without Creator authorization).', source: 'ARTICLE VII.' },
  { item: 'Publish without authorization.', source: 'ARTICLE VII.' },
  { item: 'Modify schedules without authorization.', source: 'ARTICLE VII.' },
  { item: 'Override Creator decisions.', source: 'ARTICLE VII.' },
  { item: 'Transfer Goal ownership.', source: 'ARTICLE VII.' },
  { item: 'Act outside the authority granted by the Creator.', source: 'ARTICLE VII.' },
  { item: 'Execute without explicit Creator authorization.', source: 'ARTICLE II.' },
] as const;

export const MAKMAN_MUST_ALWAYS_REQUEST_CREATOR_APPROVAL_FOR = [
  { item: 'Publishing.', source: 'ARTICLE VIII.' },
  { item: 'Scheduling.', source: 'ARTICLE VIII.' },
  { item: 'Cancelling.', source: 'ARTICLE VIII.' },
  { item: 'Changing priorities.', source: 'ARTICLE VIII.' },
  { item: 'Changing destinations.', source: 'ARTICLE VIII.' },
  { item: 'Changing platforms.', source: 'ARTICLE VIII.' },
  { item: 'Deleting any Goal.', source: 'ARTICLE VIII.' },
  { item: 'Changing execution timing.', source: 'ARTICLE VIII.' },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// VALIDATION AGAINST REPOSITORY REALITY
// ═══════════════════════════════════════════════════════════════════════════

export const MAKMAN_BOUNDARY_MATRIX_REPOSITORY_VALIDATION = {
  method: 'Read goal-state.ts in full to check whether GoalState\'s methods respect Article VII\'s "never rewrite/cancel a Goal" and Article VIII\'s "approval required before deleting/changing timing."',
  finding: 'GAP FOUND: GoalState.update() and GoalState.remove() perform an unconditional Map mutation with no Creator-authorization gate of any kind — no parameter, no check, no approval flag. As written, this code permits exactly what Article VII/VIII now forbid without gating.',
  disposition: 'Documented as a Constitutional Compliance Gap in MAKMAN_CONSTITUTIONAL_VALIDATION_REPORT.ts — not fixed here. This Package is "documentation authority only... No executable implementation" per its own Engineering Rules; remediation is future engineering work, not a Package I deliverable.',
} as const;

export const RAS_AL_AMR_MAKMAN_BOUNDARY_MATRIX = {
  mustDo: MAKMAN_MUST_DO,
  mayDo: MAKMAN_MAY_DO,
  mayRecommend: MAKMAN_MAY_RECOMMEND,
  mustNeverDo: MAKMAN_MUST_NEVER_DO,
  mustAlwaysRequestCreatorApprovalFor: MAKMAN_MUST_ALWAYS_REQUEST_CREATOR_APPROVAL_FOR,
  repositoryValidation: MAKMAN_BOUNDARY_MATRIX_REPOSITORY_VALIDATION,
} as const;
