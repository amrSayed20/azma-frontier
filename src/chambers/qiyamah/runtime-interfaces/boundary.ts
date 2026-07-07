/**
 * AZMA OS — Qiyamah Chamber
 * LIVING RUNTIME INTERFACES — Runtime Dependency Boundary
 * Construction Package: Living Runtime — Stage 6 of 13
 *
 * Declares, per Foundation module (runtime/lifecycle.ts, runtime/states.ts,
 * runtime/signals.ts, runtime/contracts.ts), exactly which exports are PUBLIC
 * (reachable through facade.ts, and therefore usable by a future Application
 * Runtime, Presentation Runtime, UI Runtime, AI Runtime, Engine Runtime, Workflow
 * Runtime, or Execution Runtime) and which are INTERNAL (reachable only from
 * inside the Living Runtime Foundation itself).
 *
 * Partition rule:
 *   A raw table whose direct exposure would let a consumer bypass an existing
 *   guard function and reimplement its own decision is INTERNAL — the guard
 *   function is the only sanctioned way to ask the question the table answers.
 *   Self-documentation (transition ownership prose, traceability prose, the raw
 *   per-state ownership/visibility table) exists for architectural audit, not
 *   operational use, and stays INTERNAL. Everything a future runtime needs to
 *   construct, query, or honor a runtime interaction — types, guard functions,
 *   actor contracts, and the invariant list itself, which exists precisely to be
 *   read and honored — is PUBLIC.
 *
 * This table is verified against the Foundation's actual exports in
 * __tests__/boundary.test.ts — it is not free-floating documentation.
 */

export const RUNTIME_INTERFACE_BOUNDARY = {
  lifecycle: {
    sourceModule: 'runtime/lifecycle.ts',
    public: [
      'RUNTIME_LIFECYCLE_STAGES',
      'RuntimeLifecycleStage',
      'RuntimeLifecycleEvent',
      'isForwardTransition',
      'isRenewalTransition',
      'isSelfLoop',
      'isPermittedLifecycleTransition',
      'isTerminalStage',
      'resolveLifecycleEvent',
    ],
    internal: [
      'RUNTIME_LIFECYCLE_FORWARD_TRANSITIONS',
      'RUNTIME_LIFECYCLE_RENEWAL_TRANSITIONS',
      'RUNTIME_LIFECYCLE_SELF_LOOPS',
      'RUNTIME_LIFECYCLE_TRANSITION_OWNERSHIP',
      'RuntimeLifecycleTraceEntry',
      'RUNTIME_LIFECYCLE_TRACEABILITY',
    ],
  },
  states: {
    sourceModule: 'runtime/states.ts',
    public: [
      'STORY_BEATS', 'StoryBeat',
      'PARTNERSHIP_PHASES', 'PartnershipPhase',
      'TRUST_STATES', 'TrustState',
      'CITIZEN_EXPRESSION_STATES', 'CitizenExpressionState',
      'INVISIBLE_DIRECTOR_MODES', 'InvisibleDirectorMode',
      'GHOST_GUIDE_MODES', 'GhostGuideMode',
      'CHAMBER_RELATIONSHIP_MODES', 'ChamberRelationshipMode',
      'CROSSING_STATES', 'CrossingStateValue',
      'PRESENTATION_STATES', 'PresentationState',
      'RuntimeContext', 'ChamberRuntimeState', 'JourneyState', 'CreativeSessionState',
      'IdeaState', 'PromptState', 'DecisionState', 'DirectorState', 'GhostGuideState',
      'CompanionState', 'ReflectionState', 'RenderingState', 'CompletionState', 'ExitState',
      'RuntimeState', 'RuntimeStateVisibility', 'RuntimeStateMetadataEntry',
    ],
    internal: [
      'RUNTIME_STATE_METADATA',
    ],
  },
  signals: {
    sourceModule: 'runtime/signals.ts',
    public: [
      'RuntimeSignal',
      'RuntimeSignalKind',
      'RUNTIME_SIGNAL_KINDS',
      'RuntimeSignalVisibility',
      'isPermittedEmitter',
      'visibilityOf',
      'isCitizenVisibleEffect',
    ],
    internal: [
      'RUNTIME_SIGNAL_EMITTERS',
      'RUNTIME_SIGNAL_VISIBILITY',
      'CreativeActState',
      'CitizenExpressionForm',
    ],
  },
  contracts: {
    sourceModule: 'runtime/contracts.ts',
    public: [
      'CitizenContract', 'CompanionContract', 'GhostGuideContract',
      'InvisibleDirectorContract', 'CreativeRuntimeContract', 'FutureAIEngineContract',
      'TimingContext',
      'mayGhostGuideIntervene', 'mayCompanionSpeak', 'mayInvisibleDirectorChangeRhythm', 'isChamberSilent',
      'RuntimeInvariant', 'RUNTIME_INVARIANTS',
    ],
    internal: [] as string[],
  },
} as const;

export const RUNTIME_INTERFACE_CONSUMERS = [
  'Application Runtime',
  'Presentation Runtime',
  'UI Runtime',
  'AI Runtime',
  'Engine Runtime',
  'Workflow Runtime',
  'Execution Runtime',
] as const;

export type RuntimeInterfaceConsumer = (typeof RUNTIME_INTERFACE_CONSUMERS)[number];

/**
 * Pure, table-driven guard: is `exportName` part of the public interface
 * surface for `moduleKey`? Mirrors the mechanical, non-deciding guard style of
 * the Foundation itself (Runtime Constitutional Law, Article IV).
 */
export function isPublicRuntimeExport(
  moduleKey: keyof typeof RUNTIME_INTERFACE_BOUNDARY,
  exportName: string,
): boolean {
  return (RUNTIME_INTERFACE_BOUNDARY[moduleKey].public as readonly string[]).includes(exportName);
}

/**
 * Pure, table-driven guard: is `exportName` declared internal-only for
 * `moduleKey`? An export absent from both lists is neither — it does not
 * exist and is not part of this boundary's jurisdiction.
 */
export function isInternalRuntimeExport(
  moduleKey: keyof typeof RUNTIME_INTERFACE_BOUNDARY,
  exportName: string,
): boolean {
  return (RUNTIME_INTERFACE_BOUNDARY[moduleKey].internal as readonly string[]).includes(exportName);
}
