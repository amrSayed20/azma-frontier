/**
 * A SCENE IS PRICED BY THE RESOLUTION IT IS ACTUALLY PRODUCED AT.
 *
 * THE FOUNDER'S DECISION, 2026-11-09:
 *   «تُطبّق تعريفة Nano Banana 2 المعتمدة بحسب الدقة: 1K: 200 · 2K: 255 ·
 *    4K: 340. لا تُستخدم تعريفة موحدة بصرف النظر عن الدقة.»
 *
 * WHY IT MATTERS, IN THE EMPIRE'S OWN MEASURED NUMBERS: the provider's
 * published cost for nano-banana-2 moves with the resolution — 100 credits at
 * 1K, 150 at 2K, 200 at 4K — and the Empire sends 2K for one of its fourteen
 * styles. A flat scene charge therefore collects the same units for an act
 * that costs the Empire twice as much at 4K as at 1K. At 4K a flat 170 is
 * BELOW the 200 credits the provider charges: the Empire would pay to make
 * the Creator's scene.
 *
 * These guards hold the three figures and the refusal. They assert what the
 * price AUTHORITY answers, not what any caller passes it — a caller that
 * forgets the dimension is a separate defect with its own guard.
 */
import { readFileSync } from 'fs';
import { join } from 'path';
import { sovereignPriceFor, SCENE_CAPABILITY } from '../pricing/sovereign-price-authority';

describe('a scene is priced by the resolution it is produced at', () => {
  it('answers the Founder’s figure at each resolution', () => {
    expect(sovereignPriceFor(SCENE_CAPABILITY, '1k').unitsPerQuantity).toBe(200);
    expect(sovereignPriceFor(SCENE_CAPABILITY, '2k').unitsPerQuantity).toBe(255);
    expect(sovereignPriceFor(SCENE_CAPABILITY, '4k').unitsPerQuantity).toBe(340);
  });

  it('never answers one figure for every resolution', () => {
    const units = (d: string) => sovereignPriceFor(SCENE_CAPABILITY, d).unitsPerQuantity;
    expect(new Set([units('1k'), units('2k'), units('4k')]).size).toBe(3);
  });

  it('and the road that buys a scene actually NAMES its resolution', () => {
    // A price keyed by dimension is only a price if the caller passes one.
    // Omit it and the gate falls back to the flat signed figure — silently,
    // with every 2K and 4K scene sold below the Founder's tariff. The
    // authority cannot see that from where it stands, so the caller is read.
    const road = readFileSync(
      join(__dirname, '..', '..', 'ras-amr-production', 'qiyamah-commission.ts'), 'utf8');
    expect(road).toContain('dimension: resolutionForStyle(');
  });

  it('a 4K scene is never priced below what the provider charges for it', () => {
    // The defect this exists to make impossible: 200 provider credits
    // answered with 170 sovereign units.
    expect(sovereignPriceFor(SCENE_CAPABILITY, '4k').unitsPerQuantity!).toBeGreaterThan(200);
  });
});
