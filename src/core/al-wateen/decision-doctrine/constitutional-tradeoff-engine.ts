import { ConstitutionalBalancer } from './constitutional-balancer';
import {
  DoctrineCandidatePath,
  DoctrinePriorityResolution,
  LongTermImpactAssessment,
  TradeoffScore,
} from './doctrine-types';

export class ConstitutionalTradeoffEngine {
  constructor(private readonly balancer: ConstitutionalBalancer) {}

  public compare(
    candidates: readonly DoctrineCandidatePath[],
    impacts: readonly LongTermImpactAssessment[],
    resolution: DoctrinePriorityResolution
  ): readonly TradeoffScore[] {
    const impactMap = new Map(impacts.map((value) => [value.pathId, value]));

    return candidates.map((candidate) => {
      const base = this.balancer.scorePath(candidate, resolution);
      const impact = impactMap.get(candidate.pathId);

      const uncertaintyPenalty = candidate.uncertainty.length > 120 ? 12 : 6;
      const speedPenalty = Math.round(candidate.speedBenefit * resolution.speedPenaltyWeight);
      const longTermBoost = impact ? impact.sustainabilityDurability * 0.1 : 0;

      const totalScore =
        base.constitutionalScore * 0.4 +
        base.strategicScore * 0.2 +
        base.longTermScore * 0.3 +
        longTermBoost -
        uncertaintyPenalty -
        speedPenalty;

      return {
        pathId: candidate.pathId,
        constitutionalScore: base.constitutionalScore,
        strategicScore: base.strategicScore,
        longTermScore: base.longTermScore,
        uncertaintyPenalty,
        speedPenalty,
        totalScore: Number(totalScore.toFixed(3)),
      };
    });
  }
}
