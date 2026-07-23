/**
 * AZMA OS — CONSTITUTIONAL OPERATIONAL FOUNDATION, PACKAGE I
 * THE FIRST LIVING OPERATIONAL CYCLE
 * Type Definitions
 *
 * Authority: "Constitutional Operational Foundation, Package I — The
 * First Living Operational Cycle."
 *
 * NOT A SOVEREIGN ORGAN, per this Package's own "No new Constitutional
 * Organs": src/constitutional-operations/ holds no constitutional
 * purpose, boundary, or authority of its own and is not registered in
 * the Skeleton's Organ Registry — the same non-organ, coordination-only
 * pattern already used for src/imperial-presence/ (Phase VI) and
 * src/living-body-integration/ (the first Integration Campaign).
 *
 * WHAT "COORDINATION" MEANS HERE: this module invents no new reasoning,
 * judgment, or authority. Every stage it coordinates is an
 * already-certified, unmodified pull function
 * (processReceptionQueueIntoIntentions, processIntentionsIntoDecisions,
 * processDecisionsIntoExecutions, processExecutionsIntoRoutings). The
 * Runtime Coordinator only decides WHEN to call them (reacting to the
 * same shared Nervous System Bus every other live organ already
 * observes); the Dispatch Coordinator only decides in WHAT ORDER
 * (Reception -> Will -> Decision -> Execution -> Actuation, the fixed
 * order the Constitutional Body itself already established). Neither
 * reinterprets, modifies, or judges anything any stage produces.
 */

export interface OperationalCycleResult {
  readonly intentionsFormed: number;
  readonly decisionsIssued: number;
  readonly executionsRecorded: number;
  readonly routingsRecorded: number;
}

export interface OperationalAuditEntry {
  readonly auditId: string;
  readonly recordedAt: string;
  readonly cycle: OperationalCycleResult;
}

export interface OperationalHealthSnapshot {
  readonly receptionQueueLength: number;
  readonly intentionQueueLength: number;
  readonly decisionQueueLength: number;
  readonly executionQueueLength: number;
  readonly routingQueueLength: number;
}

export interface OperationalFailureSnapshot {
  readonly willRejectionCount: number;
  readonly decisionRejectionCount: number;
  readonly executionRejectionCount: number;
  readonly actuationRejectionCount: number;
  readonly totalRejectionCount: number;
}

export interface OperationalContinuityCheck {
  readonly continuityPreserved: boolean;
  readonly evidence: string;
}

export interface ConstitutionalOperationalCertification {
  readonly criterion: string;
  readonly verified: boolean;
  readonly evidence: string;
}
