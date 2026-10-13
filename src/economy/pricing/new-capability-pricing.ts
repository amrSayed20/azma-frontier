/**
 * AZMA OS — THE PRICE OF THE FIVE NEW CAPABILITIES, AT THE ARCHITECT'S UPLIFT
 *
 * ─── WHAT HE RULED, IN HIS OWN TERMS ────────────────────────────────────────
 *
 *   «Creator operation price = verified provider cost × 1.70» — for the four
 *   new Magic Hour capabilities and for 4× upscale, and for those only. «This
 *   uplift is for platform expense coverage, not a claim of guaranteed net
 *   profit.»
 *
 *   Every existing price in `sovereign-value-balance.ts` is untouched by this
 *   module. It adds five rules; it rewrites none.
 *
 * ─── THE COSTS IT MULTIPLIES ARE MEASURED, NOT DOCUMENTED ───────────────────
 *
 *   Each of the five figures below came out of a real paid job on 2026-10-12,
 *   with the provider's own `credits_charged` and a balance that moved by
 *   exactly that amount. The provider job ids are recorded beside them, so a
 *   reader can go and check rather than take this file's word.
 *
 * ─── AND ONE RULE THE CONSTITUTION DOES NOT YET HAVE ────────────────────────
 *
 *   The Balance is an INTEGER ledger: `available_units INTEGER NOT NULL`. The
 *   uplift produces fractions — 5 × 1.7 = 8.5, one frame × 1.7 = 1.7 — and a
 *   fraction cannot be deducted from an integer ledger.
 *
 *   No rounding rule exists anywhere in the Cost & Pricing Constitution. The
 *   Architect's instruction was explicit: «resolve integer pricing through the
 *   existing sovereign pricing rules OR REPORT THE EXACT MISSING RULE. Do not
 *   silently round down, change consumption semantics, or conceal effective
 *   margins.»
 *
 *   So this module does the one thing that cannot hide anything:
 *
 *     · it rounds UP, once, at the level of the whole job — never per unit,
 *       where repeated rounding would compound invisibly;
 *     · it keeps the exact decimal beside the charged integer, so the gap is
 *       always readable;
 *     · and it names the rule `CEIL_AT_JOB_LEVEL` and marks it
 *       `RATIFICATION_REQUIRED`, because a rule the constitution does not
 *       contain is not a rule this module may grant itself.
 *
 *   Rounding up never undercharges the Empire's own cost basis, and the
 *   overcharge is bounded by one unit per job — ≈ 0.07 EGP — and disclosed in
 *   every estimate. Rounding down would have quietly sold below the ruling.
 */

import { CREDIT_EGP } from '../cost-engine/qiyamah-cost-truth';

/** The Chief Architect's uplift, 2026-10-12. For these five capabilities only. */
export const NEW_CAPABILITY_UPLIFT = 1.70 as const;

/** Why it exists, in his words — so no report can describe it as profit. */
export const UPLIFT_PURPOSE_AR =
  'لتغطية مصاريف تشغيل المنصّة، وليست ادّعاءَ ربحٍ صافٍ مضمون.';

/**
 * The rounding the integer ledger forces — RULED ON, and no longer pending.
 *
 * It was declared here with `ratificationRequired: true` because the Cost &
 * Pricing Constitution carried no rounding article at all, and a rounding rule
 * nobody had approved is a price nobody had approved.
 *
 * RATIFIED 2026-10-13 by the Chief Architect's FINAL ACCEPTANCE DECISION:
 * «Apply ceiling-to-integer rounding per operation for the five new
 * capabilities, after the approved 70% uplift, using verified provider costs.»
 *
 * Nothing about the arithmetic changed — it was already ceiling, already once
 * per operation. What changed is that it now rests on a ruling instead of on a
 * note asking for one. The article is written into the Constitution itself, so
 * the authority lives where the other pricing law lives and not only here.
 */
export const JOB_LEVEL_ROUNDING = {
  id: 'CEIL_AT_JOB_LEVEL',
  direction: 'up',
  appliedAt: 'the whole job, once',
  whyAr: 'الميزانُ عددٌ صحيح، والرفعُ يُنتج كسوراً. والتقريبُ لأعلى لا يَبيع تحت '
    + 'الحكم أبداً، وفرقُه لا يَتجاوز وحدةً واحدةً للعمليّة، ويُعرَض قبل التنفيذ.',
  ratificationRequired: false,
  ratifiedOn: '2026-10-13',
  ratifiedBy: 'Chief Architect — FINAL ACCEPTANCE DECISION, item 1',
  article: 'docs/SOVEREIGN_COST_AND_PRICING_CONSTITUTION.md — رابعاً: التقريب',
} as const;

