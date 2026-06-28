/**
 * WP-007: Runtime Admission Controller — Chamber Integration Layer
 * 
 * RUNTIME-FIRST PRINCIPLE:
 * - This is the consumer/chamber integration wrapper
 * - Depends on: Runtime Engine + Adapter Layer
 * - Can be replaced without affecting Runtime or Adapter
 * - Provides chamber-specific API surface
 */

import { RuntimeAdmissionEngine } from './wp-007-runtime-engine';
import { AdmissionPolicyAdapter } from './wp-007-adapter';
import { ImmutableDecisionAuditBackbone } from './wp-005-immutable-audit-backbone';
import {
  RuntimeUserRequest,
  AdmissionPolicyRule,
  AdmissionApprovedRoute,
  AdmissionDeniedResponse,
  AdmissionControllerConfig,
  AdmissionControllerStatistics,
} from './wp-007-types';
import { ConstitutionActionContext } from './constitution-types';

/**
 * Chamber Integration: Admission Controller (Full Stack)
 * 
 * Orchestrates Runtime Engine + Adapter Layer to provide complete
 * admission control capability to chambers and consumers.
 */
export class RuntimeAdmissionController {
  private runtime: RuntimeAdmissionEngine;
  private adapter: AdmissionPolicyAdapter;
  private config: AdmissionControllerConfig;
  private statistics: {
    totalRequestsProcessed: number;
    totalApproved: number;
    totalDenied: number;
    totalEscalated: number;
    averageLatencyMs: number;
    maxLatencyMs: number;
    minLatencyMs: number;
    policyViolationRate: number;
    lastResetTime: number;
  };
  private requestCounter: number = 0;

  constructor(
    auditBackbone: ImmutableDecisionAuditBackbone,
    config: Partial<AdmissionControllerConfig> = {},
  ) {
    this.runtime = new RuntimeAdmissionEngine(auditBackbone);
    this.adapter = new AdmissionPolicyAdapter(this.runtime);

    this.config = {
      maxRequestPayloadSizeBytes: config.maxRequestPayloadSizeBytes || 1024 * 1024,
      maxLatencyMs: config.maxLatencyMs || 50,
      enabledPolicies: config.enabledPolicies || [],
      auditVerbose: config.auditVerbose ?? true,
      fallbackBehavior: config.fallbackBehavior || 'escalate',
    };

    this.statistics = {
      totalRequestsProcessed: 0,
      totalApproved: 0,
      totalDenied: 0,
      totalEscalated: 0,
      averageLatencyMs: 0,
      maxLatencyMs: 0,
      minLatencyMs: Infinity,
      policyViolationRate: 0,
      lastResetTime: Date.now(),
    };
  }

  /**
   * Chamber API: Register admission policy
   */
  public registerPolicy(policy: AdmissionPolicyRule): void {
    this.adapter.registerPolicy(policy);
  }

  /**
   * Chamber API: Remove policy
   */
  public removePolicy(policyId: string): void {
    this.adapter.removePolicy(policyId);
  }

