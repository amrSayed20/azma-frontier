/**
 * Shared service contracts for sovereign orchestrator runtime wiring.
 */

import { ResponseAggregator } from '../aggregation/response-aggregator';
import { ExecutionContextManager } from '../context/execution-context-manager';
import { EventCoordinator } from '../coordination/event-coordinator';
import { ExecutionCoordinator } from '../coordination/execution-coordinator';
import { RuntimeDecisionEngine } from '../decision/runtime-decision-engine';
import { CommandDispatcher } from '../dispatch/command-dispatcher';
import { QueryDispatcher } from '../dispatch/query-dispatcher';
import { FailureEscalationEngine } from '../escalation/failure-escalation-engine';
import { WorkflowPlanner } from '../planning/workflow-planner';
import { RequestRouter } from '../routing/request-router';
import { ChamberSelector } from '../selection/chamber-selector';
import { SessionCoordinator } from '../session/session-coordinator';
import { WorkflowStateStore } from '../state/workflow-state-store';
import { ExecutionTimeline } from '../timeline/execution-timeline';
import { ChamberIntegrationServices } from '../../chamber-integration';

export interface SovereignOrchestratorServices {
  readonly chamberIntegration: ChamberIntegrationServices;
  readonly contextManager: ExecutionContextManager;
  readonly sessionCoordinator: SessionCoordinator;
  readonly planner: WorkflowPlanner;
  readonly selector: ChamberSelector;
  readonly commandDispatcher: CommandDispatcher;
  readonly queryDispatcher: QueryDispatcher;
  readonly router: RequestRouter;
  readonly executionCoordinator: ExecutionCoordinator;
  readonly aggregator: ResponseAggregator;
  readonly decisionEngine: RuntimeDecisionEngine;
  readonly escalationEngine: FailureEscalationEngine;
  readonly stateStore: WorkflowStateStore;
  readonly timeline: ExecutionTimeline;
  readonly eventCoordinator: EventCoordinator;
}
