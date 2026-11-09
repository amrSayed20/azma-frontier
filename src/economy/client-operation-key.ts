/**
 * AZMA OS — ONE KEY PER PRESS, AND THE RULES FOR WHEN IT IS REUSED.
 *
 * ─── WHY THIS LIVES IN THE BROWSER AND NOT IN THE SERVER ────────────────────
 *
 *   The server cannot tell a retry from a deliberate repetition. Two requests
 *   carrying the same Creator, the same picture and the same instruction are
 *   either one press the network sent twice, or two presses by someone who
 *   wants two pictures. Guessing «retry» runs a paid provider behind a hold
 *   that is already closed; guessing «new press» charges a retry twice.
 *
 *   Only the side that pressed knows. So the browser mints one key per press
 *   and says, by resending it or not, which of the two this is.
 *
 * ─── THE LIFECYCLE, IN FULL ─────────────────────────────────────────────────
 *
 *   MINTED      when the Creator presses, before the first request leaves.
 *
 *   REUSED      only when THIS submission ended with no verdict — the socket
 *               died, the edge answered with HTML, the fetch threw. The key
 *               stays remembered, and the next press of the same form resends
 *               it, so the server recognises the retry and neither calls the
 *               provider again nor charges again.
 *
 *   FORGOTTEN   the moment a verdict arrives, whether it is a success or a
 *               named refusal. A verdict means the question was answered, so
 *               the next press is a NEW operation with a new key — including
 *               when its content is identical, which this module never reads.
 *
 *   The key is remembered per ROAD, in `sessionStorage`, so one tab's
 *   unanswered animation cannot be mistaken for its unanswered edit, and a
 *   remembered key never outlives the tab.
 *
 *   `sessionStorage` can be absent or throw — a private window, blocked site
 *   data — and every access here is wrapped. When it is unavailable the key
 *   is still minted and still sent: the submission is simply not recoverable
 *   across a press, which is exactly the behaviour the Empire had before this
 *   existed. It degrades to the safe side and never to a silent reuse.
 */

/** The one header name every paid road reads its submission key from. */
export const OPERATION_KEY_HEADER = 'x-azma-operation-key';

/** A road's own namespace for a remembered key. */
export type PaidRoad =
  | 'qiyamah:image'
  | 'qiyamah:animate'
  | 'qiyamah:upscale'
  | 'qiyamah:edit'
  | 'ras-amr:speech'
  | 'ras-amr:voice-clone'
  | 'ras-amr:cloned-speech'
  | 'ras-amr:mp4-export'
  // One scene asking for its own picture. Its OWN road, never shared with the
  // export: two presses on two different acts must not collapse into one key,
  // or the second would be answered as a repeat of the first and never run.
  | 'ras-amr:scene-picture';

const storageKeyFor = (road: PaidRoad): string => `azma.op.${road}`;

function remembered(road: PaidRoad): string | null {
  try {
    const value = sessionStorage.getItem(storageKeyFor(road));
    return typeof value === 'string' && value.length > 0 ? value : null;
  } catch {
    return null;
  }
}

function remember(road: PaidRoad, key: string): void {
  try { sessionStorage.setItem(storageKeyFor(road), key); } catch { /* unavailable */ }
}

/**
 * Forget this road's key, because its question has been answered.
 *
 * Called on a SUCCESS and on a NAMED REFUSAL alike: both are verdicts, and
 * after a verdict the next press must be a new operation.
 */
export function operationAnswered(road: PaidRoad): void {
  try { sessionStorage.removeItem(storageKeyFor(road)); } catch { /* unavailable */ }
}

/**
 * Forget the key IF this answer was a verdict.
 *
 * ─── THE ONE ANSWER THAT IS NOT A VERDICT ───────────────────────────────────
 *
 *   `operation-in-flight` does not say what became of the operation. It says
 *   the first attempt is still running. Forgetting the key on it would make
 *   the Creator's next press a SECOND paid operation standing beside one that
 *   may yet succeed — the precise failure this whole mechanism exists to
 *   prevent, reintroduced at the last step.
 *
 *   Every other answer is a verdict, refusals included: «your balance is
 *   short», «this is not priced», «it already happened» all mean the question
 *   was answered, so the next press is a new operation.
 */
export function operationConcluded(road: PaidRoad, answer: { readonly reason?: unknown }): void {
  if (answer?.reason === 'operation-in-flight') return;
  operationAnswered(road);
}

/**
 * The key for the press that is happening now.
 *
 * It returns the REMEMBERED key when the previous submission on this road
 * ended without a verdict — that is what makes a lost response recoverable
 * rather than repeatable. Otherwise it mints a new one.
 *
 * It reads nothing about the request. Two presses with identical content get
 * two different keys unless the first one genuinely went unanswered.
 */
export function operationKeyForPress(road: PaidRoad): string {
  const unanswered = remembered(road);
  if (unanswered !== null) return unanswered;

  const minted = globalThis.crypto?.randomUUID?.() ?? `op-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  remember(road, minted);
  return minted;
}

/**
 * Headers for a paid POST: the content type and this press's key.
 *
 * A road that does not call this sends no key, and the server then treats
 * every request as its own operation — covered, and charged on its own. That
 * is the safe default and it is what every road did before this module.
 */
export function paidOperationHeaders(road: PaidRoad): Record<string, string> {
  return {
    'Content-Type': 'application/json',
    [OPERATION_KEY_HEADER]: operationKeyForPress(road),
  };
}
