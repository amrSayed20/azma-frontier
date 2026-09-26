/**
 * AZMA OS — the Empire's alarm must mean something.
 *
 * ─── MEASURED ON PRODUCTION 2026-09-26 ──────────────────────────────────────
 *
 *   /api/health reported `empire.status: DEGRADED`, `operationalTier:
 *   CRITICAL`, `heapUtilizationPct: 96%` — and had been doing so continuously.
 *   Two independent faults, both of which made the alarm permanent:
 *
 *   1. `heapUsed / heapTotal`. `heapTotal` is what V8 has committed from the
 *      OS AT THAT MOMENT, and V8 grows it on demand while keeping it close to
 *      what is in use. PROVEN: a freshly started, empty Node process measures
 *      73% by that formula and 0% against the real ceiling. Production's true
 *      figure was 143.8 MB of a ~2240 MB limit — six percent.
 *
 *   2. Three STRIPE keys marked revenue-critical, folded into the operational
 *      tier. The Empire implements no Stripe gateway — `src/economy/payment`
 *      holds a provider-neutral IPaymentGateway and one Paymob adapter — and
 *      the Founder has ruled the gateway will be XPay. Three keys that will
 *      never be set were reporting CRITICAL for ever.
 *
 *   A permanent false alarm is worse than no alarm: it teaches everyone to
 *   ignore the one that will matter.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { measureOperationalState, PAYMENT_GATEWAYS } from '../measure';

const ROOT = process.cwd();
const MEASURE = readFileSync(join(ROOT, 'src/operational-truth/measure.ts'), 'utf8');

describe('1 · the heap is measured against its ceiling', () => {
  it('the denominator is the heap size limit, never heapTotal', () => {
    expect(MEASURE).toContain('getHeapStatistics().heap_size_limit');
    expect(MEASURE).not.toContain('mem.heapUsed / mem.heapTotal');
  });

  it('and this process, which is healthy, is not reported as critical', () => {
    const state = measureOperationalState();
    expect(state.heapUtilizationPct).not.toBeNull();
    expect(state.heapUtilizationPct as number).toBeLessThan(85);
    expect(state.memoryTier).toBe('NORMAL');
  });

  it('resident memory is reported too — the other real pressure', () => {
    const state = measureOperationalState();
    expect(state.rssPct).not.toBeNull();
    expect(state.rssPct as number).toBeGreaterThanOrEqual(0);
  });

  it('a figure that cannot be taken is null, never a default that reads as health', () => {
    expect(MEASURE).toContain('let heapUtilizationPct: number | null = null;');
    expect(MEASURE).toContain('let rssPct: number | null = null;');
  });
});

describe('2 · revenue is reported beside the alarm, not inside it', () => {
  it('the operational tier is what is FAILING — memory and disk only', () => {
    const state = measureOperationalState();
    // No payment gateway is configured in a test process, and that must not
    // make the machine report itself as failing.
    expect(state.revenueReady).toBe(false);
    const expected = state.memoryTier === 'CRITICAL' || state.diskTier === 'CRITICAL'
      ? 'CRITICAL'
      : state.memoryTier === 'WARNING' || state.diskTier === 'WARNING'
        ? 'WARNING'
        : 'NORMAL';
    expect(state.overallTier).toBe(expected);
  });

  it('but «we cannot be paid» is still said plainly', () => {
    const state = measureOperationalState();
    expect(state.missingRevenueProviders.length).toBeGreaterThan(0);
  });
});

describe('3 · the gateway is named by the payment layer, not by this file', () => {
  it('no Stripe key is revenue-critical any more — none is implemented', () => {
    expect(MEASURE).not.toContain('STRIPE_SECRET_KEY');
    expect(MEASURE).not.toContain('STRIPE_WEBHOOK_SECRET');
    expect(MEASURE).not.toContain('STRIPE_PRICE_ID_CREATOR_MONTHLY');
  });

  it('a gateway is ready only when EVERY key it needs is present', () => {
    expect(PAYMENT_GATEWAYS.length).toBeGreaterThan(0);
    for (const g of PAYMENT_GATEWAYS) expect(g.keys.length).toBeGreaterThan(0);
    expect(MEASURE).toContain('configured: g.keys.every((k) => Boolean(process.env[k]))');
  });

  it('the gateway the Empire actually implements is the one listed', () => {
    // src/economy/payment holds exactly one adapter today.
    expect(PAYMENT_GATEWAYS.map((g) => g.id)).toContain('paymob');
  });
});
