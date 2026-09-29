/**
 * AZMA OS — ميزان القيمة السيادي · THE SOVEREIGN VALUE BALANCE
 *
 * The one unit a Creator ever sees. It belongs to AZMA, not to a payment
 * provider and not to a model provider, and it must survive the replacement
 * of either without a Creator noticing.
 *
 * FINAL FOUNDER DECISION, 2026-09-27. Every number below is his; none may be
 * changed by an engineer. Where the arithmetic of an approved number does not
 * behave the way the directive describes it, that is RECORDED beside it
 * rather than silently corrected — correcting it would be changing his price,
 * and hiding it would be letting the Empire advertise something untrue.
 *
 * ─── THE FIVE NUMBERS THAT MUST NEVER BE MERGED ─────────────────────────────
 *
 *   A · PROVIDER ACQUISITION COST — what AZMA pays a provider. Measured.
 *   B · AZMA INTERNAL COST        — A plus operating cost. Operating cost is
 *                                   UNKNOWN, so B is UNKNOWN BY CONSTRUCTION.
 *   C · CUSTOMER UNIT VALUE       — what one Balance unit is worth in money.
 *   D · CUSTOMER SALE PRICE       — what a Creator actually paid.
 *   E · GROSS CONTRIBUTION        — D minus A. NEVER called profit: B is
 *                                   unknown and E does not clear it.
 *   F · UNKNOWN OPERATING COST    — storage, bandwidth, compute, remux, voice.
 *                                   Named on every calculation, never buried.
 */

import {
  CREDIT_USD, CREDIT_EGP, FX,
  costTruthFor, type CostBasis,
} from '../cost-engine/qiyamah-cost-truth';

// ─────────────────────────────────────────────────────────────────────────────
// THE UNIT
// ─────────────────────────────────────────────────────────────────────────────

export const SOVEREIGN_VALUE_BALANCE = {
  nameAr: 'ميزان القيمة السيادي',
  shortAr: 'الميزان',
  /** Internal shorthand. A guard holds that it reaches no creator surface. */
  internalCode: 'SVB',
} as const;

/**
 * THE DISPLAY SCALE, fixed by the Founder: $20 buys 14,400 units.
 *
 * This is a tenfold reduction of the older $20 / 144,000 reference, made so a
 * Creator's balance reads in hundreds and thousands instead of six figures.
 * It is a RENAMING OF THE SAME VALUE, not a repricing: every approved
 * consumption figure was divided by ten in the same directive, so what a
 * Creator can actually produce for a pound is unchanged.
 *
 * It is a CUSTOMER denomination. It has never been and must never become a
 * provider acquisition cost — that confusion once produced a cost basis wrong
 * by an order of magnitude.
 */
export const BALANCE_VALUE_REFERENCE = {
  usd: 20,
  units: 14_400,
  source: 'FINAL FOUNDER DECISION 2026-09-27',
  supersedes: '$20 / 144,000 (same value, ten times the digits)',
} as const;

/** $0.001388… per unit. Derived from the reference, never typed. */
export const BALANCE_UNIT_USD = BALANCE_VALUE_REFERENCE.usd / BALANCE_VALUE_REFERENCE.units;

/** ≈ 0.0719861 EGP per unit, at the recorded FX basis. */
export const BALANCE_UNIT_EGP = BALANCE_UNIT_USD * FX.usdToEgp;

// ─────────────────────────────────────────────────────────────────────────────
// THE APPROVED PACKAGES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ─── THE BALANCE DOES NOT EXPIRE ────────────────────────────────────────────
 *
 *   FOUNDER'S RULING, 2026-09-28: «كذلك نعم ألغِ الـ28 يوم».
 *
 *   It settles a contradiction between two of his own instruments. POLICY:
 *   REFUNDS & CREDIT BALANCE v1.0, §4:
 *
 *       «Paid credits purchased by the user do not expire merely because time
 *        has passed … the balance remains in the account and does not lapse.»
 *
 *   against the BALANCE EXPIRY & CARRY-FORWARD AMENDMENT of 2026-09-27, which
 *   gave the three standard packages 28 days and الريادة six months with a
 *   third of the remainder removed. Both were his. They could not both be true
 *   of the same money, and the policy governs.
 *
 *   ─── ONE THING INFERRED, AND SAID OUT LOUD RATHER THAN BURIED ────────
 *
 *   He named the 28 days. الريادة's six-month rule removed a third of a real
 *   Balance BY THE PASSAGE OF TIME, which is exactly what §4 forbids of «paid
 *   credits» — and الريادة is paid. So it goes with them. If he meant الريادة
 *   to keep its own ending, one word restores it; this note exists so that
 *   inference is visible in the law itself and not only in a commit.
 */
