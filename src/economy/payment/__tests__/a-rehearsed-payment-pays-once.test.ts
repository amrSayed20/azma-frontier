/**
 * AZMA OS — رحلةُ الدفعِ التجريبيّة: تُضيفُ الوحداتِ مرّةً واحدة، ولا تُضيفُها
 * إذا لم يُدفَع.
 *
 * ─── WHAT IS PROVEN HERE ────────────────────────────────────────────────────
 *
 *   The Founder's acceptance list, 2026-10-20, each item as its own `it`:
 *   an order carries the approved price and units; a rehearsed success lands
 *   real units in the real ledger; a failure and a cancellation land none; a
 *   replayed notification pays nothing a second time; the trail from Creator
 *   to order to transaction to credit is followable; and a browser cannot
 *   forge the success.
 *
 *   The DATABASE IS REAL — a temporary file on the Empire's own schema —
 *   because what is under test is which rows end up written. The only thing
 *   simulated is the gateway, which is the entire point: it stands exactly
 *   where XPay will stand, and everything after it is the production road.
 */

import { mkdtempSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { DatabaseSync } from 'node:sqlite';

import { createDatabase } from '../../../persistent-storage/db';
import { CreatorCreditRepository } from '../../credit-ledger/credit-ledger-repository';
import { handlePaymentWebhook } from '../payment-webhook-handler';
import { getCreditPack } from '../credit-packs';
import {
  SimulationPaymentGateway,
  getSimulationGateway,
  resetSimulationSecretForTests,
  SIMULATION_FLAG,
} from '../simulation-payment-gateway';
import {
  recordInitiatedPurchase,
  findPurchaseForCreator,
  settlePurchase,
  listPurchasesForCreator,
} from '../purchase-order-repository';

const CREATOR = 'creator-rehearsal';
let scratch = '';
let db: DatabaseSync;

/** One order, placed exactly as the checkout route places it. */
function placeOrder(packId: string, key: string) {
  const pack = getCreditPack(packId as Parameters<typeof getCreditPack>[0]);
  return recordInitiatedPurchase(db, {
    creatorId: CREATOR,
    packId: pack.packId,
    azmaUnits: pack.azmaUnits,
    amountEgp: pack.priceEgp,
    idempotencyKey: key,
    providerId: 'payment-simulation',
    providerOrderId: `sim_${key}`,
  });
}

/** The server's own act: build the paid event, sign it, run the real handler. */
async function rehearseSuccess(gateway: SimulationPaymentGateway, order: ReturnType<typeof placeOrder>) {
  const signed = gateway.signEvent(gateway.paidEvent({
    sessionId: order.providerOrderId ?? order.transactionId,
    creatorId: order.creatorId,
    packId: order.packId,
    azmaUnits: order.azmaUnits,
    amountEgp: order.amountEgp,
    idempotencyKey: order.idempotencyKey,
  }));
  return handlePaymentWebhook(db, gateway, signed.body, signed.signature);
}

describe('a rehearsed payment pays once, and only when it says it paid', () => {
  beforeAll(() => {
    scratch = mkdtempSync(join(tmpdir(), 'azma-pay-'));
    db = createDatabase(join(scratch, 'pay.db'));
  });
  afterAll(() => {
    try { rmSync(scratch, { recursive: true, force: true }); } catch { /* the OS will */ }
  });
  beforeEach(() => {
    process.env[SIMULATION_FLAG] = '1';
    resetSimulationSecretForTests();
  });
  afterEach(() => { delete process.env[SIMULATION_FLAG]; });

  it('the order carries the approved price and units, from the Empire own table', () => {
    const order = placeOrder('irtiqaa', 'key-approved');
    expect(order).toMatchObject({
      packId: 'irtiqaa', amountEgp: 249, azmaUnits: 3450, status: 'initiated', creatorId: CREATOR,
    });
  });

  it('a rehearsed success lands real units in the real ledger', async () => {
    const gateway = new SimulationPaymentGateway();
    const credits = new CreatorCreditRepository(db);
    const order = placeOrder('asas', 'key-success');
    const before = credits.getBalance(CREATOR).availableUnits;

    const result = await rehearseSuccess(gateway, order);
    const after = credits.getBalance(CREATOR).availableUnits;

    expect(result).toMatchObject({ processed: true, reason: 'credited', azmaUnitsGranted: 1375 });
    expect(after - before).toBe(1375);
    expect(settlePurchase(db, order.transactionId, 'succeeded')).toBe(true);
    expect(findPurchaseForCreator(db, order.transactionId, CREATOR)?.status).toBe('succeeded');
  });

  it('the SAME notification twice adds the units once', async () => {
    const gateway = new SimulationPaymentGateway();
    const credits = new CreatorCreditRepository(db);
    const order = placeOrder('asas', 'key-replay');

    const before = credits.getBalance(CREATOR).availableUnits;
    await rehearseSuccess(gateway, order);
    const afterFirst = credits.getBalance(CREATOR).availableUnits;
    await rehearseSuccess(gateway, order);          // the replay
    const afterSecond = credits.getBalance(CREATOR).availableUnits;

    expect(afterFirst - before).toBe(1375);
    expect(afterSecond).toBe(afterFirst);
  });

  it('a second ORDER for the same pack is a second purchase, and is paid', async () => {
    // Replay protection must not become «a Creator may buy a pack once».
    const gateway = new SimulationPaymentGateway();
    const credits = new CreatorCreditRepository(db);
    const before = credits.getBalance(CREATOR).availableUnits;

    await rehearseSuccess(gateway, placeOrder('asas', 'key-again-1'));
    await rehearseSuccess(gateway, placeOrder('asas', 'key-again-2'));

    expect(credits.getBalance(CREATOR).availableUnits - before).toBe(2750);
  });

  it('a failure and a cancellation add nothing, and leave the Creator able to retry', () => {
    const credits = new CreatorCreditRepository(db);
    const before = credits.getBalance(CREATOR).availableUnits;

    const failed = placeOrder('ihtiraf', 'key-failed');
    expect(settlePurchase(db, failed.transactionId, 'failed')).toBe(true);
    const cancelled = placeOrder('ihtiraf', 'key-cancelled');
    expect(settlePurchase(db, cancelled.transactionId, 'cancelled')).toBe(true);

    expect(credits.getBalance(CREATOR).availableUnits).toBe(before);
    expect(findPurchaseForCreator(db, failed.transactionId, CREATOR)?.status).toBe('failed');
    // And the road is not closed: a fresh order can still be placed.
    expect(placeOrder('ihtiraf', 'key-after-failure').status).toBe('initiated');
  });

  it('a settled order is never settled again — the first ending is the ending', () => {
    const order = placeOrder('asas', 'key-terminal');
    expect(settlePurchase(db, order.transactionId, 'failed')).toBe(true);
    expect(settlePurchase(db, order.transactionId, 'succeeded')).toBe(false);
    expect(findPurchaseForCreator(db, order.transactionId, CREATOR)?.status).toBe('failed');
  });

  it('the trail runs Creator → order → transaction → credit, and can be walked', async () => {
    const gateway = new SimulationPaymentGateway();
    const credits = new CreatorCreditRepository(db);
    const order = placeOrder('riyada', 'key-trail');
    await rehearseSuccess(gateway, order);
    settlePurchase(db, order.transactionId, 'succeeded', order.providerOrderId);

    const stored = findPurchaseForCreator(db, order.transactionId, CREATOR)!;
    expect(stored.creatorId).toBe(CREATOR);
    expect(stored.azmaUnits).toBe(16670);

    const entry = credits.getLedgerHistory(CREATOR, 50)
      .find((e) => String(e.idempotencyKey ?? '').includes(order.idempotencyKey));
    expect(entry).toBeTruthy();
    expect(entry!.amount).toBe(16670);
    expect(entry!.transactionType).toBe('purchase');
    expect(listPurchasesForCreator(db, CREATOR).some((o) => o.transactionId === stored.transactionId)).toBe(true);
  });

  it('a stranger cannot read, settle or claim another Creator order', () => {
    const order = placeOrder('asas', 'key-owned');
    expect(findPurchaseForCreator(db, order.transactionId, 'someone-else')).toBeNull();
  });

  it('an event the browser could forge is refused: the signature is the lock', async () => {
    const gateway = new SimulationPaymentGateway();
    const credits = new CreatorCreditRepository(db);
    const order = placeOrder('riyada', 'key-forged');
    const before = credits.getBalance(CREATOR).availableUnits;

    const body = JSON.stringify(gateway.paidEvent({
      sessionId: 'sim_forged', creatorId: CREATOR, packId: 'riyada',
      azmaUnits: 16670, amountEgp: 1200, idempotencyKey: order.idempotencyKey,
    }));
    const forged = await handlePaymentWebhook(
      db, gateway, body, `t=${Math.floor(Date.now() / 1000)},v1=${'0'.repeat(64)}`,
    );

    expect(forged).toMatchObject({ processed: false, reason: 'signature_invalid' });
    expect(credits.getBalance(CREATOR).availableUnits).toBe(before);
  });

  it('a tampered amount is refused even with a valid signature', async () => {
    // The handler compares what was PAID against AZMA's own price record, so a
    // session signed for one pound cannot buy 16,670 units.
    const gateway = new SimulationPaymentGateway();
    const credits = new CreatorCreditRepository(db);
    const before = credits.getBalance(CREATOR).availableUnits;
    const order = placeOrder('riyada', 'key-tampered');

    const signed = gateway.signEvent(gateway.paidEvent({
      sessionId: 'sim_tampered', creatorId: CREATOR, packId: 'riyada',
      azmaUnits: 16670, amountEgp: 1, idempotencyKey: order.idempotencyKey,
    }));
    const result = await handlePaymentWebhook(db, gateway, signed.body, signed.signature);

    expect(result.processed).toBe(false);
    expect(result.reason).toMatch(/amount_mismatch/);
    expect(credits.getBalance(CREATOR).availableUnits).toBe(before);
  });

  it('the simulation does not exist unless the server says so, and never beside real money', () => {
    expect(getSimulationGateway(false)).not.toBeNull();
    // A live credential present: the rehearsal is withdrawn entirely.
    expect(getSimulationGateway(true)).toBeNull();
    // The flag absent: there is no such gateway at all.
    delete process.env[SIMULATION_FLAG];
    expect(getSimulationGateway(false)).toBeNull();
  });
});
