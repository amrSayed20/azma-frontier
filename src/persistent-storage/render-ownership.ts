import type { DatabaseSync } from 'node:sqlite';

/**
 * AZMA OS — Who owns a finished film.
 *
 * ─── WHY THIS FILE EXISTS, AND WHY IT READS TWO LEDGERS ─────────────────────
 *
 *   `/renders/` held 25 finished films on the live server and served every one
 *   of them to anyone who asked — no session, no cookie, byte-for-byte. Closing
 *   that needs one answer first: who is each film's Creator?
 *
 *   The obvious answer was `operation_ledger`, because the encoder names each
 *   file after the operation that produced it. MEASURED AGAINST PRODUCTION:
 *
 *       25 films on disk
 *       13 resolved through operation_ledger
 *       12 resolved through NOTHING
 *
 *   Had the gate been built on that single lookup — which is what reading the
 *   encoder alone would have led to — it would have answered 404 to twelve real
 *   films and called it security. Twelve Creators locked out of their own work,
 *   and the defect indistinguishable from the fix working correctly.
 *
 *   Measuring the twelve found them: every one carried an owner in
 *   `cinematic_ledger.publisher_tenant_id`. The two ledgers record different
 *   moments of the same act — the operation that encoded, and the publication
 *   that asked for it — and a film may be recorded in either.
 *
 *       union coverage : 25 / 25
 *       no owner at all:  0
 *       disagreement    :  0
 *       distinct owners :  7
 *
 *   So there is no legacy-asset problem here and no adoption door to build:
 *   every film already has a provable owner. That is a fact about the data,
 *   established by measurement, and `RENDER_OWNERSHIP_MEASURED_AT` records when.
 *
 * ─── THE RULE ───────────────────────────────────────────────────────────────
 *
 *   A film with no resolvable owner is NOT served. Not to its likely owner, not
 *   to a Founder, not to anyone. An unknown owner is an unanswered question,
 *   and the gate refuses questions it cannot answer rather than guessing in the
 *   Creator's favour — because guessing in the Creator's favour, when the guess
 *   is wrong, hands one Creator another's film.
 */

/** When the coverage figures in this file's header were taken from production. */
export const RENDER_OWNERSHIP_MEASURED_AT = '2026-09-20';

/** Which ledger answered. Kept so a denial can be diagnosed without guessing. */
export type RenderOwnerSource = 'operation-ledger' | 'cinematic-ledger';

export interface RenderOwnership {
  readonly operationId: string;
  readonly ownerId: string;
  readonly source: RenderOwnerSource;
}

/**
 * The operation identity encoded in a render's filename.
 *
 * The encoder writes `<operationId>.mp4` (and, while working, `<operationId>.srt`),
 * so the stem IS the identity. Returns null for anything that could escape the
 * directory or that carries no stem — checked here as well as at the edge,
 * because a name that reaches a database query should never have been trusted
 * by the layer above.
 */
export function renderOperationIdFromFilename(filename: string): string | null {
  if (typeof filename !== 'string') return null;
  if (filename.length === 0 || filename.length > 200) return null;
  if (filename.includes('/') || filename.includes('\\')) return null;
  if (!/^[A-Za-z0-9._-]+$/.test(filename)) return null;

  const dot = filename.lastIndexOf('.');
  const stem = dot === -1 ? filename : filename.slice(0, dot);
  // `.`, `..`, and `.mp4` all reduce to an empty or dot-only stem.
  if (stem.length === 0 || /^\.+$/.test(stem)) return null;
  return stem;
}

/**
 * Resolve a render's owner, or null.
 *
 * `operation_ledger` is asked first because it is the record of the act that
 * actually produced the bytes; `cinematic_ledger` is the publication that
 * requested them. Where both exist they agreed on every one of the 25 films
 * measured, so the order is a preference and not a tiebreak.
 */
export function resolveRenderOwner(db: DatabaseSync, operationId: string): RenderOwnership | null {
  const id = renderOperationIdFromFilename(operationId) === operationId ? operationId : null;
  if (!id) return null;

  const operationRow = db
    .prepare('SELECT subscriber_tenant_id FROM operation_ledger WHERE operation_id = ?')
    .get(id) as { subscriber_tenant_id?: unknown } | undefined;

  const fromOperation = typeof operationRow?.subscriber_tenant_id === 'string'
    ? operationRow.subscriber_tenant_id
    : null;
  if (fromOperation) {
    return { operationId: id, ownerId: fromOperation, source: 'operation-ledger' };
  }

  // A publication may reference the same operation more than once; every row
  // for one operation named the same publisher in the measured data, so the
  // first is taken rather than a set being assembled and compared.
  const cinematicRow = db
    .prepare('SELECT publisher_tenant_id FROM cinematic_ledger WHERE operation_id = ? LIMIT 1')
    .get(id) as { publisher_tenant_id?: unknown } | undefined;

  const fromCinematic = typeof cinematicRow?.publisher_tenant_id === 'string'
    ? cinematicRow.publisher_tenant_id
    : null;
  if (fromCinematic) {
    return { operationId: id, ownerId: fromCinematic, source: 'cinematic-ledger' };
  }

  return null;
}
