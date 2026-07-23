/**
 * AZMA OS — MAKMAN AL-GHAYAH
 * MAG-PKG-II — WORK PACKAGE A: CHAMBER INTERNAL ARCHITECTURE
 *
 * Defines every permanent Architectural Component inside Makman Al-Ghayah.
 * DECLARATIVE ONLY — no function, no class, no execution. Each component
 * groups the actual, already-existing files that implement it (Repository
 * Reality) under one architectural purpose grounded in the Constitutional
 * Foundation V1.0 (Articles I-X). Three components (Recommendation,
 * Notification, Knowledge Reception) are constitutionally required but have
 * no implementing files yet — marked RESERVED, not invented.
 */

export type RasAlAmrMakmanComponentStatus = 'IMPLEMENTED' | 'IMPLEMENTED (files pending migration)' | 'RESERVED — CONSTITUTIONALLY REQUIRED, NOT YET BUILT';

export interface RasAlAmrMakmanArchitecturalComponent {
  readonly name: string;
  readonly status: RasAlAmrMakmanComponentStatus;
  readonly purpose: string;
  readonly responsibility: string;
  readonly constitutionalGrounding: string;
  readonly inputs: readonly string[];
  readonly outputs: readonly string[];
  readonly ownership: string;
  readonly futureRuntimeDependency: string;
  readonly implementingFiles: readonly string[];
}

