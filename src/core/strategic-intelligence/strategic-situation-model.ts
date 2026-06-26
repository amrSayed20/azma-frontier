import { StrategicIntelligenceInput, StrategicSignal, StrategicSituationSnapshot } from './strategic-intelligence-types';

export class StrategicSituationModel {
  public build(input: StrategicIntelligenceInput): StrategicSituationSnapshot {
    const strategicSignals = this.buildSignals(input);

    const constitutionalHealth = this.clamp(Math.round(input.constitutionState.lastComplianceStatus === 'non-compliant' ? 45 : 80 + Math.min(input.constitutionState.policyCount, 20)));
    const architecturalHealth = this.clamp(Math.round(70 + Math.min(input.constitutionState.articleCount, 20) - this.negativeSignalPenalty(strategicSignals)));
    const infrastructureHealth = this.clamp(Math.round(68 + Math.min(input.constitutionState.eventCount, 20) - Math.floor(this.negativeSignalPenalty(strategicSignals) / 2)));
    const platformEvolutionHealth = this.clamp(Math.round(65 + Math.min(strategicSignals.length, 25)));

    return {
      observedAt: new Date(),
      horizon: 'long-term',
      constitutionalHealth,
      architecturalHealth,
      infrastructureHealth,
      platformEvolutionHealth,
      strategicSignals,
      eventCount: input.constitutionEvents.length,
      executivePackageCount: input.executiveState?.totalDecisionPackages ?? 0,
    };
  }

  private buildSignals(input: StrategicIntelligenceInput): readonly StrategicSignal[] {
    const signals: StrategicSignal[] = [];

    signals.push({
      signalId: 'sig-constitutional-load',
      source: 'constitution-runtime',
      category: 'constitutional-health',
      polarity: input.constitutionState.loaded ? 'positive' : 'negative',
      strength: input.constitutionState.loaded ? 90 : 10,
      summary: 'Constitution runtime load state for strategic continuity.',
    });

    signals.push({
      signalId: 'sig-policy-density',
      source: 'constitution-runtime',
      category: 'architectural-health',
      polarity: input.constitutionState.policyCount >= 5 ? 'positive' : 'neutral',
      strength: Math.min(100, 40 + input.constitutionState.policyCount * 5),
      summary: 'Policy density as proxy for governance depth.',
    });

    signals.push({
      signalId: 'sig-event-flow',
      source: 'constitution-runtime',
      category: 'infrastructure-health',
      polarity: input.constitutionState.eventCount > 0 ? 'positive' : 'neutral',
      strength: Math.min(100, 30 + input.constitutionState.eventCount),
      summary: 'Event flow indicates runtime liveliness.',
    });

    if (input.executiveState) {
      signals.push({
        signalId: 'sig-executive-throughput',
        source: 'executive-intelligence',
        category: 'platform-evolution',
        polarity: input.executiveState.totalDecisionPackages > 0 ? 'positive' : 'neutral',
        strength: Math.min(100, 35 + input.executiveState.totalDecisionPackages * 2),
        summary: 'Executive package throughput supports strategic learning loops.',
      });
    }

    return signals;
  }

  private negativeSignalPenalty(signals: readonly StrategicSignal[]): number {
    return signals.filter((signal) => signal.polarity === 'negative').reduce((sum, signal) => sum + Math.ceil(signal.strength / 20), 0);
  }

  private clamp(value: number): number {
    return Math.max(0, Math.min(100, value));
  }
}
