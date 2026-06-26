import { ConstitutionRuntime } from '../constitution-runtime';
import { ExecutiveIntelligenceRuntime } from '../executive-intelligence';
import { FutureSimulationRuntime } from '../future-simulation';
import { SovereignIntelligenceBusApi } from '../sovereign-intelligence-bus';
import { StrategicIntelligenceRuntime } from '../strategic-intelligence';
import { AiProviderObserver } from './ai-provider-observer';
import { ChamberObserver } from './chamber-observer';
import { FounderActivityObserver } from './founder-activity-observer';
import { InfrastructureObserver } from './infrastructure-observer';
import { PerceptionAggregator } from './perception-aggregator';
import { PerceptionMemory } from './perception-memory';
import { PerceptionRuntimeState } from './perception-runtime-state';
import { ResourceObserver } from './resource-observer';
import { RuntimeObserver } from './runtime-observer';
import { SecurityObserver } from './security-observer';
import { SovereignPerceptionEngine } from './sovereign-perception-engine';

export function createSovereignPerceptionEngine(
  constitutionRuntime: ConstitutionRuntime,
  executiveRuntime: ExecutiveIntelligenceRuntime,
  strategicRuntime: StrategicIntelligenceRuntime,
  futureSimulationRuntime: FutureSimulationRuntime,
  busApi: SovereignIntelligenceBusApi
): SovereignPerceptionEngine {
  return new SovereignPerceptionEngine(
    constitutionRuntime,
    executiveRuntime,
    strategicRuntime,
    futureSimulationRuntime,
    busApi,
    new RuntimeObserver(),
    new InfrastructureObserver(),
    new ResourceObserver(),
    new ChamberObserver(),
    new AiProviderObserver(),
    new SecurityObserver(),
    new FounderActivityObserver(),
    new PerceptionAggregator(),
    new PerceptionMemory(),
    new PerceptionRuntimeState()
  );
}
