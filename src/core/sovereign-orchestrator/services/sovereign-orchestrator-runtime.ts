/**
 * Runtime facade for sovereign orchestration operations.
 */

import {
  DecisionOutcome,
  OrchestrationRequest,
  OrchestrationResponse
} from '../types/orchestration-contracts';
import { SovereignOrchestratorServices } from './sovereign-orchestrator-services';

export class SovereignOrchestratorRuntime {
  constructor(private readonly services: SovereignOrchestratorServices) {}

  public async execute(request: OrchestrationRequest): Promise<OrchestrationResponse> {
    const context = this.services.contextManager.create(request);
    this.services.sessionCoordinator.touch(request.sessionId, context.contextId);

    this.services.eventCoordinator.publishLifecycle(request.requestId, 'REQUEST_RECEIVED', {
      operation: request.operation,
      kind: request.kind
    });

    const plan = this.services.planner.plan(request);
    const targets = this.services.selector.select(plan);
    const results = await this.services.executionCoordinator.execute(request.requestId, plan, targets);
    const aggregated = this.services.aggregator.aggregate(request.requestId, results);
    const decision = this.services.decisionEngine.decide(aggregated);

    const escalation =
      decision.outcome === DecisionOutcome.ESCALATE
        ? this.services.escalationEngine.escalate(aggregated, decision.reason)
        : undefined;

    this.services.eventCoordinator.publishLifecycle(request.requestId, 'REQUEST_COMPLETED', {
      success: aggregated.success,
      outcome: decision.outcome
    });

    return {
      requestId: request.requestId,
      success: aggregated.success,
      aggregated,
      decision,
      escalation,
      timeline: this.services.timeline.list(request.requestId)
    };
  }
}
