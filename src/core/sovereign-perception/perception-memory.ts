import { SovereignPerceptionPackage } from './sovereign-perception-types';

export class PerceptionMemory {
  private readonly packages: SovereignPerceptionPackage[] = [];

  public store(value: SovereignPerceptionPackage): void {
    this.packages.push(value);
  }

  public latest(): SovereignPerceptionPackage | undefined {
    return this.packages[this.packages.length - 1];
  }

  public size(): number {
    return this.packages.length;
  }
}
