import { StrategicIntelligencePackage, StrategicRuntimeStateSnapshot } from './strategic-intelligence-types';

export class StrategicRuntimeState {
  private totalPackages = 0;
  private totalSignals = 0;
  private lastPackageId?: string;
  private lastGeneratedAt?: Date;
  private readonly constitutionalHealthHistory: number[] = [];
  private readonly architecturalHealthHistory: number[] = [];
  private readonly infrastructureHealthHistory: number[] = [];
  private readonly platformEvolutionHistory: number[] = [];

  public publish(value: StrategicIntelligencePackage): void {
    this.totalPackages += 1;
    this.totalSignals += value.strategicSituation.strategicSignals.length;
    this.lastPackageId = value.packageId;
    this.lastGeneratedAt = value.generatedAt;

    this.pushBounded(this.constitutionalHealthHistory, value.strategicSituation.constitutionalHealth);
    this.pushBounded(this.architecturalHealthHistory, value.strategicSituation.architecturalHealth);
    this.pushBounded(this.infrastructureHealthHistory, value.strategicSituation.infrastructureHealth);
    this.pushBounded(this.platformEvolutionHistory, value.strategicSituation.platformEvolutionHealth);
  }

  public snapshot(): StrategicRuntimeStateSnapshot {
    return {
      totalPackages: this.totalPackages,
      totalSignals: this.totalSignals,
      lastPackageId: this.lastPackageId,
      lastGeneratedAt: this.lastGeneratedAt,
      constitutionalHealthHistory: [...this.constitutionalHealthHistory],
      architecturalHealthHistory: [...this.architecturalHealthHistory],
      infrastructureHealthHistory: [...this.infrastructureHealthHistory],
      platformEvolutionHistory: [...this.platformEvolutionHistory],
    };
  }

  private pushBounded(target: number[], value: number): void {
    target.push(value);
    if (target.length > 50) {
      target.shift();
    }
  }
}
