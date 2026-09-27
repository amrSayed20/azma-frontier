/**
 * AZMA OS — ميزان القيمة السيادي · THE SOVEREIGN VALUE BALANCE
 *
 * The one unit a Creator ever sees. It belongs to AZMA, not to a payment
 * provider and not to a model provider, and it must survive the replacement
 * of either without a Creator noticing.
 *
 * ─── THE FIVE NUMBERS THAT MUST NEVER BE MERGED ─────────────────────────────
 *
 *   A · PROVIDER ACQUISITION COST — what AZMA pays a provider. Measured.
 *   B · AZMA INTERNAL COST        — A plus operating cost. Operating cost is
 *                                   UNKNOWN, so B is UNKNOWN BY CONSTRUCTION.
 *   C · CUSTOMER UNIT VALUE       — what one Balance unit is worth in money.
 *   D · CUSTOMER SALE PRICE       — what a Creator actually paid.
 *   E · GROSS CONTRIBUTION        — D minus A. Never called profit, because
 *                                   B is unknown and E does not clear it.
 *   F · UNKNOWN OPERATING COST    — storage, bandwidth, compute, remux. Named
 *                                   and left unquantified rather than buried.
 *
 *   Every function here returns the basis beside the number, so a figure can
 *   never be quoted without the reader knowing whether it was measured,
 *   derived, or is standing in for something nobody has measured.
 *
 * ─── WHY THE PROVIDER'S UNIT IS NOT THE CREATOR'S ───────────────────────────
 *
 *   A Magic Hour credit costs AZMA $0.001357. A Balance unit is worth
 *   $0.000139 to a Creator. They differ by roughly ten times and they measure
 *   different things: one is a purchase price AZMA paid, the other is a
 *   denomination AZMA sells. Showing a Creator a provider credit would be
 *   showing them somebody else's accounting — and it would chain the Empire's
 *   customer-facing numbers to a provider it must be able to replace.
 */

import {
  CREDIT_USD, CREDIT_EGP, FX,
  costTruthFor, type CostBasis,
} from '../cost-engine/qiyamah-cost-truth';

// ─────────────────────────────────────────────────────────────────────────────
// THE UNIT
// ─────────────────────────────────────────────────────────────────────────────

export const SOVEREIGN_VALUE_BALANCE = {
  /** What a Creator is shown. The Arabic name is the name. */
  nameAr: 'ميزان القيمة السيادي',
  /** Short Arabic form for inline use, e.g. «١٢٬٠٠٠ من الميزان». */
  shortAr: 'الميزان',
  /**
   * Internal shorthand. NOT shown to a Creator — the order that named this
   * unit was explicit that the acronym reaches no creator surface until UX
   * evidence says it helps. A guard holds that.
   */
  internalCode: 'SVB',
} as const;

/**
 * The customer value reference the Founder established: $20 buys 144,000
 * units of Balance. This is a CUSTOMER-side denomination and has never been,
 * and must never become, a provider acquisition cost — the two were confused
 * once, and using this figure as a cost basis understates what AZMA pays for
 * a provider credit by roughly ten times.
 */
export const BALANCE_VALUE_REFERENCE = {
  usd: 20,
  units: 144_000,
  source: 'Founder-established customer value reference',
  recordedOn: '2026-09-27',
} as const;

/** $0.0001388… per unit of Balance. Derived from the reference, not typed. */
export const BALANCE_UNIT_USD = BALANCE_VALUE_REFERENCE.usd / BALANCE_VALUE_REFERENCE.units;

/** ≈ 0.0071986 EGP per unit, at the recorded FX basis. */
export const BALANCE_UNIT_EGP = BALANCE_UNIT_USD * FX.usdToEgp;

// ─────────────────────────────────────────────────────────────────────────────
// WHAT AN OPERATION CONSUMES
// ─────────────────────────────────────────────────────────────────────────────

/**
 * ─── THE DETERMINISM RULE ───────────────────────────────────────────────────
 *
 *   A Creator is charged for WHAT THEY ASKED FOR. Never for what the provider
 *   reported, and never for what the finished file turned out to measure.
 *
 *   This is not pedantry. The one measured H3 production requested 6 seconds,
 *   the provider REPORTED 6, and the file measured 6.583. Three numbers for
 *   one production. Billing on the provider's report would make the Empire's
 *   invoice depend on a provider's rounding; billing on the file would charge
 *   a Creator for 0.583 seconds they never asked for and cannot predict.
 *
 *   The requested quantity is the only one the Creator chose, the only one
 *   they can see before pressing, and the only one that is the same number
 *   twice. So it is the billable one.
 */
