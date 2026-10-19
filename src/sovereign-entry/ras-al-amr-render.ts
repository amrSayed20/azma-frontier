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
import { CanvasType } from '../chambers/ras-al-amr/assembly-contracts';
import type { SovereignCanvas } from '../chambers/ras-al-amr/assembly-contracts';
import type { CompiledAssemblyGraph } from '../chambers/ras-al-amr/pre-publishing-boundary';
import { fleetRuntime, soel } from './composition';

export const RAS_AL_AMR_RENDER_PREFIX = 'op_rasamr_';

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
  | { readonly status: 'succeeded'; readonly operationId: string; readonly startedAt: number; readonly finishedAt?: number; readonly fileUrl: string; readonly downloadUrl: string }
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

/** Compiles the Creator's canvas and starts the real MP4 render. Returns once the job is accepted. */
export async function startRasAlAmrRender(
  canvas: SovereignCanvas,
  tenantId: string,
): Promise<{ operationId: string; compiled: CompiledAssemblyGraph }> {
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
  const dispatchIntent = {
    operationId,
    subscriberTenantId: tenantId,
    capabilityTarget: CapabilityTarget.MOTION, // CINEMATIC = kinetic/temporal artifact (MP4)
    projectContainerId: authoritativeCanvas.canvasId,
    contextReferences: [],
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
    throw new RenderRequestError(failure.reason, failure.message);
  }
  return { operationId, compiled };
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

  if (entry.currentState === OperationState.DEPOSITED) {
    return { status: 'succeeded', operationId, startedAt, finishedAt: entry.resolvedAt, ...fileUrls(operationId) };
  }
  if (entry.currentState === OperationState.FAILED || entry.currentState === OperationState.REJECTED_POLICY || entry.currentState === OperationState.REJECTED_QUOTA) {
    return { status: 'failed', operationId, startedAt, ...await resolveFailure(operationId) };
  }

  try {
    const asset = await fleetRuntime.resolutionGateway.checkAndResolveOperation(operationId, tenantId);
    if (asset) {
      return { status: 'succeeded', operationId, startedAt, finishedAt: Date.now(), ...fileUrls(operationId) };
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : '';
    if (message.includes('already been completed')) {
      return { status: 'succeeded', operationId, startedAt, ...fileUrls(operationId) };
    }
    // The resolution gateway's own refusal is the most specific thing known
    // here, so it is persisted before the three-source lookup runs.
    const resolutionReason = classifyRenderFailure(message);
    if (resolutionReason !== 'unknown') await persistFailure(operationId, resolutionReason, message);
    return { status: 'failed', operationId, startedAt, ...await resolveFailure(operationId) };
  }

  // Still encoding — unless no process is encoding it any more.
  if (!isEncodingTracked(operationId) && !isEncodingComplete(operationId) && Date.now() - startedAt > INTERRUPTED_AFTER_MS) {
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
export function listRasAlAmrRenders(
  tenantId: string,
  limit = 5,
  projectId?: string,
): { operationId: string; projectId?: string; state: OperationState; startedAt: number; finishedAt?: number }[] {
  return ledger()
    .listRecentForTenant(tenantId, RAS_AL_AMR_RENDER_PREFIX, projectId ? 50 : limit)
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
