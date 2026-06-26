import { RuntimeObservationInput, PerceptionObservation } from './sovereign-perception-types';

export class ResourceObserver {
  public observe(input: RuntimeObservationInput): readonly PerceptionObservation[] {
    const observedAt = new Date();
    const observedLoad =
      (input.executiveState.totalDecisionPackages ?? 0) +
      (input.strategicState.totalPackages ?? 0) +
      (input.futureSimulationState.totalSimulatedPaths ?? 0);

    return [
      {
        observationId: `spl-resource-load-${observedAt.getTime()}`,
        category: 'resource',
        source: 'runtime-resource-surface',
        observedAt,
        immutable: true,
        payload: {
          observedLoad,
          constitutionalEvents: input.constitutionState?.eventCount ?? 0,
          busQueueDepth: input.busDiagnostics.queueDepth,
        },
      },
    ];
  }
}