export type BillableQuantity = 'per-image' | 'per-requested-second';

export interface ConsumptionRule {
  readonly capability: string;
  /** Units of Balance consumed per image, or per REQUESTED second. */
  readonly balancePerUnit: number;
  readonly quantity: BillableQuantity;
  /** The cost-truth capability whose measured charge this covers. */
  readonly coversCostCapability: string;
  readonly note?: string;
}

/**
 * ─── PENDING FOUNDER DECISION ───────────────────────────────────────────────
 *
 *   These consumption figures are a PROPOSAL, computed at a 100% gross
 *   contribution over the measured provider cost. They are not approved, and
 *   `BALANCE_PRICING_APPROVED` below is false, which makes the commercial
 *   surface refuse to sell rather than sell at a number nobody ratified.
 *
 *   Each figure is `ceil(provider cost EGP / balance unit EGP) × 2`, rounded
 *   to a readable number. The report puts the 0/50/100/150/200% columns in
 *   front of the Founder so the choice is his and is made on the arithmetic.
 */
export const OPERATION_CONSUMPTION: readonly ConsumptionRule[] = [
  { capability: 'IMAGE_GENERATION', balancePerUnit: 2000, quantity: 'per-image',
    coversCostCapability: 'IMAGE_GENERATION' },
  { capability: 'INFOGRAPHIC', balancePerUnit: 2000, quantity: 'per-image',
    coversCostCapability: 'INFOGRAPHIC' },
  { capability: 'IMAGE_EDIT', balancePerUnit: 2000, quantity: 'per-image',
    coversCostCapability: 'IMAGE_EDIT' },
  { capability: 'UPSCALE_2X', balancePerUnit: 500, quantity: 'per-image',
    coversCostCapability: 'UPSCALE_2X' },
  { capability: 'VIDEO_CREATION', balancePerUnit: 1000, quantity: 'per-requested-second',
    coversCostCapability: 'VIDEO_CREATION_ACTUAL',
    note: 'Per REQUESTED second. The provider reported 6 for a file that measured 6.583; neither of those is what the Creator chose.' },
  { capability: 'VEO_MOTION', balancePerUnit: 2000, quantity: 'per-requested-second',
    coversCostCapability: 'VEO_MOTION',
    note: 'Per REQUESTED second of animation.' },
];

export const consumptionFor = (capability: string): ConsumptionRule | undefined =>
  OPERATION_CONSUMPTION.find((r) => r.capability === capability);

/**
 * FALSE until the Founder ratifies the table above. While it is false the
 * commercial surface must refuse to sell: an unapproved price that quietly
 * works is worse than no price at all, because nobody discovers it until a
 * Creator has already been charged by it.
 */
export const BALANCE_PRICING_APPROVED = false as const;

// ─────────────────────────────────────────────────────────────────────────────
// THE CALCULATION
// ─────────────────────────────────────────────────────────────────────────────

export interface OperationEconomics {
  readonly capability: string;
  readonly quantity: number;
  /** A — what AZMA pays the provider. */
  readonly providerCostEgp: number | null;
  readonly providerCostUsd: number | null;
  readonly providerCostBasis: CostBasis;
  /** C × consumption — what the Creator's Balance is worth for this act. */
  readonly balanceConsumed: number;
  readonly balanceValueEgp: number;
  /** E — sale value minus provider cost. NOT profit; B is unknown. */
  readonly grossContributionEgp: number | null;
  readonly grossMarginPercent: number | null;
  /** F — named, never quantified, never folded into the numbers above. */
  readonly unknownOperatingCosts: readonly string[];
  readonly approved: boolean;
}

const UNKNOWN_OPERATING = [
  'POST_PRODUCTION_SILENCE_REMUX', 'STORAGE', 'BANDWIDTH',
  'COMPUTE_CPU_GPU_SERVER',
] as const;

/**
 * The whole economics of one act, with every number beside its basis.
 *
 * `quantity` is images, or REQUESTED seconds — never provider-reported and
 * never file-measured.
 */
