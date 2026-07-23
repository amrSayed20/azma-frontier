/**
 * AZMA OS — THE CONSTITUTIONAL OPERATIONAL REGISTRY
 * Package I — The First Living Operational Cycle
 *
 * A pure, declarative record of this Package's own architectural
 * commitments — the facts a future reader should be able to confirm
 * without reading every implementation file.
 */

export const CONSTITUTIONAL_OPERATIONAL_ARCHITECTURE = [
  { fact: 'No new Constitutional Organ was registered by this Package.', evidence: 'src/sovereign-body/organ-registry.ts is unmodified by this Package.' },
  { fact: 'Every coordinated stage is called through its own already-certified, unmodified pull function.', evidence: 'dispatch-coordinator.ts imports processReceptionQueueIntoIntentions, processIntentionsIntoDecisions, processDecisionsIntoExecutions, and processExecutionsIntoRoutings — never their internal evaluator/queue files directly.' },
  { fact: 'The Runtime Coordinator subscribes to the same shared Nervous System Bus every other live organ already observes — it introduces no second transport.', evidence: 'runtime-coordinator.ts imports only observeAll from src/sovereign-nervous-system/.' },
  { fact: 'Stage order is fixed and never content-dependent.', evidence: 'dispatch-coordinator.ts calls the 4 pull functions in one hardcoded sequence (Will, then Decision, then Execution, then Actuation) — no branching on what any stage produced.' },
] as const;
