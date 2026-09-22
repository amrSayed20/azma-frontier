/**
 * AZMA OS — The proof harness cannot delete what it did not create.
 *
 * The incident of 2026-09-22 (see run-ledger.js) is replayed here as the
 * first case: a historical asset exists, the run creates nothing, cleanup
 * runs — and must delete nothing. Then the positive case: A and B created,
 * only A and B deleted. Then the source rule: no proof script may contain a
 * selector that names a resource by position or recency.
 */

import { readFileSync, readdirSync, statSync } from 'fs';
import { join } from 'path';

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { createRunLedger, executeCleanup } = require('../run-ledger.js') as {
  createRunLedger: (init: { runId: string; ownerId: string; startedAt?: number }) => {
    record(e: { resourceType: string; resourceId: string; operationId: string; createdAt?: number }): void;
    entries(): unknown[];
    cleanupPlan(live: Live[]): { deletable: Entry[]; refused: { entry: Entry; reason: string }[] };
  };
  executeCleanup: (plan: unknown, del: (e: Entry) => Promise<unknown>) => Promise<{ deleted: unknown[]; refused: unknown[] }>;
};
type Live = { resourceType: string; resourceId: string; createdAt: number; ownerId: string };
type Entry = { resourceType: string; resourceId: string };

const OWNER = 'creator-A';
const RUN_START = 1_800_000_000_000;
const HISTORICAL: Live = { resourceType: 'generation', resourceId: '909ca037-historical', createdAt: RUN_START - 30 * 86_400_000, ownerId: OWNER };

describe('the incident, replayed: nothing created → nothing deleted', () => {
  it('a run that recorded nothing produces an empty plan even though the newest live asset is right there', async () => {
    const ledger = createRunLedger({ runId: 'run-1', ownerId: OWNER, startedAt: RUN_START });
    const plan = ledger.cleanupPlan([HISTORICAL]);
    expect(plan.deletable).toEqual([]);
    const deletes: Entry[] = [];
    const result = await executeCleanup(plan, async (e) => { deletes.push(e); return 'deleted'; });
    expect(deletes).toEqual([]);
    expect(result.deleted).toEqual([]);
  });

  it('there is no API that accepts a list and picks from it', () => {
    const ledger = createRunLedger({ runId: 'run-1', ownerId: OWNER, startedAt: RUN_START });
    const api = Object.keys(ledger).sort();
    expect(api).toEqual(['cleanupPlan', 'entries', 'ownerId', 'record', 'runId', 'startedAt']);
  });
});

describe('the positive case: A and B, and only A and B', () => {
  it('deletes exactly the two resources this run recorded, leaving the historical one', async () => {
    const ledger = createRunLedger({ runId: 'run-2', ownerId: OWNER, startedAt: RUN_START });
    ledger.record({ resourceType: 'generation', resourceId: 'gen-A', operationId: 'op-A', createdAt: RUN_START + 1000 });
    ledger.record({ resourceType: 'vault-asset', resourceId: 'asset-B', operationId: 'op-B', createdAt: RUN_START + 2000 });
    const live: Live[] = [
      HISTORICAL,
      { resourceType: 'generation', resourceId: 'gen-A', createdAt: RUN_START + 1000, ownerId: OWNER },
      { resourceType: 'vault-asset', resourceId: 'asset-B', createdAt: RUN_START + 2000, ownerId: OWNER },
      { resourceType: 'vault-asset', resourceId: 'asset-newest-not-mine-to-touch', createdAt: RUN_START + 5000, ownerId: OWNER },
    ];
    const plan = ledger.cleanupPlan(live);
    expect(plan.deletable.map((e) => e.resourceId).sort()).toEqual(['asset-B', 'gen-A']);
    const deleted: string[] = [];
    await executeCleanup(plan, async (e) => { deleted.push(e.resourceId); });
    expect(deleted.sort()).toEqual(['asset-B', 'gen-A']);
  });
});

