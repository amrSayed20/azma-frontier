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
/** The existing markup, recorded for contrast only. Unchanged by this package. */
export const EXISTING_OPERATION_MARKUP = 1.00 as const;

export const UPLIFT_STATUS =
  'COMPARISON SCENARIO — neither 60% nor 75% is approved, and neither is applied '
  + 'by any code path. The existing 100% markup on the six established operations '
  + 'is untouched.';

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
    // The cheaper documented mode. The expensive one is recorded in the text,
    // because presenting only one of two published rates would be a half-truth.
    providerRate: 20,
    providerRateText: '20 credits/second prompted, 48 credits/second realistic',
    providerEvidence: 'provider-documented',
    billingVariables: [
      'MODE — prompted (20/s) or realistic (48/s); a 2.4× difference',
      'DURATION — end_seconds, chosen by the Creator',
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
      'which mode the Empire will offer — the rate differs 2.4×',
      'one authorized paid job at a known duration, to confirm credits per second',
      'a Chief Architect ruling on the uplift',
    ],
  },
  {
    operation: 'lip-sync',
    endpoint: '/v1/lip-sync',
    costStepWhenPriced: 'LIP_SYNC',
    unit: 'per-frame',
    providerRate: 1,
    providerRateText: '1 credit per frame of video, doubled on pro',
    providerEvidence: 'provider-documented',
    billingVariables: [
      'FRAME COUNT — the charge is per frame, so duration × fps is the cost',
      'FPS — the request accepts `max_fps_limit`, so capping fps CAPS THE CHARGE: '
        + 'at 12 fps a five-second clip costs half what it costs at 24',
      'QUALITY — "pro" doubles the per-frame rate',
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
      'whether "pro" is ever offered, which doubles the rate',
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
