/**
 * AZMA OS — QIYAMAH: editing INSIDE an asset, as one act with one authority.
 *
 * ─── WHY THIS MODULE EXISTS ─────────────────────────────────────────────────
 *
 *   Every line below stood inside `app/api/vault/assets/[assetId]/edit/route.ts`
 *   and nothing else could reach it. When رأس الأمر needed the same act — to
 *   make scene two out of the approved frame of scene one, so the product in
 *   both is the same product — there were two roads: copy the sequence into the
 *   courier, or lift it to one place both can call.
 *
 *   Copying it would have made a second authority on how an edited image
 *   becomes a sovereign asset: two orders of operations, two refusal sets, two
 *   places to forget the orphan cleanup. So it was lifted, unchanged in
 *   behaviour. The route keeps what is genuinely HTTP's — status codes and the
 *   sentences a Creator reads — and this keeps the act.
 *
 * ─── THE ORDER, WHICH IS THE SAFETY ─────────────────────────────────────────
 *
 *   own the asset → it is an image → it may be derived from → read its bytes →
 *   the model is still authorised → edit → write the result → prove the result
 *   differs from its parent → deposit.
 *
 *   The proof of difference happens in `deriveAsset`, AFTER the result is
 *   written and BEFORE it becomes an asset. If it refuses — the engine replayed
 *   its input, or the edit changed nothing — the file just written is removed.
 *   Article 6 forbids leaving an orphan, and an orphan is exactly what a
 *   refusal would otherwise leave on disk.
 *
 *   Constitution Article 3.1: editing inside an asset belongs to القيامة. This
 *   records that chamber and never touches a timeline, an order or a
 *   transition, which belong to رأس الأمر.
 */

import { basename, join } from 'path';
import { readFile, unlink } from 'fs/promises';
import type { DatabaseSync } from 'node:sqlite';
import { getVaultAsset } from '../persistent-storage';
import { persistUploadedAsset } from '../vault/vault-asset-upload-storage';
import { deriveAsset } from '../vault/sovereign-asset-mutation';
import {
  authorisePaidOperation,
  settleAuthorisedOperation,
  releaseAuthorisedOperation,
} from '../economy/paid-operation-gate';
import { claimAttempt, completeAttempt, failAttempt } from '../economy/paid-operation-attempts';
import type { MutationRejection } from '../vault/sovereign-asset-mutation';
import { SourceChamber, DerivationKind, isDerivable, isLegacyAsset } from '../vault/sovereign-vault-types';
import type { VaultAsset } from '../vault/sovereign-vault-types';
import {
  editImageViaProvider,
  IMAGE_EDIT_MODEL_ID,
  imageEditingIsConfigured,
  ImageEditError,
} from '../core/sovereign-ai-integration/adapters/magic-hour-image-editing';
import { CapabilityTarget } from '../core/sovereign-orchestrator/qiyamah-intent-types';
import { IMAGE_MODEL_FLEET } from '../sovereign-model-selection/image-model-fleet';

/** The longest instruction the engine is given. */
export const MAX_EDIT_INSTRUCTION = 1_000;

/**
 * The namespace this road's submission keys live in.
 *
 * Scoping is what stops one capability's key from ever matching another's: the
 * same word typed by a Creator into an edit and into an animation are two
 * submissions, not one.
 */
export const EDIT_SCOPE = 'qiyamah:image-edit';

/**
 * Why an edit did not happen — each one a different cure, which is the whole
 * reason they are separate. A Creator told «it failed» when the truth is «the
 * Empire is out of credit» will retry forever and blame their own picture.
 */
export type ImageEditRefusal =
  | 'not-found'
  | 'not-an-image'
  | 'not-derivable'
  | 'requires-adoption'
  /** The address is one this act cannot read at all — a provider-hosted asset. */
  | 'source-unresolvable'
  /** The address resolved and the file would not open. */
  | 'source-unreadable'
  | 'capability-unavailable'
  | 'model-unavailable'
  | 'no-credit'
  | 'timed-out'
  | 'edit-failed'
  | 'rejected-by-lineage'
  /**
   * The act is real and the Creator may perform it — but the Empire has not
   * approved what it costs, so it is not performed. MEASURED: every Magic
   * Hour entry in the cost catalog is pending-discovery with azmaUnitsPerUnit
   * 0. Charging nothing for real provider money is not a gift.
   */
  | 'cost-unavailable'
  /** Priced, and the Creator cannot afford it. */
  | 'insufficient-balance'
  /**
   * This exact submission is already running. Saying so is the only answer
   * that neither charges twice nor calls the provider twice.
   */
  | 'operation-in-flight'
  /**
   * This exact submission already finished, and its result could not be
   * replayed from the record. The edit is NOT performed again — the Creator is
   * sent to look at what they already have.
   */
  | 'already-performed';

