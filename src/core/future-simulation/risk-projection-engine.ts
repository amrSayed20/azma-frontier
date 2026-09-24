import { RiskProjection, SimulationPath, SimulationRiskLevel } from './future-simulation-types';

export class RiskProjectionEngine {
  public project(paths: readonly SimulationPath[]): readonly RiskProjection[] {
    return paths.map((path) => {
      const riskScore = this.clamp(
        Math.round(
          (100 - path.constitutionalOutcomeScore) * 0.4 +
            path.resourceConsumptionScore * 0.2 +
            (100 - path.securityImpactScore) * 0.25 +
            (100 - path.infrastructureImpactScore) * 0.15
        )
      );

      return {
        pathId: path.pathId,
        level: this.toLevel(riskScore),
        score: riskScore,
        summary: 'إسقاطُ الخطر يعكس المحاذاةَ الدستوريّة وضغطَ الموارد وأثرَ المتانة.',
      };
    });
  }

  private toLevel(score: number): SimulationRiskLevel {
    if (score >= 75) {
      return 'critical';
    }

    if (score >= 55) {
      return 'high';
    }

    if (score >= 35) {
      return 'medium';
    }

    return 'low';
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(100, value));
  }
}
