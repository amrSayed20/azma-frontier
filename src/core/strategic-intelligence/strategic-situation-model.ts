import { StrategicIntelligenceInput, StrategicSignal, StrategicSituationSnapshot } from './strategic-intelligence-types';
import { measureOperationalState, type OperationalState } from '../../operational-truth/measure';

export class StrategicSituationModel {
  /**
   * MEASURED on production 2026-09-24: every figure below was arithmetic on
   * document counts. «Infrastructure health» was `68 + min(eventCount, 20)`
   * and never touched infrastructure; «platform evolution» counted the
   * signals this model had just generated about itself. The Council was told
   * its leading opportunity was «Constitutional Alignment Acceleration» while
   * the heap sat at 91% and every payment key was missing.
   *
   * The platform is now observed, and what is observed can lower these
   * figures. A model that can only be told good news is not a model.
   */
  public build(input: StrategicIntelligenceInput): StrategicSituationSnapshot {
    const operational = measureOperationalState();
    const strategicSignals = this.buildSignals(input, operational);

    const constitutionalHealth = this.clamp(Math.round(input.constitutionState.lastComplianceStatus === 'non-compliant' ? 45 : 80 + Math.min(input.constitutionState.policyCount, 20)));
    const architecturalHealth = this.clamp(Math.round(70 + Math.min(input.constitutionState.articleCount, 20) - this.negativeSignalPenalty(strategicSignals)));
    // Infrastructure health is now what the machine reports, not what the
    // event log implies: the measured pressure is subtracted outright, so a
    // heap at 91% cannot be reported as a healthy platform.
    const operationalPressure = this.operationalPressure(operational);
    const infrastructureHealth = this.clamp(Math.round(
      68 + Math.min(input.constitutionState.eventCount, 20)
      - Math.floor(this.negativeSignalPenalty(strategicSignals) / 2)
      - operationalPressure,
    ));
    // Platform evolution no longer counts this model's own signals — that was
    // a measure of its own output. It counts the signals that came from
    // elsewhere, and pays the same operational pressure.
    const foreignSignals = strategicSignals.filter((s) => s.source !== 'operational-truth').length;
    const platformEvolutionHealth = this.clamp(Math.round(
      65 + Math.min(foreignSignals, 25) - operationalPressure,
    ));

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

  /**
   * What the platform's real condition costs its reported health.
   *
   * A closed revenue path is the heaviest single fact the Empire can hold:
   * without it nothing else it does earns anything, so it outweighs any
   * count of policy documents.
   */
  private operationalPressure(operational: OperationalState): number {
    let pressure = 0;
    if (operational.memoryTier === 'CRITICAL') pressure += 25;
    else if (operational.memoryTier === 'WARNING') pressure += 10;
    if (operational.diskTier === 'CRITICAL') pressure += 25;
    else if (operational.diskTier === 'WARNING') pressure += 10;
    pressure += operational.missingRevenueProviders.length * 12;
    return pressure;
  }

  private buildSignals(input: StrategicIntelligenceInput, operational: OperationalState): readonly StrategicSignal[] {
    const signals: StrategicSignal[] = [];

    // ── The running platform, as itself ───────────────────────────────────
    if (operational.heapUtilizationPct !== null) {
      signals.push({
        signalId: 'sig-memory-pressure',
        source: 'operational-truth',
        category: 'infrastructure-health',
        polarity: operational.memoryTier === 'NORMAL' ? 'positive' : 'negative',
        strength: operational.heapUtilizationPct,
        summary: `استهلاك الذاكرة ${operational.heapUtilizationPct}٪ — الحالة ${operational.memoryTier}.`,
      });
    }
    if (operational.diskUsedPct !== null) {
      signals.push({
        signalId: 'sig-disk-pressure',
        source: 'operational-truth',
        category: 'infrastructure-health',
        polarity: operational.diskTier === 'NORMAL' ? 'positive' : 'negative',
        strength: operational.diskUsedPct,
        summary: `امتلاء القرص ${operational.diskUsedPct}٪ — الحالة ${operational.diskTier}.`,
      });
    }
    for (const provider of operational.missingRevenueProviders) {
      signals.push({
        signalId: `sig-provider-missing-${provider.key.toLowerCase()}`,
        source: 'operational-truth',
        category: 'platform-evolution',
        polarity: 'negative',
        strength: 95,
        summary: `${provider.nameAr} غير مهيّأ — لا اشتراك ولا إيراد.`,
      });
    }

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
