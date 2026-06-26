import { PathProbability, SimulationPath } from './future-simulation-types';

export class ProbabilityEngine {
  public estimate(paths: readonly SimulationPath[]): readonly PathProbability[] {
    if (paths.length === 0) {
      return [];
    }

    const rawWeights = paths.map((path) => {
      const weightedScore =
        path.constitutionalOutcomeScore * 0.4 +
        path.securityImpactScore * 0.2 +
        path.infrastructureImpactScore * 0.15 +
        (100 - path.resourceConsumptionScore) * 0.15 +
        path.financialImpactScore * 0.1;

      return Math.max(1, weightedScore);
    });

    const total = rawWeights.reduce((sum, value) => sum + value, 0);

    return paths.map((path, index) => ({
      pathId: path.pathId,
      probability: Number((rawWeights[index] / total).toFixed(6)),
    }));
  }
}
