import { ConstitutionalOutcome, RiskProjection, SimulationPath } from './future-simulation-types';

export class ConstitutionalOutcomeEvaluator {
  public evaluate(
    paths: readonly SimulationPath[],
    risks: readonly RiskProjection[]
  ): readonly ConstitutionalOutcome[] {
    const riskMap = new Map(risks.map((risk) => [risk.pathId, risk]));

    return paths.map((path) => {
      const risk = riskMap.get(path.pathId);
      const constitutionalScore = this.clamp(
        Math.round(path.constitutionalOutcomeScore - (risk?.score ?? 0) * 0.3 + path.securityImpactScore * 0.1)
      );

      const outcomeLabel = this.resolveOutcome(constitutionalScore);

      return {
        pathId: path.pathId,
        outcomeLabel,
        constitutionalScore,
        alignsWithConstitution: outcomeLabel !== 'unconstitutional',
      };
    });
  }

  private resolveOutcome(score: number): ConstitutionalOutcome['outcomeLabel'] {
    if (score >= 85) {
      return 'best';
    }

    if (score >= 70) {
      return 'acceptable';
    }

    if (score >= 55) {
      return 'risky';
    }

    return 'unconstitutional';
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(100, value));
  }
}
