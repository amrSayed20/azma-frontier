/**
 * Bootstrapper for sovereign orchestrator runtime.
 */

import {
  ChamberIntegrationBootstrap
} from '../../chamber-integration';
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
import { SovereignOrchestratorRuntime } from './sovereign-orchestrator-runtime';
import { SovereignOrchestratorServices } from './sovereign-orchestrator-services';

export interface SovereignOrchestratorBootstrapResult {
  readonly services: SovereignOrchestratorServices;
  readonly runtime: SovereignOrchestratorRuntime;
}

export class SovereignOrchestratorBootstrap {
  public static initialize(): SovereignOrchestratorBootstrapResult {
    const chamberIntegration = ChamberIntegrationBootstrap.initialize();

    const contextManager = new ExecutionContextManager();
    const sessionCoordinator = new SessionCoordinator();
    const planner = new WorkflowPlanner();
    const selector = new ChamberSelector(chamberIntegration.capabilityRegistry);
    const commandDispatcher = new CommandDispatcher(chamberIntegration.runtime);
    const queryDispatcher = new QueryDispatcher(chamberIntegration.runtime);
    const router = new RequestRouter(commandDispatcher, queryDispatcher);
    const stateStore = new WorkflowStateStore();
    const timeline = new ExecutionTimeline();
    const executionCoordinator = new ExecutionCoordinator(router, stateStore, timeline);
    const aggregator = new ResponseAggregator();
    const decisionEngine = new RuntimeDecisionEngine();
    const escalationEngine = new FailureEscalationEngine();
    const eventCoordinator = new EventCoordinator(chamberIntegration.runtime);

    const services: SovereignOrchestratorServices = {
      chamberIntegration,
      contextManager,
      sessionCoordinator,
      planner,
      selector,
      commandDispatcher,
      queryDispatcher,
      router,
      executionCoordinator,
      aggregator,
      decisionEngine,
      escalationEngine,
      stateStore,
      timeline,
      eventCoordinator
    };

    return {
      services,
      runtime: new SovereignOrchestratorRuntime(services)
    };
  }
}
