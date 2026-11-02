/**
 * AZMA OS — Sovereign Operational Entry Layer
 * Ras Al-Amr In-Chamber Render (RAS AL AMR EXECUTION DIRECTIVE — PHASE 4)
 *
 * Ras Al-Amr owns the whole production journey: the Creator compiles,
 * renders, watches, downloads and keeps editing without leaving the chamber.
 * Makman Al-Ghayah keeps distribution and publishing only.
 *
 * No new render engine: this module chains what already exists.
 *   compile  → soel.compileCanvasForPublishing (PrePublishingBoundary, unchanged)
 *   dispatch → fleetRuntime.dispatcher.executeMaterialization (MOTION →
 *              CinematicAssemblyAdapter → FFmpeg encoder, the same path
 *              Makman's rendering bridge uses)
 *   resolve  → fleetRuntime.resolutionGateway.checkAndResolveOperation
 *              (deposits the MP4 in the Sovereign Vault, tenant-checked)
 *
 * The encode runs as a child FFmpeg process, never inside the request: the
 * route returns as soon as the job is accepted, and the chamber polls. The
 * operation ledger is SQLite-backed, so a job's state survives the Creator
 * leaving the chamber and the server restarting.
 */

import { getDb } from '../persistent-storage/db';
import { findVaultAssetByStorageUri } from '../persistent-storage/vault-asset-repository';
import { OperationLedgerManager } from '../orchestrator/fleet-materialization/ledger/operation-ledger-manager';
import { OperationState } from '../orchestrator/fleet-materialization/ledger/operation-ledger-types';
import type { OperationLedgerEntry } from '../orchestrator/fleet-materialization/ledger/operation-ledger-types';
import {
  setEncodingFailureSink,
  getEncodingError,
  getOutputPath,
  isEncodingComplete,
  isEncodingTracked,
} from '../orchestrator/fleet-materialization/fleet/adapters/cinematic-ffmpeg-encoder';
import { CapabilityTarget } from '../core/sovereign-orchestrator/qiyamah-intent-types';
import { SourceChamber } from '../vault/sovereign-vault-types';
import { CanvasType } from '../chambers/ras-al-amr/assembly-contracts';
import type { SovereignCanvas } from '../chambers/ras-al-amr/assembly-contracts';
import type { CompiledAssemblyGraph } from '../chambers/ras-al-amr/pre-publishing-boundary';
import { probeDurationSeconds } from '../vault/media-stream-probe';
import {
  authorisePaidOperation,
  settleReservation,
  releaseReservation,
} from '../economy/paid-operation-gate';
import {
  claimAttempt,
  attachOperation,
  attemptForOperation,
  completeAttempt,
  failAttempt,
} from '../economy/paid-operation-attempts';
import type { AttemptRecord } from '../economy/paid-operation-attempts';
import { MP4_EXPORT_CAPABILITY } from '../economy/pricing/sovereign-price-authority';
import { priceMp4Export } from '../economy/pricing/local-export-pricing';
import { fleetRuntime, soel } from './composition';

export const RAS_AL_AMR_RENDER_PREFIX = 'op_rasamr_';

/** The road an export attempt belongs to. Scoping keeps one road's key from matching another's. */
const MP4_EXPORT_SCOPE = 'rasamr:mp4-export';

/**
 * The encoder is this host's own FFmpeg, not a provider.
 *
 * Named so the ledger row says where the work happened. The gate never asks
 * a cost catalog about it — the price comes from the Founder's own ruling for
 * the final export, which has no provider behind it to invoice.
 */
const LOCAL_ENCODER_GATEWAY = 'local-ffmpeg';

/**
 * ─── THE ENCODER IS GIVEN SOMEWHERE DURABLE TO PUT ITS REASON ───────────────
 *
 *   An FFmpeg child belongs to the process that spawned it, and that process is
 *   the only one that ever learns why it died. The encoder kept the reason in a
 *   module Map, so a status poll served by another instance found nothing.
 *   MEASURED 2026-10-19 on a host with no ffmpeg: the render failed for a
 *   missing engine and the chamber reported «we hold no recorded reason».
 *
 *   Registering here rather than in composition.ts is deliberate: this module
 *   already owns both the taxonomy and the ledger, and the encoder does not
 *   import it — so there is no cycle. It is loaded in exactly the instance that
 *   dispatches a render, which is the instance that spawns the child.
 */
setEncodingFailureSink((operationId, message) => {
  if (!operationId.startsWith(RAS_AL_AMR_RENDER_PREFIX)) return;
  void persistFailure(operationId, classifyRenderFailure(message), message);
});

