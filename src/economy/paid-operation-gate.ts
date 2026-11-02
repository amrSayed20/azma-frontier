import type { DatabaseSync } from 'node:sqlite';
import { attachReservation, markSettlement } from './paid-operation-attempts';
import { sovereignPriceFor } from './pricing/sovereign-price-authority';
import { CreatorCreditRepository } from './credit-ledger/credit-ledger-repository';
import { InsufficientBalanceError } from './credit-ledger/credit-ledger-types';
import { AzmaUnitCostEngine } from './cost-engine/azma-cost-engine';
import { CostUnavailableError, GatewayNotFoundError } from './cost-engine/cost-engine-types';
import type { CapabilityTarget } from './cost-engine/cost-engine-types';
import { TrialEntitlementService } from './trial/trial-entitlement-service';
import { TrialExhaustedError } from './trial/trial-entitlement-types';
import type { TrialCapability } from './trial/trial-entitlement-types';

/**
 * AZMA OS — ONE GATE BEFORE ANY PAID PROVIDER.
 *
 * ─── THE HOLE THIS CLOSES, MEASURED ─────────────────────────────────────────
 *
 *   Audited on the live release 2026-10-31. Six paid roads existed. TWO of
 *   them — image editing and animation — called a billed provider with NO
 *   entitlement check, NO balance check, NO reservation and NO settlement, in
 *   the route AND in the service beneath it. Any signed-in Creator could
 *   invoke them directly, without limit and without record.
 *
 *   CORRECTED 2026-11-01: an earlier report put `animate` at 840 provider
 *   credits for five seconds. That is 168 credits/second, which is Seedance's
 *   rate — RETIRED on 2026-09-27, and `qiyamah-cost-truth.ts` says in terms
 *   that it «must never be used as» a current cost. At the Empire's measured
 *   standard, VEO_MOTION is 96 credits/second: five seconds is 480 credits,
 *   not 840. The road was still naked; the number was wrong.
 *
 *   Two roads I first reported as naked are NOT: `upscale` carries the whole
 *   cycle in its route, and `creative/[operation]` carries it inside
 *   `creative-job-service`. Both corrections came from reading the service and
 *   not only the route file.
 *
 *   The cure is not a new economy. `reserve / settle / release` already exist,
 *   are atomic, and are correct. What was missing is a single door that every
 *   paid road passes through, so the next road cannot be built without one.
 *
 * ─── WHAT IT REFUSES TO DO ──────────────────────────────────────────────────
 *
 *   It never invents a price. Every Magic Hour entry in the cost catalog is
 *   `pending-discovery` with `azmaUnitsPerUnit: 0` — the AZMA-Unit conversion
 *   has not been approved. For an operation in that state this gate REFUSES
 *   rather than charging zero or guessing, because a reservation of zero is a
 *   paid provider call with a receipt that says nothing.
 *
 *   The day a price is approved in the catalog, the same operations begin
 *   charging through this gate with no further change to any route. The gate
 *   is driven by the catalog, not by code.
 */

/** What the Empire decided about one attempt to spend. */
export type GateVerdict =
  /** No charge is owed — a Founder, or a valid free entitlement. */
  | { readonly kind: 'entitled'; readonly via: 'founder' | 'trial' }
  /** Units are held. The caller MUST settle or release them. */
  | {
      readonly kind: 'reserved';
      readonly reservationId: string;
      readonly units: number;
      /** The attempt this hold belongs to, so the resolver can read its outcome. */
      readonly attemptKey: string;
    }
  /** The provider must not be called. */
  | {
      readonly kind: 'refused';
      readonly httpStatus: 402 | 503;
      readonly reason: 'payment-required' | 'cost-unavailable' | 'trial-exhausted';
      readonly messageAr: string;
      readonly requiredUnits?: number;
      readonly availableUnits?: number;
    };

