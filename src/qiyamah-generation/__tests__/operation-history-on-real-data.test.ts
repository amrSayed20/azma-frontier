/**
 * AZMA OS — D-4 ON REAL PRODUCTION ROWS, 2026-10-11.
 *
 * The unit tests above prove the classifier's rules. This one runs the SHIPPED
 * reader against a read-only snapshot of the production database, because a
 * rule that is right on fixtures and wrong on real rows is still wrong.
 *
 * It opens the snapshot READONLY and asserts nothing about its contents beyond
 * what the reader must survive. It SKIPS when the snapshot is absent, so it
 * can never fail in CI for want of a file it must not carry.
 */

import { existsSync } from 'fs';
import { DatabaseSync } from 'node:sqlite';
import { operationHistoryForCreator, historyGaps } from '../operation-history';

const SNAPSHOT = process.env.AZMA_DB_SNAPSHOT ?? '';
const have = SNAPSHOT.length > 0 && existsSync(SNAPSHOT);
const maybe = have ? describe : describe.skip;

maybe('the shipped reader, on real production rows', () => {
  let db: DatabaseSync;
  let creatorIds: string[] = [];

  beforeAll(() => {
    // `readOnly` IS honoured by node:sqlite at runtime (verified on v24.15.0);
    // only the bundled type declaration is narrower than the implementation.
    // Dropping the flag to satisfy the compiler would open a snapshot of
    // production read-WRITE, so the cast stays and the flag stays with it.
    db = new DatabaseSync(SNAPSHOT, { readOnly: true } as unknown as { open?: boolean });
    creatorIds = (db.prepare('SELECT creator_id FROM creators').all() as { creator_id: string }[])
      .map((r) => r.creator_id);
  });
  afterAll(() => { try { db.close(); } catch { /* already closed */ } });

  it('reads every Creator without throwing on a legacy row', () => {
    for (const id of creatorIds) {
      expect(() => operationHistoryForCreator(db, id, 500)).not.toThrow();
    }
  });

  it('never returns an asset belonging to another Creator', () => {
    for (const id of creatorIds) {
      const ids = operationHistoryForCreator(db, id, 500).map((e) => e.assetId);
      if (ids.length === 0) continue;
      const owners = db.prepare(
        `SELECT DISTINCT subscriber_tenant_id AS o FROM vault_assets
          WHERE asset_id IN (${ids.map(() => '?').join(',')})`,
      ).all(...ids) as { o: string }[];
      expect(owners.map((r) => r.o)).toEqual([id]);
    }
  });

  it('names acts on real rows, and counts the ones it cannot', () => {
    const all = creatorIds.flatMap((id) => operationHistoryForCreator(db, id, 500));
    const g = historyGaps(all);
    // Not asserted as zero: 47 rows predate the provenance columns and the
    // honest answer for them is «unnamed». What IS asserted is that the two
    // halves account for every row — a gap silently absorbed into a named act
    // is the failure this guards.
    expect(g.named + g.unnamed).toBe(g.total);
    expect(g.named).toBeGreaterThan(0);
    // eslint-disable-next-line no-console
    console.log('  [real data]', JSON.stringify(g));
  });

  it('every ACCEPTED entry has a Vault lifecycle that says so', () => {
    for (const id of creatorIds) {
      for (const e of operationHistoryForCreator(db, id, 500)) {
        if (e.outcome === 'ACCEPTED') {
          expect(['FINAL', 'PUBLISHED']).toContain(e.lifecycleState);
        }
      }
    }
  });

  it('lineage is carried through, never synthesised', () => {
    for (const id of creatorIds) {
      for (const e of operationHistoryForCreator(db, id, 500)) {
        if (e.parentAssetId === null) continue;
        const row = db.prepare('SELECT parent_asset_id AS p FROM vault_assets WHERE asset_id = ?')
          .get(e.assetId) as { p: string | null } | undefined;
        expect(e.parentAssetId).toBe(row?.p ?? null);
      }
    }
  });
});
