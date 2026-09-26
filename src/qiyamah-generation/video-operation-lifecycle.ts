import { randomUUID } from 'crypto';
import { getDb } from '../persistent-storage';
import { OperationLedgerManager } from '../orchestrator/fleet-materialization/ledger/operation-ledger-manager';
import { OperationState } from '../orchestrator/fleet-materialization/ledger/operation-ledger-types';
import { CapabilityTarget } from '../core/sovereign-orchestrator/qiyamah-intent-types';
import type { MotionIntent } from '../core/sovereign-orchestrator/qiyamah-intent-types';
import { generateVideo } from './generation-service';
import type { VideoGenerationRequest } from './types';

/**
 * AZMA OS — Qiyamah
 * The video production operation's own lifecycle, independent of the HTTP request.
 *
 * ─── THE INCIDENT THIS ANSWERS ───────────────────────────────────────────────
 *
 *   Operation ce90a828 (2026-09-22, kling-3.0): the Creator pressed generate,
 *   the edge closed the connection at ~125 s (nginx 499, 0 bytes), and the
 *   server went on to finish at 362 s — provider complete, 6,167,822 bytes
 *   downloaded, file persisted, asset deposited, state `available`. The video
 *   existed and was the Creator's. The chamber said «البوابة لا تستجيب. أعِد
 *   المحاولة.» because the only thing it knew was its own broken socket.
 *
 *   A production that takes minutes cannot have its truth carried by a
 *   connection that lives for seconds.
 *
 * ─── WHAT THIS MODULE IS, AND IS NOT ────────────────────────────────────────
 *
 *   It is NOT a generation engine: generateVideo still does every step of the
 *   work exactly as it did. It is NOT a new state vocabulary: the states are
 *   the Empire's own OperationState, and the record is the existing
 *   operation_ledger table. It is NOT a queue or a worker: the production
 *   continues in the same Node process that accepted it, which is where it
 *   already ran — only the response no longer waits for it.
 *
 *   What it adds is a place to ASK. The ledger row is the authoritative
 *   answer to «what happened to my production», and it survives the socket.
 *
 * ─── THE ONE RULE ABOUT MONEY ────────────────────────────────────────────────
 *
 *   A lost response must never cost the Creator a second production. The
 *   Creator's intent key — minted in the browser BEFORE the request and kept
 *   there — is recorded in the ledger's own source intent. A retry carrying
 *   the same key is answered with the operation that already exists, never
 *   with a new one.
 */

/** What the route hands back the instant it accepts the work. */
export interface AcceptedOperation {
  readonly operationId: string;
  readonly state: OperationState;
  /** True when this key already had an operation: nothing new was started. */
  readonly reused: boolean;
}

/**
 * The Creator-facing reason a production failed.
 *
 * Contract §5 requires a real reason attributable to the operation; §10
 * forbids the provider or the model appearing in the Creator's contract.
 * Both hold at once by saying WHAT failed, never WHO: the provider's own
 * words stay on the server, in the operation trail, where an engineer reads
 * them and a Creator never does.
 */
export type ProductionFailure =
  | 'REFUSED_BY_ENGINE'      // the engine declined or errored on the request
  | 'NO_OUTPUT'              // it completed with nothing usable
  | 'OUTPUT_NOT_VIDEO'       // what came back was not a video
  | 'TOOK_TOO_LONG'          // it never finished in the time allowed
  | 'CAPACITY_EXHAUSTED'     // the Empire's own capacity with the engine ran out
  | 'STORAGE_FAILED'         // the result could not be kept
  | 'INTERNAL';              // anything else — the trail carries the detail

/** What an observer is told about a production. */
export interface ObservedOperation {
  readonly operationId: string;
  readonly state: OperationState;
  readonly isTerminal: boolean;
  readonly createdAt: number;
  readonly updatedAt: number;
  readonly resolvedAt?: number;
  /** Present once the asset is deposited. */
  readonly assetId?: string;
  readonly assetUrl?: string;
  /** Present on a real production failure — never on a lost connection. */
  readonly failureReason?: ProductionFailure;
}

/**
 * Classify a failure for the Creator. The input may name an engine, a model,
 * an endpoint or an HTTP code; none of that crosses this function.
 */
