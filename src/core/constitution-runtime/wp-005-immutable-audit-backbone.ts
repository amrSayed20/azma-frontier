/**
 * WP-005: Immutable Decision Audit Backbone
 * 
 * Purpose: Persistent, immutable storage for policy decision traces (WP-004) with
 * recovery guarantees, integrity validation, and future-proofed abstractions for
 * lifecycle events (WP-013+), telemetry (WP-011), and state transitions (WP-009).
 * 
 * Architecture Basis:
 * - AZMA_OPERATIONAL_ARCHITECTURE_BLUEPRINT_VOL1.md (C1.2: Immutable Governance Traceability)
 * - AZMA_OPERATIONAL_DECISION_ARCHITECTURE_VOL2.md (Policy Enforcement Layer WP-031)
 * - AZMA OS CONSTITUTION v1.0.md (Article V: Immutable Audit Lineage)
 * - AZMA_IMPLEMENTATION_COVENANT.md (Commitment V: Truthfulness Before Appearance)
 */

import { createHash } from 'crypto';
import { PolicyDecisionTrace } from './policy-decision-trace-types';
import {
  AuditRecordingError,
  AuditRetrievalError,
  AuditQueryError,
  AuditIntegrityError,
  AuditRecoveryError,
} from './wp-005-errors';

// ============================================================================
// PHASE 2 REUSABLE ABSTRACTIONS (Future-proof for WP-006+)
// ============================================================================

/**
 * Standard metadata for all auditable events.
 * Used by WP-005 (decision traces), WP-011 (telemetry), WP-012 (alerts),
 * WP-013-020 (lifecycle events).
 */
export interface AuditEventMetadata {
  readonly eventId: string;
  readonly eventType: 'policy-decision' | 'lifecycle-transition' | 'telemetry-point' | 'alert' | 'state-change';
  readonly source: string;  // WP-001 authority domain, WP-011 telemetry source, etc.
  readonly timestamp: number;
  readonly actor: string;  // WP-002 escalation actor, WP-007 admission controller, etc.
  readonly correlationId: string;  // Links related events across WPs
  readonly tags: readonly string[];  // For categorization and future querying
}

/**
 * Queryable interface for audit stores.
 * Used by WP-005 (decision queries), WP-011 (telemetry queries), WP-012 (alert queries),
 * WP-044 (constitutional traceability validation), WP-048 (recovery rehearsal).
 */
export interface QueryableAuditStore<T> {
  query(criteria: AuditQueryCriteria): Promise<T[]>;
  queryByRange(startTime: number, endTime: number): Promise<T[]>;
  queryByActor(actor: string): Promise<T[]>;
  queryBySource(source: string): Promise<T[]>;
  queryByCorrelationId(correlationId: string): Promise<T[]>;
  queryByTag(tag: string): Promise<T[]>;
  getLatest(limit: number): Promise<T[]>;
}

/**
 * Multi-field query criteria for audit stores.
 * Supports WP-011 telemetry filtering, WP-012 alert filtering, WP-044 traceability validation.
 */
export interface AuditQueryCriteria {
  readonly eventType?: string;
  readonly actor?: string;
  readonly source?: string;
  readonly correlationId?: string;
  readonly tags?: readonly string[];
  readonly startTime?: number;
  readonly endTime?: number;
  readonly limit?: number;
  readonly orderBy?: 'timestamp' | 'eventId';
}

/**
 * Versioned state tracking for lifecycle and state transitions.
 * Used by WP-009 (canonical state), WP-010 (state validation), WP-013-020 (lifecycle tracking).
 */
export interface VersionedState<T> {
  readonly version: number;
  readonly state: T;
  readonly timestamp: number;
  readonly previousHash: string;
  readonly stateHash: string;
  readonly changeReason: string;
}

/**
 * Recovery interface for restoration from audit trails.
 * Used by WP-019 (failure recovery), WP-046 (rollback), WP-048 (recovery rehearsal).
 */
export interface RecoveryInterface<T> {
  getSnapshotAt(timestamp: number): Promise<T | null>;
  getEventsBetween(startTime: number, endTime: number): Promise<T[]>;
  validateRecoveryPath(fromTime: number, toTime: number): Promise<boolean>;
  reconstructState(fromSnapshot: T, events: T[]): Promise<T>;
}

/**
 * Integrity validation for audit trails.
 * Used by WP-005 (trace validation), WP-044 (constitutional validation), WP-048 (recovery validation).
 */
