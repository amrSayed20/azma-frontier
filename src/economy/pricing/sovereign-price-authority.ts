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

/** How a Creator's charge is counted. The three are never interchangeable. */
export type PriceQuantity = 'per-image' | 'per-operation' | 'per-requested-second' | 'per-frame';

export type PriceStatus =
  /** The Founder approved this figure directly, in `OPERATION_CONSUMPTION`. */
  | 'approved'
  /** Derived by the ratified uplift from a measured provider cost. */
  | 'derived-ratified'
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
 * ─── THE SCENE'S OWN ENTRY — PREPARED, AND DELIBERATELY NOT ACTIVE ──────────
 *
 *   RULED 2026-11-02 (decision 2): a commissioned scene gets its OWN price
 *   classification. It is not `STORYBOARD_IMAGE` merely because that name
 *   exists in the table — that figure (70) was set for an open-source
 *   storyboard component that charges nothing externally, and it is read by
 *   no line in this repository. The scene is produced by `generateImage` →
 *   Magic Hour → `nano-banana-2`, a PAID provider measured at 100 credits.
 *
 *   «لا تَعتمِد ٩٨ وحدةً سعرًا نهائيًّا تلقائيًّا» — the break-even is a
 *   calculation, not an approval. And «لا تُفعِّل أيَّ سعرٍ جديدٍ للمشهد
 *   قبل اعتمادِ قيمتِه صراحةً».
 *
 *   So the classification exists, by name, and carries **no number**. Asking
 *   for it answers `absent`, which every caller already treats as «refuse,
 *   and never charge zero». The day a value is written here the scene road
 *   begins charging it with no other change; until then it stays refused,
 *   and the refusal is the ruling being obeyed rather than a defect.
 */
export const SCENE_CAPABILITY = 'RAS_AMR_SCENE' as const;

/**
 * The value the owner has approved for a commissioned scene.
 *
 * `null` means «not yet approved». It is NOT zero, and nothing may read it
 * as a price. A test holds it at null so that activating it is a deliberate,
 * visible act with the owner's figure in the diff.
 */
export const SCENE_APPROVED_UNITS: number | null = null;

/**
 * What the Empire has approved for one capability.
 *
 * The order is deliberate: the Founder's own table FIRST, because a figure he
 * signed outranks one derived from a provider's invoice. The ratified uplift
 * answers only for the five it names.
 */
export function sovereignPriceFor(capability: string): SovereignPrice {
  // The scene's own classification, awaiting the owner's figure. It answers
  // before the signed table is consulted, because it is not in it yet — and
  // it answers `absent` while `SCENE_APPROVED_UNITS` is null, so the road
  // refuses rather than charging anything.
  if (capability === SCENE_CAPABILITY) {
    if (SCENE_APPROVED_UNITS === null) {
      return {
        capability,
        status: 'absent',
        unitsPerQuantity: null,
        quantity: null,
        authority: 'awaiting the owner’s figure — ruled 2026-11-02, decision 2',
        note: 'A commissioned scene is produced by a PAID provider (Magic Hour, '
          + 'nano-banana-2, 100 credits measured). Break-even is 98 units, which is '
          + 'a calculation and not an approval. See docs/PRE_EXECUTION_PRICE_MAP.md.',
      };
    }
    return {
      capability,
      status: 'approved',
      unitsPerQuantity: SCENE_APPROVED_UNITS,
      quantity: 'per-image',
      authority: 'sovereign-price-authority.ts · SCENE_APPROVED_UNITS · owner ruling',
    };
  }

  const approved = OPERATION_CONSUMPTION.find((r) => r.capability === capability);
  if (approved) {
    return {
      capability,
      status: 'approved',
      unitsPerQuantity: approved.balancePerUnit,
      quantity: approved.quantity as PriceQuantity,
      authority: 'sovereign-value-balance.ts · OPERATION_CONSUMPTION · Founder decision 2026-09-27',
      ...(approved.note ? { note: approved.note } : {}),
    };
  }

  if ((UPLIFT_CAPABILITIES as readonly string[]).includes(capability)) {
    const rule = MEASURED_COSTS.find((r) => r.capability === capability)!;
    return {
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
  ]);
  return [...names].sort().map(sovereignPriceFor);
}

/** Re-exported so a caller never needs to know which authority answered. */
export { priceNewCapability };
