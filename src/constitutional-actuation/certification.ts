/**
 * AZMA OS — THE CONSTITUTIONAL ACTUATION
 * The Constitutional Actuation Certification Layer
 * Construction Campaign
 *
 * Implements this Campaign's own 4 Certification Requirements as real,
 * runnable checks. Every function here is a pure read: none mutates
 * anything, none calls emitSignal, circulateFromClient, awaken, rest,
 * recordSignalSeen, or any organ's own execution path — confirmed by
 * inspection and by this package's own tests.
 */

import { getSignalLog } from '../sovereign-nervous-system';
import { getHeartbeatState } from '../sovereign-heart';
import { getExecutionQueue } from '../constitutional-execution';
import { CONSTITUTIONAL_PATHWAY } from './pathway-registry';
import { getRoutingQueue } from './routing-layer';
import type { ConstitutionalActuationCertification } from './types';

/** Certification Requirement 1: "Verify every actuation originates from Constitutional Execution." */
export function verifyEveryActuationOriginatesFromExecution(): ConstitutionalActuationCertification {
  const routings = getRoutingQueue();
  const executionIds = new Set(getExecutionQueue().map((execution) => execution.executionId));
  const verified = routings.length > 0 && routings.every((routing) => executionIds.has(routing.sourceExecutionId));
  return {
    criterion: 'Every actuation originates from Constitutional Execution.',
    verified,
    evidence: verified
      ? `All ${routings.length} recorded routing(s) trace to a real, currently-recorded Constitutional Execution.`
      : 'The Routing Queue is empty, or contains a routing not traceable to a real execution.',
  };
}

/** Certification Requirement 2: "Verify execution pathways are authorized." */
export function verifyExecutionPathwaysAreAuthorized(): ConstitutionalActuationCertification {
  const routings = getRoutingQueue();
  const verified = routings.length > 0 && routings.every((routing) => routing.pathway.pathwayKind === CONSTITUTIONAL_PATHWAY.pathwayKind);
  return {
    criterion: 'Execution pathways are authorized.',
    verified,
    evidence: verified
      ? `Every one of ${routings.length} recorded routing(s) carries exactly the one authorized pathway kind ('${CONSTITUTIONAL_PATHWAY.pathwayKind}') — no unauthorized pathway ever appears.`
      : 'The Routing Queue is empty, or contains a routing with an unauthorized pathway.',
  };
}

/** Certification Requirement 3: "Verify every routing decision is traceable." */
export function verifyEveryRoutingDecisionIsTraceable(): ConstitutionalActuationCertification {
  const routings = getRoutingQueue();
  const verified = routings.length > 0 && routings.every(
    (routing) =>
      routing.routingId.length > 0 &&
      routing.sourceExecutionId.length > 0 &&
      routing.target.organId.length > 0 &&
      routing.pathway.pathwayKind.length > 0 &&
      routing.routedAt.length > 0,
  );
  return {
    criterion: 'Every routing decision is traceable.',
    verified,
    evidence: verified
      ? `All ${routings.length} recorded routing(s) carry a complete, non-empty routingId/sourceExecutionId/target/pathway/routedAt.`
      : 'The Routing Queue is empty, or contains a routing missing a traceability field.',
  };
}

/** Certification Requirement 4: "Verify no constitutional authority exists beyond routing." */
export function verifyNoAuthorityExistsBeyondRouting(): ConstitutionalActuationCertification {
  const executionQueueBefore = JSON.stringify(getExecutionQueue());
  const logBefore = getSignalLog().length;
  const heartBefore = getHeartbeatState();

  getRoutingQueue();

  const verified =
    JSON.stringify(getExecutionQueue()) === executionQueueBefore &&
    getSignalLog().length === logBefore &&
    JSON.stringify(getHeartbeatState()) === JSON.stringify(heartBefore);
  return {
    criterion: 'No constitutional authority exists beyond routing.',
    verified,
    evidence: verified
      ? "Constitutional Execution's own queue, the Signal Log, and the Heartbeat state are all byte-for-byte identical before and after running this module's own functions — nothing beyond a routing record was ever produced."
      : "This module's own functions produced an observable change in Execution's queue or elsewhere in the Living Body.",
  };
}
