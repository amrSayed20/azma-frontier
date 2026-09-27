/**
 * AZMA OS — the Founder's final model allocation, and what it costs.
 *
 * ─── THE TWO THINGS THAT MUST STAY TRUE TOGETHER ────────────────────────────
 *
 *   The catalog says an image costs 100 credits. That is only true while
 *   images actually resolve to the model that charged 100. For two days they
 *   did not: Nano Banana 2 had been designated on 2026-09-25, yet the
 *   reference image of 2026-09-27 resolved to Nano Banana Pro at 150, because
 *   an unverified `qualityTier: 'standard'` excluded the designated model from
 *   six of the Chamber's fourteen styles.
 *
 *   So these guards hold the allocation and the costs in one file. A cost
 *   catalog that drifts from the allocation it describes is not a cost truth,
 *   it is a decorated guess.
 */

import {
  CREDIT_ACQUISITION, CREDIT_USD, CREDIT_EGP, FX,
  QIYAMAH_COST_TRUTH, costTruthFor, resolveCost,
} from '../cost-engine/qiyamah-cost-truth';
import { IMAGE_MODEL_FLEET } from '@/src/sovereign-model-selection/image-model-fleet';
import { VIDEO_MODEL_FLEET, QIYAMAH_VIDEO_GENERATION_MODEL } from '@/src/sovereign-model-selection/video-model-fleet';
import { getProductionSelector, resetProductionRegistryForTests } from '@/src/sovereign-model-selection';
import { buildImageCreationIntent, buildVideoCreationIntent, buildAnimationIntent } from '@/src/sovereign-model-selection/intent-builder';

const near = (a: number, b: number, tol = 5e-5) => expect(Math.abs(a - b)).toBeLessThan(tol);

beforeEach(() => resetProductionRegistryForTests());

describe('1 · the final allocation, one model per capability', () => {
  it('images: nano-banana-2, and nothing else is authorized', () => {
    expect(IMAGE_MODEL_FLEET.filter((m) => m.productionAuthorized && m.active).map((m) => m.modelId))
      .toEqual(['nano-banana-2']);
  });

  it('video: minimax-h3 is the declared allocation', () => {
    expect(QIYAMAH_VIDEO_GENERATION_MODEL).toBe('minimax-h3');
    const h = VIDEO_MODEL_FLEET.find((m) => m.modelId === 'minimax-h3')!;
    expect([h.productionAuthorized, h.active]).toEqual([true, true]);
  });

  it('motion: veo-3-1, and it is the only model the Chamber can offer for it', () => {
    const motion = VIDEO_MODEL_FLEET
      .filter((m) => m.productionAuthorized && m.active && m.supportsImageToVideo === true)
      .map((m) => m.modelId);
    expect(motion).toEqual(['veo-3-1']);
  });

  it('seedance and nano-banana-pro are RETIRED — disabled, never deleted', () => {
    for (const id of ['seedance-2-0', 'nano-banana-pro']) {
      const m = [...IMAGE_MODEL_FLEET, ...VIDEO_MODEL_FLEET].find((x) => x.modelId === id);
      expect(m).toBeDefined();                       // the binding still exists
      expect(m!.productionAuthorized).toBe(false);
      expect(m!.active).toBe(false);
      expect(m!.providerModelId).toBeTruthy();       // its wire identity is kept
    }
  });
});

