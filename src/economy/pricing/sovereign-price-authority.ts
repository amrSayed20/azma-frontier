/**
 * AZMA OS — ONE PLACE TO ASK WHAT AN OPERATION COSTS A CREATOR.
 *
 * ─── WHY THIS EXISTS: FOUR SOURCES, AND THE GATE READ THE WRONG ONE ─────────
 *
 *   MEASURED 2026-11-01, by reading all four:
 *
 *   1 · `sovereign-value-balance.ts` → `OPERATION_CONSUMPTION`
 *       The Founder's own approved figures, dated 2026-09-27, in the unit a
 *       Creator sees. This is a PRICE source, and the only one he signed.
 *
 *   2 · `new-capability-pricing.ts` → measured provider cost × 1.70
 *       A ratified DERIVATION, for five named capabilities and «for those
 *       only»: the four creative acts and 4× upscale. Also a price source.
 *
 *   3 · `provider-cost-catalog.ts` → `azmaUnitsPerUnit`
 *       A PROVIDER COST catalog. Every Magic Hour entry is 0 and
 *       `pending-discovery`. It is not a price source and was never signed as
 *       one.
 *
 *   4 · `qiyamah-cost-truth.ts`
 *       What the Empire PAID, measured, in the provider's own unit. Never a
 *       price, and it says so in its own header.
 *
 *   The economy gate reads number 3. That is the defect, and it has two
 *   visible consequences on the live release:
 *
 *     · image generation is charged 40 units, from an entry describing «DALL-E
 *       3 standard quality, 1024×1024» — while the Founder's approved price
 *       for IMAGE_GENERATION is 200, and the Empire's actual image binding is
 *       nano-banana-2 through Magic Hour, measured at 100 provider credits.
 *       The live charge is a fifth of the approved one and is priced against a
 *       provider that is not the one producing the picture.
 *
 *     · image editing and animation are REFUSED for want of a price, while
 *       IMAGE_EDIT (200 per image) and MOTION (200 per requested second) are
 *       both approved in the Founder's own table.
 *
 * ─── WHAT THIS MODULE DOES, AND WHAT IT DELIBERATELY DOES NOT ───────────────
 *
 *   It READS. It is the single place to ask what the Empire has approved for
 *   an operation, in what unit, and on whose authority.
 *
 *   It is NOT wired into the gate, and wiring it there is not an engineer's
 *   act: it would change what live roads charge (40 → 200 on image
 *   generation) and reopen three roads that refuse today. Those are the
 *   owner's figures to apply or revise, and the directive of 2026-11-01 is
 *   explicit — «إذا كان توحيد المصادر يتطلب قرارًا تجاريًا أو تغييرًا في
 *   أسعار معتمدة، فتوقف عند تحديد القرار المطلوب ولا تنفذه نيابةً عن
 *   المالك.»
 *
 *   It copies no number. Every figure it returns is read at call time from the
 *   authority that holds it, so no price can drift by being transcribed.
 */

import { OPERATION_CONSUMPTION } from './sovereign-value-balance';
import { MEASURED_COSTS, priceNewCapability, NEW_CAPABILITY_UPLIFT } from './new-capability-pricing';
import type { NewCapability } from './new-capability-pricing';
import { MP4_UNITS_PER_SECOND, MP4_ROUNDING } from './local-export-pricing';
import { imageCreditsAtResolution, TARIFF_SOURCE } from './official-provider-tariff';
import { SPEECH_UNITS_PER_CHARACTER, VOICE_SUBSCRIPTION } from './speech-pricing';

/**
 * How a Creator's charge is counted. No two of these are interchangeable.
 *
 * `per-requested-second` and `per-final-second` differ by WHO states the
 * duration: the first is the length the Creator asked a provider for, the
 * second is the length the finished file turned out to be. The Founder ruled
 * on 2026-11-02 that the MP4 export follows the second — «وليس وفق مدة
 * تخمينية يرسلها العميل» — so they are kept apart by name.
 */
