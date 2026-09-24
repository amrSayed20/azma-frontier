import { StrategicOpportunity, StrategicSituationSnapshot } from './strategic-intelligence-types';

export class StrategicOpportunityAnalyzer {
  /**
   * Confidence is the measurement the claim rests on — not a number typed
   * beside it.
   *
   * These read 84, 81 and 76 until 2026-09-24, fixed constants presented to
   * the Council as confidence. An opportunity gated on platform evolution
   * health being at least 80 is exactly as certain as that figure is; saying
   * «84%» when the figure is 80 is a small lie, and a Council cannot weigh a
   * number that was never taken.
   */
  public analyze(situation: StrategicSituationSnapshot): readonly StrategicOpportunity[] {
    const opportunities: StrategicOpportunity[] = [];

    if (situation.platformEvolutionHealth >= 80) {
      opportunities.push({
        opportunityId: 'opp-platform-compounding',
        title: 'Platform Compounding Capacity',
        confidence: situation.platformEvolutionHealth,
        impactHorizon: 'multi-year',
        rationale: 'High platform evolution health indicates readiness for compounded strategic growth.',
      });
    }

    if (situation.constitutionalHealth >= 85) {
      opportunities.push({
        opportunityId: 'opp-constitutional-acceleration',
        title: 'Constitutional Alignment Acceleration',
        confidence: situation.constitutionalHealth,
        impactHorizon: 'annual',
        rationale: 'Strong constitutional health enables faster strategic alignment cycles.',
      });
    }

    opportunities.push({
      opportunityId: 'opp-strategic-memory-density',
      title: 'Strategic Memory Density Growth',
      // The one standing opportunity: its confidence is the count it rests on,
      // bounded, rather than a number chosen to look plausible.
      confidence: Math.min(100, situation.executivePackageCount * 4),
      impactHorizon: 'long-term',
      rationale: 'Continuous package generation increases long-horizon strategic intelligence depth.',
    });

    return opportunities;
  }
}
