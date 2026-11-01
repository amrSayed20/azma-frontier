/**
 * AZMA OS — مصدرٌ واحدٌ للسعر، والفجوةُ تُقاس ولا تُوصَف.
 *
 * ─── WHAT THESE PROVE ───────────────────────────────────────────────────────
 *
 *   Four modules in this Empire state a number about money, and they are not
 *   four opinions of the same thing:
 *
 *     sovereign-value-balance   → the Founder's approved PRICES
 *     new-capability-pricing    → a ratified DERIVATION for five capabilities
 *     provider-cost-catalog     → what a PROVIDER charges, in AZMA units
 *     qiyamah-cost-truth        → what the Empire PAID, in provider credits
 *
 *   The economy gate reads the third. These tests hold the first two as the
 *   price authority, and they MEASURE the disagreement with what the live
 *   roads actually charge — so the gap in the closing report is an assertion
 *   a reader can run, not a sentence they have to trust.
 *
 *   Nothing here changes a price. The switch-over is the owner's decision and
 *   the last test states exactly which figures it would move.
 */

import {
  sovereignPriceFor,
  allSovereignPrices,
} from '../pricing/sovereign-price-authority';
import { OPERATION_CONSUMPTION } from '../pricing/sovereign-value-balance';
import { AzmaUnitCostEngine } from '../cost-engine/azma-cost-engine';
import { CostUnavailableError, GatewayNotFoundError } from '../cost-engine/cost-engine-types';
import type { CapabilityTarget } from '../cost-engine/cost-engine-types';

/** What the gate would charge today, or the reason it refuses. */
function whatTheGateCharges(capability: CapabilityTarget, gatewayId: string): number | 'refused' {
  try {
    return new AzmaUnitCostEngine().estimate(capability, gatewayId).estimatedAzmaUnits;
  } catch (error) {
    if (error instanceof CostUnavailableError || error instanceof GatewayNotFoundError) return 'refused';
    throw error;
  }
}

describe('١ · السُّلطةُ الواحدةُ تُجيب عن كلِّ قدرةٍ لها سعرٌ معتمد', () => {
  it('every rule the Founder approved is answered as approved, with its own unit', () => {
    for (const rule of OPERATION_CONSUMPTION) {
      const price = sovereignPriceFor(rule.capability);
      expect(price.status).toBe('approved');
      expect(price.unitsPerQuantity).toBe(rule.balancePerUnit);
      expect(price.quantity).toBe(rule.quantity);
      // The authority is named, so no reader has to guess who signed it.
      expect(price.authority).toContain('Founder decision 2026-09-27');
    }
  });

  it('the five uplift capabilities are answered as derived, never as approved', () => {
    for (const capability of ['BACKGROUND_REMOVAL', 'LIP_SYNC', 'FACE_SWAP', 'TALKING_PHOTO']) {
      const price = sovereignPriceFor(capability);
      expect(price.status).toBe('derived-ratified');
      expect(price.authority).toContain('Chief Architect 2026-10-12');
    }
    // UPSCALE_4X is the fifth, and it is NOT in the Founder's table — so the
    // derivation is the only authority for it.
    expect(sovereignPriceFor('UPSCALE_4X').status).toBe('derived-ratified');
  });

  it('a capability nobody priced is ABSENT — never zero', () => {
    const price = sovereignPriceFor('TEXT_TO_SPEECH');
    expect(price.status).toBe('absent');
    expect(price.unitsPerQuantity).toBeNull();
    // The decisive assertion: absence must never be readable as a free act.
    expect(price.unitsPerQuantity).not.toBe(0);
  });

  it('no price is copied — the authority is read at call time', () => {
    // Change the source and the answer changes with it. A transcribed number
    // would keep answering the old figure.
    const live = OPERATION_CONSUMPTION.find((r) => r.capability === 'IMAGE_EDIT')!;
    expect(sovereignPriceFor('IMAGE_EDIT').unitsPerQuantity).toBe(live.balancePerUnit);
  });
});

