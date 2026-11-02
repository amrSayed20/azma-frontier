/**
 * AZMA OS — سعرُ إخراجِ الفيلمِ المحليّ: مئةُ وحدةٍ للثانية.
 *
 * ─── THE RULING THIS IMPLEMENTS, IN THE FOUNDER'S OWN TERMS ─────────────────
 *
 *   «١٠٠ وحدة من رصيد المبدع لكل ثانية من ملف MP4 النهائي الذي لا يعتمد
 *   إنشاء محتواه على مزوّد خارجي مدفوع.» — 2026-11-02, decision 2.
 *
 *   With his own examples: 10s → 1,000 · 15s → 1,500 · 30s → 3,000 ·
 *   60s → 6,000.
 *
 *   And: «يُحسب الخصم وفق مدة الفيديو النهائي الفعلية بالثواني، وليس وفق
 *   مدة تخمينية يرسلها العميل.»
 *
 * ─── IT SUPERSEDES AN EARLIER SIGNED FIGURE, AND SAYS SO ────────────────────
 *
 *   `OPERATION_CONSUMPTION` carries `MP4_PRODUCTION` at 70 per REQUESTED
 *   second, signed 2026-09-27 — and nothing in the repository ever read it.
 *   The ruling of 2026-11-02 replaces both halves of that entry: the figure
 *   becomes 100, and the basis becomes the FINAL FILE's own duration rather
 *   than anything requested. The old entry is left where it is as the record
 *   of what was signed before, and this module is what the road reads.
 *
 * ─── WHY THE CHARGE IS SHOWN ON OUR COMPUTATION AND SETTLED ON THE FILE ─────
 *
 *   He requires both: the cost shown to the Creator BEFORE execution, and the
 *   charge taken on the ACTUAL final duration. Those are two different
 *   moments, because the file does not exist when the Creator presses.
 *
 *   So the hold is taken on `estimatedDurationSeconds` from the COMPILED
 *   assembly graph — the Empire's own computation over the Creator's own
 *   timeline, never a number the browser sent — and the settlement is taken
 *   on the finished file, measured. `settle` already refuses to charge more
 *   than was held and returns the difference, so a film that came out shorter
 *   costs less and a film that came out longer cannot quietly cost more: the
 *   gap is recorded instead.
 *
 * ─── AND THIS PRICE IS FOR THE EXPORT ALONE ─────────────────────────────────
 *
 *   «يجب فصل العمليتين ماليًا وتقنيًا، ومنع الخصم المكرر للعملية نفسها.»
 *
 *   Generating an image, generating a video scene, animating a still — each
 *   is a PAID PROVIDER act and is charged by the cost × 1.70 rule when it
 *   happens, at the door where it happens. This price pays for the local
 *   encode that assembles them. Neither cancels the other, and nothing here
 *   looks at what the timeline is made of: a film assembled from a Creator's
 *   own uploads and a film assembled from generated scenes are the same
 *   encode and the same hundred units a second.
 */

/** The Founder's figure. Read, never recomputed. */
export const MP4_UNITS_PER_SECOND = 100 as const;

/**
 * ─── THE ROUNDING RULE, AND WHY IT IS NOT A NEW RULE ────────────────────────
 *
 *   He requires a clear rule for fractions of a second, applied uniformly,
 *   without changing the approved price.
 *
 *   The Empire already has one, ratified: `CEIL_AT_JOB_LEVEL` — round UP,
 *   ONCE, at the level of the whole job, never per unit. The Chief Architect
 *   ratified it on 2026-10-13 and the Constitution carries it.
 *
 *   So a 10.2-second film is charged as 11 seconds — once — and never as
 *   10.2 × 100 rounded somewhere in the middle. Rounding up never sells below
 *   the approved price, and the overcharge is bounded by one second, which is
 *   disclosed to the Creator before they press.
 *
 *   A film of zero seconds is not a film: it is refused rather than charged
 *   nothing, because an export that produced nothing is not a free export —
 *   it is an export that did not happen.
 */
export const MP4_ROUNDING = {
  id: 'CEIL_AT_JOB_LEVEL',
  direction: 'up',
  appliedAt: 'the whole film, once',
  ratifiedOn: '2026-10-13',
  article: 'docs/SOVEREIGN_COST_AND_PRICING_CONSTITUTION.md — رابعاً: التقريب',
} as const;

export type Mp4PriceVerdict =
  | {
      readonly ok: true;
      /** Whole seconds charged, after the single ceiling. */
      readonly chargedSeconds: number;
      readonly chargedUnits: number;
      /** The duration before rounding, kept so the gap is always readable. */
      readonly exactSeconds: number;
      readonly roundingSeconds: number;
      /** What the Creator is told the charge follows. No provider, no encoder. */
      readonly basisAr: string;
    }
  | {
      readonly ok: false;
      /** Why no price can be stated. An unpriceable export is not performed. */
      readonly missing: string;
    };

/**
 * Price one final export from a duration in seconds.
 *
 * It refuses rather than guesses: a duration that is absent, zero, negative
 * or not finite yields no price, and the road must then refuse the export —
 * the same ending this Empire gives every act whose cost it cannot bound
 * before running it.
 */
export function priceMp4Export(durationSeconds: number | null | undefined): Mp4PriceVerdict {
  if (typeof durationSeconds !== 'number' || !Number.isFinite(durationSeconds)) {
    return { ok: false, missing: 'the film has no computed duration, so its charge cannot be stated' };
  }
  if (durationSeconds <= 0) {
    return { ok: false, missing: 'a film of no length is not an export; nothing is charged and nothing is produced' };
  }

  const chargedSeconds = Math.ceil(durationSeconds);
  return {
    ok: true,
    chargedSeconds,
    chargedUnits: chargedSeconds * MP4_UNITS_PER_SECOND,
    exactSeconds: durationSeconds,
    roundingSeconds: chargedSeconds - durationSeconds,
    basisAr: 'لكلِّ ثانيةٍ من الفيلمِ النهائيّ',
  };
}