export type ImageEditOutcome =
  | {
      readonly status: 'succeeded';
      readonly asset: VaultAsset;
      // Typed from the asset itself, so the two can never drift apart.
      readonly lineage: {
        readonly parentAssetId: VaultAsset['parentAssetId'];
        readonly rootAssetId: VaultAsset['rootAssetId'];
        readonly version: VaultAsset['version'];
      };
    }
  | {
      readonly status: 'failed';
      readonly refusal: ImageEditRefusal;
      /** Set only for `rejected-by-lineage`, where the lineage names its own. */
      readonly rejection?: MutationRejection;
    };

/**
 * Where uploaded and generated bytes actually live.
 *
 * Read at CALL time, never at import time. Written first as a module-level
 * `const`, which froze the value the moment Node imported the file: anything
 * that set the variable afterwards — a test, a worker configured after load —
 * was ignored, and the act then looked for a Creator's bytes in a directory
 * that held none. An environment variable read into a module constant is a
 * latent bug by construction.
 */
function uploadsDir(): string {
  return process.env.UPLOADS_DIR ?? join(process.cwd(), 'public', 'uploads');
}

/** Resolve a sovereign storage address to the file on disk. */
function resolveOnDisk(secureStorageUri: string): string | null {
  const name = basename(secureStorageUri);
  if (!name || name === '.' || name === '..') return null;
  if (secureStorageUri.startsWith('/generated-assets/')) {
    return join(uploadsDir(), 'generated-assets', name);
  }
  if (secureStorageUri.startsWith('/uploads/')) {
    return join(uploadsDir(), name);
  }
  // A provider-hosted or otherwise non-local asset. Editing needs the bytes,
  // and an address this act cannot read is refused rather than guessed at.
  return null;
}

function extensionOf(uri: string): string {
  const name = basename(uri);
  const dot = name.lastIndexOf('.');
  return dot === -1 ? '' : name.slice(dot);
}

/**
 * Edit one sovereign image by an Arabic instruction, and deposit the result as
 * an INDEPENDENT asset with a recorded lineage.
 *
 * It never returns a URL as the result and never fabricates an id: the
 * deposited asset's id comes from `deriveAsset`, which refuses output identical
 * to its parent — a guard that is only meaningful because the provider returns
 * BYTES.
 */
