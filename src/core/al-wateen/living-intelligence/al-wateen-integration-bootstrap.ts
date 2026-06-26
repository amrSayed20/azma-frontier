import { ConstitutionRuntime } from '../../constitution-runtime';
import { ExecutiveIntelligenceRuntime } from '../../executive-intelligence';
import { FutureSimulationRuntime } from '../../future-simulation';
import { SovereignIntelligenceBusApi } from '../../sovereign-intelligence-bus';
import { SovereignPerceptionRuntime } from '../../sovereign-perception';
import { StrategicIntelligenceRuntime } from '../../strategic-intelligence';
import { AlWateenIntegrationEngine } from './al-wateen-integration-engine';
import { AlWateenMemory } from './al-wateen-memory';
import { AlWateenRuntimeState } from './al-wateen-runtime-state';
import { BriefingPreparationEngine } from './briefing-preparation-engine';
import { ConstitutionalUnderstandingEngine } from './constitutional-understanding-engine';
import { IntelligenceCorrelator } from './intelligence-correlator';
import { IntelligenceStreamIngestor } from './intelligence-stream-ingestor';
import { IntegrationDiagnostics } from './integration-diagnostics';
import { RecommendationAdvisor } from './recommendation-advisor';

export function createAlWateenIntegrationEngine(
  constitutionRuntime: ConstitutionRuntime,
  executiveRuntime: ExecutiveIntelligenceRuntime,
  strategicRuntime: StrategicIntelligenceRuntime,
  futureSimulationRuntime: FutureSimulationRuntime,
  busApi: SovereignIntelligenceBusApi,
  perceptionRuntime: SovereignPerceptionRuntime
): AlWateenIntegrationEngine {
  return new AlWateenIntegrationEngine(
    constitutionRuntime,
    executiveRuntime,
    strategicRuntime,
    futureSimulationRuntime,
    busApi,
    perceptionRuntime,
    new IntelligenceStreamIngestor(),
    new IntelligenceCorrelator(),
    new ConstitutionalUnderstandingEngine(),
    new BriefingPreparationEngine(),
    new RecommendationAdvisor(),
    new AlWateenMemory(),
    new AlWateenRuntimeState(),
    new IntegrationDiagnostics()
  );
}
