/**
 * AZMA OS — The mutation boundary: where a derived asset is born.
 *
 * Constitution Articles 3.2, 4.5, 5.3–5.6; Phase D directive Articles 4–8.
 *
 * ─── WHAT THIS IS, AND WHAT IT DELIBERATELY IS NOT ──────────────────────────
 *
 *   It is the one place a mutation becomes a sovereign asset: it takes the
 *   BYTES a mutation produced, proves they are genuinely new, and deposits them
 *   through the existing Vault boundary with a correct lineage.
 *
 *   It is NOT a generation engine, and it does not call a provider. That
 *   separation is the point. Whichever chamber or provider produces the new
 *   pixels, the rules about what may be derived from what — ownership, project,
 *   legacy adoption, circularity — are enforced here, once.
 *
 * ─── THE GUARD THAT MATTERS MOST ────────────────────────────────────────────
 *
 *   Article 5 of the Phase D directive forbids accepting a success built on
 *   «إعادة إرجاع الملف نفسه» — the provider handing back the reference file,
 *   or a copy with a new name, and the system calling it an edit.
 *
 *   That is not left to discipline. `deriveAsset` refuses bytes identical to
 *   the parent's, by digest, before anything is written. A provider that
 *   replays its input cannot produce a successful mutation here — the refusal
 *   is structural, not a convention a future caller might forget.
 *
 *   The same guard protects against the subtler failure: a mutation that was
 *   requested, appeared to run, and changed nothing. The Creator is told it did
 *   not change rather than shown a new version that is the old one.
 */

import { createHash } from 'crypto';
import { SovereignVaultManager } from './sovereign-vault-manager';
import {
  DerivationKind,
  SourceChamber,
  LifecycleState,
  isDerivable,
  isLegacyAsset,
  type VaultAsset,
} from './sovereign-vault-types';
import { getDb, getVaultAsset } from '../persistent-storage';

/** Why a mutation was refused. Each is a refusal, never a silent repair. */
export type MutationRejection =
  /** No such asset, for this Creator. */
  | 'PARENT_NOT_FOUND'
  /** The parent belongs to another Creator. */
  | 'PARENT_NOT_OWNED'
  /** A legacy asset must be adopted by its owner first. Article 5.5. */
  | 'PARENT_REQUIRES_ADOPTION'
  /** The parent's right to be derived from has been withheld. */
  | 'PARENT_NOT_DERIVABLE'
  /** The mutation produced nothing. */
  | 'EMPTY_OUTPUT'
  /**
   * The output is byte-identical to the parent. Either the provider replayed
   * its input, or the mutation changed nothing — and neither is an edit.
   */
  | 'OUTPUT_IDENTICAL_TO_PARENT';

export type MutationOutcome =
  | { readonly ok: true; readonly asset: VaultAsset; readonly parent: VaultAsset }
  | { readonly ok: false; readonly rejection: MutationRejection; readonly detail: string };

/** What the Creator is told. Names no provider, no library, no storage path. */
const SPOKEN_AR: Readonly<Record<MutationRejection, string>> = {
  PARENT_NOT_FOUND: 'الأصل المطلوب تعديله غير موجود.',
  PARENT_NOT_OWNED: 'هذا الأصل ليس لك.',
  PARENT_REQUIRES_ADOPTION:
    'هذا أصلٌ قديمٌ لا يُعرف نسبه. اعتمده أوّلاً ليصير البناء عليه موثّقاً.',
  PARENT_NOT_DERIVABLE: 'لا يمكن الاشتقاق من هذا الأصل.',
  EMPTY_OUTPUT: 'لم يُنتج التعديل شيئاً.',
  OUTPUT_IDENTICAL_TO_PARENT: 'لم يتغيّر شيء. الناتج مطابقٌ للأصل تماماً، فلم يُحفظ كنسخةٍ جديدة.',
};