export interface AuthoriseRequest {
  readonly db: DatabaseSync;
  readonly creatorId: string;
  /** Read from the verified session — never from the request body. */
  readonly role: string;
  /**
   * The priced capability this operation belongs to, or `null` when the
   * Empire has no price class for it at all.
   *
   * MEASURED: `background-removal`, `lip-sync`, `face-swap` and
   * `talking-photo` appear in no entry of the PROVIDER COST CATALOG, which is
   * the only catalog this gate reads. Folding them into `video-generation`
   * would be an assumption about money, and three of them are video projects
   * whose costs are not known to be equal. A null here is the honest answer,
   * and it refuses.
   *
   * CORRECTED 2026-11-01: that does NOT mean those four are unpriced. They are
   * measured and priced under the Chief Architect's ratified 1.70 uplift in
   * `pricing/new-capability-pricing.ts`, and they reach it through
   * `creative-job-service`, not through this gate. There are two pricing
   * authorities in the Empire, and this one reads the catalog. See
   * `docs/UNPRICED_CAPABILITY_DISCLOSURE.md`.
   */
  readonly capability: CapabilityTarget | null;
  readonly gatewayId: string;
  readonly modelId?: string;
  /**
   * The name of this act in `OPERATION_CONSUMPTION` — the Founder's own
   * signed price table — when the owner has ruled that this road reads it.
   *
   * ─── WHY THIS IS OPT-IN AND NOT A SWITCH ──────────────────────────────
   *
   *   RULED 2026-11-02, option (ب): connect ONLY the capabilities that are
   *   stopped today, and change no live charge. Video and 2× upscale are
   *   free this minute by the owner's own earlier decisions, and speech is
   *   charged with no sovereign entry at all — so a global switch would have
   *   moved three live behaviours he explicitly excluded.
   *
   *   A road that passes this reads the signed table. A road that does not
   *   keeps the cost catalog it has always used, byte for byte. The blast
   *   radius is the list of callers that pass it, and that list is the whole
   *   decision.
   *
   *   Absent → the `AzmaUnitCostEngine` path below, unchanged.
   */
  readonly sovereignCapability?: string;
  /**
   * How many of the price's own unit this act is.
   *
   * The signed table prices per image, per operation, or **per requested
   * second** — three units that are never interchangeable. A road that
   * passes `sovereignCapability` must say how many it is asking for, and the
   * gate refuses rather than assuming one.
   */
  readonly quantity?: number;
  /**
   * The key of the ATTEMPT this request was admitted under, from
   * `claimAttempt`. The gate reserves against it and never mints one.
   *
   * ─── WHY THE GATE NO LONGER DECIDES THIS ──────────────────────────────
   *
   *   A first version derived the key from the intent — creator, asset,
   *   instruction — and reused any hold still pending for it. That is a
   *   hole: two deliberate presses of the same instruction would share ONE
   *   hold while BOTH calls ran at the provider, which is a paid call with
   *   no cover. The opposite, a fresh key every request, charges a retry
   *   twice. Neither is a guess the server is entitled to make, so the
   *   decision moved to `claimAttempt`, where the client's own submission
   *   key answers it. One claimed attempt, one hold, one provider run.
   */
  readonly attemptKey: string;
  /** When this operation is covered by the launch gift, which kind it spends. */
  readonly trialCapability?: TrialCapability;
  /** Hashed by the trial service; never stored raw. */
  readonly claimIp?: string;
  readonly metadata?: Record<string, unknown>;
}

/**
 * Decide, before a single byte reaches a paid provider.
 *
 * The order is the safety: entitlement first (so a free operation is never
 * charged), then price (so an unpriced one is never called), then balance,
 * then the hold. Nothing is reserved for an operation that will not run.
 */
