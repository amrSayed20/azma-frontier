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
 * Whether this browser runtime has been told it may not circulate.
 *
 * ─── WHAT WAS MEASURED ──────────────────────────────────────────────────────
 *
 *   Walking the Creator journey with Playwright against production, every
 *   visitor who opened /signup without a session got this in their console:
 *
 *       401 https://azmaos.com/api/sovereign/nervous-system/circulate
 *       401 https://azmaos.com/api/sovereign/nervous-system/circulate
 *
 *   The 401 is correct and stays. The route was given a session requirement
 *   when an unauthenticated denial of service was found in it — anyone could
 *   push entries into the live process's Perception Bus until it exhausted
 *   memory. That closure was right.
 *
 *   The defect is on this side. The route's own comment claimed "every browser
 *   that legitimately calls circulateFromClient() is a signed-in Creator", and
 *   that was simply untrue: DirectorStage is mounted in the root layout, so it
 *   circulates for anonymous visitors on the very first page they see. The
 *   Empire was asking a door it had itself locked, twice, in front of every
 *   newcomer.
 *
 *   A latch rather than a session check, deliberately: the session cookie is
 *   httpOnly and unreadable here by design, and adding a "am I signed in?"
 *   request would put back the very chatter this removes. The server's own
 *   refusal is the authority — asked once, believed thereafter.
 *
 *   LOCAL emission is untouched. Same-tab observers still see every signal
 *   with zero delay; only the cross-runtime hop stops, and a signal that
 *   cannot legitimately reach the server was never going to reach it.
 */
let crossRuntimeRefused = false;

/**
 * Whether a circulation request is in the air with its answer still unknown.
 *
 * ─── WHY A LATCH ALONE WAS NOT ENOUGH ───────────────────────────────────────
 *
 *   The first repair set `crossRuntimeRefused` inside the response handler,
 *   and MEASURED IN THE BROWSER AFTER DEPLOYING IT, the console still showed:
 *
 *       401 .../circulate
 *       401 .../circulate
 *
 *   Both requests leave before either answer arrives, so both pass a flag that
 *   cannot possibly be set yet. The unit test passed only because it awaited
 *   between the two calls — production does not await, and the test was once
 *   again describing my assumption instead of the deployment.
 *
 *   So the question this runtime must answer is not "was I refused?" but "do I
 *   already know?". Until the first answer lands, nobody else flies.
 */
let answerPending = false;

/**
 * Whether the server has already told this runtime where it stands.
 *
 * ─── THE REGRESSION THIS EXISTS TO UNDO ─────────────────────────────────────
 *
 *   `answerPending` alone gated EVERY concurrent request, not just the first
 *   unknown one. Proven by test: a Creator the server accepts, emitting four
 *   signals, got two of them across. The other two were dropped — not queued,
 *   dropped — which is a worse fault than the console noise being repaired,
 *   and it would have been invisible in production because a missing signal
 *   looks exactly like a chamber that had nothing to say.
 *
 *   The gate belongs only to the UNKNOWN. Once the answer has landed, this
 *   runtime either circulates everything or nothing, and never something.
 */
let answerKnown = false;

/**
 * Test seam. Module state persists across a browser's page life by design,
 * which is exactly what makes it useless to a test that runs twice.
 */
export function resetCirculationRefusalForTests(): void {
  crossRuntimeRefused = false;
  answerPending = false;
  answerKnown = false;
}

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

  if (
    typeof window !== 'undefined'
    && typeof fetch === 'function'
    && !crossRuntimeRefused
    // Nobody flies while the FIRST answer is still in the air — that is what
    // turns two signals in one tick into one request instead of two 401s.
    // Once the answer is known and was acceptance, this stops applying and
    // every signal flies, because holding a Creator's signals back would lose
    // them rather than delay them.
    && (answerKnown || !answerPending)
  ) {
    answerPending = true;
    void fetch(CIRCULATION_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(draft),
      keepalive: true,
    }).then((response) => {
      // The server says this runtime may not circulate. Believed once and
      // not argued with — every later signal in this page's life emits
      // locally and stops there.
      if (response.status === 401 || response.status === 403) {
        crossRuntimeRefused = true;
      }
      // Refused or accepted, this runtime now knows. Only an unanswered
      // question justifies holding anything back.
      answerKnown = true;
    }).catch(() => {
      // Circulation never blocks and never surfaces a failure to the
      // caller — a lost cross-runtime hop is a Health-flow concern for a
      // future observer, never a thrown error here.
    }).finally(() => {
      // Whatever the answer was, it is no longer unknown.
      answerPending = false;
    });
  }

  return localSignal;
}
