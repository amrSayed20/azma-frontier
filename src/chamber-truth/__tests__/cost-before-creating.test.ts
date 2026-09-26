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
    expect(ROUTE).toContain("const priced = estimate.availability === 'available';");
    expect(ROUTE).toContain('estimatedAzmaUnits: priced ? estimate.estimatedAzmaUnits : null,');
  });

  it('the Chamber says so rather than printing a confident 0', () => {
    expect(CLIENT).toContain('الكُلفة غير مُقدَّرة بعد');
  });
});

describe('5 · it is asked for the act the Creator has chosen', () => {
  it('each of the four acts maps to a capability the route accepts', () => {
    expect(CLIENT).toContain("image: 'image-generation',");
    expect(CLIENT).toContain("infographic: 'image-generation',");
    expect(CLIENT).toContain("video: 'video-generation',");
    expect(CLIENT).toContain("edit: 'image-editing',");
    for (const c of ['image-generation', 'video-generation', 'image-editing']) {
      expect(ROUTE).toContain(`'${c}'`);
    }
  });

  it('it is never asked before the Chamber knows who is asking', () => {
    // MEASURED walking as a stranger: this fired on mount, ahead of the
    // identity check, so every newcomer's console carried a 401. The route
    // was right to refuse; the Chamber was wrong to ask.
    expect(CLIENT).toContain('if (!creatorPresent) return;');
    expect(CLIENT).toContain('setCreatorPresent(true);');
    expect(CLIENT).toContain('}, [mediaType, creatorPresent]);');
  });

  it('a price that cannot be fetched never blocks the work', () => {
    expect(CLIENT).toContain('// A price we cannot fetch is simply not shown. It never blocks the work.');
  });
});
