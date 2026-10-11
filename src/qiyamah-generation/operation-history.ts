/**
 * AZMA OS — حجرة القيامة · THE TRUTHFUL OPERATION HISTORY  (D-4)
 *
 * ─── WHY A READ MODEL AND NOT A THIRD TABLE ─────────────────────────────────
 *
 *   Phase 0 found `generation_records` and `operation_ledger` disagreeing, and
 *   the investigation that followed established they are NOT two copies of one
 *   thing:
 *
 *     `generation_records`  — القيامة's own record of a completed image or
 *                             video (prompt, style, media_type, asset_url).
 *                             61 rows. Sixteen consumers.
 *     `operation_ledger`    — the Fleet Materialization runtime's state machine
 *                             for a materialization transaction. Twelve
 *                             consumers, none of them this chamber's image
 *                             path. `image-generation` is absent from it not
 *                             because of drift but because that path does not
 *                             pass through that runtime at all.
 *
 *   So merging them would destroy two different truths to manufacture one. The
 *   directive forbids it, and it is right to.
 *
 *   What every one of the six acts DOES write is a row in `vault_assets`, with
 *   its own provenance: `derivation`, `creation_chamber`, and in metadata the
 *   `mutationProviderId` that names which provider operation mutated a parent.
 *   That is where a unified history already exists. This module reads it.
 *
 *   NOTHING here writes. No table is created, altered, migrated or backfilled.
 *   There is no new authority — only a view over the authority that exists.
 *
 * ─── AND IT REFUSES TO INFER SUCCESS ────────────────────────────────────────
 *
 *   An asset existing is not an operation having succeeded, and the difference
 *   is the Empire's own law: a provider's answer produces BYTES, and only the
 *   Creator's explicit acceptance produces OWNERSHIP. So a deposited asset
 *   that was never accepted is reported as exactly that — not as a success.
 *
 *   And where provenance cannot name the act, the act is named UNDETERMINED.
 *   47 rows predate the provenance columns; inventing an operation for them
 *   would be the one thing Article 5.5 forbids.
 */

import type { DatabaseSync } from 'node:sqlite';
import { listVaultAssetsForTenant, listGenerationsForCreator } from '../persistent-storage';
import type { VaultAsset } from '../vault/sovereign-vault-types';
import type { QiyamahOperationId } from './prompt-contract';

/**
 * What became of the thing the operation produced.
 *
 * These are not grades of success. They are three different facts, and the
 * middle one is the common case the old interface could not express.
 */
export type HistoryOutcome =
  /** Bytes exist in the Vault and the Creator has taken ownership. */
  | 'ACCEPTED'
  /**
   * Bytes exist and were deposited, and the Creator has NOT accepted them.
   * Reported as itself — never as a success, and never as a failure either.
   */
  | 'AWAITING_ACCEPTANCE'
  /**
   * The record predates provenance, or its provenance cannot support a claim
   * about what happened. Said plainly rather than guessed.
   */
  | 'UNDETERMINED';

/** How confidently the act behind an asset could be named. */
export type OperationEvidence =
  /** `derivation` plus the provider operation that mutated the parent. */
  | 'derivation-and-provider'
  /** `derivation` and the chamber, with no provider operation recorded. */
  | 'derivation-only'
  /** Corroborated by القيامة's own generation record for the same asset. */
  | 'generation-record'
  /** Nothing in the row supports naming an operation. */
  | 'insufficient';

export interface OperationHistoryEntry {
  readonly assetId: string;
  /** The act, when the evidence names it. `null` means it does not. */
  readonly operation: QiyamahOperationId | null;
  readonly outcome: HistoryOutcome;
  readonly evidence: OperationEvidence;
  readonly atMs: number;
  // ── lineage, carried through untouched ──────────────────────────────────
  readonly parentAssetId: string | null;
  readonly rootAssetId: string | null;
  readonly version: number | null;
  readonly contentDigest: string | null;
  readonly lifecycleState: string | null;
  /** For an engineer. NEVER rendered to a Creator — it names a provider. */
  readonly providerOperationEn: string | null;
}

