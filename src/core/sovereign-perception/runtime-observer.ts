import { RuntimeObservationInput, PerceptionObservation } from './sovereign-perception-types';

export class RuntimeObserver {
  public observe(input: RuntimeObservationInput): readonly PerceptionObservation[] {
    const timestamp = new Date();

    return [
      {
        observationId: `spl-runtime-constitution-${timestamp.getTime()}`,
        category: 'runtime',
        source: 'constitution-runtime',
        observedAt: timestamp,
        immutable: true,
        payload: {
          loaded: input.constitutionState?.loaded ?? false,
          articleCount: input.constitutionState?.articleCount ?? 0,
          policyCount: input.constitutionState?.policyCount ?? 0,
          eventCount: input.constitutionState?.eventCount ?? 0,
        },
      },
      {
        observationId: `spl-runtime-executive-${timestamp.getTime()}`,
        category: 'runtime',
        source: 'executive-intelligence',
        observedAt: timestamp,
        immutable: true,
        payload: {
          totalObservedEvents: input.executiveState.totalObservedEvents,
          totalDecisionPackages: input.executiveState.totalDecisionPackages,
        },
      },
      {
        observationId: `spl-runtime-strategic-${timestamp.getTime()}`,
        category: 'runtime',
        source: 'strategic-intelligence',
        observedAt: timestamp,
        immutable: true,
        payload: {
          totalPackages: input.strategicState.totalPackages,
          totalSignals: input.strategicState.totalSignals,
        },
      },
      {
        observationId: `spl-runtime-future-${timestamp.getTime()}`,
        category: 'runtime',
        source: 'future-simulation',
        observedAt: timestamp,
        immutable: true,
        payload: {
          totalPackages: input.futureSimulationState.totalPackages,
          totalSimulatedPaths: input.futureSimulationState.totalSimulatedPaths,
        },
      },
      {
        observationId: `spl-runtime-bus-${timestamp.getTime()}`,
        category: 'runtime',
        source: 'sovereign-intelligence-bus',
        observedAt: timestamp,
        immutable: true,
        payload: {
          totalPublishedMessages: input.busState.totalPublishedMessages,
          totalRoutedMessages: input.busState.totalRoutedMessages,
          invalidMessagesBlocked: input.busState.invalidMessagesBlocked,
          healthy: input.busDiagnostics.healthy,
        },
      },
    ];
  }
}
