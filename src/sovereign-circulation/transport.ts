/**
 * AZMA OS — THE CONSTITUTIONAL CIRCULATION
 * The Constitutional Circulation Transport
 * Construction Phase III
 *
 * The one genuinely new mechanism in this phase: propagating a signal
 * across the browser/server runtime boundary discovered during the
 * Integration Package "The First Constitutional Signals." It never
 * replaces the Nervous System's Perception Bus (emitSignal remains the
 * only place a signal is ever actually recorded) — it only ensures a
 * signal emitted in one JavaScript runtime also reaches the other.
 *
 * DISCLOSED LIMITATION, not solved here: this closes the browser→server
 * gap only. Server-to-server circulation (multiple Node processes, or
 * serverless instances that don't share memory) still has no real
 * transport — that requires a persistent, shared store (a database or
 * equivalent), which does not exist anywhere in this repository
 * (confirmed: package.json has no database driver, no Redis, no queue —
 * the same finding already disclosed to the Chief Architect directly).
 * Building one is out of this phase's scope ("no runtime policy" — adding
 * a new infrastructure dependency is a platform decision, not a
 * Circulation-phase one) and is named explicitly in the Engineering
 * Review as remaining, real Architectural Debt.
 */

import { emitSignal } from '../sovereign-nervous-system';
import type { ConstitutionalSignal } from '../sovereign-nervous-system';
import type { CirculationEnvelope, CirculationResult } from './types';

const CIRCULATION_ENDPOINT = '/api/sovereign/nervous-system/circulate';

/**
 * Server-side ingestion point — called directly by the API route that
 * receives a circulated signal from a browser. Delegates entirely to
 * emitSignal(); performs no interpretation of its own.
 */
export function ingestCirculatedSignal(
  draft: CirculationEnvelope['draft'],
): CirculationResult {
  try {
    const signal: ConstitutionalSignal = emitSignal(draft);
    return { circulated: true, signal, reason: null };
  } catch (error) {
    return {
      circulated: false,
      signal: null,
      reason: error instanceof Error ? error.message : 'Unknown circulation ingestion error',
    };
  }
}

/**
 * Client-side circulation — emits the signal into the browser's own
 * Nervous System instance immediately (so same-tab observers see it with
 * zero delay), then fire-and-forgets a request to the server so the
 * signal also reaches the server-side Signal Log. Never blocks, never
 * throws — matching the Perception Contract's "must never block"
 * principle (src/sovereign-nervous-system/perception-contracts.ts),
 * extended here across the runtime boundary.
 */
export function circulateFromClient(
  draft: CirculationEnvelope['draft'],
): ConstitutionalSignal {
  const localSignal = emitSignal(draft);

  if (typeof window !== 'undefined' && typeof fetch === 'function') {
    void fetch(CIRCULATION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
      keepalive: true,
    }).catch(() => {
      // Circulation never blocks and never surfaces a failure to the
      // caller — a lost cross-runtime hop is a Health-flow concern for a
      // future observer, never a thrown error here.
    });
  }

  return localSignal;
}
