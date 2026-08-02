/**
 * AZMA OS — PERSISTENT STORAGE
 * Knowledge Investigation Repository
 *
 * SOVEREIGN KNOWLEDGE INVESTIGATION PERSISTENCE — Final Launch Foundation
 *
 * Implements IKnowledgeInvestigationStore via the `knowledge_investigations`
 * SQLite table. Each row is an immutable historical snapshot of a completed
 * Sovereign Investigation — it is never updated, only appended. The Empire
 * shall remember what it has already investigated.
 *
 * `records_json` stores the full KnowledgeExportRecord[] as JSON. These are
 * the sealed outputs of the constitutional chain — no provider identity,
 * provider URL, or external service name survives into them.
 *
 * `creator_id` is stored at write time for tenant-isolated reads — no join
 * required. A Creator can only read their own investigation history.
 */

import type { DatabaseSync } from 'node:sqlite';
import type {
  IKnowledgeInvestigationStore,
  KnowledgeInvestigationRecord,
} from '../chambers/hujjah-al-damighah/knowledge-investigation-store-contracts';
import type { KnowledgeExportRecord } from '../chambers/hujjah-al-damighah/knowledge-export-contracts';

interface InvestigationRow {
  investigation_id: string;
  goal_id: string;
  creator_id: string;
  record_count: number;
  records_json: string;
  investigated_at_ms: number;
}

function rowToRecord(row: InvestigationRow): KnowledgeInvestigationRecord {
  return {
    investigationId: row.investigation_id,
    goalId: row.goal_id,
    creatorId: row.creator_id,
    records: JSON.parse(row.records_json) as KnowledgeExportRecord[],
    recordCount: row.record_count,
    investigatedAtMs: row.investigated_at_ms,
  };
}

export class KnowledgeInvestigationRepository implements IKnowledgeInvestigationStore {
  constructor(private readonly db: DatabaseSync) {}

  public save(record: KnowledgeInvestigationRecord): void {
    this.db
      .prepare(
        `INSERT INTO knowledge_investigations
          (investigation_id, goal_id, creator_id, record_count, records_json, investigated_at_ms)
         VALUES (?, ?, ?, ?, ?, ?)`,
      )
      .run(
        record.investigationId,
        record.goalId,
        record.creatorId,
        record.recordCount,
        JSON.stringify(record.records),
        record.investigatedAtMs,
      );
  }

  public listForGoal(goalId: string, creatorId: string): readonly KnowledgeInvestigationRecord[] {
    const rows = this.db
      .prepare(
        'SELECT * FROM knowledge_investigations WHERE goal_id = ? AND creator_id = ? ORDER BY investigated_at_ms DESC, ROWID DESC',
      )
      .all(goalId, creatorId) as unknown as InvestigationRow[];

    return rows.map(rowToRecord);
  }

  public findLatestForGoal(goalId: string, creatorId: string): KnowledgeInvestigationRecord | null {
    const row = this.db
      .prepare(
        'SELECT * FROM knowledge_investigations WHERE goal_id = ? AND creator_id = ? ORDER BY investigated_at_ms DESC, ROWID DESC LIMIT 1',
      )
      .get(goalId, creatorId) as unknown as InvestigationRow | undefined;

    return row ? rowToRecord(row) : null;
  }
}
