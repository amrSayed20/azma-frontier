import { DoctrineCandidatePath, DoctrinePriorityResolution } from './doctrine-types';

export class ConstitutionalBalancer {
  public scorePath(
    candidate: DoctrineCandidatePath,
    resolution: DoctrinePriorityResolution
  ): { readonly constitutionalScore: number; readonly strategicScore: number; readonly longTermScore: number } {
    const constitutionalScore = Math.max(
      0,
      Math.min(100, candidate.constitutionalImpact * resolution.longTermPriorityWeight)
    );

    const strategicScore = Math.max(0, Math.min(100, candidate.strategicImpact * 0.9));

    const longTermScore = Math.max(
      0,
      Math.min(100, candidate.sustainabilityImpact * resolution.longTermPriorityWeight)
    );

    return {
      constitutionalScore,
      strategicScore,
      longTermScore,
    };
  }
}
