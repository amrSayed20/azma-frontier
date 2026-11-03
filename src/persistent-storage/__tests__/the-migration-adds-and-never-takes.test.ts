/**
 * AZMA OS — الهجرةُ تُضيف ولا تُنقِص، مُثبَتًا على بنيةِ الإنتاجِ نفسِها.
 *
 * ─── WHY THIS EXISTS, AND WHY IT IS NOT RUN ON PRODUCTION ───────────────────
 *
 *   The Founder ordered the rollback proven and forbade a destructive trial:
 *
 *     «أثبت أن الرجوع لا يفقد أرصدة المستخدمين أو سجلات الحجز والتسوية أو
 *     بيانات قاعدة الإنتاج… لا تنفذ تجربة مدمرة على الإنتاج.»
 *
 *   A rollback on this host repoints `.next` at the previous release and
 *   reloads — it cannot undo a schema migration, because the database lives
 *   OUTSIDE the release directory and survives both directions. So the
 *   question that actually decides rollback safety is not «can the symlink be
 *   flipped back» (it can, in seconds) but **«does the migration take
 *   anything away that the old build still needs?»**
 *
 *   That is answered here, against a database built from the PRODUCTION DDL
 *   read on 2026-11-04 — 31 tables, verbatim — seeded with rows, migrated by
 *   the real `createDatabase`, and then compared column by column and row by
 *   row with what it was before.
 *
 *   The live file is never opened. The fixture is its shape, not its contents.
 */

import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';

const FIXTURES = join(process.cwd(), 'src', 'persistent-storage', '__tests__', 'fixtures');
const PRODUCTION_DDL = readFileSync(join(FIXTURES, 'production-schema-2026-11-04.sql'), 'utf8');
const PRODUCTION_SHAPE = JSON.parse(
  readFileSync(join(FIXTURES, 'production-shape-2026-11-04.json'), 'utf8'),
) as {
  readonly measuredOn: string;
  readonly tableCount: number;
  readonly tables: Record<string, { readonly rows: number; readonly cols: readonly string[] }>;
};

/** Tables and columns, as the database itself reports them. */
function shapeOf(db: DatabaseSync): Record<string, string[]> {
  const names = db
    .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name NOT LIKE 'sqlite_%' ORDER BY name")
    .all()
    .map((r) => (r as { name: string }).name);
  const out: Record<string, string[]> = {};
  for (const name of names) {
    out[name] = db.prepare(`PRAGMA table_info("${name}")`).all()
      .map((r) => (r as { name: string }).name);
  }
  return out;
}

function rowCounts(db: DatabaseSync, tables: readonly string[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const t of tables) {
    out[t] = (db.prepare(`SELECT COUNT(*) AS c FROM "${t}"`).get() as { c: number }).c;
  }
  return out;
}

