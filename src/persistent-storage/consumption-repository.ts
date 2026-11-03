/**
 * AZMA OS — PERSISTENT STORAGE
 * Consumption Repository
 *
 * SQLite implementation of IConsumptionLedger.
 * Follows the same inversion-of-dependency pattern as
 * CinematicLedger and GoalRepository: the domain interface lives in
 * src/consumption-ledger/; this file adapts it to the database.
 *
 * Every write is a plain INSERT — records are immutable once written.
 * Reads aggregate with GROUP BY so callers receive totals, not raw rows;
 * the domain layer never needs to inspect individual records.
 */

import { resolveProviderCost } from '../consumption-ledger/provider-cost-basis';
import type { DatabaseSync } from 'node:sqlite';
import type {
  ConsumptionRecord,
  MonthlyUsage,
  CreatorMonthlyUsage,
  IConsumptionLedger,
} from '../consumption-ledger/consumption-ledger-contracts';
import { OperationType } from '../consumption-ledger/consumption-ledger-contracts';

// ─── INTERNAL ROW SHAPE ──────────────────────────────────────────────────────

interface AggregateRow {
  operation_type: string;
  total_units: number;
  total_cost: number;
}

interface CreatorAggregateRow extends AggregateRow {
  creator_id: string;
}

// ─── AGGREGATE BUILDER ───────────────────────────────────────────────────────

function buildMonthlyUsage(rows: readonly AggregateRow[]): MonthlyUsage {
  let imageGenerations = 0;
  let ttsCharacters = 0;
  let voiceClones = 0;
  let totalCostUsdEstimate = 0;

  for (const row of rows) {
    totalCostUsdEstimate += row.total_cost;
    switch (row.operation_type as OperationType) {
      case OperationType.IMAGE_GENERATION:
        imageGenerations += row.total_units;
        break;
      case OperationType.TEXT_TO_SPEECH:
        ttsCharacters += row.total_units;
        break;
      case OperationType.VOICE_CLONE:
        voiceClones += row.total_units;
        break;
    }
  }

  return { imageGenerations, ttsCharacters, voiceClones, totalCostUsdEstimate };
}

// ─── REPOSITORY ──────────────────────────────────────────────────────────────

export class ConsumptionRepository implements IConsumptionLedger {
  constructor(private readonly db: DatabaseSync) {}

  /** Appends one immutable consumption record. */
  /**
   * Write one consumption record, with its cost's BASIS beside its number.
   *
   * ─── WHY THE HONEST FIGURE IS A SECOND COLUMN ─────────────────────────────
   *
   *   `cost_usd_estimate` is `REAL NOT NULL`, so a null cannot go in it. The
   *   owner's ruling of 2026-11-02 requires an unmeasured cost to be recorded
   *   as `null`, and that lives in `cost_usd_measured`.
   *
   *   The legacy column is kept and is written with ZERO when nothing was
   *   measured — and a zero there is never a cost, because `cost_basis` says
   *   `UNKNOWN` in the same row. Any reader that takes the legacy column
   *   without its basis is reading a column that has been superseded, and the
   *   basis is what makes that visible rather than silent.
   */
  public record(r: ConsumptionRecord): void {
    const cost = resolveProviderCost(r.operationType, r.units);
    this.db
      .prepare(
        `INSERT INTO consumption_records
           (creator_id, operation_type, cost_usd_estimate, units, month_key, recorded_at,
            cost_usd_measured, cost_basis, cost_source, cost_measured_on, cost_provider)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      )
      .run(
        r.creatorId, r.operationType,
        // Superseded, and kept only so the column's NOT NULL holds and older
        // readers do not crash. It is the measured figure when there is one,
        // and zero — never a rate card — when there is not.
        cost.usd ?? 0,
        r.units, r.monthKey, r.recordedAt,
        cost.usd, cost.basis, cost.source, cost.measuredOn, cost.provider,
      );
  }

  /** Returns aggregated monthly usage for one Creator. Returns zero-totals when no records exist. */
  public getMonthlyUsage(creatorId: string, monthKey: string): MonthlyUsage {
    const rows = this.db
      .prepare(
        `SELECT operation_type,
                SUM(units)            AS total_units,
                SUM(cost_usd_estimate) AS total_cost
         FROM consumption_records
         WHERE creator_id = ? AND month_key = ?
         GROUP BY operation_type`,
      )
      .all(creatorId, monthKey) as unknown as AggregateRow[];

    return buildMonthlyUsage(rows);
  }

  /**
   * Returns aggregated monthly usage for every Creator who had at least one
   * operation in the given month. Intended for the Founder dashboard only.
   * Sorted by total estimated cost descending.
   */
  public getAllCreatorsUsage(monthKey: string): readonly CreatorMonthlyUsage[] {
    const rows = this.db
      .prepare(
        `SELECT creator_id, operation_type,
                SUM(units)            AS total_units,
                SUM(cost_usd_estimate) AS total_cost
         FROM consumption_records
         WHERE month_key = ?
         GROUP BY creator_id, operation_type`,
      )
      .all(monthKey) as unknown as CreatorAggregateRow[];

    // Group by creator_id then build one MonthlyUsage per creator.
    const byCreator = new Map<string, AggregateRow[]>();
    for (const row of rows) {
      const existing = byCreator.get(row.creator_id) ?? [];
      existing.push(row);
      byCreator.set(row.creator_id, existing);
    }

    const result: CreatorMonthlyUsage[] = [];
    for (const [creatorId, creatorRows] of byCreator) {
      result.push({ creatorId, ...buildMonthlyUsage(creatorRows) });
    }

    return result.sort((a, b) => b.totalCostUsdEstimate - a.totalCostUsdEstimate);
  }
}