export type PriceQuantity =
  | 'per-image'
  | 'per-operation'
  | 'per-requested-second'
  | 'per-final-second'
  | 'per-frame'
  /**
   * Per character of the Creator's own text — the unit the voice provider
   * meters. It is the Empire's first FRACTIONAL per-unit price (about an
   * eighth of a unit), which is why the gate forms the product before it
   * rounds, once, at the job.
   */
  | 'per-character';

export type PriceStatus =
  /** The Founder approved this figure directly, in `OPERATION_CONSUMPTION`. */
  | 'approved'
  /** Derived by the ratified uplift from a measured provider cost. */
  | 'derived-ratified'
  /**
   * ─── A ZERO THAT IS A FINDING, NOT AN ABSENCE ────────────────────────────
   *
   *   The Empire's oldest money rule is that an unpriced act is refused and
   *   never performed for free, because a zero usually means «nobody looked».
   *   This status is the one case where a zero means the opposite: somebody
   *   looked, and the provider charges nothing.
   *
   *   RULED 2026-11-03: «يجب تمثيل هذه الحالة في بوابة الاقتصاد باعتبارها
   *   عملية مجانية مؤكدة، لا تكلفة مجهولة… لا يجوز أن يؤدي الصفر إلى رفض
   *   العملية باعتبارها غير مسعّرة.»
   *
   *   It is never inferred. A capability reaches it only by being written
   *   here beside the published tariff that says so, which is why it cannot
   *   spread to an act whose cost merely failed to be found.
   */
  | 'free-confirmed'
  /**
   * No approved price exists anywhere. Not a zero — an absence. An operation
   * in this state must not be performed for a charge, and must not be
   * performed for free either.
   */
  | 'absent';

export interface SovereignPrice {
  readonly capability: string;
  readonly status: PriceStatus;
  /** Units per ONE unit of `quantity`, or null when absent. */
  readonly unitsPerQuantity: number | null;
  readonly quantity: PriceQuantity | null;
  /** The file and the ruling that make this figure binding. */
  readonly authority: string;
  readonly note?: string;
}

const UPLIFT_CAPABILITIES: readonly NewCapability[] =
  MEASURED_COSTS.map((r) => r.capability);

/**
 * ─── THE SCENE'S OWN ENTRY — NOW ACTIVE, AND DERIVED RATHER THAN CHOSEN ─────
 *
 *   RULED 2026-11-02 (decision 2): a commissioned scene gets its OWN price
 *   classification. It is not `STORYBOARD_IMAGE` merely because that name
 *   exists in the table — that figure (70) was set for an open-source
 *   storyboard component that charges nothing externally, and it is read by
 *   no line in this repository. The scene is produced by `generateImage` →
 *   Magic Hour → `nano-banana-2`, a PAID provider measured at 100 credits.
 *
 *   RULED AGAIN, the same day, in the closure order's first decision:
 *
 *     «سعر المبدع بالوحدات = التكلفة الأصلية الفعلية للمزوّد بالوحدات × 1.70»
 *     — with his own example: «تكلفة أصلية قدرها 100 وحدة: يُخصم 170 وحدة».
 *
 *   That settles the figure without anyone choosing one. The scene's measured
 *   provider cost is 100 credits (job `cmujkc33903p5nq019ccursva`, measured
 *   2026-09-27), so its price is 170 units — read from the rule, never typed
 *   here. It obeys «لا تَعتمِد ٩٨ وحدةً سعرًا نهائيًّا تلقائيًّا» exactly:
 *   98 was the break-even calculation and it is not the price; 170 is the
 *   Founder's own arithmetic over the same measurement.
 *
 *   So the scene no longer needs a branch of its own. Its entry lives in
 *   `MEASURED_COSTS` beside the other measured capabilities, and this module
 *   answers for it through the one ratified uplift path below — which is why
 *   the constant that used to hold a hand-written figure for it is gone.
 */
export const SCENE_CAPABILITY = 'RAS_AMR_SCENE' as const;

