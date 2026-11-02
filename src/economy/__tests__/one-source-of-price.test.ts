/**
 * AZMA OS — مصدرٌ واحدٌ للسعر، والفجوةُ تُقاس ولا تُوصَف.
 *
 * ─── WHAT THESE PROVE ───────────────────────────────────────────────────────
 *
 *   Four modules in this Empire state a number about money, and they are not
 *   four opinions of the same thing:
 *
 *     sovereign-value-balance   → the Founder's approved PRICES
 *     new-capability-pricing    → a ratified DERIVATION for five capabilities
 *     provider-cost-catalog     → what a PROVIDER charges, in AZMA units
 *     qiyamah-cost-truth        → what the Empire PAID, in provider credits
 *
 *   The economy gate reads the third. These tests hold the first two as the
 *   price authority, and they MEASURE the disagreement with what the live
 *   roads actually charge — so the gap in the closing report is an assertion
 *   a reader can run, not a sentence they have to trust.
 *
 *   Nothing here changes a price. The switch-over is the owner's decision and
 *   the last test states exactly which figures it would move.
 */

import { execSync } from 'child_process';
import {
  sovereignPriceFor,
  allSovereignPrices,
  SCENE_CAPABILITY,
} from '../pricing/sovereign-price-authority';
import { MEASURED_COSTS, NEW_CAPABILITY_UPLIFT } from '../pricing/new-capability-pricing';
import { OPERATION_CONSUMPTION } from '../pricing/sovereign-value-balance';
import { AzmaUnitCostEngine } from '../cost-engine/azma-cost-engine';
import { CostUnavailableError, GatewayNotFoundError } from '../cost-engine/cost-engine-types';
import type { CapabilityTarget } from '../cost-engine/cost-engine-types';
import { readFileSync } from 'fs';
import { join } from 'path';

/** What the gate would charge today, or the reason it refuses. */
function whatTheGateCharges(capability: CapabilityTarget, gatewayId: string): number | 'refused' {
  try {
    return new AzmaUnitCostEngine().estimate(capability, gatewayId).estimatedAzmaUnits;
  } catch (error) {
    if (error instanceof CostUnavailableError || error instanceof GatewayNotFoundError) return 'refused';
    throw error;
  }
}

describe('١ · السُّلطةُ الواحدةُ تُجيب عن كلِّ قدرةٍ لها سعرٌ معتمد', () => {
  it('every rule the Founder approved is answered as approved, with its own unit', () => {
    for (const rule of OPERATION_CONSUMPTION) {
      const price = sovereignPriceFor(rule.capability);
      expect(price.status).toBe('approved');
      expect(price.unitsPerQuantity).toBe(rule.balancePerUnit);
      expect(price.quantity).toBe(rule.quantity);
      // The authority is named, so no reader has to guess who signed it.
      expect(price.authority).toContain('Founder decision 2026-09-27');
    }
  });

  it('the five uplift capabilities are answered as derived, never as approved', () => {
    for (const capability of ['BACKGROUND_REMOVAL', 'LIP_SYNC', 'FACE_SWAP', 'TALKING_PHOTO']) {
      const price = sovereignPriceFor(capability);
      expect(price.status).toBe('derived-ratified');
      expect(price.authority).toContain('Chief Architect 2026-10-12');
    }
    // UPSCALE_4X is the fifth, and it is NOT in the Founder's table — so the
    // derivation is the only authority for it.
    expect(sovereignPriceFor('UPSCALE_4X').status).toBe('derived-ratified');
  });

  it('a capability nobody priced is ABSENT — never zero', () => {
    const price = sovereignPriceFor('TEXT_TO_SPEECH');
    expect(price.status).toBe('absent');
    expect(price.unitsPerQuantity).toBeNull();
    // The decisive assertion: absence must never be readable as a free act.
    expect(price.unitsPerQuantity).not.toBe(0);
  });

  it('no price is copied — the authority is read at call time', () => {
    // Change the source and the answer changes with it. A transcribed number
    // would keep answering the old figure.
    const live = OPERATION_CONSUMPTION.find((r) => r.capability === 'IMAGE_EDIT')!;
    expect(sovereignPriceFor('IMAGE_EDIT').unitsPerQuantity).toBe(live.balancePerUnit);
  });
});

