/**
 * AZMA OS — THE ONE PATH THAT MAY SPEND TO LEARN A COST
 *
 * ─── THE PROBLEM THIS SOLVES, STATED PLAINLY ────────────────────────────────
 *
 *   Four operations are shut because nobody has measured what they cost. The
 *   only way to measure what they cost is to run one. The gate that protects
 *   Creators therefore also blocks the measurement that would open it.
 *
 *   Three ways out, and two of them are lies:
 *
 *     ✗ flip `costBasisVerified` to true before measuring — a claim of
 *       evidence that does not exist, written into the record
 *     ✗ let the route decide for itself — the second authority this chamber
 *       has spent four packages removing
 *     ✓ a SEPARATE path, which only the Founder may walk, which spends under
 *       a ceiling he approved, and which production never consults
 *
 *   The third is the pattern the Empire already uses for the controlled model
 *   tests: a Founder-gated door beside the production door, where the
 *   production path never reads the override.
 *
 * ─── WHAT MAKES IT UNFORGEABLE ──────────────────────────────────────────────
 *
 *   The caller hands in no permission. It hands in an id, and THIS module
 *   reads the role out of the database — so a route that forgets to check, a
 *   script, or a future caller that passes `{founder: true}` all arrive at the
 *   same answer. The runner calls it directly for the same reason the likeness
 *   gate lives there: a guard a caller can satisfy by asserting is not a guard.
 *
 * ─── AND THE CEILING IS CUMULATIVE, READ FROM WHAT WAS ACTUALLY CHARGED ─────
 *
 *   Not from a counter this process keeps — a restart would forget it — but
 *   from the assets the campaign has already deposited, each carrying the
 *   provider's own `mutationProviderCreditsCharged`. The spend is therefore
 *   whatever the provider actually billed, and the ceiling cannot be walked
 *   around by restarting anything.
 */

import type { DatabaseSync } from 'node:sqlite';
import { getCreator } from '../../persistent-storage/creator-repository';

/**
 * The ceiling, in the provider's own units, approved by the Chief Architect
 * on 2026-10-12 for the nine-job acceptance campaign.
 *
 * It is a NUMBER OF CREDITS and not money, because the thing being spent is
 * credits. Its money equivalent at the recorded acquisition rate is ≈ 43.47
 * EGP, and that equivalence belongs to the worksheet, not to this guard.
 */
export const COST_MEASUREMENT_CEILING_CREDITS = 618 as const;

/** The campaign this authorization belongs to. One id, so spend is countable. */
export const QIYAMAH_ACCEPTANCE_CAMPAIGN = 'qiyamah-acceptance-2026-10-12' as const;

/** The metadata key each measured asset carries, so the ledger IS the Vault. */
export const CAMPAIGN_METADATA_KEY = 'costMeasurementCampaign' as const;

export type MeasurementRefusal =
  | 'not-the-founder'
  | 'unknown-creator'
  | 'ceiling-would-be-exceeded'
  | 'expected-credits-unknown';

export type MeasurementVerdict =
  | {
      readonly ok: true;
      readonly campaignId: string;
      readonly spentSoFarCredits: number;
      readonly remainingCredits: number;
    }
  | {
      readonly ok: false;
      readonly refusal: MeasurementRefusal;
      readonly detailEn: string;
      readonly spentSoFarCredits: number;
    };

/**
 * What the campaign has ALREADY been charged, read from the deposited assets.
 *
 * Sums the provider's own figure on every asset this campaign produced. An
 * asset whose charge the provider did not report contributes nothing — and
 * that absence is visible in the report rather than guessed at here.
 */
export function campaignSpentCredits(
  db: DatabaseSync,
  campaignId: string = QIYAMAH_ACCEPTANCE_CAMPAIGN,
): number {
  const rows = db.prepare(
    `SELECT metadata FROM vault_assets
      WHERE json_extract(metadata, '$.${CAMPAIGN_METADATA_KEY}') = ?`,
  ).all(campaignId) as { metadata?: string }[];

  let total = 0;
  for (const row of rows) {
    try {
      const meta = JSON.parse(row.metadata ?? '{}') as Record<string, unknown>;
      const charged = meta.mutationProviderCreditsCharged;
      if (typeof charged === 'number' && Number.isFinite(charged)) total += charged;
    } catch {
      // A row whose metadata cannot be parsed contributes nothing and is not
      // treated as zero-cost: `campaignUnreportedJobs` counts it separately.
    }
  }
  return total;
}

/** Jobs that produced an asset but no charge figure. Counted, never ignored. */
export function campaignUnreportedJobs(
  db: DatabaseSync,
  campaignId: string = QIYAMAH_ACCEPTANCE_CAMPAIGN,
): number {
  const rows = db.prepare(
    `SELECT metadata FROM vault_assets
      WHERE json_extract(metadata, '$.${CAMPAIGN_METADATA_KEY}') = ?`,
  ).all(campaignId) as { metadata?: string }[];

  let unreported = 0;
  for (const row of rows) {
    try {
      const meta = JSON.parse(row.metadata ?? '{}') as Record<string, unknown>;
      if (typeof meta.mutationProviderCreditsCharged !== 'number') unreported += 1;
    } catch {
      unreported += 1;
    }
  }
  return unreported;
}

/**
 * May this creator spend, now, for this much?
 *
 * `expectedCredits` is the worksheet's estimate of the job about to run. It is
 * required: a job whose cost cannot be estimated cannot be bounded by a
 * ceiling, and an unbounded job is exactly what a ceiling exists to prevent.
 */
export function authorizeCostMeasurement(
  db: DatabaseSync,
  input: {
    readonly creatorId: string;
    readonly expectedCredits: number | null;
    readonly campaignId?: string;
    readonly ceilingCredits?: number;
  },
): MeasurementVerdict {
  const campaignId = input.campaignId ?? QIYAMAH_ACCEPTANCE_CAMPAIGN;
  const ceiling = input.ceilingCredits ?? COST_MEASUREMENT_CEILING_CREDITS;
  const spent = campaignSpentCredits(db, campaignId);

  const creator = getCreator(db, input.creatorId);
  if (!creator) {
    return {
      ok: false, refusal: 'unknown-creator', spentSoFarCredits: spent,
      detailEn: 'no such creator — the role is read from the database, never from the caller',
    };
  }
  if (creator.role !== 'founder') {
    return {
      ok: false, refusal: 'not-the-founder', spentSoFarCredits: spent,
      detailEn: `role '${creator.role}' may not spend to measure a cost`,
    };
  }
  if (input.expectedCredits === null || !Number.isFinite(input.expectedCredits) || input.expectedCredits <= 0) {
    return {
      ok: false, refusal: 'expected-credits-unknown', spentSoFarCredits: spent,
      detailEn: 'a job whose charge cannot be estimated cannot be bounded by a ceiling',
    };
  }
  if (spent + input.expectedCredits > ceiling) {
    return {
      ok: false, refusal: 'ceiling-would-be-exceeded', spentSoFarCredits: spent,
      detailEn: `${spent} already charged + ${input.expectedCredits} expected > ${ceiling} ceiling`,
    };
  }

  return {
    ok: true,
    campaignId,
    spentSoFarCredits: spent,
    remainingCredits: ceiling - spent,
  };
}
