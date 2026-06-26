import { RuntimeObservationInput, PerceptionObservation } from './sovereign-perception-types';

export class SecurityObserver {
  public observe(input: RuntimeObservationInput): readonly PerceptionObservation[] {
    const observedAt = new Date();

    return [
      {
        observationId: `spl-security-runtime-${observedAt.getTime()}`,
        category: 'security',
        source: 'runtime-security-surface',
        observedAt,
        immutable: true,
        payload: {
          busHealthy: input.busDiagnostics.healthy,
          blockedMessages: input.busState.invalidMessagesBlocked,
          constitutionalLoaded: input.constitutionState?.loaded ?? false,
        },
      },
    ];
  }
}