export function authorisePaidOperation(request: AuthoriseRequest): GateVerdict {
  const {
    db, creatorId, role, capability, gatewayId, modelId,
    attemptKey, trialCapability, claimIp, metadata,
    sovereignCapability, quantity,
  } = request;

  // ── 1 · Entitlements, which are decided before any price is read ─────────
  //
  //   A Founder and a valid launch gift owe nothing, so asking the catalog
  //   what they would have owed is both pointless and — while every entry is
  //   pending-discovery — a refusal that would wrongly block them.
  if (role === 'founder') return { kind: 'entitled', via: 'founder' };

  const trials = new TrialEntitlementService(db);
  if (trialCapability && trials.hasRemainingTrial(creatorId, trialCapability)) {
    try {
      trials.claimTrial(creatorId, trialCapability, claimIp);
      return { kind: 'entitled', via: 'trial' };
    } catch (error) {
      // Exhausted between the check and the claim — a race, and an honest one.
      // Fall through to the paid road rather than refusing outright.
      if (!(error instanceof TrialExhaustedError)) throw error;
    }
  }

  // ── 2 · The price, which the Empire owns and never guesses ───────────────
  //
  //   An operation with no price CLASS is further from priced than one whose
  //   class is pending: there is nothing to approve later and nothing to read
  //   now. It is refused before the engine is even asked.
  /*  ── THE SIGNED TABLE, FOR THE ROADS THE OWNER NAMED ──────────────────
   *
   *    `OPERATION_CONSUMPTION` is the only price source the Founder signed
   *    (2026-09-27). The catalog this gate used to read is a PROVIDER COST
   *    catalog whose Magic Hour entries are all zero — which is why image
   *    editing, animation and scene generation refused every paying Creator
   *    while their prices sat approved in his own table.
   *
   *    Read, never copied: the figure comes from the authority at call time,
   *    so a price cannot drift by being transcribed into this file.
   */
  if (sovereignCapability !== undefined) {
    const approved = sovereignPriceFor(sovereignCapability);
    if (approved.status === 'absent' || approved.unitsPerQuantity === null) {
      return {
        kind: 'refused',
        httpStatus: 503,
        reason: 'cost-unavailable',
        messageAr: 'هذه العمليّةُ لم تُسعَّر بعد، فلا تُنفَّذ. وستُفتَح فور اعتمادِ سعرها.',
      };
    }

    // The quantity is the caller's to state, because only the road knows
    // whether it is asking for one image or eight seconds. A road that
    // forgets is refused, never charged for a quantity this file assumed.
    const asked = quantity ?? 1;
    if (!Number.isInteger(asked) || asked <= 0) {
      return {
        kind: 'refused',
        httpStatus: 503,
        reason: 'cost-unavailable',
        messageAr: 'هذه العمليّةُ لم تُسعَّر بعد، فلا تُنفَّذ. وستُفتَح فور اعتمادِ سعرها.',
      };
    }

    return holdOrRefuse({
      db, creatorId, attemptKey, gatewayId, modelId, metadata,
      // A ruled price does not need the COST CATALOG to know the act, so a
      // road on this path may have no catalog class at all — the local MP4
      // export has none, and never will: no provider invoices it. The label
      // then falls back to the ruled name, which is the truer one anyway.
      capability: capability ?? sovereignCapability,
      units: approved.unitsPerQuantity * asked,
    });
  }

  /*  ── NO RULED PRICE, SO THE COST CATALOG ANSWERS ───────────────────────
   *
   *    And it can only answer about an act it has a CLASS for. An operation
   *    with no class is further from priced than one whose class is pending:
   *    there is nothing to approve later and nothing to read now.
   */
  if (capability === null) {
    return {
      kind: 'refused',
      httpStatus: 503,
      reason: 'cost-unavailable',
      messageAr: 'هذه العمليّةُ لم تُسعَّر بعد، فلا تُنفَّذ. وستُفتَح فور اعتمادِ سعرها.',
    };
  }

  const engine = new AzmaUnitCostEngine();
  let units: number;
  try {
    units = engine.estimate(capability, gatewayId, modelId).estimatedAzmaUnits;
  } catch (error) {
    if (error instanceof CostUnavailableError || error instanceof GatewayNotFoundError) {
      return {
        kind: 'refused',
        httpStatus: 503,
        reason: 'cost-unavailable',
        messageAr: 'هذه العمليّةُ لم تُسعَّر بعد، فلا تُنفَّذ. وستُفتَح فور اعتمادِ سعرها.',
      };
    }
    throw error;
  }

  // A priced operation that costs nothing is a catalog that has not been
  // finished, not a gift. Treating it as free would spend real provider money
  // against a receipt of zero.
  if (!Number.isFinite(units) || units <= 0) {
    return {
      kind: 'refused',
      httpStatus: 503,
      reason: 'cost-unavailable',
      messageAr: 'هذه العمليّةُ لم تُسعَّر بعد، فلا تُنفَّذ. وستُفتَح فور اعتمادِ سعرها.',
    };
  }

  // ── 3 · One hold, whichever authority stated the price ───────────────────
  return holdOrRefuse({ db, creatorId, attemptKey, capability, gatewayId, modelId, metadata, units });
}

