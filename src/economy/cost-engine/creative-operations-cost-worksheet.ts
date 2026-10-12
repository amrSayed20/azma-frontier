/**
 * AZMA OS — COST WORKSHEET FOR THE FOUR NEW OPERATIONS  (§4)
 *
 * ─── THIS IS A WORKSHEET, NOT A PRICE ──────────────────────────────────────
 *
 *   It is DOCUMENTATION in executable form, and nothing reads it to charge a
 *   Creator. It is not registered in `CHAMBER_STEPS`, not in the Sovereign
 *   Value Balance consumption table, and not in `provider-cost-catalog.ts`.
 *   A test asserts that no pricing authority imports it.
 *
 *   The construction directive is explicit on every one of these points:
 *
 *     · the 100% markup on existing operations is unchanged
 *     · the 60% and 75% uplifts are COMPARISON SCENARIOS. Neither is approved
 *       and neither is applied
 *     · no provider cost is invented, and consumer-plan credits are not
 *       equated with API credits without evidence
 *
 * ─── WHAT CHANGED ON 2026-10-11, AND WHAT DID NOT ──────────────────────────
 *
 *   The previous revision of this file recorded all four provider costs as
 *   UNKNOWN. Three of them are now DOCUMENTED, read directly from the
 *   provider's own rate table rather than inferred, remembered, or borrowed:
 *
 *       https://docs.magichour.ai/api-reference/models     retrieved 2026-10-11
 *
 *       Image Background Remover    5 per image
 *       Face Swap Photo            10 per image
 *       Face Swap Video            24 credits/second at 24fps
 *       Lip Sync                    1 credit/frame, doubled on pro
 *       AI Talking Photo           20 credits/second prompted, 48 realistic
 *
 *   Both instruments agreed: the flattened page text and the rendered table
 *   markup carry the same figures.
 *
 *   AND A CORRECTION I OWE THE RECORD: the previous revision carried a
 *   remembered figure for lip sync — «~150 credits for 5 seconds» — recorded
 *   as a LEAD and never as evidence. The documented rate is 1 credit per
 *   frame, which at 24 fps is 120 credits for five seconds.
 *
 *   THE REMEMBERED NUMBER WAS WRONG. Refusing to record it as evidence is the
 *   only reason it never became a price.
 *
 *   What is still NOT measured, for any of them: a real completed job's own
 *   `credits_charged`. A documented rate is the provider's published promise;
 *   a measured charge is what it actually took. They are different kinds of
 *   fact and this file keeps them in different fields.
 */

import type { CreativeOperationId } from '../../core/sovereign-ai-integration/adapters/magic-hour-creative-operations';
import { CREDIT_USD, CREDIT_EGP, FX } from './qiyamah-cost-truth';

// ─────────────────────────────────────────────────────────────────────────────
// 1 · WHERE A NUMBER CAME FROM
// ─────────────────────────────────────────────────────────────────────────────

export type CostEvidence =
  /** Read from the provider's own published rate table, with a source URL. */
  | 'provider-documented'
  /** A real completed job returned `credits_charged`. The strongest basis. */
  | 'measured-from-a-real-charge'
  /** Nobody has established it. Never substituted with a neighbour's value. */
  | 'unknown';

/** The one source every documented figure in this file was read from. */
export const RATE_TABLE_SOURCE = {
  url: 'https://docs.magichour.ai/api-reference/models',
  retrievedOn: '2026-10-11',
  how: 'Read twice from the live page — the flattened text and the rendered '
    + 'table markup — and both carried identical figures.',
} as const;

