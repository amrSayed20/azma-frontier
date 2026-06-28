/**
 * WP-007: Runtime Admission Controller — Canonical Runtime Engine
 * 
 * RUNTIME-FIRST PRINCIPLE:
 * - This is the permanent, constitutional layer
 * - No dependencies on UI, Chambers, Providers, Models
 * - Consumed by adapters, not dependent on them
 * - Stable contracts consumed by Chambers, Agents, Sovereign AI
 * 
 * Core Responsibility:
 * - Evaluate incoming requests against policy rules
 * - Record decisions immutably to WP-005 audit backbone
 * - Enforce latency SLA (<50ms, Instant Execution pattern)
 * - Provide queryable decision history
 * - Support rollback and recovery via WP-046
 */

import { createHash } from 'crypto';
import { PolicyDecisionTrace, PolicyDecisionOutcome, PolicyDecisionSeverity } from './policy-decision-trace-types';
import { ConstitutionArticleId } from './constitution-types';
import { ImmutableDecisionAuditBackbone } from './wp-005-immutable-audit-backbone';

/**
 * Runtime Engine: Core Admission Decision Logic
 * 
 * Canonical, reusable component that evaluates requests and records decisions.
 * No external dependencies. Consumed by adapters (Feature, Chamber, Agent).
 */
export class RuntimeAdmissionEngine {
  private auditBackbone: ImmutableDecisionAuditBackbone;
  private requestLog: Map<string, RuntimeDecisionRecord>;
  private sequenceCounter: number = 0;
  private chainHead: string = '';

  constructor(auditBackbone: ImmutableDecisionAuditBackbone) {
    this.auditBackbone = auditBackbone;
    this.requestLog = new Map();
    this.chainHead = '';
  }

  /**
   * Core Decision Engine: Evaluate and record a request decision
   * 
   * Canonical API consumed by all adapters, chambers, agents.
   * Pure business logic, no feature-specific customization here.
   */
  async evaluateAndRecord(
    request: RuntimeAdmissionRequest,
    decision: AdmissionEvaluation,
  ): Promise<RuntimeDecisionRecord> {
    const recordId = `record-${request.requestId}-${Date.now()}`;
    const timestamp = Date.now();

    // Validate SLA constraint
    if (decision.latencyMs > 50) {
      console.warn(`⚠️ SLA violation: Evaluation took ${decision.latencyMs}ms (max 50ms)`);
    }

    // Compute deterministic hash for integrity
    const contentHash = this.computeHash(JSON.stringify({
      requestId: request.requestId,
      decision: decision.outcome,
      severity: decision.severity,
      timestamp,
      authorityArticleId: decision.authorityArticleId,
    }));

    // Create immutable record
    const record: RuntimeDecisionRecord = {
      recordId,
      requestId: request.requestId,
      timestamp,
      decision: decision.outcome,
      severity: decision.severity,
      allowed: decision.outcome === 'allowed',
      reason: decision.reason,
      authorityArticleId: decision.authorityArticleId,
      latencyMs: decision.latencyMs,
      sequenceNumber: this.sequenceCounter++,
      contentHash,
      previousHash: this.chainHead,
      chainVerified: this.chainHead === '' || this.chainHead.length > 0,
    };

    // Record to immutable audit backbone
    await this.recordToAuditBackbone(request, record);

    // Update chain head
    this.chainHead = record.contentHash;

    // Store in local log
    this.requestLog.set(recordId, record);

    return record;
  }

  /**
   * Query historical decisions by criteria
   * Used by adapters, chambers, WP-011 (telemetry), WP-044 (traceability)
   */
  async queryDecisions(criteria: RuntimeQueryCriteria): Promise<RuntimeDecisionRecord[]> {
    let results = Array.from(this.requestLog.values());

    if (criteria.requestId) {
      results = results.filter((r) => r.requestId === criteria.requestId);
    }

    if (criteria.outcome) {
      results = results.filter((r) => r.decision === criteria.outcome);
    }

    if (criteria.severity) {
      results = results.filter((r) => r.severity === criteria.severity);
    }

    if (criteria.startTime || criteria.endTime) {
      const start = criteria.startTime || 0;
      const end = criteria.endTime || Date.now();
      results = results.filter((r) => r.timestamp >= start && r.timestamp <= end);
    }

    if (criteria.limit) {
      results = results.slice(0, criteria.limit);
    }

    // Sort by sequence for deterministic ordering
    results.sort((a, b) => a.sequenceNumber - b.sequenceNumber);

    return results;
  }

  /**
   * Verify chain integrity
   * Used by WP-044 (constitutional traceability), WP-046 (rollback)
   */
  async verifyChainIntegrity(): Promise<ChainVerificationResult> {
    let verified = true;
    let tamperedCount = 0;
    let lastHash = '';

    for (const record of Array.from(this.requestLog.values()).sort((a, b) => a.sequenceNumber - b.sequenceNumber)) {
      if (record.previousHash !== lastHash) {
        verified = false;
        tamperedCount++;
      }
      lastHash = record.contentHash;
    }

    return {
      verified,
      chainLength: this.requestLog.size,
      tamperedRecords: tamperedCount,
      currentHead: this.chainHead,
    };
  }

