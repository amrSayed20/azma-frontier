/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * OPERATIONAL FOUNDATION — MAKMAN RUNTIME CORE (WORK PACKAGE B: RUNTIME LIFECYCLE)
 * (Construction ID MAG-OPF-001)
 *
 * Architects the Runtime Core's instantiation sequence. The ordering below
 * is not invented — it is made explicit from what each Living Layer already
 * declared about its own relationship to the Layer beneath it (Awareness
 * consumes Presence, Guardian consumes Awareness, Strategy consumes
 * Guardian+Awareness, Communication consumes Strategy+Guardian+Awareness).
 * Goal Commitment is appended as the seventh and final stage, per this
 * Package's own directive.
 */

export const MAKMAN_RUNTIME_CORE_LIFECYCLE_STAGES = [
  'Goal Handover',
  'Presence Instantiation',
  'Awareness Instantiation',
  'Guardian Instantiation',
  'Strategy Instantiation',
  'Communication Instantiation',
  'Goal Commitment',
] as const;
export type MakmanRuntimeCoreLifecycleStage = (typeof MAKMAN_RUNTIME_CORE_LIFECYCLE_STAGES)[number];

export interface RasAlAmrMakmanRuntimeLifecycleStageDefinition {
  readonly stage: MakmanRuntimeCoreLifecycleStage;
  readonly entryCondition: string;
  readonly exitCondition: string;
  readonly constitutionalGrounding: string;
}

export const MAKMAN_RUNTIME_CORE_LIFECYCLE_STAGE_DEFINITIONS: readonly RasAlAmrMakmanRuntimeLifecycleStageDefinition[] = [
  {
    stage: 'Goal Handover',
    entryCondition: 'A GoalContract arrives from RAS AL AMR (see MAKMAN_RUNTIME_CORE_RAS_AL_AMR_INTEGRATION.ts).',
    exitCondition: 'GOAL_CUSTODY_COMPONENT.register(goal) succeeds (goal-state.ts, unchanged by MAG-CIC-001 — register() was never gated, and remains so).',
    constitutionalGrounding: 'MAKMAN_GOAL_LIFECYCLE_ARCHITECTURE.ts, Stage 1.',
  },
  {
    stage: 'Presence Instantiation',
    entryCondition: 'Goal Handover has completed; a goalId exists in GoalState.',
    exitCondition: 'A GoalPresenceIdentity value exists ({goalId, presenceId}) — GOAL_PRESENCE_IDENTITY.ts\'s own shape, unmodified.',
    constitutionalGrounding: 'GOAL_PRESENCE_LIFETIME (Living Layer I): "begins... at Goal Handover."',
  },
  {
    stage: 'Awareness Instantiation',
    entryCondition: 'Presence Instantiation has completed; a presenceId exists.',
    exitCondition: 'A GoalAwarenessIdentity value exists ({presenceId, awarenessId}) — GOAL_AWARENESS_IDENTITY.ts\'s own shape, unmodified.',
    constitutionalGrounding: 'GOAL_AWARENESS_SCOPE (Living Layer II): "One Goal Awareness covers exactly one Goal Presence."',
  },
  {
    stage: 'Guardian Instantiation',
    entryCondition: 'Awareness Instantiation has completed; an awarenessId exists.',
    exitCondition: 'A GoalGuardianIdentity value exists ({awarenessId, guardianId}) — GOAL_GUARDIAN_IDENTITY.ts\'s own shape, unmodified.',
    constitutionalGrounding: 'GOAL_GUARDIAN_SCOPE (Living Layer III): "One Goal Guardian covers exactly one Goal Awareness."',
  },
  {
    stage: 'Strategy Instantiation',
    entryCondition: 'Guardian Instantiation has completed; a guardianId exists.',
    exitCondition: 'A GoalStrategyIdentity value exists ({guardianId, strategyId}) — GOAL_STRATEGY_IDENTITY.ts\'s own shape, unmodified.',
    constitutionalGrounding: 'GOAL_STRATEGY_SCOPE (Living Layer IV): "One Goal Strategy covers exactly one Goal Guardian."',
  },
  {
    stage: 'Communication Instantiation',
    entryCondition: 'Strategy Instantiation has completed; a strategyId exists.',
    exitCondition: 'A GoalCommunicationIdentity value exists ({strategyId, communicationId}) — GOAL_COMMUNICATION_IDENTITY.ts\'s own shape, unmodified.',
    constitutionalGrounding: 'GOAL_COMMUNICATION_SCOPE (Living Layer V): "One Goal Communication instance serves exactly one Goal\'s full Living Runtime chain."',
  },
  {
    stage: 'Goal Commitment',
    entryCondition: 'Communication Instantiation has completed AND a CreatorAuthorizationDecision has been supplied for the specific mutation being committed.',
    exitCondition: 'goal-state.ts\'s update()/remove() (MAG-CIC-001) either succeeds (isAuthorized: true) or throws GoalStateAuthorizationError (isAuthorized: false) — never silently no-ops.',
    constitutionalGrounding: 'ARTICLE VIII; MAG-CIC-001; see MAKMAN_RUNTIME_CORE_GOAL_COMMITMENT.ts.',
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// ORDERING VERIFICATION — derived, not invented
// ═══════════════════════════════════════════════════════════════════════════

export const MAKMAN_RUNTIME_CORE_LIFECYCLE_ORDERING_VERIFICATION = {
  method: 'Every consecutive pair above was checked against the later stage\'s own "Relationship With..." construct (GOAL_AWARENESS_RELATIONSHIP_WITH_PRESENCE, GOAL_GUARDIAN_RELATIONSHIP_WITH_AWARENESS, GOAL_STRATEGY_RELATIONSHIP_WITH_GUARDIAN, GOAL_COMMUNICATION_IDENTITY.ts\'s fan-in note) rather than assumed.',
  result: 'PASS — no stage requires a Layer that has not yet been instantiated; Communication\'s fan-in (Strategy + Guardian + Awareness) is satisfied because all three precede it in this sequence.',
} as const;

export const MAKMAN_RUNTIME_CORE_LIFECYCLE_DECLARATION = {
  totalStages: MAKMAN_RUNTIME_CORE_LIFECYCLE_STAGES.length,
  orderingInvented: false,
  orderingDerivedFromExistingRelationshipDeclarations: true,
  status: 'OPERATIONAL FOUNDATION, WORK PACKAGE B, RUNTIME LIFECYCLE, complete.',
} as const;

export const MAKMAN_RUNTIME_CORE_LIFECYCLE_SUMMARY = {
  stages: MAKMAN_RUNTIME_CORE_LIFECYCLE_STAGES,
  stageDefinitions: MAKMAN_RUNTIME_CORE_LIFECYCLE_STAGE_DEFINITIONS,
  orderingVerification: MAKMAN_RUNTIME_CORE_LIFECYCLE_ORDERING_VERIFICATION,
  declaration: MAKMAN_RUNTIME_CORE_LIFECYCLE_DECLARATION,
} as const;