describe('2 · the allocation actually resolves — not merely declared', () => {
  it('EVERY style the Chamber offers reaches the one image model', () => {
    // The exact defect of 2026-09-25: a designation six styles never reached.
    const CHAMBER_STYLES = [
      'cinematic', 'realistic', 'advertising', 'documentary', 'creative', 'scifi',
      'animation', 'fantasy', 'portrait', 'fashion', 'architecture', 'historical',
      'abstract', 'infographic',
    ];
    for (const style of CHAMBER_STYLES) {
      const out = getProductionSelector().select(buildImageCreationIntent('a still life', style));
      expect(out.selected).toBe(true);
      if (out.selected) expect(out.selection.modelId).toBe('nano-banana-2');
    }
  });

  it('a video intent that requires the allocation resolves to it, for every style', () => {
    for (const style of ['cinematic', 'advertising', 'documentary', 'abstract']) {
      const out = getProductionSelector().select({
        ...buildVideoCreationIntent('a slow reveal', style, 6),
        requiredModelId: QIYAMAH_VIDEO_GENERATION_MODEL,
      });
      expect(out.selected).toBe(true);
      if (out.selected) expect(out.selection.modelId).toBe('minimax-h3');
    }
  });

  it('motion resolves to Veo, and a retired model named for motion is refused', () => {
    const veo = getProductionSelector().select(buildAnimationIntent('slow push in', 'veo-3-1', 4));
    expect(veo.selected).toBe(true);
    const dead = getProductionSelector().select(buildAnimationIntent('slow push in', 'seedance-2-0', 4));
    expect(dead.selected).toBe(false);
    if (!dead.selected) expect(dead.reason).toBe('required-model-unavailable');
  });

  it('a retired model cannot be resurrected by naming it on any path', () => {
    for (const id of ['seedance-2-0', 'nano-banana-pro']) {
      const out = getProductionSelector().select({
        ...buildVideoCreationIntent('anything', 'cinematic', 6), requiredModelId: id,
      });
      expect(out.selected).toBe(false);
    }
  });
});

describe('3 · the acquisition basis is what AZMA paid, not what anyone advertises', () => {
  it('$19 bought 14,000 credits', () => {
    expect(CREDIT_ACQUISITION.usdPaid).toBe(19);
    expect(CREDIT_ACQUISITION.creditsReceived).toBe(14_000);
  });

  it('the per-credit cost is derived from that purchase, never typed by hand', () => {
    near(CREDIT_USD, 0.001357142857, 1e-9);
    expect(CREDIT_USD).toBe(19 / 14_000);
  });

  it('it is NOT the customer unit value, which is nine times cheaper per credit', () => {
    // $20 / 144,000 is what a CUSTOMER's unit is worth. Using it as a cost
    // basis would understate what AZMA pays by roughly 9x.
    const customerUnitValue = 20 / 144_000;
    expect(CREDIT_USD).toBeGreaterThan(customerUnitValue * 8);
  });

  it('the exchange rate names its source and its date', () => {
    expect(FX.usdToEgp).toBe(51.83);
    expect(FX.rateDate).toBe('2026-09-27');
    expect(FX.source).toMatch(/Founder directive/);
    near(CREDIT_EGP, 0.0703407, 1e-6);
  });
});

describe('4 · every measured cost, in credits and in both currencies', () => {
  const cases: ReadonlyArray<readonly [string, number, number, number]> = [
    // capability                 credits      USD         EGP
    ['IMAGE_GENERATION',              100,  0.135714,   7.03407],
    ['INFOGRAPHIC',                   100,  0.135714,   7.03407],
    ['IMAGE_EDIT',                    100,  0.135714,   7.03407],
    ['UPSCALE_2X',                     25,  0.033929,   1.75852],
    ['VIDEO_CREATION_STANDARD',        96,  0.130286,   6.75271],
    ['VEO_MOTION',                     96,  0.130286,   6.75271],
    ['VIDEO_CREATION_ACTUAL',          48,  0.065143,   3.37635],
  ];

  for (const [capability, credits, usd, egp] of cases) {
    it(`${capability}: ${credits} credits`, () => {
      const r = resolveCost(capability);
      expect(r.credits).toBe(credits);
      near(r.usd!, usd, 1e-5);
      near(r.egp!, egp, 1e-4);
    });
  }

  it('a 4-second Veo motion costs 384 credits ≈ 27.01 EGP', () => {
    const r = resolveCost('VEO_MOTION', 4);
    expect(r.credits).toBe(384);
    near(r.usd!, 0.521143, 1e-5);
    near(r.egp!, 27.01083, 1e-3);
  });

  it('a 6-second H3 video costs the 288 credits it was measured at', () => {
    const r = resolveCost('VIDEO_CREATION_ACTUAL', 6);
    expect(r.credits).toBe(288);
    near(r.egp!, 20.25813, 1e-3);
  });
});

