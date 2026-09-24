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
      confidenceReason: `الدرجة ${score.totalScore}، مُشتقّةً من الدستوريّ ${score.constitutionalScore} والاستراتيجيّ ${score.strategicScore} وبعيد المدى ${score.longTermScore}.`,
      uncertaintyStatement: selected.uncertainty,
      constitutionalExplanation: `الأثر الدستوريّ ${selected.constitutionalImpact} قُدّم على الراحة وضغط السرعة.`,
      strategicExplanation: `الأثر الاستراتيجيّ ${selected.strategicImpact} قِيس على البدائل بمقايضاتٍ معلنة.`,
      longTermExplanation: `الاستدامة بعيدة المدى ${selected.sustainabilityImpact} محفوظةٌ شرطاً لازماً في عقيدة القرار.`,
    };
  }
}