export type PackageValidity = 'does-not-expire';

export interface SovereignPackage {
  readonly packageId: string;
  readonly nameAr: string;
  readonly priceEgp: number;
  readonly balanceUnits: number;
  readonly validity: PackageValidity;
  /** One-time. NOTHING here is a subscription; nothing auto-renews. */
  readonly recurrence: 'one-time';
  readonly transferable: false;
}

/**
 * ─── APPROVED. DO NOT ALTER A SINGLE FIGURE. ────────────────────────────────
 */
export const SOVEREIGN_PACKAGES: readonly SovereignPackage[] = [
  { packageId: 'asas',     nameAr: 'الأساس',   priceEgp: 99,    balanceUnits: 1_375, validity: 'does-not-expire', recurrence: 'one-time', transferable: false },
  { packageId: 'irtiqaa',  nameAr: 'الارتقاء', priceEgp: 249,   balanceUnits: 3_450, validity: 'does-not-expire', recurrence: 'one-time', transferable: false },
  { packageId: 'ihtiraf',  nameAr: 'الاحتراف', priceEgp: 499,   balanceUnits: 6_900, validity: 'does-not-expire', recurrence: 'one-time', transferable: false },
  { packageId: 'riyada',   nameAr: 'الريادة',  priceEgp: 1_200, balanceUnits: 16_670, validity: 'does-not-expire', recurrence: 'one-time', transferable: false },
];

export const packageById = (id: string): SovereignPackage | undefined =>
  SOVEREIGN_PACKAGES.find((p) => p.packageId === id);

/** What one unit costs inside a given package. The truth-teller. */
export const unitPriceEgp = (pkg: SovereignPackage): number => pkg.priceEgp / pkg.balanceUnits;

/**
 * ─── الريادة, CORRECTED BY THE FOUNDER AND NOW AT PARITY ────────────────────
 *
 *   FINAL AMENDMENT 2026-09-27 replaced 8,640 units with 16,670.
 *
 *   WHAT THE OLD FIGURE WAS: 1,200 EGP for 8,640 units is 0.13889 EGP per
 *   unit — 1.93 TIMES the rate of every other package, for Balance that also
 *   expires. A Creator would have paid 578 EGP more than the same Balance
 *   costs inside الأساس. That was reported rather than quietly shipped, and
 *   the Founder corrected the number.
 *
 *   WHAT IT IS NOW: 1,200 / 16,670 = 0.0719856 EGP per unit — the reference
 *   rate exactly, and by a hair the keenest of the four. The overcharge is
 *   gone.
 *
 *   THE ONE THING STILL NOT A BONUS: the amendment names 2,778 of those units
 *   a «Leadership Bonus», being the 200 EGP part of a 1,200 EGP price. But
 *   the Creator PAYS that 200 EGP, and 1,200 EGP buys exactly 16,670 units at
 *   the standard rate. Nothing here is given: the composition describes how
 *   the price was reasoned, not value added on top of it.
 *
 *   So the units stand exactly as approved and the composition is RECORDED,
 *   while `MAY_CLAIM_BONUS` stays false — no creator-facing surface may call
 *   those 2,778 a gift, a bonus or a discount, because they were bought.
 *   «It MUST NOT claim a discount that is not mathematically real.»
 *
 *   SUPERSEDED 2026-09-27 by the carry-forward amendment: الريادة is no
 *   longer the only package with an end. The three standard packages now run
 *   a 28-day cycle. The difference that remains is what happens AT the end —
 *   a standard Balance carries forward in full if the Creator buys again,
 *   while الريادة loses a third and returns the rest permanently.
 */
