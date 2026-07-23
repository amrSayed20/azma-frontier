/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * MAG-PKG-II — WORK PACKAGE D: INTERNAL COMMUNICATION ARCHITECTURE
 *
 * Architects the communication paths between every internal component.
 * VERIFIED, not assumed: every edge below was confirmed by directly
 * grepping the import statement of every one of the 24 files in
 * src/chambers/makman-al-ghayah/ before this file was written. No Runtime
 * messaging — this is a static dependency architecture only.
 */

export interface RasAlAmrMakmanCommunicationEdge {
  readonly from: string;
  readonly to: string;
  readonly verifiedImport: string;
}

export const MAKMAN_VERIFIED_COMMUNICATION_EDGES: readonly RasAlAmrMakmanCommunicationEdge[] = [
  { from: 'goal-node.ts', to: 'goal-contracts.ts', verifiedImport: 'GoalContract, GoalPriority, GoalStatus' },
  { from: 'goal-graph.ts', to: 'goal-node.ts', verifiedImport: 'GoalNode' },
  { from: 'goal-hierarchy.ts', to: 'goal-node.ts', verifiedImport: 'GoalNode' },
  { from: 'goal-dependency-resolver.ts', to: 'goal-contracts.ts', verifiedImport: 'GoalContract, GoalStatus' },
  { from: 'goal-prioritization-engine.ts', to: 'goal-contracts.ts', verifiedImport: 'GoalContract, GoalPriority' },
  { from: 'goal-planner.ts', to: 'goal-contracts.ts', verifiedImport: 'GoalContract, GoalStatus' },
  { from: 'goal-orchestrator.ts', to: 'goal-contracts.ts', verifiedImport: 'GoalContract' },
  { from: 'goal-orchestrator.ts', to: 'goal-planner.ts', verifiedImport: 'GoalPlanner' },
  { from: 'goal-orchestrator.ts', to: 'goal-dependency-resolver.ts', verifiedImport: 'GoalDependencyResolver' },
  { from: 'goal-orchestrator.ts', to: 'goal-prioritization-engine.ts', verifiedImport: 'GoalPrioritizationEngine' },
  { from: 'goal-timeline-engine.ts', to: 'goal-contracts.ts', verifiedImport: 'GoalContract, GoalStatus' },
  { from: 'goal-state.ts', to: 'goal-contracts.ts', verifiedImport: 'GoalContract' },
  { from: 'goal-progress-tracker.ts', to: 'goal-contracts.ts', verifiedImport: 'GoalContract, GoalStatus' },
  { from: 'goal-metrics.ts', to: 'goal-contracts.ts', verifiedImport: 'GoalContract, GoalStatus' },
  { from: 'goal-completion-analyzer.ts', to: 'goal-contracts.ts', verifiedImport: 'GoalContract, GoalStatus' },
  { from: 'goal-export-interfaces.ts', to: 'goal-contracts.ts', verifiedImport: 'GoalContract' },
  { from: 'goal-runtime.ts', to: 'goal-contracts.ts', verifiedImport: 'GoalContract' },
  { from: 'goal-runtime.ts', to: 'goal-orchestrator.ts', verifiedImport: 'GoalOrchestrator' },
  { from: 'goal-session-store.ts', to: 'goal-session.ts', verifiedImport: 'GoalSession' },
  { from: 'goal-session-manager.ts', to: 'goal-session.ts', verifiedImport: 'GoalSession' },
  { from: 'goal-session-manager.ts', to: 'goal-session-store.ts', verifiedImport: 'GoalSessionStore' },
  { from: 'access-policy-engine.ts', to: 'publication-contracts.ts', verifiedImport: 'SovereignPublication, DistributionTier' },
  { from: 'monetization-ledger-gateway.ts', to: 'publication-contracts.ts', verifiedImport: 'PricingModel' },
  { from: 'monetization-ledger-gateway.ts', to: 'access-policy-engine.ts', verifiedImport: 'ConsumerContext, ActiveRental' },
  { from: 'rendering-bridge.ts', to: 'publication-contracts.ts', verifiedImport: 'SovereignPublication' },
  { from: 'rendering-bridge.ts', to: '../ras-al-amr/pre-publishing-boundary', verifiedImport: 'CompiledAssemblyGraph (external chamber)' },
  { from: 'rendering-bridge.ts', to: '../ras-al-amr/assembly-contracts', verifiedImport: 'CanvasType (external chamber)' },
  { from: 'rendering-bridge.ts', to: '../../orchestrator/al-watin/fleet/fleet-dispatcher', verifiedImport: 'FleetDispatcher (Platform)' },
  { from: 'rendering-bridge.ts', to: '../../core/sovereign-orchestrator/qiyamah-intent-types', verifiedImport: 'CapabilityTarget (Platform/Qiyamah)' },
  { from: 'consumption-boundary.ts', to: 'publication-contracts.ts', verifiedImport: 'SovereignPublication' },
  { from: 'consumption-boundary.ts', to: 'access-policy-engine.ts', verifiedImport: 'SovereignAccessPolicyEngine, AuthorizationResult, ConsumerContext' },
  { from: 'consumption-boundary.ts', to: 'monetization-ledger-gateway.ts', verifiedImport: 'MonetizationLedgerGateway' },
  { from: 'consumption-boundary.ts', to: 'rendering-bridge.ts', verifiedImport: 'FlattenedRenderingBridge, RenderStatus' },
] as const;

