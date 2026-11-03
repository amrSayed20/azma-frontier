/**
 * AZMA OS — الهويّةُ تُملَك مجّانًا، والكلامُ يُدفَع بأحرفِه.
 *
 * ─── THE RULING THESE HOLD ──────────────────────────────────────────────────
 *
 *   2026-11-03, decisions 1 and 2:
 *
 *     «إنشاء الهوية الصوتية المستنسخة مجاني للمبدع: 0 وحدة سيادية… يجب
 *     تمثيل هذه الحالة في بوابة الاقتصاد باعتبارها عملية مجانية مؤكدة، لا
 *     تكلفة مجهولة. لا يجوز أن يؤدي الصفر إلى رفض العملية باعتبارها غير
 *     مسعّرة. ولا يجوز فرض رسم اعتباطي على إنشاء الهوية.»
 *
 *     «يُحاسب توليد الكلام وفق الاستهلاك الفعلي للأحرف والتعريفة الفعلية
 *     للمزود. يُطبّق هامش المؤسس المعتمد: التكلفة الفعلية × 1.70.»
 *
 *   The hardest thing here is the ZERO. The Empire's oldest money rule is
 *   that a zero cost refuses, because a zero usually means nobody looked.
 *   These tests prove the exception is exactly one capability wide.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import {
  sovereignPriceFor,
  VOICE_IDENTITY_CAPABILITY,
  SPEECH_CAPABILITY,
} from '../pricing/sovereign-price-authority';
import {
  priceSpeech,
  SPEECH_COST_UNITS_PER_CHARACTER,
  SPEECH_UNITS_PER_CHARACTER,
  SPEECH_ROUNDING,
  VOICE_SUBSCRIPTION,
} from '../pricing/speech-pricing';
import { NEW_CAPABILITY_UPLIFT } from '../pricing/new-capability-pricing';

const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8');

describe('owning a voice is free', () => {
  it('answers a CONFIRMED free, which is a different thing from an absence', () => {
    const price = sovereignPriceFor(VOICE_IDENTITY_CAPABILITY);
    expect(price.status).toBe('free-confirmed');
    expect(price.unitsPerQuantity).toBe(0);
    // The distinction the whole ruling turns on: this zero names the published
    // term that produced it, where an absent price names no authority at all.
    expect(price.authority).toContain('elevenlabs.io/pricing');
    expect(sovereignPriceFor('A_CAPABILITY_NOBODY_PRICED').status).toBe('absent');
    expect(sovereignPriceFor('A_CAPABILITY_NOBODY_PRICED').unitsPerQuantity).toBeNull();
  });

  it('and the exception is exactly one capability wide', () => {
    // Nothing else in the Empire may reach `free-confirmed`. If a second act
    // is ever ruled free it must be written in, deliberately and visibly.
    const authority = read('src/economy/pricing/sovereign-price-authority.ts');
    const occurrences = authority.split("status: 'free-confirmed'").length - 1;
    expect(occurrences).toBe(1);
  });

  it('the clone road asks the shared gate and takes no hold', () => {
    const road = read('app/api/vault/assets/clone-voice/route.ts');
    // Through the one economy door, not its own arithmetic.
    expect(road).toContain('sovereignCapability: VOICE_IDENTITY_CAPABILITY');
    // And the cost engine it used to die on is gone from this road entirely:
    // `voice-cloning` is 0 and pending-discovery in the catalog, which is the
    // unexplained zero that refused every paying Creator at step 3.
    expect(road).not.toContain("estimate('voice-cloning'");
    expect(road).not.toContain('AzmaUnitCostEngine');
  });

  it('a zero from the COST CATALOG still refuses — the old rule is intact', () => {
    const gate = read('src/economy/paid-operation-gate.ts');
    // The catalog path must keep refusing a zero it cannot explain.
    expect(gate).toContain('if (!Number.isFinite(units) || units <= 0) {');
    // And the one exception is reached only by the ruled status, never by a
    // figure that merely happens to be zero.
    expect(gate).toContain("if (approved.status === 'free-confirmed') {");
  });
});

describe('speaking with it is paid, by the character', () => {
  it('derives the Founder’s own two figures rather than transcribing them', () => {
    // He stated 0.07584 cost and 0.128928 price. Both are computed here from
    // the measured subscription, so the day it changes the price changes too.
    expect(SPEECH_COST_UNITS_PER_CHARACTER).toBeCloseTo(0.07584, 5);
    expect(SPEECH_UNITS_PER_CHARACTER).toBeCloseTo(0.128928, 5);
    expect(SPEECH_UNITS_PER_CHARACTER)
      .toBeCloseTo(SPEECH_COST_UNITS_PER_CHARACTER * NEW_CAPABILITY_UPLIFT, 10);
    // And the denominator is a measurement, with the instrument named.
    expect(VOICE_SUBSCRIPTION.characters).toBe(66_458);
    expect(VOICE_SUBSCRIPTION.measuredFrom).toContain('/v1/user/subscription');
  });

  it('rounds ONCE at the job, because a character costs an eighth of a unit', () => {
    // The decisive case: ceiling per character would charge 500 units for a
    // 500-character narration instead of 65 — nearly eight times the ruling.
    expect(priceSpeech(500)).toMatchObject({ ok: true, chargedUnits: 65 });
    expect(priceSpeech(1000)).toMatchObject({ ok: true, chargedUnits: 129 });
    expect(priceSpeech(1)).toMatchObject({ ok: true, chargedUnits: 1 });
    expect(SPEECH_ROUNDING.id).toBe('CEIL_AT_JOB_LEVEL');

    // And the gate is where that single ceiling actually happens, so every
    // road on that path gets it rather than each remembering to.
    expect(read('src/economy/paid-operation-gate.ts'))
      .toContain('units: Math.ceil(approved.unitsPerQuantity * asked),');
  });

  it('refuses a narration with nothing in it rather than charging nothing', () => {
    for (const nothing of [0, -5, 1.5, null, undefined, Number.NaN]) {
      expect(priceSpeech(nothing as number).ok).toBe(false);
    }
  });

  it('both speech roads charge the text’s own length, and neither reads the catalog', () => {
    for (const road of ['generate-speech', 'generate-cloned-speech']) {
      const file = read(`app/api/vault/assets/${road}/route.ts`);
      expect(file).toContain('sovereignCapability: SPEECH_CAPABILITY');
      expect(file).toContain('const spokenCharacters = text.trim().length;');
      expect(file).toContain('quantity: spokenCharacters');
      // The flat 30-per-operation figure came from here, and it broke even at
      // 395 characters. No speech road reads it any more.
      expect(file).not.toContain("estimate('text-to-speech'");
      expect(file).not.toContain('AzmaUnitCostEngine');
    }
  });

  it('is the same price on both roads, because both spend the same characters', () => {
    const price = sovereignPriceFor(SPEECH_CAPABILITY);
    expect(price.quantity).toBe('per-character');
    expect(price.unitsPerQuantity).toBe(SPEECH_UNITS_PER_CHARACTER);
    // One capability, named by both roads — not two prices that must be kept
    // in step by hand.
    for (const road of ['generate-speech', 'generate-cloned-speech']) {
      expect(read(`app/api/vault/assets/${road}/route.ts`)).toContain('SPEECH_CAPABILITY');
    }
  });
});
