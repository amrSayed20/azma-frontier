/**
 * AZMA OS — ما يُخصَم فعلًا اليوم، مقابلَ ما اعتُمِد.
 *
 * ─── WHY THIS SUITE EXISTS ──────────────────────────────────────────────────
 *
 *   The owner's first decision is whether the economy gate should read the
 *   sovereign price authority. That decision rests on one table: what each
 *   capability charges TODAY against what the Founder approved. I reported
 *   that table twice from reading, and was wrong twice:
 *
 *     · I said image generation is charged 40 units. It is NOT. The `openai`
 *       catalog entries (40 for an image, 20 for speech) are reached by NO
 *       production code — every live caller prices against `magic-hour` or
 *       `elevenlabs`. The two openai entries are dormant.
 *
 *     · I did not report that UPSCALE_2X and VIDEO_GENERATION are charged
 *       NOTHING today while both carry approved sovereign prices.
 *
 *   So the table is a test now. Each row pins the live figure AND the approved
 *   one, and the day either moves, this says so in the same run.
 *
 *   NOTHING HERE CHANGES A PRICE. It measures.
 */

import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { join } from 'path';

import { OPERATION_CONSUMPTION, BALANCE_UNIT_EGP } from '../pricing/sovereign-value-balance';
import { CREDIT_EGP, QIYAMAH_COST_TRUTH } from '../cost-engine/qiyamah-cost-truth';
import { priceNewCapability } from '../pricing/new-capability-pricing';
import { AzmaUnitCostEngine } from '../cost-engine/azma-cost-engine';
import { CostUnavailableError, GatewayNotFoundError } from '../cost-engine/cost-engine-types';
import type { CapabilityTarget } from '../cost-engine/cost-engine-types';
import { sovereignPriceFor } from '../pricing/sovereign-price-authority';

const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');

/** What the cost engine answers for a (capability, gateway) pair. */
function engine(capability: CapabilityTarget, gatewayId: string): number | 'refused' {
  try {
    return new AzmaUnitCostEngine().estimate(capability, gatewayId).estimatedAzmaUnits;
  } catch (e) {
    if (e instanceof CostUnavailableError || e instanceof GatewayNotFoundError) return 'refused';
    throw e;
  }
}

const approved = (capability: string): number | 'absent' => {
  const price = sovereignPriceFor(capability);
  return price.status === 'approved' ? price.unitsPerQuantity! : 'absent';
};

describe('١ · المدخلانِ اللذانِ لا يَقرؤهما طريقٌ حيّ', () => {
  it('the two openai catalog entries are priced and DORMANT', () => {
    // They answer when asked…
    expect(engine('image-generation', 'openai')).toBe(40);
    expect(engine('text-to-speech', 'openai')).toBe(20);
    // …and nothing in production asks them. Every live caller names its own
    // gateway, and neither names openai.
    const production = [
      'app/api/qiyamah/generate/route.ts',
      'app/api/vault/assets/generate-speech/route.ts',
      'app/api/vault/assets/generate-cloned-speech/route.ts',
      'app/api/vault/assets/clone-voice/route.ts',
      'app/api/vault/assets/[assetId]/upscale/route.ts',
      'app/api/vault/assets/[assetId]/animate/route.ts',
      'src/qiyamah-generation/image-edit-service.ts',
      'src/ras-amr-production/qiyamah-commission.ts',
      'src/vault/creative-job-service.ts',
      'app/makman-al-ghayah/reframe-actions.ts',
    ];
    for (const file of production) {
      expect({ file, namesOpenai: /gatewayId: 'openai'|, 'openai'\)/.test(read(file)) })
        .toEqual({ file, namesOpenai: false });
    }
  });
});