/** A job with no encoder in this process for longer than this was interrupted (e.g. a server restart). */
const INTERRUPTED_AFTER_MS = 20 * 60 * 1000;

/**
 * ─── EIGHT NAMED WAYS A RENDER CAN FAIL, AND NO NINTH THAT FLATTERS ─────────
 *
 *   «render-error» used to absorb everything that was not one of three cases.
 *   MEASURED: an engine that was not installed at all reached the Creator as
 *   «an error processing one of the files» — a sentence that sends them to
 *   replace an asset that was never the problem.
 *
 *   Each code below names a DIFFERENT thing for the Creator to do. The last
 *   one, `unknown`, exists because a reason that was never recorded must be
 *   reported as absent rather than guessed (see readFailureDiagnostic).
 */
export type RenderFailureReason =
  /** The timeline holds no picture, so there is nothing to render. */
  | 'no-visual-scenes'
  /** An asset the scene points at is gone from the server, or was never hydrated. */
  | 'asset-file-missing'
  /** A file is on disk but carries nothing this renderer can use. */
  | 'media-unsupported'
  /** FFmpeg is absent or cannot be executed on this host. */
  | 'renderer-unavailable'
  /** No private directory is configured, so a film has nowhere safe to be written. */
  | 'render-storage-not-configured'
  /** An external provider accepted the request and then refused or failed it. */
  | 'provider-refused'
  /** The render was asked for in a shape the compiler will not accept. */
  | 'render-config-invalid'
  /** This render belongs to another Creator. */
  | 'forbidden'
  /** The job stopped mid-flight — a restart, a kill, or a timeout. */
  | 'interrupted'
  /** It failed, and no reason was ever recorded. Never invented. */
  | 'unknown';

export type RasAlAmrRenderStatus =
  | { readonly status: 'processing'; readonly operationId: string; readonly startedAt: number }
  | {
      readonly status: 'succeeded';
      readonly operationId: string;
      readonly startedAt: number;
      readonly finishedAt?: number;
      readonly fileUrl: string;
      readonly downloadUrl: string;
      /**
       * The Vault asset the film became, so the chamber can offer the Creator
       * the acceptance step that already exists at
       * POST /api/vault/assets/[assetId]/accept. Absent when the row cannot be
       * found, and the chamber then simply does not offer it — a missing id is
       * never turned into a guess, and nothing here accepts on the Creator's
       * behalf.
       */
      readonly assetId?: string;
    }
  | { readonly status: 'failed'; readonly operationId: string; readonly startedAt: number; readonly reason: RenderFailureReason; readonly message: string };

export class RenderAccessError extends Error {
  constructor(public readonly kind: 'not-found' | 'forbidden', message: string) {
    super(message);
  }
}

export class RenderRequestError extends Error {
  constructor(public readonly reason: RenderFailureReason | 'forbidden', message: string) {
    super(message);
  }
}

/**
 * ─── THE EXPORT WAS NOT PAID FOR, AND SO IT DID NOT RUN ─────────────────────
 *
 *   Kept apart from `RenderRequestError` on purpose: that class carries the
 *   taxonomy of why an ENCODE failed, and a Creator who is short of units has
 *   nothing wrong with their film. The gate's own Arabic sentence and its own
 *   HTTP status travel out untouched, so the chamber says the same thing here
 *   as it does at every other paid door.
 */
export class RenderPaymentError extends Error {
  constructor(
    public readonly httpStatus: 402 | 503,
    /**
     * The gate's three reasons, plus the one this road adds.
     *
     * `operation-in-flight` is deliberately NOT a verdict: it means the
     * Empire has not decided anything yet, so the browser must KEEP this
     * press's key rather than mint a new one. `operationConcluded` reads
     * exactly this string and returns early on it — the same contract every
     * other paid road in the Empire uses.
     */
    public readonly reason: 'payment-required' | 'cost-unavailable' | 'trial-exhausted' | 'operation-in-flight',
    messageAr: string,
    public readonly requiredUnits?: number,
    public readonly availableUnits?: number,
  ) {
    super(messageAr);
  }
}

/**
 * One Arabic sentence per code, each naming what the Creator can DO.
 *
 * It names no decoder, no library, no path and no provider — a Creator is
 * owed an action, not a stack trace, and a provider's own words are the one
 * thing most likely to carry a key or an internal address.
 */