describe('every refusal is a refusal, not a guess', () => {
  const ledger = () => createRunLedger({ runId: 'run-3', ownerId: OWNER, startedAt: RUN_START });

  it('an id recorded but no longer live is refused (not-live)', () => {
    const l = ledger(); l.record({ resourceType: 'generation', resourceId: 'gen-X', operationId: 'op', createdAt: RUN_START + 1 });
    expect(l.cleanupPlan([]).refused).toEqual([{ entry: expect.objectContaining({ resourceId: 'gen-X' }), reason: 'not-live' }]);
  });

  it('a live record that predates the run is refused even if its id was recorded', () => {
    const l = ledger(); l.record({ resourceType: 'generation', resourceId: '909ca037-historical', operationId: 'op', createdAt: RUN_START + 1 });
    const plan = l.cleanupPlan([HISTORICAL]);
    expect(plan.deletable).toEqual([]);
    expect(plan.refused[0].reason).toBe('predates-run');
  });

  it('a foreign owner is refused', () => {
    const l = ledger(); l.record({ resourceType: 'generation', resourceId: 'gen-F', operationId: 'op', createdAt: RUN_START + 1 });
    expect(l.cleanupPlan([{ resourceType: 'generation', resourceId: 'gen-F', createdAt: RUN_START + 1, ownerId: 'creator-B' }]).refused[0].reason).toBe('foreign-owner');
  });

  it('an ambiguous id is refused', () => {
    const l = ledger(); l.record({ resourceType: 'generation', resourceId: 'gen-D', operationId: 'op', createdAt: RUN_START + 1 });
    const twice: Live = { resourceType: 'generation', resourceId: 'gen-D', createdAt: RUN_START + 1, ownerId: OWNER };
    expect(l.cleanupPlan([twice, twice]).refused[0].reason).toBe('ambiguous-id');
  });

  it('recording refuses an inferred (empty) id and a resource that predates the run', () => {
    const l = ledger();
    expect(() => l.record({ resourceType: 'generation', resourceId: '', operationId: 'op' })).toThrow(/exact resourceId/);
    expect(() => l.record({ resourceType: 'generation', resourceId: 'old', operationId: 'op', createdAt: RUN_START - 1 })).toThrow(/predates/);
  });
});

describe('no proof script may select a resource by position or recency', () => {
  /**
   * The selector that caused the incident, and its relatives. A proof script
   * that contains one of these fails here before it can ever run.
   */
  const FORBIDDEN: RegExp[] = [
    /\bgens\s*\[\s*0\s*\]/, /generations\s*\[\s*0\s*\]/, /assets\s*\[\s*0\s*\]/,
    /\.at\(\s*-1\s*\)/, /ORDER BY\s+\w+\s+DESC\s+LIMIT\s+1/i,
    /\bnewest\b/, /\blatest\b/, /\bmostRecent\b/,
    /sort\([^)]*createdAt[^)]*\)\s*\[\s*0\s*\]/,
  ];
  const ROOT = process.cwd();
  const scripts = readdirSync(join(ROOT, 'scripts'))
    .filter((f) => /\.(mjs|js)$/.test(f) && statSync(join(ROOT, 'scripts', f)).isFile());

  it('finds the proof scripts', () => {
    expect(scripts.length).toBeGreaterThan(0);
  });

  for (const file of scripts) {
    it(`${file} contains no forbidden cleanup selector`, () => {
      const code = readFileSync(join(ROOT, 'scripts', file), 'utf8')
        .replace(/\/\*[\s\S]*?\*\//g, '')
        .replace(/^\s*\/\/.*$/gm, '');
      // Only lines that delete are in scope for the recency words; the
      // positional selectors are forbidden anywhere in a proof script.
      const hits = FORBIDDEN.filter((re) => re.test(code));
      expect(hits.map(String)).toEqual([]);
    });
  }
});
