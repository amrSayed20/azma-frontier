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

export type PackageValidity = 'no-expiry' | 'six-months';

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
  { packageId: 'asas',     nameAr: 'الأساس',   priceEgp: 99,    balanceUnits: 1_375, validity: 'no-expiry',  recurrence: 'one-time', transferable: false },
  { packageId: 'irtiqaa',  nameAr: 'الارتقاء', priceEgp: 249,   balanceUnits: 3_450, validity: 'no-expiry',  recurrence: 'one-time', transferable: false },
  { packageId: 'ihtiraf',  nameAr: 'الاحتراف', priceEgp: 499,   balanceUnits: 6_900, validity: 'no-expiry',  recurrence: 'one-time', transferable: false },
  { packageId: 'riyada',   nameAr: 'الريادة',  priceEgp: 1_200, balanceUnits: 8_640, validity: 'six-months', recurrence: 'one-time', transferable: false },
];

export const packageById = (id: string): SovereignPackage | undefined =>
  SOVEREIGN_PACKAGES.find((p) => p.packageId === id);

/** What one unit costs inside a given package. The truth-teller. */
export const unitPriceEgp = (pkg: SovereignPackage): number => pkg.priceEgp / pkg.balanceUnits;

/**
 * ─── A MEASURED FACT ABOUT الريادة, RECORDED AND NOT CORRECTED ──────────────
 *
 *   The three ordinary packages all sell a unit at ≈0.0720 EGP, which is the
 *   reference rate. الريادة sells one at 0.13889 EGP — 1.93 TIMES the price
 *   per unit of الأساس. At the ordinary rate its 8,640 units would cost 622
 *   EGP, so a Creator buying it pays 578 EGP MORE for the same Balance, and
 *   that Balance additionally expires in six months with a third of whatever
 *   remains removed.
 *
 *   The directive describes it as «1,000 EGP normal value + 200 EGP
 *   ADDITIONAL value». The arithmetic does not support the word additional.
 *
 *   The number is the Founder's and stands exactly as ordered. What does NOT
 *   stand is any claim about it: `MAY_CLAIM_BONUS` is false, and a guard
 *   forbids the word «إضافي» or «هدية» or «خصم» on this package anywhere a
 *   Creator can read it. An unreal discount is the one commercial statement
 *   the directive names as forbidden, and it is forbidden here by mechanism
 *   rather than by intention.
 */
export const RIYADA_VALUE_NOTE = {
  packageId: 'riyada',
  unitPriceEgp: 1200 / 8640,
  ordinaryUnitPriceEgp: 99 / 1375,
  timesDearer: (1200 / 8640) / (99 / 1375),
  whatItWouldCostAtOrdinaryRate: 8640 * (99 / 1375),
  MAY_CLAIM_BONUS: false as const,
  MAY_CLAIM_DISCOUNT: false as const,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// الريادة — WHAT HAPPENS AFTER SIX MONTHS
// ─────────────────────────────────────────────────────────────────────────────

export interface RiyadaExpiryOutcome {
  readonly remainingAtExpiry: number;
  readonly removed: number;
  readonly returnedAsOrdinary: number;
}

/**
 * At the end of the six-month period: a third of what is LEFT is removed, and
 * two thirds return as ordinary Balance.
 *
 *   · The returned Balance NEVER expires.
 *   · It starts no new period and restarts no countdown.
 *   · It is not transferable.
 *
 * The removed third is floored and the returned part takes the remainder, so
 * the two always sum to exactly what was there. A Creator never loses a unit
 * to a rounding rule nobody wrote down, and the Empire never returns one it
 * did not have.
 */
export function riyadaExpiry(remainingAtExpiry: number): RiyadaExpiryOutcome {
  const remaining = Math.max(0, Math.floor(remainingAtExpiry));
  const removed = Math.floor(remaining / 3);
  return { remainingAtExpiry: remaining, removed, returnedAsOrdinary: remaining - removed };
}

/** Six months, in milliseconds, from the moment the package was granted. */
export const RIYADA_PERIOD_MS = 182 * 24 * 60 * 60 * 1000;

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
 * ─── THE PACKAGE LOCK ───────────────────────────────────────────────────────
 *
 *   The directive permits this to become true only after SEVEN conditions,
 *   the fifth of which is «production proof passes».
 *
 *   It is FALSE, and the reason is not an oversight: no payment-gateway
 *   SECRET key exists on the server. The key supplied was a PUBLISHABLE one,
 *   and the gateway answered it HTTP 403 `permission_denied — Required:
 *   CHECKOUT_SESSIONS_READ`. No sandbox payment and no production payment has
 *   happened, so conditions 4 and 5 are unmet and this stays false.
 *
 *   The gateway is deliberately NOT NAMED here. This layer prices the
 *   Empire's own unit; naming a payment provider in it — even in a sentence
 *   of explanation — is the first inch of the dependency the architecture
 *   forbids, and a guard keeps that inch closed.
 *
 *   While it is false the commercial route REFUSES to sell. A price that
 *   quietly works before its proof is the failure this lock exists to
 *   prevent: nobody discovers it until a Creator has been charged by it.
 */
export const BALANCE_PRICING_APPROVED = false as const;

/** Exactly why, so the reason is never guessed from the flag alone. */
export const PRICING_LOCK_REASON =
  'Sandbox and production payment proof have not been performed: no payment-gateway SECRET ' +
  'key exists on the server (the key supplied was a PUBLISHABLE one, and the gateway answered ' +
  'it HTTP 403 permission_denied). Directive XXVII conditions 4 and 5 are unmet.';

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

export const PENDING_FOUNDER_DECISIONS: readonly string[] = [
  'RIYADA_UNIT_PRICE — الريادة sells a unit at 1.93x the price of every other package while being described as carrying additional value. The number stands as ordered; the claim does not. See RIYADA_VALUE_NOTE.',
  'COURTESY_REGENERATION — whether a discretionary free re-run is offered on creative dissatisfaction, and how often. Nothing is granted until this is ruled.',
  'VAT — whether Egyptian VAT applies to the package price, and whether prices are inclusive.',
];
