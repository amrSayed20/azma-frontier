import {
  ConstitutionalConsciousnessSignal,
  FounderRelationshipState,
  PersonalityContext,
} from './personality-types';

export class FounderRelationshipEngine {
  public evolve(
    context: PersonalityContext,
    previous: FounderRelationshipState | undefined,
    consciousness: ConstitutionalConsciousnessSignal
  ): FounderRelationshipState {
    const priorTrust = previous?.trustScore ?? 70;
    const trustDelta = consciousness.constitutionalRisk === 'elevated' ? -2 : 1;

    return {
      founderId: context.founderId,
      trustScore: Math.max(0, Math.min(100, priorTrust + trustDelta)),
      constitutionalConsistencyScore: consciousness.coherenceScore,
      respectfulChallengeCount:
        (previous?.respectfulChallengeCount ?? 0) +
        (consciousness.constitutionalRisk === 'elevated' ? 1 : 0),
      lastUpdatedAt: new Date(),
    };
  }
}
