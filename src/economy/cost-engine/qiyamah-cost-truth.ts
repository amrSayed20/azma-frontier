/**
 * AZMA OS — QIYAMAH COST TRUTH
 *
 * What a creative operation ACTUALLY costs the Empire, in the provider's unit,
 * in the dollars AZMA really paid, and in the pounds a Cairo bank would charge.
 *
 * ─── THE THREE RULES THIS FILE EXISTS TO ENFORCE ────────────────────────────
 *
 *   1. COST IS NOT PRICE. Nothing here is a customer price, a margin, a
 *      subscription or an AZMA Unit. It is what leaves the Empire's pocket.
 *
 *   2. UNKNOWN IS NOT ZERO. An operation whose charge was never measured is
 *      recorded UNKNOWN and stays UNKNOWN. No estimate is allowed to stand in
 *      for a measurement, because an invented number is indistinguishable from
 *      a real one the moment it is written down.
 *
 *   3. THE BASIS IS WHAT AZMA PAID, not what the provider advertises. A
 *      marketing price describes a stranger's purchase, not ours.
 *
 * ─── THE ACQUISITION BASIS ──────────────────────────────────────────────────
 *
 *   $19 bought 14,000 Magic Hour credits. That purchase — not any public rate
 *   card — is the cost basis for every figure below.
 *
 *   Note this is NOT the $20 / 144,000 figure that appears elsewhere in the
 *   Empire's economics. That one is a CUSTOMER unit value, and using it as a
 *   cost basis would understate what a credit costs AZMA by a factor of nine.
 *   The two must never be confused; they answer different questions.
 */

/** What AZMA actually paid, and for how many credits. */
export const CREDIT_ACQUISITION = {
  usdPaid: 19,
  creditsReceived: 14_000,
  /** Ruled by the Founder, 2026-09-27. */
  recordedOn: '2026-09-27',
} as const;

/** $0.001357142857… per Magic Hour credit. Derived, never typed by hand. */
export const CREDIT_USD = CREDIT_ACQUISITION.usdPaid / CREDIT_ACQUISITION.creditsReceived;

/**
 * The exchange rate, with its source named so a reader can judge it.
 *
 * STATED BY THE FOUNDER in the closure directive of 2026-09-27. It is recorded
 * as his figure rather than dressed as a live market read, because no rate was
 * independently fetched during this closure. Black-market rates are forbidden.
 */
export const FX = {
  usdToEgp: 51.83,
  rateDate: '2026-09-27',
  source: 'Founder directive, AZMA OS Final Model Allocation & Cost Closure (2026-09-27)',
} as const;

/** ≈ 0.07034 EGP per credit. */
export const CREDIT_EGP = CREDIT_USD * FX.usdToEgp;

export const usdFor = (credits: number): number => credits * CREDIT_USD;
export const egpFor = (credits: number): number => credits * CREDIT_EGP;

/**
 * MEASURED — the charge came from a real production's own record
 *            (operation_ledger.actual_resource_cost or
 *            vault_assets.metadata.providerCreditsCharged).
 * BASIS    — a measured rate adopted as the Empire's standard for a capability,
 *            which may differ from what the currently allocated model charges.
 * HISTORICAL — a real measurement of a RETIRED model. Never a future cost.
 * UNKNOWN  — never measured. Not estimated. Not filled in.
 */
export type CostBasis = 'MEASURED' | 'BASIS' | 'HISTORICAL' | 'UNKNOWN';

export interface CostTruthEntry {
  readonly capability: string;
  readonly model: string | null;
  readonly provider: string | null;
  /** Credits per unit, or null when UNKNOWN. */
  readonly credits: number | null;
  readonly unit: string;
  readonly basis: CostBasis;
  /** The production this number was read from — the evidence, not a citation. */
  readonly measuredFrom: string | null;
  readonly effectiveFrom: string;
  readonly note?: string;
}

/**
 * ─── THE CATALOG ────────────────────────────────────────────────────────────
 *
 * Every credit figure below was read from a production this Empire actually
 * paid for. None was derived from a rate card, and none was rounded to look
 * tidy.
 */
