/**
 * AZMA OS — THE CONSTITUTIONAL NERVOUS SYSTEM
 * The Constitutional Perception Bus & Signal Pathways
 * Construction Phase II
 *
 * The one genuinely executable mechanism this phase introduces: a
 * publish/observe transport for Constitutional Signals. It is
 * deliberately mechanical:
 *
 *   emitSignal()   — accepts an already-fully-formed signal, assigns it
 *                    a traceable id and timestamp, records it into the
 *                    State Registry, appends it to the append-only
 *                    Signal Log, and forwards it VERBATIM to every
 *                    registered listener.
 *   observeOrgan() / observeSignalType() / observeAll() — register a
 *                    listener. The Bus does not know or care what a
 *                    listener does with a signal afterward — that
 *                    belongs to whichever future organ (Sovereign Core,
 *                    Al-Wateen) actually interprets it.
 *
 * No branch of this file inspects `signal.content`, decides anything
 * from a signal's meaning, schedules work, or orchestrates a response.
 * It transports. Nothing more (Phase II, Article I; this Package's Out
 * of Scope list).
 *
 * PERSISTENCE DISCLOSURE: the Signal Log and listener registry below are
 * plain in-memory arrays/Maps, scoped to one running process. Exactly
 * like SovereignVaultManager (src/vault/), this does not survive a
 * process restart and is not shared across serverless instances. This
 * is disclosed here, not silently assumed away — see the Engineering
 * Review's Risks section.
 */

import { assertLegitimateSignalOrigin } from './signal-origin-registry';
import { recordOrganState } from './state-registry';
import type { ConstitutionalSignal, ConstitutionalSignalType, SignalListener } from './types';

const signalLog: ConstitutionalSignal[] = [];

const organListeners = new Map<string, Set<SignalListener>>();
const signalTypeListeners = new Map<ConstitutionalSignalType, Set<SignalListener>>();
const universalListeners = new Set<SignalListener>();

function generateSignalId(): string {
  if (typeof globalThis.crypto?.randomUUID === 'function') {
    return globalThis.crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID — still unique,
  // still traceable, still not a business decision of any kind.
  return `signal-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

/**
 * Emits a constitutional signal. The caller supplies everything except
 * signalId and timestamp, which the Bus assigns to guarantee
 * traceability regardless of the caller. Throws if the origin does not
 * name a real, Skeleton-registered organ (Phase II, Article VIII).
 */
export function emitSignal(
  draft: Omit<ConstitutionalSignal, 'signalId' | 'timestamp'>,
): ConstitutionalSignal {
  assertLegitimateSignalOrigin(draft.origin);

  const signal: ConstitutionalSignal = {
    ...draft,
    signalId: generateSignalId(),
    timestamp: new Date().toISOString(),
  };

  signalLog.push(signal);
  recordOrganState(signal);

  for (const listener of organListeners.get(signal.origin) ?? []) listener(signal);
  for (const listener of signalTypeListeners.get(signal.signalType) ?? []) listener(signal);
  for (const listener of universalListeners) listener(signal);

  return signal;
}

/** Observes every signal originating from one organ. Returns an unsubscribe function. */
export function observeOrgan(organId: string, listener: SignalListener): () => void {
  const set = organListeners.get(organId) ?? new Set<SignalListener>();
  set.add(listener);
  organListeners.set(organId, set);
  return () => set.delete(listener);
}

/** Observes every signal of one Constitutional Signal Type, across all organs. */
export function observeSignalType(signalType: ConstitutionalSignalType, listener: SignalListener): () => void {
  const set = signalTypeListeners.get(signalType) ?? new Set<SignalListener>();
  set.add(listener);
  signalTypeListeners.set(signalType, set);
  return () => set.delete(listener);
}

/** Observes every signal on the Bus, regardless of origin or type. */
export function observeAll(listener: SignalListener): () => void {
  universalListeners.add(listener);
  return () => universalListeners.delete(listener);
}

/** The complete, append-only Signal Log — the Bus's own traceability record. Read-only from the caller's perspective (a copy is returned). */
export function getSignalLog(): readonly ConstitutionalSignal[] {
  return [...signalLog];
}