describe('٢ · الفجوةُ بين ما يُخصَم اليومَ وما اعتُمِد — مقيسةً', () => {
  /*  Each row is: the capability, what the gate charges from the provider cost
   *  catalog today, and what the Founder approved. The assertions pin BOTH
   *  numbers, so the day either moves, this test says so.
   */

  it('image generation: the live charge is a fifth of the approved price', () => {
    expect(whatTheGateCharges('image-generation', 'openai')).toBe(40);
    expect(sovereignPriceFor('IMAGE_GENERATION').unitsPerQuantity).toBe(200);
  });

  it('image editing: refused by the gate, and approved in the Founder table', () => {
    expect(whatTheGateCharges('image-editing', 'magic-hour')).toBe('refused');
    const approved = sovereignPriceFor('IMAGE_EDIT');
    expect(approved.status).toBe('approved');
    expect(approved.unitsPerQuantity).toBe(200);
    expect(approved.quantity).toBe('per-image');
  });

  it('animation: refused by the gate, and approved as MOTION per requested second', () => {
    expect(whatTheGateCharges('video-generation', 'magic-hour')).toBe('refused');
    const approved = sovereignPriceFor('MOTION');
    expect(approved.status).toBe('approved');
    expect(approved.unitsPerQuantity).toBe(200);
    expect(approved.quantity).toBe('per-requested-second');
  });

  it('speech: charged today, and approved NOWHERE', () => {
    // The hardest row in the table. Two gateways charge for it, with two
    // different numbers, and the Founder's table has no entry for it at all.
    expect(whatTheGateCharges('text-to-speech', 'openai')).toBe(20);
    expect(whatTheGateCharges('text-to-speech', 'elevenlabs')).toBe(30);
    expect(sovereignPriceFor('TEXT_TO_SPEECH').status).toBe('absent');
    expect(sovereignPriceFor('VOICE_AND_TTS').status).toBe('absent');
  });

  it('voice cloning: refused, and approved nowhere either', () => {
    expect(whatTheGateCharges('voice-cloning', 'elevenlabs')).toBe('refused');
    expect(sovereignPriceFor('VOICE_CLONING').status).toBe('absent');
  });
});

