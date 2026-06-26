import { DoctrineCandidatePath, LongTermImpactAssessment } from './doctrine-types';

export class LongTermImpactEvaluator {
  public evaluate(candidates: readonly DoctrineCandidatePath[]): readonly LongTermImpactAssessment[] {
    return candidates.map((candidate) => ({
      pathId: candidate.pathId,
      horizon: 'long-term',
      strategicDurability: this.clamp(candidate.strategicImpact * 0.95),
      constitutionalDurability: this.clamp(candidate.constitutionalImpact),
      sustainabilityDurability: this.clamp(candidate.sustainabilityImpact),
    }));
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(100, Math.round(value)));
  }
}
