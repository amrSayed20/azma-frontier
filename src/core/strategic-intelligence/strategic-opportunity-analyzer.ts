import { StrategicOpportunity, StrategicSituationSnapshot } from './strategic-intelligence-types';

export class StrategicOpportunityAnalyzer {
  public analyze(situation: StrategicSituationSnapshot): readonly StrategicOpportunity[] {
    const opportunities: StrategicOpportunity[] = [];

    if (situation.platformEvolutionHealth >= 80) {
      opportunities.push({
        opportunityId: 'opp-platform-compounding',
        title: 'Platform Compounding Capacity',
        confidence: 84,
        impactHorizon: 'multi-year',
        rationale: 'High platform evolution health indicates readiness for compounded strategic growth.',
      });
    }

    if (situation.constitutionalHealth >= 85) {
      opportunities.push({
        opportunityId: 'opp-constitutional-acceleration',
        title: 'Constitutional Alignment Acceleration',
        confidence: 81,
        impactHorizon: 'annual',
        rationale: 'Strong constitutional health enables faster strategic alignment cycles.',
      });
    }

    opportunities.push({
      opportunityId: 'opp-strategic-memory-density',
      title: 'Strategic Memory Density Growth',
      confidence: 76,
      impactHorizon: 'long-term',
      rationale: 'Continuous package generation increases long-horizon strategic intelligence depth.',
    });

    return opportunities;
  }
}