/**
 * Read the balance, take the hold, and bind it to the attempt.
 *
 * Factored out so the signed price table and the provider cost catalog reach
 * the SAME balance check and the SAME reservation. Two copies of this would
 * be two places for a money bug to live, and only one of them would be read
 * the day it mattered.
 */
function holdOrRefuse(params: {
  readonly db: DatabaseSync;
  readonly creatorId: string;
  readonly attemptKey: string;
  /**
   * What this hold is for, as the reservation's metadata will record it.
   *
   * A plain string, because it is a label and not a lookup: a road priced by
   * the owner's ruling may have no entry in the provider cost catalog, and
   * forcing its name into that catalog's union would make the Empire claim a
   * provider sells something it does not.
   */
  readonly capability: string;
  readonly gatewayId: string;
  readonly modelId?: string;
  readonly metadata?: Record<string, unknown>;
  readonly units: number;
}): GateVerdict {
  const { db, creatorId, attemptKey, capability, gatewayId, modelId, metadata, units } = params;
  const credits = new CreatorCreditRepository(db);
  const balance = credits.getBalance(creatorId);
  if (balance.availableUnits < units) {
    return {
      kind: 'refused',
      httpStatus: 402,
      reason: 'payment-required',
      messageAr: 'رصيدك لا يكفي لهذا العمل. اشترِ باقةً للمتابعة.',
      requiredUnits: units,
      availableUnits: balance.availableUnits,
    };
  }

  try {
    const reservation = credits.reserve(creatorId, units, attemptKey, {
      capability, gatewayId, ...(modelId ? { modelId } : {}), ...(metadata ?? {}),
    });
    // The hold and the attempt now point at each other. Until one of settle or
    // release is recorded, this attempt reads as `owed` — which is how the
    // resolver finds a hold that a crash left behind.
    attachReservation(db, attemptKey, reservation.reservationId, reservation.reservedUnits);
    return {
      kind: 'reserved',
      reservationId: reservation.reservationId,
      units: reservation.reservedUnits,
      attemptKey,
    };
  } catch (error) {
    // The conditional UPDATE inside `reserve` lost the race to a concurrent
    // spend. The Creator is told the truth, and nothing was taken.
    if (error instanceof InsufficientBalanceError) {
      return {
        kind: 'refused',
        httpStatus: 402,
        reason: 'payment-required',
        messageAr: 'رصيدك لا يكفي لهذا العمل. اشترِ باقةً للمتابعة.',
        requiredUnits: units,
        availableUnits: credits.getBalance(creatorId).availableUnits,
      };
    }
    throw error;
  }
}

/**
 * A settlement or a release that FAILED, written where it can be found.
 *
 * ─── WHY THIS EXISTS ────────────────────────────────────────────────────────
 *
 *   Three routes wrapped `settle` in `catch { /* non-fatal *\/ }`. The
 *   intention was right — a Creator must not lose a result they earned because
 *   the ledger stumbled — but the stumble left NO trace: the reservation stays
 *   `pending`, the units stay locked, `total_spent` never moves, and nothing
 *   anywhere knows it happened.
 *
 *   The record goes into `credit_ledger` itself rather than a table of its own,
 *   so there is one place to ask what the Empire owes and what it is owed.
 */
function recordLedgerFailure(
  db: DatabaseSync,
  creatorId: string,
  reservationId: string,
  attempted: 'settlement' | 'release',
  error: unknown,
): void {
  try {
    const credits = new CreatorCreditRepository(db);
    const balance = credits.getBalance(creatorId);
    db.prepare(
      `INSERT INTO credit_ledger
         (ledger_id, creator_id, transaction_type, direction, amount, balance_after,
          reference_id, status, metadata_json, created_at)
       VALUES (?, ?, 'reconciliation_required', 'debit', 0, ?, ?, 'pending', ?, ?)`,
    ).run(
      `recon_${reservationId}_${Date.now()}`,
      creatorId,
      balance.availableUnits,
      reservationId,
      JSON.stringify({ attempted, error: String((error as { message?: unknown })?.message ?? error).slice(0, 300) }),
      Date.now(),
    );
  } catch {
    // The ledger itself is unreachable. There is nowhere left to write, and
    // throwing here would take the Creator's result down with it.
  }
}

