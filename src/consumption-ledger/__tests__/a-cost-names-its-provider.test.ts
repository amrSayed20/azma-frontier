/**
 * AZMA OS — كلُّ تكلفةٍ تُسمّي مزوِّدَها، أو تُقال مجهولة.
 *
 * ─── THE DEFECT, 2026-11-01 ─────────────────────────────────────────────────
 *
 *   `consumption_records` — the Empire's COST DISCOVERY record — was being
 *   written with OpenAI's published rate card for operations ElevenLabs and
 *   Magic Hour had served. The image figure understated the measured cost by
 *   3.4×; the speech figure named the wrong provider entirely; the voice
 *   clone figure had no source at all.
 *
 *   RULED 2026-11-02: correct it with the actual provider's cost, record the
 *   unmeasured as `null`, keep measured and estimated and unknown apart, and
 *   keep the record auditable — every number naming its source and the day it
 *   was measured. And: this is a data-accuracy repair; it may not touch a
 *   Creator's balance or price.
 */

import { mkdtempSync, readFileSync } from 'fs';
import { join } from 'path';
import { tmpdir } from 'os';

process.env.AZMA_DB_PATH = join(mkdtempSync(join(tmpdir(), 'azma-cost-')), 'cost.db');

import { getDb } from '../../persistent-storage';
import { ConsumptionRepository } from '../../persistent-storage/consumption-repository';
import { OperationType } from '../consumption-ledger-contracts';
import { resolveProviderCost } from '../provider-cost-basis';
import { CREDIT_USD } from '../../economy/cost-engine/qiyamah-cost-truth';

const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');

const rowsFor = (creatorId: string) =>
  getDb()
    .prepare(
      `SELECT operation_type, cost_usd_estimate, units, cost_usd_measured,
              cost_basis, cost_source, cost_measured_on, cost_provider
         FROM consumption_records WHERE creator_id = ? ORDER BY id`,
    )
    .all(creatorId) as {
      operation_type: string; cost_usd_estimate: number; units: number;
      cost_usd_measured: number | null; cost_basis: string | null;
      cost_source: string | null; cost_measured_on: string | null;
      cost_provider: string | null;
    }[];

let seq = 0;
const write = (operationType: OperationType, units: number): string => {
  const creatorId = `cost_${++seq}`;
  new ConsumptionRepository(getDb()).record({
    creatorId, operationType, costUsdEstimate: 0, units,
    monthKey: '2026-11', recordedAt: Date.now(),
  });
  return creatorId;
};

describe('١ · الصورة — تُسجَّل بالمقيس، لا بجدولِ مزوِّدٍ آخر', () => {
  it('one image records the MEASURED Magic Hour cost and names the provider', () => {
    const me = write(OperationType.IMAGE_GENERATION, 1);
    const [row] = rowsFor(me);

    // 100 provider credits at the acquisition basis — not $0.040.
    expect(row!.cost_usd_measured).toBeCloseTo(100 * CREDIT_USD, 10);
    expect(row!.cost_basis).toBe('MEASURED');
    expect(row!.cost_provider).toBe('magic-hour-image');
    // And it is NOT the superseded rate card's figure.
    expect(row!.cost_usd_measured).not.toBeCloseTo(0.040, 6);
    expect(row!.cost_usd_measured!).toBeGreaterThan(0.13);
  });

  it('the record names its source and the day it was measured', () => {
    const me = write(OperationType.IMAGE_GENERATION, 1);
    const [row] = rowsFor(me);
    expect(row!.cost_source).toContain('qiyamah-cost-truth');
    expect(row!.cost_source).toContain('IMAGE_GENERATION');
    expect(row!.cost_measured_on).toBe('2026-09-27');
  });

  it('three images cost three times one', () => {
    const one = rowsFor(write(OperationType.IMAGE_GENERATION, 1))[0]!;
    const three = rowsFor(write(OperationType.IMAGE_GENERATION, 3))[0]!;
    expect(three.cost_usd_measured).toBeCloseTo(one.cost_usd_measured! * 3, 10);
  });
});