export function classifyFailure(reason: string | undefined, message: string | undefined): ProductionFailure {
  const text = `${reason ?? ''} ${message ?? ''}`.toLowerCase();
  if (/no_credit|insufficient|quota|402/.test(text)) return 'CAPACITY_EXHAUSTED';
  if (/timed_out|timeout|no result within/.test(text)) return 'TOOK_TOO_LONG';
  if (/not a video|no mp4|signature/.test(text)) return 'OUTPUT_NOT_VIDEO';
  if (/no_output|carried no result|invalid video url|could not be retrieved/.test(text)) return 'NO_OUTPUT';
  if (/storage|persist|keep the generated/.test(text)) return 'STORAGE_FAILED';
  if (/provider-error|submit_failed|render_failed|rejected|http \d\d\d/.test(text)) return 'REFUSED_BY_ENGINE';
  return 'INTERNAL';
}

const TERMINAL: readonly OperationState[] = [
  OperationState.DEPOSITED,
  OperationState.FAILED,
  OperationState.REJECTED_QUOTA,
  OperationState.REJECTED_POLICY,
];

export function isTerminal(state: OperationState): boolean {
  return TERMINAL.includes(state);
}

function ledger(): OperationLedgerManager {
  return new OperationLedgerManager(getDb());
}

/**
 * The intent as the ledger stores it. `intentKey`, `prompt`, `assetId` and
 * `failureReason` ride inside it rather than in new columns: the ledger's
 * schema is shared with the cinematic path and this repair does not own it.
 */
interface StoredVideoIntent extends MotionIntent {
  readonly intentKey: string;
  readonly prompt: string;
  readonly style: string | null;
  readonly assetId?: string;
  readonly assetUrl?: string;
  /** Creator-facing classification only — never the engine's own words. */
  readonly failureReason?: ProductionFailure;
}

function readStored(operationId: string, db = getDb()): StoredVideoIntent | null {
  const row = db
    .prepare('SELECT source_intent_json FROM operation_ledger WHERE operation_id = ?')
    .get(operationId) as { source_intent_json?: string } | undefined;
  if (!row?.source_intent_json) return null;
  try { return JSON.parse(row.source_intent_json) as StoredVideoIntent; } catch { return null; }
}

function writeStored(operationId: string, patch: Partial<StoredVideoIntent>, db = getDb()): void {
  const current = readStored(operationId, db);
  if (!current) return;
  db.prepare('UPDATE operation_ledger SET source_intent_json = ?, updated_at = ? WHERE operation_id = ?')
    .run(JSON.stringify({ ...current, ...patch }), Date.now(), operationId);
}

/**
 * The operation this Creator already started for this intent key, if any.
 *
 * Owner-scoped in SQL, not after the fact: another Creator's operation is
 * never a candidate, whatever key they present.
 */
export function findOperationByIntentKey(creatorId: string, intentKey: string): string | null {
  if (!intentKey) return null;
  const row = getDb()
    .prepare(
      `SELECT operation_id FROM operation_ledger
        WHERE subscriber_tenant_id = ? AND capability_target = ?
          AND source_intent_json LIKE ?
        ORDER BY created_at DESC LIMIT 1`,
    )
    .get(creatorId, CapabilityTarget.MOTION, `%"intentKey":"${intentKey}"%`) as { operation_id?: string } | undefined;
  return row?.operation_id ?? null;
}

/** Read a production's authoritative state. Returns null when it is not this Creator's. */
export async function observeOperation(operationId: string, creatorId: string): Promise<ObservedOperation | null> {
  // capability_target scopes this to video productions: the ledger is shared
  // with the cinematic path, whose operations are not this contract's and
  // whose states are not among the four it declares (§2).
  const row = getDb()
    .prepare(
      `SELECT operation_id, subscriber_tenant_id, current_state, created_at, updated_at, resolved_at
         FROM operation_ledger WHERE operation_id = ? AND capability_target = ?`,
    )
    .get(operationId, CapabilityTarget.MOTION) as
      | { operation_id: string; subscriber_tenant_id: string; current_state: string; created_at: number; updated_at: number; resolved_at: number | null }
      | undefined;
  // Not found and not-yours are the same answer to the asker: nothing.
  if (!row || row.subscriber_tenant_id !== creatorId) return null;
  const stored = readStored(operationId);
  const state = row.current_state as OperationState;
  return {
    operationId: row.operation_id,
    state,
    isTerminal: isTerminal(state),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    resolvedAt: row.resolved_at ?? undefined,
    assetId: stored?.assetId,
    assetUrl: stored?.assetUrl,
    failureReason: stored?.failureReason,
  };
}

