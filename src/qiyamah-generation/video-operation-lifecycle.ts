import { randomUUID } from 'crypto';
import { getDb } from '../persistent-storage';
import { OperationLedgerManager } from '../orchestrator/fleet-materialization/ledger/operation-ledger-manager';
import { OperationState } from '../orchestrator/fleet-materialization/ledger/operation-ledger-types';
import { CapabilityTarget } from '../core/sovereign-orchestrator/qiyamah-intent-types';
import type { MotionIntent } from '../core/sovereign-orchestrator/qiyamah-intent-types';
import { generateVideo } from './generation-service';
import type { VideoGenerationRequest } from './types';
import { settleReservation, releaseReservation } from '../economy/paid-operation-gate';
import { completeAttempt, failAttempt } from '../economy/paid-operation-attempts';

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

  // ── THE PATTERN MUST BE WRITTEN THE WAY THE COLUMN IS ────────────────────
  //
  //   FOUND 2026-11-01 by a security review. The column holds
  //   `JSON.stringify(intent)`, and this pattern was built from the RAW key —
  //   so a key containing a character JSON escapes (`"`, `\`, a control
  //   character) produced a pattern that could NEVER match the stored text.
  //   The lookup then reported «no such production», and the one caller that
  //   assumed it only ever hands work back started a brand-new paid video
  //   instead, answering `reused: true` with no hold and no record.
  //
  //   Two things are fixed here. The key is escaped as JSON escapes it, so
  //   the pattern reads what the column wrote; and `%` and `_` — both legal
  //   in a key a browser mints — are escaped with a named ESCAPE character,
  //   so a key cannot act as a wildcard and match a DIFFERENT production.
  const asStored = JSON.stringify(intentKey).slice(1, -1);
  const pattern = `%"intentKey":"${asStored.replace(/[\\%_]/g, (c) => `\\${c}`)}"%`;

  const row = getDb()
    .prepare(
      `SELECT operation_id FROM operation_ledger
        WHERE subscriber_tenant_id = ? AND capability_target = ?
          AND source_intent_json LIKE ? ESCAPE '\\'
        ORDER BY created_at DESC LIMIT 1`,
    )
    .get(creatorId, CapabilityTarget.MOTION, pattern) as { operation_id?: string } | undefined;
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
/**
 * What this production owes, carried into the half that runs after the
 * answer has already been sent.
 *
 * ─── THE DORMANT DEFECT THIS CLOSES ───────────────────────────────────────
 *
 *   FOUND 2026-11-01. The route settled the hold immediately after
 *   ACCEPTANCE, with a comment beside it saying the opposite — «settled by
 *   the operation's own ending, not here, where nothing is yet known». So a
 *   production that was accepted and then failed left the Creator charged
 *   for a video that never existed, and nothing released it.
 *
 *   It has never fired, because `video-generation` is pending-discovery in
 *   the cost catalog and no hold is taken at all today. It would fire on the
 *   first day a price is approved — which is the decision now before the
 *   owner. A charge at acceptance is not a charge for work.
 *
 *   So the money travels here and is closed at the production's own ending.
 *   It is ALSO recorded durably on the attempt row by `attachReservation`,
 *   so a process that dies between the two leaves a hold the resolver can
 *   still read and finish.
 */
export interface ProductionMoney {
  readonly attemptKey: string;
  readonly reservationId: string;
  readonly units: number;
}

interface AcceptVideoProductionParams {
  readonly creatorId: string;
  readonly intentKey: string;
  readonly request: VideoGenerationRequest;
  /** Absent when the act was entitled and nothing is held. */
  readonly money?: ProductionMoney;
  /**
   * The attempt this production belongs to, present whether or not a hold
   * was taken — because an entitled production still has an outcome to
   * record, and a row left in-flight for ever is a record that lies.
   */
  readonly attemptKey?: string;
  /**
   * Hand back only what already exists, and START NOTHING.
   *
   * ─── WHY THIS FLAG HAD TO BE ADDED ─────────────────────────────────────
   *
   *   FOUND 2026-11-01 by a security review. The attempt layer gave the
   *   video road a short-circuit: a claim of `in-flight` or
   *   `already-succeeded` answered by calling this function and returning
   *   `reused: true` — SKIPPING the balance check and the reservation
   *   entirely, on the assumption that this function only ever hands work
   *   back. It does not: when the lookup finds nothing it dispatches a brand
   *   new production, and the escaping bug above made the lookup miss for any
   *   key containing a quote or a backslash.
   *
   *   The result was a repeatable, unmetered paid video: no hold, no attempt
   *   binding, no ledger entry — and an answer that said `reused: true`.
   *
   *   The escaping is fixed, and this flag removes the assumption rather
   *   than relying on it. A caller that means «give me the one that exists»
   *   now gets `null` when there is none, and must say so to the Creator.
   */
  readonly reuseOnly?: boolean;
}

