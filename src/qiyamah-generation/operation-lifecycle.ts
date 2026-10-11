/**
 * AZMA OS — حجرة القيامة · LAYER C: ONE LIFECYCLE FOR THE SIX ACTS
 *
 * ─── WHAT WAS PARTIAL, AND WHY IT MATTERED ──────────────────────────────────
 *
 *   The acceptance report classified Layer C as PARTIAL, and honestly: the
 *   generation path ran a proven six-state journey while three acts ran inside
 *   their own panels with their own vocabularies —
 *
 *       stage        idea · constructing · review · generating · result · error
 *       editState    ready · running · failed
 *       animateState ready · running · failed
 *       upscaleState idle  · running · ready · failed
 *
 *   Four vocabularies for one idea. `ready` meant «not started» in two of them
 *   and «finished» in the third, so the same word described opposite facts on
 *   one screen. And none of the three could express the state that matters
 *   most in this Empire: bytes exist and NOBODY OWNS THEM YET.
 *
 * ─── WHAT THIS IS, AND WHAT IT DELIBERATELY IS NOT ──────────────────────────
 *
 *   It is ONE creator-facing lifecycle and ONE result contract, with a pure
 *   mapping from each existing per-operation state into it.
 *
 *   It is NOT a replacement for those states, and it does not touch a single
 *   handler, route, provider call or validation. The engines that are proven in
 *   production keep running exactly as they are; their isolated inputs and
 *   failures stay isolated. What is unified is what a Creator is TOLD — which
 *   is where the inconsistency actually reached them.
 *
 *   The directive's own words: «Reuse existing engines and components where
 *   appropriate. Do not rebuild them unnecessarily.»
 *
 * ─── THE ONE INVARIANT IT ENFORCES ──────────────────────────────────────────
 *
 *   A provider's answer produces BYTES. Only the Creator's explicit acceptance
 *   produces OWNERSHIP. So `DEPOSITED` can never be reached from a provider
 *   response and `ACCEPTED` can never be reached from anything but an
 *   acceptance — and there is no mapping in this file from a successful
 *   provider reply to `ACCEPTED`. A test proves the absence.
 */

import type { QiyamahOperationId } from './prompt-contract';

/**
 * The lifecycle every act reports, in the Creator's own journey.
 *
 * Exactly the model the construction directive names, with the Empire's own
 * acceptance boundary sitting between `DEPOSITED` and `ACCEPTED`.
 */
export type OperationLifecycle =
  /** Configured and not yet submitted. Nothing has been spent. */
  | 'READY'
  /** Sent. No answer yet, and no claim about whether it arrived. */
  | 'SUBMITTED'
  /** The engine is working. */
  | 'PROCESSING'
  /**
   * An output exists in the Vault and the Creator has NOT accepted it.
   *
   * This is the state three of the six acts could not express, and it is the
   * one that keeps the Empire honest: a provider answering is not a Creator
   * owning.
   */
  | 'DEPOSITED'
  /** The Creator took ownership. The only terminal success. */
  | 'ACCEPTED'
  /** It did not complete. Carries a reason and a balance outcome. */
  | 'FAILED'
  /** The Creator stopped it. */
  | 'CANCELLED'
  /**
   * The submission's outcome is not known — a broken socket, a lost 202.
   *
   * NOT a failure. A production may be running at this moment, and calling it
   * failed would invite a retry that pays twice. The chamber asks instead,
   * through `intentKey`.
   */
  | 'UNKNOWN';

/** What happened to the Creator's Balance. Never guessed — see D-8. */
export type BalanceOutcome =
  /** Units were reserved and have been returned. Established, not assumed. */
  | 'released'
  /** Nothing was ever reserved, so nothing could be taken. */
  | 'none'
  /** A reservation exists and its release did not confirm. Said as unknown. */
  | 'unresolved';

/**
 * The one result contract. Every act reports this shape and no other.
 */