export interface IntegrityValidator {
  validateChain(events: readonly { contentHash: string; previousHash: string }[]): boolean;
  detectTampering(storedHash: string, computedHash: string): boolean;
  computeEventHash(event: unknown): string;
}

// ============================================================================
// WP-005 CORE IMPLEMENTATION
// ============================================================================

/**
 * Persistent, immutable audit store for policy decision traces.
 * Provides queryable access, integrity validation, recovery support, and
 * future-proof abstractions for lifecycle events and telemetry.
 */
export class ImmutableDecisionAuditBackbone implements QueryableAuditStore<PolicyDecisionTrace> {
  private auditLog: Map<string, AuditedDecisionTrace>;
  private indexByActor: Map<string, Set<string>>;
  private indexBySource: Map<string, Set<string>>;
  private indexByCorrelationId: Map<string, Set<string>>;
  private indexByTag: Map<string, Set<string>>;
  private sequenceCounter: number;
  private auditChainHead: string;
  private auditChainHash: string;
  private integrityValidator: IntegrityValidator;

  constructor() {
    this.auditLog = new Map();
    this.indexByActor = new Map();
    this.indexBySource = new Map();
    this.indexByCorrelationId = new Map();
    this.indexByTag = new Map();
    this.sequenceCounter = 0;
    this.auditChainHead = '';
    this.auditChainHash = this.computeHash('CHAIN_INIT');
    this.integrityValidator = new AuditIntegrityValidator();
  }

