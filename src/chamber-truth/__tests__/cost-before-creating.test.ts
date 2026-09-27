/**
 * AZMA OS — القيامة: what a thing costs, said before it is spent.
 *
 * FOUND 2026-09-26, inventorying the Chamber against the newest creation
 * workspaces at the Founder's request: `app/api/sovereign/economy/estimate`
 * was complete and real — verified session, AzmaUnitCostEngine,
 * CreatorCreditRepository, TrialEntitlementService — and its own comment read
 * «Creator must know cost BEFORE creation starts». No chamber in the Empire
 * called it, and it was declared nowhere in Truth.
 *
 * Opening its door raised a constitutional problem these tests hold shut: the
 * cost catalog's own `unitDescription` reads «50–200 MH credits», «Nano Banana
 * 2», «Veo 3.1», «DALL-E 3», and `blockerReason` interpolates the gateway id.
 * Those are engineers' fields, exactly as `displayName` is on the model fleet.
 * The Knowledge Source Abstraction Principle forbids them reaching a Creator.
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { CHAMBER_TRUTH } from '../truth-registry';
import { consumptionFor } from '@/src/economy/pricing/sovereign-value-balance';
import { IMAGE_MODEL_FLEET } from '@/src/sovereign-model-selection/image-model-fleet';
import { VIDEO_MODEL_FLEET } from '@/src/sovereign-model-selection/video-model-fleet';

const ROOT = process.cwd();
const read = (f: string) => readFileSync(join(ROOT, f), 'utf8');
/** Comments are for engineers, exactly as the fields they explain are. */
const strip = (f: string) => read(f)
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .replace(/^\s*\/\/.*$/gm, '');

const ROUTE = read('app/api/sovereign/economy/estimate/route.ts');
const CLIENT = read('app/qiyamah-chamber/QiyamahChamberClient.tsx');

const PROVIDER_WORDS = [
  'nano banana', 'nano-banana', 'seedance', 'veo', 'sora', 'dall-e', 'dalle',
  'kling', 'ltx', 'seedream', 'z-image', 'mh credit', 'elevenlabs',
];

describe('1 · the capability exists in Truth and is Qiyamah’s', () => {
  it('know-cost-before-creating is declared exactly once, in القيامة', () => {
    const all = Object.values(CHAMBER_TRUTH).flatMap((t) =>
      t.capabilities.filter((c) => c.id === 'know-cost-before-creating').map(() => t.chamberId));
    expect(all).toEqual(['qiyamah-chamber']);
  });

  it('it creates nothing, so it needs no existing asset', () => {
    const cap = CHAMBER_TRUTH['qiyamah-chamber'].capabilities
      .find((c) => c.id === 'know-cost-before-creating');
    expect(cap?.requiresExistingAsset).toBe(false);
  });
});

describe('2 · the gateway is derived, never supplied', () => {
  it('the route no longer defaults to a provider written in its own source', () => {
    expect(ROUTE).not.toContain("?? 'openai'");
    expect(ROUTE).not.toContain('invalid_gateway_id');
  });

  it('it reads the gateway from the designated fleet', () => {
    expect(ROUTE).toContain('function designatedGateway');
    expect(ROUTE).toContain('m.productionAuthorized && m.active');
  });

  it('the fleets really do declare one, so the derivation cannot return nothing', () => {
    for (const fleet of [IMAGE_MODEL_FLEET, VIDEO_MODEL_FLEET]) {
      const designated = fleet.find((m) => m.productionAuthorized && m.active);
      expect(designated).toBeDefined();
      expect(typeof designated?.gatewayId).toBe('string');
    }
  });

  it('no page sends a gateway to it', () => {
    expect(CLIENT).not.toMatch(/economy\/estimate[\s\S]{0,300}gatewayId/);
  });
});

describe('3 · no provider name crosses to a Creator', () => {
  it('the response carries neither unitDescription nor blockerReason nor gatewayId', () => {
    const body = ROUTE.slice(ROUTE.indexOf('return NextResponse.json({', ROUTE.indexOf('const priced')));
    expect(body).not.toContain('unitDescription');
    expect(body).not.toContain('blockerReason');
    expect(body).not.toContain('gatewayId');
  });

  it('what it says instead is Arabic, and names the work not the maker', () => {
    expect(ROUTE).toContain('workAr');
    expect(ROUTE).toContain('blockerAr');
    const lower = strip('app/api/sovereign/economy/estimate/route.ts').toLowerCase();
    // …and the strip left the code standing, so this is not passing on an empty string.
    expect(lower).toContain('designatedgateway');
    for (const w of PROVIDER_WORDS) expect(lower).not.toContain(w);
  });

  it('the Chamber renders no provider word beside the price', () => {
    const start = CLIENT.indexOf('className={`cost-line');
    expect(start).toBeGreaterThan(-1);
    const code = strip('app/qiyamah-chamber/QiyamahChamberClient.tsx');
    const panel = code.slice(code.indexOf('className={`cost-line'), code.indexOf('className={`cost-line') + 900).toLowerCase();
    expect(panel).toContain('cost-balance');
    for (const w of PROVIDER_WORDS) expect(panel).not.toContain(w);
  });
});

