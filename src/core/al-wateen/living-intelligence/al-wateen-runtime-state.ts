import {
  AlWateenRuntimeSnapshot,
  ConstitutionalIntelligencePackage,
} from './al-wateen-integration-types';

export class AlWateenRuntimeState {
  private totalPackages = 0;
  private lastPackageId?: string;
  private lastGeneratedAt?: Date;
  private lastCoherenceScore?: number;

  public publish(value: ConstitutionalIntelligencePackage): void {
    this.totalPackages += 1;
    this.lastPackageId = value.packageId;
    this.lastGeneratedAt = value.generatedAt;
    this.lastCoherenceScore = value.correlation.coherenceScore;
  }

  public snapshot(): AlWateenRuntimeSnapshot {
    return {
      totalPackages: this.totalPackages,
      lastPackageId: this.lastPackageId,
      lastGeneratedAt: this.lastGeneratedAt,
      lastCoherenceScore: this.lastCoherenceScore,
    };
  }
}
