import { ConstitutionRuntime } from '../constitution-runtime';
import { ExecutiveIntelligenceRuntime } from '../executive-intelligence';
import { FutureSimulationRuntime } from '../future-simulation';
import { SovereignIntelligenceBusApi } from '../sovereign-intelligence-bus';
import { StrategicIntelligenceRuntime } from '../strategic-intelligence';
import { createSovereignPerceptionEngine } from './perception-bootstrap';
import { SovereignPerceptionEngine } from './sovereign-perception-engine';
import { PerceptionRuntimeSnapshot, SovereignPerceptionPackage } from './sovereign-perception-types';

export class SovereignPerceptionRuntime {
  private readonly engine: SovereignPerceptionEngine;

  constructor(
    constitutionRuntime: ConstitutionRuntime,
    executiveRuntime: ExecutiveIntelligenceRuntime,
    strategicRuntime: StrategicIntelligenceRuntime,
    futureSimulationRuntime: FutureSimulationRuntime,
    busApi: SovereignIntelligenceBusApi
  ) {
    this.engine = createSovereignPerceptionEngine(
      constitutionRuntime,
      executiveRuntime,
      strategicRuntime,
      futureSimulationRuntime,
      busApi
    );
  }

  public perceive(): SovereignPerceptionPackage {
    return this.engine.perceive();
  }

  public latest(): SovereignPerceptionPackage | undefined {
    return this.engine.latest();
  }

  public snapshot(): PerceptionRuntimeSnapshot {
    return this.engine.snapshot();
  }
}
