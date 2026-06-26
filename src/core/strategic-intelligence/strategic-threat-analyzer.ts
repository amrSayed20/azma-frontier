import { StrategicSituationSnapshot, StrategicThreat } from './strategic-intelligence-types';

export class StrategicThreatAnalyzer {
  public analyze(situation: StrategicSituationSnapshot): readonly StrategicThreat[] {
    const threats: StrategicThreat[] = [];

    if (situation.constitutionalHealth < 70) {
      threats.push({
        threatId: 'th-constitutional-drift',
        title: 'Constitutional Drift Risk',
        level: 'high',
        urgencyHorizon: 'multi-year',
        rationale: 'Constitutional health below strategic threshold indicates governance drift risk.',
        mitigationDirection: 'Increase constitutional policy reinforcement and strategic review cadence.',
      });
    }

    if (situation.infrastructureHealth < 65) {
      threats.push({
        threatId: 'th-infrastructure-fragility',
        title: 'Infrastructure Fragility',
        level: 'medium',
        urgencyHorizon: 'annual',
        rationale: 'Infrastructure health indicates potential execution reliability decay over time.',
        mitigationDirection: 'Strengthen runtime resilience planning and infrastructure observability.',
      });
    }

    threats.push({
      threatId: 'th-strategic-latency',
      title: 'Strategic Latency Accumulation',
      level: situation.eventCount > 50 ? 'medium' : 'low',
      urgencyHorizon: 'long-term',
      rationale: 'Growing event complexity can outpace strategy adaptation if not continuously correlated.',
      mitigationDirection: 'Sustain long-horizon trend tracking and objective recalibration.',
    });

    return threats;
  }
}
