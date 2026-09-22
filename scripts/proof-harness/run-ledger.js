/**
 * AZMA OS — PROOF HARNESS
 * The run ledger: the only thing a production proof may ever clean up.
 *
 * ─── THE INCIDENT THIS EXISTS FOR ────────────────────────────────────────────
 *
 *   2026-09-22. A proof script pressed "generate", no generation was recorded
 *   (27 → 27), and its cleanup took `gens[0]` — the Founder's most recent REAL
 *   generation, made 2026-08-27 — and called the real destructive route. The
 *   tombstone is tomb_adaa7026…; the image bytes are gone.
 *
 *   The defect was a selector: "the newest thing is the thing I made". That
 *   selector is now impossible to express through this module, and a test in
 *   scripts/proof-harness/__tests__ refuses it in every proof script.
 *
 * ─── THE RULE ────────────────────────────────────────────────────────────────
 *
 *   A resource is eligible for cleanup only if ALL of these hold:
 *     1. its exact id was recorded in this run's ledger, at creation time;
 *     2. the live record says it was created after this run began;
 *     3. the live record says it belongs to this run's owner;
 *     4. the live record's type matches the type recorded;
 *     5. exactly one live record carries that id.
 *   Anything else is refused, and the refusal is returned, never silently
 *   skipped. A run that recorded nothing cleans up nothing.
 *
 *   No function here accepts a list and picks from it. There is no "latest".
 *
 *   CommonJS on purpose: the proof scripts are ESM (.mjs) and import it by
 *   named import, and the Jest suite that proves the rule requires it.
 */

/**
 * @typedef {{ runId: string, resourceType: string, resourceId: string, createdAt: number, ownerId: string, operationId: string }} LedgerEntry
 * @typedef {{ resourceType: string, resourceId: string, createdAt: number, ownerId: string }} LiveRecord
 */

function createRunLedger({ runId, ownerId, startedAt = Date.now() }) {
  if (typeof runId !== 'string' || runId.length === 0) throw new Error('run ledger needs a runId');
  if (typeof ownerId !== 'string' || ownerId.length === 0) throw new Error('run ledger needs an ownerId');
  /** @type {LedgerEntry[]} */
  const entries = [];

  return Object.freeze({
    runId,
    ownerId,
    startedAt,

    /**
     * Record a resource THIS RUN created, at the moment its exact id is known.
     * Refuses anything without an exact id — an id is never inferred later.
     */
    record({ resourceType, resourceId, operationId, createdAt = Date.now() }) {
      if (typeof resourceType !== 'string' || !resourceType) throw new Error('record: resourceType required');
      if (typeof resourceId !== 'string' || !resourceId) throw new Error('record: exact resourceId required — never inferred');
      if (typeof operationId !== 'string' || !operationId) throw new Error('record: operationId required');
      if (createdAt < startedAt) throw new Error(`record: ${resourceType} ${resourceId} predates this run — refused`);
      entries.push(Object.freeze({ runId, resourceType, resourceId, createdAt, ownerId, operationId }));
    },

    /** A copy of what was recorded. */
    entries: () => entries.slice(),

    /**
     * Decide, for each recorded entry, whether it may be deleted — against
     * what the live system says about it now. Returns a plan; deletes nothing.
     *
     * @param {LiveRecord[]} live  every live record of the relevant types,
     *                             as the system reports them at cleanup time
     */
    cleanupPlan(live) {
      const byId = new Map();
      for (const r of live) byId.set(`${r.resourceType}:${r.resourceId}`, [...(byId.get(`${r.resourceType}:${r.resourceId}`) ?? []), r]);

      const deletable = [];
      const refused = [];
      for (const e of entries) {
        const matches = byId.get(`${e.resourceType}:${e.resourceId}`) ?? [];
        if (matches.length === 0) { refused.push({ entry: e, reason: 'not-live' }); continue; }
        if (matches.length > 1) { refused.push({ entry: e, reason: 'ambiguous-id' }); continue; }
        const r = matches[0];
        if (typeof r.createdAt !== 'number' || r.createdAt < startedAt) { refused.push({ entry: e, reason: 'predates-run' }); continue; }
        if (r.ownerId !== ownerId) { refused.push({ entry: e, reason: 'foreign-owner' }); continue; }
        if (r.resourceType !== e.resourceType) { refused.push({ entry: e, reason: 'type-mismatch' }); continue; }
        deletable.push(e);
      }
      return Object.freeze({ deletable, refused });
    },
  });
}

/**
 * Execute a cleanup plan. `deleteOne` is called only with entries the plan
 * allowed; every outcome is reported. The plan is the only input — there is
 * no way to hand this function an id the ledger did not record.
 */
async function executeCleanup(plan, deleteOne) {
  const results = [];
  for (const entry of plan.deletable) {
    try {
      const outcome = await deleteOne(entry);
      results.push({ entry, outcome });
    } catch (err) {
      results.push({ entry, outcome: { error: String(err && err.message ? err.message : err) } });
    }
  }
  return { deleted: results, refused: plan.refused };
}

module.exports = { createRunLedger, executeCleanup };