export function priceOperation(capability: string, quantity = 1): OperationEconomics {
  const rule = consumptionFor(capability);
  const balanceConsumed = rule ? rule.balancePerUnit * quantity : 0;
  const balanceValueEgp = balanceConsumed * BALANCE_UNIT_EGP;

  const cost = rule ? costTruthFor(rule.coversCostCapability) : undefined;
  const credits = cost?.credits ?? null;
  const providerCostEgp = credits === null ? null : credits * quantity * CREDIT_EGP;
  const providerCostUsd = credits === null ? null : credits * quantity * CREDIT_USD;

  return {
    capability,
    quantity,
    providerCostEgp,
    providerCostUsd,
    providerCostBasis: cost?.basis ?? 'UNKNOWN',
    balanceConsumed,
    balanceValueEgp,
    grossContributionEgp: providerCostEgp === null ? null : balanceValueEgp - providerCostEgp,
    grossMarginPercent: providerCostEgp === null || balanceValueEgp === 0
      ? null
      : ((balanceValueEgp - providerCostEgp) / balanceValueEgp) * 100,
    // Always listed. A margin that silently ignores them is not a margin.
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
 * credit, no provider cost, no margin, no model name. A guard holds that this
 * object's shape cannot grow one of those fields by accident.
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
// PROPOSED PACKAGES — NOT APPROVED
// ─────────────────────────────────────────────────────────────────────────────

export interface ProposedPackage {
  readonly packageId: string;
  readonly nameAr: string;
  readonly priceEgp: number;
  readonly balanceUnits: number;
  /** One-time purchase. Recurring is not offered — see the closure report. */
  readonly recurrence: 'one-time';
}

/**
 * Balance granted is `price ÷ unit value`, rounded to a readable figure, so
 * every package sells the SAME value per pound. A package that quietly gave
 * a better rate at a higher price would be a second unit value, and there is
 * only one.
 *
 * NOT APPROVED. `BALANCE_PRICING_APPROVED` is false and the commercial
 * surface refuses to sell these.
 */
export const PROPOSED_PACKAGES: readonly ProposedPackage[] = [
  { packageId: 'bidaya', nameAr: 'بداية', priceEgp: 99, balanceUnits: 13_750, recurrence: 'one-time' },
  { packageId: 'masar', nameAr: 'مسار', priceEgp: 249, balanceUnits: 34_500, recurrence: 'one-time' },
  { packageId: 'sultan', nameAr: 'سلطان', priceEgp: 499, balanceUnits: 69_000, recurrence: 'one-time' },
];

export interface PackageEconomics extends ProposedPackage {
  readonly impliedUnitValueEgp: number;
  /** How far the package's price covers provider cost, if fully consumed. */
  readonly providerCostIfFullyConsumedEgp: number;
  readonly grossContributionEgp: number;
  readonly grossMarginPercent: number;
  readonly approved: boolean;
}

/**
 * A package's economics if its whole Balance were spent on one capability.
 * Stated per capability because a Creator's actual mix is unknown, and an
 * averaged «expected» mix would be an invented number.
 */
export function packageEconomics(pkg: ProposedPackage, capability: string): PackageEconomics {
  const rule = consumptionFor(capability);
  const cost = rule ? costTruthFor(rule.coversCostCapability) : undefined;
  const operations = rule ? pkg.balanceUnits / rule.balancePerUnit : 0;
  const providerCost = cost?.credits ? operations * cost.credits * CREDIT_EGP : 0;
  return {
    ...pkg,
    impliedUnitValueEgp: pkg.priceEgp / pkg.balanceUnits,
    providerCostIfFullyConsumedEgp: providerCost,
    grossContributionEgp: pkg.priceEgp - providerCost,
    grossMarginPercent: ((pkg.priceEgp - providerCost) / pkg.priceEgp) * 100,
    approved: BALANCE_PRICING_APPROVED,
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// POLICIES THE FOUNDER HAS NOT YET RULED ON
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Named here rather than invented. Each of these changes what a Creator is
 * owed, so none may be decided by an engineer — and none may be left
 * undecided and silently implemented as a default either, which is the
 * failure this list exists to prevent.
 */
export const PENDING_FOUNDER_DECISIONS: readonly string[] = [
  'BALANCE_EXPIRY — does unused Balance expire, and after how long?',
  'BALANCE_REFUNDABLE — is purchased Balance refundable, and in what window?',
  'BALANCE_TRANSFERABLE — may Balance move between Creators?',
  'REFUND_AFTER_CONSUMPTION — what is owed when Balance was already spent?',
  'CONSUMPTION_TABLE — the margin the OPERATION_CONSUMPTION figures assume.',
  'PACKAGE_PRICES — the names, prices and Balance of the proposed packages.',
  'INSUFFICIENT_BALANCE — refuse the act, or offer a top-up mid-journey?',
];