export function mutationRejectionSpokenAr(rejection: MutationRejection): string {
  return SPOKEN_AR[rejection];
}

/** A content digest, used to prove the output is not the input. */
export function digestOf(bytes: Uint8Array): string {
  return createHash('sha256').update(bytes).digest('hex');
}

/**
 * Metadata fields that describe HOW AN ASSET'S OWN BYTES CAME TO BE.
 *
 * ─── WHY A DERIVED ASSET MUST NOT INHERIT THESE ─────────────────────────────
 *
 *   Derivation used to copy the parent's metadata wholesale — `...parent.metadata`
 *   — which carried these forward unchanged. FOUND IN THE PHASE D LIVE PROOF, by
 *   reading what the derived asset actually said about itself:
 *
 *     the Creator's instruction : «اجعل الخلفية زرقاء داكنة كليل صافٍ»
 *     the asset's own metadata  : generationPrompt = «مدينة إمبراطورية فوق
 *                                 النيل، عمارة عظيمة، أجواء سينمائية…»
 *                                 generationModel  = flux-schnell
 *
 *   The asset testified that it had been generated from a prompt it was never
 *   generated from, by a model that never made it. The true fields sat beside
 *   the false ones, contradicting them.
 *
 *   That is not cosmetic. `automatic-director.ts` reads `generationPrompt` and
 *   turns it into the Creator's GOAL — `deriveCreatorGoalFromPrompt`, whose own
 *   constitution says it "echoes it verbatim, never interprets". So the
 *   Automatic Director would have taken a stale prompt the Creator never stated
 *   for this asset and directed an entire film by it, while believing itself to
 *   be echoing the Creator faithfully. The Vault Palace displays the same field
 *   back to the Creator as their own words.
 *
 *   A falsehood the machine sincerely believes is worse than one it knows.
 *
 *   The parent's record still holds all of this, one hop away through
 *   `derivedFromAssetId`, so nothing is lost — it is simply no longer asserted
 *   by an asset it is not true of. A derived asset's own account of itself is
 *   `mutationInstructionAr` plus the two content digests, and those are written
 *   here by the derivation itself.
 */
const CREATION_EVENT_KEYS = [
  'generationPrompt',
  'generationModel',
  'generationStyle',
  // The provider that made the PARENT. The editor may be an entirely different
  // engine, and a derived asset claiming its parent's provider would misname
  // the thing that actually produced its bytes.
  'providerId',
] as const;

/** The parent's metadata minus every claim about the parent's own creation. */
export function inheritableMetadata(
  parentMetadata: Readonly<Record<string, unknown>>,
): Record<string, unknown> {
  const kept: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(parentMetadata)) {
    if ((CREATION_EVENT_KEYS as readonly string[]).includes(key)) continue;
    kept[key] = value;
  }
  return kept;
}

/**
 * What the caller must supply to turn produced bytes into a derived asset.
 *
 * `parentBytes` is required, and that is deliberate: the identity check cannot
 * be performed on a promise. A caller that cannot produce the parent's bytes
 * cannot prove its output differs from them, and therefore cannot claim to have
 * edited it.
 */
export interface MutationRequest {
  readonly parentAssetId: string;
  readonly ownerId: string;
  /** The bytes the mutation started from. */
  readonly parentBytes: Uint8Array;
  /** The bytes the mutation produced. */
  readonly outputBytes: Uint8Array;
  /** Where the produced bytes were written. Supplied by the storage boundary. */
  readonly outputStorageUri: string;
  /** Which chamber performed it. Article 4.5 — modification is Qiyamah's. */
  readonly chamber: SourceChamber;
  /** ANIMATED for a still brought into motion; MODIFIED otherwise. */
  readonly derivation?: DerivationKind;
  /** What was asked for, kept for the Creator's own record. */
  readonly instructionAr?: string;
  readonly operationId: string;
  readonly actorId?: string;
}

