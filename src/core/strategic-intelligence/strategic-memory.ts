import { StrategicIntelligencePackage } from './strategic-intelligence-types';

export class StrategicMemory {
  private readonly packages: StrategicIntelligencePackage[] = [];

  public store(value: StrategicIntelligencePackage): void {
    this.packages.push(value);
  }

  public latest(): StrategicIntelligencePackage | undefined {
    return this.packages[this.packages.length - 1];
  }

  public list(limit: number = 10): readonly StrategicIntelligencePackage[] {
    if (limit <= 0) {
      return [];
    }

    return this.packages.slice(-limit);
  }

  public size(): number {
    return this.packages.length;
  }
}
