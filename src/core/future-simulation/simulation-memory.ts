import { FutureSimulationPackage } from './future-simulation-types';

export class SimulationMemory {
  private readonly packages: FutureSimulationPackage[] = [];

  public store(value: FutureSimulationPackage): void {
    this.packages.push(value);
  }

  public latest(): FutureSimulationPackage | undefined {
    return this.packages[this.packages.length - 1];
  }

  public size(): number {
    return this.packages.length;
  }

  public list(limit: number = 10): readonly FutureSimulationPackage[] {
    if (limit <= 0) {
      return [];
    }

    return this.packages.slice(-limit);
  }
}