describe('٢ · الصوتُ — مجهولٌ، و`null` لا صِفر', () => {
  it.each([
    ['text-to-speech', OperationType.TEXT_TO_SPEECH, 4096],
    ['voice-clone', OperationType.VOICE_CLONE, 1],
  ])('%s records null, basis UNKNOWN, and says why', (_name, operationType, units) => {
    const me = write(operationType, units);
    const [row] = rowsFor(me);

    // THE RULE: unknown is null. Never a number, and never a rate card.
    expect(row!.cost_usd_measured).toBeNull();
    expect(row!.cost_basis).toBe('UNKNOWN');
    expect(row!.cost_provider).toBeNull();
    expect(row!.cost_source!.length).toBeGreaterThan(30);
  });

  it('the speech row explains that the provider is ElevenLabs and unmeasured', () => {
    const [row] = rowsFor(write(OperationType.TEXT_TO_SPEECH, 100));
    expect(row!.cost_source).toMatch(/ElevenLabs/i);
    expect(row!.cost_source).toMatch(/per character/i);
    expect(row!.cost_source).toMatch(/UNKNOWN/);
  });

  it('and the legacy column holds zero — which is never a cost, because the basis says so', () => {
    const [row] = rowsFor(write(OperationType.TEXT_TO_SPEECH, 100));
    // The column is NOT NULL and cannot hold a null; the basis beside it is
    // what stops the zero from ever being read as «this was free».
    expect(row!.cost_usd_estimate).toBe(0);
    expect(row!.cost_basis).toBe('UNKNOWN');
  });

  it('the character count is still recorded, so a per-character price needs no new data', () => {
    const [row] = rowsFor(write(OperationType.TEXT_TO_SPEECH, 1234));
    expect(row!.units).toBe(1234);
  });
});

describe('٣ · والثلاثُ حالاتٍ لا تَختلِط', () => {
  it('the resolver answers one of exactly three states, and names a source every time', () => {
    for (const [operationType, units] of [
      [OperationType.IMAGE_GENERATION, 1],
      [OperationType.TEXT_TO_SPEECH, 500],
      [OperationType.VOICE_CLONE, 1],
    ] as const) {
      const cost = resolveProviderCost(operationType, units);
      expect(['MEASURED', 'ESTIMATED', 'UNKNOWN']).toContain(cost.basis);
      expect(cost.source.length).toBeGreaterThan(20);
      // A measured cost has a number and a provider; an unknown has neither.
      if (cost.basis === 'UNKNOWN') {
        expect(cost.usd).toBeNull();
        expect(cost.provider).toBeNull();
      } else {
        expect(typeof cost.usd).toBe('number');
        expect(cost.provider).not.toBeNull();
      }
    }
  });
});

describe('٤ · ولا جدولَ أسعارِ مزوِّدٍ آخرَ يُقرأ من طريقٍ حيّ', () => {
  const ROADS = [
    'app/api/qiyamah/generate/route.ts',
    'app/api/vault/assets/generate-speech/route.ts',
    'app/api/vault/assets/generate-cloned-speech/route.ts',
    'app/api/vault/assets/clone-voice/route.ts',
  ];

  it.each(ROADS)('%s no longer calls the superseded estimator', (file) => {
    const source = read(file);
    for (const dead of ['estimateImageGenerationCost', 'estimateTtsCost', 'estimateVoiceCloneCost']) {
      expect({ file, dead, present: source.includes(dead) }).toEqual({ file, dead, present: false });
    }
  });

  it('nothing in the repository reads the rate card either', () => {
    const repo = read('src/persistent-storage/consumption-repository.ts');
    expect(repo).toContain('resolveProviderCost(');
    expect(repo).not.toContain('cost-estimator');
  });

  it('and the cost basis authority imports no rate card at all', () => {
    const authority = read('src/consumption-ledger/provider-cost-basis.ts');
    // It reaches the measured truth and nothing else.
    expect(authority).toContain("from '../economy/cost-engine/qiyamah-cost-truth'");
    expect(authority).not.toMatch(/from '.*cost-estimator'/);
    expect(authority).not.toMatch(/from '.*provider-cost-catalog'/);
  });

  it('the superseded file is kept, and says so at the top', () => {
    // Deleting it would make every pre-2026-11-02 row unexplainable.
    const estimator = read('src/consumption-ledger/cost-estimator.ts');
    expect(estimator).toContain('SUPERSEDED');
    expect(estimator).toContain('NOT A COST AUTHORITY');
    expect(estimator).toContain('export function getCurrentMonthKey');
  });
});

describe('٥ · ولا يَمَسُّ هذا رصيدًا ولا سعرًا', () => {
  it('the cost basis authority is read by the record and by nobody else', () => {
    const { execSync } = require('child_process') as typeof import('child_process');
    const hits = (execSync(
      'git grep -lE "(from|require\\()[^\\"]*provider-cost-basis" -- "*.ts" || true',
      { encoding: 'utf8', cwd: process.cwd() },
    ) as string)
      .split('\n').map((l) => l.trim())
      .filter((l) => l.length > 0 && !l.includes('__tests__'));

    // One writer. Not the gate, not a price, not a balance.
    expect(hits).toEqual(['src/persistent-storage/consumption-repository.ts']);
  });

  it('and writing a record moves no units', () => {
    const me = write(OperationType.IMAGE_GENERATION, 1);
    const ledger = getDb()
      .prepare('SELECT COUNT(*) AS n FROM credit_ledger WHERE creator_id = ?')
      .get(me) as { n: number };
    expect(ledger.n).toBe(0);
  });
});
