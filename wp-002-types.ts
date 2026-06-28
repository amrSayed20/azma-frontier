/**
 * WP-002: Execution Kernel — Audit Trail Types (STUB)
 * 
 * This stub file provides the minimal types needed by higher layers.
 * Complete WP-002 implementation would include full audit infrastructure.
 */

/**
 * Unique identifier for audit trail entries
 * References Layer 2 immutable audit backbone
 */
export type AuditTrailId = string & { readonly __brand: 'AuditTrailId' };

/**
 * Create a branded AuditTrailId
 */
export function createAuditTrailId(value: string): AuditTrailId {
  return value as AuditTrailId;
}

/**
 * Decision trace (rationale)
 * Records decision reasoning and supporting evidence
 */
export interface DecisionTrace {
  readonly decision: string;
  readonly reasoning: readonly string[];
  readonly timestamp: Date;
  readonly evidenceLinks?: readonly string[];
}

/**
 * Audit trail entry (immutable)
 * Records all decisions for traceability and reproducibility
 */
export interface AuditTrailEntry {
  readonly entryId: AuditTrailId;
  readonly timestamp: Date;
  readonly entityType: string;
  readonly entityId: string;
  readonly operation: 'CREATE' | 'READ' | 'UPDATE' | 'DELETE' | 'POLICY_APPLIED' | 'DECISION_MADE';
  readonly trace: DecisionTrace;
  readonly actor: string;
  readonly previousHash?: string; // SHA256 hash of previous entry
  readonly dataHash: string; // SHA256 hash of this entry's data
}

/**
 * Audit trail integrity verification
 * Proves chain continuity and prevents tampering
 */
export interface AuditIntegrity {
  readonly entryId: AuditTrailId;
  readonly valid: boolean;
  readonly hashValid: boolean;
  readonly chainValid: boolean;
  readonly explanation: string;
}
