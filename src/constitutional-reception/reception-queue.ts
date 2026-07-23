/**
 * AZMA OS — THE CONSTITUTIONAL RECEPTION
 * The Constitutional Reception Queue
 * Construction Campaign
 *
 * A read-only subscriber to the Nervous System's Bus — a sixth,
 * joining the Heart, the Sovereign Core, Consciousness, Memory, and
 * Evolution. On every signal, it calls ONLY
 * composeExpressionForOrgan() (the Constitutional Expression Layer's own
 * unmodified function) — never Al-Wateen, the Sovereign Core,
 * Consciousness, Memory, or Evolution directly — and, if a real
 * expression was composed, appends it to this append-only queue. This is
 * the concrete mechanism behind "no constitutional organ communicates
 * directly with a recipient" (Certification Requirement 2): the ONLY
 * path into this queue is through the Expression Layer.
 *
 * Deliberately NOT auto-started anywhere in this Construction Campaign —
 * the same discipline already applied to every dormant mechanism before
 * its own, later, separately-authorized activation.
 */

import { observeAll } from '../sovereign-nervous-system';
import type { ConstitutionalSignal } from '../sovereign-nervous-system';
import { composeExpressionForOrgan } from '../constitutional-expression';
import { organDeservesAttention } from './attention-layer';
import type { ReceivedExpression } from './types';

let queue: ReceivedExpression[] = [];
let unsubscribe: (() => void) | null = null;
let receiving = false;
let receptionSequence = 0;

function onSignalToReceive(signal: ConstitutionalSignal): void {
  const expression = composeExpressionForOrgan(signal.origin);
  if (!expression) return;

  receptionSequence += 1;
  queue.push({
    receptionId: `reception-${signal.origin}-${receptionSequence}`,
    expression,
    receivedAt: new Date().toISOString(),
    deservesAttention: organDeservesAttention(expression),
  });
}

/** Begins live reception. Idempotent — calling while already receiving does nothing, preventing a duplicate subscription. */
export function beginConstitutionalReception(): void {
  if (receiving) return;
  unsubscribe = observeAll(onSignalToReceive);
  receiving = true;
}

export function endConstitutionalReception(): void {
  if (unsubscribe !== null) unsubscribe();
  unsubscribe = null;
  receiving = false;
}

export function isReceiving(): boolean {
  return receiving;
}

/** The complete Reception Queue, oldest first — read-only. */
export function getReceptionQueue(): readonly ReceivedExpression[] {
  return [...queue];
}

export function getReceptionQueueForOrgan(organId: string): readonly ReceivedExpression[] {
  return queue.filter((entry) => entry.expression.organId === organId);
}

/** Test/reset utility — clears the queue without touching the Nervous System or the Expression Layer themselves. */
export function resetReceptionQueue(): void {
  queue = [];
  receptionSequence = 0;
}