export interface OperationOutcomeContract {
  readonly operation: QiyamahOperationId;
  readonly lifecycle: OperationLifecycle;
  /** The asset produced, once one exists. Null in every other state. */
  readonly assetId: string | null;
  /** Where the Creator's own browser may fetch it. Null until deposited. */
  readonly assetUri: string | null;
  /** Said to the Creator. Always present, always Arabic. */
  readonly messageAr: string;
  /** Present only on FAILED. */
  readonly balanceOutcome: BalanceOutcome | null;
  /** The attempt's own id, so a reported failure can be found in the trail. */
  readonly operationId: string | null;
  /**
   * The key that makes a lost answer recoverable instead of repeatable.
   *
   * Carried for every act that can be submitted, because the rule is not about
   * video: a retry must never create a second paid operation when the first
   * may already have succeeded.
   */
  readonly intentKey: string | null;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1 · WHAT EACH STATE IS CALLED, ONCE
// ─────────────────────────────────────────────────────────────────────────────

const LIFECYCLE_AR: Readonly<Record<OperationLifecycle, string>> = {
  READY: 'مُهيَّأةٌ — لم تُرسَل بعد',
  SUBMITTED: 'أُرسِلت — في انتظار المحرّك',
  PROCESSING: 'قيد الإنتاج… لا تغلق الصفحة',
  DEPOSITED: 'أُنتج وأُودِع مؤقّتاً — ولم يَصِر ملكاً لك حتى تَعتمده',
  ACCEPTED: 'اعتمدتَه — صار أصلاً سياديّاً باسمك',
  FAILED: 'لم يتمّ',
  CANCELLED: 'أوقفتَها — ولم يُنفَق ما لم يُنتَج',
  UNKNOWN: 'انقطع الاتصال بالعمليّة. نتحقّق من حالتها — ولا نُعيدها',
};

export function lifecycleSentenceAr(lifecycle: OperationLifecycle): string {
  return LIFECYCLE_AR[lifecycle];
}

/** Whether the act is in flight — one answer, so six screens cannot disagree. */
export function isInFlight(lifecycle: OperationLifecycle): boolean {
  return lifecycle === 'SUBMITTED' || lifecycle === 'PROCESSING';
}

/** Whether an output exists, accepted or not. */
export function hasOutput(lifecycle: OperationLifecycle): boolean {
  return lifecycle === 'DEPOSITED' || lifecycle === 'ACCEPTED';
}

/**
 * Whether a retry is safe.
 *
 * `UNKNOWN` is excluded deliberately: the production may be running, and a
 * retry there is how a Creator pays twice. The remedy for UNKNOWN is to ASK —
 * which `intentKey` makes possible — never to resubmit.
 */
export function mayRetry(lifecycle: OperationLifecycle): boolean {
  return lifecycle === 'FAILED' || lifecycle === 'CANCELLED';
}

// ─────────────────────────────────────────────────────────────────────────────
// 2 · THE MAPPINGS — EACH EXISTING VOCABULARY INTO THE ONE LIFECYCLE
// ─────────────────────────────────────────────────────────────────────────────

/** The generation journey's own six states, unchanged and still authoritative. */
export type GenerationStage =
  'idea' | 'constructing' | 'review' | 'generating' | 'result' | 'error';

/**
 * The generation path. `result` maps to DEPOSITED, not to ACCEPTED — the
 * Creator has not pressed «اعتمِدْه» yet, and that step is the whole point.
 */
export function lifecycleOfGeneration(
  stage: GenerationStage,
  accepted: boolean,
  connectionLost = false,
): OperationLifecycle {
  if (stage === 'generating') return connectionLost ? 'UNKNOWN' : 'PROCESSING';
  if (stage === 'result') return accepted ? 'ACCEPTED' : 'DEPOSITED';
  if (stage === 'error') return 'FAILED';
  // idea · constructing · review are all «configured, not yet submitted».
  return 'READY';
}

/**
 * `editState` and `animateState`: 'ready' | 'running' | 'failed'.
 *
 * `ready` means NOT STARTED in these two — the opposite of what it means in
 * `upscaleState`. That collision is the reason this mapping exists in one
 * place instead of being re-read at each call site.
 */
export function lifecycleOfMutation(
  state: 'ready' | 'running' | 'failed',
  producedAssetId: string | null,
  accepted: boolean,
): OperationLifecycle {
  if (state === 'running') return 'PROCESSING';
  if (state === 'failed') return 'FAILED';
  if (producedAssetId) return accepted ? 'ACCEPTED' : 'DEPOSITED';
  return 'READY';
}

/** `upscaleState`: 'idle' | 'running' | 'ready' | 'failed' — where 'ready' means DONE. */
export function lifecycleOfUpscale(
  state: 'idle' | 'running' | 'ready' | 'failed',
  producedAssetId: string | null,
  accepted: boolean,
): OperationLifecycle {
  if (state === 'running') return 'PROCESSING';
  if (state === 'failed') return 'FAILED';
  if (state === 'ready' || producedAssetId) return accepted ? 'ACCEPTED' : 'DEPOSITED';
  return 'READY';
}

/**
 * The one entry point a screen calls, whichever act is active.
 *
 * Operation-specific state stays where it is; this reads it and returns the
 * single vocabulary. Nothing is written, no handler is invoked.
 */
export function lifecycleOf(input: {
  readonly operation: QiyamahOperationId;
  readonly generationStage?: GenerationStage;
  readonly mutationState?: 'ready' | 'running' | 'failed';
  readonly upscaleState?: 'idle' | 'running' | 'ready' | 'failed';
  readonly producedAssetId?: string | null;
  readonly accepted?: boolean;
  readonly connectionLost?: boolean;
  readonly cancelled?: boolean;
}): OperationLifecycle {
  if (input.cancelled) return 'CANCELLED';
  switch (input.operation) {
    case 'upscale':
      return lifecycleOfUpscale(
        input.upscaleState ?? 'idle', input.producedAssetId ?? null, input.accepted === true);
    case 'edit':
    case 'animate':
      return lifecycleOfMutation(
        input.mutationState ?? 'ready', input.producedAssetId ?? null, input.accepted === true);
    case 'image':
    case 'infographic':
    case 'video':
      return lifecycleOfGeneration(
        input.generationStage ?? 'idea', input.accepted === true, input.connectionLost === true);
    default:
      return 'READY';
  }
}

/**
 * Assemble the one result contract.
 *
 * Note what it CANNOT do: there is no argument by which a provider's success
 * reply produces `ACCEPTED`. Acceptance arrives only through `accepted`, which
 * only the acceptance route's answer sets.
 */
export function outcomeContract(input: {
  readonly operation: QiyamahOperationId;
  readonly lifecycle: OperationLifecycle;
  readonly assetId?: string | null;
  readonly assetUri?: string | null;
  readonly messageAr?: string | null;
  readonly balanceOutcome?: BalanceOutcome | null;
  readonly operationId?: string | null;
  readonly intentKey?: string | null;
}): OperationOutcomeContract {
  const output = hasOutput(input.lifecycle);
  return {
    operation: input.operation,
    lifecycle: input.lifecycle,
    // An id and a uri exist only where an output exists. Carrying them in any
    // other state is how a screen comes to show a result for a failure.
    assetId: output ? (input.assetId ?? null) : null,
    assetUri: output ? (input.assetUri ?? null) : null,
    messageAr: input.messageAr?.trim() || lifecycleSentenceAr(input.lifecycle),
    balanceOutcome: input.lifecycle === 'FAILED' ? (input.balanceOutcome ?? 'none') : null,
    operationId: input.operationId ?? null,
    intentKey: input.intentKey ?? null,
  };
}

/** What a Creator may do next, named once for all six acts. */
export type NextAction = 'accept' | 'retry' | 'ask' | 'return' | 'reuse';

export function nextActions(lifecycle: OperationLifecycle): readonly NextAction[] {
  switch (lifecycle) {
    case 'DEPOSITED': return ['accept', 'return'];
    case 'ACCEPTED':  return ['reuse', 'return'];
    case 'FAILED':    return ['retry', 'return'];
    case 'CANCELLED': return ['retry', 'return'];
    case 'UNKNOWN':   return ['ask'];           // never 'retry' — see mayRetry
    default:          return [];
  }
}