describe('5 · the standard basis and the allocated model are NOT the same number', () => {
  it('the standard second is Veo’s 96, the allocated model charges 48', () => {
    expect(costTruthFor('VIDEO_CREATION_STANDARD')!.credits).toBe(96);
    expect(costTruthFor('VIDEO_CREATION_ACTUAL')!.credits).toBe(48);
    // Never averaged, never blended, never quietly replaced by one another.
    expect(costTruthFor('VIDEO_CREATION_STANDARD')!.basis).toBe('BASIS');
    expect(costTruthFor('VIDEO_CREATION_ACTUAL')!.basis).toBe('MEASURED');
  });

  it('the H3 rate is per REQUESTED second, and says so', () => {
    const e = costTruthFor('VIDEO_CREATION_ACTUAL')!;
    expect(e.unit).toContain('REQUESTED');
    // Because the file measured 6.583s while the provider reported 6.
    expect(e.note).toMatch(/6\.583/);
  });
});

describe('6 · Seedance history is kept, and can never become a current cost', () => {
  it('its 1008-credit measurement survives, marked HISTORICAL', () => {
    const e = costTruthFor('VIDEO_CREATION_SEEDANCE')!;
    expect(e.credits).toBe(1008);
    expect(e.basis).toBe('HISTORICAL');
    expect(e.measuredFrom).toContain('fc04dca1-9f4f-4388-86c7-e6c923f2ea99');
  });

  it('no HISTORICAL entry is ever a MEASURED current cost', () => {
    for (const e of QIYAMAH_COST_TRUTH) {
      if (e.basis === 'HISTORICAL') expect(e.note).toMatch(/NOT a current/i);
    }
  });
});

describe('7 · UNKNOWN stays UNKNOWN — nothing is estimated into existence', () => {
  it('every unmeasured cost carries null, not a number', () => {
    const unknowns = QIYAMAH_COST_TRUTH.filter((e) => e.basis === 'UNKNOWN');
    expect(unknowns.length).toBeGreaterThan(0);
    for (const e of unknowns) {
      expect(e.credits).toBeNull();
      expect(e.measuredFrom).toBeNull();
    }
  });

  it('resolving an UNKNOWN capability yields nulls, never zero', () => {
    for (const cap of ['STORAGE', 'BANDWIDTH', 'COMPUTE_CPU_GPU_SERVER', 'STORYBOARD']) {
      const r = resolveCost(cap);
      expect(r.credits).toBeNull();
      expect(r.usd).toBeNull();
      expect(r.egp).toBeNull();
      expect(r.basis).toBe('UNKNOWN');
    }
  });

  it('a capability that does not exist is UNKNOWN too, not zero', () => {
    expect(resolveCost('NOT_A_CAPABILITY')).toEqual({ credits: null, usd: null, egp: null, basis: 'UNKNOWN' });
  });

  it('the local silence remux carries NO provider charge and no invented one', () => {
    const e = costTruthFor('POST_PRODUCTION_SILENCE_REMUX')!;
    expect(e.credits).toBeNull();
    expect(e.provider).toBeNull();
    expect(e.note).toMatch(/NO provider charge/);
    expect(e.note).toMatch(/UNKNOWN, not zero/);
  });

  it('every entry that HAS a cost also names the production it was read from', () => {
    for (const e of QIYAMAH_COST_TRUTH) {
      if (e.credits !== null) expect(e.measuredFrom).toBeTruthy();
    }
  });
});

describe('8 · this is cost, and touches nothing that is price', () => {
  it('the module names no customer price, subscription, margin or AZMA Unit', () => {
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const src = require('fs').readFileSync(
      require('path').join(process.cwd(), 'src/economy/cost-engine/qiyamah-cost-truth.ts'), 'utf8')
      .replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/.*$/gm, '');
    for (const w of ['priceEgp', 'azmaUnits', 'subscription', 'margin', 'CREDIT_PACKS', 'profit']) {
      expect(src).not.toContain(w);
    }
  });
});