export type NewCapability =
  | 'BACKGROUND_REMOVAL'
  | 'LIP_SYNC'
  | 'FACE_SWAP'
  | 'TALKING_PHOTO'
  | 'UPSCALE_4X';

/** What the charge actually follows, as the campaign measured it. */
export type BillingBasis = 'per-image' | 'per-frame' | 'per-requested-second' | 'per-operation';

export interface MeasuredCostRule {
  readonly capability: NewCapability;
  readonly nameAr: string;
  /** Provider credits per ONE unit of the basis. MEASURED, not documented. */
  readonly providerCreditsPerUnit: number;
  readonly basis: BillingBasis;
  /** The job that measured it, so the figure can be checked. */
  readonly measuredBy: { readonly providerJobId: string; readonly on: string };
  /** What the Creator is told the charge follows. Never a provider's name. */
  readonly basisAr: string;
}

/**
 * ─── THE FIVE, AND THE JOBS THAT PRICED THEM ────────────────────────────────
 *
 *   FACE SWAP IS NOT PER SECOND. The provider's published table says «24
 *   credits/second at 24fps», and the campaign measured 25 credits for one
 *   second of a 25fps clip and 75 for three. Both readings are one rule: ONE
 *   CREDIT PER FRAME. Pricing it per second would overcharge a 24fps clip and
 *   undercharge a 30fps one, and the Architect ordered the estimate corrected
 *   to the measured frame basis.
 */
export const MEASURED_COSTS: readonly MeasuredCostRule[] = [
  {
    capability: 'BACKGROUND_REMOVAL', nameAr: 'إزالة الخلفيّة',
    providerCreditsPerUnit: 5, basis: 'per-image',
    measuredBy: { providerJobId: 'cmv59080s0582l801e5hqmspr', on: '2026-10-12' },
    basisAr: 'لكلّ صورة',
  },
  {
    capability: 'LIP_SYNC', nameAr: 'مزامنة الشفاه',
    providerCreditsPerUnit: 1, basis: 'per-frame',
    measuredBy: { providerJobId: 'cmv59ivor01zemd01s1tp7g60', on: '2026-10-12' },
    basisAr: 'لكلّ إطارٍ من مقطعك — والمدّةُ مضروبةً في إطاراته',
  },
  {
    capability: 'FACE_SWAP', nameAr: 'تبديل الوجه',
    providerCreditsPerUnit: 1, basis: 'per-frame',
    measuredBy: { providerJobId: 'cmv5bvh7u0b8mmn016j1kszpv', on: '2026-10-12' },
    basisAr: 'لكلّ إطارٍ من مقطعك — والمدّةُ مضروبةً في إطاراته',
  },
  {
    capability: 'TALKING_PHOTO', nameAr: 'صورة ناطقة',
    providerCreditsPerUnit: 48, basis: 'per-requested-second',
    measuredBy: { providerJobId: 'cmv59prfj092po50107ra2f2j', on: '2026-10-12' },
    basisAr: 'لكلّ ثانيةٍ تَطلبها',
  },
  {
    capability: 'UPSCALE_4X', nameAr: 'رفع الدقّة أربعَ مرّات',
    providerCreditsPerUnit: 100, basis: 'per-operation',
    measuredBy: { providerJobId: 'cmv5c2l8q073zmj01xymsmdeg', on: '2026-10-12' },
    basisAr: 'للعمليّة الواحدة',
  },
];

export const measuredCostFor = (c: NewCapability): MeasuredCostRule => {
  const rule = MEASURED_COSTS.find((r) => r.capability === c);
  if (!rule) throw new Error(`no measured cost for '${c}'`);
  return rule;
};

/** What a job must say about itself before it can be priced. */
export interface PricedJob {
  readonly capability: NewCapability;
  /** Images, for a per-image act. */
  readonly imageCount?: number;
  /** The duration the Creator asked for. Never the provider's report. */
  readonly requestedSeconds?: number;
  /** The SOURCE clip's own frame rate, measured. Required by a frame basis. */
  readonly sourceFps?: number;
}

export type PriceVerdict =
  | {
      readonly ok: true;
      readonly capability: NewCapability;
      /** The provider charge this price is built on. Internal only. */
      readonly providerCredits: number;
      /** cost × 1.70, exactly, before the ledger's integer forces a choice. */
      readonly exactUnits: number;
      /** What the Creator is actually charged. Never below `exactUnits`. */
      readonly chargedUnits: number;
      /** chargedUnits − exactUnits. Disclosed, never buried. */
      readonly roundingUnits: number;
      readonly basis: BillingBasis;
      /** The sentence a Creator reads before pressing. */
      readonly basisAr: string;
      readonly quantity: number;
    }
  | {
      readonly ok: false;
      readonly capability: NewCapability;
      /** Why no price can be stated. A price that cannot be bounded is refused. */
      readonly missing: string;
    };

