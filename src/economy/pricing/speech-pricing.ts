/**
 * AZMA OS — سعرُ النطق: ما قاسَه المزوِّدُ لا ما كتبَه المبدع.
 *
 * ─── THE RULING THIS IMPLEMENTS ─────────────────────────────────────────────
 *
 *   «يُحاسب توليد الكلام وفق الاستهلاك الفعلي للأحرف والتعريفة الفعلية
 *   للمزود. يُطبّق هامش المؤسس المعتمد: التكلفة الفعلية × 1.70… تحقّق من
 *   وحدة القياس الفعلية وقاعدة التقريب في التنفيذ… يجب أن يتطابق الاستهلاك
 *   المسجل مع العملية الفعلية لدى المزود.» — 2026-11-03, decision 2.
 *
 *   That last sentence is why this file was rewritten the day it was written.
 *
 * ─── WHAT THE PRODUCTION MEASUREMENT CHANGED, 2026-11-03 ────────────────────
 *
 *   The first version priced per character of the Creator's own text, on the
 *   provider's published line «1 text character equals 1 credit». A real
 *   narration on the live key proved that line does not hold for diacritised
 *   Arabic:
 *
 *     · 134 characters of Arabic  →  provider metered  **54** credits
 *     ·  12 characters of Arabic  →  provider metered   **5** credits
 *
 *   A ratio of about 0.41. Charging by the Creator's text length would have
 *   billed 134 where the Empire was billed 54 — **two and a half times over.**
 *
 *   So the unit is the provider's CREDIT, and the Creator's text length is an
 *   UPPER BOUND on it, never a measure of it. The bound is what the Creator is
 *   quoted and what is held; the metered credits are what is settled.
 *
 * ─── AND THE SUBSCRIPTION ITSELF CHANGED ────────────────────────────────────
 *
 *   Measured 2026-11-01: tier `starter`, 545 used of **66,458**, `past_due`.
 *   Measured 2026-11-03: tier `starter`,   0 used of **90,000**, `active`.
 *
 *   The Founder's renewal reset the cycle and raised the allowance. His order
 *   carried the figures derived from 66,458 (0.07584 cost, 0.128928 price);
 *   those were correct for what was measured then, and the denominator has
 *   since been measured again. The rule is cost × 1.70 over the ACTUAL cost,
 *   so the figures are recomputed here rather than transcribed — which is the
 *   whole reason nothing in this file is a typed decimal.
 */

import { NEW_CAPABILITY_UPLIFT } from './new-capability-pricing';
import { BALANCE_UNIT_USD } from './sovereign-value-balance';

/**
 * What the Empire's voice subscription buys, measured on the live key.
 *
 * `credits` is the provider's own allowance for the cycle. `usd` is the
 * Founder's statement of what the cycle costs. Changing either changes the
 * price, which is the point of deriving rather than typing it.
 */
export const VOICE_SUBSCRIPTION = {
  usd: 7,
  credits: 90_000,
  cycleDays: 30,
  tier: 'starter',
  status: 'active',
  measuredOn: '2026-11-03',
  measuredFrom: 'GET /v1/user/subscription on the live key, read three times twenty seconds apart',
  amountStatedBy: 'the Founder, 2026-11-02',
  supersedes: 'the 66,458 allowance measured 2026-11-01, before the renewal reset the cycle',
  model: 'eleven_multilingual_v2',
  /**
   * The provider's own published line is «1 text character equals 1 credit»
   * for V2 Multilingual. Our measurement contradicts it for Arabic, so the
   * measurement governs and the published line is recorded as what it is.
   */
  publishedUnitClaim: 'elevenlabs.io/pricing — «For V2 Multilingual models, 1 text character equals 1 credit» (read 2026-11-03)',
  measuredUnitTruth: '134 Arabic characters metered 54 credits; 12 metered 5 — about 0.41 credits per character',
} as const;

/** $0.00007777… per provider credit. Derived from the measurement. */
export const SPEECH_COST_USD_PER_CREDIT = VOICE_SUBSCRIPTION.usd / VOICE_SUBSCRIPTION.credits;

/** ≈ 0.056 units of cost per provider credit. */
export const SPEECH_COST_UNITS_PER_CREDIT = SPEECH_COST_USD_PER_CREDIT / BALANCE_UNIT_USD;

