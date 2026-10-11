/**
 * AZMA OS — ONE EXECUTION PATH FOR THE FOUR CREATIVE OPERATIONS
 *
 * ─── WHY ONE RUNNER AND NOT FOUR ROUTES ─────────────────────────────────────
 *
 *   Background removal, lip sync, face swap and talking photo differ in
 *   exactly two things: which asset families they take, and which provider
 *   function they call. Everything else is identical — the session, the
 *   ownership check, the derivability check, reading the bytes, writing the
 *   result, proving it differs from its parent, and depositing it with its
 *   lineage.
 *
 *   Four routes would be four copies of a security-critical sequence, each
 *   able to drift. The chamber already paid for that lesson twice: D-6 found
 *   one block written twice, and the edit route's own header records that the
 *   voice-cloning route resolved an uploads path wrongly because the sequence
 *   was copied rather than shared.
 *
 *   So the ORDER lives here once — and the order is the safety:
 *
 *       session → own every input → each is the family the act needs →
 *       the target may be derived from → read the bytes → run the provider →
 *       write the result → prove it differs → deposit with its lineage
 *
 * ─── AND IT DECIDES NO AVAILABILITY ─────────────────────────────────────────
 *
 *   It refuses to run an operation the catalog has not marked runnable. It
 *   does not decide that for itself: `stateOfOperation` is the one authority,
 *   and a runner that could overrule it would be the second authority this
 *   chamber has spent three packages removing.
 *
 *   Today that means every one of the four is refused — three for an unmeasured
 *   cost, one for a policy nobody has ruled. This is the path that will carry
 *   them the day those change, and it is not a claim that they have.
 */

import type { DatabaseSync } from 'node:sqlite';
import { getVaultAsset } from '../persistent-storage';
import { persistUploadedAsset } from './vault-asset-upload-storage';
import { deriveAsset, mutationRejectionSpokenAr } from './sovereign-asset-mutation';
import {
  SourceChamber, DerivationKind, isDerivable, isLegacyAsset, AssetFamily,
} from './sovereign-vault-types';
import { resolveAssetPath } from './asset-bytes';
import { readFile } from 'fs/promises';
import {
  removeBackgroundViaProvider, lipSyncViaProvider, talkingPhotoViaProvider,
  faceSwapViaProvider,
  type CreativeOperationId, type CreativeOperationResult,
} from '../core/sovereign-ai-integration/adapters/magic-hour-creative-operations';
import { ImageEditError } from '../core/sovereign-ai-integration/adapters/magic-hour-image-editing';
import { stateOfOperation } from '../qiyamah-generation/operation-catalog';
import { configuredGatewayIds } from '../core/sovereign-ai-integration/provider-bootstrap';

// ─────────────────────────────────────────────────────────────────────────────
// 1 · WHAT EACH OPERATION NEEDS, DECLARED ONCE
// ─────────────────────────────────────────────────────────────────────────────

/** Which asset family each input slot must be. Checked on the server. */
export interface CreativeInputShape {
  /** The asset the output derives FROM — its parent in the lineage. */
  readonly targetFamily: AssetFamily;
  /** A second input, when the operation takes one. */
  readonly secondFamily?: AssetFamily;
  /** What the produced asset is, and therefore how it is deposited. */
  readonly outputDerivation: DerivationKind;
  readonly outputExtension: '.png' | '.jpg' | '.mp4';
}

export const CREATIVE_INPUT_SHAPE: Readonly<Record<CreativeOperationId, CreativeInputShape>> = {
  'background-removal': {
    targetFamily: AssetFamily.MEDIA,
    // PNG, always: the whole point is an alpha channel, and JPEG has none.
    outputDerivation: DerivationKind.MODIFIED, outputExtension: '.png',
  },
  'talking-photo': {
    targetFamily: AssetFamily.MEDIA, secondFamily: AssetFamily.MEDIA,
    outputDerivation: DerivationKind.ANIMATED, outputExtension: '.mp4',
  },
  'lip-sync': {
    targetFamily: AssetFamily.MEDIA, secondFamily: AssetFamily.MEDIA,
    outputDerivation: DerivationKind.MODIFIED, outputExtension: '.mp4',
  },
  'face-swap': {
    targetFamily: AssetFamily.MEDIA, secondFamily: AssetFamily.MEDIA,
    outputDerivation: DerivationKind.MODIFIED, outputExtension: '.mp4',
  },
};

/** The capability each input must declare — a photo is not a clip. */
const TARGET_CAPABILITY: Readonly<Record<CreativeOperationId, 'VISUAL' | 'MOTION'>> = {
  'background-removal': 'VISUAL',
  'talking-photo': 'VISUAL',
  'lip-sync': 'MOTION',
  'face-swap': 'MOTION',
};

