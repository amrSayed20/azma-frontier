/**
 * AZMA OS — a storyboard production outlives the request that asked for it.
 *
 * ─── THE INCIDENT THIS ENCODES ───────────────────────────────────────────────
 *
 *   MEASURED 2026-09-25, the first real storyboard production: five scenes
 *   written in الحُجّة الدامغة crossed to رأس الأمر, the workshop accepted them,
 *   and at 187 seconds the browser's connection died. The Creator was told
 *   «تعذّر الوصول إلى ورشة الإنتاج» — and the server had logged no failure,
 *   because there had not been one. The production was still running. Then the
 *   request was gone, and with it the `await` that would have deposited the
 *   result: the workshop finished into nothing.
 *
 *   This is the same defect the Qiyamah video path carried and the same cure.
 *   A production that takes minutes cannot ride a socket that lives for
 *   seconds. POST accepts and answers at once; the work runs on its own; the
 *   ledger is what the Chamber reads afterwards.
 *
 * ─── WHY THE EMPIRE'S OWN LEDGER, NOT A NEW ONE ──────────────────────────────
 *
 *   `operation_ledger` already records every long production the Empire runs,
 *   with the states this needs. A second table would be a second truth about
 *   the same thing. This writes into that one, scoped by capability_target so
 *   a storyboard operation can never be mistaken for a Qiyamah video.
 */

import { randomUUID } from 'crypto';
import { getDb } from '../persistent-storage';
import { OperationLedgerManager } from '../orchestrator/fleet-materialization/ledger/operation-ledger-manager';
import { OperationState } from '../orchestrator/fleet-materialization/ledger/operation-ledger-types';
import { CapabilityTarget } from '../core/sovereign-orchestrator/qiyamah-intent-types';
import type { MotionIntent } from '../core/sovereign-orchestrator/qiyamah-intent-types';

/** What went wrong, classified — never the workshop's own words. */
export type StoryboardFailure =
  | 'WORKSHOP_UNREACHABLE'
  | 'REFUSED_BY_WORKSHOP'
  | 'NO_OUTPUT'
  /**
   * The film was made and then could not be carried. MEASURED 2026-09-25: an
   * 82MB film was refused by a 50MB buffer ceiling, and because no
   * classification fitted, the Creator was told the production had failed —
   * of a production that had succeeded. A success we could not carry is not
   * a failure to produce, and must never be spoken as one.
   */
  | 'TOO_LARGE_TO_CARRY'
  | 'STORAGE_FAILED'
  | 'INTERNAL';

export interface AcceptedStoryboard {
  readonly operationId: string;
  readonly state: OperationState;
  readonly reused: boolean;
}

export interface ObservedStoryboard {
  readonly operationId: string;
  readonly state: OperationState;
  readonly isTerminal: boolean;
  readonly producing: boolean;
  readonly succeeded: boolean;
  readonly assetId?: string;
  readonly assetUrl?: string;
  readonly failureReason?: StoryboardFailure;
}

function ledger(): OperationLedgerManager {
  return new OperationLedgerManager(getDb());
}

export function isTerminal(state: OperationState): boolean {
  return state === OperationState.DEPOSITED
    || state === OperationState.FAILED
    || String(state).startsWith('REJECTED');
}

/**
 * Classify what the workshop did, so the Creator is told something true and
 * the workshop is never named.
 */
export function classifyStoryboardFailure(message: string): StoryboardFailure {
  const text = message.toLowerCase();
  // Asked before the generic HTTP/refusal patterns below, which would other-
  // wise swallow it: this message is about the size of a finished film.
  if (/above the \d+-byte ceiling|too large/.test(text)) return 'TOO_LARGE_TO_CARRY';
  if (/unreachable|econnrefused|fetch failed|network/.test(text)) return 'WORKSHOP_UNREACHABLE';
  if (/failed to|task .* failed|refused|http 4|http 5/.test(text)) return 'REFUSED_BY_WORKSHOP';
  if (/no output|empty|not a video/.test(text)) return 'NO_OUTPUT';
  if (/deposit|storage|write/.test(text)) return 'STORAGE_FAILED';
  return 'INTERNAL';
}

/** One storyboard, one production: the same board asked twice is not two. */
export function findOperationForStoryboard(creatorId: string, storyboardId: string): string | null {
  const row = getDb()
    .prepare(
      `SELECT operation_id FROM operation_ledger
        WHERE subscriber_tenant_id = ? AND capability_target = ?
          AND source_intent_json LIKE ?
        ORDER BY created_at DESC LIMIT 1`,
    )
    .get(creatorId, CapabilityTarget.DIRECTORIAL, `%"storyboardId":"${storyboardId}"%`) as
      | { operation_id?: string }
      | undefined;
  return typeof row?.operation_id === 'string' ? row.operation_id : null;
}