/** The account the rates will be billed against. Read, never assumed. */
export const ACCOUNT_ENTITLEMENT = {
  endpoint: 'GET https://api.magichour.ai/v1/account',
  observedOn: '2026-10-11',
  httpStatus: 200,
  tier: 'creator',
  subscriptionActive: true,
  monthlyUsd: 19,
  creditsAvailableAtObservation: 13_276,
  /**
   * This is what settles a question three reports left open: the directive
   * warned against equating a consumer subscription with API access. The API's
   * OWN account endpoint returns this subscription and this credit balance, so
   * these are API credits on an API plan — not a website wallet.
   *
   * It does NOT by itself prove every endpoint is permitted on this tier. What
   * it proves is read above; the per-endpoint probes are separate evidence.
   */
  whatThisProves: 'an active, API-readable subscription and credit balance',
  whatItDoesNotProve: 'per-endpoint permission, and no completed paid job',
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// 2 · THE TWO COMPARISON SCENARIOS — NEITHER APPROVED, NEITHER APPLIED
// ─────────────────────────────────────────────────────────────────────────────

export const PROPOSED_UPLIFT_A = 0.60 as const;
export const PROPOSED_UPLIFT_B = 0.75 as const;
/**
 * Which of the two the Chief Architect has NAMED as his direction.
 *
 * 2026-10-11: «the Architect's selected direction for the four new QIYAMAH
 * operations is a 75% uplift on verified total cost basis as the preferred
 * financial scenario». 60% is retained as a comparison and must never be
 * quietly substituted for it.
 *
 * A direction is not a price. Nothing applies either figure, because the
 * «verified total cost basis» it multiplies does not exist yet for any of the
 * four — and 1.75 × an unverified basis is an unverified price wearing a
 * decimal point.
 */
export const SELECTED_UPLIFT_DIRECTION = PROPOSED_UPLIFT_B;
export const COMPARISON_UPLIFT = PROPOSED_UPLIFT_A;
/** The existing markup, recorded for contrast only. Unchanged by this package. */
export const EXISTING_OPERATION_MARKUP = 1.00 as const;

export const UPLIFT_STATUS =
  'COMPARISON SCENARIO — 75% is the Architect’s NAMED DIRECTION and 60% is kept '
  + 'for comparison, and neither is applied by any code path. The existing 100% '
  + 'markup on the six established operations is untouched. The uplift multiplies '
  + 'a VERIFIED total cost basis, and no operation has one.';

/**
 * ── WHAT THE UPLIFT IS FOR, SAID ONCE SO IT IS NOT MISREAD AS PROFIT ───────
 *
 *   The Architect's own words: it «is intended to help cover platform
 *   operating expenses and sustain the service; it is not equivalent to net
 *   profit». The worksheet therefore reports the difference between a
 *   Creator's price and the PROVIDER charge as a MARGIN, never as a profit —
 *   because the operating costs that margin exists to cover are the very
 *   numbers nobody has measured.
 */
export const UPLIFT_PURPOSE =
  'covers platform operating expenses and sustains the service; NOT net profit';

// ─────────────────────────────────────────────────────────────────────────────
// 3 · THE ROWS
// ─────────────────────────────────────────────────────────────────────────────

export interface CostRow {
  readonly operation: CreativeOperationId;
  /** Also the variant, where one operation has two endpoints. */
  readonly variant?: 'photo' | 'video';
  readonly endpoint: string;
  /** The step name the estimator WOULD use. Not registered with it today. */
  readonly costStepWhenPriced: string;
  readonly unit: 'per-image' | 'per-second' | 'per-frame';

  // ── 1 · the actual provider charge ───────────────────────────────────────
  readonly providerRate: number | null;
  readonly providerRateText: string;
  readonly providerEvidence: CostEvidence;
  /** What changes the charge. A rate without its variables is half a rate. */
  readonly billingVariables: readonly string[];
  /** How the FINAL charge is read back once a job completes. */
  readonly finalChargeRetrieval: string;
  /** What happens to the charge on failure, cancellation or a timeout. */
  readonly failureBilling: string;

  // ── 2 · AZMA's own operating cost ────────────────────────────────────────
  readonly operatingCostKnown: false;
  readonly operatingComponents: readonly string[];

  // ── 3/4/5/6/7 · derived, and only where the inputs allow ─────────────────
  readonly whatIsMissing: readonly string[];
}

/** A reference job, so the two uplifts can be compared on one concrete shape. */
export const REFERENCE_JOB = {
  imageCount: 1,
  seconds: 5,
  fps: 24,
  note: 'One image, or five seconds at 24 fps. Chosen because it is the smallest '
    + 'shape that exercises every billing mode, and because the lip-sync rate is '
    + 'per FRAME — a duration without a frame rate cannot be costed at all.',
} as const;

export const CREATIVE_COST_WORKSHEET: readonly CostRow[] = [
  {
    operation: 'background-removal',
    endpoint: '/v1/image-background-remover',
    costStepWhenPriced: 'BACKGROUND_REMOVAL',
    unit: 'per-image',
    providerRate: 5,
    providerRateText: '5 credits per image',
    providerEvidence: 'provider-documented',
    billingVariables: [
      'none documented — the rate is flat, independent of resolution',
    ],
    finalChargeRetrieval:
      'GET /v1/image-projects/{id} → credits_charged, on the completed job. The '
      + 'adapter already returns it and the runner records it as provenance.',
    failureBilling:
      'The provider documents automatic refund on error and cancellation for image '
      + 'operations. NOT verified against a real failure of this endpoint.',
    operatingCostKnown: false,
    operatingComponents: [
      'VARIABLE — one upload of the source, one download of the output',
      'VARIABLE — storage of the derived asset, kept without limit',
      'FIXED — the server that runs the request, already paid for',
    ],
    whatIsMissing: [
      'one authorized paid job, to confirm the documented 5 matches the charge',
      'a Chief Architect ruling on the uplift',
      'registration in CHAMBER_STEPS and the consumption table',
    ],
  },
  {
    operation: 'talking-photo',
    endpoint: '/v1/ai-talking-photo',
    costStepWhenPriced: 'TALKING_PHOTO',
    unit: 'per-second',
    // ── CORRECTED 2026-10-11, AND THE EARLIER FIGURE WAS WRONG ────────────
    //
    //   This row read `providerRate: 20` — the `prompted` rate — and listed
    //   «which mode the Empire will offer» as an open question. The question
    //   was already answered in the code and nobody had read it: the adapter
    //   sent NO mode, so the provider's own default applied, and that default
    //   is `realistic` at 48 credits/second. The basis was understated 2.4×.
    //
    //   The mode is now an explicit constant (TALKING_PHOTO_GENERATION_MODE),
    //   and this rate is the rate of the mode we actually send. `prompted`
    //   stays out of reach for a constitutional reason, not a priced one:
    //   these four acts take no brief, and `prompted` needs one.
    providerRate: 48,
    providerRateText: '48 credits/second (realistic — the mode this Empire sends); '
      + '20 credits/second for prompted, which requires a text prompt these acts never take',
    providerEvidence: 'provider-documented',
    billingVariables: [
      'MODE — realistic (48/s) is what we send; prompted (20/s) needs a brief',
      'DURATION — end_seconds, chosen by the Creator; documented to 300s realistic, 45s prompted',
      'max_resolution — documented, defaults to the plan maximum; we send none',
    ],
    finalChargeRetrieval:
      'GET /v1/video-projects/{id} → credits_charged. For video the figure at '
      + 'submission is an ESTIMATE and the completed job carries the final.',
    failureBilling:
      'Provider-documented automatic refund on error and cancellation. NOT verified '
      + 'against a real failure of this endpoint.',
    operatingCostKnown: false,
    operatingComponents: [
      'VARIABLE — two uploads (image + audio), one video download',
      'VARIABLE — storage of a video, materially larger than an image',
      'FIXED — the server that runs and polls the job',
    ],
    whatIsMissing: [
      'one authorized paid job at a known duration, to confirm 48 credits per second',
      'whether max_resolution changes the charge — documented as a cap, not as a rate',
      'a Chief Architect ruling on the uplift',
    ],
  },
  {
    operation: 'lip-sync',
    endpoint: '/v1/lip-sync',
    costStepWhenPriced: 'LIP_SYNC',
    unit: 'per-frame',
    providerRate: 1,
    providerRateText: '1 credit per frame in the `standard` mode this Empire now '
      + 'sends (the Architect’s ruling, 2026-10-12); `lite` also bills 1 and is '
      + 'kept as the alternative; `pro` bills 2',
    providerEvidence: 'provider-documented',
    billingVariables: [
      'FRAME COUNT — the charge is per frame, so duration × fps is the cost',
      'FPS — the request accepts `max_fps_limit`, so capping fps CAPS THE CHARGE: '
        + 'at 12 fps a five-second clip costs half what it costs at 24. We send none.',
      'MODE — lite (1/frame, what we send) · standard (1/frame) · pro (2/frame)',
    ],
    finalChargeRetrieval:
      'GET /v1/video-projects/{id} → credits_charged on completion. The provider '
      + 'states that credits are charged only for frames that actually render.',
    failureBilling:
      'Charged per rendered frame, so a partial render is partially charged — the '
      + 'one operation of the four where a failure may cost something. NOT verified.',
    operatingCostKnown: false,
    operatingComponents: [
      'VARIABLE — two uploads (video + audio), one video download',
      'VARIABLE — storage of a video',
      'FIXED — the server that runs and polls the job',
    ],
    whatIsMissing: [
      'the fps the Empire will cap at — it is the single biggest cost lever here',
      'A MEASURED charge for `standard`. The Architect ruled it the default on '
        + '2026-10-12 on the provider’s documented parity with `lite` (1 credit/'
        + 'frame, no new billable parameter). That parity is PUBLISHED, not measured '
        + 'in this Empire, and one paid `standard` job is what would settle it.',
      'whether `pro` is ever offered, which doubles the rate',
      'one authorized paid job, to confirm frames billed against frames requested',
      'a Chief Architect ruling on the uplift',
    ],
  },
  {
    operation: 'face-swap',
    variant: 'video',
    endpoint: '/v1/face-swap',
    costStepWhenPriced: 'FACE_SWAP',
    unit: 'per-second',
    providerRate: 24,
    providerRateText: '24 credits/second at 24 fps',
    providerEvidence: 'provider-documented',
    billingVariables: [
      'DURATION — end_seconds',
      'FPS — the published rate is quoted at 24 fps',
      'RENDERED FRAMES — the provider states credits are charged only for frames '
        + 'that actually render, so a partial render is partially charged',
      'STYLE VERSION — v1 · v2 · default; we send `default` explicitly',
    ],
    finalChargeRetrieval: 'GET /v1/video-projects/{id} → credits_charged on completion.',
    failureBilling:
      'Provider-documented automatic refund on error and cancellation. NOT verified.',
    operatingCostKnown: false,
    operatingComponents: [
      'VARIABLE — two uploads (video + source face), one video download',
      'VARIABLE — storage of a video',
      'FIXED — the server that runs and polls the job',
    ],
    whatIsMissing: [
      'the likeness and consent ACKNOWLEDGMENT must ship and be tested first',
      'then one authorized paid job',
      'then a Chief Architect ruling on the uplift',
    ],
  },
  {
    operation: 'face-swap',
    variant: 'photo',
    endpoint: '/v1/face-swap-photo',
    costStepWhenPriced: 'FACE_SWAP_PHOTO',
    unit: 'per-image',
    providerRate: 10,
    providerRateText: '10 credits per image',
    providerEvidence: 'provider-documented',
    billingVariables: ['none documented — flat per image'],
    finalChargeRetrieval: 'GET /v1/image-projects/{id} → credits_charged on completion.',
    failureBilling:
      'Provider-documented automatic refund on error and cancellation. NOT verified.',
    operatingCostKnown: false,
    operatingComponents: [
      'VARIABLE — two uploads, one image download',
      'VARIABLE — storage of a derived image',
      'FIXED — the server that runs the request',
    ],
    whatIsMissing: [
      'a ruling on whether the PHOTO variant is offered at all — the Empire '
        + 'presently integrates only the video route',
      'the likeness and consent acknowledgment, as above',
    ],
  },
];

// ─────────────────────────────────────────────────────────────────────────────
// 4 · THE SCENARIOS — COMPUTED, AND LABELLED AS SCENARIOS
// ─────────────────────────────────────────────────────────────────────────────

export interface ScenarioRow {
  readonly operation: string;
  readonly unit: string;
  /** Credits the provider charges for the reference job. */
  readonly providerCredits: number | null;
  readonly providerUsd: number | null;
  readonly providerEgp: number | null;
  /** AZMA's own cost. Null because it is unknown by construction. */
  readonly operatingEgp: null;
  /**
   * Total cost basis. Equals the provider charge ALONE, and is therefore an
   * UNDERSTATEMENT — the operating cost is a real cost that nobody has
   * measured, and omitting it makes every margin below look better than it is.
   */
  readonly totalCostBasisEgp: number | null;
  readonly creatorPriceAt60Egp: number | null;
  readonly creatorPriceAt75Egp: number | null;
  readonly netAt60Egp: number | null;
  readonly netAt75Egp: number | null;
  readonly caveat: string;
}

/** Credits the reference job consumes, per row. */
function referenceCredits(row: CostRow): number | null {
  if (row.providerRate === null) return null;
  switch (row.unit) {
    case 'per-image': return row.providerRate * REFERENCE_JOB.imageCount;
    case 'per-second': return row.providerRate * REFERENCE_JOB.seconds;
    case 'per-frame': return row.providerRate * REFERENCE_JOB.seconds * REFERENCE_JOB.fps;
    default: return null;
  }
}

const round = (n: number, p = 4): number => Number(n.toFixed(p));

// ──────────────────────────────────────────────────────────────────────────
// AN ESTIMATE OF THE JOB THAT WILL ACTUALLY BE SUBMITTED
//
//   The Architect, 2026-10-12: «ensure estimates use the actual submitted mode,
//   duration, frame rate, and other known billing variables».
//
//   So an estimate is not a number this module can always produce. For a
//   FRAME-billed act the charge is duration × fps, and this Empire sends no
//   `max_fps_limit` — the fps therefore belongs to the Creator's own clip, and
//   the Vault does not record it. An estimate computed without it would be an
//   estimate of a different job.
//
//   This function refuses instead, and names what is missing. A refusal a
//   caller must handle is worth more than a figure nobody can defend.
// ──────────────────────────────────────────────────────────────────────────

export interface SubmittedJob {
  readonly operation: CreativeOperationId;
  readonly variant?: 'photo' | 'video';
  /** The mode actually sent. Checked against the row’s own rate. */
  readonly mode?: string;
  readonly imageCount?: number;
  readonly seconds?: number;
  /** Required for a frame-billed act. The SOURCE clip’s rate, measured. */
  readonly fps?: number;
}

export type JobEstimate =
  | {
      readonly ok: true;
      readonly providerCredits: number;
      readonly providerEgp: number;
      /** Every variable the number was computed from. Never implicit. */
      readonly from: Readonly<Record<string, number | string>>;
      /** Documented, never measured — until a real job says otherwise. */
      readonly evidence: CostEvidence;
    }
  | { readonly ok: false; readonly missing: string };

export function estimateSubmittedJob(job: SubmittedJob): JobEstimate {
  const row = costRowFor(job.operation, job.variant);
  if (row.providerRate === null) return { ok: false, missing: 'a documented provider rate' };

  switch (row.unit) {
    case 'per-image': {
      const images = job.imageCount ?? 1;
      if (!(images > 0)) return { ok: false, missing: 'an image count greater than zero' };
      const credits = row.providerRate * images;
      return {
        ok: true, providerCredits: credits, providerEgp: round(credits * CREDIT_EGP),
        from: { rate: row.providerRate, imageCount: images, unit: row.unit },
        evidence: row.providerEvidence,
      };
    }
    case 'per-second': {
      if (!(job.seconds && job.seconds > 0)) {
        return { ok: false, missing: 'the duration actually submitted (end_seconds)' };
      }
      const credits = row.providerRate * job.seconds;
      return {
        ok: true, providerCredits: credits, providerEgp: round(credits * CREDIT_EGP),
        from: {
          rate: row.providerRate, seconds: job.seconds, unit: row.unit,
          mode: job.mode ?? 'NOT STATED — the rate above is the mode this Empire sends',
        },
        evidence: row.providerEvidence,
      };
    }
    case 'per-frame': {
      if (!(job.seconds && job.seconds > 0)) {
        return { ok: false, missing: 'the duration actually submitted (end_seconds)' };
      }
      if (!(job.fps && job.fps > 0)) {
        // THE REFUSAL THAT MATTERS. No fps, no frame count, no charge.
        return {
          ok: false,
          missing: 'the SOURCE clip’s frame rate. This act bills per frame and the '
            + 'Empire sends no max_fps_limit, so the fps is the clip’s own and must '
            + 'be measured before a charge can be stated.',
        };
      }
      const frames = Math.ceil(job.seconds * job.fps);
      const credits = row.providerRate * frames;
      return {
        ok: true, providerCredits: credits, providerEgp: round(credits * CREDIT_EGP),
        from: {
          rate: row.providerRate, seconds: job.seconds, fps: job.fps, frames,
          unit: row.unit, mode: job.mode ?? 'NOT STATED',
        },
        evidence: row.providerEvidence,
      };
    }
    default:
      return { ok: false, missing: 'a billing unit this function understands' };
  }
}


/**
 * Both scenarios, side by side, on the reference job.
 *
 * Arithmetic on a DOCUMENTED rate, presented as a scenario — not a price. The
 * operating cost is absent from the basis because it is unmeasured, and that
 * absence is stated in every row rather than quietly treated as zero.
 */
export function scenarios(): readonly ScenarioRow[] {
  return CREATIVE_COST_WORKSHEET.map((row) => {
    const credits = referenceCredits(row);
    if (credits === null) {
      return {
        operation: row.variant ? `${row.operation} (${row.variant})` : row.operation,
        unit: row.unit, providerCredits: null, providerUsd: null, providerEgp: null,
        operatingEgp: null, totalCostBasisEgp: null,
        creatorPriceAt60Egp: null, creatorPriceAt75Egp: null,
        netAt60Egp: null, netAt75Egp: null,
        caveat: 'No documented rate — nothing can be computed, and nothing is guessed.',
      };
    }
    const basisEgp = credits * CREDIT_EGP;
    const at60 = basisEgp * (1 + PROPOSED_UPLIFT_A);
    const at75 = basisEgp * (1 + PROPOSED_UPLIFT_B);
    return {
      operation: row.variant ? `${row.operation} (${row.variant})` : row.operation,
      unit: row.unit,
      providerCredits: credits,
      providerUsd: round(credits * CREDIT_USD),
      providerEgp: round(basisEgp),
      operatingEgp: null,
      totalCostBasisEgp: round(basisEgp),
      creatorPriceAt60Egp: round(at60, 3),
      creatorPriceAt75Egp: round(at75, 3),
      netAt60Egp: round(at60 - basisEgp, 3),
      netAt75Egp: round(at75 - basisEgp, 3),
      caveat:
        'The basis is the PROVIDER CHARGE ALONE. AZMA\'s operating cost is unmeasured '
        + 'and therefore absent, so both margins are overstated by whatever it is. '
        + `Rate is provider-DOCUMENTED, not measured from a charge. FX ${FX.usdToEgp} `
        + `EGP/USD, ${FX.rateDate}, ${FX.source}.`,
    };
  });
}

export function costRowFor(
  operation: CreativeOperationId,
  variant?: 'photo' | 'video',
): CostRow {
  const found = CREATIVE_COST_WORKSHEET.find(
    (r) => r.operation === operation && (variant === undefined || r.variant === variant),
  );
  if (!found) throw new Error(`no cost row for '${operation}'${variant ? ` (${variant})` : ''}`);
  return found;
}

/**
 * Whether a row's cost is MEASURED — the only basis that may ever open a paid
 * door. A documented rate is not enough: the catalog's gate reads the
 * readiness record, and that record stays `costBasisVerified: false` until a
 * real job has returned its charge.
 */
export function costIsMeasured(operation: CreativeOperationId): boolean {
  return CREATIVE_COST_WORKSHEET
    .filter((r) => r.operation === operation)
    .every((r) => r.providerEvidence === 'measured-from-a-real-charge');
}

/** Every row's missing inputs, for the acceptance report. */
export function worksheetGaps(): readonly { operation: string; missing: readonly string[] }[] {
  return CREATIVE_COST_WORKSHEET.map((r) => ({
    operation: r.variant ? `${r.operation} (${r.variant})` : r.operation,
    missing: r.whatIsMissing,
  }));
}
