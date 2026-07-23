/**
 * AZMA OS — THE CONSTITUTIONAL CIRCULATION
 * Certification Query Layer
 * Construction Phase III
 */

import { getSignalLog, verifyLogTraceability } from '../sovereign-nervous-system';
import { ingestCirculatedSignal } from './transport';
import type { CirculationEnvelope } from './types';

/**
 * Certification check: ingests a signal exactly as the cross-runtime API
 * route would, then confirms it is present in the (server-side) Signal
 * Log with its origin and traceability intact. Used by the test suite
 * and available for a future health-check endpoint — performs no
 * interpretation of the signal itself.
 */
export function verifyCrossRuntimeContinuity(
  draft: CirculationEnvelope['draft'],
): { continuityPreserved: boolean; reason: string | null } {
  const before = getSignalLog().length;
  const result = ingestCirculatedSignal(draft);

  if (!result.circulated || !result.signal) {
    return { continuityPreserved: false, reason: result.reason };
  }

  const after = getSignalLog();
  const found = after.find((signal) => signal.signalId === result.signal!.signalId);
  const traceability = verifyLogTraceability();

  if (after.length !== before + 1 || !found || found.origin !== draft.origin || !traceability.traceable) {
    return { continuityPreserved: false, reason: 'Signal was not recorded with preserved origin/traceability.' };
  }

  return { continuityPreserved: true, reason: null };
}
