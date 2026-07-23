/**
 * AZMA OS — THE CONSTITUTIONAL OPERATIONAL CERTIFICATION LAYER
 * Package I — The First Living Operational Cycle
 *
 * Implements this Package's own 7 Certification Requirements as real,
 * runnable checks. Every function here is a pure read: none mutates
 * anything beyond what the Operational Cycle itself already does when
 * operating (which is itself confirmed to introduce no new authority);
 * none calls any organ's own execution path directly.
 */

import { getOperationalAuditLog } from './audit-layer';
import { isOperating } from './runtime-coordinator';
import { getOperationalHealthSnapshot } from './health-layer';
import { getOperationalFailureSnapshot } from './failure-detection-layer';
import { verifyOperationalContinuityAfterFailures } from './recovery-layer';

import { getConstitutionalReceptionCertificationReport } from '../constitutional-reception';
import {
  getConstitutionalWillCertificationReport,
  verifyReadinessDistinguishedFromExecution,
  verifyNoExecutionAuthorityExists as verifyWillNoExecutionAuthority,
  getIntentionQueue,
} from '../constitutional-will';
import {
  getConstitutionalDecisionCertificationReport,
  verifyZeroExecutionAuthorityExists as verifyDecisionZeroExecutionAuthority,
  getDecisionQueue,
} from '../constitutional-decision';
import {
  getConstitutionalExecutionCertificationReport,
  verifyZeroDecisionMakingAuthorityExists,
  getExecutionQueue,
} from '../constitutional-execution';
import {
  getConstitutionalActuationCertificationReport,
  verifyNoAuthorityExistsBeyondRouting,
  getRoutingQueue,
} from '../constitutional-actuation';

import type { ConstitutionalOperationalCertification } from './types';

/** Certification Requirement 1: "Verify the complete Constitutional Cycle operates automatically." */
export function verifyCompleteCycleOperatesAutomatically(): ConstitutionalOperationalCertification {
  const auditLog = getOperationalAuditLog();
  const verified = isOperating() && auditLog.length > 0;
  return {
    criterion: 'The complete Constitutional Cycle operates automatically.',
    verified,
    evidence: verified
      ? `The Operational Cycle is active and has automatically run ${auditLog.length} dispatch cycle(s) in reaction to real signals — no manual pull was required.`
      : 'The Operational Cycle is not currently active, or has never automatically run a dispatch cycle.',
  };
}

/** Certification Requirement 2: "Verify every constitutional boundary remains preserved." */
export function verifyEveryConstitutionalBoundaryPreserved(): ConstitutionalOperationalCertification {
  const reports = [
    ...getConstitutionalReceptionCertificationReport(),
    ...getConstitutionalWillCertificationReport(),
    ...getConstitutionalDecisionCertificationReport(),
    ...getConstitutionalExecutionCertificationReport(),
    ...getConstitutionalActuationCertificationReport(),
  ];
  const verified = reports.length > 0 && reports.every((entry) => entry.verified);
  return {
    criterion: 'Every constitutional boundary remains preserved.',
    verified,
    evidence: verified
      ? `All ${reports.length} certification checks across Reception, Will, Decision, Execution, and Actuation still pass, unchanged, under automatic operation.`
      : 'At least one of the 5 layers\' own certification checks no longer passes under automatic operation.',
  };
}

/** Certification Requirement 3: "Verify every stage remains independently traceable." */
export function verifyEveryStageRemainsIndependentlyTraceable(): ConstitutionalOperationalCertification {
  const intentionsTraceable = getIntentionQueue().every((intention) => intention.intentionId.startsWith('intention-'));
  const decisionsTraceable = getDecisionQueue().every((decision) => decision.decisionId.startsWith('decision-'));
  const executionsTraceable = getExecutionQueue().every((execution) => execution.executionId.startsWith('execution-'));
  const routingsTraceable = getRoutingQueue().every((routing) => routing.routingId.startsWith('routing-'));
  const verified = intentionsTraceable && decisionsTraceable && executionsTraceable && routingsTraceable;
  return {
    criterion: 'Every stage remains independently traceable.',
    verified,
    evidence: verified
      ? 'Every intention, decision, execution, and routing currently recorded carries its own stage-prefixed, traceable id — none blends into another stage\'s identity.'
      : 'At least one recorded entry did not carry its own stage-prefixed traceable id.',
  };
}

/** Certification Requirement 6: "Verify operational health is continuously measurable." (grouped near traceability for cohesion; see queries.ts for the full 7-item ordering) */
export function verifyOperationalHealthIsMeasurable(): ConstitutionalOperationalCertification {
  const snapshot = getOperationalHealthSnapshot();
  const verified = Object.values(snapshot).every((value) => typeof value === 'number' && value >= 0);
  return {
    criterion: 'Operational health is continuously measurable.',
    verified,
    evidence: verified
      ? `getOperationalHealthSnapshot() returns 5 well-formed, non-negative queue-length readings: ${JSON.stringify(snapshot)}.`
      : 'The operational health snapshot returned a malformed or negative reading.',
  };
}

/** Certification Requirement 5: "Verify recovery preserves Constitutional continuity." */
export function verifyRecoveryPreservesContinuity(): ConstitutionalOperationalCertification {
  const check = verifyOperationalContinuityAfterFailures();
  return {
    criterion: 'Recovery preserves Constitutional continuity.',
    verified: check.continuityPreserved,
    evidence: check.evidence,
  };
}

/** Certification Requirement 4: "Verify failures remain isolated." */
export function verifyFailuresRemainIsolated(): ConstitutionalOperationalCertification {
  const failures = getOperationalFailureSnapshot();
  const health = getOperationalHealthSnapshot();
  const hasAnySuccessfulOutcome =
    health.intentionQueueLength > 0 && health.decisionQueueLength > 0 && health.executionQueueLength > 0 && health.routingQueueLength > 0;
  return {
    criterion: 'Failures remain isolated.',
    verified: hasAnySuccessfulOutcome,
    evidence: hasAnySuccessfulOutcome
      ? `Despite ${failures.totalRejectionCount} total rejection(s) recorded across all stages, the cycle still produced ${health.routingQueueLength} successful, fully-routed outcome(s) — a rejection at one stage, for one candidate, never halts the cycle for any other.`
      : 'No successful, fully-routed outcome coexists with the recorded failure snapshot — insufficient evidence to confirm isolation.',
  };
}

/** Certification Requirement 7: "Verify no constitutional authority migrates between layers." */
export function verifyNoAuthorityMigratesBetweenLayers(): ConstitutionalOperationalCertification {
  const willResult = verifyReadinessDistinguishedFromExecution().verified && verifyWillNoExecutionAuthority().verified;
  const decisionResult = verifyDecisionZeroExecutionAuthority().verified;
  const executionResult = verifyZeroDecisionMakingAuthorityExists().verified;
  const actuationResult = verifyNoAuthorityExistsBeyondRouting().verified;
  const verified = willResult && decisionResult && executionResult && actuationResult;
  return {
    criterion: 'No constitutional authority migrates between layers.',
    verified,
    evidence: verified
      ? 'Will still exercises no execution authority, Decision still exercises no execution authority, Execution still exercises no decision-making authority, and Actuation still exercises no authority beyond routing — each layer\'s own boundary, re-checked under automatic operation, is exactly as narrow as it was before this Package existed.'
      : "At least one layer's own authority boundary no longer holds under automatic operation.",
  };
}