/**
 * Accept a video production and let it run on its own.
 *
 * Returns as soon as the operation exists in the ledger. The production then
 * proceeds in this process and writes its own ending there — whether or not
 * anyone is still listening on the socket that asked for it.
 */
export async function acceptVideoProduction(params: {
  readonly creatorId: string;
  readonly intentKey: string;
  readonly request: VideoGenerationRequest;
}): Promise<AcceptedOperation> {
  const existing = findOperationByIntentKey(params.creatorId, params.intentKey);
  if (existing) {
    const observed = await observeOperation(existing, params.creatorId);
    // The same intent, asked twice: answer with the production that exists.
    // Never a second provider call, never a second charge.
    return { operationId: existing, state: observed?.state ?? OperationState.PENDING_AUTHORIZATION, reused: true };
  }

  const operationId = params.request.operationId ?? randomUUID();
  const intent: StoredVideoIntent = {
    operationId,
    subscriberTenantId: params.creatorId,
    capabilityTarget: CapabilityTarget.MOTION,
    contextReferences: [],
    durationVectorsSeconds: params.request.durationSeconds,
    physicsScales: 'PROVIDER_DEFINED',
    kineticMarkers: [],
    intentKey: params.intentKey,
    prompt: params.request.prompt,
    style: params.request.style ?? null,
  };

  const manager = ledger();
  await manager.createEntry(intent);
  // Accepted and on its way: the Creator passed entitlement and validation
  // before this function was called, so the operation is authorized and
  // about to be dispatched to the binding.
  await manager.updateState(operationId, OperationState.AUTHORIZED);
  await manager.updateState(operationId, OperationState.DISPATCHED);

  // The production, from here, belongs to the operation and not to the
  // request. A rejected promise must never become an unhandled rejection
  // that takes the process down with it.
  void runProduction(operationId, { ...params.request, operationId }).catch(() => { /* recorded below */ });

  return { operationId, state: OperationState.DISPATCHED, reused: false };
}

async function runProduction(operationId: string, request: VideoGenerationRequest): Promise<void> {
  const manager = ledger();
  try {
    await manager.updateState(operationId, OperationState.MATERIALIZING);
  } catch { /* already terminal — nothing to do */ }

  let result;
  try {
    result = await generateVideo(request);
  } catch (err) {
    // The engine's words go to the trail, not to the Creator (contract §10).
    const detail = err instanceof Error ? err.message : String(err);
    console.log('[QiyamahOperation]', JSON.stringify({ operationId, stage: 'failed', detail: detail.slice(0, 240) }));
    writeStored(operationId, { failureReason: classifyFailure(undefined, detail) });
    try { await manager.updateState(operationId, OperationState.FAILED, { resolvedAt: Date.now() }); } catch { /* sealed */ }
    return;
  }

  if (result.status === 'succeeded') {
    writeStored(operationId, { assetId: result.asset.assetId, assetUrl: result.asset.assetUrl });
    try {
      // -- THE LEDGER'S OWN COLUMNS, SEALED IN THE TRANSITION IT ALREADY
      //    MAKES --------------------------------------------------------
      //   MEASURED 2026-09-26: allocated_provider_id and external_job_id were
      //   null on every row, and actual_resource_cost on all 28 — not because
      //   the facts were unknown, but because this call passed only a
      //   timestamp. `updates` has always accepted them.
      //
      //   The charge is the PROVIDER'S, in the PROVIDER'S unit. The unit is
      //   recorded with the asset, because this column cannot hold one.
      await manager.updateState(operationId, OperationState.DEPOSITED, {
        resolvedAt: Date.now(),
        ...(result.production?.allocatedProviderId
          ? { allocatedProviderId: result.production.allocatedProviderId } : {}),
        ...(result.production?.externalJobId
          ? { externalJobId: result.production.externalJobId } : {}),
        ...(typeof result.production?.providerCharge === 'number'
          ? { actualResourceCost: result.production.providerCharge } : {}),
      });
    } catch { /* sealed */ }
    return;
  }

  console.log('[QiyamahOperation]', JSON.stringify({ operationId, stage: 'failed', reason: result.reason, detail: String(result.message).slice(0, 240) }));
  writeStored(operationId, { failureReason: classifyFailure(result.reason, result.message) });
  try { await manager.updateState(operationId, OperationState.FAILED, { resolvedAt: Date.now() }); } catch { /* sealed */ }
}