const FAILURE_SENTENCE_AR: Readonly<Record<RenderFailureReason, string>> = {
  'no-visual-scenes': 'لا يوجد مشهد مرئي نشط. أضف صورة أو مقطع فيديو إلى المشهد ثم أعد الإخراج.',
  'asset-file-missing': 'أحد أصول المشهد لم يعد موجوداً على الخادم. أزله من المشهد أو ارفعه من جديد، ثم أعد الإخراج.',
  'media-unsupported': 'أحد أصول المشهد بصيغة لا يقرأها محرك التصيير. استبدله بصورة أو مقطع مألوف، ثم أعد الإخراج.',
  'renderer-unavailable': 'محرك التصيير غير متاح على هذا الخادم الآن. مشهدك محفوظ؛ أعد المحاولة لاحقاً.',
  'render-storage-not-configured': 'الخادم لا يملك مكاناً محمياً لحفظ فيلمك، ولن يُحفظ في مكان مكشوف. مشهدك محفوظ؛ أعد المحاولة لاحقاً.',
  'provider-refused': 'مزوّد الإنتاج رفض الطلب. مشهدك محفوظ؛ أعد المحاولة أو غيّر شيئاً في المشهد.',
  'render-config-invalid': 'إعداد الإخراج غير مقبول. راجع المدد والمقاس في تبويب المشروع، ثم أعد الإخراج.',
  forbidden: 'هذا الإخراج لا يخصك.',
  interrupted: 'توقف الإخراج قبل أن يكتمل. مشهدك محفوظ؛ أعد الإخراج.',
  unknown: 'توقف الإخراج، ولا نملك سبباً محفوظاً له. مشهدك محفوظ؛ أعد الإخراج.',
};

/** The Creator's sentence for a code. The single place either is decided. */
export function renderFailureMessageAr(reason: RenderFailureReason): string {
  return FAILURE_SENTENCE_AR[reason] ?? FAILURE_SENTENCE_AR.unknown;
}

/**
 * The code for a raw engine, compiler or provider message.
 *
 * Order matters: the most specific signature first. An empty or absent message
 * yields `unknown` and NOT a guess — see §2.8 of the directive and the 33
 * production failures that had no recorded reason at all.
 */
export function classifyRenderFailure(rawMessage: string): RenderFailureReason {
  const m = rawMessage ?? '';
  if (m.trim().length === 0) return 'unknown';
  if (m.includes('Security Breach') || m.includes('belongs to another')) return 'forbidden';
  if (m.includes('render-storage-not-configured') || m.includes('UPLOADS_DIR is not configured')) {
    return 'render-storage-not-configured';
  }
  if (m.includes('no active visual nodes')) return 'no-visual-scenes';
  if (m.includes('not found at') || m.includes('no secureStorageUri')) return 'asset-file-missing';
  if (m.includes('FFmpeg spawn failed') || m.includes('ENOENT')) return 'renderer-unavailable';
  if (m.includes('matches no streams') || m.includes('Invalid data found') || m.includes('Unsupported')) {
    return 'media-unsupported';
  }
  if (m.includes('REFUSED_BY_WORKSHOP') || m.includes('REFUSED_BY_ENGINE') || m.includes('provider')) {
    return 'provider-refused';
  }
  if (m.includes('computed duration') || m.includes('must contain at least one') || m.includes('temporal directives')) {
    return 'render-config-invalid';
  }
  if (m.includes('timed out') || m.includes('interrupted') || m.includes('SIGKILL')) return 'interrupted';
  return 'unknown';
}

/** Kept for callers that want both at once. */
export function describeRenderFailure(rawMessage: string): { reason: RenderFailureReason; message: string } {
  const reason = classifyRenderFailure(rawMessage);
  return { reason, message: renderFailureMessageAr(reason) };
}

function fileUrls(operationId: string): { fileUrl: string; downloadUrl: string } {
  const base = `/api/ras-amr/render/${encodeURIComponent(operationId)}/file`;
  return { fileUrl: base, downloadUrl: `${base}?download=1` };
}

/**
 * Which Vault asset this render became.
 *
 * The encoder writes one file per operation and the deposit carries that path
 * verbatim, so the existing storage-uri lookup answers without a new query,
 * a new column or a new index. Scoped to the asking tenant before it is
 * returned — a path is guessable, an asset must still be theirs.
 *
 * Returns undefined rather than throwing: the acceptance step is an offer the
 * chamber makes when it can, never a reason a finished film fails to appear.
 */
function depositedAssetId(operationId: string, tenantId: string): string | undefined {
  try {
    const asset = findVaultAssetByStorageUri(getDb(), `/renders/${operationId}.mp4`);
    return asset && asset.subscriberTenantId === tenantId ? asset.assetId : undefined;
  } catch {
    return undefined;
  }
}

function ledger(): OperationLedgerManager {
  return new OperationLedgerManager(getDb());
}