/**
 * ─── THE FINAL EXPORT'S OWN CLASSIFICATION ──────────────────────────────────
 *
 *   RULED 2026-11-02, decision 2:
 *
 *     «١٠٠ وحدة من رصيد المبدع لكل ثانية من ملف MP4 النهائي الذي لا يعتمد
 *     إنشاء محتواه على مزوّد خارجي مدفوع.»
 *
 *   It is NOT `MP4_PRODUCTION`, the 2026-09-27 entry in the signed table.
 *   That entry says 70 per REQUESTED second, and the ruling changes both
 *   halves — the figure and the basis. It is also read by no line in this
 *   repository, so nothing is being taken away from any road. The old entry
 *   stays where it is as the record of what was signed before; this name is
 *   what the export road asks for, and the two never answer the same call.
 *
 *   The figure is read from `local-export-pricing.ts` at call time, never
 *   written here, so the Empire keeps ONE place where 100 is stated.
 */
export const MP4_EXPORT_CAPABILITY = 'MP4_EXPORT' as const;

/**
 * ─── CREATING A SOVEREIGN VOICE IDENTITY — FREE, AND PROVEN FREE ────────────
 *
 *   The provider publishes Instant Voice Cloning as a PLAN FEATURE with no
 *   per-identity charge: what it consumes is the characters of later
 *   generation, not the act of creating the voice
 *   (elevenlabs.io/pricing · elevenlabs.io/voice-cloning · read 2026-11-03).
 *   Our own subscription is the `starter` tier, measured on the live key, so
 *   the feature is genuinely ours.
 *
 *   RULED 2026-11-03: «إنشاء الهوية الصوتية المستنسخة مجاني للمبدع: 0 وحدة
 *   سيادية… ولا يجوز فرض رسم اعتباطي على إنشاء الهوية.»
 *
 *   MEASURED BEFORE THE RULING, which is why it was a launch blocker: the
 *   catalog carried voice-cloning as 0 and `pending-discovery`, and the gate
 *   refuses an act whose cost is zero — correctly, because a zero it cannot
 *   explain is a catalog nobody finished. So every paying Creator was refused
 *   at step 3 of the voice-identity proof. The refusal was right; what was
 *   missing was a way to say «this one really is free».
 */
export const VOICE_IDENTITY_CAPABILITY = 'VOICE_IDENTITY_CREATION' as const;

/**
 * ─── SPEAKING WITH A VOICE — CHARGED BY THE CHARACTERS IT SPENDS ────────────
 *
 *   RULED 2026-11-03: «يُحاسب توليد الكلام وفق الاستهلاك الفعلي للأحرف
 *   والتعريفة الفعلية للمزود. يُطبّق هامش المؤسس المعتمد: التكلفة الفعلية
 *   × 1.70.»
 *
 *   It supersedes what the live roads charged: a flat 30 units per
 *   OPERATION, read from a provider cost catalog that is not a price
 *   authority. MEASURED against the real tariff, that flat figure broke even
 *   at 395 characters and lost money on every narration longer than that —
 *   and a scene's voice-over is long by nature. A 1,000-character narration
 *   cost the Empire 75.8 units and charged 30.
 *
 *   Both speech roads share this one price, because both spend the same
 *   characters at the same provider on the same model. The identity used to
 *   say them is free to create; saying them is what costs.
 */
export const SPEECH_CAPABILITY = 'SPEECH_GENERATION' as const;

/**
 * What the Empire has approved for one capability.
 *
 * The order is deliberate: the Founder's own table FIRST, because a figure he
 * signed outranks one derived from a provider's invoice. The ratified uplift
 * answers for every capability whose provider cost is measured.
 */
