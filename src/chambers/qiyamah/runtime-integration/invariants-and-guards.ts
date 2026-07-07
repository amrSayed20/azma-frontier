/**
 * AZMA OS — Qiyamah Chamber
 * LIVING RUNTIME INTEGRATION MODEL — Integration Invariants and Guards
 * Construction Package: Living Runtime — Stage 11 of 13
 *
 * System-wide invariants synthesized from the strongest invariant in each of the
 * six Living Runtime modules, and the complete, consolidated inventory of every
 * guard function the Living Runtime exposes through runtime-interfaces/facade.ts
 * — cross-checked in __tests__/invariants-and-guards.test.ts against the facade's
 * actual exports.
 *
 * Documentation only — no execution logic, no new guard function, no new invariant.
 */

export interface RuntimeIntegrationInvariant {
  readonly invariant: string;
  readonly source: string;
}

export const RUNTIME_INTEGRATION_INVARIANTS: readonly RuntimeIntegrationInvariant[] = [
  { invariant: 'All seven Runtime Interface contracts are live simultaneously at every moment within a session — never sequentially, never with one dormant.', source: 'RUNTIME_COMPOSITION_RULES.rule_2_simultaneity (composition.ts)' },
  { invariant: 'Every runtime output that reaches the Citizen or another contract satisfies the distributed Tier 2 constraint set — no single bypass path exists.', source: 'RUNTIME_VALIDATION_HIERARCHY.tier_2_boundary_validation (runtime-validation/hierarchy.ts)' },
  { invariant: 'No integration path may promote INTERNAL_ONLY-classified state to visible form, regardless of how many contracts the path traverses.', source: 'RUNTIME_STATE_VISIBILITY_MODEL.INTERNAL_ONLY (runtime-state/taxonomy.ts)' },
  { invariant: 'No integration path may skip, reverse, or self-loop a lifecycle stage except the two explicitly named exceptions (the Directing→Creating renewal, the Clarifying self-loop).', source: 'RUNTIME_LIFECYCLE_RENEWAL_TRANSITIONS, RUNTIME_LIFECYCLE_SELF_LOOPS (runtime/lifecycle.ts)' },
  { invariant: 'No integration path may compose a clock-time measurement into any runtime type, at any point.', source: 'RUNTIME_BOUNDARY_CHECK_CLOCK_TIME (runtime-validation/boundary-checks.ts)' },
  { invariant: 'The four-marker gate (FutureAIEngineContract.pursue()) is the sole integration path into Rendering — no alternate composition of contracts may substitute for it.', source: 'RUNTIME_VALIDATION_3_PRE_PRESENTATION_MARKERS (runtime-validation/validation-points.ts)' },
  { invariant: 'The three crossings integrate in strict sequence (incomplete → outward-registered → inward-registered → relational-registered) regardless of which contracts are involved in producing each.', source: 'STATE_REFLECTION.state_transitions (runtime-state/states.ts)' },
  { invariant: 'A Citizen creative decision, once registered, is never re-opened by any downstream contract.', source: 'RUNTIME_COMPOSITION_RULES (composition.ts), BOUNDARY_CHECK_SOVEREIGNTY-equivalent (runtime-validation/boundary-checks.ts)' },
  { invariant: 'Every session\'s integration completes at Leaving before any reset integration path may run.', source: 'STATE_EXIT.state_invariants (runtime-state/states.ts)' },
];

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME INTEGRATION GUARDS
// The complete inventory of every guard function the Living Runtime exposes,
// and which integration point(s) rely on each.
// ═══════════════════════════════════════════════════════════════════════════

export interface RuntimeIntegrationGuardEntry {
  readonly guard: string;
  readonly usedBy: readonly string[];
}

export const RUNTIME_INTEGRATION_GUARDS: readonly RuntimeIntegrationGuardEntry[] = [
  { guard: 'isForwardTransition',            usedBy: ['LifecycleAndSignalQuerySurface'] },
  { guard: 'isRenewalTransition',            usedBy: ['LifecycleAndSignalQuerySurface', 'FutureAIEngineContract integration'] },
  { guard: 'isSelfLoop',                     usedBy: ['LifecycleAndSignalQuerySurface', 'PromptState integration'] },
  { guard: 'isPermittedLifecycleTransition', usedBy: ['CreativeRuntimeContract', 'JourneyState', 'CreativeSessionState', 'ExitState integration'] },
  { guard: 'isTerminalStage',                usedBy: ['CreativeRuntimeContract', 'ExitState integration'] },
  { guard: 'resolveLifecycleEvent',          usedBy: ['LifecycleAndSignalQuerySurface'] },
  { guard: 'isPermittedEmitter',             usedBy: ['CitizenContract', 'RuntimeValidation1 integration'] },
  { guard: 'visibilityOf',                   usedBy: ['runtime-event integration (event architecture cross-checks)'] },
  { guard: 'isCitizenVisibleEffect',         usedBy: ['runtime-event integration (visibility model)'] },
  { guard: 'mayGhostGuideIntervene',         usedBy: ['GhostGuideContract'] },
  { guard: 'mayCompanionSpeak',              usedBy: ['CompanionContract'] },
  { guard: 'mayInvisibleDirectorChangeRhythm', usedBy: ['InvisibleDirectorContract'] },
  { guard: 'isChamberSilent',                usedBy: ['CreativeRuntimeContract', 'RenderingState', 'ReflectionState integration'] },
  { guard: 'stateMetadataOf',                usedBy: ['LifecycleAndSignalQuerySurface', 'runtime-validation memory-display integration'] },
  { guard: 'stateVisibilityOf',              usedBy: ['LifecycleAndSignalQuerySurface', 'runtime-validation memory-display integration'] },
  { guard: 'isPublicRuntimeExport',          usedBy: ['runtime-validation mechanism-boundary integration'] },
  { guard: 'isInternalRuntimeExport',        usedBy: ['runtime-validation mechanism-boundary integration'] },
];
