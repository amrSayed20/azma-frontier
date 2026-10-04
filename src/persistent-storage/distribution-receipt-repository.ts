/**
 * AZMA OS — THE DURABLE RECEIPT OF AN EXTERNAL DISTRIBUTION
 *
 * ─── WHY A PUBLICATION WITHOUT THIS IS NOT PROVEN ───────────────────────────
 *
 *   A provider answering «ok» proves that a request succeeded once, in a
 *   process that is now gone. The Creator who returns tomorrow and asks «هل
 *   نُشِر؟» is asking the Empire, not Telegram, and the Empire can only answer
 *   from something it wrote down.
 *
 *   So the receipt is written in the same act as the delivery, carrying the
 *   provider's own identifier — which is the one thing that can be taken to
 *   the provider and checked.
 *
 * ─── AND A FAILURE IS WRITTEN TOO ───────────────────────────────────────────
 *
 *   `status = 'FAILED'` with the reason. A store that records only successes
 *   makes a failed publication indistinguishable from one never attempted,
 *   and those two have different remedies.
 *
 *   `failure_reason` holds the contract's own reason word — `unauthorised`,
 *   `rejected`, `unreachable` — never the provider's prose, and never
 *   anything that passed near a credential.
 */

import type { DatabaseSync } from 'node:sqlite';
import { randomUUID } from 'crypto';

export type DistributionStatus = 'PUBLISHED' | 'FAILED';

export interface DistributionReceipt {
  readonly receiptId: string;
  readonly creatorId: string;
  readonly sourceAssetId: string;
  readonly provider: string;
  readonly accountId: string;
  /** Where inside the provider — a chat id. Null for providers with no inside. */
  readonly providerTarget: string | null;
  /** The provider's own handle for what it created. Null on failure. */
  readonly providerMessageId: string | null;
  readonly status: DistributionStatus;
  readonly failureReason: string | null;
  readonly createdAtMs: number;
}

type Row = {
  receipt_id: string;
  creator_id: string;
  source_asset_id: string;
  provider: string;
  account_id: string;
  provider_target: string | null;
  provider_message_id: string | null;
  status: string;
  failure_reason: string | null;
  created_at: number;
};

const toReceipt = (r: Row): DistributionReceipt => ({
  receiptId: r.receipt_id,
  creatorId: r.creator_id,
  sourceAssetId: r.source_asset_id,
  provider: r.provider,
  accountId: r.account_id,
  providerTarget: r.provider_target,
  providerMessageId: r.provider_message_id,
  status: r.status as DistributionStatus,
  failureReason: r.failure_reason,
  createdAtMs: r.created_at,
});

/**
 * Write down that a copy of one sovereign asset left the Empire.
 *
 * Every distribution gets its own row — a second publication of the same asset
 * to the same channel is a second event, not an overwrite of the first. The
 * asset's history is the list, and a history that replaces its entries is not
 * one.
 */
export function recordDistribution(
  db: DatabaseSync,
  input: {
    creatorId: string;
    sourceAssetId: string;
    provider: string;
    accountId: string;
    providerTarget?: string | null;
    providerMessageId?: string | null;
    status: DistributionStatus;
    failureReason?: string | null;
    nowMs?: number;
  },
): DistributionReceipt {
  const receiptId = `dist_${randomUUID()}`;
  const now = input.nowMs ?? Date.now();
  db.prepare(
    `INSERT INTO distribution_receipts
       (receipt_id, creator_id, source_asset_id, provider, account_id,
        provider_target, provider_message_id, status, failure_reason, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
  ).run(
    receiptId,
    input.creatorId,
    input.sourceAssetId,
    input.provider,
    input.accountId,
    input.providerTarget ?? null,
    input.providerMessageId ?? null,
    input.status,
    input.failureReason ?? null,
    now,
  );
  return {
    receiptId,
    creatorId: input.creatorId,
    sourceAssetId: input.sourceAssetId,
    provider: input.provider,
    accountId: input.accountId,
    providerTarget: input.providerTarget ?? null,
    providerMessageId: input.providerMessageId ?? null,
    status: input.status,
    failureReason: input.failureReason ?? null,
    createdAtMs: now,
  };
}

/** One Creator's distribution history, newest first. Creator-scoped, always. */
export function listReceiptsForCreator(
  db: DatabaseSync,
  creatorId: string,
  limit = 40,
): readonly DistributionReceipt[] {
  const rows = db
    .prepare(
      `SELECT receipt_id, creator_id, source_asset_id, provider, account_id,
              provider_target, provider_message_id, status, failure_reason, created_at
       FROM distribution_receipts
       WHERE creator_id = ?
       ORDER BY created_at DESC
       LIMIT ?`,
    )
    .all(creatorId, Math.max(1, Math.min(limit, 200))) as unknown as Row[];
  return rows.map(toReceipt);
}

/** Where one asset has been sent. Scoped by creator so an id alone proves nothing. */
export function listReceiptsForAsset(
  db: DatabaseSync,
  creatorId: string,
  assetId: string,
): readonly DistributionReceipt[] {
  const rows = db
    .prepare(
      `SELECT receipt_id, creator_id, source_asset_id, provider, account_id,
              provider_target, provider_message_id, status, failure_reason, created_at
       FROM distribution_receipts
       WHERE creator_id = ? AND source_asset_id = ?
       ORDER BY created_at DESC`,
    )
    .all(creatorId, assetId) as unknown as Row[];
  return rows.map(toReceipt);
}
