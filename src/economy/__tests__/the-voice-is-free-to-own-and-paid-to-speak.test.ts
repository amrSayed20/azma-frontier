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
  priceSpeechFromCredits,
  speechUpperBoundUnits,
  SPEECH_COST_UNITS_PER_CREDIT,
  SPEECH_UNITS_PER_CREDIT,
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
  it('derives its price from the subscription MEASURED on the live key', () => {
    // The Founder's order carried 0.07584 and 0.128928, derived from the
    // 66,458 allowance measured on 2026-11-01. The renewal reset the cycle
    // and the allowance was measured again at 90,000 on 2026-11-03, so the
    // figures are recomputed from the rule rather than transcribed.
    expect(VOICE_SUBSCRIPTION.credits).toBe(90_000);
    expect(VOICE_SUBSCRIPTION.status).toBe('active');
    expect(VOICE_SUBSCRIPTION.measuredFrom).toContain('/v1/user/subscription');
    expect(SPEECH_UNITS_PER_CREDIT)
      .toBeCloseTo(SPEECH_COST_UNITS_PER_CREDIT * NEW_CAPABILITY_UPLIFT, 10);
    // And the margin is exactly the ratified one, never more and never less.
    expect(SPEECH_UNITS_PER_CREDIT / SPEECH_COST_UNITS_PER_CREDIT)
      .toBeCloseTo(NEW_CAPABILITY_UPLIFT, 10);
  });

  it('prices the PROVIDER’S credits, not the length of the Creator’s text', () => {
    /*  THE DEFECT THIS WAS WRITTEN AGAINST, MEASURED ON PRODUCTION
     *
     *    A real 134-character Arabic narration metered **54** credits, and a
     *    12-character one metered **5** — about 0.41 credits per character.
     *    The provider's published line claims one character is one credit;
     *    for diacritised Arabic it is not.
     *
     *    Charging by text length billed 134 where the Empire was billed 54:
     *    two and a half times over.
     */
    const measured = priceSpeechFromCredits(54);
    const byTextLength = speechUpperBoundUnits(134);
    expect(measured.ok && byTextLength.ok).toBe(true);
    expect((measured as { chargedUnits: number }).chargedUnits)
      .toBeLessThan((byTextLength as { chargedUnits: number }).chargedUnits);
    // The real charge for the measured narration, and the ceiling it is under.
    expect(measured).toMatchObject({ ok: true, credits: 54, chargedUnits: 6 });
    expect(byTextLength).toMatchObject({ ok: true, chargedUnits: 13 });
  });

  it('rounds ONCE at the job, because a credit costs a eleventh of a unit', () => {
    // Ceiling per credit would charge the measured 54-credit narration 54
    // units instead of 6 — nine times the ruling.
    expect(priceSpeechFromCredits(54)).toMatchObject({ ok: true, chargedUnits: 6 });
    expect(priceSpeechFromCredits(1)).toMatchObject({ ok: true, chargedUnits: 1 });
    expect(SPEECH_ROUNDING.id).toBe('CEIL_AT_JOB_LEVEL');

    // And the gate is where that single ceiling actually happens, so every
    // road on that path gets it rather than each remembering to.
    expect(read('src/economy/paid-operation-gate.ts'))
      .toContain('units: Math.ceil(approved.unitsPerQuantity * asked),');
  });

  it('refuses rather than settling a narration the provider never priced', () => {
    for (const nothing of [0, -5, 1.5, null, undefined, Number.NaN]) {
      expect(priceSpeechFromCredits(nothing as number).ok).toBe(false);
      expect(speechUpperBoundUnits(nothing as number).ok).toBe(false);
    }
  });

  it('reads the provider’s own figure, and never the lagging counter', () => {
    const provider = read('src/chambers/ras-al-amr/voice-cloning-provider.ts');
    // MEASURED: the subscription counter still read the pre-call value three
    // times at twenty-second intervals after a real call. The header did not.
    expect(provider).toContain("response.headers.get('character-cost')");
    // Absent or unusable yields null, never a zero that would settle a real
    // narration for nothing.
    expect(provider).toContain('meteredCredits = Number.isInteger(parsedCost) && parsedCost > 0 ? parsedCost : null');

    /*  IT MEASURES THE ARGUMENT, NOT THE CALL
     *
     *    The first version asserted only that the file CONTAINED
     *    `priceSpeechFromCredits(` — and it still did when the argument was
     *    swapped back to the Creator's text length, which is the whole defect.
     *    A guard whose instrument answers a different question from its claim
     *    is one that gets silenced for being wrong.
     */
    const SETTLES_ON_THE_METERED: Readonly<Record<string, string>> = {
      'generate-speech': 'priceSpeechFromCredits(meteredCredits)',
      'generate-cloned-speech': 'priceSpeechFromCredits(synthResult.meteredCredits ?? null)',
    };
    for (const road of ['generate-speech', 'generate-cloned-speech']) {
      const file = read(`app/api/vault/assets/${road}/route.ts`);
      expect(file).toContain(SETTLES_ON_THE_METERED[road]);
      // And never on the text's own length, which is the ceiling not the cost.
      expect(file).not.toContain('priceSpeechFromCredits(spokenCharacters)');
      expect(file).toContain("basis: measured.ok ? 'provider-metered-credits' : 'held-ceiling-unmetered'");
      // And never more than was held, whatever the provider reported.
      expect(file).toContain('Math.min(measured.chargedUnits, chargeUnits)');
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
    expect(price.unitsPerQuantity).toBe(SPEECH_UNITS_PER_CREDIT);
    // One capability, named by both roads — not two prices that must be kept
    // in step by hand.
    for (const road of ['generate-speech', 'generate-cloned-speech']) {
      expect(read(`app/api/vault/assets/${road}/route.ts`)).toContain('SPEECH_CAPABILITY');
    }
  });
});
