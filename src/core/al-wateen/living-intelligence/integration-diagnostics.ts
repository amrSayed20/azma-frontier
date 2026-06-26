import { AlWateenRuntimeSnapshot } from './al-wateen-integration-types';

export interface AlWateenDiagnostics {
  readonly generatedAt: Date;
  readonly totalPackages: number;
  readonly lastCoherenceScore?: number;
  readonly healthy: boolean;
}

export class IntegrationDiagnostics {
  public generate(snapshot: AlWateenRuntimeSnapshot): AlWateenDiagnostics {
    return {
      generatedAt: new Date(),
      totalPackages: snapshot.totalPackages,
      lastCoherenceScore: snapshot.lastCoherenceScore,
      healthy: (snapshot.lastCoherenceScore ?? 0) >= 60 || snapshot.totalPackages === 0,
    };
  }
}
