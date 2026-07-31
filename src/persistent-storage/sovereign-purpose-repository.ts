/**
 * AZMA OS — SOVEREIGN PURPOSE FOUNDATION
 * Constitutional Foundation Package I
 *
 * Implements ISovereignPurposeStore (declared in
 * src/chambers/makman-al-ghayah/sovereign-purpose.ts) using three columns
 * on the existing `creators` table — no new table is created.
 *
 * sovereign_purpose_created_at is set exactly once via COALESCE: the first
 * call to setSovereignPurpose() stamps it; every subsequent update leaves
 * it intact. sovereign_purpose_updated_at always reflects the latest write.
 */

import type { DatabaseSync } from 'node:sqlite';
import type { SovereignPurpose, ISovereignPurposeStore } from '../chambers/makman-al-ghayah/sovereign-purpose';

type PurposeRow = {
  readonly sovereign_purpose: string;
  readonly sovereign_purpose_created_at: number;
  readonly sovereign_purpose_updated_at: number;
};

export class SovereignPurposeRepository implements ISovereignPurposeStore {
  constructor(private readonly db: DatabaseSync) {}

  public getSovereignPurpose(creatorId: string): SovereignPurpose | null {
    const row = this.db
      .prepare(
        'SELECT sovereign_purpose, sovereign_purpose_created_at, sovereign_purpose_updated_at FROM creators WHERE creator_id = ? AND sovereign_purpose IS NOT NULL',
      )
      .get(creatorId) as PurposeRow | undefined;
    if (!row) return null;
    return {
      creatorId,
      purposeStatement: row.sovereign_purpose,
      createdAtMs: row.sovereign_purpose_created_at,
      updatedAtMs: row.sovereign_purpose_updated_at,
    };
  }

  public setSovereignPurpose(creatorId: string, purposeStatement: string): SovereignPurpose {
    const now = Date.now();
    this.db
      .prepare(
        `UPDATE creators
         SET sovereign_purpose = ?,
             sovereign_purpose_created_at = COALESCE(sovereign_purpose_created_at, ?),
             sovereign_purpose_updated_at = ?
         WHERE creator_id = ?`,
      )
      .run(purposeStatement, now, now, creatorId);
    const written = this.getSovereignPurpose(creatorId);
    if (!written) throw new Error(`Creator [${creatorId}] not found — cannot persist Sovereign Purpose.`);
    return written;
  }
}