/** ≈ 0.09519 units per credit. Cost × the ratified 1.70, exactly as ruled. */
export const SPEECH_UNITS_PER_CREDIT = SPEECH_COST_UNITS_PER_CREDIT * NEW_CAPABILITY_UPLIFT;

/**
 * ─── THE ROUNDING, AND WHY IT MUST BE AT THE JOB AND NOT THE CREDIT ─────────
 *
 *   One credit costs about a eleventh of a unit. Rounding up PER CREDIT would
 *   charge 1 unit for each, turning this measured 54-credit narration from 6
 *   units into 54 — **nine times** the ruled price.
 *
 *   The ratified rule is already the right one: `CEIL_AT_JOB_LEVEL` — round
 *   up ONCE, over the whole job. It is applied in the gate, where the product
 *   is formed, so every road on that path gets it rather than each
 *   remembering to.
 */
export const SPEECH_ROUNDING = {
  id: 'CEIL_AT_JOB_LEVEL',
  appliedAt: 'the whole narration, once',
  ratifiedOn: '2026-10-13',
  article: 'docs/SOVEREIGN_COST_AND_PRICING_CONSTITUTION.md — رابعاً: التقريب',
  whyNotPerCredit: 'a credit costs about a eleventh of a unit, so ceiling each one would '
    + 'charge the measured 54-credit narration 54 units instead of 6',
} as const;

export type SpeechPriceVerdict =
  | {
      readonly ok: true;
      /** Provider credits this figure was computed over. */
      readonly credits: number;
      readonly chargedUnits: number;
      /** Before the single ceiling, kept so the gap is always readable. */
      readonly exactUnits: number;
      readonly roundingUnits: number;
      /** What the Creator is told the charge follows. No provider, no model. */
      readonly basisAr: string;
    }
  | { readonly ok: false; readonly missing: string };

/**
 * Price a narration from the credits the provider actually metered.
 *
 * This is the SETTLEMENT basis: the figure comes from the provider's own
 * `character-cost` response header, so the Creator is charged what the Empire
 * was charged, uplifted by the Founder's margin and nothing else.
 */
export function priceSpeechFromCredits(credits: number | null | undefined): SpeechPriceVerdict {
  if (typeof credits !== 'number' || !Number.isFinite(credits)) {
    return { ok: false, missing: 'the provider did not state what this narration cost, so it cannot be settled on a measurement' };
  }
  if (!Number.isInteger(credits) || credits <= 0) {
    return { ok: false, missing: 'a narration that cost no credits is not speech; nothing is charged and nothing is produced' };
  }

  const exactUnits = credits * SPEECH_UNITS_PER_CREDIT;
  const chargedUnits = Math.ceil(exactUnits);
  return {
    ok: true,
    credits,
    chargedUnits,
    exactUnits,
    roundingUnits: chargedUnits - exactUnits,
    basisAr: 'على ما نَطَقَه نصُّك فعلًا',
  };
}

/**
 * ─── THE CEILING SHOWN BEFORE THE PRESS ─────────────────────────────────────
 *
 *   The Creator must be told a number before the narration exists, and the
 *   metered credits do not exist until the provider answers. So the quote is
 *   the UPPER BOUND: one credit per character of their text.
 *
 *   MEASURED: the real ratio is about 0.41 credits per Arabic character, so
 *   this bound is roughly two and a half times the true charge and can never
 *   be under it. The hold is taken on the bound and the settlement follows
 *   the measurement, and `settle` refuses to charge more than was held — so
 *   the Creator always pays the measured figure and never the bound.
 *
 *   It is named `Bound` and not `Price` on purpose: a caller that charges
 *   this is overcharging, and the name says so.
 */
export function speechUpperBoundUnits(characters: number | null | undefined): SpeechPriceVerdict {
  if (typeof characters !== 'number' || !Number.isFinite(characters)) {
    return { ok: false, missing: 'the narration has no character count, so no ceiling can be stated' };
  }
  if (!Number.isInteger(characters) || characters <= 0) {
    return { ok: false, missing: 'a narration of no characters is not speech; nothing is charged and nothing is produced' };
  }
  // One credit per character is the ceiling the provider's own published line
  // claims, and our measurement sits well under it.
  return priceSpeechFromCredits(characters);
}
