/**
 * AZMA OS — Qiyamah Chamber
 * LIVING RUNTIME INTEGRATION MODEL — Dependency Graph
 * Construction Package: Living Runtime — Stage 11 of 13
 *
 * Defines the runtime dependency graph (contract-level) and cross-runtime
 * integration relationships (module-level), consolidating dependency and
 * synchronization notes already established across runtime-behavior/contracts.ts
 * and runtime-state/taxonomy.ts into one integration-level graph.
 *
 * Documentation only — no execution logic, no new dependency.
 */

// ═══════════════════════════════════════════════════════════════════════════
// CROSS-RUNTIME MODULE INTEGRATION RELATIONSHIPS
// The module-level graph — which of the six Living Runtime modules each one
// may read from. Strictly the construction order; never reversed.
// ═══════════════════════════════════════════════════════════════════════════

export const CROSS_RUNTIME_MODULE_GRAPH = {
  'runtime/':           { dependsOn: [], dependedOnBy: ['runtime-interfaces/', 'runtime-behavior/', 'runtime-state/', 'runtime-event/', 'runtime-validation/', 'runtime-integration/'] },
  'runtime-interfaces/':{ dependsOn: ['runtime/'], dependedOnBy: ['runtime-behavior/', 'runtime-state/', 'runtime-event/', 'runtime-validation/', 'runtime-integration/'] },
  'runtime-behavior/':  { dependsOn: ['runtime/', 'runtime-interfaces/'], dependedOnBy: ['runtime-state/', 'runtime-integration/'] },
  'runtime-state/':     { dependsOn: ['runtime/', 'runtime-interfaces/', 'runtime-behavior/'], dependedOnBy: ['runtime-event/', 'runtime-integration/'] },
  'runtime-event/':     { dependsOn: ['runtime/', 'runtime-interfaces/', 'runtime-state/'], dependedOnBy: ['runtime-validation/', 'runtime-integration/'] },
  'runtime-validation/':{ dependsOn: ['runtime/', 'runtime-interfaces/', 'runtime-event/'], dependedOnBy: ['runtime-integration/'] },
  'runtime-integration/':{ dependsOn: ['runtime/', 'runtime-interfaces/', 'runtime-behavior/', 'runtime-state/', 'runtime-event/', 'runtime-validation/'], dependedOnBy: [] },
  acyclicity_note: 'Strictly a chain, not a graph with cycles — each module depends only on modules that precede it in Stage order (5 through 10), and this module (Stage 11) depends on all six.',
  traceability: 'CROSS_LAYER_INTEGRATION_RULES.rule_1_no_upward_governance (integration.ts)',
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// RUNTIME CONTRACT DEPENDENCY GRAPH
// The contract-level graph — the seven Runtime Interface entries.
// ═══════════════════════════════════════════════════════════════════════════

export const RUNTIME_CONTRACT_DEPENDENCY_GRAPH = {
  CitizenContract:            { dependsOn: [], dependedOnBy: ['LifecycleAndSignalQuerySurface (consumes CitizenExpression)'] },
  CompanionContract:          { dependsOn: ['LifecycleAndSignalQuerySurface (TimingContext)'], dependedOnBy: [] },
  GhostGuideContract:         { dependsOn: ['LifecycleAndSignalQuerySurface (TimingContext)'], dependedOnBy: [] },
  InvisibleDirectorContract:  { dependsOn: ['LifecycleAndSignalQuerySurface (TimingContext)', 'CreativeRuntimeContract (isSilent consistency)'], dependedOnBy: [] },
  CreativeRuntimeContract:    { dependsOn: ['LifecycleAndSignalQuerySurface'], dependedOnBy: ['CompanionContract', 'GhostGuideContract', 'InvisibleDirectorContract', 'FutureAIEngineContract'] },
  FutureAIEngineContract:     { dependsOn: ['CreativeRuntimeContract (stage gating)', 'LifecycleAndSignalQuerySurface'], dependedOnBy: ['CreativeRuntimeContract (renewal/authorization transitions)'] },
  LifecycleAndSignalQuerySurface: { dependsOn: [], dependedOnBy: ['CitizenContract', 'CompanionContract', 'GhostGuideContract', 'InvisibleDirectorContract', 'CreativeRuntimeContract', 'FutureAIEngineContract'] },
  acyclicity_note: 'The apparent cycle between CreativeRuntimeContract and FutureAIEngineContract is not a same-instant cycle — FutureAIEngineContract reads CreativeRuntimeContract\'s stage before pursuing, and CreativeRuntimeContract\'s stage only advances afterward, from FutureAIEngineContract\'s prior resolution (RUNTIME_INTERACTION_SEQUENCING, runtime-behavior/systemic.ts).',
  traceability: 'RUNTIME_BEHAVIOR_*.synchronization_behavior (runtime-behavior/contracts.ts), INTEGRATION_DEPENDENCY_GRAPH (integration.ts)',
} as const;