/**
 * Two shapes, so the type never lies to a caller.
 *
 * With  the answer may be  — nothing existed and nothing was
 * started. Without it, a production is always returned, because this function
 * dispatches one when the lookup finds none.
 */
export async function acceptVideoProduction(
  params: AcceptVideoProductionParams & { readonly reuseOnly: true },
): Promise<AcceptedOperation | null>;
export async function acceptVideoProduction(
  params: AcceptVideoProductionParams & { readonly reuseOnly?: false | undefined },
): Promise<AcceptedOperation>;
export async function acceptVideoProduction(
  params: AcceptVideoProductionParams,
): Promise<AcceptedOperation | null> {
  const existing = findOperationByIntentKey(params.creatorId, params.intentKey);
  if (existing) {
    const observed = await observeOperation(existing, params.creatorId);
    // The same intent, asked twice: answer with the production that exists.
    // Never a second provider call, never a second charge.
    return { operationId: existing, state: observed?.state ?? OperationState.PENDING_AUTHORIZATION, reused: true };
  }

  // Nothing exists, and the caller asked for nothing new. Never a provider
  // call from a road that has already skipped its own money.
  if (params.reuseOnly) return null;

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
  void runProduction(
    operationId,
    { ...params.request, operationId },
    params.creatorId,
    params.attemptKey ?? params.money?.attemptKey,
    params.money,
  )
    .catch(() => { /* recorded below */ });

  return { operationId, state: OperationState.DISPATCHED, reused: false };
}

async function runProduction(
  operationId: string,
  request: VideoGenerationRequest,
  creatorId: string,
  attemptKey: string | undefined,
  money?: ProductionMoney,
): Promise<void> {
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
    closeMoney(creatorId, attemptKey, money, 'failed', 'production-threw');
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
    // The asset exists and is the Creator's. NOW the units are spent.
    closeMoney(creatorId, attemptKey, money, 'succeeded', result.asset.assetId);
    return;
  }

  console.log('[QiyamahOperation]', JSON.stringify({ operationId, stage: 'failed', reason: result.reason, detail: String(result.message).slice(0, 240) }));
  writeStored(operationId, { failureReason: classifyFailure(result.reason, result.message) });
  try { await manager.updateState(operationId, OperationState.FAILED, { resolvedAt: Date.now() }); } catch { /* sealed */ }
  closeMoney(creatorId, attemptKey, money, 'failed', String(result.reason));
}

/**
 * Settle or release this production's hold, and record which it was.
 *
 * It never throws: a ledger that stumbles here must not take down the half
 * of the Empire that has already deposited the Creator's video. A stumble
 * leaves the attempt `owed`, which is the resolver's queue.
 */
function closeMoney(
  creatorId: string,
  attemptKey: string | undefined,
  money: ProductionMoney | undefined,
  outcome: 'succeeded' | 'failed',
  detail: string,
): void {
  const db = getDb();

  // ── AN ENTITLED PRODUCTION HAS NO HOLD, AND STILL HAS AN OUTCOME ─────────
  //
  //   CORRECTED 2026-11-01: this returned early when nothing was held, so
  //   every video today — all of them, since video is unpriced and entitled
  //   subscribers reserve nothing — and every Founder video left an attempt
  //   row `in-flight` that nothing would ever close. No money was locked,
  //   because none was held; but the record said «running» about a production
  //   that had finished hours before, and a record that lies about the easy
  //   case is not trusted about the hard one.
  if (!money) {
    if (attemptKey) {
      if (outcome === 'succeeded') completeAttempt(db, attemptKey, { assetId: detail });
      else failAttempt(db, attemptKey, detail);
    }
    return;
  }
  if (outcome === 'succeeded') {
    settleReservation({
      db, creatorId, attemptKey: money.attemptKey,
      reservationId: money.reservationId, units: money.units,
      metadata: { assetId: detail },
    });
    completeAttempt(db, money.attemptKey, { assetId: detail });
    return;
  }
  releaseReservation({
    db, creatorId, attemptKey: money.attemptKey,
    reservationId: money.reservationId, reason: `video_${detail}`,
  });
  failAttempt(db, money.attemptKey, detail);
}
