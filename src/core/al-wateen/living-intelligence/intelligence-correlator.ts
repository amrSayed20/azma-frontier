import { AlWateenIntelligenceStreams, CorrelatedIntelligenceView } from './al-wateen-integration-types';

export class IntelligenceCorrelator {
  public correlate(streams: AlWateenIntelligenceStreams): CorrelatedIntelligenceView {
    const constitutionalHealth = streams.constitutionState?.loaded
      ? Math.min(100, 70 + Math.min(streams.constitutionState.policyCount, 30))
      : 20;

    const executiveReadiness = Math.min(
      100,
      40 + streams.executiveState.totalDecisionPackages + streams.executiveState.totalObservedEvents / 4
    );

    const strategicReadiness = Math.min(
      100,
      45 + streams.strategicState.totalPackages * 2 + streams.strategicState.totalSignals / 6
    );

    const futureConfidence = Math.min(
      100,
      35 + streams.futureSimulationState.totalPackages * 2 + streams.futureSimulationState.totalSimulatedPaths / 20
    );

    const synchronizationHealth = streams.busDiagnostics.healthy
      ? Math.min(100, 75 + streams.busSynchronization.length)
      : Math.max(20, 55 - streams.busState.invalidMessagesBlocked * 5);

    const perceptionCoverage = Math.min(
      100,
      45 + streams.perceptionState.totalPackages * 2 + streams.perceptionState.totalObservations / 10
    );

    const coherenceScore = Math.round(
      (constitutionalHealth + executiveReadiness + strategicReadiness + futureConfidence + synchronizationHealth + perceptionCoverage) / 6
    );

    return {
      constitutionalHealth,
      executiveReadiness,
      strategicReadiness,
      futureConfidence,
      synchronizationHealth,
      perceptionCoverage,
      coherenceScore,
    };
  }
}