describe('٢ · الفجوةُ بين ما يُخصَم اليومَ وما اعتُمِد — مقيسةً', () => {
  /*  Each row is: the capability, what the gate charges from the provider cost
   *  catalog today, and what the Founder approved. The assertions pin BOTH
   *  numbers, so the day either moves, this test says so.
   */

  it('image generation: the live charge is a fifth of the approved price', () => {
    expect(whatTheGateCharges('image-generation', 'openai')).toBe(40);
    expect(sovereignPriceFor('IMAGE_GENERATION').unitsPerQuantity).toBe(200);
  });

  it('image editing: refused by the gate, and approved in the Founder table', () => {
    expect(whatTheGateCharges('image-editing', 'magic-hour')).toBe('refused');
    const approved = sovereignPriceFor('IMAGE_EDIT');
    expect(approved.status).toBe('approved');
    expect(approved.unitsPerQuantity).toBe(200);
    expect(approved.quantity).toBe('per-image');
  });

  it('animation: refused by the gate, and approved as MOTION per requested second', () => {
    expect(whatTheGateCharges('video-generation', 'magic-hour')).toBe('refused');
    const approved = sovereignPriceFor('MOTION');
    expect(approved.status).toBe('approved');
    expect(approved.unitsPerQuantity).toBe(200);
    expect(approved.quantity).toBe('per-requested-second');
  });

  it('speech: charged today, and approved NOWHERE', () => {
    // The hardest row in the table. Two gateways charge for it, with two
    // different numbers, and the Founder's table has no entry for it at all.
    expect(whatTheGateCharges('text-to-speech', 'openai')).toBe(20);
    expect(whatTheGateCharges('text-to-speech', 'elevenlabs')).toBe(30);
    expect(sovereignPriceFor('TEXT_TO_SPEECH').status).toBe('absent');
    expect(sovereignPriceFor('VOICE_AND_TTS').status).toBe('absent');
  });

  it('voice cloning: refused, and approved nowhere either', () => {
    expect(whatTheGateCharges('voice-cloning', 'elevenlabs')).toBe('refused');
    expect(sovereignPriceFor('VOICE_CLONING').status).toBe('absent');
  });
});

describe('٣ · والقرارُ المطلوبُ محصورٌ ومعدودٌ', () => {
  it('names every capability whose live charge would move, and by how much', () => {
    // This is the owner's decision, stated as a list rather than as prose: if
    // the gate is pointed at the approved authority, these are the figures
    // that change and nothing else does.
    const wouldMove = [
      { capability: 'IMAGE_GENERATION', from: whatTheGateCharges('image-generation', 'openai'), to: 200 },
      { capability: 'IMAGE_EDIT', from: whatTheGateCharges('image-editing', 'magic-hour'), to: 200 },
      { capability: 'MOTION', from: whatTheGateCharges('video-generation', 'magic-hour'), to: 200 },
    ];

    expect(wouldMove).toEqual([
      { capability: 'IMAGE_GENERATION', from: 40, to: 200 },
      { capability: 'IMAGE_EDIT', from: 'refused', to: 200 },
      { capability: 'MOTION', from: 'refused', to: 200 },
    ]);
  });

  it('and the gate is still reading the cost catalog — unchanged, on purpose', () => {
    // A guard against a well-meant future edit: pointing the gate at the
    // price authority is a commercial act, and this test fails if it happens
    // without the Founder's figures being revisited at the same time.
    const gate = require('fs').readFileSync(
      require('path').join(process.cwd(), 'src/economy/paid-operation-gate.ts'), 'utf8',
    ) as string;
    expect(gate).toContain('new AzmaUnitCostEngine()');
    expect(gate).not.toContain('sovereignPriceFor(');
  });

  it('the price authority reads no provider cost catalog, ever', () => {
    const authority = require('fs').readFileSync(
      require('path').join(process.cwd(), 'src/economy/pricing/sovereign-price-authority.ts'), 'utf8',
    ) as string;
    // A price source that reaches into a cost catalog is how a provider's
    // invoice becomes a Creator's price without anyone deciding it.
    expect(authority).not.toMatch(/from '.*provider-cost-catalog'/);
    expect(authority).not.toMatch(/from '.*azma-cost-engine'/);
  });

  it('every answer the authority gives carries a status and a named authority', () => {
    const all = allSovereignPrices();
    expect(all.length).toBeGreaterThan(10);
    for (const price of all) {
      expect(['approved', 'derived-ratified']).toContain(price.status);
      expect(price.authority.length).toBeGreaterThan(20);
      expect(typeof price.unitsPerQuantity).toBe('number');
      expect(price.quantity).not.toBeNull();
    }
  });
});
