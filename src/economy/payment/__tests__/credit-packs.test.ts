import { CREDIT_PACKS, getCreditPack, resolveStripePriceId } from '../credit-packs';

// SCENARIO 25: Credit pack integrity
describe('Credit Pack definitions', () => {
  it('has exactly 3 packs: start, create, achieve', () => {
    const ids = CREDIT_PACKS.map((p) => p.packId);
    expect(ids).toEqual(['start', 'create', 'achieve']);
  });

  it('packs have correct EGP prices', () => {
    expect(getCreditPack('start').priceEgp).toBe(99);
    expect(getCreditPack('create').priceEgp).toBe(249);
    expect(getCreditPack('achieve').priceEgp).toBe(499);
  });

  it('packs have correct AZMA unit quantities', () => {
    expect(getCreditPack('start').azmaUnits).toBe(800);
    expect(getCreditPack('create').azmaUnits).toBe(2400);
    expect(getCreditPack('achieve').azmaUnits).toBe(6000);
  });

  it('throws for unknown pack ID', () => {
    expect(() => getCreditPack('unknown' as never)).toThrow();
  });

  it('resolveStripePriceId returns null when env var is unset', () => {
    delete process.env['STRIPE_PRICE_START'];
    expect(resolveStripePriceId('start')).toBeNull();
  });

  it('resolveStripePriceId returns env var value when set', () => {
    process.env['STRIPE_PRICE_START'] = 'price_test_12345';
    expect(resolveStripePriceId('start')).toBe('price_test_12345');
    delete process.env['STRIPE_PRICE_START'];
  });
});