/**
 * Which provider operation mutated a parent into this asset.
 *
 * Written by the edit, animate and upscale routes as `mutationProviderId`.
 * It is the only thing that tells those three apart, because all three produce
 * a derived asset and two of them produce the same `derivation` value.
 */
const MUTATION_TO_OPERATION: Readonly<Record<string, QiyamahOperationId>> = {
  'magic-hour-image-editor': 'edit',
  'magic-hour-image-upscaler': 'upscale',
  'magic-hour-image-to-video': 'animate',
};

function readString(v: unknown): string | null {
  return typeof v === 'string' && v.length > 0 ? v : null;
}

/**
 * Name the act behind one asset — from its own provenance, and from nothing
 * else.
 *
 * `styleOfRecord` is القيامة's own `generation_records.style` for this asset
 * when one exists. It is the ONLY thing that distinguishes an infographic from
 * an image: both are `GENERATED` · `VISUAL` · QIYAMAH, and the act differs
 * only in the style that bound the model. Absent it, the honest answer for a
 * generated still is `image`, and the evidence says it was derivation alone.
 */
export function classifyAssetOperation(
  asset: Pick<VaultAsset, 'derivation' | 'creationChamber' | 'capabilityTarget' | 'metadata'>,
  styleOfRecord?: string | null,
): { readonly operation: QiyamahOperationId | null; readonly evidence: OperationEvidence } {
  const derivation = asset.derivation ?? null;
  const chamber = asset.creationChamber ?? null;
  const mutation = readString(asset.metadata?.['mutationProviderId']);

  // ── a derived asset: the provider operation is what names the act ──────
  if (derivation === 'MODIFIED' || derivation === 'ANIMATED') {
    if (mutation && MUTATION_TO_OPERATION[mutation]) {
      return { operation: MUTATION_TO_OPERATION[mutation]!, evidence: 'derivation-and-provider' };
    }
    // ANIMATED can only have come from the animate act — the derivation alone
    // carries it. MODIFIED cannot: an edit and an upscale share that value,
    // and مكمن الغاية's reframing writes it too. Naming one would be a guess.
    if (derivation === 'ANIMATED') {
      return { operation: 'animate', evidence: 'derivation-only' };
    }
    return { operation: null, evidence: 'insufficient' };
  }

  // ── an original made in this chamber ───────────────────────────────────
  if (derivation === 'GENERATED' && chamber === 'QIYAMAH') {
    if (asset.capabilityTarget === 'MOTION') {
      return { operation: 'video', evidence: 'derivation-only' };
    }
    if (asset.capabilityTarget === 'VISUAL') {
      if (styleOfRecord === 'infographic') {
        return { operation: 'infographic', evidence: 'generation-record' };
      }
      return { operation: 'image', evidence: styleOfRecord ? 'generation-record' : 'derivation-only' };
    }
    // WRITING / AUDIO from this chamber is not one of the six acts.
    return { operation: null, evidence: 'insufficient' };
  }

  // Uploads, assets from other chambers, and the rows that predate provenance.
  return { operation: null, evidence: 'insufficient' };
}

/**
 * What became of it — declared by the Vault, never inferred from existence.
 *
 * `lifecycleState` is the Empire's own word on ownership. `FINAL` and
 * `PUBLISHED` mean the Creator took it. `INTERMEDIATE` means bytes exist and
 * nobody has. Absent means the row predates the column, and that is reported
 * as undetermined rather than guessed in either direction.
 */
export function classifyOutcome(lifecycleState: string | null | undefined): HistoryOutcome {
  if (lifecycleState === 'FINAL' || lifecycleState === 'PUBLISHED') return 'ACCEPTED';
  if (lifecycleState === 'INTERMEDIATE') return 'AWAITING_ACCEPTANCE';
  return 'UNDETERMINED';
}

/**
 * The Creator's own operation history — one read, tenant-scoped at the source.
 *
 * Ownership is not re-checked here because it cannot be bypassed here:
 * `listVaultAssetsForTenant` filters by `subscriber_tenant_id` in SQL, so no
 * row belonging to anyone else can enter this function at all.
 */