describe('٢ · جدولُ الحقيقةِ الحيِّ مقابلَ المعتمد', () => {
  /*  Each row is measured at its own authority. `live` is what a paying
   *  Creator is charged today; `approvedUnits` is the Founder's figure.
   */

  it('image generation: REFUSED for a paying Creator, 200 approved', () => {
    // The route prices against magic-hour, which is pending-discovery, so a
    // Creator past their free trial is refused 503 — never charged 40.
    expect(read('app/api/qiyamah/generate/route.ts')).toContain("const GATEWAY_ID = 'magic-hour'");
    expect(engine('image-generation', 'magic-hour')).toBe('refused');
    expect(approved('IMAGE_GENERATION')).toBe(200);
  });

  it('video generation: FREE for an entitled subscriber, 200 approved', () => {
    const route = read('app/api/qiyamah/generate/route.ts');
    expect(engine('video-generation', 'magic-hour')).toBe('refused');
    // And the road says so in its own words: an entitled subscriber generates
    // with no reservation at all, and the fact is logged rather than hidden.
    expect(route).toContain('entitled; video not metered');
    expect(route).toContain('videoResolvedCostEstimate = null');
    expect(approved('VIDEO_GENERATION')).toBe(200);
  });

  it('upscale 2×: FREE today, 50 approved', () => {
    const route = read('app/api/vault/assets/[assetId]/upscale/route.ts');
    // The charge block runs only for 4×; 2× keeps a charge of zero, and the
    // route tells the Creator that number rather than hiding it.
    expect(route).toContain('if (scaleFactor === 4 && factorRecord?.creatorPriceExists)');
    expect(route).toContain('let upscaleChargeUnits = 0;');
    expect(route).toContain('chargedUnits: upscaleChargeUnits');
    expect(approved('UPSCALE_2X')).toBe(50);
  });

  it('upscale 4×: 170 charged by the ratified uplift, and ABSENT from the Founder table', () => {
    const quoted = priceNewCapability({ capability: 'UPSCALE_4X' });
    expect(quoted.ok && quoted.chargedUnits).toBe(170);
    expect(approved('UPSCALE_4X')).toBe('absent');
  });

  it('the four creative acts: charged by the uplift, and ABSENT from the Founder table', () => {
    expect(priceNewCapability({ capability: 'BACKGROUND_REMOVAL', imageCount: 1 }))
      .toMatchObject({ ok: true, chargedUnits: 9 });
    expect(priceNewCapability({ capability: 'TALKING_PHOTO', requestedSeconds: 1 }))
      .toMatchObject({ ok: true, chargedUnits: 82 });
    // Frame-billed acts refuse without the clip's own frame rate.
    expect(priceNewCapability({ capability: 'LIP_SYNC', requestedSeconds: 1 }))
      .toMatchObject({ ok: false });
    for (const c of ['BACKGROUND_REMOVAL', 'LIP_SYNC', 'FACE_SWAP', 'TALKING_PHOTO']) {
      expect(approved(c)).toBe('absent');
    }
  });

  it('speech: 30 charged, and ABSENT from the Founder table', () => {
    expect(engine('text-to-speech', 'elevenlabs')).toBe(30);
    expect(approved('TEXT_TO_SPEECH')).toBe('absent');
    expect(approved('VOICE_AND_TTS')).toBe('absent');
  });

  it('voice cloning: refused, and absent', () => {
    expect(engine('voice-cloning', 'elevenlabs')).toBe('refused');
    expect(approved('VOICE_CLONING')).toBe('absent');
  });

  it('reframe is the ONLY capability whose live charge equals the approved price', () => {
    // 20 units per platform, read from the Founder's own table by the road
    // itself — not copied into it.
    expect(read('src/platform-reframe/reframe-plan.ts')).toContain('OPERATION_CONSUMPTION');
    expect(approved('PLATFORM_REFRAME')).toBe(20);
  });

  it('three approved prices have no consumer at all', () => {
    // Priced by the Founder and read by nothing. Not a defect — unbuilt work
    // whose price was decided in advance — but it belongs in the table.
    for (const capability of ['MP4_PRODUCTION', 'STORYBOARD_IMAGE', 'STORYBOARD_VIDEO']) {
      expect(approved(capability)).toBeGreaterThan(0);
    }
    for (const capability of ['MP4_PRODUCTION', 'STORYBOARD_IMAGE', 'STORYBOARD_VIDEO']) {
      const hits = execSync(`git grep -l "${capability}" -- "app" "src" || true`, {
        encoding: 'utf8', cwd: process.cwd(),
      })
        .split('\n').map((l) => l.trim())
        .filter((l) => l.length > 0
          && !l.includes('sovereign-value-balance')
          && !l.includes('__tests__'));
      expect({ capability, consumers: hits }).toEqual({ capability, consumers: [] });
    }
  });
});

