/**
 * AZMA OS — THE CONSTITUTIONAL OPERATIONAL QUERIES
 * Package I — The First Living Operational Cycle
 *
 * A comprehensive, whole-cycle read-only view: Health + Failure + Audit
 * combined into one Operational Snapshot, plus the full 7-item
 * Certification Report — used for Council review, never for
 * decision-making.
 */

import { getOperationalHealthSnapshot } from './health-layer';
import { getOperationalFailureSnapshot } from './failure-detection-layer';
import { getOperationalAuditLog } from './audit-layer';
import { isOperating } from './runtime-coordinator';
import {
  verifyCompleteCycleOperatesAutomatically,
  verifyEveryConstitutionalBoundaryPreserved,
  verifyEveryStageRemainsIndependentlyTraceable,
  verifyFailuresRemainIsolated,
  verifyRecoveryPreservesContinuity,
  verifyOperationalHealthIsMeasurable,
  verifyNoAuthorityMigratesBetweenLayers,
} from './certification';
import type {
  OperationalHealthSnapshot,
  OperationalFailureSnapshot,
  OperationalAuditEntry,
  ConstitutionalOperationalCertification,
} from './types';

export interface ConstitutionalOperationalSnapshot {
  readonly operating: boolean;
  readonly health: OperationalHealthSnapshot;
  readonly failures: OperationalFailureSnapshot;
  readonly auditLog: readonly OperationalAuditEntry[];
}

export function getConstitutionalOperationalSnapshot(): ConstitutionalOperationalSnapshot {
  return {
    operating: isOperating(),
    health: getOperationalHealthSnapshot(),
    failures: getOperationalFailureSnapshot(),
    auditLog: getOperationalAuditLog(),
  };
}

export function getConstitutionalOperationalCertificationReport(): readonly ConstitutionalOperationalCertification[] {
  return [
    verifyCompleteCycleOperatesAutomatically(),
    verifyEveryConstitutionalBoundaryPreserved(),
    verifyEveryStageRemainsIndependentlyTraceable(),
    verifyFailuresRemainIsolated(),
    verifyRecoveryPreservesContinuity(),
    verifyOperationalHealthIsMeasurable(),
    verifyNoAuthorityMigratesBetweenLayers(),
  ];
}