/**
 * Price one job, or refuse to.
 *
 * It refuses rather than guesses, and the refusal is the point: an act whose
 * charge cannot be bounded before it runs must not be offered. A frame-billed
 * act without its clip's frame rate is exactly that case — the Empire sends no
 * `max_fps_limit`, so the frame count belongs to the Creator's own file.
 */
export function priceNewCapability(job: PricedJob): PriceVerdict {
  const rule = measuredCostFor(job.capability);

  let quantity: number | null = null;
  switch (rule.basis) {
    case 'per-operation':
      quantity = 1;
      break;
    case 'per-image':
      quantity = job.imageCount ?? 1;
      break;
    case 'per-requested-second':
      quantity = job.requestedSeconds ?? null;
      if (quantity !== null && !(quantity > 0)) quantity = null;
      break;
    case 'per-frame': {
      const seconds = job.requestedSeconds ?? 0;
      const fps = job.sourceFps ?? 0;
      quantity = seconds > 0 && fps > 0 ? Math.ceil(seconds * fps) : null;
      break;
    }
    default:
      quantity = null;
  }

  if (quantity === null || !Number.isFinite(quantity) || quantity <= 0) {
    return {
      ok: false,
      capability: job.capability,
      missing: rule.basis === 'per-frame'
        ? 'the source clip’s frame rate and the requested duration — this act is '
          + 'billed per frame, and a frame count nobody can state is a charge nobody can bound'
        : 'the requested quantity for this act',
    };
  }

  const providerCredits = rule.providerCreditsPerUnit * quantity;
  const exactUnits = providerCredits * NEW_CAPABILITY_UPLIFT;
  // ONE rounding, on the whole job, upward. See JOB_LEVEL_ROUNDING.
  const chargedUnits = Math.ceil(exactUnits);

  return {
    ok: true,
    capability: job.capability,
    providerCredits,
    exactUnits: Number(exactUnits.toFixed(4)),
    chargedUnits,
    roundingUnits: Number((chargedUnits - exactUnits).toFixed(4)),
    basis: rule.basis,
    basisAr: rule.basisAr,
    quantity,
  };
}

/**
 * What the Creator is shown before pressing — and nothing else.
 *
 * No provider, no provider credit, no uplift, no margin. The same wall the
 * Balance's own `creatorFacingCost` keeps.
 */
export interface CreatorEstimate {
  readonly chargedUnits: number;
  readonly basisAr: string;
  readonly quantity: number;
  readonly sentenceAr: string;
}

export function creatorEstimate(job: PricedJob): CreatorEstimate | { readonly missingAr: string } {
  const verdict = priceNewCapability(job);
  if (!verdict.ok) {
    return {
      missingAr: 'لا يُمكن تحديدُ كلفةِ هذا الطلب بدقّةٍ قبل تنفيذه، فلن يُنفَّذ. '
        + 'اختر مدّةً ومقطعاً نَعرف إطاراتِه.',
    };
  }
  return {
    chargedUnits: verdict.chargedUnits,
    basisAr: verdict.basisAr,
    quantity: verdict.quantity,
    sentenceAr: `${verdict.chargedUnits.toLocaleString('en-US')} وحدة · ${verdict.basisAr}`,
  };
}

/**
 * The table the acceptance report prints: every price beside the cost it came
 * from, with the rounding visible. In EGP at the recorded credit rate, for the
 * Architect's eye only — a Creator never sees a currency here.
 */
export function pricingTable(): readonly {
  readonly capability: NewCapability;
  readonly nameAr: string;
  readonly providerCreditsPerUnit: number;
  readonly basis: BillingBasis;
  readonly exactUnitsPerUnit: number;
  readonly providerCostEgpPerUnit: number;
}[] {
  return MEASURED_COSTS.map((r) => ({
    capability: r.capability,
    nameAr: r.nameAr,
    providerCreditsPerUnit: r.providerCreditsPerUnit,
    basis: r.basis,
    exactUnitsPerUnit: Number((r.providerCreditsPerUnit * NEW_CAPABILITY_UPLIFT).toFixed(4)),
    providerCostEgpPerUnit: Number((r.providerCreditsPerUnit * CREDIT_EGP).toFixed(4)),
  }));
}
