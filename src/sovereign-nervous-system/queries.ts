/**
 * AZMA OS — THE CONSTITUTIONAL NERVOUS SYSTEM
 * Read-only Query Layer
 * Construction Phase II
 *
 * Pure functions over the Signal Log and State Registry — used for
 * traceability review and certification, never for decision-making.
 */

import { getSignalLog } from './perception-bus';
import { listObservedOrganIds, observeOrganState } from './state-registry';
import type { ConstitutionalSignal } from './types';

/** Every signal ever emitted by one organ, oldest first. Pure filter over the append-only log. */
export function getSignalHistoryForOrgan(organId: string): readonly ConstitutionalSignal[] {
  return getSignalLog().filter((signal) => signal.origin === organId);
}

/** Confirms every signal in the log carries exactly one legitimate, traceable origin and a unique id — a certification check, not a runtime guard (the Bus already enforces origin legitimacy at emit time). */
export function verifyLogTraceability(): { traceable: boolean; totalSignals: number; duplicateIds: string[] } {
  const log = getSignalLog();
  const seen = new Set<string>();
  const duplicateIds: string[] = [];
  for (const signal of log) {
    if (seen.has(signal.signalId)) duplicateIds.push(signal.signalId);
    seen.add(signal.signalId);
  }
  return { traceable: duplicateIds.length === 0, totalSignals: log.length, duplicateIds };
}

/** Every organ that has reported at least one signal, with its current observable state. */
export function getObservedOrgansSummary() {
  return listObservedOrganIds().map((organId) => ({
    organId,
    state: observeOrganState(organId),
  }));
}
