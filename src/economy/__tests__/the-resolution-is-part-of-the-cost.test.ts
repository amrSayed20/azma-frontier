/**
 * AZMA OS — الدقّةُ جزءٌ من التكلفة، فهي جزءٌ من السعر.
 *
 * ─── WHAT WENT WRONG, MEASURED 2026-11-03 ───────────────────────────────────
 *
 *   The Founder ordered the official tariff read from the provider's own
 *   pages. It says nano-banana-2 costs **100 credits per image at 1K and 150
 *   at 2K** — and the Empire's own production selector sends **2K** for the
 *   «إعلاني» style, which is a card a Creator can press in the chamber.
 *
 *   Every one of the fourteen styles was priced at the same 200 units. At 1K
 *   that is 2.0× the cost; at 2K it is 1.33× — **below the 1.70 margin he
 *   ratified**. One operation, one signed price, two costs, because the
 *   provider's unit is image × resolution and ours was only image.
 *
 *   His rule: «يجب تطبيق القاعدة على كل عملية مدفوعة موجودة فعليًا في
 *   المنصة، مع احترام وحدة التسعير الحقيقية التي يستخدمها المزود… لا يجوز
 *   افتراض أن جميع العمليات تُقاس بالوحدة نفسها.»
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { sovereignPriceFor } from '../pricing/sovereign-price-authority';
import { NEW_CAPABILITY_UPLIFT } from '../pricing/new-capability-pricing';
import { imageCreditsAtResolution, TARIFF_SOURCE } from '../pricing/official-provider-tariff';
import { resolutionForStyle } from '../../sovereign-model-selection/intent-builder';
import { OPERATION_CONSUMPTION } from '../pricing/sovereign-value-balance';

const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8');

describe('the resolution is part of the cost', () => {
  it('carries the provider’s published figures with the page they were read from', () => {
    // 100 at 1K and 150 at 2K is the whole reason this module exists. The
    // 1K figure is also the one the Empire had MEASURED on a real production,
    // which is what makes the rest of the row trustworthy.
    expect(imageCreditsAtResolution('1k')).toBe(100);
    expect(imageCreditsAtResolution('2k')).toBe(150);
    expect(imageCreditsAtResolution('4k')).toBe(200);
    // A configuration the provider does not publish yields no cost at all —
    // never a zero, which would read as free.
    expect(imageCreditsAtResolution('8k')).toBeNull();
    expect(TARIFF_SOURCE.readOn).toBe('2026-11-03');
  });

  it('the advertising style really does send 2k, and the others do not', () => {
    // Measured from the same maps the selector reads. If a style's tier moves,
    // this moves with it rather than going stale.
    expect(resolutionForStyle('advertising')).toBe('2k');
    for (const style of ['cinematic', 'photorealistic', 'infographic', 'portrait', 'artistic']) {
      expect(resolutionForStyle(style)).toBe('1k');
    }
    // And a Creator can press it: the chamber offers «إعلاني» as a card.
    expect(read('app/qiyamah-chamber/QiyamahChamberClient.tsx')).toContain("id: 'advertising'");
  });

  it('never charges below the Founder’s ratified margin for the resolution sent', () => {
    for (const resolution of ['1k', '2k', '4k']) {
      const cost = imageCreditsAtResolution(resolution)!;
      const price = sovereignPriceFor('IMAGE_GENERATION', resolution);
      expect(price.unitsPerQuantity).toBeGreaterThanOrEqual(Math.ceil(cost * NEW_CAPABILITY_UPLIFT));
    }
  });

  it('and never LOWERS a price the Founder signed', () => {
    const signed = OPERATION_CONSUMPTION.find((r) => r.capability === 'IMAGE_GENERATION')!.balancePerUnit;
    // At 1k his 200 clears the floor of 170, so his figure stands untouched.
    expect(sovereignPriceFor('IMAGE_GENERATION', '1k').unitsPerQuantity).toBe(signed);
    expect(sovereignPriceFor('IMAGE_GENERATION').unitsPerQuantity).toBe(signed);
    // At 2k the floor binds and the price RISES to 150 × 1.70.
    expect(sovereignPriceFor('IMAGE_GENERATION', '2k').unitsPerQuantity).toBe(255);
    expect(sovereignPriceFor('IMAGE_GENERATION', '2k').unitsPerQuantity).toBeGreaterThan(signed);
  });

  it('the live image road prices the resolution it is about to send', () => {
    const road = read('app/api/qiyamah/generate/route.ts');
    expect(road).toContain('const sentResolution = resolutionForStyle(');
    expect(road).toContain("sovereignPriceFor('IMAGE_GENERATION', sentResolution)");
    // And it does not ask for a price without naming the configuration.
    expect(road).not.toContain("sovereignPriceFor('IMAGE_GENERATION')");
  });

  it('a floor is never computed from a cost nobody published', () => {
    // An unknown configuration leaves the signed price exactly as it is. A
    // floor built on a guessed cost would be a guessed price.
    const unknown = sovereignPriceFor('IMAGE_GENERATION', 'a-resolution-nobody-publishes');
    expect(unknown.unitsPerQuantity)
      .toBe(OPERATION_CONSUMPTION.find((r) => r.capability === 'IMAGE_GENERATION')!.balancePerUnit);
    expect(unknown.status).toBe('approved');
  });
});
