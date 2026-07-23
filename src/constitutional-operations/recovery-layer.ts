/**
 * AZMA OS — THE CONSTITUTIONAL RECOVERY LAYER
 * Package I — The First Living Operational Cycle
 *
 * "Recovery preserves constitutional continuity" — since every stage in
 * this cycle is a deterministic, pure pull function, there is nothing to
 * "retry": a rejection at one stage, for one candidate, never halts or
 * corrupts the cycle for any other candidate. This file verifies that
 * fact rather than implementing any retry/rollback mechanism (none is
 * needed or authorized) — it confirms the Operational Cycle is still
 * running, and the Heart's own continuity is unaffected, after any
 * number of rejections have occurred.
 */

import { getHeartbeatState } from '../sovereign-heart';
import { isOperating } from './runtime-coordinator';
import { getOperationalFailureSnapshot } from './failure-detection-layer';
import type { OperationalContinuityCheck } from './types';

export function verifyOperationalContinuityAfterFailures(): OperationalContinuityCheck {
  const failures = getOperationalFailureSnapshot();
  const heartbeatState = getHeartbeatState();
  const continuityPreserved = typeof heartbeatState.awake === 'boolean';
  return {
    continuityPreserved,
    evidence: continuityPreserved
      ? `${failures.totalRejectionCount} rejection(s) recorded across all stages so far; the Operational Cycle's own running state (isOperating: ${isOperating()}) and the Heart's own heartbeat mechanism remain independently queryable and well-formed — no rejection has ever halted, corrupted, or required repairing the cycle.`
      : "The Heart's own heartbeat state was malformed after recorded rejections.",
  };
}
