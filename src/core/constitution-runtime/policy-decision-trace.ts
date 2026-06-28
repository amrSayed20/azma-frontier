/**
 * WP-004: Policy Decision Trace Schema — Runtime Implementation
 * 
 * Manages immutable recording and retrieval of policy decision traces.
 * Maintains cryptographic hash chain for tamper detection and constitutional traceability.
 */

import { createHash } from 'crypto';
import {
  PolicyDecisionTrace,
  PolicyDecisionTraceRequest,
  PolicyDecisionTraceResponse,
  PolicyDecisionTraceQueryRequest,
  PolicyDecisionTraceQueryResult,
  PolicyDecisionTraceAuditReport,
  PolicyDecisionTraceSnapshot,
  PolicyDecisionTraceStatistics,
  PolicyDecisionAuthorityContext,
} from './policy-decision-trace-types';
import {
  PolicyDecisionTraceRecordError,
  PolicyDecisionTraceAuthorityError,
  PolicyDecisionTraceNotFoundError,
} from './policy-decision-trace-errors';

/**
 * Internal representation of a trace record (mutable during creation only).
 */
interface TraceRecord {
  trace: PolicyDecisionTrace;
  mutable: boolean; // false after persistence
}

/**
 * SHA256 hash generator for trace content.
 */
function computeHash(content: string): string {
  return createHash('sha256').update(content).digest('hex');
}

/**
 * Serializes an object for hashing (deterministic).
 */
function serializeForHashing(obj: unknown): string {
  return JSON.stringify(obj, Object.keys(obj as object).sort());
}

/**
 * Generates a unique trace ID.
 */