export async function editSovereignImage(params: {
  readonly db: DatabaseSync;
  readonly assetId: string;
  readonly creatorId: string;
  readonly instructionAr: string;
  /** Who performed it. The Creator themselves unless a chamber acts for them. */
  readonly actorId?: string;
  /**
   * One key per submission, resent verbatim on a retry of THAT submission.
   *
   * It is what separates «the network sent my press twice» from «I want a
   * second edit of the same picture», and only the caller knows which. When it
   * is absent this attempt stands alone: it holds its own units and is charged
   * on its own, because an uncovered provider call is the worse of the two
   * mistakes. See `paid-operation-attempts.ts`.
   */
  readonly operationKey?: string | null;
}): Promise<ImageEditOutcome> {
  const instruction = params.instructionAr.trim();
  if (instruction.length === 0 || instruction.length > MAX_EDIT_INSTRUCTION) {
    // The caller validates and says it in its own words; this refuses too,
    // because a guard that only one door holds is a guard the next door forgets.
    return { status: 'failed', refusal: 'edit-failed' };
  }

  if (!imageEditingIsConfigured()) {
    // The ability is never offered blind. A Creator is told it is unavailable
    // rather than shown a failure that looks like their own mistake.
    return { status: 'failed', refusal: 'capability-unavailable' };
  }

  // ── The asset, and the right to build on it ──────────────────────────────
  const parent = getVaultAsset(params.db, params.assetId);
  if (!parent || parent.subscriberTenantId !== params.creatorId) {
    // Absent and not-yours answer alike, so ownership cannot be probed.
    return { status: 'failed', refusal: 'not-found' };
  }
  if (parent.capabilityTarget !== CapabilityTarget.VISUAL) {
    return { status: 'failed', refusal: 'not-an-image' };
  }
  if (isLegacyAsset(parent) && !isDerivable(parent)) {
    return { status: 'failed', refusal: 'requires-adoption' };
  }
  if (!isDerivable(parent)) {
    return { status: 'failed', refusal: 'not-derivable' };
  }

  // ── Its bytes ────────────────────────────────────────────────────────────
  // Two different failures, kept apart because they are: an address this act
  // was never able to read, and a file that would not open. MEASURED: folding
  // them into one answered 400 where the suite requires 500.
  const diskPath = resolveOnDisk(parent.secureStorageUri);
  if (!diskPath) return { status: 'failed', refusal: 'source-unresolvable' };

  let parentBytes: Buffer;
  try {
    parentBytes = await readFile(diskPath);
  } catch {
    // The storage path is never echoed to the Creator.
    console.error('[ImageEdit] source unreadable for asset', params.assetId);
    return { status: 'failed', refusal: 'source-unreadable' };
  }

  // ── THE AUTHORIZATION BOUNDARY, AT THE EXECUTION POINT ───────────────────
  //
  //   A hard-coded model id is passed to the provider, so the fleet is asked
  //   whether that model is still authorised. The id happens to name an
  //   authorised model today, and «happens to» is not an authorization
  //   boundary: the day the Chief Architect retires `nano-banana-2` by setting
  //   `active: false`, as `seedance-2-0` and `nano-banana-pro` were retired,
  //   this would otherwise keep dispatching to it.
  //
  //   Both flags are required, exactly as the selector requires them. This
  //   cannot authorise anything: it only refuses.
  const editBinding = IMAGE_MODEL_FLEET.find((m) => m.modelId === IMAGE_EDIT_MODEL_ID);
  if (!editBinding || !editBinding.productionAuthorized || !editBinding.active) {
    console.error('[ImageEdit] refused: edit model not production-authorized and active',
      IMAGE_EDIT_MODEL_ID, editBinding
        ? `authorized=${editBinding.productionAuthorized} active=${editBinding.active}`
        : 'not in fleet');
    return { status: 'failed', refusal: 'model-unavailable' };
  }

  /*
    ─── NOTHING REACHES A BILLED PROVIDER WITHOUT PASSING HERE ───────────────

      AUDITED 2026-10-31 on the live release: this act called Magic Hour with
      no entitlement check, no price, no balance check, no reservation and no
      settlement — neither here nor in the route above it.

      The gate stands in the SERVICE and not in the route, for two reasons the
      audit proved:

        · `editSovereignImage` has a SECOND caller —
          `src/ras-amr-production/qiyamah-commission.ts` — which never passes
          through the HTTP route at all. A gate in the route would have left
          that road wide open, and an internal road is still a road.
        · Every refusal above this line (not owned, not an image, not
          derivable, unreadable) must keep its own answer. A money gate placed
          earlier would tell a Creator editing a nonexistent asset that the
          price is pending — true, and useless.

      The role is read from the database, never taken from a caller: an
      exemption a request could assert is not an exemption.
  */
  const roleRow = params.db
    .prepare('SELECT role FROM creators WHERE creator_id = ?')
    .get(params.creatorId) as { role?: unknown } | undefined;

  // ── The submission, claimed before a single unit is held ─────────────────
  //
  //   Claimed HERE and not earlier, so a request that was going to be refused
  //   for a reason of its own never consumes a submission key.
  const claim = claimAttempt({
    db: params.db,
    creatorId: params.creatorId,
    scope: EDIT_SCOPE,
    clientKey: params.operationKey ?? null,
  });

  if (claim.kind === 'in-flight') {
    return { status: 'failed', refusal: 'operation-in-flight' };
  }
  if (claim.kind === 'already-succeeded') {
    const replayed = replayEditResult(claim.resultJson);
    // The provider is NOT called again either way. Without a replayable body
    // the Creator is told it already happened rather than charged for it twice.
    return replayed ?? { status: 'failed', refusal: 'already-performed' };
  }

  const gate = authorisePaidOperation({
    db: params.db,
    creatorId: params.creatorId,
    role: typeof roleRow?.role === 'string' ? roleRow.role : 'creator',
    capability: 'image-editing',
    gatewayId: 'magic-hour',
    modelId: IMAGE_EDIT_MODEL_ID,
    attemptKey: claim.attemptKey,
    metadata: { assetId: params.assetId },
  });
  if (gate.kind === 'refused') {
    // The attempt is closed, not left hanging: an in-flight row that nothing
    // will ever finish would make this submission key unusable for ever.
    failAttempt(params.db, claim.attemptKey, `gate:${gate.reason}`);
    return {
      status: 'failed',
      refusal: gate.reason === 'payment-required' ? 'insufficient-balance' : 'cost-unavailable',
    };
  }

  // ── The edit itself, on the declared sovereign engine ────────────────────
  let produced;
  try {
    produced = await editImageViaProvider(
      parentBytes, extensionOf(parent.secureStorageUri), instruction, { model: IMAGE_EDIT_MODEL_ID },
    );
  } catch (err) {
    // The engine's own words stay server-side; they name a provider.
    console.error('[ImageEdit] engine failed:', err);
    const rejection = err instanceof ImageEditError ? err.rejection : null;
    // The provider produced nothing, so nothing is owed.
    releaseAuthorisedOperation(params.db, params.creatorId, gate, 'image_edit_provider_failed');
    // Closed as failed, so the same submission key may legitimately be tried
    // again — and the next try holds its own units.
    failAttempt(params.db, claim.attemptKey, `provider:${rejection ?? 'edit-failed'}`);
    if (rejection === 'NO_CREDIT') return { status: 'failed', refusal: 'no-credit' };
    if (rejection === 'TIMED_OUT') return { status: 'failed', refusal: 'timed-out' };
    return { status: 'failed', refusal: 'edit-failed' };
  }

  // ── Write the result, then prove it earned its place ─────────────────────
  const persisted = await persistUploadedAsset(
    produced.bytes,
    produced.mimeType === 'image/jpeg' ? '.jpg' : '.png',
  );

  const outcome = await deriveAsset({
    parentAssetId: parent.assetId,
    ownerId: params.creatorId,
    parentBytes,
    outputBytes: produced.bytes,
    outputStorageUri: persisted.assetUrl,
    // Article 3.1: modification inside an asset belongs to Qiyamah.
    chamber: SourceChamber.QIYAMAH,
    derivation: DerivationKind.MODIFIED,
    instructionAr: instruction,
    operationId: persisted.assetId,
    actorId: params.actorId ?? params.creatorId,
    providerProvenance: {
      providerId: produced.providerId,
      providerModelId: produced.providerModelId,
      providerJobId: produced.providerJobId,
      // The provider's own charge for this operation.
      creditsCharged: produced.creditsCharged,
      creditUnit: 'magic-hour-credits',
    },
  });

  if (!outcome.ok) {
    // NO ORPHAN. The bytes were written a moment ago and are now unreferenced;
    // they are removed before the refusal is returned.
    try { await unlink(join(uploadsDir(), basename(persisted.assetUrl))); } catch { /* already gone */ }
    // No asset was deposited and the bytes are gone. The hold goes back.
    releaseAuthorisedOperation(params.db, params.creatorId, gate, `image_edit_${outcome.rejection}`);
    failAttempt(params.db, claim.attemptKey, `lineage:${outcome.rejection}`);
    return { status: 'failed', refusal: 'rejected-by-lineage', rejection: outcome.rejection };
  }

  // The asset exists and is the Creator's. NOW the units are spent.
  settleAuthorisedOperation(params.db, params.creatorId, gate, undefined, { assetId: outcome.asset.assetId });

  const succeeded: ImageEditOutcome = {
    status: 'succeeded',
    asset: outcome.asset,
    lineage: {
      parentAssetId: outcome.asset.parentAssetId,
      rootAssetId: outcome.asset.rootAssetId,
      version: outcome.asset.version,
    },
  };

  // Recorded so a resent submission key is ANSWERED rather than performed.
  // What is stored is exactly what the Creator was handed, and nothing more.
  completeAttempt(params.db, claim.attemptKey, succeeded);

  return succeeded;
}

/**
 * The stored answer, read back for a resent key.
 *
 * It is parsed defensively and verified to be a success payload with an asset:
 * a row that cannot be read back is NOT a reason to perform a paid edit again,
 * so the caller refuses instead.
 */
function replayEditResult(resultJson: string | null): ImageEditOutcome | null {
  if (typeof resultJson !== 'string') return null;
  try {
    const parsed = JSON.parse(resultJson) as ImageEditOutcome;
    if (parsed?.status !== 'succeeded') return null;
    if (typeof parsed.asset?.assetId !== 'string') return null;
    return parsed;
  } catch {
    return null;
  }
}
