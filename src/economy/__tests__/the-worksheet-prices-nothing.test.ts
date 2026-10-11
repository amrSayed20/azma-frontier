/**
 * AZMA OS — THE COST WORKSHEET IS DOCUMENTATION, 2026-10-11.
 *
 * §7 is unambiguous: the existing 100% markup is unchanged, the proposed 60%
 * uplift is a proposal and not an instruction to charge anybody, the 75%
 * unified markup is not implemented, and no provider cost is invented.
 *
 * These tests hold the worksheet to that, and hold the financial constitution
 * to being untouched.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  CREATIVE_COST_WORKSHEET, costRowFor, canPrice, worksheetGaps,
  PROPOSED_NEW_OPERATION_UPLIFT_PERCENT, EXISTING_OPERATION_MARKUP_PERCENT,
} from '../cost-engine/creative-operations-cost-worksheet';

const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');
const FOUR = ['background-removal', 'lip-sync', 'face-swap', 'talking-photo'] as const;

describe('1 · every row separates what is known from what is not', () => {
  it('all four operations have a row', () => {
    expect(CREATIVE_COST_WORKSHEET).toHaveLength(4);
    for (const op of FOUR) expect(costRowFor(op).operation).toBe(op);
  });

  it('NOT ONE invents a provider cost', () => {
    for (const r of CREATIVE_COST_WORKSHEET) {
      expect(r.providerCreditCost).toBeNull();
      expect(r.providerEvidence).toBe('unknown');
    }
  });

  it('a lead remembered is NOT recorded as evidence', () => {
    // Lip sync carries a remembered figure in prose and `unknown` in the field.
    const lip = costRowFor('lip-sync');
    expect(lip.providerNote).toMatch(/150/);
    expect(lip.providerEvidence).toBe('unknown');
    expect(lip.providerCreditCost).toBeNull();
  });

  it('an unknown input yields an unknown price — never a multiplied guess', () => {
    for (const r of CREATIVE_COST_WORKSHEET) {
      expect(r.creatorFacingBalanceUnits).toBeNull();
      expect(r.creatorFacingStatus).toMatch(/UNKNOWN/);
      expect(canPrice(r.operation)).toBe(false);
    }
  });

  it('the operating cost is unknown by construction, as it is everywhere else', () => {
    for (const r of CREATIVE_COST_WORKSHEET) expect(r.operatingCostKnown).toBe(false);
  });

  it('every row says what is missing before it could price anything', () => {
    for (const g of worksheetGaps()) {
      expect(g.missing.length).toBeGreaterThan(0);
      for (const m of g.missing) expect(typeof m).toBe('string');
    }
  });

  it('face swap names its policy blocker BEFORE any cost work', () => {
    expect(costRowFor('face-swap').whatIsMissing[0]).toMatch(/likeness and consent policy/i);
  });
});

describe('2 · the uplift is a proposal, and nothing multiplies by it', () => {
  it('it is recorded as the directive named it', () => {
    expect(PROPOSED_NEW_OPERATION_UPLIFT_PERCENT).toBe(60);
    expect(EXISTING_OPERATION_MARKUP_PERCENT).toBe(100);
  });

  it('every row labels it a proposal, not an approval', () => {
    for (const r of CREATIVE_COST_WORKSHEET) {
      expect(r.proposedUpliftPercent).toBe(60);
      expect(r.proposedUpliftStatus).toMatch(/PROPOSAL/);
      expect(r.proposedUpliftStatus).toMatch(/not applied/);
    }
  });

  it('the 75% unified markup is not implemented anywhere', () => {
    // The header RECORDS the prohibition by name, which is the point. So the
    // assertion is on CODE — a grep that cannot tell a prohibition from an
    // implementation would forbid writing the prohibition down.
    const src = read('src/economy/cost-engine/creative-operations-cost-worksheet.ts');
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    expect(code).not.toMatch(/\b75\b/);
    // And nowhere else either.
    const { execSync } = require('child_process');
    const hits = execSync('git grep -n "UNIFIED_MARKUP\\|unifiedMarkup" || true',
      { encoding: 'utf8', cwd: process.cwd() }) as string;
    expect(hits.trim()).toBe('');
  });

  it('the worksheet performs no arithmetic on the uplift', () => {
    const src = read('src/economy/cost-engine/creative-operations-cost-worksheet.ts');
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    // No multiplication, no division, no percentage applied to anything.
    expect(code).not.toMatch(/\*\s*\(?\s*1\s*\+/);
    expect(code).not.toMatch(/\/\s*100/);
    expect(code).not.toMatch(/UpliftPercent\s*[*/]/);
  });
});

describe('3 · no pricing authority reads it', () => {
  it('the estimator does not import it', () => {
    expect(read('app/api/sovereign/economy/estimate/route.ts'))
      .not.toMatch(/creative-operations-cost-worksheet/);
  });

  it('the Sovereign Value Balance does not import it', () => {
    expect(read('src/economy/pricing/sovereign-value-balance.ts'))
      .not.toMatch(/creative-operations-cost-worksheet/);
  });

  it('the provider cost catalog does not import it', () => {
    expect(read('src/economy/cost-engine/provider-cost-catalog.ts'))
      .not.toMatch(/creative-operations-cost-worksheet/);
  });

  it('nothing outside the economy folder and its tests imports it', () => {
    const { execSync } = require('child_process');
    const out = execSync(
      'git grep -l "creative-operations-cost-worksheet" || true',
      { encoding: 'utf8', cwd: process.cwd() },
    ) as string;
    const foreign = out.split('\n').map((l) => l.trim()).filter((l) =>
      l.length > 0
      && l !== 'src/economy/cost-engine/creative-operations-cost-worksheet.ts'
      && !l.startsWith('src/economy/__tests__/'));
    expect(foreign).toEqual([]);
  });
});

describe('4 · the financial constitution is untouched', () => {
  const BALANCE = read('src/economy/pricing/sovereign-value-balance.ts');

  it('the six existing steps keep the charge they already carried', () => {
    for (const [capability, units] of [
      ['IMAGE_GENERATION', 200], ['INFOGRAPHIC', 200], ['IMAGE_EDIT', 200],
      ['UPSCALE_2X', 50], ['VIDEO_GENERATION', 200], ['MOTION', 200],
    ] as const) {
      expect(BALANCE).toContain(`capability: '${capability}', balancePerUnit: ${units}`);
    }
  });

  it('the four new steps are NOT registered with the estimator', () => {
    const ESTIMATE = read('app/api/sovereign/economy/estimate/route.ts');
    for (const step of ['BACKGROUND_REMOVAL', 'TALKING_PHOTO', 'LIP_SYNC', 'FACE_SWAP']) {
      expect(ESTIMATE).not.toContain(step);
    }
  });

  it('and they are NOT in the consumption table either', () => {
    for (const step of ['BACKGROUND_REMOVAL', 'TALKING_PHOTO', 'LIP_SYNC', 'FACE_SWAP']) {
      expect(BALANCE).not.toContain(step);
    }
  });

  it('so an unpriced step cannot be quoted at all — by construction', () => {
    // The estimator refuses a step it does not hold, which is why a card for
    // an uncosted operation can show no price: there is none to show.
    expect(read('app/api/sovereign/economy/estimate/route.ts'))
      .toContain("{ error: 'invalid_step', valid: Object.keys(CHAMBER_STEPS) }");
  });
});
