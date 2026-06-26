import { ConstitutionRuntime } from '../../constitution-runtime';
import { ExecutiveIntelligenceRuntime } from '../../executive-intelligence';
import { FutureSimulationRuntime } from '../../future-simulation';
import { SovereignIntelligenceBusApi } from '../../sovereign-intelligence-bus';
import { SovereignPerceptionRuntime } from '../../sovereign-perception';
import { StrategicIntelligenceRuntime } from '../../strategic-intelligence';
import { AlWateenIntegrationInput, AlWateenIntelligenceStreams } from './al-wateen-integration-types';

export class IntelligenceStreamIngestor {
  public ingest(
    input: AlWateenIntegrationInput,
    constitutionRuntime: ConstitutionRuntime,
    executiveRuntime: ExecutiveIntelligenceRuntime,
    strategicRuntime: StrategicIntelligenceRuntime,
    futureSimulationRuntime: FutureSimulationRuntime,
    busApi: SovereignIntelligenceBusApi,
    perceptionRuntime: SovereignPerceptionRuntime
  ): AlWateenIntelligenceStreams {
    const constitutionEvaluation = input.actionContext
      ? constitutionRuntime.evaluate(input.actionContext)
      : undefined;

    const busSynchronization = busApi.synchronize();
    const perceptionPackage = perceptionRuntime.perceive();

    return {
      constitutionState: constitutionRuntime.getState(),
      constitutionEvaluation,
      executiveState: executiveRuntime.getSnapshot(),
      latestExecutivePackage: executiveRuntime.getLatestDecisionPackage(),
      strategicState: strategicRuntime.getSnapshot(),
      latestStrategicPackage: strategicRuntime.getLatestPackage(),
      futureSimulationState: futureSimulationRuntime.getSnapshot(),
      latestFutureSimulationPackage: futureSimulationRuntime.getLatestPackage(),
      busState: busApi.snapshot(),
      busDiagnostics: busApi.diagnostics(),
      busSynchronization,
      perceptionState: perceptionRuntime.snapshot(),
      latestPerceptionPackage: perceptionPackage,
    };
  }
}