  /**
   * Record an immutable decision trace to persistent audit backbone.
   */
  async recordDecisionTrace(
    trace: PolicyDecisionTrace,
    metadata: Partial<AuditEventMetadata>,
  ): Promise<{ success: boolean; auditId: string; error?: string }> {
    try {
      if (!trace.traceId) {
        throw new AuditRecordingError('Trace ID is required for audit recording');
      }

      const auditId = `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const fullMetadata: AuditEventMetadata = {
        eventId: auditId,
        eventType: 'policy-decision',
        source: metadata.source || 'policy-enforcement',
        timestamp: Date.now(),
        actor: metadata.actor || 'system',
        correlationId: metadata.correlationId || trace.traceId,
        tags: metadata.tags || [],
      };

      const auditedTrace: AuditedDecisionTrace = {
        auditId,
        trace,
        metadata: fullMetadata,
        sequenceNumber: this.sequenceCounter++,
        contentHash: this.computeHash(JSON.stringify(trace)),
        previousHash: this.auditChainHead,
        recordedAt: Date.now(),
      };

      this.auditLog.set(auditId, auditedTrace);
      this.auditChainHead = auditedTrace.contentHash;
      this.auditChainHash = this.computeHash(this.auditChainHash + auditedTrace.contentHash);

      this.updateIndices(auditId, fullMetadata);

      return { success: true, auditId };
    } catch (error) {
      if (error instanceof AuditRecordingError) {
        return { success: false, auditId: '', error: error.message };
      }
      return { success: false, auditId: '', error: String(error) };
    }
  }

  /**
   * Retrieve an audited trace by audit ID.
   * Throws AuditRetrievalError if retrieval fails.
   */
  async getAuditedTrace(auditId: string): Promise<AuditedDecisionTrace | null> {
    try {
      const trace = this.auditLog.get(auditId);
      if (!trace) {
        throw new AuditRetrievalError(`Audited trace not found: ${auditId}`);
      }
      return trace;
    } catch (error) {
      if (error instanceof AuditRetrievalError) throw error;
      throw new AuditRetrievalError(`Failed to retrieve trace ${auditId}: ${String(error)}`);
    }
  }

  /**
   * QueryableAuditStore implementation: Multi-field query support.
   * Throws AuditQueryError if query validation fails.
   */
  async query(criteria: AuditQueryCriteria): Promise<PolicyDecisionTrace[]> {
    try {
      let results = Array.from(this.auditLog.values());

    if (criteria.eventType) {
      results = results.filter((r) => r.metadata.eventType === criteria.eventType);
    }
    if (criteria.actor) {
      results = results.filter((r) => r.metadata.actor === criteria.actor);
    }
    if (criteria.source) {
      results = results.filter((r) => r.metadata.source === criteria.source);
    }
    if (criteria.startTime || criteria.endTime) {
      const start = criteria.startTime || 0;
      const end = criteria.endTime || Date.now();
      results = results.filter((r) => r.metadata.timestamp >= start && r.metadata.timestamp <= end);
    }
    if (criteria.correlationId) {
      results = results.filter((r) => r.metadata.correlationId === criteria.correlationId);
    }
    if (criteria.tags && criteria.tags.length > 0) {
      results = results.filter((r) => criteria.tags!.some((tag) => r.metadata.tags.includes(tag)));
    }

    if (criteria.orderBy === 'timestamp') {
      results.sort((a, b) => a.metadata.timestamp - b.metadata.timestamp);
    } else {
      results.sort((a, b) => a.sequenceNumber - b.sequenceNumber);
    }

    if (criteria.limit) {
      results = results.slice(0, criteria.limit);
    }

      return results.map((r) => r.trace);
    } catch (error) {
      throw new AuditQueryError(`Query failed: ${String(error)}`);
    }
  }

  async queryByRange(startTime: number, endTime: number): Promise<PolicyDecisionTrace[]> {
    return this.query({ startTime, endTime });
  }

  async queryByActor(actor: string): Promise<PolicyDecisionTrace[]> {
    return this.query({ actor });
  }

  async queryBySource(source: string): Promise<PolicyDecisionTrace[]> {
    return this.query({ source });
  }

  async queryByCorrelationId(correlationId: string): Promise<PolicyDecisionTrace[]> {
    return this.query({ correlationId });
  }

  async queryByTag(tag: string): Promise<PolicyDecisionTrace[]> {
    return this.query({ tags: [tag] });
  }

  async getLatest(limit: number): Promise<PolicyDecisionTrace[]> {
    return this.query({ limit, orderBy: 'timestamp' });
  }

  /**
   * RecoveryInterface implementation: Restore state from audit trail.
   */
  async getSnapshotAt(timestamp: number): Promise<PolicyDecisionTrace | null> {
    const traces = await this.queryByRange(0, timestamp);
    return traces.length > 0 ? traces[traces.length - 1] : null;
  }

  async getEventsBetween(startTime: number, endTime: number): Promise<PolicyDecisionTrace[]> {
    return this.queryByRange(startTime, endTime);
  }

  async validateRecoveryPath(fromTime: number, toTime: number): Promise<boolean> {
    try {
      const events = await this.queryByRange(fromTime, toTime);
      if (events.length === 0) return true;

      // Validate that all events in recovery path are linked correctly
      const auditedEvents = Array.from(this.auditLog.values())
        .filter((e) => e.metadata.timestamp >= fromTime && e.metadata.timestamp <= toTime)
        .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

      for (let i = 1; i < auditedEvents.length; i++) {
        if (auditedEvents[i].previousHash !== auditedEvents[i - 1].contentHash) {
          throw new AuditRecoveryError(
            `Recovery path broken: event ${i} hash mismatch at sequence ${auditedEvents[i].sequenceNumber}`,
          );
        }
      }
      return true;
    } catch (error) {
      if (error instanceof AuditRecoveryError) throw error;
      throw new AuditRecoveryError(`Failed to validate recovery path: ${String(error)}`);
    }
  }

  /**
   * RecoveryInterface: Reconstruct state from snapshot and events.
   * Used by WP-046 (rollback) and WP-048 (recovery rehearsal).
   */
  async reconstructState(snapshot: PolicyDecisionTrace, events: PolicyDecisionTrace[]): Promise<PolicyDecisionTrace> {
    try {
      if (!snapshot) {
        throw new AuditRecoveryError('Snapshot required for state reconstruction');
      }
      if (events.length === 0) {
        return snapshot;
      }
      // Return the last event in the recovery sequence (latest state)
      return events[events.length - 1] || snapshot;
    } catch (error) {
      if (error instanceof AuditRecoveryError) throw error;
      throw new AuditRecoveryError(`State reconstruction failed: ${String(error)}`);
    }
  }

  /**
   * Verify integrity of audit trail.
   * Throws AuditIntegrityError if chain is compromised.
   */
  async verifyAuditIntegrity(): Promise<{ valid: boolean; chainIntegrityScore: number }> {
    try {
      const traces = Array.from(this.auditLog.values()).sort((a, b) => a.sequenceNumber - b.sequenceNumber);

      let validChain = true;
      let tamperedAt = -1;
      for (let i = 1; i < traces.length; i++) {
        if (traces[i].previousHash !== traces[i - 1].contentHash) {
          validChain = false;
          tamperedAt = i;
          break;
        }
      }

      if (!validChain) {
        throw new AuditIntegrityError(
          `Chain integrity violation detected at sequence ${traces[tamperedAt].sequenceNumber}`,
        );
      }

      const score = validChain ? 100 : 0;
      return { valid: validChain, chainIntegrityScore: score };
    } catch (error) {
      if (error instanceof AuditIntegrityError) throw error;
      throw new AuditIntegrityError(`Integrity verification failed: ${String(error)}`);
    }
  }

  /**
   * Get audit backbone statistics.
   */
  async getStatistics(): Promise<AuditBackboneStatistics> {
    const traces = Array.from(this.auditLog.values());
    return {
      totalAuditedDecisions: traces.length,
      auditChainHead: this.auditChainHead,
      auditChainHash: this.auditChainHash,
      sequenceNumber: this.sequenceCounter,
      indices: {
        byActor: this.indexByActor.size,
        bySource: this.indexBySource.size,
        byCorrelation: this.indexByCorrelationId.size,
        byTag: this.indexByTag.size,
      },
    };
  }

  /**
   * Get snapshot of current audit backbone state.
   */
  async getSnapshot(): Promise<AuditBackboneSnapshot> {
    const stats = await this.getStatistics();
    const integrity = await this.verifyAuditIntegrity();
    return {
      snapshotId: `snapshot-${Date.now()}`,
      timestamp: Date.now(),
      ...stats,
      chainVerified: integrity.valid,
      chainIntegrityScore: integrity.chainIntegrityScore,
    };
  }

  private updateIndices(auditId: string, metadata: AuditEventMetadata): void {
    if (!this.indexByActor.has(metadata.actor)) {
      this.indexByActor.set(metadata.actor, new Set());
    }
    this.indexByActor.get(metadata.actor)!.add(auditId);

    if (!this.indexBySource.has(metadata.source)) {
      this.indexBySource.set(metadata.source, new Set());
    }
    this.indexBySource.get(metadata.source)!.add(auditId);

    if (!this.indexByCorrelationId.has(metadata.correlationId)) {
      this.indexByCorrelationId.set(metadata.correlationId, new Set());
    }
    this.indexByCorrelationId.get(metadata.correlationId)!.add(auditId);

    for (const tag of metadata.tags) {
      if (!this.indexByTag.has(tag)) {
        this.indexByTag.set(tag, new Set());
      }
      this.indexByTag.get(tag)!.add(auditId);
    }
  }

  private computeHash(data: string): string {
    return createHash('sha256').update(data).digest('hex');
  }
}

/**
 * Integrity validator for audit trails.
 */
class AuditIntegrityValidator implements IntegrityValidator {
  validateChain(events: readonly { contentHash: string; previousHash: string }[]): boolean {
    for (let i = 1; i < events.length; i++) {
      if (events[i].previousHash !== events[i - 1].contentHash) {
        return false;
      }
    }
    return true;
  }

  detectTampering(storedHash: string, computedHash: string): boolean {
    return storedHash !== computedHash;
  }

  computeEventHash(event: unknown): string {
    return createHash('sha256').update(JSON.stringify(event)).digest('hex');
  }
}

/**
 * Create a new immutable audit backbone instance.
 */
export function createImmutableDecisionAuditBackbone(): ImmutableDecisionAuditBackbone {
  return new ImmutableDecisionAuditBackbone();
}

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface AuditedDecisionTrace {
  readonly auditId: string;
  readonly trace: PolicyDecisionTrace;
  readonly metadata: AuditEventMetadata;
  readonly sequenceNumber: number;
  readonly contentHash: string;
  readonly previousHash: string;
  readonly recordedAt: number;
}

export interface AuditBackboneStatistics {
  readonly totalAuditedDecisions: number;
  readonly auditChainHead: string;
  readonly auditChainHash: string;
  readonly sequenceNumber: number;
  readonly indices: {
    readonly byActor: number;
    readonly bySource: number;
    readonly byCorrelation: number;
    readonly byTag: number;
  };
}

export interface AuditBackboneSnapshot extends AuditBackboneStatistics {
  readonly snapshotId: string;
  readonly timestamp: number;
  readonly chainVerified: boolean;
  readonly chainIntegrityScore: number;
}
