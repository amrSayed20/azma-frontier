/**
 * AZMA OS — COST WORKSHEET FOR THE FOUR NEW OPERATIONS  (§7)
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
 *     · the proposed 60% uplift is a PROPOSAL for later deliberation, and is
 *       not an instruction to charge anybody
 *     · the proposed 75% unified markup is NOT implemented
 *     · no provider cost is invented, and consumer-plan credits are not
 *       equated with API credits without evidence
 *
 *   So each row separates four things that are routinely confused:
 *
 *     providerCost      what the engine charges us — VERIFIED or UNKNOWN
 *     operatingCost     the Empire's own cost to run it — UNKNOWN BY CONSTRUCTION
 *     proposedUplift    a number the Chief Architect floated, recorded as a proposal
 *     creatorFacing     DERIVED, and therefore unknown wherever an input is
 *
 *   A row with an UNKNOWN provider cost yields an UNKNOWN creator-facing price.
 *   That is not a gap in the worksheet; it is the worksheet refusing to
 *   multiply a guess by a percentage and present the result as a price.
 */

import type { CreativeOperationId } from '../../core/sovereign-ai-integration/adapters/magic-hour-creative-operations';

/** Where a number came from. A figure that cannot say is not a figure. */
export type CostEvidence =
  /** The provider publishes it, or we measured it from a real charge. */
  | 'provider-documented'
  /** A real job returned `credits_charged`. The only truly verified basis. */
  | 'measured-from-a-real-charge'
  /** Nobody has established it. Never substituted with a neighbour's value. */
  | 'unknown';

export interface CostRow {
  readonly operation: CreativeOperationId;
  /** The step name the estimator WOULD use. Not registered with it today. */
  readonly costStepWhenPriced: string;
  readonly unit: 'per-image' | 'per-second' | 'per-operation';

  // ── A · what the engine charges the Empire ────────────────────────────────
  readonly providerCreditCost: number | null;
  readonly providerCreditUnit: 'magic-hour-credits';
  readonly providerEvidence: CostEvidence;
  readonly providerNote: string;

  // ── B · the Empire's own cost to run it ──────────────────────────────────
  //   Storage, bandwidth, the upload of two inputs, the download of one
  //   output. UNKNOWN BY CONSTRUCTION, exactly as the Balance module already
  //   records for every other capability.
  readonly operatingCostKnown: false;

  // ── C · a proposal, recorded as one ──────────────────────────────────────
  readonly proposedUpliftPercent: number;
  readonly proposedUpliftStatus: 'PROPOSAL — not approved, not applied';

  // ── D · derived, and unknown wherever an input is ────────────────────────
  readonly creatorFacingBalanceUnits: number | null;
  readonly creatorFacingStatus: 'UNKNOWN — requires a verified provider cost';

  /** What must happen before this row can price anything. */
  readonly whatIsMissing: readonly string[];
}

/**
 * The proposed uplift named in the directive, recorded so the deliberation has
 * a number to argue with. NOTHING multiplies by it.
 */
export const PROPOSED_NEW_OPERATION_UPLIFT_PERCENT = 60 as const;

/** The existing markup, recorded for contrast only. Unchanged by this package. */
export const EXISTING_OPERATION_MARKUP_PERCENT = 100 as const;