describe('٣ · المشهدُ المُنشأُ: أيُّ القدرتَين هو؟', () => {
  it('the commissioned scene is produced by the SAME binding as IMAGE_GENERATION', () => {
    // It calls `generateImage` — the Qiyamah act itself — so the provider,
    // the model and the charge are the image generation's, not a storyboard
    // provider's.
    const commission = read('src/ras-amr-production/qiyamah-commission.ts');
    expect(commission).toContain("from '../qiyamah-generation/generation-service'");
    expect(commission).toContain('await generateImage(');
    expect(commission).toContain("capability: 'image-generation'");
  });

  it('IMAGE_GENERATION has a measured provider cost; STORYBOARD_IMAGE has none by construction', () => {
    const imageBasis = OPERATION_CONSUMPTION.find((r) => r.capability === 'IMAGE_GENERATION')!;
    const storyboardBasis = OPERATION_CONSUMPTION.find((r) => r.capability === 'STORYBOARD_IMAGE')!;

    expect(imageBasis.pricingBasisCapability).toBe('IMAGE_GENERATION');
    // Its basis is a MEASURED production.
    const measured = QIYAMAH_COST_TRUTH.find((c) => c.capability === 'IMAGE_GENERATION')!;
    expect(measured.basis).toBe('MEASURED');
    expect(measured.credits).toBe(100);
    expect(measured.provider).toBe('magic-hour-image');

    // The storyboard price was set for a provider that charges nothing, and
    // says so. Pricing a Magic Hour generation by it would be pricing one
    // provider's work at another's basis.
    expect(storyboardBasis.pricingBasisCapability).toBeNull();
    expect(storyboardBasis.note).toContain('Open-source provider');
  });

  it('and 70 units would sell a commissioned scene BELOW its measured cost', () => {
    const costEgp = 100 * CREDIT_EGP;            // the measured provider charge
    const atStoryboard = 70 * BALANCE_UNIT_EGP;  // what 70 units are worth
    const atImage = 200 * BALANCE_UNIT_EGP;      // what 200 units are worth

    // The decisive comparison, computed from the constants and not by hand.
    expect(atStoryboard).toBeLessThan(costEgp);
    expect(atImage).toBeGreaterThan(costEgp);

    // Printed so the report quotes the module, not my arithmetic.
    console.log('SCENE_ECONOMICS=' + JSON.stringify({
      measuredCostEgp: Number(costEgp.toFixed(4)),
      at70UnitsEgp: Number(atStoryboard.toFixed(4)),
      at200UnitsEgp: Number(atImage.toFixed(4)),
      lossAt70Egp: Number((costEgp - atStoryboard).toFixed(4)),
      contributionAt200Egp: Number((atImage - costEgp).toFixed(4)),
    }));
  });
});

describe('٤ · تسعيرُ التحريك: أيُّ تكلفةٍ تَنطبِق على العمليّةِ الفعليّة', () => {
  it('MOTION is priced on VEO_MOTION, and VEO_MOTION is a measured image-to-video production', () => {
    const motion = OPERATION_CONSUMPTION.find((r) => r.capability === 'MOTION')!;
    expect(motion.pricingBasisCapability).toBe('VEO_MOTION');

    const veo = QIYAMAH_COST_TRUTH.find((c) => c.capability === 'VEO_MOTION')!;
    expect(veo.basis).toBe('MEASURED');
    expect(veo.credits).toBe(96);
    expect(veo.unit).toBe('1 second of animated video');
    // The binding it was measured on is the IMAGE-TO-VIDEO one — the same
    // endpoint the animate road calls — and not the text-to-video one.
    expect(veo.provider).toBe('magic-hour-image-to-video');
    expect(veo.model).toBe('veo-3-1');
  });

  it('the retired rate is marked retired and forbidden as a current cost', () => {
    const seedance = QIYAMAH_COST_TRUTH.find((c) => c.capability === 'VIDEO_CREATION_SEEDANCE')!;
    expect(seedance.basis).toBe('HISTORICAL');
    expect(seedance.note).toContain('RETIRED');
    expect(seedance.note).toContain('must never be used');
    // 168 credits/second — the figure I twice attached to the animate road.
    expect(seedance.credits! / 6).toBe(168);
  });

  it('and the animate road lets the Creator name the model, so the basis may not be the model run', () => {
    // THE OPEN QUESTION, stated as a measurement: the road REQUIRES a model
    // id from the Creator and refuses to substitute one. So the cost of the
    // model actually executed is not necessarily VEO_MOTION's 96.
    const route = read('app/api/vault/assets/[assetId]/animate/route.ts');
    expect(route).toContain("'model-required'");
    expect(route).toContain('buildAnimationIntent(instruction, modelId, durationSeconds)');
    expect(route).not.toMatch(/modelId\s*\|\|\s*'/); // no silent default
  });
});