/**
 * ─── THE MARGIN FLOOR — AND WHY IT ONLY EVER RAISES ─────────────────────────
 *
 *   Two of the Founder's instructions meet here, and they are not the same:
 *
 *     «يجب تطبيق القاعدة على كل عملية مدفوعة موجودة فعليًا في المنصة»
 *        — price = actual provider cost × 1.70, everywhere.      (2026-11-03)
 *
 *     «تبقى الأسعار والباقات القائمة كما اعتمدها المؤسس»
 *        — an approved price is not changed without his order.   (2026-11-02)
 *
 *   Read as a replacement, the first would LOWER image generation from the 200
 *   he signed to the 170 the rule derives. That is a live price change, and
 *   lowering one is no more mine to do than raising one.
 *
 *   Read as a FLOOR, both hold completely: his signed figure stands wherever
 *   it already clears his own margin, and the rule binds only where the signed
 *   figure has fallen BELOW the cost it was meant to cover. Nothing is ever
 *   lowered; something is raised only when the alternative is selling under
 *   the margin he ratified.
 *
 *   MEASURED 2026-11-03, which is why this exists at all: the «إعلاني» style
 *   sends `resolution: '2k'`, nano-banana-2 at 2K costs 150 published credits,
 *   and 200 units is 1.33× that — under his 1.70. At 1K the same operation
 *   costs 100 and 200 units is 2.0×, comfortably clear. One operation, one
 *   signed price, two costs — because the provider's unit is image × resolution
 *   and ours was only image.
 *
 *   And the floor NEVER invents a cost. An unpublished, unmeasured
 *   configuration yields no floor at all, and the signed price stands as it
 *   is — because a floor computed from a guessed cost is a guessed price.
 */
/**
 * The published cost of this capability in this configuration, or null.
 *
 * Only the image acts have a cost that moves with a configuration today, and
 * only one configuration moves it: the resolution the Empire sends. Anything
 * else answers null, which yields no floor rather than a guessed one.
 */
function imageCostFor(capability: string, dimension: string): number | null {
  const IMAGE_ACTS = ['IMAGE_GENERATION', 'INFOGRAPHIC', 'IMAGE_EDIT', SCENE_CAPABILITY];
  if (!IMAGE_ACTS.includes(capability)) return null;
  return imageCreditsAtResolution(dimension);
}

function flooredBySovereignRule(
  price: SovereignPrice,
  costCredits: number | null,
  dimension: string,
): SovereignPrice {
  if (price.unitsPerQuantity === null || costCredits === null) return price;

  const floor = Math.ceil(costCredits * NEW_CAPABILITY_UPLIFT);
  if (floor <= price.unitsPerQuantity) return price;

  return {
    ...price,
    status: 'derived-ratified',
    unitsPerQuantity: floor,
    authority:
      `${price.authority} — RAISED to the Founder's margin floor: published cost `
      + `${costCredits} credits at ${dimension} × ${NEW_CAPABILITY_UPLIFT} `
      + `(official-provider-tariff.ts, read ${TARIFF_SOURCE.readOn})`,
    note:
      `The signed figure of ${price.unitsPerQuantity} is below cost × ${NEW_CAPABILITY_UPLIFT} `
      + `for this configuration, so the ruling of 2026-11-03 binds. Awaiting the `
      + `Founder's ratification of the raised figure.`,
  };
}

/**
 * What the Empire has approved for one capability.
 *
 * `dimension` is the provider configuration this act will actually run in —
 * an image's resolution today. It is optional because most capabilities have
 * a flat cost; where one does not, omitting it means the floor cannot be
 * computed and the signed price stands unchanged.
 */
