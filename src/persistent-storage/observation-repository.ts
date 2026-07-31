/**
 * AZMA OS — PERSISTENT STORAGE
 * Observation Repository
 *
 * REALITY OBSERVATION FOUNDATION — Constitutional Foundation Package IV
 *
 * Implements IObservationStore from the Makman chamber using the `observations`
 * SQLite table. On every recordConsumptionEvent() call, this repository first
 * resolves the publicationId → goalId link by querying cinematic_ledger. If
 * no ledger entry exists (publication not yet recorded, or goalId was never
 * stored), the event is silently ignored — the Empire never fabricates an
 * observation against a goal it cannot identify.
 *
 * Tenant isolation is enforced at the SQL level: publisher_tenant_id is
 * denormalized from cinematic_ledger at write time so listObservationsForGoal()
 * filters by both goal_id and publisher_tenant_id with no join required.
 */

import type { DatabaseSync } from 'node:sqlite';
import type { IObservationStore, ObservationRecord, ObservationOutcome } from '../chambers/makman-al-ghayah/observation-contracts';
import { CONSUMPTION_SIGNAL } from '../chambers/makman-al-ghayah/observation-contracts';

interface LedgerRow {
  goal_id: string | null;
  publisher_tenant_id: string;
}

interface ObservationRow {
  observation_id: string;
  goal_id: string;
  publisher_tenant_id: string;
  publication_id: string;
  signal: string;
  outcome: string;
  observed_at_ms: number;
}

let observationCounter = 0;
function generateObservationId(timestampMs: number): string {
  observationCounter += 1;
  return `obs-${timestampMs}-${observationCounter}`;
}

export class ObservationRepository implements IObservationStore {
  constructor(private readonly db: DatabaseSync) {}

  public recordConsumptionEvent(
    publicationId: string,
    isAuthorized: boolean,
    timestampMs: number,
  ): void {
    const ledgerRow = this.db
      .prepare('SELECT goal_id, publisher_tenant_id FROM cinematic_ledger WHERE publication_id = ?')
      .get(publicationId) as LedgerRow | undefined;

    if (!ledgerRow || !ledgerRow.goal_id) return;

    const outcome: ObservationOutcome = isAuthorized ? 'AUTHORIZED' : 'DENIED';
    this.db
      .prepare(
        `INSERT INTO observations
          (observation_id, goal_id, publisher_tenant_id, publication_id, signal, outcome, observed_at_ms)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        generateObservationId(timestampMs),
        ledgerRow.goal_id,
        ledgerRow.publisher_tenant_id,
        publicationId,
        CONSUMPTION_SIGNAL,
        outcome,
        timestampMs,
      );
  }

  public listObservationsForGoal(
    goalId: string,
    creatorId: string,
  ): readonly ObservationRecord[] {
    const rows = this.db
      .prepare(
        'SELECT * FROM observations WHERE goal_id = ? AND publisher_tenant_id = ? ORDER BY observed_at_ms DESC',
      )
      .all(goalId, creatorId) as unknown as ObservationRow[];

    return rows.map((row) => ({
      observationId: row.observation_id,
      goalId: row.goal_id,
      publicationId: row.publication_id,
      signal: CONSUMPTION_SIGNAL,
      outcome: row.outcome as ObservationOutcome,
      observedAtMs: row.observed_at_ms,
    }));
  }
}
