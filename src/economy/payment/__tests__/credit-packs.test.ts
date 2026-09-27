import { CREDIT_PACKS, getCreditPack, VALID_PACK_IDS } from '../credit-packs';
import { SOVEREIGN_PACKAGES } from '../../pricing/sovereign-value-balance';

/**
 * ─── THE PRICE RECORD THE WEBHOOK TRUSTS ────────────────────────────────────
 *
 *   FINAL FOUNDER DECISION 2026-09-27 replaced START / CREATE / ACHIEVE
 *   (800 / 2,400 / 6,000 units) with four named packages. Nothing was ever
 *   sold at the old prices: no payment gateway has ever been configured on
 *   this server.
 *
 *   The Stripe price-ID resolver these tests also covered is gone with the
 *   Stripe purchase route it served. The gateway is XPay, and a second
 *   checkout surface pointing at an unconfigurable gateway is a surface that
 *   can only ever mislead.
 */
describe('the four approved packages', () => {
  it('are exactly the Founder’s four, in order', () => {
    expect(CREDIT_PACKS.map((p) => p.packId)).toEqual(['asas', 'irtiqaa', 'ihtiraf', 'riyada']);
    expect(VALID_PACK_IDS).toEqual(['asas', 'irtiqaa', 'ihtiraf', 'riyada']);
  });

  it('carry the approved prices', () => {
    expect(getCreditPack('asas').priceEgp).toBe(99);
    expect(getCreditPack('irtiqaa').priceEgp).toBe(249);
    expect(getCreditPack('ihtiraf').priceEgp).toBe(499);
    expect(getCreditPack('riyada').priceEgp).toBe(1200);
  });

  it('grant the approved Balance', () => {
    expect(getCreditPack('asas').azmaUnits).toBe(1375);
    expect(getCreditPack('irtiqaa').azmaUnits).toBe(3450);
    expect(getCreditPack('ihtiraf').azmaUnits).toBe(6900);
    expect(getCreditPack('riyada').azmaUnits).toBe(16670);
  });

  it('carry their approved validity — 28 days, and six months for الريادة', () => {
    expect(getCreditPack('riyada').validity).toBe('six-months');
    for (const id of ['asas', 'irtiqaa', 'ihtiraf']) {
      expect(getCreditPack(id).validity).toBe('twenty-eight-days');
    }
  });

  it('are ONE record with the pricing layer — never a second copy', () => {
    // A price written twice is a price that will eventually disagree with
    // itself, and the webhook would honour whichever copy it happened to read.
    for (const p of SOVEREIGN_PACKAGES) {
      const pack = getCreditPack(p.packageId);
      expect([pack.priceEgp, pack.azmaUnits]).toEqual([p.priceEgp, p.balanceUnits]);
    }
    expect(CREDIT_PACKS).toHaveLength(SOVEREIGN_PACKAGES.length);
  });

  it('throws for an unknown package rather than returning a default', () => {
    expect(() => getCreditPack('unknown')).toThrow();
    // Never the first pack, never a zero-priced one.
    expect(() => getCreditPack('')).toThrow();
  });

  it('the superseded ids are gone, so an old client cannot buy at an old price', () => {
    for (const dead of ['start', 'create', 'achieve']) {
      expect(() => getCreditPack(dead)).toThrow();
    }
  });
});
