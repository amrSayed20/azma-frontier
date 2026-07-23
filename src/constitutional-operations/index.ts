/**
 * AZMA OS — CONSTITUTIONAL OPERATIONAL FOUNDATION, PACKAGE I
 * THE FIRST LIVING OPERATIONAL CYCLE
 * Public API — import from here, never directly from the individual
 * files.
 *
 * Not a Sovereign Organ — see types.ts. See ENGINEERING_REVIEW.ts for
 * what this Package built and why.
 */

export type {
  OperationalCycleResult,
  OperationalAuditEntry,
  OperationalHealthSnapshot,
  OperationalFailureSnapshot,
  OperationalContinuityCheck,
  ConstitutionalOperationalCertification,
} from './types';

export { CONSTITUTIONAL_OPERATIONAL_CYCLE } from './operational-cycle';
export { CONSTITUTIONAL_OPERATIONAL_ARCHITECTURE } from './operational-registry';
export { runDispatchCycle } from './dispatch-coordinator';

export {
  beginConstitutionalOperationalCycle,
  endConstitutionalOperationalCycle,
  isOperating,
} from './runtime-coordinator';

export { recordAuditEntry, getOperationalAuditLog, resetOperationalAuditLog } from './audit-layer';
export { getOperationalHealthSnapshot } from './health-layer';
export { getOperationalFailureSnapshot } from './failure-detection-layer';
export { verifyOperationalContinuityAfterFailures } from './recovery-layer';

export {
  verifyCompleteCycleOperatesAutomatically,
  verifyEveryConstitutionalBoundaryPreserved,
  verifyEveryStageRemainsIndependentlyTraceable,
  verifyFailuresRemainIsolated,
  verifyRecoveryPreservesContinuity,
  verifyOperationalHealthIsMeasurable,
  verifyNoAuthorityMigratesBetweenLayers,
} from './certification';

export {
  getConstitutionalOperationalSnapshot,
  getConstitutionalOperationalCertificationReport,
} from './queries';
export type { ConstitutionalOperationalSnapshot } from './queries';

export { OperationsAwakening } from './OperationsAwakening';