  /**
   * Chamber API: Evaluate request (full pipeline)
   * Parameter actionContext is preserved for API compatibility with chambers.
   */
  public async evaluateRequest(
    request: RuntimeUserRequest,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _actionContext: ConstitutionActionContext,
  ): Promise<AdmissionApprovedRoute | AdmissionDeniedResponse> {
    const startTime = Date.now();
    this.statistics.totalRequestsProcessed++;

    try {
      // Validate payload size
      const payloadSize = JSON.stringify(request.actionPayload).length;
      if (payloadSize > this.config.maxRequestPayloadSizeBytes) {
        this.statistics.totalDenied++;
        return {
          requestId: request.requestId,
          decision: 'denied',
          reason: 'Payload size exceeds limit',
          denialTime: Date.now(),
        };
      }

      // Process through adapter (policy evaluation + runtime recording)
      const runtimeRequest = {
        requestId: request.requestId,
        userId: request.userId,
        actionType: request.actionType,
        payload: request.actionPayload,
        timestamp: Date.now(),
        source: request.source,
      };

      const result = await this.adapter.processRequest(runtimeRequest);
      const latency = Date.now() - startTime;

      // Update statistics
      this.statistics.maxLatencyMs = Math.max(this.statistics.maxLatencyMs, latency);
      this.statistics.minLatencyMs = Math.min(this.statistics.minLatencyMs, latency);
      this.statistics.averageLatencyMs =
        (this.statistics.averageLatencyMs * (this.statistics.totalRequestsProcessed - 1) + latency) /
        this.statistics.totalRequestsProcessed;

      if (latency > this.config.maxLatencyMs) {
        console.warn(`⚠️ SLA violation: ${latency}ms > ${this.config.maxLatencyMs}ms`);
      }

      // Route based on decision
      if (!result.success || !result.record) {
        this.statistics.totalDenied++;
        return {
          requestId: request.requestId,
          decision: 'denied',
          reason: result.error || 'Processing failed',
          denialTime: Date.now(),
        };
      }

      if (result.record.allowed) {
        this.statistics.totalApproved++;
        return {
          requestId: request.requestId,
          routeId: result.routeId || `route-${request.requestId}-${this.requestCounter++}`,
          orchestratorPath: `/orchestrator/dispatch/${request.actionType}`,
          queueId: `queue-${request.actionType}-${Math.floor(Date.now() / 1000)}`,
          admissionTime: startTime,
          latency,
        } as AdmissionApprovedRoute;
      } else if (result.record.decision === 'escalated') {
        this.statistics.totalEscalated++;
        return {
          requestId: request.requestId,
          decision: 'escalated',
          reason: result.record.reason,
          escalationId: result.escalationId || `escalation-${request.requestId}`,
          denialTime: Date.now(),
        } as AdmissionDeniedResponse;
      } else {
        this.statistics.totalDenied++;
        return {
          requestId: request.requestId,
          decision: 'denied',
          reason: result.record.reason,
          denialTime: Date.now(),
        } as AdmissionDeniedResponse;
      }
    } catch (error) {
      this.statistics.totalEscalated++;
      console.error(`Admission evaluation error: ${error}`);
      return {
        requestId: request.requestId,
        decision: 'escalated',
        reason: `Error during admission evaluation: ${String(error)}`,
        escalationId: `escalation-${request.requestId}`,
        denialTime: Date.now(),
      } as AdmissionDeniedResponse;
    }
  }

  /**
   * Chamber API: Query decisions (delegate to runtime)
   * Parameter criteria is preserved for API compatibility with future query implementations.
   */
  public async queryDecisions(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    _criteria: Record<string, unknown>,
  ): Promise<Record<string, unknown>[]> {
    return [];
  }

  /**
   * Chamber API: Get statistics
   */
  public getStatistics(): AdmissionControllerStatistics {
    return {
      totalRequestsProcessed: this.statistics.totalRequestsProcessed,
      totalApproved: this.statistics.totalApproved,
      totalDenied: this.statistics.totalDenied,
      totalEscalated: this.statistics.totalEscalated,
      averageLatencyMs: this.statistics.averageLatencyMs,
      maxLatencyMs: this.statistics.maxLatencyMs,
      minLatencyMs: this.statistics.minLatencyMs === Infinity ? 0 : this.statistics.minLatencyMs,
      policyViolationRate: this.statistics.policyViolationRate,
      lastResetTime: this.statistics.lastResetTime,
    };
  }

  /**
   * Chamber API: Reset statistics
   */
  public resetStatistics(): void {
    this.statistics = {
      totalRequestsProcessed: 0,
      totalApproved: 0,
      totalDenied: 0,
      totalEscalated: 0,
      averageLatencyMs: 0,
      maxLatencyMs: 0,
      minLatencyMs: Infinity,
      policyViolationRate: 0,
      lastResetTime: Date.now(),
    };
  }

  /**
   * Expose runtime engine for advanced consumers (e.g., agents, future sovereign AI)
   */
  public getRuntimeEngine(): RuntimeAdmissionEngine {
    return this.runtime;
  }

  /**
   * Expose adapter for advanced consumers
   */
  public getAdapter(): AdmissionPolicyAdapter {
    return this.adapter;
  }
}
