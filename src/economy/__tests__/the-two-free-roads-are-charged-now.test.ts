/**
 * AZMA OS — الطريقانِ المجّانيّانِ صارا يُخصَمان، بوحدتَيهما المُوثَّقتَين.
 *
 * ─── THE RULING THESE HOLD ──────────────────────────────────────────────────
 *
 *   2026-11-03, decisions 3 and 4:
 *
 *     «أعتمد تفعيل خصم 200 وحدة للفيديو وفق السعر المسجل حاليًا. لكن قبل
 *     التفعيل النهائي، يجب توثيق وحدة هذا السعر ونطاقه بدقة: هل هو لكل
 *     عملية فيديو، أم لكل مقطع، أم لكل مدة… لا يجوز تفسير السعر على أنه
 *     سعر لكل ثانية أو لكل طلب دون سند من سجل التسعير المعتمد.»
 *
 *     «أعتمد تفعيل خصم 50 وحدة لعملية رفع الدقة 2×… والتحقق من أن الخصم
 *     يحدث عند تنفيذ العملية الحقيقية، وليس لمجرد فتح الواجهة أو الضغط على
 *     زر لا ينتج عنه مخرج.»
 *
 *   MEASURED BEFORE THE RULING: both roads ran and charged NOTHING while
 *   their prices sat approved in his own signed table, read by no line.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { sovereignPriceFor } from '../pricing/sovereign-price-authority';
import { OPERATION_CONSUMPTION } from '../pricing/sovereign-value-balance';
import { NEW_CAPABILITY_UPLIFT } from '../pricing/new-capability-pricing';
import { officialCost } from '../pricing/official-provider-tariff';

const read = (file: string) => readFileSync(join(process.cwd(), file), 'utf8');

describe('video, charged per REQUESTED second', () => {
  it('takes its unit from the signed table and not from an assumption', () => {
    // The Founder forbade interpreting the unit without evidence from the
    // pricing record. This IS the pricing record, and it declares the unit.
    const signed = OPERATION_CONSUMPTION.find((r) => r.capability === 'VIDEO_GENERATION')!;
    expect(signed.balancePerUnit).toBe(200);
    expect(signed.quantity).toBe('per-requested-second');
    // And the table carries its own basis, including why it is NOT the
    // allocated model's cheaper rate.
    expect(signed.note).toContain('Per REQUESTED second');
    expect(sovereignPriceFor('VIDEO_GENERATION').quantity).toBe('per-requested-second');
  });

  it('clears the Founder’s floor over the provider’s published cost', () => {
    // minimax-h3 at 720p, which is the configuration this road sends.
    const cost = officialCost('/v1/text-to-video', 'minimax-h3', '720p')!;
    expect(cost.credits).toBe(48);
    expect(cost.unit).toBe('second');
    expect(sovereignPriceFor('VIDEO_GENERATION').unitsPerQuantity!)
      .toBeGreaterThanOrEqual(Math.ceil(cost.credits * NEW_CAPABILITY_UPLIFT));
  });

  it('multiplies by the duration, and resolves it BEFORE the hold', () => {
    const road = read('app/api/qiyamah/generate/route.ts');
    expect(road).toContain("const approvedVideo = sovereignPriceFor('VIDEO_GENERATION')");
    expect(road).toContain('approvedVideo.unitsPerQuantity * duration');

    // The duration used to be resolved twenty lines BELOW the reservation,
    // which was harmless only while video was free. A price per requested
    // second cannot size a hold without it, so it must come first.
    expect(road.indexOf('const duration =')).toBeLessThan(road.indexOf('const approvedVideo'));
    // And it is declared exactly once, so the hold and the dispatch cannot
    // disagree about how long the Creator asked for.
    expect(road.split('const duration =').length - 1).toBe(1);
  });

  it('no longer writes a null estimate and generates for nothing', () => {
    const road = read('app/api/qiyamah/generate/route.ts');
    // The measured defect: the cost catalog's video entry is
    // `pending-discovery`, so the road wrote null and an entitled subscriber
    // generated video with no reservation at all.
    expect(road).not.toContain('videoResolvedCostEstimate = null');
    expect(road).not.toContain("estimate('video-generation'");
    // The whole road is off the provider cost catalog now, both halves.
    expect(road).not.toContain('AzmaUnitCostEngine');
  });
});

describe('2× upscale, charged per OPERATION', () => {
  it('takes its unit from the signed table', () => {
    const signed = OPERATION_CONSUMPTION.find((r) => r.capability === 'UPSCALE_2X')!;
    expect(signed.balancePerUnit).toBe(50);
    expect(signed.quantity).toBe('per-operation');
  });

  it('clears the Founder’s floor over the published cost of the mode it sends', () => {
    // `style.mode: 'preserve'` with `scale_factor: 2` — the configuration
    // this road actually sends, published at 25 credits per image.
    const cost = officialCost('/v1/ai-image-upscaler', null, 'preserve-2x')!;
    expect(cost.credits).toBe(25);
    expect(sovereignPriceFor('UPSCALE_2X').unitsPerQuantity!)
      .toBeGreaterThanOrEqual(Math.ceil(cost.credits * NEW_CAPABILITY_UPLIFT));
  });

  it('is charged for BOTH factors now, not only for 4×', () => {
    const road = read('app/api/vault/assets/[assetId]/upscale/route.ts');
    // The measured defect: the condition named one factor, so a 2× upscale
    // passed the price check and reserved nothing.
    expect(road).not.toContain('if (scaleFactor === 4 && factorRecord?.creatorPriceExists) {');
    expect(road).toContain('if (factorRecord?.creatorPriceExists) {');
    // Each factor from its own authority: 4× derived by the uplift, 2× signed.
    expect(road).toContain("priceNewCapability({ capability: 'UPSCALE_4X' })");
    expect(road).toContain("sovereignPriceFor('UPSCALE_2X')");
  });

  it('refuses rather than charging zero when neither authority answers', () => {
    const road = read('app/api/vault/assets/[assetId]/upscale/route.ts');
    expect(road).toContain('if (chargeUnits === null || chargeUnits <= 0) {');
    expect(road).toContain("reason: 'unpriceable'");
  });

  it('and the charge still sits where nothing can refuse after it', () => {
    const road = read('app/api/vault/assets/[assetId]/upscale/route.ts');
    // The repair of 2026-11-01: seven refusals once stood between the hold
    // and the engine, each returning with the units still held. Widening the
    // charge to a second factor must not undo that ordering.
    expect(road.indexOf('if (factorRecord?.creatorPriceExists) {'))
      .toBeLessThan(road.indexOf('await upscaleImageViaProvider('));
  });
});