export const MAKMAN_FOUNDATIONAL_FILES_WITH_NO_IMPORTS = ['goal-contracts.ts', 'goal-session.ts', 'publication-contracts.ts'] as const;

// ═══════════════════════════════════════════════════════════════════════════
// COMMUNICATION RULES
// ═══════════════════════════════════════════════════════════════════════════

export const MAKMAN_COMMUNICATION_RULES = {
  whoMayCommunicate: 'Any component may communicate with a component it is verified to import (MAKMAN_VERIFIED_COMMUNICATION_EDGES) — no other internal path exists.',
  whoMayRequest: 'CONSUMPTION_GATEWAY_COMPONENT may request evaluation from ACCESS_ENFORCEMENT_COMPONENT and recording from MONETIZATION_LEDGER_COMPONENT and rendering-evaluation from DESTINATION_EXECUTION_COMPONENT — the only component that requests from all three others.',
  whoMayRespond: 'Every component importedby another (e.g., GOAL_CUSTODY_COMPONENT\'s goal-contracts.ts, imported by nearly every Goal-side file) responds by exposing its typed contract only — no component calls back into its own importer.',
  whoMayNeverCommunicateDirectly: [
    'GOAL_CUSTODY_COMPONENT and DESTINATION_EXECUTION_COMPONENT never communicate directly — confirmed by the absence of any import between goal-contracts.ts/goal-state.ts and rendering-bridge.ts/publication-contracts.ts anywhere in the verified edge list. The Goal-side and Distribution-side of the chamber are architecturally separate today; Article I\'s reconciliation (Guardianship as purpose, Distribution as one mechanism) is not yet reflected in code as an actual connection.',
    'RECOMMENDATION_COMPONENT and NOTIFICATION_COMPONENT (both reserved) currently communicate with nothing, since neither has an implementing file.',
    'No component communicates directly with the Creator except by architectural convention (RECOMMENDATION_COMPONENT and NOTIFICATION_COMPONENT\'s outputs are "directed to the Creator only") — there is no code-level Creator-facing channel yet, consistent with both being RESERVED.',
  ],
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// ARCHITECTURAL FINDING
// ═══════════════════════════════════════════════════════════════════════════

export const MAKMAN_COMMUNICATION_ARCHITECTURE_FINDING = {
  finding: 'The verified import graph reveals Makman Al-Ghayah currently has TWO disconnected internal clusters: the Goal-side cluster (goal-contracts.ts and everything importing it, 16 files) and the Distribution-side cluster (publication-contracts.ts and everything importing it, 4 files). No file in either cluster imports from the other. GOAL_SESSION_COMPONENT (3 files) is a third, separate island, connected to neither.',
  constitutionalImplication: 'Article I\'s Purpose reconciliation (Guardianship as WHY, Distribution as one HOW) is a correct constitutional reading, but it is not yet an architectural fact — the code does not currently connect "the Goal is being guarded" to "the Goal\'s destination is being executed." A future Runtime or Architecture Package will need to bridge GOAL_CUSTODY_COMPONENT to DESTINATION_EXECUTION_COMPONENT explicitly (very likely via the Goal Handover / Creator-Authorized Execution stages in MAKMAN_GOAL_LIFECYCLE_ARCHITECTURE.ts) — this is a genuine open architectural item, not invented here since it would require new construction beyond this Package\'s "architecture only" scope.',
} as const;

export const RAS_AL_AMR_MAKMAN_INTERNAL_COMMUNICATION_ARCHITECTURE = {
  edges: MAKMAN_VERIFIED_COMMUNICATION_EDGES,
  foundationalFiles: MAKMAN_FOUNDATIONAL_FILES_WITH_NO_IMPORTS,
  rules: MAKMAN_COMMUNICATION_RULES,
  finding: MAKMAN_COMMUNICATION_ARCHITECTURE_FINDING,
} as const;
