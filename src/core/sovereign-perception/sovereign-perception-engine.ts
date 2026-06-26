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
import { PerceptionRuntimeSnapshot, RuntimeObservationInput, SovereignPerceptionPackage } from './sovereign-perception-types';

export class SovereignPerceptionEngine {
  constructor(
    private readonly constitutionRuntime: ConstitutionRuntime,
    private readonly executiveRuntime: ExecutiveIntelligenceRuntime,
    private readonly strategicRuntime: StrategicIntelligenceRuntime,
    private readonly futureSimulationRuntime: FutureSimulationRuntime,
    private readonly busApi: SovereignIntelligenceBusApi,
    private readonly runtimeObserver: RuntimeObserver,
    private readonly infrastructureObserver: InfrastructureObserver,
    private readonly resourceObserver: ResourceObserver,
    private readonly chamberObserver: ChamberObserver,
    private readonly aiProviderObserver: AiProviderObserver,
    private readonly securityObserver: SecurityObserver,
    private readonly founderActivityObserver: FounderActivityObserver,
    private readonly aggregator: PerceptionAggregator,
    private readonly memory: PerceptionMemory,
    private readonly state: PerceptionRuntimeState
  ) {}

  public perceive(): SovereignPerceptionPackage {
    const input: RuntimeObservationInput = {
      constitutionState: this.constitutionRuntime.getState(),
      executiveState: this.executiveRuntime.getSnapshot(),
      strategicState: this.strategicRuntime.getSnapshot(),
      futureSimulationState: this.futureSimulationRuntime.getSnapshot(),
      busState: this.busApi.snapshot(),
      busDiagnostics: this.busApi.diagnostics(),
    };

    const observations = [
      ...this.runtimeObserver.observe(input),
      ...this.infrastructureObserver.observe(),
      ...this.resourceObserver.observe(input),
      ...this.chamberObserver.observe(),
      ...this.aiProviderObserver.observe(),
      ...this.securityObserver.observe(input),
      ...this.founderActivityObserver.observe(input),
    ];

    const perceptionPackage = this.aggregator.aggregate(observations);

    this.memory.store(perceptionPackage);
    this.state.publish(perceptionPackage);

    return perceptionPackage;
  }

  public latest(): SovereignPerceptionPackage | undefined {
    return this.memory.latest();
  }

  public snapshot(): PerceptionRuntimeSnapshot {
    return this.state.snapshot();
  }
}