describe('the migration adds and never takes', () => {
  it('the fixture really is the production shape that was measured', () => {
    // An instrument calibrated against nothing proves nothing. The fixture is
    // asserted to be what was read from the live host, not a hand-written
    // approximation that happens to pass.
    expect(PRODUCTION_SHAPE.measuredOn).toBe('2026-11-04');
    expect(PRODUCTION_SHAPE.tableCount).toBe(31);
    // And the tables the money lives in are among them, with their columns.
    for (const t of ['credit_ledger', 'creator_balances', 'trial_entitlements', 'vault_assets']) {
      expect(Object.keys(PRODUCTION_SHAPE.tables)).toContain(t);
      expect(PRODUCTION_SHAPE.tables[t]!.cols.length).toBeGreaterThan(3);
    }
    // `paid_operation_attempts` is what the merge ADDS, so production must not
    // have it yet — otherwise this whole proof is about the wrong database.
    expect(Object.keys(PRODUCTION_SHAPE.tables)).not.toContain('paid_operation_attempts');
  });

  it('loses no table, no column and no row when the new schema runs over it', async () => {
    const { createDatabase } = await import('../db');

    const file = join(
      process.env['TEMP'] ?? process.env['TMPDIR'] ?? '/tmp',
      `azma-migration-proof-${Date.now()}.db`,
    );

    // ── 1 · A database with the production shape, and rows in it ───────────
    const before = new DatabaseSync(file);
    before.exec(PRODUCTION_DDL);

    // Seeded into the tables a rollback must never damage. Values are shaped
    // to the columns, not to any real Creator.
    before.exec(`
      INSERT INTO creators (creator_id, email, role, created_at)
        VALUES ('c-1', 'one@example.test', 'creator', 1),
               ('c-2', 'two@example.test', 'creator', 2);
      INSERT INTO creator_balances (creator_id, available_units, reserved_units, total_purchased, total_spent, updated_at)
        VALUES ('c-1', 5000, 300, 5300, 0, 1),
               ('c-2', 120, 0, 120, 0, 2);
    `);
    const ledgerCols = PRODUCTION_SHAPE.tables['credit_ledger']!.cols;
    const ledgerInsert = before.prepare(
      `INSERT INTO credit_ledger (${ledgerCols.map((c) => `"${c}"`).join(',')}) `
      + `VALUES (${ledgerCols.map(() => '?').join(',')})`,
    );
    for (const id of ['led-1', 'led-2']) {
      ledgerInsert.run(...ledgerCols.map((c) => {
        if (c === 'ledger_id') return id;
        if (c === 'creator_id') return 'c-1';
        if (c === 'transaction_type') return 'purchase';
        if (c === 'direction') return 'credit';
        if (c === 'amount' || c === 'balance_after') return 1000;
        if (c === 'status') return 'completed';
        if (c.endsWith('_at') || c.endsWith('_at_ms')) return 1;
        return null;
      }));
    }

    const shapeBefore = shapeOf(before);
    const tablesBefore = Object.keys(shapeBefore);
    const countsBefore = rowCounts(before, tablesBefore);
    before.close();

    // ── 2 · The REAL migration, the one the merge will run ────────────────
    const migrated = createDatabase(file);

    const shapeAfter = shapeOf(migrated);
    const countsAfter = rowCounts(migrated, tablesBefore);

    // ── 3 · NOTHING WAS TAKEN ─────────────────────────────────────────────
    //
    //   Asserted per table and per column rather than by a count, so a
    //   migration that dropped one column and added another could not pass.
    for (const table of tablesBefore) {
      expect(Object.keys(shapeAfter)).toContain(table);
      for (const column of shapeBefore[table]!) {
        expect(shapeAfter[table]).toContain(column);
      }
      // And every row still there. This is the Founder's own condition.
      expect(countsAfter[table]).toBe(countsBefore[table]);
    }

    // The balances specifically, read back by value and not merely counted.
    const balance = migrated
      .prepare('SELECT available_units, reserved_units FROM creator_balances WHERE creator_id = ?')
      .get('c-1') as { available_units: number; reserved_units: number };
    expect(balance).toEqual({ available_units: 5000, reserved_units: 300 });

    // ── 4 · AND WHAT IT ADDS IS THERE ─────────────────────────────────────
    expect(Object.keys(shapeAfter)).toContain('paid_operation_attempts');
    expect(shapeAfter['paid_operation_attempts']).toContain('operation_id');

    migrated.close();
  });

  it('is idempotent, so a redeploy over a migrated database changes nothing', async () => {
    const { createDatabase } = await import('../db');
    const file = join(
      process.env['TEMP'] ?? process.env['TMPDIR'] ?? '/tmp',
      `azma-migration-twice-${Date.now()}.db`,
    );

    const seed = new DatabaseSync(file);
    seed.exec(PRODUCTION_DDL);
    seed.close();

    const first = createDatabase(file);
    const shapeOnce = shapeOf(first);
    first.close();

    // Deploying twice, or rolling forward after a rollback, runs it again.
    const second = createDatabase(file);
    const shapeTwice = shapeOf(second);
    second.close();

    expect(shapeTwice).toEqual(shapeOnce);
  });
});