/**
 * Turn produced bytes into a derived sovereign asset, or refuse.
 *
 * The order is the safety:
 *   1. The parent must exist, be owned, and be derivable.
 *   2. The output must exist and must differ from the parent.
 *   3. Only then is anything deposited.
 *
 * Nothing is written before step 3, so a refused mutation leaves no orphan row
 * and no orphan file behind it.
 *
 * The deposit itself goes through `SovereignVaultManager.depositAsset` — the
 * same boundary every other asset in the Empire crosses. Article 8 of the
 * directive forbids a mutation-specific save path, and this has none: lineage,
 * project ownership and circularity are all re-checked there, by the code that
 * checks them for everyone.
 */
export async function deriveAsset(request: MutationRequest): Promise<MutationOutcome> {
  const db = getDb();

  // ── 1 · The parent ──────────────────────────────────────────────────────
  const parent = getVaultAsset(db, request.parentAssetId);
  if (!parent) {
    return { ok: false, rejection: 'PARENT_NOT_FOUND', detail: 'no such asset' };
  }
  if (parent.subscriberTenantId !== request.ownerId) {
    // Answered as a distinct rejection internally so a test can tell the two
    // apart; a route surfacing this to a stranger should still answer 404.
    return { ok: false, rejection: 'PARENT_NOT_OWNED', detail: 'owned by another Creator' };
  }
  if (isLegacyAsset(parent) && !isDerivable(parent)) {
    return {
      ok: false,
      rejection: 'PARENT_REQUIRES_ADOPTION',
      detail: 'a legacy asset must be adopted before it can be built upon',
    };
  }
  if (!isDerivable(parent)) {
    return { ok: false, rejection: 'PARENT_NOT_DERIVABLE', detail: 'derivation is withheld' };
  }

  // ── 2 · The output must be real, and must be NEW ────────────────────────
  if (request.outputBytes.length === 0) {
    return { ok: false, rejection: 'EMPTY_OUTPUT', detail: 'the mutation produced no bytes' };
  }

  const parentDigest = digestOf(request.parentBytes);
  const outputDigest = digestOf(request.outputBytes);
  if (parentDigest === outputDigest) {
    // THE ANTI-REPLAY GUARD. A provider that handed back its own input, or a
    // mutation that changed nothing, stops here — before a new asset exists to
    // give the Creator the impression that something happened.
    return {
      ok: false,
      rejection: 'OUTPUT_IDENTICAL_TO_PARENT',
      detail: `output digest equals parent digest (${outputDigest.slice(0, 16)}…)`,
    };
  }

  // ── 3 · Now, and only now, it becomes an asset ──────────────────────────
  //
  // Through the ordinary boundary. depositAsset re-checks ownership, the
  // parent's derivability, circularity and project ownership — this function
  // does not get to skip them by having checked some of them already.
  const asset = await new SovereignVaultManager().depositAsset({
    operationId: request.operationId,
    subscriberTenantId: request.ownerId,
    capabilityTarget: parent.capabilityTarget,
    assetFamily: parent.assetFamily,
    secureStorageUri: request.outputStorageUri,
    creationChamber: request.chamber,
    derivation: request.derivation ?? DerivationKind.MODIFIED,
    parentAssetId: parent.assetId,
    // A derived asset stays inside its parent's project. Moving it would be a
    // separate, deliberate act, not a side effect of editing.
    projectId: parent.projectId ?? null,
    lifecycleState: LifecycleState.INTERMEDIATE,
    createdBy: request.actorId ?? request.ownerId,
    metadata: {
      ...inheritableMetadata(parent.metadata),
      // Provenance of the CONTENT, beside the provenance of the record: an
      // auditor can prove later that this asset's bytes are not its parent's.
      derivedFromAssetId: parent.assetId,
      parentContentDigest: parentDigest,
      contentDigest: outputDigest,
      ...(request.instructionAr ? { mutationInstructionAr: request.instructionAr } : {}),
    },
  });

  return { ok: true, asset, parent };
}
