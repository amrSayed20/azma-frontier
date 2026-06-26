import { PerceptionRuntimeSnapshot, SovereignPerceptionPackage } from './sovereign-perception-types';

export class PerceptionRuntimeState {
  private totalPackages = 0;
  private totalObservations = 0;
  private lastPackageId?: string;
  private lastObservedAt?: Date;

  public publish(value: SovereignPerceptionPackage): void {
    this.totalPackages += 1;
    this.totalObservations += value.observations.length;
    this.lastPackageId = value.packageId;
    this.lastObservedAt = value.generatedAt;
  }

  public snapshot(): PerceptionRuntimeSnapshot {
    return {
      totalPackages: this.totalPackages,
      totalObservations: this.totalObservations,
      lastPackageId: this.lastPackageId,
      lastObservedAt: this.lastObservedAt,
    };
  }
}
