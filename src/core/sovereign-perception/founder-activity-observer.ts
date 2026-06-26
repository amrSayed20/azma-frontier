import { RuntimeObservationInput, PerceptionObservation } from './sovereign-perception-types';

export class FounderActivityObserver {
  public observe(input: RuntimeObservationInput): readonly PerceptionObservation[] {
    const observedAt = new Date();

    return [
      {
        observationId: `spl-founder-activity-${observedAt.getTime()}`,
        category: 'founder-activity',
        source: 'executive-founder-surface',
        observedAt,
        immutable: true,
        payload: {
          lastActionId: input.executiveState.lastActionId,
          lastDecisionPackageId: input.executiveState.lastPackageId,
          note: 'Observation only. No founder-level decision or execution authority is performed by SPL.',
        },
      },
    ];
  }
}
