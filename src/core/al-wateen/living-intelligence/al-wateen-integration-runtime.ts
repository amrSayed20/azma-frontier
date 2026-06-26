import { ConstitutionActionContext, ConstitutionRuntime } from '../../constitution-runtime';
import { ExecutiveIntelligenceRuntime } from '../../executive-intelligence';
import { FutureSimulationRuntime } from '../../future-simulation';
import { SovereignIntelligenceBusApi } from '../../sovereign-intelligence-bus';
import { SovereignPerceptionRuntime } from '../../sovereign-perception';
import { StrategicIntelligenceRuntime } from '../../strategic-intelligence';
import { createAlWateenIntegrationEngine } from './al-wateen-integration-bootstrap';
import { AlWateenIntegrationEngine } from './al-wateen-integration-engine';
import { AlWateenIntegrationInput } from './al-wateen-integration-types';

export class AlWateenIntegrationRuntime {
  private readonly engine: AlWateenIntegrationEngine;

  constructor(
    constitutionRuntime: ConstitutionRuntime,
    executiveRuntime: ExecutiveIntelligenceRuntime,
    strategicRuntime: StrategicIntelligenceRuntime,
    futureSimulationRuntime: FutureSimulationRuntime,
    busApi: SovereignIntelligenceBusApi,
    perceptionRuntime: SovereignPerceptionRuntime
  ) {
    this.engine = createAlWateenIntegrationEngine(
      constitutionRuntime,
      executiveRuntime,
      strategicRuntime,
      futureSimulationRuntime,
      busApi,
      perceptionRuntime
    );
  }

  public integrate(trigger: AlWateenIntegrationInput['trigger'] = 'manual') {
    return this.engine.integrate({
      requestedAt: new Date(),
      trigger,
    });
  }

  public integrateWithAction(actionContext: ConstitutionActionContext, trigger: AlWateenIntegrationInput['trigger'] = 'event-driven') {
    return this.engine.integrate({
      requestedAt: new Date(),
      trigger,
      actionContext,
    });
  }

  public latest() {
    return this.engine.latest();
  }

  public snapshot() {
    return this.engine.snapshot();
  }

  public diagnostics() {
    return this.engine.diagnosticsSnapshot();
  }
}