export function operationHistoryForCreator(
  db: DatabaseSync,
  creatorId: string,
  limit = 60,
): readonly OperationHistoryEntry[] {
  const assets = listVaultAssetsForTenant(db, creatorId);

  // القيامة's own record, used ONLY to corroborate — never to invent an entry.
  // A generation record with no asset is not a history entry: it says a row
  // was written, not that a Creator owns anything.
  const styleByAsset = new Map<string, string | null>();
  try {
    for (const r of listGenerationsForCreator(db, creatorId)) {
      if (r.assetId) styleByAsset.set(r.assetId, r.style ?? null);
    }
  } catch {
    // An unavailable corroborator narrows the evidence; it does not fabricate.
  }

  return assets.slice(0, Math.max(1, Math.min(limit, 500))).map((a) => {
    const { operation, evidence } = classifyAssetOperation(a, styleByAsset.get(a.assetId) ?? null);
    return {
      assetId: a.assetId,
      operation,
      outcome: classifyOutcome(a.lifecycleState ?? null),
      evidence,
      atMs: a.createdAt,
      parentAssetId: a.parentAssetId ?? null,
      rootAssetId: a.rootAssetId ?? null,
      version: a.version ?? null,
      contentDigest: a.contentDigest ?? null,
      lifecycleState: a.lifecycleState ?? null,
      providerOperationEn: readString(a.metadata?.['mutationProviderId'])
        ?? readString(a.metadata?.['providerId']),
    };
  });
}

/** What a Creator may read: the act, what became of it, and its lineage. */
export interface OperationHistoryView {
  readonly assetId: string;
  readonly operation: QiyamahOperationId | null;
  readonly operationAr: string;
  readonly outcome: HistoryOutcome;
  readonly outcomeAr: string;
  readonly atMs: number;
  readonly parentAssetId: string | null;
  readonly version: number | null;
}

const OPERATION_AR: Readonly<Record<QiyamahOperationId, string>> = {
  image: 'صورة', infographic: 'إنفوغرافيك', video: 'فيديو',
  edit: 'تعديل', animate: 'تحريك', upscale: 'رفع الدقّة',
};

const OUTCOME_AR: Readonly<Record<HistoryOutcome, string>> = {
  ACCEPTED: 'اعتمدتَه — أصلٌ سياديٌّ باسمك',
  AWAITING_ACCEPTANCE: 'أُودِع ولم تَعتمده بعد',
  UNDETERMINED: 'سجلٌّ قديمٌ لا يَكفي للحكم',
};

/**
 * Project the history for a browser — and strip what must not cross.
 *
 * `providerOperationEn` and `contentDigest` are deliberately dropped: the
 * first names a provider, which the Knowledge Source Abstraction Principle
 * keeps off a Creator's screen in every chamber, and the second is an
 * engineer's instrument.
 */
export function toHistoryView(
  entries: readonly OperationHistoryEntry[],
): readonly OperationHistoryView[] {
  return entries.map((e) => ({
    assetId: e.assetId,
    operation: e.operation,
    operationAr: e.operation ? OPERATION_AR[e.operation] : 'عملٌ لم يُسمَّ',
    outcome: e.outcome,
    outcomeAr: OUTCOME_AR[e.outcome],
    atMs: e.atMs,
    parentAssetId: e.parentAssetId,
    version: e.version,
  }));
}

/**
 * The gaps, counted — so a data gap is reported rather than concealed.
 *
 * Read by the acceptance report. An entry whose act cannot be named is not a
 * bug in this reader; it is a row whose provenance does not support a claim,
 * and the only honest thing to do with it is count it and say so.
 */
export function historyGaps(entries: readonly OperationHistoryEntry[]): {
  readonly total: number;
  readonly named: number;
  readonly unnamed: number;
  readonly undeterminedOutcome: number;
  readonly byOperation: Readonly<Record<string, number>>;
} {
  const byOperation: Record<string, number> = {};
  let named = 0; let undeterminedOutcome = 0;
  for (const e of entries) {
    if (e.operation) { named += 1; byOperation[e.operation] = (byOperation[e.operation] ?? 0) + 1; }
    if (e.outcome === 'UNDETERMINED') undeterminedOutcome += 1;
  }
  return {
    total: entries.length, named, unnamed: entries.length - named,
    undeterminedOutcome, byOperation,
  };
}