describe('4 · an unknown price is stated as unknown, never as zero', () => {
  it('the route only quotes a number when the catalog says available', () => {
    // TIGHTENED 2026-09-27: the source of a quoted number moved from the
    // legacy catalog — which still said 'pending-discovery' for everything,
    // so a Creator was told every capability was unpriced — to the Founder's
    // approved consumption table. The rule is untouched: a number is quoted
    // only when one is known, and what is not known is null, never zero.
    expect(ROUTE).toContain('const priced = balanceConsumed !== null;');
    expect(ROUTE).toContain('estimatedAzmaUnits: balanceConsumed,');
    // A capability with no approved consumption maps to null, not to 0.
    expect(ROUTE).toContain("'text-to-speech':   null,");
    expect(ROUTE).not.toMatch(/estimatedAzmaUnits:\s*0/);
  });

  it('the Chamber says so rather than printing a confident 0', () => {
    expect(CLIENT).toContain('الكُلفة غير مُقدَّرة بعد');
  });
});

describe('5 · it is asked for the act the Creator has chosen', () => {
  it('each of the four acts names the approved operation it consumes', () => {
    // CORRECTED 2026-09-27: these mapped acts to cost-engine CAPABILITIES, so
    // the infographic was quoted as an ordinary image generation although the
    // approved table prices INFOGRAPHIC in its own row. Both read 200 today —
    // which is precisely why the borrowing was invisible. Each act is quoted
    // under its own rule now, and the route derives the capability from it.
    expect(CLIENT).toContain("image: 'IMAGE_GENERATION',");
    expect(CLIENT).toContain("infographic: 'INFOGRAPHIC',");
    expect(CLIENT).toContain("video: 'VIDEO_GENERATION',");
    expect(CLIENT).toContain("edit: 'IMAGE_EDIT',");
    // The route declares every step this page can name, and no page sends a
    // capability alongside it — one table, so the pairing cannot be wrong.
    for (const step of ['IMAGE_GENERATION', 'INFOGRAPHIC', 'VIDEO_GENERATION', 'IMAGE_EDIT', 'MOTION', 'UPSCALE_2X']) {
      expect(ROUTE).toContain(`${step}:`);
    }
    for (const c of ['image-generation', 'video-generation', 'image-editing']) {
      expect(ROUTE).toContain(`'${c}'`);
    }
  });

  it('every step the approved table names is a step the table really carries', () => {
    // A step the route offers but the pricing layer does not price would be
    // quoted as «unknown» forever, and nobody would know why.
    const declared = [...ROUTE.matchAll(/^ {2}([A-Z_0-9]+):\s*\{ capability:/gm)].map((m) => m[1]!);
    expect(declared.length).toBeGreaterThanOrEqual(6);
    for (const step of declared) expect(consumptionFor(step)).toBeDefined();
  });

  it('a clip is quoted on the seconds the Creator chose, and re-quoted when they change', () => {
    // «تُحاسَب على ما طلبتَه» is only visible if the figure MOVES with the
    // ladder. It did not: the quote was fetched once per act, with no
    // quantity at all, so a 6-second clip and a 10-second clip showed the
    // same number and neither was the charge.
    expect(CLIENT).toContain('quoteStep(COST_STEP_OF_ACT[mediaType], durationSeconds)');
    expect(CLIENT).toContain('}, [mediaType, creatorPresent, durationSeconds]);');
    expect(ROUTE).toContain("rule?.quantity === 'per-requested-second'");
  });

  it('the two later steps are priced where their own buttons stand', () => {
    // The Founder, 2026-09-27: «تعرض التكلفه لكل خطوه اثناء الانتاج». Animating
    // a still and raising an asset's resolution are paid steps that carried no
    // price at all.
    expect(CLIENT).toContain("quoteStep('MOTION', motionSeconds)");
    expect(CLIENT).toContain("quoteStep('UPSCALE_2X')");
    expect(CLIENT).toContain('{motionCost && <StepCostLine quote={motionCost} />}');
    expect(CLIENT).toContain('<StepCostLine quote={upscaleCost} />');
    // One renderer, so three steps cannot describe the same unit differently.
    expect(CLIENT.match(/function StepCostLine/g)).toHaveLength(1);
    expect(CLIENT).toContain('{cost && <StepCostLine quote={cost} showBalance />}');
  });

  it('none of the three steps holds a price of its own', () => {
    // Every figure comes from the server, which reads the Founder's table.
    // A number written into this page is a price written twice.
    const code = strip('app/qiyamah-chamber/QiyamahChamberClient.tsx');
    for (const rate of ['200', '70', '50']) {
      expect(code).not.toMatch(new RegExp(`(balancePerUnit|وحدة سياديّة)[^\n]{0,20}${rate}`));
    }
    expect(code).not.toContain('OPERATION_CONSUMPTION');
  });

  it('it is never asked before the Chamber knows who is asking', () => {
    // MEASURED walking as a stranger: this fired on mount, ahead of the
    // identity check, so every newcomer's console carried a 401. The route
    // was right to refuse; the Chamber was wrong to ask.
    expect(CLIENT).toContain('if (!creatorPresent) return;');
    expect(CLIENT).toContain('setCreatorPresent(true);');
    // The dependency list gained `durationSeconds` when the clip began being
    // quoted on its requested seconds; `creatorPresent` still gates it, which
    // is what this guard is about.
    expect(CLIENT).toContain('}, [mediaType, creatorPresent, durationSeconds]);');
    // And the two later steps are gated by the same condition.
    expect(CLIENT).toContain('if (!creatorPresent || !animateAssetId) return;');
    expect(CLIENT).toContain('if (!creatorPresent || !generatedAssetId) return;');
  });

  it('a price that cannot be fetched never blocks the work', () => {
    expect(CLIENT).toContain('// A price we cannot fetch is simply not shown. It never blocks the work.');
  });
});