export function sovereignPriceFor(capability: string, dimension?: string): SovereignPrice {
  // The export answers before the signed table, because the table's own
  // `MP4_PRODUCTION` row was superseded in both figure and basis and must
  // never be reached by an export asking what it costs.
  if (capability === MP4_EXPORT_CAPABILITY) {
    return {
      capability,
      status: 'approved',
      unitsPerQuantity: MP4_UNITS_PER_SECOND,
      quantity: 'per-final-second',
      authority: 'local-export-pricing.ts · MP4_UNITS_PER_SECOND · Founder ruling 2026-11-02, decision 2',
      note: 'Counted on the FINAL file\'s own duration, rounded up once '
        + `(${MP4_ROUNDING.id}). It supersedes MP4_PRODUCTION (70 per requested `
        + 'second, 2026-09-27), which no road reads.',
    };
  }

  // Speaking: priced per character, from the measured subscription, with the
  // ratified uplift already applied. The gate multiplies by the characters
  // and rounds once.
  if (capability === SPEECH_CAPABILITY) {
    return {
      capability,
      status: 'derived-ratified',
      unitsPerQuantity: SPEECH_UNITS_PER_CHARACTER,
      quantity: 'per-character',
      authority: `speech-pricing.ts · measured ${VOICE_SUBSCRIPTION.usd} USD ÷ `
        + `${VOICE_SUBSCRIPTION.characters} characters × ${NEW_CAPABILITY_UPLIFT} · `
        + 'Founder ruling 2026-11-03, decision 2',
      note: 'It supersedes the flat 30 units per operation the cost catalog gave, which '
        + 'broke even at 395 characters and lost on every longer narration.',
    };
  }

  // Creating a voice identity: free by the provider's published terms and by
  // the Founder's ruling. It answers before the signed table, which has no
  // entry for it, and before the cost catalog, whose unexplained zero is
  // exactly what blocked it.
  if (capability === VOICE_IDENTITY_CAPABILITY) {
    return {
      capability,
      status: 'free-confirmed',
      unitsPerQuantity: 0,
      quantity: 'per-operation',
      authority: 'elevenlabs.io/pricing — Instant Voice Cloning is a plan feature with no '
        + 'per-identity charge (read 2026-11-03) · Founder ruling 2026-11-03',
      note: 'Zero because the provider charges nothing for it, NOT because a cost was never '
        + 'found. What the provider bills is the characters of generation, priced separately.',
    };
  }

  const approved = OPERATION_CONSUMPTION.find((r) => r.capability === capability);
  if (approved) {
    const signed: SovereignPrice = {
      capability,
      status: 'approved',
      unitsPerQuantity: approved.balancePerUnit,
      quantity: approved.quantity as PriceQuantity,
      authority: 'sovereign-value-balance.ts · OPERATION_CONSUMPTION · Founder decision 2026-09-27',
      ...(approved.note ? { note: approved.note } : {}),
    };
    return dimension === undefined
      ? signed
      : flooredBySovereignRule(signed, imageCostFor(capability, dimension), dimension);
  }

  if ((UPLIFT_CAPABILITIES as readonly string[]).includes(capability)) {
    const rule = MEASURED_COSTS.find((r) => r.capability === capability)!;
    const derived: SovereignPrice = {
      capability,
      status: 'derived-ratified',
      // ONE unit of the basis, so a caller can multiply by the quantity it
      // actually has. The full job price comes from `priceNewCapability`,
      // which also applies the ratified rounding.
      unitsPerQuantity: Math.ceil(rule.providerCreditsPerUnit * NEW_CAPABILITY_UPLIFT),
      quantity: rule.basis as PriceQuantity,
      authority: `new-capability-pricing.ts · measured ${rule.providerCreditsPerUnit} × ${NEW_CAPABILITY_UPLIFT} · Chief Architect 2026-10-12, rounding ratified 2026-10-13`,
      note: 'The whole-job price, with rounding applied once, comes from priceNewCapability().',
    };
    return dimension === undefined
      ? derived
      : flooredBySovereignRule(derived, imageCostFor(capability, dimension), dimension);
  }

  return {
    capability,
    status: 'absent',
    unitsPerQuantity: null,
    quantity: null,
    authority: 'none — no approved figure exists in any pricing authority',
  };
}

/**
 * Every capability any pricing authority speaks for, with its verdict.
 *
 * Exported so a report, and the test beside this file, can state the Empire's
 * pricing position without any file transcribing a number.
 */
export function allSovereignPrices(): readonly SovereignPrice[] {
  const names = new Set<string>([
    ...OPERATION_CONSUMPTION.map((r) => r.capability),
    ...UPLIFT_CAPABILITIES,
    MP4_EXPORT_CAPABILITY,
  ]);
  // NOT `.map(sovereignPriceFor)`: `map` passes the INDEX as the second
  // argument, which is now the provider dimension — so every entry after the
  // first would have been priced against a resolution called "1".
  return [...names].sort().map((name) => sovereignPriceFor(name));
}

/** Re-exported so a caller never needs to know which authority answered. */
export { priceNewCapability };