export async function observeStoryboardOperation(
  operationId: string,
  creatorId: string,
): Promise<ObservedStoryboard | null> {
  const row = getDb()
    .prepare(
      `SELECT operation_id, subscriber_tenant_id, current_state, source_intent_json
         FROM operation_ledger WHERE operation_id = ? AND capability_target = ?`,
    )
    .get(operationId, CapabilityTarget.DIRECTORIAL) as
      | { operation_id: string; subscriber_tenant_id: string; current_state: string; source_intent_json: string }
      | undefined;

  // Not yours and not found are the same answer: an id cannot be probed.
  if (!row || row.subscriber_tenant_id !== creatorId) return null;

  let carried: { assetId?: string; assetUrl?: string; failureReason?: StoryboardFailure } = {};
  try {
    const intent = JSON.parse(row.source_intent_json) as typeof carried;
    carried = {
      assetId: intent.assetId,
      assetUrl: intent.assetUrl,
      failureReason: intent.failureReason,
    };
  } catch { /* an unreadable intent still has a state, which is what is asked for */ }

  const state = row.current_state as OperationState;
  const terminal = isTerminal(state);
  return {
    operationId: row.operation_id,
    state,
    isTerminal: terminal,
    producing: !terminal,
    succeeded: state === OperationState.DEPOSITED,
    ...carried,
  };
}

/**
 * Accept the production and answer at once.
 *
 * `run` is the work itself — passed in so this module never imports the
 * workshop and the workshop never learns about the ledger. It resolves with
 * the deposited asset, or throws, and either way the ledger is what records it.
 */
export async function acceptStoryboardProduction(params: {
  readonly creatorId: string;
  readonly storyboardId: string;
  readonly sceneCount: number;
  readonly run: () => Promise<{ assetId: string; assetUrl: string }>;
}): Promise<AcceptedStoryboard> {
  const existing = findOperationForStoryboard(params.creatorId, params.storyboardId);
  if (existing) {
    const observed = await observeStoryboardOperation(existing, params.creatorId);
    // One board, one film. Producing covers the obvious case — a second press
    // while the first run is still going. DEPOSITED covers the expensive one.
    //
    //   MEASURED 2026-09-25: a production commissions pictures from القيامة,
    //   and the provider charges five credits for each. Until now a board that
    //   had already produced a film would happily produce another, paying again
    //   for the same pictures and handing back a second copy of the same work.
    //   The Creator asked for a film of these scenes. They have one.
    if (observed && (!observed.isTerminal || observed.succeeded)) {
      return { operationId: existing, state: observed.state, reused: true };
    }
  }

  const operationId = randomUUID();
  const manager = ledger();
  const intent = {
    operationId,
    subscriberTenantId: params.creatorId,
    capabilityTarget: CapabilityTarget.DIRECTORIAL,
    contextReferences: [],
    durationVectorsSeconds: params.sceneCount,
    physicsScales: 'PROVIDER_DEFINED',
    kineticMarkers: [],
    storyboardId: params.storyboardId,
  } as unknown as MotionIntent;

  await manager.createEntry(intent);
  await manager.updateState(operationId, OperationState.AUTHORIZED);
  await manager.updateState(operationId, OperationState.DISPATCHED);

  // Deliberately not awaited: the request is about to answer, and the work
  // must not be tied to whether anyone is still listening.
  void runProduction(operationId, params).catch(() => { /* recorded inside */ });

  return { operationId, state: OperationState.DISPATCHED, reused: false };
}

async function runProduction(
  operationId: string,
  params: {
    readonly creatorId: string;
    readonly storyboardId: string;
    readonly sceneCount: number;
    readonly run: () => Promise<{ assetId: string; assetUrl: string }>;
  },
): Promise<void> {
  const manager = ledger();
  try {
    await manager.updateState(operationId, OperationState.MATERIALIZING);
    const asset = await params.run();
    await carry(operationId, { assetId: asset.assetId, assetUrl: asset.assetUrl });
    await manager.updateState(operationId, OperationState.DEPOSITED);
  } catch (err) {
    const failure = classifyStoryboardFailure(err instanceof Error ? err.message : String(err));
    // The workshop's own words go where an engineer reads them, never to a Creator.
    console.error('[RasAmr] storyboard production failed:', JSON.stringify({
      operationId, storyboardId: params.storyboardId, failure,
    }), err);
    await carry(operationId, { failureReason: failure }).catch(() => {});
    await manager.updateState(operationId, OperationState.FAILED).catch(() => {});
  }
}

/** Keep the outcome beside the intent that asked for it. */
async function carry(operationId: string, fields: Record<string, unknown>): Promise<void> {
  const db = getDb();
  const row = db
    .prepare('SELECT source_intent_json FROM operation_ledger WHERE operation_id = ?')
    .get(operationId) as { source_intent_json?: string } | undefined;
  let intent: Record<string, unknown> = {};
  try { intent = JSON.parse(row?.source_intent_json ?? '{}') as Record<string, unknown>; } catch { intent = {}; }
  db.prepare('UPDATE operation_ledger SET source_intent_json = ? WHERE operation_id = ?')
    .run(JSON.stringify({ ...intent, ...fields }), operationId);
}
