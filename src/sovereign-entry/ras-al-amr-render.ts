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

/** A job with no encoder in this process for longer than this was interrupted (e.g. a server restart). */
const INTERRUPTED_AFTER_MS = 20 * 60 * 1000;

export type RenderFailureReason =
  | 'no-visual-scenes'
  | 'asset-file-missing'
  | 'renderer-unavailable'
  | 'render-error'
  | 'interrupted';

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

/** Plain-language reason a Creator can act on, derived from the real encoder or compiler error. */
export function describeRenderFailure(rawMessage: string): { reason: RenderFailureReason; message: string } {
  if (rawMessage.includes('no active visual nodes')) {
    return { reason: 'no-visual-scenes', message: 'لا يوجد مشهد مرئي نشط. أضف صورة أو مقطع فيديو إلى المشهد ثم أعد الإخراج.' };
  }
  if (rawMessage.includes('not found at') || rawMessage.includes('no secureStorageUri')) {
    return { reason: 'asset-file-missing', message: 'أحد أصول المشهد لم يعد موجوداً على الخادم. أزله من المشهد أو ارفعه من جديد، ثم أعد الإخراج.' };
  }
  if (rawMessage.includes('FFmpeg spawn failed') || rawMessage.includes('ENOENT')) {
    return { reason: 'renderer-unavailable', message: 'محرك التصيير غير متاح على هذا الخادم الآن. مشهدك محفوظ؛ أعد المحاولة لاحقاً.' };
  }
  return { reason: 'render-error', message: 'توقف التصيير بسبب خطأ في معالجة أحد الملفات. مشهدك محفوظ؛ أعد المحاولة أو استبدل الأصل الأخير.' };
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
    const failure = describeRenderFailure(error instanceof Error ? error.message : '');
    throw new RenderRequestError(failure.reason, failure.message);
  }
  return { operationId, compiled };
}

/** Current state of one render, resolving it into the Vault the moment the MP4 is complete. */
export async function getRasAlAmrRenderStatus(operationId: string, tenantId: string): Promise<RasAlAmrRenderStatus> {
  const entry = await ownedEntry(operationId, tenantId);
  const startedAt = entry.createdAt;

  if (entry.currentState === OperationState.DEPOSITED) {
    return { status: 'succeeded', operationId, startedAt, finishedAt: entry.resolvedAt, ...fileUrls(operationId) };
  }
  if (entry.currentState === OperationState.FAILED || entry.currentState === OperationState.REJECTED_POLICY || entry.currentState === OperationState.REJECTED_QUOTA) {
    const encoderError = getEncodingError(operationId);
    return { status: 'failed', operationId, startedAt, ...describeRenderFailure(encoderError?.message ?? '') };
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
    const encoderError = getEncodingError(operationId);
    return { status: 'failed', operationId, startedAt, ...describeRenderFailure(encoderError?.message ?? message) };
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
  }
  return { status: 'processing', operationId, startedAt };
}

/** The Creator's recent renders from this chamber, newest first (ledger state only, no resolution). */
export function listRasAlAmrRenders(tenantId: string, limit = 5): { operationId: string; state: OperationState; startedAt: number; finishedAt?: number }[] {
  return ledger()
    .listRecentForTenant(tenantId, RAS_AL_AMR_RENDER_PREFIX, limit)
    .map((entry) => ({ operationId: entry.operationId, state: entry.currentState, startedAt: entry.createdAt, finishedAt: entry.resolvedAt }));
}

/** Absolute path of a finished render's MP4, after verifying ownership. */
export async function resolveRasAlAmrRenderFile(operationId: string, tenantId: string): Promise<string> {
  await ownedEntry(operationId, tenantId);
  if (!isEncodingComplete(operationId)) {
    throw new RenderAccessError('not-found', 'The MP4 is not ready.');
  }
  return getOutputPath(operationId);
}
