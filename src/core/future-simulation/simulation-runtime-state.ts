import { FutureSimulationPackage, SimulationRuntimeStateSnapshot } from './future-simulation-types';

export class SimulationRuntimeState {
  private totalPackages = 0;
  private totalSimulatedPaths = 0;
  private totalSimulatedScenarios = 0;
  private lastPackageId?: string;
  private lastSimulationId?: string;
  private lastGeneratedAt?: Date;

  public publish(value: FutureSimulationPackage): void {
    this.totalPackages += 1;
    this.totalSimulatedPaths += value.paths.length;
    this.totalSimulatedScenarios += value.scenarios.length;
    this.lastPackageId = value.packageId;
    this.lastSimulationId = value.simulationId;
    this.lastGeneratedAt = value.generatedAt;
  }

  public snapshot(): SimulationRuntimeStateSnapshot {
    return {
      totalPackages: this.totalPackages,
      totalSimulatedPaths: this.totalSimulatedPaths,
      totalSimulatedScenarios: this.totalSimulatedScenarios,
      lastPackageId: this.lastPackageId,
      lastSimulationId: this.lastSimulationId,
      lastGeneratedAt: this.lastGeneratedAt,
    };
  }
}