const SECOND_CAPABILITY: Readonly<Partial<Record<CreativeOperationId, 'AUDIO' | 'VISUAL'>>> = {
  'talking-photo': 'AUDIO',
  'lip-sync': 'AUDIO',
  'face-swap': 'VISUAL',
};

// ─────────────────────────────────────────────────────────────────────────────
// 2 · THE OUTCOME — ONE SHAPE, AND IT NEVER INVENTS
// ─────────────────────────────────────────────────────────────────────────────

export type CreativeRunRejection =
  | 'unavailable'
  | 'not-found'
  | 'wrong-family'
  | 'not-derivable'
  | 'source-unreadable'
  | 'duration-required'
  | 'engine-refused'
  | 'output-rejected';

export type CreativeRunOutcome =
  | {
      readonly ok: true;
      readonly assetId: string;
      readonly storageUri: string;
      readonly parentAssetId: string;
      /** What the provider charged, as the provider stated it. Never estimated. */
      readonly providerCreditsCharged: number | null;
    }
  | {
      readonly ok: false;
      readonly rejection: CreativeRunRejection;
      /** Said to the Creator. Arabic, with the remedy where one exists. */
      readonly messageAr: string;
      /** For a log. Never a provider's prose and never a credential. */
      readonly detailEn: string;
    };

const SPOKEN: Readonly<Record<CreativeRunRejection, string>> = {
  unavailable: 'هذه العمليّة غير متاحةٍ بعد.',
  'not-found': 'لا يوجد أصلٌ بهذا المعرّف في خزانتك.',
  'wrong-family': 'هذا الأصل ليس من النوع الذي تحتاجه هذه العمليّة.',
  'not-derivable': 'لا يُسمَح بالاشتقاق من هذا الأصل.',
  'source-unreadable': 'تعذّر قراءة بايتات أصلك على الخادم.',
  'duration-required': 'هذه العمليّة تحتاج مدّةً موجبة.',
  'engine-refused': 'لم يُتِمّ المحرّكُ هذه العمليّة.',
  'output-rejected': 'لم يُقبَل الناتج.',
};

const fail = (
  rejection: CreativeRunRejection,
  detailEn: string,
  messageAr?: string,
): CreativeRunOutcome => ({ ok: false, rejection, messageAr: messageAr ?? SPOKEN[rejection], detailEn });

// ─────────────────────────────────────────────────────────────────────────────
// 3 · THE RUNNER
// ─────────────────────────────────────────────────────────────────────────────

export interface CreativeRunRequest {
  readonly operation: CreativeOperationId;
  readonly creatorId: string;
  /** The asset the output derives from. */
  readonly targetAssetId: string;
  /** The second input, for the operations that take one. */
  readonly secondAssetId?: string;
  /** Required by lip sync, talking photo and face swap. */
  readonly durationSeconds?: number;
}

/**
 * Run one creative operation end to end, or refuse with a reason.
 *
 * It never returns a URL as a result and never fabricates an id: the deposited
 * asset's id comes from `deriveAsset`, which refuses output identical to its
 * parent — a guard that is only meaningful because the provider returns BYTES.
 */