async function ownedEntry(operationId: string, tenantId: string): Promise<OperationLedgerEntry> {
  if (!operationId.startsWith(RAS_AL_AMR_RENDER_PREFIX)) {
    throw new RenderAccessError('not-found', 'Render not found.');
  }
  let entry: OperationLedgerEntry;
  try {
    entry = await ledger().getEntry(operationId);
  } catch {
    throw new RenderAccessError('not-found', 'Render not found.');
  }
  if (entry.subscriberTenantId !== tenantId) {
    throw new RenderAccessError('forbidden', 'This render belongs to another Creator.');
  }
  return entry;
}

/**
 * What the Empire needs in order to charge for an export, read from the
 * verified session and from the browser's own key for this press.
 */
export interface RasAlAmrRenderMoney {
  /** From the session cookie. A Founder owes nothing, as at every other door. */
  readonly creatorRole: string;
  /**
   * The browser's key for THIS press, so a resent press pays once. Null when
   * the client sent none, and then each press is a separate export — which is
   * the honest reading of a request that refuses to identify itself.
   */
  readonly clientOperationKey: string | null;
}

/** What the Creator was charged for an export, or why nothing was. */
export interface RasAlAmrRenderCharge {
  /** Units held for this export. Zero only when the export was entitled. */
  readonly units: number;
  /** Whole seconds the hold was taken on, from the Empire's own computation. */
  readonly heldForSeconds: number;
  /** `founder` or `trial` when no units were held. */
  readonly entitledVia?: 'founder' | 'trial';
}

