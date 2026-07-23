/**
 * AZMA OS — THE CONSTITUTIONAL OPERATIONAL AUDIT LAYER
 * Package I — The First Living Operational Cycle
 *
 * An append-only record of every dispatch cycle ever run — "Preserve
 * complete traceability." Records only the counts the Dispatch
 * Coordinator itself already returned; never re-derives or inspects any
 * stage's own content.
 */

import type { OperationalAuditEntry, OperationalCycleResult } from './types';

let auditLog: OperationalAuditEntry[] = [];
let auditSequence = 0;

export function recordAuditEntry(cycle: OperationalCycleResult): OperationalAuditEntry {
  auditSequence += 1;
  const entry: OperationalAuditEntry = {
    auditId: `audit-${auditSequence}`,
    recordedAt: new Date().toISOString(),
    cycle,
  };
  auditLog.push(entry);
  return entry;
}

export function getOperationalAuditLog(): readonly OperationalAuditEntry[] {
  return [...auditLog];
}

/** Test/reset utility. */
export function resetOperationalAuditLog(): void {
  auditLog = [];
  auditSequence = 0;
}