export const QIYAMAH_COST_TRUTH: readonly CostTruthEntry[] = [
  {
    capability: 'IMAGE_GENERATION',
    model: 'nano-banana-2',
    provider: 'magic-hour-image',
    credits: 100,
    unit: '1 image',
    basis: 'MEASURED',
    measuredFrom: 'operation 719475cb-235a-4b54-8578-5e356969cc16 · job cmujkc33903p5nq019ccursva · 1376x768',
    effectiveFrom: '2026-09-27',
  },
  {
    capability: 'INFOGRAPHIC',
    model: 'nano-banana-2',
    provider: 'magic-hour-image',
    credits: 100,
    unit: '1 infographic image',
    basis: 'MEASURED',
    measuredFrom: 'same binding and endpoint as IMAGE_GENERATION — the infographic is an image intent that REQUIRES this model',
    effectiveFrom: '2026-09-27',
    note: 'The retired Nano Banana Pro charge of 150 is no longer the basis for any image.',
  },
  {
    capability: 'VIDEO_CREATION_STANDARD',
    model: 'veo-3-1',
    provider: 'magic-hour-video',
    credits: 96,
    unit: '1 second of generated video',
    basis: 'BASIS',
    measuredFrom: 'Veo 3.1 measured at 384 credits / 4s',
    effectiveFrom: '2026-09-27',
    note: 'The Empire’s standard second. Deliberately NOT the allocated model’s own rate — see VIDEO_CREATION_ACTUAL.',
  },
  {
    capability: 'VIDEO_CREATION_ACTUAL',
    model: 'minimax-h3',
    provider: 'magic-hour-video',
    credits: 48,
    unit: '1 second of REQUESTED duration',
    basis: 'MEASURED',
    measuredFrom: 'operation 5747cdb0-9b88-4c59-bbbe-b38f551f508b · job cmujkfp570230ne01kvj8a4ul · 288 credits / 6s requested',
    effectiveFrom: '2026-09-27',
    note: 'Per REQUESTED second. The file measured 6.583s while the provider reported 6, so a per-produced-second rate would be a different number and is not claimed here.',
  },
  {
    capability: 'VEO_MOTION',
    model: 'veo-3-1',
    provider: 'magic-hour-image-to-video',
    credits: 96,
    unit: '1 second of animated video',
    basis: 'MEASURED',
    measuredFrom: '384 credits / 4s',
    effectiveFrom: '2026-09-27',
  },
  {
    capability: 'IMAGE_EDIT',
    model: 'nano-banana-2',
    provider: 'magic-hour-image-editor',
    credits: 100,
    unit: '1 edited image',
    basis: 'MEASURED',
    measuredFrom: 'measured image-edit production',
    effectiveFrom: '2026-09-27',
  },
  {
    capability: 'UPSCALE_2X',
    model: null,
    provider: 'magic-hour-image-upscaler',
    credits: 25,
    unit: '1 upscaled image at 2x',
    basis: 'MEASURED',
    measuredFrom: 'measured 2x upscale production',
    effectiveFrom: '2026-09-27',
  },
  {
    capability: 'VIDEO_CREATION_SEEDANCE',
    model: 'seedance-2-0',
    provider: 'magic-hour-video',
    credits: 1008,
    unit: '6-second video (168 credits/s)',
    basis: 'HISTORICAL',
    measuredFrom: 'operation fc04dca1-9f4f-4388-86c7-e6c923f2ea99 · job cmuivyolk02qmjt01ujlfdsqg',
    effectiveFrom: '2026-09-22',
    note: 'RETIRED 2026-09-27. Kept because it happened and was paid for. It is NOT a current Qiyamah production cost and must never be used as one.',
  },

  // ─── EVERYTHING BELOW IS UNKNOWN, AND STAYS UNKNOWN ───────────────────────
  //
  //   Each of these is a real cost the Empire bears. None has an authoritative
  //   per-operation measurement or an approved allocation method, so none gets
  //   a number. Attributing a guessed share of a server bill to one creative
  //   act would corrupt every figure above it.
  {
    capability: 'POST_PRODUCTION_SILENCE_REMUX',
    model: null,
    provider: null,
    credits: null,
    unit: '1 video master',
    basis: 'UNKNOWN',
    measuredFrom: null,
    effectiveFrom: '2026-09-27',
    note: 'Local ffmpeg stream-copy. NO provider charge — it contacts no provider. Its compute cost on our own host is unmeasured, so it is UNKNOWN, not zero.',
  },
  {
    capability: 'STORAGE',
    model: null, provider: null, credits: null, unit: 'per asset',
    basis: 'UNKNOWN', measuredFrom: null, effectiveFrom: '2026-09-27',
    note: 'No approved per-asset allocation method exists.',
  },
  {
    capability: 'BANDWIDTH',
    model: null, provider: null, credits: null, unit: 'per delivery',
    basis: 'UNKNOWN', measuredFrom: null, effectiveFrom: '2026-09-27',
  },
  {
    capability: 'COMPUTE_CPU_GPU_SERVER',
    model: null, provider: null, credits: null, unit: 'per operation',
    basis: 'UNKNOWN', measuredFrom: null, effectiveFrom: '2026-09-27',
    note: 'One server carries the whole Empire; no authoritative method attributes a share of it to one creative act.',
  },
  {
    capability: 'STORYBOARD',
    model: null, provider: null, credits: null, unit: '1 storyboard',
    basis: 'UNKNOWN', measuredFrom: null, effectiveFrom: '2026-09-27',
    note: 'The PixelLab/storyboard binding is unchanged by this closure and its charge has never been measured.',
  },
  {
    capability: 'VOICE_AND_TTS',
    model: null, provider: null, credits: null, unit: 'per character',
    basis: 'UNKNOWN', measuredFrom: null, effectiveFrom: '2026-09-27',
    note: 'Belongs to Ras Al Amr, not to Qiyamah. Documented provider rates exist but no AZMA production has been measured.',
  },
];

export const costTruthFor = (capability: string): CostTruthEntry | undefined =>
  QIYAMAH_COST_TRUTH.find((e) => e.capability === capability);

export interface ResolvedCost {
  readonly credits: number | null;
  readonly usd: number | null;
  readonly egp: number | null;
  readonly basis: CostBasis;
}

/**
 * The cash cost of a capability, or nulls when it is UNKNOWN.
 *
 * `units` multiplies a per-second or per-image entry. It NEVER converts one
 * capability's rate into another's — a second of Veo and a second of H3 are
 * different numbers and this function will not blend them.
 */
export function resolveCost(capability: string, units = 1): ResolvedCost {
  const entry = costTruthFor(capability);
  if (!entry || entry.credits === null) {
    return { credits: null, usd: null, egp: null, basis: entry?.basis ?? 'UNKNOWN' };
  }
  const credits = entry.credits * units;
  return { credits, usd: usdFor(credits), egp: egpFor(credits), basis: entry.basis };
}
