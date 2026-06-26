import { DoctrineRuntimeSnapshot, ImperialDecisionDoctrinePackage } from './doctrine-types';

export class DoctrineRuntimeState {
  private totalPackages = 0;
  private lastPackageId?: string;
  private lastRecommendationId?: string;
  private lastGeneratedAt?: Date;

  public publish(value: ImperialDecisionDoctrinePackage): void {
    this.totalPackages += 1;
    this.lastPackageId = value.packageId;
    this.lastRecommendationId = value.recommendation.recommendationId;
    this.lastGeneratedAt = value.generatedAt;
  }

  public snapshot(): DoctrineRuntimeSnapshot {
    return {
      totalPackages: this.totalPackages,
      lastPackageId: this.lastPackageId,
      lastRecommendationId: this.lastRecommendationId,
      lastGeneratedAt: this.lastGeneratedAt,
    };
  }
}
