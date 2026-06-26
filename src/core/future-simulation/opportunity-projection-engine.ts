import { OpportunityProjection, SimulationPath } from './future-simulation-types';

export class OpportunityProjectionEngine {
  public project(paths: readonly SimulationPath[]): readonly OpportunityProjection[] {
    return paths.map((path) => {
      const score = this.clamp(
        Math.round(
          path.constitutionalOutcomeScore * 0.35 +
            path.financialImpactScore * 0.25 +
            path.securityImpactScore * 0.2 +
            path.infrastructureImpactScore * 0.2
        )
      );

      return {
        pathId: path.pathId,
        score,
        summary: 'Opportunity projection reflects compounding constitutional and platform advantages.',
      };
    });
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(100, value));
  }
}