export async function runCreativeOperation(
  db: DatabaseSync,
  request: CreativeRunRequest,
): Promise<CreativeRunOutcome> {
  const { operation, creatorId } = request;

  // ── 0 · THE CATALOG'S VERDICT, NOT THE RUNNER'S ────────────────────────
  //   Asked FIRST, before an asset is read or a byte is uploaded. A Creator
  //   whose operation is shut must not have their work read for nothing.
  const state = stateOfOperation(operation, configuredGatewayIds(), null);
  if (!state.runnable) {
    return fail('unavailable', `${operation}: ${state.detailEn}`, state.reasonAr);
  }

  const shape = CREATIVE_INPUT_SHAPE[operation];

  // ── 1 · THE TARGET: owned, the right family, derivable ──────────────────
  const parent = getVaultAsset(db, request.targetAssetId);
  if (!parent || parent.subscriberTenantId !== creatorId) {
    // The same answer for «no such asset» and «not yours», so an id cannot
    // be probed.
    return fail('not-found', `target ${request.targetAssetId} absent or not owned`);
  }
  if (parent.capabilityTarget !== TARGET_CAPABILITY[operation]) {
    return fail('wrong-family',
      `target is ${parent.capabilityTarget}, ${operation} needs ${TARGET_CAPABILITY[operation]}`);
  }
  if (!isLegacyAsset(parent) && !isDerivable(parent)) {
    return fail('not-derivable', `target ${parent.assetId} forbids derivation`);
  }

  // ── 2 · THE SECOND INPUT, when the operation takes one ──────────────────
  let second: NonNullable<ReturnType<typeof getVaultAsset>> | null = null;
  if (shape.secondFamily) {
    if (!request.secondAssetId) {
      return fail('wrong-family', `${operation} requires a second asset and none was given`);
    }
    second = getVaultAsset(db, request.secondAssetId);
    if (!second || second.subscriberTenantId !== creatorId) {
      return fail('not-found', `second ${request.secondAssetId} absent or not owned`);
    }
    const want = SECOND_CAPABILITY[operation];
    if (want && second.capabilityTarget !== want) {
      return fail('wrong-family', `second is ${second.capabilityTarget}, ${operation} needs ${want}`);
    }
  }

  // ── 3 · A DURATION, where the provider demands one ──────────────────────
  const needsDuration = operation !== 'background-removal';
  if (needsDuration && !(Number.isFinite(request.durationSeconds) && (request.durationSeconds ?? 0) > 0)) {
    return fail('duration-required', `${operation} requires a positive durationSeconds`);
  }

  // ── 4 · THE BYTES. The originals are READ, never altered ───────────────
  let targetBytes: Buffer;
  let secondBytes: Buffer | null = null;
  try {
    targetBytes = await readFile(resolveAssetPath(parent.secureStorageUri));
    if (second) secondBytes = await readFile(resolveAssetPath(second.secureStorageUri));
  } catch {
    // The storage path is never echoed to a Creator.
    return fail('source-unreadable', `${operation}: an input's bytes are not on the server`);
  }

  const ext = (uri: string) => {
    const dot = uri.lastIndexOf('.');
    return dot >= 0 ? uri.slice(dot) : '';
  };

  // ── 5 · THE PROVIDER. Submission is not completion — the adapter polls ──
  let produced: CreativeOperationResult;
  try {
    produced = operation === 'background-removal'
      ? await removeBackgroundViaProvider(targetBytes, ext(parent.secureStorageUri))
      : operation === 'talking-photo'
        ? await talkingPhotoViaProvider(
            targetBytes, ext(parent.secureStorageUri),
            secondBytes!, ext(second!.secureStorageUri), request.durationSeconds!)
        : operation === 'lip-sync'
          ? await lipSyncViaProvider(
              targetBytes, ext(parent.secureStorageUri),
              secondBytes!, ext(second!.secureStorageUri), request.durationSeconds!)
          : await faceSwapViaProvider(
              targetBytes, ext(parent.secureStorageUri),
              secondBytes!, ext(second!.secureStorageUri), request.durationSeconds!);
  } catch (err) {
    const rejection = err instanceof ImageEditError ? err.rejection : null;
    // The engine's own words stay server-side; they name a provider.
    return fail('engine-refused', `${operation}: ${rejection ?? 'unknown'}`,
      rejection === 'NO_CREDIT'
        ? 'الإمبراطوريّةُ لا تملك رصيداً كافياً عند المحرّك الآن. وليست المشكلةُ في أصلك.'
        : rejection === 'TIMED_OUT'
          ? 'استغرقت العمليّةُ أطولَ من المسموح. أعِد المحاولة.'
          : SPOKEN['engine-refused']);
  }

  // ── 6 · WRITE, THEN PROVE IT EARNED ITS PLACE ──────────────────────────
  const persisted = await persistUploadedAsset(produced.bytes, shape.outputExtension);

  const outcome = await deriveAsset({
    parentAssetId: parent.assetId,
    ownerId: creatorId,
    parentBytes: targetBytes,
    outputBytes: produced.bytes,
    outputStorageUri: persisted.assetUrl,
    // Article 3.1: a change inside an asset belongs to Qiyamah.
    chamber: SourceChamber.QIYAMAH,
    derivation: shape.outputDerivation,
    // No creative brief exists for these four; the inputs ARE the instruction.
    instructionAr: state.nameAr,
    operationId: persisted.assetId,
    actorId: creatorId,
    providerProvenance: {
      providerId: produced.providerId,
      providerModelId: operation,
      providerJobId: produced.providerJobId,
      creditsCharged: produced.creditsCharged,
      creditUnit: 'magic-hour-credits',
    },
  });

  if (!outcome.ok) {
    return fail('output-rejected', `${operation}: ${outcome.rejection}`,
      mutationRejectionSpokenAr(outcome.rejection));
  }

  return {
    ok: true,
    assetId: outcome.asset.assetId,
    storageUri: outcome.asset.secureStorageUri,
    parentAssetId: parent.assetId,
    providerCreditsCharged: produced.creditsCharged,
  };
}