describe('٣ · والقرارُ المطلوبُ محصورٌ ومعدودٌ', () => {
  it('names every capability whose live charge would move, and by how much', () => {
    // This is the owner's decision, stated as a list rather than as prose: if
    // the gate is pointed at the approved authority, these are the figures
    // that change and nothing else does.
    const wouldMove = [
      { capability: 'IMAGE_GENERATION', from: whatTheGateCharges('image-generation', 'openai'), to: 200 },
      { capability: 'IMAGE_EDIT', from: whatTheGateCharges('image-editing', 'magic-hour'), to: 200 },
      { capability: 'MOTION', from: whatTheGateCharges('video-generation', 'magic-hour'), to: 200 },
    ];

    expect(wouldMove).toEqual([
      { capability: 'IMAGE_GENERATION', from: 40, to: 200 },
      { capability: 'IMAGE_EDIT', from: 'refused', to: 200 },
      { capability: 'MOTION', from: 'refused', to: 200 },
    ]);
  });

  it('the gate reads the signed table ONLY where the owner named it, and the catalog elsewhere', () => {
    /*  THIS GUARD HAS ALREADY DONE ITS JOB ONCE.
     *
     *    Until 2026-11-02 it read: «the gate must NOT contain
     *    `sovereignPriceFor(`» — because pointing the gate at the price
     *    authority is a commercial act, and the guard existed to fail the day
     *    an engineer did it without the owner revisiting his figures.
     *
     *    He revisited them and ruled option (ب): connect the capabilities
     *    that are STOPPED, change no live charge. So the rule changes with
     *    the ruling — and what it now holds is the shape of that ruling:
     *    the signed table is reached only by a road that asks for it by name,
     *    and every other road keeps the catalog it has always used.
     *
     *    A global switch would fail this test, which is the point: three live
     *    behaviours he excluded by name — video, 2× upscale, speech — must
     *    stay where they are.
     */
    const gate = readFileSync(join(process.cwd(), 'src/economy/paid-operation-gate.ts'), 'utf8');

    // Both authorities are present, and neither replaced the other.
    expect(gate).toContain('sovereignPriceFor(');
    expect(gate).toContain('new AzmaUnitCostEngine()');

    // The signed table is opt-in: it answers only when a caller names a
    // capability in it, never by default.
    expect(gate).toContain('if (sovereignCapability !== undefined) {');
    // And a road that asks for it must state its quantity, because the table
    // prices per image, per operation and per REQUESTED SECOND.
    expect(gate).toContain('const asked = quantity ?? 1;');

    // One hold for both, so a money bug cannot live in a second copy.
    expect((gate.match(/credits\.reserve\(/g) ?? []).length).toBe(1);
  });

  it('and exactly the roads the owner named read the signed table — no more', () => {
    /*  The blast radius IS the reader list, so the reader list is asserted.
     *
     *  Two shapes, because the roads are not built alike: `edit` and
     *  `animate` go through the shared gate and name their capability to it,
     *  while the image half of `generate` holds its own money and reads the
     *  authority directly. Both are readers; neither is a switch.
     */
    const readers = (execSync(
      'git grep -lE "sovereignCapability:|sovereignPriceFor\\(" -- "app" "src" || true',
      { encoding: 'utf8', cwd: process.cwd() },
    ) as string)
      .split('\n').map((l) => l.trim())
      .filter((l) => l.length > 0
        && !l.includes('__tests__')
        && !l.includes('paid-operation-gate.ts')
        && !l.includes('sovereign-price-authority.ts'))
      .sort();

    expect(readers).toEqual([
      'app/api/qiyamah/generate/route.ts',
      'app/api/vault/assets/[assetId]/animate/route.ts',
      'src/qiyamah-generation/image-edit-service.ts',
      // The fifth capability: the scene names its own classification, and
      // the authority derives its figure from the ratified uplift.
      'src/ras-amr-production/qiyamah-commission.ts',
      // The sixth, and the first that is not a provider act at all: the local
      // MP4 export, priced by the Founder's ruling of 2026-11-02 at 100 units
      // per second of the finished film.
      'src/sovereign-entry/ras-al-amr-render.ts',
    ]);
  });

  it('and the scene price is the measured cost × 1.70, derived and not chosen', () => {
    const scene = sovereignPriceFor(SCENE_CAPABILITY);
    const measured = MEASURED_COSTS.find((r) => r.capability === SCENE_CAPABILITY)!;

    // The Founder's own rule and his own example: 100 → 170.
    expect(scene.status).toBe('derived-ratified');
    expect(scene.unitsPerQuantity)
      .toBe(Math.ceil(measured.providerCreditsPerUnit * NEW_CAPABILITY_UPLIFT));

    // And it is neither of the two figures that were never approved for it:
    // 70 belonged to the open-source storyboard, 98 was a break-even
    // calculation the Founder refused to let stand as a price.
    expect(scene.unitsPerQuantity).not.toBe(70);
    expect(scene.unitsPerQuantity).not.toBe(98);
  });

  it('and each names the capability the owner approved, with its own quantity', () => {
    const read = (f: string) => readFileSync(join(process.cwd(), f), 'utf8');

    // Per image.
    expect(read('src/qiyamah-generation/image-edit-service.ts'))
      .toContain("sovereignCapability: 'IMAGE_EDIT'");
    expect(read('src/qiyamah-generation/image-edit-service.ts')).toContain('quantity: 1');

    // Per REQUESTED second — the duration the Creator asked for, never what
    // the provider later reports it produced.
    const animate = read('app/api/vault/assets/[assetId]/animate/route.ts');
    expect(animate).toContain("sovereignCapability: 'MOTION'");
    expect(animate).toContain('quantity: durationSeconds');

    // Per image, read directly because this road holds its own money.
    expect(read('app/api/qiyamah/generate/route.ts'))
      .toContain("sovereignPriceFor('IMAGE_GENERATION')");
  });

  it('and the roads the owner excluded still read the catalog, untouched', () => {
    // Video, 2× upscale and speech. Asserted as an ABSENCE, because what
    // proves a partial connection is what did not move.
    for (const file of [
      'app/api/vault/assets/[assetId]/upscale/route.ts',
      'app/api/vault/assets/generate-speech/route.ts',
      'app/api/vault/assets/generate-cloned-speech/route.ts',
      'app/api/vault/assets/clone-voice/route.ts',
    ]) {
      const source = readFileSync(join(process.cwd(), file), 'utf8');
      expect({ file, named: source.includes('sovereignCapability') })
        .toEqual({ file, named: false });
    }

    // The video half of the generate road is excluded too, though the image
    // half of the same file is connected: the exclusion is per ACT.
    const generate = readFileSync(join(process.cwd(), 'app/api/qiyamah/generate/route.ts'), 'utf8');
    const videoHalf = generate.slice(0, generate.indexOf('─── IMAGE PATH'));
    expect(videoHalf).not.toContain('sovereignCapability');
  });

  it('the price authority reads no provider cost catalog, ever', () => {
    const authority = readFileSync(
      join(process.cwd(), 'src/economy/pricing/sovereign-price-authority.ts'), 'utf8',
    );
    // A price source that reaches into a cost catalog is how a provider's
    // invoice becomes a Creator's price without anyone deciding it.
    expect(authority).not.toMatch(/from '.*provider-cost-catalog'/);
    expect(authority).not.toMatch(/from '.*azma-cost-engine'/);
  });

  it('every answer the authority gives carries a status and a named authority', () => {
    const all = allSovereignPrices();
    expect(all.length).toBeGreaterThan(10);
    for (const price of all) {
      expect(['approved', 'derived-ratified']).toContain(price.status);
      expect(price.authority.length).toBeGreaterThan(20);
      expect(typeof price.unitsPerQuantity).toBe('number');
      expect(price.quantity).not.toBeNull();
    }
  });
});
