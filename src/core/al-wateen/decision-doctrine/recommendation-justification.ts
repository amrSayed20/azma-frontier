import {
  DoctrineCandidatePath,
  RecommendationJustification,
  TradeoffScore,
} from './doctrine-types';

export class RecommendationJustificationBuilder {
  public build(selected: DoctrineCandidatePath, score: TradeoffScore): RecommendationJustification {
    const confidence =
      score.totalScore >= 80 ? 'high' : score.totalScore >= 65 ? 'medium' : 'low';

    return {
      confidence,
      confidenceReason: `Score ${score.totalScore} derived from constitutional ${score.constitutionalScore}, strategic ${score.strategicScore}, and long-term ${score.longTermScore} factors.`,
      uncertaintyStatement: selected.uncertainty,
      constitutionalExplanation: `Constitutional impact ${selected.constitutionalImpact} prioritized over convenience and speed pressure.`,
      strategicExplanation: `Strategic impact ${selected.strategicImpact} compared against alternatives with transparent tradeoff penalties.`,
      longTermExplanation: `Long-term sustainability ${selected.sustainabilityImpact} preserved as mandatory decision doctrine condition.`,
    };
  }
}