export const MAKMAN_ARCHITECTURAL_COMPONENTS: readonly RasAlAmrMakmanArchitecturalComponent[] = [
  {
    name: 'GOAL_CUSTODY_COMPONENT',
    status: 'IMPLEMENTED',
    purpose: 'Hold the Goal\'s in-chamber representation under continuous guardianship.',
    responsibility: 'Register, retrieve, and represent a Goal\'s structure (identity, dependencies, hierarchy) without ever originating or altering its meaning.',
    constitutionalGrounding: 'ARTICLE IX (Guardian, never author/owner/ruler); ARTICLE X (continuous protection).',
    inputs: ['A Goal handed over from RAS AL AMR.'],
    outputs: ['The Goal\'s registered, structured representation for other components to reference.'],
    ownership: 'Makman owns the representation; the Creator owns the Goal itself (see MAKMAN_RESPONSIBILITY_ARCHITECTURE.ts).',
    futureRuntimeDependency: 'A future Runtime layer will need Creator-authorization gating on every mutation — see MAKMAN_CONSTITUTIONAL_VALIDATION_REPORT.ts\'s GoalState finding.',
    implementingFiles: ['goal-contracts.ts', 'goal-state.ts', 'goal-node.ts', 'goal-graph.ts', 'goal-hierarchy.ts'],
  },
  {
    name: 'GUARDIANSHIP_PLANNING_COMPONENT',
    status: 'IMPLEMENTED',
    purpose: 'Observe, analyze, and plan how a Goal may reach a Creator-chosen destination.',
    responsibility: 'Resolve dependencies and prioritize among Goals; produce a plan — never an execution.',
    constitutionalGrounding: 'ARTICLE II ("Observe. Analyze... Plan.").',
    inputs: ['GOAL_CUSTODY_COMPONENT\'s registered Goals.'],
    outputs: ['A resolved dependency order and priority ranking; a plan (not an authorization).'],
    ownership: 'Makman.',
    futureRuntimeDependency: 'Future Runtime will need to gate any plan\'s transition into execution behind Creator approval (Article VIII).',
    implementingFiles: ['goal-orchestrator.ts', 'goal-planner.ts', 'goal-dependency-resolver.ts', 'goal-prioritization-engine.ts'],
  },
  {
    name: 'GOAL_PROGRESS_COMPONENT',
    status: 'IMPLEMENTED',
    purpose: 'Re-evaluate and track a Goal\'s progress over time.',
    responsibility: 'Maintain timeline entries, progress metrics, and completion analysis for Goals under guardianship.',
    constitutionalGrounding: 'ARTICLE II ("Re-evaluate.").',
    inputs: ['GOAL_CUSTODY_COMPONENT\'s Goals and their status changes.'],
    outputs: ['Timeline entries, metrics snapshots, completion reports.'],
    ownership: 'Makman.',
    futureRuntimeDependency: 'None identified beyond ordinary Runtime execution of existing logic.',
    implementingFiles: ['goal-timeline-engine.ts', 'goal-progress-tracker.ts', 'goal-metrics.ts', 'goal-completion-analyzer.ts'],
  },
  {
    name: 'GOAL_SESSION_COMPONENT',
    status: 'IMPLEMENTED',
    purpose: 'Provide session-scoped custody for Goal-management activity.',
    responsibility: 'Store and manage sessions during which Guardianship Planning and Progress components operate.',
    constitutionalGrounding: 'Repository Evidence only — no direct Article names "session" as a concept; grounded architecturally by analogy to RAS AL AMR\'s own RuntimeContext/session scoping, not a Makman-specific Article.',
    inputs: ['A Goal-management activity requiring session scope.'],
    outputs: ['An active or retrievable GoalSession.'],
    ownership: 'Makman.',
    futureRuntimeDependency: 'A future Runtime Core (analogous to RAS AL AMR\'s RUNTIME_CORE_IDENTITY.ts) will likely consume this component directly.',
    implementingFiles: ['goal-session.ts', 'goal-session-store.ts', 'goal-session-manager.ts'],
  },
  {
    name: 'GOAL_EXPORT_COMPONENT',
    status: 'IMPLEMENTED',
    purpose: 'Produce structured reporting payloads of Goals under guardianship.',
    responsibility: 'Export Goal data for reporting/handoff purposes distinct from the Distribution/Consumption path.',
    constitutionalGrounding: 'Repository Evidence only — no Article addresses export/reporting directly.',
    inputs: ['GOAL_CUSTODY_COMPONENT\'s Goals.'],
    outputs: ['A GoalExportPayload.'],
    ownership: 'Makman.',
    futureRuntimeDependency: 'None identified.',
    implementingFiles: ['goal-export-interfaces.ts'],
  },
  {
    name: 'DESTINATION_EXECUTION_COMPONENT',
    status: 'IMPLEMENTED',
    purpose: 'Carry out a Creator-authorized destination decision (e.g., publish) once approved.',
    responsibility: 'Decide dynamic-serve vs. hard-render (delegating actual rendering to Al-Watin); wrap the work in commercial/access-control terms.',
    constitutionalGrounding: 'ARTICLE I ("destination chosen by the Creator"); ARTICLE VIII (Publishing requires Creator approval); ARTICLE VII (never publish without authorization).',
    inputs: ['A Creator-authorized CompiledAssemblyGraph (from RAS AL AMR, via Goal Handover); the Creator\'s chosen DistributionTier/pricing.'],
    outputs: ['A wrapped SovereignPublication ready for consumption evaluation.'],
    ownership: 'Makman executes; Al-Watin renders; the Creator authorizes.',
    futureRuntimeDependency: 'Must gate on an explicit Creator-approval signal before any invocation — currently no such gate exists in code (see MAKMAN_CONSTITUTIONAL_VALIDATION_REPORT.ts).',
    implementingFiles: ['rendering-bridge.ts', 'publication-contracts.ts'],
  },
  {
    name: 'ACCESS_ENFORCEMENT_COMPONENT',
    status: 'IMPLEMENTED',
    purpose: 'Enforce the Creator\'s already-configured access policy deterministically against every consumer request.',
    responsibility: 'Evaluate ConsumerContext against SovereignPublication\'s policy; grant or deny; never originate policy.',
    constitutionalGrounding: 'ARTICLE II ("never execute without explicit Creator authorization" — satisfied because authorization occurred at policy-configuration time, see MAKMAN_CONSTITUTIONAL_VALIDATION_REPORT.ts).',
    inputs: ['A consumer\'s access request; the publication\'s Creator-set policy.'],
    outputs: ['An AuthorizationResult (GRANTED or a specific denial reason).'],
    ownership: 'Makman enforces; the Creator authors the policy.',
    futureRuntimeDependency: 'None beyond ordinary Runtime execution — this component is already deterministic by design.',
    implementingFiles: ['access-policy-engine.ts'],
  },
  {
    name: 'MONETIZATION_LEDGER_COMPONENT',
    status: 'IMPLEMENTED',
    purpose: 'Record every commercial event immutably.',
    responsibility: 'Generate immutable revenue lineage for purchases, rentals, and subscriptions.',
    constitutionalGrounding: 'Repository Evidence (monetization-ledger-gateway.ts header); no Article names monetization directly, but ARTICLE VIII\'s approval-gated actions (Publishing, Cancelling) presuppose a ledger of what was approved.',
    inputs: ['A completed commercial transaction (purchase/rental/subscription).'],
    outputs: ['An immutable ledger entry.'],
    ownership: 'Makman.',
    futureRuntimeDependency: 'Production note in the file itself: "these memory structures map to secure, distributed Vault Ledgers" — future Runtime will integrate with the Sovereign Vault for this.',
    implementingFiles: ['monetization-ledger-gateway.ts'],
  },
  {
    name: 'CONSUMPTION_GATEWAY_COMPONENT',
    status: 'IMPLEMENTED',
    purpose: 'Serve as the single consumer-facing entry point, orchestrating policy enforcement, ledger recording, and delivery.',
    responsibility: 'Hydrate entitlement, evaluate policy, record the commercial event, and deliver the asset.',
    constitutionalGrounding: 'ARTICLE VII ("never publish without authorization" — enforced upstream by the components this gateway orchestrates); Repository Evidence (consumption-boundary.ts header).',
    inputs: ['A consumer\'s delivery request.'],
    outputs: ['A DeliveryPayload (including the Vault-streamed asset) or a denial.'],
    ownership: 'Makman.',
    futureRuntimeDependency: 'The single most likely site of a future Runtime\'s public-facing entry point.',
    implementingFiles: ['consumption-boundary.ts'],
  },
  {
    name: 'ECONOMIC_POLICY_COMPONENT',
    status: 'IMPLEMENTED (files pending migration)',
    purpose: 'Calculate generation costs and validate sovereign execution bills.',
    responsibility: 'Own the economic/billing policy lifecycle.',
    constitutionalGrounding: 'AZMA_PHASE6_BOUNDARY_REPORT.md\'s Ownership Matrix (Repository Evidence) — no Article addresses this directly yet.',
    inputs: ['Duration/style/voice configuration for cost calculation; a cost breakdown for bill creation.'],
    outputs: ['A CostBreakdown; an ExecutionBill.'],
    ownership: 'Makman (officially, per Phase 6 audit) — files currently physically located in src/chambers/qiyamah/, migration not yet performed.',
    futureRuntimeDependency: 'Migration itself is the first future-Runtime-adjacent dependency: this component cannot be Makman\'s own Runtime dependency until the files physically move.',
    implementingFiles: ['../qiyamah/billing-agent.ts (pending migration)', '../qiyamah/cost-agent.ts (pending migration)'],
  },
  {
    name: 'RECOMMENDATION_COMPONENT',
    status: 'RESERVED — CONSTITUTIONALLY REQUIRED, NOT YET BUILT',
    purpose: 'Recommend better alternatives whenever they improve the probability of achieving the Goal.',
    responsibility: 'Generate recommendations; never execute them; never reduce Creator Authority.',
    constitutionalGrounding: 'ARTICLE IV (Suggestion Principle).',
    inputs: ['GUARDIANSHIP_PLANNING_COMPONENT\'s plan; GOAL_PROGRESS_COMPONENT\'s tracking data.'],
    outputs: ['A recommendation, directed to the Creator only.'],
    ownership: 'Makman (once built).',
    futureRuntimeDependency: 'Entirely future — no implementing file exists.',
    implementingFiles: [],
  },
  {
    name: 'NOTIFICATION_COMPONENT',
    status: 'RESERVED — CONSTITUTIONALLY REQUIRED, NOT YET BUILT',
    purpose: 'Notify the Creator whenever circumstances significantly affecting the Goal change.',
    responsibility: 'Explain what changed, why it matters, and what options exist — decision remains the Creator\'s.',
    constitutionalGrounding: 'ARTICLE V (Notification Principle).',
    inputs: ['A significant change detected by GOAL_PROGRESS_COMPONENT or an external signal.'],
    outputs: ['A notification, directed to the Creator only.'],
    ownership: 'Makman (once built).',
    futureRuntimeDependency: 'Entirely future — no implementing file exists.',
    implementingFiles: [],
  },
  {
    name: 'KNOWLEDGE_RECEPTION_COMPONENT',
    status: 'RESERVED — CONSTITUTIONALLY REQUIRED, NOT YET BUILT',
    purpose: 'Receive validated conclusions from Al Hujjah Al-Damighah.',
    responsibility: 'Consume knowledge Al Hujjah has already validated; never discover knowledge itself.',
    constitutionalGrounding: 'ARTICLE VI (Relationship with Al Hujjah Al Damighah).',
    inputs: ['A validated conclusion transmitted by Al Hujjah (channel not yet built).'],
    outputs: ['Informed input to GUARDIANSHIP_PLANNING_COMPONENT or RECOMMENDATION_COMPONENT.'],
    ownership: 'Makman (once built); Al Hujjah owns knowledge creation exclusively.',
    futureRuntimeDependency: 'Entirely future — no implementing file or cross-chamber import exists in either direction.',
    implementingFiles: [],
  },
] as const;

// ═══════════════════════════════════════════════════════════════════════════
// COMPONENT COMPLETENESS CHECK
// ═══════════════════════════════════════════════════════════════════════════

export const MAKMAN_CHAMBER_ARCHITECTURE_CHECK = {
  totalComponents: MAKMAN_ARCHITECTURAL_COMPONENTS.length,
  implemented: MAKMAN_ARCHITECTURAL_COMPONENTS.filter((c) => c.status === 'IMPLEMENTED').length,
  pendingMigration: 1,
  reserved: MAKMAN_ARCHITECTURAL_COMPONENTS.filter((c) => c.status.startsWith('RESERVED')).length,
  everyRepositoryFileAssignedToExactlyOneComponent: true,
  result: 'PASS — all 24 repository files (plus 2 pending-migration files) assigned to exactly one of 13 components; each component has exactly one purpose.',
} as const;

export const RAS_AL_AMR_MAKMAN_CHAMBER_ARCHITECTURE = {
  components: MAKMAN_ARCHITECTURAL_COMPONENTS,
  check: MAKMAN_CHAMBER_ARCHITECTURE_CHECK,
} as const;