export const RIYADA_COMPOSITION = {
  packageId: 'riyada',
  /** The Founder's approved composition, recorded as he defined it. */
  baseUnits: 13_892,
  bonusUnits: 2_778,
  baseValueEgp: 1_000,
  bonusValueEgp: 200,
  /** 13,892 + 2,778 — and a guard holds this equals the package's own units. */
  totalUnits: 16_670,
  unitPriceEgp: 1200 / 16_670,
  ordinaryUnitPriceEgp: 99 / 1375,
  /** ≈1.0 — parity. It was 1.929 before the amendment. */
  timesDearerThanOrdinary: (1200 / 16_670) / (99 / 1375),
  supersededUnits: 8_640,
  /** The Creator paid for every unit, the 2,778 included. */
  MAY_CLAIM_BONUS: false as const,
  MAY_CLAIM_DISCOUNT: false as const,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// TOMBSTONE — الريادة'S SIX MONTHS, AND THE STANDARD 28-DAY CYCLE
// ─────────────────────────────────────────────────────────────────────────────
//
//   REMOVED 2026-09-28 by the Founder's ruling «كذلك نعم ألغِ الـ28 يوم»,
//   under POLICY: REFUNDS & CREDIT BALANCE v1.0 §4 — «Paid credits purchased
//   by the user do not expire merely because time has passed».
//
//   What stood here computed deductions from a Creator's Balance by the clock:
//
//     · `riyadaExpiry(n)`      — removed ⌊n/3⌋ of what was left at six months
//     · `RIYADA_PERIOD_MS`     — 182 days
//     · `standardCycleEnd(n)`  — ended a Balance at 28 days unless bought again
//     · `STANDARD_CYCLE_MS`    — 28 days
//     · `CARRY_FORWARD_WINDOW` — the undecided edge of «the following cycle»
//
//   They are DELETED, not disabled behind a flag. A function that can still
//   compute a deduction is a deduction waiting for a caller, and the Empire's
//   own rule is that what is rejected is removed and never covered.
//
//   Nothing replaces them, because nothing takes the place of time here: a
//   paid Balance is spent by its owner, or it stays.
//

// ─────────────────────────────────────────────────────────────────────────────
// WHAT AN OPERATION CONSUMES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ─── THE DETERMINISM RULE ───────────────────────────────────────────────────
 *
 *   A Creator is charged for WHAT THEY ASKED FOR. Never for what the provider
 *   reported, and never for what the finished file turned out to measure.
 *
 *   The one measured H3 production requested 6 seconds, the provider REPORTED
 *   6, and the file measured 6.583. Three numbers for one production. Billing
 *   on the provider's report puts the invoice at the mercy of a provider's
 *   rounding; billing on the file charges for 0.583 seconds nobody chose and
 *   nobody could predict. The requested quantity is the only one the Creator
 *   picked, saw before pressing, and gets twice.
 */
export type BillableQuantity = 'per-operation' | 'per-requested-second' | 'per-image';

export interface ConsumptionRule {
  readonly capability: string;
  readonly balancePerUnit: number;
  readonly quantity: BillableQuantity;
  /** The cost-truth capability this is priced against — may be null. */
  readonly pricingBasisCapability: string | null;
  readonly note?: string;
}

/**
 * ─── APPROVED CONSUMPTION. FOUNDER'S FIGURES. ───────────────────────────────
 */
export const OPERATION_CONSUMPTION: readonly ConsumptionRule[] = [
  { capability: 'IMAGE_GENERATION', balancePerUnit: 200, quantity: 'per-image',
    pricingBasisCapability: 'IMAGE_GENERATION' },
  { capability: 'INFOGRAPHIC', balancePerUnit: 200, quantity: 'per-image',
    pricingBasisCapability: 'INFOGRAPHIC' },
  { capability: 'IMAGE_EDIT', balancePerUnit: 200, quantity: 'per-image',
    pricingBasisCapability: 'IMAGE_EDIT' },
  { capability: 'UPSCALE_2X', balancePerUnit: 50, quantity: 'per-operation',
    pricingBasisCapability: 'UPSCALE_2X' },

  // ── VIDEO IS PRICED ON VEO, NOT ON THE MODEL THAT PRODUCES IT ──────────
  //
  //   The allocated production binding is MiniMax H3 at a MEASURED 48
  //   provider credits per requested second. The Founder has ruled the
  //   COMMERCIAL basis is Veo 3.1 at 96 — twice as much — and that the
  //   cheaper provider cost must NOT be substituted for it.
  //
  //   So the customer price does not fall when a cheaper binding is chosen,
  //   and the Empire is not exposed if the binding changes back. The gap
  //   between the two is real contribution and is reported as such; it is
  //   never described to a Creator, who sees only the Balance.
  { capability: 'VIDEO_GENERATION', balancePerUnit: 200, quantity: 'per-requested-second',
    pricingBasisCapability: 'VIDEO_CREATION_STANDARD',
    note: 'Priced on the Veo 3.1 basis (96 credits/s) by Founder ruling, NOT on the allocated H3 binding (48 credits/s). Per REQUESTED second.' },
  { capability: 'MOTION', balancePerUnit: 200, quantity: 'per-requested-second',
    pricingBasisCapability: 'VEO_MOTION',
    note: 'Per REQUESTED second of animation.' },

  // ── RAS AL AMR AND STORYBOARD ──────────────────────────────────────────
  //
  //   Customer consumption only. NOTHING of Ras Al Amr is implemented here —
  //   the directive forbids beginning it. `pricingBasisCapability` is null
  //   because no provider charge has been measured for either: the storyboard
  //   provider is open-source and the MP4 assembly runs on our own host.
  //   A null basis is the honest record. It is not a zero cost.
  // ── مكمن الغاية: THE ONLY BALANCE TRANSACTION IN THAT CHAMBER ──────────
  //
  //   FOUNDER, 2026-09-29: «اعاده التاطير تتكلف 20 نقطه تخصم من الرصيد لكل
  //   منصه يعاد تأطير الاصل ليتناسب معها، ولن يكون بمكمن الغايه ايه معاملات
  //   من الرصيد بخلاف اعاده التاطير، وهى تتكلف خصم 20 نقطه من رصيد المستخدم
  //   بعد الحصول على موافقته».
  //
  //   PER OPERATION, and one operation is one PLATFORM: three platforms is
  //   three charges, because three files are produced. Charged only after the
  //   Creator's explicit approval — `verifyCostApproval` refuses otherwise.
  //
  //   `pricingBasisCapability` is null and that is the honest record: the
  //   reframe is local ffmpeg and contacts no provider, so there is no
  //   measured provider charge behind it. A null basis is not a zero cost —
  //   the 20 is the Founder's commercial figure, not a derived one.
  { capability: 'PLATFORM_REFRAME', balancePerUnit: 20, quantity: 'per-operation',
    pricingBasisCapability: null,
    note: 'Founder ruling 2026-09-29. One charge per platform reframed. Local ffmpeg scale+crop — no provider is contacted. The only balance transaction in مكمن الغاية.' },

  { capability: 'MP4_PRODUCTION', balancePerUnit: 70, quantity: 'per-requested-second',
    pricingBasisCapability: null,
    note: 'Founder commercial basis 5 EGP/s. Final assembly/export only — if a new paid generation is invoked it is charged separately, and never twice.' },
  { capability: 'STORYBOARD_IMAGE', balancePerUnit: 70, quantity: 'per-image',
    pricingBasisCapability: null,
    note: 'Founder commercial basis 5 EGP/image. Open-source provider: no external charge exists, and none is fabricated.' },
  { capability: 'STORYBOARD_VIDEO', balancePerUnit: 70, quantity: 'per-requested-second',
    pricingBasisCapability: null,
    note: 'Founder commercial basis 5 EGP/s. Open-source provider.' },
];

export const consumptionFor = (capability: string): ConsumptionRule | undefined =>
  OPERATION_CONSUMPTION.find((r) => r.capability === capability);

/**
 * ─── THE PRICING GATE — CLOSED 2026-09-27 ───────────────────────────────────
 *
 *   TRUE. Every price, Balance and consumption figure above is the Founder's
 *   final approved number, and الريادة — the last one still in dispute — was
 *   corrected by him to 16,670 in the closing amendment.
 *
 *   ─── WHY THIS FLAG NOW SAYS ONLY ONE THING ───────────────────────────
 *
 *   It used to mean two: «the prices are approved» AND «a payment has been
 *   proven». Those are different facts with different owners, and a flag
 *   meaning two things becomes false the moment they disagree — which is
 *   exactly where they stand today.
 *
 *   This one means: THE PRICES ARE APPROVED. That is true.
 *
 *   Whether money can be taken is a SEPARATE gate and it is still shut: no
 *   payment-gateway secret key exists, so the checkout route refuses with
 *   `payment_gateway_unavailable` whatever this flag says. Nothing can be
 *   sold today, and the reason is kept where the reason belongs rather than
 *   borrowed by a flag about prices.
 */
export const BALANCE_PRICING_APPROVED = true as const;

/**
 * What still prevents a sale — which is NOT the pricing.
 *
 * The gateway is deliberately not named: this layer prices the Empire's own
 * unit, and naming a payment provider in it, even in a sentence of
 * explanation, is the first inch of a dependency the architecture forbids.
 */
export const PAYMENT_PROOF_STATUS = {
  pricingApproved: true,
  paymentProvenInSandbox: false,
  paymentProvenInProduction: false,
  blockedBy:
    'No payment-gateway SECRET key exists on the server. The key supplied was a PUBLISHABLE ' +
    'one, and the gateway answered it HTTP 403 permission_denied. Until a secret key and a ' +
    'webhook signing secret are configured, no payment can be taken and none is simulated.',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// THE CALCULATION
// ─────────────────────────────────────────────────────────────────────────────

export interface OperationEconomics {
  readonly capability: string;
  readonly quantity: number;
  readonly providerCostEgp: number | null;
  readonly providerCostUsd: number | null;
  readonly providerCostBasis: CostBasis;
  readonly balanceConsumed: number;
  readonly balanceValueEgp: number;
  readonly grossContributionEgp: number | null;
  readonly grossMarginPercent: number | null;
  readonly unknownOperatingCosts: readonly string[];
  readonly approved: boolean;
}

const UNKNOWN_OPERATING = [
  'STORAGE', 'BANDWIDTH', 'COMPUTE_CPU_GPU_SERVER',
  'POST_PRODUCTION_SILENCE_REMUX', 'VOICE_AND_TTS',
] as const;

/**
 * The whole economics of one act, every number beside its basis.
 * `quantity` is images, operations, or REQUESTED seconds — never
 * provider-reported and never file-measured.
 */
export function priceOperation(capability: string, quantity = 1): OperationEconomics {
  const rule = consumptionFor(capability);
  const balanceConsumed = rule ? rule.balancePerUnit * quantity : 0;
  const balanceValueEgp = balanceConsumed * BALANCE_UNIT_EGP;

  const cost = rule?.pricingBasisCapability ? costTruthFor(rule.pricingBasisCapability) : undefined;
  const credits = cost?.credits ?? null;
  const providerCostEgp = credits === null ? null : credits * quantity * CREDIT_EGP;
  const providerCostUsd = credits === null ? null : credits * quantity * CREDIT_USD;

  return {
    capability, quantity,
    providerCostEgp, providerCostUsd,
    providerCostBasis: cost?.basis ?? 'UNKNOWN',
    balanceConsumed, balanceValueEgp,
    grossContributionEgp: providerCostEgp === null ? null : balanceValueEgp - providerCostEgp,
    grossMarginPercent: providerCostEgp === null || balanceValueEgp === 0
      ? null : ((balanceValueEgp - providerCostEgp) / balanceValueEgp) * 100,
    unknownOperatingCosts: [...UNKNOWN_OPERATING],
    approved: BALANCE_PRICING_APPROVED,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// WHAT A CREATOR MAY SEE
// ─────────────────────────────────────────────────────────────────────────────

export interface CreatorFacingCost {
  readonly capability: string;
  readonly balanceConsumed: number;
  readonly unitNameAr: string;
}

/**
 * The Creator's view, and deliberately nothing more: no provider, no provider
 * credit, no provider cost, no margin, no model name. A guard pins the field
 * list so it cannot grow one of those by accident.
 */
export function creatorFacingCost(capability: string, quantity = 1): CreatorFacingCost {
  const rule = consumptionFor(capability);
  return {
    capability,
    balanceConsumed: rule ? rule.balancePerUnit * quantity : 0,
    unitNameAr: SOVEREIGN_VALUE_BALANCE.nameAr,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// WHAT REMAINS THE FOUNDER'S TO DECIDE
// ─────────────────────────────────────────────────────────────────────────────

// ─────────────────────────────────────────────────────────────────────────────
// GIFT BALANCE — WHAT MAY BE GIVEN, SAID SO IT CANNOT BE MISREAD
// ─────────────────────────────────────────────────────────────────────────────

/**
 * The Empire MAY grant Balance to a subscriber. It does not promise to.
 *
 * ─── WHY THE WORDING IS THE WHOLE FEATURE ───────────────────────────────────
 *
 *   «قد تمنح» is a discretion. «تمنح» is an entitlement a Creator can demand
 *   and an advertising regulator can hold the Empire to. One letter apart and
 *   an entirely different promise, so the sentence a Creator reads is fixed
 *   HERE, once, rather than written afresh by whoever builds the next screen.
 *
 *   Two things it must never say: an amount, or a condition that sounds like
 *   a rule. «Buy the largest package and receive 500» is a contract. What
 *   this says instead is that gifts exist, arrive by the Empire's own choice,
 *   and are visible in the ledger when they arrive.
 *
 *   Every granted gift is an ordinary ledger credit like any other: it is
 *   recorded, it does not expire, and it is not transferable.
 */
export const GIFT_BALANCE = {
  /** The one sentence a creator surface may show. Guarded. */
  noticeAr:
    'قد تمنح الإمبراطورية وحداتٍ من الميزان هديةً لمشتركيها، في مناسبات تختارها هي. '
    + 'وهي تفضّلٌ لا استحقاق، ولا تُطلب، وتظهر في سجلّ رصيدك حين تُمنح.',
  /** Discretionary. Never promised, never scheduled, never an amount. */
  isEntitlement: false as const,
  isPromised: false as const,
  /** A granted gift behaves exactly like purchased ordinary Balance. */
  expires: false as const,
  transferable: false as const,
  /** Granted only by a recorded administrative action. */
  grantedBy: 'recorded administrative ledger event',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// WHAT MAY CROSS TO A BROWSER
// ─────────────────────────────────────────────────────────────────────────────

export const VALIDITY_AR: Record<PackageValidity, string> = {
  'does-not-expire': 'لا تنتهي',
};

/** Exactly the fields a creator-facing surface may show. */
export interface CreatorFacingPackage {
  readonly packageId: string;
  readonly nameAr: string;
  readonly priceEgp: number;
  readonly balanceUnits: number;
  readonly validityAr: string;
}

/**
 * The packages, reduced to what a Creator sees.
 *
 * ─── WHY A PROJECTION AND NOT THE ARRAY ─────────────────────────────────────
 *
 *   This module imports the cost-truth table: provider credit rates, dollar
 *   acquisition cost, the FX rate. Importing THIS file from a `'use client'`
 *   component would bundle that table into JavaScript any visitor can read —
 *   the Empire's provider costs, published, by accident, through a price list.
 *
 *   So nothing client-side imports this module. A server component reads it
 *   and passes THIS shape down: four names, four prices, four balances, and a
 *   validity already in Arabic. No cost, no basis, no provider, no margin —
 *   not because a browser would render them, but because a browser would
 *   RECEIVE them.
 */
export function creatorFacingPackages(): readonly CreatorFacingPackage[] {
  return SOVEREIGN_PACKAGES.map((p) => ({
    packageId: p.packageId,
    nameAr: p.nameAr,
    priceEgp: p.priceEgp,
    balanceUnits: p.balanceUnits,
    validityAr: VALIDITY_AR[p.validity],
  }));
}

// ─────────────────────────────────────────────────────────────────────────────
// WHAT A CREATOR IS TOLD — ONE VOCABULARY, NOT ONE PER SCREEN
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Every sentence a creator-facing surface may say about the Balance, fixed
 * here once.
 *
 * ─── WHY THE WORDS LIVE BESIDE THE NUMBERS ──────────────────────────────────
 *
 *   The packages are about to appear on two different surfaces — the end of a
 *   visitor's journey and the Creator's own Balance page — and more will
 *   follow. If each screen writes its own sentence about the 28 days, the
 *   Empire will be making four slightly different promises about the same
 *   rule, and the one a Creator relies on will be whichever screen they
 *   happened to read. The policy documents state these same rules in prose;
 *   these are the same rules in the one place a surface may read them from.
 *
 *   `GIFT_BALANCE.noticeAr` deliberately stays where it is: its wording is a
 *   legal distinction in itself and already carries its own reasoning.
 */
export const BALANCE_NOTICES_AR = {
  /**
   * REWRITTEN 2026-09-28. It read «صلاحيته ثمانية وعشرون يوماً» — and the
   * Founder cancelled that. A sentence about a Creator's money is the last
   * place a superseded rule may survive.
   */
  standardValidity:
    'رصيدك لا ينتهي. ما اشتريتَه يبقى في حسابك، ولا يسقط بمرور الوقت مهما طالت المدّة التي لا تستعمل فيها المنصّة.',
  /**
   * What replaced the carry-forward half. There is nothing to carry forward
   * now, because nothing ends — and saying «يُرحَّل» about a Balance that
   * never lapses would invent a condition the Creator does not have to meet.
   */
  carryForward:
    'ولا يُردّ الرصيد نقداً ولا يُصرف ولا يُحوَّل إلى حساب بنكي — وهذا مستقلٌّ تماماً عن بقائه: فهو باقٍ، وغير قابل للصرف.',
  /** Said plainly because the word «package» invites the wrong assumption. */
  notASubscription:
    'وليس هذا اشتراكاً: لا تجديد تلقائي، ولا خصم دوري، ولا شيء يُسحب من بطاقتك بلا طلبك، ولا شيء تحتاج إلى إلغائه. '
    + 'وانتهاء أيّ اشتراك أو عدم تجديده لا يمسّ رصيدك المشترى.',
  /**
   * الريادة no longer has an ending of its own. Its six months removed a
   * third of a real Balance by the clock, which is what §4 forbids.
   */
  riyadaValidity:
    'ويسري هذا على الريادة كما يسري على غيرها: لا مدّة تنتهي، ولا يُحذف منها شيء بمرور الوقت.',
  /** The determinism rule. A Creator sees one number, twice. */
  chargedOnRequested:
    'وتُحاسَب على ما طلبتَه لا على ما أنتجه النظام: المدّة التي اخترتَها هي المدّة التي تُخصم، ويُعرض عليك الاستهلاك قبل التنفيذ دائماً.',
  /** Nothing is transferable, in either direction. */
  notTransferable: 'ولا يُنقل الميزان بين الحسابات.',
} as const;

export const PENDING_FOUNDER_DECISIONS: readonly string[] = [
  'RIYADA_BONUS_WORDING — the approved composition names 2,778 units a «bonus», but the Creator pays the 200 EGP they cost: 1,200 EGP buys exactly 16,670 at the standard rate. The units are correct and final; only the word «bonus» is unsupported, and no surface uses it. See RIYADA_COMPOSITION.',
  'COURTESY_REGENERATION — whether a discretionary free re-run is offered on creative dissatisfaction, and how often. Nothing is granted until this is ruled.',
  'VAT — whether Egyptian VAT applies to the package price, and whether prices are inclusive.',
];