/** Charge what the operation actually cost. Entitled work settles nothing. */
export function settleAuthorisedOperation(
  db: DatabaseSync,
  creatorId: string,
  verdict: GateVerdict,
  actualUnits?: number,
  metadata?: Record<string, unknown>,
): void {
  if (verdict.kind !== 'reserved') return;
  try {
    new CreatorCreditRepository(db).settle(
      verdict.reservationId,
      Math.min(actualUnits ?? verdict.units, verdict.units),
      metadata,
    );
    markSettlement(db, verdict.attemptKey, 'settled');
  } catch (error) {
    // The Creator keeps what they produced, and the debt is recorded in two
    // places that answer two questions: the ledger row says WHAT happened, and
    // the attempt staying `owed` is what the resolver reads.
    recordLedgerFailure(db, creatorId, verdict.reservationId, 'settlement', error);
  }
}

/** Give the units back. Safe to call twice — `release` is a no-op when settled. */
export function releaseAuthorisedOperation(
  db: DatabaseSync,
  creatorId: string,
  verdict: GateVerdict,
  reason: string,
): void {
  if (verdict.kind !== 'reserved') return;
  try {
    new CreatorCreditRepository(db).release(verdict.reservationId, reason);
    markSettlement(db, verdict.attemptKey, 'released');
  } catch (error) {
    recordLedgerFailure(db, creatorId, verdict.reservationId, 'release', error);
  }
}

/**
 * Reservations that were never settled or released.
 *
 * A read, deliberately: deciding what happened to a provider job is not
 * something a sweeper may guess, because releasing a hold on work that
 * actually succeeded gives the result away for nothing. This names them so a
 * human — or a later, evidence-carrying resolver — can act.
 */
/**
 * Settle a hold that was taken OUTSIDE this gate, and record the debt if the
 * ledger refuses.
 *
 * ─── WHY THIS EXISTS RATHER THAN A SEVENTH COPY ─────────────────────────────
 *
 *   Six roads reserve through the repository directly, each with its own
 *   entitlement rules written before this gate existed. Rewriting their
 *   authorisation would change the behaviour of live paid roads, which is not
 *   what settling a hold requires. What they all needed was this: the same
 *   settlement, with the same record of failure, in one place instead of seven
 *   `catch { }` blocks that each forgot something different.
 */
export function settleReservation(params: {
  readonly db: DatabaseSync;
  readonly creatorId: string;
  readonly attemptKey: string;
  readonly reservationId: string;
  readonly units: number;
  readonly metadata?: Record<string, unknown>;
}): void {
  const { db, creatorId, attemptKey, reservationId, units, metadata } = params;
  try {
    new CreatorCreditRepository(db).settle(reservationId, units, metadata);
    markSettlement(db, attemptKey, 'settled');
  } catch (error) {
    // The Creator keeps what they produced. The debt is recorded in both
    // places that answer about it: the ledger says what happened, and the
    // attempt staying `owed` is what the resolver reads.
    recordLedgerFailure(db, creatorId, reservationId, 'settlement', error);
  }
}

/** Give back a hold taken outside this gate, and record a failure to do so. */
export function releaseReservation(params: {
  readonly db: DatabaseSync;
  readonly creatorId: string;
  readonly attemptKey: string;
  readonly reservationId: string;
  readonly reason: string;
}): void {
  const { db, creatorId, attemptKey, reservationId, reason } = params;
  try {
    new CreatorCreditRepository(db).release(reservationId, reason);
    markSettlement(db, attemptKey, 'released');
  } catch (error) {
    recordLedgerFailure(db, creatorId, reservationId, 'release', error);
  }
}

export function pendingReservations(
  db: DatabaseSync,
  olderThanMs: number,
): readonly { reservationId: string; creatorId: string; units: number; createdAt: number; metadata: string | null }[] {
  const rows = db
    .prepare(
      `SELECT ledger_id, creator_id, amount, created_at, metadata_json
         FROM credit_ledger
        WHERE transaction_type = 'reservation' AND status = 'pending' AND created_at < ?
        ORDER BY created_at`,
    )
    .all(Date.now() - olderThanMs) as {
      ledger_id: string; creator_id: string; amount: number; created_at: number; metadata_json: string | null;
    }[];
  return rows.map((r) => ({
    reservationId: r.ledger_id,
    creatorId: r.creator_id,
    units: r.amount,
    createdAt: r.created_at,
    metadata: r.metadata_json,
  }));
}