/** Compiles the Creator's canvas and starts the real MP4 render. Returns once the job is accepted. */
export async function startRasAlAmrRender(
  canvas: SovereignCanvas,
  tenantId: string,
  /**
   * REQUIRED, not optional. An optional money argument is a free export
   * waiting for one caller to forget it, and this road's whole charge lives
   * in this parameter. A caller that genuinely owes nothing says so by role.
   */
  money: RasAlAmrRenderMoney,
): Promise<{ operationId: string; compiled: CompiledAssemblyGraph; charge: RasAlAmrRenderCharge }> {
  // The session-verified tenant always wins over whatever the client sent.
  const authoritativeCanvas: SovereignCanvas = { ...canvas, subscriberTenantId: tenantId, canvasType: CanvasType.CINEMATIC };

  let compiled: CompiledAssemblyGraph;
  try {
    compiled = await soel.compileCanvasForPublishing(authoritativeCanvas, tenantId);
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('Security Breach')) throw new RenderRequestError('forbidden', message);
    const failure = describeRenderFailure(message);
    throw new RenderRequestError(failure.reason, failure.message);
  }

  const operationId = `${RAS_AL_AMR_RENDER_PREFIX}${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

  // ── THE CHARGE, TAKEN AFTER THE FILM IS COMPILED AND BEFORE IT IS MADE ───
  //
  //   Compiled first, because only the compiled graph knows how long the film
  //   is; before dispatch, because an encode that has begun has already spent
  //   the Empire's machine. Nothing is held for a film that would not compile.
  const charge = holdForExport(operationId, tenantId, money, compiled);
  const dispatchIntent = {
    operationId,
    subscriberTenantId: tenantId,
    capabilityTarget: CapabilityTarget.MOTION, // CINEMATIC = kinetic/temporal artifact (MP4)
    projectContainerId: authoritativeCanvas.canvasId,
    contextReferences: [],
    // This chamber composes the film, so this chamber is what the Vault records.
    // Said here rather than guessed at the deposit, which can only see a ledger row.
    originChamber: SourceChamber.RAS_AL_AMR,
    structuralGraphPayload: compiled,
  };

  try {
    // Same bridge-boundary cast as rendering-bridge.ts: the CINEMATIC adapter
    // reads structuralGraphPayload from the stored intent.
    await fleetRuntime.dispatcher.executeMaterialization(dispatchIntent as never);
  } catch (error) {
    const raw = error instanceof Error ? error.message : '';
    const failure = describeRenderFailure(raw);
    // Recorded against the operation, not left in this process's memory. This
    // is the moment the cause is known most precisely; a later status poll —
    // possibly served by a different module instance — reads it back instead
    // of guessing. See recordFailureDiagnostic for the 33 production failures
    // that had no reason at all.
    await persistFailure(operationId, failure.reason, raw);
    // The job never started, so the hold has nothing to pay for. Released
    // here rather than left to the status poll, which will never see a job
    // the dispatcher refused to accept.
    releaseExportHold(operationId, `dispatch:${failure.reason}`);
    throw new RenderRequestError(failure.reason, failure.message);
  }
  return { operationId, compiled, charge };
}

/**
 * ─── ONE PRESS, ONE PRICE, ONE HOLD ─────────────────────────────────────────
 *
 *   RULED 2026-11-02, decision 2: «١٠٠ وحدة من رصيد المبدع لكل ثانية من ملف
 *   MP4 النهائي». The final file does not exist at this moment, so the hold
 *   is taken on the length the Empire itself computed for the compiled
 *   timeline — never on a number the browser sent — and the settlement later
 *   follows the finished file, measured.
 *
 *   A timeline with no picture in it is refused as what it is — an empty
 *   film — and never as a film whose cost could not be worked out.
 */
function holdForExport(
  operationId: string,
  tenantId: string,
  money: RasAlAmrRenderMoney,
  compiled: CompiledAssemblyGraph,
): RasAlAmrRenderCharge {
  // ── WHICH DURATION, AND WHY IT IS NOT THE OBVIOUS ONE ──────────────────
  //
  //   MEASURED: `estimatedDurationSeconds` spans every live node, audio
  //   included, and the encoder stops at the last picture. Sizing the hold on
  //   it would reserve 6,000 units for a ten-second film under a minute of
  //   music — and REFUSE a Creator holding 3,000 who can easily afford the
  //   1,000 the film actually costs. A hold that blocks what the Creator can
  //   pay for is not caution; it is a wrong number.
  //
  //   `filmDurationSeconds` is the same arithmetic over the pictures alone,
  //   computed by the compiler that already walks every node. It is the figure
  //   the chamber quotes before the press, so the quote and the hold agree.
  const price = priceMp4Export(compiled.metadata.filmDurationSeconds);
  if (!price.ok) {
    // ── AND THIS IS NOT A PRICING PROBLEM, IT IS AN EMPTY FILM ───────────
    //
    //   A film with no picture has no length, so it has no price. But there
    //   is nothing wrong with the Creator's money — there is nothing in their
    //   timeline, and the Empire already has a sentence that says exactly
    //   that and names what to do about it. Answering «this could not be
    //   priced» would hide the real cause behind the money.
    //
    //   MEASURED: before this branch a sound-only canvas was refused 422 by
    //   the dispatcher with 'no-visual-scenes'. The charge now sits before
    //   the dispatch, so that refusal has to be made here or it is lost.
    throw new RenderRequestError('no-visual-scenes', renderFailureMessageAr('no-visual-scenes'));
  }

  const claim = claimAttempt({
    db: getDb(),
    creatorId: tenantId,
    scope: MP4_EXPORT_SCOPE,
    clientKey: money.clientOperationKey,
  });

  // ── THE FOUR VERDICTS, AND THE TWO THAT ARE NOT DUPLICATES ─────────────
  //
  //   An earlier version refused everything but `claimed` with
  //   `cost-unavailable`, and that was wrong twice over:
  //
  //   · `cost-unavailable` is a NAMED VERDICT, so the browser forgot this
  //     press's key — and the next press minted a new one, took a SECOND
  //     hold and dispatched a SECOND encode of the same film. The refusal
  //     meant to prevent a double charge was causing one.
  //
  //   · `claimed-after-failure` is a legitimate retry: the previous attempt
  //     ran and failed, and `claimAttempt` has already issued a fresh key
  //     for a fresh try. Rejecting it left the Creator unable to export ever
  //     again with that key, and left the row it had just written
  //     permanently `in-flight`.
  if (claim.kind === 'in-flight' || claim.kind === 'already-succeeded') {
    throw new RenderPaymentError(
      503,
      'operation-in-flight',
      'هذا الإخراجُ جارٍ بالفعل. انتظِر فيلمَك بدلَ أن تَبدأه مرّتَين.',
    );
  }

  const verdict = authorisePaidOperation({
    db: getDb(),
    creatorId: tenantId,
    role: money.creatorRole,
    // No provider cost class, and there never will be one: the encode runs
    // on this host and no invoice is issued for it. The gate reads the ruled
    // price instead, which is what `sovereignCapability` below names.
    capability: null,
    gatewayId: LOCAL_ENCODER_GATEWAY,
    attemptKey: claim.attemptKey,
    sovereignCapability: MP4_EXPORT_CAPABILITY,
    // Whole seconds, ceiled once, as the ratified rounding requires.
    quantity: price.chargedSeconds,
    metadata: { operationId, basis: 'estimated-duration', exactSeconds: price.exactSeconds },
  });

  if (verdict.kind === 'refused') {
    failAttempt(getDb(), claim.attemptKey, `gate:${verdict.reason}`);
    throw new RenderPaymentError(
      verdict.httpStatus,
      verdict.reason,
      verdict.messageAr,
      verdict.requiredUnits,
      verdict.availableUnits,
    );
  }

  if (verdict.kind === 'entitled') {
    // Nothing is owed, and the attempt says so rather than saying «settled
    // zero». The job is still named, so a status poll finds a resolved
    // attempt instead of hunting for a hold that never existed.
    attachOperation(getDb(), claim.attemptKey, operationId);
    completeAttempt(getDb(), claim.attemptKey, { operationId, entitledVia: verdict.via });
    return { units: 0, heldForSeconds: price.chargedSeconds, entitledVia: verdict.via };
  }

  attachOperation(getDb(), claim.attemptKey, operationId);
  return { units: verdict.units, heldForSeconds: price.chargedSeconds };
}

/**
 * ─── THE SETTLEMENT FOLLOWS THE FILE, NOT THE ESTIMATE ──────────────────────
 *
 *   «يُحسب الخصم وفق مدة الفيديو النهائي الفعلية بالثواني.» So the finished
 *   MP4 is measured with ffprobe and charged for its own length.
 *
 *   `settleReservation` never takes more than was held and gives back the
 *   difference, so a film that came out shorter costs less, and one that came
 *   out longer cannot quietly cost more — the hold is the ceiling, and the gap
 *   is visible in the ledger rather than charged in silence.
 *
 *   Idempotent by the attempt's own settlement state: a chamber polling every
 *   second settles once. A film whose duration cannot be measured is settled
 *   at the held amount rather than released — the Creator has their film, and
 *   a failed instrument is not a refund.
 */
function settleExportHold(operationId: string, tenantId: string): void {
  let attempt: AttemptRecord | null;
  try {
    attempt = attemptForOperation(getDb(), operationId);
  } catch { return; }

  // No attempt, nothing owed, or already resolved — all three are endings.
  if (!attempt || attempt.creatorId !== tenantId) return;
  if (attempt.settlementState !== 'owed' || !attempt.reservationId || attempt.unitsHeld === null) return;

  // ── MEASURED IF IT CAN BE, AND OTHERWISE THE FILM WE QUOTED ────────────
  //
  //   `probeDurationSeconds` returns null when ffprobe is absent or cannot
  //   read the file. Charging the full hold then would turn a missing tool on
  //   the render host into a silent MAXIMUM charge on every export.
  //
  //   So the fallback is the figure the Creator was shown and the hold was
  //   taken on — which, since the hold now follows the film's own length, is
  //   the honest charge for the film they received. Never more than was held,
  //   and the basis is recorded either way so the ledger says which happened.
  const measured = probeDurationSeconds(getOutputPath(operationId) ?? `/renders/${operationId}.mp4`);
  const finalPrice = priceMp4Export(measured);
  const units = finalPrice.ok
    ? Math.min(finalPrice.chargedUnits, attempt.unitsHeld)
    : attempt.unitsHeld;

  settleReservation({
    db: getDb(),
    creatorId: tenantId,
    attemptKey: attempt.attemptKey,
    reservationId: attempt.reservationId,
    units,
    metadata: {
      operationId,
      basis: finalPrice.ok ? 'measured-final-duration' : 'held-amount-unmeasured',
      ...(finalPrice.ok ? { finalSeconds: finalPrice.exactSeconds, chargedSeconds: finalPrice.chargedSeconds } : {}),
    },
  });
  completeAttempt(getDb(), attempt.attemptKey, { operationId, chargedUnits: units });
}

/** The film was never made, so its hold is given back in full. */
function releaseExportHold(operationId: string, reason: string): void {
  let attempt: AttemptRecord | null;
  try {
    attempt = attemptForOperation(getDb(), operationId);
  } catch { return; }
  if (!attempt || attempt.settlementState !== 'owed' || !attempt.reservationId) return;

  releaseReservation({
    db: getDb(),
    creatorId: attempt.creatorId,
    attemptKey: attempt.attemptKey,
    reservationId: attempt.reservationId,
    reason,
  });
  failAttempt(getDb(), attempt.attemptKey, reason);
}

/**
 * ─── A REASON THAT OUTLIVES THE PROCESS THAT KNEW IT ────────────────────────
 *
 *   The encoder keeps its error in a module-level Map. Next.js may serve the
 *   status poll from a different module instance, where that Map is empty, and
 *   the old code then classified an EMPTY string — which fell through to the
 *   catch-all and told the Creator to replace an asset when the real cause was
 *   a renderer that is not installed.
 *
 *   So the reason is written to the ledger row the moment it is known, and read
 *   from there afterwards. Three sources are consulted, in order of how close
 *   each is to the truth:
 *
 *     1. the persisted diagnostic — written at the failure, survives anything;
 *     2. the encoder's in-memory error — available only in the instance that
 *        spawned the job, and persisted on first sight so it stops being;
 *     3. nothing — reported as `unknown`, never as a guess.
 */
async function persistFailure(
  operationId: string,
  reason: RenderFailureReason,
  rawDetail: string,
): Promise<void> {
  try {
    await ledger().recordFailureDiagnostic(operationId, { code: reason, detail: rawDetail });
  } catch {
    // A diagnostic that cannot be stored must never mask the failure it
    // describes, nor turn a failure into an exception of its own.
  }
}

async function resolveFailure(
  operationId: string,
): Promise<{ reason: RenderFailureReason; message: string }> {
  const stored = (() => {
    try { return ledger().readFailureDiagnostic(operationId); } catch { return null; }
  })();
  if (stored?.code) {
    const reason = stored.code as RenderFailureReason;
    return { reason, message: renderFailureMessageAr(reason) };
  }

  const encoderError = getEncodingError(operationId);
  if (encoderError?.message) {
    const reason = classifyRenderFailure(encoderError.message);
    // Seen once, kept for good: the next poll may land elsewhere.
    await persistFailure(operationId, reason, encoderError.message);
    return { reason, message: renderFailureMessageAr(reason) };
  }

  // A legacy row, or a failure recorded before this existed. Said as unknown.
  return { reason: 'unknown', message: renderFailureMessageAr('unknown') };
}

/** Current state of one render, resolving it into the Vault the moment the MP4 is complete. */
export async function getRasAlAmrRenderStatus(operationId: string, tenantId: string): Promise<RasAlAmrRenderStatus> {
  const entry = await ownedEntry(operationId, tenantId);
  const startedAt = entry.createdAt;

  // ── THE MONEY IS RESOLVED WHERE THE OUTCOME BECOMES KNOWN ────────────────
  //
  //   This poll is the only place in the Empire that learns whether an export
  //   finished, so it is the only place that can honestly close its hold.
  //   Both calls are no-ops unless there is a hold still owed for this job,
  //   which is what makes a chamber polling every second free.

  if (entry.currentState === OperationState.DEPOSITED) {
    settleExportHold(operationId, tenantId);
    return { status: 'succeeded', operationId, startedAt, finishedAt: entry.resolvedAt, ...fileUrls(operationId), assetId: depositedAssetId(operationId, tenantId) };
  }
  if (entry.currentState === OperationState.FAILED || entry.currentState === OperationState.REJECTED_POLICY || entry.currentState === OperationState.REJECTED_QUOTA) {
    const failure = await resolveFailure(operationId);
    releaseExportHold(operationId, `render:${failure.reason}`);
    return { status: 'failed', operationId, startedAt, ...failure };
  }

  try {
    const asset = await fleetRuntime.resolutionGateway.checkAndResolveOperation(operationId, tenantId);
    if (asset) {
      settleExportHold(operationId, tenantId);
      return { status: 'succeeded', operationId, startedAt, finishedAt: Date.now(), ...fileUrls(operationId), assetId: depositedAssetId(operationId, tenantId) };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('already been completed')) {
      settleExportHold(operationId, tenantId);
      return { status: 'succeeded', operationId, startedAt, ...fileUrls(operationId), assetId: depositedAssetId(operationId, tenantId) };
    }
    // The resolution gateway's own refusal is the most specific thing known
    // here, so it is persisted before the three-source lookup runs.
    const resolutionReason = classifyRenderFailure(message);
    if (resolutionReason !== 'unknown') await persistFailure(operationId, resolutionReason, message);
    const resolutionFailure = await resolveFailure(operationId);
    releaseExportHold(operationId, `resolution:${resolutionFailure.reason}`);
    return { status: 'failed', operationId, startedAt, ...resolutionFailure };
  }

  // Still encoding — unless no process is encoding it any more.
  if (!isEncodingTracked(operationId) && !isEncodingComplete(operationId) && Date.now() - startedAt > INTERRUPTED_AFTER_MS) {
    // Nothing was produced, so nothing is owed. This is the one ending that
    // reads a clock — and it decides whether the RENDER died, never whether a
    // hold may be swept: the release follows the outcome being known.
    releaseExportHold(operationId, 'render:interrupted');
    return {
      status: 'failed',
      operationId,
      startedAt,
      reason: 'interrupted',
      message: 'توقف هذا الإخراج قبل أن يكتمل (أُعيد تشغيل الخادم). مشهدك محفوظ؛ ابدأ الإخراج من جديد.',
    };
    /* NOTE on §2.7 — the two things this must never say:
       · it does not report FAILED while the job is alive: the branch above is
         reached only when no process tracks the job, no final file exists, AND
         twenty minutes have passed;
       · it does not report SUCCEEDED before the bytes are committed:
         `isEncodingComplete` requires the final path to exist, and that path
         appears only through the atomic rename after FFmpeg exits 0. */
  }
  return { status: 'processing', operationId, startedAt };
}

/**
 * The Creator's recent renders from this chamber, newest first (ledger state
 * only, no resolution). `projectId` keeps each project's results apart — the
 * montage session and every storyboard file their renders under their own
 * canvasId (the intent's projectContainerId).
 */
/**
 * ─── A HOLD WHOSE JOB ENDED WHILE NOBODY WAS WATCHING ───────────────────────
 *
 *   The status poll closes an export's money, because that is where the
 *   outcome becomes known. But a Creator who closes the tab mid-encode never
 *   polls again, and their hold would then sit `owed` for good — units they
 *   can neither spend nor see.
 *
 *   MEASURED: the resolver that exists for exactly this (`reconcileOwedAttempts`)
 *   has no production caller, and it could not speak for an export anyway: the
 *   attempt stays `in-flight` until something observes the job, and the
 *   resolver refuses — rightly — to decide for a job nobody can speak for.
 *
 *   So the Empire looks again at the moment the Creator comes back, which is
 *   the moment this chamber lists their renders. **It is not a sweeper and it
 *   reads no clock:** the operation ledger has already recorded DEPOSITED or
 *   FAILED durably, and that record — never an age — is what decides.
 */
function resolveFinishedExports(
  tenantId: string,
  entries: readonly { operationId: string; currentState: OperationState }[],
): void {
  for (const entry of entries) {
    try {
      if (entry.currentState === OperationState.DEPOSITED) {
        settleExportHold(entry.operationId, tenantId);
      } else if (entry.currentState === OperationState.FAILED
        || entry.currentState === OperationState.REJECTED_POLICY
        || entry.currentState === OperationState.REJECTED_QUOTA) {
        releaseExportHold(entry.operationId, `render:${entry.currentState}`);
      }
      // Anything else is still running, and nothing here speaks for it.
    } catch {
      // Listing a Creator's films must never fail because one hold would not
      // close. The hold stays `owed`, which is where the resolver finds it.
    }
  }
}

export function listRasAlAmrRenders(
  tenantId: string,
  limit = 5,
  projectId?: string,
): { operationId: string; projectId?: string; state: OperationState; startedAt: number; finishedAt?: number }[] {
  const recent = ledger().listRecentForTenant(tenantId, RAS_AL_AMR_RENDER_PREFIX, projectId ? 50 : limit);

  // Before answering, finish the money of any export whose outcome is already
  // recorded. Both calls are no-ops unless a hold is still owed for that job.
  resolveFinishedExports(tenantId, recent);

  return recent
    .filter((entry) => !projectId || entry.sourceIntent.projectContainerId === projectId)
    .slice(0, limit)
    .map((entry) => ({
      operationId: entry.operationId,
      projectId: entry.sourceIntent.projectContainerId,
      state: entry.currentState,
      startedAt: entry.createdAt,
      finishedAt: entry.resolvedAt,
    }));
}

/**
 * Whether a chamber render can stand in for distribution's own render: it is
 * this Creator's, it was rendered from exactly this compilation, and its MP4
 * is finished. Anything else and distribution renders as it always did.
 */
export async function isAdoptableRasAlAmrRender(operationId: string, tenantId: string, compilationId: string): Promise<boolean> {
  if (!operationId.startsWith(RAS_AL_AMR_RENDER_PREFIX)) return false;
  try {
    const entry = await ownedEntry(operationId, tenantId);
    const payload = (entry.sourceIntent as { structuralGraphPayload?: { compilationId?: string } }).structuralGraphPayload;
    if (!compilationId || payload?.compilationId !== compilationId) return false;
    return entry.currentState === OperationState.DEPOSITED || isEncodingComplete(operationId);
  } catch {
    return false;
  }
}

/** Absolute path of a finished render's MP4, after verifying ownership. */
export async function resolveRasAlAmrRenderFile(operationId: string, tenantId: string): Promise<string> {
  await ownedEntry(operationId, tenantId);
  if (!isEncodingComplete(operationId)) {
    throw new RenderAccessError('not-found', 'The MP4 is not ready.');
  }
  return getOutputPath(operationId);
}