export const CREATIVE_COST_WORKSHEET: readonly CostRow[] = [
  {
    operation: 'background-removal',
    costStepWhenPriced: 'BACKGROUND_REMOVAL',
    unit: 'per-image',
    providerCreditCost: null,
    providerCreditUnit: 'magic-hour-credits',
    providerEvidence: 'unknown',
    providerNote:
      'The provider publishes no per-call price for /v1/image-background-remover, and no '
      + 'real job has been run. The image generator costs ~5 credits and the upscaler 50–200, '
      + 'so a removal plausibly sits between — but a plausible range is not a cost, and '
      + 'borrowing a neighbour\'s number is how a false limit gets written down.',
    operatingCostKnown: false,
    proposedUpliftPercent: PROPOSED_NEW_OPERATION_UPLIFT_PERCENT,
    proposedUpliftStatus: 'PROPOSAL — not approved, not applied',
    creatorFacingBalanceUnits: null,
    creatorFacingStatus: 'UNKNOWN — requires a verified provider cost',
    whatIsMissing: [
      'one authorized paid job, to read credits_charged from the provider',
      'a Chief Architect ruling on the uplift',
      'registration in CHAMBER_STEPS and the consumption table',
    ],
  },
  {
    operation: 'talking-photo',
    costStepWhenPriced: 'TALKING_PHOTO',
    unit: 'per-second',
    providerCreditCost: null,
    providerCreditUnit: 'magic-hour-credits',
    providerEvidence: 'unknown',
    providerNote:
      'No published figure was found for /v1/ai-talking-photo. Video operations on this '
      + 'engine are charged per rendered frame — estimated at submission and adjusted at '
      + 'completion — so the cost depends on a duration and a frame rate neither of which '
      + 'is known until a job completes.',
    operatingCostKnown: false,
    proposedUpliftPercent: PROPOSED_NEW_OPERATION_UPLIFT_PERCENT,
    proposedUpliftStatus: 'PROPOSAL — not approved, not applied',
    creatorFacingBalanceUnits: null,
    creatorFacingStatus: 'UNKNOWN — requires a verified provider cost',
    whatIsMissing: [
      'one authorized paid job at a known duration, to establish credits per second',
      'the engine\'s actual output frame rate, since the charge follows frames',
      'a Chief Architect ruling on the uplift',
    ],
  },
  {
    operation: 'lip-sync',
    costStepWhenPriced: 'LIP_SYNC',
    unit: 'per-second',
    providerCreditCost: null,
    providerCreditUnit: 'magic-hour-credits',
    providerEvidence: 'unknown',
    providerNote:
      'A figure of roughly 150 credits for 5 seconds and 300 for 10 appeared in a search '
      + 'summary of the provider\'s own pages during Phase 0. It is recorded here as a LEAD, '
      + 'not as evidence: it was never read from the provider\'s own documentation in this '
      + 'session and never confirmed by a charge. `providerEvidence` stays `unknown` for '
      + 'exactly that reason — a number remembered is not a number verified.',
    operatingCostKnown: false,
    proposedUpliftPercent: PROPOSED_NEW_OPERATION_UPLIFT_PERCENT,
    proposedUpliftStatus: 'PROPOSAL — not approved, not applied',
    creatorFacingBalanceUnits: null,
    creatorFacingStatus: 'UNKNOWN — requires a verified provider cost',
    whatIsMissing: [
      'the provider\'s own documented price, read directly',
      'or one authorized paid job, to read credits_charged',
      'a Chief Architect ruling on the uplift',
    ],
  },
  {
    operation: 'face-swap',
    costStepWhenPriced: 'FACE_SWAP',
    unit: 'per-second',
    providerCreditCost: null,
    providerCreditUnit: 'magic-hour-credits',
    providerEvidence: 'unknown',
    providerNote:
      'Not costed, and deliberately not pursued: this operation is blocked by the absence '
      + 'of a likeness and consent policy, and costing a capability the Empire has not '
      + 'decided to offer would put a price on a question nobody has answered. (A figure of '
      + '5 credits per photo was seen for the still variant; the Empire integrates the video '
      + 'route, and that figure governs neither.)',
    operatingCostKnown: false,
    proposedUpliftPercent: PROPOSED_NEW_OPERATION_UPLIFT_PERCENT,
    proposedUpliftStatus: 'PROPOSAL — not approved, not applied',
    creatorFacingBalanceUnits: null,
    creatorFacingStatus: 'UNKNOWN — requires a verified provider cost',
    whatIsMissing: [
      'a likeness and consent policy — a constitutional ruling, before any cost work',
      'then a provider cost, then a ruling on the uplift',
    ],
  },
];

export function costRowFor(operation: CreativeOperationId): CostRow {
  const found = CREATIVE_COST_WORKSHEET.find((r) => r.operation === operation);
  if (!found) throw new Error(`no cost row for '${operation}'`);
  return found;
}

/**
 * Whether a row can price anything at all.
 *
 * The operation catalog's cost gate reads the readiness record rather than
 * this function, deliberately: availability is one authority's judgement and
 * this worksheet is documentation. They agree today because both say the same
 * true thing — nothing is costed — and if they ever disagree, the catalog
 * wins and this file is the one that was out of date.
 */
export function canPrice(operation: CreativeOperationId): boolean {
  const row = costRowFor(operation);
  return row.providerCreditCost !== null && row.providerEvidence !== 'unknown';
}

/** Every row's missing inputs, for the acceptance report. */
export function worksheetGaps(): readonly { operation: string; missing: readonly string[] }[] {
  return CREATIVE_COST_WORKSHEET.map((r) => ({ operation: r.operation, missing: r.whatIsMissing }));
}
