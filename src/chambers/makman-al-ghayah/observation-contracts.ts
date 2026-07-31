/**
 * AZMA OS — Makman Al-Ghayah
 * REALITY OBSERVATION FOUNDATION — Constitutional Foundation Package IV
 *
 * An Observation is a statement of reality supported by an actual signal
 * from the platform. It is constitutionally distinct from:
 *   - SuccessCriterion: what the Creator declared must become true (definition)
 *   - GoalStatus.COMPLETED: operational production completion
 *   - Fulfillment Assessment: future judgment comparing definition vs. reality
 *
 * Package IV records only the smallest real signals already available
 * through existing platform pathways. The only real post-production signal
 * available today is CONSUMPTION_ATTEMPT — every access request to a
 * published work goes through PublicConsumptionBoundary.requestConsumption().
 *
 * No signal = no observation. The Empire never fabricates an observation.
 */

export const CONSUMPTION_SIGNAL = 'CONSUMPTION_ATTEMPT' as const;
export type ObservationSignal = typeof CONSUMPTION_SIGNAL;

export type ObservationOutcome = 'AUTHORIZED' | 'DENIED';

export interface ObservationRecord {
  readonly observationId: string;
  readonly goalId: string;
  readonly publicationId: string;
  readonly signal: ObservationSignal;
  readonly outcome: ObservationOutcome;
  readonly observedAtMs: number;
}

/**
 * Chamber-declared contract for persisting and retrieving Observations.
 * persistent-storage/ implements this interface; the chamber never imports
 * from persistent-storage/ directly — the interface-inversion pattern.
 */
export interface IObservationStore {
  /**
   * Records a consumption event as an Observation against the Goal that
   * produced the publication. Resolves the publicationId → goalId link
   * via the cinematic ledger. If the publication has no ledger entry
   * (no goalId link), the event is silently ignored — no fabrication.
   */
  recordConsumptionEvent(
    publicationId: string,
    isAuthorized: boolean,
    timestampMs: number,
  ): void;

  /**
   * Returns all Observations for a Milestone Goal, most recent first.
   * Tenant-isolated: only returns Observations for Goals owned by creatorId.
   */
  listObservationsForGoal(
    goalId: string,
    creatorId: string,
  ): readonly ObservationRecord[];
}
