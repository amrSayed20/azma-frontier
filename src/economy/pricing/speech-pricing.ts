/**
 * AZMA OS — سعرُ النطقِ بالحرف: التكلفةُ المقيسةُ × ١.٧٠.
 *
 * ─── THE RULING THIS IMPLEMENTS ─────────────────────────────────────────────
 *
 *   «يُحاسب توليد الكلام وفق الاستهلاك الفعلي للأحرف والتعريفة الفعلية
 *   للمزود. يُطبّق هامش المؤسس المعتمد: التكلفة الفعلية × 1.70… تكلفة الحرف
 *   لدى المنصة هي 0.07584 وحدة، وسعر المبدع وفق القاعدة هو 0.128928 وحدة
 *   للحرف قبل تطبيق قواعد التقريب المعتمدة.» — 2026-11-03, decision 2.
 *
 *   «تحقّق من وحدة القياس الفعلية وقاعدة التقريب في التنفيذ، ولا تغيّرها
 *   دون توثيق.» — so both are verified below and documented here.
 *
 * ─── THE UNIT, VERIFIED AGAINST THE PROVIDER'S OWN PUBLISHED TERMS ──────────
 *
 *   The provider states: «For V2 Multilingual models, 1 text character equals
 *   1 credit» (elevenlabs.io/pricing, read 2026-11-03). The Empire's bound
 *   model is `eleven_multilingual_v2`, so the unit is the CHARACTER and the
 *   conversion from characters to credits is one-to-one.
 *
 *   That matters because it makes the cost per character a division the
 *   Founder can check in one line, with no provider-internal rate anywhere:
 *
 *       cost per character = cycle amount ÷ cycle character allowance
 *                          = $7.00 ÷ 66,458
 *                          = $0.00010533
 *
 *   The denominator was MEASURED on the live key (`GET /v1/user/subscription`,
 *   tier `starter`, 2026-11-01). The numerator is the Founder's own statement
 *   of what he paid for the 30-day cycle. Neither is a rate card.
 *
 * ─── AND WHY THE FIGURES ARE DERIVED HERE RATHER THAN TYPED ─────────────────
 *
 *   The Founder's order carries 0.07584 and 0.128928. Both are printed below
 *   by computation, not transcribed: a price typed as a decimal drifts the day
 *   the subscription changes, and the day that happens the Empire must notice
 *   rather than keep charging yesterday's margin.
 */

import { NEW_CAPABILITY_UPLIFT } from './new-capability-pricing';
import { BALANCE_UNIT_USD } from './sovereign-value-balance';

/**
 * What the Empire's voice subscription buys, measured and stated.
 *
 * `characters` was read from the provider; `usd` is the Founder's statement of
 * the cycle's price. Changing either changes the price, which is the point.
 */
export const VOICE_SUBSCRIPTION = {
  usd: 7,
  characters: 66_458,
  cycleDays: 30,
  tier: 'starter',
  measuredOn: '2026-11-01',
  measuredFrom: 'GET /v1/user/subscription on the live key',
  amountStatedBy: 'the Founder, 2026-11-02',
  /** The published term that makes a character and a credit the same thing. */
  unitSource: 'elevenlabs.io/pricing — «For V2 Multilingual models, 1 text character equals 1 credit» (read 2026-11-03)',
  model: 'eleven_multilingual_v2',
} as const;

/** $0.00010533… per character. Derived from the measurement, never typed. */
export const SPEECH_COST_USD_PER_CHARACTER =
  VOICE_SUBSCRIPTION.usd / VOICE_SUBSCRIPTION.characters;

/** ≈ 0.07584 units of cost per character. The Founder's own figure, recomputed. */
export const SPEECH_COST_UNITS_PER_CHARACTER =
  SPEECH_COST_USD_PER_CHARACTER / BALANCE_UNIT_USD;

/** ≈ 0.128928 units per character. Cost × the ratified 1.70, exactly as ruled. */
export const SPEECH_UNITS_PER_CHARACTER =
  SPEECH_COST_UNITS_PER_CHARACTER * NEW_CAPABILITY_UPLIFT;

/**
 * ─── THE ROUNDING, AND WHY IT MUST BE AT THE JOB AND NOT THE CHARACTER ──────
 *
 *   One character costs far less than one unit — about an eighth. Rounding up
 *   PER CHARACTER would charge 1 unit for each, turning a 500-character
 *   narration from 65 units into 500: **nearly eight times the ruled price.**
 *
 *   The ratified rule is already the right one: `CEIL_AT_JOB_LEVEL` — round
 *   up ONCE, over the whole job. Verified against the Constitution rather
 *   than chosen here, and it is the same rule the MP4 export applies.
 */
export const SPEECH_ROUNDING = {
  id: 'CEIL_AT_JOB_LEVEL',
  appliedAt: 'the whole narration, once',
  ratifiedOn: '2026-10-13',
  article: 'docs/SOVEREIGN_COST_AND_PRICING_CONSTITUTION.md — رابعاً: التقريب',
  whyNotPerCharacter: 'a character costs about an eighth of a unit, so ceiling each one '
    + 'would charge a 500-character narration 500 units instead of 65',
} as const;

export type SpeechPriceVerdict =
  | {
      readonly ok: true;
      readonly characters: number;
      readonly chargedUnits: number;
      /** Before the single ceiling, kept so the gap is always readable. */
      readonly exactUnits: number;
      readonly roundingUnits: number;
      /** What the Creator is told the charge follows. No provider, no model. */
      readonly basisAr: string;
    }
  | { readonly ok: false; readonly missing: string };

/**
 * Price one narration from the characters it will actually send.
 *
 * The count is the text's own length — what the provider meters — and never a
 * number the browser states about it. A text of no characters is not a
 * narration: it is refused rather than charged nothing, because an empty
 * narration is one that did not happen.
 */
export function priceSpeech(characters: number | null | undefined): SpeechPriceVerdict {
  if (typeof characters !== 'number' || !Number.isFinite(characters)) {
    return { ok: false, missing: 'the narration has no character count, so its charge cannot be stated' };
  }
  if (!Number.isInteger(characters) || characters <= 0) {
    return { ok: false, missing: 'a narration of no characters is not speech; nothing is charged and nothing is produced' };
  }

  const exactUnits = characters * SPEECH_UNITS_PER_CHARACTER;
  const chargedUnits = Math.ceil(exactUnits);
  return {
    ok: true,
    characters,
    chargedUnits,
    exactUnits,
    roundingUnits: chargedUnits - exactUnits,
    basisAr: 'لكلِّ حرفٍ من نصِّك',
  };
}
