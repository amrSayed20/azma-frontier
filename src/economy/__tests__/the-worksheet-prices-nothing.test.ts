/**
 * AZMA OS — THE COST WORKSHEET IS DOCUMENTATION, 2026-10-11.
 *
 * §4 is unambiguous: the existing 100% markup is unchanged, the 60% and 75%
 * uplifts are COMPARISON SCENARIOS and neither is approved or applied, and no
 * provider cost is invented.
 *
 * Three rates are now provider-DOCUMENTED. These tests hold the distinction
 * that matters most: a documented rate is the provider's published promise,
 * and a MEASURED charge is what a real job actually took. Only the second may
 * ever open a paid door.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  CREATIVE_COST_WORKSHEET, costRowFor, costIsMeasured, worksheetGaps, scenarios,
  PROPOSED_UPLIFT_A, PROPOSED_UPLIFT_B, EXISTING_OPERATION_MARKUP,
  UPLIFT_STATUS, RATE_TABLE_SOURCE, ACCOUNT_ENTITLEMENT, REFERENCE_JOB,
  SELECTED_UPLIFT_DIRECTION, COMPARISON_UPLIFT, UPLIFT_PURPOSE,
} from '../cost-engine/creative-operations-cost-worksheet';
import {
  CREATIVE_READINESS, TALKING_PHOTO_GENERATION_MODE, LIP_SYNC_GENERATION_MODE,
} from '../../core/sovereign-ai-integration/adapters/magic-hour-creative-operations';

const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');
const FOUR = ['background-removal', 'lip-sync', 'face-swap', 'talking-photo'] as const;

describe('1 · every figure names its source', () => {
  it('all four operations have a row, and face swap has both variants', () => {
    expect(CREATIVE_COST_WORKSHEET).toHaveLength(5);
    for (const op of FOUR) expect(costRowFor(op).operation).toBe(op);
    expect(costRowFor('face-swap', 'photo').endpoint).toBe('/v1/face-swap-photo');
    expect(costRowFor('face-swap', 'video').endpoint).toBe('/v1/face-swap');
  });

  it('every documented rate carries one named, dated source', () => {
    expect(RATE_TABLE_SOURCE.url).toMatch(/^https:\/\/docs\.magichour\.ai\//);
    expect(RATE_TABLE_SOURCE.retrievedOn).toBe('2026-10-11');
    for (const r of CREATIVE_COST_WORKSHEET) {
      if (r.providerEvidence === 'provider-documented') {
        expect(r.providerRate).not.toBeNull();
        expect(r.providerRateText.length).toBeGreaterThan(0);
      }
    }
  });

  it('a rate never travels without its billing variables', () => {
    for (const r of CREATIVE_COST_WORKSHEET) {
      expect(r.billingVariables.length).toBeGreaterThan(0);
      expect(r.finalChargeRetrieval).toMatch(/credits_charged/);
      expect(r.failureBilling.length).toBeGreaterThan(0);
    }
  });

  it('the operating cost is absent and SAID to be absent, never treated as zero', () => {
    for (const r of CREATIVE_COST_WORKSHEET) {
      expect(r.operatingCostKnown).toBe(false);
      expect(r.operatingComponents.length).toBeGreaterThan(0);
    }
    for (const s of scenarios()) {
      expect(s.operatingEgp).toBeNull();
      expect(s.caveat).toMatch(/operating cost is unmeasured/i);
      expect(s.caveat).toMatch(/overstated/i);
    }
  });
});

describe('2 · DOCUMENTED is not MEASURED, and only MEASURED may open a door', () => {
  it('not one rate is measured from a real charge', () => {
    for (const r of CREATIVE_COST_WORKSHEET) {
      expect(r.providerEvidence).not.toBe('measured-from-a-real-charge');
    }
    for (const op of FOUR) expect(costIsMeasured(op)).toBe(false);
  });

  it('the catalog gate still reads the readiness record, and it is still shut', () => {
    for (const op of FOUR) {
      const r = CREATIVE_READINESS.find((x) => x.operation === op)!;
      expect(r.costBasisVerified).toBe(false);
      expect(r.productionProven).toBe(false);
    }
  });

  it('every row says what is missing, and a paid job is on each list', () => {
    for (const g of worksheetGaps()) {
      expect(g.missing.length).toBeGreaterThan(0);
      expect(g.missing.join(' ')).toMatch(/paid job|acknowledgment|ruling/i);
    }
  });

  it('the lip-sync correction is recorded, not quietly dropped', () => {
    // A remembered «~150 credits for 5 seconds» appeared in the previous
    // revision as a LEAD. The documented rate is 1 credit/frame — 120 at 24fps
    // for five seconds. The remembered figure was wrong, and the record says so.
    const src = read('src/economy/cost-engine/creative-operations-cost-worksheet.ts');
    expect(src).toMatch(/THE REMEMBERED NUMBER WAS WRONG/);
    expect(costRowFor('lip-sync').providerRate).toBe(1);
    expect(costRowFor('lip-sync').unit).toBe('per-frame');
  });

  it('and the fps lever is recorded, because it IS the cost for lip sync', () => {
    expect(costRowFor('lip-sync').billingVariables.join(' ')).toMatch(/max_fps_limit/);
  });
});

describe('3 · the two uplifts are scenarios, and neither is applied', () => {
  it('both are recorded as the directive named them', () => {
    expect(PROPOSED_UPLIFT_A).toBe(0.60);
    expect(PROPOSED_UPLIFT_B).toBe(0.75);
    expect(EXISTING_OPERATION_MARKUP).toBe(1.00);
    expect(UPLIFT_STATUS).toMatch(/COMPARISON SCENARIO/);
    expect(UPLIFT_STATUS).toMatch(/neither is applied/);
  });

  it('both scenarios are computed side by side on one reference job', () => {
    expect(REFERENCE_JOB.fps).toBe(24);
    for (const s of scenarios()) {
      if (s.providerCredits === null) continue;
      expect(s.creatorPriceAt60Egp).not.toBeNull();
      expect(s.creatorPriceAt75Egp).not.toBeNull();
      // 75% must exceed 60% — a scenario table that does not order is useless.
      expect(s.creatorPriceAt75Egp!).toBeGreaterThan(s.creatorPriceAt60Egp!);
    }
  });

  it('the arithmetic is exactly basis × 1.60 and basis × 1.75', () => {
    for (const s of scenarios()) {
      if (s.totalCostBasisEgp === null) continue;
      expect(s.creatorPriceAt60Egp!).toBeCloseTo(s.totalCostBasisEgp * 1.60, 2);
      expect(s.creatorPriceAt75Egp!).toBeCloseTo(s.totalCostBasisEgp * 1.75, 2);
    }
  });

  it('the basis is the provider charge ALONE, and that is disclosed', () => {
    for (const s of scenarios()) {
      if (s.totalCostBasisEgp === null) continue;
      expect(s.totalCostBasisEgp).toBe(s.providerEgp);
      expect(s.caveat).toMatch(/PROVIDER CHARGE ALONE/);
    }
  });
});

describe('4 · no pricing authority reads it', () => {
  it('the estimator, the Balance and the provider catalog all ignore it', () => {
    for (const f of [
      'app/api/sovereign/economy/estimate/route.ts',
      'src/economy/pricing/sovereign-value-balance.ts',
      'src/economy/cost-engine/provider-cost-catalog.ts',
    ]) {
      expect(read(f)).not.toMatch(/creative-operations-cost-worksheet/);
    }
  });

  it('nothing outside the economy folder and its tests imports it', () => {
    const { execSync } = require('child_process');
    const out = execSync('git grep -l "creative-operations-cost-worksheet" || true',
      { encoding: 'utf8', cwd: process.cwd() }) as string;
    const foreign = out.split('\n').map((l) => l.trim()).filter((l) =>
      l.length > 0
      && l !== 'src/economy/cost-engine/creative-operations-cost-worksheet.ts'
      && !l.startsWith('src/economy/__tests__/'));
    expect(foreign).toEqual([]);
  });

  it('the 75% uplift exists ONLY as a comparison, never as a markup constant', () => {
    const { execSync } = require('child_process');
    // This file is excluded: it names the forbidden symbol in order to forbid
    // it, and an instrument that counts its own words is measuring itself.
    const hits = (execSync('git grep -n "UNIFIED_MARKUP" || true',
      { encoding: 'utf8', cwd: process.cwd() }) as string)
      .split('\n')
      .filter((l) => l.trim().length > 0
        && !l.startsWith('src/economy/__tests__/the-worksheet-prices-nothing.test.ts'));
    expect(hits).toEqual([]);
  });
});

describe('5 · the financial constitution is untouched', () => {
  const BALANCE = read('src/economy/pricing/sovereign-value-balance.ts');

  it('the six existing steps keep the charge they already carried', () => {
    for (const [capability, units] of [
      ['IMAGE_GENERATION', 200], ['INFOGRAPHIC', 200], ['IMAGE_EDIT', 200],
      ['UPSCALE_2X', 50], ['VIDEO_GENERATION', 200], ['MOTION', 200],
    ] as const) {
      expect(BALANCE).toContain(`capability: '${capability}', balancePerUnit: ${units}`);
    }
  });

  it('the new steps are in NEITHER the estimator nor the consumption table', () => {
    const ESTIMATE = read('app/api/sovereign/economy/estimate/route.ts');
    for (const step of ['BACKGROUND_REMOVAL', 'TALKING_PHOTO', 'LIP_SYNC', 'FACE_SWAP']) {
      expect(ESTIMATE).not.toContain(step);
      expect(BALANCE).not.toContain(step);
    }
  });

  it('so an unpriced step cannot be quoted at all — by construction', () => {
    expect(read('app/api/sovereign/economy/estimate/route.ts'))
      .toContain("{ error: 'invalid_step', valid: Object.keys(CHAMBER_STEPS) }");
  });
});

describe('6 · the account entitlement is recorded as read, with its limits', () => {
  it('it names the endpoint, the date and the status it was read at', () => {
    expect(ACCOUNT_ENTITLEMENT.endpoint).toContain('/v1/account');
    expect(ACCOUNT_ENTITLEMENT.httpStatus).toBe(200);
    expect(ACCOUNT_ENTITLEMENT.observedOn).toBe('2026-10-11');
    expect(ACCOUNT_ENTITLEMENT.subscriptionActive).toBe(true);
  });

  it('and it states what it does NOT prove', () => {
    expect(ACCOUNT_ENTITLEMENT.whatItDoesNotProve).toMatch(/per-endpoint/i);
    expect(ACCOUNT_ENTITLEMENT.whatItDoesNotProve).toMatch(/no completed paid job/i);
  });

  it('it carries no credential and no account secret', () => {
    const src = read('src/economy/cost-engine/creative-operations-cost-worksheet.ts');
    expect(src).not.toMatch(/Bearer |sk-|[0-9a-f]{32}/);
  });
});

describe('7 · the basis is the rate of the configuration we ACTUALLY send', () => {
  it('talking photo is priced at the realistic rate, because realistic is what we send', () => {
    // It was priced at 20 — the `prompted` rate — while the adapter sent no
    // mode at all and therefore got `realistic` at 48. The worksheet and the
    // request body are bound together here so they cannot diverge again.
    expect(TALKING_PHOTO_GENERATION_MODE).toBe('realistic');
    expect(costRowFor('talking-photo').providerRate).toBe(48);
  });

  it('lip sync is priced at the lite rate, because lite is what we send', () => {
    expect(LIP_SYNC_GENERATION_MODE).toBe('lite');
    expect(costRowFor('lip-sync').providerRate).toBe(1);
  });

  it('and the cheaper talking-photo mode is excluded for a reason, not by oversight', () => {
    expect(costRowFor('talking-photo').providerRateText).toMatch(/requires a text prompt/);
  });
});

describe('8 · the Architect’s direction is named, and still applied by nothing', () => {
  it('75% is the selected direction and 60% is the comparison', () => {
    expect(SELECTED_UPLIFT_DIRECTION).toBe(0.75);
    expect(COMPARISON_UPLIFT).toBe(0.60);
  });

  it('the status says it multiplies a VERIFIED basis, which no operation has', () => {
    expect(UPLIFT_STATUS).toMatch(/VERIFIED total cost basis/);
    for (const op of FOUR) expect(costIsMeasured(op)).toBe(false);
  });

  it('the uplift is recorded as covering operating cost, never as profit', () => {
    expect(UPLIFT_PURPOSE).toMatch(/NOT net profit/);
  });
});