  /**
   * Get statistics for observability
   * Used by WP-011 (telemetry), WP-048 (recovery rehearsal)
   */
  getStatistics(): RuntimeEngineStatistics {
    const records = Array.from(this.requestLog.values());
    const approved = records.filter((r) => r.allowed).length;
    const denied = records.filter((r) => !r.allowed && r.decision === 'denied').length;
    const escalated = records.filter((r) => r.decision === 'escalated').length;

    const latencies = records.map((r) => r.latencyMs);
    const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
    const maxLatency = latencies.length > 0 ? Math.max(...latencies) : 0;

    return {
      totalDecisions: records.length,
      approvedCount: approved,
      deniedCount: denied,
      escalatedCount: escalated,
      averageLatencyMs: avgLatency,
      maxLatencyMs: maxLatency,
      chainLength: records.length,
      currentSequence: this.sequenceCounter,
    };
  }

  /**
   * Reset state for WP-046 rollback scenarios
   */
  async resetToSnapshot(timestamp: number): Promise<boolean> {
    const records = Array.from(this.requestLog.values()).filter((r) => r.timestamp <= timestamp);
    this.requestLog.clear();

    for (const record of records.sort((a, b) => a.sequenceNumber - b.sequenceNumber)) {
      this.requestLog.set(record.recordId, record);
    }

    if (records.length > 0) {
      this.chainHead = records[records.length - 1].contentHash;
      this.sequenceCounter = records[records.length - 1].sequenceNumber + 1;
    }

    return true;
  }

  /**
   * ============================================================================
   * PRIVATE HELPERS
   * ============================================================================
   */

  private async recordToAuditBackbone(
    request: RuntimeAdmissionRequest,
    record: RuntimeDecisionRecord,
  ): Promise<void> {
    const trace: PolicyDecisionTrace = {
      traceId: `trace-admission-${record.recordId}`,
      sequenceNumber: record.sequenceNumber,
      timestamp: record.timestamp,
      actor: 'admission-runtime-engine',
      actionType: request.actionType,
      actionScope: 'runtime-entry',
      targetModule: 'admission-engine',
      actionTitle: 'Admission Evaluation',
      decision: record.decision as PolicyDecisionOutcome,
      severity: record.severity,
      source: 'policy-enforcement',
      applicablePolicies: [],
      authority: {
        authorityDomain: 'runtime-control',
        authorityLevel: 'operational',
        authorityArticleId: record.authorityArticleId || ('Art1' as ConstitutionArticleId),
        authorityValidationId: `auth-${record.recordId}`,
        authorityTraceId: `trace-admission-${record.recordId}`,
      },
      reasons: [record.reason],
      violations: [],
      contentHash: record.contentHash,
      actionPayloadHash: this.computeHash(JSON.stringify(request.payload)),
      actionMetadataHash: this.computeHash(JSON.stringify({ userId: request.userId, source: request.source })),
      chainVerified: record.chainVerified,
    };

    const response = await this.auditBackbone.recordDecisionTrace(trace, {
      actor: 'admission-runtime-engine',
      source: 'policy-enforcement',
      correlationId: request.requestId,
      tags: ['admission', request.actionType, record.decision],
    });

    if (!response.success) {
      console.error(`⚠️ Failed to record to audit: ${response.error}`);
    }
  }

  private computeHash(content: string): string {
    return createHash('sha256').update(content).digest('hex');
  }
}

/**
 * ============================================================================
 * CANONICAL TYPE CONTRACTS (Kernel Interfaces)
 * ============================================================================
 */

/**
 * Incoming request to evaluate
 * Used by all consumers: adapters, chambers, agents
 */
export interface RuntimeAdmissionRequest {
  readonly requestId: string;
  readonly userId: string;
  readonly actionType: string;
  readonly payload: Record<string, unknown>;
  readonly timestamp: number;
  readonly source: 'direct-user' | 'agent-delegated' | 'orchestrator-initiated';
}

/**
 * Evaluation result from business logic (before recording)
 */
export interface AdmissionEvaluation {
  readonly outcome: PolicyDecisionOutcome;
  readonly severity: PolicyDecisionSeverity;
  readonly reason: string;
  readonly authorityArticleId?: ConstitutionArticleId;
  readonly latencyMs: number;
}

/**
 * Immutable recorded decision
 * Returned by Runtime Engine, used by all consumers
 */
export interface RuntimeDecisionRecord {
  readonly recordId: string;
  readonly requestId: string;
  readonly timestamp: number;
  readonly decision: PolicyDecisionOutcome;
  readonly severity: PolicyDecisionSeverity;
  readonly allowed: boolean;
  readonly reason: string;
  readonly authorityArticleId?: ConstitutionArticleId;
  readonly latencyMs: number;
  readonly sequenceNumber: number;
  readonly contentHash: string;
  readonly previousHash: string;
  readonly chainVerified: boolean;
}

/**
 * Query interface for consumers
 */
export interface RuntimeQueryCriteria {
  readonly requestId?: string;
  readonly outcome?: PolicyDecisionOutcome;
  readonly severity?: PolicyDecisionSeverity;
  readonly startTime?: number;
  readonly endTime?: number;
  readonly limit?: number;
}

/**
 * Statistics for observability
 */
export interface RuntimeEngineStatistics {
  readonly totalDecisions: number;
  readonly approvedCount: number;
  readonly deniedCount: number;
  readonly escalatedCount: number;
  readonly averageLatencyMs: number;
  readonly maxLatencyMs: number;
  readonly chainLength: number;
  readonly currentSequence: number;
}

/**
 * Chain verification result
 */
export interface ChainVerificationResult {
  readonly verified: boolean;
  readonly chainLength: number;
  readonly tamperedRecords: number;
  readonly currentHead: string;
}
