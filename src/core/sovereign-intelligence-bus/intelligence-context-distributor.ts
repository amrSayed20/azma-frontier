import {
  ConstitutionRuntime,
  ConstitutionStateSnapshot,
} from '../constitution-runtime';
import {
  ExecutiveIntelligenceRuntime,
  ExecutiveRuntimeStateSnapshot,
} from '../executive-intelligence';
import {
  StrategicIntelligenceRuntime,
  StrategicRuntimeStateSnapshot,
} from '../strategic-intelligence';
import {
  FutureSimulationRuntime,
  SimulationRuntimeStateSnapshot,
} from '../future-simulation';

export interface IntelligenceContextBundle {
  readonly constitutionState?: ConstitutionStateSnapshot;
  readonly executiveState?: ExecutiveRuntimeStateSnapshot;
  readonly strategicState?: StrategicRuntimeStateSnapshot;
  readonly futureSimulationState?: SimulationRuntimeStateSnapshot;
}

export class IntelligenceContextDistributor {
  public distribute(
    constitutionRuntime: ConstitutionRuntime,
    executiveRuntime: ExecutiveIntelligenceRuntime,
    strategicRuntime: StrategicIntelligenceRuntime,
    futureSimulationRuntime: FutureSimulationRuntime
  ): IntelligenceContextBundle {
    return {
      constitutionState: constitutionRuntime.getState(),
      executiveState: executiveRuntime.getSnapshot(),
      strategicState: strategicRuntime.getSnapshot(),
      futureSimulationState: futureSimulationRuntime.getSnapshot(),
    };
  }
}