function generateTraceId(): string {
  return `trace-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Computes hash for action payload (immutable snapshot).
 */
function hashActionPayload(payload: unknown): string {
  if (!payload) return 'no-payload';
  return computeHash(serializeForHashing(payload));
}

/**
 * Validates policy decision trace structure and fields.
 */
function validateTraceStructure(trace: PolicyDecisionTrace): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!trace.traceId || trace.traceId.length === 0) {
    errors.push('traceId is required and cannot be empty');
  }
  if (trace.sequenceNumber < 0) {
    errors.push('sequenceNumber must be non-negative');
  }
  if (trace.timestamp <= 0) {
    errors.push('timestamp must be positive');
  }
  if (!trace.actor || trace.actor.length === 0) {
    errors.push('actor is required');
  }
  if (!trace.decision || !['allowed', 'denied', 'escalated', 'conditional_approval', 'pending_manual_review'].includes(trace.decision)) {
    errors.push('decision must be a valid PolicyDecisionOutcome');
  }
  if (!trace.source) {
    errors.push('source is required');
  }
  if (!trace.contentHash || trace.contentHash.length === 0) {
    errors.push('contentHash is required');
  }
  if (!trace.authority) {
    errors.push('authority context is required');
  }
  if (!trace.authority.authorityDomain || trace.authority.authorityDomain.length === 0) {
    errors.push('authority.authorityDomain is required');
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

/**
 * Public interface: Policy Decision Trace schema runtime.
 * Manages immutable recording and audit of all policy decisions.
 */
export class PolicyDecisionTraceSchema {
  private readonly traces = new Map<string, TraceRecord>();
  private sequenceCounter = 0;
  private chainId = `chain-${Date.now()}`;
  private lastTraceHash = '';

  constructor() {
    // Initialize empty chain
  }

  /**
   * Record a new policy decision trace.
   * Immutable after recording.
   */
  public recordTrace(request: PolicyDecisionTraceRequest): PolicyDecisionTraceResponse {
    try {
      // Validate required fields
      if (!request.actor || request.actor.length === 0) {
        throw new PolicyDecisionTraceRecordError(request.actor || 'unknown', 'actor is required');
      }
      if (!request.authorityDomain || request.authorityDomain.length === 0) {
        throw new PolicyDecisionTraceAuthorityError('Authority context is required', undefined, undefined);
      }

      const traceId = generateTraceId();
      const sequenceNumber = this.sequenceCounter++;
      const timestamp = Date.now();

      // Compute immutable action hashes
      const actionPayloadHash = hashActionPayload(request.action?.payload);
      const actionMetadataHash = hashActionPayload(request.action?.metadata);

      // Build authority context
      const authority: PolicyDecisionAuthorityContext = {
        authorityDomain: request.authorityDomain,
        authorityLevel: request.authorityLevel,
        authorityArticleId: request.authorityArticleId,
        authorityValidationId: request.authorityValidationId,
        authorityTraceId: request.authorityTraceId,
      };

      // Compute content hash before linking
      const contentHashInput = {
        traceId,
        sequenceNumber,
        timestamp,
        actor: request.actor,
        decision: request.decision,
        source: request.source,
        severity: request.severity,
        reasons: request.reasons,
        authority,
        actionPayloadHash,
        actionMetadataHash,
      };
      const contentHash = computeHash(serializeForHashing(contentHashInput));

      // Build immutable trace record
      const trace: PolicyDecisionTrace = {
        traceId,
        sequenceNumber,
        timestamp,
        actor: request.actor,
        actionType: request.action.actionType,
        actionScope: request.action.scope,
        targetModule: request.action.targetModule,
        actionTitle: request.action.title,

        decision: request.decision,
        severity: request.severity,
        source: request.source,

        applicablePolicies: [],
        enforcedPolicyId: request.enforcedPolicyId,
        enforcedRuleName: request.enforcedRuleName,

        authority,
        escalation: request.escalationContext,

        reasons: request.reasons,
        violations: request.violations || [],
        conditionalApprovalTerms: request.conditionalApprovalTerms,

        actionPayloadHash,
        actionMetadataHash,

        contentHash,
        previousTraceHash: this.lastTraceHash,
        chainVerified: true,
      };

      // Validate trace structure
      const validation = validateTraceStructure(trace);
      if (!validation.valid) {
        throw new PolicyDecisionTraceRecordError(request.actor, validation.errors.join('; '));
      }

      // Store immutably
      this.traces.set(traceId, {
        trace,
        mutable: false,
      });

      // Update chain state
      this.lastTraceHash = contentHash;

      return {
        success: true,
        traceId,
        sequenceNumber,
        contentHash,
        chainVerified: true,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        traceId: '',
        sequenceNumber: -1,
        contentHash: '',
        chainVerified: false,
        error: message,
      };
    }
  }

  /**
   * Retrieve a single trace by ID.
   */
  public getTrace(traceId: string): PolicyDecisionTrace {
    const record = this.traces.get(traceId);
    if (!record) {
      throw new PolicyDecisionTraceNotFoundError(traceId);
    }
    return record.trace;
  }

  /**
   * Query traces with optional filters.
   */
  public queryTraces(request: PolicyDecisionTraceQueryRequest): PolicyDecisionTraceQueryResult {
    try {
      const allTraces = Array.from(this.traces.values()).map((r) => r.trace);

      // Apply filters
      let filtered = allTraces;

      if (request.actor) {
        filtered = filtered.filter((t) => t.actor === request.actor);
      }
      if (request.actionType) {
        filtered = filtered.filter((t) => t.actionType === request.actionType);
      }
      if (request.decision) {
        filtered = filtered.filter((t) => t.decision === request.decision);
      }
      if (request.severity) {
        filtered = filtered.filter((t) => t.severity === request.severity);
      }
      if (request.source) {
        filtered = filtered.filter((t) => t.source === request.source);
      }
      if (request.startTime) {
        filtered = filtered.filter((t) => t.timestamp >= request.startTime!);
      }
      if (request.endTime) {
        filtered = filtered.filter((t) => t.timestamp <= request.endTime!);
      }

      // Sort by sequence number (chronological)
      filtered = filtered.sort((a, b) => a.sequenceNumber - b.sequenceNumber);

      // Apply limit
      const limit = request.limit || 1000;
      const result = filtered.slice(0, limit);

      // Verify chain
      const chainVerified = this.verifyChainIntegrity();

      return {
        success: true,
        traceCount: result.length,
        traces: result,
        chainVerified,
      };
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      return {
        success: false,
        traceCount: 0,
        traces: [],
        chainVerified: false,
        error: message,
      };
    }
  }

  /**
   * Verify chain integrity using hash chain.
   */
  public verifyChainIntegrity(): boolean {
    if (this.traces.size === 0) {
      return true; // Empty chain is valid
    }

    const traces = Array.from(this.traces.values())
      .map((r) => r.trace)
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

    let previousHash = '';

    for (const trace of traces) {
      // Verify sequence continuity
      if (traces.indexOf(trace) !== trace.sequenceNumber) {
        return false;
      }

      // Verify hash chain linkage
      if (trace.previousTraceHash !== previousHash) {
        return false;
      }

      previousHash = trace.contentHash;
    }

    return true;
  }

  /**
   * Generate audit report.
   */
  public generateAuditReport(): PolicyDecisionTraceAuditReport {
    const chainVerified = this.verifyChainIntegrity();
    const traces = Array.from(this.traces.values()).map((r) => r.trace);
    const orphanedTraces: string[] = [];
    const tamperedTraces: string[] = [];

    // Detect orphaned and tampered traces
    for (const trace of traces) {
      if (!trace.chainVerified) {
        orphanedTraces.push(trace.traceId);
      }

      // Verify content hash hasn't changed
      const contentHashInput = {
        traceId: trace.traceId,
        sequenceNumber: trace.sequenceNumber,
        timestamp: trace.timestamp,
        actor: trace.actor,
        decision: trace.decision,
        source: trace.source,
        severity: trace.severity,
        reasons: trace.reasons,
        authority: trace.authority,
        actionPayloadHash: trace.actionPayloadHash,
        actionMetadataHash: trace.actionMetadataHash,
      };
      const recomputedHash = computeHash(serializeForHashing(contentHashInput));
      if (recomputedHash !== trace.contentHash) {
        tamperedTraces.push(trace.traceId);
      }
    }

    const chainIntegrityScore = traces.length === 0 ? 100 : Math.max(0, 100 - (orphanedTraces.length + tamperedTraces.length) * 10);

    return {
      reportId: `audit-${Date.now()}`,
      generatedAt: Date.now(),
      totalTracesAudited: traces.length,
      chainVerified,
      orphanedTraces,
      tamperedTraces,
      chainIntegrityScore,
      summary: `Audited ${traces.length} traces. Chain verified: ${chainVerified}. Orphaned: ${orphanedTraces.length}. Tampered: ${tamperedTraces.length}.`,
    };
  }

  /**
   * Get current snapshot of trace chain state.
   */
  public getSnapshot(): PolicyDecisionTraceSnapshot {
    const traces = Array.from(this.traces.values())
      .map((r) => r.trace)
      .sort((a, b) => a.sequenceNumber - b.sequenceNumber);

    const lastTrace = traces[traces.length - 1];
    const firstTrace = traces[0];

    return {
      traceCount: traces.length,
      chainId: this.chainId,
      chainHash: this.lastTraceHash,
      lastTraceId: lastTrace?.traceId || '',
      lastTimestamp: lastTrace?.timestamp || 0,
      chainVerified: this.verifyChainIntegrity(),
      oldestTraceId: firstTrace?.traceId || '',
      oldestTimestamp: firstTrace?.timestamp || 0,
    };
  }

  /**
   * Compute statistics for policy decisions.
   */
  public getStatistics(): PolicyDecisionTraceStatistics {
    const traces = Array.from(this.traces.values()).map((r) => r.trace);

    let allowedCount = 0;
    let deniedCount = 0;
    let escalatedCount = 0;
    let pendingReviewCount = 0;
    let conditionalApprovalCount = 0;
    let highestSeverityDecisions = 0;
    let totalDecisionTime = 0;

    const decisionsBySource: Record<string, number> = {
      'policy-enforcement': 0,
      'escalation-resolution': 0,
      'authority-validation': 0,
      'boundary-evaluation': 0,
      'manual-override': 0,
    };
    const decisionsByActor: Record<string, number> = {};

    for (const trace of traces) {
      switch (trace.decision) {
        case 'allowed':
          allowedCount++;
          break;
        case 'denied':
          deniedCount++;
          break;
        case 'escalated':
          escalatedCount++;
          break;
        case 'pending_manual_review':
          pendingReviewCount++;
          break;
        case 'conditional_approval':
          conditionalApprovalCount++;
          break;
      }

      if (trace.severity === 'critical' || trace.severity === 'high') {
        highestSeverityDecisions++;
      }

      decisionsBySource[trace.source]++;

      if (!decisionsByActor[trace.actor]) {
        decisionsByActor[trace.actor] = 0;
      }
      decisionsByActor[trace.actor]++;

      totalDecisionTime += 1; // Placeholder: actual latency would be tracked separately
    }

    const averageDecisionTimeMs = traces.length > 0 ? totalDecisionTime / traces.length : 0;

    return {
      totalDecisions: traces.length,
      allowedCount,
      deniedCount,
      escalatedCount,
      pendingReviewCount,
      conditionalApprovalCount,
      averageDecisionTimeMs,
      highestSeverityDecisions,
      decisionsBySource: decisionsBySource as Record<string, number>,
      decisionsByActor,
    };
  }

  /**
   * Get count of recorded traces.
   */
  public getTraceCount(): number {
    return this.traces.size;
  }

  /**
   * Get the trace chain ID.
   */
  public getChainId(): string {
    return this.chainId;
  }
}

/**
 * Factory function to create a new policy decision trace schema.
 */
export function createPolicyDecisionTraceSchema(): PolicyDecisionTraceSchema {
  return new PolicyDecisionTraceSchema();
}
