import {
  ConstitutionActionContext,
  ConstitutionRuntime,
  ConstitutionStateSnapshot,
} from '../constitution-runtime';
import { ExecutiveIntelligenceRuntime } from '../executive-intelligence';
import { StrategicIntelligenceRuntime } from '../strategic-intelligence';
import { createFutureSimulationEngine } from './future-simulation-bootstrap';
import { FutureSimulationEngine } from './future-simulation-engine';
import { FutureSimulationPackage, SimulationInput } from './future-simulation-types';

export class FutureSimulationRuntime {
  private readonly engine: FutureSimulationEngine;

  constructor(
    private readonly constitutionRuntime: ConstitutionRuntime = new ConstitutionRuntime(),
    private readonly executiveRuntime?: ExecutiveIntelligenceRuntime,
    private readonly strategicRuntime?: StrategicIntelligenceRuntime,
    engine: FutureSimulationEngine = createFutureSimulationEngine()
  ) {
    this.engine = engine;
  }

  public simulateFromCurrentState(simulationId: string, pathCount: number): FutureSimulationPackage {
    const input = this.createInput(simulationId, pathCount);
    return this.engine.simulate(input);
  }

  public simulateAction(action: ConstitutionActionContext, simulationId: string, pathCount: number): FutureSimulationPackage {
    const evaluation = this.constitutionRuntime.evaluate(action);
    const state = this.requireState();

    const input: SimulationInput = {
      simulationId,
      requestedAt: new Date(),
      pathCount,
      constitutionState: state,
      constitutionEvaluation: evaluation,
      executiveState: this.executiveRuntime?.getSnapshot(),
      latestExecutivePackage: this.executiveRuntime?.getLatestDecisionPackage(),
      strategicState: this.strategicRuntime?.getSnapshot(),
      latestStrategicPackage: this.strategicRuntime?.getLatestPackage(),
    };

    return this.engine.simulate(input);
  }

  public getLatestPackage(): FutureSimulationPackage | undefined {
    return this.engine.getLatestPackage();
  }

  public getSnapshot() {
    return this.engine.getSnapshot();
  }

  private createInput(simulationId: string, pathCount: number): SimulationInput {
    return {
      simulationId,
      requestedAt: new Date(),
      pathCount,
      constitutionState: this.requireState(),
      executiveState: this.executiveRuntime?.getSnapshot(),
      latestExecutivePackage: this.executiveRuntime?.getLatestDecisionPackage(),
      strategicState: this.strategicRuntime?.getSnapshot(),
      latestStrategicPackage: this.strategicRuntime?.getLatestPackage(),
    };
  }

  private requireState(): ConstitutionStateSnapshot {
    const state = this.constitutionRuntime.getState();
    if (!state) {
      throw new Error('Constitution runtime state is unavailable. Load constitution before simulation.');
    }

    return state;
  }
}
